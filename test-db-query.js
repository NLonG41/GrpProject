/**
 * Test PostgreSQL Database Connection và Query
 * Run: node test-db-query.js
 */

const { Pool } = require('pg');

const connectionString = 'postgresql://neondb_owner:npg_f9RsDuCeHqZ7@ep-calm-water-a1d2bcmu-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testDatabase() {
  console.log('🔍 Testing PostgreSQL Database Connection...\n');
  
  try {
    // Test connection
    console.log('⏳ Step 1: Testing connection...');
    const client = await pool.connect();
    console.log('✅ Step 1: Connected successfully!\n');
    
    // Get all tables
    console.log('⏳ Step 2: Getting all tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('✅ Step 2: Tables found:', tablesResult.rows.length);
    tablesResult.rows.forEach((row, index) => {
      console.log(`   ${index + 1}. ${row.table_name}`);
    });
    console.log('');
    
    // Get users
    console.log('⏳ Step 3: Getting all users...');
    const usersResult = await client.query(`
      SELECT id, email, role, "fullName", "studentCode", cohort, major
      FROM "User"
      ORDER BY "createdAt" DESC
      LIMIT 10;
    `);
    console.log(`✅ Step 3: Found ${usersResult.rows.length} users:\n`);
    usersResult.rows.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.role})`);
      console.log(`      Name: ${user.fullName}`);
      if (user.studentCode) console.log(`      Student Code: ${user.studentCode}`);
      if (user.cohort) console.log(`      Cohort: ${user.cohort}`);
      if (user.major) console.log(`      Major: ${user.major}`);
      console.log('');
    });
    
    // Get subjects
    console.log('⏳ Step 4: Getting all subjects...');
    const subjectsResult = await client.query(`
      SELECT id, name, credits, faculty
      FROM "Subject"
      ORDER BY name
      LIMIT 10;
    `);
    console.log(`✅ Step 4: Found ${subjectsResult.rows.length} subjects:\n`);
    subjectsResult.rows.forEach((subject, index) => {
      console.log(`   ${index + 1}. ${subject.name} (${subject.credits} credits) - ${subject.faculty}`);
    });
    console.log('');
    
    // Get rooms
    console.log('⏳ Step 5: Getting all rooms...');
    const roomsResult = await client.query(`
      SELECT id, name, capacity, location, "isMaintenance"
      FROM "Room"
      ORDER BY name
      LIMIT 10;
    `);
    console.log(`✅ Step 5: Found ${roomsResult.rows.length} rooms:\n`);
    roomsResult.rows.forEach((room, index) => {
      console.log(`   ${index + 1}. ${room.name} (Capacity: ${room.capacity}) - ${room.location}`);
      if (room.isMaintenance) console.log(`      ⚠️ Under maintenance`);
    });
    console.log('');
    
    // Get classes
    console.log('⏳ Step 6: Getting all classes...');
    const classesResult = await client.query(`
      SELECT c.id, c.name, c."maxCapacity", c."currentEnrollment", c."isActive",
             s.name as subject_name, u."fullName" as lecturer_name
      FROM "Class" c
      LEFT JOIN "Subject" s ON c."subjectId" = s.id
      LEFT JOIN "User" u ON c."lecturerId" = u.id
      ORDER BY c."createdAt" DESC
      LIMIT 10;
    `);
    console.log(`✅ Step 6: Found ${classesResult.rows.length} classes:\n`);
    classesResult.rows.forEach((cls, index) => {
      console.log(`   ${index + 1}. ${cls.name}`);
      console.log(`      Subject: ${cls.subject_name || 'N/A'}`);
      console.log(`      Lecturer: ${cls.lecturer_name || 'N/A'}`);
      console.log(`      Enrollment: ${cls.currentEnrollment}/${cls.maxCapacity}`);
      console.log(`      Status: ${cls.isActive ? 'Active' : 'Inactive'}`);
      console.log('');
    });
    
    // Count records
    console.log('⏳ Step 7: Counting records...');
    const counts = await Promise.all([
      client.query('SELECT COUNT(*) as count FROM "User"'),
      client.query('SELECT COUNT(*) as count FROM "Subject"'),
      client.query('SELECT COUNT(*) as count FROM "Room"'),
      client.query('SELECT COUNT(*) as count FROM "Class"'),
      client.query('SELECT COUNT(*) as count FROM "Request"'),
    ]);
    
    console.log('✅ Step 7: Record counts:');
    console.log(`   Users: ${counts[0].rows[0].count}`);
    console.log(`   Subjects: ${counts[1].rows[0].count}`);
    console.log(`   Rooms: ${counts[2].rows[0].count}`);
    console.log(`   Classes: ${counts[3].rows[0].count}`);
    console.log(`   Requests: ${counts[4].rows[0].count}`);
    console.log('');
    
    client.release();
    console.log('✅ All tests completed successfully!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('   Code:', error.code);
    if (error.detail) console.error('   Detail:', error.detail);
    process.exit(1);
  }
}

testDatabase();

