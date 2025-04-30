import requests
import json

def fetch_degrees(from_index=0, size=100):
    url = "https://www.njit.edu/search-api/corporate/degree/_search"
    
    # Add pagination parameters
    params = {
        "from": from_index,
        "size": size
    }
    
    response = requests.get(url, params=params, headers={"Accept": "application/json"})
    return response.json() if response.status_code == 200 else None

# Initialize empty list for all degrees
all_degrees = []
page = 0
size = 100  # Fetch 100 results per page

while True:
    from_index = page * size
    data = fetch_degrees(from_index, size)
    
    if not data:
        print(f"❌ Failed to fetch page {page + 1}")
        break
    
    hits = data.get('hits', {}).get('hits', [])
    if not hits:  # No more results
        break
        
    # Process the results
    for item in hits:
        source = item.get('_source', {})
        degree_title = source.get('title', 'Unknown Title')
        college = source.get('college', [{}])[0].get('name', 'Unknown College') if source.get('college') else 'Unknown College'
        major = source.get('major', [{}])[0].get('name', 'Unknown Major') if source.get('major') else 'Unknown Major'
        
        all_degrees.append({
            "degree_title": degree_title,
            "college": college,
            "major": major
        })
    
    # Get total hits - fixed the structure to match the API response
    total_hits = data.get('hits', {}).get('total', 0)
    if isinstance(total_hits, dict):  # Handle both possible response formats
        total_hits = total_hits.get('value', 0)
    
    print(f"📝 Fetched {len(hits)} degrees (Page {page + 1}, Total so far: {len(all_degrees)} of {total_hits})")
    
    if len(all_degrees) >= total_hits:
        break
        
    page += 1

# Output results to a JSON file
with open('njit_degrees.json', 'w') as f:
    json.dump(all_degrees, f, indent=2)

print(f"✅ Successfully saved {len(all_degrees)} degrees to njit_degrees.json!")