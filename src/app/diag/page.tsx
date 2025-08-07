
import { adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppHeader } from "@/components/header";

interface Check {
  name: string;
  status: "success" | "error" | "warning";
  message: string;
}

async function performChecks(): Promise<Check[]> {
  const checks: Check[] = [];

  // 1. Verificar Variable de Entorno
  const firebaseConfigEnv = process.env.FIREBASE_ADMIN_CONFIG;
  if (firebaseConfigEnv) {
    checks.push({
      name: "Variable de Entorno FIREBASE_ADMIN_CONFIG",
      status: "success",
      message: "La variable de entorno está definida.",
    });
  } else {
    checks.push({
      name: "Variable de Entorno FIREBASE_ADMIN_CONFIG",
      status: "error",
      message: "No definida. La aplicación no puede conectarse a la base de datos. Debes crear un archivo .env.local en la raíz del proyecto y añadir tu service account de Firebase.",
    });
  }

  // 2. Verificar Inicialización de Firebase Admin y Conexión a DB
  if (adminDb) {
    try {
      // Intenta hacer una operación simple en la base de datos
      await adminDb.collection("grades").limit(1).get();
      checks.push({
        name: "Conexión a Firestore",
        status: "success",
        message: "Se ha conectado a la base de datos y se pueden leer datos.",
      });
    } catch (e: any) {
       checks.push({
        name: "Conexión a Firestore",
        status: "error",
        message: `Error al conectar con Firestore: ${e.message}. Verifica que las credenciales en FIREBASE_ADMIN_CONFIG son correctas y que la base de datos está activa.`,
      });
    }
  } else {
     checks.push({
      name: "Inicialización de Firebase Admin",
      status: "error",
      message: "El SDK de Firebase Admin no se ha podido inicializar. Esto normalmente es debido a la falta de la variable de entorno.",
    });
     checks.push({
        name: "Conexión a Firestore",
        status: "error",
        message: "No se puede intentar la conexión a la base de datos porque el SDK de Firebase Admin no está inicializado.",
      });
  }
  
  // 3. Verificar Cookie de Sesión de Estudiante
  const studentCookie = cookies().get("student_session")?.value;
  if (studentCookie) {
    try {
      const student = JSON.parse(studentCookie);
      checks.push({
        name: "Sesión de Estudiante",
        status: "success",
        message: `Sesión encontrada para: ${student.name} (Código: ${student.code})`,
      });
    } catch {
       checks.push({
        name: "Sesión de Estudiante",
        status: "error",
        message: "La cookie de sesión de estudiante está corrupta o mal formateada.",
      });
    }
  } else {
    checks.push({
      name: "Sesión de Estudiante",
      status: "warning",
      message: "No se encontró sesión de estudiante. Esto es normal si no has iniciado sesión.",
    });
  }

  return checks;
}

const statusIcons = {
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  error: <XCircle className="h-6 w-6 text-red-500" />,
  warning: <AlertTriangle className="h-6 w-6 text-yellow-500" />,
};

const statusStyles = {
  success: "border-green-500/50 bg-green-500/10",
  error: "border-red-500/50 bg-red-500/10",
  warning: "border-yellow-500/50 bg-yellow-500/10",
};


export default async function DiagPage() {
  const checks = await performChecks();

  return (
    <div className="flex flex-col flex-1">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
         <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold font-headline">Página de Diagnóstico</h1>
            <p className="text-muted-foreground mt-2">
              Esta página verifica el estado del servidor para asegurar que todo funcione correctamente.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resultados de la Comprobación del Servidor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {checks.map((check, index) => (
                <div key={index} className={`flex items-start gap-4 rounded-lg border p-4 ${statusStyles[check.status]}`}>
                  <div className="flex-shrink-0">{statusIcons[check.status]}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{check.name}</h3>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
