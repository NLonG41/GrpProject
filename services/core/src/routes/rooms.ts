import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAssistant } from "../middleware/auth";
import { ScheduleStatus } from "../generated/prisma/enums";

const router = Router();

const createRoomSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  capacity: z.number().int().positive(),
  location: z.string().min(1),
  isMaintenance: z.boolean().optional().default(false),
});

const updateRoomSchema = z.object({
  name: z.string().min(1).optional(),
  capacity: z.number().int().positive().optional(),
  location: z.string().min(1).optional(),
  isMaintenance: z.boolean().optional(),
});

// GET /api/rooms - List all rooms
router.get("/", async (_req, res) => {
  console.log("[rooms] GET /api/rooms called");
  
  try {
    const rooms = await prisma.room.findMany({
      orderBy: {
        name: "asc",
      },
    });
    
    console.log(`[rooms] ✅ Found ${rooms.length} rooms`);
    res.json(rooms);
  } catch (error: any) {
    console.error("[rooms] ❌ Failed to fetch rooms:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

// GET /api/rooms/:id/availability - Check room availability for a time range (MUST be before /:id route)
router.get("/:id/availability", async (req, res) => {
  const { id } = req.params;
  const { startTime, endTime, excludeScheduleId, excludeClassId } = req.query;
  
  console.log("[rooms] GET /api/rooms/:id/availability called", { id, startTime, endTime, excludeScheduleId, excludeClassId });

  if (!startTime || !endTime) {
    return res.status(400).json({ error: "startTime and endTime query parameters are required" });
  }

  try {
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    // Parse và normalize dates để đảm bảo so sánh chính xác
    // Đảm bảo parse đúng timezone - dates từ frontend đã là ISO string với timezone
    const requestStartTime = new Date(startTime as string);
    const requestEndTime = new Date(endTime as string);
    
    // Validate dates
    if (isNaN(requestStartTime.getTime()) || isNaN(requestEndTime.getTime())) {
      return res.status(400).json({ error: "Invalid startTime or endTime format" });
    }
    
    if (requestStartTime >= requestEndTime) {
      return res.status(400).json({ error: "startTime must be less than endTime" });
    }
    
    console.log("[rooms] Checking availability:", {
      roomId: id,
      requestStartTime: requestStartTime.toISOString(),
      requestEndTime: requestEndTime.toISOString(),
      requestStartTimeLocal: requestStartTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      requestEndTimeLocal: requestEndTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      excludeScheduleId,
      excludeClassId,
    });

    // Check for overlapping schedules (only ACTIVE ones)
    // 
    // LOGIC XẾP LỊCH:
    // - Phòng học có thể được nhiều môn khác nhau sử dụng
    // - Chỉ block khi thời gian TRÙNG NHAU (overlap)
    // - Cho phép xếp lịch vào thời gian KHÁC trong cùng phòng
    // 
    // VÍ DỤ:
    // - Phòng A có lịch: 9h-11h (Môn A) → OK
    // - Muốn xếp: 12h-14h (Môn B) ở Phòng A → OK (không trùng thời gian)
    // - Muốn xếp: 10h-12h (Môn B) ở Phòng A → BLOCK (trùng thời gian với 9h-11h)
    // 
    // Logic overlap chính xác: 
    // Hai khoảng thời gian overlap khi: schedule.startTime < request.endTime AND schedule.endTime > request.startTime
    // Điều này đảm bảo chỉ block khi thực sự có overlap, không block khi chỉ chạm nhau
    // Chỉ lock khi trùng với class KHÁC (không lock nếu trùng với cùng class)
    const whereClause: any = {
      roomId: id, // Cùng phòng học
      status: ScheduleStatus.ACTIVE, // Chỉ check lịch đang hoạt động
      // Schedule bắt đầu trước khi request kết thúc (strict <)
      startTime: { lt: requestEndTime },
      // Schedule kết thúc sau khi request bắt đầu (strict >)
      endTime: { gt: requestStartTime },
    };

    // Exclude cùng schedule nếu đang update
    if (excludeScheduleId) {
      whereClause.NOT = { id: excludeScheduleId as string };
    }

    // Exclude cùng class - không block nếu trùng với cùng class
    if (excludeClassId) {
      if (whereClause.NOT) {
        // Nếu đã có NOT, thêm classId vào cùng object NOT (AND condition)
        whereClause.NOT = {
          ...whereClause.NOT,
          classId: excludeClassId as string,
        };
      } else {
        whereClause.NOT = { classId: excludeClassId as string };
      }
    }

    console.log("[rooms] Query whereClause:", JSON.stringify(whereClause, null, 2));

    // Debug: Lấy tất cả schedules trong phòng để xem
    const allSchedules = await prisma.classSchedule.findMany({
      where: {
        roomId: id,
        status: ScheduleStatus.ACTIVE,
      },
      include: {
        class: {
          include: {
            subject: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
    
    console.log("[rooms] All active schedules in room:", allSchedules.map(s => ({
      id: s.id,
      className: s.class?.name,
      startTime: s.startTime.toISOString(),
      endTime: s.endTime.toISOString(),
      startTimeLocal: s.startTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      endTimeLocal: s.endTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      classId: s.classId,
    })));

    const overlapping = await prisma.classSchedule.findFirst({
      where: whereClause,
      include: {
        class: {
          include: {
            subject: true,
          },
        },
      },
    });

    if (overlapping) {
      // Verify overlap manually để đảm bảo logic đúng
      const scheduleStart = new Date(overlapping.startTime);
      const scheduleEnd = new Date(overlapping.endTime);
      const hasOverlap = scheduleStart < requestEndTime && scheduleEnd > requestStartTime;
      
      console.log("[rooms] Found overlapping schedule:", {
        scheduleId: overlapping.id,
        scheduleStartTime: scheduleStart.toISOString(),
        scheduleEndTime: scheduleEnd.toISOString(),
        scheduleStartTimeLocal: scheduleStart.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        scheduleEndTimeLocal: scheduleEnd.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        className: overlapping.class?.name,
        classId: overlapping.classId,
        requestStartTime: requestStartTime.toISOString(),
        requestEndTime: requestEndTime.toISOString(),
        requestStartTimeLocal: requestStartTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        requestEndTimeLocal: requestEndTime.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        hasOverlap: hasOverlap,
        overlapCheck: {
          condition1: `${scheduleStart.toISOString()} < ${requestEndTime.toISOString()} = ${scheduleStart < requestEndTime}`,
          condition2: `${scheduleEnd.toISOString()} > ${requestStartTime.toISOString()} = ${scheduleEnd > requestStartTime}`,
        },
      });
    } else {
      console.log("[rooms] No overlapping schedule found - room is available");
    }

    const isAvailable = !overlapping;
    
    res.json({
      roomId: id,
      roomName: room.name,
      isAvailable,
      isLocked: !isAvailable,
      conflictingSchedule: overlapping ? {
        id: overlapping.id,
        className: overlapping.class?.name,
        subjectName: overlapping.class?.subject?.name,
        startTime: overlapping.startTime,
        endTime: overlapping.endTime,
      } : null,
    });
  } catch (error: any) {
    console.error("[rooms] ❌ Failed to check room availability:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to check room availability" });
  }
});

// GET /api/rooms/:id - Get room by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[rooms] GET /api/rooms/:id called", { id });

  try {
    const room = await prisma.room.findUnique({
      where: { id },
    });

    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    console.log(`[rooms] ✅ Found room: ${room.id}`);
    res.json(room);
  } catch (error: any) {
    console.error("[rooms] ❌ Failed to fetch room:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

// POST /api/rooms - Create new room (Assistant only)
router.post("/", requireAssistant, async (req, res) => {
  console.log("[rooms] POST /api/rooms called", req.body);
  
  const parseResult = createRoomSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[rooms] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const data = parseResult.data;

  try {
    // Check if room name already exists
    const existingByName = await prisma.room.findUnique({
      where: { name: data.name },
    });
    if (existingByName) {
      return res.status(409).json({ error: "Room with this name already exists" });
    }

    // Check if room ID already exists
    const existingById = await prisma.room.findUnique({
      where: { id: data.id },
    });
    if (existingById) {
      return res.status(409).json({ error: "Room with this ID already exists" });
    }

    const room = await prisma.room.create({
      data: {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        location: data.location,
        isMaintenance: data.isMaintenance ?? false,
      },
    });

    console.log(`[rooms] ✅ Created room: ${room.id} - ${room.name}`);
    res.status(201).json(room);
  } catch (error: any) {
    console.error("[rooms] ❌ Failed to create room:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create room" });
  }
});

// PUT /api/rooms/:id - Update room (Assistant only)
router.put("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Room ID is required" });
  }
  console.log("[rooms] PUT /api/rooms/:id called", { id, body: req.body });

  const parseResult = updateRoomSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[rooms] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updateData = parseResult.data;

  try {
    // Check if name is being updated and conflicts with another room
    if (updateData.name) {
      const existingByName = await prisma.room.findFirst({
        where: {
          name: updateData.name,
          NOT: { id },
        },
      });
      if (existingByName) {
        return res.status(409).json({ error: "Room with this name already exists" });
      }
    }

    // Build update object, only including fields that are defined (not undefined)
    const prismaUpdateData: {
      name?: string;
      capacity?: number;
      location?: string;
      isMaintenance?: boolean;
    } = {};
    
    if (updateData.name !== undefined) {
      prismaUpdateData.name = updateData.name;
    }
    if (updateData.capacity !== undefined) {
      prismaUpdateData.capacity = updateData.capacity;
    }
    if (updateData.location !== undefined) {
      prismaUpdateData.location = updateData.location;
    }
    if (updateData.isMaintenance !== undefined) {
      prismaUpdateData.isMaintenance = updateData.isMaintenance;
    }

    const room = await prisma.room.update({
      where: { id: id as string },
      data: prismaUpdateData,
    });

    console.log(`[rooms] ✅ Updated room: ${room.id}`);
    res.json(room);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }
    console.error("[rooms] ❌ Failed to update room:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update room" });
  }
});

// DELETE /api/rooms/:id - Delete room (Assistant only)
router.delete("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Room ID is required" });
  }
  console.log("[rooms] DELETE /api/rooms/:id called", { id });

  try {
    // Check if room has schedules
    const schedules = await prisma.classSchedule.count({
      where: { roomId: id as string },
    });

    if (schedules > 0) {
      return res.status(409).json({ 
        error: `Cannot delete room with ${schedules} schedule(s). Please remove schedules first.` 
      });
    }

    await prisma.room.delete({
      where: { id: id as string },
    });

    console.log(`[rooms] ✅ Deleted room: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Room not found" });
    }
    console.error("[rooms] ❌ Failed to delete room:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete room" });
  }
});

export { router as roomsRouter };

