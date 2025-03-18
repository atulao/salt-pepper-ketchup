// app/hooks/useEvents.ts
import { useState, useEffect, useMemo } from 'react';
import { Event } from '../types/event';
import { fetchNJITEvents, isResidenceLifeEvent } from '../utils/data-fetcher';

// Function to extract the date part for grouping
const getDateKey = (dateString: string): string => {
  try {
    const dateParts = dateString.split(',')[0].trim().split(' ');
    return `${dateParts[0]} ${dateParts[1]}`;
  } catch (e) {
    return dateString;
  }
};

export const useEvents = (
  query: string,
  activeFilters: string[],
  personaType: string,
  setErrorMessage: (message: string | null) => void,
  setHasMore: (hasMore: boolean) => void,
  eventsPerPage = 5
) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch events data
  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === '' && activeFilters.length === 0) {
        setEvents([]);
        setErrorMessage(null);
        return;
      }

      setIsLoading(true);
      setCurrentPage(1); // Reset to first page on new search
      
      try {
        // Fetch all events
        let allEvents: Event[] = [];
        try {
          allEvents = await fetchNJITEvents(query);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
        
        if (allEvents.length === 0) {
          setEvents([]);
          setErrorMessage('No events found. Please try a different search or check back later.');
          setIsLoading(false);
          return;
        }
        
        // Filter based on persona
        let filteredEvents: Event[];
        
        if (personaType === 'resident') {
          // For Resident mode: Only show residence-related events
          filteredEvents = allEvents.filter(event => isResidenceLifeEvent(event));
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No residence hall events found. Switch to commuter mode to see general campus events.');
          }
        } else {
          // For Commuter mode: Show everything EXCEPT residence-specific events
          filteredEvents = allEvents.filter(event => !isResidenceLifeEvent(event));
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No commuter-relevant events found. Switch to resident mode to see residence hall events.');
          }
        }
        
        // Apply any active filters
        if (activeFilters.length > 0) {
          filteredEvents = filteredEvents.filter(event => {
            // Check category filters
            if (activeFilters.includes(event.category)) return true;
            
            // Check for 'food' filter
            if (activeFilters.includes('food') && event.hasFood) return true;
            
            // Check for 'today' filter
            const today = new Date();
            const formattedToday = today.toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric'
            });
            if (activeFilters.includes('today') && event.date.includes(formattedToday)) {
              return true;
            }
            
            return false;
          });
        }
        
        // Sort by relevance score
        filteredEvents.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        
        setEvents(filteredEvents);
        setErrorMessage(null);
        
        // Set hasMore flag for infinite scrolling
        setHasMore(filteredEvents.length > eventsPerPage);
      } catch (error) {
        console.error('Error fetching search results:', error);
        setEvents([]);
        setErrorMessage('Failed to fetch results. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchResults();
  }, [query, activeFilters, personaType, setErrorMessage, setHasMore, eventsPerPage]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const grouped: { [key: string]: Event[] } = {};
    
    events.forEach(event => {
      const dateKey = getDateKey(event.date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(event);
    });
    
    return grouped;
  }, [events]);

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
    const startIndex = 0;
    const endIndex = Math.min(currentPage * eventsPerPage, sortedDates.length);
    return sortedDates.slice(startIndex, endIndex);
  }, [sortedDates, currentPage, eventsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(sortedDates.length / eventsPerPage);

  // Function to load more events
  const loadMoreEvents = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    } else {
      setHasMore(false);
    }
  };

  return {
    events,
    isLoading,
    groupedEvents,
    sortedDates,
    paginatedDates,
    currentPage,
    loadMoreEvents,
    totalPages
  };
};

export default useEvents;