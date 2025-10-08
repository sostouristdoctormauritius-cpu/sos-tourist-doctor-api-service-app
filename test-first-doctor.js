const fetch = require('node-fetch').default;

async function testFirstDoctorAPI() {
  try {
    console.log('Testing doctors list API to get first doctor...\n');
    
    // Login as admin
    console.log('Logging in as admin...');
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
      console.error('❌ Admin login failed:', loginData.message);
      return;
    }
    
    const accessToken = loginData.access_token;
    console.log('✅ Admin login successful.\n');
    
    // Get the first doctor
    console.log('Fetching first doctor...');
    const doctorsResponse = await fetch('http://localhost:3000/v1/doctors?limit=1', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Test-Script'
      }
    });
    
    const doctorsData = await doctorsResponse.json();
    
    if (doctorsResponse.ok && doctorsData.results.length > 0) {
      console.log('✅ Doctors API is working!');
      console.log('First doctor data:');
      console.log(JSON.stringify(doctorsData.results[0], null, 2));
    } else if (doctorsResponse.ok) {
      console.log('✅ Doctors API is working but no doctors found.');
    } else {
      console.log('❌ Doctors API failed!');
      console.log('Error:', doctorsData.message || doctorsData);
    }
    
  } catch (error) {
    console.error('Error during API test:', error.message);
  }
}

// Run the test and exit
testFirstDoctorAPI().then(() => {
  process.exit(0);
});