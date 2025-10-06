const jwt = require('jsonwebtoken');

// Use the JWT secret from Supabase
const jwtSecret = 'super-secret-jwt-token-with-at-least-32-characters-long';

// Create a new service role token
const payload = {
  iss: 'supabase-demo',
  role: 'service_role',
  exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365) // 1 year expiration
};

console.log('Generating new service role key...');
console.log('Payload:', payload);

const newServiceRoleKey = jwt.sign(payload, jwtSecret, { algorithm: 'HS256' });
console.log('New service role key:', newServiceRoleKey);

// Test the new key
try {
  const verified = jwt.verify(newServiceRoleKey, jwtSecret);
  console.log('New key verified successfully:', verified);
} catch (error) {
  console.error('New key verification failed:', error.message);
}
