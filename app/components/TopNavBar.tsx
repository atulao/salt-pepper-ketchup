'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Building, Map, Home } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface TopNavBarProps {
  onModeChange?: (isDarkMode: boolean) => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ onModeChange }) => {
  const [mounted, setMounted] = useState(false);

  // Wait for component to mount to access localStorage
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleModeChange = (mode: boolean) => {
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const isDarkMode = mounted ? document.body.classList.contains('dark-mode') : false;

  return (
    <div className={`w-full border-b sticky top-0 z-50 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-sm'
    }`}>
      <div className="max-w-6xl mx-auto px-4 py-1">
        <div className="flex items-center justify-between">
          {/* Logo/Home Link */}
          <Link href="/" className="flex items-center group">
            <div className="h-12 w-auto relative">
              <Image 
                src="/salt-pepper-ketchup-logo.png" 
                alt="Salt-Pepper-Ketchup Logo" 
                width={180}
                height={60}
                priority
                className="h-full w-auto object-contain" 
              />
            </div>
          </Link>
          
          {/* Main Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/buildings" 
              className={`flex items-center px-3 py-1.5 rounded-md transition-colors ${
                isDarkMode 
                  ? 'text-gray-300 hover:text-blue-400 hover:bg-gray-800' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              <Building className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Buildings</span>
            </Link>
            
            {/* Add more navigation links here as needed */}
            
            {/* Theme Toggle */}
            <ThemeToggle onModeChange={handleModeChange} className="ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavBar; 