// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Next.js carga automáticamente las variables de entorno desde .env.local,
// por lo que no es necesario llamar a dotenv.config() explícitamente.

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;
let adminDb: admin.firestore.Firestore;

if (!serviceAccountString) {
    console.warn("ADVERTENCIA: La variable de entorno FIREBASE_ADMIN_CONFIG no está definida. Las operaciones de base de datos del servidor fallarán.");
}

// Solo inicializa la app si no ha sido inicializada y si las credenciales existen.
if (getApps().length === 0 && serviceAccountString) {
    try {
        const serviceAccount = JSON.parse(serviceAccountString);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log("Firebase Admin SDK inicializado correctamente.");
    } catch (error: any) {
        console.error("Error crítico al inicializar Firebase Admin SDK. Verifica el contenido de FIREBASE_ADMIN_CONFIG en tu .env.local:", error.message);
    }
} else if (getApps().length > 0) {
    console.log("Firebase Admin SDK ya estaba inicializado.");
}

if (admin.apps.length > 0) {
    adminDb = admin.firestore();
} else {
    // Esta advertencia se mostrará si FIREBASE_ADMIN_CONFIG no está configurado o falló la inicialización.
    console.warn("ADVERTENCIA: Firebase Admin no está inicializado. Las operaciones de base de datos del servidor fallarán.");
}

// Exporta la instancia de la base de datos o undefined si no se pudo inicializar.
export { adminDb };
