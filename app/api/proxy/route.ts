import { NextResponse } from 'next/server';

const NJIT_API_URL = 'https://njit.campuslabs.com/engage/api/discovery/event/search';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || '';
  
  // Construct the URL for the NJIT API
  const njitApiUrl = new URL(NJIT_API_URL);
  njitApiUrl.searchParams.append('endsAfter', new Date().toISOString());
  njitApiUrl.searchParams.append('orderByField', 'endsOn');
  njitApiUrl.searchParams.append('orderByDirection', 'ascending');
  njitApiUrl.searchParams.append('status', 'Approved');
  njitApiUrl.searchParams.append('take', '100');
  
  if (query) {
    njitApiUrl.searchParams.append('query', query);
  }
  
  try {
    console.log("Proxy API: Fetching from NJIT API:", njitApiUrl.toString());
    
    // Make the request from the server side
    const response = await fetch(njitApiUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 300 } // Cache for 5 minutes
    });
    
    if (!response.ok) {
      console.error(`Proxy API: NJIT API error (${response.status}): ${response.statusText}`);
      return NextResponse.json({ error: 'Failed to fetch data from NJIT API' }, { status: response.status });
    }
    
    const data = await response.json();
    console.log(`Proxy API: Successfully fetched ${data.value?.length || 0} events from NJIT API`);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Proxy API: Error fetching from NJIT API:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}