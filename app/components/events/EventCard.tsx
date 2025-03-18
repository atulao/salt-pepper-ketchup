'use client';

import React, { useState } from 'react';
import { Calendar, MapPin, Heart, CalendarIcon, Share2, LinkIcon, Home, ChevronUp, ChevronDown, BookOpen, Users, Briefcase, Coffee, Sparkles } from 'lucide-react';
import { Event } from '../../types/event';
import CampusMap from '../map/CampusMap';
import { isResidenceLifeEvent } from '../../utils/data-fetcher';

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

interface EventCardProps {
  event: Event;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  isFavorite, 
  onToggleFavorite 
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(!!event.imageUrl);

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
      
      // Create calendar URL
      const eventTitle = encodeURIComponent(event.title);
      const eventLocation = encodeURIComponent(event.location);
      const eventDescription = encodeURIComponent(event.description.substring(0, 100));
      
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

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200 border border-gray-200">
      <div className="p-5">
        <div className="flex items-start">
          {/* Event image */}
          <div className="flex-shrink-0 mr-4 relative">
            {renderEventImage()}
          </div>

          <div className="flex-grow">
            <div className="flex justify-between items-start">
              <h3 className="font-medium text-lg text-gray-900">{event.title}</h3>
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

            {/* Map (when expanded) */}
            {isDescriptionExpanded && (
              <div className="mt-3">
                <CampusMap 
                  location={event.location}
                  eventTitle={event.title}
                />
                
                {/* Directions button */}
                <a 
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(event.location)},NJIT,Newark,NJ`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 flex items-center justify-center bg-blue-50 text-blue-600 py-2 px-4 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </a>
              </div>
            )}

            {/* Description */}
            <div className="relative mt-1">
              <p className={`text-gray-500 whitespace-pre-line ${
                isDescriptionExpanded ? '' : 'line-clamp-2'
              }`}>
                {event.description}
              </p>
              
              {/* Read more/less button */}
              {event.description.length > 100 && (
                <button 
                  onClick={toggleDescription}
                  className="mt-1 text-blue-500 text-sm font-medium flex items-center hover:text-blue-600"
                >
                  {isDescriptionExpanded ? (
                    <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
                  ) : (
                    <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
                  )}
                </button>
              )}
            </div>
            
            {/* Event metadata */}
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-500 gap-3">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-blue-500" />
                <span>{event.date} • {event.time}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 text-green-500" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                {CATEGORY_ICONS[event.category] || CATEGORY_ICONS.other}
                <span className="capitalize">{event.category}</span>
              </div>
              {event.hasFood && (
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
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
                    className="inline-block bg-gray-100 rounded-full px-2 py-0.5 text-xs text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="mt-3 flex space-x-2">
              <button 
                onClick={() => onToggleFavorite(event.id)}
                className={`flex items-center p-1.5 rounded-full ${
                  isFavorite 
                    ? 'text-red-500 bg-red-50 hover:bg-red-100' 
                    : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
                }`}
                aria-label="Favorite"
              >
                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
              </button>
              
              <button 
                onClick={addToCalendar}
                className="flex items-center p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                aria-label="Add to Calendar"
              >
                <CalendarIcon className="h-4 w-4" />
              </button>
              
              <button 
                onClick={shareEvent}
                className="flex items-center p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                aria-label="Share"
              >
                <Share2 className="h-4 w-4" />
              </button>
              
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center p-1.5 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded-full"
                aria-label="Get directions"
              >
                <MapPin className="h-4 w-4" />
              </a>
              
              <button 
                onClick={() => window.open(`/event/${event.id}`, '_blank')}
                className="flex items-center p-1.5 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
                aria-label="View details"
              >
                <LinkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;