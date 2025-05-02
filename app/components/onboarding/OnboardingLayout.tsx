'use client';

import React, { ReactNode, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingNavigation, useOnboardingCompleted } from '../../store/onboardingStore';
import ProgressIndicator from './ProgressIndicator';
import SaveProgress from './SaveProgress';

interface OnboardingLayoutProps {
  children: ReactNode;
  showProgress?: boolean;
}

export default function OnboardingLayout({ 
  children, 
  showProgress = true 
}: OnboardingLayoutProps) {
  const router = useRouter();
  const { currentStep, nextStep, prevStep, isStepComplete } = useOnboardingNavigation();
  const onboardingCompleted = useOnboardingCompleted();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    // Check for dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
  }, []);

  // Determine if navigation buttons should be shown
  const showNavButtons = currentStep > 0 && currentStep <= 3;
  
  // Navigate to previous step
  const handlePrev = () => {
    prevStep();
    router.push(`/onboarding/step${currentStep - 1}`);
  };
  
  // Navigate to next step
  const handleNext = () => {
    if (isStepComplete(currentStep)) {
      nextStep();
      
      if (currentStep < 3) {
        router.push(`/onboarding/step${currentStep + 1}`);
      } else {
        // Onboarding complete, redirect to dashboard
        router.push('/dashboard');
      }
    }
  };

  // Skip onboarding if already completed
  React.useEffect(() => {
    if (onboardingCompleted) {
      router.push('/dashboard');
    }
  }, [onboardingCompleted, router]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      {/* Dark mode toggle */}
      <div className={`absolute top-4 right-4 z-10`}>
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${isDarkMode ? 'bg-gray-800 text-yellow-300' : 'bg-gray-100 text-gray-800'}`}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Progress indicator */}
      {showProgress && (
        <ProgressIndicator currentStep={currentStep} isDarkMode={isDarkMode} />
      )}

      {/* Main content */}
      <div className="flex-1 px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {children}
        </div>
      </div>
      
      {/* Navigation buttons */}
      {showNavButtons && (
        <div className={`border-t py-4 px-4 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} shadow-sm`}>
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <div className="flex items-center space-x-2">
              {currentStep > 1 ? (
                <button
                  onClick={handlePrev}
                  className={`px-6 py-2 border rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Back
                </button>
              ) : (
                <div></div> // Empty div to maintain flex layout
              )}
              
              {/* Add Save Progress button */}
              <SaveProgress isDarkMode={isDarkMode} />
            </div>
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className={`px-6 py-2 rounded-md text-white ${
                  isStepComplete(currentStep)
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!isStepComplete(currentStep)}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-transform transform active:scale-95"
              >
                Place My Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 