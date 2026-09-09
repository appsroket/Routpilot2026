"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { normalizeE164 } from "@/lib/phone";

export type TechnicianFormState = { ok: boolean; error: string | null };

const schema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(80, "Name is too long."),
  color: z
    .string()
    .trim()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a valid color."),
});

async function getOwnerId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

type ParsedTechnician = { name: string; color: string; phone: string; active: boolean };
type ParseResult = { error: string } | { data: ParsedTechnician };

function parseForm(formData: FormData): ParseResult {
  const parsed = schema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const phone = normalizeE164(String(formData.get("phone") ?? ""));
  if (!phone) {
    return { error: "Enter a valid phone number (e.g. (555) 123-4567)." };
  }

  const active = formData.get("active") === "true";

  return { data: { ...parsed.data, phone, active } };
}

export async function createTechnician(
  _prevState: TechnicianFormState,
  formData: FormData,
): Promise<TechnicianFormState> {
  const { supabase, userId } = await getOwnerId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const result = parseForm(formData);
  if ("error" in result) return { ok: false, error: result.error };

  const { error } = await supabase.from("technicians").insert({
    owner_id: userId,
    name: result.data.name,
    phone: result.data.phone,
    color: result.data.color,
    active: result.data.active,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/technicians");
  return { ok: true, error: null };
}

export async function updateTechnician(
  _prevState: TechnicianFormState,
  formData: FormData,
): Promise<TechnicianFormState> {
  const { supabase, userId } = await getOwnerId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, error: "Missing technician id." };

  const result = parseForm(formData);
  if ("error" in result) return { ok: false, error: result.error };

  const { error } = await supabase
    .from("technicians")
    .update({
      name: result.data.name,
      phone: result.data.phone,
      color: result.data.color,
      active: result.data.active,
    })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/technicians");
  return { ok: true, error: null };
}

export async function setTechnicianActive(id: string, active: boolean) {
  const { supabase, userId } = await getOwnerId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("technicians")
    .update({ active })
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/technicians");
  return { ok: true, error: null };
}

export async function deleteTechnician(id: string) {
  const { supabase, userId } = await getOwnerId();
  if (!userId) return { ok: false, error: "You must be signed in." };

  const { error } = await supabase
    .from("technicians")
    .delete()
    .eq("id", id)
    .eq("owner_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/technicians");
  return { ok: true, error: null };
}
