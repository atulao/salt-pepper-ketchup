// app/components/map/campus-building-data.ts
// NJIT campus building coordinates data
export const CAMPUS_BUILDING_COORDINATES: {[key: string]: [number, number]} = {
    "Athletic Field": [40.7437887, -74.1801827],
    "Campus Center": [40.7430696, -74.1783678],
    "Campus Center Room 225": [40.7430696, -74.1783678],
    "Central King Building": [40.7420906, -74.1778214],
    "Central King Building Room 126": [40.7420906, -74.1778214],
    "CKB Room 126": [40.7420906, -74.1778214],
    "Colton Hall": [40.7414151, -74.1780153],
    "Cullimore Hall": [40.7429106, -74.1772846],
    "Cypress Residence Hall": [40.7434447, -74.1793379],
    "Eberhardt Hall": [40.7428189, -74.1770705],
    "Electrical and Computer Engineering Center": [40.741298, -74.178795],
    "Enterprise Development Center": [40.74266, -74.1820514],
    "Facilities Services Building": [40.7438965, -74.1834654],
    "Faculty Memorial Hall": [40.741883, -74.1788393],
    "Fenster Hall": [40.7424805, -74.1770996],
    "Greek Residence Building 17-19": [40.7440691, -74.1792845],
    "Guttenberg Information Technologies Center": [40.7444366, -74.1795393],
    "Laurel Residence Hall": [40.7406338, -74.1793658],
    "Laurel Residence Hall Extension": [40.7410183, -74.1791323],
    "Life Sciences and Engineering Center": [40.7406581, -74.1784262],
    "Maple Hall": [40.7417835, -74.1818441],
    "Maple Hall Building": [40.7417835, -74.1818441],
    "Maple Hall Club Room": [40.7417835, -74.1818441],
    "Maple Hall Kitchen": [40.7417835, -74.1818441],
    "Maple Kitchen": [40.7417835, -74.1818441],
    "Martinson Honors Residence Hall": [40.7414415, -74.1801452],
    "Mechanical Engineering Center": [40.7441029, -74.1785305],
    "Naimoli Family Athletic Center": [40.7423967, -74.1808465],
    "Oak Residence Hall": [40.7401645, -74.1794507],
    "Outdoor Fire Pit": [40.7433, -74.1788], // Approximate location
    "Parking Deck / Student Mall": [40.7430437, -74.1821079],
    "Redwood Residence Hall": [40.7438191, -74.1795721],
    "Redwood Glass Lounge": [40.7438191, -74.1795721],
    "Redwood 1st Floor Lounge": [40.7438191, -74.1795721],
    "Science and Technology Parking Garage": [40.7430612, -74.1820898],
    "Tiernan Hall": [40.7417168, -74.1796476],
    "Weston Hall": [40.7410015, -74.1774215],
    "Wellness and Events Center": [40.7423967, -74.1808465],
    
    // Updated coordinates for Kupfrian Hall and variants
    "Kupfrian Hall": [40.742472, -74.178944],
    "Kupf": [40.742472, -74.178944],
    "Kupfrian": [40.742472, -74.178944],
    "Kupfrian Lecture Hall": [40.742472, -74.178944],
    "Kupfrian 117": [40.742472, -74.178944],
    "Kupfrian 118": [40.742472, -74.178944],
    "Kupfrian 210": [40.742472, -74.178944],
    "Kupf Hall": [40.742472, -74.178944],
    "Kupf 117": [40.742472, -74.178944],
    "Kupf 118": [40.742472, -74.178944],
    "Kupf 210": [40.742472, -74.178944],
    
    // Additional variations of building names
    "Campus Center Ballroom": [40.7430696, -74.1783678],
    "Campus Center Ballroom A": [40.7430696, -74.1783678],
    "Campus Center Ballroom B": [40.7430696, -74.1783678],
    "Campus Center Atrium": [40.7430696, -74.1783678],
    "Campus Center Lobby": [40.7430696, -74.1783678],
    "Campus Center Lobby Atrium": [40.7430696, -74.1783678],
    "NJIT Campus Center": [40.7430696, -74.1783678],
    
    // Generic campus coordinates for buildings that weren't specifically found
    "Campbell Hall": [40.7424259, -74.1784006],
    "Council for Higher Education in Newark Building": [40.7424259, -74.1784006],
    "Greek Residence Building 05-07": [40.7424259, -74.1784006],
    "Greek Residence Building 09-11": [40.7424259, -74.1784006],
    "Greek Residence Building 13-15": [40.7424259, -74.1784006],
    "Greek Residence Building 21-23": [40.7424259, -74.1784006],
    "Green at University Park": [40.7424259, -74.1784006],
    "Microelectronics Center": [40.7424259, -74.1784006],
    "Specht Building": [40.7424259, -74.1784006],
    "York Center": [40.7424259, -74.1784006],
    
    // Default NJIT campus center coordinate as fallback
    "NJIT Campus": [40.7424259, -74.1784006]
};

