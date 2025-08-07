// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// El SDK de Firebase Admin necesita una cuenta de servicio para autenticarse.
// Esta información se cargará desde una variable de entorno.
// En producción (App Hosting), debes establecer el secreto FIREBASE_ADMIN_CONFIG.
// Para desarrollo local, puedes crear un archivo .env.local y añadir la variable.

const serviceAccount = process.env.FIREBASE_ADMIN_CONFIG
  ? JSON.parse(process.env.FIREBASE_ADMIN_CONFIG)
  : undefined;

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Opcionalmente, puedes añadir la URL de tu base de datos aquí
    // databaseURL: "https://<DATABASE_NAME>.firebaseio.com"
  });
}

export const adminDb = admin.firestore();
