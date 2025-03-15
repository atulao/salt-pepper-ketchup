import { NextResponse } from 'next/server';

// Sample data - replace with your actual data fetching logic
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
    category: 'academic',
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
    category: 'career',
    tags: ['networking', 'job opportunities', 'professional development'],
    relevanceScore: 87
  },
  {
    id: '3',
    title: 'Engineering Seminar with Refreshments',
    description: 'Learn about the latest advances in civil engineering with guest speakers from leading firms. Light refreshments will be served after the seminar.',
    location: 'Tiernan Hall 108',
    date: 'March 22, 2025',
    time: '3:00 PM',
    hasFood: true,
    foodType: 'Light Refreshments',
    organizerName: 'Civil Engineering Department',
    category: 'academic',
    tags: ['engineering', 'professional development', 'guest speaker'],
    relevanceScore: 78
  },
  {
    id: '4',
    title: 'Cultural Club Potluck Dinner',
    description: 'Experience foods from around the world at our annual potluck dinner. Everyone is welcome to attend and share dishes from their culture!',
    location: 'Campus Center Atrium',
    date: 'March 28, 2025',
    time: '6:00 PM',
    hasFood: true,
    foodType: 'International Cuisine',
    organizerName: 'Global Student Association',
    category: 'social',
    tags: ['cultural', 'international', 'community'],
    relevanceScore: 82
  },
  {
    id: '5',
    title: 'Breakfast with the Dean',
    description: 'Join the Dean of Students for a casual breakfast conversation about campus life and share your ideas for improvements.',
    location: 'Faculty Dining Room',
    date: 'March 21, 2025',
    time: '8:30 AM',
    hasFood: true,
    foodType: 'Breakfast',
    organizerName: 'Office of the Dean',
    category: 'social',
    tags: ['networking', 'leadership', 'campus improvement'],
    relevanceScore: 75
  },
  {
    id: '6',
    title: 'Computer Science Tutoring Session',
    description: 'Get help with programming assignments, algorithms, and data structures. Our experienced tutors can assist with Java, Python, C++, and more.',
    location: 'GITC 3700',
    date: 'March 19, 2025',
    time: '4:00 PM',
    hasFood: false,
    organizerName: 'Computer Science Department',
    category: 'academic',
    tags: ['tutoring', 'programming', 'computer science', 'study help'],
    relevanceScore: 88
  },
  {
    id: '7',
    title: 'Resume Workshop for Engineering Students',
    description: 'Learn how to craft a standout resume for engineering positions. Includes resume reviews by industry professionals.',
    location: 'Fenster Hall 220',
    date: 'March 23, 2025',
    time: '2:00 PM',
    hasFood: false,
    organizerName: 'Career Development Services',
    category: 'career',
    tags: ['resume', 'job search', 'engineering', 'professional development'],
    relevanceScore: 90
  },
  {
    id: '8',
    title: 'Game Night with Snacks',
    description: 'Take a break from studying and join us for board games, video games, and plenty of snacks!',
    location: 'Campus Center Game Room',
    date: 'March 22, 2025',
    time: '7:00 PM',
    hasFood: true,
    foodType: 'Snacks & Soda',
    organizerName: 'Student Activities Council',
    category: 'social',
    tags: ['games', 'recreation', 'stress relief'],
    relevanceScore: 70
  },
  {
    id: '9',
    title: 'MBA Information Session with Dinner',
    description: 'Learn about NJIT\'s MBA program options, application process, and speak with current students. Dinner will be provided.',
    location: 'Tuchman Hall Conference Room',
    date: 'March 26, 2025',
    time: '6:00 PM',
    hasFood: true,
    foodType: 'Catered Dinner',
    organizerName: 'Martin Tuchman School of Management',
    category: 'academic',
    tags: ['MBA', 'graduate school', 'business', 'information session'],
    relevanceScore: 65
  },
  {
    id: '10',
    title: 'Coffee & Conversations: Student Commuter Edition',
    description: 'A special networking event designed for commuter students. Connect with other commuters, share tips, and enjoy complimentary coffee and pastries.',
    location: 'Campus Center 2nd Floor Lounge',
    date: 'March 18, 2025',
    time: '11:00 AM',
    hasFood: true,
    foodType: 'Coffee & Pastries',
    organizerName: 'Commuter Student Association',
    category: 'social',
    tags: ['commuter', 'networking', 'community building'],
    relevanceScore: 98
  }
];

