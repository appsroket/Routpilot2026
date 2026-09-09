"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import type { Technician } from "@/types";
import {
  createTechnician,
  updateTechnician,
  type TechnicianFormState,
} from "@/app/(dashboard)/technicians/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DEFAULT_COLOR = "#b8f724";
const initialState: TechnicianFormState = { ok: false, error: null };

type Props = {
  mode: "create" | "edit";
  technician?: Technician;
  trigger: React.ReactNode;
};

export function TechnicianFormDialog({ mode, technician, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createTechnician : updateTechnician;
  const [state, formAction] = useFormState(action, initialState);

  const [color, setColor] = React.useState(technician?.color ?? DEFAULT_COLOR);
  const [active, setActive] = React.useState(technician?.active ?? true);

  // Reset the controlled fields whenever the dialog (re)opens.
  React.useEffect(() => {
    if (open) {
      setColor(technician?.color ?? DEFAULT_COLOR);
      setActive(technician?.active ?? true);
    }
  }, [open, technician]);

  // React to server-action results.
  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) {
      toast.success(mode === "create" ? "Technician added." : "Technician updated.");
      setOpen(false);
    }
  }, [state, mode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add technician" : "Edit technician"}
          </DialogTitle>
          <DialogDescription>
            Technicians receive job assignments by SMS — phone numbers are stored
            in E.164 format for Twilio.
          </DialogDescription>
        </DialogHeader>

        <form action={formAction} className="space-y-4">
          {mode === "edit" && technician && (
            <input type="hidden" name="id" value={technician.id} />
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              autoComplete="off"
              defaultValue={technician?.name ?? ""}
              placeholder="Jordan Rivera"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              required
              defaultValue={technician?.phone ?? ""}
              placeholder="(555) 123-4567"
            />
            <p className="text-xs text-muted-foreground">
              US/Canada numbers can be entered without a country code.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-picker">Color</Label>
            <div className="flex items-center gap-3">
              <input
                id="color-picker"
                type="color"
                aria-label="Pick color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-10 shrink-0 cursor-pointer rounded-md border border-border bg-background p-1"
              />
              <Input
                name="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="font-mono uppercase"
                aria-label="Color hex"
                spellCheck={false}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2.5">
            <div>
              <Label htmlFor="active" className="cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Inactive techs can&apos;t be assigned to new jobs.
              </p>
            </div>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
            <input type="hidden" name="active" value={active ? "true" : "false"} />
          </div>

          <DialogFooter>
            <SubmitButton mode={mode} />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="animate-spin" />}
      {mode === "create" ? "Add technician" : "Save changes"}
    </Button>
  );
}
