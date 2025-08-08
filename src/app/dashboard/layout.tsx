
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";
import { logout } from "@/app/actions";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full flex">
      <aside className="hidden md:flex flex-col w-64 border-r bg-background/95 p-4">
        <div className="flex items-center gap-2 mb-8">
            <img src="/recurso 11.png" alt="ColGemelli Logo" className="h-8 w-8" />
            <h1 className="text-xl font-bold font-headline">Admin</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
            <Link href="/dashboard">
                <Button 
                    variant={pathname === "/dashboard" ? "secondary" : "ghost"} 
                    className="w-full justify-start gap-2"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                </Button>
            </Link>
        </nav>
        <form action={logout} className="mt-auto">
            <Button variant="outline" type="submit" className="w-full justify-start gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
        </form>
      </aside>
      <div className="flex-1 flex flex-col">
         <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 md:justify-end">
            <div className="md:hidden">
              <Link href="/dashboard" className="flex items-center gap-2">
                <img src="/recurso 11.png" alt="ColGemelli Logo" className="h-6 w-6" />
                <span className="font-bold">Admin</span>
              </Link>
            </div>
            <div className="md:hidden">
                <form action={logout}>
                    <Button variant="outline" size="icon" type="submit">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </form>
            </div>
            <div className="hidden md:block">
                 <p className="text-sm text-muted-foreground">Bienvenido al panel de administración.</p>
            </div>
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
            {children}
        </main>
      </div>
    </div>
  );
}
