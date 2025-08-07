// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { config } from 'dotenv';

// Carga las variables de entorno desde .env.local
config({ path: '.env.local' });

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

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
}

// Exporta la instancia de la base de datos solo si la app fue inicializada.
// Si no, exporta un objeto que lanzará un error claro si se intenta usar.
let adminDb: admin.firestore.Firestore;
if (admin.apps.length > 0) {
    adminDb = admin.firestore();
} else {
    // Si estás viendo este error en producción, asegúrate de haber configurado los secretos en App Hosting.
    // Si lo ves en desarrollo, asegúrate de que tu archivo .env.local existe y tiene las credenciales correctas.
    console.warn("ADVERTENCIA: Firebase Admin no está inicializado. Las operaciones de base de datos del servidor fallarán.");
    adminDb = new Proxy({}, {
        get(target, prop) {
            if (prop === 'then') return undefined;
            throw new Error(`Firebase Admin no está inicializado. Asegúrate de que FIREBASE_ADMIN_CONFIG esté configurada en tu entorno.`);
        }
    }) as admin.firestore.Firestore;
}

export { adminDb };
