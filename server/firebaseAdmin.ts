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
  // Prefer the single JSON env var (legacy in this repo)
  if (serviceAccountEnv) {
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

      console.log("✅ Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT");
    } catch (error) {
      console.error("❌ Failed to parse FIREBASE_SERVICE_ACCOUNT:", error);
    }
  } else if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    // Support separate env vars (suitable for Render dashboard secrets)
    try {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");
      const cert = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey,
      } as any;

      admin.initializeApp({
        credential: admin.credential.cert(cert),
      });

      console.log("✅ Firebase Admin initialized from FIREBASE_PROJECT_ID/FIREBASE_CLIENT_EMAIL/FIREBASE_PRIVATE_KEY");
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Admin from separate env vars:", error);
    }
  } else {
    console.warn("❌ Firebase Admin not initialized. Provide FIREBASE_SERVICE_ACCOUNT JSON or FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY env vars.");
  }
}

export { admin };
