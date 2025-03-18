'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface EventDescriptionProps {
  description: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  maxLength?: number;
}

const EventDescription: React.FC<EventDescriptionProps> = ({
  description,
  isExpanded = false,
  onToggle,
  maxLength = 100
}) => {
  const [internalExpanded, setInternalExpanded] = useState(isExpanded);
  
  // Use either controlled or uncontrolled state
  const expanded = onToggle ? isExpanded : internalExpanded;
  
  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalExpanded(!internalExpanded);
    }
  };
  
  const needsToggle = description.length > maxLength;
  
  return (
    <div className="relative mt-1">
      <p className={`text-gray-500 whitespace-pre-line ${
        expanded ? '' : 'line-clamp-2'
      }`}>
        {description}
      </p>
      
      {needsToggle && (
        <button 
          onClick={handleToggle}
          className="mt-1 text-blue-500 text-sm font-medium flex items-center hover:text-blue-600"
        >
          {expanded ? (
            <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
          ) : (
            <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
          )}
        </button>
      )}
    </div>
  );
};

export default EventDescription;