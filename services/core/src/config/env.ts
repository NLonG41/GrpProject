import dotenv from "dotenv";

dotenv.config();

const required = ["DATABASE_URL"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var ${key}`);
  }
});

export const env = {
  port: Number(process.env.PORT) || 5001,
  databaseUrl: process.env.DATABASE_URL as string,
  eventBrokerUrl: process.env.EVENT_BROKER_URL || "",
};

