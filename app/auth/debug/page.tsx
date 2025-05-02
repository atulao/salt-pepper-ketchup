"use client";

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useAuth } from '../../store/onboardingStore';
import Link from 'next/link';
import { cleanupAuthStorage, testSessionCookies, testCorsCapabilities, resetAuthState } from '../../utils/sessionFixer';
import { AlertTriangle, RefreshCw, CheckCircle2, X, ArrowRight } from 'lucide-react';

const AuthDebugPage = () => {
  const { data: session, status } = useSession();
  const auth = useAuth();
  const [localStorageAuth, setLocalStorageAuth] = useState<string | null>(null);
  const [cookieTestResult, setCookieTestResult] = useState<any>(null);
  const [corsTestResult, setCorsTestResult] = useState<any>(null);
  const [resetResult, setResetResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState({
    cookies: false,
    cors: false,
    reset: false,
    cleanup: false
  });
  
  useEffect(() => {
    // Get auth data from localStorage for debugging
    try {
      const storageData = localStorage.getItem('spk-onboarding-storage');
      setLocalStorageAuth(storageData);
    } catch (error) {
      console.error('Failed to read localStorage:', error);
    }
  }, []);
  
  const handleTestCookies = async () => {
    setIsLoading(prev => ({ ...prev, cookies: true }));
    const result = testSessionCookies();
    setCookieTestResult(result);
    setIsLoading(prev => ({ ...prev, cookies: false }));
  };
  
  const handleTestCors = async () => {
    setIsLoading(prev => ({ ...prev, cors: true }));
    const result = await testCorsCapabilities();
    setCorsTestResult(result);
    setIsLoading(prev => ({ ...prev, cors: false }));
  };
  
  const handleResetAuth = () => {
    if (window.confirm('This will clear all authentication data and reload the page. Continue?')) {
      setIsLoading(prev => ({ ...prev, reset: true }));
      const result = resetAuthState();
      setResetResult(result);
      setIsLoading(prev => ({ ...prev, reset: false }));
      
      // Give user time to see the result before reload
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    }
  };
  
  const handleCleanupStorage = () => {
    setIsLoading(prev => ({ ...prev, cleanup: true }));
    const result = cleanupAuthStorage();
    // Refresh local storage display
    try {
      const storageData = localStorage.getItem('spk-onboarding-storage');
      setLocalStorageAuth(storageData);
    } catch (error) {
      console.error('Failed to read localStorage:', error);
    }
    setIsLoading(prev => ({ ...prev, cleanup: false }));
    
    // Show confirmation that will disappear
    alert(`Cleanup completed. Removed ${result.removedItems.length} items.`);
  };
  
  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-amber-700 mb-6">Authentication Debug</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">NextAuth Session Status</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <div className="flex items-center gap-2 mb-2">
              <strong>Status:</strong> 
              <span className={`px-2 py-0.5 rounded text-xs ${
                status === 'authenticated' ? 'bg-green-100 text-green-800' :
                status === 'loading' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {status.toUpperCase()}
              </span>
            </div>
            {status === 'authenticated' && (
              <pre className="mt-2 text-xs overflow-auto max-h-40">
                {JSON.stringify(session, null, 2)}
              </pre>
            )}
            {status === 'unauthenticated' && (
              <p className="text-sm text-gray-600">No active session found. Try signing in.</p>
            )}
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Zustand Auth Store</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <pre className="text-xs overflow-auto max-h-40">
              {JSON.stringify(auth, null, 2)}
            </pre>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">LocalStorage Data</h2>
          <div className="bg-gray-100 p-4 rounded mb-4">
            <pre className="text-xs overflow-auto max-h-40">
              {localStorageAuth ? JSON.stringify(JSON.parse(localStorageAuth), null, 2) : "No data found"}
            </pre>
          </div>
          <button
            onClick={handleCleanupStorage}
            disabled={isLoading.cleanup}
            className="px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            {isLoading.cleanup ? 'Cleaning...' : 'Clean Auth Storage'}
          </button>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-2">Session Diagnostics</h2>
          
          <div className="space-y-4">
            <div>
              <button
                onClick={handleTestCookies}
                disabled={isLoading.cookies}
                className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                {isLoading.cookies ? 'Testing...' : 'Test Cookies'}
              </button>
              
              {cookieTestResult && (
                <div className="mt-2 p-3 rounded text-sm bg-gray-100">
                  <div className="flex items-center gap-2">
                    <span>Can write cookies:</span>
                    {cookieTestResult.canWrite ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <X className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Can read cookies:</span>
                    {cookieTestResult.canRead ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <X className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  {cookieTestResult.error && (
                    <div className="mt-1 text-red-600 text-xs">
                      Error: {cookieTestResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <button
                onClick={handleTestCors}
                disabled={isLoading.cors}
                className="px-3 py-1.5 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
              >
                {isLoading.cors ? 'Testing...' : 'Test CORS Capabilities'}
              </button>
              
              {corsTestResult && (
                <div className="mt-2 p-3 rounded text-sm bg-gray-100">
                  <div className="flex items-center gap-2">
                    <span>CORS enabled:</span>
                    {corsTestResult.corsEnabled ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <X className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Third-party cookies:</span>
                    {corsTestResult.thirdPartyCookiesAllowed ? 
                      <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                      <X className="h-4 w-4 text-red-500" />
                    }
                  </div>
                  {corsTestResult.error && (
                    <div className="mt-1 text-red-600 text-xs">
                      Error: {corsTestResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
          <Link 
            href="/auth/login"
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors inline-flex items-center justify-center"
          >
            Back to Login
          </Link>
          
          <Link
            href="/auth/linkedin-config-checker"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors inline-flex items-center justify-center"
          >
            LinkedIn Config Checker <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          
          <button 
            onClick={handleResetAuth}
            disabled={isLoading.reset}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors inline-flex items-center justify-center"
          >
            {isLoading.reset ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <AlertTriangle className="h-4 w-4 mr-2" />
            )}
            Reset Auth State
          </button>
        </div>
        
        {resetResult && resetResult.success && (
          <div className="mt-4 p-4 bg-green-100 border border-green-300 rounded-md">
            <p className="text-green-800 font-medium">Auth state successfully reset!</p>
            <p className="text-sm text-green-700 mt-1">The page will reload shortly...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthDebugPage; 