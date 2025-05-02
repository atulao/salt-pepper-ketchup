"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNavBar from "../components/TopNavBar";
import { useBagelData, useSubstanceData, useOnboardingCompleted, useOnboardingStore, useDashboardTourCompleted } from "../store/onboardingStore";
import { Calendar, MapPin, BookOpen, Coffee, Utensils, Users, ChevronRight, ExternalLink, Star, RotateCcw, Edit2 } from "lucide-react";
import EditProfileSection from "../components/dashboard/EditProfileSection";
import SimilarToYou from "../components/dashboard/SimilarToYou";
import DashboardTour from "../components/dashboard/DashboardTour";

const Dashboard: React.FC = () => {
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const dashboardTourCompleted = useDashboardTourCompleted();
  const { bagel_type, major_name, college_name } = useBagelData();
  const { events, clubs, goals } = useSubstanceData();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const resetStore = useOnboardingStore(state => state.reset);
  
  // State for edit sections
  const [editingBagel, setEditingBagel] = useState(false);
  const [editingToppings, setEditingToppings] = useState(false);
  
  // State to control tour display
  const [showTour, setShowTour] = useState(false);

  // Mounted check for hydration
  useEffect(() => {
    setMounted(true);
    // Check for dark mode preference
    const darkModePreference = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkModePreference);
  }, []);

  // Redirect if onboarding not completed
  useEffect(() => {
    if (mounted && !onboardingCompleted) {
      router.push('/onboarding/step1');
      return;
    }
    
    // Show tour if onboarding is completed but tour is not
    if (mounted && onboardingCompleted && !dashboardTourCompleted) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [onboardingCompleted, dashboardTourCompleted, router, mounted]);

  // Reset onboarding and go back to step 1
  const handleResetOnboarding = () => {
    resetStore();
    router.push('/onboarding/step1');
  };

  // Generate placeholder recommendations based on user selections
  const getRecommendedEvents = () => {
    // Sample event data that would normally come from an API
    const sampleEvents = [
      {
        id: 1,
        title: "Tech Career Fair",
        date: "Tomorrow, 10:00 AM",
        location: "Campus Center Ballroom",
        tags: ["Career", "Networking"],
        matchScore: 95,
      },
      {
        id: 2,
        title: `${major_name} Student Mixer`,
        date: "Friday, 5:30 PM",
        location: "Eberhardt Hall",
        tags: ["Social", "Academic"],
        matchScore: 90,
      },
      {
        id: 3,
        title: "Free Pizza & Study Group",
        date: "Today, 6:00 PM",
        location: "Central King Building",
        tags: ["Food", "Academic"],
        matchScore: 85,
      }
    ];

    // Return 2-3 events that would best match the user's interests
    return sampleEvents.slice(0, 3);
  };

  // Generate organization recommendations based on clubs selections
  const getRecommendedOrganizations = () => {
    // Sample organization data
    const sampleOrgs = [
      {
        id: 1,
        name: events.length > 0 ? `${events[0].replace('Events', '').trim()} Club` : "Student Association",
        description: "Connect with peers who share your interests",
        members: 124,
        matchScore: 98,
      },
      {
        id: 2,
        name: clubs.length > 0 ? clubs[0] : "Campus Activities Board",
        description: "Get involved in campus life and leadership",
        members: 87,
        matchScore: 92,
      },
      {
        id: 3,
        name: `${college_name} Student Council`,
        description: "Represent your college and make a difference",
        members: 45,
        matchScore: 85,
      }
    ];

    return sampleOrgs.slice(0, 3);
  };

  // Helper to get a match badge color based on score
  const getMatchBadgeColor = (score: number) => {
    if (score >= 90) return "bg-green-100 text-green-800";
    if (score >= 80) return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Personalized Welcome */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 sm:mb-3">
            <span className="text-amber-600 font-serif">Welcome to NJIT, </span>
            <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
              {major_name} Student!
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Your personalized campus experience is ready to explore
          </p>
        </div>
        
        {/* Your SPK Order Summary */}
        <div 
          className={`rounded-lg border shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 ${
            isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-amber-50 border-amber-200'
          }`}
          data-tour="spk-order"
        >
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center">
              <span className="text-xl sm:text-2xl mr-2">🥯</span>
              <h2 className="text-xl sm:text-2xl font-bold text-amber-600 font-serif">Your SPK Order</h2>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={handleResetOnboarding}
                className="flex items-center px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium text-amber-700 hover:text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-md transition-colors"
              >
                <RotateCcw className="h-3 sm:h-4 w-3 sm:w-4 mr-1" /> Reset Order
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-3 sm:mb-4">
            {/* Bagel Selection */}
            <div className="bg-white bg-opacity-60 rounded-lg p-3 sm:p-4 shadow-sm border border-amber-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg sm:text-xl mr-2">🥯</span>
                  <h3 className="font-medium text-base sm:text-lg">Your Bagel</h3>
                </div>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <EditProfileSection isDarkMode={isDarkMode} section="bagel" />
                </div>
              </div>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">{bagel_type}</p>
              <p className="text-gray-600 text-xs sm:text-sm">{college_name}</p>
              <div className="mt-2 text-xs bg-amber-100 text-amber-800 inline-flex items-center px-2 py-0.5 rounded-full">
                {major_name}
              </div>
            </div>
            
            {/* Substance Selections */}
            <div className="bg-white bg-opacity-60 rounded-lg p-3 sm:p-4 shadow-sm border border-amber-100 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg sm:text-xl mr-2">🍳</span>
                  <h3 className="font-medium text-base sm:text-lg">Your Toppings</h3>
                </div>
                <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
                  <EditProfileSection isDarkMode={isDarkMode} section="substance" />
                </div>
              </div>
              
              <div className="space-y-1.5 sm:space-y-2">
                <div>
                  <span className="text-xs text-blue-600 font-medium">Events:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                    {events.slice(0, 3).map(event => (
                      <span key={event} className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                        {event}
                      </span>
                    ))}
                    {events.length > 3 && (
                      <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                        +{events.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-purple-600 font-medium">Clubs:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                    {clubs.slice(0, 3).map(club => (
                      <span key={club} className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">
                        {club}
                      </span>
                    ))}
                    {clubs.length > 3 && (
                      <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                        +{clubs.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-green-600 font-medium">Goals:</span>
                  <div className="flex flex-wrap gap-1 mt-0.5 sm:mt-1">
                    {goals.slice(0, 2).map(goal => (
                      <span key={goal} className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">
                        {goal}
                      </span>
                    ))}
                    {goals.length > 2 && (
                      <span className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                        +{goals.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Salt-Pepper-Ketchup Finishers */}
            <div className="bg-white bg-opacity-60 rounded-lg p-3 sm:p-4 shadow-sm border border-amber-100">
              <div className="flex items-center mb-2">
                <span className="text-lg sm:text-xl mr-2">🧂🌶️🍅</span>
                <h3 className="font-medium text-base sm:text-lg">The Essentials</h3>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 mb-2">Your NJIT experience comes with:</p>
              <ul className="space-y-1.5 sm:space-y-2">
                <li className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="mr-2">🧂</span>
                  <span>Campus Support & Resources</span>
                </li>
                <li className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="mr-2">🌶️</span>
                  <span>Challenging Opportunities</span>
                </li>
                <li className="flex items-center text-xs sm:text-sm text-gray-600">
                  <span className="mr-2">🍅</span>
                  <span>Community Connection</span>
                </li>
              </ul>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/onboarding/step3')}
            className="text-xs sm:text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center mt-2"
          >
            View complete order <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
          </button>
        </div>
        
        {/* Dashboard Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Today's Recommendations Section */}
          <div className="lg:col-span-2">
            <div className="mb-6 sm:mb-8" data-tour="recommendations">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 sm:h-5 w-4 sm:w-5 text-amber-600 mr-2" />
                  <h2 className="text-lg sm:text-xl font-bold">Today's Recommendations</h2>
                </div>
                <button className="text-xs sm:text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center">
                  See more <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
                </button>
              </div>
              
              <div className="grid gap-3 sm:gap-4">
                {getRecommendedEvents().map(event => (
                  <div 
                    key={event.id}
                    className={`border rounded-lg p-3 sm:p-4 shadow-sm transition-all hover:shadow-md hover:translate-y-[-2px] cursor-pointer ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start sm:items-center">
                      <h3 className="font-semibold text-base sm:text-lg">{event.title}</h3>
                      <span className={`text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full flex items-center font-medium ${getMatchBadgeColor(event.matchScore)}`}>
                        <Star className="h-2.5 sm:h-3 w-2.5 sm:w-3 mr-0.5 sm:mr-1 fill-current" /> {event.matchScore}% Match
                      </span>
                    </div>
                    <div className="mt-2 text-gray-600 text-xs sm:text-sm">
                      <div className="flex items-center mb-1">
                        <Calendar className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                        {event.date}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                        {event.location}
                      </div>
                    </div>
                    <div className="mt-2 sm:mt-3 flex flex-wrap gap-1">
                      {event.tags.map(tag => (
                        <span key={tag} className="px-1.5 sm:px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <button className="mt-2 sm:mt-3 w-full py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs sm:text-sm font-medium">
                      RSVP Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-6 sm:space-y-8">
            {/* Explore Organizations */}
            <div data-tour="organizations">
              <div className="flex items-center mb-3 sm:mb-4">
                <Users className="h-4 sm:h-5 w-4 sm:w-5 text-amber-600 mr-2" />
                <h2 className="text-lg sm:text-xl font-bold">Explore Organizations</h2>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {getRecommendedOrganizations().map(org => (
                  <div 
                    key={org.id}
                    className={`border rounded-lg p-2.5 sm:p-3 transition-all hover:shadow-sm cursor-pointer ${
                      isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-semibold text-sm sm:text-base">{org.name}</h3>
                      <span className={`text-xs px-1.5 sm:px-2 py-0.5 rounded-full flex items-center font-medium ${getMatchBadgeColor(org.matchScore)}`}>
                        {org.matchScore}%
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1">{org.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-500">{org.members} members</span>
                      <button className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 sm:py-1 rounded font-medium">
                        Explore
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-3 py-1.5 sm:py-2 border border-gray-300 rounded-md text-xs sm:text-sm font-medium hover:bg-gray-50 flex items-center justify-center">
                View All Organizations <ChevronRight className="h-3 sm:h-4 w-3 sm:w-4 ml-1" />
              </button>
            </div>
            
            {/* Similar to You Section */}
            <div className="mb-6 sm:mb-8" data-tour="similar-students">
              <SimilarToYou isDarkMode={isDarkMode} />
            </div>
            
            {/* Campus Resources */}
            <div data-tour="resources">
              <div className="flex items-center mb-3 sm:mb-4">
                <BookOpen className="h-4 sm:h-5 w-4 sm:w-5 text-amber-600 mr-2" />
                <h2 className="text-lg sm:text-xl font-bold">Your Campus Resources</h2>
              </div>
              
              <div className={`rounded-lg border p-3 sm:p-4 ${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <ul className="space-y-2 sm:space-y-3">
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                      <BookOpen className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                      {college_name} Academic Resources
                      <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                      <Calendar className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                      NJIT Event Calendar
                      <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                      <Coffee className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                      Campus Dining Locations
                      <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                      <MapPin className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                      Campus Map
                      <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3 ml-1" />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-center text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium">
                      <Utensils className="h-3 sm:h-4 w-3 sm:w-4 mr-1.5 sm:mr-2" />
                      {major_name} Student Guide
                      <ExternalLink className="h-2.5 sm:h-3 w-2.5 sm:w-3 ml-1" />
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Dashboard Tour */}
      {showTour && <DashboardTour isDarkMode={isDarkMode} onComplete={() => setShowTour(false)} />}
    </div>
  );
};

export default Dashboard; 