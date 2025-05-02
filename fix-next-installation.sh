#!/bin/bash

echo "=== SPK Next.js Reinstallation Helper ==="
echo "This script will help fix Next.js installation issues in WSL"
echo

# Move to a safe location before cleaning
cd /home/jbc/salt-pepper-ketchup

# Save current package.json
echo "Backing up your package.json..."
cp package.json package.json.backup

# Clean up
echo "Cleaning previous installation..."
rm -rf node_modules .next package-lock.json

# Make sure the npm cache is clean
echo "Cleaning npm cache..."
npm cache clean --force

# Install Next.js specifically first
echo "Installing Next.js..."
npm install next@latest --save

# Install other critical dependencies
echo "Installing critical dependencies..."
npm install react react-dom zod @prisma/client next-auth

# Now install all remaining dependencies
echo "Installing all dependencies from package.json..."
npm install

echo
echo "Installation completed. Try running the app with:"
echo "npm run dev"
echo
echo "If you still encounter issues, try using the Windows command prompt"
echo "to run the app instead of WSL." 