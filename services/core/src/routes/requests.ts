import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  const { status } = req.query;

  try {
    const requests = await prisma.request.findMany({
      where: status ? { status: status as "PENDING" | "APPROVED" | "REJECTED" } : {},
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(requests);
  } catch (error) {
    console.error("Failed to fetch requests", error);
    res.status(500).json({ error: "Failed to fetch requests" });
  }
});

export { router as requestsRouter };

