// Test Analytics Dashboard API
const baseUrl = 'http://localhost:4000';
const assistantId = process.argv[2] || 'YOUR_ASSISTANT_USER_ID_HERE';

async function testAnalytics() {
  try {
    console.log('🧪 Testing Analytics Dashboard API...\n');
    console.log(`📍 URL: ${baseUrl}/api/analytics/dashboard`);
    console.log(`👤 Assistant ID: ${assistantId}\n`);

    if (assistantId === 'YOUR_ASSISTANT_USER_ID_HERE') {
      console.error('❌ Please provide an Assistant User ID as argument:');
      console.error('   node test-analytics-api.js <ASSISTANT_USER_ID>');
      process.exit(1);
    }

    const response = await fetch(`${baseUrl}/api/analytics/dashboard`, {
      method: 'GET',
      headers: {
        'x-user-id': assistantId,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ Error:', error);
      return;
    }

    const data = await response.json();
    console.log('✅ Analytics Dashboard Data:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Failed to fetch analytics:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Make sure the backend server is running:');
      console.error('   cd services/core && npm run dev');
    }
  }
}

testAnalytics();
