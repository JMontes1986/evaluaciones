
"use client";

import { useActionState } from "react";
import { login } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle } from "lucide-react";
import { AppHeader } from "@/components/header";

const initialState = {
  message: "",
};

function SubmitButton() {
    // This component is not needed for now as we can use a simple button.
    // However, if you want to show a pending state, you can implement it here.
    return (
        <Button type="submit" className="w-full">
            <LogIn className="mr-2 h-4 w-4" />
            Iniciar Sesión
        </Button>
    )
}

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialState);

  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <AppHeader />
      <main className="flex-grow flex items-center justify-center bg-background/50">
        <Card className="w-full max-w-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Acceso de Administrador</CardTitle>
            <CardDescription>
              Ingresa tus credenciales para acceder al tablero de resultados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="administrador"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
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
                Iniciar Sesión
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
