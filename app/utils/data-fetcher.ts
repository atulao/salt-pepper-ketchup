/**
 * Data fetching utilities for the Salt-Pepper-Ketchup platform
 * This file contains functions to fetch event data from the NJIT campus labs API
 */

import { Event } from '../types/event';

// Use a proxy API route instead of directly calling the NJIT API
const API_URL = '/api/proxy';

// Cache for storing fetched events to reduce API calls
let eventCache: { [key: string]: { timestamp: number, data: Event[] } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Determines if an event is residence life related based on content and metadata
 */
export const isResidenceLifeEvent = (event: Event): boolean => {
  // List of residence hall locations
  const residenceLocations = [
    'cypress residence hall', 'cypress hall',
    'laurel residence hall', 'laurel hall', 'laurel extension',
    'oak residence hall', 'oak hall',
    'redwood residence hall', 'redwood hall', 'redwood glass lounge', 'redwood 1st floor lounge',
    'maple hall', 'maple kitchen', 'maple hall club room', 'maple club room',
    'martinson honors residence hall', 'honors residence',
    'warren street village', 'greek residence', 'dormitory'
  ];
  
  // Check if the event is in a residence hall location
  if (residenceLocations.some(loc => event.location.toLowerCase().includes(loc))) {
    return true;
  }
  
  // Check if the event is from Residence Life organization
  if (event.organizerName?.toLowerCase().includes('residence life')) {
    return true;
  }
  
  // Check residence-related keywords in various fields
  const residenceKeywords = ['residence', 'housing', 'dorm', 'hall council', 'ra ', 'resident assistant'];
  
  // Check if the event has residence-related tags
  if (event.tags.some(tag => residenceKeywords.some(keyword => tag.toLowerCase().includes(keyword)))) {
    return true;
  }
  
  // Check the description for residence-specific content
  if (residenceKeywords.some(keyword => event.description.toLowerCase().includes(keyword) && 
     !event.description.toLowerCase().includes('commuter'))) {
    return true;
  }
  
  return false;
};

/**
 * Process raw events from API into our Event format
 */
const processAPIEvents = (apiEvents: any[]): Event[] => {
  return apiEvents.map(njitEvent => {
    // Parse start date and time
    const startDate = new Date(njitEvent.startsOn);
    const formattedDate = startDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    const formattedTime = startDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    // Determine event category
    let category: 'academic' | 'social' | 'career' | 'food' | 'other' = 'other';
    
    if (njitEvent.categoryNames && Array.isArray(njitEvent.categoryNames)) {
      if (njitEvent.categoryNames.some(cat => 
        cat.toLowerCase().includes('academic') || 
        cat.toLowerCase().includes('education') || 
        cat.toLowerCase().includes('lecture') ||
        cat.toLowerCase().includes('study') ||
        cat.toLowerCase().includes('workshop'))) {
        category = 'academic';
      } else if (njitEvent.categoryNames.some(cat => 
        cat.toLowerCase().includes('career') || 
        cat.toLowerCase().includes('job') || 
        cat.toLowerCase().includes('professional'))) {
        category = 'career';
      } else if (njitEvent.categoryNames.some(cat => 
        cat.toLowerCase().includes('social') || 
        cat.toLowerCase().includes('community') || 
        cat.toLowerCase().includes('cultural'))) {
        category = 'social';
      }
    }
    
    // Check if food is mentioned in the description or benefits
    const hasFoodMention = 
      njitEvent.description && (
        njitEvent.description.toLowerCase().includes('food') || 
        njitEvent.description.toLowerCase().includes('refreshment') ||
        njitEvent.description.toLowerCase().includes('snack') ||
        njitEvent.description.toLowerCase().includes('lunch') ||
        njitEvent.description.toLowerCase().includes('dinner') ||
        njitEvent.description.toLowerCase().includes('breakfast') ||
        njitEvent.description.toLowerCase().includes('pizza') ||
        njitEvent.description.toLowerCase().includes('drinks')
      );
    
    const hasFoodBenefit = njitEvent.benefitNames && Array.isArray(njitEvent.benefitNames) &&
      njitEvent.benefitNames.some(benefit => benefit.toLowerCase().includes('food'));
    
    const hasFood = hasFoodMention || hasFoodBenefit;
    
    // If it has food and no other category is set, categorize as food
    if (hasFood && category === 'other') {
      category = 'food';
    }
    
    // Extract food type if possible
    let foodType = undefined;
    if (njitEvent.description) {
      const foodTypes = [
        'pizza', 'sandwich', 'lunch', 'dinner', 'breakfast', 
        'refreshment', 'snack', 'coffee', 'catering', 'buffet'
      ];
      
      for (const type of foodTypes) {
        if (njitEvent.description.toLowerCase().includes(type)) {
          foodType = type.charAt(0).toUpperCase() + type.slice(1);
          break;
        }
      }
    }
    
    // If no specific food type found but food is mentioned
    if (!foodType && hasFood) {
      foodType = 'Food & Refreshments';
    }
    
    // Extract relevant tags from categories and benefits
    const tags = [];
    if (njitEvent.categoryNames && Array.isArray(njitEvent.categoryNames)) {
      tags.push(...njitEvent.categoryNames.map(tag => tag.toLowerCase()));
    }
    if (njitEvent.benefitNames && Array.isArray(njitEvent.benefitNames)) {
      tags.push(...njitEvent.benefitNames.map(tag => tag.toLowerCase()));
    }
    
    // Remove duplicates
    const uniqueTags = [...new Set(tags)];
    
    // Check if event is targeted to commuters
    const isCommuter = 
      (njitEvent.description && njitEvent.description.toLowerCase().includes('commuter')) || 
      uniqueTags.some(tag => tag.includes('commuter'));
    
    if (isCommuter && !uniqueTags.includes('commuter')) {
      uniqueTags.push('commuter');
    }
    
    return {
      id: njitEvent.id.toString(),
      title: njitEvent.name,
      description: njitEvent.description || 'No description available',
      location: njitEvent.location || 'NJIT Campus',
      date: formattedDate,
      time: formattedTime,
      hasFood,
      foodType: foodType,
      organizerName: njitEvent.organizationName || 'NJIT',
      category,
      tags: uniqueTags,
      imageUrl: njitEvent.imagePath,
      relevanceScore: 70 // Default score, will be adjusted based on query and filters
    };
  });
};

/**
 * Fetches events from the NJIT Campus Labs API through our proxy
 */
export const fetchNJITEvents = async (query: string = ''): Promise<Event[]> => {
  const cacheKey = `events-${query}`;
  const now = Date.now();
  
  // Check if we have non-expired cached data
  if (eventCache[cacheKey] && (now - eventCache[cacheKey].timestamp) < CACHE_TTL) {
    console.log("Using cached events for query:", query);
    return eventCache[cacheKey].data;
  }

  try {
    console.log("Fetching events with query:", query);
    
    // Use the proxy API route
    const url = new URL(API_URL, window.location.origin);
    if (query) {
      url.searchParams.append('query', query);
    }
    
    console.log("Fetching from URL:", url.toString());
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`API error (${response.status}): ${response.statusText}`);
      return []; // Return empty array instead of mock data
    }
    
    const data = await response.json();
    
    // If no events, return empty array
    if (!data.value || data.value.length === 0) {
      console.log("No events returned from API");
      return [];
    }
    
    // Process API response
    const events = processAPIEvents(data.value);
    
    // Cache the results
    eventCache[cacheKey] = {
      timestamp: now,
      data: events
    };
    
    console.log("Processed", events.length, "events from API");
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    return []; // Return empty array instead of mock data
  }
};

