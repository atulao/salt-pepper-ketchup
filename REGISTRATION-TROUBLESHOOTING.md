# Registration Troubleshooting Guide

If you encounter issues with user registration in the Salt-Pepper-Ketchup application, follow these troubleshooting steps:

## Common Error: "Registration failed"

This error typically appears when there's an issue with the registration API endpoint.

### Solution Steps:

1. **Check Prisma Database Connection**
   - Ensure your database is running and accessible
   - Check environment variables for database connection
   - Run `npx prisma db push` to ensure schema is up-to-date

2. **Verify Package Dependencies**
   - Make sure these packages are installed:
     ```
     npm install @prisma/client next-auth zod
     ```
   - If running in WSL, you might encounter path issues with npm

3. **Simplified Registration Route**
   - The registration route has been updated to remove zod dependency
   - Basic validation is now handled directly in the route
   - This avoids module loading issues in certain environments

4. **Check for Specific Errors in Console**
   - Open browser console and look for detailed error messages
   - Check server logs for Prisma or database errors
   - If the error is "MODULE_NOT_FOUND", it's likely a dependency issue

## WSL-Specific Issues

When running in WSL, you might encounter path-related issues:

1. **Use Direct Path to Next.js Binary**
   ```bash
   node ./node_modules/next/dist/bin/next dev
   ```

2. **Reinstall Dependencies**
   If package installation is incomplete:
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Use Windows Terminal**
   - Running from Windows Terminal with WSL integration may resolve path issues

## Test Setup

To verify that your environment is correctly set up:

1. **Test Zod Installation**
   ```bash
   node test-zod.js
   ```
   This should output "Zod loaded successfully: true"

2. **Test Prisma Connection**
   ```bash
   npx prisma studio
   ```
   Should open a database viewer without errors

If you continue to experience issues after trying these steps, consider running the application directly on Windows or in a proper Linux environment instead of WSL. 