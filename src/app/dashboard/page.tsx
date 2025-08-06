
"use client";
import { DashboardClient } from "@/components/dashboard-client";
import { AppHeader } from "@/components/header";
import { logout } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold font-headline">Tablero de Administrador</h1>
          <form action={logout}>
            <Button variant="outline" type="submit">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold font-headline">Tablero de Resultados</h1>
            <p className="text-muted-foreground">Resultados agregados de las evaluaciones de los estudiantes.</p>
        </div>
        <div className="mt-6">
          <DashboardClient />
        </div>
      </main>
    </div>
  );
}
