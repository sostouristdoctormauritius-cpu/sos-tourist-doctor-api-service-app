#!/usr/bin/env node

// Post-install script for production optimization
const fs = require('fs');
const path = require('path');

console.log('Post-install script running...');

// In production, we could remove development files, but as requested
// we'll keep all files including environment files and test files
if (process.env.NODE_ENV === 'production') {
  console.log('Production environment detected');
  console.log('Keeping all environment files as requested');
}

console.log('Post-install completed successfully');
