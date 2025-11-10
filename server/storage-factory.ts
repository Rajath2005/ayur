import { MemStorage, IStorage } from "./storage";
import { DbStorage } from "./db-storage";
import { MongoStorage } from "./mongo-storage";
import { firebaseInitialized } from "./firebaseAdmin";

export function createStorage(): IStorage {
  console.log("🔍 Firebase initialized:", firebaseInitialized);

  // Check for MongoDB URI first (new default)
  if (process.env.MONGODB_URI || process.env.DATABASE_URL) {
    try {
      const mongoStorage = new MongoStorage();
      console.log("📦 Using storage: MongoDB Atlas");
      return mongoStorage;
    } catch (error) {
      console.error("❌ MongoDB initialization failed, falling back:", error);
    }
  }

  // Fallback to PostgreSQL if available
  if (process.env.DATABASE_URL && !process.env.MONGODB_URI) {
    try {
      const dbStorage = new DbStorage();
      console.log("📦 Using storage: PostgreSQL");
      return dbStorage;
    } catch (error) {
      console.error("❌ PostgreSQL initialization failed, falling back:", error);
    }
  }

  // Final fallback to in-memory storage
  console.log("📦 Using storage: In-Memory");
  return new MemStorage();
}
 
export const storage: IStorage = createStorage();