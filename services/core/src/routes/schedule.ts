import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { emitRoomStatusChange } from "../lib/events";
import { ScheduleStatus, ScheduleType } from "../generated/prisma/enums";
import { requireAssistant } from "../middleware/auth";

// Import enum objects for validation
import { ScheduleStatus as ScheduleStatusEnum, ScheduleType as ScheduleTypeEnum } from "../generated/prisma/enums";

const scheduleSchema = z.object({
  classId: z.string().min(1),
  roomId: z.string().min(1),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  type: z.enum(["MAIN", "MAKEUP", "EXAM"]).optional(),
});

const updateScheduleSchema = z.object({
  roomId: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(["MAIN", "MAKEUP", "EXAM"]).optional(),
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

export const scheduleRouter = Router();

// GET /api/schedules - List all schedules (with optional filters)
scheduleRouter.get("/", async (req, res) => {
  const { classId, roomId, status, type } = req.query;
  console.log("[schedules] GET /api/schedules called", { classId, roomId, status, type });

  const whereClause: any = {};
  
  try {
    if (classId) {
      whereClause.classId = classId as string;
    }
    if (roomId) {
      whereClause.roomId = roomId as string;
    }
    if (status) {
      const statusStr = String(status).toUpperCase();
      if (statusStr === ScheduleStatusEnum.ACTIVE) {
        whereClause.status = ScheduleStatusEnum.ACTIVE;
      } else if (statusStr === ScheduleStatusEnum.CANCELLED) {
        whereClause.status = ScheduleStatusEnum.CANCELLED;
      } else {
        console.warn(`[schedules] Invalid status value: ${statusStr}`);
      }
    }
    if (type) {
      const typeStr = String(type).toUpperCase();
      if (typeStr === ScheduleTypeEnum.MAIN) {
        whereClause.type = ScheduleTypeEnum.MAIN;
      } else if (typeStr === ScheduleTypeEnum.MAKEUP) {
        whereClause.type = ScheduleTypeEnum.MAKEUP;
      } else if (typeStr === ScheduleTypeEnum.EXAM) {
        whereClause.type = ScheduleTypeEnum.EXAM;
      } else {
        console.warn(`[schedules] Invalid type value: ${typeStr}`);
      }
    }

    const schedules = await prisma.classSchedule.findMany({
      where: whereClause,
      include: {
        class: {
          include: {
            subject: {
              select: {
                id: true,
                name: true,
                credits: true,
              },
            },
            lecturer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        room: {
          select: {
            id: true,
            name: true,
            capacity: true,
            location: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    console.log(`[schedules] ✅ Found ${schedules.length} schedules`);
    res.json(schedules);
  } catch (error: any) {
    console.error("[schedules] ❌ Failed to fetch schedules:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ 
      error: "Failed to fetch schedules",
      details: error.message,
      code: error.code 
    });
  }
});

// GET /api/schedules/:id - Get schedule by ID
scheduleRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[schedules] GET /api/schedules/:id called", { id });

  try {
    const schedule = await prisma.classSchedule.findUnique({
      where: { id },
      include: {
        class: {
          include: {
            subject: true,
            lecturer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        room: true,
      },
    });

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    console.log(`[schedules] ✅ Found schedule: ${schedule.id}`);
    res.json(schedule);
  } catch (error: any) {
    console.error("[schedules] ❌ Failed to fetch schedule:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch schedule" });
  }
});

// POST /api/schedules - Create new schedule (Assistant only)
scheduleRouter.post("/", requireAssistant, async (req, res) => {
  console.log("[schedules] POST /api/schedules called", req.body);
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

    console.log(`[schedules] ✅ Created schedule: ${schedule.id}`);
    res.status(201).json(schedule);
  } catch (error: any) {
    console.error("[schedules] ❌ Failed to create schedule:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create schedule" });
  }
});

// PUT /api/schedules/:id - Update schedule (Assistant only)
scheduleRouter.put("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Schedule ID is required" });
  }
  console.log("[schedules] PUT /api/schedules/:id called", { id, body: req.body });

  const parseResult = updateScheduleSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[schedules] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updateData = parseResult.data;

  try {
    // Get current schedule
    const currentSchedule = await prisma.classSchedule.findUnique({
      where: { id: id as string },
    });

    if (!currentSchedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Validate dates if both are provided
    const startTime = updateData.startTime ? new Date(updateData.startTime) : currentSchedule.startTime;
    const endTime = updateData.endTime ? new Date(updateData.endTime) : currentSchedule.endTime;

    if (startTime >= endTime) {
      return res.status(400).json({ error: "endTime must be greater than startTime" });
    }

    // Check for overlapping schedules (only ACTIVE ones, excluding current)
    if (updateData.roomId || updateData.startTime || updateData.endTime) {
      const roomId = updateData.roomId || currentSchedule.roomId;
      const whereClause: any = {
        roomId,
        status: ScheduleStatusEnum.ACTIVE,
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      };
      
      // Exclude current schedule
      whereClause.NOT = { id: id as string };
      
      const overlapping = await prisma.classSchedule.findFirst({
        where: whereClause,
      });

      if (overlapping) {
        return res
          .status(409)
          .json({ error: "Room is already occupied in that time range" });
      }
    }

    // Verify room exists if updating roomId
    if (updateData.roomId) {
      const roomExists = await prisma.room.findUnique({ where: { id: updateData.roomId } });
      if (!roomExists) {
        return res.status(404).json({ error: "Room not found" });
      }
    }

    // Build update object
    const prismaUpdateData: {
      roomId?: string;
      startTime?: Date;
      endTime?: Date;
      type?: ScheduleType;
      status?: ScheduleStatus;
    } = {};
    
    if (updateData.roomId !== undefined) {
      prismaUpdateData.roomId = updateData.roomId;
    }
    if (updateData.startTime !== undefined) {
      prismaUpdateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime !== undefined) {
      prismaUpdateData.endTime = new Date(updateData.endTime);
    }
    if (updateData.type !== undefined) {
      prismaUpdateData.type = updateData.type as ScheduleType;
    }
    if (updateData.status !== undefined) {
      prismaUpdateData.status = updateData.status as ScheduleStatus;
    }

    const schedule = await prisma.classSchedule.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        class: {
          include: {
            subject: true,
            lecturer: {
              select: {
                id: true,
                fullName: true,
                email: true,
              },
            },
          },
        },
        room: true,
      },
    });

    console.log(`[schedules] ✅ Updated schedule: ${schedule.id}`);
    res.json(schedule);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Schedule not found" });
    }
    console.error("[schedules] ❌ Failed to update schedule:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update schedule" });
  }
});

// DELETE /api/schedules/:id - Delete schedule (Assistant only)
scheduleRouter.delete("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Schedule ID is required" });
  }
  console.log("[schedules] DELETE /api/schedules/:id called", { id });

  try {
    await prisma.classSchedule.delete({
      where: { id },
    });

    console.log(`[schedules] ✅ Deleted schedule: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Schedule not found" });
    }
    console.error("[schedules] ❌ Failed to delete schedule:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete schedule" });
  }
});
