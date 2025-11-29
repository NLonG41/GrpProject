import { Router } from "express";
import { pingDatabase } from "../lib/db";

export const healthRouter = Router();

healthRouter.get("/", async (_req, res) => {
  try {
    await pingDatabase();
    res.json({ status: "ok", db: "reachable" });
  } catch (error) {
    console.error("Health check failed", error);
    res.status(500).json({ status: "error", db: "unreachable" });
  }
});

