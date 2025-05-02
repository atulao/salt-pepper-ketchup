"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, Loader2, ArrowRight, Check, Info } from 'lucide-react';
import SocialAuth from '../../components/auth/SocialAuth';

const RegisterPage = () => {
  const router = useRouter();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = useState(false);

  // Password strength validation
  const hasMinLength = password.length >= 8;
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const isPasswordStrong = hasMinLength && hasSpecialChar && hasNumber && hasUppercase;
  const passwordsMatch = password === confirmPassword;

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate inputs
    if (!isPasswordStrong) {
      setError('Please ensure your password meets all requirements');
      return;
    }
    
    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }
    
    if (!acceptTerms) {
      setError('You must accept the terms and privacy policy');
      return;
    }
    
    setIsLoading(true);

    try {
      // API call to register the user
      const registrationResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const responseData = await registrationResponse.json();
      
      if (!registrationResponse.ok) {
        throw new Error(responseData.message || 'Registration failed');
      }
      
      // Registration successful, now sign them in
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.error) {
        throw new Error('Sign in after registration failed: ' + signInResult.error);
      }

      // Redirect to onboarding step 1
      router.push('/onboarding/step1');
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
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
          <Link 
            href="/auth/login" 
            className="text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Already have an account? <span className="underline">Sign in</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-amber-700">Join SPK Today</h1>
            <p className="text-gray-600 mt-2">Create your account to get started</p>
          </div>

          {showEmailForm ? (
            <form onSubmit={handleEmailRegister} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your@email.com"
                  disabled={isLoading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  <Info className="inline h-3 w-3 mr-1" />
                  Use your NJIT email for access to campus-specific features
                </p>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={`w-full px-3 py-2 border ${
                      password.length > 0 && !isPasswordStrong 
                        ? 'border-amber-300' 
                        : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    placeholder="Create a strong password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center text-xs">
                      <span className={`mr-1 ${hasMinLength ? 'text-green-500' : 'text-gray-400'}`}>
                        {hasMinLength ? <Check size={12} /> : '○'}
                      </span>
                      <span className={hasMinLength ? 'text-green-700' : 'text-gray-500'}>
                        At least 8 characters
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-1 ${hasSpecialChar ? 'text-green-500' : 'text-gray-400'}`}>
                        {hasSpecialChar ? <Check size={12} /> : '○'}
                      </span>
                      <span className={hasSpecialChar ? 'text-green-700' : 'text-gray-500'}>
                        At least one special character
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-1 ${hasNumber ? 'text-green-500' : 'text-gray-400'}`}>
                        {hasNumber ? <Check size={12} /> : '○'}
                      </span>
                      <span className={hasNumber ? 'text-green-700' : 'text-gray-500'}>
                        At least one number
                      </span>
                    </div>
                    <div className="flex items-center text-xs">
                      <span className={`mr-1 ${hasUppercase ? 'text-green-500' : 'text-gray-400'}`}>
                        {hasUppercase ? <Check size={12} /> : '○'}
                      </span>
                      <span className={hasUppercase ? 'text-green-700' : 'text-gray-500'}>
                        At least one uppercase letter
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className={`w-full px-3 py-2 border ${
                    confirmPassword.length > 0 && !passwordsMatch
                      ? 'border-red-300' 
                      : 'border-gray-300'
                  } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                  placeholder="Confirm your password"
                  disabled={isLoading}
                />
                {confirmPassword.length > 0 && !passwordsMatch && (
                  <p className="mt-1 text-xs text-red-600">
                    Passwords do not match
                  </p>
                )}
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="acceptTerms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                    disabled={isLoading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="acceptTerms" className="text-gray-700">
                    I accept the{' '}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                ) : (
                  <span className="flex items-center justify-center">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                )}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="text-sm text-gray-600 hover:text-amber-700"
                >
                  Back to all sign up options
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="mb-6 text-center text-sm text-gray-600">
                <p>Create an account using one of the following options:</p>
              </div>
              
              <SocialAuth 
                callbackUrl="/onboarding/step1"
                onEmailAuth={() => setShowEmailForm(true)}
              />
            </>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 bg-amber-50">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} NJIT Salt Pepper Ketchup. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default RegisterPage; 