/**
 * Import users from a CSV into:
 * 1) Neon DB (User table via Prisma)
 * 2) Firebase Auth (for login)
 *
 * CSV format (example):
 * id,email,password,role,fullName,studentCode,cohort,major,department,specialty,createdAt,updatedAt
 * stu-01,s01@usth.edu.vn,hashed,STUDENT,Nguyen Minh Anh,STU001,2026,Computer Science,,AI,12/1/2025 8:00,12/1/2025 8:00
 *
 * Notes:
 * - Column `password` in CSV is ignored; we set a default password for all users.
 * - Only roles ASSISTANT / LECTURER / STUDENT are imported.
 * - For STUDENT, studentCode is required; if missing, the row is skipped.
 *
 * Usage:
 *   cd services/core
 *   ts-node src/scripts/import-users-from-csv.ts "C:/Users/nguye/OneDrive/Documents/users.csv"
 *
 * Make sure .env has Firebase credentials and DATABASE_URL.
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import admin from "firebase-admin";
import dotenv from "dotenv";
import { prisma } from "../lib/prisma";

// Load env from services/core/.env
dotenv.config({ path: path.join(__dirname, "..", "..", ".env") });

// -------- Config --------
const DEFAULT_PASSWORD = "Usth@2025!"; // change if you want a different default
const ALLOWED_ROLES = new Set(["ASSISTANT", "LECTURER", "STUDENT"]);

function hashPassword(pwd: string): string {
  return crypto.createHash("sha256").update(pwd).digest("hex");
}

function initFirebase() {
  if (admin.apps.length) return;
  let projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Extract project ID from email if not provided
  if (!projectId && clientEmail) {
    const match = clientEmail.match(/@([^.]+)\.iam\.gserviceaccount\.com/);
    if (match) {
      projectId = match[1];
    }
  }

  if (!projectId || !privateKey || !clientEmail) {
    throw new Error("Missing Firebase env vars. Please set FIREBASE_PROJECT_ID (or it will be extracted from FIREBASE_CLIENT_EMAIL), FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
  }

  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      privateKey,
      clientEmail,
    }),
  });
}

interface CsvRow {
  id?: string;
  email: string;
  password?: string;
  role: string;
  fullName?: string;
  studentCode?: string;
  cohort?: string;
  major?: string;
  department?: string;
  specialty?: string;
  createdAt?: string;
  updatedAt?: string;
}

function parseCsv(filePath: string): CsvRow[] {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return [];
  const firstLine = lines[0];
  if (!firstLine) return [];
  const header = firstLine.split(",");
  const rows = lines.slice(1);
  return rows.map((line) => {
    const cols = line.split(",");
    const obj: Partial<CsvRow> = {};
    header.forEach((h, idx) => {
      const key = h.trim() as keyof CsvRow;
      obj[key] = (cols[idx] !== undefined ? cols[idx].trim() : "") as any;
    });
    return obj as CsvRow;
  });
}

async function importUsers(csvPath: string) {
  console.log(`📥 Importing users from: ${csvPath}\n`);
  const data = parseCsv(csvPath);

  let created = 0;
  let skipped = 0;
  let failed = 0;

  initFirebase();

  for (const row of data) {
    const role = (row.role || "").toUpperCase();
    if (!ALLOWED_ROLES.has(role)) {
      console.log(`⚠️  Skip (invalid role): ${row.email} (${row.role})`);
      skipped++;
      continue;
    }

    if (role === "STUDENT" && !row.studentCode) {
      console.log(`⚠️  Skip student missing studentCode: ${row.email}`);
      skipped++;
      continue;
    }

    const email = row.email;
    const fullName = row.fullName || "Unknown";
    const studentCode = row.studentCode || null;
    const cohort = row.cohort || null;
    const major = row.major || null;
    const department = row.department || null;
    const specialty = row.specialty || null;
    const userId = row.id && row.id.length ? row.id : undefined;

    // Create in Firebase Auth (ignore error if already exists or fails - we'll still import to DB)
    let firebaseCreated = false;
    try {
      const createUserData: admin.auth.CreateRequest = {
        email,
        password: DEFAULT_PASSWORD,
        displayName: fullName,
      };
      if (userId) {
        createUserData.uid = userId;
      }
      await admin.auth().createUser(createUserData);
      firebaseCreated = true;
    } catch (err: any) {
      if (err.code === "auth/email-already-exists") {
        firebaseCreated = true; // User already exists, that's fine
      } else {
        console.log(`⚠️  Firebase Auth skipped for ${email}: ${err.message}`);
        // Continue to import to database anyway
      }
    }

    // Upsert in database by email
    try {
      const hashed = hashPassword(DEFAULT_PASSWORD);
      const createData: any = {
        email,
        password: hashed,
        role: role as "ASSISTANT" | "LECTURER" | "STUDENT",
        fullName,
        studentCode,
        cohort,
        major,
        department,
        specialty,
      };
      if (userId) {
        createData.id = userId;
      }
      await prisma.user.upsert({
        where: { email },
        update: {
          role: role as "ASSISTANT" | "LECTURER" | "STUDENT",
          fullName,
          studentCode,
          cohort,
          major,
          department,
          specialty,
          password: hashed,
        },
        create: createData,
      });

      const firebaseStatus = firebaseCreated ? "✅ Firebase" : "⚠️  Firebase skipped";
      console.log(`✅ Imported: ${email} (${role}) - ${firebaseStatus}`);
      created++;
    } catch (err: any) {
      console.log(`❌ DB upsert failed for ${email}: ${err.message}`);
      failed++;
    }
  }

  console.log("\n📊 Summary");
  console.log(`   Created/Upserted: ${created}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}\n`);
  console.log(`🔑 Default password for all imported users: ${DEFAULT_PASSWORD}\n`);
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("❌ Please provide CSV path. Example:\n   ts-node src/scripts/import-users-from-csv.ts \"C:/path/to/users.csv\"");
    process.exit(1);
  }

  await importUsers(csvPath);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Unexpected error:", err);
  prisma.$disconnect();
  process.exit(1);
});

