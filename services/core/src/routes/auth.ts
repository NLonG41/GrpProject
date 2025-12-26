import { Router } from "express";
import { Role } from "../generated/prisma/enums";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { admin } from "../lib/firebase";
import crypto from "crypto";

const router = Router();

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

const verifyPassword = (password: string, hashed: string) => {
  return hashPassword(password) === hashed;
};

const registerSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(Role).default(Role.STUDENT),
  studentCode: z.string().optional(),
  cohort: z.string().optional(),
  major: z.string().optional(),
  department: z.string().optional(),
  specialty: z.string().optional(),
});

router.post("/register", async (req, res) => {
  const parseResult = registerSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const data = parseResult.data;

    if (data.role === "STUDENT" && !data.studentCode) {
      return res.status(400).json({ error: "studentCode is required for Student role" });
    }

    try {
      const exists = await prisma.user.findFirst({
        where: {
          OR: [
            { email: data.email },
            ...(data.studentCode ? [{ studentCode: data.studentCode }] : []),
          ],
        },
      });

      if (exists) {
        return res.status(409).json({ error: "Email or studentCode already exists" });
      }

      // Create user in Firebase Auth (if Firebase is configured)
      let firebaseUid: string | null = null;
      if (admin.apps.length > 0) {
        try {
          const firebaseUser = await admin.auth().createUser({
            email: data.email,
            password: data.password,
            displayName: data.fullName,
          });
          firebaseUid = firebaseUser.uid;
        } catch (firebaseError: any) {
          // If Firebase user already exists, continue with database creation
          if (firebaseError.code !== "auth/email-already-exists") {
            console.warn("[firebase] Failed to create Firebase user:", firebaseError);
          }
        }
      }

      // Create user in database
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashPassword(data.password),
          role: data.role,
          fullName: data.fullName,
          studentCode: data.studentCode || null,
          cohort: data.cohort || null,
          major: data.major || null,
          department: data.department || null,
          specialty: data.specialty || null,
        },
      });

    const { password: _, ...userResponse } = user;
    res.status(201).json({
      message: "Registration successful",
      user: userResponse,
    });
  } catch (error) {
    console.error("Registration error", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/login", async (req, res) => {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { email, password } = parseResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password || !verifyPassword(password, user.password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const { password: _, ...userResponse } = user;
    res.json({
      user: userResponse,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// POST /api/auth/forgot-password - Reset password and send via email
const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

router.post("/forgot-password", async (req, res) => {
  const parseResult = forgotPasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { email } = parseResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if user exists or not (security best practice)
      return res.json({
        message: "If the email exists, a new password has been sent.",
      });
    }

    // Generate new password
    const newPassword = generatePassword(12);
    const hashedPassword = hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // TODO: Send email with new password
    console.log(`[EMAIL] Would send new password to ${email}:`);
    console.log(`  New Password: ${newPassword}`);
    // In production, use nodemailer or similar:
    // await sendEmail(email, "USTH Portal - Password Reset", {
    //   email: email,
    //   password: newPassword,
    // });

    res.json({
      message: "If the email exists, a new password has been sent.",
    });
  } catch (error) {
    console.error("Failed to reset password", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// POST /api/auth/change-password - Change password (requires current password)
const changePasswordSchema = z.object({
  userId: z.string(),
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

router.post("/change-password", async (req, res) => {
  const parseResult = changePasswordSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { userId, currentPassword, newPassword } = parseResult.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password || !verifyPassword(currentPassword, user.password)) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedNewPassword = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });

    res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Failed to change password", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Import generatePassword from users route
import { generatePassword } from "./users";

/**
 * POST /api/auth/firebase-login
 * Login with Firebase ID token
 */
router.post("/firebase-login", async (req, res) => {
  console.log("[auth] POST /api/auth/firebase-login called");
  const { idToken } = req.body;

  if (!idToken) {
    console.error("[auth] ❌ Missing idToken in request body");
    return res.status(400).json({ error: "idToken is required" });
  }

  console.log("[auth] Step 1: Checking Firebase Admin SDK...");
  // Ensure Firebase Admin SDK is initialized
  if (!admin.apps.length) {
    console.error("[auth] ❌ Firebase Admin SDK not initialized");
    return res.status(503).json({ error: "Firebase Admin SDK not initialized" });
  }
  console.log("[auth] ✅ Firebase Admin SDK is initialized");

  try {
    console.log("[auth] Step 2: Verifying Firebase ID token...", {
      tokenLength: idToken.length,
      tokenPreview: idToken.substring(0, 50) + "..."
    });
    
    // Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    console.log("[auth] ✅ Token verified successfully", {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified
    });
    
    const email = decodedToken.email;

    if (!email) {
      console.error("[auth] ❌ Email not found in decoded token");
      return res.status(401).json({ error: "Email not found in token" });
    }

    console.log("[auth] Step 3: Looking up user in database...", { email });
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("[auth] ❌ User not found in database", { email });
      return res.status(404).json({ error: "User not found. Please register first." });
    }

    console.log("[auth] ✅ User found in database", {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName
    });

    const { password: _, ...userResponse } = user;
    console.log("[auth] ✅ Login successful, sending response");
    res.json({
      user: userResponse,
      message: "Login successful",
    });
  } catch (error: any) {
    console.error("[auth] ❌ Firebase login error:", {
      code: error.code,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    // More detailed error messages
    if (error.code === 'auth/argument-error') {
      return res.status(400).json({ error: "Invalid token format" });
    }
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: "Token expired. Please login again." });
    }
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({ error: "Token revoked. Please login again." });
    }
    if (error.code === 'auth/invalid-id-token') {
      return res.status(401).json({ error: "Invalid token. Please check Firebase configuration." });
    }
    
    res.status(401).json({ 
      error: "Invalid token", 
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
});

export { router as authRouter };

