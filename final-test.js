const axios = require('axios');

async function testEndpoints() {
  console.log('Testing doctors endpoints...\n');
  
  try {
    // Test public endpoint
    console.log('1. Testing public doctors endpoint...');
    const publicResponse = await axios.get('http://localhost:3000/v1/doctors/public/all');
    console.log('✅ Public endpoint working - Status:', publicResponse.status);
    console.log('   Doctors found:', publicResponse.data.results.length);
    console.log('');
    
    // Test admin endpoint without authentication (should fail with 401)
    console.log('2. Testing admin doctors endpoint without auth...');
    try {
      const adminResponse = await axios.get('http://localhost:3000/v1/doctors');
      console.log('❌ Admin endpoint should require authentication but got status:', adminResponse.status);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Admin endpoint correctly requires authentication - Status:', error.response.status);
      } else {
        console.log('❌ Unexpected error status:', error.response ? error.response.status : 'Unknown');
        console.log('   Error message:', error.message);
      }
    }
    
    console.log('\n🎉 All tests completed!');
  } catch (error) {
    console.log('❌ Error during testing:', error.message);
  }
}

testEndpoints();