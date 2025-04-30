"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import TopNavBar from "../../components/TopNavBar";
import { Search, ChevronDown, Check, X } from "lucide-react";

interface BagelOption {
  degree_title: string;
  college: string;
  major: string;
}

interface GroupedMajor {
  major: string;
  college: string;
  programs: BagelOption[];
}

const OnboardingStep1: React.FC = () => {
  const router = useRouter();
  const [bagels, setBagels] = useState<BagelOption[]>([]);
  const [selectedMajor, setSelectedMajor] = useState<GroupedMajor | null>(null);
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Group programs by major
  const groupedMajors = useMemo(() => {
    const majorsMap = new Map<string, GroupedMajor>();
    
    bagels.forEach(bagel => {
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
  }, [bagels]);

  // Filtered majors based on query
  const filteredMajors = useMemo(() => {
    return query === ''
      ? groupedMajors
      : groupedMajors.filter((major) => {
          return major.major.toLowerCase().includes(query.toLowerCase()) ||
                 major.college.toLowerCase().includes(query.toLowerCase());
        });
  }, [groupedMajors, query]);

  useEffect(() => {
    setMounted(true);
    setLoading(true);
    fetch("/api/onboarding/majors")
      .then((res) => res.json())
      .then((data) => {
        setBagels(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching majors:', error);
        setLoading(false);
      });
  }, []);

  const handleSelect = (major: GroupedMajor) => {
    setSelectedMajor(major);
    setIsOpen(false);
    setQuery(major.major);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
    if (e.target.value === '' && selectedMajor) {
      setSelectedMajor(null);
    }
  };

  const handleInputClick = () => {
    setIsOpen(true);
  };

  const handleNext = () => {
    if (!selectedMajor || selectedMajor.programs.length === 0) return;
    
    // Use the first program of this major
    const selectedProgram = selectedMajor.programs[0];
    
    localStorage.setItem("onboarding_bagel", JSON.stringify({
      bagel_type: selectedProgram.degree_title,
      major_name: selectedProgram.major,
      college_name: selectedProgram.college,
    }));
    
    router.push("/onboarding/step2");
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-gray-900">
            Find Your Path at NJIT
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Select your academic program to continue
          </p>
          
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-solid border-blue-500 border-r-transparent"></div>
            </div>
          ) : (
            <div className="max-w-xl mx-auto">
              {/* Custom Select Component */}
              <div className="relative">
                <div className="relative w-full">
                  <input
                    type="text"
                    className="w-full h-14 px-5 py-3 pr-12 rounded-lg border-2 border-gray-200 focus:border-blue-500 focus:outline-none text-lg"
                    placeholder="Search for your major..."
                    value={query}
                    onChange={handleInputChange}
                    onClick={handleInputClick}
                  />
                  <button 
                    className="absolute inset-y-0 right-0 flex items-center pr-4"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    {selectedMajor ? (
                      <X 
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMajor(null);
                          setQuery('');
                        }}
                      />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                
                {isOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base overflow-auto focus:outline-none">
                    {filteredMajors.length === 0 ? (
                      <div className="relative cursor-default select-none py-2 px-4 text-gray-500">
                        No majors found.
                      </div>
                    ) : (
                      filteredMajors.map((major) => (
                        <div
                          key={major.major}
                          className={`relative cursor-pointer select-none py-3 pl-5 pr-9 hover:bg-blue-50 hover:text-blue-900 ${
                            selectedMajor?.major === major.major ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                          }`}
                          onClick={() => handleSelect(major)}
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
                            <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                              <Check className="h-5 w-5" aria-hidden="true" />
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
              
              {/* Program selection details */}
              {selectedMajor && (
                <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="mb-2 text-lg font-semibold text-gray-900">{selectedMajor.major}</div>
                  <div className="mb-4 text-sm text-gray-600">{selectedMajor.college}</div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {selectedMajor.programs.length} program{selectedMajor.programs.length !== 1 ? 's' : ''}
                    </span>
                    
                    {/* Show program types */}
                    {Array.from(new Set(selectedMajor.programs.map(p => {
                      const type = p.degree_title.split(' ')[0];
                      return type === 'Certificate' ? 'Certificate' :
                             /ph\.?d/i.test(p.degree_title) ? "Ph.D." :
                             /m\.?s\.?|master/i.test(p.degree_title) ? "Master's" :
                             /b\.?s\.?|bachelor/i.test(p.degree_title) ? "Bachelor's" : type;
                    }))).map(type => (
                      <span key={type} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-100 text-gray-700">
                        {type}
                      </span>
                    ))}
                  </div>
                  
                  <button
                    onClick={handleNext}
                    className="w-full py-3 rounded-md font-medium transition-colors bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Continue to Step 2
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default OnboardingStep1; 