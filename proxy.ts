import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Convención oficial de Next.js 16 (reemplazo de middleware)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger rutas de /dashboard
  if (pathname.startsWith("/dashboard")) {
    // Verificar cookies de sesión emitidas por Better Auth
    const sessionToken =
      request.cookies.get("better-auth.session_token") ||
      request.cookies.get("__Secure-better-auth.session_token");

    // Si no hay cookie de sesión activa, redirigir a /login
    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
