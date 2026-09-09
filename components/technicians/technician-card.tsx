"use client";

import * as React from "react";
import { toast } from "sonner";
import { Pencil, Trash2, Loader2 } from "lucide-react";

import type { Technician } from "@/types";
import { formatPhoneDisplay } from "@/lib/phone";
import { setTechnicianActive, deleteTechnician } from "@/app/(dashboard)/technicians/actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TechnicianFormDialog } from "./technician-form-dialog";

export function TechnicianCard({ technician }: { technician: Technician }) {
  const [isPending, startTransition] = React.useTransition();
  const [active, setActive] = React.useState(technician.active);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Keep the optimistic toggle in sync if the server data changes.
  React.useEffect(() => {
    setActive(technician.active);
  }, [technician.active]);

  function onToggle(next: boolean) {
    setActive(next); // optimistic
    startTransition(async () => {
      const res = await setTechnicianActive(technician.id, next);
      if (res?.error) {
        setActive(!next); // revert
        toast.error(res.error);
      }
    });
  }

  function onDelete() {
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteTechnician(technician.id);
      setDeleting(false);
      if (res?.error) {
        toast.error(res.error);
        return;
      }
      toast.success("Technician removed.");
      setConfirmOpen(false);
    });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
      <div className="flex items-start gap-3">
        <span
          aria-hidden
          className="mt-0.5 size-6 shrink-0 rounded-md border border-border"
          style={{ backgroundColor: technician.color }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{technician.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {formatPhoneDisplay(technician.phone)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-border pt-4">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Switch
            checked={active}
            onCheckedChange={onToggle}
            disabled={isPending}
            aria-label={`Toggle ${technician.name} active`}
          />
          <span>{active ? "Active" : "Inactive"}</span>
        </label>

        <div className="flex items-center gap-1">
          <TechnicianFormDialog
            mode="edit"
            technician={technician}
            trigger={
              <Button variant="ghost" size="icon" aria-label={`Edit ${technician.name}`}>
                <Pencil className="size-4" />
              </Button>
            }
          />
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${technician.name}`}
            className="text-muted-foreground hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete technician?</DialogTitle>
            <DialogDescription>
              This removes <span className="text-foreground">{technician.name}</span>{" "}
              permanently. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={onDelete} disabled={deleting}>
              {deleting && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
