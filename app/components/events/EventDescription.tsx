'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDarkMode, getThemeClasses } from '../../utils/theme-utils';

interface EventDescriptionProps {
  description: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  maxLength?: number;
}

// Function to strip HTML tags
const stripHtmlTags = (html: string): string => {
  if (!html) return '';
  
  // Handle common HTML entities
  const withEntitiesReplaced = html
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
    
  // Use DOM API to strip tags (browser-only)
  if (typeof document !== 'undefined') {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = withEntitiesReplaced;
    return tempDiv.textContent || tempDiv.innerText || '';
  }
  
  // Fallback for SSR
  return withEntitiesReplaced.replace(/<[^>]*>/g, '');
};

const EventDescription: React.FC<EventDescriptionProps> = ({
  description,
  isExpanded = false,
  onToggle,
  maxLength = 100
}) => {
  const [internalExpanded, setInternalExpanded] = useState(isExpanded);
  const [cleanDescription, setCleanDescription] = useState('');
  
  // Use the custom dark mode hook
  const isDarkMode = useDarkMode();
  
  // Clean the description when it changes
  useEffect(() => {
    setCleanDescription(stripHtmlTags(description));
  }, [description]);
  
  // Use either controlled or uncontrolled state
  const expanded = onToggle ? isExpanded : internalExpanded;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };
  
  const needsToggle = cleanDescription.length > maxLength;
  
  return (
    <div className="relative">
      <p className={`${getThemeClasses(
        isDarkMode, 
        'text-gray-600', 
        'text-gray-300'
      )} text-sm leading-relaxed ${
        expanded ? '' : 'line-clamp-2'
      }`}>
        {cleanDescription}
      </p>
      
      {needsToggle && (
        <button 
          onClick={handleToggle}
          className={`mt-1 ${getThemeClasses(
            isDarkMode,
            'text-blue-500 hover:text-blue-600',
            'text-blue-400 hover:text-blue-300'
          )} text-xs font-medium flex items-center transition-colors focus:outline-none rounded`}
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-3 w-3 ml-1" /></>
          ) : (
            <>Read more <ChevronDown className="h-3 w-3 ml-1" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default EventDescription;