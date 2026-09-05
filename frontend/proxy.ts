import { NextResponse, type NextRequest } from "next/server";

/**
 * Route protection (Next.js 16 `proxy` file — replaces middleware).
 *
 * Guard level: cookie PRESENCE only. It gives instant redirects for UX;
 * real authorization still happens on every API call via JWT guards,
 * because a stolen/forged cookie value would not pass those checks.
 */
const PROTECTED_PREFIXES = ["/dashboard", "/profile", "/resume"];

const AUTH_PAGES = ["/login", "/register", "/forget-password", "/reset-password"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has("refreshToken");

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/"),
  );

  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  // Signed-in users do not need the standalone auth pages.
  const isAuthPage = AUTH_PAGES.some((page) => pathname === page);
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/resume/:path*",
    "/login",
    "/register",
    "/forget-password",
    "/reset-password",
  ],
};
