import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
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
  role: z.enum(["ADMIN", "ASSISTANT", "LECTURER", "STUDENT"]).default("STUDENT"),
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

export { router as authRouter };

