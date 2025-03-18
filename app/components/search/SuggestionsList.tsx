'use client';

import React from 'react';
import { Search, Coffee, BookOpen, Briefcase, MapPin, Users } from 'lucide-react';

export interface Suggestion {
  text: string;
  type: 'event' | 'food' | 'location' | 'academic' | 'social' | 'career' | 'query';
}

interface SuggestionsListProps {
  suggestions: Suggestion[];
  onSuggestionClick: (suggestion: Suggestion) => void;
}

const SuggestionsList: React.FC<SuggestionsListProps> = ({
  suggestions,
  onSuggestionClick
}) => {
  // Get appropriate icon based on suggestion type
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'food':
        return <Coffee className="h-4 w-4 mr-3 text-emerald-500" />;
      case 'academic':
        return <BookOpen className="h-4 w-4 mr-3 text-blue-500" />;
      case 'career':
        return <Briefcase className="h-4 w-4 mr-3 text-amber-500" />;
      case 'location':
        return <MapPin className="h-4 w-4 mr-3 text-green-500" />;
      case 'query':
        return <Search className="h-4 w-4 mr-3 text-gray-400" />;
      case 'social':
        return <Users className="h-4 w-4 mr-3 text-purple-500" />;
      default:
        return <Search className="h-4 w-4 mr-3 text-gray-400" />;
    }
  };

  return (
    <div className="absolute mt-1 w-full max-w-3xl bg-white rounded-lg shadow-lg z-10 overflow-hidden">
      <div className="p-1">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index}
            className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer rounded-md"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {getSuggestionIcon(suggestion.type)}
            <span>{suggestion.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionsList;