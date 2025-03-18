// app/hooks/useFavorites.ts
import { useState, useEffect } from 'react';

export const useFavorites = () => {
  const [favoritedEvents, setFavoritedEvents] = useState<{[key: string]: boolean}>({});

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favoriteEvents');
    if (savedFavorites) {
      try {
        setFavoritedEvents(JSON.parse(savedFavorites));
      } catch (e) {
        console.error('Failed to parse saved favorites:', e);
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    localStorage.setItem('favoriteEvents', JSON.stringify(favoritedEvents));
  }, [favoritedEvents]);

  // Toggle favorite status
  const toggleFavorite = (eventId: string) => {
    setFavoritedEvents(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  };

  return {
    favoritedEvents,
    toggleFavorite
  };
};

export default useFavorites;