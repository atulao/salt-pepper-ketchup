// app/hooks/useEvents.ts
import { useState, useEffect, useMemo } from 'react';
import { Event } from '../types/event';
import { fetchNJITEvents, isResidenceLifeEvent } from '../utils/data-fetcher';
import { isCareerEvent } from '../utils/keyword-matcher';

// Function to extract the date part for grouping
const getDateKey = (dateString: string): string => {
  try {
    const dateParts = dateString.split(',')[0].trim().split(' ');
    return `${dateParts[0]} ${dateParts[1]}`;
  } catch (e) {
    return dateString;
  }
};

// Helper function to get date in format 'Month Day, Year'
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper functions for date manipulation
const formatDateForComparison = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
};

const getTodayDateString = (): string => {
  return formatDateForComparison(new Date());
};

const getTomorrowDateString = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return formatDateForComparison(tomorrow);
};

const getWeekDates = (): string[] => {
  const today = new Date();
  const weekDates: string[] = [];
  
  for (let i = 0; i < 7; i++) {
    const day = new Date();
    day.setDate(today.getDate() + i);
    weekDates.push(formatDateForComparison(day));
  }
  
  return weekDates;
};

const getWeekendDates = (): string[] => {
  const today = new Date();
  const weekendDates: string[] = [];
  
  // Find next Saturday and Sunday
  let dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
  let daysUntilSaturday = (6 - dayOfWeek) % 7;
  
  // Saturday
  const saturday = new Date();
  saturday.setDate(today.getDate() + daysUntilSaturday);
  weekendDates.push(formatDateForComparison(saturday));
  
  // Sunday
  const sunday = new Date();
  sunday.setDate(today.getDate() + daysUntilSaturday + 1);
  weekendDates.push(formatDateForComparison(sunday));
  
  return weekendDates;
};

// Determine if a date string matches a target date
const dateIncludes = (dateString: string, targetDate: string): boolean => {
  return dateString.includes(targetDate);
};

// Helper functions to check event dates
const isToday = (dateString: string): boolean => {
  return dateIncludes(dateString, getTodayDateString());
};

const isTomorrow = (dateString: string): boolean => {
  return dateIncludes(dateString, getTomorrowDateString());
};

const isThisWeek = (dateString: string): boolean => {
  return getWeekDates().some(date => dateIncludes(dateString, date));
};

const isWeekend = (dateString: string): boolean => {
  const weekendDates = getWeekendDates();
  return weekendDates.some(date => dateIncludes(dateString, date));
};

// Check if event is happening today
const isEventToday = (event: Event): boolean => {
  const today = new Date();
  return dateIncludes(event.date, getTodayDateString());
};

// Check if event is happening this week
const isEventThisWeek = (event: Event): boolean => {
  const [startOfWeek, endOfWeek] = getWeekRange();
  
  // Parse event date
  const eventDateParts = event.date.split(', ');
  const eventDateStr = eventDateParts[0] + ', ' + (eventDateParts[1] || new Date().getFullYear());
  const eventDate = new Date(eventDateStr);
  
  // Check if event date is within this week
  return eventDate >= startOfWeek && eventDate <= endOfWeek;
};

// Check if event is happening on the weekend
const isEventOnWeekend = (event: Event): boolean => {
  const weekendDates = getWeekendDates();
  return weekendDates.some(date => dateIncludes(event.date, date));
};

// List of all filter categories (used for counts)
export const ALL_FILTERS = [
  // Date filters
  'today', 'tomorrow', 'this-week', 'weekend',
  
  // Categories
  'academic', 'social', 'career', 'food',
  
  // Purpose
  'networking', 'workshop-skillbuild', 'service-volunteering',
  
  // Themes
  'health-wellness', 'arts-culture', 'sports-recreation', 'faith-spirituality',
  
  // Perks
  'free-food', 'free-swag',
  
  // Format
  'in-person', 'virtual', 'requires-rsvp',
  
  // Time of Day
  'morning', 'afternoon', 'evening',
  
  // Residence Life specific
  'residence'
];

/**
 * Check if an event passes the current active filters
 */
