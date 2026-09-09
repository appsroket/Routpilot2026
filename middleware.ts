import { NextResponse, type NextRequest } from "next/server";

// Placeholder middleware.
// TODO: refresh the Supabase session here with @supabase/ssr and gate
// the (dashboard) routes behind authentication.
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg).*)",
  ],
};
