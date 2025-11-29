import express from "express";
import cors from "cors";

import { healthRouter } from "./routes/health";
import { scheduleRouter } from "./routes/schedule";
import { authRouter } from "./routes/auth";
import { usersRouter } from "./routes/users";
import { subjectsRouter } from "./routes/subjects";
import { roomsRouter } from "./routes/rooms";
import { classesRouter } from "./routes/classes";
import { requestsRouter } from "./routes/requests";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/health", healthRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/users", usersRouter);
  
  // Note: In production, add JWT middleware to verify admin role
  // For now, we use x-user-id header (should be replaced with JWT token)
  app.use("/api/subjects", subjectsRouter);
  app.use("/api/rooms", roomsRouter);
  app.use("/api/classes", classesRouter);
  app.use("/api/requests", requestsRouter);
  app.use("/schedules", scheduleRouter);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};

