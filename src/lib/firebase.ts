// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "evaluacin-docente",
  "appId": "1:225896137052:web:62d0680e60971d947b0199",
  "storageBucket": "evaluacin-docente.firebasestorage.app",
  "apiKey": "AIzaSyAY5R1LpvA3eUqPePy57mELMjx7WqXUquk",
  "authDomain": "evaluacin-docente.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "225896137052"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export { db };
