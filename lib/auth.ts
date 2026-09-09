import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the current authenticated user, or null if there is no session.
 * Server-only (reads cookies via next/headers) — use in Server Components,
 * Route Handlers, and Server Actions.
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Returns the current authenticated user, or redirects to /login if there is
 * none. Use to gate server-rendered pages and actions.
 */
export async function requireUser(): Promise<User> {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
