// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp } from 'firebase-admin/app';

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

if (!serviceAccountString) {
    console.warn("ADVERTENCIA: La variable de entorno FIREBASE_ADMIN_CONFIG no está definida. Las operaciones de base de datos del servidor fallarán.");
}

function initializeAdminApp() {
    if (getApps().length > 0) {
        console.log("Firebase Admin SDK ya estaba inicializado.");
        return getApp();
    }
    
    if (serviceAccountString) {
        try {
            const serviceAccount = JSON.parse(serviceAccountString);
            console.log("Inicializando Firebase Admin SDK...");
            return initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error("Error crítico al inicializar Firebase Admin SDK. Verifica el contenido de FIREBASE_ADMIN_CONFIG en tu .env.local:", error.message);
            // Lanza el error para detener la ejecución si la configuración es inválida.
            throw new Error("La configuración de Firebase Admin es inválida.");
        }
    } else {
        // Lanza un error si las credenciales no están disponibles.
        throw new Error("FIREBASE_ADMIN_CONFIG no está definida. No se puede inicializar Firebase Admin.");
    }
}

// Inicializa la app y obtén la instancia de Firestore.
let adminDb: admin.firestore.Firestore;
try {
    const adminApp = initializeAdminApp();
    adminDb = admin.firestore(adminApp);
} catch (error: any) {
    console.error("Fallo al obtener la instancia de Firestore:", error.message);
    // Asigna un objeto mock o nulo para evitar que la app crashee en el import,
    // aunque las operaciones fallarán. Se registrarán advertencias en las funciones que lo usen.
    // Esto es principalmente para entornos donde las credenciales no son necesarias (ej. build).
    adminDb = {} as admin.firestore.Firestore;
}


// Exporta la instancia de la base de datos.
export { adminDb };