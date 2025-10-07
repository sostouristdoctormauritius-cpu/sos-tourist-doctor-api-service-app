const bcrypt = require('bcryptjs');

// Hash from the database for admin user (updated)
const storedHash = '$2a$08$/DqZwBeu2ap.q8xlg8iIguIcLbXauM/zSJU9pkddqDyDOxVUanO6.';

// Test passwords
const testPasswords = ['Admin123!', 'Password123', 'password', 'admin'];

console.log('Verifying admin user password hash...');
console.log('Stored hash:', storedHash);

for (const password of testPasswords) {
  const isMatch = bcrypt.compareSync(password, storedHash);
  console.log(`Password "${password}": ${isMatch ? 'MATCH' : 'NO MATCH'}`);
}

// Also test the provided hash for Admin123!
const admin123Hash = '$2a$08$/gTWyCfh3Mb73C9q6YwIQ.waahHc6T4Jc6afdICF/qJnDRAiZW4R.';
const isAdmin123Match = bcrypt.compareSync('Admin123!', admin123Hash);
console.log(`\nAdmin123! hash verification: ${isAdmin123Match ? 'MATCH' : 'NO MATCH'}`);
