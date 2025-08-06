
"use client"
import { BookOpenCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function AppHeader() {
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
        <div className="flex flex-1 items-center justify-end space-x-4">
           <Button asChild variant="secondary">
            <Link href="/login">Acceso Admin</Link>
          </Button>
          <Button asChild>
            <Link href="/evaluation">Comenzar Evaluación</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
