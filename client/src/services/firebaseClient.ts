// client/src/services/firebaseClient.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const sanitizeEnv = (value: string | boolean | number | undefined | null) => {
  if (value === undefined || value === null) return "";
  const str = String(value).trim();
  return str.replace(/^['"]|['"]$/g, "");
};

const firebaseConfig = {
  apiKey: sanitizeEnv(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  storageBucket: sanitizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  appId: sanitizeEnv(import.meta.env.VITE_FIREBASE_APP_ID),
  measurementId: sanitizeEnv(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

// Add localhost to authorized domains for development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  console.log('Running on localhost - Firebase auth should work with redirect flow');
}

if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("Missing or invalid Firebase config. Ensure VITE_FIREBASE_* env vars are set in client/.env");
  throw new Error("Firebase configuration is incomplete. Check VITE_FIREBASE_* env variables.");
}

const app = initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Configure Google provider for redirect flow
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export const db: Firestore = getFirestore(app);
export const storage: FirebaseStorage = getStorage(app);

export default app;
