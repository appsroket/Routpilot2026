"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const schema = z.object({
  company_name: z.string().trim().min(1, "Company name is required."),
  phone: z.string().trim().optional().default(""),
  hourly_rate: z.coerce.number().min(0).default(150),
  home_base_address: z.string().trim().optional().default(""),
  home_base_lat: z.coerce.number().optional().nullable(),
  home_base_lng: z.coerce.number().optional().nullable(),
});

export type OnboardingState = { error: string | null };

export async function saveOnboarding(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const parsed = schema.safeParse({
    company_name: formData.get("company_name"),
    phone: formData.get("phone"),
    hourly_rate: formData.get("hourly_rate"),
    home_base_address: formData.get("home_base_address"),
    home_base_lat: emptyToNull(formData.get("home_base_lat")),
    home_base_lng: emptyToNull(formData.get("home_base_lng")),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const values = parsed.data;
  const { error } = await supabase
    .from("profiles")
    .update({
      company_name: values.company_name,
      phone: values.phone || null,
      hourly_rate: values.hourly_rate,
      home_base_address: values.home_base_address || null,
      home_base_lat: values.home_base_lat ?? null,
      home_base_lng: values.home_base_lng ?? null,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

function emptyToNull(value: FormDataEntryValue | null) {
  if (value === null) return null;
  const str = String(value).trim();
  return str === "" ? null : str;
}
