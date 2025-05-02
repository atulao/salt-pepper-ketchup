/**
 * Authentication helper utilities
 */

import { signIn, SignInOptions, SignInResponse } from 'next-auth/react';

/**
 * Enhanced sign in function with additional error handling and logging
 */
export async function enhancedSignIn(
  provider: string, 
  options?: SignInOptions
): Promise<SignInResponse | undefined> {
  // Log the sign-in attempt for diagnostics
  console.log(`Initiating enhanced sign-in with ${provider}`, options);
  
  try {
    // Perform the sign-in
    const result = await signIn(provider, {
      ...options,
      redirect: false, // Always handle redirects manually for better control
    });
    
    // Log the result
    if (result?.error) {
      console.error(`Sign-in error with ${provider}:`, result.error);
    } else if (result?.url) {
      console.log(`Sign-in successful with ${provider}, redirect URL:`, result.url);
    } else {
      console.log(`Sign-in with ${provider} returned:`, result);
    }
    
    return result;
  } catch (error) {
    console.error(`Exception during sign-in with ${provider}:`, error);
    throw error;
  }
}

/**
 * Diagnose common authentication issues
 */
export function diagnoseAuthIssue(error?: string): {
  issue: string;
  solution: string;
  fixable: boolean;
} {
  if (!error) {
    return {
      issue: 'Unknown authentication issue',
      solution: 'Try again or use a different sign-in method',
      fixable: false
    };
  }
  
  // Common error cases and their solutions
  switch (error) {
    case 'OAuthCallback':
      return {
        issue: 'OAuth callback error',
        solution: 'Check that cookies are enabled and try again in an incognito window',
        fixable: true
      };
    case 'OAuthSignin':
      return {
        issue: 'OAuth sign-in initialization failed',
        solution: 'Clear browser cache and cookies, then try again',
        fixable: true
      };
    case 'AccessDenied':
      return {
        issue: 'You denied permission to the application',
        solution: 'Try again and accept all required permissions',
        fixable: true
      };
    case 'OAuthAccountNotLinked':
      return {
        issue: 'Email already used with a different sign-in method',
        solution: 'Sign in with the method you used originally',
        fixable: false
      };
    case 'Verification':
      return {
        issue: 'Verification token expired or invalid',
        solution: 'Request a new verification link',
        fixable: false
      };
    case 'Configuration':
      return {
        issue: 'Server configuration error',
        solution: 'Contact the administrator as the server needs to be fixed',
        fixable: false
      };
    default:
      return {
        issue: `Authentication error: ${error}`,
        solution: 'Try again or use a different sign-in method',
        fixable: true
      };
  }
}

/**
 * Check for authentication session issues
 */
export function checkSessionHealth(): {
  healthy: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check if cookies are enabled
  if (!navigator.cookieEnabled) {
    issues.push('Cookies are disabled in your browser');
  }
  
  // Check for localStorage availability (needed for Zustand persist)
  try {
    localStorage.setItem('auth-test', 'test');
    localStorage.removeItem('auth-test');
  } catch (e) {
    issues.push('Local storage is not available');
  }
  
  // Check for third-party cookie blocking (common issue with Safari)
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  if (isSafari) {
    issues.push('You may need to enable cross-site tracking in Safari privacy settings');
  }
  
  return {
    healthy: issues.length === 0,
    issues
  };
}

/**
 * Convert provider errors to user-friendly messages
 */
export function getProviderErrorMessage(provider: string, error?: string): string {
  if (!error) return '';
  
  if (provider === 'linkedin') {
    if (error === 'OAuthCallback') {
      return 'LinkedIn authentication failed. This may be due to incorrect permissions or a timeout.';
    }
    if (error === 'AccessDenied') {
      return 'You need to approve all requested LinkedIn permissions for authentication to work.';
    }
  }
  
  if (provider === 'google') {
    if (error === 'OAuthCallback') {
      return 'Google authentication callback failed. Please check your internet connection and try again.';
    }
    if (error === 'AccessDenied') {
      return 'You need to grant permission to access your Google account information.';
    }
  }
  
  // Generic error message
  return `Authentication with ${provider} failed. Please try again.`;
} 