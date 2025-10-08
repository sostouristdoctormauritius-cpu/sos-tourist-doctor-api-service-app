const fetch = require('node-fetch').default;

async function testAdminLogin() {
  try {
    console.log('Testing admin login with credentials: admin@example.com / Admin123!');
    
    const response = await fetch('http://localhost:3000/v1/auth/admin/login', {
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
    
    const data = await response.json();
    
    console.log('Response Status:', response.status);
    console.log('Response Data:', JSON.stringify(data, null, 2));
    
    if (response.ok) {
      console.log('✅ Admin login successful!');
    } else {
      console.log('❌ Admin login failed!');
    }
  } catch (error) {
    console.error('Error during admin login test:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

testAdminLogin();