
"use client"
import { BookOpenCheck, LogOut } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { studentLogout } from "@/app/actions";

export function AppHeader({ studentName }: { studentName?: string}) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/evaluation", label: "Evaluación" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-8 flex items-center gap-2">
          <BookOpenCheck className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline">GradeWise</span>
        </Link>
        {studentName && (
            <nav className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map((link) => (
                <Link
                key={link.href}
                href={link.href}
                className={cn(
                    "transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
                >
                {link.label}
                </Link>
            ))}
            </nav>
        )}
        <div className="flex flex-1 items-center justify-end space-x-4">
           {studentName ? (
             <form action={studentLogout}>
                <Button variant="outline" type="submit">
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
             </form>
           ) : (
             <Button asChild variant="secondary">
                <Link href="/login">Acceso Admin</Link>
             </Button>
           )}
        </div>
      </div>
    </header>
  );
}
