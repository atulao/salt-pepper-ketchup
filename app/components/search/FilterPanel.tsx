'use client';

import React from 'react';
import { Coffee, BookOpen, Users, Briefcase, Clock, Home } from 'lucide-react';

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
  onToggle: (filterId: string) => void;
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
      default:
        return null;
    }
  };

  // Find the count for a specific filter
  const getCount = (filterId: string): number => {
    const filterCount = counts.find(count => count.id === filterId);
    return filterCount ? filterCount.count : 0;
  };

  return (
    <div className="mt-5 flex flex-wrap gap-2 justify-center">
      {options.map(filter => {
        const count = getCount(filter.id);
        const isActive = activeFilters.includes(filter.id);
        return (
          <button
            key={filter.id}
            onClick={() => onToggle(filter.id)}
            className={`flex items-center rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'bg-blue-600 text-white shadow-md transform scale-105'
                : 'bg-white text-gray-700 hover:bg-gray-100 hover:scale-102'
            } border border-gray-200`}
          >
            {renderIcon(filter.icon)}
            <span>{filter.label}</span>
            {count > 0 && (
              <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
                isActive 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}>
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default FilterPanel;