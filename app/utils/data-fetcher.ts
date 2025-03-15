/**
 * Data fetching utilities for the Salt-Pepper-Ketchup platform
 * This file contains functions to fetch event data from the NJIT campus labs API
 */

import { Event } from '../types/event';

const NJIT_API_URL = 'https://njit.campuslabs.com/engage/api/discovery/event/search';

interface NJITEvent {
  id: number;
  name: string;
  description: string;
  location: string;
  startsOn: string;
  endsOn: string;
  organizationName: string;
  imagePath?: string;
  benefitNames: string[];
  categoryNames: string[];
  theme?: { 
    colorPrimary?: string;
    colorSecondary?: string;
  };
}

interface NJITApiResponse {
  value: NJITEvent[];
  nextPage?: string;
}

/**
 * Fetches events from the NJIT Campus Labs API
 */
export const fetchNJITEvents = async (query: string = '', page: number = 1): Promise<Event[]> => {
  try {
    console.log("Fetching NJIT events with query:", query);
    
    // Get current date in ISO format for the endsAfter parameter
    const now = new Date();
    const isoDate = now.toISOString();
    
    // Build the URL with query parameters
    const url = new URL(NJIT_API_URL);
    url.searchParams.append('endsAfter', isoDate);
    url.searchParams.append('orderByField', 'endsOn');
    url.searchParams.append('orderByDirection', 'ascending');
    url.searchParams.append('status', 'Approved');
    url.searchParams.append('take', '100');
    
    if (query) {
      url.searchParams.append('query', query);
    }
    
    console.log("Fetching from URL:", url.toString());
    
    // Fetch data from the API
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error("API response not OK:", response.status, response.statusText);
      throw new Error(`Error fetching events: ${response.statusText}`);
    }
    
    const data: NJITApiResponse = await response.json();
    console.log("API response received with", data.value?.length || 0, "events");
    
    // If no events, return empty array
    if (!data.value || data.value.length === 0) {
      return [];
    }
    
    // Convert API response to our Event format
    const events: Event[] = data.value.map((njitEvent) => {
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
      
      // Check if food is mentioned in the description or benefits
      const hasFoodMention = 
        njitEvent.description.toLowerCase().includes('food') || 
        njitEvent.description.toLowerCase().includes('refreshment') ||
        njitEvent.description.toLowerCase().includes('snack') ||
        njitEvent.description.toLowerCase().includes('lunch') ||
        njitEvent.description.toLowerCase().includes('dinner') ||
        njitEvent.description.toLowerCase().includes('breakfast') ||
        njitEvent.description.toLowerCase().includes('pizza') ||
        njitEvent.description.toLowerCase().includes('drinks');
      
      const hasFoodBenefit = njitEvent.benefitNames.some(benefit => 
        benefit.toLowerCase().includes('food'));
      
      const hasFood = hasFoodMention || hasFoodBenefit;
      
      // If it has food and no other category is set, categorize as food
      if (hasFood && category === 'other') {
        category = 'food';
      }
      
      // Extract food type if possible
      let foodType = undefined;
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
      
      // If no specific food type found but food is mentioned
      if (!foodType && hasFood) {
        foodType = 'Food & Refreshments';
      }
      
      // Extract relevant tags from categories and benefits
      const tags = [...(njitEvent.categoryNames || []), ...(njitEvent.benefitNames || [])]
        .map(tag => tag.toLowerCase())
        .filter((tag, index, self) => self.indexOf(tag) === index); // Remove duplicates
      
      // Check if event is targeted to commuters
      const isCommuter = 
        njitEvent.description.toLowerCase().includes('commuter') || 
        tags.some(tag => tag.includes('commuter'));
      
      if (isCommuter && !tags.includes('commuter')) {
        tags.push('commuter');
      }
      
      return {
        id: njitEvent.id.toString(),
        title: njitEvent.name,
        description: njitEvent.description,
        location: njitEvent.location || 'NJIT Campus',
        date: formattedDate,
        time: formattedTime,
        hasFood,
        foodType: foodType,
        organizerName: njitEvent.organizationName,
        category,
        tags,
        imageUrl: njitEvent.imagePath,
        relevanceScore: 70 // Default score, will be adjusted based on query and filters
      };
    });
    
    console.log("Processed", events.length, "events");
    return events;
  } catch (error) {
    console.error('Error fetching NJIT events:', error);
    throw error; // Re-throw to handle in the calling function
  }
};