'use client';

import React from 'react';
import { Event } from '../../types/event';
import EventCard from '../events/EventCard';

interface ResultsListProps {
  groupedEvents: { [key: string]: Event[] };
  paginatedDates: string[];
  favoritedEvents: { [key: string]: boolean };
  onToggleFavorite: (eventId: string) => void;
}

const ResultsList: React.FC<ResultsListProps> = ({
  groupedEvents,
  paginatedDates,
  favoritedEvents,
  onToggleFavorite
}) => {
  return (
    <div className="mt-6">
      {paginatedDates.map(dateKey => (
        <div key={dateKey} className="mb-8">
          {/* Date header - sticky */}
          <div className="sticky top-0 bg-gray-50 py-2 z-10">
            <h2 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4 flex items-center">
              {dateKey}
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResultsList;