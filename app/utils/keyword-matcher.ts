/**
 * Keyword matching utilities for advanced event filtering
 * This will be used to automatically tag events with filter labels based on content
 */
import { Event } from '../types/event';

// Regular expressions for matching common keywords in event content
const KEYWORD_MAPPINGS = {
  // Event categories
  CATEGORIES: {
    ACADEMIC: /\b(academic|study|lecture|research|professor|faculty|dean|syllabus|course|exam|class|lab|assignment|homework|college|program|degree|major|minor)\b/i,
    CAMPUS_LIFE: /\b(campus life|dorm|residence hall|housing|student life|extracurricular|club|organization|greek|fraternity|sorority|student government|campus event|student center)\b/i,
    CAREER: /\b(career fair|job fair|internship fair|resume workshop|career development|job|internship|employer|industry|company|networking|interview|hiring|job search|career|work)\b/i,
    COMMUNITY_SERVICE: /\b(community service|volunteer|volunteering|service|charity|nonprofit|donation|give back|help others|community outreach|fundraising)\b/i,
    CULTURAL: /\b(cultural|diversity|inclusion|heritage|international|multicultural|culture|ethnicity|tradition|celebration|festival|global|language)\b/i,
    SOCIAL: /\b(social|mixer|gathering|meetup|hangout|party|social event|get together|meet and greet|social hour|social activity)\b/i,
    ENTERTAINMENT: /\b(entertainment|movie|film|concert|performance|comedy|improv|talent show|screening|music|band|artist|theater|dance|karaoke|fun|game night)\b/i
  },
  
  // Format
  FORMAT: {
    IN_PERSON: /\b(in person|in-person|face to face|face-to-face|physical|on campus|on-campus|join us at|come to|building|room|location|attend|hall|venue)\b/i,
    HYBRID: /\b(hybrid|both zoom and in-person|both in-person and virtual|join virtually or in-person|option to attend|attend virtually or in-person|both online and in-person)\b/i,
    VIRTUAL: /\b(virtual|online|zoom|teams|webinar|livestream|stream|remote|digital|web|google meet|video|teleconference)\b/i
  },
  
  // Purpose
  PURPOSE: {
    NETWORKING: /\b(networking|connect|connection|professional|industry|meet and greet|contacts|business cards|linkedin|professional network)\b/i,
    SKILLS_BUILDING: /\b(skills|skill building|workshop|learn|training|tutorial|hands-on|practice|develop|improve|enhance|mastery|ability|competence|expertise|proficiency|learning)\b/i,
    SERVICE: /\b(service|volunteer|volunteering|community service|give back|help others|charity|donation|philanthropic|philanthropy|serve|community|outreach)\b/i
  },
  
  // Theme
  THEME: {
    HEALTH_WELLNESS: /\b(health|wellness|wellbeing|mental health|physical health|fitness|workout|exercise|yoga|meditation|mindfulness|stress|anxiety|depression|counseling|therapy|nutrition|diet|sleep|healthy|wellness wednesday)\b/i,
    ARTS_CULTURE: /\b(art|arts|culture|cultural|museum|exhibition|gallery|painting|drawing|sculpting|sculpture|music|dance|performance|theater|theatre|film|movie|documentary|creative|poetry|literature|photography|fashion)\b/i,
    SPORTS_RECREATION: /\b(sports|sport|recreation|recreational|athletic|athletics|game|match|tournament|competition|team|play|league|intramural|basketball|football|soccer|volleyball|baseball|softball|tennis|golf|swimming|track|field|fitness|exercise|workout|gym)\b/i,
    FAITH_SPIRITUALITY: /\b(faith|spiritual|spirituality|religious|religion|worship|prayer|meditation|church|temple|mosque|synagogue|chapel|bible|quran|torah|christian|muslim|jewish|hindu|buddhist|belief|god|deity|soul|spirit)\b/i
  },
  
  // Perks
  PERKS: {
    FREE_FOOD: /\b(free food|food provided|food will be provided|free lunch|free dinner|free breakfast|complimentary food|refreshments provided|refreshments will be provided|snacks provided|pizza provided|pizza will be provided|catering|catered|meals|dinner provided|lunch provided|breakfast provided|eat|food|pizza)\b/i,
    SWAG: /\b(swag|merch|merchandise|giveaway|free stuff|freebies|prizes|t-shirt|tshirt|t shirt|gift|giveaway|take home|free item|souvenir|keepsake|memento|token|handout|promotional item|freebie)\b/i
  },
  
  // Requirements
  REQUIREMENTS: {
    REQUIRES_RSVP: /\b(rsvp|register|registration|sign up|signup|reserve|reservation|ticket|must register|pre-register|reserve your spot|reserve a spot|secure your spot|get tickets|get your tickets|tickets available)\b/i
  },
  
  // Time of day
  TIME_OF_DAY: {
    MORNING: /\b(morning|breakfast|early|6am|7am|8am|9am|10am|11am|6:00 am|7:00 am|8:00 am|9:00 am|10:00 am|11:00 am|6:30 am|7:30 am|8:30 am|9:30 am|10:30 am|11:30 am)\b/i,
    AFTERNOON: /\b(afternoon|lunch|noon|12pm|1pm|2pm|3pm|4pm|5pm|12:00 pm|1:00 pm|2:00 pm|3:00 pm|4:00 pm|5:00 pm|12:30 pm|1:30 pm|2:30 pm|3:30 pm|4:30 pm|5:30 pm)\b/i,
    EVENING: /\b(evening|night|dinner|6pm|7pm|8pm|9pm|10pm|11pm|6:00 pm|7:00 pm|8:00 pm|9:00 pm|10:00 pm|11:00 pm|6:30 pm|7:30 pm|8:30 pm|9:30 pm|10:30 pm|11:30 pm)\b/i
  }
};

