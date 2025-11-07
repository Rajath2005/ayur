import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import { existsSync } from "fs";

const envPaths = [
  path.resolve(process.cwd(), "server/.env"),
  path.resolve(process.cwd(), ".env"),
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false });
  }
}

const serviceAccountEnv = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!admin.apps.length) {
  if (!serviceAccountEnv) {
    console.warn("❌ FIREBASE_SERVICE_ACCOUNT environment variable is missing. Firebase Admin not initialized.");
  } else {
    try {
      const serviceAccount = JSON.parse(serviceAccountEnv);

      if (
        serviceAccount &&
        typeof serviceAccount === "object" &&
        "private_key" in serviceAccount &&
        typeof serviceAccount.private_key === "string"
      ) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("✅ Firebase Admin initialized");
    } catch (error) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
    }
  }
}

export { admin };
