'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coffee, BookOpen, Users, Briefcase, Clock, Calendar, Filter, X,
  Sunrise, Sun, Sunset, Users2, Heart, Trophy, 
  HeartPulse, Palette, Flower2, Gift, MapPin, MonitorPlay, CalendarCheck,
  Star, Hammer, Utensils, ChevronDown, ChevronUp, ExternalLink
} from 'lucide-react';
import { FilterOption, FilterCategories } from './CampusEngagementHub';

export interface FilterCount {
  id: string;
  count: number;
}

interface FilterPanelProps {
  options: FilterOption[];
  activeFilters: string[];
  onToggle: (filterId: string | null) => void;
  counts: FilterCount[];
  categories: FilterCategories;
  className?: string;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  options,
  activeFilters,
  onToggle,
  counts,
  categories,
  className = ''
}) => {
  // State to track which sections are expanded
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    "Date": true,
    "Time of Day": true,
    "Perks": true,
    "Purpose": true,
    "Format": true,
    "Theme": true,
  });
  
  // State to track if we're on a small screen
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  
  // Check screen size on mount and window resize
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 768);
    };
    
    // Initial check
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    // If small screen, collapse Theme section by default
    if (window.innerWidth < 768) {
      setExpandedSections(prev => ({
        ...prev,
        "Theme": false
      }));
    }
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Function to toggle section expansion
  const toggleSection = (section: string) => {
    // Don't allow Date and Time of Day to be collapsed
    if (section === "Date" || section === "Time of Day") {
      return;
    }
    
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Function to render the appropriate icon based on the icon string
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils':
        return <Utensils className="h-4 w-4 mr-2" />;
      case 'BookOpen':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'Users':
        return <Users className="h-4 w-4 mr-2" />;
      case 'Users2':
        return <Users2 className="h-4 w-4 mr-2" />;
      case 'Briefcase':
        return <Briefcase className="h-4 w-4 mr-2" />;
      case 'Clock':
        return <Clock className="h-4 w-4 mr-2" />;
      case 'Calendar':
        return <Calendar className="h-4 w-4 mr-2" />;
      case 'Sunrise':
        return <Sunrise className="h-4 w-4 mr-2" />;
      case 'Sun':
        return <Sun className="h-4 w-4 mr-2" />;
      case 'Sunset':
        return <Sunset className="h-4 w-4 mr-2" />;
      case 'Hammer':
        return <Hammer className="h-4 w-4 mr-2" />;
      case 'Heart':
        return <Heart className="h-4 w-4 mr-2" />;
      case 'HeartPulse':
        return <HeartPulse className="h-4 w-4 mr-2" />;
      case 'Palette':
        return <Palette className="h-4 w-4 mr-2" />;
      case 'Trophy':
        return <Trophy className="h-4 w-4 mr-2" />;
      case 'Flower2':
        return <Flower2 className="h-4 w-4 mr-2" />;
      case 'Gift':
        return <Gift className="h-4 w-4 mr-2" />;
      case 'MapPin':
        return <MapPin className="h-4 w-4 mr-2" />;
      case 'MonitorPlay':
        return <MonitorPlay className="h-4 w-4 mr-2" />;
      case 'ExternalLink':
        return <ExternalLink className="h-4 w-4 mr-2" />;
      case 'CalendarCheck':
        return <CalendarCheck className="h-4 w-4 mr-2" />;
      case 'Star':
        return <Star className="h-4 w-4 mr-2" />;
      case 'Coffee':
        return <Coffee className="h-4 w-4 mr-2" />;
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

  // Filter button component to reduce repetition
  const FilterButton = ({ filter }: { filter: FilterOption }) => (
    <button
      key={filter.id}
      onClick={() => onToggle(filter.id)}
      className={`flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
        activeFilters.includes(filter.id)
          ? filter.id === 'free-food' 
            ? 'bg-green-100 text-green-700' 
            : ['free-swag'].includes(filter.id)
              ? 'bg-emerald-100 text-emerald-700'
              : ['health-wellness'].includes(filter.id)
                ? 'bg-teal-100 text-teal-700'
                : ['arts-culture'].includes(filter.id)
                  ? 'bg-purple-100 text-purple-700'
                  : ['sports-recreation'].includes(filter.id)
                    ? 'bg-orange-100 text-orange-700'
                    : ['faith-spirituality'].includes(filter.id)
                      ? 'bg-indigo-100 text-indigo-700'
                      : ['career'].includes(filter.id)
                        ? 'bg-amber-100 text-amber-700'
                      : 'bg-blue-100 text-blue-700'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {renderIcon(filter.icon)}
      <span>{filter.label}</span>
      {getCount(filter.id) > 0 && (
        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
          activeFilters.includes(filter.id) 
            ? filter.id === 'free-food'
              ? 'bg-green-200 text-green-800'
              : ['free-swag'].includes(filter.id)
                ? 'bg-emerald-200 text-emerald-800'
                : ['health-wellness'].includes(filter.id)
                  ? 'bg-teal-200 text-teal-800'
                  : ['arts-culture'].includes(filter.id)
                    ? 'bg-purple-200 text-purple-800'
                    : ['sports-recreation'].includes(filter.id)
                      ? 'bg-orange-200 text-orange-800'
                      : ['faith-spirituality'].includes(filter.id)
                        ? 'bg-indigo-200 text-indigo-800'
                        : ['career'].includes(filter.id)
                          ? 'bg-amber-200 text-amber-800'
                        : 'bg-blue-200 text-blue-800' 
            : 'bg-gray-200 text-gray-700'
        }`}>
          {getCount(filter.id)}
        </span>
      )}
    </button>
  );

  // Smart default selection
  useEffect(() => {
    // Add default "today" filter on first load if no filters are active
    if (activeFilters.length === 0) {
      // Check if this is the first load
      const hasSelectedFilter = localStorage.getItem('hasSelectedFilter');
      if (!hasSelectedFilter) {
        onToggle('today');
        localStorage.setItem('hasSelectedFilter', 'true');
      }
    }
    
    // TODO: Add logic for Career Fair week highlight
  }, [activeFilters, onToggle]);

  return (
    <div className={`bg-white rounded-xl shadow-sm p-4 border border-gray-200 ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-gray-800">Filter Events</h3>
        
        {/* Clear All Button */}
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
      
      {/* Render filter sections based on categories */}
      {Object.entries(categories).map(([category, filterOptions]) => (
        <div key={category} className="mb-4">
          <div 
            className="flex justify-between items-center text-sm font-medium text-gray-700 mb-2 cursor-pointer"
            onClick={() => toggleSection(category)}
          >
            <span>{category}</span>
            {/* Only show toggle icon for collapsible sections */}
            {category !== "Date" && category !== "Time of Day" && (
              expandedSections[category] 
                ? <ChevronUp className="h-4 w-4 text-gray-500" /> 
                : <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
          
          {/* Show section content if expanded */}
          {expandedSections[category] && (
            <div className="flex flex-wrap gap-2">
              {filterOptions.map(filter => (
                <FilterButton key={filter.id} filter={filter} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default FilterPanel;