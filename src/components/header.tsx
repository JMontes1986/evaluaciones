
"use client"
import { BookOpenCheck, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { studentLogout } from "@/app/actions";
import Image from "next/image";

export function AppHeader({ studentName }: { studentName?: string}) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/evaluation", label: "Evaluación" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <img src="/recurso 11.png" alt="ColGemelli Logo" className="h-7 w-7" />
          <span className="text-xl font-bold font-headline">ColGemelli</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {navLinks.map((link) => (
            <Link
            key={link.href}
            href={link.href}
            className={cn(
                "transition-colors hover:text-primary",
                pathname === link.href ? "text-primary font-bold" : "text-muted-foreground"
            )}
            >
            {link.label}
            </Link>
        ))}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
           {studentName ? (
             <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline">Hola, {studentName.split(' ')[0]}</span>
                <form action={studentLogout}>
                    <Button variant="outline" type="submit" size="sm">
                        <LogOut className="mr-2 h-4 w-4" />
                        Salir
                    </Button>
                </form>
             </div>
           ) : pathname !== '/login' ? (
             <Button asChild variant="secondary">
                <Link href="/login">Acceso Admin</Link>
             </Button>
           ) : null}
        </div>
      </div>
    </header>
  );
}
