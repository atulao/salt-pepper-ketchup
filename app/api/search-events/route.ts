import { NextResponse } from 'next/server';
import { fetchNJITEvents } from '../../utils/data-fetcher';
import { Event } from '../../types/event';

// Fallback mock data in case API absolutely fails
const mockEvents = [
  {
    id: '1',
    title: 'NJIT Hackathon with Free Pizza',
    description: 'Join us for a 24-hour coding marathon with free pizza, drinks, and snacks throughout the event. Build amazing projects, meet new people, and win prizes!',
    location: 'Campus Center Ballroom',
    date: 'March 20, 2025',
    time: '12:00 PM',
    hasFood: true,
    foodType: 'Pizza & Snacks',
    organizerName: 'ACM Student Chapter',
    category: 'academic' as const,
    tags: ['coding', 'technology', 'competition', 'networking'],
    relevanceScore: 95
  },
  {
    id: '2',
    title: 'Career Fair Networking Lunch',
    description: 'Network with top employers while enjoying a complimentary lunch buffet. Perfect opportunity to discuss internships and job opportunities.',
    location: 'Multipurpose Room',
    date: 'March 25, 2025',
    time: '11:30 AM',
    hasFood: true,
    foodType: 'Lunch Buffet',
    organizerName: 'Career Development Services',
    category: 'career' as const,
    tags: ['networking', 'job opportunities', 'professional development'],
    relevanceScore: 87
  }
];

export async function GET(request: Request) {
  // Get the search query and filters from URL params
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const filters = searchParams.get('filters')?.split(',') || [];
  const persona = searchParams.get('persona') || 'commuter';

  console.log("API call made with query:", query);
  console.log("Filters:", filters);
  console.log("Persona:", persona);

  try {
    // Fetch real events from NJIT API
    let events = await fetchNJITEvents(query);
    
    console.log("API response received:", events.length, "events found");
    
    // If no events returned from API, return empty array with a specific status code
    if (events.length === 0) {
      return NextResponse.json({ 
        events: [], 
        message: "No events found. Please try a different search or check back later." 
      });
    }
    
    // Apply category filters
    if (filters.length > 0) {
      console.log("Applying filters:", filters);
      events = events.filter(event => {
        // Check category filters
        if (filters.includes(event.category)) return true;
        
        // Check for 'food' filter
        if (filters.includes('food') && event.hasFood) return true;
        
        // Check for 'today' filter
        const today = new Date();
        const eventDate = new Date(event.date);
        if (filters.includes('today') && 
            eventDate.getDate() === today.getDate() && 
            eventDate.getMonth() === today.getMonth() && 
            eventDate.getFullYear() === today.getFullYear()) {
          return true;
        }
        
        return false;
      });
      
      console.log("After filtering:", events.length, "events remaining");
    }

    // If filtering resulted in no events, return empty array with message
    if (events.length === 0) {
      return NextResponse.json({ 
        events: [], 
        message: "No events match your filters. Try adjusting your search criteria." 
      });
    }

    // Adjust relevance scores based on persona
    if (persona === 'commuter') {
      // Boost events with food, events during daytime, and events specifically for commuters
      events = events.map(event => {
        let adjustedScore = event.relevanceScore || 50;
        
        // Boost events with food
        if (event.hasFood) adjustedScore += 10;
        
        // Boost daytime events (assuming commuters prefer events during the day)
        if (event.time) {
          const timeMatch = event.time.match(/(\d+):(\d+)\s*(AM|PM)/i);
          if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const period = timeMatch[3].toUpperCase();
            
            // Convert to 24-hour format
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            // Boost daytime events (9 AM to 4 PM)
            if (hours >= 9 && hours <= 16) adjustedScore += 8;
          }
        }
        
        // Boost events for commuters
        if (event.tags.includes('commuter')) adjustedScore += 15;
        
        return {
          ...event,
          relevanceScore: Math.min(100, adjustedScore)
        };
      });
    }

    // Sort by relevance score
    events.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    return NextResponse.json({ events, message: null });
  } catch (error) {
    console.error('Error in search-events API:', error);
    
    // TEMPORARY: Return mock data for development only if there's an error
    // In production, we would want to return an error message
    console.log("Error occurred, returning mock data for development");
    return NextResponse.json({ 
      events: mockEvents, 
      message: "Using demo data. Could not connect to NJIT events API."
    });
  }
}