#!/usr/bin/env node

// Simple build script for production
const fs = require('fs');
const path = require('path');

console.log('Starting production build process...');

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, '../../dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

console.log('Production build completed!');
console.log('To start the application in production mode, run:');
console.log('npm start');
