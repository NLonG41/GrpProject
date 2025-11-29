import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const server = createServer(app);

server.listen(env.port, () => {
  console.log(`Realtime service running on http://localhost:${env.port}`);
});

