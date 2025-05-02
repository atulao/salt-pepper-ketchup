'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSaveProgress } from '../../store/onboardingStore';

interface ResumeProgressProps {
  isDarkMode: boolean;
}

const ResumeProgress: React.FC<ResumeProgressProps> = ({ isDarkMode }) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadProgress } = useSaveProgress();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate code format (6 digits)
    if (!/^\d{6}$/.test(code)) {
      setError('Please enter a valid 6-digit order number');
      return;
    }
    
    setIsLoading(true);
    console.log(`ResumeProgress: Attempting to load order with code ${code}`);
    
    // Small delay to show loading state
    setTimeout(() => {
      const success = loadProgress(code);
      
      if (success) {
        // Set a flag in sessionStorage to prevent redirect loops
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('resuming_from_code', 'true');
        }
        
        console.log(`ResumeProgress: Successfully loaded order with code ${code}, redirecting`);
        // Use replace to avoid adding to history stack
        router.replace('/onboarding/step1');
      } else {
        console.log(`ResumeProgress: Failed to load order with code ${code}`);
        setError('Order number not found or expired. Please check and try again.');
      }
      
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className={`p-4 rounded-lg ${
      isDarkMode ? 'bg-gray-800' : 'bg-amber-50'
    } mb-6`}>
      <h3 className={`text-lg font-bold ${
        isDarkMode ? 'text-white' : 'text-amber-800'
      } mb-2`}>
        Resume a Saved Order
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label 
            htmlFor="orderCode" 
            className={`block text-sm font-medium ${
              isDarkMode ? 'text-gray-300' : 'text-amber-700'
            } mb-1`}
          >
            Order Number
          </label>
          
          <div className="flex">
            <input
              type="text"
              id="orderCode"
              placeholder="Enter your 6-digit code"
              value={code}
              onChange={(e) => {
                setCode(e.target.value.replace(/[^\d]/g, '').slice(0, 6));
                setError(null);
              }}
              className={`flex-1 px-3 py-2 border rounded-l-md ${
                isDarkMode 
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-amber-300 text-gray-900 placeholder-gray-400'
              } focus:outline-none focus:ring-2 focus:ring-amber-500`}
              maxLength={6}
              inputMode="numeric"
              pattern="[0-9]*"
            />
            
            <button
              type="submit"
              disabled={isLoading || code.length !== 6}
              className={`px-4 py-2 rounded-r-md font-medium ${
                isLoading 
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed' 
                  : code.length === 6
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-gray-400 text-gray-700 cursor-not-allowed'
              }`}
            >
              {isLoading ? 'Loading...' : 'Resume'}
            </button>
          </div>
          
          {error && (
            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>
      </form>
    </div>
  );
};

export default ResumeProgress; 