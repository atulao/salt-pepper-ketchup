// start-dev.js
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Starting Next.js development server...');

// Determine the actual directory we're in
const currentDir = process.cwd();
console.log(`Current directory: ${currentDir}`);

// Check if the node_modules directory exists
const nodeModulesPath = path.join(currentDir, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.error(`Error: node_modules directory not found at ${nodeModulesPath}`);
  console.log('This may be due to running from a UNC path (\\\\wsl.localhost\\...)');
  console.log('Please open a WSL terminal and run commands directly inside of WSL.');
  console.log('\nTry running these commands in a WSL terminal:');
  console.log('cd ~/salt-pepper-ketchup');
  console.log('npm run dev');
  process.exit(1);
}

// Get the absolute path to next cli
const nextBinPath = path.join(nodeModulesPath, '.bin', 'next');
console.log(`Using Next.js binary: ${nextBinPath}`);

// Check if the Next.js binary exists
if (!fs.existsSync(nextBinPath)) {
  console.error(`Error: Next.js binary not found at ${nextBinPath}`);
  console.log('Try reinstalling dependencies:');
  console.log('npm install');
  process.exit(1);
}

// Spawn next dev process
try {
  console.log('Attempting to start Next.js development server...');
  const nextProcess = spawn('node', [nextBinPath, 'dev'], {
    stdio: 'inherit',
    shell: true
  });

  nextProcess.on('error', (err) => {
    console.error('Failed to start Next.js server:', err);
  });

  nextProcess.on('close', (code) => {
    console.log(`Next.js server exited with code ${code}`);
  });
} catch (error) {
  console.error('Error starting Next.js:', error);
} 