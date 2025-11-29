import { Router } from "express";
import { z } from "zod";
import { db, admin } from "../lib/firebase";

const notificationSchema = z.object({
  toUserId: z.string(),
  fromUserId: z.string().optional(),
  type: z.string().default("general"),
  title: z.string(),
  message: z.string(),
  related: z.record(z.string(), z.any()).optional(),
});

export const notificationsRouter = Router();

/**
 * POST /notifications
 * Create a notification for a student (called by Assistant Portal)
 */
notificationsRouter.post("/", async (req, res) => {
  const parseResult = notificationSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { toUserId, fromUserId, type, title, message, related } = parseResult.data;

  try {
    const notificationRef = db.collection("notifications").doc();
    
    await notificationRef.set({
      id: notificationRef.id,
      toUserId,
      fromUserId: fromUserId || "system",
      type,
      title,
      message,
      related: related || null,
      read: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(`[firestore] Created notification for user ${toUserId}`);

    res.status(201).json({
      id: notificationRef.id,
      toUserId,
      title,
      message,
    });
  } catch (error) {
    console.error("Failed to create notification", error);
    res.status(500).json({ error: "Failed to create notification" });
  }
});

/**
 * GET /notifications/:userId
 * Get notifications for a user (unread or all)
 */
notificationsRouter.get("/:userId", async (req, res) => {
  const { userId } = req.params;
  const { unread } = req.query;

  try {
    let query = db.collection("notifications").where("toUserId", "==", userId);

    if (unread === "true") {
      query = query.where("read", "==", false);
    }

    const snapshot = await query.orderBy("createdAt", "desc").get();
    const notifications = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(notifications);
  } catch (error) {
    console.error("Failed to fetch notifications", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

