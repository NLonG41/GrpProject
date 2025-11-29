import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const rooms = await prisma.room.findMany();
    res.json(rooms);
  } catch (error) {
    console.error("Failed to fetch rooms", error);
    res.status(500).json({ error: "Failed to fetch rooms" });
  }
});

export { router as roomsRouter };

