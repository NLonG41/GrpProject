import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { Role } from "../generated/prisma/enums";

const router = Router();

const createEnrollmentSchema = z.object({
  studentId: z.string().min(1),
  classId: z.string().min(1),
});

const updateEnrollmentSchema = z.object({
  midtermScore: z.number().min(0).max(10).optional(),
  finalScore: z.number().min(0).max(10).optional(),
  totalGrade: z.number().min(0).max(10).optional(),
});

// GET /api/enrollments - List all enrollments (with optional filters)
router.get("/", async (req, res) => {
  const { studentId, classId } = req.query;
  console.log("[enrollments] GET /api/enrollments called", { studentId, classId });

  try {
    const enrollments = await prisma.enrollment.findMany({
      where: {
        ...(studentId && { studentId: studentId as string }),
        ...(classId && { classId: classId as string }),
      },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            fullName: true,
            studentCode: true,
            role: true,
          },
        },
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
      },
      orderBy: {
        registeredAt: "desc",
      },
    });

    console.log(`[enrollments] ✅ Found ${enrollments.length} enrollments`);
    res.json(enrollments);
  } catch (error: any) {
    console.error("[enrollments] ❌ Failed to fetch enrollments:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch enrollments" });
  }
});

// GET /api/enrollments/:id - Get enrollment by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[enrollments] GET /api/enrollments/:id called", { id });

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            email: true,
            fullName: true,
            studentCode: true,
            role: true,
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
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    console.log(`[enrollments] ✅ Found enrollment: ${enrollment.id}`);
    res.json(enrollment);
  } catch (error: any) {
    console.error("[enrollments] ❌ Failed to fetch enrollment:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch enrollment" });
  }
});

// POST /api/enrollments - Create new enrollment
router.post("/", async (req, res) => {
  console.log("[enrollments] POST /api/enrollments called", req.body);
  
  const parseResult = createEnrollmentSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMessages = parseResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("[enrollments] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
  }

  const { studentId, classId } = parseResult.data;

  try {
    // Verify student exists and is a STUDENT
    const student = await prisma.user.findUnique({
      where: { id: studentId },
    });
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    if (student.role !== Role.STUDENT) {
      return res.status(400).json({ error: "User must be a STUDENT" });
    }

    // Verify class exists and is active
    const classItem = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classItem) {
      return res.status(404).json({ error: "Class not found" });
    }
    if (!classItem.isActive) {
      return res.status(400).json({ error: "Class is not active" });
    }

    // Check if class is full
    if (classItem.currentEnrollment >= classItem.maxCapacity) {
      return res.status(409).json({ error: "Class is full" });
    }

    // Check if student is already enrolled
    // Use findFirst instead of findUnique for composite unique key to avoid schema mismatch issues
    const existing = await prisma.enrollment.findFirst({
      where: {
        studentId,
        classId,
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Student is already enrolled in this class" });
    }

    // Create enrollment and update class enrollment count in a transaction
    const enrollment = await prisma.$transaction(async (tx) => {
      // Create enrollment
      const newEnrollment = await tx.enrollment.create({
        data: {
          studentId,
          classId,
        },
        include: {
          student: {
            select: {
              id: true,
              email: true,
              fullName: true,
              studentCode: true,
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
      });

      // Update class enrollment count
      await tx.class.update({
        where: { id: classId },
        data: {
          currentEnrollment: {
            increment: 1,
          },
        },
      });

      return newEnrollment;
    });

    console.log(`[enrollments] ✅ Created enrollment: ${enrollment.id}`);
    res.status(201).json(enrollment);
  } catch (error: any) {
    console.error("[enrollments] ❌ Failed to create enrollment:", {
      message: error.message,
      code: error.code,
      meta: error.meta,
      stack: error.stack
    });
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      // Unique constraint violation
      const target = error.meta?.target || [];
      if (target.includes('studentId') && target.includes('classId')) {
        return res.status(409).json({ error: "Student is already enrolled in this class" });
      }
      return res.status(409).json({ error: "Duplicate enrollment detected" });
    }
    
    if (error.code === 'P2003') {
      // Foreign key constraint violation
      return res.status(400).json({ error: "Invalid student or class reference" });
    }
    
    if (error.code === 'P2025') {
      // Record not found
      return res.status(404).json({ error: "Related record not found" });
    }
    
    // Return more detailed error message for debugging
    const errorMessage = error.message || "Failed to create enrollment";
    res.status(500).json({ 
      error: errorMessage,
      code: error.code || 'UNKNOWN_ERROR'
    });
  }
});

// PUT /api/enrollments/:id - Update enrollment (scores)
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[enrollments] PUT /api/enrollments/:id called", { id, body: req.body });

  const parseResult = updateEnrollmentSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[enrollments] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updateData = parseResult.data;

  try {
    // Build update object, only including fields that are defined (not undefined)
    const prismaUpdateData: {
      midtermScore?: number | null;
      finalScore?: number | null;
      totalGrade?: number | null;
    } = {};
    
    if (updateData.midtermScore !== undefined) {
      prismaUpdateData.midtermScore = updateData.midtermScore;
    }
    if (updateData.finalScore !== undefined) {
      prismaUpdateData.finalScore = updateData.finalScore;
    }
    if (updateData.totalGrade !== undefined) {
      prismaUpdateData.totalGrade = updateData.totalGrade;
    }

    const enrollment = await prisma.enrollment.update({
      where: { id },
      data: prismaUpdateData,
      include: {
        student: {
          select: {
            id: true,
            email: true,
            fullName: true,
            studentCode: true,
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
    });

    console.log(`[enrollments] ✅ Updated enrollment: ${enrollment.id}`);
    res.json(enrollment);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    console.error("[enrollments] ❌ Failed to update enrollment:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update enrollment" });
  }
});

// DELETE /api/enrollments/:id - Delete enrollment
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[enrollments] DELETE /api/enrollments/:id called", { id });

  try {
    // Get enrollment to get classId
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
    });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Delete enrollment
    await prisma.enrollment.delete({
      where: { id },
    });

    // Update class enrollment count
    await prisma.class.update({
      where: { id: enrollment.classId },
      data: {
        currentEnrollment: {
          decrement: 1,
        },
      },
    });

    console.log(`[enrollments] ✅ Deleted enrollment: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Enrollment not found" });
    }
    console.error("[enrollments] ❌ Failed to delete enrollment:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete enrollment" });
  }
});

export { router as enrollmentsRouter };

