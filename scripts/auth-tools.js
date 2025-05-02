#!/usr/bin/env node

/**
 * Authentication Tools Script
 * 
 * This script provides easy access to authentication diagnostic tools
 * and troubleshooting resources for the SPK application.
 * 
 * Usage: node scripts/auth-tools.js
 */

const { execSync } = require('child_process');
const readline = require('readline');
const open = require('open');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Helper to format menu items
function formatMenuItem(num, text, highlight = false) {
  return highlight 
    ? `\x1b[1m\x1b[33m[${num}]\x1b[0m \x1b[1m${text}\x1b[0m`
    : `\x1b[33m[${num}]\x1b[0m ${text}`;
}

// Helper to clear screen
function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[0f');
  console.log('\x1b[1m\x1b[36m=== SPK Authentication Tools ===\x1b[0m\n');
}

// Show the main menu
function showMainMenu() {
  clearScreen();
  
  console.log('Choose an option:\n');
  console.log(formatMenuItem(1, 'Verify environment variables'));
  console.log(formatMenuItem(2, 'Open authentication debug page in browser'));
  console.log(formatMenuItem(3, 'Open LinkedIn config checker in browser'));
  console.log(formatMenuItem(4, 'View authentication troubleshooting guide'));
  console.log(formatMenuItem(5, 'View LinkedIn auth guide'));
  console.log(formatMenuItem(6, 'Create a basic .env.local file'));
  console.log(formatMenuItem(7, 'Start development server'));
  console.log(formatMenuItem(0, 'Exit'));
  
  rl.question('\nOption: ', (answer) => {
    handleMenuOption(answer.trim());
  });
}

// Handle menu options
function handleMenuOption(option) {
  switch(option) {
    case '1':
      verifyEnvironmentVars();
      break;
    case '2':
      openDebugPage();
      break;
    case '3':
      openLinkedInConfigChecker();
      break;
    case '4':
      viewTroubleshootingGuide();
      break;
    case '5':
      viewLinkedInGuide();
      break;
    case '6':
      createEnvFile();
      break;
    case '7':
      startDevelopmentServer();
      break;
    case '0':
      rl.close();
      console.log('\nExiting...');
      process.exit(0);
      break;
    default:
      console.log('\x1b[31mInvalid option, try again.\x1b[0m');
      setTimeout(showMainMenu, 1500);
  }
}

// Verify environment variables
function verifyEnvironmentVars() {
  clearScreen();
  console.log('\x1b[1mVerifying environment variables...\x1b[0m\n');
  
  try {
    execSync('node scripts/verify-social-auth-env.js', { stdio: 'inherit' });
  } catch (error) {
    console.error('\x1b[31mError executing verification script:\x1b[0m', error.message);
  }
  
  console.log('\n');
  rl.question('Press Enter to continue...', () => {
    showMainMenu();
  });
}

// Open debug page in browser
function openDebugPage() {
  clearScreen();
  console.log('\x1b[1mOpening authentication debug page in browser...\x1b[0m\n');
  
  const devServerRunning = isDevServerRunning();
  
  if (!devServerRunning) {
    console.log('\x1b[33mDevelopment server is not running.\x1b[0m');
    console.log('Start the server with: npm run dev');
    
    rl.question('\nDo you want to start the development server? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        startDevelopmentServer();
        
        // Give server time to start
        setTimeout(() => {
          open('http://localhost:3000/auth/debug');
          
          rl.question('\nPress Enter to continue...', () => {
            showMainMenu();
          });
        }, 5000);
      } else {
        showMainMenu();
      }
    });
  } else {
    open('http://localhost:3000/auth/debug');
    
    rl.question('\nPress Enter to continue...', () => {
      showMainMenu();
    });
  }
}

