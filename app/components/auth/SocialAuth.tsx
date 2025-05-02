"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Mail, AlertCircle, RefreshCw, Info, HelpCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { enhancedSignIn, diagnoseAuthIssue, checkSessionHealth, getProviderErrorMessage } from '../../utils/authHelpers';

// Authentication timeout in milliseconds (15 seconds)
const AUTH_TIMEOUT = 15000;

interface SocialAuthProps {
  callbackUrl?: string;
  onEmailAuth?: () => void;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ 
  callbackUrl = '/onboarding/step1',
  onEmailAuth 
}) => {
  const [isLoading, setIsLoading] = useState<{
    google: boolean;
    linkedin: boolean;
    email: boolean;
  }>({
    google: false,
    linkedin: false,
    email: false
  });
  const [error, setError] = useState<string | null>(null);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [sessionHealthIssues, setSessionHealthIssues] = useState<string[]>([]);
  
  // Check for session health issues on component load
  useEffect(() => {
    const { healthy, issues } = checkSessionHealth();
    if (!healthy) {
      setSessionHealthIssues(issues);
      console.warn('Session health issues detected:', issues);
    }
  }, []);
  
  // Clear any existing timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleSocialSignIn = async (provider: 'google' | 'linkedin') => {
    try {
      // Clear any previous errors and timeouts
      setError(null);
      setTimeoutOccurred(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Set loading state
      setIsLoading(prev => ({ ...prev, [provider]: true }));
      
      // Set a timeout to handle cases where the OAuth callback doesn't return
      timeoutRef.current = setTimeout(() => {
        console.log(`${provider} authentication timed out after ${AUTH_TIMEOUT}ms`);
        setIsLoading(prev => ({ ...prev, [provider]: false }));
        setTimeoutOccurred(true);
        setError(`Authentication with ${provider} is taking longer than expected. Please try again.`);
      }, AUTH_TIMEOUT);
      
      // Use enhanced sign-in with better error handling
      const result = await enhancedSignIn(provider, { callbackUrl });
      
      // Clear timeout as we got a response
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      // Handle the result
      if (result?.error) {
        const errorMessage = getProviderErrorMessage(provider, result.error);
        setError(errorMessage);
        setIsLoading(prev => ({ ...prev, [provider]: false }));
      } else if (result?.url) {
        // Successfully got auth URL, redirect manually
        console.log(`${provider} authentication successful, redirecting to:`, result.url);
        window.location.href = result.url;
      } else {
        // Unexpected result
        console.error(`Unexpected ${provider} authentication result:`, result);
        setError(`Something went wrong during ${provider} authentication. Please try again.`);
        setIsLoading(prev => ({ ...prev, [provider]: false }));
      }
    } catch (error) {
      // Clear timeout as we got an error
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      console.error(`Error signing in with ${provider}:`, error);
      setError(`Failed to sign in with ${provider}. Please try again.`);
      setIsLoading(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleEmailAuth = () => {
    if (onEmailAuth) {
      setIsLoading(prev => ({ ...prev, email: true }));
      onEmailAuth();
      setIsLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleRetry = (provider: 'google' | 'linkedin') => {
    setError(null);
    setTimeoutOccurred(false);
    handleSocialSignIn(provider);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-amber-600">Express Lane</h2>
        <p className="text-gray-600 mt-1">Quick sign in to get your SPK order started</p>
      </div>
      
      {/* Health check warnings */}
      {sessionHealthIssues.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Browser compatibility issue detected</p>
              <ul className="mt-1 text-xs text-yellow-700 list-disc list-inside">
                {sessionHealthIssues.map((issue, index) => (
                  <li key={index}>{issue}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md flex items-center text-red-800">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
      
      {timeoutOccurred && (
        <div className="mb-4 p-3 bg-amber-100 border border-amber-300 rounded-md text-amber-800 text-sm">
          <p>If you've already authorized access, please check your popup blocker or try again.</p>
          <div className="mt-2">
            <Link href="/auth/debug" className="text-blue-600 hover:underline text-xs">
              Troubleshoot authentication issues
            </Link>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {/* Google Sign In */}
        <button
          onClick={() => handleSocialSignIn('google')}
          disabled={isLoading.google}
          className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 shadow-sm transition-colors"
          aria-label="Sign in with Google"
        >
          {isLoading.google ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
              <span className="ml-2 text-gray-600">Connecting...</span>
            </div>
          ) : (
            <>
              <Image
                src="/images/google-logo.svg" 
                alt="Google logo"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="text-gray-800 font-medium">Continue with Google</span>
            </>
          )}
        </button>
        
        {/* LinkedIn Sign In */}
        <div className="relative">
          <button
            onClick={() => handleSocialSignIn('linkedin')}
            disabled={isLoading.linkedin}
            className="w-full flex items-center justify-center gap-3 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 shadow-sm transition-colors"
            aria-label="Sign in with LinkedIn"
          >
            {isLoading.linkedin ? (
              <div className="flex items-center">
                <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                <span className="ml-2 text-gray-600">Connecting...</span>
              </div>
            ) : (
              <>
                <Image
                  src="/images/linkedin-logo.svg" 
                  alt="LinkedIn logo"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span className="text-gray-800 font-medium">Continue with LinkedIn</span>
              </>
            )}
          </button>
          
          {/* Retry button visible when timeout occurs */}
          {timeoutOccurred && isLoading.linkedin && (
            <button
              onClick={() => handleRetry('linkedin')}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 bg-gray-100 rounded-full hover:bg-gray-200"
              aria-label="Retry LinkedIn sign in"
            >
              <RefreshCw className="h-4 w-4 text-gray-600" />
            </button>
          )}
        </div>
        
        {/* Email Auth Option */}
        <button
          onClick={handleEmailAuth}
          disabled={isLoading.email}
          className="w-full flex items-center justify-center gap-3 py-2.5 bg-amber-100 border border-amber-200 rounded-md hover:bg-amber-200 transition-colors"
          aria-label="Sign in with email and password"
        >
          {isLoading.email ? (
            <div className="flex items-center">
              <Loader2 className="h-5 w-5 animate-spin text-amber-600" />
              <span className="ml-2 text-amber-700">Connecting...</span>
            </div>
          ) : (
            <>
              <Mail className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 font-medium">Continue with Email</span>
            </>
          )}
        </button>
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>
        </p>
        
        {/* Add help link to troubleshooting guide */}
        <div className="mt-4 flex justify-center">
          <Link 
            href="/SOCIAL_AUTH_TROUBLESHOOTING.md" 
            className="inline-flex items-center text-xs text-blue-600 hover:underline"
          >
            <HelpCircle className="h-3 w-3 mr-1" />
            Having trouble signing in?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SocialAuth; 