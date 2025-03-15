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
  - **Resident Mode:** Provides a balanced view of all campus events

## Technical Stack

- **Frontend:** Next.js 15+ with TypeScript and Tailwind CSS 4
- **UI Components:** Lucide React for icons and visual elements
- **API:** RESTful endpoints for search, suggestions, and user preferences
- **Natural Language Processing:** Custom NLP utilities for query intent detection
- **Data Storage:** Coming soon - MongoDB or PostgreSQL

## Project Structure

```
app/
├── api/
│   ├── search-events/
│   │   └── route.ts
│   └── suggest/
│       └── route.ts
├── components/
│   └── search/
│       └── CampusEngagementHub.tsx
├── utils/
│   └── nlp.ts
├── globals.css
├── layout.tsx
└── page.tsx
```

## Getting Started

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/salt-pepper-ketchup.git
cd salt-pepper-ketchup
```

2. **Install dependencies:**
```bash
npm install
npm install lucide-react  # Required for icons
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

## Testing

To test the application:

```bash
# Run the application in development mode
npm run dev

# Try these test scenarios:
# 1. Toggle between Commuter and Resident modes
# 2. Search for "free food today" and observe results
# 3. Use category filters to narrow down results
# 4. Use voice search (if your browser supports it)
```

## Features in Development

- [ ] **User Authentication and Profiles**
  - NJIT student login integration
  - Preference saving
  - Event history

- [ ] **Event Scraping from University Sources**
  - Automated scraping of NJIT event calendar
  - Integration with department and club event feeds
  - Structured data extraction and normalization

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

## Monetization Strategies

- **Career Coaching Upsells:** Premium career services for students
- **Local Business Partnerships:** Sponsored content from businesses near campus
- **Premium Features for Organizations:** Enhanced tools for event organizers
- **Data Analytics for University Departments:** Insights on student engagement

## Contributing

Interested in contributing? Great! Please reach out to the project maintainers or:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is proprietary and confidential.