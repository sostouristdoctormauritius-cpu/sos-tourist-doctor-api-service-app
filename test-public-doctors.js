const fetch = require('node-fetch').default;

async function testPublicDoctorsAPI() {
  try {
    console.log('Testing public doctors list API...');
    
    // Test the public doctors endpoint
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
      if (publicDoctorsData.results.length > 0) {
        console.log('First doctor in public list:', JSON.stringify(publicDoctorsData.results[0], null, 2));
      }
    } else {
      console.log('❌ Public doctors list API failed!');
      console.log('Error:', publicDoctorsData.message || publicDoctorsData);
    }
    
  } catch (error) {
    console.error('Error during public doctors API test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testPublicDoctorsAPI();