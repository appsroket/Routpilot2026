import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes that require an authenticated user.
const PROTECTED_PREFIXES = [
  "/dashboard",
  "/jobs",
  "/map",
  "/technicians",
  "/settings",
  "/billing",
];

// Auth routes an authenticated user should be bounced away from.
const AUTH_PREFIXES = ["/login", "/signup"];

function matchesPrefix(pathname: string, prefixes: string[]) {
  return prefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export async function middleware(request: NextRequest) {
  // Refresh the session first; `response` carries any updated auth cookies.
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Not logged in and visiting a protected route → send to /login.
  if (!user && matchesPrefix(pathname, PROTECTED_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return copyCookies(response, NextResponse.redirect(url));
  }

  // Logged in and visiting /login or /signup → send to /dashboard.
  if (user && matchesPrefix(pathname, AUTH_PREFIXES)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return copyCookies(response, NextResponse.redirect(url));
  }

  return response;
}

// Preserve the refreshed auth cookies from the session response on a redirect.
function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg (favicons)
     * - image assets (svg, png, jpg, jpeg, gif, webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
