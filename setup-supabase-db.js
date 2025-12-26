#!/usr/bin/env node

/**
 * Setup Supabase Database qua REST API
 */

const SUPABASE_URL = 'https://ullrhadkkparypdvrqvi.supabase.co';
const SUPABASE_KEY = 'sb_secret_Motu3Pr87mDMkaMm4U6UDg_hsUffdnQ';
const fs = require('fs');
const path = require('path');

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase API connection...');
  
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase API connection: OK');
      return true;
    } else {
      console.log(`❌ Supabase API connection: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Supabase API connection failed: ${error.message}`);
    return false;
  }
}

async function readSchemaSQL() {
  const schemaPath = path.join(__dirname, 'services', 'core', 'schema.sql');
  
  if (!fs.existsSync(schemaPath)) {
    console.log('⚠️  File schema.sql không tồn tại');
    return null;
  }
  
  const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
  console.log(`✅ Đọc schema.sql thành công (${schemaSQL.length} chars)`);
  return schemaSQL;
}

function generateConnectionStrings() {
  console.log('\n📋 Connection Strings để thử:');
  console.log('\n1. Direct connection (port 5432):');
  console.log('   postgresql://postgres:FfoBmn5FJm4irTxE@db.ullrhadkkparypdvrqvi.supabase.co:5432/postgres');
  
  console.log('\n2. Connection pooling (port 6543) - KHUYẾN NGHỊ:');
  console.log('   postgresql://postgres.ullrhadkkparypdvrqvi:FfoBmn5FJm4irTxE@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres');
  
  console.log('\n3. Connection pooling (port 5432):');
  console.log('   postgresql://postgres.ullrhadkkparypdvrqvi:FfoBmn5FJm4irTxE@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres');
}

async function main() {
  console.log('🚀 Supabase Database Setup');
  console.log('===========================\n');
  
  // Test API connection
  const apiOk = await testSupabaseConnection();
  
  // Read schema
  const schemaSQL = await readSchemaSQL();
  
  console.log('\n===========================');
  console.log('📝 Hướng dẫn tạo schema:');
  console.log('===========================\n');
  
  console.log('Supabase không hỗ trợ REST API để chạy SQL trực tiếp.');
  console.log('Bạn cần làm theo các bước sau:\n');
  
  console.log('1. Vào Supabase Dashboard:');
  console.log(`   https://supabase.com/dashboard/project/ullrhadkkparypdvrqvi\n`);
  
  console.log('2. Vào SQL Editor (menu bên trái)\n');
  
  console.log('3. Copy và paste SQL sau vào editor:\n');
  console.log('─'.repeat(60));
  if (schemaSQL) {
    // Hiển thị một phần schema
    const preview = schemaSQL.split('\n').slice(0, 20).join('\n');
    console.log(preview);
    console.log('... (còn nhiều dòng nữa)');
    console.log('─'.repeat(60));
    console.log(`\n   Hoặc đọc file: services/core/schema.sql`);
  } else {
    console.log('   (Đọc file services/core/schema.sql)');
  }
  console.log('\n4. Click "Run" để chạy SQL\n');
  
  console.log('5. Sau khi tạo schema, cập nhật .env với connection string:\n');
  generateConnectionStrings();
  
  console.log('\n6. Test connection string trong .env:\n');
  console.log('   cd services/core');
  console.log('   npm run dev');
  console.log('   # Kiểm tra log xem có lỗi database không\n');
  
  console.log('7. Nếu vẫn timeout, thử connection pooling (port 6543)\n');
  
  console.log('💡 Lưu ý:');
  console.log('   - Supabase có thể block direct connection (port 5432)');
  console.log('   - Nên dùng connection pooling (port 6543)');
  console.log('   - Kiểm tra password trong Supabase Dashboard → Settings → Database');
}

main().catch(console.error);




