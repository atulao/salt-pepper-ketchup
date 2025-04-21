import { NextResponse } from 'next/server';

// Define the expected structure of an organization
interface EngageOrganization {
  Id: string;
  Name: string;
  WebsiteKey: string;
  ProfilePicture?: string;
  Summary?: string;
  CategoryNames?: string[];
}

// Define the expected response structure
interface EngageApiResponse {
  value: EngageOrganization[];
  [key: string]: any; // Allow for other properties
}

export async function GET(request: Request) {
  const baseUrl = 'https://njit.campuslabs.com/engage/api/discovery/search/organizations';
  const pageSize = 25; // API seems to return 25 items per page
  const maxPages = 12; // Fetch up to 12 pages (300 organizations total)
  
  try {
    console.log(`Fetching organizations from ${baseUrl}`);
    
    // Array to hold all organizations across pages
    let allOrganizations: EngageOrganization[] = [];
    
    // Fetch multiple pages
    for (let page = 0; page < maxPages; page++) {
      const skip = page * pageSize;
      const url = `${baseUrl}?skip=${skip}&take=${pageSize}`;
      
      console.log(`Fetching page ${page + 1}/${maxPages} (skip=${skip}, take=${pageSize})`);
      
      try {
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' }
        });
        
        if (!response.ok) {
          console.error(`Error fetching page ${page + 1}: ${response.status} ${response.statusText}`);
          // If first page fails, abort completely
          if (page === 0) {
            return NextResponse.json(
              { message: `Failed to fetch organizations: ${response.status} ${response.statusText}` },
              { status: response.status }
            );
          }
          // If a subsequent page fails, we'll just use what we've got so far
          break;
        }
        
        const data = await response.json();
        
        // Check if we got organizations
        if (data && Array.isArray(data.value)) {
          const pageOrgs = data.value;
          console.log(`Retrieved ${pageOrgs.length} organizations from page ${page + 1}`);
          
          // No more results, stop fetching
          if (pageOrgs.length === 0) {
            break;
          }
          
          // Add to our collection
          allOrganizations = [...allOrganizations, ...pageOrgs];
          
          // If we got fewer than pageSize, no need to fetch more
          if (pageOrgs.length < pageSize) {
            break;
          }
        } else {
          console.error('Unexpected API response format:', data);
          // If first page has unexpected format, abort
          if (page === 0) {
            return NextResponse.json(
              { message: 'Unexpected API response format' },
              { status: 500 }
            );
          }
          // Otherwise use what we've got
          break;
        }
      } catch (error) {
        console.error(`Error fetching page ${page + 1}:`, error);
        // If first page errors, abort
        if (page === 0) {
          return NextResponse.json(
            { message: 'Error fetching organizations' },
            { status: 500 }
          );
        }
        // Otherwise use what we've got
        break;
      }
    }
    
    // Fix profile picture URLs if present
    const orgsWithFixedImages = allOrganizations.map(org => {
      if (org.ProfilePicture) {
        // Don't append /engage if it's already a full URL or already has /engage
        if (!org.ProfilePicture.startsWith('http') && !org.ProfilePicture.startsWith('/engage')) {
          return {
            ...org,
            ProfilePicture: `/api/organizationImage?imageUrl=${encodeURIComponent(org.ProfilePicture)}`
          };
        }
      }
      return org;
    });
    
    console.log(`Returning ${orgsWithFixedImages.length} total organizations`);
    return NextResponse.json(orgsWithFixedImages, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
  } catch (error) {
    console.error('Error in organizations proxy route:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 