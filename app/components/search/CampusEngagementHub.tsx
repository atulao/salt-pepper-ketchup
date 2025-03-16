'use client';

import CampusMap from '../map/CampusMap';
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Search, Mic, X, Calendar, MapPin, Tag, BookOpen, Users, 
  Briefcase, Coffee, Clock, Sparkles, AlertCircle, Share2, 
  Calendar as CalendarIcon, Heart, MapPin as MapPinIcon, 
  ChevronDown, ChevronUp, LinkIcon
} from 'lucide-react';


// Type Definitions
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

interface FilterCount {
  id: string;
  count: number;
}

interface FilterOption {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface GroupedEvents {
  [key: string]: Event[];
}

// Utility functions
const stripHtmlTags = (html: string): string => {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || '';
};

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

// Function to extract the date part for grouping
const getDateKey = (dateString: string): string => {
  try {
    const dateParts = dateString.split(',')[0].trim().split(' ');
    return `${dateParts[0]} ${dateParts[1]}`;
  } catch (e) {
    return dateString;
  }
};

// Constants
const EVENTS_PER_PAGE = 5;
const DEBOUNCE_SEARCH_MS = 300;
const DEBOUNCE_SUGGESTIONS_MS = 150;

// Example queries
const EXAMPLE_QUERIES = [
  "Where can I find free pizza today?",
  "Tutoring sessions for computer science this week",
  "Networking events with free food",
  "Places to study with coffee on campus",
  "Career workshops for engineering majors"
];

// Filter options
const FILTER_OPTIONS: FilterOption[] = [
  { id: 'food', label: 'Free Food', icon: <Coffee className="h-4 w-4 mr-2" /> },
  { id: 'academic', label: 'Academic', icon: <BookOpen className="h-4 w-4 mr-2" /> },
  { id: 'social', label: 'Social', icon: <Users className="h-4 w-4 mr-2" /> },
  { id: 'career', label: 'Career', icon: <Briefcase className="h-4 w-4 mr-2" /> },
  { id: 'today', label: 'Today', icon: <Clock className="h-4 w-4 mr-2" /> },
];

// Category icons mapping
const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  academic: <BookOpen className="h-4 w-4 mr-1 text-blue-500" />,
  social: <Users className="h-4 w-4 mr-1 text-purple-500" />,
  career: <Briefcase className="h-4 w-4 mr-1 text-amber-500" />,
  food: <Coffee className="h-4 w-4 mr-1 text-emerald-500" />,
  other: <Calendar className="h-4 w-4 mr-1 text-gray-500" />
};

// Month mapping for calendar functionality
const MONTH_MAP: Record<string, number> = {
  'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
  'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
};

