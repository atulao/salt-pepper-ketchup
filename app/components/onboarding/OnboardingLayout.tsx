'use client';

import React, { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useOnboardingNavigation, useOnboardingCompleted } from '../../store/onboardingStore';

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
        // Onboarding complete, redirect to home
        router.push('/');
      }
    }
  };

  // Skip onboarding if already completed
  React.useEffect(() => {
    if (onboardingCompleted) {
      router.push('/');
    }
  }, [onboardingCompleted, router]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Progress indicator */}
      {showProgress && (
        <div className="bg-white border-b shadow-sm py-3 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {[1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`rounded-full w-8 h-8 flex items-center justify-center ${
                      step < currentStep
                        ? 'bg-blue-500 text-white'
                        : step === currentStep
                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                        : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {step}
                  </div>
                ))}
              </div>
              
              <div className="text-sm text-gray-500">
                Step {currentStep} of 3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1">
        {children}
      </div>
      
      {/* Navigation buttons */}
      {showNavButtons && (
        <div className="bg-white border-t shadow-sm py-4 px-4">
          <div className="max-w-7xl mx-auto flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Back
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className={`px-6 py-2 rounded-md text-white ${
                  isStepComplete(currentStep)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
                disabled={!isStepComplete(currentStep)}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Complete Onboarding
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 