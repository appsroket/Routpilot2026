import type { User } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";

// Statuses that grant access to the product.
const ACTIVE_STATUSES = ["trialing", "active"];

/**
 * True when the user's subscription grants access (trialing or active).
 * Server-only (reads the subscriptions table via the server client).
 */
export async function hasActiveAccess(user: User): Promise<boolean> {
  const supabase = createClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("owner_id", user.id)
    .single();
  return ACTIVE_STATUSES.includes(data?.status ?? "");
}
