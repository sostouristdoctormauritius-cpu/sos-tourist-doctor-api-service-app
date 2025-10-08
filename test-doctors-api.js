const fetch = require('node-fetch').default;

async function testDoctorsAPI() {
  try {
    console.log('Testing doctors list API...');
    
    // First, let's login as admin to get an access token
    const loginResponse = await fetch('http://localhost:3000/v1/auth/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Test-Script'
      },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'Admin123!'
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (!loginResponse.ok) {
      console.error('Admin login failed:', loginData.message);
      return;
    }
    
    const accessToken = loginData.access_token;
    console.log('Admin login successful. Access token obtained.');
    
    // Now test the doctors list API
    const doctorsResponse = await fetch('http://localhost:3000/v1/doctors', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Test-Script'
      }
    });
    
    const doctorsData = await doctorsResponse.json();
    
    console.log('Doctors API Response Status:', doctorsResponse.status);
    console.log('Doctors API Response Headers:', [...doctorsResponse.headers].reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {}));
    
    if (doctorsResponse.ok) {
      console.log('✅ Doctors list API is working!');
      console.log(`Found ${doctorsData.results.length} doctors`);
      console.log('First doctor:', JSON.stringify(doctorsData.results[0], null, 2));
    } else {
      console.log('❌ Doctors list API failed!');
      console.log('Error:', doctorsData.message || doctorsData);
    }
    
    // Also test the public doctors endpoint
    console.log('\n--- Testing Public Doctors Endpoint ---');
    const publicDoctorsResponse = await fetch('http://localhost:3000/v1/doctors/public/all', {
      method: 'GET',
      headers: {
        'User-Agent': 'Test-Script'
      }
    });
    
    const publicDoctorsData = await publicDoctorsResponse.json();
    
    console.log('Public Doctors API Response Status:', publicDoctorsResponse.status);
    
    if (publicDoctorsResponse.ok) {
      console.log('✅ Public doctors list API is working!');
      console.log(`Found ${publicDoctorsData.results.length} doctors in public endpoint`);
      console.log('First doctor in public list:', JSON.stringify(publicDoctorsData.results[0], null, 2));
    } else {
      console.log('❌ Public doctors list API failed!');
      console.log('Error:', publicDoctorsData.message || publicDoctorsData);
    }
    
  } catch (error) {
    console.error('Error during doctors API test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDoctorsAPI();