# LinkedIn OAuth Configuration Guide for SPK

This guide provides detailed instructions for setting up and troubleshooting LinkedIn OAuth integration with the Salt-Pepper-Ketchup (SPK) application.

## Prerequisites

- A LinkedIn Developer account
- Access to your application's hosting environment
- Administrator access to set environment variables

## Step 1: Set up a LinkedIn Developer Application

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Click "Create App" and fill in the required information:
   - App name: `SPK Campus Engagement` (or your preferred name)
   - LinkedIn Page: Your organization's LinkedIn page (or your personal page)
   - App logo: Upload your application logo (must be at least 100x100px)
3. Check all legal agreement boxes and click "Create App"

## Step 2: Configure Auth Settings

1. From your app dashboard, click on the "Auth" tab
2. Under "OAuth 2.0 settings", add the following Redirect URLs:
   - Development: `http://localhost:3000/api/auth/callback/linkedin`
   - Production: `https://your-domain.com/api/auth/callback/linkedin`
   
   Note: The exact paths must match what's configured in your NextAuth setup.

3. Under "OAuth 2.0 scopes", add the following scopes:
   - `r_emailaddress`
   - `r_liteprofile`
   
   Note: These scopes are required to access the user's email and basic profile data.

## Step 3: Get Credentials

1. From the "Auth" tab, copy the following credentials:
   - Client ID
   - Client Secret
   
   Important: Keep these values secure and never commit them to your code repository.

## Step 4: Configure Environment Variables

Add the following variables to your `.env.local` file (development) or environment variables (production):

```
LINKEDIN_CLIENT_ID=your-client-id
LINKEDIN_CLIENT_SECRET=your-client-secret
```

## Step 5: Verify NextAuth Configuration

Ensure your NextAuth configuration in `app/api/auth/[...nextauth]/route.ts` has the correct LinkedIn provider settings:

```typescript
LinkedInProvider({
  clientId: process.env.LINKEDIN_CLIENT_ID || "",
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET || "",
  authorization: {
    params: {
      scope: "r_emailaddress r_liteprofile"
    }
  },
  profile(profile, tokens) {
    return {
      id: profile.id,
      name: profile.localizedFirstName + " " + profile.localizedLastName,
      email: profile.email || profile.emailAddress,
      image: profile.profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier || null
    };
  }
})
```

## Common Issues and Troubleshooting

### 1. Infinite Loading/Spinner After Redirect

**Symptoms**: After authenticating with LinkedIn, you're redirected back to your application but the loading spinner never resolves.

**Possible Causes**:
- Incorrect redirect URL configuration
- Mismatch between configured scopes and requested scopes
- Session handling issues in the application

**Solutions**:
- Verify that the redirect URL in LinkedIn Developer Portal exactly matches your app's callback URL
- Check browser console for errors
- Ensure you're using the correct scopes: `r_emailaddress r_liteprofile`
- Check if the browser is blocking third-party cookies
- Try in an incognito/private window to rule out cookie issues

### 2. "Invalid Redirect URI" Error

**Symptoms**: LinkedIn shows an error indicating the redirect URI is invalid.

**Solutions**:
- Double-check that the redirect URL in your LinkedIn app configuration exactly matches what's being sent from your application
- Ensure there are no typos, trailing slashes, or http/https mismatches
- The URL must be an exact match, including protocol, domain, path, and any query parameters

### 3. "Missing Required Scopes" Error

**Symptoms**: LinkedIn shows an error about missing required scopes.

**Solutions**:
- Ensure you've added both `r_emailaddress` and `r_liteprofile` scopes in your LinkedIn app configuration
- Check that the authorization parameters in your NextAuth configuration match these scopes

### 4. No Email or Profile Data

**Symptoms**: Authentication completes but user's email or profile data is missing.

**Solutions**:
- Ensure you've requested the `r_emailaddress` and `r_liteprofile` scopes
- Check the profile mapping function in your LinkedIn provider configuration
- Add console logging to the profile function to debug what data is actually being returned

### 5. CORS or Network Errors

**Symptoms**: Browser console shows CORS or network errors during authentication.

**Solutions**:
- Check that your server is properly handling CORS headers
- Ensure your app's domain is correctly configured in the LinkedIn Developer Portal
- Verify network connectivity between your app and LinkedIn's authentication servers

## Debugging Tips

1. **Enable Debug Mode**: Set `debug: true` in your NextAuth configuration to get more detailed logs.

2. **Monitor Network Requests**: Use browser developer tools to monitor network requests and responses during the authentication flow.

3. **Check Response Headers**: Look for specific error codes or messages in the response headers.

4. **Test with Different Browsers**: Some authentication issues can be browser-specific due to cookie or security settings.

5. **Clear Cookies and Cache**: Before testing, clear cookies and cache to ensure a clean authentication state.

## LinkedIn API Version Considerations

LinkedIn API versions can affect the authentication flow. The NextAuth LinkedIn provider uses LinkedIn API v2 by default. If you need to use a different version, you can specify it in the provider configuration:

```typescript
LinkedInProvider({
  // Other configuration...
  version: "2.0", // Specify the API version
})
```

## Useful Resources

- [LinkedIn API Documentation](https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow)
- [NextAuth.js LinkedIn Provider Documentation](https://next-auth.js.org/providers/linkedin)
- [OAuth 2.0 Debugging Tools](https://oauthdebugger.com/)

## Support

If you continue to experience issues with LinkedIn authentication after trying these troubleshooting steps, please contact SPK support at support@salt-pepper-ketchup.com or create an issue on our GitHub repository. 