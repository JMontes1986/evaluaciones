
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const adminSession = request.cookies.get("session")?.value;
  const studentSession = request.cookies.get("student_session")?.value;
  const { pathname } = request.nextUrl;

  // Proteger rutas de admin
  if (!adminSession && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Si el admin ya inició sesión, no puede ver el login
  if (adminSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Si un estudiante no ha iniciado sesión y trata de acceder a la evaluación directamente
  // lo dejamos pasar, ya que el login está en la misma página de evaluación.
  if (!studentSession && pathname.startsWith("/evaluation")) {
      return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/evaluation"],
};
