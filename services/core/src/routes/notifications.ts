import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAssistant, requireAuth } from "../middleware/auth";

const router = Router();

const createNotificationSchema = z.object({
  toUserId: z.string().min(1),
  fromUserId: z.string().min(1),
  type: z.string().min(1),
  title: z.string().min(1),
  message: z.string().min(1),
});

const updateNotificationSchema = z.object({
  read: z.boolean().optional(),
});

// GET /api/notifications - List all notifications (with optional filters) - Authenticated users
router.get("/", requireAuth, async (req, res) => {
  const { toUserId, fromUserId, read, type } = req.query;
  console.log("[notifications] GET /api/notifications called", { toUserId, fromUserId, read, type });

  try {
    const notifications = await prisma.notification.findMany({
      where: {
        ...(toUserId && { toUserId: toUserId as string }),
        ...(fromUserId && { fromUserId: fromUserId as string }),
        ...(read !== undefined && { read: read === "true" }),
        ...(type && { type: type as string }),
      },
      include: {
        toUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[notifications] ✅ Found ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error: any) {
    console.error("[notifications] ❌ Failed to fetch notifications:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// GET /api/notifications/:id - Get notification by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[notifications] GET /api/notifications/:id called", { id });

  try {
    const notification = await prisma.notification.findUnique({
      where: { id },
      include: {
        toUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    console.log(`[notifications] ✅ Found notification: ${notification.id}`);
    res.json(notification);
  } catch (error: any) {
    console.error("[notifications] ❌ Failed to fetch notification:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch notification" });
  }
});

// POST /api/notifications - Create new notification (Assistant only)
router.post("/", requireAssistant, async (req, res) => {
  console.log("[notifications] POST /api/notifications called", req.body);
  
  const parseResult = createNotificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[notifications] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { toUserId, fromUserId, type, title, message } = parseResult.data;

  try {
    // Verify users exist
    const toUser = await prisma.user.findUnique({
      where: { id: toUserId },
    });
    if (!toUser) {
      return res.status(404).json({ error: "Recipient user not found" });
    }

    const fromUser = await prisma.user.findUnique({
      where: { id: fromUserId },
    });
    if (!fromUser) {
      return res.status(404).json({ error: "Sender user not found" });
    }

    const notification = await prisma.notification.create({
      data: {
        toUserId,
        fromUserId,
        type,
        title,
        message,
        read: false,
      },
      include: {
        toUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`[notifications] ✅ Created notification: ${notification.id}`);
    res.status(201).json(notification);
  } catch (error: any) {
    console.error("[notifications] ❌ Failed to create notification:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create notification" });
  }
});

// PUT /api/notifications/:id - Update notification (mark as read/unread)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[notifications] PUT /api/notifications/:id called", { id, body: req.body });

  const parseResult = updateNotificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[notifications] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { read } = parseResult.data;

  try {
    const prismaUpdateData: { read?: boolean } = {};
    
    if (read !== undefined) {
      prismaUpdateData.read = read;
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        toUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
        fromUser: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    console.log(`[notifications] ✅ Updated notification: ${notification.id}`);
    res.json(notification);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Notification not found" });
    }
    console.error("[notifications] ❌ Failed to update notification:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update notification" });
  }
});

// DELETE /api/notifications/:id - Delete notification
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[notifications] DELETE /api/notifications/:id called", { id });

  try {
    await prisma.notification.delete({
      where: { id },
    });

    console.log(`[notifications] ✅ Deleted notification: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Notification not found" });
    }
    console.error("[notifications] ❌ Failed to delete notification:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

export { router as notificationsRouter };

