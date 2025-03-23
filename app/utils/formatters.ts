// app/utils/formatters.ts

/**
 * Format a time string to ensure consistent formatting (e.g., "400 PM" to "4:00 PM")
 */
export const formatTime = (time: string): string => {
    if (!time) return '';
    
    // If the time already has a colon, it's already formatted
    if (time.includes(':')) return time;
    
    // Match patterns like "400 PM" or "1200 AM"
    const match = time.match(/^(\d{1,4})\s*([AP]M)$/i);
    if (!match) return time;
    
    const numericPart = match[1];
    const ampm = match[2].toUpperCase();
    
    // Handle different formats based on digit count
    if (numericPart.length <= 2) {
      // e.g., "4 PM" → "4:00 PM"
      return `${numericPart}:00 ${ampm}`;
    } else if (numericPart.length === 3) {
      // e.g., "400 PM" → "4:00 PM" 
      return `${numericPart.charAt(0)}:${numericPart.substring(1)} ${ampm}`;
    } else if (numericPart.length === 4) {
      // e.g., "1230 PM" → "12:30 PM"
      return `${numericPart.substring(0, 2)}:${numericPart.substring(2)} ${ampm}`;
    }
    
    return time;
  };