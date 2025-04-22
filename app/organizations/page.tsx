'use client'; // Start as client component for potential future data fetching hooks

import React, { useEffect, useState, useRef } from 'react';
import TopNavBar from '../components/TopNavBar';
import Link from 'next/link';
import { Users, Loader, Search, Filter, List, Grid, Info, ArrowRight } from 'lucide-react'; // Add Info icon and ArrowRight for tag text
import Image from 'next/image'; // Import Image for profile pictures
import '../styles/organizationAvatar.css'; // Import the avatar styles
import { useDarkMode } from '../utils/theme-utils'; // Import the hook
// Import the tag styles configuration
import { getTagStyle } from '../config/organizationTagStyles';
// Import the new component
import ExpandableText from '../components/ExpandableText';

// Define a type for the organization data from the API
interface Organization {
  Id: string; // Assuming an ID field exists, often useful as key
  Name: string; // Original name from API
  WebsiteKey: string; // Used to build the link to the org's page
  ProfilePicture?: string; // Optional profile picture URL
  Summary?: string; // Optional short description
  CategoryNames?: string[]; // Optional categories
  tags?: string[]; // Added for the new tagging system
  displayName?: string; // Added for the canonical/display name
}

// Interface for the organization category mapping
interface OrgCategoryMapping {
  name: string;
  tags: string[];
}

