/**
 * Session and authentication state recovery utilities
 * Use these to help diagnose and fix common session issues
 */

/**
 * Clean up local storage related to authentication
 * This can help resolve corrupted session data
 */
export function cleanupAuthStorage(): {
  removedItems: string[];
  status: 'success' | 'error';
  error?: string;
} {
  const authKeys = [
    'spk-onboarding-storage',  // Zustand store
    'next-auth.session-token', // NextAuth session token
    'next-auth.callback-url',  // NextAuth callback URL
    'next-auth.csrf-token',    // NextAuth CSRF token
    'next-auth.state'          // NextAuth state
  ];
  
  const removedItems: string[] = [];
  
  try {
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        removedItems.push(key);
      }
    });
    
    // Clear any session cookies if they exist
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.trim().split('=');
      if (name.includes('next-auth') || name.includes('spk')) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        removedItems.push(`cookie:${name}`);
      }
    });
    
    return {
      removedItems,
      status: 'success'
    };
  } catch (error) {
    console.error('Error cleaning up auth storage:', error);
    return {
      removedItems,
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Test session handling by setting a temporary cookie
 * This helps verify if cookies are working properly
 */
export function testSessionCookies(): {
  canWrite: boolean;
  canRead: boolean;
  error?: string;
} {
  const testValue = `test-${Date.now()}`;
  const testCookieName = 'spk-session-test';
  
  try {
    // Set test cookie
    document.cookie = `${testCookieName}=${testValue}; path=/;`;
    
    // Try to read it back
    const cookies = document.cookie.split(';');
    const testCookie = cookies.find(cookie => cookie.trim().startsWith(`${testCookieName}=`));
    const readValue = testCookie ? testCookie.trim().split('=')[1] : null;
    
    // Clean up
    document.cookie = `${testCookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    
    return {
      canWrite: true,
      canRead: readValue === testValue
    };
  } catch (error) {
    console.error('Error testing session cookies:', error);
    return {
      canWrite: false,
      canRead: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Verify cross-origin resource sharing capabilities
 * This is important for third-party auth providers
 */
export async function testCorsCapabilities(): Promise<{
  corsEnabled: boolean;
  thirdPartyCookiesAllowed: boolean;
  error?: string;
}> {
  try {
    // Test basic CORS with a simple fetch to a known public API
    const corsTest = await fetch('https://jsonplaceholder.typicode.com/todos/1', {
      method: 'GET',
      mode: 'cors'
    });
    
    const corsEnabled = corsTest.ok;
    
    // For third-party cookies, we'd typically use an iframe test
    // This is a simplified check that looks for common blockers
    const userAgent = navigator.userAgent.toLowerCase();
    const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
    const isFirefoxWithETP = userAgent.includes('firefox') && !navigator.cookieEnabled;
    
    // We're doing a basic estimate based on browser type and settings
    // A complete test would require an actual third-party iframe
    const thirdPartyCookiesAllowed = navigator.cookieEnabled && !(isSafari || isFirefoxWithETP);
    
    return {
      corsEnabled,
      thirdPartyCookiesAllowed
    };
  } catch (error) {
    console.error('Error testing CORS capabilities:', error);
    return {
      corsEnabled: false,
      thirdPartyCookiesAllowed: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Reset the authentication state completely
 * This is a last resort for stubborn authentication issues
 */
export function resetAuthState(): {
  success: boolean;
  actions: string[];
  error?: string;
} {
  const actions: string[] = [];
  
  try {
    // 1. Clear all auth-related localStorage
    const storageResult = cleanupAuthStorage();
    if (storageResult.status === 'success') {
      actions.push(`Cleared ${storageResult.removedItems.length} auth storage items`);
    } else {
      actions.push(`Failed to clear some storage items: ${storageResult.error}`);
    }
    
    // 2. Clear session cookies
    try {
      document.cookie.split(';').forEach(cookie => {
        const [name] = cookie.trim().split('=');
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      actions.push('Cleared all cookies');
    } catch (e) {
      actions.push('Failed to clear all cookies');
    }
    
    // 3. Reload the page to clear memory state
    actions.push('Ready to reload page');
    
    return {
      success: true,
      actions
    };
  } catch (error) {
    console.error('Error resetting auth state:', error);
    return {
      success: false,
      actions,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
} 