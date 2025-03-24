'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getBuildingCoordinates, normalizeBuildingName } from './campus-building-data';
import { MapPin, Eye } from 'lucide-react';

interface CampusMapProps {
  location: string;
  eventTitle?: string;
}

const CampusMap: React.FC<CampusMapProps> = ({ location, eventTitle }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [showStreetView, setShowStreetView] = useState<boolean>(false);
  
  const normalizedLocation = normalizeBuildingName(location);
  const coordinates = getBuildingCoordinates(normalizedLocation);
  
  // Generate Street View URL for the location
  const streetViewUrl = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${coordinates[0]},${coordinates[1]}`;
  
  useEffect(() => {
    if (!mapRef.current) return;
    
    // Update the map display element
    const mapElement = mapRef.current;
    
    // Set data attributes for coordinates
    mapElement.dataset.latitude = coordinates[0].toString();
    mapElement.dataset.longitude = coordinates[1].toString();
    mapElement.dataset.location = normalizedLocation;
  }, [location, normalizedLocation, coordinates]);

  return (
    <div className="campus-map-container">
      <div 
        ref={mapRef}
        className="relative bg-blue-50 rounded-lg p-4 flex flex-col items-center justify-center"
        style={{ height: '200px', width: '100%' }}
      >
        <div className="text-blue-600 font-medium mb-2">
          {eventTitle ? `${eventTitle} at ${location}` : location}
        </div>
        
        <div className="text-gray-600 text-sm">
          <span className="flex items-center justify-center">
            <MapPin className="h-4 w-4 mr-1 text-red-500" /> 
            {coordinates[0].toFixed(6)}, {coordinates[1].toFixed(6)}
          </span>
        </div>
        
        {showStreetView ? (
          <div className="w-full h-24 mt-2 overflow-hidden rounded">
            <iframe 
              src={streetViewUrl}
              className="w-full h-64 -mt-16" 
              allowFullScreen
              loading="lazy"
              title="Street View"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-blue-100 w-full h-24 mt-2 rounded relative">
            <MapPin className="h-10 w-10 text-red-500" />
            <div className="absolute bottom-2 right-2 text-xs text-blue-800">
              NJIT Campus
            </div>
          </div>
        )}
        
        <div className="flex space-x-2 mt-2">
          <button 
            onClick={() => setShowStreetView(prev => !prev)}
            className="flex items-center bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors"
          >
            <Eye className="h-3.5 w-3.5 mr-1.5" />
            {showStreetView ? 'Hide Street View' : 'Show Street View'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CampusMap;