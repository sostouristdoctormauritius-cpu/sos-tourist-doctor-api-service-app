const axios = require('axios');

// Test the doctors API endpoint
async function testDoctorsEndpoint() {
  try {
    console.log('1. Testing public doctors endpoint...');
    
    // First try direct connection to see if the endpoint responds
    const response = await axios.get('http://localhost:3000/v1/doctors/public/all', {
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('Error occurred:');
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
  
  try {
    console.log('\n2. Testing admin doctors endpoint (should show all doctors)...');
    
    // Try the admin endpoint
    const response = await axios.get('http://localhost:3000/v1/doctors/admin/all', {
      timeout: 10000 // 10 seconds timeout
    });
    
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.log('Error occurred:');
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.log('No response received:', error.message);
    } else {
      console.log('Error:', error.message);
    }
  }
}

testDoctorsEndpoint();