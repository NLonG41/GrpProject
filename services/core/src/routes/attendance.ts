// NOTE: Attendance routes are NOT part of Assistant use case
// These routes are for Lecturer role (managing student attendance)
// Keeping them for future implementation but not required for Assistant portal

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { AttendanceStatus } from "../generated/prisma/enums";

const router = Router();

const createAttendanceSchema = z.object({
  enrollmentId: z.string().min(1),
  scheduleId: z.string().min(1),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]),
  verifiedBy: z.string().optional(),
});

const updateAttendanceSchema = z.object({
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"]).optional(),
  verifiedBy: z.string().optional().nullable(),
});

// GET /api/attendance - List all attendance records (with optional filters)
router.get("/", async (req, res) => {
  const { enrollmentId, scheduleId, status, verifiedBy } = req.query;
  console.log("[attendance] GET /api/attendance called", { enrollmentId, scheduleId, status, verifiedBy });

  try {
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        ...(enrollmentId && { enrollmentId: enrollmentId as string }),
        ...(scheduleId && { scheduleId: scheduleId as string }),
        ...(status && { status: status as AttendanceStatus }),
        ...(verifiedBy && { verifiedBy: verifiedBy as string }),
      },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                email: true,
              },
            },
            class: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        schedule: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
        verifier: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    console.log(`[attendance] ✅ Found ${attendanceRecords.length} attendance records`);
    res.json(attendanceRecords);
  } catch (error: any) {
    console.error("[attendance] ❌ Failed to fetch attendance records:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch attendance records" });
  }
});

// GET /api/attendance/:id - Get attendance record by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[attendance] GET /api/attendance/:id called", { id });

  try {
    const attendance = await prisma.attendance.findUnique({
      where: { id },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                email: true,
              },
            },
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
          },
        },
        schedule: {
          include: {
            class: true,
            room: true,
          },
        },
        verifier: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!attendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    console.log(`[attendance] ✅ Found attendance record: ${attendance.id}`);
    res.json(attendance);
  } catch (error: any) {
    console.error("[attendance] ❌ Failed to fetch attendance record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch attendance record" });
  }
});

// POST /api/attendance - Create new attendance record
router.post("/", async (req, res) => {
  console.log("[attendance] POST /api/attendance called", req.body);
  
  const parseResult = createAttendanceSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[attendance] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { enrollmentId, scheduleId, status, verifiedBy } = parseResult.data;

  try {
    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Verify schedule exists
    const schedule = await prisma.classSchedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    // Verify enrollment belongs to the class in the schedule
    if (enrollment.classId !== schedule.classId) {
      return res.status(400).json({ 
        error: "Enrollment does not belong to the class in the schedule" 
      });
    }

    // Verify verifier exists if provided
    if (verifiedBy) {
      const verifier = await prisma.user.findUnique({
        where: { id: verifiedBy },
      });
      if (!verifier) {
        return res.status(404).json({ error: "Verifier user not found" });
      }
    }

    const attendance = await prisma.attendance.create({
      data: {
        enrollmentId,
        scheduleId,
        status: status as AttendanceStatus,
        verifiedBy: verifiedBy || null,
      },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                email: true,
              },
            },
            class: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        schedule: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
        verifier: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    console.log(`[attendance] ✅ Created attendance record: ${attendance.id}`);
    res.status(201).json(attendance);
  } catch (error: any) {
    console.error("[attendance] ❌ Failed to create attendance record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create attendance record" });
  }
});

// PUT /api/attendance/:id - Update attendance record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[attendance] PUT /api/attendance/:id called", { id, body: req.body });

  const parseResult = updateAttendanceSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[attendance] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { status, verifiedBy } = parseResult.data;

  try {
    const prismaUpdateData: {
      status?: AttendanceStatus;
      verifiedBy?: string | null;
    } = {};

    if (status !== undefined) {
      prismaUpdateData.status = status as AttendanceStatus;
    }
    if (verifiedBy !== undefined) {
      if (verifiedBy) {
        // Verify verifier exists
        const verifier = await prisma.user.findUnique({
          where: { id: verifiedBy },
        });
        if (!verifier) {
          return res.status(404).json({ error: "Verifier user not found" });
        }
        prismaUpdateData.verifiedBy = verifiedBy;
      } else {
        prismaUpdateData.verifiedBy = null;
      }
    }

    const attendance = await prisma.attendance.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                studentCode: true,
                email: true,
              },
            },
            class: {
              include: {
                subject: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
        },
        schedule: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
            room: {
              select: {
                id: true,
                name: true,
                location: true,
              },
            },
          },
        },
        verifier: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    console.log(`[attendance] ✅ Updated attendance record: ${attendance.id}`);
    res.json(attendance);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    console.error("[attendance] ❌ Failed to update attendance record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update attendance record" });
  }
});

// DELETE /api/attendance/:id - Delete attendance record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[attendance] DELETE /api/attendance/:id called", { id });

  try {
    await prisma.attendance.delete({
      where: { id },
    });

    console.log(`[attendance] ✅ Deleted attendance record: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Attendance record not found" });
    }
    console.error("[attendance] ❌ Failed to delete attendance record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete attendance record" });
  }
});

export { router as attendanceRouter };

