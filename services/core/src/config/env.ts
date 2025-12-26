import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var ${key}`);
  }
});

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL as string,
  eventBrokerUrl: process.env.EVENT_BROKER_URL || "",
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  },
};

