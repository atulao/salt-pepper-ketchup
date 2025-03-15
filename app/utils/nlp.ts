/**
 * Natural Language Processing utilities for the Salt-Pepper-Ketchup platform
 * This file contains functions to extract meaning from user queries
 */

interface QueryIntent {
    hasTimeIntent: boolean;
    hasFoodIntent: boolean;
    hasAcademicIntent: boolean;
    hasCareerIntent: boolean;
    hasSocialIntent: boolean;
    hasLocationIntent: boolean;
    extractedLocations: string[];
    extractedDates: string[];
    extractedFoodTypes: string[];
    keywords: string[];
    questionType: 'what' | 'where' | 'when' | 'how' | 'why' | 'who' | 'general';
  }
  
  /**
   * Analyzes a user query to extract intent and key information
   */
  export function analyzeQuery(query: string): QueryIntent {
    const normalizedQuery = query.toLowerCase().trim();
    
    // Initialize the result object
    const result: QueryIntent = {
      hasTimeIntent: false,
      hasFoodIntent: false, 
      hasAcademicIntent: false,
      hasCareerIntent: false,
      hasSocialIntent: false,
      hasLocationIntent: false,
      extractedLocations: [],
      extractedDates: [],
      extractedFoodTypes: [],
      keywords: [],
      questionType: 'general'
    };
    
    // Identify question type
    if (normalizedQuery.startsWith('what')) result.questionType = 'what';
    else if (normalizedQuery.startsWith('where')) result.questionType = 'where';
    else if (normalizedQuery.startsWith('when')) result.questionType = 'when';
    else if (normalizedQuery.startsWith('how')) result.questionType = 'how';
    else if (normalizedQuery.startsWith('why')) result.questionType = 'why';
    else if (normalizedQuery.startsWith('who')) result.questionType = 'who';
    
    // Time-related intent
    const timeKeywords = [
      'today', 'tomorrow', 'this week', 'next week', 'weekend', 
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
      'morning', 'afternoon', 'evening', 'night'
    ];
    
    result.hasTimeIntent = timeKeywords.some(keyword => normalizedQuery.includes(keyword));
    
    // Extract potential dates
    timeKeywords.forEach(keyword => {
      if (normalizedQuery.includes(keyword)) {
        result.extractedDates.push(keyword);
      }
    });
    
    // Food-related intent
    const foodKeywords = [
      'food', 'eat', 'lunch', 'dinner', 'breakfast', 'snack', 'pizza', 
      'coffee', 'drinks', 'refreshments', 'free'
    ];
    
    result.hasFoodIntent = foodKeywords.some(keyword => normalizedQuery.includes(keyword));
    
    // Extract food types
    const foodTypes = [
      'pizza', 'burger', 'sandwich', 'coffee', 'tea', 'breakfast', 
      'lunch', 'dinner', 'snack', 'vegetarian', 'vegan', 'gluten-free'
    ];
    
    foodTypes.forEach(foodType => {
      if (normalizedQuery.includes(foodType)) {
        result.extractedFoodTypes.push(foodType);
      }
    });
    
    // Academic intent
    const academicKeywords = [
      'class', 'study', 'tutor', 'lecture', 'academic', 'professor', 
      'course', 'lab', 'assignment', 'exam', 'test', 'midterm', 'final',
      'research', 'library', 'workshop'
    ];
    
    result.hasAcademicIntent = academicKeywords.some(keyword => normalizedQuery.includes(keyword));
    
    // Career intent
    const careerKeywords = [
      'career', 'job', 'internship', 'resume', 'interview', 'networking', 
      'professional', 'employer', 'company', 'industry', 'hiring', 'opportunity'
    ];
    
    result.hasCareerIntent = careerKeywords.some(keyword => normalizedQuery.includes(keyword));
    
    // Social intent
    const socialKeywords = [
      'social', 'club', 'organization', 'group', 'community', 'meet', 
      'event', 'party', 'game', 'movie', 'fun', 'hang out', 'friend'
    ];
    
    result.hasSocialIntent = socialKeywords.some(keyword => normalizedQuery.includes(keyword));
    
    // Location intent and extraction
    const locationKeywords = [
      'where', 'location', 'building', 'room', 'hall', 'center', 'campus'
    ];
    
    result.hasLocationIntent = locationKeywords.some(keyword => normalizedQuery.includes(keyword));
    
    // Known campus locations
    const campusLocations = [
      'campus center', 'gitc', 'tiernan hall', 'kupfrian hall', 'central king building',
      'weston hall', 'fenster hall', 'faculty dining room', 'warren street village',
      'honors college', 'wellness center', 'athletic center', 'library'
    ];
    
    campusLocations.forEach(location => {
      if (normalizedQuery.includes(location)) {
        result.extractedLocations.push(location);
      }
    });
    
    // Extract general keywords (after filtering out common words)
    const commonWords = [
      'the', 'and', 'or', 'a', 'an', 'in', 'on', 'at', 'for', 'to', 'with', 
      'about', 'from', 'by', 'after', 'before', 'is', 'are', 'am', 'was', 'were',
      'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
      'would', 'can', 'could', 'should', 'may', 'might', 'must'
    ];
    
    const words = normalizedQuery.split(/\s+/);
    
    result.keywords = words.filter(word => {
      // Remove punctuation
      const cleanWord = word.replace(/[^\w\s]/gi, '');
      
      // Filter out common words and very short words
      return cleanWord.length > 2 && !commonWords.includes(cleanWord);
    });
    
    return result;
  }
  
  /**
   * Generates API query parameters based on natural language analysis
   */
  export function generateQueryParams(query: string): URLSearchParams {
    const intent = analyzeQuery(query);
    const params = new URLSearchParams();
    
    // Add the original query
    params.append('q', query);
    
    // Add detected intents as filters
    const filters = [];
    if (intent.hasFoodIntent) filters.push('food');
    if (intent.hasAcademicIntent) filters.push('academic');
    if (intent.hasCareerIntent) filters.push('career');
    if (intent.hasSocialIntent) filters.push('social');
    
    // Add time filters
    if (intent.extractedDates.includes('today')) filters.push('today');
    
    if (filters.length > 0) {
      params.append('filters', filters.join(','));
    }
    
    // Add extracted entities
    if (intent.extractedLocations.length > 0) {
      params.append('locations', intent.extractedLocations.join(','));
    }
    
    if (intent.extractedFoodTypes.length > 0) {
      params.append('foodTypes', intent.extractedFoodTypes.join(','));
    }
    
    return params;
  }