'use client'; // Start as client component for potential future data fetching hooks

import React, { useEffect, useState, useRef } from 'react';
import TopNavBar from '../components/TopNavBar';
import Link from 'next/link';
import { Users, Loader, Search, Filter, List, Grid, Info } from 'lucide-react'; // Add Info icon
import Image from 'next/image'; // Import Image for profile pictures
import '../styles/organizationAvatar.css'; // Import the avatar styles

// Define a type for the organization data from the API
interface Organization {
  Id: string; // Assuming an ID field exists, often useful as key
  Name: string;
  WebsiteKey: string; // Used to build the link to the org's page
  ProfilePicture?: string; // Optional profile picture URL
  Summary?: string; // Optional short description
  CategoryNames?: string[]; // Optional categories
  tags?: string[]; // Added for the new tagging system
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

const OrganizationsPage: React.FC = () => {
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
        const response = await fetch('/api/organizationCategories');
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
        const response = await fetch('/api/organizations');

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
          // Add tags from the category mappings to each organization
          const orgsWithTags = data.map(org => {
            const mapping = categoryMappings.find(m => m.name === org.Name);
            return {
              ...org,
              tags: mapping ? mapping.tags : ["Other / Needs Review"]
            };
          });
          
          setAllOrganizations(orgsWithTags);
          setOrganizations(orgsWithTags.slice(0, PAGE_SIZE));
          setFilteredOrganizations(orgsWithTags.slice(0, PAGE_SIZE));
          
          setHasMore(orgsWithTags.length > PAGE_SIZE);
          setCurrentPage(1);
          
          console.log(`Retrieved ${orgsWithTags.length} total organizations from API`);
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

    if (categoryMappings.length > 0) {
      fetchOrganizations();
    }
  }, [categoryMappings]);

  // Filter organizations based on search term and selected categories
  useEffect(() => {
    if (allOrganizations.length === 0) return;

    const filtered = allOrganizations.filter(org => {
      // Filter by search term
      const matchesSearch = searchTerm === '' || 
        org.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (org.Summary && org.Summary.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by selected categories using the new tag system
      const matchesCategories = selectedCategories.length === 0 || 
        (org.tags && org.tags.some(tag => selectedCategories.includes(tag)));
      
      return matchesSearch && matchesCategories;
    });

    // Update filtered organizations and pagination state
    setFilteredOrganizations(filtered.slice(0, currentPage * PAGE_SIZE));
    setHasMore(filtered.length > currentPage * PAGE_SIZE);
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
        const filtered = allOrganizations.filter(org => {
          const matchesSearch = searchTerm === '' || 
            org.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (org.Summary && org.Summary.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesCategories = selectedCategories.length === 0 || 
            (org.tags && org.tags.some(tag => selectedCategories.includes(tag)));
          
          return matchesSearch && matchesCategories;
        });
        
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <TopNavBar />
      
      <div className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center mb-8 gap-4">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mr-4">
                <Users className="h-6 w-6 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Organizations Directory</h1>
                <p className="text-gray-600 dark:text-gray-400">Student clubs and groups at NJIT</p>
              </div>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="mb-6 bg-white dark:bg-gray-900 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
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
                  className="pl-10 w-full py-2 px-4 border border-gray-300 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md ${viewMode === 'grid' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  aria-label="Grid view"
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md ${viewMode === 'list' 
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
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
                  <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by category:</span>
                  {selectedCategories.length > 0 && (
                    <button 
                      onClick={clearFilters}
                      className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Clear filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {/* Show all categories with tooltips */}
                  {availableCategories.map(category => (
                    <Tooltip 
                      key={category}
                      content={categoryDescriptions[category] || category}
                    >
                      <button
                        onClick={() => toggleCategory(category)}
                        className={`text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1 ${
                          selectedCategories.includes(category)
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        {category}
                        {categoryDescriptions[category] && (
                          <Info className="w-3 h-3 opacity-60" />
                        )}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Content Area - Display Organizations */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            {isLoading && (
              <div className="flex flex-col items-center text-gray-500 dark:text-gray-400 p-8">
                <Loader className="h-8 w-8 animate-spin mb-2" />
                <p>Loading organizations...</p>
              </div>
            )}
            {error && !isLoading && (
              <p className="text-red-600 dark:text-red-400 p-4">Error loading organizations: {error}</p>
            )}
            {!isLoading && !error && filteredOrganizations.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No organizations found matching your criteria.</p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
            {!isLoading && !error && filteredOrganizations.length > 0 && (
              <>
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 dark:bg-gray-700">
                    {filteredOrganizations.map((org) => (
                      <div 
                        key={org.Id || org.WebsiteKey}
                        className="bg-white dark:bg-gray-900 p-4 flex flex-col items-start group hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <img 
                          src={`/api/organizationAvatar?name=${encodeURIComponent(org.Name)}&size=100`}
                          alt={`${org.Name} avatar`}
                          className="organization-avatar mb-3"
                        />

                        <h3 className="font-semibold text-md text-gray-800 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{org.Name}</h3>
                        
                        {org.Summary && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{org.Summary}</p>
                        )}

                        {/* Display tags from the new system with tooltips */}
                        {org.tags && org.tags.length > 0 && (
                          <div className="mb-3 flex flex-wrap gap-1">
                            {org.tags.map(tag => (
                              <Tooltip
                                key={tag}
                                content={categoryDescriptions[tag] || tag}
                              >
                                <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                  {tag}
                                  {categoryDescriptions[tag] && (
                                    <Info className="w-3 h-3 opacity-60" />
                                  )}
                                </span>
                              </Tooltip>
                            ))}
                          </div>
                        )}

                        <a 
                          href={`https://njit.campuslabs.com/engage/organization/${org.WebsiteKey}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-auto text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View on Engage →
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrganizations.map((org) => (
                      <div 
                        key={org.Id || org.WebsiteKey}
                        className="p-4 flex items-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <img 
                          src={`/api/organizationAvatar?name=${encodeURIComponent(org.Name)}&size=80`}
                          alt={`${org.Name} avatar`}
                          className="organization-avatar w-16 h-16 mr-4"
                        />
                        
                        <div className="flex-grow min-w-0">
                          <h3 className="font-semibold text-md text-gray-800 dark:text-gray-100 mb-1">{org.Name}</h3>
                          
                          {org.Summary && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{org.Summary}</p>
                          )}

                          {/* Display tags from the new system in list view with tooltips */}
                          {org.tags && org.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {org.tags.map(tag => (
                                <Tooltip
                                  key={tag}
                                  content={categoryDescriptions[tag] || tag}
                                >
                                  <span className="inline-block bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs px-2 py-0.5 rounded flex items-center gap-1">
                                    {tag}
                                    {categoryDescriptions[tag] && (
                                      <Info className="w-3 h-3 opacity-60" />
                                    )}
                                  </span>
                                </Tooltip>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <a 
                          href={`https://njit.campuslabs.com/engage/organization/${org.WebsiteKey}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap ml-4"
                        >
                          View on Engage →
                        </a>
                      </div>
                    ))}
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
              <div className="py-4 text-sm text-gray-500 text-center border-t border-gray-200 dark:border-gray-700">
                Showing {filteredOrganizations.length} of {
                  searchTerm || selectedCategories.length > 0 
                    ? allOrganizations.filter(org => {
                        const matchesSearch = searchTerm === '' || 
                          org.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (org.Summary && org.Summary.toLowerCase().includes(searchTerm.toLowerCase()));
                        
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
            <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationsPage; 