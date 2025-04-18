// app/components/events/EventCard.tsx
'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Heart, CalendarIcon, Share2, LinkIcon, Home, BookOpen, Users, Briefcase, Coffee, Sparkles, Eye, X, User, Users2 } from 'lucide-react';
import { Event } from '../../types/event';
import CampusMap from '../map/CampusMap';
import { isResidenceLifeEvent } from '../../utils/data-fetcher';
import { getDirectionsUrl } from '../map/campus-building-data';
import EventDescription from './EventDescription';
import { formatTime } from '../../utils/formatters';
import { useDarkMode, getThemeClasses } from '../../utils/theme-utils';

// Month mapping for calendar functionality
const MONTH_MAP: Record<string, number> = {
  'January': 0, 'February': 1, 'March': 2, 'April': 3, 'May': 4, 'June': 5,
  'July': 6, 'August': 7, 'September': 8, 'October': 9, 'November': 10, 'December': 11
};

// Utility types
interface CategoryIcon {
  [key: string]: React.ReactNode;
}

// Constants for icons
const CATEGORY_ICONS: CategoryIcon = {
  academic: <BookOpen className="h-4 w-4 mr-1 text-blue-500 dark:text-blue-300" />,
  social: <Users className="h-4 w-4 mr-1 text-purple-500 dark:text-purple-300" />,
  career: <Briefcase className="h-4 w-4 mr-1 text-amber-500 dark:text-amber-300" />,
  food: <Coffee className="h-4 w-4 mr-1 text-emerald-500 dark:text-emerald-300" />,
  other: <Calendar className="h-4 w-4 mr-1 text-gray-500 dark:text-gray-300" />
};

