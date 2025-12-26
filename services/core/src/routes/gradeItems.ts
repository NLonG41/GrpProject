// NOTE: GradeItems routes are NOT part of Assistant use case
// These routes are for Lecturer role (managing grade components)
// Keeping them for future implementation but not required for Assistant portal

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { GradeItemType } from "../generated/prisma/enums";

const router = Router();

const createGradeItemSchema = z.object({
  classId: z.string().min(1),
  name: z.string().min(1),
  maxScore: z.number().min(0),
  weight: z.number().min(0).max(1),
  type: z.enum(["HOMEWORK", "QUIZ", "MIDTERM", "FINAL", "PROJECT", "PARTICIPATION"]),
});

const updateGradeItemSchema = z.object({
  name: z.string().min(1).optional(),
  maxScore: z.number().min(0).optional(),
  weight: z.number().min(0).max(1).optional(),
  type: z.enum(["HOMEWORK", "QUIZ", "MIDTERM", "FINAL", "PROJECT", "PARTICIPATION"]).optional(),
});

// GET /api/grade-items - List all grade items (with optional filters)
router.get("/", async (req, res) => {
  const { classId, type } = req.query;
  console.log("[gradeItems] GET /api/grade-items called", { classId, type });

  try {
    const gradeItems = await prisma.gradeItem.findMany({
      where: {
        ...(classId && { classId: classId as string }),
        ...(type && { type: type as GradeItemType }),
      },
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
        _count: {
          select: {
            gradeRecords: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`[gradeItems] ✅ Found ${gradeItems.length} grade items`);
    res.json(gradeItems);
  } catch (error: any) {
    console.error("[gradeItems] ❌ Failed to fetch grade items:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch grade items" });
  }
});

// GET /api/grade-items/:id - Get grade item by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[gradeItems] GET /api/grade-items/:id called", { id });

  try {
    const gradeItem = await prisma.gradeItem.findUnique({
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
        gradeRecords: {
          include: {
            enrollment: {
              include: {
                student: {
                  select: {
                    id: true,
                    fullName: true,
                    studentCode: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!gradeItem) {
      return res.status(404).json({ error: "Grade item not found" });
    }

    console.log(`[gradeItems] ✅ Found grade item: ${gradeItem.id}`);
    res.json(gradeItem);
  } catch (error: any) {
    console.error("[gradeItems] ❌ Failed to fetch grade item:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch grade item" });
  }
});

// POST /api/grade-items - Create new grade item
router.post("/", async (req, res) => {
  console.log("[gradeItems] POST /api/grade-items called", req.body);
  
  const parseResult = createGradeItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[gradeItems] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { classId, name, maxScore, weight, type } = parseResult.data;

  try {
    // Verify class exists
    const classExists = await prisma.class.findUnique({
      where: { id: classId },
    });
    if (!classExists) {
      return res.status(404).json({ error: "Class not found" });
    }

    const gradeItem = await prisma.gradeItem.create({
      data: {
        classId,
        name,
        maxScore,
        weight,
        type: type as GradeItemType,
      },
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
      },
    });

    console.log(`[gradeItems] ✅ Created grade item: ${gradeItem.id}`);
    res.status(201).json(gradeItem);
  } catch (error: any) {
    console.error("[gradeItems] ❌ Failed to create grade item:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create grade item" });
  }
});

// PUT /api/grade-items/:id - Update grade item
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[gradeItems] PUT /api/grade-items/:id called", { id, body: req.body });

  const parseResult = updateGradeItemSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[gradeItems] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updateData = parseResult.data;

  try {
    const prismaUpdateData: {
      name?: string;
      maxScore?: number;
      weight?: number;
      type?: GradeItemType;
    } = {};

    if (updateData.name !== undefined) {
      prismaUpdateData.name = updateData.name;
    }
    if (updateData.maxScore !== undefined) {
      prismaUpdateData.maxScore = updateData.maxScore;
    }
    if (updateData.weight !== undefined) {
      prismaUpdateData.weight = updateData.weight;
    }
    if (updateData.type !== undefined) {
      prismaUpdateData.type = updateData.type as GradeItemType;
    }

    const gradeItem = await prisma.gradeItem.update({
      where: { id },
      data: prismaUpdateData,
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
      },
    });

    console.log(`[gradeItems] ✅ Updated grade item: ${gradeItem.id}`);
    res.json(gradeItem);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Grade item not found" });
    }
    console.error("[gradeItems] ❌ Failed to update grade item:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update grade item" });
  }
});

// DELETE /api/grade-items/:id - Delete grade item
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[gradeItems] DELETE /api/grade-items/:id called", { id });

  try {
    // Check if there are grade records for this item
    const gradeRecords = await prisma.gradeRecord.count({
      where: { gradeItemId: id },
    });

    if (gradeRecords > 0) {
      return res.status(400).json({ 
        error: `Cannot delete grade item: ${gradeRecords} grade record(s) exist for this item` 
      });
    }

    await prisma.gradeItem.delete({
      where: { id },
    });

    console.log(`[gradeItems] ✅ Deleted grade item: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Grade item not found" });
    }
    console.error("[gradeItems] ❌ Failed to delete grade item:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete grade item" });
  }
});

export { router as gradeItemsRouter };

