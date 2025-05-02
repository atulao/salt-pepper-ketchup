# Setting Up Social Authentication for SPK

This guide explains how to set up the social authentication (Google and LinkedIn) for the Salt-Pepper-Ketchup (SPK) application.

## Prerequisites

- Node.js (v18 or newer)
- NPM or Yarn
- Access to Google Cloud Console and LinkedIn Developer Portal

## Required Packages

Install the following packages:

```bash
npm install next-auth@latest @auth/prisma-adapter zod
# Or with yarn
yarn add next-auth@latest @auth/prisma-adapter zod
```

## Database Setup

1. Run Prisma migrations to create the required tables:

```bash
npx prisma migrate dev --name add-auth-models
```

2. Generate Prisma client:

```bash
npx prisma generate
```

## Setting Up Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Select "Web application" as the application type
6. Add the following URLs:
   - Authorized JavaScript origins: `http://localhost:3000` (development) and your production URL
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (development) and your production URL path
7. Copy the Client ID and Client Secret

## Setting Up LinkedIn OAuth

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Under the "Auth" section, add the following:
   - Redirect URLs: `http://localhost:3000/api/auth/callback/linkedin` (development) and your production URL path
   - Requested permissions: `r_emailaddress`, `r_liteprofile`
4. Copy the Client ID and Client Secret

## Environment Variables Setup

Create a `.env.local` file with the following variables (replace with your actual values):

```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secure-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret

# Database
DATABASE_URL="file:./dev.db" # For SQLite or your actual database URL
```

For production, make sure to set these environment variables in your hosting environment.

## Generating a Secure NEXTAUTH_SECRET

Run this command to generate a secure random string for your NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

## Testing Authentication

1. Start your development server:

```bash
npm run dev
```

2. Navigate to `/auth/login` in your browser
3. Try logging in with both Google and LinkedIn options
4. Ensure that the authentication flow works and redirects properly to the onboarding steps

## Troubleshooting

If you encounter issues with social authentication:

1. Check the browser console and server logs for error messages
2. Verify that your OAuth credentials are correct
3. Ensure that the redirect URIs match exactly what's configured in the OAuth providers
4. Make sure your database is properly set up with the required tables
5. Verify that your environment variables are properly set

## Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [LinkedIn OAuth Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow) 