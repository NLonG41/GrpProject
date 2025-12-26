import { Request, Response, NextFunction } from "express";
import { admin } from "../lib/firebase";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/enums";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: Role;
    fullName: string;
  };
}

/**
 * Middleware to verify Firebase ID token and attach user to request
 */
export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Missing or invalid token" });
  }

  const idToken = authHeader.split("Bearer ")[1];

  if (!idToken) {
    return res.status(401).json({ error: "Unauthorized: Missing token" });
  }

  try {
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const firebaseUid = decodedToken.uid;
    const email = decodedToken.email;

    if (!email) {
      return res.status(401).json({ error: "Unauthorized: Email not found in token" });
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      },
    });

    if (!user) {
      return res.status(403).json({ error: "Forbidden: User not found in database" });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("[firebase-auth] Token verification failed:", error);
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
}

