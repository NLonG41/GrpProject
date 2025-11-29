import admin from "firebase-admin";
import { env } from "../config/env";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: env.firebase.projectId,
      privateKey: env.firebase.privateKey,
      clientEmail: env.firebase.clientEmail,
    }),
  });
}

export const db = admin.firestore();
export { admin };

