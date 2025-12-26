import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { Role } from "../generated/prisma/enums";

// Middleware to check Assistant role
export const requireAssistant = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.header("x-user-id");
  console.log("[requireAssistant] Checking assistant access...", { userId });

  if (!userId) {
    console.warn("[requireAssistant] ⚠️ Missing x-user-id header");
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn(`[requireAssistant] ⚠️ User not found: ${userId}`);
      return res.status(403).json({ error: "Forbidden: User not found" });
    }

    // Allow ADMIN and ASSISTANT roles
    if (user.role !== Role.ASSISTANT && user.role !== Role.ADMIN) {
      console.error(
        `[requireAssistant] Insufficient permissions: User ${userId} has role ${user.role}, requires ASSISTANT or ADMIN`
      );
      return res.status(403).json({
        error: `Forbidden: Assistant or Admin access required. Current role: ${user.role}`,
      });
    }

    console.log(
      `[requireAssistant] ✅ User authorized: ${user.email} (${user.role})`
    );
    req.user = user;
    next();
  } catch (error) {
    console.error("[requireAssistant] Error verifying assistant access:", error);
    res.status(500).json({ error: "Failed to verify assistant access" });
  }
};

// Middleware to check if user is authenticated (any role)
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.header("x-user-id");
  console.log("[requireAuth] Checking authentication...", { userId });

  if (!userId) {
    console.warn("[requireAuth] ⚠️ Missing x-user-id header");
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.warn(`[requireAuth] ⚠️ User not found: ${userId}`);
      return res.status(403).json({ error: "Forbidden: User not found" });
    }

    console.log(`[requireAuth] ✅ User authenticated: ${user.email} (${user.role})`);
    req.user = user;
    next();
  } catch (error) {
    console.error("[requireAuth] Error verifying authentication:", error);
    res.status(500).json({ error: "Failed to verify authentication" });
  }
};

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: Role;
        fullName: string;
      };
    }
  }
}














