'use client';

import React from 'react';
import { Heart, Calendar as CalendarIcon, Share2, MapPin, Link as LinkIcon, Eye } from 'lucide-react';
import { getDirectionsUrl } from '../map/campus-building-data';

interface EventActionsProps {
  eventId: string;
  location: string;
  isFavorite: boolean;
  onToggleFavorite: (eventId: string) => void;
  onAddToCalendar: () => void;
  onShare: () => void;
  onViewMap?: () => void;
}

const EventActions: React.FC<EventActionsProps> = ({
  eventId,
  location,
  isFavorite,
  onToggleFavorite,
  onAddToCalendar,
  onShare,
  onViewMap
}) => {
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {/* Favorite button */}
      <button 
        onClick={() => onToggleFavorite(eventId)}
        className={`flex items-center p-2 rounded-full ${
          isFavorite 
            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
            : 'text-gray-400 hover:text-red-500 hover:bg-gray-100'
        }`}
        aria-label="Favorite"
      >
        <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>
      
      {/* Add to Calendar button */}
      <button 
        onClick={onAddToCalendar}
        className="flex items-center p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
        aria-label="Add to Calendar"
      >
        <CalendarIcon className="h-4 w-4" />
      </button>
      
      {/* Share button */}
      <button 
        onClick={onShare}
        className="flex items-center p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
        aria-label="Share"
      >
        <Share2 className="h-4 w-4" />
      </button>
      
      {/* View map button */}
      <button 
        onClick={onViewMap}
        className="flex items-center p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded-full"
        aria-label="View map"
      >
        <Eye className="h-4 w-4" />
      </button>
      
      {/* Get directions link */}
      <a 
        href={getDirectionsUrl(location)}
        target="_blank" 
        rel="noopener noreferrer"
        className="flex items-center p-2 text-gray-400 hover:text-green-500 hover:bg-gray-100 rounded-full"
        aria-label="Get directions"
      >
        <MapPin className="h-4 w-4" />
      </a>
      
      {/* View details button */}
      <button 
        onClick={() => window.open(`/event/${eventId}`, '_blank')}
        className="flex items-center p-2 text-gray-400 hover:text-blue-500 hover:bg-gray-100 rounded-full"
        aria-label="View details"
      >
        <LinkIcon className="h-4 w-4" />
      </button>
    </div>
  );
};

export default EventActions;