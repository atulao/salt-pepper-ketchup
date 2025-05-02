"use client";

import React, { useEffect, useState } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useAuth } from '../../store/onboardingStore';
import { useRouter } from 'next/navigation';

// Timeout for session loading (10 seconds)
const SESSION_LOADING_TIMEOUT = 10000;

// Component to sync the NextAuth session with our Zustand store
const SessionSync: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession();
  const { setUserAuthData, clearAuthData } = useAuth();
  const [sessionError, setSessionError] = useState<Error | null>(null);
  const [sessionTimeout, setSessionTimeout] = useState(false);
  const router = useRouter();
  
  // Handle session loading timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    
    if (status === 'loading') {
      // Set a timeout for session loading
      timeoutId = setTimeout(() => {
        console.warn('Session loading timed out after', SESSION_LOADING_TIMEOUT, 'ms');
        setSessionTimeout(true);
      }, SESSION_LOADING_TIMEOUT);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [status]);
  
  // Log session state changes
  useEffect(() => {
    console.log('NextAuth session status:', status, session ? { provider: session.user?.provider } : '');
    
    // Handle session timeout recovery
    if (sessionTimeout && status !== 'loading') {
      setSessionTimeout(false);
    }
    
    // If we have a timeout but still on loading, redirect to login
    if (sessionTimeout && status === 'loading') {
      console.error('Session loading timed out, redirecting to login');
      // We can't directly redirect here as it would cause an infinite loop,
      // so we'll reload the page which should then show the login screen via middleware
      router.refresh();
    }
  }, [status, session, sessionTimeout, router]);
  
  // Sync session state with our store
  useEffect(() => {
    try {
      if (status === 'authenticated' && session?.user) {
        // Validate session data
        if (!session.user.id) {
          console.warn('Authenticated session missing user ID, using fallback');
        }
        
        // Update our store with the session data
        setUserAuthData({
          id: session.user.id || '',
          name: session.user.name || '',
          email: session.user.email || '',
          image: session.user.image || '',
          provider: session.user.provider || 'credentials'
        });
        
        console.log('Session synchronized with store', {
          id: session.user.id,
          provider: session.user.provider
        });
      } else if (status === 'unauthenticated') {
        // Clear auth data when user is not authenticated
        clearAuthData();
        console.log('User is not authenticated, cleared auth data');
      }
    } catch (error) {
      // Handle any errors during synchronization
      console.error('Error synchronizing session with store:', error);
      setSessionError(error instanceof Error ? error : new Error('Unknown session sync error'));
    }
  }, [session, status, setUserAuthData, clearAuthData]);
  
  // If there's a session error, we could show an error UI or attempt recovery
  if (sessionError) {
    console.error('Session error detected:', sessionError);
    // In production, you might want to show a recovery UI here
  }
  
  return <>{children}</>;
};

// Main Auth Provider component to wrap the entire app
interface AuthSessionProviderProps {
  children: React.ReactNode;
  // If refresh interval is not provided, we'll use the default (0 = disabled)
  // This can be enabled to periodically check the session state
  refreshInterval?: number;
}

const AuthSessionProvider: React.FC<AuthSessionProviderProps> = ({ 
  children,
  refreshInterval = 0 
}) => {
  return (
    <SessionProvider 
      refetchInterval={refreshInterval} 
      refetchOnWindowFocus={true}
    >
      <SessionSync>{children}</SessionSync>
    </SessionProvider>
  );
};

export default AuthSessionProvider; 