'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Mic, X, Calendar, MapPin, Tag, BookOpen, Users, Briefcase, Coffee, Clock, Sparkles, AlertCircle } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  hasFood: boolean;
  foodType?: string;
  organizerName: string;
  imageUrl?: string;
  category: 'academic' | 'social' | 'career' | 'food' | 'other';
  tags: string[];
  relevanceScore?: number;
}

interface Suggestion {
  text: string;
  type: 'event' | 'food' | 'location' | 'academic' | 'social' | 'career' | 'query';
}

// Function to strip HTML tags from text
const stripHtmlTags = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Function to format description text with proper line breaks
const formatDescription = (description: string): string => {
  // First strip any HTML tags
  let cleanText = stripHtmlTags(description);
  
  // Replace dates and times patterns with line breaks
  cleanText = cleanText.replace(/(\d{1,2}:\d{2}\s*[AP]M\s*-\s*\d{1,2}:\d{2}\s*[AP]M)/g, '\n$1');
  cleanText = cleanText.replace(/(March \d{1,2}\s*\|\s*\d{1,2}(?::\d{2})?\s*[AP]M)/g, '\n\n$1');
  cleanText = cleanText.replace(/(March \d{1,2}(-\d{1,2})?,\s*\d{4})/g, '\n$1');
  
  // Add line breaks before locations
  cleanText = cleanText.replace(/(Campus Center|Ballroom|Atrium)/g, '\n$1');
  
  // Add line breaks before event descriptions
  cleanText = cleanText.replace(/(Explore|Take time|Celebrate|Join us)/g, '\n$1');
  
  // Replace multiple spaces with a single space
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  return cleanText;
};

