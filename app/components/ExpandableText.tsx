'use client';

import React, { useState } from 'react';

interface ExpandableTextProps {
  text: string;
  maxLines: number;
  className?: string;
}

const ExpandableText: React.FC<ExpandableTextProps> = ({ text, maxLines, className = '' }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine line clamp class based on expanded state and maxLines
  const lineClampClass = !isExpanded ? `line-clamp-${maxLines}` : '';
  
  // Basic check: Only show button if text is reasonably long (e.g., > 50 chars) 
  // or potentially exceeds the line clamp (heuristic).
  // You could adjust this threshold or always show the button if text exists.
  const showToggleButton = text && text.length > 50; // Simple heuristic

  return (
    <div className={className}>
      <p className={`text-sm text-gray-500 mb-1 ${lineClampClass}`}>
        {text}
      </p>
      {/* Conditionally render the button based on heuristic */}
      {showToggleButton && (
        <button
          onClick={toggleExpand}
          className="text-xs text-blue-600 hover:underline focus:outline-none font-medium"
        >
          {isExpanded ? 'Read less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

export default ExpandableText; 