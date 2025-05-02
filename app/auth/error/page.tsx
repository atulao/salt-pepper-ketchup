"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { RefreshCw, AlertTriangle, XCircle, ArrowLeft, ShieldAlert } from 'lucide-react';

// Common NextAuth error codes and their user-friendly messages
const errorMessages: Record<string, { title: string; message: string }> = {
  'Configuration': {
    title: 'Server Configuration Error',
    message: 'There is an issue with the server configuration. Please contact support.'
  },
  'AccessDenied': {
    title: 'Access Denied',
    message: 'You do not have permission to sign in. You may need to request access or use a different account.'
  },
  'Verification': {
    title: 'Verification Error',
    message: 'The verification link has expired or has already been used. Please request a new one.'
  },
  'OAuthSignin': {
    title: 'OAuth Sign-In Error',
    message: 'There was a problem with the OAuth sign-in. Please try again or use a different sign-in method.'
  },
  'OAuthCallback': {
    title: 'OAuth Callback Error',
    message: 'There was a problem with the OAuth callback. This might be due to a misconfigured application or expired credentials.'
  },
  'OAuthAccountNotLinked': {
    title: 'Account Not Linked',
    message: 'This email is already associated with an account, but not with this sign-in method.'
  },
  'EmailCreateAccount': {
    title: 'Email Creation Error',
    message: 'There was a problem creating an account with this email address. Please try another email.'
  },
  'Callback': {
    title: 'Callback Error',
    message: 'There was a problem with the authentication callback. Please try again.'
  },
  'OAuthCreateAccount': {
    title: 'Account Creation Error',
    message: 'There was a problem creating an account with this provider. You may already have an account with a different sign-in method.'
  },
  'EmailSignin': {
    title: 'Email Sign-In Error',
    message: 'The email could not be sent or there was a problem with the email sign-in link.'
  },
  'CredentialsSignin': {
    title: 'Invalid Credentials',
    message: 'The email or password you entered is incorrect. Please try again.'
  },
  'SessionRequired': {
    title: 'Authentication Required',
    message: 'You must be signed in to access this page.'
  },
  'Default': {
    title: 'Authentication Error',
    message: 'An unexpected error occurred during authentication. Please try again.'
  }
};

const AuthErrorPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract error from URL parameters
  useEffect(() => {
    const errorCode = searchParams.get('error');
    console.error('Authentication error:', errorCode);
    setError(errorCode);
    
    // Log detailed error information
    const errorDetails = {
      code: errorCode,
      time: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer
    };
    console.error('Detailed auth error:', errorDetails);
  }, [searchParams]);
  
  // Get error message from error code
  const errorInfo = error && errorMessages[error] 
    ? errorMessages[error] 
    : errorMessages['Default'];
  
  // Handle the retry action
  const handleRetry = () => {
    setIsLoading(true);
    
    // Redirect to sign-in page
    router.push('/auth/login');
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="w-full bg-amber-50 p-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/images/spk-logo.png" 
              alt="Salt Pepper Ketchup Logo" 
              width={40} 
              height={40}
              className="h-10 w-auto"
            />
            <span className="font-bold text-amber-800 text-xl">Salt Pepper Ketchup</span>
          </Link>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{errorInfo.title}</h1>
            <p className="text-gray-600 mt-2">{errorInfo.message}</p>
          </div>
          
          {/* Error-specific troubleshooting steps */}
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-700 mb-3">Troubleshooting steps:</h2>
            <ul className="text-sm text-gray-600 space-y-2 pl-5 list-disc">
              {error === 'OAuthCallback' && (
                <>
                  <li>Check that popup blockers are disabled for this site</li>
                  <li>Ensure you're using the latest browser version</li>
                  <li>Try signing in with a different provider or method</li>
                  <li>Clear your browser cookies and cache</li>
                </>
              )}
              
              {error === 'OAuthSignin' && (
                <>
                  <li>Check your internet connection</li>
                  <li>Try signing in with an alternative provider</li>
                  <li>Ensure cookies are enabled in your browser</li>
                </>
              )}
              
              {['OAuthAccountNotLinked', 'EmailCreateAccount', 'OAuthCreateAccount'].includes(error || '') && (
                <>
                  <li>Try signing in with the method you used originally</li>
                  <li>Contact support if you need help accessing your account</li>
                </>
              )}
              
              {error === 'CredentialsSignin' && (
                <>
                  <li>Double-check your email and password</li>
                  <li>Reset your password if you've forgotten it</li>
                </>
              )}
              
              {/* Default troubleshooting steps for all errors */}
              <li>Try signing in again</li>
              <li>Use a different web browser</li>
              <li>Contact support if the problem persists</li>
            </ul>
            
            {/* Add link to comprehensive troubleshooting guide */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                For more detailed troubleshooting steps and explanations, check our{' '}
                <Link href="/SOCIAL_AUTH_TROUBLESHOOTING.md" className="font-medium underline">
                  Social Auth Troubleshooting Guide
                </Link>
              </p>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <button
              onClick={handleRetry}
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </>
              )}
            </button>
            
            <Link 
              href="/"
              className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Return to Home
            </Link>
            
            <Link 
              href="/auth/debug"
              className="w-full py-2.5 px-4 border border-gray-300 text-gray-700 font-medium rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
            >
              <ShieldAlert className="h-4 w-4 mr-2" />
              Debug Authentication
            </Link>
          </div>
          
          {/* Error details (for debugging) */}
          {error && (
            <div className="mt-8 pt-4 border-t border-gray-200">
              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer">Error details (for technical support)</summary>
                <div className="mt-2 p-2 bg-gray-100 rounded font-mono">
                  <p>Error code: {error}</p>
                  <p>Timestamp: {new Date().toISOString()}</p>
                  <p>Browser: {navigator.userAgent}</p>
                </div>
              </details>
            </div>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-4 px-6 bg-amber-50">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} NJIT Salt Pepper Ketchup. All rights reserved.</p>
          <p className="mt-1">
            <Link href="/support" className="text-amber-700 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AuthErrorPage; 