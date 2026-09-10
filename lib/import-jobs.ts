// Shared types + pure helpers for the AI bulk-import flow. No server-only or
// SDK imports here, so this module is safe to pull into client components.

export type ParsedJob = {
  title: string;
  customer_name: string;
  address: string;
  time_window_start: string | null; // "HH:MM" or null
  time_window_end: string | null; // "HH:MM" or null
  duration_min: number;
  notes: string;
  lat: number | null;
  lng: number | null;
};

export const DEFAULT_DURATION_MIN = 30;

/**
 * Normalize a loose time value ("9am", "9", "11:30", "13:00") to "HH:MM"
 * 24-hour form, or null if it can't be understood.
 */
export function normalizeTime(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const raw = value.trim().toLowerCase();
  if (!raw) return null;

  const m = raw.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;

  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const period = m[3];

  if (Number.isNaN(hour) || Number.isNaN(minute) || minute > 59) return null;

  if (period === "am") {
    if (hour === 12) hour = 0;
  } else if (period === "pm") {
    if (hour !== 12) hour += 12;
  }
  if (hour > 23) return null;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

/** Clamp a duration to a sane integer, falling back to the default. */
export function clampDuration(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_DURATION_MIN;
  return Math.min(1440, Math.max(1, Math.round(n)));
}

/**
 * Pull a JSON array out of a model response. We instruct the model to return
 * bare JSON, but this defends against stray prose or ```json fences anyway.
 */
export function extractJsonArray(text: string): unknown[] | null {
  if (!text) return null;
  let candidate = text.trim();

  // Strip a markdown code fence if one slipped through.
  const fence = candidate.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) candidate = fence[1].trim();

  // Fall back to the first bracketed span if there's leading/trailing prose.
  if (!candidate.startsWith("[")) {
    const start = candidate.indexOf("[");
    const end = candidate.lastIndexOf("]");
    if (start === -1 || end === -1 || end <= start) return null;
    candidate = candidate.slice(start, end + 1);
  }

  try {
    const parsed = JSON.parse(candidate);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** Coerce one raw model object into a well-formed ParsedJob (no coordinates yet). */
export function normalizeParsedJob(raw: unknown): Omit<ParsedJob, "lat" | "lng"> | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;

  const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
  const title = str(o.title);
  const address = str(o.address);

  // A row with neither a title nor an address is noise — drop it.
  if (!title && !address) return null;

  return {
    title: title || "Untitled job",
    customer_name: str(o.customer_name),
    address,
    time_window_start: normalizeTime(o.time_window_start),
    time_window_end: normalizeTime(o.time_window_end),
    duration_min: clampDuration(o.duration_min),
    notes: str(o.notes),
  };
}
