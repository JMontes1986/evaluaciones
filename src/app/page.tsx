
"use client";

import { useActionState } from "react";
import { studentLogin } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle, BookOpenCheck } from "lucide-react";
import Link from "next/link";


const initialState = {
  message: "",
};

export default function StudentLoginPage() {
  const [state, formAction] = useActionState(studentLogin, initialState);

  return (
    <div className="flex flex-col min-h-screen">
       <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
            <Link href="/" className="mr-8 flex items-center gap-2">
            <BookOpenCheck className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold font-headline">GradeWise</span>
            </Link>
             <div className="flex flex-1 items-center justify-end space-x-4">
                <Button asChild variant="secondary">
                    <Link href="/login">Acceso Admin</Link>
                </Button>
            </div>
        </div>
       </header>
      <main className="flex-grow flex items-center justify-center bg-background/50">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acceso de Estudiante</CardTitle>
            <CardDescription>
              Ingresa tu código para comenzar la evaluación.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="code">Código de Estudiante</Label>
                <Input
                  id="code"
                  name="code"
                  type="text"
                  placeholder="Tu código único"
                  required
                />
              </div>
              
               {state?.message && (
                <div className="flex items-center gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <p>{state.message}</p>
                </div>
              )}

              <Button type="submit" className="w-full">
                <LogIn className="mr-2 h-4 w-4" />
                Ingresar
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
