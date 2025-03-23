'use client';

import React from 'react';
import { Event } from '../../types/event';
import EventCard from '../events/EventCard';
import { Calendar } from 'lucide-react';

interface ResultsListProps {
  groupedEvents: { [key: string]: Event[] };
  paginatedDates: string[];
  favoritedEvents: { [key: string]: boolean };
  onToggleFavorite: (eventId: string) => void;
  onTagClick?: (tag: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({
  groupedEvents,
  paginatedDates,
  favoritedEvents,
  onToggleFavorite,
  onTagClick
}) => {
  return (
    <div className="mt-6">
      {paginatedDates.map(dateKey => (
        <div key={dateKey} className="mb-8">
          {/* Date header - sticky */}
          <div className="sticky top-0 bg-gray-50 py-3 z-10">
            <h2 className="text-lg font-medium text-blue-700 border-b-2 border-blue-200 pb-2 mb-4 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-blue-600" />
              <span className="bg-blue-50 px-3 py-1 rounded-md">{dateKey}</span>
            </h2>
          </div>

          {/* Events for this date */}
          <div className="space-y-4">
            {groupedEvents[dateKey].map(event => (
              <EventCard 
                key={event.id}
                event={event}
                isFavorite={!!favoritedEvents[event.id]}
                onToggleFavorite={onToggleFavorite}
                onTagClick={onTagClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsList;