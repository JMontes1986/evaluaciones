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

if (!serviceAccountString) {
  throw new Error('La variable de entorno FIREBASE_ADMIN_CONFIG no está definida. Por favor, configúrala en tu archivo .env.local');
}

let serviceAccount;
try {
    serviceAccount = JSON.parse(serviceAccountString);
} catch (e) {
    throw new Error('No se pudo parsear FIREBASE_ADMIN_CONFIG. Asegúrate de que es un JSON válido.');
}


if (!getApps().length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (error: any) {
    throw new Error(`Error al inicializar Firebase Admin SDK: ${error.message}`);
  }
}

export const adminDb = admin.firestore();