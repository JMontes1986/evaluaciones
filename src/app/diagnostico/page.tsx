import { cookies } from "next/headers";
import { getGrades } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle } from "lucide-react";

function StatusIndicator({ success, text }: { success: boolean, text: string }) {
    return (
        <div className="flex items-center gap-3">
            {success ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
                <AlertCircle className="h-5 w-5 text-destructive" />
            )}
            <span className="text-muted-foreground">{text}</span>
        </div>
    )
}

export default async function DiagnosticPage() {
    const adminSessionCookie = cookies().get("session");
    const studentSessionCookie = cookies().get("student_session");

    let dbStatus = { success: false, message: "No se pudo conectar a la base de datos." };
    try {
        const grades = await getGrades();
        if (grades.length > 0) {
            dbStatus = { success: true, message: `Conexión exitosa. ${grades.length} grados cargados.` };
        } else {
             dbStatus = { success: false, message: "La conexión a la base de datos fue exitosa, pero no se encontraron grados." };
        }
    } catch (error: any) {
        dbStatus = { success: false, message: `Error al conectar a la base de datos: ${error.message}` };
    }

    return (
        <div className="container mx-auto max-w-4xl p-4 md:p-8">
            <div className="space-y-2 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-headline">Página de Diagnóstico</h1>
                <p className="text-muted-foreground">Esta página te ayuda a verificar el estado actual de tu sesión y la conectividad del sistema.</p>
            </div>

            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Verificación de Conectividad</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <StatusIndicator success={dbStatus.success} text={dbStatus.message} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Estado de la Sesión de Administrador</CardTitle>
                        <CardDescription>
                            La sesión de administrador es necesaria para acceder a /administracion y /dashboard.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <StatusIndicator 
                            success={!!adminSessionCookie} 
                            text={adminSessionCookie ? "Cookie de sesión de administrador ENCONTRADA." : "Cookie de sesión de administrador NO encontrada."} 
                        />
                        {adminSessionCookie && (
                            <div className="p-3 bg-muted rounded-md text-sm">
                                <p><span className="font-semibold">Nombre:</span> {adminSessionCookie.name}</p>
                                <p><span className="font-semibold">Valor:</span> {adminSessionCookie.value}</p>
                                <p><span className="font-semibold">Expira:</span> {new Date(adminSessionCookie.expires!).toLocaleString()}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Estado de la Sesión de Estudiante</CardTitle>
                        <CardDescription>
                            La sesión de estudiante es necesaria para realizar la evaluación en /evaluation.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <StatusIndicator 
                            success={!!studentSessionCookie} 
                            text={studentSessionCookie ? "Cookie de sesión de estudiante ENCONTRADA." : "Cookie de sesión de estudiante NO encontrada."} 
                        />
                        {studentSessionCookie && (
                            <div className="p-3 bg-muted rounded-md text-sm overflow-auto">
                                <p><span className="font-semibold">Nombre:</span> {studentSessionCookie.name}</p>
                                <p className="break-all"><span className="font-semibold">Valor:</span> {studentSessionCookie.value}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}