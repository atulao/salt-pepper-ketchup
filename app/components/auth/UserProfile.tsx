"use client";

import React, { useState, useRef, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../../store/onboardingStore';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';

const UserProfile: React.FC = () => {
  const { name, email, image, is_authenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle sign out
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/login' });
  };
  
  if (!is_authenticated) {
    return (
      <div className="flex space-x-2">
        <Link 
          href="/auth/login" 
          className="px-4 py-1.5 text-amber-700 rounded-md hover:bg-amber-50 transition-colors text-sm font-medium"
        >
          Sign In
        </Link>
        <Link 
          href="/auth/register" 
          className="px-4 py-1.5 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors text-sm font-medium"
        >
          Join SPK
        </Link>
      </div>
    );
  }
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 py-1 px-2 rounded-md hover:bg-amber-50 transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {image ? (
          <Image 
            src={image} 
            alt={name || 'User'} 
            width={32} 
            height={32} 
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
            <User size={16} className="text-amber-800" />
          </div>
        )}
        <span className="font-medium text-sm text-gray-800">
          {name || email?.split('@')[0] || 'User'}
        </span>
        <ChevronDown size={16} className={`text-gray-600 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 py-1 border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-500 truncate">{email}</p>
          </div>
          
          <Link 
            href="/dashboard" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
          >
            Dashboard
          </Link>
          
          <Link 
            href="/profile" 
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-amber-50 transition-colors"
          >
            <div className="flex items-center">
              <Settings size={16} className="mr-2" />
              Account Settings
            </div>
          </Link>
          
          <button
            onClick={handleSignOut}
            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <div className="flex items-center">
              <LogOut size={16} className="mr-2" />
              Sign Out
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfile; 