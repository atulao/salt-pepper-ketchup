'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SearchInput from './SearchInput';
import SuggestionsList from './SuggestionsList';
import FilterPanel from './FilterPanel';
import ResultsList from './ResultsList';
import PersonaToggle from './PersonaToggle';
import ThemeToggle from '../ThemeToggle';
import { useSearch } from '../../hooks/useSearch';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useEvents } from '../../hooks/useEvents';
import { usePersona } from '../../hooks/usePersona';
import { useFavorites } from '../../hooks/useFavorites';
import { Event } from '../../types/event';
import { isResidenceLifeEvent } from '../../utils/data-fetcher';
import { Tag, Info, X, User, Building } from 'lucide-react';
import Link from 'next/link';

// Constants moved to separate file or kept here as needed
const EVENTS_PER_PAGE = 5;
const EXAMPLE_QUERIES = [
  "Where can I find free pizza today?",
  "Tutoring sessions for computer science this week",
  "Networking events with free food",
  "Places to study with coffee on campus",
  "Career workshops for engineering majors"
];

// Define the filter option type
export type FilterOption = {
  id: string;
  label: string;
  icon: string;
};

// Define the filter count type
export interface FilterCount {
  id: string;
  count: number;
}

// Define the filter categories structure
export type FilterCategories = {
  [category: string]: FilterOption[];
};

// Filter categories and options
export const FILTER_OPTIONS: FilterCategories = {
  "Date": [
    { id: 'today', label: 'Today', icon: 'Clock' },
    { id: 'tomorrow', label: 'Tomorrow', icon: 'Calendar' },
    { id: 'this-week', label: 'This Week', icon: 'Calendar' },
    { id: 'weekend', label: 'Weekend', icon: 'Calendar' },
  ],
  "Time of Day": [
    { id: 'morning', label: 'Morning', icon: 'Sunrise' },
    { id: 'afternoon', label: 'Afternoon', icon: 'Sun' },
    { id: 'evening', label: 'Evening', icon: 'Sunset' },
  ],
  "Perks": [
    { id: 'free-food', label: 'Free Food', icon: 'Utensils' },
    { id: 'free-swag', label: 'Free Swag', icon: 'Gift' },
  ],
  "Purpose": [
    { id: 'career', label: 'Career', icon: 'Briefcase' },
    { id: 'networking', label: 'Networking', icon: 'Users2' },
    { id: 'workshop-skillbuild', label: 'Workshop / Skill-Building', icon: 'Hammer' },
    { id: 'service-volunteering', label: 'Service / Volunteering', icon: 'Heart' },
  ],
  "Format": [
    { id: 'in-person', label: 'In-Person', icon: 'MapPin' },
    { id: 'virtual', label: 'Virtual', icon: 'MonitorPlay' },
    { id: 'requires-rsvp', label: 'Requires RSVP', icon: 'CalendarCheck' },
  ],
  "Theme": [
    { id: 'health-wellness', label: 'Health & Wellness', icon: 'HeartPulse' },
    { id: 'arts-culture', label: 'Arts & Culture', icon: 'Palette' },
    { id: 'sports-recreation', label: 'Sports & Recreation', icon: 'Trophy' },
    { id: 'faith-spirituality', label: 'Faith & Spirituality', icon: 'Flower2' },
  ],
};

// Convert the nested structure to a flat list for internal use
export const ALL_FILTER_OPTIONS: FilterOption[] = Object.values(FILTER_OPTIONS).flat();

