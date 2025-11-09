// server/middleware/verifyFirebaseToken.ts
import { admin } from "../firebaseAdmin";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: admin.auth.DecodedIdToken;
}

export async function verifyFirebaseToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization as string | undefined;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Missing or invalid auth header" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error("Token validation failed:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
