import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import crypto from "crypto";

const router = Router();

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

// Generate random password (exported for use in auth routes)
export const generatePassword = (length = 8) => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// Middleware to check admin role (simplified - should use JWT in production)
const requireAdmin = async (req: any, res: any, next: any) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    console.error("[requireAdmin] Missing x-user-id header");
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      console.error(`[requireAdmin] User not found: ${userId}`);
      return res.status(403).json({ error: "Forbidden: User not found" });
    }
    
    if (user.role !== "ADMIN" && user.role !== "ASSISTANT") {
      console.error(`[requireAdmin] Insufficient permissions: User ${userId} has role ${user.role}, requires ADMIN or ASSISTANT`);
      return res.status(403).json({ 
        error: `Forbidden: Admin or Assistant access required. Current role: ${user.role}` 
      });
    }
    
    console.log(`[requireAdmin] ✅ Access granted for user ${userId} with role ${user.role}`);
    req.adminUser = user;
    next();
  } catch (error) {
    console.error("[requireAdmin] Error verifying admin access:", error);
    res.status(500).json({ error: "Failed to verify admin access" });
  }
};

// GET /api/users - List all users (with optional role filter)
router.get("/", async (req, res) => {
  const { role } = req.query;

  try {
    const users = await prisma.user.findMany({
      where: role ? { role: role as "ADMIN" | "ASSISTANT" | "LECTURER" | "STUDENT" } : {},
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        studentCode: true,
        cohort: true,
        major: true,
        department: true,
        specialty: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:identifier - Get user by ID/email/studentCode
router.get("/:identifier", async (req, res) => {
  const { identifier } = req.params;

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: identifier },
          { email: identifier },
          { studentCode: identifier },
        ],
      },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
        studentCode: true,
        cohort: true,
        major: true,
        department: true,
        specialty: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Failed to fetch user", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/users - Create user (Admin only)
const createUserSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  role: z.enum(["ADMIN", "ASSISTANT", "LECTURER", "STUDENT"]),
  studentCode: z.string().optional(),
  cohort: z.string().optional(),
  major: z.string().optional(),
  department: z.string().optional(),
  specialty: z.string().optional(),
  sendEmail: z.boolean().default(true), // Send credentials via email
});

router.post("/", requireAdmin, async (req, res) => {
  const parseResult = createUserSchema.safeParse(req.body);
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

    // Generate random password
    const password = generatePassword(12);
    const hashedPassword = hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        fullName: data.fullName,
        studentCode: data.studentCode || null,
        cohort: data.cohort || null,
        major: data.major || null,
        department: data.department || null,
        specialty: data.specialty || null,
      },
    });

    // TODO: Send email with credentials
    if (data.sendEmail) {
      console.log(`[EMAIL] Would send credentials to ${data.email}:`);
      console.log(`  Username: ${data.email}`);
      console.log(`  Password: ${password}`);
      // In production, use nodemailer or similar:
      // await sendEmail(data.email, "USTH Portal Credentials", {
      //   email: data.email,
      //   password: password,
      // });
    }

    const { password: _, ...userResponse } = user;
    res.status(201).json({
      message: "User created successfully",
      user: userResponse,
      credentials: data.sendEmail ? null : { email: data.email, password }, // Only return if not sending email
    });
  } catch (error) {
    console.error("Failed to create user", error);
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PATCH /api/users/:id/role - Update user role (Admin only)
const updateRoleSchema = z.object({
  role: z.enum(["ADMIN", "ASSISTANT", "LECTURER", "STUDENT"]),
});

router.patch("/:id/role", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const parseResult = updateRoleSchema.safeParse(req.body);
  
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { role: parseResult.data.role },
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      },
    });

    res.json({
      message: "User role updated successfully",
      user,
    });
  } catch (error) {
    console.error("Failed to update user role", error);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

export { router as usersRouter };
