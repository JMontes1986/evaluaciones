
"use client";

import { useActionState } from "react";
import { studentLogin } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from "lucide-react";


const initialState = {
  message: "",
};

export function StudentLogin() {
  const [state, formAction] = useActionState(studentLogin, initialState);

  return (
      <Card className="w-full max-w-sm mx-auto shadow-2xl animate-in fade-in-50">
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
  );
}
