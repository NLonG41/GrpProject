import dotenv from "dotenv";

dotenv.config();

const required = ["FIREBASE_PROJECT_ID", "FIREBASE_PRIVATE_KEY", "FIREBASE_CLIENT_EMAIL"] as const;

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var ${key}`);
  }
});

export const env = {
  port: Number(process.env.PORT) || 5002,
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID as string,
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n") as string,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL as string,
  },
};

