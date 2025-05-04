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
- **Authentication System:** Secure user authentication with NextAuth.js supporting multiple login methods.
- **Onboarding Flow:** Structured onboarding process to capture user preferences and academic information.
- **Progress Saving:** Ability to save progress during onboarding for later completion.

## Technical Stack

- **Frontend:** Next.js 15+ with React 19 and TypeScript
- **Styling:** Tailwind CSS 4 with dark mode support
- **UI Components:** Lucide React for icons and visual elements
- **Maps Integration:** MapBox for static maps of campus buildings
- **API:** RESTful endpoints for search, suggestions, and user preferences
- **Theming:** CSS variables and custom React hooks for theme management
- **Authentication:** NextAuth.js with multiple authentication providers
- **Database:** Prisma ORM with support for multiple database backends
- **State Management:** Zustand for client-side state management

## Project Architecture

The project follows a modular component architecture:

```
app/
├── api/                       # API routes for server-side functionality
│   ├── auth/                  # Authentication API routes
│   │   └── [...nextauth]/     # NextAuth.js API routes
│   ├── onboarding/            # Onboarding-related API endpoints
│   └── search-events/         # Event search API endpoints
├── components/                # UI Components
│   ├── auth/                  # Authentication components
│   ├── client-wrappers/       # Client-side component wrappers
│   ├── dashboard/             # Dashboard components
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
│   ├── onboarding/            # Onboarding process components
│   │   ├── BagelPicker.tsx    # Major selection component (Step 1)
│   │   ├── SubstancePicker.tsx # Interests selection component (Step 2)
│   │   ├── OrderSummary.tsx   # Summary and confirmation component (Step 3)
│   │   └── SaveProgress.tsx   # Component to save onboarding progress
│   └── search/                # Search-related components
│       ├── CampusEngagementHub.tsx # Main container component
│       ├── SearchInput.tsx    # Search input field with voice capability
│       ├── SuggestionsList.tsx # Search suggestions display
│       ├── FilterPanel.tsx    # Category and feature filters
│       ├── PersonaToggle.tsx  # Commuter/Resident mode toggle
│       └── ResultsList.tsx    # Event results display
├── auth/                      # Authentication pages
│   ├── login/                 # Login page
│   └── register/              # Registration page
├── buildings/                 # Building-related pages
├── config/                    # Configuration files (API keys, etc.)
├── contexts/                  # React context providers
├── dashboard/                 # Dashboard pages
├── event/                     # Event-related pages
├── hooks/                     # Custom React hooks
├── onboarding/                # Onboarding flow pages
│   ├── step1/                 # Major selection page
│   ├── step2/                 # Interests selection page
│   └── step3/                 # Summary and confirmation page
├── store/                     # State management (Zustand)
├── types/                     # TypeScript type definitions
└── utils/                     # Utility functions
```

## Authentication System

The application uses NextAuth.js to provide a secure authentication system:

- **Multiple Providers:** Support for credentials, Google, and LinkedIn authentication
- **Protected Routes:** Middleware-based route protection for authenticated areas
- **User Sessions:** Persistent user sessions with JWT tokens
- **Profile Management:** User profile data synced with authentication details
- **Development Mode:** Special development mode toggles to bypass authentication during development

## Onboarding Process

The application includes a three-step onboarding process:

1. **Step 1 - Major Selection (BagelPicker):** Users select their academic major from a comprehensive list, organized by college.
2. **Step 2 - Interests Selection (SubstancePicker):** Users select their interests from categories including events, clubs, and goals.
3. **Step 3 - Summary and Confirmation (OrderSummary):** Users review their selections and confirm to complete onboarding.

The onboarding process includes:
- **Progress Tracking:** Sequential steps with completion tracking
- **Data Persistence:** User selections saved in the store
- **Progress Saving:** Ability to save progress and resume later
- **Navigation Controls:** Back and continue buttons with validation

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

### Dashboard and User Experience

- **DashboardTour:** Interactive tour of the dashboard for new users
- **RecommendationsPanel:** Personalized event and resource recommendations
- **UserProfile:** User profile management with preferences
- **NotificationsPanel:** System and event notifications

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
Create a `.env.local` file in the root directory with the following content:
```
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# Database
DATABASE_URL="file:./dev.db" # For SQLite

# API Keys - Get your own keys from Google Maps and MapBox
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
NEXT_PUBLIC_MAPBOX_API_KEY=your_mapbox_api_key_here

# Social Auth Providers (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
```

Important notes about environment variables:
- Never commit API keys and secrets to the repository
- For social authentication, get keys from respective provider developer consoles

4. **Set up the database:**
```bash
npx prisma migrate dev
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

## WSL Development

When developing in Windows Subsystem for Linux (WSL), use the provided helper scripts:

```bash
# Use the WSL development script
./wsl-dev.sh

# OR if you encounter issues
node run-next-dev.js
```

## Authentication Development

For development purposes, the authentication system can be bypassed:

1. In middleware.ts, the `shouldCheckAuth` parameter controls authentication checks
2. In development mode, you can add `?auth_check=true` to URLs to explicitly enable auth
3. The onboarding layout includes a toggle to bypass authentication

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

## Security & Best Practices

1. **API Keys**: All API keys are stored in environment variables, never in the code.
   - Use the `.env.local` file for local development
   - Set environment variables in your hosting platform for production
   - NEVER commit API keys to the repository

2. **Authentication Security:**
   - JWT tokens are used for session management
   - Passwords are hashed using bcrypt (when using credentials provider)
   - Route protection with Next.js middleware
   - CSRF protection built into NextAuth.js

3. **Error Handling**: The application includes robust error handling for API calls and user inputs.

4. **Accessibility**: Components are designed with accessibility in mind, including keyboard navigation and screen reader support.

## Future Development

- [ ] **Enhanced User Profiles**
  - Profile completeness indicators
  - Achievement badges
  - Social connections

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