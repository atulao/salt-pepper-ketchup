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
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 transform hover:-translate-y-1">
      <div className="p-4">
        <div className="flex">
          {/* Date Badge - Using original style */}
          <div className="mr-4">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-2 text-center w-16">
              <div className="text-blue-600 font-bold text-2xl">
                {day}
              </div>
              <div className="text-gray-600 text-sm font-medium">
                {month}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            {/* Event Title */}
            <h3 className="font-semibold text-lg text-gray-900 mb-1">{event.title}</h3>
            
            {/* Organization Name(s) - MODIFIED for multiple orgs & clickable */}
            <div className="flex items-center text-sm text-gray-700 mb-2">
              {hasMultipleOrgs ? (
                <Users2 className="h-4 w-4 mr-1 text-gray-500" />
              ) : (
                <User className="h-4 w-4 mr-1 text-gray-500" />
              )}
              <div className="flex flex-wrap items-center">
                {organizations.map((org, index) => (
                  <React.Fragment key={index}>
                    <button 
                      className="font-medium text-gray-700 hover:text-blue-600 tag-clickable"
                      onClick={(e) => handleOrgClick(org, e)}
                    >
                      {org}
                    </button>
                    {index < organizations.length - 1 && (
                      <span className="mx-1 text-gray-400">•</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
            
            {/* Time and Location - Using original style with better visibility */}
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <Calendar className="h-4 w-4 mr-1 text-blue-500" />
              <span className="font-medium">{formattedTime}</span>
              <span className="mx-2">•</span>
              <MapPin className="h-4 w-4 mr-1 text-red-500" />
              <span className="font-medium">{event.location}</span>
            </div>
            
            {/* RSVP buttons */}
            <div className="flex space-x-2 mb-3">
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  rsvpStatus === 'going' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-200'
                }`}
                onClick={() => handleRSVP('going')}
              >
                Going
              </button>
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  rsvpStatus === 'maybe' 
                    ? 'bg-amber-100 text-amber-700 border border-amber-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-amber-50 border border-gray-200'
                }`}
                onClick={() => handleRSVP('maybe')}
              >
                Maybe
              </button>
              <button 
                className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                  rsvpStatus === 'not-going' 
                    ? 'bg-red-100 text-red-700 border border-red-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 border border-gray-200'
                }`}
                onClick={() => handleRSVP('not-going')}
              >
                Can't Go
              </button>
            </div>
            
            {/* Category badges - MODIFIED to be clickable */}
            <div className="mb-3 flex flex-wrap gap-1">
              <button 
                className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 cursor-pointer hover:bg-blue-200"
                onClick={(e) => handleTagClick(event.category, e)}
              >
                {CATEGORY_ICONS[event.category] || CATEGORY_ICONS.other}
                <span className="capitalize">{event.category}</span>
              </button>
              
              {isResidenceLifeEvent(event) && (
                <button 
                  className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 cursor-pointer hover:bg-purple-200"
                  onClick={(e) => handleTagClick('residence', e)}
                >
                  <Home className="h-3 w-3 mr-1" />
                  Residence Life Event
                </button>
              )}
              
              {event.hasFood && (
                <button 
                  className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 cursor-pointer hover:bg-green-200"
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
        <div className="mt-3 flex justify-between items-center pt-3 border-t">
          <div className="flex space-x-2">
            <button 
              onClick={() => onToggleFavorite(event.id)}
              className={`p-2 rounded-full ${
                isFavorite 
                  ? 'text-red-500 bg-red-50' 
                  : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
              }`}
              aria-label="Favorite"
            >
              <Heart className="h-5 w-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            
            <button
              onClick={() => setIsMapVisible(!isMapVisible)}
              className={`p-2 rounded-full ${
                isMapVisible 
                  ? 'text-blue-500 bg-blue-50' 
                  : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'
              }`}
              aria-label="Toggle map"
            >
              <Eye className="h-5 w-5" />
            </button>
            
            <a 
              href={getDirectionsUrl(event.location)}
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded-full"
              aria-label="Get directions"
            >
              <MapPin className="h-5 w-5" />
            </a>
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={addToCalendar}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
              aria-label="Add to Calendar"
            >
              <CalendarIcon className="h-5 w-5" />
            </button>
            
            <button 
              onClick={shareEvent}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
              aria-label="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
            
            <button 
              onClick={() => window.open(`/event/${event.id}`, '_blank')}
              className="p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
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