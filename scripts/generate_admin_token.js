const jwt = require('jsonwebtoken');
const config = require('../src/config/config');

// Use the same JWT secret from the config
const jwtSecret = config.jwt.secret;

// Create a payload for an admin user with the correct token type
const payload = {
  sub: 'admin-user-id', // This matches the hardcoded admin user in passport.js
  role: 'admin',
  type: 'access', // This is required by the auth middleware
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
};

// Generate the token
const token = jwt.sign(payload, jwtSecret);

console.log('Generated admin token:');
console.log(token);
console.log('\nYou can use this token in your API requests by adding the header:');
console.log(`Authorization: Bearer ${token}`);
