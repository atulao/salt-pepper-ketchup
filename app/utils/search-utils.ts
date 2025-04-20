import { Event } from '../types/event';

/**
 * Event record with enhanced search capabilities
 */
export interface SearchableEvent extends Event {
  // Derived fields for search
  search_blob?: string;
  start_date?: string;
  end_date?: string;
}

/**
 * Process events to add derived search fields
 */
export function processEvents(events: Event[]): SearchableEvent[] {
  return events.map(event => {
    // Extract date strings for calendar grouping
    const startDate = new Date(event.date + ' ' + event.time);
    const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000); // Assume 2 hours if no end time
    
    // Create search blob for efficient filtering
    const searchTerms = [];
    // Add category
    if (event.category) searchTerms.push(event.category);
    
    // Add food status
    if (event.hasFood) searchTerms.push('free food');
    
    // Add advanced property keywords
    if (event.isNetworking) searchTerms.push('networking');
    if (event.isWorkshop) searchTerms.push('workshop skillbuild');
    if (event.isService) searchTerms.push('service volunteering');
    
    if (event.isHealthWellness) searchTerms.push('health wellness');
    if (event.isArtsCulture) searchTerms.push('arts culture');
    if (event.isSportsRec) searchTerms.push('sports recreation');
    if (event.isFaithSpirituality) searchTerms.push('faith spirituality');
    
    if (event.hasSwag) searchTerms.push('free swag giveaways');
    
    if (event.format) searchTerms.push(event.format);
    if (event.requiresRSVP) searchTerms.push('requires rsvp');
    
    if (event.timeOfDay) searchTerms.push(event.timeOfDay);
    
    const search_blob = [
      event.title,
      event.organizerName,
      event.location,
      event.description,
      ...searchTerms
    ].join(' ').toLowerCase();
    
    return {
      ...event,
      search_blob,
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0]
    };
  });
}

/**
 * Score an event for relevance to the search query
 */
export function scoreEvent(event: SearchableEvent, query: string): number {
  if (!query.trim()) return 0;
  
  const term = query.toLowerCase();
  const titleHits = countOccurrences(event.title.toLowerCase(), term) * 3;
  const organizerHits = countOccurrences(event.organizerName.toLowerCase(), term) * 2;
  const descriptionHits = countOccurrences(event.description.toLowerCase(), term);
  const locationHits = countOccurrences(event.location.toLowerCase(), term) * 1.5;
  const categoryHits = event.category && event.category.toLowerCase().includes(term) ? 2 : 0;
  
  // Score boosts for advanced properties matching the search term
  let advancedBoost = 0;
  
  // Purpose boosts
  if (term.includes('network') && event.isNetworking) advancedBoost += 3;
  if (term.includes('workshop') && event.isWorkshop) advancedBoost += 3;
  if (term.includes('service') && event.isService) advancedBoost += 3;
  
  // Theme boosts
  if (term.includes('health') && event.isHealthWellness) advancedBoost += 3;
  if (term.includes('art') && event.isArtsCulture) advancedBoost += 3;
  if (term.includes('sport') && event.isSportsRec) advancedBoost += 3;
  if (term.includes('faith') && event.isFaithSpirituality) advancedBoost += 3;
  
  // Perks boosts
  if (term.includes('food') && event.hasFood) advancedBoost += 3;
  if (term.includes('swag') && event.hasSwag) advancedBoost += 2;
  
  // Format boosts
  if (term.includes('in-person') && event.format === 'in-person') advancedBoost += 2;
  if (term.includes('virtual') && event.format === 'virtual') advancedBoost += 2;
  if (term.includes('rsvp') && event.requiresRSVP) advancedBoost += 2;
  
  // Time of day boosts
  if (term.includes('morning') && event.timeOfDay === 'morning') advancedBoost += 2;
  if (term.includes('afternoon') && event.timeOfDay === 'afternoon') advancedBoost += 2;
  if (term.includes('evening') && event.timeOfDay === 'evening') advancedBoost += 2;
  
  return titleHits + organizerHits + descriptionHits + locationHits + categoryHits + advancedBoost;
}

/**
 * Helper to count occurrences of a term in text
 */
function countOccurrences(text: string, term: string): number {
  const safeRegex = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // Escape regex special chars
  return (text.match(new RegExp(safeRegex, 'gi')) || []).length;
}

/**
 * Main search function to filter and sort events by relevance
 */
export function searchEvents(events: SearchableEvent[], query: string): SearchableEvent[] {
  const term = query.toLowerCase().trim();
  if (!term) return events;
  
  // Filter events that match the query
  const matchingEvents = events.filter(event => 
    event.search_blob?.includes(term)
  );
  
  // Score and sort by relevance, then by date
  return matchingEvents.sort((a, b) => {
    const scoreA = scoreEvent(a, term);
    const scoreB = scoreEvent(b, term);
    
    if (scoreB !== scoreA) return scoreB - scoreA;
    
    // If scores are the same, sort by date
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA.getTime() - dateB.getTime();
  });
}

/**
 * Highlight matching text in search results
 */
export function highlightText(text: string, term: string): string {
  if (!term.trim()) return text;
  
  // Escape special regex characters in the search term
  const safeRegex = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeRegex})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Common NJIT-specific term corrections
 */
