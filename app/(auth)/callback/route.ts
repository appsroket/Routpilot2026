import { NextResponse } from "next/server";

// Supabase auth callback handler.
// TODO: exchange the auth code for a session using @supabase/ssr.
export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  return NextResponse.redirect(`${origin}/dashboard`);
}
