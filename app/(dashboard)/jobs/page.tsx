import { Plus, ClipboardList } from "lucide-react";

import type { Job, Technician } from "@/types";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { JobsFilters } from "@/components/jobs/jobs-filters";
import { JobFormDialog } from "@/components/jobs/job-form-dialog";
import { JobRow } from "@/components/jobs/job-row";
import { JobCard } from "@/components/jobs/job-card";

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type SearchParams = { date?: string; tech?: string };

export default async function JobsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const user = await requireUser();
  const supabase = createClient();

  const date = /^\d{4}-\d{2}-\d{2}$/.test(searchParams.date ?? "")
    ? (searchParams.date as string)
    : todayISO();
  const tech = searchParams.tech ?? "all";

  const { data: techData } = await supabase
    .from("technicians")
    .select("id, name, color, active")
    .eq("owner_id", user.id)
    .order("name", { ascending: true });
  const technicians = (techData ?? []) as Pick<
    Technician,
    "id" | "name" | "color" | "active"
  >[];
  const activeTechnicians = technicians.filter((t) => t.active);

  let query = supabase
    .from("jobs")
    .select("*")
    .eq("owner_id", user.id)
    .eq("scheduled_date", date)
    .order("time_window_start", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });

  if (tech === "unassigned") query = query.is("technician_id", null);
  else if (tech !== "all") query = query.eq("technician_id", tech);

  const { data: jobData } = await query;
  const jobs = (jobData ?? []) as Job[];

  const techById = new Map(technicians.map((t) => [t.id, t]));

  const addTrigger = (
    <JobFormDialog
      mode="create"
      technicians={activeTechnicians}
      defaultDate={date}
      trigger={
        <Button>
          <Plus className="size-4" />
          Add job
        </Button>
      }
    />
  );

  return (
    <div>
      <PageHeader
        title="Jobs"
        description="Schedule stops and dispatch your crew."
        action={addTrigger}
      />

      <JobsFilters date={date} tech={tech} technicians={technicians} />

      {jobs.length === 0 ? (
        <EmptyState technicians={activeTechnicians} defaultDate={date} />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-lg border border-border bg-card md:block">
            <table className="w-full min-w-[880px] text-left text-sm">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-4 py-3 font-medium">Job</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Address</th>
                  <th className="px-4 py-3 font-medium">Time window</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Technician</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <JobRow
                    key={job.id}
                    job={job}
                    technician={
                      job.technician_id ? techById.get(job.technician_id) ?? null : null
                    }
                    technicians={technicians}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile: stacked cards */}
          <div className="space-y-3 md:hidden">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                technician={
                  job.technician_id ? techById.get(job.technician_id) ?? null : null
                }
                technicians={technicians}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({
  technicians,
  defaultDate,
}: {
  technicians: Pick<Technician, "id" | "name" | "active">[];
  defaultDate: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <ClipboardList className="size-6" />
      </span>
      <div className="space-y-1">
        <p className="font-heading text-lg font-semibold text-foreground">
          No jobs for this day
        </p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Add a stop to start building the day&apos;s route.
        </p>
      </div>
      <JobFormDialog
        mode="create"
        technicians={technicians}
        defaultDate={defaultDate}
        trigger={
          <Button>
            <Plus className="size-4" />
            Add your first job
          </Button>
        }
      />
    </div>
  );
}
