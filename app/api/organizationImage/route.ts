import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Get the URL from the query string
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('imageUrl');
  
  if (!imageUrl) {
    return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
  }
  
  try {
    // Let's try the original URL format that's in the error logs
    const originalUrl = `https://njit.campuslabs.com/engage/api/organizationImage?imageUrl=${imageUrl}`;
    
    console.log(`Trying original URL format: ${originalUrl}`);
    
    // Try fetching from the original URL first
    let response = await fetch(originalUrl, {
      headers: {
        'Accept': 'image/*',
        'Referer': 'https://njit.campuslabs.com/engage',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    // If original URL fails, try the se-images URL
    if (!response.ok) {
      console.log(`Original URL failed with ${response.status}, trying alternate URL`);
      const alternateUrl = `https://se-images.campuslabs.com/clink/images/${imageUrl}?preset=med-sq`;
      
      response = await fetch(alternateUrl, {
        headers: {
          'Accept': 'image/*',
          'Referer': 'https://njit.campuslabs.com/engage',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
    }
    
    if (!response.ok) {
      console.error(`All fetch attempts failed (${response.status})`);
      
      // Return the placeholder image
      return new Response(null, {
        status: 307, // Temporary redirect
        headers: {
          'Location': '/organization-placeholder.svg'
        }
      });
    }
    
    // Get the image data
    const imageData = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // Return the image
    return new Response(imageData, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400' // Cache for 24 hours
      }
    });
  } catch (error) {
    console.error('Error proxying image:', error);
    
    // Return a placeholder image on error
    return new Response(null, {
      status: 307, // Temporary redirect
      headers: {
        'Location': '/organization-placeholder.svg'
      }
    });
  }
} 