/**
 * Fetches events specifically for residence life
 */
export const fetchResidenceLifeEvents = async (): Promise<Event[]> => {
  const cacheKey = 'residence-life-events';
  const now = Date.now();
  
  // Check if we have non-expired cached data
  if (eventCache[cacheKey] && (now - eventCache[cacheKey].timestamp) < CACHE_TTL) {
    console.log("Using cached Residence Life events");
    return eventCache[cacheKey].data;
  }

  try {
    console.log("Fetching Residence Life events");
    
    // Use the proxy API route with 'residence' query
    const url = new URL(API_URL, window.location.origin);
    url.searchParams.append('query', 'residence');
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`API error (${response.status}): ${response.statusText}`);
      return []; // Return empty array
    }
    
    const data = await response.json();
    
    // If no events, return empty array
    if (!data.value || data.value.length === 0) {
      console.log("No residence events returned from API");
      return [];
    }
    
    // Process events and filter for residence-specific ones
    const allEvents = processAPIEvents(data.value);
    const residenceEvents = allEvents.filter(event => isResidenceLifeEvent(event));
    
    // If no residence events found after filtering, return empty array
    if (residenceEvents.length === 0) {
      console.log("No residence events found after filtering");
      return [];
    }
    
    // Boost relevance scores for residence events
    const enhancedEvents = residenceEvents.map(event => ({
      ...event,
      tags: [...event.tags, 'residence', 'housing'].filter((v, i, a) => a.indexOf(v) === i), // Remove duplicates
      relevanceScore: Math.min(100, (event.relevanceScore || 70) + 20)
    }));
    
    // Cache the results
    eventCache[cacheKey] = {
      timestamp: now,
      data: enhancedEvents
    };
    
    console.log("Found", enhancedEvents.length, "residence events from API");
    return enhancedEvents;
  } catch (error) {
    console.error('Error fetching residence events:', error);
    return []; // Return empty array
  }
};

/**
 * Clears the event cache
 */
export const clearEventCache = (): void => {
  eventCache = {};
  console.log("Event cache cleared");
};