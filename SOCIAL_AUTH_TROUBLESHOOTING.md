# Social Authentication Troubleshooting Guide

This guide provides troubleshooting steps for common social authentication issues in the Salt-Pepper-Ketchup (SPK) campus engagement app.

## Quick Troubleshooting Checklist

If you're experiencing issues with social authentication, try these quick fixes first:

- Clear your browser cookies and cache
- Try using an incognito/private browsing window
- Ensure cookies are enabled in your browser
- Disable browser extensions that might interfere with authentication
- Try a different browser
- Check your internet connection

## Common Issues and Solutions

### Infinite Loading Spinner

**Symptoms**: After clicking the social login button, you're redirected to the provider (Google/LinkedIn) and back, but the loading spinner keeps spinning indefinitely.

**Solutions**:
1. Check if your popup blocker is preventing the authentication window
2. Clear browser cookies and try again
3. Try using the [Authentication Debug Tool](/auth/debug) to check your session state
4. If using LinkedIn, verify the OAuth configuration with the [LinkedIn Config Checker](/auth/linkedin-config-checker)

### "Invalid Redirect URI" Error

**Symptoms**: The social provider (Google/LinkedIn) shows an error about an invalid redirect URI.

**Solutions**:
1. Make sure the redirect URI in the provider's developer console exactly matches your application's callback URL:
   - For development: `http://localhost:3000/api/auth/callback/[provider]`
   - For production: `https://your-domain.com/api/auth/callback/[provider]`
2. Check for any typos, trailing slashes, or protocol mismatches (http vs https)
3. If using a custom domain, make sure it's properly configured in the provider's allowed domains

### "Account Not Linked" Error

**Symptoms**: You see an error stating your account is not linked or is already associated with another provider.

**Solutions**:
1. Try signing in with the method you used originally
2. If you've used different email addresses for different providers, use the email address that matches your account
3. Contact support if you need to link multiple accounts

### No Profile Data Retrieved

**Symptoms**: Authentication seems to succeed, but your profile data (name, email, etc.) is not loaded correctly.

**Solutions**:
1. Make sure you've granted all required permissions when authorizing the app
2. Check that the correct scopes are configured:
   - For Google: `profile email`
   - For LinkedIn: `r_emailaddress r_liteprofile`
3. Try signing out completely and signing in again

### Browser-Specific Issues

#### Safari

- Enable cross-site tracking: Settings → Safari → Privacy & Security → Website tracking → uncheck "Prevent cross-site tracking"
- Allow cookies: Settings → Safari → Privacy & Security → Block all cookies → turn off

#### Firefox

- Disable Enhanced Tracking Protection for the site or set it to Standard mode
- Ensure cookies are allowed: Settings → Privacy & Security → Cookies and Site Data

#### Chrome

- Check if third-party cookies are blocked: Settings → Privacy and security → Cookies and other site data
- Disable any privacy extensions that might be blocking authentication

## Provider-Specific Troubleshooting

### LinkedIn Authentication Issues

LinkedIn OAuth can be particularly sensitive to configuration issues. Use our [LinkedIn Config Checker](/auth/linkedin-config-checker) tool to verify your setup.

Common LinkedIn-specific issues:
1. **Missing required scopes**: Make sure both `r_emailaddress` and `r_liteprofile` scopes are configured
2. **API version mismatch**: The NextAuth LinkedIn provider uses LinkedIn API v2 by default
3. **Profile field mapping**: LinkedIn's API returns profile data in a specific format that needs proper mapping

See the [LinkedIn Auth Guide](LINKEDIN_AUTH_GUIDE.md) for detailed setup and troubleshooting instructions.

### Google Authentication Issues

Google OAuth is generally more reliable but can still have issues:
1. **Invalid client configuration**: Ensure your Google Cloud project has OAuth properly configured
2. **Missing redirect URI**: Add all possible redirect URIs to your Google OAuth configuration
3. **API restrictions**: If you've restricted Google API scopes, make sure the required scopes are allowed

## Technical Diagnostics

For developers and technical users, we provide additional diagnostic tools:

1. [Auth Debug Page](/auth/debug): Shows session state, JWT tokens, and persistent storage data
2. Browser Console: Check for JavaScript errors or authentication-related logs
3. Network Tab: Examine the requests/responses between your app and authentication providers

### Enable Debug Mode

To get more detailed logs from NextAuth:

1. Set `debug: true` in your NextAuth configuration
2. Check server logs for detailed authentication flow information

## Still Having Issues?

If you've tried all the steps above and are still experiencing authentication problems:

1. Use the [Auth Debug Page](/auth/debug) and share the information with support
2. Check your browser console for any error messages
3. Contact support with a description of the issue and steps you've tried
4. Include information about your browser, operating system, and whether you're using any privacy extensions

For more assistance, please contact SPK support at support@salt-pepper-ketchup.com. 