const CampusEngagementHub: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [personaType, setPersonaType] = useState<string>('commuter');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filterOptions = [
    { id: 'food', label: 'Free Food', icon: <Coffee className="h-4 w-4 mr-2" /> },
    { id: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4 mr-2" /> },
    { id: 'social', label: 'Social', icon: <Users className="h-4 w-4 mr-2" /> },
    { id: 'career', label: 'Career', icon: <Briefcase className="h-4 w-4 mr-2" /> },
    { id: 'today', label: 'Today', icon: <Clock className="h-4 w-4 mr-2" /> },
  ];

  // Handle search results
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === '' && activeFilters.length === 0) {
        setResults([]);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      try {
        // Build query params with filters and persona
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (activeFilters.length) params.append('filters', activeFilters.join(','));
        params.append('persona', personaType);

        console.log(`Fetching from: /api/search-events?${params.toString()}`);
        const response = await fetch(`/api/search-events?${params.toString()}`);
        const data = await response.json();
        
        console.log("Frontend received data:", data); // Debugging
        
        // Handle both response formats
        if (Array.isArray(data)) {
          // Old format: just an array of events
          console.log("Received array format with", data.length, "events");
          // Process the events to clean HTML and format descriptions
          const processedEvents = data.map(event => ({
            ...event,
            description: formatDescription(event.description)
          }));
          setResults(processedEvents);
          setErrorMessage(null);
        } else if (data.events) {
          // New format: { events, message }
          console.log("Received object format with", data.events.length, "events");
          // Process the events to clean HTML and format descriptions
          const processedEvents = data.events.map(event => ({
            ...event,
            description: formatDescription(event.description)
          }));
          setResults(processedEvents);
          setErrorMessage(data.message);
        } else {
          // Unexpected format
          console.log("Unexpected data format:", data);
          setResults([]);
          setErrorMessage('Unable to parse search results');
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
        setErrorMessage('Failed to fetch results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce the search
    const timeoutId = setTimeout(fetchResults, 300);
    return () => clearTimeout(timeoutId);
  }, [query, activeFilters, personaType]);

  // Handle suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim() === '') {
        setSuggestions([]);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append('q', query);
        params.append('persona', personaType);
        
        const response = await fetch(`/api/suggest?${params.toString()}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      }
    };

    // Debounce the suggestions
    const timeoutId = setTimeout(fetchSuggestions, 150);
    return () => clearTimeout(timeoutId);
  }, [query, personaType]);

  // Handle clicks outside the search container
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      setIsFocused(true);
    }
  };

  const clearSearch = () => {
    setQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleVoiceSearch = () => {
    // Check if browser supports speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      
      recognition.onstart = () => {
        setIsRecording(true);
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
      };
      
      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } else {
      alert('Speech recognition is not supported in your browser');
    }
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setIsFocused(false);
  };

  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  };

  const togglePersona = () => {
    setPersonaType(prev => prev === 'commuter' ? 'resident' : 'commuter');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'academic':
        return <BookOpen className="h-4 w-4 mr-1 text-blue-500" />;
      case 'social':
        return <Users className="h-4 w-4 mr-1 text-purple-500" />;
      case 'career':
        return <Briefcase className="h-4 w-4 mr-1 text-amber-500" />;
      case 'food':
        return <Coffee className="h-4 w-4 mr-1 text-emerald-500" />;
      default:
        return <Calendar className="h-4 w-4 mr-1 text-gray-500" />;
    }
  };

  const getRelevanceIndicator = (score?: number) => {
    if (!score) return null;
    
    if (score > 85) {
      return (
        <div className="flex items-center space-x-1 text-xs text-emerald-600">
          <Sparkles className="h-3 w-3" />
          <span>Perfect for you</span>
        </div>
      );
    }
    
    if (score > 70) {
      return (
        <div className="flex items-center space-x-1 text-xs text-blue-600">
          <Sparkles className="h-3 w-3" />
          <span>Recommended</span>
        </div>
      );
    }
    
    return null;
  };

  // Placeholder examples for natural language queries
  const exampleQueries = [
    "Where can I find free pizza today?",
    "Tutoring sessions for computer science this week",
    "Networking events with free food",
    "Places to study with coffee on campus",
    "Career workshops for engineering majors"
  ];

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="mt-16 md:mt-24 mb-6 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">Salt-Pepper-Ketchup</h1>
        <p className="text-lg md:text-xl text-gray-600">Your AI campus guide for events, resources, and connections</p>
      </div>

      {/* Persona toggle */}
      <div className="mb-6">
        <button 
          onClick={togglePersona}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            personaType === 'commuter' 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {personaType === 'commuter' ? '🚗 Commuter Mode' : '🏠 Resident Mode'}
        </button>
      </div>

      <div className="w-full max-w-3xl px-4" ref={searchContainerRef}>
        <div 
          className={`relative flex items-center rounded-full border ${isFocused ? 'border-blue-500 shadow-lg' : 'border-gray-300'} bg-white overflow-hidden mx-auto transition-shadow duration-200`}
          onClick={focusSearchInput}
        >
          <div className="pl-5 pr-2">
            <Search 
              className={`h-5 w-5 ${isFocused ? 'text-blue-500' : 'text-gray-400'}`} 
            />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="What are you looking for on campus?"
            className="flex-grow py-4 px-2 text-gray-700 focus:outline-none w-full text-lg"
            autoComplete="off"
          />
          {query && (
            <button 
              onClick={clearSearch}
              className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={handleVoiceSearch}
            className={`px-5 py-4 text-gray-400 hover:text-blue-500 transition-colors ${isRecording ? 'text-red-500 animate-pulse' : ''}`}
            aria-label="Voice search"
          >
            <Mic className="h-5 w-5" />
          </button>
        </div>

        {/* Example queries */}
        {!query && !results.length && !errorMessage && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Filter chips */}
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          {filterOptions.map(filter => (
            <button
              key={filter.id}
              onClick={() => toggleFilter(filter.id)}
              className={`flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilters.includes(filter.id)
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              } border border-gray-200`}
            >
              {filter.icon}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Suggestions dropdown */}
        {isFocused && query && suggestions.length > 0 && (
          <div className="absolute mt-1 w-full max-w-3xl bg-white rounded-lg shadow-lg z-10 overflow-hidden">
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="flex items-center px-4 py-2 hover:bg-blue-50 cursor-pointer rounded-md"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.type === 'food' && <Coffee className="h-4 w-4 mr-3 text-emerald-500" />}
                  {suggestion.type === 'academic' && <BookOpen className="h-4 w-4 mr-3 text-blue-500" />}
                  {suggestion.type === 'career' && <Briefcase className="h-4 w-4 mr-3 text-amber-500" />}
                  {suggestion.type === 'location' && <MapPin className="h-4 w-4 mr-3 text-green-500" />}
                  {suggestion.type === 'query' && <Search className="h-4 w-4 mr-3 text-gray-400" />}
                  {suggestion.type === 'social' && <Users className="h-4 w-4 mr-3 text-purple-500" />}
                  <span>{suggestion.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        )}

        {/* Search results */}
        {!isLoading && (
          <>
            {results && results.length > 0 ? (
              <div className="mt-6 bg-white rounded-xl shadow-md overflow-hidden divide-y divide-gray-100">
                {results.map((event) => (
                  <div key={event.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
                    <div className="flex items-start">
                      {event.imageUrl && (
                        <div className="flex-shrink-0 mr-4">
                          <img 
                            src={event.imageUrl} 
                            alt={event.title} 
                            className="h-16 w-16 object-cover rounded-lg"
                          />
                        </div>
                      )}
                      <div className="flex-grow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg text-gray-900">{event.title}</h3>
                          {getRelevanceIndicator(event.relevanceScore)}
                        </div>
                        <p className="text-gray-500 mt-1 whitespace-pre-line">
                          {event.description}
                        </p>
                        <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-3">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                            <span>{event.date} • {event.time}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1 text-green-500" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center">
                            {getCategoryIcon(event.category)}
                            <span className="capitalize">{event.category}</span>
                          </div>
                          {event.hasFood && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              {event.foodType || 'Free Food'}
                            </span>
                          )}
                        </div>
                        {event.tags && event.tags.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {event.tags.map((tag, index) => (
                              <span 
                                key={index} 
                                className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              errorMessage ? (
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <AlertCircle className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="text-lg font-medium text-amber-800 mb-2">No Events Found</p>
                  <p className="text-sm text-amber-700">{errorMessage}</p>
                </div>
              ) : (
                query && (
                  <div className="mt-6 text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
                    <p className="text-lg mb-2">No events found</p>
                    <p className="text-sm">Try searching for "tutoring", "networking", or "free food"</p>
                  </div>
                )
              )
            )}
          </>
        )}

        {/* Commuter-focused message */}
        {personaType === 'commuter' && !query && !results.length && !isLoading && !errorMessage && (
          <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
            <h3 className="font-medium text-blue-700 mb-1">Commuter Student?</h3>
            <p className="text-blue-600 text-sm">
              Salt-Pepper-Ketchup helps you make the most of your time on campus by finding events, 
              study spaces, and resources between classes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Mock type definitions for window
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default CampusEngagementHub;