export async function GET(request: Request) {
  // Get the search query and filters from URL params
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';
  const filters = searchParams.get('filters')?.split(',') || [];
  const persona = searchParams.get('persona') || 'commuter';

  // Start with all events
  let filteredEvents = [...mockEvents];

  // Process natural language query to extract relevant keywords and intent
  if (query) {
    // Search in title, description, location, and food type
    filteredEvents = filteredEvents.filter(event => {
      const matchesBasicSearch = 
        event.title.toLowerCase().includes(query) ||
        event.description.toLowerCase().includes(query) ||
        event.location.toLowerCase().includes(query) ||
        (event.foodType && event.foodType.toLowerCase().includes(query)) ||
        event.tags.some(tag => tag.toLowerCase().includes(query));
      
      // Additional natural language processing
      // Check for time-related queries
      const isTimeQuery = 
        query.includes('today') || 
        query.includes('this week') || 
        query.includes('weekend') ||
        query.includes('tomorrow');
      
      // Check for food-related queries
      const isFoodQuery = 
        query.includes('food') || 
        query.includes('pizza') || 
        query.includes('free') || 
        query.includes('lunch') ||
        query.includes('breakfast') ||
        query.includes('dinner') ||
        query.includes('snack');
      
      // Check for academic queries
      const isAcademicQuery =
        query.includes('tutor') ||
        query.includes('class') ||
        query.includes('study') ||
        query.includes('academic') ||
        query.includes('course');
      
      // Check for career-related queries
      const isCareerQuery =
        query.includes('career') ||
        query.includes('job') ||
        query.includes('resume') ||
        query.includes('networking') ||
        query.includes('professional');
      
      // Match based on intent
      const matchesIntent =
        (isTimeQuery && new Date(event.date).getDate() === new Date().getDate()) ||
        (isFoodQuery && event.hasFood) ||
        (isAcademicQuery && event.category === 'academic') ||
        (isCareerQuery && event.category === 'career');
      
      return matchesBasicSearch || matchesIntent;
    });
  }

  // Apply category filters
  if (filters.length > 0) {
    filteredEvents = filteredEvents.filter(event => {
      // Check category filters
      if (filters.includes(event.category)) return true;
      
      // Check for 'food' filter
      if (filters.includes('food') && event.hasFood) return true;
      
      // Check for 'today' filter
      if (filters.includes('today') && new Date(event.date).getDate() === new Date().getDate()) return true;
      
      return false;
    });
  }

  // Adjust relevance scores based on persona
  if (persona === 'commuter') {
    // Boost events with food, events during daytime, and events specifically for commuters
    filteredEvents = filteredEvents.map(event => {
      let adjustedScore = event.relevanceScore || 50;
      
      // Boost events with food
      if (event.hasFood) adjustedScore += 10;
      
      // Boost daytime events (assuming commuters prefer events during the day)
      const eventHour = parseInt(event.time.split(':')[0]);
      if (eventHour >= 9 && eventHour <= 16) adjustedScore += 8;
      
      // Boost events for commuters
      if (event.tags.includes('commuter')) adjustedScore += 15;
      
      return {
        ...event,
        relevanceScore: Math.min(100, adjustedScore)
      };
    });
  }

  // Sort by relevance score
  filteredEvents.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

  // Simulate API latency
  await new Promise(resolve => setTimeout(resolve, 300));

  return NextResponse.json(filteredEvents);