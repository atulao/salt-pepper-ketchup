'use client';

import React, { useState, useEffect } from 'react';
import EventDetailPage from '../../components/events/EventDetailPage';
import { Event } from '../../types/event';

// Define the expected props type for a dynamic route page
type EventPageProps = {
  params: { id: string };
  // Optional: Include searchParams if you might use them
  // searchParams?: { [key: string]: string | string[] | undefined };
};

// This would typically fetch data from your API
async function getEvent(id: string): Promise<Event> {
  try {
    // Fetch from API in a real implementation
    const response = await fetch(`/api/search-events?id=${id}`);
    const data = await response.json();
    return data.events[0];
  } catch (error) {
    console.error('Error fetching event:', error);
    // Return mock data as fallback
    return {
      id,
      title: 'Loading Event...',
      description: 'Event information is loading...',
      location: 'NJIT Campus',
      date: new Date().toLocaleDateString(),
      time: '12:00 PM',
      hasFood: false,
      organizerName: 'NJIT',
      category: 'other',
      tags: [],
      relevanceScore: 50
    };
  }
}

// Fetch related events
async function getRelatedEvents(event: Event): Promise<Event[]> {
  try {
    // In a real implementation, this would use the event's tags/category to find related events
    const tag = event.tags[0] || event.category;
    const response = await fetch(`/api/search-events?q=${tag}`);
    const data = await response.json();
    
    // Remove the current event and limit to 3 events
    return data.events
      .filter((e: Event) => e.id !== event.id)
      .slice(0, 3);
  } catch (error) {
    console.error('Error fetching related events:', error);
    return [];
  }
}

export default function EventPage({ params }: EventPageProps) {
  const [event, setEvent] = useState<Event | null>(null);
  const [relatedEvents, setRelatedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mock current user
  const currentUser = {
    id: 'user-123',
    name: 'John Student',
    email: 'john.student@njit.edu'
  };
  
  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const eventData = await getEvent(params.id);
        setEvent(eventData);
        
        // Get related events
        const relatedData = await getRelatedEvents(eventData);
        setRelatedEvents(relatedData);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading event:', error);
        setError('Failed to load event. Please try again.');
        setLoading(false);
      }
    }
    
    loadEvent();
  }, [params.id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading event...</p>
        </div>
      </div>
    );
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">Event Not Found</h2>
          <p className="text-gray-600">{error || 'The event you are looking for does not exist.'}</p>
          <a href="/" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
            Return to Events
          </a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex mb-6">
          <a href="/" className="text-blue-600 hover:text-blue-800">
            &larr; Back to Events
          </a>
        </nav>
        
        <EventDetailPage 
          event={event}
          currentUser={currentUser}
          relatedEvents={relatedEvents}
        />
      </div>
    </div>
  );
}