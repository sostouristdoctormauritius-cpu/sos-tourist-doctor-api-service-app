#!/usr/bin/env node

/**
 * Production Preparation Script
 * 
 * This script prepares the application for production deployment by:
 * 1. Ensuring all required environment variables are set
 * 2. Checking that critical files exist
 * 3. Running final validation checks
 * 4. Cleaning up unnecessary files
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Preparing application for production deployment...\n');

// Check if required environment variables are set
const requiredEnvVars = [
  'NODE_ENV',
  'JWT_SECRET',
  'SUPABASE_URL',
  'SUPABASE_KEY',
  'DATABASE_URL'
];

console.log('🔍 Checking environment variables...');
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`   - ${envVar}`));
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set');
}

// Check if critical files exist
const criticalFiles = [
  'package.json',
  'src/app.js',
  'src/index.js',
  'api/index.js'
];

console.log('\n🔍 Checking critical files...');
const missingFiles = criticalFiles.filter(file => {
  return !fs.existsSync(path.join(__dirname, '../../', file));
});

if (missingFiles.length > 0) {
  console.error('❌ Missing critical files:');
  missingFiles.forEach(file => console.error(`   - ${file}`));
  process.exit(1);
} else {
  console.log('✅ All critical files are present');
}

// Check if node_modules exists
console.log('\n🔍 Checking dependencies...');
if (!fs.existsSync(path.join(__dirname, '../../', 'node_modules'))) {
  console.log('⚠️  node_modules not found. Please run "npm install" before deployment.');
} else {
  console.log('✅ Dependencies are installed');
}

// Check production-specific files
const productionFiles = [
  '.env.production',
  'Dockerfile',
  'vercel.json'
];

console.log('\n🔍 Checking production configuration files...');
const missingProductionFiles = productionFiles.filter(file => {
  return !fs.existsSync(path.join(__dirname, '../../', file));
});

if (missingProductionFiles.length > 0) {
  console.warn('⚠️  Missing production configuration files:');
  missingProductionFiles.forEach(file => console.warn(`   - ${file}`));
} else {
  console.log('✅ All production configuration files are present');
}

console.log('\n✅ Production preparation check completed successfully!');
console.log('\n📝 Next steps:');
console.log('   1. Review all environment variables in .env.production');
console.log('   2. Run tests with "npm test"');
console.log('   3. Build and deploy using your preferred method:');
console.log('      - Vercel: "vercel --prod"');
console.log('      - Docker: "docker build -t app ." and "docker run app"');
console.log('      - Direct: "npm run prod"');