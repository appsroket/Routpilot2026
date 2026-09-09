import type { JobStatus } from "@/types";

export const JOB_STATUSES: JobStatus[] = [
  "scheduled",
  "en_route",
  "completed",
  "canceled",
];

export const STATUS_LABELS: Record<JobStatus, string> = {
  scheduled: "Scheduled",
  en_route: "En route",
  completed: "Completed",
  canceled: "Canceled",
};

// Tailwind classes for each status badge (dark-theme, subtle fills).
export const STATUS_CLASSES: Record<JobStatus, string> = {
  scheduled: "bg-muted text-muted-foreground border-border",
  en_route: "bg-primary/15 text-primary border-primary/30",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  canceled: "bg-red-500/10 text-red-400 border-red-500/30",
};

/** "09:00:00" | "09:00" → "9:00 AM"; empty/invalid → "". */
export function formatTime(value: string | null): string {
  if (!value) return "";
  const match = /^(\d{1,2}):(\d{2})/.exec(value);
  if (!match) return value;
  let hours = Number(match[1]);
  const minutes = match[2];
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

/** A start/end window → "9:00 AM – 11:00 AM", or a single side, or "—". */
export function formatTimeWindow(
  start: string | null,
  end: string | null,
): string {
  const s = formatTime(start);
  const e = formatTime(end);
  if (s && e) return `${s} – ${e}`;
  if (s) return `From ${s}`;
  if (e) return `Until ${e}`;
  return "—";
}

/** 30 → "30 min"; 90 → "1h 30m"; 120 → "2h". */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
