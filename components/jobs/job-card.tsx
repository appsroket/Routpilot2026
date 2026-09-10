"use client";

import { MapPin, Clock, Timer } from "lucide-react";

import type { Job } from "@/types";
import { formatTimeWindow, formatDuration } from "@/lib/jobs";
import {
  useJobControls,
  JobStatusSelect,
  JobActionButtons,
  DeleteJobDialog,
  type TechOption,
} from "./job-controls";

export function JobCard({
  job,
  technician,
  technicians,
}: {
  job: Job;
  technician: TechOption | null;
  technicians: TechOption[];
}) {
  const {
    isPending,
    status,
    onStatusChange,
    onDuplicate,
    onDelete,
    confirmOpen,
    setConfirmOpen,
    deleting,
  } = useJobControls(job);

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{job.title}</p>
          {job.customer_name && (
            <p className="truncate text-sm text-muted-foreground">{job.customer_name}</p>
          )}
        </div>
        <JobStatusSelect
          status={status}
          disabled={isPending}
          onChange={onStatusChange}
          className="shrink-0"
        />
      </div>

      {job.address && (
        <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="line-clamp-2">{job.address}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden />
          {formatTimeWindow(job.time_window_start, job.time_window_end)}
        </span>
        <span className="flex items-center gap-1.5">
          <Timer className="size-4" aria-hidden />
          {formatDuration(job.duration_min)}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
        {technician ? (
          <span className="inline-flex min-w-0 items-center gap-2 text-sm text-foreground">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: technician.color }}
            />
            <span className="truncate">{technician.name}</span>
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">Unassigned</span>
        )}
        <JobActionButtons
          job={job}
          technicians={technicians}
          isPending={isPending}
          onDuplicate={onDuplicate}
          onDeleteClick={() => setConfirmOpen(true)}
        />
      </div>

      <DeleteJobDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={job.title}
        deleting={deleting}
        onDelete={onDelete}
      />
    </div>
  );
}
