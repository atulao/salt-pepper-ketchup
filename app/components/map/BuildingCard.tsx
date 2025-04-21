'use client';

import React from 'react';
import { Navigation } from 'lucide-react';
import { 
  BUILDING_NAME_ALIASES,
  getDirectionsUrl
} from './campus-building-data';

interface BuildingCardProps {
  buildingName: string;
  streetViewImageUrl: string;
}

const BuildingCard: React.FC<BuildingCardProps> = ({ buildingName, streetViewImageUrl }) => {
  // Find aliases for this building
  const aliases = Object.entries(BUILDING_NAME_ALIASES)
    .filter(([alias, fullName]) => fullName === buildingName)
    .map(([alias]) => alias);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      {/* Street View Image */}
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={streetViewImageUrl} 
          alt={`Street View of ${buildingName}`}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = '/placeholder-image.png')}
        />
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