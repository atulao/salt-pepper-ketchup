"use client";

import React, { useState, useEffect, useRef } from "react";
import { Edit2, Check, X, Plus, Trash2 } from "lucide-react";
import { useOnboardingStore, useBagelData, useSubstanceData } from "../../store/onboardingStore";

type EditSectionType = "bagel" | "substance" | null;

interface EditProfileSectionProps {
  isDarkMode?: boolean;
  section: 'bagel' | 'substance';
}

// College and major options (this would normally come from an API)
const COLLEGE_OPTIONS = [
  { id: "computing", name: "College of Computing" },
  { id: "engineering", name: "Newark College of Engineering" },
  { id: "management", name: "School of Management" },
  { id: "architecture", name: "College of Architecture & Design" },
  { id: "science", name: "College of Science & Liberal Arts" }
];

const MAJOR_OPTIONS = {
  "computing": [
    { id: "cs", name: "Computer Science" },
    { id: "is", name: "Information Systems" },
    { id: "it", name: "Information Technology" },
    { id: "ds", name: "Data Science" }
  ],
  "engineering": [
    { id: "me", name: "Mechanical Engineering" },
    { id: "ee", name: "Electrical Engineering" },
    { id: "ce", name: "Civil Engineering" },
    { id: "cheme", name: "Chemical Engineering" }
  ],
  "management": [
    { id: "business", name: "Business" },
    { id: "finance", name: "Finance" },
    { id: "marketing", name: "Marketing" }
  ],
  "architecture": [
    { id: "arch", name: "Architecture" },
    { id: "id", name: "Industrial Design" }
  ],
  "science": [
    { id: "bio", name: "Biology" },
    { id: "chem", name: "Chemistry" },
    { id: "math", name: "Mathematics" },
    { id: "physics", name: "Physics" }
  ]
};

// Bagel options corresponding to colleges
const BAGEL_OPTIONS = {
  "computing": "Everything Bagel",
  "engineering": "Plain Bagel",
  "management": "Sesame Bagel",
  "architecture": "Poppy Seed Bagel",
  "science": "Whole Wheat Bagel"
};

// Substance options
const EVENT_OPTIONS = [
  "Academic Events", "Athletic Events", "Career Fairs", "Club Events", 
  "Concerts", "Cultural Celebrations", "Hackathons", "Networking Events", 
  "Social Events", "Tech Talks", "Workshops"
];

const CLUB_OPTIONS = [
  "Academic Clubs", "Athletic Clubs", "Cultural Clubs", "Entrepreneurship Club", 
  "Greek Life", "Honor Societies", "Professional Organizations", "Social Clubs", 
  "Student Government", "Tech Clubs", "Volunteer Organizations"
];

const GOAL_OPTIONS = [
  "Academic Excellence", "Build My Network", "Career Preparation", 
  "Develop Leadership Skills", "Gain Technical Skills", "Get Involved on Campus", 
  "Land an Internship", "Make Friends", "Research Opportunities"
];

