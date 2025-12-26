// NOTE: GradeRecords routes are NOT part of Assistant use case
// These routes are for Lecturer role (managing student grades)
// Keeping them for future implementation but not required for Assistant portal

import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const router = Router();

const createGradeRecordSchema = z.object({
  enrollmentId: z.string().min(1),
  gradeItemId: z.string().min(1),
  score: z.number().min(0).optional(),
  gradedBy: z.string().optional(),
});

const updateGradeRecordSchema = z.object({
  score: z.number().min(0).optional().nullable(),
  gradedBy: z.string().optional().nullable(),
});

// GET /api/grade-records - List all grade records (with optional filters)
router.get("/", async (req, res) => {
  const { enrollmentId, gradeItemId, gradedBy } = req.query;
  console.log("[gradeRecords] GET /api/grade-records called", { enrollmentId, gradeItemId, gradedBy });

  try {
    const gradeRecords = await prisma.gradeRecord.findMany({
      where: {
        ...(enrollmentId && { enrollmentId: enrollmentId as string }),
        ...(gradeItemId && { gradeItemId: gradeItemId as string }),
        ...(gradedBy && { gradedBy: gradedBy as string }),
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
        gradeItem: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        gradedAt: "desc",
      },
    });

    console.log(`[gradeRecords] ✅ Found ${gradeRecords.length} grade records`);
    res.json(gradeRecords);
  } catch (error: any) {
    console.error("[gradeRecords] ❌ Failed to fetch grade records:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch grade records" });
  }
});

// GET /api/grade-records/:id - Get grade record by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[gradeRecords] GET /api/grade-records/:id called", { id });

  try {
    const gradeRecord = await prisma.gradeRecord.findUnique({
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
        gradeItem: {
          include: {
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
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!gradeRecord) {
      return res.status(404).json({ error: "Grade record not found" });
    }

    console.log(`[gradeRecords] ✅ Found grade record: ${gradeRecord.id}`);
    res.json(gradeRecord);
  } catch (error: any) {
    console.error("[gradeRecords] ❌ Failed to fetch grade record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch grade record" });
  }
});

// POST /api/grade-records - Create new grade record
router.post("/", async (req, res) => {
  console.log("[gradeRecords] POST /api/grade-records called", req.body);
  
  const parseResult = createGradeRecordSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[gradeRecords] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { enrollmentId, gradeItemId, score, gradedBy } = parseResult.data;

  try {
    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Verify grade item exists
    const gradeItem = await prisma.gradeItem.findUnique({
      where: { id: gradeItemId },
    });
    if (!gradeItem) {
      return res.status(404).json({ error: "Grade item not found" });
    }

    // Verify enrollment belongs to the class of the grade item
    if (enrollment.classId !== gradeItem.classId) {
      return res.status(400).json({ 
        error: "Enrollment does not belong to the class of the grade item" 
      });
    }

    // Verify score is within maxScore if provided
    if (score !== undefined && score > gradeItem.maxScore) {
      return res.status(400).json({ 
        error: `Score (${score}) exceeds maximum score (${gradeItem.maxScore})` 
      });
    }

    // Verify grader exists if provided
    if (gradedBy) {
      const grader = await prisma.user.findUnique({
        where: { id: gradedBy },
      });
      if (!grader) {
        return res.status(404).json({ error: "Grader user not found" });
      }
    }

    const gradeRecord = await prisma.gradeRecord.create({
      data: {
        enrollmentId,
        gradeItemId,
        score: score || null,
        gradedAt: score !== undefined ? new Date() : null,
        gradedBy: gradedBy || null,
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
        gradeItem: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    console.log(`[gradeRecords] ✅ Created grade record: ${gradeRecord.id}`);
    res.status(201).json(gradeRecord);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({ 
        error: "Grade record already exists for this enrollment and grade item" 
      });
    }
    console.error("[gradeRecords] ❌ Failed to create grade record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create grade record" });
  }
});

// PUT /api/grade-records/:id - Update grade record
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[gradeRecords] PUT /api/grade-records/:id called", { id, body: req.body });

  const parseResult = updateGradeRecordSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[gradeRecords] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { score, gradedBy } = parseResult.data;

  try {
    // Get existing record to check maxScore
    const existingRecord = await prisma.gradeRecord.findUnique({
      where: { id },
      include: {
        gradeItem: true,
      },
    });

    if (!existingRecord) {
      return res.status(404).json({ error: "Grade record not found" });
    }

    const prismaUpdateData: {
      score?: number | null;
      gradedAt?: Date | null;
      gradedBy?: string | null;
    } = {};

    if (score !== undefined) {
      // Verify score is within maxScore
      if (score !== null && score > existingRecord.gradeItem.maxScore) {
        return res.status(400).json({ 
          error: `Score (${score}) exceeds maximum score (${existingRecord.gradeItem.maxScore})` 
        });
      }
      prismaUpdateData.score = score;
      prismaUpdateData.gradedAt = score !== null ? new Date() : null;
    }
    
    if (gradedBy !== undefined) {
      if (gradedBy) {
        // Verify grader exists
        const grader = await prisma.user.findUnique({
          where: { id: gradedBy },
        });
        if (!grader) {
          return res.status(404).json({ error: "Grader user not found" });
        }
        prismaUpdateData.gradedBy = gradedBy;
      } else {
        prismaUpdateData.gradedBy = null;
      }
    }

    const gradeRecord = await prisma.gradeRecord.update({
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
        gradeItem: {
          include: {
            class: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        grader: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
    });

    console.log(`[gradeRecords] ✅ Updated grade record: ${gradeRecord.id}`);
    res.json(gradeRecord);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Grade record not found" });
    }
    console.error("[gradeRecords] ❌ Failed to update grade record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update grade record" });
  }
});

// DELETE /api/grade-records/:id - Delete grade record
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[gradeRecords] DELETE /api/grade-records/:id called", { id });

  try {
    await prisma.gradeRecord.delete({
      where: { id },
    });

    console.log(`[gradeRecords] ✅ Deleted grade record: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Grade record not found" });
    }
    console.error("[gradeRecords] ❌ Failed to delete grade record:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete grade record" });
  }
});

export { router as gradeRecordsRouter };

