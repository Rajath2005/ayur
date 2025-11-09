// server/middleware/verifyFirebaseToken.ts
import { admin } from "../firebaseAdmin";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (typeof authHeader !== 'string' || !authHeader?.startsWith("Bearer ")) {
    console.log("❌ Missing Bearer token");
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = decoded;
    return next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
