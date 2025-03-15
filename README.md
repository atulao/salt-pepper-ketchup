# Salt-Pepper-Ketchup

An AI-powered campus engagement platform designed to keep commuter students connected and active on campus.

## Project Overview

Salt-Pepper-Ketchup transforms the typical campus event portal into a dynamic, AI-driven assistant that not only informs students of what's happening on campus but also creates a personalized experience that encourages them to participate actively—especially targeting the needs of commuter students.

### Key Features

- **Modern, Conversational Interface:** A sleek, user-friendly UI with a Google-like search bar that lets students ask natural language questions (e.g., "Where can I get free pizza today?" or "When is the next tutoring session for my major?").
- **Personalized Recommendations:** The platform tailors event and resource suggestions based on the student's interests, major, and campus habits.
- **Event Aggregation:** Gather campus events (free food, tutoring sessions, career fairs, etc.) from various sources.
- **Dynamic Filtering:** Natural language queries that filter and rank events in real time.
- **Commuter-Focused:** Special features and filters for commuter students to make the most of their time on campus.

## Technical Stack

- **Frontend:** Next.js with TypeScript and Tailwind CSS
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

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```
# Create a .env.local file with:
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. **Run the development server:**
```bash
npm run dev
```

4. **Open your browser:** Navigate to [http://localhost:3000](http://localhost:3000)

## Features in Development

- [ ] User authentication and profiles
- [ ] Event scraping from university sources
- [ ] Personalized event recommendations
- [ ] Real-time notifications
- [ ] Calendar integration
- [ ] Mobile app version

## Monetization Strategies

- Career coaching upsells
- Local business partnerships
- Premium features for organizations
- Data analytics for university departments

## Contributing

Interested in contributing? Great! Please reach out to the project maintainers.

## License

This project is proprietary and confidential.