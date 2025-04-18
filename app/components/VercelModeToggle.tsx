'use client';

import React, { useEffect, useState } from 'react';
import { Terminal, Code2 } from 'lucide-react';

interface VercelModeToggleProps {
  className?: string;
  onModeChange?: (isVercelMode: boolean) => void;
}

const VercelModeToggle: React.FC<VercelModeToggleProps> = ({ 
  className = '',
  onModeChange 
}) => {
  const [isVercelMode, setIsVercelMode] = useState<boolean>(false);

  // Initialize mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('uiMode');
    const initialVercelMode = savedMode === 'vercel';
    setIsVercelMode(initialVercelMode);
    
    // Notify parent component if callback exists
    if (onModeChange) {
      onModeChange(initialVercelMode);
    }
  }, [onModeChange]);

  // Toggle mode function
  const toggleMode = () => {
    setIsVercelMode(prev => {
      const newMode = !prev;
      
      // Save preference
      localStorage.setItem('uiMode', newMode ? 'vercel' : 'standard');
      
      // Notify parent component if callback exists
      if (onModeChange) {
        onModeChange(newMode);
      }
      
      return newMode;
    });
  };

  return (
    <button
      onClick={toggleMode}
      className={`p-2 rounded-md transition-colors flex items-center ${
        isVercelMode 
          ? 'bg-black text-white hover:bg-gray-800' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${className}`}
      aria-label={isVercelMode ? 'Switch to standard UI' : 'Switch to Vercel AI UI'}
    >
      {isVercelMode ? (
        <>
          <Terminal size={18} className="mr-2" />
          <span className="text-sm font-medium">Vercel UI</span>
        </>
      ) : (
        <>
          <Code2 size={18} className="mr-2" />
          <span className="text-sm font-medium">Standard UI</span>
        </>
      )}
    </button>
  );
};

export default VercelModeToggle;