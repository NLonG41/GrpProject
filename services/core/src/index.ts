import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";
// Ensure Firebase Admin SDK is initialized before routes are loaded
import "./lib/firebase";

const app = createApp();
const server = createServer(app);

server.listen(env.port, () => {
  console.log(`Core service running on http://localhost:${env.port}`);
});

