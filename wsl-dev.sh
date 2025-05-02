#!/bin/bash

# Get the current directory
CURRENT_DIR=$(pwd)
echo "Current directory: $CURRENT_DIR"

# Set proper environment variables for Node.js
export NODE_OPTIONS="--no-warnings"
export NEXT_TELEMETRY_DISABLED=1

# Check for node_modules/.bin/next
if [ ! -f "./node_modules/.bin/next" ]; then
  echo "Next.js binary not found. Checking if we need to reinstall..."
  
  if [ ! -d "node_modules/next" ]; then
    echo "Next.js not found in node_modules. Installing..."
    npm install next@latest --save
  else
    echo "Next.js folder exists but binary is missing. This could indicate a broken installation."
    echo "Reinstalling Next.js..."
    npm install next@latest --save
  fi
fi

# Try to run Next.js development server
echo "Starting Next.js development server..."
echo "If you encounter errors, try running: bash fix-next-installation.sh"

# Use the Node.js directly to run next to avoid path issues
node ./node_modules/next/dist/bin/next dev 