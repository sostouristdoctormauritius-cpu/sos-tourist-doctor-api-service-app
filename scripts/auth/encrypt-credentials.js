const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Encryption password (in a real scenario, this should be a strong password)
const encryptionPassword = 'sos-doctor-credentials-backup-2025';

// Function to encrypt text
function encrypt(text, password) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'GfG', 32);
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return {
    iv: iv.toString('hex'),
    encryptedData: encrypted
  };
}

// Read the credentials backup file
const credentialsPath = path.join(__dirname, 'SECURE_CREDENTIALS_BACKUP.txt');
const credentialsContent = fs.readFileSync(credentialsPath, 'utf8');

// Encrypt the content
const encryptedCredentials = encrypt(credentialsContent, encryptionPassword);

// Save encrypted credentials to a file
const encryptedOutput = {
  algorithm: 'aes-256-cbc',
  ...encryptedCredentials
};

const encryptedPath = path.join(__dirname, 'SECURE_CREDENTIALS_BACKUP.encrypted');
fs.writeFileSync(encryptedPath, JSON.stringify(encryptedOutput, null, 2));

console.log('Credentials encrypted and saved to:', encryptedPath);
console.log('\nTo decrypt, use the decrypt-credentials.js script with the password:');
console.log('node decrypt-credentials.js');
