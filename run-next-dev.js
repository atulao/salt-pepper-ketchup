#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if node_modules/.bin/next exists
const nextBinPath = path.resolve('./node_modules/.bin/next');
const nextExists = fs.existsSync(nextBinPath);

if (!nextExists) {
  console.log('Next.js binary not found. Make sure you have installed dependencies.');
  console.log('Try running: npm install');
  process.exit(1);
}

console.log('Starting Next.js development server...');
console.log(`Using Next.js from: ${nextBinPath}`);

// Run next dev using the local installation
const nextProcess = spawn(nextBinPath, ['dev'], {
  stdio: 'inherit',
  env: { ...process.env, FORCE_COLOR: '1' }
});

nextProcess.on('error', (err) => {
  console.error('Failed to start Next.js:', err);
});

// Handle clean exit
process.on('SIGINT', () => {
  nextProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  nextProcess.kill('SIGTERM');
}); 