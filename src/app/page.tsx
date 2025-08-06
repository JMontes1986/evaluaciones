
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, Bot, BarChart3, Download, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AppHeader } from "@/components/header";

export default function Home() {
  const features = [
    {
      icon: <BookOpenCheck className="h-10 w-10 text-primary" />,
      title: "Evaluaciones Dinámicas",
      description: "Interactúa con formularios adaptados a tu grado y materias.",
    },
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: "Feedback con IA",
      description: "Recibe sugerencias inteligentes para que tus comentarios sean más constructivos y claros.",
    },
    {
      icon: <BarChart3 className="h-10 w-10 text-primary" />,
      title: "Paneles en Tiempo Real",
      description: "Visualiza los resultados de las evaluaciones con gráficos intuitivos y datos agregados.",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Acceso Seguro",
      description: "El panel de resultados está protegido para garantizar la privacidad de los datos.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      
      <main className="flex-grow">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 text-center py-20 sm:py-32">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-full h-16 w-16 mx-auto mb-6 flex items-center justify-center animate-pulse">
            <BookOpenCheck className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-4xl md:text-6xl font-bold font-headline tracking-tight">
            Dale Forma al Futuro de la Educación
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            GradeWise empodera a los estudiantes para que proporcionen comentarios significativos, ayudando a crear una mejor experiencia de aprendizaje para todos.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/evaluation">
                Comenzar Evaluación <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Ir al Tablero</Link>
            </Button>
          </div>
        </section>

        <section id="features" className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-background/50 rounded-t-3xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold font-headline">¿Por qué GradeWise?</h3>
            <p className="mt-2 text-muted-foreground">Una forma más inteligente de gestionar las evaluaciones de los profesores.</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center transform hover:scale-105 transition-transform duration-300 ease-in-out shadow-lg hover:shadow-primary/20">
                <CardHeader>
                  <div className="mx-auto bg-secondary p-4 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="mt-4">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} GradeWise. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
