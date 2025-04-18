# Salt-Pepper-Ketchup

An AI-powered campus engagement platform designed to keep commuter students connected and active on campus.

## Project Overview

Salt-Pepper-Ketchup transforms the typical campus event portal into a dynamic, AI-driven assistant that not only informs students of what's happening on campus but also creates a personalized experience that encourages them to participate actively—especially targeting the needs of commuter students.

### Key Features

- **Modern, Conversational Interface:** A sleek, user-friendly UI with a Google-like search bar that lets students ask natural language questions (e.g., "Where can I get free pizza today?" or "When is the next tutoring session for my major?").
- **Personalized Recommendations:** The platform tailors event and resource suggestions based on the student's interests, major, and campus habits.
- **Smart Filtering:** Dynamic category filters for free food, academic events, social gatherings, and career opportunities.
- **Voice Search Capability:** Students can use voice commands to find events and resources.
- **Commuter/Resident Modes:** Toggle between different modes to optimize recommendations based on your campus lifestyle.
- **Campus Building Directory:** Interactive map and building information to help students navigate the campus.
- **Dark Mode Support:** Fully responsive dark mode with seamless transitions and persistent user preference.

## Technical Stack

- **Frontend:** Next.js 15+ with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 with dark mode support
- **UI Components:** Lucide React for icons and visual elements
- **Maps Integration:** MapBox for static maps of campus buildings
- **API:** RESTful endpoints for search, suggestions, and user preferences
- **Theming:** CSS variables and custom React hooks for theme management

## Project Architecture

The project follows a modular component architecture:

```
app/
├── api/                       # API routes for server-side functionality
├── components/                # UI Components
│   ├── client-wrappers/       # Client-side component wrappers
│   ├── events/                # Event-related components
│   │   ├── EventCard.tsx      # Individual event display card
│   │   ├── EventDetailPage.tsx # Full event details page
│   │   ├── EventDescription.tsx # Expandable event description
│   │   └── EventActions.tsx   # Event action buttons (favorite, share, etc.)
│   ├── map/                   # Map-related components
│   │   ├── BuildingCard.tsx   # Building information card with map
│   │   ├── BuildingsDirectory.tsx # List of campus buildings
│   │   ├── CampusMap.tsx      # Campus map component
│   │   ├── FullCampusMap.tsx  # Full-screen campus map
│   │   └── campus-building-data.ts # Building coordinates and aliases
│   └── search/                # Search-related components
│       ├── CampusEngagementHub.tsx # Main container component
│       ├── SearchInput.tsx    # Search input field with voice capability
│       ├── SuggestionsList.tsx # Search suggestions display
│       ├── FilterPanel.tsx    # Category and feature filters
│       ├── PersonaToggle.tsx  # Commuter/Resident mode toggle
│       └── ResultsList.tsx    # Event results display
├── buildings/                 # Building-related pages
├── config/                    # Configuration files (API keys, etc.)
├── contexts/                  # React context providers
├── event/                     # Event-related pages
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
    ├── data-fetcher.ts        # Data fetching utilities
    ├── formatters.ts          # Text and date formatting utilities 
    └── theme-utils.ts         # Dark mode detection and theme management utilities
```

## Key Components

### Search Experience

- **CampusEngagementHub:** Main container component that orchestrates the entire search experience
- **SearchInput:** Provides text and voice input capabilities with real-time suggestions
- **FilterPanel:** Dynamic category filters with count indicators and toggle-style activation
- **PersonaToggle:** Switch between Commuter and Resident modes
- **ResultsList:** Displays search results with sorting options

### Event Experience

- **EventCard:** Rich display of event information with expandable descriptions
- **EventDetailPage:** Comprehensive view of event details including location, time, and description
- **EventActions:** Interactive action buttons for events (favorite, add to calendar, share, directions)

### Campus Navigation

- **BuildingCard:** Displays building information with a MapBox static map
- **BuildingsDirectory:** Comprehensive directory of campus buildings with search and filtering
- **CampusMap:** Interactive map of the campus with building markers
- **FullCampusMap:** Full-screen campus map for detailed navigation

### Theme Management

- **ThemeToggle:** Component for toggling between light and dark mode
- **theme-utils.ts:** Utility functions for theme management:
  - `useDarkMode()`: Custom React hook that detects dark mode changes using MutationObserver
  - `getThemeClasses()`: Helper function to apply the appropriate classes based on theme
  - `applyTheme()`: Function to directly manipulate theme classes on document elements

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
- **Campus navigation:** Explore the interactive campus map and building directory
- **Voice search:** Click the microphone icon and speak your query
- **Toggle dark mode:** Use the theme toggle in the top navigation to switch between light and dark mode

## Theme System

The application uses a comprehensive theming system to support both light and dark modes:

### CSS Variables

Theme colors are defined as CSS variables in `globals.css`, with separate sets for light and dark modes.
These variables control colors for backgrounds, text, buttons, cards, and other UI elements.

### Dark Mode Detection

Dark mode is managed through:
1. A client-side script in `layout.tsx` that detects saved preferences on initial load
2. The `ThemeToggle` component that allows users to switch between modes
3. The `useDarkMode` hook that provides real-time theme state to components

### Using Theme Utilities

Components can easily implement theme-aware styling:

```tsx
// Import the theme utilities
import { useDarkMode, getThemeClasses } from '../../utils/theme-utils';

// Inside your component
const MyComponent = () => {
  // Get the current theme state
  const isDarkMode = useDarkMode();
  
  return (
    <div className={getThemeClasses(
      isDarkMode,
      'bg-white text-gray-900', // Light mode classes
      'bg-gray-800 text-white'   // Dark mode classes
    )}>
      Component content
    </div>
  );
};
```

## Future Development

- [ ] **User Authentication and Profiles**
  - Campus student login integration
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

- [ ] **Theme Enhancements**
  - Additional theme options (high contrast, system-matched)
  - Per-component theme preferences
  - Automatic time-based theme switching

## Contributing

Interested in contributing? Great! Please reach out to the project maintainers or:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.