// Simple tooltip component
const Tooltip: React.FC<{
  content: string;
  children: React.ReactNode;
}> = ({ content, children }) => {
  const [show, setShow] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
      onFocus={() => setShow(true)}
      onBlur={() => setShow(false)}
    >
      {children}
      {show && (
        <div 
          ref={tooltipRef}
          className="absolute z-50 w-64 p-2 text-xs text-left bg-black text-white rounded shadow-lg transition-opacity opacity-100"
          style={{
            bottom: 'calc(100% + 5px)',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          {content}
          <div 
            className="absolute w-2 h-2 bg-black rotate-45"
            style={{
              bottom: '-4px',
              left: 'calc(50% - 4px)'
            }}
          />
        </div>
      )}
    </div>
  );
};

// *** Add helper function here ***
const normalizeOrgName = (name: string): string => {
  if (!name) return ''; // Handle null or undefined names
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')                   // Replace multiple spaces with single space
    .replace(/\(.*?\)/g, '')                // Remove parentheses and their contents (non-greedy)
    .replace(/&/g, 'and')                  // Replace & with "and"
    .trim();                                 // Trim again after replacements
};
// *** End helper function ***

// *** Add special mappings here ***
const SPECIAL_MAPPINGS: { [key: string]: string } = {
  // "Anime Club": "NJIT Anime Club", // Ensure this line is removed or commented out
  "NJIT ID Card Photo Submission - For Fall 2023 incoming students only": "NJIT ID Card Photo Submission",
  "The Murray Center for Women in Technology": "Murray Center for Women in Technology" 
};
// *** End special mappings ***

const OrganizationsPage: React.FC = () => {
  // Use the hook to get theme state
  const isDarkMode = useDarkMode();
  
  // State management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<Organization[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]); // Store all organizations
  const [hasMore, setHasMore] = useState(true); // Whether there are more orgs to load
  const [currentPage, setCurrentPage] = useState(0); // Current page (starting from 0)
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading more indicator
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // New state for the improved category system
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryMappings, setCategoryMappings] = useState<OrgCategoryMapping[]>([]);
  const [categoryDescriptions, setCategoryDescriptions] = useState<Record<string, string>>({});
  
  const PAGE_SIZE = 50; // Number of organizations to fetch per page

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Add a timestamp to bust the cache
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/organizationCategories?t=${timestamp}`);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        setAvailableCategories(data.categories);
        setCategoryMappings(data.organizationCategories);
        setCategoryDescriptions(data.categoryDescriptions || {});
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchOrganizations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Add timestamp to bust cache
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/organizations?t=${timestamp}`);

        if (!response.ok) {
          let errorData = { message: `HTTP Error: ${response.status} ${response.statusText}` };
          try {
            errorData = await response.json();
          } catch (parseError) {
            // Ignore if response body isn't JSON
          }
          throw new Error(errorData.message || `HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          console.log('Category mappings available:', categoryMappings.length > 0 ? 'Yes' : 'No', categoryMappings.length);
          
          // *** Start Enhanced Debugging ***
          console.log("--- Debugging: Starting organization tag mapping for", data.length, "organizations");
          
          // Add tags from the category mappings to each organization
          const orgsWithTags = data.map(org => {
            
            let mapping: OrgCategoryMapping | undefined;
            let displayName: string = org.Name; // Default display name to original

            // --- Start Robust Matching Logic ---
            // 0. Check for special case mappings first
            const specialCaseTargetName = SPECIAL_MAPPINGS[org.Name];
            if (specialCaseTargetName) {
              mapping = categoryMappings.find(m => m.name === specialCaseTargetName);
              if (mapping) {
                 displayName = mapping.name; // Use the canonical name from mapping
              }
            }

            // 1. If no special mapping, try exact match 
            if (!mapping) {
              mapping = categoryMappings.find(m => m.name === org.Name);
              if (mapping) {
                 displayName = mapping.name; // Use the canonical name from mapping
              }
            }
            
            // 2. If no exact match, try normalized match
            if (!mapping && org.Name) { 
              const normalizedOrgName = normalizeOrgName(org.Name);
              if (normalizedOrgName) { 
                 mapping = categoryMappings.find(m => normalizeOrgName(m.name) === normalizedOrgName);
                 if (mapping) {
                    displayName = mapping.name; // Use the canonical name from mapping
                 }
              }
            }
            // --- End Robust Matching Logic ---
            
            // Add additional logging specifically for the 3 problem orgs if they STILL fail
            if (!mapping && (
              org.Name === "Anime Club" || 
              org.Name === "NJIT ID Card Photo Submission - For Fall 2023 incoming students only" ||
              org.Name === "The Murray Center for Women in Technology"
            )) {
              console.log(`--- Debugging: Still NO MATCH for "${org.Name}" after special & normalized checks.`);
              const normalizedOrgName = normalizeOrgName(org.Name);
              console.log(`    Normalized name: "${normalizedOrgName}"`);
              
              // Find potential matches based on normalized similarity (basic check)
              const potentialMatches = categoryMappings
                .map(m => ({
                  name: m.name,
                  normalized: normalizeOrgName(m.name),
                  similarity: 0 // Placeholder for basic similarity
                }))
                .map(m => {
                  const similarity = [...m.normalized].filter(c => normalizedOrgName.includes(c)).length / 
                                   Math.max(m.normalized.length, normalizedOrgName.length, 1); // Avoid div by zero
                  m.similarity = similarity;
                  return m;
                })
                .filter(m => m.similarity > 0.6) // Show only >60% overlap
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 5); // Limit to top 5
              
              console.log(`    Potential close normalized matches in mappings:`, potentialMatches.map(p => `"${p.name}" (Similarity: ${p.similarity.toFixed(2)})`));
            } else if (!mapping && org.Name) {
               // Standard log for any other unexpected failure
               console.log(`--- Debugging: NO MATCH FOUND for "${org.Name}" after all checks - assigning 'Other / Needs Review'`);
            }

            return {
              ...org, // Keep original org data (like Id, WebsiteKey, ProfilePicture, Summary, and original Name)
              displayName: displayName, // Add the name we want to display and search
              tags: mapping ? mapping.tags : ["Other / Needs Review"]
            };
          });

          // Cleaned up logging: Only show final list of failures
          const untaggedOrgs = orgsWithTags.filter(org => 
             org.tags && org.tags.includes("Other / Needs Review")
          );
          console.log(`--- Debugging: Final count of organizations with 'Other / Needs Review' tag: ${untaggedOrgs.length}`);
          if (untaggedOrgs.length > 0) {
              console.log("--- Debugging: Final list of orgs with 'Other / Needs Review':", 
                untaggedOrgs.map(org => `"${org.Name}"`)
              );
          }
          // Remove the previous problematic org check section as it's now less relevant

          // *** Add Initial Alphabetical Sort Here ***
          orgsWithTags.sort((a, b) => {
            const nameA = (a.displayName || a.Name || '').toLowerCase();
            const nameB = (b.displayName || b.Name || '').toLowerCase();
            if (nameA < nameB) return -1;
            if (nameA > nameB) return 1;
            return 0;
          });
          // *** End Initial Sort ***

          setAllOrganizations(orgsWithTags);
          setOrganizations(orgsWithTags.slice(0, PAGE_SIZE));
          setFilteredOrganizations(orgsWithTags.slice(0, PAGE_SIZE));
          
          setHasMore(orgsWithTags.length > PAGE_SIZE);
          setCurrentPage(1);
          
          console.log(`Retrieved and initially sorted ${orgsWithTags.length} total organizations from API`);
        } else {
          console.error("Proxy response was not an array:", data);
          throw new Error('Unexpected response format from proxy');
        }
      } catch (err) {
        console.error("Error fetching organizations:", err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        setOrganizations([]);
        setAllOrganizations([]);
        setFilteredOrganizations([]);
      } finally {
        setIsLoading(false);
      }
    };

    // This depends on categoryMappings being populated
    if (categoryMappings.length > 0) {
      // *** Add logging here ***
      console.log("--- Debugging: Category mappings loaded:", categoryMappings.length, "total");
      // Optional: Log all names if needed (can be very long)
      // console.log("--- Debugging: Mapping names:", categoryMappings.map(m => m.name));
      // *** End logging ***
      fetchOrganizations();
    }
  }, [categoryMappings]);

  // Filter organizations based on search term and selected categories
  useEffect(() => {
    if (allOrganizations.length === 0) return;

    // If "Other / Needs Review" is selected, log detailed information
    if (selectedCategories.includes("Other / Needs Review")) {
      console.log("--- Debugging: Filtering useEffect triggered with 'Other / Needs Review' selected");
      const orgsWithOtherTag = allOrganizations.filter(org => 
        org.tags && org.tags.includes("Other / Needs Review")
      );
      console.log("--- Debugging: Orgs in allOrganizations with 'Other / Needs Review' tag:", orgsWithOtherTag.map(org => org.Name));
      
      // Optional: Log details for each org with the tag
      // orgsWithOtherTag.forEach(org => {
      //   console.log(`--- Debugging: ${org.Name} has tag "Other / Needs Review":`, org.tags);
      // });
    }

    // First, create a list of all orgs that match the search term
    let searchMatched = allOrganizations.filter(org => {
      // *** Update Search Logic ***
      const searchTermLower = searchTerm.toLowerCase();
      const originalNameMatch = org.Name?.toLowerCase().includes(searchTermLower);
      const displayNameMatch = org.displayName?.toLowerCase().includes(searchTermLower); // Check displayName too
      const summaryMatch = org.Summary?.toLowerCase().includes(searchTermLower);
      
      return searchTerm === '' || originalNameMatch || displayNameMatch || summaryMatch;
      // *** End Update ***
    });
    
    // Next, filter by selected categories
    let finalFilteredOrgs = searchMatched; // Start with search results

    if (selectedCategories.length > 0) {
      finalFilteredOrgs = searchMatched.filter(org => {
        return org.tags && org.tags.some(tag => selectedCategories.includes(tag));
      });

      // *** Add Sorting Logic Here ***
      // Sort alphabetically by displayName (fallback to Name) only if categories are selected
      finalFilteredOrgs.sort((a, b) => {
        const nameA = (a.displayName || a.Name || '').toLowerCase();
        const nameB = (b.displayName || b.Name || '').toLowerCase();
        if (nameA < nameB) return -1;
        if (nameA > nameB) return 1;
        return 0;
      });
      // *** End Sorting Logic ***

      // Log for debugging women-led organizations
      if (selectedCategories.includes('Women-led')) {
        const womenLedOrgs = allOrganizations.filter(org => 
          org.tags && org.tags.includes('Women-led')
        );
        console.log(`Total Women-led organizations: ${womenLedOrgs.length}`);
        console.log('Women-led organizations:', womenLedOrgs.map(org => org.Name));
        
        const filteredWomenLed = finalFilteredOrgs.filter(org => 
          org.tags && org.tags.includes('Women-led')
        );
        console.log(`Filtered Women-led organizations: ${filteredWomenLed.length}`);
        console.log('Filtered Women-led:', filteredWomenLed.map(org => org.Name));
      }
    }
    // If no categories are selected, finalFilteredOrgs remains the searchMatched result (unsorted by name unless search itself implies order)

    // Update filtered organizations and pagination state using the potentially sorted list
    setFilteredOrganizations(finalFilteredOrgs.slice(0, currentPage * PAGE_SIZE));
    setHasMore(finalFilteredOrgs.length > currentPage * PAGE_SIZE);
  }, [searchTerm, selectedCategories, allOrganizations, currentPage]);

  // Function to load more organizations
  const loadMore = async () => {
    if (!hasMore || isLoadingMore) return;
    
    setIsLoadingMore(true);
    
    setTimeout(() => {
      try {
        const nextPage = currentPage + 1;
        const end = nextPage * PAGE_SIZE;
        
        // Update the filtered organizations based on current filters
        let filtered = allOrganizations.filter(org => {
          const matchesSearch = searchTerm === '' ||
            // Match against both display and original name
            org.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            org.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (org.Summary && org.Summary.toLowerCase().includes(searchTerm.toLowerCase()));

          const matchesCategories = selectedCategories.length === 0 ||
            (org.tags && org.tags.some(tag => selectedCategories.includes(tag)));

          return matchesSearch && matchesCategories;
        });

        // Apply sorting if categories are selected when loading more too
        if (selectedCategories.length > 0) {
           filtered.sort((a, b) => {
             const nameA = (a.displayName || a.Name || '').toLowerCase();
             const nameB = (b.displayName || b.Name || '').toLowerCase();
             if (nameA < nameB) return -1;
             if (nameA > nameB) return 1;
             return 0;
           });
        }

        setFilteredOrganizations(filtered.slice(0, end));
        setCurrentPage(nextPage);
        setHasMore(filtered.length > end);
      } catch (err) {
        console.error("Error showing more organizations:", err);
      } finally {
        setIsLoadingMore(false);
      }
    }, 300);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  // Toggle category selection
  const toggleCategory = (category: string) => {
    console.log(`--- Debugging: Category "${category}" toggled`);
    
    // If selecting "Other / Needs Review", print all organizations with this tag
    if (category === "Other / Needs Review" && !selectedCategories.includes(category)) {
      const orgsWithOtherTag = allOrganizations.filter(org => 
        org.tags && org.tags.includes("Other / Needs Review")
      );
      console.log("--- Debugging: Organizations currently tagged as 'Other / Needs Review' in state:", 
        orgsWithOtherTag.map(org => org.Name)
      );
    }

    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setCurrentPage(1);
  };

  // Log theme state on initial render and when it changes
  useEffect(() => {
    console.log(`--- Debug OrganizationsPage: Detected isDarkMode: ${isDarkMode}`);
  }, [isDarkMode]);

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <TopNavBar />
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-green-700" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Organizations Directory</h1>
                <p className="text-gray-600">Student clubs and groups at NJIT</p>
              </div>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search organizations..."
                  className="pl-10 w-full py-2 px-4 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'}`}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'bg-gray-100 text-gray-700'}`}
                  aria-label="List view"
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {/* Category filters */}
            {availableCategories.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center mb-2">
                  <Filter className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Filter by category:</span>
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="ml-auto text-xs text-blue-600 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Show all categories with tooltips, hiding 'Other / Needs Review' */}
                  {availableCategories.map(category => {
                    // Don't render the filter button for "Other / Needs Review"
                    if (category === "Other / Needs Review") {
                      return null; 
                    }
                    
                    return (
                      <Tooltip 
                        key={category}
                        content={categoryDescriptions[category] || category}
                      >
                        <button
                          onClick={() => toggleCategory(category)}
                          className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                            selectedCategories.includes(category)
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-200'
                          }`}
                        >
                          {category}
                          {categoryDescriptions[category] && (
                            <Info className="w-3 h-3 opacity-60" />
                          )}
                        </button>
                      </Tooltip>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Content Area - Display Organizations */}
          <div className="bg-white rounded-lg shadow border border-gray-200">
            {isLoading && (
              <div className="flex flex-col items-center text-gray-500 p-8">
                <Loader className="h-8 w-8 animate-spin mb-2" />
                <p>Loading organizations...</p>
              </div>
            )}
            {error && !isLoading && (
              <p className="text-red-600 p-4">Error loading organizations: {error}</p>
            )}
            {!isLoading && !error && filteredOrganizations.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-2">No organizations found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
            {!isLoading && !error && filteredOrganizations.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
                    {filteredOrganizations.map((org) => {
                      return (
                        <div 
                          key={org.Id || org.WebsiteKey}
                          className="bg-white p-4 flex flex-col items-start group hover:bg-gray-50 transition-colors"
                        >
                          <img 
                            src={`/api/organizationAvatar?name=${encodeURIComponent(org.Name)}&size=100`}
                            alt={`${org.displayName || org.Name} avatar`}
                            className="organization-avatar mb-3"
                          />

                          <h3 className="font-semibold text-md text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">{org.displayName || org.Name}</h3>
                          
                          {/* Use ExpandableText for Summary in Grid view */}
                          {org.Summary && (
                            <ExpandableText 
                              text={org.Summary} 
                              maxLines={2} // Keep 2 lines for grid view
                              className="mb-3" // Add margin bottom to the container
                            />
                          )}

                          {/* Display tags using the new configuration */}
                          {org.tags && org.tags.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2"> {/* Increased gap slightly */}
                              {org.tags.map(tag => {
                                const style = getTagStyle(tag);
                                const IconComponent = style.icon; // Get the icon component
                                return (
                                  <Tooltip
                                    key={tag}
                                    content={categoryDescriptions[tag] || tag}
                                  >
                                    {/* Wrap span in a button and add onClick */}
                                    <button
                                      onClick={() => toggleCategory(tag)}
                                      className="appearance-none focus:outline-none hover:opacity-80 transition-opacity"
                                      aria-label={`Filter by ${tag}`}
                                    >
                                      <span 
                                        className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium ${style.bgColor} ${style.textColor}`}
                                      >
                                        <IconComponent className="w-3.5 h-3.5 mr-1.5" /> {/* Render icon */}
                                        {tag}
                                      </span>
                                    </button>
                                  </Tooltip>
                                );
                              })}
                            </div>
                          )}

                          <a 
                            href={`https://njit.campuslabs.com/engage/organization/${org.WebsiteKey}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="mt-auto text-sm text-blue-600 hover:underline"
                          >
                            View on Engage →
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {filteredOrganizations.map((org) => {
                      return (
                        <div 
                          key={org.Id || org.WebsiteKey}
                          className="p-4 flex items-center hover:bg-gray-50 transition-colors"
                        >
                          <img 
                            src={`/api/organizationAvatar?name=${encodeURIComponent(org.Name)}&size=80`}
                            alt={`${org.displayName || org.Name} avatar`}
                            className="organization-avatar w-16 h-16 mr-4"
                          />
                          
                          <div className="flex-grow min-w-0">
                            <h3 className="font-semibold text-md text-gray-800 mb-1">{org.displayName || org.Name}</h3>
                            
                            {/* Use ExpandableText for Summary in List view */}
                            {org.Summary && (
                              <ExpandableText 
                                text={org.Summary} 
                                maxLines={1} // Keep 1 line for list view
                                className="mb-2" // Add margin bottom to the container
                              />
                            )}

                            {/* Display tags using the new configuration in list view */}
                            {org.tags && org.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2"> {/* Increased gap slightly */}
                                {org.tags.map(tag => {
                                  const style = getTagStyle(tag);
                                  const IconComponent = style.icon; // Get the icon component
                                  return (
                                    <Tooltip
                                      key={tag}
                                      content={categoryDescriptions[tag] || tag}
                                    >
                                      {/* Wrap span in a button and add onClick */}
                                      <button
                                        onClick={() => toggleCategory(tag)}
                                        className="appearance-none focus:outline-none hover:opacity-80 transition-opacity"
                                        aria-label={`Filter by ${tag}`}
                                      >
                                        <span 
                                          className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium ${style.bgColor} ${style.textColor}`}
                                        >
                                          <IconComponent className="w-3.5 h-3.5 mr-1.5" /> {/* Render icon */}
                                          {tag}
                                        </span>
                                      </button>
                                    </Tooltip>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                          
                          <a 
                            href={`https://njit.campuslabs.com/engage/organization/${org.WebsiteKey}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline whitespace-nowrap ml-4"
                          >
                            View on Engage →
                          </a>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* Load More Button */}
            {hasMore && !isLoading && !error && (
              <div className="mt-6 mb-6 text-center">
                <button
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore ? 'Loading...' : 'Load More Organizations'}
                </button>
              </div>
            )}
            
            {/* Count of organizations */}
            {!isLoading && !error && filteredOrganizations.length > 0 && (
              <div className="py-4 text-sm text-gray-500 text-center border-t border-gray-200">
                Showing {filteredOrganizations.length} of {
                  searchTerm || selectedCategories.length > 0
                    ? allOrganizations.filter(org => {
                        // Use consistent filtering logic as in useEffect and loadMore
                        const searchTermLower = searchTerm.toLowerCase();
                        const matchesSearch = searchTerm === '' ||
                          org.Name?.toLowerCase().includes(searchTermLower) ||
                          org.displayName?.toLowerCase().includes(searchTermLower) || 
                          (org.Summary && org.Summary.toLowerCase().includes(searchTermLower));

                        const matchesCategories = selectedCategories.length === 0 ||
                          (org.tags && org.tags.some(tag => selectedCategories.includes(tag)));

                        return matchesSearch && matchesCategories;
                      }).length
                    : allOrganizations.length
                } organizations
              </div>
            )}
          </div>
          
          {/* Back Link */}
          <div className="mt-8 text-center">
            <Link href="/" className="text-blue-600 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsPage; 