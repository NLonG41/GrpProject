import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { Role } from "../generated/prisma/enums";
import { requireAssistant } from "../middleware/auth";

const router = Router();

const createClassSchema = z.object({
  id: z.string().min(1),
  subjectId: z.string().min(1),
  lecturerId: z.string().min(1),
  name: z.string().min(1),
  maxCapacity: z.number().int().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  isActive: z.boolean().optional().default(true),
});

const updateClassSchema = z.object({
  name: z.string().min(1).optional(),
  maxCapacity: z.number().int().positive().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// GET /api/classes - List all classes
router.get("/", async (_req, res) => {
  console.log("[classes] GET /api/classes called");
  
  try {
    const classes = await prisma.class.findMany({
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            credits: true,
            faculty: true,
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
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[classes] ✅ Found ${classes.length} classes`);
    res.json(classes);
  } catch (error: any) {
    console.error("[classes] ❌ Failed to fetch classes:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

// GET /api/classes/:id - Get class by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[classes] GET /api/classes/:id called", { id });

  try {
    const classItem = await prisma.class.findUnique({
      where: { id },
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
    });

    if (!classItem) {
      return res.status(404).json({ error: "Class not found" });
    }

    console.log(`[classes] ✅ Found class: ${classItem.id}`);
    res.json(classItem);
  } catch (error: any) {
    console.error("[classes] ❌ Failed to fetch class:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch class" });
  }
});

// POST /api/classes - Create new class (Assistant only)
router.post("/", requireAssistant, async (req, res) => {
  console.log("[classes] POST /api/classes called", req.body);
  
  const parseResult = createClassSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[classes] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const data = parseResult.data;

  try {
    // Verify subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: data.subjectId },
    });
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    // Verify lecturer exists and is a LECTURER
    const lecturer = await prisma.user.findUnique({
      where: { id: data.lecturerId },
    });
    if (!lecturer) {
      return res.status(404).json({ error: "Lecturer not found" });
    }
    if (lecturer.role !== Role.LECTURER) {
      return res.status(400).json({ error: "User must be a LECTURER" });
    }

    // Check if class ID already exists
    const existing = await prisma.class.findUnique({
      where: { id: data.id },
    });
    if (existing) {
      return res.status(409).json({ error: "Class with this ID already exists" });
    }

    // Validate dates
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      return res.status(400).json({ error: "endDate must be greater than startDate" });
    }

    const classItem = await prisma.class.create({
      data: {
        id: data.id,
        subjectId: data.subjectId,
        lecturerId: data.lecturerId,
        name: data.name,
        maxCapacity: data.maxCapacity,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive ?? true,
      },
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
    });

    console.log(`[classes] ✅ Created class: ${classItem.id}`);
    res.status(201).json(classItem);
  } catch (error: any) {
    console.error("[classes] ❌ Failed to create class:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create class" });
  }
});

// PUT /api/classes/:id - Update class (Assistant only)
router.put("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Class ID is required" });
  }
  console.log("[classes] PUT /api/classes/:id called", { id, body: req.body });

  const parseResult = updateClassSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[classes] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updateData = parseResult.data;

  try {
    // Validate dates if both are provided
    if (updateData.startDate && updateData.endDate) {
      if (new Date(updateData.startDate) >= new Date(updateData.endDate)) {
        return res.status(400).json({ error: "endDate must be greater than startDate" });
      }
    }

    // Build update object, only including fields that are defined (not undefined)
    const prismaUpdateData: {
      name?: string;
      maxCapacity?: number;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
    } = {};
    
    if (updateData.name !== undefined) {
      prismaUpdateData.name = updateData.name;
    }
    if (updateData.maxCapacity !== undefined) {
      prismaUpdateData.maxCapacity = updateData.maxCapacity;
    }
    if (updateData.startDate !== undefined) {
      prismaUpdateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate !== undefined) {
      prismaUpdateData.endDate = new Date(updateData.endDate);
    }
    if (updateData.isActive !== undefined) {
      prismaUpdateData.isActive = updateData.isActive;
    }

    const classItem = await prisma.class.update({
      where: { id: id as string },
      data: prismaUpdateData,
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
    });

    console.log(`[classes] ✅ Updated class: ${classItem.id}`);
    res.json(classItem);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Class not found" });
    }
    console.error("[classes] ❌ Failed to update class:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update class" });
  }
});

// DELETE /api/classes/:id - Delete class (Assistant only)
router.delete("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Class ID is required" });
  }
  console.log("[classes] DELETE /api/classes/:id called", { id });

  try {
    // Check if class has enrollments
    const enrollments = await prisma.enrollment.count({
      where: { classId: id as string },
    });

    if (enrollments > 0) {
      return res.status(409).json({ 
        error: `Cannot delete class with ${enrollments} enrollment(s). Please remove enrollments first.` 
      });
    }

    // Check if class has schedules
    const schedules = await prisma.classSchedule.count({
      where: { classId: id as string },
    });

    if (schedules > 0) {
      return res.status(409).json({ 
        error: `Cannot delete class with ${schedules} schedule(s). Please remove schedules first.` 
      });
    }

    await prisma.class.delete({
      where: { id: id as string },
    });

    console.log(`[classes] ✅ Deleted class: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Class not found" });
    }
    console.error("[classes] ❌ Failed to delete class:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete class" });
  }
});

export { router as classesRouter };

