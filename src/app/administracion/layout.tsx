
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, BarChart3, ArrowLeft, LayoutDashboard } from "lucide-react";
import { logout } from "@/app/actions";
import { cn } from "@/lib/utils";


export default function AdministrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-6">
            <Link href="/administracion" className="flex items-center gap-2">
                <img src="/recurso 11.png" alt="ColGemelli Logo" className="h-8 w-8" />
                <h1 className="text-xl font-bold font-headline hidden sm:block">Admin ColGemelli</h1>
            </Link>
             <nav className="flex items-center gap-2">
                <Button asChild variant='ghost' size="sm">
                    <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">Ir al Dashboard</span>
                    </Link>
                </Button>
            </nav>
        </div>
        <div className="flex items-center gap-4">
            <form action={logout}>
                <Button variant="outline" type="submit" size="sm" className="justify-start gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Salir</span>
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
