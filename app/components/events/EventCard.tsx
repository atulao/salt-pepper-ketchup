'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Heart, CalendarIcon, Share2, LinkIcon, Home, BookOpen, Users, Briefcase, Coffee, Sparkles, Eye } from 'lucide-react';
import { Event } from '../../types/event';
import CampusMap from '../map/CampusMap';
import { isResidenceLifeEvent } from '../../utils/data-fetcher';
import { getDirectionsUrl } from '../map/campus-building-data';
import EventDescription from './EventDescription';
import { formatTime } from '../../utils/formatters';

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
  academic: <BookOpen className="h-4 w-4 mr-1 text-blue-500" />,
  social: <Users className="h-4 w-4 mr-1 text-purple-500" />,
  career: <Briefcase className="h-4 w-4 mr-1 text-amber-500" />,
  food: <Coffee className="h-4 w-4 mr-1 text-emerald-500" />,
  other: <Calendar className="h-4 w-4 mr-1 text-gray-500" />
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
  'in-person': 'bg-emerald-100 text-emerald-800'
};

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onTagClick?: (tag: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isFavorite, 
  onToggleFavorite,
  onTagClick 
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(!!event.imageUrl);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isMapVisible, setIsMapVisible] = useState(false);

  // Toggle description expansion
  const toggleDescription = () => {
    setIsDescriptionExpanded(!isDescriptionExpanded);
  };

  // Handle image loading error
  const handleImageError = () => {
    setImageLoaded(false);
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

  // Render event image
  const renderEventImage = () => {
    if (event.imageUrl && imageLoaded) {
      return (
        <>
          {/* Skeleton loader */}
          {!imageLoaded && (
            <div className="h-16 w-16 bg-gray-200 rounded-lg animate-pulse"></div>
          )}
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className={`h-16 w-16 object-cover rounded-lg ${imageLoaded ? 'visible' : 'hidden'}`}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        </>
      );
    }
    
    return (
      <div className="h-16 w-16 bg-gray-200 rounded-lg flex items-center justify-center">
        <Calendar className="h-6 w-6 text-gray-400" />
      </div>
    );
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

  // Format time to consistent format (e.g. "400 PM" to "4:00 PM")
  const formattedTime = formatTime(event.time);

  // Toggle map visibility
  const toggleMap = () => {
    setIsMapVisible(!isMapVisible);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 transform hover:-translate-y-1">
      <div className="p-5">
        <div className="flex items-start">
          {/* Event image */}
          <div className="flex-shrink-0 mr-4 relative">
            {renderEventImage()}
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg text-gray-900 hover:text-blue-600 transition-colors">{event.title}</h3>
              {getRelevanceIndicator()}
            </div>

            {/* Residence badge */}
            {isResidenceLifeEvent(event) && (
              <div className="mt-1 mb-2">
                <span className="inline-flex items-center bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full">
                  <Home className="h-3 w-3 mr-1" />
                  Residence Life Event
                </span>
              </div>
            )}

            {/* Map when toggled */}
            {isMapVisible && (
              <div className="mt-3">
                <CampusMap 
                  location={event.location}
                  eventTitle={event.title}
                />
                
                {/* Directions button */}
                <a 
                  href={getDirectionsUrl(event.location)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </div>
            )}

            {/* Description component */}
            <EventDescription 
              description={event.description}
              isExpanded={isDescriptionExpanded}
              onToggle={toggleDescription}
              maxLength={100}
            />
            
            {/* Event metadata */}
            <div className="flex flex-wrap items-center mt-3 text-sm text-gray-500 gap-3">
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                <span>{event.date} • {formattedTime}</span>
              </div>
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                <MapPin className="h-4 w-4 mr-1 text-green-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center bg-gray-50 px-2 py-1 rounded">
                {CATEGORY_ICONS[event.category] || CATEGORY_ICONS.other}
                <span className="capitalize">{event.category}</span>
              </div>
              {event.hasFood && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <Coffee className="h-3 w-3 mr-1" />
                  {event.foodType || 'Free Food'}
                </span>
              )}
            </div>
            
            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {event.tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium transition-transform hover:scale-105 cursor-pointer ${getTagColorClass(tag)}`}
                    onClick={(e) => handleTagClick(tag, e)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Filter by ${tag}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
              {/* Favorite button */}
              <div className="relative">
                <button 
                  onClick={() => onToggleFavorite(event.id)}
                  className={`flex items-center p-2 rounded-full ${
                    isFavorite 
                      ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                      : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                  }`}
                  aria-label="Favorite"
                  onMouseEnter={() => setShowTooltip('favorite')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
                </button>
                {showTooltip === 'favorite' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      {isFavorite ? 'Remove Favorite' : 'Add to Favorites'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Add to Calendar button */}
              <div className="relative">
                <button 
                  onClick={addToCalendar}
                  className="flex items-center p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                  aria-label="Add to Calendar"
                  onMouseEnter={() => setShowTooltip('calendar')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <CalendarIcon className="h-5 w-5" />
                </button>
                {showTooltip === 'calendar' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      Add to Calendar
                    </div>
                  </div>
                )}
              </div>
              
              {/* Share button */}
              <div className="relative">
                <button 
                  onClick={shareEvent}
                  className="flex items-center p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                  aria-label="Share"
                  onMouseEnter={() => setShowTooltip('share')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Share2 className="h-5 w-5" />
                </button>
                {showTooltip === 'share' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      Share Event
                    </div>
                  </div>
                )}
              </div>
              
              {/* Map toggle button */}
              <div className="relative">
                <button 
                  onClick={toggleMap}
                  className={`flex items-center p-2 rounded-full ${
                    isMapVisible 
                      ? 'text-green-500 bg-green-50 hover:bg-green-100' 
                      : 'text-gray-400 hover:text-green-500 hover:bg-gray-100'
                  }`}
                  aria-label="Toggle map"
                  onMouseEnter={() => setShowTooltip('map')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <Eye className="h-5 w-5" />
                </button>
                {showTooltip === 'map' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      {isMapVisible ? 'Hide Map' : 'Show Map'}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Get directions link */}
              <div className="relative">
                <a 
                  href={getDirectionsUrl(event.location)}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded-full"
                  aria-label="Get directions"
                  onMouseEnter={() => setShowTooltip('directions')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <MapPin className="h-5 w-5" />
                </a>
                {showTooltip === 'directions' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      Get Directions
                    </div>
                  </div>
                )}
              </div>
              
              {/* View details button */}
              <div className="relative">
                <button 
                  onClick={() => window.open(`/event/${event.id}`, '_blank')}
                  className="flex items-center p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                  aria-label="View details"
                  onMouseEnter={() => setShowTooltip('details')}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  <LinkIcon className="h-5 w-5" />
                </button>
                {showTooltip === 'details' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 z-10">
                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded">
                      View Details
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;