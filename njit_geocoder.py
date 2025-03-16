import json
import requests
import time

# Load the API key from your gapi.json file (make sure the file is at this location)
with open(r"C:\Users\johnb\Documents\salt-pepper-ketchup\gapi.json", "r") as f:
    data = json.load(f)
    print("Loaded JSON data:", data)

api_key = data.get("key")
if not api_key:
    raise ValueError("API key not found in JSON file. Please check your file structure.")

def get_coordinates_places(building_name, api_key):
    """
    Uses the Google Places API to get building coordinates.
    Returns (lat, lon) if successful; otherwise (None, None).
    """
    url = "https://maps.googleapis.com/maps/api/place/findplacefromtext/json"
    params = {
        "input": f"{building_name}, New Jersey Institute of Technology, Newark, NJ",
        "inputtype": "textquery",
        "fields": "geometry",
        "key": api_key,
        # Bias the search to a 1000m radius around the campus center.
        "locationbias": "circle:1000@40.7424,-74.1784"
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data.get("status") == "OK" and data.get("candidates"):
            loc = data["candidates"][0]["geometry"]["location"]
            return loc["lat"], loc["lng"]
    return None, None

def get_coordinates_geocoding(building_name, api_key):
    """
    Uses the Google Geocoding API as a fallback to get building coordinates.
    Returns (lat, lon) if successful; otherwise (None, None).
    """
    url = "https://maps.googleapis.com/maps/api/geocode/json"
    query = f"{building_name}, New Jersey Institute of Technology, Newark, NJ"
    params = {
        "address": query,
        "key": api_key
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        data = response.json()
        if data.get("status") == "OK" and data.get("results"):
            loc = data["results"][0]["geometry"]["location"]
            return loc["lat"], loc["lng"]
    return None, None

def get_building_coordinates(building_name, api_key):
    """
    First attempts to retrieve coordinates using the Places API.
    If unsuccessful, falls back to the Geocoding API.
    """
    lat, lon = get_coordinates_places(building_name, api_key)
    if lat is None:
        lat, lon = get_coordinates_geocoding(building_name, api_key)
    return lat, lon

# List of NJIT building names (modify or add as needed)
buildings = [
    "Campbell Hall",
    "Athletic Field",
    "Campus Center",
    "Central King Building",
    "Colton Hall",
    "Council for Higher Education in Newark Building",
    "Cullimore Hall",
    "Cypress Residence Hall",
    "Eberhardt Hall",
    "Electrical and Computer Engineering Center",
    "Enterprise Development Center",
    "Facilities Services Building",
    "Facilities Services Building Annex",
    "Facilities Services Warehouse",
    "Faculty Memorial Hall",
    "Fenster Hall",
    "Greek Residence Building 05-07",
    "Greek Residence Building 09-11",
    "Greek Residence Building 13-15",
    "Greek Residence Building 17-19",
    "Greek Residence Building 21-23",
    "Green at University Park",
    "Guttenberg Information Technologies Center",
    "Kupfrian Hall",
    "Laurel Residence Hall",
    "Laurel Residence Hall Extension",
    "Life Sciences and Engineering Center",
    "Maple Hall Building",
    "Martinson Honors Residence Hall",
    "Mechanical Engineering Center",
    "Microelectronics Center",
    "Naimoli Family Athletic Center",
    "Oak Residence Hall",
    "Parking Deck / Student Mall",
    "Redwood Residence Hall",
    "Science and Technology Parking Garage",
    "Specht Building",
    "Tiernan Hall",
    "VentureLink 105",
    "VentureLink 211",
    "Wellness and Events Center",
    "Weston Hall",
    "York Center"
]

results = {}

for building in buildings:
    lat, lon = get_building_coordinates(building, api_key)
    results[building] = (lat, lon)
    print(f"{building}: {lat}, {lon}")
    time.sleep(0.5)  # Delay to respect rate limits

print("\nFinal Results:")
for building, coords in results.items():
    print(f"{building}: Latitude {coords[0]}, Longitude {coords[1]}")
