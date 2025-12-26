import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { requireAssistant } from "../middleware/auth";

const router = Router();

// Schema for creating subject
const createSubjectSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  credits: z.number().int().positive(),
  faculty: z.string().min(1),
  description: z.string().optional(),
});

// GET /api/subjects - List all subjects
router.get("/", async (_req, res) => {
  console.log("[subjects] GET /api/subjects called");
  
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
        credits: true,
        faculty: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    console.log(`[subjects] ✅ Found ${subjects.length} subjects`);
    res.json(subjects);
  } catch (error: any) {
    console.error("[subjects] ❌ Failed to fetch subjects:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// POST /api/subjects - Create new subject (Assistant only)
router.post("/", requireAssistant, async (req, res) => {
  console.log("[subjects] POST /api/subjects called", req.body);
  
  const parseResult = createSubjectSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[subjects] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const data = parseResult.data;

  try {
    // Check if subject with same ID already exists
    const existing = await prisma.subject.findUnique({
      where: { id: data.id },
    });

    if (existing) {
      console.error(`[subjects] ❌ Subject with ID ${data.id} already exists`);
      return res.status(409).json({ error: "Subject with this ID already exists" });
    }

    const subject = await prisma.subject.create({
      data: {
        id: data.id,
        name: data.name,
        credits: data.credits,
        faculty: data.faculty,
        description: data.description || null,
      },
      select: {
        id: true,
        name: true,
        credits: true,
        faculty: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`[subjects] ✅ Created subject: ${subject.id} - ${subject.name}`);
    res.status(201).json(subject);
  } catch (error: any) {
    console.error("[subjects] ❌ Failed to create subject:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// POST /api/subjects/bulk - Create multiple subjects at once (Assistant only)
const bulkCreateSubjectsSchema = z.object({
  subjects: z.array(createSubjectSchema).min(1),
});

router.post("/bulk", requireAssistant, async (req, res) => {
  console.log("[subjects] POST /api/subjects/bulk called", req.body);
  
  const parseResult = bulkCreateSubjectsSchema.safeParse(req.body);
  if (!parseResult.success) {
    const errorMessages = parseResult.error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
    console.error("[subjects] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: `Validation failed: ${errorMessages}` });
  }

  const { subjects } = parseResult.data;
  const results = {
    created: [] as any[],
    skipped: [] as Array<{ id: string; reason: string }>,
    errors: [] as Array<{ id: string; error: string }>,
  };

  try {
    for (const subjectData of subjects) {
      try {
        // Check if subject already exists
        const existing = await prisma.subject.findUnique({
          where: { id: subjectData.id },
        });

        if (existing) {
          results.skipped.push({
            id: subjectData.id,
            reason: "Subject with this ID already exists",
          });
          continue;
        }

        const subject = await prisma.subject.create({
          data: {
            id: subjectData.id,
            name: subjectData.name,
            credits: subjectData.credits,
            faculty: subjectData.faculty,
            description: subjectData.description || null,
          },
          select: {
            id: true,
            name: true,
            credits: true,
            faculty: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        });

        results.created.push(subject);
        console.log(`[subjects] ✅ Created subject: ${subject.id} - ${subject.name}`);
      } catch (error: any) {
        console.error(`[subjects] ❌ Failed to create subject ${subjectData.id}:`, error.message);
        results.errors.push({
          id: subjectData.id,
          error: error.message || "Failed to create subject",
        });
      }
    }

    console.log(`[subjects] ✅ Bulk create completed: ${results.created.length} created, ${results.skipped.length} skipped, ${results.errors.length} errors`);
    res.status(201).json({
      message: `Created ${results.created.length} subjects`,
      results,
    });
  } catch (error: any) {
    console.error("[subjects] ❌ Failed to bulk create subjects:", {
      message: error.message,
      code: error.code,
    });
    res.status(500).json({ error: "Failed to bulk create subjects" });
  }
});

// GET /api/subjects/:id - Get subject by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[subjects] GET /api/subjects/:id called", { id });

  try {
    const subject = await prisma.subject.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        credits: true,
        faculty: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    console.log(`[subjects] ✅ Found subject: ${subject.id}`);
    res.json(subject);
  } catch (error: any) {
    console.error("[subjects] ❌ Failed to fetch subject:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch subject" });
  }
});

// PUT /api/subjects/:id - Update subject (Assistant only)
const updateSubjectSchema = z.object({
  name: z.string().min(1).optional(),
  credits: z.number().int().positive().optional(),
  faculty: z.string().min(1).optional(),
  description: z.string().optional(),
});

router.put("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Subject ID is required" });
  }
  console.log("[subjects] PUT /api/subjects/:id called", { id, body: req.body });

  const parseResult = updateSubjectSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[subjects] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const updateData = parseResult.data;

  try {
    // Build update object, only including fields that are defined (not undefined)
    const prismaUpdateData: {
      name?: string;
      credits?: number;
      faculty?: string;
      description?: string | null;
    } = {};
    
    if (updateData.name !== undefined) {
      prismaUpdateData.name = updateData.name;
    }
    if (updateData.credits !== undefined) {
      prismaUpdateData.credits = updateData.credits;
    }
    if (updateData.faculty !== undefined) {
      prismaUpdateData.faculty = updateData.faculty;
    }
    if (updateData.description !== undefined) {
      prismaUpdateData.description = updateData.description || null;
    }

    const subject = await prisma.subject.update({
      where: { id: id as string },
      data: prismaUpdateData,
      select: {
        id: true,
        name: true,
        credits: true,
        faculty: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    console.log(`[subjects] ✅ Updated subject: ${subject.id}`);
    res.json(subject);
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subject not found" });
    }
    console.error("[subjects] ❌ Failed to update subject:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// DELETE /api/subjects/:id - Delete subject (Assistant only)
router.delete("/:id", requireAssistant, async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "Subject ID is required" });
  }
  console.log("[subjects] DELETE /api/subjects/:id called", { id });

  try {
    // Check if subject has classes
    const classes = await prisma.class.count({
      where: { subjectId: id as string },
    });

    if (classes > 0) {
      return res.status(409).json({ 
        error: `Cannot delete subject with ${classes} class(es). Please remove classes first.` 
      });
    }

    await prisma.subject.delete({
      where: { id: id as string },
    });

    console.log(`[subjects] ✅ Deleted subject: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Subject not found" });
    }
    console.error("[subjects] ❌ Failed to delete subject:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

export { router as subjectsRouter };

