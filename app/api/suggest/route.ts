import { NextResponse } from 'next/server';
import { fetchNJITEvents } from '../../utils/data-fetcher';

// Fallback suggestions data when API fails
const fallbackSuggestions = [
  // Food-related suggestions
  { text: 'Pizza at Student Center', type: 'food' },
  { text: 'Free lunch lecture series', type: 'food' },
  { text: 'Breakfast events on campus', type: 'food' },
  { text: 'Free donuts', type: 'food' },
  { text: 'Vegetarian options', type: 'food' },
  { text: 'Coffee and study sessions', type: 'food' },
  
  // Academic-related suggestions
  { text: 'Tutoring for calculus', type: 'academic' },
  { text: 'CS study groups this week', type: 'academic' },
  { text: 'Physics help sessions', type: 'academic' },
  { text: 'Writing center hours', type: 'academic' },
  { text: 'Lab hours for engineering', type: 'academic' },
  { text: 'Review sessions for midterms', type: 'academic' },
  
  // Career-related suggestions
  { text: 'Resume workshops this month', type: 'career' },
  { text: 'Tech company recruiting events', type: 'career' },
  { text: 'Internship fair', type: 'career' },
  { text: 'Mock interviews', type: 'career' },
  { text: 'Networking events for business majors', type: 'career' },
  
  // Social events
  { text: 'Game night with free food', type: 'social' },
  { text: 'Movie screening on campus', type: 'social' },
  { text: 'Club fair this semester', type: 'social' },
  { text: 'Cultural events this weekend', type: 'social' },
  
  // Commuter-specific
  { text: 'Best places to rest between classes', type: 'query' },
  { text: 'Commuter lounge hours', type: 'location' },
  { text: 'Parking availability on campus', type: 'query' },
  { text: 'Events during common hour', type: 'query' },
  { text: 'Commuter student meetups', type: 'social' },
  
  // Locations
  { text: 'Campus Center events', type: 'location' },
  { text: 'Warren Street Village', type: 'location' },
  { text: 'Engineering building events', type: 'location' },
  { text: 'Tiernan Hall', type: 'location' },
  { text: 'Faculty dining room', type: 'location' },
  
  // Natural questions
  { text: 'Where can I study late at night?', type: 'query' },
  { text: 'When is the next free food event?', type: 'query' },
  { text: 'How do I join student clubs?', type: 'query' },
  { text: 'Are there any events for commuters today?', type: 'query' },
  { text: 'Where can I print on campus?', type: 'query' }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const persona = searchParams.get('persona') || 'commuter';

  console.log("Suggestions API called with query:", query);
  console.log("Persona:", persona);

  try {
    // Always start with fallback suggestions
    let filteredSuggestions = fallbackSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query)
    );
    
    // If we have at least 5 good suggestions from fallback, use those
    if (filteredSuggestions.length >= 5) {
      console.log("Using fallback suggestions");
      return NextResponse.json(filteredSuggestions.slice(0, 5));
    }
    
    // Otherwise, try to generate dynamic suggestions from real event data
    let dynamicSuggestions = [];
    
    // Only try to fetch from API if query has some content
    if (query.length > 0) {
      try {
        console.log("Fetching dynamic suggestions from API");
        // Fetch events that match the query
        const matchingEvents = await fetchNJITEvents(query);
        
        // Extract unique organizations, event titles, and locations for suggestions
        const orgSet = new Set();
        const titleSet = new Set();
        const locationSet = new Set();
        
        matchingEvents.forEach(event => {
          // Add organization-based suggestions
          if (event.organizerName && !orgSet.has(event.organizerName)) {
            orgSet.add(event.organizerName);
            dynamicSuggestions.push({
              text: `Events by ${event.organizerName}`,
              type: event.category
            });
          }
          
          // Add title-based suggestions (if title is not too long)
          if (event.title && event.title.length < 40 && !titleSet.has(event.title)) {
            titleSet.add(event.title);
            dynamicSuggestions.push({
              text: event.title,
              type: event.category
            });
          }
          
          // Add location-based suggestions
          if (event.location && !locationSet.has(event.location)) {
            locationSet.add(event.location);
            dynamicSuggestions.push({
              text: `Events at ${event.location}`,
              type: 'location'
            });
          }
        });
        
        console.log("Generated", dynamicSuggestions.length, "dynamic suggestions");
      } catch (error) {
        console.error("Error generating dynamic suggestions:", error);
        // Continue with fallback suggestions if API fails
      }
    }
    
    // Combine dynamic and static suggestions
    let allSuggestions = [...dynamicSuggestions, ...filteredSuggestions];
    
    // Filter suggestions based on query
    let filteredAllSuggestions = allSuggestions.filter(suggestion => 
      suggestion.text.toLowerCase().includes(query)
    );
    
    // Prioritize suggestions based on persona
    if (persona === 'commuter') {
      // Boost commuter-relevant suggestions
      const commuter_keywords = ['commuter', 'parking', 'between classes', 'during day', 'common hour'];
      
      filteredAllSuggestions.sort((a, b) => {
        const aIsCommuterRelevant = commuter_keywords.some(keyword => a.text.toLowerCase().includes(keyword));
        const bIsCommuterRelevant = commuter_keywords.some(keyword => b.text.toLowerCase().includes(keyword));
        
        if (aIsCommuterRelevant && !bIsCommuterRelevant) return -1;
        if (!aIsCommuterRelevant && bIsCommuterRelevant) return 1;
        return 0;
      });
    }
    
    // Ensure no duplicates and limit to 5 suggestions
    const uniqueSuggestions = [];
    const seenTexts = new Set();
    
    for (const suggestion of filteredAllSuggestions) {
      if (!seenTexts.has(suggestion.text.toLowerCase())) {
        seenTexts.add(suggestion.text.toLowerCase());
        uniqueSuggestions.push(suggestion);
        
        if (uniqueSuggestions.length >= 5) break;
      }
    }
    
    console.log("Returning", uniqueSuggestions.length, "suggestions");
    return NextResponse.json(uniqueSuggestions);
  } catch (error) {
    console.error('Error in suggest API:', error);
    
    // Return filtered fallback suggestions if there's an error
    const filteredSuggestions = fallbackSuggestions
      .filter(suggestion => suggestion.text.toLowerCase().includes(query))
      .slice(0, 5);
    
    console.log("Error occurred, returning fallback suggestions");
    return NextResponse.json(filteredSuggestions);
  }
}