// Custom hook for debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const CampusEngagementHub: React.FC = () => {
  // State management
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<Event[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [personaType, setPersonaType] = useState<string>('commuter');
  const [expandedDescriptions, setExpandedDescriptions] = useState<{[key: string]: boolean}>({});
  const [favoritedEvents, setFavoritedEvents] = useState<{[key: string]: boolean}>({});
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filterCounts, setFilterCounts] = useState<FilterCount[]>([]);
  const [imageLoaded, setImageLoaded] = useState<{[key: string]: boolean}>({});
  
  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Debounced values for improved performance
  const debouncedQuery = useDebounce(query, DEBOUNCE_SEARCH_MS);
  const debouncedFilters = useDebounce(activeFilters, DEBOUNCE_SEARCH_MS);
  const debouncedPersona = useDebounce(personaType, DEBOUNCE_SEARCH_MS);
  const searchQueryForSuggestions = useDebounce(query, DEBOUNCE_SUGGESTIONS_MS);

  // Process events function (memoized to avoid unnecessary recalculations)
  const processEvents = useCallback((events: Event[]): Event[] => {
    return events.map(event => ({
      ...event,
      description: formatDescription(event.description)
    }));
  }, []);

  // Update filter counts
  const updateFilterCounts = useCallback((events: Event[]) => {
    const counts: FilterCount[] = [];
    
    // Count food events
    counts.push({ id: 'food', count: events.filter(event => event.hasFood).length });
    
    // Count events by category
    counts.push({ id: 'academic', count: events.filter(event => event.category === 'academic').length });
    counts.push({ id: 'social', count: events.filter(event => event.category === 'social').length });
    counts.push({ id: 'career', count: events.filter(event => event.category === 'career').length });
    
    // Count today's events
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
    counts.push({ id: 'today', count: events.filter(event => event.date.includes(formattedToday)).length });
    
    setFilterCounts(counts);
  }, []);

  // Fetch events data
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim() === '' && debouncedFilters.length === 0) {
        setResults([]);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setCurrentPage(1); // Reset to first page on new search
      
      try {
        // Build query params with filters and persona
        const params = new URLSearchParams();
        if (debouncedQuery) params.append('q', debouncedQuery);
        if (debouncedFilters.length) params.append('filters', debouncedFilters.join(','));
        params.append('persona', debouncedPersona);

        const response = await fetch(`/api/search-events?${params.toString()}`);
        const data = await response.json();
        
        // Handle both response formats
        if (Array.isArray(data)) {
          const processedEvents = processEvents(data);
          setResults(processedEvents);
          setErrorMessage(null);
          updateFilterCounts(processedEvents);
        } else if (data.events) {
          const processedEvents = processEvents(data.events);
          setResults(processedEvents);
          setErrorMessage(data.message);
          updateFilterCounts(processedEvents);
        } else {
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

    fetchResults();
  }, [debouncedQuery, debouncedFilters, debouncedPersona, processEvents, updateFilterCounts]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQueryForSuggestions.trim() === '') {
        setSuggestions([]);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append('q', searchQueryForSuggestions);
        params.append('persona', personaType);
        
        const response = await fetch(`/api/suggest?${params.toString()}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [searchQueryForSuggestions, personaType]);

  // Click outside handler
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

  // Group events by date
  const groupedEvents = useMemo<GroupedEvents>(() => {
    const grouped: GroupedEvents = {};
    
    results.forEach(event => {
      const dateKey = getDateKey(event.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [results]);

  // Get sorted date keys for display
  const sortedDates = useMemo(() => {
    return Object.keys(groupedEvents).sort((a, b) => {
      const monthA = a.split(' ')[0];
      const dayA = parseInt(a.split(' ')[1]);
      const monthB = b.split(' ')[0];
      const dayB = parseInt(b.split(' ')[1]);
      
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
      
      const monthIndexA = months.indexOf(monthA);
      const monthIndexB = months.indexOf(monthB);
      
      if (monthIndexA !== monthIndexB) {
        return monthIndexA - monthIndexB;
      }
      
      return dayA - dayB;
    });
  }, [groupedEvents]);

  // Handle pagination
  const paginatedDates = useMemo(() => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE;
    const endIndex = Math.min(startIndex + EVENTS_PER_PAGE, sortedDates.length);
    return sortedDates.slice(startIndex, endIndex);
  }, [sortedDates, currentPage]);

  // Pagination information
  const totalPages = Math.ceil(sortedDates.length / EVENTS_PER_PAGE);

  // Event handlers
  const focusSearchInput = useCallback(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
      setIsFocused(true);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);

  const handleVoiceSearch = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      const recognition = new SpeechRecognitionAPI();
      
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
  }, []);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setIsFocused(false);
  }, []);

  const toggleFilter = useCallback((filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  }, []);

  const togglePersona = useCallback(() => {
    setPersonaType(prev => prev === 'commuter' ? 'resident' : 'commuter');
  }, []);

  const toggleExpandDescription = useCallback((eventId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  }, []);

  const toggleFavorite = useCallback((eventId: string) => {
    setFavoritedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  }, []);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage, totalPages]);
  
  const handlePrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentPage]);

  const handleImageError = useCallback((eventId: string) => {
    setImageLoaded(prev => ({ ...prev, [eventId]: false }));
  }, []);

  // Utility functions
  const getCategoryIcon = useCallback((category: string) => {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS.other;
  }, []);

  const getRelevanceIndicator = useCallback((score?: number) => {
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
  }, []);
  const addToCalendar = useCallback((event: Event) => {
    try {
      // Format the date and time for calendar
      const dateParts = event.date.split(', ');
      const monthDay = dateParts[0].split(' ');
      const month = monthDay[0];
      const day = monthDay[1];
      const year = dateParts.length > 1 ? dateParts[1] : new Date().getFullYear().toString();
      
      // Parse the time
      const timeMatch = event.time.match(/(\d+):(\d+)\s*([AP]M)/);
      if (!timeMatch) return;
      
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3];
      
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      // Create Date objects for start and end (assuming 1 hour duration)
      const startDate = new Date(parseInt(year), MONTH_MAP[month], parseInt(day), hour, minute);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      // Create calendar URL
      const eventTitle = encodeURIComponent(event.title);
      const eventLocation = encodeURIComponent(event.location);
      const eventDescription = encodeURIComponent(event.description.substring(0, 100));
      
      const startStr = startDate.toISOString().replace(/-|:|\.\d+/g, '');
      const endStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startStr}/${endStr}&details=${eventDescription}&location=${eventLocation}`;
      
      // Open in new tab
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  }, []);

  const shareEvent = useCallback((event: Event) => {
    try {
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title} at ${event.location} on ${event.date} at ${event.time}`,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const dummyInput = document.createElement('input');
        const shareText = `${event.title} at ${event.location} on ${event.date} at ${event.time}`;
        document.body.appendChild(dummyInput);
        dummyInput.value = shareText;
        dummyInput.select();
        document.execCommand('copy');
        document.body.removeChild(dummyInput);
        alert('Event details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  }, []);

  // UI element
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
        {/* Search bar */}
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
            {EXAMPLE_QUERIES.map((example, index) => (
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
          {FILTER_OPTIONS.map(filter => {
            const count = filterCounts.find(f => f.id === filter.id)?.count || 0;
            return (
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
                <span>{filter.label}</span>
                {count > 0 && (
                  <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                    activeFilters.includes(filter.id) 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
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

        {/* No results message */}
        {!isLoading && query && results.length === 0 && (
          <div className="mt-6 text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
            <p className="text-lg mb-2">No events found</p>
            <p className="text-sm">Try searching for "tutoring", "networking", or "free food"</p>
          </div>
        )}

        {/* Error message */}
        {!isLoading && errorMessage && (
          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="flex justify-center mb-3">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <p className="text-lg font-medium text-amber-800 mb-2">No Events Found</p>
            <p className="text-sm text-amber-700">{errorMessage}</p>
          </div>
        )}

        {/* Search results - Basic display without event cards or CampusMap */}
        {!isLoading && results.length > 0 && (
          <div className="mt-6">
            {paginatedDates.map(dateKey => (
              <div key={dateKey} className="mb-8">
                {/* Date header - sticky */}
                <div className="sticky top-0 bg-gray-50 py-2 z-10">
                  <h2 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-blue-600" />
                    {dateKey}
                  </h2>
                </div>

                {/* Events for this date - with full styling */}
                <div className="space-y-4">
                  {groupedEvents[dateKey].map(event => (
                    <div 
                      key={event.id} 
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200"
                    >
                      <div className="p-5">
                        <div className="flex items-start">
                          {/* Event image */}
                          <div className="flex-shrink-0 mr-4 relative">
                            {event.imageUrl ? (
                              <>
                                {/* Skeleton loader */}
                                {!imageLoaded[event.id] && (
                                  <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
                                )}
                                <img 
                                  src={event.imageUrl} 
                                  alt={event.title} 
                                  className={`h-16 w-16 object-cover rounded-lg ${imageLoaded[event.id] ? 'visible' : 'hidden'}`}
                                  onLoad={() => setImageLoaded(prev => ({...prev, [event.id]: true}))}
                                  onError={() => handleImageError(event.id)}
                                />
                              </>
                            ) : (
                              <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Calendar className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>

                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <h3 className="font-medium text-lg text-gray-900">{event.title}</h3>
                              {getRelevanceIndicator(event.relevanceScore)}
                            </div>

                            {/* Maps would go here, but commented out for now */}
                            
                            {expandedDescriptions[event.id] && (
  <div className="mt-3">
    <CampusMap 
      location={event.location}
      eventTitle={event.title}
    />
  </div>
)}
                            {/* Description */}
                            <div className="relative mt-1">
                              <p className={`text-gray-500 whitespace-pre-line ${
                                expandedDescriptions[event.id] ? '' : 'line-clamp-2'
                              }`}>
                                {event.description}
                              </p>
                              
                              {/* Read more/less button */}
                              {event.description.length > 100 && (
                                <button 
                                  onClick={() => toggleExpandDescription(event.id)}
                                  className="mt-1 text-blue-500 text-sm font-medium flex items-center hover:text-blue-600"
                                >
                                  {expandedDescriptions[event.id] ? (
                                    <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
                                  ) : (
                                    <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
                                  )}
                                </button>
                              )}
                            </div>
                            
                            {/* Event metadata */}
                            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-3">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                                <span>{event.date} • {event.time}</span>
                              </div>
                              <div className="flex items-center group relative">
                                <MapPin className="h-4 w-4 mr-1 text-green-500" />
                                <span>{event.location}</span>
                                {/* Map preview on hover */}
                                <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                                  <div className="bg-white p-1 rounded shadow-lg">
                                    <div className="text-xs text-center text-gray-500 pb-1">
                                      Click for directions
                                    </div>
                                    <div className="w-48 h-32 bg-blue-50 flex items-center justify-center rounded">
                                      <MapPinIcon className="h-6 w-6 text-red-500" />
                                    </div>
                                  </div>
                                </div>
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
                            
                            {/* Tags */}
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
                            
                            {/* Action buttons */}
                            <div className="mt-3 flex space-x-2">
                              <button 
                                onClick={() => toggleFavorite(event.id)}
                                className={`flex items-center p-1.5 rounded-full ${
                                  favoritedEvents[event.id] 
                                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                                }`}
                                aria-label="Favorite"
                              >
                                <Heart className="h-4 w-4" fill={favoritedEvents[event.id] ? 'currentColor' : 'none'} />
                              </button>
                              
                              <button 
                                onClick={() => addToCalendar(event)}
                                className="flex items-center p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                                aria-label="Add to Calendar"
                              >
                                <CalendarIcon className="h-4 w-4" />
                              </button>
                              
                              <button 
                                onClick={() => shareEvent(event)}
                                className="flex items-center p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                                aria-label="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                              
                              <a 
                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center p-1.5 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded-full"
                                aria-label="Get directions"
                              >
                                <MapPinIcon className="h-4 w-4" />
                              </a>
                              
                              <button 
                                onClick={() => window.open(`/event/${event.id}`, '_blank')}
                                className="flex items-center p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                                aria-label="View details"
                              >
                                <LinkIcon className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Pagination controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center space-x-2">
                <button 
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded border ${
                    currentPage === 1 
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'text-blue-600 border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  Previous
                </button>
                
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                
                <button 
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded border ${
                    currentPage === totalPages 
                      ? 'text-gray-400 border-gray-200 cursor-not-allowed' 
                      : 'text-blue-600 border-blue-300 hover:bg-blue-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
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

export default CampusEngagementHub;

// Type definition for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}