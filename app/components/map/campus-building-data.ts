// NJIT campus building coordinates data
export const CAMPUS_BUILDING_COORDINATES: {[key: string]: [number, number]} = {
    "Athletic Field": [40.7437887, -74.1801827],
    "Campus Center": [40.7430696, -74.1783678],
    "Central King Building": [40.7420906, -74.1778214],
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
    "Maple Hall Building": [40.7417835, -74.1818441],
    "Martinson Honors Residence Hall": [40.7414415, -74.1801452],
    "Mechanical Engineering Center": [40.7441029, -74.1785305],
    "Naimoli Family Athletic Center": [40.7423967, -74.1808465],
    "Oak Residence Hall": [40.7401645, -74.1794507],
    "Parking Deck / Student Mall": [40.7430437, -74.1821079],
    "Redwood Residence Hall": [40.7438191, -74.1795721],
    "Science and Technology Parking Garage": [40.7430612, -74.1820898],
    "Tiernan Hall": [40.7417168, -74.1796476],
    "Weston Hall": [40.7410015, -74.1774215],
    "Wellness and Events Center": [40.7423967, -74.1808465],
    
    // Generic campus coordinates for buildings that weren't specifically found
    "Campbell Hall": [40.7424259, -74.1784006],
    "Council for Higher Education in Newark Building": [40.7424259, -74.1784006],
    "Greek Residence Building 05-07": [40.7424259, -74.1784006],
    "Greek Residence Building 09-11": [40.7424259, -74.1784006],
    "Greek Residence Building 13-15": [40.7424259, -74.1784006],
    "Greek Residence Building 21-23": [40.7424259, -74.1784006],
    "Green at University Park": [40.7424259, -74.1784006],
    "Kupfrian Hall": [40.7424259, -74.1784006],
    "Microelectronics Center": [40.7424259, -74.1784006],
    "Specht Building": [40.7424259, -74.1784006],
    "York Center": [40.7424259, -74.1784006],
    
    // Default NJIT campus center coordinate as fallback
    "NJIT Campus": [40.7424259, -74.1784006]
  };
  
  // Function to get coordinates for a building name
  export const getBuildingCoordinates = (buildingName: string): [number, number] => {
    // Try exact match first
    if (CAMPUS_BUILDING_COORDINATES[buildingName]) {
      return CAMPUS_BUILDING_COORDINATES[buildingName];
    }
    
    // Try partial match (case insensitive)
    const lowerCaseBuildingName = buildingName.toLowerCase();
    for (const [key, coords] of Object.entries(CAMPUS_BUILDING_COORDINATES)) {
      if (key.toLowerCase().includes(lowerCaseBuildingName) || 
          lowerCaseBuildingName.includes(key.toLowerCase())) {
        return coords;
      }
    }
    
    // Return default campus coordinate if no match found
    console.log(`No coordinates found for "${buildingName}", using default campus coordinates`);
    return CAMPUS_BUILDING_COORDINATES["NJIT Campus"];
  };
  
  // Common building name variations and abbreviations mapping
  export const BUILDING_NAME_ALIASES: {[key: string]: string} = {
    "CKB": "Central King Building",
    "GITC": "Guttenberg Information Technologies Center",
    "CC": "Campus Center",
    "WEC": "Wellness and Events Center",
    "LSEC": "Life Sciences and Engineering Center",
    "MEC": "Mechanical Engineering Center",
    "ECEC": "Electrical and Computer Engineering Center",
    "FMH": "Faculty Memorial Hall"
  };
  
  // Function to normalize building names
  export const normalizeBuildingName = (buildingName: string): string => {
    // Check for aliases first
    if (BUILDING_NAME_ALIASES[buildingName]) {
      return BUILDING_NAME_ALIASES[buildingName];
    }
    
    return buildingName;
  };