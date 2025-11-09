// client/src/services/auth.ts
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  getIdToken,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, googleProvider } from "./firebaseClient";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

export const signUp = async (email: string, password: string, name?: string): Promise<AuthUser> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  // Optionally set displayName via updateProfile if needed (not included here)
  return mapFirebaseUser(user);
};

export const signIn = async (email: string, password: string): Promise<AuthUser> => {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  return mapFirebaseUser(user);
};

export const signInWithGoogle = async (): Promise<void> => {
  // Use popup flow for better UX and to avoid redirect issues
  console.log("Starting Google sign-in popup...");
  await signInWithPopup(auth, googleProvider);
};

export const logout = async (): Promise<void> => {
  await signOut(auth);
};

export const restoreSession = async (): Promise<AuthUser | null> => {
  // Returns current user (if any). We read current user if available.
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (!user) return resolve(null);
      return resolve(mapFirebaseUser(user));
    });
  });
};

export const resetPassword = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return mapFirebaseUser(user);
};

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    callback(user ? mapFirebaseUser(user) : null);
  });
  return {
    unsubscribe,
  };
};

export const getIdTokenForCurrentUser = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  return getIdToken(user, /* forceRefresh: */ true);
};

function mapFirebaseUser(user: FirebaseUser): AuthUser {
  return {
    id: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? undefined,
    avatar: user.photoURL ?? undefined,
  };
}
