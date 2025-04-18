'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  onModeChange?: (isDarkMode: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  onModeChange 
}) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Initialize mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('uiMode');
    const initialDarkMode = savedMode === 'dark';
    setIsDarkMode(initialDarkMode);
  }, []);
  
  // Separate useEffect for the callback to avoid state updates during render
  useEffect(() => {
    if (onModeChange) {
      onModeChange(isDarkMode);
    }
  }, [isDarkMode, onModeChange]);

  // Toggle mode function
  const toggleMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      // Save preference
      localStorage.setItem('uiMode', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return (
    <button
      onClick={toggleMode}
      className={`p-2 rounded-md transition-colors flex items-center ${
        isDarkMode 
          ? 'bg-gray-800 text-white hover:bg-gray-700' 
          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
      } ${className}`}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDarkMode ? (
        <>
          <Moon size={18} className="mr-2" />
          <span className="text-sm font-medium">Dark Mode</span>
        </>
      ) : (
        <>
          <Sun size={18} className="mr-2" />
          <span className="text-sm font-medium">Light Mode</span>
        </>
      )}
    </button>
  );
};

export default ThemeToggle;