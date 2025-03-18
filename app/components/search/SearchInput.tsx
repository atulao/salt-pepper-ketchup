'use client';

import React, { useRef } from 'react';
import { Search, Mic, X } from 'lucide-react';

interface SearchInputProps {
  query: string;
  setQuery: (query: string) => void;
  onFocus: () => void;
  isFocused: boolean;
  isRecording: boolean;
  onClear: () => void;
  onVoiceSearch: () => void;
  personaType: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  query,
  setQuery,
  onFocus,
  isFocused,
  isRecording,
  onClear,
  onVoiceSearch,
  personaType
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div 
      className={`relative flex items-center rounded-full border ${
        isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300'
      } bg-white overflow-hidden mx-auto transition-shadow duration-200`}
      onClick={focusInput}
    >
      <div className="pl-5 pr-2">
        <Search 
          className={`h-5 w-5 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} 
        />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={onFocus}
        placeholder={personaType === 'resident' 
          ? "Search for residence hall events..." 
          : "Search for campus events..."}
        className="flex-grow py-4 px-2 text-gray-700 focus:outline-none w-full text-lg"
        autoComplete="off"
      />
      
      {query && (
        <button 
          onClick={onClear}
          className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" />
        </button>
      )}
      
      <button
        onClick={onVoiceSearch}
        className={`px-5 py-4 text-gray-400 hover:text-blue-500 transition-colors ${
          isRecording ? 'text-red-500 animate-pulse' : ''
        }`}
        aria-label="Voice search"
      >
        <Mic className="h-5 w-5" />
      </button>
    </div>
  );
};

export default SearchInput;