const CampusEngagementHub: React.FC = () => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  
  // Handle dark mode change
  const handleModeChange = useCallback((mode: boolean) => {
    setIsDarkMode(mode);
    // You can add additional logic here if needed when mode changes
  }, []);
  
  // Use custom hooks to manage various states and functionalities
  const { 
    query, 
    setQuery, 
    debouncedQuery,
    handleVoiceSearch,
    isRecording,
    clearSearch 
  } = useSearch();
  
  const { 
    suggestions,
    handleSuggestionClick
  } = useSuggestions(query, setQuery, setIsFocused);
  
  const {
    personaType,
    togglePersona
  } = usePersona();
  
  // Filter options based on persona
  const filterOptions = useMemo(() => {
    // We're now using the same filters for both personas
    return ALL_FILTER_OPTIONS;
  }, []);
  
  // State for filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Toggle filter selection
  const toggleFilter = useCallback((filterId: string | null) => {
    // If filterId is null, clear all filters
    if (filterId === null) {
      setActiveFilters([]);
      return;
    }
    
    // Toggle filter on/off
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  }, []);
  
  // Use the updated hook with the correct parameters
  const {
    events,
    isLoading,
    groupedEvents,
    sortedDates,
    paginatedDates,
    currentPage,
    loadMoreEvents,
    totalPages,
    hasMore,
    errorMessage,
    setErrorMessage,
    filterCounts
  } = useEvents(debouncedQuery, activeFilters, personaType, tagFilter, orgFilter, EVENTS_PER_PAGE);
  
  const {
    favoritedEvents,
    toggleFavorite
  } = useFavorites();
  
  useEffect(() => {
    // Add styles for Dark Mode directly to the document when it's enabled
    if (isDarkMode) {
      // Create a style element if it doesn't exist
      let styleEl = document.getElementById('dark-mode-styles');
      
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'dark-mode-styles';
        document.head.appendChild(styleEl);
      }
      
      // Set the CSS content
      styleEl.textContent = `
        .dark-mode {
          --dark-bg: #121212;
          --dark-card-bg: #1e1e1e;
          --dark-border: #333333;
          --dark-text: #e0e0e0;
          --dark-text-secondary: #a0a0a0;
          --dark-blue: #3b82f6;
          --dark-purple: #8b5cf6;
          --dark-green: #10b981;
          
          background-color: var(--dark-bg);
          color: var(--dark-text);
        }
        
        .dark-mode .bg-white {
          background-color: var(--dark-card-bg);
          border-color: var(--dark-border);
        }
        
        .dark-mode .bg-gray-50 {
          background-color: var(--dark-bg);
        }
        
        .dark-mode .bg-gray-100,
        .dark-mode .hover\\:bg-gray-100:hover,
        .dark-mode .bg-gray-200 {
          background-color: #333;
          color: var(--dark-text);
        }
        
        .dark-mode .hover\\:bg-gray-200:hover {
          background-color: #444;
        }
        
        .dark-mode .text-gray-600,
        .dark-mode .text-gray-700,
        .dark-mode .text-gray-800 {
          color: var(--dark-text);
        }
        
        .dark-mode .text-gray-500 {
          color: var(--dark-text-secondary);
        }
        
        .dark-mode .border {
          border-color: var(--dark-border);
        }
        
        .dark-mode .shadow-sm,
        .dark-mode .shadow-md {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
        }
      `;
      
      // Add the dark-mode class to body
      document.body.classList.add('dark-mode');
    } else {
      // Remove the dark-mode class from body
      document.body.classList.remove('dark-mode');
      
      // Remove the style element if it exists
      const styleEl = document.getElementById('dark-mode-styles');
      if (styleEl) {
        styleEl.remove();
      }
    }
  }, [isDarkMode]);

  // Convert filterCounts object to FilterCount array for FilterPanel
  const filterCountsArray = useMemo(() => {
    // Create an array from the filterCounts object
    return Object.keys(filterCounts).map(key => ({
      id: key,
      count: filterCounts[key] || 0
    }));
  }, [filterCounts]);
  
  // Handle tag click for filtering
  const handleTagClick = (tag: string) => {
    console.log("Tag clicked:", tag);
    
    // If clicking the same tag again, remove the filter
    if (tagFilter === tag) {
      console.log("Clearing tag filter");
      setTagFilter(null);
    } else {
      console.log("Setting tag filter to:", tag);
      setTagFilter(tag);
      // Scroll to top when applying a tag filter
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Handle organization click for filtering
  const handleOrgClick = (organization: string) => {
    console.log("Organization clicked:", organization);
    
    // If clicking the same organization again, remove the filter
    if (orgFilter === organization) {
      console.log("Clearing organization filter");
      setOrgFilter(null);
    } else {
      console.log("Setting organization filter to:", organization);
      setOrgFilter(organization);
      // Scroll to top when applying an organization filter
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  // Clear tag filter
  const clearTagFilter = () => {
    console.log("Clearing tag filter");
    setTagFilter(null);
  };
  
  // Clear organization filter
  const clearOrgFilter = () => {
    console.log("Clearing organization filter");
    setOrgFilter(null);
  };
  
  // Ref for infinite scroll
  const scrollSentinelRef = useRef<HTMLDivElement>(null);
  
  // Setup click outside handler
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
  
  // Setup infinite scroll
  useEffect(() => {
    if (!events.length || !hasMore) return;
    
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMoreEvents();
        }
      },
      { threshold: 0.5 }
    );
    
    if (scrollSentinelRef.current) {
      observer.observe(scrollSentinelRef.current);
    }
    
    return () => {
      if (scrollSentinelRef.current) {
        observer.unobserve(scrollSentinelRef.current);
      }
    };
  }, [hasMore, events.length, isLoading, loadMoreEvents]);

  // Simple error message component
  const ErrorMessage: React.FC<{
    message: string;
    personaType: string;
    onSwitchPersona: () => void;
  }> = ({ message, personaType, onSwitchPersona }) => (
    <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
      <div className="flex justify-center mb-4">
        {personaType === 'resident' ? (
          <span className="text-3xl">🏠</span>
        ) : (
          <span className="text-3xl">🚗</span>
        )}
      </div>
      <p className="text-lg font-medium text-amber-800 mb-2">
        {message.includes("No events match") ? "No Matching Events" : 
          personaType === 'resident' 
            ? "No Residence Hall Events" 
            : "No Commuter Events"}
      </p>
      <p className="text-sm text-amber-700 mb-4">{message}</p>
      {(!message.includes("today") && !message.includes("tag") && !message.includes("organization")) && (
        <div className="flex justify-center">
          <button 
            onClick={onSwitchPersona}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            Switch to {personaType === 'resident' ? 'Commuter' : 'Resident'} mode instead
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 transition-colors duration-300">
      <div className="mt-10 md:mt-16 mb-6 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-3">Salt-Pepper-Ketchup</h1>
        <p className="text-lg md:text-xl text-gray-600">Your campus guide for events, resources, and connections</p>
      </div>

      {/* Persona Toggle Component */}
      <PersonaToggle
        personaType={personaType}
        onToggle={togglePersona}
      />

      <div className="w-full max-w-3xl px-4" ref={searchContainerRef}>
        {/* Search Input Component */}
        <SearchInput
          query={query}
          setQuery={setQuery}
          onFocus={() => setIsFocused(true)}
          isFocused={isFocused}
          isRecording={isRecording}
          onClear={clearSearch}
          onVoiceSearch={handleVoiceSearch}
          personaType={personaType}
          className=""
        />

        {/* Example Queries */}
        {!query && !events.length && !errorMessage && !isLoading && (
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {EXAMPLE_QUERIES.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className="bg-white border border-gray-200 rounded-full px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
              >
                {example}
              </button>
            ))}
          </div>
        )}

        {/* Filter Panel Component */}
        <FilterPanel
          options={filterOptions}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          counts={filterCountsArray}
          categories={FILTER_OPTIONS}
        />

        {/* Tag Filter Display */}
        {tagFilter && (
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-sm">
              <Tag className="h-4 w-4 mr-2" />
              <span>Filtered by tag: <strong>{tagFilter}</strong></span>
              <button 
                onClick={clearTagFilter}
                className="ml-2 text-blue-700 hover:text-blue-900"
                aria-label="Clear tag filter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Organization Filter Display */}
        {orgFilter && (
          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex items-center bg-indigo-100 text-indigo-800 px-3 py-1.5 rounded-full text-sm">
              <User className="h-4 w-4 mr-2" />
              <span>Events by: <strong>{orgFilter}</strong></span>
              <button 
                onClick={clearOrgFilter}
                className="ml-2 text-indigo-700 hover:text-indigo-900"
                aria-label="Clear organization filter"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Suggestions List Component */}
        {isFocused && query && suggestions.length > 0 && (
          <SuggestionsList
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mt-6 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        )}

        {/* Persona Information Banner */}
        {events.length > 0 && (
          <div className={`mt-6 mb-4 p-3 rounded-lg ${
            personaType === 'resident' 
              ? 'bg-purple-50 border border-purple-100 text-purple-700' 
              : 'bg-blue-50 border border-blue-100 text-blue-700'
          }`}>
            <div className="flex items-center">
              <span className="text-lg mr-2">
                {personaType === 'resident' ? '🏠' : '🚗'}
              </span>
              <div>
                <p className="font-medium">
                  {personaType === 'resident' 
                    ? 'Showing residence hall events only' 
                    : 'Showing commuter-relevant events'}
                </p>
                <p className="text-xs">
                  {personaType === 'resident'
                    ? 'These events are specifically for students living in campus housing.'
                    : 'These events are filtered for commuter students. Residence hall events are hidden.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results List Component */}
        {!isLoading && (
          <>
            {events.length > 0 ? (
              <ResultsList
                groupedEvents={groupedEvents}
                paginatedDates={paginatedDates}
                favoritedEvents={favoritedEvents}
                onToggleFavorite={toggleFavorite}
                onTagClick={handleTagClick}
                onOrgClick={handleOrgClick}
              />
            ) : (
              errorMessage ? (
                <ErrorMessage
                  message={errorMessage}
                  personaType={personaType}
                  onSwitchPersona={togglePersona}
                />
              ) : (
                query && !isLoading && (
                  <div className="mt-6 text-center text-gray-500 bg-white p-8 rounded-xl shadow-md">
                    <p className="text-lg mb-2">No events found</p>
                    <p className="text-sm">Try searching for "tutoring", "networking", or "free food"</p>
                  </div>
                )
              )
            )}
            
            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div 
                ref={scrollSentinelRef} 
                className="h-10 flex items-center justify-center mt-4 mb-8"
              >
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              </div>
            )}
          </>
        )}

        {/* Default state for empty search */}
        {!query && !events.length && !isLoading && !errorMessage && (
          <div className={`mt-8 border rounded-lg p-4 text-center ${
            personaType === 'resident'
              ? 'bg-purple-50 border-purple-100'
              : 'bg-blue-50 border-blue-100'
          }`}>
            <h3 className={`font-medium mb-1 ${
              personaType === 'resident' ? 'text-purple-700' : 'text-blue-700'
            }`}>
              {personaType === 'resident' ? 'Campus Resident?' : 'Commuter Student?'}
            </h3>
            <p className={`text-sm ${
              personaType === 'resident' ? 'text-purple-600' : 'text-blue-600'
            }`}>
              {personaType === 'resident'
                ? 'Find events happening in your residence hall and connect with other residents.'
                : 'Salt-Pepper-Ketchup helps you make the most of your time on campus by finding events, study spaces, and resources between classes.'}
            </p>
          </div>
        )}

        {/* About the Tag Filtering Feature */}
        {events.length > 0 && !tagFilter && !orgFilter && (
          <div className="mt-6 mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-600 text-sm">
            <div className="flex items-center justify-center">
              <Info className="h-4 w-4 mr-2 text-gray-500" />
              <span>Pro tip: Click on event tags or organization names to filter for similar events!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampusEngagementHub;