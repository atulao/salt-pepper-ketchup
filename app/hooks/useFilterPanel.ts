// app/hooks/useFilterPanel.ts
import { useState, useEffect } from 'react';
import { FilterOption, FilterCount } from '../types/filters';
import { Event } from '../types/event';

export const useFilterPanel = (filterOptions: FilterOption[]) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [filterCounts, setFilterCounts] = useState<FilterCount[]>([]);

  // Toggle filter selection
  const toggleFilter = (filterId: string) => {
    setActiveFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId) 
        : [...prev, filterId]
    );
  };

  // Update filter counts based on events
  const updateFilterCounts = (events: Event[]) => {
    const counts: FilterCount[] = [];
    
    // Count food events
    counts.push({ id: 'food', count: events.filter(event => event.hasFood).length });
    
    // Count events by category
    counts.push({ id: 'academic', count: events.filter(event => event.category === 'academic').length });
    counts.push({ id: 'social', count: events.filter(event => event.category === 'social').length });
    counts.push({ id: 'career', count: events.filter(event => event.category === 'career').length });
    
    // Count today's events
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric'
    });
    counts.push({ id: 'today', count: events.filter(event => event.date.includes(formattedToday)).length });
    
    setFilterCounts(counts);
  };

  return {
    activeFilters,
    setActiveFilters,
    toggleFilter,
    filterCounts,
    updateFilterCounts
  };
};

export default useFilterPanel;