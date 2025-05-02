'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSaveProgress } from '../../store/onboardingStore';

interface SaveProgressModalProps {
  onClose: () => void;
  isDarkMode: boolean;
  hasSavedBefore: boolean;
}

const SaveProgressModal: React.FC<SaveProgressModalProps> = ({ 
  onClose, 
  isDarkMode,
  hasSavedBefore
}) => {
  const { saveProgress, getSaveCode } = useSaveProgress();
  const [email, setEmail] = useState('');
  const [saveCode, setSaveCode] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<'initial' | 'saving' | 'completed'>('initial');
  const [copySuccess, setCopySuccess] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Check if user already has a save code
    if (hasSavedBefore) {
      setSaveCode(getSaveCode());
      setSavingState('completed');
    }
    
    // Focus trap and escape key handler
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasSavedBefore, getSaveCode, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSavingState('saving');
    
    // Small delay to show saving state
    setTimeout(() => {
      const code = saveProgress(email);
      setSaveCode(code);
      setSavingState('completed');
    }, 750);
  };

  const handleClickOutside = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const copyCodeToClipboard = () => {
    if (saveCode) {
      navigator.clipboard.writeText(saveCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // Get current date for receipt
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  // Get current time for receipt
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 p-4"
      onClick={handleClickOutside}
      aria-modal="true"
      role="dialog"
      aria-labelledby="save-progress-title"
    >
      <div 
        ref={modalRef}
        className={`w-full max-w-md rounded-lg shadow-xl ${
          isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
        } overflow-hidden`}
        onClick={e => e.stopPropagation()}
      >
        <div className="border-b px-6 py-4 flex justify-between items-center">
          <h2 
            id="save-progress-title" 
            className="text-xl font-bold flex items-center"
          >
            <span className="mr-2">
              {savingState === 'completed' ? '🧾' : '📝'}
            </span>
            {savingState === 'completed' ? 'Your Order Receipt' : 'Save Your Order'}
          </h2>
          <button 
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-opacity-10 hover:bg-gray-500 transition-colors`}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>
        
        <div className="p-6">
          {/* Initial State - Email Input Form */}
          {savingState === 'initial' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="mb-4">
                Save your progress and return to complete your order later. 
                We'll generate a unique order number for you.
              </p>
              
              <div>
                <label htmlFor="email" className="block mb-1 font-medium">
                  Email (optional)
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`w-full px-4 py-2 rounded-md border ${
                    isDarkMode 
                      ? 'bg-gray-800 border-gray-700 text-white' 
                      : 'bg-white border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-amber-500`}
                />
                <p className="mt-1 text-sm text-gray-500">
                  We'll save your order number here as well (not actually sent in this demo)
                </p>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 rounded-md ${
                    isDarkMode 
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-gray-500`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  Generate Order Number
                </button>
              </div>
            </form>
          )}
          
          {/* Saving State - Loading Animation */}
          {savingState === 'saving' && (
            <div className="flex flex-col items-center py-8">
              <div className="w-12 h-12 border-t-2 border-amber-600 rounded-full animate-spin"></div>
              <p className="mt-4">Printing your receipt...</p>
            </div>
          )}
          
          {/* Completed State - Order Receipt */}
          {savingState === 'completed' && saveCode && (
            <div className="space-y-4">
              {/* Receipt styling */}
              <div className={`border rounded-md overflow-hidden ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-amber-50 border-amber-200'
              }`}>
                {/* Receipt header */}
                <div className={`text-center p-4 border-b ${
                  isDarkMode ? 'border-gray-700' : 'border-amber-200'
                }`}>
                  <h3 className="font-bold text-lg">Salt Pepper Ketchup</h3>
                  <p className="text-sm">Campus Diner</p>
                  <div className="text-xs mt-2">
                    <p>{formattedDate}</p>
                    <p>{formattedTime}</p>
                  </div>
                </div>
                
                {/* Order number */}
                <div className="p-6 text-center">
                  <div className="mb-2 text-sm font-semibold">YOUR ORDER NUMBER</div>
                  <p 
                    ref={codeRef} 
                    className="text-4xl font-mono font-bold tracking-wider text-amber-600 py-2 border-y border-dashed border-amber-300"
                  >
                    {saveCode}
                  </p>
                  <div className="mt-4 text-xs opacity-80">
                    Save this number to continue your order later
                  </div>
                </div>
                
                {/* Receipt footer */}
                <div className={`p-4 text-center border-t text-xs ${
                  isDarkMode ? 'border-gray-700' : 'border-amber-200'
                }`}>
                  Thank you for ordering at SPK!
                </div>
              </div>
              
              {/* Copy button */}
              <button
                onClick={copyCodeToClipboard}
                className={`mt-2 w-full py-2 px-4 rounded-md ${
                  copySuccess
                    ? 'bg-green-600 text-white'
                    : isDarkMode
                      ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700'
                      : 'bg-white text-gray-800 hover:bg-gray-100 border border-gray-300'
                } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
              >
                {copySuccess ? '✓ Copied to Clipboard!' : 'Copy Order Number'}
              </button>
              
              {/* Instructions */}
              <div className={`mt-6 p-4 rounded-md ${
                isDarkMode ? 'bg-gray-800 border border-gray-700' : 'bg-amber-50'
              }`}>
                <h3 className="font-bold mb-2">How to Resume Your Order Later</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Return to the Salt Pepper Ketchup website</li>
                  <li>Enter your order number on the first page</li>
                  <li>Continue placing your order where you left off</li>
                </ol>
                <p className="text-xs mt-3 text-amber-700">
                  * Your saved order will expire in 7 days
                </p>
              </div>
              
              {/* Close button */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SaveProgressModal; 