// app/hooks/useSuggestions.ts
import { useState, useEffect } from 'react';
import { Suggestion } from '../types/suggestion';

export const useSuggestions = (
  query: string,
  setQuery: (query: string) => void,
  setIsFocused: (isFocused: boolean) => void,
  debounceTime = 150
) => {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [debouncedQuery, setDebouncedQuery] = useState<string>(query);

  // Debounce query for suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceTime);

    return () => {
      clearTimeout(timer);
    };
  }, [query, debounceTime]);

  // Fetch suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedQuery.trim() === '') {
        setSuggestions([]);
        return;
      }

      try {
        const params = new URLSearchParams();
        params.append('q', debouncedQuery);
        
        const response = await fetch(`/api/suggest?${params.toString()}`);
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      }
    };

    fetchSuggestions();
  }, [debouncedQuery]);

  // Handler for suggestion click
  const handleSuggestionClick = (suggestion: Suggestion) => {
    setQuery(suggestion.text);
    setIsFocused(false);
  };

  return {
    suggestions,
    handleSuggestionClick
  };
};

export default useSuggestions;