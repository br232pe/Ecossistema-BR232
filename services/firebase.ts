import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

try {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  auth.languageCode = 'pt';
  db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
  googleProvider = new GoogleAuthProvider();
} catch (error) {
  console.error("❌ Falha crítica ao inicializar Firebase:", error);
  throw error;
}

export { auth, db, googleProvider };
