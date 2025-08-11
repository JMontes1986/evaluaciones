
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  // Proteger rutas de admin
  if (!adminSession && (pathname.startsWith("/dashboard") || pathname.startsWith("/administracion"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (adminSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/administracion", request.url));
  }

  // Redirigir de la raíz a la página de evaluación
  if (pathname === "/") {
     return NextResponse.redirect(new URL("/evaluation", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - recurso 11.png (logo file)
     * - plantilla_estudiantes.csv (template file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|recurso%2011.png|plantilla_estudiantes.csv).*)',
  ],
};
