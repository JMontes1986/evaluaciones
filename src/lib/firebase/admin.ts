
// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env.local
config({ path: '.env.local' });

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
            console.log("Firebase Admin SDK inicializado correctamente.");
        } catch (error: any) {
            console.error(`Error al inicializar Firebase Admin SDK: ${error.message}`);
        }
    }
    adminDb = admin.firestore();
} else {
    console.warn("La variable de entorno FIREBASE_ADMIN_CONFIG no está definida. Las operaciones de administrador de Firebase no funcionarán.");
    // Proporcionar un objeto 'adminDb' simulado para evitar que la aplicación se bloquee
    // al importar. Las operaciones fallarán en tiempo de ejecución si se intentan.
    adminDb = new Proxy({}, {
        get(target, prop) {
            if (prop === 'then') return undefined; // Prevenir que se trate como una promesa
            throw new Error(
              `Firebase Admin no está inicializado. Asegúrate de que FIREBASE_ADMIN_CONFIG esté configurada en tu entorno.`
            );
        }
    }) as admin.firestore.Firestore;
}

export { adminDb };
