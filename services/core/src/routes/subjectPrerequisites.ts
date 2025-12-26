import { Router } from "express";
import { prisma } from "../lib/prisma";
import { z } from "zod";

const router = Router();

const createPrerequisiteSchema = z.object({
  subjectId: z.string().min(1),
  prerequisiteId: z.string().min(1),
});

// GET /api/subject-prerequisites - List all prerequisites (with optional filters)
router.get("/", async (req, res) => {
  const { subjectId, prerequisiteId } = req.query;
  console.log("[subjectPrerequisites] GET /api/subject-prerequisites called", { subjectId, prerequisiteId });

  try {
    const prerequisites = await prisma.subjectPrerequisite.findMany({
      where: {
        ...(subjectId && { subjectId: subjectId as string }),
        ...(prerequisiteId && { prerequisiteId: prerequisiteId as string }),
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            credits: true,
            faculty: true,
          },
        },
        prerequisite: {
          select: {
            id: true,
            name: true,
            credits: true,
            faculty: true,
          },
        },
      },
      orderBy: {
        subjectId: "asc",
      },
    });

    console.log(`[subjectPrerequisites] ✅ Found ${prerequisites.length} prerequisites`);
    res.json(prerequisites);
  } catch (error: any) {
    console.error("[subjectPrerequisites] ❌ Failed to fetch prerequisites:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch prerequisites" });
  }
});

// GET /api/subject-prerequisites/:id - Get prerequisite by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[subjectPrerequisites] GET /api/subject-prerequisites/:id called", { id });

  try {
    const prerequisite = await prisma.subjectPrerequisite.findUnique({
      where: { id },
      include: {
        subject: true,
        prerequisite: true,
      },
    });

    if (!prerequisite) {
      return res.status(404).json({ error: "Prerequisite not found" });
    }

    console.log(`[subjectPrerequisites] ✅ Found prerequisite: ${prerequisite.id}`);
    res.json(prerequisite);
  } catch (error: any) {
    console.error("[subjectPrerequisites] ❌ Failed to fetch prerequisite:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to fetch prerequisite" });
  }
});

// POST /api/subject-prerequisites - Create new prerequisite
router.post("/", async (req, res) => {
  console.log("[subjectPrerequisites] POST /api/subject-prerequisites called", req.body);
  
  const parseResult = createPrerequisiteSchema.safeParse(req.body);
  if (!parseResult.success) {
    console.error("[subjectPrerequisites] ❌ Validation error:", parseResult.error.flatten());
    return res.status(400).json({ error: parseResult.error.flatten() });
  }

  const { subjectId, prerequisiteId } = parseResult.data;

  try {
    // Prevent self-reference
    if (subjectId === prerequisiteId) {
      return res.status(400).json({ error: "Subject cannot be a prerequisite of itself" });
    }

    // Verify both subjects exist
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
    });
    if (!subject) {
      return res.status(404).json({ error: "Subject not found" });
    }

    const prerequisite = await prisma.subject.findUnique({
      where: { id: prerequisiteId },
    });
    if (!prerequisite) {
      return res.status(404).json({ error: "Prerequisite subject not found" });
    }

    // Check if prerequisite already exists
    const existing = await prisma.subjectPrerequisite.findFirst({
      where: {
        subjectId,
        prerequisiteId,
      },
    });
    if (existing) {
      return res.status(409).json({ error: "Prerequisite relationship already exists" });
    }

    // Check for circular dependencies (basic check)
    const reverseExists = await prisma.subjectPrerequisite.findFirst({
      where: {
        subjectId: prerequisiteId,
        prerequisiteId: subjectId,
      },
    });
    if (reverseExists) {
      return res.status(400).json({ error: "Circular dependency detected" });
    }

    const prerequisiteRelation = await prisma.subjectPrerequisite.create({
      data: {
        subjectId,
        prerequisiteId,
      },
      include: {
        subject: {
          select: {
            id: true,
            name: true,
            credits: true,
            faculty: true,
          },
        },
        prerequisite: {
          select: {
            id: true,
            name: true,
            credits: true,
            faculty: true,
          },
        },
      },
    });

    console.log(`[subjectPrerequisites] ✅ Created prerequisite: ${prerequisiteRelation.id}`);
    res.status(201).json(prerequisiteRelation);
  } catch (error: any) {
    console.error("[subjectPrerequisites] ❌ Failed to create prerequisite:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to create prerequisite" });
  }
});

// DELETE /api/subject-prerequisites/:id - Delete prerequisite
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  console.log("[subjectPrerequisites] DELETE /api/subject-prerequisites/:id called", { id });

  try {
    await prisma.subjectPrerequisite.delete({
      where: { id },
    });

    console.log(`[subjectPrerequisites] ✅ Deleted prerequisite: ${id}`);
    res.status(204).send();
  } catch (error: any) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Prerequisite not found" });
    }
    console.error("[subjectPrerequisites] ❌ Failed to delete prerequisite:", {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    res.status(500).json({ error: "Failed to delete prerequisite" });
  }
});

export { router as subjectPrerequisitesRouter };
















