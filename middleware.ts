
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

  if (adminSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Proteger ruta de evaluación: si no hay sesión de estudiante, redirigir a la página de inicio
  if (!studentSession && pathname.startsWith("/evaluation")) {
      return NextResponse.redirect(new URL("/", request.url));
  }

  // Si el estudiante ya inició sesión y está en la página de inicio, redirigirlo a la evaluación
  if (studentSession && pathname === "/") {
     return NextResponse.redirect(new URL("/evaluation", request.url));
  }


  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/evaluation", "/"],
};
