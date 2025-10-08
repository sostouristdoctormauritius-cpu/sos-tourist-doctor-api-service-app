const http = require('http');

// Function to make HTTP requests
function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: JSON.parse(data)
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (e) => {
      reject(e);
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testDoctorsAPI() {
  try {
    console.log('Testing doctors list API...\n');
    
    // 1. Login as admin first
    console.log('1. Logging in as admin...');
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/auth/admin/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': JSON.stringify({
          email: 'admin@example.com',
          password: 'Admin123!'
        }).length
      }
    }, JSON.stringify({
      email: 'admin@example.com',
      password: 'Admin123!'
    }));
    
    console.log('Login Status:', loginResponse.statusCode);
    
    if (loginResponse.statusCode !== 200) {
      console.error('❌ Admin login failed:', loginResponse.data.message || loginResponse.data);
      return;
    }
    
    const accessToken = loginResponse.data.access_token;
    console.log('✅ Admin login successful.\n');
    
    // 2. Test the public doctors endpoint (no authentication required)
    console.log('2. Testing public doctors endpoint...');
    const publicDoctorsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/doctors/public/all',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Public Doctors API Status:', publicDoctorsResponse.statusCode);
    
    if (publicDoctorsResponse.statusCode === 200) {
      console.log('✅ Public doctors list API is working!');
      console.log('Total doctors found:', publicDoctorsResponse.data.totalResults);
      console.log('Page:', publicDoctorsResponse.data.page, 'of', publicDoctorsResponse.data.totalPages);
      console.log('Doctors in this page:', publicDoctorsResponse.data.results?.length || 0);
      
      if (publicDoctorsResponse.data.results && publicDoctorsResponse.data.results.length > 0) {
        console.log('\nFirst doctor:');
        console.log(JSON.stringify(publicDoctorsResponse.data.results[0], null, 2));
      } else {
        console.log('No doctors found in public list');
      }
    } else {
      console.log('❌ Public doctors list API failed!');
      console.log('Error:', publicDoctorsResponse.data.message || publicDoctorsResponse.data);
    }
    
    // 3. Test the authenticated doctors endpoint
    console.log('\n3. Testing authenticated doctors endpoint...');
    const doctorsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/doctors',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Doctors API Status:', doctorsResponse.statusCode);
    
    if (doctorsResponse.statusCode === 200) {
      console.log('✅ Doctors list API is working!');
      console.log('Total doctors found:', doctorsResponse.data.totalResults);
      console.log('Page:', doctorsResponse.data.page, 'of', doctorsResponse.data.totalPages);
      console.log('Doctors in this page:', doctorsResponse.data.results?.length || 0);
      
      if (doctorsResponse.data.results && doctorsResponse.data.results.length > 0) {
        console.log('\nFirst doctor:');
        console.log(JSON.stringify(doctorsResponse.data.results[0], null, 2));
      } else {
        console.log('No doctors found in authenticated list');
      }
    } else {
      console.log('❌ Doctors list API failed!');
      console.log('Error:', doctorsResponse.data.message || doctorsResponse.data);
    }
    
  } catch (error) {
    console.error('Error during API test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testDoctorsAPI();