"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Copy, Trash2, Loader2 } from "lucide-react";

import type { Job, JobStatus, Technician } from "@/types";
import { JOB_STATUSES, STATUS_LABELS, formatTimeWindow, formatDuration } from "@/lib/jobs";
import { setJobStatus, duplicateJob, deleteJob } from "@/app/(dashboard)/jobs/actions";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { JobFormDialog } from "./job-form-dialog";

type TechOption = Pick<Technician, "id" | "name" | "color" | "active">;

const STATUS_SELECT_CLASSES: Record<JobStatus, string> = {
  scheduled: "text-muted-foreground",
  en_route: "text-primary",
  completed: "text-emerald-400",
  canceled: "text-red-400",
};

export function JobRow({
  job,
  technician,
  technicians,
}: {
  job: Job;
  technician: TechOption | null;
  technicians: TechOption[];
}) {
  const [isPending, startTransition] = React.useTransition();
  const [status, setStatus] = React.useState<JobStatus>(job.status);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => setStatus(job.status), [job.status]);

  function onStatusChange(next: JobStatus) {
    const prev = status;
    setStatus(next); // optimistic
    startTransition(async () => {
      const res = await setJobStatus(job.id, next);
      if (res?.error) {
        setStatus(prev);
        toast.error(res.error);
      }
    });
  }

  function onDuplicate() {
    startTransition(async () => {
      const res = await duplicateJob(job.id);
      if (res?.error) toast.error(res.error);
      else toast.success("Job duplicated.");
    });
  }

  function onDelete() {
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteJob(job.id);
      setDeleting(false);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Job deleted.");
      setConfirmOpen(false);
    });
  }

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
        <div className="relative inline-block">
          <select
            aria-label="Job status"
            value={status}
            disabled={isPending}
            onChange={(e) => onStatusChange(e.target.value as JobStatus)}
            className={cn(
              "cursor-pointer appearance-none rounded-md border border-border bg-background py-1 pl-2 pr-6 text-xs font-medium",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
              STATUS_SELECT_CLASSES[status],
            )}
          >
            {JOB_STATUSES.map((s) => (
              <option key={s} value={s} className="text-foreground">
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
      </td>
      <td className="whitespace-nowrap px-4 py-3 align-top text-right">
        <div className="inline-flex items-center gap-1">
          <JobFormDialog
            mode="edit"
            technicians={technicians}
            job={job}
            trigger={
              <Button variant="ghost" size="icon" aria-label="Edit job">
                <Pencil className="size-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label="Duplicate job"
            onClick={onDuplicate}
            disabled={isPending}
          >
            <Copy className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete job"
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>

        <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete job?</DialogTitle>
              <DialogDescription>
                This permanently removes{" "}
                <span className="text-foreground">{job.title}</span>. This can&apos;t
                be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={deleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={onDelete} disabled={deleting}>
                {deleting && <Loader2 className="animate-spin" />}
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}
