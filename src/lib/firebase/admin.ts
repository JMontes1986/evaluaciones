// src/lib/firebase/admin.ts
import admin from 'firebase-admin';
import { getApps, initializeApp, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountString = process.env.FIREBASE_ADMIN_CONFIG;

let adminApp: App;
let adminDb: admin.firestore.Firestore;

if (getApps().length === 0) {
  if (!serviceAccountString) {
    console.error("CRITICAL: FIREBASE_ADMIN_CONFIG environment variable is not set. Server-side database operations will fail.");
    // In a real production environment, you might want to throw an error here to prevent the app from starting.
    // For now, we log a critical error. The app will likely crash on first DB operation.
    // throw new Error("Firebase Admin SDK credentials are not available.");
  } else {
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
  }
} else {
  adminApp = getApp();
  console.log("Reusing existing Firebase Admin SDK instance.");
}

// Get the Firestore instance from the initialized app.
// This should only be done after the app is guaranteed to be initialized.
adminDb = getFirestore(adminApp);

export { adminDb };
