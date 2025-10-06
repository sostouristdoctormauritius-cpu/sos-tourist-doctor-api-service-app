const bcrypt = require('bcryptjs');

const password = 'Password123';
const saltRounds = 8; // Using the same salt rounds as in the existing hashes

bcrypt.hash(password, saltRounds).then(function(hash) {
  console.log('Password:', password);
  console.log('Hash:', hash);
});
