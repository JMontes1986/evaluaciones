// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

let adminApp: App;

if (getApps().length === 0) {
  if (!serviceAccountString) {
    throw new Error("CRITICAL: FIREBASE_ADMIN_CONFIG environment variable is not set. Server-side database operations will fail.");
  }
  try {
    const serviceAccount = JSON.parse(serviceAccountString);
    adminApp = initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log("Firebase Admin SDK initialized successfully.");
  } catch (error: any) {
    console.error("CRITICAL: Failed to initialize Firebase Admin SDK. Check FIREBASE_ADMIN_CONFIG content:", error.message);
    throw new Error("Invalid Firebase Admin SDK configuration.");
  }
} else {
  adminApp = getApp();
  console.log("Reusing existing Firebase Admin SDK instance.");
}

const adminDb = getFirestore(adminApp);

export { adminDb };
