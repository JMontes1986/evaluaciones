
// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

// El SDK de Firebase Admin necesita una cuenta de servicio para autenticarse.
// Esta información se cargará desde una variable de entorno.
// En producción (App Hosting), debes establecer el secreto FIREBASE_ADMIN_CONFIG.
// Para desarrollo local, crea un archivo .env.local y añade la variable.

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

let adminDb: admin.firestore.Firestore;

if (serviceAccountString) {
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountString);
    } catch (e) {
        console.error('Error: No se pudo parsear FIREBASE_ADMIN_CONFIG. Asegúrate de que es un JSON válido.', e);
    }

    if (serviceAccount && !getApps().length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        } catch (error: any) {
            console.error(`Error al inicializar Firebase Admin SDK: ${error.message}`);
        }
    }
    adminDb = admin.firestore();
} else {
    console.warn("La variable de entorno FIREBASE_ADMIN_CONFIG no está definida. Las operaciones de administrador de Firebase no funcionarán.");
    // Proporcionar un objeto 'adminDb' simulado para evitar que la aplicación se bloquee
    // al importar. Las operaciones fallarán en tiempo de ejecución si se intentan.
    adminDb = {} as admin.firestore.Firestore;
}

export { adminDb };
