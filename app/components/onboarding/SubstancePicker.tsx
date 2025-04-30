"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Coffee, Film, Users, Target, ArrowLeft } from "lucide-react";
import { useSubstanceData, useOnboardingNavigation } from "../../store/onboardingStore";

// Substance options for each category
const substanceOptions = {
  events: [
    'Networking Events', 'Tech Talks', 'Career Fairs', 'Hackathons',
    'Cultural Celebrations', 'Sports Events', 'Concerts', 'Game Nights',
    'Study Groups', 'Workshops', 'Free Food Events', 'Alumni Meetups'
  ],
  clubs: [
    'Programming Club', 'Entrepreneurship Club', 'International Student Association',
    'Dance Club', 'Debate Team', 'Sports Clubs', 'Music Club', 'Art Club',
    'Cultural Clubs', 'Student Government', 'Honor Societies', 'Greek Life'
  ],
  goals: [
    'Land an Internship', 'Build a Professional Network', 'Academic Excellence',
    'Research Experience', 'Leadership Skills', 'Public Speaking', 'Make New Friends',
    'Work-Life Balance', 'Graduate School Prep', 'Job Placement', 'Start a Business'
  ]
};

interface SubstancePickerProps {
  isDarkMode?: boolean;
}

const SubstancePicker: React.FC<SubstancePickerProps> = ({ isDarkMode = false }) => {
  const router = useRouter();
  const { events, clubs, goals, setEvents, setClubs, setGoals } = useSubstanceData();
  const { nextStep, prevStep, isStepComplete } = useOnboardingNavigation();
  
  // Local state for checking completion
  const [isValid, setIsValid] = useState(false);
  
  // Validation check
  useEffect(() => {
    setIsValid(events.length > 0 && clubs.length > 0 && goals.length > 0);
  }, [events, clubs, goals]);
  
  // Toggle selection for an event
  const toggleEvent = (event: string) => {
    if (events.includes(event)) {
      setEvents(events.filter((e: string) => e !== event));
    } else {
      setEvents([...events, event]);
    }
  };
  
  // Toggle selection for a club
  const toggleClub = (club: string) => {
    if (clubs.includes(club)) {
      setClubs(clubs.filter((c: string) => c !== club));
    } else {
      setClubs([...clubs, club]);
    }
  };
  
  // Toggle selection for a goal
  const toggleGoal = (goal: string) => {
    if (goals.includes(goal)) {
      setGoals(goals.filter((g: string) => g !== goal));
    } else {
      setGoals([...goals, goal]);
    }
  };
  
  // Navigation handlers
  const handleNext = () => {
    if (isValid) {
      nextStep();
      router.push('/onboarding/step3');
    }
  };
  
  const handleBack = () => {
    prevStep();
    router.push('/onboarding/step1');
  };
  
  // Get category completion status
  const getCategoryStatus = (category: 'events' | 'clubs' | 'goals') => {
    const selections = category === 'events' ? events : category === 'clubs' ? clubs : goals;
    return selections.length > 0;
  };

  return (
    <div className={`relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-2 font-serif text-amber-600">
          Stack Some Substance
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          Select at least one option from each category to customize your experience
        </p>
      </div>
      
      {/* Progress Indicators */}
      <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
        <div className={`p-3 rounded-lg text-center transition-colors ${
          getCategoryStatus('events') 
            ? 'bg-amber-100 border border-amber-300 text-amber-800' 
            : 'bg-gray-100 border border-gray-200 text-gray-500'
        }`}>
          <Film className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Events</span>
          {getCategoryStatus('events') && (
            <div className="mt-1 text-xs text-amber-600 flex items-center justify-center">
              <Check className="h-3 w-3 mr-1" /> Selected
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg text-center transition-colors ${
          getCategoryStatus('clubs') 
            ? 'bg-amber-100 border border-amber-300 text-amber-800' 
            : 'bg-gray-100 border border-gray-200 text-gray-500'
        }`}>
          <Users className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Clubs</span>
          {getCategoryStatus('clubs') && (
            <div className="mt-1 text-xs text-amber-600 flex items-center justify-center">
              <Check className="h-3 w-3 mr-1" /> Selected
            </div>
          )}
        </div>
        
        <div className={`p-3 rounded-lg text-center transition-colors ${
          getCategoryStatus('goals') 
            ? 'bg-amber-100 border border-amber-300 text-amber-800' 
            : 'bg-gray-100 border border-gray-200 text-gray-500'
        }`}>
          <Target className="h-5 w-5 mx-auto mb-1" />
          <span className="text-sm font-medium">Goals</span>
          {getCategoryStatus('goals') && (
            <div className="mt-1 text-xs text-amber-600 flex items-center justify-center">
              <Check className="h-3 w-3 mr-1" /> Selected
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-10 mb-12">
        {/* Events Section */}
        <section>
          <div className="flex items-center mb-4">
            <Film className="h-6 w-6 text-amber-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              Campus Events
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            Select the types of events you'd like to attend at NJIT
          </p>
          <div className="flex flex-wrap gap-3">
            {substanceOptions.events.map(event => (
              <button
                key={event}
                onClick={() => toggleEvent(event)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  events.includes(event)
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {event}
              </button>
            ))}
          </div>
        </section>
        
        {/* Clubs Section */}
        <section>
          <div className="flex items-center mb-4">
            <Users className="h-6 w-6 text-amber-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              Clubs & Organizations
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            Select the types of clubs you're interested in joining
          </p>
          <div className="flex flex-wrap gap-3">
            {substanceOptions.clubs.map(club => (
              <button
                key={club}
                onClick={() => toggleClub(club)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  clubs.includes(club)
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {club}
              </button>
            ))}
          </div>
        </section>
        
        {/* Goals Section */}
        <section>
          <div className="flex items-center mb-4">
            <Target className="h-6 w-6 text-amber-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-800">
              Your Goals at NJIT
            </h2>
          </div>
          <p className="text-gray-600 mb-4">
            Select what you want to accomplish during your time at NJIT
          </p>
          <div className="flex flex-wrap gap-3">
            {substanceOptions.goals.map(goal => (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  goals.includes(goal)
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : isDarkMode 
                      ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </section>
      </div>
      
      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="px-6 py-2 rounded-md border border-gray-300 flex items-center text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Step 1
        </button>
        
        <button
          onClick={handleNext}
          disabled={!isValid}
          className={`px-6 py-2 rounded-md font-medium transition-colors ${
            isValid
              ? 'bg-amber-600 text-white hover:bg-amber-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue to Step 3
        </button>
      </div>
      
      {/* Validation Info */}
      {!isValid && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
          Please select at least one option from each category to continue.
        </div>
      )}
    </div>
  );
};

export default SubstancePicker; 