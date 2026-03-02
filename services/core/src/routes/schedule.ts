import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { emitRoomStatusChange } from "../lib/events";
import { ScheduleStatus, ScheduleType } from "../generated/prisma/enums";
import { requireAssistant } from "../middleware/auth";

// Import enum objects for validation
import {
  ScheduleStatus as ScheduleStatusEnum,
  ScheduleType as ScheduleTypeEnum,
} from "../generated/prisma/enums";

const scheduleSchema = z
  .object({
    classId: z.string().min(1),
    roomId: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    type: z.enum(["MAIN", "MAKEUP", "EXAM"]).optional(),
    category: z.enum(["STUDY", "EXAM"]).optional(),
    repeatType: z.enum(["NONE", "DAILY", "WEEKLY", "MONTHLY", "WEEKLY_DAYS"]).optional(),
    repeatEndDate: z.string().datetime().optional(),
    numberOfSessions: z.number().int().positive().optional(),
    repeatDaysOfWeek: z.array(z.number().int().min(0).max(6)).optional(), // 0=CN ... 6=T7
    startTimeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
    endTimeOfDay: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  })
  .superRefine((data, ctx) => {
    const repeatType = data.repeatType ?? "NONE";

    if (repeatType !== "NONE") {
      if (!data.startTimeOfDay || !data.endTimeOfDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "startTimeOfDay and endTimeOfDay are required when repeatType is not NONE",
          path: ["startTimeOfDay"],
        });
      }

      if (repeatType === "WEEKLY_DAYS" && (!data.repeatDaysOfWeek || data.repeatDaysOfWeek.length === 0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "repeatDaysOfWeek is required when repeatType is WEEKLY_DAYS",
          path: ["repeatDaysOfWeek"],
        });
      }
    }
  });

const updateScheduleSchema = z.object({
  roomId: z.string().min(1).optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional(),
  type: z.enum(["MAIN", "MAKEUP", "EXAM"]).optional(),
  category: z.enum(["STUDY", "EXAM"]).optional(),
  status: z.enum(["ACTIVE", "CANCELLED"]).optional(),
});

export const scheduleRouter = Router();

