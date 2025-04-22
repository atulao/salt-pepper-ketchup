import {
  GraduationCap, BookOpen, Briefcase, Megaphone, Users,
  Cog, Landmark, HeartPulse, Smile, Award, Dices, Home, Handshake,
  Church, Scale, University, Venus, HelpCircle // Default/Fallback
} from 'lucide-react';
import React from 'react';

interface TagStyle {
  bgColor: string;
  textColor: string;
  icon: React.ElementType; // Lucide icons are components
}

// Define styles for each specific tag
export const organizationTagStyles: Record<string, TagStyle> = {
  "Academic & Scholastic": {
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    icon: GraduationCap
  },
  "Arts, Music & Media": {
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    icon: BookOpen // Using BookOpen as a proxy for Arts/Media
  },
  "Career & Industry": {
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-700',
    icon: Briefcase
  },
  "Civic Engagement & Advocacy": {
    bgColor: 'bg-cyan-50',
    textColor: 'text-cyan-700',
    icon: Megaphone
  },
  "Cultural & Identity-Based": {
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-700',
    icon: Users
  },
  "Engineering": {
    bgColor: 'bg-gray-100', // More neutral for engineering
    textColor: 'text-gray-700',
    icon: Cog
  },
  "Greek Life": {
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    icon: Landmark // Using Landmark as a proxy
  },
  "Health & Well-Being": {
    bgColor: 'bg-green-50',
    textColor: 'text-green-700',
    icon: HeartPulse
  },
  "Hobbies & Leisure": {
    bgColor: 'bg-lime-50',
    textColor: 'text-lime-700',
    icon: Smile
  },
  "Honor Societies": {
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-700',
    icon: Award
  },
  "Recreation & Sports": {
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-700',
    icon: Dices // Using Dices as a proxy for Recreation/Sports
  },
  "Residence Life": {
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-700',
    icon: Home
  },
  "Service & Philanthropy": {
    bgColor: 'bg-pink-50',
    textColor: 'text-pink-700',
    icon: Handshake
  },
  "Spiritual & Religious": {
    bgColor: 'bg-fuchsia-50',
    textColor: 'text-fuchsia-700',
    icon: Church
  },
  "Student Governance & Councils": {
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    icon: Scale
  },
  "University Services": {
    bgColor: 'bg-stone-100',
    textColor: 'text-stone-700',
    icon: University
  },
  "Women-led": {
    bgColor: 'bg-violet-50',
    textColor: 'text-violet-700',
    icon: Venus
  },
  // Add a default for tags not explicitly listed
  "default": {
    bgColor: 'bg-gray-50',
    textColor: 'text-gray-600',
    icon: HelpCircle
  }
};

// Helper function to get style, falling back to default
export const getTagStyle = (tagName: string): TagStyle => {
  return organizationTagStyles[tagName] || organizationTagStyles.default;
}; 