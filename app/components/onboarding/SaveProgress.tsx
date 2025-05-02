'use client';

import React, { useState } from 'react';
import { useSaveProgress, useOnboardingCompleted } from '../../store/onboardingStore';
import SaveProgressModal from './SaveProgressModal';

interface SaveProgressProps {
  isDarkMode: boolean;
}

const SaveProgress: React.FC<SaveProgressProps> = ({ isDarkMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { hasSaveCode } = useSaveProgress();
  const onboardingCompleted = useOnboardingCompleted();

  // Don't show save button if onboarding is complete
  if (onboardingCompleted) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`px-4 py-2 rounded-md flex items-center gap-1.5 ${
          isDarkMode
            ? 'bg-gray-800 text-amber-200 hover:bg-gray-700 border border-gray-700'
            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
        } transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2`}
        aria-label="Save my order for later"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4"
        >
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <polyline points="17 21 17 13 7 13 7 21" />
          <polyline points="7 3 7 8 15 8" />
        </svg>
        <span>Save My Order for Later</span>
      </button>
      
      {isModalOpen && (
        <SaveProgressModal 
          onClose={() => setIsModalOpen(false)} 
          isDarkMode={isDarkMode}
          hasSavedBefore={hasSaveCode()}
        />
      )}
    </>
  );
};

export default SaveProgress; 