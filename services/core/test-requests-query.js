// Test script to check if Prisma can query requests
require('dotenv').config();
const { PrismaClient } = require('./src/generated/prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function test() {
  try {
    console.log('Testing Prisma connection...');
    
    // Test 1: Simple query without include
    console.log('\n1. Testing simple query without sender relation...');
    const requestsSimple = await prisma.request.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${requestsSimple.length} requests (simple query)`);
    if (requestsSimple.length > 0) {
      console.log('Sample request:', JSON.stringify(requestsSimple[0], null, 2));
    }
    
    // Test 2: Query with sender include
    console.log('\n2. Testing query with sender relation...');
    const requestsWithSender = await prisma.request.findMany({
      take: 5,
      include: {
        sender: {
          select: {
            id: true,
            fullName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(`✅ Found ${requestsWithSender.length} requests (with sender)`);
    if (requestsWithSender.length > 0) {
      console.log('Sample request with sender:', JSON.stringify(requestsWithSender[0], null, 2));
    }
    
    // Test 3: Check if senderIds exist
    console.log('\n3. Checking sender IDs...');
    const senderIds = requestsSimple.map(r => r.senderId);
    const uniqueSenderIds = [...new Set(senderIds)];
    console.log(`Found ${uniqueSenderIds.length} unique sender IDs:`, uniqueSenderIds);
    
    for (const senderId of uniqueSenderIds.slice(0, 3)) {
      const user = await prisma.user.findUnique({
        where: { id: senderId },
        select: { id: true, fullName: true, email: true }
      });
      if (user) {
        console.log(`  ✅ Sender ${senderId} exists:`, user.fullName);
      } else {
        console.log(`  ❌ Sender ${senderId} NOT FOUND in User table`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

test();














