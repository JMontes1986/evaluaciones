// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

let adminApp: App | undefined;
let adminDb: Firestore | undefined;

if (getApps().length === 0) {
  if (!serviceAccountString) {
     console.warn(
      'FIREBASE_ADMIN_CONFIG environment variable is not set. Firebase Admin SDK will not be initialized.'
    );
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountString);
      adminApp = initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin SDK initialized successfully.');
    } catch (error: any) {
      console.error(
        'CRITICAL: Failed to initialize Firebase Admin SDK. Check FIREBASE_ADMIN_CONFIG content:',
        error.message
      );
      throw new Error('Invalid Firebase Admin SDK configuration.');
    }
  }
} else {
  adminApp = getApp();
  console.log('Reusing existing Firebase Admin SDK instance.');
}

if (adminApp) {
  adminDb = getFirestore(adminApp);
}

export { adminDb };


export function getAdminDb(): Firestore {
  if (!adminDb) {
    throw new Error(
      'Firebase Admin has not been initialized. Set FIREBASE_ADMIN_CONFIG to enable database operations.'
    );
  }
  return adminDb;
}