const eventPassesFilters = (event: Event, activeFilters: string[]): boolean => {
  // If no filters are active, all events pass
  if (activeFilters.length === 0) return true;
  
  // Group filters by category
  const dateFilters = activeFilters.filter(f => ['today', 'tomorrow', 'this-week', 'weekend'].includes(f));
  const timeOfDayFilters = activeFilters.filter(f => ['morning', 'afternoon', 'evening'].includes(f));
  const perksFilters = activeFilters.filter(f => ['free-food', 'free-swag'].includes(f));
  const purposeFilters = activeFilters.filter(f => ['career', 'networking', 'workshop-skillbuild', 'service-volunteering'].includes(f));
  const themeFilters = activeFilters.filter(f => ['health-wellness', 'arts-culture', 'sports-recreation', 'faith-spirituality'].includes(f));
  const formatFilters = activeFilters.filter(f => ['in-person', 'virtual', 'requires-rsvp'].includes(f));
  const residenceFilters = activeFilters.filter(f => ['residence'].includes(f));
  
  // Check date filters - pass if matches ANY selected date filter
  if (dateFilters.length > 0) {
    const passesDateFilter = dateFilters.some(filter => {
      if (filter === 'today') return isEventToday(event);
      if (filter === 'tomorrow') return isTomorrow(event.date);
      if (filter === 'this-week') return isEventThisWeek(event);
      if (filter === 'weekend') return isEventOnWeekend(event);
      return false;
    });
    if (!passesDateFilter) return false;
  }
  
  // Check time of day filters - pass if matches ANY selected time filter
  if (timeOfDayFilters.length > 0) {
    const passesTimeFilter = timeOfDayFilters.some(filter => {
      if (filter === 'morning') return event.timeOfDay === 'morning';
      if (filter === 'afternoon') return event.timeOfDay === 'afternoon';
      if (filter === 'evening') return event.timeOfDay === 'evening';
      return false;
    });
    if (!passesTimeFilter) return false;
  }
  
  // Check perks filters - pass if matches ANY selected perk
  if (perksFilters.length > 0) {
    const passesPerkFilter = perksFilters.some(filter => {
      if (filter === 'free-food') return event.hasFood;
      if (filter === 'free-swag') return event.hasSwag;
      return false;
    });
    if (!passesPerkFilter) return false;
  }
  
  // Check purpose filters - pass if matches ANY selected purpose
  if (purposeFilters.length > 0) {
    const passesPurposeFilter = purposeFilters.some(filter => {
      if (filter === 'career') return event.isCareer;
      if (filter === 'networking') return event.isNetworking;
      if (filter === 'workshop-skillbuild') return event.isWorkshop;
      if (filter === 'service-volunteering') return event.isService;
      return false;
    });
    if (!passesPurposeFilter) return false;
  }
  
  // Check theme filters - pass if matches ANY selected theme
  if (themeFilters.length > 0) {
    const passesThemeFilter = themeFilters.some(filter => {
      if (filter === 'health-wellness') return event.isHealthWellness;
      if (filter === 'arts-culture') return event.isArtsCulture;
      if (filter === 'sports-recreation') return event.isSportsRec;
      if (filter === 'faith-spirituality') return event.isFaithSpirituality;
      return false;
    });
    if (!passesThemeFilter) return false;
  }
  
  // Check format filters - pass if matches ANY selected format
  if (formatFilters.length > 0) {
    const passesFormatFilter = formatFilters.some(filter => {
      if (filter === 'in-person') return event.format === 'in-person';
      if (filter === 'virtual') return event.format === 'virtual';
      if (filter === 'requires-rsvp') return event.requiresRSVP;
      return false;
    });
    if (!passesFormatFilter) return false;
  }
  
  // Check residence filters
  if (residenceFilters.length > 0) {
    const passesResidenceFilter = residenceFilters.some(filter => {
      if (filter === 'residence') return isResidenceLifeEvent(event);
      return false;
    });
    if (!passesResidenceFilter) return false;
  }
  
  // If we got here, the event passed all filter categories
  return true;
};

/**
 * Calculate filter counts for all available filters based on the current events
 */
