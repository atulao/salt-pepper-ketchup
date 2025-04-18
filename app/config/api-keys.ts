// API key configuration
// These keys are loaded from environment variables
// NEVER commit actual API keys to the repository

// Function to safely access environment variables
const getEnvVar = (key: string, fallback: string = ''): string => {
  // For client-side usage in Next.js, we need to use NEXT_PUBLIC_ prefix
  const value = process.env[`NEXT_PUBLIC_${key}`] || fallback;
  
  // Warn if using fallback in non-development environments
  if (!value && process.env.NODE_ENV !== 'development') {
    console.warn(`Environment variable NEXT_PUBLIC_${key} is not set!`);
  }
  
  return value;
};

// For Google Maps
// Use empty fallback for security - you'll need to set this in your .env.local file
export const GOOGLE_MAPS_API_KEY = getEnvVar('GOOGLE_MAPS_API_KEY', '');

// For MapBox
// Use empty fallback for security - you'll need to set this in your .env.local file
export const MAPBOX_API_KEY = getEnvVar('MAPBOX_API_KEY', ''); 