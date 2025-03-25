'use client';

import React from 'react';
import { Coffee, BookOpen, Users, Briefcase, Clock, Home, Calendar, Filter, X } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  icon: string;
}

export interface FilterCount {
  id: string;
  count: number;
}

interface FilterPanelProps {
  options: FilterOption[];
  activeFilters: string[];
  onToggle: (filterId: string | null) => void;  // Updated to accept null
  counts: FilterCount[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  options,
  activeFilters,
  onToggle,
  counts
}) => {
  // Function to render the appropriate icon based on the icon string
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Coffee':
        return <Coffee className="h-4 w-4 mr-2" />;
      case 'BookOpen':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'Users':
        return <Users className="h-4 w-4 mr-2" />;
      case 'Briefcase':
        return <Briefcase className="h-4 w-4 mr-2" />;
      case 'Clock':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'Home':
        return <Home className="h-4 w-4 mr-2" />;
      case 'Calendar':
        return <Calendar className="h-4 w-4 mr-2" />;
      default:
        return <Filter className="h-4 w-4 mr-2" />;
    }
  };

  // Find the count for a specific filter
  const getCount = (filterId: string): number => {
    const filterCount = counts.find(count => count.id === filterId);
    return filterCount ? filterCount.count : 0;
  };

  // Clear all filters function
  const clearAllFilters = () => {
    console.log("Clearing all filters");
    // Pass null to indicate clearing all filters
    onToggle(null);
  };

  // Group filter options by categories
  const dateFilters = options.filter(option => 
    ['today', 'tomorrow', 'this-week', 'weekend'].includes(option.id)
  );
  
  const categoryFilters = options.filter(option => 
    ['academic', 'social', 'career'].includes(option.id)
  );
  
  const perksFilters = options.filter(option => 
    ['food', 'residence'].includes(option.id)
  );

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Filter Events</h3>
        
        {/* Clear All Button - Fixed to properly clear all filters */}
        {activeFilters.length > 0 && (
          <button 
            className="text-red-600 text-sm font-medium hover:text-red-700 flex items-center"
            onClick={clearAllFilters}
          >
            <X className="h-3.5 w-3.5 mr-1" />
            Clear All
          </button>
        )}
      </div>
      
      {/* Date filters */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Date</div>
        <div className="flex flex-wrap gap-2">
          {dateFilters.map(filter => (
            <button 
              key={filter.id}
              className={`flex items-center px-3 py-1.5 text-sm font-medium rounded-md ${
                activeFilters.includes(filter.id)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => onToggle(filter.id)}
            >
              {renderIcon(filter.icon)}
              <span>{filter.label}</span>
              {getCount(filter.id) > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeFilters.includes(filter.id) 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {getCount(filter.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Categories */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Categories</div>
        <div className="flex flex-wrap gap-2">
          {categoryFilters.map(filter => (
            <button
              key={filter.id}
              onClick={() => onToggle(filter.id)}
              className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeFilters.includes(filter.id)
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {renderIcon(filter.icon)}
              <span>{filter.label}</span>
              {getCount(filter.id) > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeFilters.includes(filter.id) 
                    ? 'bg-blue-200 text-blue-800' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {getCount(filter.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Event Perks */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-700 mb-2">Event Perks</div>
        <div className="flex flex-wrap gap-2">
          {perksFilters.map(filter => (
            <button 
              key={filter.id}
              onClick={() => onToggle(filter.id)}
              className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                activeFilters.includes(filter.id)
                  ? filter.id === 'food' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-purple-100 text-purple-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {renderIcon(filter.icon)}
              <span>{filter.label}</span>
              {getCount(filter.id) > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                  activeFilters.includes(filter.id) 
                    ? filter.id === 'food'
                      ? 'bg-green-200 text-green-800'
                      : 'bg-purple-200 text-purple-800' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {getCount(filter.id)}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;