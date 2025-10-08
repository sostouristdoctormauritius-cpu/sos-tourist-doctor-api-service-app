const fetch = require('node-fetch').default;

async function testDoctorsListAPI() {
  try {
    console.log('Testing doctors list API...\n');
    
    // Check if we already have an access token in localStorage-like variable
    let accessToken = null;
    
    // If no token, login as admin
    if (!accessToken) {
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
      
      accessToken = loginData.access_token;
      console.log('✅ Admin login successful. Access token obtained.\n');
    }
    
    // Test the doctors list API
    console.log('Fetching doctors list...');
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
      console.log(`Page: ${doctorsData.page} of ${doctorsData.totalPages}`);
      console.log(`Total records: ${doctorsData.totalResults}`);
      
      if (doctorsData.results.length > 0) {
        console.log('\nFirst 3 doctors:');
        doctorsData.results.slice(0, 3).forEach((doctor, index) => {
          console.log(`  ${index + 1}. ${doctor.name} (${doctor.email}) - ${doctor.role}`);
        });
        
        if (doctorsData.results.length > 3) {
          console.log(`  ... and ${doctorsData.results.length - 3} more`);
        }
      } else {
        console.log('No doctors found in the database.');
      }
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
      console.log(`Total public doctors found: ${publicDoctorsData.results.length}`);
      console.log(`Page: ${publicDoctorsData.page} of ${publicDoctorsData.totalPages}`);
      console.log(`Total records: ${publicDoctorsData.totalResults}`);
      
      if (publicDoctorsData.results.length > 0) {
        console.log('\nFirst 3 public doctors:');
        publicDoctorsData.results.slice(0, 3).forEach((doctor, index) => {
          console.log(`  ${index + 1}. ${doctor.name} (${doctor.email}) - ${doctor.role}`);
        });
        
        if (publicDoctorsData.results.length > 3) {
          console.log(`  ... and ${publicDoctorsData.results.length - 3} more`);
        }
      } else {
        console.log('No public doctors found in the database.');
      }
    } else {
      console.log('❌ Public doctors list API failed!');
      console.log('Error:', publicDoctorsData.message || publicDoctorsData);
    }
    
  } catch (error) {
    console.error('Error during doctors list API test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testDoctorsListAPI();