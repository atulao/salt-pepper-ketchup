'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import SearchInput from './SearchInput';
import SuggestionsList from './SuggestionsList';
import FilterPanel from './FilterPanel';
import ResultsList from './ResultsList';
import PersonaToggle from './PersonaToggle';
import { useSearch } from '../../hooks/useSearch';
import { useSuggestions } from '../../hooks/useSuggestions';
import { useEvents } from '../../hooks/useEvents';
import { usePersona } from '../../hooks/usePersona';
import { useFavorites } from '../../hooks/useFavorites';
import { Event } from '../../types/event';
import { FilterOption, FilterCount } from '../../types/filters';
import { isResidenceLifeEvent } from '../../utils/data-fetcher';
import { Tag, Info, X, User } from 'lucide-react';

// Constants moved to separate file or kept here as needed
const EVENTS_PER_PAGE = 5;
const EXAMPLE_QUERIES = [
  "Where can I find free pizza today?",
  "Tutoring sessions for computer science this week",
  "Networking events with free food",
  "Places to study with coffee on campus",
  "Career workshops for engineering majors"
];

// Define all possible filter options
const ALL_FILTER_OPTIONS: FilterOption[] = [
  { id: 'today', label: 'Today', icon: 'Clock' },
  { id: 'tomorrow', label: 'Tomorrow', icon: 'Calendar' },
  { id: 'this-week', label: 'This Week', icon: 'Calendar' },
  { id: 'weekend', label: 'Weekend', icon: 'Calendar' },
  { id: 'academic', label: 'Academic', icon: 'BookOpen' },
  { id: 'social', label: 'Social', icon: 'Users' },
  { id: 'career', label: 'Career', icon: 'Briefcase' },
  { id: 'food', label: 'Free Food', icon: 'Coffee' },
  { id: 'residence', label: 'Residence Life', icon: 'Home' },
];

const CampusEngagementHub: React.FC = () => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [orgFilter, setOrgFilter] = useState<string | null>(null);
  
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
  const FILTER_OPTIONS = useMemo(() => {
    if (personaType === 'resident') {
      return ALL_FILTER_OPTIONS; // Show all filters for residents
    } else {
      // For commuters, exclude residence life filter
      return ALL_FILTER_OPTIONS.filter(option => option.id !== 'residence');
    }
  }, [personaType]);
  
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
  
  // Convert filterCounts object to FilterCount array for FilterPanel
  const filterCountsArray = useMemo(() => {
    return FILTER_OPTIONS.map(option => ({
      id: option.id,
      count: filterCounts[option.id] || 0
    }));
  }, [FILTER_OPTIONS, filterCounts]);
  
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
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
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
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="mt-16 md:mt-24 mb-6 text-center px-4">
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
        />

        {/* Example Queries */}
        {!query && !events.length && !errorMessage && !isLoading && (
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

        {/* Filter Panel Component */}
        <FilterPanel
          options={FILTER_OPTIONS}
          activeFilters={activeFilters}
          onToggle={toggleFilter}
          counts={filterCountsArray}
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