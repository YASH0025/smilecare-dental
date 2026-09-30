import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Protects every /admin page except the login screen.
 * API routes enforce auth themselves via `route(..., { admin: true })`,
 * so data is protected even if this proxy is bypassed.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const session = verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);

  if (pathname.startsWith("/admin/login")) {
    if (session) return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    return NextResponse.next();
  }

  if (!session) {
    const url = new URL("/admin/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
