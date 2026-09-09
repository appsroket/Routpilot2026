import type { Job, Technician } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { MapControls } from "@/components/map/map-controls";
import { MapRoutePlanner } from "@/components/map/map-route-planner";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type SearchParams = { date?: string; tech?: string };

export default async function MapPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const supabase = createClient();

  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date ?? "")
    ? (searchParams.date as string)
    : todayISO();

  const [{ data: techData }, { data: profile }] = await Promise.all([
    supabase
      .from("technicians")
      .select("id, name, color, active")
      .eq("owner_id", user.id)
      .order("name", { ascending: true }),
    supabase
      .from("profiles")
      .select("home_base_lat, home_base_lng")
      .eq("id", user.id)
      .single(),
  ]);

  const technicians = (techData ?? []) as Pick<
    Technician,
    "id" | "name" | "color" | "active"
  >[];

  // Default to the first technician when none is chosen (or the choice is stale).
  const requested = searchParams.tech ?? "";
  const selected =
    technicians.find((t) => t.id === requested) ?? technicians[0] ?? null;

  let jobs: Job[] = [];
  if (selected) {
    const { data: jobData } = await supabase
      .from("jobs")
      .select("*")
      .eq("owner_id", user.id)
      .eq("technician_id", selected.id)
      .eq("scheduled_date", date)
      .order("sequence", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
    jobs = (jobData ?? []) as Job[];
  }

  const homeBase =
    profile?.home_base_lat != null && profile?.home_base_lng != null
      ? { lat: profile.home_base_lat as number, lng: profile.home_base_lng as number }
      : null;

  return (
    <div>
      <PageHeader
        title="Map & Routes"
        description="Plan the day's route, then optimize it in one click."
      />

      <MapControls
        date={date}
        tech={selected?.id ?? ""}
        technicians={technicians}
      />

      <MapRoutePlanner
        jobs={jobs}
        technician={selected}
        homeBase={homeBase}
        date={date}
      />
    </div>
  );
}
