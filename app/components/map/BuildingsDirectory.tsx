'use client';

import React, { useState, useMemo } from 'react';
import { 
  CAMPUS_BUILDING_COORDINATES, 
  BUILDING_NAME_ALIASES, 
  normalizeBuildingName,
  getBuildingCoordinates,
  BUILDING_VIEW_ANGLES
} from './campus-building-data';
import BuildingCard from './BuildingCard';
import TopNavBar from '../TopNavBar';
import { Search, Map, Filter, X } from 'lucide-react';
import Link from 'next/link';

const BuildingsDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResidenceOnly, setShowResidenceOnly] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Handle dark mode change
  const handleModeChange = (mode: boolean) => {
    setIsDarkMode(mode);
  };
  
  // Get all unique building names (excluding aliases and variations)
  const buildingNames = useMemo(() => {
    const uniqueBuildings = new Set<string>();
    
    // Get main buildings (exclude room-specific entries and variations)
    Object.keys(CAMPUS_BUILDING_COORDINATES).forEach(name => {
      // Skip entries with "Room" or specific floor indicators
      if (!name.includes('Room') && !name.includes('Floor') && !name.includes('Lounge') && 
          !name.includes('NJIT Campus') && !name.includes('Lobby') && !name.includes('Atrium')) {
        
        // Normalize name to remove duplicates
        const normalizedName = normalizeBuildingName(name);
        
        // Filter out known aliases
        if (!Object.values(BUILDING_NAME_ALIASES).includes(name)) {
          uniqueBuildings.add(normalizedName);
        }
      }
    });
    
    // Sort alphabetically
    return Array.from(uniqueBuildings).sort();
  }, []);
  
  // Filter buildings based on search query and filter options
  const filteredBuildings = useMemo(() => {
    let results = buildingNames;
    
    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(name => 
        name.toLowerCase().includes(query)
      );
    }
    
    // Apply residence hall filter if enabled
    if (showResidenceOnly) {
      results = results.filter(name => 
        name.includes('Residence') || 
        name.includes('Hall') && (
          name.includes('Redwood') || 
          name.includes('Cypress') || 
          name.includes('Oak') || 
          name.includes('Laurel') || 
          name.includes('Maple')
        )
      );
    }
    
    return results;
  }, [buildingNames, searchQuery, showResidenceOnly]);

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNavBar onModeChange={handleModeChange} />
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
              <Map className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Buildings Directory</h1>
              <p className="text-gray-600">Information about campus buildings and facilities</p>
            </div>
          </div>
          
          {/* Search and Filter */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search Input */}
            <div className="relative md:col-span-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search for a building..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-700" />
                </button>
              )}
            </div>
            
            {/* Filter Toggle */}
            <button
              className={`flex items-center justify-center px-4 py-3 rounded-lg border transition-colors ${
                showResidenceOnly 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
              onClick={() => setShowResidenceOnly(!showResidenceOnly)}
            >
              <Filter className="h-5 w-5 mr-2" />
              <span>Residence Halls {showResidenceOnly ? '(On)' : '(Off)'}</span>
            </button>
          </div>
          
          {/* Active Filters */}
          {(searchQuery || showResidenceOnly) && (
            <div className="mb-6 flex flex-wrap items-center">
              <span className="text-gray-600 mr-2">Active filters:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center bg-gray-100 text-gray-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                  <span className="mr-1">Search:</span>
                  <strong>"{searchQuery}"</strong>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              {showResidenceOnly && (
                <span className="inline-flex items-center bg-blue-100 text-blue-800 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                  <span>Residence Halls Only</span>
                  <button 
                    onClick={() => setShowResidenceOnly(false)}
                    className="ml-2 text-blue-500 hover:text-blue-700"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              
              <button
                className="text-sm text-blue-600 hover:underline mb-2"
                onClick={() => {
                  setSearchQuery('');
                  setShowResidenceOnly(false);
                }}
              >
                Clear all
              </button>
            </div>
          )}
          
          {/* Buildings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBuildings.map((building) => (
              (() => {
                // Get coordinates for the building
                const coordinates = getBuildingCoordinates(building);
                
                // Get custom view angles or use defaults
                const angles = BUILDING_VIEW_ANGLES[building] || { heading: 235, pitch: 10 }; // Default if not found
                
                // Determine FOV: use specific value or default (e.g., 100)
                const fov = angles.fov || 100; 
                
                // Construct Google Street View URL
                const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
                const streetViewImageUrl = `https://maps.googleapis.com/maps/api/streetview?size=600x300&location=${coordinates[0]},${coordinates[1]}&fov=${fov}&heading=${angles.heading}&pitch=${angles.pitch}&key=${apiKey}`; 
                
                return (
                  <BuildingCard 
                    key={building} 
                    buildingName={building} 
                    streetViewImageUrl={streetViewImageUrl} 
                  />
                );
              })()
            ))}
          </div>
          
          {/* No Results */}
          {filteredBuildings.length === 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 p-8 text-center">
              <p className="text-lg text-gray-600 mb-2">No buildings found</p>
              <p className="text-gray-500 mb-4">
                {searchQuery ? `No matches for "${searchQuery}"` : "No buildings match the current filters"}
              </p>
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setShowResidenceOnly(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
          
          {/* Building Count */}
          {filteredBuildings.length > 0 && (
            <div className="mt-6 text-sm text-gray-500 text-center">
              Showing {filteredBuildings.length} {filteredBuildings.length === 1 ? 'building' : 'buildings'}
            </div>
          )}
          
          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingsDirectory; 