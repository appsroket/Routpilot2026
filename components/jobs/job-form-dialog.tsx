"use client";

import * as React from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import type { Job, Technician } from "@/types";
import { configureMaps, importMapsLibrary } from "@/lib/google";
import { createJob, updateJob, type JobFormState } from "@/app/(dashboard)/jobs/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type TechOption = Pick<Technician, "id" | "name" | "active">;

type Props = {
  mode: "create" | "edit";
  technicians: TechOption[];
  job?: Job;
  defaultDate?: string;
  trigger: React.ReactNode;
};

const initialState: JobFormState = { ok: false, error: null };

export function JobFormDialog({ mode, technicians, job, defaultDate, trigger }: Props) {
  const [open, setOpen] = React.useState(false);
  const action = mode === "create" ? createJob : updateJob;
  const [state, formAction] = useFormState(action, initialState);

  const addressRef = React.useRef<HTMLInputElement>(null);
  const [lat, setLat] = React.useState<string>(job?.lat != null ? String(job.lat) : "");
  const [lng, setLng] = React.useState<string>(job?.lng != null ? String(job.lng) : "");

  React.useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) {
      toast.success(mode === "create" ? "Job added." : "Job updated.");
      setOpen(false);
    }
  }, [state, mode]);

  // Wire Google Places Autocomplete when the dialog is open.
  React.useEffect(() => {
    if (!open) return;
    let autocomplete: google.maps.places.Autocomplete | undefined;
    let listener: google.maps.MapsEventListener | undefined;
    let cancelled = false;

    async function init() {
      if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || !addressRef.current) return;
      try {
        configureMaps();
        const places = await importMapsLibrary("places");
        if (cancelled || !addressRef.current) return;
        autocomplete = new places.Autocomplete(addressRef.current, {
          fields: ["formatted_address", "geometry"],
          types: ["address"],
        });
        listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete!.getPlace();
          if (place.formatted_address && addressRef.current) {
            addressRef.current.value = place.formatted_address;
          }
          const loc = place.geometry?.location;
          setLat(loc ? String(loc.lat()) : "");
          setLng(loc ? String(loc.lng()) : "");
        });
      } catch {
        // Autocomplete is optional — the address still geocodes server-side.
      }
    }

    init();
    return () => {
      cancelled = true;
      if (listener) listener.remove();
    };
  }, [open]);

  // If the address is edited by hand, drop the captured coordinates so the
  // server re-geocodes the new text.
  function onAddressInput() {
    if (lat || lng) {
      setLat("");
      setLng("");
    }
  }

  const activeTechs = technicians.filter((t) => t.active);
  // In edit mode, keep the currently-assigned tech selectable even if inactive.
  const assigned = technicians.find((t) => t.id === job?.technician_id);
  const techOptions =
    assigned && !assigned.active ? [...activeTechs, assigned] : activeTechs;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add job" : "Edit job"}</DialogTitle>
          <DialogDescription>
            A job is a stop to visit. Coordinates come from address autocomplete,
            or are geocoded on save.
          </DialogDescription>
        </DialogHeader>

        <form
          action={formAction}
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
        >
          {mode === "edit" && job && <input type="hidden" name="id" value={job.id} />}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              required
              autoComplete="off"
              defaultValue={job?.title ?? ""}
              placeholder="AC repair"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name">Customer name</Label>
            <Input
              id="customer_name"
              name="customer_name"
              autoComplete="off"
              defaultValue={job?.customer_name ?? ""}
              placeholder="Jane Doe"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              ref={addressRef}
              required
              autoComplete="off"
              defaultValue={job?.address ?? ""}
              onInput={onAddressInput}
              placeholder="Start typing an address…"
            />
            <input type="hidden" name="lat" value={lat} />
            <input type="hidden" name="lng" value={lng} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="scheduled_date">Date</Label>
            <Input
              id="scheduled_date"
              name="scheduled_date"
              type="date"
              required
              defaultValue={job?.scheduled_date ?? defaultDate ?? ""}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="time_window_start">Window start</Label>
              <Input
                id="time_window_start"
                name="time_window_start"
                type="time"
                defaultValue={job?.time_window_start?.slice(0, 5) ?? ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time_window_end">Window end</Label>
              <Input
                id="time_window_end"
                name="time_window_end"
                type="time"
                defaultValue={job?.time_window_end?.slice(0, 5) ?? ""}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration_min">Duration (min)</Label>
              <Input
                id="duration_min"
                name="duration_min"
                type="number"
                min={1}
                step={5}
                required
                defaultValue={job?.duration_min ?? 30}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="technician_id">Technician</Label>
              <Select
                id="technician_id"
                name="technician_id"
                defaultValue={job?.technician_id ?? ""}
              >
                <option value="">Unassigned</option>
                {techOptions.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                    {!t.active ? " (inactive)" : ""}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              defaultValue={job?.notes ?? ""}
              placeholder="Gate code, parking, equipment needed…"
            />
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
      {mode === "create" ? "Add job" : "Save changes"}
    </Button>
  );
}
