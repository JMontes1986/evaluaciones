
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCog } from "lucide-react";
import Link from "next/link";


export default function AdministrationPage() {

  return (
    <div className="flex flex-col flex-1">
        <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Administración del Sistema</h1>
            <p className="text-muted-foreground">Selecciona una opción para gestionar los datos del sistema.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Link href="/dashboard/configuration" className="hover:scale-105 transform transition-transform duration-300">
                <Card className="h-full flex flex-col justify-between shadow-lg hover:shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <Users className="w-8 h-8 text-primary"/>
                            Gestionar Estudiantes
                        </CardTitle>
                        <CardDescription>
                            Añade nuevos estudiantes de forma manual o mediante carga masiva de archivos CSV.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-semibold text-primary">Ir a Gestión de Estudiantes →</p>
                    </CardContent>
                </Card>
            </Link>

             <Link href="#" className="hover:scale-105 transform transition-transform duration-300 opacity-50 cursor-not-allowed">
                <Card className="h-full flex flex-col justify-between shadow-lg hover:shadow-primary/20">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-2xl">
                            <UserCog className="w-8 h-8 text-primary"/>
                            Gestionar Profesores
                        </CardTitle>
                        <CardDescription>
                            (Próximamente) Edita, añade o elimina profesores y las materias que imparten.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm font-semibold text-primary">Ir a Gestión de Profesores →</p>
                    </CardContent>
                </Card>
            </Link>
        </div>
    </div>
  );
}
