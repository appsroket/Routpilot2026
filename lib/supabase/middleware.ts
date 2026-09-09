import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Refreshes the Supabase auth session on every request and returns the
 * (possibly updated) response together with the current user.
 *
 * The response carries any refreshed auth cookies — callers that build their
 * own response (e.g. a redirect) must copy these cookies over so the session
 * stays in sync.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANT: getUser() revalidates the token with the Supabase Auth server
  // and triggers the cookie refresh above. Do not run other logic between
  // creating the client and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
