'use client';

import React, { useEffect, useRef } from 'react';
import { Map, Navigation } from 'lucide-react';
import { 
  CAMPUS_BUILDING_COORDINATES, 
  BUILDING_NAME_ALIASES,
  getDirectionsUrl
} from './campus-building-data';
import { MAPBOX_API_KEY } from '../../config/api-keys';

interface BuildingCardProps {
  buildingName: string;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ buildingName }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  
  // Find aliases for this building
  const aliases = Object.entries(BUILDING_NAME_ALIASES)
    .filter(([alias, fullName]) => fullName === buildingName)
    .map(([alias]) => alias);
  
  // Get coordinates
  const coordinates = CAMPUS_BUILDING_COORDINATES[buildingName] || [40.7424259, -74.1784006];

  // Set up the map
  useEffect(() => {
    const mapContainer = mapContainerRef.current;
    if (!mapContainer) return;
    
    // Create MapBox static map URL
    const mapboxUrl = `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+2563eb(${coordinates[1]},${coordinates[0]})/${coordinates[1]},${coordinates[0]},15,0/600x300@2x?access_token=${MAPBOX_API_KEY}`;
    
    // Set the map as background image
    mapContainer.style.backgroundImage = `url('${mapboxUrl}')`;
    mapContainer.style.backgroundSize = 'cover';
    mapContainer.style.backgroundPosition = 'center';
  }, [coordinates]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Map Preview */}
      <div 
        ref={mapContainerRef} 
        className="h-36 bg-gray-200 relative"
        aria-label={`Map of ${buildingName}`}
      >
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <span className="bg-white bg-opacity-90 px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <Map className="h-3 w-3 mr-1.5" />
            Map View
          </span>
        </div>
      </div>
      
      {/* Building Info */}
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="font-semibold text-lg text-gray-800 mb-2">{buildingName}</h3>
        
        {/* Building Aliases */}
        {aliases.length > 0 && (
          <div className="mb-3">
            {aliases.map(alias => (
              <span key={alias} className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-2 mb-1">
                {alias}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-auto pt-4 flex gap-2">
          {/* Directions Button */}
          <a 
            href={getDirectionsUrl(buildingName)} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Get Directions
          </a>
        </div>
      </div>
    </div>
  );
};

export default BuildingCard; 