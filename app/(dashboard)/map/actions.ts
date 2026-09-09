"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

async function getOwner() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, userId: user?.id ?? null };
}

// Persist a manual drag-and-drop reorder: sequence = position (1-based).
export async function reorderJobs(orderedIds: string[]) {
  const { supabase, userId } = await getOwner();
  if (!userId) return { ok: false, error: "You must be signed in." };
  if (orderedIds.length === 0) return { ok: true, error: null };

  const results = await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from("jobs")
        .update({ sequence: index + 1 })
        .eq("id", id)
        .eq("owner_id", userId),
    ),
  );

  const failed = results.find((r) => r.error);
  if (failed?.error) return { ok: false, error: failed.error.message };

  revalidatePath("/map");
  return { ok: true, error: null };
}
