import { NextResponse } from "next/server";

import type { Job } from "@/types";
import { createClient } from "@/lib/supabase/server";

// A stop that can actually be routed — has coordinates.
type Coord = { lat: number; lng: number };

type DirectionsLeg = {
  distance?: { value: number };
  duration?: { value: number };
};
type DirectionsRoute = {
  legs?: DirectionsLeg[];
  waypoint_order?: number[];
  overview_polyline?: { points?: string };
};
type DirectionsResponse = {
  status: string;
  error_message?: string;
  routes?: DirectionsRoute[];
};

function sumLegs(legs: DirectionsLeg[]) {
  return legs.reduce(
    (acc, leg) => ({
      distance: acc.distance + (leg.distance?.value ?? 0),
      duration: acc.duration + (leg.duration?.value ?? 0),
    }),
    { distance: 0, duration: 0 },
  );
}

function coordParam(c: Coord) {
  return `${c.lat},${c.lng}`;
}

async function callDirections(params: {
  key: string;
  origin: Coord;
  destination: Coord;
  waypoints: Coord[];
  optimize: boolean;
}): Promise<DirectionsResponse> {
  const url = new URL("https://maps.googleapis.com/maps/api/directions/json");
  url.searchParams.set("origin", coordParam(params.origin));
  url.searchParams.set("destination", coordParam(params.destination));
  url.searchParams.set("key", params.key);
  if (params.waypoints.length > 0) {
    const prefix = params.optimize ? "optimize:true|" : "";
    url.searchParams.set("waypoints", prefix + params.waypoints.map(coordParam).join("|"));
  }
  const res = await fetch(url.toString(), { cache: "no-store" });
  return (await res.json()) as DirectionsResponse;
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { ok: false, error: "Server is missing GOOGLE_MAPS_API_KEY." },
      { status: 500 },
    );
  }

  let body: { technicianId?: string; date?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }
  const { technicianId, date } = body;
  if (!technicianId || !date) {
    return NextResponse.json(
      { ok: false, error: "technicianId and date are required." },
      { status: 400 },
    );
  }

  // 1. Load the tech's jobs for the date (current order) + home base.
  const { data: jobData, error: jobErr } = await supabase
    .from("jobs")
    .select("*")
    .eq("owner_id", user.id)
    .eq("technician_id", technicianId)
    .eq("scheduled_date", date)
    .order("sequence", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  if (jobErr) {
    return NextResponse.json({ ok: false, error: jobErr.message }, { status: 500 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("home_base_lat, home_base_lng")
    .eq("id", user.id)
    .single();

  const allJobs = (jobData ?? []) as Job[];
  const jobs = allJobs.filter((j) => j.lat != null && j.lng != null);

  // Handle "nothing to optimize" gracefully.
  if (jobs.length < 2) {
    return NextResponse.json({
      ok: true,
      optimized: false,
      message:
        allJobs.length < 2
          ? "Add at least two jobs to optimize a route."
          : "At least two jobs need a mapped address to optimize.",
      stops: jobs.map((j, i) => ({ id: j.id, sequence: i + 1, eta: null })),
      polyline: null,
      savings: null,
    });
  }

  const hasHomeBase =
    profile?.home_base_lat != null && profile?.home_base_lng != null;
  const homeBase: Coord | null = hasHomeBase
    ? { lat: profile!.home_base_lat as number, lng: profile!.home_base_lng as number }
    : null;

  const jobCoords: Coord[] = jobs.map((j) => ({ lat: j.lat as number, lng: j.lng as number }));

  // 2. Determine origin / destination and the waypoint set.
  // With a home base: round trip, all jobs are waypoints.
  // Without: origin = first job, destination = last job, middle are waypoints.
  let origin: Coord;
  let destination: Coord;
  let waypointJobIdx: number[]; // indices into `jobs` that are waypoints

  if (homeBase) {
    origin = homeBase;
    destination = homeBase;
    waypointJobIdx = jobs.map((_, i) => i);
  } else {
    origin = jobCoords[0];
    destination = jobCoords[jobCoords.length - 1];
    waypointJobIdx = jobs.map((_, i) => i).slice(1, jobs.length - 1);
  }
  const waypoints = waypointJobIdx.map((i) => jobCoords[i]);

  // 3. BASELINE — current order, no optimization.
  const baseline = await callDirections({ key, origin, destination, waypoints, optimize: false });
  if (baseline.status !== "OK" || !baseline.routes?.[0]?.legs) {
    return NextResponse.json(
      { ok: false, error: baseline.error_message ?? `Directions failed: ${baseline.status}` },
      { status: 502 },
    );
  }
  const baseSums = sumLegs(baseline.routes[0].legs);

  // 4. OPTIMIZED — let Google reorder the waypoints.
  const optimized = await callDirections({ key, origin, destination, waypoints, optimize: true });
  if (optimized.status !== "OK" || !optimized.routes?.[0]?.legs) {
    return NextResponse.json(
      { ok: false, error: optimized.error_message ?? `Directions failed: ${optimized.status}` },
      { status: 502 },
    );
  }
  const optRoute = optimized.routes[0];
  const optSums = sumLegs(optRoute.legs!);
  const waypointOrder = optRoute.waypoint_order ?? waypointJobIdx.map((_, i) => i);

  // 5. Build the optimized job ordering.
  // waypointOrder indexes into `waypoints` (i.e. into waypointJobIdx).
  const orderedJobIdx: number[] = homeBase
    ? waypointOrder.map((wi) => waypointJobIdx[wi])
    : [0, ...waypointOrder.map((wi) => waypointJobIdx[wi]), jobs.length - 1];
  const orderedJobs = orderedJobIdx.map((i) => jobs[i]);

  // ETA: start 8:00 AM local, add each arrival leg, then service time per stop.
  const legs = optRoute.legs!;
  const startMs = new Date(`${date}T08:00:00`).getTime();
  let cursorMs = startMs;
  const stops = orderedJobs.map((job, i) => {
    cursorMs += (legs[i]?.duration?.value ?? 0) * 1000; // travel to this stop
    const eta = new Date(cursorMs).toISOString();
    cursorMs += (job.duration_min ?? 0) * 60 * 1000; // service at this stop
    return { id: job.id, sequence: i + 1, eta };
  });

  // Persist new sequence + eta for each routed job.
  await Promise.all(
    stops.map((s) =>
      supabase
        .from("jobs")
        .update({ sequence: s.sequence, eta: s.eta })
        .eq("id", s.id)
        .eq("owner_id", user.id),
    ),
  );

  // 6. Log the optimization run for ROI metrics.
  const distanceSaved = baseSums.distance - optSums.distance;
  const durationSaved = baseSums.duration - optSums.duration;
  await supabase.from("route_optimizations").insert({
    owner_id: user.id,
    technician_id: technicianId,
    route_date: date,
    stop_count: orderedJobs.length,
    baseline_distance_m: baseSums.distance,
    baseline_duration_s: baseSums.duration,
    optimized_distance_m: optSums.distance,
    optimized_duration_s: optSums.duration,
    distance_saved_m: distanceSaved,
    duration_saved_s: durationSaved,
  });

  // 7. Return ordered stops + polyline + savings.
  return NextResponse.json({
    ok: true,
    optimized: true,
    stops,
    polyline: optRoute.overview_polyline?.points ?? null,
    savings: {
      distance_m: distanceSaved,
      duration_s: durationSaved,
      distance_mi: distanceSaved / 1609.34,
      duration_min: durationSaved / 60,
      baseline_distance_m: baseSums.distance,
      optimized_distance_m: optSums.distance,
    },
  });
}