// Expanded building name aliases
export const BUILDING_NAME_ALIASES: {[key: string]: string} = {
    "CKB": "Central King Building",
    "CKB Room 126": "Central King Building Room 126",
    "GITC": "Guttenberg Information Technologies Center",
    "CC": "Campus Center",
    "CC 225": "Campus Center Room 225",
    "WEC": "Wellness and Events Center",
    "LSEC": "Life Sciences and Engineering Center",
    "MEC": "Mechanical Engineering Center",
    "ECEC": "Electrical and Computer Engineering Center",
    "FMH": "Faculty Memorial Hall",
    "Maple Hall Club": "Maple Hall Club Room",
    "Maple": "Maple Hall",
    "Maple Kitchen": "Maple Hall Kitchen",
    "Campus Center Ballroom": "Campus Center Ballroom",
    "Ballroom": "Campus Center Ballroom",
    "Ballroom B": "Campus Center Ballroom B",
    "NJIT CC": "Campus Center",
    "Fire Pit": "Outdoor Fire Pit",
    "Redwood Glass Lounge": "Redwood Glass Lounge",
    "Redwood 1st Floor Lounge": "Redwood 1st Floor Lounge",
    // Add Kupfrian aliases
    "Kupf": "Kupfrian Hall",
    "KUPF": "Kupfrian Hall",
    "Kupfrian": "Kupfrian Hall",
    "KUPFRIAN": "Kupfrian Hall"
};

// Room-specific mapping for common locations
export const ROOM_TO_BUILDING_MAP: {[key: string]: string} = {
    "Ballroom": "Campus Center",
    "Atrium": "Campus Center",
    "Lobby": "Campus Center",
    "Club Room": "Maple Hall",
    "Kitchen": "Maple Hall",
    "Glass Lounge": "Redwood Residence Hall",
    "1st Floor Lounge": "Redwood Residence Hall",
    "Gym": "Wellness and Events Center",
    "Pool": "Wellness and Events Center",
    "Lecture Hall": "Central King Building"
};

/**
 * Normalizes a building name by checking against aliases and applying
 * standardization rules
 */
export const normalizeBuildingName = (buildingName: string): string => {
    if (!buildingName) return "NJIT Campus";
    
    // Check for direct alias match first (for abbreviations like GITC)
    if (BUILDING_NAME_ALIASES[buildingName]) {
        return BUILDING_NAME_ALIASES[buildingName];
    }
    
    // Handle Kupfrian Hall special case - check if the name contains Kupf or Kupfrian
    if (buildingName.toLowerCase().includes('kupf')) {
        return "Kupfrian Hall";
    }
    
    // Handle room number patterns like "CKB 126" (Building abbreviation + room number)
    const roomPattern = /^([A-Za-z]{1,5})\s*(\d{1,4})$/;
    const roomMatch = buildingName.match(roomPattern);
    
    if (roomMatch) {
        const buildingCode = roomMatch[1].toUpperCase();
        const roomNumber = roomMatch[2];
        
        // Special case for Kupfrian
        if (buildingCode === "KUPF" || buildingCode === "KUPFRIAN") {
            return "Kupfrian Hall";
        }
        
        // Check if building code is a known alias
        if (BUILDING_NAME_ALIASES[buildingCode]) {
            const fullBuildingName = BUILDING_NAME_ALIASES[buildingCode];
            return `${fullBuildingName} Room ${roomNumber}`;
        }
    }
    
    // Check for residence hall specific patterns
    if (buildingName.includes("Lounge") || buildingName.includes("Kitchen") || buildingName.includes("Floor")) {
        for (const hall of ["Redwood", "Cypress", "Oak", "Laurel", "Maple"]) {
            if (buildingName.includes(hall)) {
                // Check existing specific entry first
                if (CAMPUS_BUILDING_COORDINATES[buildingName]) {
                    return buildingName;
                }
                
                // If no exact match, use the residence hall coordinates
                return `${hall} Residence Hall`;
            }
        }
    }
    
    // Check for room-specific mapping
    for (const [room, building] of Object.entries(ROOM_TO_BUILDING_MAP)) {
        if (buildingName.includes(room)) {
            return `${building} ${room}`;
        }
    }
    
    // Handle NJIT prefix
    if (buildingName.startsWith("NJIT ")) {
        return normalizeBuildingName(buildingName.substring(5));
    }
    
    return buildingName;
};

