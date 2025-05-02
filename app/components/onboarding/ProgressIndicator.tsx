"use client";

import React from 'react';
import { CheckIcon } from 'lucide-react';

interface ProgressIndicatorProps {
  currentStep: number;
  isDarkMode?: boolean;
}

const STEPS = [
  { id: 1, name: "Bagel", emoji: "🥯", ariaLabel: "Step 1: Select your academic major" },
  { id: 2, name: "Substance", emoji: "🍳", ariaLabel: "Step 2: Choose your interests" },
  { id: 3, name: "Salt-Pepper-Ketchup", emoji: "🧂🌶️🍅", ariaLabel: "Step 3: Complete your order" }
];

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ 
  currentStep,
  isDarkMode = false
}) => {
  return (
    <div className={`w-full py-4 px-4 ${isDarkMode ? 'bg-gray-900' : 'bg-white border-b'} shadow-sm`}
         role="navigation"
         aria-label="Onboarding progress">
      <div className="max-w-3xl mx-auto">
        {/* Mobile View (Simplified) */}
        <div className="md:hidden flex items-center justify-between">
          <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200">
            <div 
              className="h-full bg-amber-500" 
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              aria-hidden="true"
            ></div>
          </div>
          <span className={`ml-3 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Step {currentStep} of 3
          </span>
        </div>
        
        {/* Desktop View */}
        <div className="hidden md:block">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 w-full h-0.5 -translate-y-1/2 bg-gray-200" aria-hidden="true"></div>
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {STEPS.map((step) => {
                const isCompleted = currentStep > step.id;
                const isCurrent = currentStep === step.id;
                
                // Determine step status classes
                let stepClasses = `flex flex-col items-center`;
                let circleClasses = `w-10 h-10 flex items-center justify-center rounded-full text-sm font-semibold relative z-10 transition-all `;
                let textClasses = `mt-2 text-xs font-medium transition-colors`;
                
                if (isCompleted) {
                  circleClasses += isDarkMode 
                    ? 'bg-amber-600 text-white shadow-amber-400/10 shadow-md' 
                    : 'bg-amber-500 text-white shadow-sm';
                  textClasses += isDarkMode ? ' text-amber-400' : ' text-amber-600';
                } else if (isCurrent) {
                  circleClasses += isDarkMode 
                    ? 'bg-amber-400/20 text-amber-300 border-2 border-amber-400' 
                    : 'bg-amber-100 text-amber-800 border-2 border-amber-400';
                  textClasses += isDarkMode ? ' text-amber-300' : ' text-amber-800';
                } else {
                  circleClasses += isDarkMode 
                    ? 'bg-gray-800 text-gray-400 border border-gray-700' 
                    : 'bg-gray-100 text-gray-500 border border-gray-300';
                  textClasses += isDarkMode ? ' text-gray-400' : ' text-gray-500';
                }
                
                return (
                  <div
                    key={step.id}
                    className={stepClasses}
                    aria-current={isCurrent ? "step" : undefined}
                  >
                    <div 
                      className={circleClasses}
                      aria-label={step.ariaLabel}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <span aria-hidden="true">{step.emoji}</span>
                      )}
                    </div>
                    <span className={textClasses}>
                      {step.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Step Description - Additional context for current step */}
          <div className="mt-4 text-center">
            <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {STEPS[currentStep - 1]?.ariaLabel || ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator; 