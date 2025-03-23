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
  tagFilter: string | null,
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
      // If no query, but we want to show free food by default
      if (query.trim() === '' && activeFilters.length === 0 && !tagFilter) {
        setIsLoading(true);
        
        try {
          // Fetch all events with focus on free food
          let allEvents = await fetchNJITEvents('');
          
          // Filter for free food events
          let foodEvents = allEvents.filter(event => event.hasFood);
          
          // Apply persona filtering
          if (personaType === 'resident') {
            foodEvents = foodEvents.filter(event => isResidenceLifeEvent(event));
          } else {
            foodEvents = foodEvents.filter(event => !isResidenceLifeEvent(event));
          }
          
          // Sort by relevance
          foodEvents.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
          
          setEvents(foodEvents);
          setErrorMessage(null);
          setHasMore(foodEvents.length > eventsPerPage);
        } catch (error) {
          console.error('Error fetching free food events:', error);
          setEvents([]);
          setErrorMessage('Failed to load free food events. Please try again.');
        } finally {
          setIsLoading(false);
        }
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
        
        // Handle specific "today" queries
        if (query.toLowerCase().includes('today')) {
          const today = new Date();
          const formattedToday = today.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric'
          });
          
          // Filter strictly for today's events
          const todayEvents = filteredEvents.filter(event => 
            event.date.includes(formattedToday)
          );
          
          // If no events today, provide helpful message
          if (todayEvents.length === 0) {
            // Check if there are any future events matching the query (e.g., free pizza but on other days)
            const queryWithoutToday = query.toLowerCase().replace('today', '').trim();
            let futureEvents = allEvents.filter(event => {
              const matchesQuery = event.title.toLowerCase().includes(queryWithoutToday) || 
                                  event.description.toLowerCase().includes(queryWithoutToday) ||
                                  event.tags.some(tag => tag.toLowerCase().includes(queryWithoutToday));
              
              // Only include future events (not today)
              const eventDate = new Date(event.date);
              const isInFuture = eventDate > today && !event.date.includes(formattedToday);
              
              return matchesQuery && isInFuture;
            });
            
            // Sort future events by date (closest first)
            futureEvents.sort((a, b) => {
              const dateA = new Date(a.date);
              const dateB = new Date(b.date);
              return dateA.getTime() - dateB.getTime();
            });
            
            // Limit to a few upcoming options
            futureEvents = futureEvents.slice(0, 3);
            
            if (futureEvents.length > 0) {
              // Format a message with alternatives
              const nextEvent = futureEvents[0];
              setErrorMessage(`No ${queryWithoutToday} available today. The next ${queryWithoutToday} event is "${nextEvent.title}" on ${nextEvent.date} at ${nextEvent.time}.`);
              setEvents(futureEvents); // Show future events as alternatives
            } else {
              setErrorMessage(`No ${queryWithoutToday} events found today or in the upcoming days.`);
              setEvents([]);
            }
            setIsLoading(false);
            return;
          } else {
            // Use today's events as the filtered set
            filteredEvents = todayEvents;
          }
        }
        
        // Apply tag filter if present
        if (tagFilter) {
          const eventsBeforeTagFilter = [...filteredEvents];
          
          filteredEvents = filteredEvents.filter(event => 
            event.tags.some(tag => 
              tag.toLowerCase() === tagFilter.toLowerCase() || 
              tag.toLowerCase().includes(tagFilter.toLowerCase()) ||
              tagFilter.toLowerCase().includes(tag.toLowerCase())
            )
          );
          
          if (filteredEvents.length === 0) {
            setErrorMessage(`No events found with tag "${tagFilter}". Try a different tag.`);
            
            // Restore events without tag filter if none match
            if (eventsBeforeTagFilter.length > 0) {
              console.log(`No events match tag "${tagFilter}", showing unfiltered results`);
            }
          }
        }
        
        // Apply category filters
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
            
            // Check for 'residence' filter
            if (activeFilters.includes('residence') && isResidenceLifeEvent(event)) {
              return true;
            }
            
            return false;
          });
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No events match your selected filters. Try adjusting your criteria.');
          }
        }
        
        // Sort by relevance score
        filteredEvents.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        
        // Add special boost for events matching tag filter
        if (tagFilter) {
          filteredEvents = filteredEvents.map(event => {
            const exactTagMatch = event.tags.some(tag => 
              tag.toLowerCase() === tagFilter.toLowerCase()
            );
            
            if (exactTagMatch) {
              return {
                ...event,
                relevanceScore: Math.min(100, (event.relevanceScore || 70) + 15)
              };
            }
            
            return event;
          });
          
          // Re-sort after boosting
          filteredEvents.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        }
        
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
  }, [query, activeFilters, personaType, tagFilter, setErrorMessage, setHasMore, eventsPerPage]);

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