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
  // Start with false (light mode) as default to match SSR
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Flag to track if component has mounted (client-side only)
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount before accessing localStorage
  useEffect(() => {
    setMounted(true);
    
    // Get saved preference from localStorage
    const savedMode = localStorage.getItem('uiMode');
    const initialDarkMode = savedMode === 'dark';
    setIsDarkMode(initialDarkMode);
    
    // Apply theme classes only after mounting (client-side)
    if (initialDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, []);
  
  // Separate useEffect for the callback to avoid state updates during render
  useEffect(() => {
    if (mounted && onModeChange) {
      onModeChange(isDarkMode);
    }
  }, [isDarkMode, onModeChange, mounted]);

  // Toggle mode function
  const toggleMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      
      // Save preference
      localStorage.setItem('uiMode', newMode ? 'dark' : 'light');
      
      // Apply the dark mode class to both html and body for compatibility
      if (newMode) {
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark');
        document.body.classList.remove('dark-mode');
      }
      
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