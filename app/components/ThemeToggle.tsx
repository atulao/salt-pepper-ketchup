'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { applyTheme } from '../utils/theme-utils';

interface ThemeToggleProps {
  className?: string;
  onModeChange?: (isDarkMode: boolean) => void;
}

const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className = '',
  onModeChange 
}) => {
  // Start with false (light mode) as default to match SSR
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Flag to track if component has mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount before accessing localStorage
  useEffect(() => {
    setMounted(true);
    console.log("--- Debug ThemeToggle: Mounted");
    
    // Get saved preference from localStorage
    const savedMode = localStorage.getItem('uiMode');
    const initialDarkMode = savedMode === 'dark';
    console.log(`--- Debug ThemeToggle: Initial localStorage mode: ${savedMode}, setting isDarkMode: ${initialDarkMode}`);
    setIsDarkMode(initialDarkMode);
    
    // Apply theme classes only after mounting (client-side)
    applyTheme(initialDarkMode);

  }, []);
  
  // Separate useEffect for the callback to avoid state updates during render
  useEffect(() => {
    if (mounted && onModeChange) {
      console.log(`--- Debug ThemeToggle: Calling onModeChange with isDarkMode: ${isDarkMode}`);
      onModeChange(isDarkMode);
    }
  }, [isDarkMode, onModeChange, mounted]);

  // Toggle mode function
  const toggleMode = () => {
    console.log("--- Debug ThemeToggle: toggleMode called");
    setIsDarkMode(prev => {
      const newMode = !prev;
      console.log(`--- Debug ThemeToggle: Toggling mode. New isDarkMode: ${newMode}`);
      
      // Save preference
      localStorage.setItem('uiMode', newMode ? 'dark' : 'light');
      
      // Apply the dark mode class using helper function
      applyTheme(newMode);
      
      return newMode;
    });
  };

  // If not mounted yet, render a placeholder with the same dimensions to avoid layout shift
  if (!mounted) {
    return (
      <button 
        className={`p-2 rounded-md bg-gray-100 text-gray-800 ${className}`}
        aria-label="Theme toggle"
        style={{ opacity: 0 }}
      >
        <Sun size={18} className="mr-2" />
        <span className="text-sm font-medium">Light Mode</span>
      </button>
    );
  }

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