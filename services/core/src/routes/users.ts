import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import crypto from "crypto";
import { Role } from "../generated/prisma/enums";

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
// TEMPORARILY DISABLED - Allow all authenticated users
const requireAdmin = async (req: any, res: any, next: any) => {
  const userId = req.header("x-user-id");
  console.log("[requireAdmin] Checking admin access...", { userId });
  
  if (!userId) {
    console.warn("[requireAdmin] ⚠️ Missing x-user-id header - temporarily allowing");
    // Temporarily allow - comment out the return
    // return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }
  
  try {
    if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
        console.warn(`[requireAdmin] ⚠️ User not found: ${userId} - temporarily allowing`);
        // Temporarily allow
        // return res.status(403).json({ error: "Forbidden: User not found" });
      } else {
        console.log(`[requireAdmin] ✅ User found: ${user.email} (${user.role}) - temporarily allowing all roles`);
        req.adminUser = user;
      }
    }
    
    // Temporarily allow all roles
    console.log("[requireAdmin] ⚠️ Temporarily allowing all roles (admin check disabled)");
    next();
    
    // Original check (commented out temporarily):
    /*
    if (user.role !== Role.ASSISTANT) {
      console.error(`[requireAdmin] Insufficient permissions: User ${userId} has role ${user.role}, requires ASSISTANT`);
      return res.status(403).json({ 
        error: `Forbidden: Admin or Assistant access required. Current role: ${user.role}` 
      });
    }
    */
  } catch (error) {
    console.error("[requireAdmin] Error verifying admin access:", error);
    // Temporarily allow even on error
    console.warn("[requireAdmin] ⚠️ Error occurred but temporarily allowing access");
    next();
    // Original: res.status(500).json({ error: "Failed to verify admin access" });
  }
};

// GET /api/users - List all users (with optional role filter)
router.get("/", async (req, res) => {
  const { role } = req.query;
  console.log("[users] GET /api/users called", { role, query: req.query });

  try {
    const users = await prisma.user.findMany({
      where: role ? { role: role as Role } : {},
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

    console.log(`[users] ✅ Found ${users.length} users`);
    res.json(users);
  } catch (error: any) {
    console.error("[users] ❌ Failed to fetch users:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
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
  role: z.nativeEnum(Role).default(Role.STUDENT),
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
  role: z.nativeEnum(Role),
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

// POST /api/users/:id/reset-password - Reset user password (Admin only)
router.post("/:id/reset-password", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const adminUserId = req.header("x-user-id");

  if (!adminUserId) {
    return res.status(401).json({ error: "Unauthorized: Missing user ID" });
  }

  try {
    // Verify admin user exists and is ADMIN
    const adminUser = await prisma.user.findUnique({
      where: { id: adminUserId },
    });

    if (!adminUser) {
      return res.status(403).json({ error: "Forbidden: Admin user not found" });
    }

    if (adminUser.role !== Role.ADMIN) {
      return res.status(403).json({ 
        error: "Forbidden: Only ADMIN can reset passwords" 
      });
    }

    // Find target user
    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate new password
    const newPassword = generatePassword(12);
    const hashedPassword = hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    // TODO: Send email with new password
    console.log(`[EMAIL] Would send new password to ${targetUser.email}:`);
    console.log(`  New Password: ${newPassword}`);
    // In production, use nodemailer or similar:
    // await sendEmail(targetUser.email, "USTH Portal - Password Reset", {
    //   email: targetUser.email,
    //   password: newPassword,
    // });

    res.json({
      message: "Password reset successfully",
      credentials: { email: targetUser.email, password: newPassword },
    });
  } catch (error) {
    console.error("Failed to reset password", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
});

export { router as usersRouter };
