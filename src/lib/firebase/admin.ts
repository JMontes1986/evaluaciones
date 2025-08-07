// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { config } from 'dotenv';

config({ path: '.env.local' });

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

let adminDb: admin.firestore.Firestore;

if (serviceAccountString) {
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(serviceAccountString);
    } catch (e) {
        console.error('Error: No se pudo parsear FIREBASE_ADMIN_CONFIG. Asegúrate de que es un JSON válido.', e);
        throw new Error('FIREBASE_ADMIN_CONFIG no es un JSON válido.');
    }

    if (!getApps().length) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log("Firebase Admin SDK inicializado correctamente.");
        } catch (error: any) {
            console.error(`Error al inicializar Firebase Admin SDK: ${error.message}`);
            throw new Error(`Error al inicializar Firebase Admin SDK: ${error.message}`);
        }
    }
    adminDb = admin.firestore();
} else {
    console.warn("ADVERTENCIA: La variable de entorno FIREBASE_ADMIN_CONFIG no está definida. Las operaciones de base de datos del servidor fallarán. Por favor, configúrala en tu archivo .env.local para el desarrollo.");
    // Objeto simulado para evitar que la aplicación se bloquee al importar, pero fallará en tiempo de ejecución si se usa.
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
