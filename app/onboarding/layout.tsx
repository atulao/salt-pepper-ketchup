"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../store/onboardingStore';
import Image from 'next/image';
import Link from 'next/link';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { is_authenticated } = useAuth();
  const [bypassAuth, setBypassAuth] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Check for development mode and mounted status
  useEffect(() => {
    setMounted(true);
    
    // In development, we'll check URL parameters to determine authentication state
    if (process.env.NODE_ENV === 'development') {
      // Default: keep using our previous setting
      const storedBypass = localStorage.getItem('spk-bypass-auth') === 'true';
      
      // Check URL params - we made this match the middleware
      if (window.location.search.includes('auth_check')) {
        // User wants to test with auth enabled
        setBypassAuth(false);
        localStorage.setItem('spk-bypass-auth', 'false');
      } else if (storedBypass) {
        // Keep using bypass if that was the previous setting
        setBypassAuth(true);
      } else {
        // Default for first-time visitors is to bypass
        setBypassAuth(true);
        localStorage.setItem('spk-bypass-auth', 'true');
      }
    }
  }, []);
  
  // Check if user is authenticated - with bypass option for development
  useEffect(() => {
    if (!mounted) return;
    
    // Only check authentication if we're not bypassing auth in development
    if (!is_authenticated && !bypassAuth) {
      console.log("OnboardingLayout: Not authenticated, redirecting to login");
      // Redirect to login page if not authenticated
      router.push('/auth/login');
    }
  }, [is_authenticated, router, bypassAuth, mounted]);
  
  // Don't render until we've checked mounted status and bypass settings
  if (!mounted) return null;
  
  // Show loading state while redirecting if not authenticated and not bypassing
  if (!is_authenticated && !bypassAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-amber-50 p-4">
        <div className="w-full max-w-md flex flex-col items-center">
          <Image 
            src="/images/spk-logo.png" 
            alt="Salt Pepper Ketchup Logo" 
            width={80} 
            height={80}
            className="mb-4"
          />
          <h1 className="text-xl font-bold text-amber-800 mb-4">Checking your order status...</h1>
          <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-600 h-2 animate-pulse"></div>
          </div>
          <p className="mt-4 text-sm text-gray-600">
            You need to be signed in to continue with your SPK order.
          </p>
          <Link 
            href="/auth/login"
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
          >
            Sign in
          </Link>
          
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={() => {
                setBypassAuth(true);
                localStorage.setItem('spk-bypass-auth', 'true');
              }}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Bypass Auth (Development)
            </button>
          )}
        </div>
      </div>
    );
  }
  
  // Show the regular onboarding layout once authenticated or bypassed
  return (
    <div className="min-h-screen bg-amber-50">
      <header className="bg-white shadow-sm p-4">
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
          
          {/* Show development mode indicator with toggle */}
          {process.env.NODE_ENV === 'development' && (
            <div className="flex items-center">
              <span className={`px-2 py-1 rounded text-xs ${
                bypassAuth 
                  ? "bg-yellow-100 text-yellow-800" 
                  : "bg-green-100 text-green-800"
              }`}>
                {bypassAuth ? "Dev Mode: Auth Bypassed" : "Dev Mode: Auth Enabled"}
              </span>
              <button
                onClick={() => {
                  const newBypass = !bypassAuth;
                  setBypassAuth(newBypass);
                  localStorage.setItem('spk-bypass-auth', newBypass.toString());
                }}
                className="ml-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded"
              >
                {bypassAuth ? "Enable Auth" : "Bypass Auth"}
              </button>
            </div>
          )}
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto p-4">
        {children}
      </main>
    </div>
  );
} 