# Integration with Live NJIT Event Data

The Salt-Pepper-Ketchup app now integrates with real NJIT campus events data through the Campus Labs API. This document provides an overview of the implementation and how to use it.

## What's New

- **Live Data Integration**: The app now fetches real events from NJIT's Campus Labs API
- **Fallback Mechanism**: If the API is unavailable, the app gracefully falls back to mock data
- **Intelligent Event Processing**: The data fetcher intelligently categorizes events and detects food-related events
- **Dynamic Suggestions**: Search suggestions are now generated from real event data

## How It Works

1. The `data-fetcher.ts` utility handles communication with the NJIT API
2. Events are transformed from the API format to our app's format
3. The search API endpoint uses this data fetcher to get real events
4. Suggestions are generated dynamically based on actual event data

## API Integration Details

The app connects to the NJIT Campus Labs API at:
```
https://njit.campuslabs.com/engage/api/discovery/event/search
```

Key parameters used:
- `endsAfter`: Set to current date to only show upcoming events
- `orderByField=endsOn & orderByDirection=ascending`: Shows earliest events first
- `status=Approved`: Only includes approved events
- `take=100`: Limits results per request
- `query=`: Used for keyword-based searches

## Event Processing

The data fetcher performs several intelligent operations:
- **Category Detection**: Events are categorized as academic, social, career, food, or other
- **Food Detection**: Analyzes event descriptions to determine if food will be available
- **Commuter Relevance**: Identifies events specifically targeted to commuter students
- **Tag Extraction**: Pulls relevant tags from event categories and benefits

## Using the Live Data

No changes are needed to use the live data - the app will automatically fetch from the NJIT API when available. You can test different search queries to see real campus events.

## Future Enhancements

- Implement pagination for handling large numbers of events
- Add caching to improve performance and reduce API calls
- Develop more sophisticated natural language processing for search
- Add event details page with registration options