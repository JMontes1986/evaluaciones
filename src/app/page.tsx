
import { AppHeader } from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BarChart, ShieldCheck, MessageSquareHeart } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col flex-1 min-h-screen">
      <AppHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_500px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Plataforma de Evaluación Docente ColGemelli
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Una herramienta intuitiva y anónima para que los estudiantes proporcionen retroalimentación valiosa y los administradores obtengan insights claros para la mejora continua.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/evaluation">
                      Comenzar Evaluación
                    </Link>
                  </Button>
                </div>
              </div>
               <div className="hidden lg:flex justify-center items-center">
                 <Card className="shadow-2xl w-full max-w-md">
                    <CardHeader>
                        <CardTitle>Características Principales</CardTitle>
                        <CardDescription>Todo lo que necesitas para una evaluación efectiva.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-start gap-4">
                            <ShieldCheck className="h-8 w-8 text-primary mt-1"/>
                            <div>
                                <h3 className="font-semibold">Evaluaciones Anónimas</h3>
                                <p className="text-sm text-muted-foreground">Los estudiantes pueden dar su opinión con total confianza y honestidad.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <BarChart className="h-8 w-8 text-primary mt-1"/>
                            <div>
                                <h3 className="font-semibold">Tablero de Resultados</h3>
                                <p className="text-sm text-muted-foreground">Visualiza datos agregados y descubre tendencias clave fácilmente.</p>
                            </div>
                        </div>
                         <div className="flex items-start gap-4">
                            <MessageSquareHeart className="h-8 w-8 text-primary mt-1"/>
                            <div>
                                <h3 className="font-semibold">Sugerencias con IA</h3>
                                <p className="text-sm text-muted-foreground">Ayuda a la institución a formular mejor las preguntas y los resultados por docentes de manera clara y constructiva.</p>
                            </div>
                        </div>
                    </CardContent>
                 </Card>
               </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