const calculateFilterCounts = (applicableEvents: Event[]): { [key: string]: number } => {
  const counts: { [key: string]: number } = {};
  
  // Count date filters
  counts['today'] = applicableEvents.filter(event => isEventToday(event)).length;
  counts['tomorrow'] = applicableEvents.filter(event => isTomorrow(event.date)).length;
  counts['this-week'] = applicableEvents.filter(event => isEventThisWeek(event)).length;
  counts['weekend'] = applicableEvents.filter(event => isEventOnWeekend(event)).length;
  
  // Count perks
  counts['free-food'] = applicableEvents.filter(event => event.hasFood).length;
  counts['free-swag'] = applicableEvents.filter(event => event.hasSwag).length;
  
  // Count purpose
  counts['career'] = applicableEvents.filter(event => event.category === 'career').length;
  counts['networking'] = applicableEvents.filter(event => event.isNetworking).length;
  counts['workshop-skillbuild'] = applicableEvents.filter(event => event.isWorkshop).length;
  counts['service-volunteering'] = applicableEvents.filter(event => event.isService).length;
  
  // Count theme
  counts['health-wellness'] = applicableEvents.filter(event => event.isHealthWellness).length;
  counts['arts-culture'] = applicableEvents.filter(event => event.isArtsCulture).length;
  counts['sports-recreation'] = applicableEvents.filter(event => event.isSportsRec).length;
  counts['faith-spirituality'] = applicableEvents.filter(event => event.isFaithSpirituality).length;
  
  // Count format
  counts['in-person'] = applicableEvents.filter(event => event.format === 'in-person').length;
  counts['virtual'] = applicableEvents.filter(event => event.format === 'virtual').length;
  counts['requires-rsvp'] = applicableEvents.filter(event => event.requiresRSVP).length;
  
  // Count time of day
  counts['morning'] = applicableEvents.filter(event => event.timeOfDay === 'morning').length;
  counts['afternoon'] = applicableEvents.filter(event => event.timeOfDay === 'afternoon').length;
  counts['evening'] = applicableEvents.filter(event => event.timeOfDay === 'evening').length;
  
  // Special filters
  counts['residence'] = applicableEvents.filter(event => isResidenceLifeEvent(event)).length;
  
  return counts;
};

// Helper to get week dates for this week
const getWeekRange = (): [Date, Date] => {
  const now = new Date();
  const currentDay = now.getDay(); // 0 = Sunday, 6 = Saturday
  
  // Calculate days to beginning of week (Monday)
  const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
  
  // Calculate start and end of week
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - daysToMonday);
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return [startOfWeek, endOfWeek];
};

// Add function to save recent filter combinations
const saveRecentFilterCombination = (activeFilters: string[]) => {
  // Don't save empty filter combinations
  if (activeFilters.length === 0) return;
  
  try {
    // Load existing recent combinations
    const recentFiltersJson = localStorage.getItem('recentFilterCombinations');
    const recentFilters = recentFiltersJson ? JSON.parse(recentFiltersJson) : [];
    
    // Create string representation of current filter set for comparison
    const currentFilterSet = [...activeFilters].sort().join(',');
    
    // Check if this combination already exists and remove if it does
    const filteredCombinations = recentFilters.filter((combo: string) => combo !== currentFilterSet);
    
    // Add current combination to the front
    filteredCombinations.unshift(currentFilterSet);
    
    // Keep only the 3 most recent combinations
    const limitedCombinations = filteredCombinations.slice(0, 3);
    
    // Save back to localStorage
    localStorage.setItem('recentFilterCombinations', JSON.stringify(limitedCombinations));
  } catch (error) {
    console.error('Error saving recent filter combinations:', error);
  }
};

// Add function to get recent filter combinations
const getRecentFilterCombinations = (): string[][] => {
  try {
    const recentFiltersJson = localStorage.getItem('recentFilterCombinations');
    if (!recentFiltersJson) return [];
    
    const recentFilters = JSON.parse(recentFiltersJson);
    // Convert string representations back to arrays
    return recentFilters.map((combo: string) => combo ? combo.split(',') : []);
  } catch (error) {
    console.error('Error getting recent filter combinations:', error);
    return [];
  }
};

