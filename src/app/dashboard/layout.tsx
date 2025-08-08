
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { logout } from "@/app/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img src="/recurso 11.png" alt="ColGemelli Logo" className="h-8 w-8" />
          <h1 className="text-xl font-bold font-headline">Admin</h1>
        </Link>
        <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground hidden md:block">Bienvenido al panel de administración.</p>
            <form action={logout}>
                <Button variant="outline" type="submit" className="justify-start gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
            </form>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 overflow-auto">
          {children}
      </main>
    </div>
  );
}
