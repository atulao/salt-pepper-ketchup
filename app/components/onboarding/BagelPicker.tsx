"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, Check, X, Coffee, GraduationCap, BookOpen, Award } from "lucide-react";
import { useBagelData, useOnboardingNavigation } from "../../store/onboardingStore";

interface BagelOption {
  degree_title: string;
  college: string;
  major: string;
  online?: boolean; // Optional property for online programs
}

interface GroupedMajor {
  major: string;
  college: string;
  programs: BagelOption[];
}

interface BagelPickerProps {
  isDarkMode?: boolean;
}

const BagelPicker: React.FC<BagelPickerProps> = ({ isDarkMode = false }) => {
  const router = useRouter();
  const { setBagelData, bagel_type, major_name, college_name } = useBagelData();
  const { nextStep } = useOnboardingNavigation();
  
  // State for data and UI
  const [bagels, setBagels] = useState<BagelOption[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<GroupedMajor | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<BagelOption | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  
  // Filter states
  const [filters, setFilters] = useState({
    showBachelors: true,
    showMasters: true,
    showPhD: true,
    showCertificate: true,
    onlyOnline: false,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Group programs by major
  const groupedMajors = useMemo(() => {
    const majorsMap = new Map<string, GroupedMajor>();
    
    // Apply degree type filters
    const filteredBagels = bagels.filter(bagel => {
      const degreeTitle = bagel.degree_title.toLowerCase();
      
      // Check online filter
      if (filters.onlyOnline && !degreeTitle.includes('online')) {
        return false;
      }
      
      // Check degree type filters
      if (
        (degreeTitle.includes('b.s.') || degreeTitle.includes('b.a.') || degreeTitle.includes('bachelor')) && !filters.showBachelors ||
        (degreeTitle.includes('m.s.') || degreeTitle.includes('m.a.') || degreeTitle.includes('master')) && !filters.showMasters ||
        (degreeTitle.includes('ph.d') || degreeTitle.includes('doctor')) && !filters.showPhD ||
        (degreeTitle.includes('certificate')) && !filters.showCertificate
      ) {
        return false;
      }
      
      return true;
    });
    
    // Group filtered programs by major
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
    
    return Array.from(majorsMap.values())
      .sort((a, b) => a.major.localeCompare(b.major));
  }, [bagels, filters]);

  // Filtered majors based on search query
  const filteredMajors = useMemo(() => {
    return query === ''
      ? groupedMajors
      : groupedMajors.filter((major) => {
          return major.major.toLowerCase().includes(query.toLowerCase()) ||
                 major.college.toLowerCase().includes(query.toLowerCase()) ||
                 major.programs.some(program => 
                   program.degree_title.toLowerCase().includes(query.toLowerCase())
                 );
        });
  }, [groupedMajors, query]);

  // Fetch degree data
  useEffect(() => {
    setLoading(true);
    fetch("/api/onboarding/majors")
      .then((res) => res.json())
      .then((data) => {
        // Add online flag based on degree title
        const processedData = data.map((item: BagelOption) => ({
          ...item,
          online: item.degree_title.toLowerCase().includes('online')
        }));
        setBagels(processedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching majors:', error);
        setLoading(false);
      });
  }, []);

  // Initialize with existing data from store
  useEffect(() => {
    if (major_name && college_name) {
      // Find matching major group
      const existingMajor = groupedMajors.find(m => m.major === major_name);
      if (existingMajor) {
        setSelectedMajor(existingMajor);
        setQuery(existingMajor.major);
        
        // Find specific program if bagel_type is set
        if (bagel_type) {
          const program = existingMajor.programs.find(p => p.degree_title === bagel_type);
          if (program) {
            setSelectedProgram(program);
          }
        }
      }
    }
  }, [groupedMajors, major_name, college_name, bagel_type]);

  // Handle major selection
  const handleSelectMajor = (major: GroupedMajor) => {
    setSelectedMajor(major);
    setIsOpen(false);
    setQuery(major.major);
    
    // If only one program, auto-select it
    if (major.programs.length === 1) {
      setSelectedProgram(major.programs[0]);
    } else {
      setSelectedProgram(null);
    }
  };

  // Handle program selection
  const handleSelectProgram = (program: BagelOption) => {
    setSelectedProgram(program);
  };

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
    if (e.target.value === '' && selectedMajor) {
      setSelectedMajor(null);
      setSelectedProgram(null);
    }
  };

  // Handle filter toggle
  const toggleFilter = (filterName: keyof typeof filters) => {
    setFilters({
      ...filters,
      [filterName]: !filters[filterName]
    });
  };

  // Navigate to next step
  const handleNext = () => {
    if (!selectedProgram) return;
    
    // Update the store
    setBagelData({
      bagel_type: selectedProgram.degree_title,
      major_name: selectedProgram.major,
      college_name: selectedProgram.college,
    });
    
    // Navigate to next step
    nextStep();
    router.push("/onboarding/step2");
  };

  // Get degree type icon
  const getDegreeIcon = (degreeTitle: string) => {
    const title = degreeTitle.toLowerCase();
    if (title.includes('ph.d') || title.includes('doctor')) {
      return <Award className="h-5 w-5 text-purple-500" />;
    } else if (title.includes('m.s.') || title.includes('m.a.') || title.includes('master')) {
      return <BookOpen className="h-5 w-5 text-blue-500" />;
    } else if (title.includes('b.s.') || title.includes('b.a.') || title.includes('bachelor')) {
      return <GraduationCap className="h-5 w-5 text-green-500" />;
    } else if (title.includes('certificate')) {
      return <Award className="h-5 w-5 text-amber-500" />;
    }
    return <GraduationCap className="h-5 w-5 text-gray-500" />;
  };

  // Get degree type as text
  const getDegreeType = (degreeTitle: string): string => {
    const title = degreeTitle.toLowerCase();
    if (title.includes('ph.d') || title.includes('doctor')) return "Ph.D.";
    if (title.includes('m.s.') || title.includes('m.a.') || title.includes('master')) return "Master's";
    if (title.includes('b.s.') || title.includes('b.a.') || title.includes('bachelor')) return "Bachelor's";
    if (title.includes('certificate')) return "Certificate";
    return "Other";
  };

  return (
    <div className={`relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 font-serif text-amber-600">
        LemmeGetta Bagel🥯
        </h1>
        <p className="text-lg text-gray-600 mb-6">
        What academic flavor are you cravin'?
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <div className="relative">
            <input
              type="text"
              className={`w-full h-12 pl-10 pr-4 rounded-lg border-2 border-amber-300 focus:border-amber-500 focus:outline-none ${
                isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
              }`}
              placeholder="Search for your major..."
              value={query}
              onChange={handleInputChange}
              onClick={() => setIsOpen(true)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-amber-500" />
            </div>
            {query && (
              <button 
                className="absolute inset-y-0 right-0 flex items-center pr-3"
                onClick={() => {
                  setQuery('');
                  setSelectedMajor(null);
                  setSelectedProgram(null);
                }}
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Dropdown results */}
          {isOpen && query && (
            <div className={`absolute z-10 mt-1 w-full shadow-lg max-h-80 rounded-md py-1 text-base overflow-auto focus:outline-none ${
              isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
            }`}>
              {filteredMajors.length === 0 ? (
                <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                  No majors found.
                </div>
              ) : (
                filteredMajors.map((major) => (
                  <div
                    key={major.major}
                    className={`relative cursor-pointer select-none py-3 pl-5 pr-9 hover:bg-amber-50 hover:text-amber-900 ${
                      selectedMajor?.major === major.major ? 'bg-amber-50 text-amber-900' : isDarkMode ? 'text-white hover:text-gray-900' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelectMajor(major)}
                  >
                    <div className="flex flex-col">
                      <span className={`block truncate font-medium ${selectedMajor?.major === major.major ? 'font-semibold' : ''}`}>
                        {major.major}
                      </span>
                      <span className="block truncate text-sm text-gray-500">
                        {major.college} • {major.programs.length} program{major.programs.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {selectedMajor?.major === major.major && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-amber-600">
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Filter Button */}
        <button 
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 ${
            showFilters 
              ? 'bg-amber-100 border-amber-300 text-amber-800' 
              : 'border-gray-300 hover:bg-gray-100'
          }`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </button>

        {/* View Toggle */}
        <div className="flex rounded-lg border-2 border-gray-300 overflow-hidden">
          <button 
            className={`flex-1 px-4 py-2 ${viewMode === 'grid' ? 'bg-amber-100 text-amber-800' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={`flex-1 px-4 py-2 ${viewMode === 'list' ? 'bg-amber-100 text-amber-800' : 'bg-white hover:bg-gray-100'}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className={`mb-6 p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <h3 className="font-medium mb-3">Filter by degree type:</h3>
          <div className="flex flex-wrap gap-3">
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.showBachelors ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => toggleFilter('showBachelors')}
            >
              Bachelor's
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.showMasters ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => toggleFilter('showMasters')}
            >
              Master's
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.showPhD ? 'bg-purple-100 text-purple-800' : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => toggleFilter('showPhD')}
            >
              Ph.D.
            </button>
            <button
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.showCertificate ? 'bg-amber-100 text-amber-800' : 'bg-gray-200 text-gray-600'
              }`}
              onClick={() => toggleFilter('showCertificate')}
            >
              Certificate
            </button>

            <div className="ml-auto">
              <button
                className={`px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 ${
                  filters.onlyOnline ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-200 text-gray-600'
                }`}
                onClick={() => toggleFilter('onlyOnline')}
              >
                <Coffee className="h-4 w-4" />
                Online Only
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-500 border-r-transparent"></div>
        </div>
      ) : (
        <>
          {/* Content area */}
          {selectedMajor ? (
            // Selected major details
            <div className="mt-4 p-6 rounded-lg border border-amber-200 bg-amber-50">
              <div className="mb-2 text-xl font-bold text-amber-800">{selectedMajor.major}</div>
              <div className="mb-4 text-sm text-gray-600">{selectedMajor.college}</div>

              <h3 className="font-medium mb-2 text-gray-700">Available Programs:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {selectedMajor.programs.map((program) => (
                  <div 
                    key={program.degree_title}
                    className={`p-3 rounded border cursor-pointer ${
                      selectedProgram?.degree_title === program.degree_title
                        ? 'border-amber-500 bg-amber-100'
                        : 'border-gray-200 hover:bg-amber-50'
                    }`}
                    onClick={() => handleSelectProgram(program)}
                  >
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        {getDegreeIcon(program.degree_title)}
                      </div>
                      <div>
                        <div className="font-medium">{program.degree_title}</div>
                        <div className="text-sm text-gray-500">
                          {getDegreeType(program.degree_title)}
                          {program.online && <span className="ml-2 text-indigo-600">• Online</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNext}
                disabled={!selectedProgram}
                className={`w-full py-3 rounded-md font-medium transition-colors ${
                  selectedProgram
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Continue to Step 2
              </button>
            </div>
          ) : (
            // Grid or list view of all majors
            <>
              {filteredMajors.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No programs match your search criteria.</p>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}>
                  {filteredMajors.map((major) => (
                    <div
                      key={major.major}
                      className={`${
                        viewMode === 'grid' 
                          ? 'p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md cursor-pointer' 
                          : 'p-4 rounded-lg border border-gray-200 hover:border-amber-300 hover:shadow-md cursor-pointer'
                      } ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
                      onClick={() => handleSelectMajor(major)}
                    >
                      <h3 className="font-bold text-lg mb-1 text-amber-600">{major.major}</h3>
                      <p className="text-sm text-gray-500 mb-2">{major.college}</p>
                      
                      <div className="flex flex-wrap gap-1 mb-2">
                        {/* Degree types available */}
                        {Array.from(new Set(major.programs.map(p => getDegreeType(p.degree_title)))).map(type => (
                          <span key={type} className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${
                            type === 'Bachelor\'s' ? 'bg-green-100 text-green-800' :
                            type === 'Master\'s' ? 'bg-blue-100 text-blue-800' :
                            type === 'Ph.D.' ? 'bg-purple-100 text-purple-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {type}
                          </span>
                        ))}
                        
                        {/* Online indicator if any program is online */}
                        {major.programs.some(p => p.online) && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-indigo-100 text-indigo-800">
                            <Coffee className="h-3 w-3 mr-1" />
                            Online
                          </span>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-600">
                        {major.programs.length} program{major.programs.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default BagelPicker; 