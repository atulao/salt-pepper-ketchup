import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const name = searchParams.get('name') || '';
  const size = parseInt(searchParams.get('size') || '100');
  
  // Get initials (up to 2 characters)
  const initials = name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase();
  
  // Generate a deterministic color based on the name
  const hue = Math.abs(
    name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 360
  );
  const backgroundColor = `hsl(${hue}, 70%, 60%)`;
  
  // Create an SVG with the initials
  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${size/2}" cy="${size/2}" r="${size/2}" fill="${backgroundColor}" />
      <text 
        x="${size/2}" 
        y="${size/2}" 
        font-family="Arial, sans-serif" 
        font-size="${size/2.5}px" 
        fill="white" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >
        ${initials}
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=86400'
    }
  });
} 