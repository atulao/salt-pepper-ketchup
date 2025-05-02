# Social Authentication for SPK App

This document outlines the social authentication implementation added to the Salt-Pepper-Ketchup (SPK) campus engagement app.

## Features Implemented

1. **Authentication Providers**
   - Google OAuth integration
   - LinkedIn OAuth integration
   - Traditional email/password (credentials) authentication

2. **Components**
   - `SocialAuth` component with provider buttons styled to match the diner theme
   - Login and registration pages with social options
   - User profile component with authentication status display
   - Authentication session provider for global state management

3. **State Management**
   - Extended Zustand store with authentication state
   - Profile synchronization between client and server
   - Session persistence with NextAuth.js

4. **Backend**
   - NextAuth API routes for authentication
   - Middleware for route protection
   - Prisma schema updates for user management
   - API endpoints for profile synchronization

## File Structure

```
app/
  ├── api/
  │   ├── auth/
  │   │   ├── [...nextauth]/
  │   │   │   └── route.ts      # NextAuth configuration
  │   │   └── register/
  │   │       └── route.ts      # User registration endpoint
  │   └── profile/
  │       └── sync/
  │           └── route.ts      # Profile synchronization endpoint
  ├── auth/
  │   ├── login/
  │   │   └── page.tsx          # Login page
  │   └── register/
  │       └── page.tsx          # Registration page
  ├── components/
  │   └── auth/
  │       ├── AuthSessionProvider.tsx  # Session provider
  │       ├── SocialAuth.tsx           # Social auth buttons
  │       └── UserProfile.tsx          # User profile component
  ├── hooks/
  │   └── useProfileSync.ts     # Profile synchronization hook
  └── store/
      └── onboardingStore.ts    # Updated with auth state
middleware.ts                   # Auth middleware for route protection
prisma/
  └── schema.prisma             # Updated with auth models
public/
  └── images/
      ├── google-logo.svg       # Google logo for auth buttons
      ├── linkedin-logo.svg     # LinkedIn logo for auth buttons
      └── spk-logo.png          # SPK logo
SOCIAL_AUTH_SETUP.md            # Setup instructions
```

## Implementation Details

1. **Authentication Flow**
   - Users can sign in with Google, LinkedIn, or email/password
   - New users are directed to the onboarding process
   - Returning users with completed profiles go to the dashboard
   - Protected routes redirect to login if not authenticated

2. **UI/UX**
   - Authentication themed as "Express Lane" in the diner metaphor
   - Responsive design for all screen sizes
   - Loading states and error handling
   - User profile dropdown with account management options

3. **Data Model**
   - User model for authentication data
   - Profile model for SPK-specific data
   - Relationship between authentication and profile data

## Setup Requirements

Before using the social authentication features, you need to:

1. Install required packages:
   ```bash
   npm install next-auth@latest @auth/prisma-adapter zod
   ```

2. Set up environment variables in `.env.local`
   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   LINKEDIN_CLIENT_ID=your-linkedin-client-id
   LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
   ```

3. Run Prisma migrations:
   ```bash
   npx prisma migrate dev --name add-auth-models
   ```

4. Configure OAuth providers according to the instructions in `SOCIAL_AUTH_SETUP.md`

## Security Considerations

- Password hashing is commented in the code but should be implemented for production
- OAuth credentials should be kept secure
- The app includes CSRF protection through NextAuth.js
- Data privacy notices are displayed during registration
- Proper input validation is implemented

See `SOCIAL_AUTH_SETUP.md` for detailed setup instructions. 