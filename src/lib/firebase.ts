// ESTE ARCHIVO ES PARA LA CONFIGURACIÓN DEL CLIENTE DE FIREBASE
// NO USAR EN ACCIONES DE SERVIDOR
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Tu configuración de Firebase para la web app
const firebaseConfig = {
  "projectId": "evaluacin-docente",
  "appId": "1:225896137052:web:62d0680e60971d947b0199",
  "storageBucket": "evaluacin-docente.firebasestorage.app",
  "apiKey": "AIzaSyAY5R1LpvA3eUqPePy57mELMjx7WqXUquk",
  "authDomain": "evaluacin-docente.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "225896137052"
};

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db, app };
