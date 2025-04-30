import json
from collections import defaultdict
from datetime import datetime

def normalize_title(title):
    # Remove "Online" and clean up the title
    title = title.replace('Online ', '').replace(' (Online)', '')
    # Remove concentration information in parentheses
    if '(' in title and ')' in title:
        title = title[:title.index('(')].strip()
    return title.strip()

def get_degree_level(title):
    if 'Ph.D.' in title:
        return 'Ph.D.'
    elif 'M.S.' in title or 'M.A.' in title or 'MBA' in title or 'Master' in title:
        return 'Masters'
    elif 'B.S.' in title or 'B.A.' in title or 'Bachelor' in title:
        return 'Bachelors'
    return 'Other'

def get_program_type(title):
    if 'Professional Science Master' in title or 'PSM' in title:
        return 'Professional Science Master'
    elif 'Certificate' in title:
        return 'Certificate'
    elif 'Online' in title:
        return 'Online'
    return 'Traditional'

def analyze_degrees():
    with open('scripts/njit_degrees.json', 'r') as f:
        degrees = json.load(f)
    
    # Initialize collections
    major_to_degrees = defaultdict(set)
    degree_to_majors = defaultdict(set)
    degree_levels = defaultdict(int)
    program_types = defaultdict(int)
    online_programs = set()
    certificates = []
    
    for degree in degrees:
        title = degree['degree_title']
        major = degree['major']
        
        # Track certificates
        if 'Certificate' in title:
            certificates.append(title)
            continue
        
        # Track online programs
        if 'Online' in title:
            online_programs.add(normalize_title(title))
        
        # Normalize the title
        normalized_title = normalize_title(title)
        
        # Add to our mappings
        major_to_degrees[major].add(normalized_title)
        degree_to_majors[normalized_title].add(major)
        
        # Track degree levels and program types
        degree_levels[get_degree_level(title)] += 1
        program_types[get_program_type(title)] += 1
    
    # Create output
    output = []
    output.append("\n=== Degree Programs Overview ===")
    output.append(f"Total unique degree programs: {len(degree_to_majors)}")
    output.append(f"Total unique majors: {len(major_to_degrees)}")
    output.append(f"Total certificates: {len(certificates)}")
    output.append(f"Total online programs: {len(online_programs)}")
    
    output.append("\n=== Degree Level Distribution ===")
    for level, count in sorted(degree_levels.items(), key=lambda x: x[1], reverse=True):
        output.append(f"{level}: {count} programs")
    
    output.append("\n=== Program Type Distribution ===")
    for ptype, count in sorted(program_types.items(), key=lambda x: x[1], reverse=True):
        output.append(f"{ptype}: {count} programs")
    
    output.append("\n=== Majors with Multiple Degree Programs ===")
    for major, programs in sorted(major_to_degrees.items(), key=lambda x: len(x[1]), reverse=True):
        if len(programs) > 1:
            output.append(f"\n{major} ({len(programs)} programs):")
            for prog in sorted(programs):
                output.append(f"  - {prog}")
    
    output.append("\n=== Degree Programs with Multiple Majors ===")
    for degree, majors in sorted(degree_to_majors.items(), key=lambda x: len(x[1]), reverse=True):
        if len(majors) > 1:
            output.append(f"\n{degree} ({len(majors)} majors):")
            for major in sorted(majors):
                output.append(f"  - {major}")
    
    output.append("\n=== Online Programs ===")
    for program in sorted(online_programs):
        output.append(f"  - {program}")
    
    output.append("\n=== Certificates ===")
    for cert in sorted(certificates):
        output.append(f"  - {cert}")
    
    # Print to console
    print('\n'.join(output))
    
    # Save to file
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = f'scripts/njit_degrees_majors_analysis_{timestamp}.txt'
    with open(output_file, 'w') as f:
        f.write('\n'.join(output))
    
    print(f"\nAnalysis has been saved to: {output_file}")

if __name__ == "__main__":
    analyze_degrees() 