// Open LinkedIn config checker
function openLinkedInConfigChecker() {
  clearScreen();
  console.log('\x1b[1mOpening LinkedIn configuration checker in browser...\x1b[0m\n');
  
  const devServerRunning = isDevServerRunning();
  
  if (!devServerRunning) {
    console.log('\x1b[33mDevelopment server is not running.\x1b[0m');
    
    rl.question('\nDo you want to start the development server? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        startDevelopmentServer();
        
        // Give server time to start
        setTimeout(() => {
          open('http://localhost:3000/auth/linkedin-config-checker');
          
          rl.question('\nPress Enter to continue...', () => {
            showMainMenu();
          });
        }, 5000);
      } else {
        showMainMenu();
      }
    });
  } else {
    open('http://localhost:3000/auth/linkedin-config-checker');
    
    rl.question('\nPress Enter to continue...', () => {
      showMainMenu();
    });
  }
}

// View troubleshooting guide
function viewTroubleshootingGuide() {
  clearScreen();
  console.log('\x1b[1mViewing Authentication Troubleshooting Guide...\x1b[0m\n');
  
  try {
    const guidePath = path.join(process.cwd(), 'SOCIAL_AUTH_TROUBLESHOOTING.md');
    
    if (fs.existsSync(guidePath)) {
      const content = fs.readFileSync(guidePath, 'utf8');
      console.log(content);
    } else {
      console.log('\x1b[31mTroubleshooting guide not found at: SOCIAL_AUTH_TROUBLESHOOTING.md\x1b[0m');
    }
  } catch (error) {
    console.error('\x1b[31mError reading troubleshooting guide:\x1b[0m', error.message);
  }
  
  rl.question('\nPress Enter to continue...', () => {
    showMainMenu();
  });
}

// View LinkedIn guide
function viewLinkedInGuide() {
  clearScreen();
  console.log('\x1b[1mViewing LinkedIn Authentication Guide...\x1b[0m\n');
  
  try {
    const guidePath = path.join(process.cwd(), 'LINKEDIN_AUTH_GUIDE.md');
    
    if (fs.existsSync(guidePath)) {
      const content = fs.readFileSync(guidePath, 'utf8');
      console.log(content);
    } else {
      console.log('\x1b[31mLinkedIn guide not found at: LINKEDIN_AUTH_GUIDE.md\x1b[0m');
    }
  } catch (error) {
    console.error('\x1b[31mError reading LinkedIn guide:\x1b[0m', error.message);
  }
  
  rl.question('\nPress Enter to continue...', () => {
    showMainMenu();
  });
}

// Create a basic .env.local file
function createEnvFile() {
  clearScreen();
  console.log('\x1b[1mCreating a basic .env.local file...\x1b[0m\n');
  
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envPath)) {
    console.log('\x1b[33m.env.local file already exists.\x1b[0m');
    
    rl.question('\nDo you want to overwrite it? (y/n): ', (answer) => {
      if (answer.toLowerCase() === 'y') {
        writeEnvFile(envPath);
      } else {
        showMainMenu();
      }
    });
  } else {
    writeEnvFile(envPath);
  }
}

// Write the .env.local file
function writeEnvFile(envPath) {
  const envContent = `# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\x1b[32mCreated .env.local file successfully!\x1b[0m');
    console.log('\x1b[33mPlease edit the file and add your actual credentials.\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError creating .env.local file:\x1b[0m', error.message);
  }
  
  rl.question('\nPress Enter to continue...', () => {
    showMainMenu();
  });
}

// Start the development server
function startDevelopmentServer() {
  clearScreen();
  console.log('\x1b[1mStarting development server...\x1b[0m\n');
  console.log('This will run in a new terminal window.');
  console.log('You can close that window to stop the server.\n');
  
  try {
    // Different command based on OS
    if (process.platform === 'win32') {
      execSync('start cmd /k npm run dev', { stdio: 'ignore' });
    } else {
      execSync('npm run dev &', { stdio: 'ignore' });
    }
    
    console.log('\x1b[32mDevelopment server started!\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mError starting development server:\x1b[0m', error.message);
  }
  
  rl.question('\nPress Enter to continue...', () => {
    showMainMenu();
  });
}

// Check if dev server is running
function isDevServerRunning() {
  try {
    // Basic check - not 100% reliable
    const result = execSync('curl -s http://localhost:3000', { stdio: 'pipe' });
    return result.toString().length > 0;
  } catch (error) {
    return false;
  }
}

// Start the menu
showMainMenu(); 