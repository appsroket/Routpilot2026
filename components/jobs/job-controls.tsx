"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Copy, Trash2, Loader2 } from "lucide-react";

import type { Job, JobStatus, Technician } from "@/types";
import { JOB_STATUSES, STATUS_LABELS } from "@/lib/jobs";
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

export type TechOption = Pick<Technician, "id" | "name" | "color" | "active">;

const STATUS_SELECT_CLASSES: Record<JobStatus, string> = {
  scheduled: "text-muted-foreground",
  en_route: "text-primary",
  completed: "text-emerald-400",
  canceled: "text-red-400",
};

/**
 * Shared stateful logic for a job's inline controls (status change, duplicate,
 * delete + confirm). Used by both the desktop table row and the mobile card so
 * the two layouts stay behaviourally identical.
 */
export function useJobControls(job: Job) {
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

  return {
    isPending,
    status,
    onStatusChange,
    onDuplicate,
    onDelete,
    confirmOpen,
    setConfirmOpen,
    deleting,
  };
}

export function JobStatusSelect({
  status,
  disabled,
  onChange,
  className,
}: {
  status: JobStatus;
  disabled?: boolean;
  onChange: (next: JobStatus) => void;
  className?: string;
}) {
  return (
    <select
      aria-label="Job status"
      value={status}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value as JobStatus)}
      className={cn(
        "cursor-pointer appearance-none rounded-md border border-border bg-background py-1 pl-2 pr-6 text-xs font-medium",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
        STATUS_SELECT_CLASSES[status],
        className,
      )}
    >
      {JOB_STATUSES.map((s) => (
        <option key={s} value={s} className="text-foreground">
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}

export function JobActionButtons({
  job,
  technicians,
  isPending,
  onDuplicate,
  onDeleteClick,
}: {
  job: Job;
  technicians: TechOption[];
  isPending: boolean;
  onDuplicate: () => void;
  onDeleteClick: () => void;
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <JobFormDialog
        mode="edit"
        technicians={technicians}
        job={job}
        trigger={
          <Button variant="ghost" size="icon" aria-label={`Edit ${job.title}`}>
            <Pencil className="size-4" />
          </Button>
        }
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Duplicate ${job.title}`}
        onClick={onDuplicate}
        disabled={isPending}
      >
        <Copy className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Delete ${job.title}`}
        className="text-muted-foreground hover:text-destructive"
        onClick={onDeleteClick}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function DeleteJobDialog({
  open,
  onOpenChange,
  title,
  deleting,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  deleting: boolean;
  onDelete: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete job?</DialogTitle>
          <DialogDescription>
            This permanently removes{" "}
            <span className="text-foreground">{title}</span>. This can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onDelete} disabled={deleting}>
            {deleting && <Loader2 className="animate-spin" />}
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