// Tag color mapping
const TAG_COLORS: Record<string, string> = {
  'free food': 'bg-green-100 text-green-800',
  'social': 'bg-purple-100 text-purple-800',
  'cultural': 'bg-orange-100 text-orange-800',
  'arts & music': 'bg-indigo-100 text-indigo-800',
  'free stuff': 'bg-emerald-100 text-emerald-800',
  'technology': 'bg-cyan-100 text-cyan-800',
  'career': 'bg-amber-100 text-amber-800',
  'academic': 'bg-blue-100 text-blue-800',
  'networking': 'bg-teal-100 text-teal-800',
  'competition': 'bg-pink-100 text-pink-800',
  'professional development': 'bg-sky-100 text-sky-800',
  'commuter': 'bg-lime-100 text-lime-800',
  'meeting': 'bg-blue-100 text-blue-800',
  'workshop': 'bg-fuchsia-100 text-fuchsia-800',
  'volunteer': 'bg-green-100 text-green-700',
  'leadership': 'bg-yellow-100 text-yellow-800',
  'diversity & inclusion': 'bg-rose-100 text-rose-800',
  'health & wellness': 'bg-teal-100 text-teal-700',
  'research': 'bg-blue-100 text-blue-700',
  'stem': 'bg-cyan-100 text-cyan-700',
  'innovation': 'bg-amber-100 text-amber-700',
  'entrepreneurship': 'bg-orange-100 text-orange-700',
  'graduate': 'bg-violet-100 text-violet-800',
  'undergraduate': 'bg-indigo-100 text-indigo-800',
  'virtual': 'bg-slate-100 text-slate-800',
  'in-person': 'bg-emerald-100 text-emerald-800',
  // Add organization color
  'organization': 'bg-gray-100 text-gray-800'
};

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onTagClick?: (tag: string) => void;
  onOrgClick?: (organization: string) => void; // New prop for organization filtering
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isFavorite, 
  onToggleFavorite,
  onTagClick,
  onOrgClick = onTagClick // Default to using onTagClick if onOrgClick not provided
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(!!event.imageUrl);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<string | null>(null);
  
  // Use the custom dark mode hook
  const isDarkMode = useDarkMode();

  // Parse multiple organizations if applicable
  const organizations = event.organizerName.split(/,\s*|\s+and\s+|\s*&\s*/).filter(Boolean);
  const hasMultipleOrgs = organizations.length > 1;

  // Toggle description expansion
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageLoaded(false);
  };

  // Get tag color class
  const getTagColorClass = (tag: string) => {
    // Find exact match or partial match
    const exactMatch = TAG_COLORS[tag];
    if (exactMatch) return exactMatch;
    
    // Try to find partial match
    for (const [key, value] of Object.entries(TAG_COLORS)) {
      if (tag.includes(key) || key.includes(tag)) {
        return value;
      }
    }
    
    // Default
    return 'bg-gray-100 text-gray-700';
  };

  // Handle organization click
  const handleOrgClick = (org: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Organization clicked:", org);
    if (onOrgClick) {
      onOrgClick(org);
    }
  };

  // Add to calendar functionality
  const addToCalendar = () => {
    try {
      // Format the date and time for calendar
      const dateParts = event.date.split(', ');
      const monthDay = dateParts[0].split(' ');
      const month = monthDay[0];
      const day = monthDay[1];
      const year = dateParts.length > 1 ? dateParts[1] : new Date().getFullYear().toString();
      
      // Parse the time
      const timeMatch = event.time.match(/(\d+):(\d+)\s*([AP]M)/);
      if (!timeMatch) return;
      
      let hour = parseInt(timeMatch[1]);
      const minute = parseInt(timeMatch[2]);
      const period = timeMatch[3];
      
      if (period === 'PM' && hour < 12) hour += 12;
      if (period === 'AM' && hour === 12) hour = 0;
      
      // Create Date objects for start and end (assuming 1 hour duration)
      const startDate = new Date(parseInt(year), MONTH_MAP[month], parseInt(day), hour, minute);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      
      // Strip HTML from description for clean calendar entry
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = event.description;
      const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
      
      // Create calendar URL
      const eventTitle = encodeURIComponent(event.title);
      const eventLocation = encodeURIComponent(event.location);
      const eventDescription = encodeURIComponent(cleanDescription);
      
      const startStr = startDate.toISOString().replace(/-|:|\.\d+/g, '');
      const endStr = endDate.toISOString().replace(/-|:|\.\d+/g, '');
      
      const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${eventTitle}&dates=${startStr}/${endStr}&details=${eventDescription}&location=${eventLocation}`;
      
      // Open in new tab
      window.open(googleCalendarUrl, '_blank');
    } catch (error) {
      console.error('Error adding to calendar:', error);
    }
  };

  // Share event functionality
  const shareEvent = () => {
    try {
      if (navigator.share) {
        navigator.share({
          title: event.title,
          text: `Check out this event: ${event.title} at ${event.location} on ${event.date} at ${event.time}`,
          url: window.location.href
        });
      } else {
        // Fallback for browsers that don't support Web Share API
        const dummyInput = document.createElement('input');
        const shareText = `${event.title} at ${event.location} on ${event.date} at ${event.time}`;
        document.body.appendChild(dummyInput);
        dummyInput.value = shareText;
        dummyInput.select();
        document.execCommand('copy');
        document.body.removeChild(dummyInput);
        alert('Event details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing event:', error);
    }
  };

  // Handle tag click
  const handleTagClick = (tag: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Tag clicked:", tag);
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  // Get relevance indicator based on score
  const getRelevanceIndicator = () => {
    const score = event.relevanceScore;
    if (!score) return null;
    
    if (score > 85) {
      return (
        <div className="flex items-center space-x-1 text-xs text-emerald-600">
          <Sparkles className="h-3 w-3" />
          <span>Perfect for you</span>
        </div>
      );
    }
    
    if (score > 70) {
      return (
        <div className="flex items-center space-x-1 text-xs text-blue-600">
          <Sparkles className="h-3 w-3" />
          <span>Recommended</span>
        </div>
      );
    }
    
    return null;
  };

  // Handle RSVP status change
  const handleRSVP = (status: string) => {
    setRsvpStatus(status);
    // Here you would add API call to update RSVP
    console.log(`RSVP updated to ${status} for event ${event.id}`);
  };

  // Format time to consistent format (e.g. "400 PM" to "4:00 PM")
  const formattedTime = formatTime(event.time);

  // Extract day and month from date
  const dateParts = event.date.split(' ');
  const day = dateParts[1].replace(',', '');
  const month = dateParts[0].substring(0, 3);

  return (
    <div className={`${getThemeClasses(
      isDarkMode,
      'bg-white border-gray-200 text-gray-900',
      'bg-gray-800 border-gray-700 shadow-gray-900/30 text-white'
    )} rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border transform hover:-translate-y-1`}>
      <div className="p-4">
        <div className="flex">
          {/* Date Badge */}
          <div className="mr-4">
            <div className={`${getThemeClasses(
              isDarkMode,
              'bg-white border-gray-200',
              'bg-gray-800 border-gray-700 text-white'
            )} border rounded-lg shadow-sm p-2 text-center w-16`}>
              <div className={`${getThemeClasses(
                isDarkMode,
                'text-blue-600',
                'text-blue-400'
              )} font-bold text-2xl`}>
                {day}
              </div>
              <div className={`${getThemeClasses(
                isDarkMode,
                'text-gray-600',
                'text-gray-300'
              )} text-sm font-medium`}>
                {month}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            {/* Event Title */}
            <h3 className={`font-semibold text-lg ${getThemeClasses(
              isDarkMode,
              'text-gray-900',
              'text-white'
            )} mb-1`}>{event.title}</h3>
            
            {/* Organization Name(s) */}
            <div className={`flex items-center text-sm ${getThemeClasses(
              isDarkMode,
              'text-gray-700',
              'text-gray-300'
            )} mb-2`}>
              {hasMultipleOrgs ? (
                <Users2 className={`h-4 w-4 mr-1 ${getThemeClasses(
                  isDarkMode,
                  'text-gray-500',
                  'text-gray-400'
                )}`} />
              ) : (
                <User className={`h-4 w-4 mr-1 ${getThemeClasses(
                  isDarkMode,
                  'text-gray-500',
                  'text-gray-400'
                )}`} />
              )}
              <div className="flex flex-wrap items-center">
                {organizations.map((org, index) => (
                  <React.Fragment key={index}>
                    <button 
                      className={`font-medium ${getThemeClasses(
                        isDarkMode,
                        'text-gray-700 hover:text-blue-600',
                        'text-gray-300 hover:text-blue-400'
                      )} tag-clickable`}
                      onClick={(e) => handleOrgClick(org, e)}
                    >
                      {org}
                    </button>
                    {index < organizations.length - 1 && (
                      <span className={`mx-1 ${getThemeClasses(
                        isDarkMode,
                        'text-gray-400',
                        'text-gray-500'
                      )}`}>•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Time and Location */}
            <div className={`flex items-center text-sm ${getThemeClasses(
              isDarkMode,
              'text-gray-600',
              'text-gray-300'
            )} mb-2`}>
              <Calendar className={`h-4 w-4 mr-1 ${getThemeClasses(
                isDarkMode,
                'text-blue-500',
                'text-blue-400'
              )}`} />
              <span className="font-medium">{formattedTime}</span>
              <span className={`mx-2 ${getThemeClasses(
                isDarkMode,
                'text-gray-400',
                'text-gray-500'
              )}`}>•</span>
              <MapPin className={`h-4 w-4 mr-1 ${getThemeClasses(
                isDarkMode,
                'text-red-500',
                'text-red-400'
              )}`} />
              <span className="font-medium">{event.location}</span>
            </div>
            
            {/* RSVP buttons using event-btn classes */}
            <div className="flex space-x-2 mb-3">
              {/* Going button */}
              <button 
                className={`event-btn ${rsvpStatus === 'going' ? 'event-btn-green' : 'event-btn-default'}`}
                onClick={() => handleRSVP('going')}
              >
                Going
              </button>
              
              {/* Maybe button */}
              <button 
                className={`event-btn ${rsvpStatus === 'maybe' ? 'event-btn-amber' : 'event-btn-default'}`}
                onClick={() => handleRSVP('maybe')}
              >
                Maybe
              </button>
              
              {/* Can't Go button */}
              <button 
                className={`event-btn ${rsvpStatus === 'not-going' ? 'event-btn-red' : 'event-btn-default'}`}
                onClick={() => handleRSVP('not-going')}
              >
                Can't Go
              </button>
            </div>
            
            {/* Category badges using event-tag classes */}
            <div className="mb-3 flex flex-wrap gap-1">
              <button 
                className="event-tag event-tag-blue"
                onClick={(e) => handleTagClick(event.category, e)}
              >
                {CATEGORY_ICONS[event.category] || CATEGORY_ICONS.other}
                <span className="capitalize">{event.category}</span>
              </button>
              
              {isResidenceLifeEvent(event) && (
                <button 
                  className="event-tag event-tag-purple"
                  onClick={(e) => handleTagClick('residence', e)}
                >
                  <Home className="h-3 w-3 mr-1" />
                  Residence Life Event
                </button>
              )}
              
              {event.hasFood && (
                <button 
                  className="event-tag event-tag-green"
                  onClick={(e) => handleTagClick('free food', e)}
                >
                  <Coffee className="h-3 w-3 mr-1" />
                  {event.foodType || 'Free Food'}
                </button>
              )}
            </div>

            {/* Map when toggled */}
            {isMapVisible && (
              <div className="mt-3 mb-3">
                <CampusMap 
                  location={event.location}
                  eventTitle={event.title}
                />
              </div>
            )}

            {/* Description component */}
            <EventDescription 
              description={event.description}
              isExpanded={isDescriptionExpanded}
              onToggle={toggleDescription}
              maxLength={100}
            />
            
          </div>
        </div>
        
        {/* Action buttons */}
        <div className={`mt-3 flex justify-between items-center pt-3 border-t ${getThemeClasses(
          isDarkMode,
          'border-gray-100',
          'border-gray-700'
        )}`}>
          <div className="flex space-x-2">
            {/* Favorite button */}
            <button 
              onClick={() => onToggleFavorite(event.id)}
              className={isFavorite 
                ? `p-2 rounded-full ${getThemeClasses(
                    isDarkMode,
                    'text-red-500 bg-red-50',
                    'text-red-400 bg-red-900/30'
                  )}` 
                : `p-2 rounded-full ${getThemeClasses(
                    isDarkMode,
                    'text-gray-400 hover:text-red-500 hover:bg-gray-100',
                    'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                  )}`
              }
              aria-label="Favorite"
            >
              <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            {/* Map button */}
            <button
              onClick={() => setIsMapVisible(!isMapVisible)}
              className={isMapVisible
                ? `p-2 rounded-full ${getThemeClasses(
                    isDarkMode,
                    'text-blue-500 bg-blue-50',
                    'text-blue-400 bg-blue-900/30'
                  )}`
                : `p-2 rounded-full ${getThemeClasses(
                    isDarkMode,
                    'text-gray-400 hover:text-blue-500 hover:bg-gray-100',
                    'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  )}`
              }
              aria-label="Toggle map"
            >
              <Eye className="h-5 w-5" />
            </button>
            
            {/* Directions button */}
            <a 
              href={getDirectionsUrl(event.location)}
              target="_blank" 
              rel="noopener noreferrer"
              className={`p-2 rounded-full ${getThemeClasses(
                isDarkMode,
                'text-gray-400 hover:text-green-500 hover:bg-gray-100',
                'text-gray-400 hover:text-green-400 hover:bg-gray-700'
              )}`}
              aria-label="Get directions"
            >
              <MapPin className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex space-x-2">
            {/* Calendar button */}
            <button 
              onClick={addToCalendar}
              className={`p-2 rounded-full ${getThemeClasses(
                isDarkMode,
                'text-gray-400 hover:text-blue-500 hover:bg-gray-100',
                'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
              )}`}
              aria-label="Add to Calendar"
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            
            {/* Share button */}
            <button 
              onClick={shareEvent}
              className={`p-2 rounded-full ${getThemeClasses(
                isDarkMode,
                'text-gray-400 hover:text-blue-500 hover:bg-gray-100',
                'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
              )}`}
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            {/* View details button */}
            <button 
              onClick={() => window.open(`/event/${event.id}`, '_blank')}
              className={`p-2 rounded-full ${getThemeClasses(
                isDarkMode,
                'text-gray-400 hover:text-blue-500 hover:bg-gray-100',
                'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
              )}`}
              aria-label="View details"
            >
              <LinkIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;