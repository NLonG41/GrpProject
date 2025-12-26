/**
 * Script to create user zzz@gmail.com in PostgreSQL database
 * Run: ts-node scripts/create-user-zzz.ts
 */

import { prisma } from "../src/lib/prisma";
import { admin } from "../src/lib/firebase";
import crypto from "crypto";

const hashPassword = (password: string) => {
  return crypto.createHash("sha256").update(password).digest("hex");
};

async function createUser() {
  const email = "zzz@gmail.com";
  const password = "123123";
  const fullName = "Test User ZZZ";
  const studentCode = "STU-ZZZ-001";
  const role = "STUDENT" as const;

  try {
    console.log("🔍 Checking if user exists...");
    
    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log("⚠️  User already exists in database:");
      console.log("   ID:", existingUser.id);
      console.log("   Email:", existingUser.email);
      console.log("   Role:", existingUser.role);
      console.log("   Full Name:", existingUser.fullName);
      return;
    }

    // Check Firebase Admin SDK
    console.log("\n🔥 Checking Firebase Admin SDK...");
    if (admin.apps.length > 0) {
      console.log("✅ Firebase Admin SDK initialized");
      
      // Check if user exists in Firebase Auth
      try {
        const firebaseUser = await admin.auth().getUserByEmail(email);
        console.log("✅ User exists in Firebase Auth:");
        console.log("   UID:", firebaseUser.uid);
        console.log("   Email:", firebaseUser.email);
      } catch (error: any) {
        if (error.code === "auth/user-not-found") {
          console.log("⚠️  User does NOT exist in Firebase Auth");
          console.log("💡 Creating user in Firebase Auth...");
          
          try {
            const newFirebaseUser = await admin.auth().createUser({
              email,
              password,
              displayName: fullName,
              emailVerified: false,
            });
            console.log("✅ Created user in Firebase Auth:");
            console.log("   UID:", newFirebaseUser.uid);
          } catch (firebaseError: any) {
            console.error("❌ Failed to create Firebase user:", firebaseError.message);
            if (firebaseError.code === "auth/email-already-exists") {
              console.log("   (User already exists, continuing...)");
            }
          }
        } else {
          console.error("❌ Error checking Firebase user:", error.message);
        }
      }
    } else {
      console.log("⚠️  Firebase Admin SDK NOT initialized");
      console.log("💡 Check FIREBASE_PROJECT_ID in .env");
    }

    // Create user in database
    console.log("\n📊 Creating user in PostgreSQL database...");
    const hashedPassword = hashPassword(password);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
        fullName,
        studentCode,
        cohort: "2024",
        major: "Computer Science",
      },
    });

    console.log("✅ User created successfully!");
    console.log("\n📋 User Details:");
    console.log("   ID:", user.id);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Full Name:", user.fullName);
    console.log("   Student Code:", user.studentCode);
    console.log("   Cohort:", user.cohort);
    console.log("   Major:", user.major);
    console.log("\n🔑 Login Credentials:");
    console.log("   Email:", email);
    console.log("   Password:", password);

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error creating user:");
    console.error("   Message:", error.message);
    
    if (error.code === "P2002") {
      console.error("💡 User with this email or studentCode already exists");
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();

