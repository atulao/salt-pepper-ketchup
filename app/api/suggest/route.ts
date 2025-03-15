import { NextResponse } from 'next/server';

// Enhanced suggestions data for the campus engagement platform
const suggestions = [
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

  // Filter suggestions based on query
  let filteredSuggestions = suggestions.filter(suggestion => 
    suggestion.text.toLowerCase().includes(query)
  );
  
  // Prioritize suggestions based on persona
  if (persona === 'commuter') {
    // Boost commuter-relevant suggestions
    const commuter_keywords = ['commuter', 'parking', 'between classes', 'during day', 'common hour'];
    
    filteredSuggestions.sort((a, b) => {
      const aIsCommuterRelevant = commuter_keywords.some(keyword => a.text.toLowerCase().includes(keyword));
      const bIsCommuterRelevant = commuter_keywords.some(keyword => b.text.toLowerCase().includes(keyword));
      
      if (aIsCommuterRelevant && !bIsCommuterRelevant) return -1;
      if (!aIsCommuterRelevant && bIsCommuterRelevant) return 1;
      return 0;
    });
  }
  
  // Limit to 5 suggestions
  filteredSuggestions = filteredSuggestions.slice(0, 5);

  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 150));

  return NextResponse.json(filteredSuggestions);
}