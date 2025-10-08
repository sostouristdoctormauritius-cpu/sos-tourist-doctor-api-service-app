const http = require('http');

function testDoctorsAPI() {
  // First login as admin
  const loginData = JSON.stringify({
    email: 'admin@example.com',
    password: 'Admin123!'
  });

  const loginOptions = {
    hostname: 'localhost',
    port: 3000,
    path: '/v1/auth/admin/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData)
    }
  };

  const loginReq = http.request(loginOptions, (res) => {
    let loginResponseData = '';
    
    res.on('data', (chunk) => {
      loginResponseData += chunk;
    });
    
    res.on('end', () => {
      try {
        const loginResult = JSON.parse(loginResponseData);
        console.log('Login Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          console.log('Login successful');
          const accessToken = loginResult.access_token;
          
          // Now get doctors list
          const doctorsOptions = {
            hostname: 'localhost',
            port: 3000,
            path: '/v1/doctors?limit=5',
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          };
          
          const doctorsReq = http.request(doctorsOptions, (res) => {
            let doctorsResponseData = '';
            
            res.on('data', (chunk) => {
              doctorsResponseData += chunk;
            });
            
            res.on('end', () => {
              try {
                const doctorsResult = JSON.parse(doctorsResponseData);
                console.log('Doctors API Status:', res.statusCode);
                console.log('Total doctors found:', doctorsResult.totalResults);
                console.log('Page:', doctorsResult.page, 'of', doctorsResult.totalPages);
                console.log('Doctors in this page:', doctorsResult.results?.length || 0);
                
                if (doctorsResult.results && doctorsResult.results.length > 0) {
                  console.log('\nFirst doctor:');
                  console.log(JSON.stringify(doctorsResult.results[0], null, 2));
                } else {
                  console.log('No doctors found');
                }
              } catch (error) {
                console.error('Error parsing doctors response:', error.message);
                console.error('Response data:', doctorsResponseData);
              } finally {
                process.exit(0);
              }
            });
          });
          
          doctorsReq.on('error', (error) => {
            console.error('Error getting doctors:', error.message);
            process.exit(1);
          });
          
          doctorsReq.end();
        } else {
          console.log('Login failed:', loginResult.message);
          process.exit(1);
        }
      } catch (error) {
        console.error('Error parsing login response:', error.message);
        console.error('Response data:', loginResponseData);
        process.exit(1);
      }
    });
  });

  loginReq.on('error', (error) => {
    console.error('Login error:', error.message);
    process.exit(1);
  });

  loginReq.write(loginData);
  loginReq.end();
}

// Run the test
testDoctorsAPI();