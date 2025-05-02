const { execSync } = require('child_process');
const path = require('path');

// Get the current directory
const currentDir = process.cwd();

// Convert Windows-style path to WSL path if necessary
let wslPath = currentDir;
if (wslPath.includes('wsl.localhost')) {
  // Already in WSL format, keep as is
  console.log(`Using WSL path: ${wslPath}`);
} else {
  // Convert Windows path to WSL if needed
  console.log('This script needs to be run from within WSL');
  process.exit(1);
}

console.log('Starting Next.js development server...');
try {
  // Use npx to run next directly
  execSync('npx --no-install next dev', { 
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: '--no-warnings' }
  });
} catch (error) {
  console.error('Failed to start Next.js development server:', error);
  process.exit(1);
} 