export const useEvents = (
  query: string,
  activeFilters: string[],
  personaType: string,
  tagFilter: string | null,
  orgFilter: string | null = null,
  eventsPerPage = 5
) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterCounts, setFilterCounts] = useState<{[key: string]: number}>({});

  // Save filter combinations when active filters change
  useEffect(() => {
    if (activeFilters.length > 0) {
      saveRecentFilterCombination(activeFilters);
    }
  }, [activeFilters]);

  // Fetch events data
  useEffect(() => {
    const fetchResults = async () => {
      // If no query, but we want to show free food by default
      if (query.trim() === '' && activeFilters.length === 0 && !tagFilter && !orgFilter) {
        setIsLoading(true);
        
        try {
          // Fetch all events with focus on free food
          let fetchedEvents = await fetchNJITEvents('');
          
          // Save all events for filter counts
          setAllEvents(fetchedEvents);
          
          // Filter for free food events
          let foodEvents = fetchedEvents.filter(event => event.hasFood);
          
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
          
          // Calculate filter counts
          updateFilterCounts(fetchedEvents, personaType);
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
        let fetchedEvents: Event[] = [];
        try {
          fetchedEvents = await fetchNJITEvents(query);
        } catch (error) {
          console.error('Error fetching events:', error);
        }
        
        if (fetchedEvents.length === 0) {
          setEvents([]);
          setAllEvents([]);
          setErrorMessage('No events found. Please try a different search or check back later.');
          setIsLoading(false);
          return;
        }
        
        // Save all events for filter counts
        setAllEvents(fetchedEvents);
        
        // Filter based on persona
        let filteredEvents: Event[];
        
        if (personaType === 'resident') {
          // For Resident mode: Only show residence-related events
          filteredEvents = fetchedEvents.filter(event => isResidenceLifeEvent(event));
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No residence hall events found. Switch to commuter mode to see general campus events.');
          }
        } else {
          // For Commuter mode: Show everything EXCEPT residence-specific events
          filteredEvents = fetchedEvents.filter(event => !isResidenceLifeEvent(event));
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No commuter-relevant events found. Switch to resident mode to see residence hall events.');
          }
        }
        
        // Handle specific "today" queries in search
        if (query.toLowerCase().includes('today')) {
          const today = new Date();
          
          // Filter strictly for today's events
          const todayEvents = filteredEvents.filter(event => 
            dateIncludes(event.date, getTodayDateString())
          );
          
          // If no events today, provide helpful message
          if (todayEvents.length === 0) {
            // Check if there are any future events matching the query
            const queryWithoutToday = query.toLowerCase().replace('today', '').trim();
            let futureEvents = fetchedEvents.filter(event => {
              const matchesQuery = event.title.toLowerCase().includes(queryWithoutToday) || 
                                  event.description.toLowerCase().includes(queryWithoutToday) ||
                                  event.tags.some(tag => tag.toLowerCase().includes(queryWithoutToday));
              
              // Convert event date to Date object
              const eventDateParts = event.date.split(', ');
              const eventDateStr = eventDateParts[0] + ', ' + (eventDateParts[1] || new Date().getFullYear());
              const eventDate = new Date(eventDateStr);
              
              // Only include future events (not today)
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isInFuture = eventDate > today;
              
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
            
            // Calculate filter counts even for empty results
            updateFilterCounts(fetchedEvents, personaType);
            setIsLoading(false);
            return;
          } else {
            // Use today's events as the filtered set
            filteredEvents = todayEvents;
          }
        }
        
        // Apply date filters
        if (activeFilters.includes('today')) {
          const today = new Date();
          filteredEvents = filteredEvents.filter(event => dateIncludes(event.date, getTodayDateString()));
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No events found for today. Try checking other days.');
          }
        }
        
        if (activeFilters.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          filteredEvents = filteredEvents.filter(event => dateIncludes(event.date, getTomorrowDateString()));
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No events found for tomorrow. Try checking other days.');
          }
        }
        
        if (activeFilters.includes('this-week')) {
          const [startOfWeek, endOfWeek] = getWeekRange();
          
          filteredEvents = filteredEvents.filter(event => {
            // Parse event date
            const eventDateParts = event.date.split(', ');
            const eventDateStr = eventDateParts[0] + ', ' + (eventDateParts[1] || new Date().getFullYear());
            const eventDate = new Date(eventDateStr);
            
            // Check if event date is within this week
            return eventDate >= startOfWeek && eventDate <= endOfWeek;
          });
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No events found for this week. Try checking future weeks.');
          }
        }
        
        if (activeFilters.includes('weekend')) {
          const weekendDates = getWeekendDates();
          
          filteredEvents = filteredEvents.filter(event => 
            weekendDates.some(date => dateIncludes(event.date, date))
          );
          
          if (filteredEvents.length === 0) {
            setErrorMessage('No events found for this weekend. Try checking weekdays or future weekends.');
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
        
        // Apply organization filter if present
        if (orgFilter) {
          const eventsBeforeOrgFilter = [...filteredEvents];
          
          filteredEvents = filteredEvents.filter(event => 
            event.organizerName.toLowerCase().includes(orgFilter.toLowerCase())
          );
          
          if (filteredEvents.length === 0) {
            setErrorMessage(`No events found for organization "${orgFilter}". Try a different filter.`);
            
            // Restore events without org filter if none match
            if (eventsBeforeOrgFilter.length > 0) {
              console.log(`No events match organization "${orgFilter}", showing unfiltered results`);
            }
          }
        }
        
        // Apply category filters
        if (activeFilters.length > 0) {
          // Use the eventPassesFilters function for consistent filter behavior
          filteredEvents = filteredEvents.filter(event => eventPassesFilters(event, activeFilters));
          
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
        
        // Set error message if no events after all filtering
        if (filteredEvents.length === 0 && !errorMessage) {
          setErrorMessage('No events match your search criteria. Try adjusting your filters.');
        } else if (filteredEvents.length > 0) {
          setErrorMessage(null);
        }
        
        // Update filter counts
        updateFilterCounts(fetchedEvents, personaType);
        
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
  }, [query, activeFilters, personaType, tagFilter, orgFilter, eventsPerPage]);

  // Function to update filter counts
  const updateFilterCounts = (allEvents: Event[], currentPersona: string) => {
    const counts: {[key: string]: number} = {};
    
    // Filter applicable events based on persona
    const applicableEvents = allEvents.filter(event => 
      currentPersona === 'resident' 
        ? isResidenceLifeEvent(event) 
        : !isResidenceLifeEvent(event)
    );
    
    // Count food events
    counts['food'] = applicableEvents.filter(event => event.hasFood).length;
    
    // Count events by category
    counts['academic'] = applicableEvents.filter(event => event.category === 'academic').length;
    counts['social'] = applicableEvents.filter(event => event.category === 'social').length;
    counts['career'] = applicableEvents.filter(event => event.isCareer || event.category === 'career').length;
    
    // Count residence events
    counts['residence'] = applicableEvents.filter(event => isResidenceLifeEvent(event)).length;
    
    // Count date-based events
    counts['today'] = applicableEvents.filter(event => isEventToday(event)).length;
    counts['tomorrow'] = applicableEvents.filter(event => isTomorrow(event.date)).length;
    counts['this-week'] = applicableEvents.filter(event => isEventThisWeek(event)).length;
    counts['weekend'] = applicableEvents.filter(event => isEventOnWeekend(event)).length;
    
    // Count events by Purpose
    counts['networking'] = applicableEvents.filter(event => event.isNetworking).length;
    counts['workshop-skillbuild'] = applicableEvents.filter(event => event.isWorkshop).length;
    counts['service-volunteering'] = applicableEvents.filter(event => event.isService).length;
    
    // Count events by Theme
    counts['health-wellness'] = applicableEvents.filter(event => event.isHealthWellness).length;
    counts['arts-culture'] = applicableEvents.filter(event => event.isArtsCulture).length;
    counts['sports-recreation'] = applicableEvents.filter(event => event.isSportsRec).length;
    counts['faith-spirituality'] = applicableEvents.filter(event => event.isFaithSpirituality).length;
    
    // Count events by additional perks
    counts['free-food'] = applicableEvents.filter(event => event.hasFood).length;
    counts['free-swag'] = applicableEvents.filter(event => event.hasSwag).length;
    
    // Count events by format and logistics
    counts['virtual'] = applicableEvents.filter(event => event.format === 'virtual').length;
    counts['in-person'] = applicableEvents.filter(event => event.format === 'in-person').length;
    counts['requires-rsvp'] = applicableEvents.filter(event => event.requiresRSVP).length;
    
    // Count events by time of day
    counts['morning'] = applicableEvents.filter(event => event.timeOfDay === 'morning').length;
    counts['afternoon'] = applicableEvents.filter(event => event.timeOfDay === 'afternoon').length;
    counts['evening'] = applicableEvents.filter(event => event.timeOfDay === 'evening').length;
    
    setFilterCounts(counts);
  };

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
    totalPages,
    hasMore,
    errorMessage,
    setErrorMessage,
    filterCounts,
    recentFilterCombinations: getRecentFilterCombinations()
  };
};

export default useEvents;