// GET /api/schedules - List all schedules (with optional filters)
scheduleRouter.get("/", async (req, res) => {
  const { classId, roomId, status, type, category } = req.query;
  console.log("[schedules] GET /api/schedules called", { classId, roomId, status, type, category });

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
    if (category) {
      const categoryStr = String(category).toUpperCase();
      if (categoryStr === "STUDY" || categoryStr === "EXAM") {
        whereClause.category = categoryStr;
      } else {
        console.warn(`[schedules] Invalid category value: ${categoryStr}`);
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

  const {
    classId,
    roomId,
    startTime,
    endTime,
    type,
    category,
    repeatType = "NONE",
    repeatEndDate,
    numberOfSessions,
    repeatDaysOfWeek,
    startTimeOfDay,
    endTimeOfDay,
  } = parseResult.data;

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

    const toMinutes = (value: string) => {
      const [hRaw, mRaw] = value.split(":");
      const h = Number(hRaw ?? 0);
      const m = Number(mRaw ?? 0);
      return h * 60 + m;
    };

    const vnOffsetMs = 7 * 60 * 60 * 1000;
    const dayMs = 24 * 60 * 60 * 1000;
    const sessionCandidates: { start: Date; end: Date }[] = [];

    if (repeatType === "NONE") {
      sessionCandidates.push({
        start: new Date(startTime),
        end: new Date(endTime),
      });
    } else {
      if (!startTimeOfDay || !endTimeOfDay) {
        return res.status(400).json({ error: "startTimeOfDay and endTimeOfDay are required for recurring schedules" });
      }

      const startMinutes = toMinutes(startTimeOfDay);
      const endMinutes = toMinutes(endTimeOfDay);
      if (startMinutes >= endMinutes) {
        return res.status(400).json({ error: "endTimeOfDay must be greater than startTimeOfDay" });
      }

      const seriesStartUtc = new Date(startTime);
      const fallbackSeriesEndUtc = new Date(endTime);
      const seriesEndUtc = repeatEndDate ? new Date(repeatEndDate) : fallbackSeriesEndUtc;
      if (seriesStartUtc > seriesEndUtc) {
        return res.status(400).json({ error: "repeatEndDate must be greater than or equal to startTime" });
      }

      const selectedDays =
        repeatType === "WEEKLY_DAYS"
          ? new Set(repeatDaysOfWeek ?? [])
          : undefined;

      const cursorVn = new Date(seriesStartUtc.getTime() + vnOffsetMs);
      cursorVn.setUTCHours(0, 0, 0, 0);

      const endVn = new Date(seriesEndUtc.getTime() + vnOffsetMs);
      endVn.setUTCHours(0, 0, 0, 0);

      while (cursorVn.getTime() <= endVn.getTime()) {
        if (numberOfSessions && sessionCandidates.length >= numberOfSessions) break;

        const vnDayOfWeek = cursorVn.getUTCDay();
        const shouldCreate =
          repeatType === "DAILY"
            ? true
            : repeatType === "WEEKLY"
              ? vnDayOfWeek === new Date(seriesStartUtc.getTime() + vnOffsetMs).getUTCDay()
              : repeatType === "MONTHLY"
                ? cursorVn.getUTCDate() === new Date(seriesStartUtc.getTime() + vnOffsetMs).getUTCDate()
                : selectedDays?.has(vnDayOfWeek) ?? false;

        if (shouldCreate) {
          const year = cursorVn.getUTCFullYear();
          const month = cursorVn.getUTCMonth();
          const day = cursorVn.getUTCDate();

          const [startHour, startMinute] = startTimeOfDay.split(":").map(Number);
          const [endHour, endMinute] = endTimeOfDay.split(":").map(Number);

          const sessionStartUtc = new Date(Date.UTC(year, month, day, startHour, startMinute) - vnOffsetMs);
          const sessionEndUtc = new Date(Date.UTC(year, month, day, endHour, endMinute) - vnOffsetMs);

          if (sessionStartUtc < seriesStartUtc) {
            cursorVn.setTime(cursorVn.getTime() + dayMs);
            continue;
          }
          if (sessionStartUtc > seriesEndUtc) break;

          sessionCandidates.push({ start: sessionStartUtc, end: sessionEndUtc });
        }

        cursorVn.setTime(cursorVn.getTime() + dayMs);
      }
    }

    if (sessionCandidates.length === 0) {
      return res.status(400).json({ error: "No schedule sessions generated from repeat settings" });
    }

    // Validate overlap before creating anything
    for (const candidate of sessionCandidates) {
      const overlapping = await prisma.classSchedule.findFirst({
        where: {
          roomId,
          status: "ACTIVE",
          startTime: { lt: candidate.end },
          endTime: { gt: candidate.start },
        },
      });

      if (overlapping) {
        return res.status(409).json({
          error: "Room is already occupied in one or more generated time ranges",
          conflict: {
            scheduleId: overlapping.id,
            startTime: overlapping.startTime,
            endTime: overlapping.endTime,
          },
        });
      }
    }

    const createdSchedules = await prisma.$transaction(
      sessionCandidates.map((candidate) =>
        prisma.classSchedule.create({
          data: {
            classId,
            roomId,
            startTime: candidate.start,
            endTime: candidate.end,
            type: type ?? "MAIN",
            category: category ?? (type === "EXAM" ? "EXAM" : "STUDY"),
          },
        })
      )
    );

    for (const schedule of createdSchedules) {
      await emitRoomStatusChange({
        roomId,
        classId,
        startTime: schedule.startTime.toISOString(),
        endTime: schedule.endTime.toISOString(),
        status: "occupied",
      });
    }

    if (createdSchedules.length === 1) {
      const firstSchedule = createdSchedules[0];
      if (!firstSchedule) {
        return res.status(500).json({ error: "Failed to create schedule" });
      }
      console.log(`[schedules] ✅ Created schedule: ${firstSchedule.id}`);
      return res.status(201).json(firstSchedule);
    }

    console.log(`[schedules] ✅ Created ${createdSchedules.length} recurring schedules`);
    return res.status(201).json({
      message: `Created ${createdSchedules.length} schedules`,
      schedules: createdSchedules,
    });
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
      category?: "STUDY" | "EXAM";
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
    if (updateData.category !== undefined) {
      prismaUpdateData.category = updateData.category;
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
    });    console.log(`[schedules] ✅ Updated schedule: ${schedule.id}`);
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
});// DELETE /api/schedules/:id - Delete schedule (Assistant only)
scheduleRouter.delete("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Schedule ID is required" });
  }
  console.log("[schedules] DELETE /api/schedules/:id called", { id });  try {
    await prisma.classSchedule.delete({
      where: { id },
    });    console.log(`[schedules] ✅ Deleted schedule: ${id}`);
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