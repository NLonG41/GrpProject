#!/usr/bin/env node

/**
 * Cập nhật connection string cho Neon database
 */

const fs = require('fs');
const path = require('path');

const NEON_CONNECTION_STRING = 'postgresql://neondb_owner:npg_f9RsDuCeHqZ7@ep-calm-water-a1d2bcmu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const envPath = path.join(__dirname, 'services', 'core', '.env');

console.log('🔄 Updating DATABASE_URL to Neon database...\n');

// Đọc file .env hiện tại
let envContent = '';
if (fs.existsSync(envPath)) {
  envContent = fs.readFileSync(envPath, 'utf8');
} else {
  console.log('⚠️  File .env không tồn tại, sẽ tạo mới\n');
}

// Tách các dòng
const lines = envContent.split('\n');
const newLines = [];
let hasDatabaseUrl = false;

// Cập nhật hoặc thêm DATABASE_URL
lines.forEach(line => {
  if (line.trim().startsWith('DATABASE_URL=')) {
    newLines.push(`DATABASE_URL=${NEON_CONNECTION_STRING}`);
    hasDatabaseUrl = true;
    console.log('✅ Đã cập nhật DATABASE_URL');
  } else {
    newLines.push(line);
  }
});

// Nếu chưa có DATABASE_URL, thêm vào
if (!hasDatabaseUrl) {
  newLines.push(`DATABASE_URL=${NEON_CONNECTION_STRING}`);
  console.log('✅ Đã thêm DATABASE_URL');
}

// Ghi lại file
fs.writeFileSync(envPath, newLines.join('\n'), 'utf8');

console.log('\n📋 Connection string mới:');
console.log(`DATABASE_URL=${NEON_CONNECTION_STRING.replace(/:[^:@]+@/, ':****@')}`);

console.log('\n💡 Bước tiếp theo:');
console.log('1. Restart backend: cd services/core && npm run dev');
console.log('2. Chạy migrations: npx prisma migrate deploy');
console.log('3. Test: node test-api.js');

