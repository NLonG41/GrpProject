import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { emitRoomStatusChange } from "../lib/events";

const scheduleSchema = z.object({
  classId: z.string().min(1),
  roomId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum(["MAIN", "MAKEUP", "EXAM"]).optional(),
});

export const scheduleRouter = Router();

scheduleRouter.post("/", async (req, res) => {
  const parseResult = scheduleSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { classId, roomId, startTime, endTime, type } = parseResult.data;

  if (new Date(startTime) >= new Date(endTime)) {
    return res
      .status(400)
      .json({ error: "endTime must be greater than startTime" });
  }

  try {
    const classExists = await prisma.class.findUnique({ where: { id: classId } });
    if (!classExists) {
      return res.status(404).json({ error: "Class not found" });
    }

    const roomExists = await prisma.room.findUnique({ where: { id: roomId } });
    if (!roomExists) {
      return res.status(404).json({ error: "Room not found" });
    }

    const overlapping = await prisma.classSchedule.findFirst({
      where: {
        roomId,
        status: "ACTIVE",
        startTime: { lt: new Date(endTime) },
        endTime: { gt: new Date(startTime) },
      },
    });

    if (overlapping) {
      return res
        .status(409)
        .json({ error: "Room is already occupied in that time range" });
    }

    const schedule = await prisma.classSchedule.create({
      data: {
        classId,
        roomId,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        type: type ?? "MAIN",
      },
    });

    // Emit event to Service B (realtime service) for Firestore sync
    await emitRoomStatusChange({
      roomId,
      classId,
      startTime,
      endTime,
      status: "occupied",
    });

    res.status(201).json(schedule);
  } catch (error) {
    console.error("Failed to create schedule", error);
    res.status(500).json({ error: "Unable to create schedule" });
  }
});

