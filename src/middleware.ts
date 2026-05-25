import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/jwt";

const SESSION_COOKIE_NAME = "nexus_vault_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Verify session
  let hasSession = false;
  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      hasSession = true;
    }
  }

  // Route protection rules
  if (pathname.startsWith("/dashboard") || pathname === "/") {
    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    } else if (pathname === "/") {
      const dashUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashUrl);
    }
  }

  if (pathname === "/login" || pathname === "/register") {
    if (hasSession) {
      const dashUrl = new URL("/dashboard", request.url);
      return NextResponse.redirect(dashUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/", "/login", "/register"],
};