// Location categories will be handled separately

/**
 * Check if an event matches keywords for a specific filter category
 */
export function matchesKeywords(text: string, category: keyof typeof KEYWORD_MAPPINGS): boolean {
  if (!text || !category || !KEYWORD_MAPPINGS[category]) {
    return false;
  }
  
  const categoryGroup = KEYWORD_MAPPINGS[category];
  const lowerText = text.toLowerCase();
  
  // Check each regex in the category group
  for (const regex of Object.values(categoryGroup)) {
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Get time of day category based on event time
 */
export function getTimeOfDay(event: Event): string | null {
  const time = event.time;
  if (!time) return null;
  
  // Convert time to 24-hour format for comparison
  let hours = 0;
  
  // Handle different time formats
  if (time.includes(':')) {
    // Format: '9:00 AM' or '3:00 PM'
    const [timePart, period] = time.split(' ');
    const [hourStr] = timePart.split(':');
    hours = parseInt(hourStr);
    
    if (period && period.toUpperCase() === 'PM' && hours < 12) {
      hours += 12;
    }
    if (period && period.toUpperCase() === 'AM' && hours === 12) {
      hours = 0;
    }
  } else if (time.toLowerCase().includes('am') || time.toLowerCase().includes('pm')) {
    // Format: '9AM' or '3PM'
    const isPM = time.toLowerCase().includes('pm');
    hours = parseInt(time.replace(/[^0-9]/g, ''));
    
    if (isPM && hours < 12) {
      hours += 12;
    }
    if (!isPM && hours === 12) {
      hours = 0;
    }
  } else {
    // Assume 24-hour format
    hours = parseInt(time);
  }
  
  // Categorize by time of day
  if (hours >= 5 && hours < 12) {
    return 'morning';
  } else if (hours >= 12 && hours < 18) {
    return 'afternoon';
  } else {
    return 'evening';
  }
}

/**
 * Determine if an event is in-person or virtual
 */
export function getEventFormat(event: Event): 'in-person' | 'virtual' | 'hybrid' {
  const content = `${event.title} ${event.description} ${event.location}`.toLowerCase();
  
  // Check for virtual indicators
  const hasVirtualIndicators = KEYWORD_MAPPINGS.FORMAT.VIRTUAL.test(content);
  const hasInPersonIndicators = KEYWORD_MAPPINGS.FORMAT.IN_PERSON.test(content) || event.location.trim() !== '';
  
  if (hasVirtualIndicators && hasInPersonIndicators) {
    return 'hybrid';
  } else if (hasVirtualIndicators) {
    return 'virtual';
  }
  
  return 'in-person';
}

/**
 * Check if an event requires RSVP
 */
export function requiresRSVP(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.REQUIREMENTS.REQUIRES_RSVP.test(content);
}

/**
 * Check if event has swag or giveaways
 */
export function hasSwag(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.PERKS.SWAG.test(content);
}

/**
 * Check if event is career-focused
 */
export function isCareerEvent(event: Event): boolean {
  const text = `${event.title} ${event.description} ${event.organizerName}`.toLowerCase();
  
  // Check if it matches career keywords
  if (KEYWORD_MAPPINGS.CATEGORIES.CAREER.test(text)) {
    return true;
  }
  
  // Check if the organizer is a career-related organization
  const careerOrgs = [
    'career development',
    'career services',
    'office of career',
    'employer relations',
    'professional development'
  ];
  
  if (event.organizerName && careerOrgs.some(org => 
    event.organizerName.toLowerCase().includes(org.toLowerCase())
  )) {
    return true;
  }
  
  // Check if the category is explicitly set as career
  if (event.category === 'career') {
    return true;
  }
  
  return false;
}

/**
 * Generate advanced tags for an event based on its content
 */
export function generateAdvancedTags(event: Event): string[] {
  const tags: string[] = [];
  const fullText = `${event.title} ${event.description} ${event.organizerName}`.toLowerCase();
  
  // Purpose tags
  if (isNetworking(event)) tags.push('networking');
  if (isWorkshop(event)) tags.push('workshop-skillbuild');
  if (isService(event)) tags.push('service-volunteering');
  
  // Theme tags
  if (isHealthWellness(event)) tags.push('health-wellness');
  if (isArtsCulture(event)) tags.push('arts-culture');
  if (isSportsRec(event)) tags.push('sports-recreation');
  if (isFaithSpirituality(event)) tags.push('faith-spirituality');
  
  // Add career tag if the event is career-related
  if (isCareerEvent(event)) {
    tags.push('career');
  }
  
  // Perks
  if (hasSwag(event)) tags.push('free-swag');
  
  // Format
  const format = getEventFormat(event);
  tags.push(format);
  
  if (requiresRSVP(event)) tags.push('requires-rsvp');
  
  // Time of day
  const timeOfDay = getTimeOfDay(event);
  if (timeOfDay) tags.push(timeOfDay);
  
  return tags;
}

/**
 * Check if an event matches a networking purpose
 */
export function isNetworking(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.PURPOSE.NETWORKING.test(content);
}

/**
 * Check if an event is focused on skills building/workshop
 */
export function isWorkshop(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.PURPOSE.SKILLS_BUILDING.test(content);
}

/**
 * Check if an event is service-focused
 */
export function isService(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.PURPOSE.SERVICE.test(content);
}

/**
 * Check if event is health & wellness related
 */
export function isHealthWellness(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.THEME.HEALTH_WELLNESS.test(content);
}

/**
 * Check if event is arts & culture related
 */
export function isArtsCulture(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.THEME.ARTS_CULTURE.test(content);
}

/**
 * Check if event is sports & recreation related
 */
export function isSportsRec(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.THEME.SPORTS_RECREATION.test(content);
}

/**
 * Check if event is faith & spirituality related
 */
export function isFaithSpirituality(event: Event): boolean {
  const content = [event.title, event.description].join(' ').toLowerCase();
  return KEYWORD_MAPPINGS.THEME.FAITH_SPIRITUALITY.test(content);
}

export function getFormat(event: Event): string | null {
  return getEventFormat(event);
}

// Detect common categories for events
export function getEventCategory(event: Event): string | null {
  const content = [event.title, event.description].join(' ').toLowerCase();
  
  // Check each category
  for (const [category, regex] of Object.entries(KEYWORD_MAPPINGS.CATEGORIES)) {
    if (regex.test(content)) {
      return category.toLowerCase().replace('_', '-');
    }
  }
  
  return null;
} 