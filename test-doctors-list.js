const fetch = require('node-fetch').default;

async function testDoctorsList() {
  try {
    console.log('Testing doctors list API...');
    
    // Try to get stored tokens
    let accessToken = null;
    
    // In a real browser environment, we would check localStorage
    // For this Node.js script, we'll need to login each time
    
    console.log('Logging in as admin...');
    
    // Login as admin to get access token
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
    
    accessToken = loginData.access_token;
    console.log('✅ Admin login successful. Access token obtained.');
    
    // Test the doctors list API
    console.log('\n--- Testing Doctors List API ---');
    const doctorsResponse = await fetch('http://localhost:3000/v1/doctors', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Test-Script'
      }
    });
    
    const doctorsData = await doctorsResponse.json();
    
    console.log('Doctors API Response Status:', doctorsResponse.status);
    
    if (doctorsResponse.ok) {
      console.log('✅ Doctors list API is working!');
      console.log(`Total doctors found: ${doctorsData.results.length}`);
      console.log(`Page: ${doctorsData.page}`);
      console.log(`Limit: ${doctorsData.limit}`);
      console.log(`Total results: ${doctorsData.totalResults}`);
      
      if (doctorsData.results.length > 0) {
        console.log('\nFirst few doctors:');
        doctorsData.results.slice(0, 3).forEach((doctor, index) => {
          console.log(`${index + 1}. ${doctor.name} (${doctor.email}) - ${doctor.specialization || 'No specialization'}`);
        });
      }
    } else {
      console.log('❌ Doctors list API failed!');
      console.log('Error:', doctorsData.message || doctorsData);
    }
    
    // Test the public doctors endpoint as well
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
      console.log(`Total public doctors found: ${publicDoctorsData.results.length}`);
      console.log(`Page: ${publicDoctorsData.page}`);
      console.log(`Limit: ${publicDoctorsData.limit}`);
      console.log(`Total results: ${publicDoctorsData.totalResults}`);
      
      if (publicDoctorsData.results.length > 0) {
        console.log('\nFirst few public doctors:');
        publicDoctorsData.results.slice(0, 3).forEach((doctor, index) => {
          console.log(`${index + 1}. ${doctor.name} (${doctor.email}) - ${doctor.specialization || 'No specialization'}`);
        });
      }
    } else {
      console.log('❌ Public doctors list API failed!');
      console.log('Error:', publicDoctorsData.message || publicDoctorsData);
    }
    
  } catch (error) {
    console.error('Error during doctors list test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDoctorsList();