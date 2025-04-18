import { useState, useEffect } from 'react';

/**
 * Custom hook that detects dark mode changes and returns the current theme state
 * @returns Boolean indicating if dark mode is active
 */
export function useDarkMode(): boolean {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Function to check if dark mode is active
    const checkDarkMode = () => {
      const isDark = document.documentElement.classList.contains('dark') || 
                     document.body.classList.contains('dark-mode');
      setIsDarkMode(isDark);
    };

    // Initial check
    checkDarkMode();

    // Create a MutationObserver to watch for class changes on html and body
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          checkDarkMode();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, { attributes: true });
    observer.observe(document.body, { attributes: true });

    // Clean up observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return isDarkMode;
}

/**
 * Apply appropriate dark mode styling to an element
 * @param isDarkMode Boolean indicating if dark mode is active
 * @param lightModeClasses Classes to apply in light mode
 * @param darkModeClasses Classes to apply in dark mode
 * @returns String of CSS classes to apply
 */
export function getThemeClasses(
  isDarkMode: boolean, 
  lightModeClasses: string, 
  darkModeClasses: string
): string {
  return isDarkMode ? darkModeClasses : lightModeClasses;
}

/**
 * Force update theme on the document
 * @param isDarkMode Boolean indicating if dark mode should be enabled
 */
export function applyTheme(isDarkMode: boolean): void {
  if (isDarkMode) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark-mode');
  }
} 