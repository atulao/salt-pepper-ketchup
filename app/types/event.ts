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
    
    // Purpose properties
    isNetworking?: boolean;
    isWorkshop?: boolean;
    isService?: boolean;
    isCareer?: boolean;
    
    // Theme properties
    isHealthWellness?: boolean;
    isArtsCulture?: boolean;
    isSportsRec?: boolean;
    isFaithSpirituality?: boolean;
    
    // Format and logistics
    format?: 'in-person' | 'virtual';
    requiresRSVP?: boolean;
    
    // Additional perks
    hasSwag?: boolean;
    
    // Time of day
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
}