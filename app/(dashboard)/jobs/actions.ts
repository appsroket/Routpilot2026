"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import type { JobStatus } from "@/types";
import { JOB_STATUSES } from "@/lib/jobs";
import { createClient } from "@/lib/supabase/server";
import { geocodeAddress } from "@/lib/geocode";

export type JobFormState = { ok: boolean; error: string | null };

const schema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120, "Title is too long."),
  customer_name: z.string().trim().max(120).optional().default(""),
  address: z.string().trim().min(1, "Address is required.").max(300),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date."),
  time_window_start: z.string().trim().optional().default(""),
  time_window_end: z.string().trim().optional().default(""),
  duration_min: z.coerce.number().int().min(1, "Duration must be at least 1 minute.").max(1440),
  technician_id: z.string().trim().optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

type JobValues = z.infer<typeof schema>;

async function getOwner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

function parseForm(formData: FormData):
  | { error: string }
  | { data: JobValues; lat: number | null; lng: number | null } {
  const parsed = schema.safeParse({
    title: formData.get("title"),
    customer_name: formData.get("customer_name"),
    address: formData.get("address"),
    scheduled_date: formData.get("scheduled_date"),
    time_window_start: formData.get("time_window_start"),
    time_window_end: formData.get("time_window_end"),
    duration_min: formData.get("duration_min"),
    technician_id: formData.get("technician_id"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const latRaw = String(formData.get("lat") ?? "").trim();
  const lngRaw = String(formData.get("lng") ?? "").trim();
  const lat = latRaw === "" ? null : Number(latRaw);
  const lng = lngRaw === "" ? null : Number(lngRaw);

  return {
    data: parsed.data,
    lat: Number.isFinite(lat as number) ? (lat as number) : null,
    lng: Number.isFinite(lng as number) ? (lng as number) : null,
  };
}

// Build the row payload, geocoding server-side when lat/lng are missing.
async function toRow(
  values: JobValues,
  lat: number | null,
  lng: number | null,
) {
  let resolvedLat = lat;
  let resolvedLng = lng;
  if (resolvedLat === null || resolvedLng === null) {
    const geo = await geocodeAddress(values.address);
    if (geo) {
      resolvedLat = geo.lat;
      resolvedLng = geo.lng;
    }
  }

  return {
    title: values.title,
    customer_name: values.customer_name || null,
    address: values.address,
    lat: resolvedLat,
    lng: resolvedLng,
    scheduled_date: values.scheduled_date,
    time_window_start: values.time_window_start || null,
    time_window_end: values.time_window_end || null,
    duration_min: values.duration_min,
    technician_id: values.technician_id || null,
    notes: values.notes || null,
  };
}

export async function createJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const result = parseForm(formData);
  if ("error" in result) return { ok: false, error: result.error };

  const row = await toRow(result.data, result.lat, result.lng);
  const { error } = await supabase.from("jobs").insert({ owner_id: userId, ...row });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  return { ok: true, error: null };
}

export async function updateJob(
  _prevState: JobFormState,
  formData: FormData,
): Promise<JobFormState> {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing job id." };

  const result = parseForm(formData);
  if ("error" in result) return { ok: false, error: result.error };

  const row = await toRow(result.data, result.lat, result.lng);
  const { error } = await supabase
    .from("jobs")
    .update(row)
    .eq("id", id)
    .eq("owner_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  return { ok: true, error: null };
}

export async function duplicateJob(id: string) {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const { data: job, error: fetchError } = await supabase
    .from("jobs")
    .select("*")
    .eq("id", id)
    .eq("owner_id", userId)
    .single();
  if (fetchError || !job) return { ok: false, error: fetchError?.message ?? "Job not found." };

  const { error } = await supabase.from("jobs").insert({
    owner_id: userId,
    title: job.title,
    customer_name: job.customer_name,
    address: job.address,
    lat: job.lat,
    lng: job.lng,
    scheduled_date: job.scheduled_date,
    time_window_start: job.time_window_start,
    time_window_end: job.time_window_end,
    duration_min: job.duration_min,
    technician_id: job.technician_id,
    notes: job.notes,
    status: "scheduled", // a fresh copy starts unscheduled in the route
  });
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  return { ok: true, error: null };
}

export async function deleteJob(id: string) {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("jobs")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  return { ok: true, error: null };
}

// ---- Bulk import ------------------------------------------------------------

const importRowSchema = z.object({
  title: z.string().trim().min(1, "Each job needs a title.").max(120),
  customer_name: z.string().trim().max(120).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  time_window_start: z.string().trim().max(5).optional().nullable().default(null),
  time_window_end: z.string().trim().max(5).optional().nullable().default(null),
  duration_min: z.coerce.number().int().min(1).max(1440),
  notes: z.string().trim().max(2000).optional().default(""),
  lat: z.number().finite().nullable().optional().default(null),
  lng: z.number().finite().nullable().optional().default(null),
});

const importSchema = z.object({
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date."),
  technician_id: z.string().trim().optional().default(""),
  jobs: z.array(importRowSchema).min(1, "Nothing to import.").max(100),
});

export type BulkImportInput = z.input<typeof importSchema>;

// Save a reviewed batch of imported jobs for a given date + technician.
// Coordinates already captured during import are reused; anything missing (or
// edited by hand in the review step) is geocoded here before insert.
export async function createJobsBulk(
  input: BulkImportInput,
): Promise<{ ok: boolean; error: string | null; count?: number }> {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const parsed = importSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { scheduled_date, technician_id, jobs } = parsed.data;

  // Confirm the technician (if any) belongs to this user before assigning.
  let technicianId: string | null = null;
  if (technician_id) {
    const { data: tech } = await supabase
      .from("technicians")
      .select("id")
      .eq("id", technician_id)
      .eq("owner_id", userId)
      .maybeSingle();
    if (!tech) return { ok: false, error: "That technician no longer exists." };
    technicianId = technician_id;
  }

  const rows = await Promise.all(
    jobs.map(async (job) => {
      let lat = job.lat ?? null;
      let lng = job.lng ?? null;
      if ((lat === null || lng === null) && job.address) {
        const geo = await geocodeAddress(job.address);
        if (geo) {
          lat = geo.lat;
          lng = geo.lng;
        }
      }
      return {
        owner_id: userId,
        title: job.title,
        customer_name: job.customer_name || null,
        address: job.address || "",
        lat,
        lng,
        scheduled_date,
        time_window_start: job.time_window_start || null,
        time_window_end: job.time_window_end || null,
        duration_min: job.duration_min,
        technician_id: technicianId,
        notes: job.notes || null,
      };
    }),
  );

  const { error } = await supabase.from("jobs").insert(rows);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  revalidatePath("/map");
  return { ok: true, error: null, count: rows.length };
}

export async function setJobStatus(id: string, status: JobStatus) {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };
  if (!JOB_STATUSES.includes(status)) return { ok: false, error: "Invalid status." };

  const { error } = await supabase
    .from("jobs")
    .update({ status })
    .eq("id", id)
    .eq("owner_id", userId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/jobs");
  return { ok: true, error: null };
}
