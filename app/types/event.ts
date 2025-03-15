/**
 * Type definitions for events in the Salt-Pepper-Ketchup platform
 */

export interface Event {
    id: string;
    title: string;
    description: string;
    location: string;
    date: string;
    time: string;
    hasFood: boolean;
    foodType?: string;
    organizerName: string;
    imageUrl?: string;
    category: 'academic' | 'social' | 'career' | 'food' | 'other';
    tags: string[];
    relevanceScore?: number;
  }