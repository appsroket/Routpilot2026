import { NextResponse } from "next/server";

import type { Job, Technician } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { sendSms } from "@/lib/twilio";
import { normalizeE164 } from "@/lib/phone";
import { formatTime } from "@/lib/jobs";

// "9:00 AM – 11:00 AM" | "" (empty when no window, for compact SMS lines).
function windowText(start: string | null, end: string | null): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s}–${e}`;
  if (s) return `from ${s}`;
  if (e) return `by ${e}`;
  return "";
}

function buildDirectionsLink(
  origin: string,
  destination: string,
  waypoints: string[],
): string {
  const url = new URL("https://www.google.com/maps/dir/");
  url.searchParams.set("api", "1");
  url.searchParams.set("origin", origin);
  url.searchParams.set("destination", destination);
  if (waypoints.length > 0) {
    url.searchParams.set("waypoints", waypoints.join("|"));
  }
  return url.toString();
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
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

  // Technician must belong to the user.
  const { data: techData, error: techErr } = await supabase
    .from("technicians")
    .select("*")
    .eq("id", technicianId)
    .eq("owner_id", user.id)
    .single();
  if (techErr || !techData) {
    return NextResponse.json({ ok: false, error: "Technician not found." }, { status: 404 });
  }
  const technician = techData as Technician;

  // Validate the phone is E.164 before we attempt to send.
  const phone = normalizeE164(technician.phone);
  if (!phone) {
    return NextResponse.json(
      { ok: false, error: `${technician.name} has an invalid phone number.` },
      { status: 400 },
    );
  }

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
  const jobs = (jobData ?? []) as Job[];
  if (jobs.length === 0) {
    return NextResponse.json(
      { ok: false, error: "No jobs to send for this technician and date." },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("home_base_address")
    .eq("id", user.id)
    .single();
  const homeBase = profile?.home_base_address?.trim() || null;

  // Build the ordered stop lines.
  const lines = jobs.map((job, i) => {
    const parts = [`${i + 1}. ${job.title}`];
    const tail: string[] = [];
    if (job.customer_name) tail.push(job.customer_name);
    tail.push(job.address);
    let line = `${parts[0]} — ${tail.join(", ")}`;
    const win = windowText(job.time_window_start, job.time_window_end);
    if (win) line += ` (${win})`;
    return line;
  });

  // Directions: home base → each stop in order → last stop.
  const destination = jobs[jobs.length - 1].address;
  const origin = homeBase ?? jobs[0].address;
  const startIdx = homeBase ? 0 : 1;
  const waypoints = jobs.slice(startIdx, jobs.length - 1).map((j) => j.address);
  const directionsLink = buildDirectionsLink(origin, destination, waypoints);

  const message =
    `RoutePilot — ${date} route (${jobs.length} ${jobs.length === 1 ? "stop" : "stops"}):\n` +
    lines.join("\n") +
    `\n\nDirections: ${directionsLink}`;

  try {
    const result = await sendSms(phone, message);
    return NextResponse.json({
      ok: true,
      to: result.to,
      sid: result.sid,
      stops: jobs.length,
    });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "Failed to send the SMS.";
    return NextResponse.json({ ok: false, error: detail }, { status: 502 });
  }
}