const EditProfileSection: React.FC<EditProfileSectionProps> = ({ isDarkMode = false, section }) => {
  const [editingSection, setEditingSection] = useState<EditSectionType>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get store access
  const updateBagelData = useOnboardingStore(state => state.updateBagelData);
  const updateSubstanceEvents = useOnboardingStore(state => state.updateSubstanceEvents);
  const updateSubstanceClubs = useOnboardingStore(state => state.updateSubstanceClubs);
  const updateSubstanceGoals = useOnboardingStore(state => state.updateSubstanceGoals);
  
  // Original data
  const { bagel_type, major_name, college_name } = useBagelData();
  const { events, clubs, goals } = useSubstanceData();
  
  // Edited data
  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedBagel, setSelectedBagel] = useState("");
  
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [selectedClubs, setSelectedClubs] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  
  // Initialize edited data when entering edit mode
  useEffect(() => {
    if (editingSection === "bagel") {
      // Find college ID from name
      const collegeId = Object.entries(COLLEGE_OPTIONS).find(
        ([_, college]) => college.name === college_name
      )?.[0] || "computing";
      
      setSelectedCollege(collegeId);
      setSelectedMajor(major_name);
      setSelectedBagel(bagel_type);
    } else if (editingSection === "substance") {
      setSelectedEvents([...events]);
      setSelectedClubs([...clubs]);
      setSelectedGoals([...goals]);
    }
  }, [editingSection, bagel_type, major_name, college_name, events, clubs, goals]);
  
  // Handle college selection
  const handleCollegeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const collegeId = e.target.value;
    setSelectedCollege(collegeId);
    
    // Update bagel type automatically based on college
    setSelectedBagel(BAGEL_OPTIONS[collegeId as keyof typeof BAGEL_OPTIONS] || "Everything Bagel");
    
    // Reset major when college changes
    setSelectedMajor("");
  };
  
  // Handle save for bagel section
  const handleSaveBagel = () => {
    // Get college name from ID
    const collegeName = COLLEGE_OPTIONS.find(c => c.id === selectedCollege)?.name || "College of Computing";
    
    updateBagelData({
      bagel_type: selectedBagel,
      major_name: selectedMajor,
      college_name: collegeName
    });
    
    // Show success message
    showSuccessNotification();
    
    // Exit edit mode
    setEditingSection(null);
  };
  
  // Handle save for substance section
  const handleSaveSubstance = () => {
    // Update all substance selections
    updateSubstanceEvents(() => [...selectedEvents]);
    updateSubstanceClubs(() => [...selectedClubs]);
    updateSubstanceGoals(() => [...selectedGoals]);
    
    // Show success message
    showSuccessNotification();
    
    // Exit edit mode
    setEditingSection(null);
  };
  
  // Show success notification
  const showSuccessNotification = () => {
    // Clear any existing timeout
    if (successTimeoutRef.current) {
      clearTimeout(successTimeoutRef.current);
    }
    
    setShowSuccessMessage(true);
    
    // Hide after 3 seconds
    successTimeoutRef.current = setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  };
  
  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);
  
  // Toggle selection in an array
  const toggleSelection = (item: string, current: string[], setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (current.includes(item)) {
      setter(current.filter(i => i !== item));
    } else {
      setter([...current, item]);
    }
  };
  
  // Render bagel edit form
  const renderBagelEditForm = () => (
    <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
      <h4 className="font-medium text-amber-700 mb-4">Edit Your Academic Program</h4>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">College</label>
          <select
            value={selectedCollege}
            onChange={handleCollegeChange}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Select a College</option>
            {COLLEGE_OPTIONS.map(college => (
              <option key={college.id} value={college.id}>
                {college.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
            disabled={!selectedCollege}
          >
            <option value="">Select a Major</option>
            {selectedCollege && MAJOR_OPTIONS[selectedCollege as keyof typeof MAJOR_OPTIONS]?.map(major => (
              <option key={major.id} value={major.name}>
                {major.name}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bagel</label>
          <div className="flex items-center p-2 bg-amber-50 rounded-md">
            <span className="text-amber-700 mr-2">🥯</span>
            <span>{selectedBagel}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Bagel type is based on your college selection
          </p>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2 mt-5">
        <button
          onClick={() => setEditingSection(null)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50 flex items-center"
        >
          <X className="h-4 w-4 mr-1" /> Cancel
        </button>
        <button
          onClick={handleSaveBagel}
          disabled={!selectedCollege || !selectedMajor}
          className={`px-3 py-1.5 rounded-md text-white text-sm flex items-center ${
            selectedCollege && selectedMajor 
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Check className="h-4 w-4 mr-1" /> Save Changes
        </button>
      </div>
    </div>
  );
  
  // Render substance edit form
  const renderSubstanceEditForm = () => (
    <div className="mt-4 p-4 bg-white rounded-lg border border-amber-200">
      <h4 className="font-medium text-amber-700 mb-4">Edit Your Interests</h4>
      
      <div className="space-y-5">
        {/* Events selection */}
        <div>
          <label className="block text-sm font-medium text-amber-700 mb-2">Events</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_OPTIONS.map(event => (
              <button
                key={event}
                onClick={() => toggleSelection(event, selectedEvents, setSelectedEvents)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  selectedEvents.includes(event)
                    ? 'bg-blue-100 text-blue-800 border-blue-300 border'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                }`}
              >
                {event}
              </button>
            ))}
          </div>
          {selectedEvents.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Select at least one event</p>
          )}
        </div>
        
        {/* Clubs selection */}
        <div>
          <label className="block text-sm font-medium text-amber-700 mb-2">Clubs</label>
          <div className="flex flex-wrap gap-2">
            {CLUB_OPTIONS.map(club => (
              <button
                key={club}
                onClick={() => toggleSelection(club, selectedClubs, setSelectedClubs)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  selectedClubs.includes(club)
                    ? 'bg-purple-100 text-purple-800 border-purple-300 border'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                }`}
              >
                {club}
              </button>
            ))}
          </div>
          {selectedClubs.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Select at least one club</p>
          )}
        </div>
        
        {/* Goals selection */}
        <div>
          <label className="block text-sm font-medium text-amber-700 mb-2">Goals</label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map(goal => (
              <button
                key={goal}
                onClick={() => toggleSelection(goal, selectedGoals, setSelectedGoals)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  selectedGoals.includes(goal)
                    ? 'bg-green-100 text-green-800 border-green-300 border'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-transparent'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
          {selectedGoals.length === 0 && (
            <p className="text-xs text-red-500 mt-1">Select at least one goal</p>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-2 mt-5">
        <button
          onClick={() => setEditingSection(null)}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 text-sm hover:bg-gray-50 flex items-center"
        >
          <X className="h-4 w-4 mr-1" /> Cancel
        </button>
        <button
          onClick={handleSaveSubstance}
          disabled={selectedEvents.length === 0 || selectedClubs.length === 0 || selectedGoals.length === 0}
          className={`px-3 py-1.5 rounded-md text-white text-sm flex items-center ${
            selectedEvents.length > 0 && selectedClubs.length > 0 && selectedGoals.length > 0
              ? 'bg-amber-600 hover:bg-amber-700' 
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          <Check className="h-4 w-4 mr-1" /> Save Changes
        </button>
      </div>
    </div>
  );
  
  // Success message component
  const renderSuccessMessage = () => (
    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-md shadow-lg flex items-center animate-slide-up">
      <Check className="h-5 w-5 mr-2" />
      <span>Changes saved successfully!</span>
    </div>
  );
  
  return (
    <div className={isDarkMode ? 'text-white' : 'text-gray-900'}>
      {/* Edit Bagel Section */}
      {section === 'bagel' && (
        <div className="mb-4">
          <button
            onClick={() => setEditingSection(editingSection === "bagel" ? null : "bagel")}
            className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              isDarkMode 
                ? 'bg-gray-800 text-amber-400 hover:bg-gray-700' 
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
            aria-label="Edit academic program"
          >
            {editingSection === "bagel" ? (
              <>
                <X className="h-3 w-3 mr-1" /> Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-3 w-3 mr-1" /> Edit Bagel
              </>
            )}
          </button>
          
          {editingSection === "bagel" && renderBagelEditForm()}
        </div>
      )}
      
      {/* Edit Substance Section */}
      {section === 'substance' && (
        <div>
          <button
            onClick={() => setEditingSection(editingSection === "substance" ? null : "substance")}
            className={`flex items-center px-2 py-1 rounded-md text-xs font-medium ${
              isDarkMode 
                ? 'bg-gray-800 text-amber-400 hover:bg-gray-700' 
                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
            }`}
            aria-label="Edit interests"
          >
            {editingSection === "substance" ? (
              <>
                <X className="h-3 w-3 mr-1" /> Cancel
              </>
            ) : (
              <>
                <Edit2 className="h-3 w-3 mr-1" /> Edit Toppings
              </>
            )}
          </button>
          
          {editingSection === "substance" && renderSubstanceEditForm()}
        </div>
      )}
      
      {/* Success message */}
      {showSuccessMessage && renderSuccessMessage()}
    </div>
  );
};

export default EditProfileSection; 