// app/components/map/FullCampusMap.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  // ... other event properties
}

interface FullCampusMapProps {
  events: Event[];
  onEventSelect?: (eventId: string) => void;
}

const DEFAULT_CENTER = { lat: 40.7424, lng: -74.1784 }; // NJIT Campus Center

const FullCampusMap: React.FC<FullCampusMapProps> = ({ events, onEventSelect }) => {
  // Similar implementation to CampusMap but handles multiple locations
  // ...

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-md">
      <div ref={mapRef} className="h-[500px] w-full" />
      
      {/* Optional: List view of events that syncs with map */}
      <div className="bg-white p-4 max-h-[300px] overflow-y-auto">
        <h3 className="font-medium text-gray-900 mb-2">Events on Map</h3>
        <ul className="space-y-2">
          {events.map(event => (
            <li 
              key={event.id}
              className="cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={() => onEventSelect?.(event.id)}
            >
              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-blue-500 mt-1 mr-2 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800">{event.title}</p>
                  <p className="text-sm text-gray-500">{event.location} • {event.time}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FullCampusMap;