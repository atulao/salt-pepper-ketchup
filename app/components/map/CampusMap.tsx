'use client';

import React, { useEffect, useRef } from 'react';
import { getBuildingCoordinates, normalizeBuildingName } from './campus-building-data';

interface CampusMapProps {
  location: string;
  eventTitle?: string;
}

const CampusMap: React.FC<CampusMapProps> = ({ location, eventTitle }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    const normalizedLocation = normalizeBuildingName(location);
    const coordinates = getBuildingCoordinates(normalizedLocation);
    
    // Update the map display element
    const mapElement = mapRef.current;
    
    // Set data attributes for coordinates
    mapElement.dataset.latitude = coordinates[0].toString();
    mapElement.dataset.longitude = coordinates[1].toString();
    mapElement.dataset.location = normalizedLocation;
    
    // You could enhance this with a static map image in the future
  }, [location]);

  // Generate Google Maps URL for the location
  const normalizedLocation = normalizeBuildingName(location);
  const coordinates = getBuildingCoordinates(normalizedLocation);
  const googleMapsUrl = `https://www.google.com/maps?q=${coordinates[0]},${coordinates[1]}`;
  
  return (
    <div className="campus-map-container">
      <div 
        ref={mapRef}
        className="bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center"
        style={{ height: '200px', width: '100%' }}
      >
        <div className="text-blue-600 font-medium mb-2">
          {eventTitle ? `${eventTitle} at ${location}` : location}
        </div>
        <div className="text-gray-600 text-sm">
          Coordinates: {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
        </div>
        <div className="flex items-center justify-center bg-blue-100 w-full h-24 mt-2 rounded relative">
          <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="absolute bottom-2 right-2 text-xs text-blue-800">
            NJIT Campus
          </div>
        </div>
        <a 
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600 transition-colors"
        >
          View on Google Maps
        </a>
      </div>
    </div>
  );
};

export default CampusMap;