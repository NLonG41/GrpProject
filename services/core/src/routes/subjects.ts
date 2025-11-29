import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        prerequisites: {
          include: {
                prerequisite: {
                  select: {
                    id: true,
                    name: true,
                    credits: true,
                  },
                },
          },
        },
      },
    });

    res.json(subjects);
  } catch (error) {
    console.error("Failed to fetch subjects", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

export { router as subjectsRouter };

