import admin from "firebase-admin";
import { env } from "../config/env";

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  // Skip if already initialized
  if (admin.apps.length > 0) {
    return;
  }

  // Check if Firebase config is available
  if (!env.firebase.projectId || !env.firebase.privateKey || !env.firebase.clientEmail) {
    console.warn("[firebase] Firebase Admin SDK not initialized: Missing configuration");
    console.warn("[firebase] Required: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
    return;
  }

  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: env.firebase.projectId,
        privateKey: env.firebase.privateKey,
        clientEmail: env.firebase.clientEmail,
      }),
    });
    console.log("[firebase] Firebase Admin initialized successfully");
  } catch (error: any) {
    console.error("[firebase] Failed to initialize Firebase Admin:", error.message);
    console.error("[firebase] Error code:", error.code);
  }
}

// Initialize immediately when module is loaded
initializeFirebaseAdmin();

export { admin };

