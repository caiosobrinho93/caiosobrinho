import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken } from "./lib/jwt";

const SESSION_COOKIE_NAME = "nexus_vault_session";

// Função do proxy conforme convenção do Next.js 16
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Verificar sessão ativa
  let hasSession = false;
  if (token) {
    const session = await verifySessionToken(token);
    if (session) {
      hasSession = true;
    }
  }

  // Regras de proteção de rotas
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
