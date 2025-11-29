import { Router } from "express";
import { z } from "zod";
import { db, admin } from "../lib/firebase";

const roomStatusEventSchema = z.object({
  roomId: z.string(),
  classId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(["occupied", "available"]),
});

export const eventsRouter = Router();

/**
 * POST /events/room-status
 * Called by Service A when a schedule is created/updated/deleted
 */
eventsRouter.post("/room-status", async (req, res) => {
  const parseResult = roomStatusEventSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { roomId, classId, startTime, endTime, status } = parseResult.data;

  try {
    // Update Firestore document: live_rooms/{roomId}
    const roomRef = db.collection("live_rooms").doc(roomId);
    
    await roomRef.set(
      {
        roomId,
        currentStatus: status,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        currentClassId: status === "occupied" ? classId : null,
        occupiedUntil: status === "occupied" ? new Date(endTime) : null,
      },
      { merge: true }
    );

    console.log(`[firestore] Updated room ${roomId} status to ${status}`);

    res.json({ success: true, roomId, status });
  } catch (error) {
    console.error("Failed to update Firestore", error);
    res.status(500).json({ error: "Failed to sync to Firestore" });
  }
});

