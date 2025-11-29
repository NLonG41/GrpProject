import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const classes = await prisma.class.findMany({
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

    res.json(classes);
  } catch (error) {
    console.error("Failed to fetch classes", error);
    res.status(500).json({ error: "Failed to fetch classes" });
  }
});

export { router as classesRouter };

