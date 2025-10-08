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

async function checkDoctorsInDB() {
  try {
    console.log('Checking doctors in database...\n');
    
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
    
    // 2. Test the admin doctors endpoint (no filter for is_listed)
    console.log('2. Testing admin doctors endpoint (should show all doctors)...');
    const adminDoctorsResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/doctors/admin/all',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Admin Doctors API Status:', adminDoctorsResponse.statusCode);
    
    if (adminDoctorsResponse.statusCode === 200) {
      console.log('✅ Admin doctors list API is working!');
      console.log('Total doctors found:', adminDoctorsResponse.data.totalResults);
      console.log('Page:', adminDoctorsResponse.data.page, 'of', adminDoctorsResponse.data.totalPages);
      console.log('Doctors in this page:', adminDoctorsResponse.data.results?.length || 0);
      
      if (adminDoctorsResponse.data.results && adminDoctorsResponse.data.results.length > 0) {
        console.log('\nFirst doctor:');
        console.log(JSON.stringify(adminDoctorsResponse.data.results[0], null, 2));
      } else {
        console.log('No doctors found in admin list');
      }
    } else {
      console.log('❌ Admin doctors list API failed!');
      console.log('Error:', adminDoctorsResponse.data.message || adminDoctorsResponse.data);
    }
    
    // 3. Test getting all users to see what's in the database
    console.log('\n3. Testing all users endpoint...');
    const usersResponse = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/v1/users',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Users API Status:', usersResponse.statusCode);
    
    if (usersResponse.statusCode === 200) {
      console.log('✅ Users list API is working!');
      console.log('Total users found:', usersResponse.data.totalResults);
      console.log('Page:', usersResponse.data.page, 'of', usersResponse.data.totalPages);
      console.log('Users in this page:', usersResponse.data.results?.length || 0);
      
      if (usersResponse.data.results && usersResponse.data.results.length > 0) {
        console.log('\nAll users:');
        usersResponse.data.results.forEach((user, index) => {
          console.log(`${index+1}. ${user.email} (${user.role})`);
        });
      } else {
        console.log('No users found');
      }
    } else {
      console.log('❌ Users list API failed!');
      console.log('Error:', usersResponse.data.message || usersResponse.data);
    }
    
  } catch (error) {
    console.error('Error during API test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
checkDoctorsInDB();