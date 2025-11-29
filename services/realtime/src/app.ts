import express from "express";
import cors from "cors";
import { eventsRouter } from "./routes/events";
import { notificationsRouter } from "./routes/notifications";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use("/events", eventsRouter);
  app.use("/notifications", notificationsRouter);

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "realtime" });
  });

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  });

  return app;
};

