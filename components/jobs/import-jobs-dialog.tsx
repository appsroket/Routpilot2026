"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Sparkles,
  Loader2,
  Trash2,
  MapPin,
  ArrowLeft,
  Plus,
} from "lucide-react";

import type { Technician } from "@/types";
import type { ParsedJob } from "@/lib/import-jobs";
import { createJobsBulk } from "@/app/(dashboard)/jobs/actions";
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

type EditableRow = ParsedJob & { key: string };

type Props = {
  technicians: TechOption[];
  defaultDate: string;
  defaultTech?: string;
  trigger: React.ReactNode;
};

const PLACEHOLDER = `Paste anything — one job per line works best. For example:

Mrs. Lee, 14 Oak St, 9am, AC not cooling
Bob's Diner downtown — leak, 11:30, needs 1hr
Sanchez residence 220 Pine Ave 2pm water heater replace, 90 min`;

let rowSeq = 0;
const nextKey = () => `imp-${rowSeq++}`;

export function ImportJobsDialog({ technicians, defaultDate, defaultTech, trigger }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [stage, setStage] = React.useState<"paste" | "review">("paste");

  const activeTechs = technicians.filter((t) => t.active);
  const initialTech =
    defaultTech && activeTechs.some((t) => t.id === defaultTech) ? defaultTech : "";

  const [text, setText] = React.useState("");
  const [date, setDate] = React.useState(defaultDate);
  const [techId, setTechId] = React.useState(initialTech);
  const [rows, setRows] = React.useState<EditableRow[]>([]);
  const [parsing, setParsing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  function resetAll() {
    setStage("paste");
    setText("");
    setRows([]);
    setDate(defaultDate);
    setTechId(initialTech);
  }

  function updateRow(key: string, patch: Partial<EditableRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  async function handleParse() {
    if (!text.trim()) {
      toast.error("Paste some job text first.");
      return;
    }
    setParsing(true);
    try {
      const res = await fetch("/api/import-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, date, technicianId: techId }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; jobs?: ParsedJob[] };
      if (!data.ok || !data.jobs) {
        toast.error(data.error ?? "Couldn't read those jobs. Try rephrasing.");
        return;
      }
      setRows(data.jobs.map((j) => ({ ...j, key: nextKey() })));
      setStage("review");
      toast.success(
        `Found ${data.jobs.length} ${data.jobs.length === 1 ? "job" : "jobs"} — review and edit before adding.`,
      );
    } catch {
      toast.error("Couldn't reach the import service. Please try again.");
    } finally {
      setParsing(false);
    }
  }

  async function handleSaveAll() {
    if (rows.length === 0) {
      toast.error("Nothing to add.");
      return;
    }
    if (rows.some((r) => !r.title.trim())) {
      toast.error("Every job needs a title.");
      return;
    }
    setSaving(true);
    try {
      const res = await createJobsBulk({
        scheduled_date: date,
        technician_id: techId,
        jobs: rows.map((r) => ({
          title: r.title,
          customer_name: r.customer_name,
          address: r.address,
          time_window_start: r.time_window_start,
          time_window_end: r.time_window_end,
          duration_min: r.duration_min,
          notes: r.notes,
          lat: r.lat,
          lng: r.lng,
        })),
      });
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't add the jobs.");
        return;
      }
      toast.success(`Added ${res.count ?? rows.length} jobs.`);
      setOpen(false);
      resetAll();
      router.refresh();
    } catch {
      toast.error("Couldn't add the jobs. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const techSelect = (
    <Select
      id="import-tech"
      value={techId}
      onChange={(e) => setTechId(e.target.value)}
      className="w-full"
    >
      <option value="">Unassigned</option>
      {activeTechs.map((t) => (
        <option key={t.id} value={t.id}>
          {t.name}
        </option>
      ))}
    </Select>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetAll();
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" aria-hidden />
            {stage === "paste" ? "Paste jobs" : "Review imported jobs"}
          </DialogTitle>
          <DialogDescription>
            {stage === "paste"
              ? "Paste messy job notes and let AI turn them into structured stops. Nothing is saved until you review and add them."
              : "Fix anything that looks off, then add them all to the schedule."}
          </DialogDescription>
        </DialogHeader>

        {stage === "paste" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="import-date">Date</Label>
                <Input
                  id="import-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="import-tech">Technician</Label>
                {techSelect}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-text">Job notes</Label>
              <Textarea
                id="import-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={PLACEHOLDER}
                className="min-h-[220px] resize-y"
              />
              <p className="text-xs text-muted-foreground">
                AI parses these into individual jobs with addresses, time windows, and
                durations.
              </p>
            </div>

            <DialogFooter>
              <Button onClick={handleParse} disabled={parsing} className="w-full sm:w-auto">
                {parsing ? <Loader2 className="animate-spin" /> : <Sparkles className="size-4" />}
                {parsing ? "Reading jobs…" : "Parse jobs"}
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="import-date-review">Date</Label>
                <Input
                  id="import-date-review"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="import-tech">Technician</Label>
                {techSelect}
              </div>
            </div>

            <div className="max-h-[46vh] space-y-3 overflow-y-auto pr-1">
              {rows.length === 0 ? (
                <p className="rounded-lg border border-dashed border-border bg-background px-4 py-8 text-center text-sm text-muted-foreground">
                  No jobs left. Go back to paste more.
                </p>
              ) : (
                rows.map((row, i) => (
                  <ReviewRow
                    key={row.key}
                    row={row}
                    index={i + 1}
                    onChange={(patch) => updateRow(row.key, patch)}
                    onRemove={() => removeRow(row.key)}
                  />
                ))
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setStage("paste")}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="size-4" />
                Back
              </Button>
              <Button
                onClick={handleSaveAll}
                disabled={saving || rows.length === 0}
                className="w-full sm:w-auto"
              >
                {saving ? <Loader2 className="animate-spin" /> : <Plus className="size-4" />}
                Add all ({rows.length})
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ReviewRow({
  row,
  index,
  onChange,
  onRemove,
}: {
  row: EditableRow;
  index: number;
  onChange: (patch: Partial<EditableRow>) => void;
  onRemove: () => void;
}) {
  const located = row.lat !== null && row.lng !== null;

  return (
    <div className="space-y-3 rounded-lg border border-border bg-background p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-6 items-center justify-center rounded-md bg-card text-xs font-semibold text-muted-foreground">
          {index}
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Remove job ${index}`}
          className="size-7 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${row.key}-title`} className="text-xs">
          Title
        </Label>
        <Input
          id={`${row.key}-title`}
          value={row.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="e.g. AC not cooling"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${row.key}-customer`} className="text-xs">
            Customer
          </Label>
          <Input
            id={`${row.key}-customer`}
            value={row.customer_name}
            onChange={(e) => onChange({ customer_name: e.target.value })}
            placeholder="Name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${row.key}-duration`} className="text-xs">
            Duration (min)
          </Label>
          <Input
            id={`${row.key}-duration`}
            type="number"
            min={1}
            step={5}
            value={row.duration_min}
            onChange={(e) => onChange({ duration_min: Number(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${row.key}-address`} className="flex items-center gap-1.5 text-xs">
          Address
          <span
            className={located ? "text-primary" : "text-muted-foreground/60"}
            title={located ? "Location found" : "Not located — will geocode on save"}
          >
            <MapPin className="size-3.5" aria-hidden />
          </span>
        </Label>
        <Input
          id={`${row.key}-address`}
          value={row.address}
          onChange={(e) =>
            // Editing the address invalidates the captured coordinates.
            onChange({ address: e.target.value, lat: null, lng: null })
          }
          placeholder="Street address"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${row.key}-start`} className="text-xs">
            Window start
          </Label>
          <Input
            id={`${row.key}-start`}
            type="time"
            value={row.time_window_start ?? ""}
            onChange={(e) => onChange({ time_window_start: e.target.value || null })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${row.key}-end`} className="text-xs">
            Window end
          </Label>
          <Input
            id={`${row.key}-end`}
            type="time"
            value={row.time_window_end ?? ""}
            onChange={(e) => onChange({ time_window_end: e.target.value || null })}
          />
        </div>
      </div>

      {row.notes && (
        <div className="space-y-2">
          <Label htmlFor={`${row.key}-notes`} className="text-xs">
            Notes
          </Label>
          <Input
            id={`${row.key}-notes`}
            value={row.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}
