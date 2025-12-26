// Test Requests API
const baseUrl = 'http://localhost:4000';

// Test 1: Get all requests (no auth required for GET)
async function testGetRequests() {
  try {
    console.log('\n=== Test 1: GET /api/requests ===');
    const response = await fetch(`${baseUrl}/api/requests`);
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    console.log('Number of requests:', Array.isArray(data) ? data.length : 'Not an array');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\nFirst request:');
      console.log('- ID:', data[0].id);
      console.log('- Type:', data[0].type);
      console.log('- Status:', data[0].status);
      console.log('- Sender:', data[0].sender?.fullName || 'N/A');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Test 2: Get requests with Assistant user ID
async function testGetRequestsWithAuth() {
  try {
    console.log('\n=== Test 2: GET /api/requests with x-user-id ===');
    // Replace with actual assistant user ID
    const assistantId = process.env.ASSISTANT_ID || 'YOUR_ASSISTANT_ID';
    
    const response = await fetch(`${baseUrl}/api/requests`, {
      headers: {
        'x-user-id': assistantId
      }
    });
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run tests
(async () => {
  await testGetRequests();
  // await testGetRequestsWithAuth(); // Uncomment if you have assistant ID
})();














