
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("session")?.value;

  // Si el usuario no está autenticado y trata de acceder al dashboard,
  // redirigirlo a la página de login.
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si el usuario ya está autenticado y trata de acceder a la página de login,
  // redirigirlo al dashboard.
  if (session && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Configura las rutas que deben ser protegidas por el middleware.
export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};
