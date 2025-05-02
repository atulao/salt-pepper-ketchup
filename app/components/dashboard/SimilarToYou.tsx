"use client";

import React, { useState } from "react";
import { Users, ChevronRight, Search, Star, Bell, User, X, MessageCircle } from "lucide-react";
import { useBagelData, useSubstanceData } from "../../store/onboardingStore";

interface SimilarStudent {
  id: string;
  name: string;
  major: string;
  college: string;
  interests: string[];
  matchScore: number;
  matchReason: string;
  avatarSeed: string;
}

interface SimilarToYouProps {
  isDarkMode?: boolean;
}

const SimilarToYou: React.FC<SimilarToYouProps> = ({ isDarkMode = false }) => {
  const { major_name, college_name } = useBagelData();
  const { events, clubs, goals } = useSubstanceData();
  
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<SimilarStudent | null>(null);

  // Generate mock similar students based on user data
  const getSimilarStudents = (): SimilarStudent[] => {
    // Combined user interests
    const userInterests = [...events, ...clubs, ...goals];
    
    // Mock student data with realistic names and interests
    const mockStudents: SimilarStudent[] = [
      {
        id: "student1",
        name: "Alex Johnson",
        major: major_name,
        college: college_name,
        interests: [
          userInterests[0] || "Tech Talks",
          userInterests[2] || "Hackathons",
          "Research Experience"
        ],
        matchScore: 95,
        matchReason: "Same major and 3 similar interests",
        avatarSeed: "alex-johnson"
      },
      {
        id: "student2",
        name: "Jamie Rivera",
        major: major_name,
        college: college_name,
        interests: [
          userInterests[1] || "Networking Events",
          "Academic Excellence",
          "Professional Development"
        ],
        matchScore: 85,
        matchReason: "Same major and shared academic goals",
        avatarSeed: "jamie-rivera"
      },
      {
        id: "student3",
        name: "Taylor Kim",
        major: major_name === "Computer Science" ? "Data Science" : "Computer Science",
        college: college_name,
        interests: [
          userInterests[0] || "Programming Club",
          userInterests[3] || "Career Fairs",
          "Leadership Skills"
        ],
        matchScore: 80,
        matchReason: "Similar major and 2 shared interests",
        avatarSeed: "taylor-kim"
      },
      {
        id: "student4",
        name: "Morgan Patel",
        major: major_name === "Computer Science" ? "Information Technology" : "Business Analytics",
        college: college_name,
        interests: [
          userInterests[2] || "Entrepreneurship Club",
          "Work-Life Balance",
          "Student Associations"
        ],
        matchScore: 75,
        matchReason: "Related major and complementary interests",
        avatarSeed: "morgan-patel"
      },
      {
        id: "student5",
        name: "Jordan Smith",
        major: major_name === "Engineering" ? "Computer Engineering" : "Engineering",
        college: college_name,
        interests: [
          userInterests[1] || "Sports Events",
          "Land an Internship",
          "Cultural Celebrations"
        ],
        matchScore: 70,
        matchReason: "Similar career goals and interests",
        avatarSeed: "jordan-smith"
      }
    ];
    
    // Sort by match score
    return mockStudents.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Get students based on current view state
  const similarStudents = getSimilarStudents();
  const displayedStudents = showAllStudents ? similarStudents : similarStudents.slice(0, 3);

  // Helper to get a match badge color based on score
  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    if (score >= 70) return "bg-purple-100 text-purple-800";
    return "bg-gray-100 text-gray-800";
  };
  
  // Handle connect button click
  const handleConnect = (student: SimilarStudent) => {
    setSelectedStudent(student);
    setConnectModalOpen(true);
  };
  
  // Close connection modal
  const closeConnectModal = () => {
    setConnectModalOpen(false);
    setSelectedStudent(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center">
          <Users className="h-4 sm:h-5 w-4 sm:w-5 text-amber-600 mr-2" />
          <h2 className="text-lg sm:text-xl font-bold">Similar to You</h2>
        </div>
        <button
          onClick={() => setShowAllStudents(!showAllStudents)}
          className="text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center"
        >
          {showAllStudents ? "Show Less" : "See More"} <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
        </button>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {displayedStudents.map((student) => (
          <div
            key={student.id}
            className={`border rounded-lg p-3 sm:p-4 transition-all hover:shadow-sm ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${student.avatarSeed}`}
                  alt={`${student.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base truncate">{student.name}</h3>
                    <p className="text-xs sm:text-sm text-gray-500">{student.major}</p>
                  </div>
                  <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center font-medium ${getMatchBadgeColor(student.matchScore)}`}>
                    <Star className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1 fill-current" /> {student.matchScore}%
                  </span>
                </div>
                
                {/* Match reason */}
                <p className="text-xs text-gray-500 mt-1 italic">
                  {student.matchReason}
                </p>
                
                {/* Interests */}
                <div className="flex flex-wrap gap-1 mt-2">
                  {student.interests.map((interest, index) => (
                    <span key={index} className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-amber-50 text-amber-800 border border-amber-100">
                      {interest}
                    </span>
                  ))}
                </div>
                
                {/* Connect button */}
                <button
                  onClick={() => handleConnect(student)}
                  className="mt-2 w-full py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm font-medium flex items-center justify-center"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1.5" /> Connect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* View More/Less Button (Mobile only) */}
      <button
        onClick={() => setShowAllStudents(!showAllStudents)}
        className="w-full mt-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-50 flex items-center justify-center sm:hidden"
      >
        {showAllStudents ? "Show Fewer Students" : "See More Similar Students"} <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
      </button>
      
      {/* Connection Modal */}
      {connectModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className={`max-w-md w-full rounded-lg p-4 sm:p-6 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center">
                <Bell className="h-5 w-5 text-amber-600 mr-2" />
                <h3 className="text-lg font-bold">Connect with {selectedStudent.name}</h3>
              </div>
              <button 
                onClick={closeConnectModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden">
                <img 
                  src={`https://api.dicebear.com/7.x/personas/svg?seed=${selectedStudent.avatarSeed}`}
                  alt={`${selectedStudent.name}'s avatar`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">{selectedStudent.name}</p>
                <p className="text-sm text-gray-500">{selectedStudent.major}</p>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-md p-3 mb-4 border border-amber-100">
              <p className="text-sm text-amber-800">
                <Star className="h-4 w-4 inline mr-1 text-amber-600" /> 
                {selectedStudent.matchScore}% match based on your shared interests and academic path!
              </p>
            </div>
            
            <div className="space-y-3 mb-5">
              <p className="text-sm">Send {selectedStudent.name} a message to connect:</p>
              <textarea 
                className={`w-full p-3 rounded-md border ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-amber-500`}
                rows={3}
                placeholder={`Hi ${selectedStudent.name}! I noticed we both are interested in ${selectedStudent.interests[0]}. Would you like to connect?`}
              ></textarea>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={closeConnectModal}
                className="flex-1 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={closeConnectModal}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center justify-center"
              >
                <MessageCircle className="h-4 w-4 mr-2" /> Send Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimilarToYou; 