export const COMMON_CORRECTIONS: Record<string, string> = {
  'lib': 'library',
  'cc': 'campus center',
  'wec': 'wellness and events center',
  'gym': 'wellness and events center',
  'ccs': 'campus center',
  'comp sci': 'computer science',
  'cs': 'computer science',
  'gitc': 'gitc building',
  'cad': 'campbell hall',
  'ckb': 'kupfrian hall',
  'kupfrian': 'kupfrian hall',
  'tiernan': 'tiernan hall',
  'fenster': 'fenster hall',
  'mic': 'microelectronics center',
  'culm': 'cullimore hall',
  'necc': 'new education center campus'
};

/**
 * Suggest corrections for common misspellings
 */
export function suggestCorrection(query: string): string | null {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return null;
  
  // Check for exact matches in our correction map
  if (COMMON_CORRECTIONS[lowerQuery]) {
    return COMMON_CORRECTIONS[lowerQuery];
  }
  
  // Check for partial matches (for multi-word queries)
  for (const [misspelling, correction] of Object.entries(COMMON_CORRECTIONS)) {
    if (lowerQuery.includes(misspelling)) {
      return lowerQuery.replace(misspelling, correction);
    }
  }
  
  return null;
}

/**
 * Utility functions for search related functionality
 */

/**
 * Extracts searchable terms from an event for fuzzy matching
 */
export const getSearchTermsFromEvent = (event: Event): string[] => {
  const searchTerms: string[] = [];
  
  // Add basic event information
  searchTerms.push(event.title);
  searchTerms.push(event.description);
  searchTerms.push(event.organizerName);
  searchTerms.push(event.location);
  searchTerms.push(event.date);
  searchTerms.push(event.time);
  
  // Add event tags
  searchTerms.push(...event.tags);
  
  // Add event category
  searchTerms.push(event.category);
  
  // Add event properties
  if (event.hasFood) searchTerms.push('food');
  if (event.foodType) searchTerms.push(event.foodType);
  
  // Add advanced properties
  if (event.isNetworking) searchTerms.push('networking mixer');
  if (event.isWorkshop) searchTerms.push('workshop training skill building');
  if (event.isService) searchTerms.push('volunteer service outreach');
  
  if (event.isHealthWellness) searchTerms.push('health wellness fitness');
  if (event.isArtsCulture) searchTerms.push('arts culture music performance');
  if (event.isSportsRec) searchTerms.push('sports recreation athletics');
  if (event.isFaithSpirituality) searchTerms.push('faith spirituality religion');
  
  if (event.hasSwag) searchTerms.push('swag merch free stuff');
  
  if (event.requiresRSVP) searchTerms.push('rsvp register tickets');
  
  // Return a flat array of search terms, removing duplicates
  return [...new Set(searchTerms)];
};

/**
 * Calculates a boosted relevance score for an event based on search terms
 */
export const calculateSearchRelevance = (
  event: Event, 
  searchQuery: string, 
  baseScore: number = 70
): number => {
  if (!searchQuery.trim()) {
    return baseScore; // Return base score if no search query
  }
  
  // Normalize search terms
  const searchTerms = searchQuery.toLowerCase().split(/\s+/);
  
  // Start with base score
  let relevanceScore = baseScore;
  
  // Title match provides strong boost
  if (searchTerms.some(term => event.title.toLowerCase().includes(term))) {
    relevanceScore += 20;
  }
  
  // Description match provides moderate boost
  if (searchTerms.some(term => event.description.toLowerCase().includes(term))) {
    relevanceScore += 10;
  }
  
  // Organization name match provides good boost
  if (searchTerms.some(term => event.organizerName.toLowerCase().includes(term))) {
    relevanceScore += 15;
  }
  
  // Location match provides slight boost
  if (searchTerms.some(term => event.location.toLowerCase().includes(term))) {
    relevanceScore += 5;
  }
  
  // Advanced criteria matching
  let advancedBoost = 0;
  
  for (const term of searchTerms) {
    // Purpose matching
    if (term.includes('network') && event.isNetworking) advancedBoost += 3;
    if (term.includes('workshop') && event.isWorkshop) advancedBoost += 3;
    if (term.includes('service') && event.isService) advancedBoost += 3;
    
    // Theme matching
    if (term.includes('health') && event.isHealthWellness) advancedBoost += 3;
    if (term.includes('art') && event.isArtsCulture) advancedBoost += 3;
    if (term.includes('sport') && event.isSportsRec) advancedBoost += 3;
    if (term.includes('faith') && event.isFaithSpirituality) advancedBoost += 3;
    
    // Perks matching
    if (term.includes('food') && event.hasFood) advancedBoost += 3;
    if (term.includes('swag') && event.hasSwag) advancedBoost += 2;
    
    // Format matching
    if (term.includes('in-person') && event.format === 'in-person') advancedBoost += 2;
    if (term.includes('virtual') && event.format === 'virtual') advancedBoost += 2;
    if (term.includes('rsvp') && event.requiresRSVP) advancedBoost += 2;
    
    // Time of day matching
    if (term.includes('morning') && event.timeOfDay === 'morning') advancedBoost += 2;
    if (term.includes('afternoon') && event.timeOfDay === 'afternoon') advancedBoost += 2;
    if (term.includes('evening') && event.timeOfDay === 'evening') advancedBoost += 2;
  }
  
  // Apply advanced criteria boost
  relevanceScore += advancedBoost;
  
  // Tag matching provides moderate boost (check against all event tags)
  const tagMatch = event.tags.some(tag => 
    searchTerms.some(term => tag.toLowerCase().includes(term))
  );
  
  if (tagMatch) {
    relevanceScore += 10;
  }
  
  // Cap at 100
  return Math.min(100, relevanceScore);
}; 