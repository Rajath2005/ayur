import { MemStorage } from "./storage";
import { DbStorage } from "./db-storage";
import { FirestoreStorage } from "./firestore-storage";
import { firebaseInitialized } from "./firebaseAdmin";

export function createStorage() {
  console.log("🔍 Firebase initialized:", firebaseInitialized);
  
  if (firebaseInitialized) {
    try {
      const firestoreStorage = new FirestoreStorage();
      console.log("📦 Using storage: Firestore");
      return firestoreStorage;
    } catch (error) {
      console.error("❌ Firestore initialization failed, falling back:", error);
    }
  } else {
    console.log("⚠️ Firebase Admin not initialized, skipping Firestore");
  }

  if (process.env.DATABASE_URL) {
    try {
      const dbStorage = new DbStorage();
      console.log("📦 Using storage: PostgreSQL");
      return dbStorage;
    } catch (error) {
      console.error("❌ PostgreSQL initialization failed, falling back:", error);
    }
  }

  console.log("📦 Using storage: In-Memory");
  return new MemStorage();
}

export const storage = createStorage();