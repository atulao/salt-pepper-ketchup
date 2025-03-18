# Salt-Pepper-Ketchup

An AI-powered campus engagement platform designed to keep commuter students connected and active on campus.

## Project Overview

Salt-Pepper-Ketchup transforms the typical campus event portal into a dynamic, AI-driven assistant that not only informs students of what's happening on campus but also creates a personalized experience that encourages them to participate actively—especially targeting the needs of commuter students.

### Key Features

- **Modern, Conversational Interface:** A sleek, user-friendly UI with a Google-like search bar that lets students ask natural language questions (e.g., "Where can I get free pizza today?" or "When is the next tutoring session for my major?").
- **Personalized Recommendations:** The platform tailors event and resource suggestions based on the student's interests, major, and campus habits.
- **Smart Filtering:** Dynamic category filters for free food, academic events, social gatherings, and career opportunities.
- **Voice Search Capability:** Students can use voice commands to find events and resources.
- **Commuter/Resident Modes:** Toggle between different modes to optimize recommendations based on your campus lifestyle:
  - **Commuter Mode:** Prioritizes daytime events, events with food, and events specifically for commuters
  - **Resident Mode:** Provides a focused view of residence hall events and activities

## Technical Stack

- **Frontend:** Next.js 15+ with TypeScript and Tailwind CSS 4
- **UI Components:** Lucide React for icons and visual elements
- **API:** RESTful endpoints for search, suggestions, and user preferences
- **Natural Language Processing:** Custom NLP utilities for query intent detection
- **Live Data Integration:** Integration with NJIT Campus Labs API for real event data

## Project Architecture

The project follows a modular component architecture:

```
app/
├── api/                       # API routes for server-side functionality 
│   ├── building-location/     # Building location geocoding API
│   ├── proxy/                 # Proxy for NJIT Campus Labs API
│   ├── search-events/         # Search functionality API
│   └── suggest/               # Suggestions API
├── components/                # UI Components
│   ├── client-wrappers/       # Client-side component wrappers
│   ├── events/                # Event-related components
│   │   ├── EventCard.tsx       # Individual event display card
│   │   ├── EventDescription.tsx # Expandable event description
│   │   └── EventActions.tsx    # Event action buttons (favorite, share, etc.)
│   ├── map/                   # Map-related components
│   │   ├── CampusMap.tsx       # Campus map component
│   │   └── CampusMapPreview.tsx # Small map preview for events
│   └── search/                # Search-related components
│       ├── CampusEngagementHub.tsx # Main container component
│       ├── SearchInput.tsx     # Search input field with voice capability
│       ├── SuggestionsList.tsx # Search suggestions display
│       ├── FilterPanel.tsx     # Category and feature filters
│       ├── PersonaToggle.tsx   # Commuter/Resident mode toggle
│       └── ResultsList.tsx     # Event results display
├── hooks/                     # Custom React hooks
│   ├── useSearch.ts           # Search functionality hook
│   ├── useSuggestions.ts      # Suggestions management hook
│   ├── useEvents.ts           # Events fetching and filtering hook 
│   ├── usePersona.ts          # Persona state management hook
│   └── useFavorites.ts        # User favorites management hook
├── types/                     # TypeScript type definitions
│   ├── event.ts               # Event-related types
│   ├── suggestion.ts          # Suggestion-related types
│   └── filters.ts             # Filtering and categories types
└── utils/                     # Utility functions
    ├── data-fetcher.ts        # NJIT event data fetching utility
    └── nlp.ts                 # Natural language processing utilities
```

## Live Data Integration

The platform now integrates with real NJIT campus events data through the Campus Labs API:

- **Real-Time Events:** Fetches actual events from the NJIT event calendar
- **Intelligent Categorization:** Automatically categorizes events by type and detects food availability
- **Fallback Mechanism:** Gracefully falls back to mock data if the API is unavailable
- **Smart Filtering:** Sophisticated filtering system that works with both real and mock data

## Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/salt-pepper-ketchup.git
cd salt-pepper-ketchup
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```
# Create a .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

## Usage Examples

- **Find events with food:** Search for "free pizza" or click the "Free Food" filter
- **Academic events:** Search for "tutoring" or "study groups" or use the Academic filter
- **Events for commuters:** Toggle to Commuter mode to see events optimized for commuter students
- **Residence hall events:** Toggle to Resident mode to focus on dorm and residence life events
- **Voice search:** Click the microphone icon and speak your query (e.g., "Show me networking events with free food")
- **Save favorites:** Click the heart icon on any event to save it to your favorites

## Key Component Features

### CampusEngagementHub
- Main container component that orchestrates the entire search experience
- Manages state across child components
- Handles filtering and sorting logic

### SearchInput
- Provides text and voice input capabilities
- Real-time suggestions as you type
- Clear search functionality

### FilterPanel
- Dynamic category filters with count indicators
- Toggle-style filter activation
- Visual indicators for active filters

### PersonaToggle
- Switch between Commuter and Resident modes
- Visually distinct UI elements for each mode
- Persistent preference saved in localStorage

### EventCard
- Rich display of event information
- Expandable descriptions
- Interactive actions (favorite, add to calendar, share, directions)
- Automatic food detection and labeling

## Future Development

- [ ] **User Authentication and Profiles**
  - NJIT student login integration
  - Preference saving
  - Event history

- [ ] **Enhanced Event Data**
  - Adding more metadata to events
  - Image support for events
  - Rich text descriptions

- [ ] **Advanced AI Recommendations**
  - Machine learning model for personalized event suggestions
  - Calendar-aware recommendations based on student schedules
  - Academic major and interest-based filtering

- [ ] **Real-time Notifications**
  - Push notifications for upcoming events
  - Free food alerts
  - Last-minute event changes

- [ ] **Mobile App Version**
  - React Native implementation
  - Location-based awareness
  - Offline capability

## Contributing

Interested in contributing? Great! Please reach out to the project maintainers or:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.