const fetch = require('node-fetch').default;

async function testPatientsAPI() {
  try {
    console.log('Testing patients list API...');

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

    // Now test the patients list API
    const patientsResponse = await fetch('http://localhost:3000/v1/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Test-Script'
      }
    });

    const patientsData = await patientsResponse.json();

    console.log('Patients API Response Status:', patientsResponse.status);
    console.log('Patients API Response Headers:', [...patientsResponse.headers].reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {}));

    if (patientsResponse.ok) {
      console.log('✅ Patients list API is working!');
      console.log(`Found ${patientsData.results?.length || 0} patients`);
      if (patientsData.results && patientsData.results.length > 0) {
        console.log('First patient:', JSON.stringify(patientsData.results[0], null, 2));
      }
      console.log('Response structure:', Object.keys(patientsData));
    } else {
      console.log('❌ Patients list API failed!');
      console.log('Error:', patientsData.message || patientsData);
    }

    // Also test with role filter for patients specifically
    console.log('\n--- Testing Patients with Role Filter ---');
    const patientsFilteredResponse = await fetch('http://localhost:3000/v1/users?role=user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'Test-Script'
      }
    });

    const patientsFilteredData = await patientsFilteredResponse.json();

    console.log('Filtered Patients API Response Status:', patientsFilteredResponse.status);

    if (patientsFilteredResponse.ok) {
      console.log('✅ Filtered patients list API is working!');
      console.log(`Found ${patientsFilteredData.results?.length || 0} patients with role=user`);
      if (patientsFilteredData.results && patientsFilteredData.results.length > 0) {
        console.log('First filtered patient:', JSON.stringify(patientsFilteredData.results[0], null, 2));
      }
    } else {
      console.log('❌ Filtered patients list API failed!');
      console.log('Error:', patientsFilteredData.message || patientsFilteredData);
    }

  } catch (error) {
    console.error('Error during patients API test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPatientsAPI();
