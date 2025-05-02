/**
 * Social Authentication Environment Variables Verification Script
 * 
 * This script checks if all required environment variables for social authentication are properly set.
 * Run this script with: node scripts/verify-social-auth-env.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Required environment variables for social authentication
const requiredVars = {
  general: [
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ],
  google: [
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET'
  ],
  linkedin: [
    'LINKEDIN_CLIENT_ID',
    'LINKEDIN_CLIENT_SECRET'
  ]
};

// Function to check if a variable is set and not empty
function checkEnvVar(name) {
  const value = process.env[name];
  return {
    name,
    exists: value !== undefined,
    valid: value !== undefined && value.trim() !== '',
    value: value ? `${value.substring(0, 5)}...` : undefined // Only show first few chars for security
  };
}

// Function to check if .env file exists
function checkEnvFile() {
  const envPaths = [
    '.env',
    '.env.local',
    '.env.development',
    '.env.development.local',
    '.env.production',
    '.env.production.local'
  ];
  
  const foundEnvFiles = [];
  
  for (const envPath of envPaths) {
    if (fs.existsSync(path.join(process.cwd(), envPath))) {
      foundEnvFiles.push(envPath);
    }
  }
  
  return {
    found: foundEnvFiles.length > 0,
    files: foundEnvFiles
  };
}

// Check URL configuration
function checkUrlConfiguration() {
  let localUrl = 'http://localhost:3000';
  let deployedUrl = null;
  
  // Try to detect current URL from git remote if available
  try {
    const gitRemote = execSync('git remote -v').toString();
    const repoUrl = gitRemote.match(/origin\s+([^\s]+)/)[1];
    
    if (repoUrl.includes('github.com')) {
      const repoName = repoUrl.match(/github\.com[\/:]([^\/]+\/[^\/\.]+)/)[1];
      deployedUrl = `https://${repoName.split('/')[0]}.github.io/${repoName.split('/')[1]}`;
    }
  } catch (error) {
    // Ignore git errors
  }
  
  return {
    localUrl,
    deployedUrl,
    hasVercelConfig: fs.existsSync(path.join(process.cwd(), 'vercel.json')),
    hasNetlifyConfig: fs.existsSync(path.join(process.cwd(), 'netlify.toml'))
  };
}

// Main function to run all checks
function main() {
  console.log('🔍 Checking Social Authentication Environment Variables\n');
  
  // Check for .env files
  const envFiles = checkEnvFile();
  if (envFiles.found) {
    console.log('✅ Found environment files:', envFiles.files.join(', '));
  } else {
    console.log('❌ No environment files found! You need to create one of these: .env, .env.local');
  }
  
  console.log('\n📝 Checking required environment variables:');
  
  // General variables
  console.log('\n🔑 General Auth Configuration:');
  for (const varName of requiredVars.general) {
    const result = checkEnvVar(varName);
    if (result.valid) {
      console.log(`  ✅ ${varName} is properly set`);
    } else if (result.exists) {
      console.log(`  ⚠️  ${varName} exists but is empty`);
    } else {
      console.log(`  ❌ ${varName} is not set`);
    }
  }
  
  // Google variables
  console.log('\n🔑 Google Auth Configuration:');
  let googleConfigured = true;
  for (const varName of requiredVars.google) {
    const result = checkEnvVar(varName);
    if (result.valid) {
      console.log(`  ✅ ${varName} is properly set`);
    } else if (result.exists) {
      console.log(`  ⚠️  ${varName} exists but is empty`);
      googleConfigured = false;
    } else {
      console.log(`  ❌ ${varName} is not set`);
      googleConfigured = false;
    }
  }
  
  // LinkedIn variables
  console.log('\n🔑 LinkedIn Auth Configuration:');
  let linkedinConfigured = true;
  for (const varName of requiredVars.linkedin) {
    const result = checkEnvVar(varName);
    if (result.valid) {
      console.log(`  ✅ ${varName} is properly set`);
    } else if (result.exists) {
      console.log(`  ⚠️  ${varName} exists but is empty`);
      linkedinConfigured = false;
    } else {
      console.log(`  ❌ ${varName} is not set`);
      linkedinConfigured = false;
    }
  }
  
  // URL configuration
  console.log('\n🌐 URL Configuration:');
  const urlConfig = checkUrlConfiguration();
  
  console.log(`  Local URL: ${urlConfig.localUrl}`);
  if (urlConfig.deployedUrl) {
    console.log(`  Potential deployed URL: ${urlConfig.deployedUrl}`);
  }
  if (urlConfig.hasVercelConfig) {
    console.log('  ℹ️  Found Vercel configuration');
  }
  if (urlConfig.hasNetlifyConfig) {
    console.log('  ℹ️  Found Netlify configuration');
  }
  
  // Check NEXTAUTH_URL
  const nextAuthUrl = process.env.NEXTAUTH_URL;
  if (nextAuthUrl) {
    console.log(`  ✅ NEXTAUTH_URL is set to: ${nextAuthUrl}`);
    
    // Verify callbacks should work
    const googleCallback = `${nextAuthUrl}/api/auth/callback/google`;
    const linkedinCallback = `${nextAuthUrl}/api/auth/callback/linkedin`;
    
    console.log('\n🔄 Callback URLs that should be configured in provider dashboards:');
    if (googleConfigured) {
      console.log(`  Google: ${googleCallback}`);
    }
    if (linkedinConfigured) {
      console.log(`  LinkedIn: ${linkedinCallback}`);
    }
  } else {
    console.log('  ❌ NEXTAUTH_URL is not set');
    console.log('     For local development, set it to: http://localhost:3000');
    console.log('     For production, set it to your application URL');
  }
  
  // Summary
  console.log('\n📊 Summary:');
  const generalConfigured = requiredVars.general.every(v => process.env[v] && process.env[v].trim() !== '');
  
  if (generalConfigured) {
    console.log('  ✅ General NextAuth configuration is complete');
  } else {
    console.log('  ❌ General NextAuth configuration is incomplete');
  }
  
  if (googleConfigured) {
    console.log('  ✅ Google authentication is configured');
  } else {
    console.log('  ❌ Google authentication is not fully configured');
  }
  
  if (linkedinConfigured) {
    console.log('  ✅ LinkedIn authentication is configured');
  } else {
    console.log('  ❌ LinkedIn authentication is not fully configured');
  }
  
  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (!envFiles.found) {
    console.log('  • Create a .env.local file in the project root');
  }
  
  if (!generalConfigured) {
    console.log('  • Set all required general NextAuth environment variables');
  }
  
  if (!googleConfigured) {
    console.log('  • Complete Google OAuth configuration or remove the Google provider');
  }
  
  if (!linkedinConfigured) {
    console.log('  • Complete LinkedIn OAuth configuration or remove the LinkedIn provider');
  }
  
  if (!process.env.NEXTAUTH_URL) {
    console.log('  • Set NEXTAUTH_URL to your application URL');
  }
  
  console.log('\n📚 For more information, refer to:');
  console.log('  • LINKEDIN_AUTH_GUIDE.md');
  console.log('  • SOCIAL_AUTH_TROUBLESHOOTING.md');
  console.log('  • https://next-auth.js.org/configuration/options');
}

// Run the main function
main(); 