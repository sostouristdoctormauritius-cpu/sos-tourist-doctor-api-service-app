const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Encryption password (same as used for encryption)
const decryptionPassword = 'sos-doctor-credentials-backup-2025';

// Function to decrypt text
function decrypt(encryptedData, password, iv) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(password, 'GfG', 32);
  const ivBuffer = Buffer.from(iv, 'hex');

  const decipher = crypto.createDecipheriv(algorithm, key, ivBuffer);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

try {
  // Read the encrypted credentials file
  const encryptedPath = path.join(__dirname, 'SECURE_CREDENTIALS_BACKUP.encrypted');
  const encryptedContent = fs.readFileSync(encryptedPath, 'utf8');
  const encryptedData = JSON.parse(encryptedContent);

  // Decrypt the content
  const decryptedCredentials = decrypt(
    encryptedData.encryptedData,
    decryptionPassword,
    encryptedData.iv
  );

  // Save decrypted credentials to a file
  const decryptedPath = path.join(__dirname, 'SECURE_CREDENTIALS_BACKUP_DECRYPTED.txt');
  fs.writeFileSync(decryptedPath, decryptedCredentials);

  console.log('Credentials decrypted and saved to:', decryptedPath);
  console.log('\nIMPORTANT: Remember to securely delete the decrypted file after use!');

} catch (error) {
  console.error('Error decrypting credentials:', error.message);
  console.log('\nMake sure you have the correct encryption password and encrypted file.');
}
