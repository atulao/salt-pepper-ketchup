// app/types/suggestion.ts
export interface Suggestion {
    text: string;
    type: 'event' | 'food' | 'location' | 'academic' | 'social' | 'career' | 'query';
  }