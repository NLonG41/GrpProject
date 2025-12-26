/**
 * Script to add FIREBASE_PROJECT_ID to .env if missing
 * Extracts project ID from FIREBASE_CLIENT_EMAIL
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found!');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const lines = envContent.split('\n');

// Check if FIREBASE_PROJECT_ID exists
const hasProjectId = lines.some(line => line.trim().startsWith('FIREBASE_PROJECT_ID='));

if (hasProjectId) {
  console.log('✅ FIREBASE_PROJECT_ID already exists in .env');
  process.exit(0);
}

// Extract project ID from FIREBASE_CLIENT_EMAIL
let projectId = 'student-management-datab-bcfb1'; // Default
const clientEmailLine = lines.find(line => line.trim().startsWith('FIREBASE_CLIENT_EMAIL='));

if (clientEmailLine) {
  const match = clientEmailLine.match(/@([^.]+)\.iam\.gserviceaccount\.com/);
  if (match) {
    projectId = match[1];
  }
}

// Add FIREBASE_PROJECT_ID after FIREBASE_CLIENT_EMAIL or at the end
let insertIndex = lines.length;
const clientEmailIndex = lines.findIndex(line => line.trim().startsWith('FIREBASE_CLIENT_EMAIL='));
if (clientEmailIndex !== -1) {
  insertIndex = clientEmailIndex + 1;
}

// Insert the new line
lines.splice(insertIndex, 0, `FIREBASE_PROJECT_ID=${projectId}`);

// Write back to file
fs.writeFileSync(envPath, lines.join('\n'), 'utf8');

console.log('✅ Added FIREBASE_PROJECT_ID to .env');
console.log(`   FIREBASE_PROJECT_ID=${projectId}`);
console.log('\n💡 Please restart your server for changes to take effect.');

