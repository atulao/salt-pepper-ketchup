// app/api/building-location/route.ts
import { NextResponse } from 'next/server';

// This should match your existing data structure from your geocoding script
interface BuildingCoordinates {
  [key: string]: [number, number] | null;
}

// Store building coordinates (could be loaded from a database or JSON file)
// This uses the data you've already collected with your geocoding script
const buildingCoordinates: BuildingCoordinates = {
  "Campbell Hall": [40.7431, -74.1789],
  "Athletic Field": [40.7418, -74.1767],
  "Campus Center": [40.7424, -74.1784],
  "Central King Building": [40.7414, -74.1789],
  // ... add all other buildings with their coordinates
};

export async function GET(request: Request) {
  // Get the building name from the query parameters
  const { searchParams } = new URL(request.url);
  const buildingName = searchParams.get('name');

  if (!buildingName) {
    return NextResponse.json(
      { error: 'Building name is required' },
      { status: 400 }
    );
  }

  // Find the building coordinates
  let coordinates = null;
  
  // Try exact match first
  if (buildingCoordinates[buildingName]) {
    coordinates = {
      lat: buildingCoordinates[buildingName]?.[0],
      lng: buildingCoordinates[buildingName]?.[1]
    };
  } else {
    // Try partial match if exact match fails
    const buildingKey = Object.keys(buildingCoordinates).find(
      key => key.toLowerCase().includes(buildingName.toLowerCase())
    );
    
    if (buildingKey && buildingCoordinates[buildingKey]) {
      coordinates = {
        lat: buildingCoordinates[buildingKey]?.[0],
        lng: buildingCoordinates[buildingKey]?.[1]
      };
    }
  }

  return NextResponse.json({ coordinates });
}