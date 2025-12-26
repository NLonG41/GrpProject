/**
 * Test Prisma Connection với Database
 * Run: npx ts-node scripts/test-prisma-connection.ts
 */

import { prisma } from "../src/lib/prisma";

async function testPrismaConnection() {
  console.log("🔍 Testing Prisma Connection...\n");

  try {
    // Test 1: Raw query
    console.log("⏳ Test 1: Raw query (SELECT 1)...");
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✅ Test 1: Raw query successful", result);
    console.log("");

    // Test 2: Get users count
    console.log("⏳ Test 2: Count users...");
    const userCount = await prisma.user.count();
    console.log(`✅ Test 2: Found ${userCount} users`);
    console.log("");

    // Test 3: Get first 5 users
    console.log("⏳ Test 3: Get first 5 users...");
    const users = await prisma.user.findMany({
      take: 5,
      select: {
        id: true,
        email: true,
        role: true,
        fullName: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(`✅ Test 3: Retrieved ${users.length} users:`);
    users.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role}) - ${user.fullName}`);
    });
    console.log("");

    // Test 4: Get subjects count
    console.log("⏳ Test 4: Count subjects...");
    const subjectCount = await prisma.subject.count();
    console.log(`✅ Test 4: Found ${subjectCount} subjects`);
    console.log("");

    // Test 5: Get rooms count
    console.log("⏳ Test 5: Count rooms...");
    const roomCount = await prisma.room.count();
    console.log(`✅ Test 5: Found ${roomCount} rooms`);
    console.log("");

    // Test 6: Get classes count
    console.log("⏳ Test 6: Count classes...");
    const classCount = await prisma.class.count();
    console.log(`✅ Test 6: Found ${classCount} classes`);
    console.log("");

    // Test 7: Database info
    console.log("⏳ Test 7: Database info...");
    const dbInfo = await prisma.$queryRaw<Array<{ version: string }>>`
      SELECT version()
    `;
    console.log("✅ Test 7: Database version:", dbInfo[0]?.version?.substring(0, 50) + "...");
    console.log("");

    console.log("✅ All Prisma tests completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Users: ${userCount}`);
    console.log(`   Subjects: ${subjectCount}`);
    console.log(`   Rooms: ${roomCount}`);
    console.log(`   Classes: ${classCount}`);

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Prisma connection error:");
    console.error("   Message:", error.message);
    console.error("   Code:", error.code);
    if (error.meta) {
      console.error("   Meta:", error.meta);
    }
    await prisma.$disconnect();
    process.exit(1);
  }
}

testPrismaConnection();