/**
 * Gets coordinates for a building name using multiple matching strategies
 */
export const getBuildingCoordinates = (buildingName: string): [number, number] => {
    // Handle empty case
    if (!buildingName) {
        return CAMPUS_BUILDING_COORDINATES["NJIT Campus"];
    }
    
    // Special case for Kupfrian - check if name contains Kupf
    if (buildingName.toLowerCase().includes('kupf')) {
        return CAMPUS_BUILDING_COORDINATES["Kupfrian Hall"];
    }
    
    // Try exact match first
    if (CAMPUS_BUILDING_COORDINATES[buildingName]) {
        return CAMPUS_BUILDING_COORDINATES[buildingName];
    }
    
    // Try partial match (case insensitive)
    const lowerCaseBuildingName = buildingName.toLowerCase();
    
    // First, search for buildings that contain the entire query
    for (const [key, coords] of Object.entries(CAMPUS_BUILDING_COORDINATES)) {
        if (key.toLowerCase().includes(lowerCaseBuildingName)) {
            return coords;
        }
    }
    
    // Second, check if query contains a known building name
    for (const [key, coords] of Object.entries(CAMPUS_BUILDING_COORDINATES)) {
        const keyLower = key.toLowerCase();
        if (keyLower.length > 5 && lowerCaseBuildingName.includes(keyLower)) {
            return coords;
        }
    }
    
    // Third, for residence halls, check if any part of the name includes a residence hall
    const residenceHalls = ["Redwood", "Cypress", "Oak", "Laurel", "Maple"];
    for (const hall of residenceHalls) {
        if (lowerCaseBuildingName.toLowerCase().includes(hall.toLowerCase())) {
            const hallKey = `${hall} Residence Hall`;
            if (CAMPUS_BUILDING_COORDINATES[hallKey]) {
                return CAMPUS_BUILDING_COORDINATES[hallKey];
            }
        }
    }
    
    // Fourth, try to match key words like "Hall" or "Center"
    const buildingParts = lowerCaseBuildingName.split(/\s+/);
    const buildingTypes = ["hall", "center", "building", "room", "lounge", "kitchen"];
    
    for (const part of buildingParts) {
        if (buildingTypes.includes(part)) {
            // Find the word before this building type
            const index = buildingParts.indexOf(part);
            if (index > 0) {
                const potentialName = `${buildingParts[index-1]} ${part}`;
                
                // Try to find this pattern in our known buildings
                for (const [key, coords] of Object.entries(CAMPUS_BUILDING_COORDINATES)) {
                    if (key.toLowerCase().includes(potentialName)) {
                        return coords;
                    }
                }
            }
        }
    }
    
    // Return default campus coordinate if no match found
    console.log(`No coordinates found for "${buildingName}", using default campus coordinates`);
    return CAMPUS_BUILDING_COORDINATES["NJIT Campus"];
};

/**
 * Generates a Google Maps directions URL to a campus location
 */
export const getDirectionsUrl = (location: string): string => {
    try {
        // Special case for Kupfrian - check if name contains Kupf
        if (location.toLowerCase().includes('kupf')) {
            const coordinates = CAMPUS_BUILDING_COORDINATES["Kupfrian Hall"];
            return `https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}&travelmode=walking`;
        }
        
        // Get building coordinates from the campus data
        const normalizedLocation = normalizeBuildingName(location);
        const coordinates = getBuildingCoordinates(normalizedLocation);
        
        // Add travelmode=walking for campus navigation
        return `https://www.google.com/maps/dir/?api=1&destination=${coordinates[0]},${coordinates[1]}&travelmode=walking`;
    } catch (error) {
        console.error('Error generating directions URL:', error);
        // Fallback
        return `https://www.google.com/maps/dir/?api=1&destination=NJIT+${encodeURIComponent(location)}`;
    }
};