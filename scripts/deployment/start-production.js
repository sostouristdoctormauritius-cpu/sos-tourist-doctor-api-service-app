#!/usr/bin/env node

// Simple production start script
const { exec } = require('child_process');
const path = require('path');

console.log('Starting SOS Tourist Doctor API in production mode...');

// Set environment variables for production
process.env.NODE_ENV = 'production';

// Start the application with PM2 or node
const startCommand = 'node src/index.js';

console.log(`Executing: ${startCommand}`);

const child = exec(startCommand, {
  cwd: process.cwd(),
  env: process.env
});

child.stdout.on('data', (data) => {
  console.log(data.toString());
});

child.stderr.on('data', (data) => {
  console.error(data.toString());
});

child.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
});
