"use client";

import type { Job } from "@/types";
import { formatTimeWindow, formatDuration } from "@/lib/jobs";
import {
  useJobControls,
  JobStatusSelect,
  JobActionButtons,
  DeleteJobDialog,
  type TechOption,
} from "./job-controls";

export function JobRow({
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
    <tr className="border-b border-border last:border-0 hover:bg-background/40">
      <td className="px-4 py-3 align-top">
        <div className="font-medium text-foreground">{job.title}</div>
      </td>
      <td className="px-4 py-3 align-top text-muted-foreground">
        {job.customer_name || "—"}
      </td>
      <td className="max-w-[16rem] px-4 py-3 align-top text-muted-foreground">
        <span className="line-clamp-2">{job.address}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top text-muted-foreground">
        {formatTimeWindow(job.time_window_start, job.time_window_end)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top text-muted-foreground">
        {formatDuration(job.duration_min)}
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top">
        {technician ? (
          <span className="inline-flex items-center gap-2 text-foreground">
            <span
              aria-hidden
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: technician.color }}
            />
            {technician.name}
          </span>
        ) : (
          <span className="text-muted-foreground">Unassigned</span>
        )}
      </td>
      <td className="px-4 py-3 align-top">
        <JobStatusSelect status={status} disabled={isPending} onChange={onStatusChange} />
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top text-right">
        <JobActionButtons
          job={job}
          technicians={technicians}
          isPending={isPending}
          onDuplicate={onDuplicate}
          onDeleteClick={() => setConfirmOpen(true)}
        />
        <DeleteJobDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title={job.title}
          deleting={deleting}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
