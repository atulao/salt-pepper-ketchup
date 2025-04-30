import React, { useMemo, useState } from 'react';
import { GraduationCap, Globe, FileText, X, Search } from 'lucide-react';

interface BagelOption {
  degree_title: string;
  college: string;
  major: string;
}

interface BagelPickerProps {
  bagels: BagelOption[];
  search: string;
  selected: { group: string; idx: number } | null;
  handleSelect: (group: string, idx: number) => void;
}

// Helper types for grouped data
interface MajorGroup {
  major: string;
  college: string;
  programs: BagelOption[];
}

function isCertificate(degreeTitle: string) {
  return degreeTitle.toLowerCase().includes('certificate');
}

function isOnline(degreeTitle: string) {
  return degreeTitle.toLowerCase().includes('online');
}

function getDegreeType(degreeTitle: string) {
  if (/ph\.?d/i.test(degreeTitle)) return "Ph.D.";
  if (/b\.?s\.?|bachelor/i.test(degreeTitle)) return "Bachelor's";
  if (/m\.?s\.?|master/i.test(degreeTitle)) return "Master's";
  if (isCertificate(degreeTitle)) return "Certificate";
  return "Other";
}

// Color mappings for badges
const DEGREE_TYPE_COLORS: Record<string, string> = {
  "Bachelor's": 'bg-blue-100 text-blue-800',
  "Master's": 'bg-green-100 text-green-800',
  "Ph.D.": 'bg-purple-100 text-purple-800',
  "Certificate": 'bg-yellow-100 text-yellow-800',
  "Other": 'bg-gray-100 text-gray-700',
};

const BagelPicker: React.FC<BagelPickerProps> = ({ 
  bagels, 
  search, 
  selected, 
  handleSelect 
}) => {
  // Filters
  const [collegeFilter, setCollegeFilter] = useState<string>('All');
  const [pageSize, setPageSize] = useState<number>(24);

  // Get unique colleges for filtering
  const colleges = useMemo(() => [
    'All',
    ...Array.from(new Set(bagels.map(b => b.college))).sort()
  ], [bagels]);
  
  // Group bagels by major name and collect unique colleges per major
  const groupedMajors: MajorGroup[] = useMemo(() => {
    // First, filter by search and college
    const filteredBagels = bagels.filter(b =>
      (collegeFilter === 'All' || b.college === collegeFilter) &&
      (!search.trim() ||
        b.degree_title.toLowerCase().includes(search.trim().toLowerCase()) ||
        b.college.toLowerCase().includes(search.trim().toLowerCase()) ||
        b.major.toLowerCase().includes(search.trim().toLowerCase())
      )
    );

    // Then group by major
    const majorsMap = new Map<string, MajorGroup>();
    
    filteredBagels.forEach(bagel => {
      if (!majorsMap.has(bagel.major)) {
        majorsMap.set(bagel.major, {
          major: bagel.major,
          college: bagel.college,
          programs: []
        });
      }
      
      majorsMap.get(bagel.major)!.programs.push(bagel);
    });
    
    // Convert to array and sort by major name
    return Array.from(majorsMap.values())
      .sort((a, b) => a.major.localeCompare(b.major));
      
  }, [bagels, collegeFilter, search]);

  // Get the first program index for a major (for selection)
  const getFirstProgramIndex = (major: string) => {
    return bagels.findIndex(b => b.major === major);
  };

  return (
    <div>
      {/* Filter Pills - College only */}
      <div className="space-y-4 mb-6">
        {/* Colleges */}
        <div className="flex flex-wrap gap-2">
          {colleges.map(college => (
            <button
              key={college}
              onClick={() => setCollegeFilter(college)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${collegeFilter === college
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {college}
            </button>
          ))}
        </div>
      </div>

      {/* Major Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groupedMajors.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No programs found matching your criteria
          </div>
        ) : (
          groupedMajors.slice(0, pageSize).map((group) => {
            const isSelectedMajor = selected && selected.group === group.major;
            const programCount = group.programs.length;
            const hasCertificates = group.programs.some(p => isCertificate(p.degree_title));
            const hasOnline = group.programs.some(p => isOnline(p.degree_title));
            
            return (
              <button
                key={group.major}
                onClick={() => handleSelect(group.major, getFirstProgramIndex(group.major))}
                className={`group relative p-6 rounded-xl text-left transition-all
                  ${isSelectedMajor
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {group.major}
                    </h3>
                    <p className="text-sm text-gray-600">{group.college}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {programCount} program{programCount !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {/* Show possible degree types */}
                  {Array.from(new Set(group.programs.map(p => getDegreeType(p.degree_title)))).map(type => (
                    <span key={type} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700">
                      {type}
                    </span>
                  ))}
                </div>

                {/* Indicators */}
                <div className="flex items-center gap-2 mt-4">
                  {hasOnline && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Globe className="h-3.5 w-3.5" />
                      <span>Online Available</span>
                    </div>
                  )}
                  
                  {hasCertificates && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 ml-2">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Certificates</span>
                    </div>
                  )}
                </div>

                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm text-blue-600 font-medium">
                    Select →
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Load More Button */}
      {groupedMajors.length > pageSize && (
        <div className="text-center mt-8">
          <button
            onClick={() => setPageSize(p => p + 24)}
            className="px-6 py-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            Load more options...
          </button>
        </div>
      )}
    </div>
  );
};

export default BagelPicker; 