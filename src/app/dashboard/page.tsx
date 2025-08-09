
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Settings } from "lucide-react";
import Link from "next/link";


export default function DashboardPage() {

  return (
    <div className="flex flex-col flex-1">
        <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Panel de Administrador</h1>
            <p className="text-muted-foreground">Selecciona una opción para empezar.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Link href="/dashboard/results" className="hover:scale-105 transform transition-transform duration-300">
                <Card className="h-full flex flex-col justify-between shadow-lg hover:shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <BarChart3 className="w-8 h-8 text-primary"/>
                            Dashboard de Resultados
                        </CardTitle>
                        <CardDescription>
                            Visualiza los resultados agregados, gráficos y promedios de las evaluaciones de los docentes.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-semibold text-primary">Ir a Resultados →</p>
                    </CardContent>
                </Card>
            </Link>

             <Link href="/dashboard/configuration" className="hover:scale-105 transform transition-transform duration-300">
                <Card className="h-full flex flex-col justify-between shadow-lg hover:shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <Settings className="w-8 h-8 text-primary"/>
                            Configuración del Sistema
                        </CardTitle>
                        <CardDescription>
                            Gestiona los estudiantes del sistema, ya sea de forma manual o mediante carga masiva de archivos.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-semibold text-primary">Ir a Configuración →</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    </div>
  );
}

    