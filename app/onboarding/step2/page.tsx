"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Example options (replace with real data or fetch from API as needed)
const EVENT_OPTIONS = [
  "Hackathons",
  "Workshops",
  "Guest Lectures",
  "Social Mixers",
  "Career Fairs",
  "Sports Events",
];
const CLUB_OPTIONS = [
  "Robotics Club",
  "Women in Computing",
  "Entrepreneurship Club",
  "Gaming Guild",
  "Art Society",
  "Environmental Club",
];
const GOAL_OPTIONS = [
  "Land an Internship",
  "Start a Business",
  "Get Research Experience",
  "Build a Portfolio",
  "Network with Alumni",
  "Find a Mentor",
];

const Step2: React.FC = () => {
  const router = useRouter();
  // Retrieve Step 1 state from localStorage (or context in future)
  const [bagel, setBagel] = useState<{
    bagel_type: string;
    major_name: string;
    college_name: string;
  } | null>(null);

  useEffect(() => {
    // Try to load from localStorage (simulate state passing)
    const bagelStr = localStorage.getItem("onboarding_bagel");
    if (bagelStr) setBagel(JSON.parse(bagelStr));
  }, []);

  // Multi-select state
  const [substance_events, setEvents] = useState<string[]>([]);
  const [substance_clubs, setClubs] = useState<string[]>([]);
  const [substance_goals, setGoals] = useState<string[]>([]);

  // Handlers
  const toggle = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const canProceed =
    substance_events.length > 0 &&
    substance_clubs.length > 0 &&
    substance_goals.length > 0;

  const handleNext = () => {
    if (!canProceed) return;
    localStorage.setItem(
      "onboarding_substance",
      JSON.stringify({ substance_events, substance_clubs, substance_goals })
    );
    router.push("/onboarding/step3");
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-4">Add Substance</h2>
      <p className="mb-6 text-gray-600">Pick your favorite events, clubs, and career goals. This helps us personalize your dashboard!</p>
      {/* Events */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Events</h3>
        <div className="flex flex-wrap gap-2">
          {EVENT_OPTIONS.map((event) => (
            <button
              key={event}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                substance_events.includes(event)
                  ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => toggle(substance_events, setEvents, event)}
            >
              {event}
            </button>
          ))}
        </div>
      </div>
      {/* Clubs */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Clubs</h3>
        <div className="flex flex-wrap gap-2">
          {CLUB_OPTIONS.map((club) => (
            <button
              key={club}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                substance_clubs.includes(club)
                  ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => toggle(substance_clubs, setClubs, club)}
            >
              {club}
            </button>
          ))}
        </div>
      </div>
      {/* Career Goals */}
      <div className="mb-8">
        <h3 className="font-semibold mb-2">Career Goals</h3>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map((goal) => (
            <button
              key={goal}
              type="button"
              className={`px-3 py-1 rounded-full border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                substance_goals.includes(goal)
                  ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"
              }`}
              onClick={() => toggle(substance_goals, setGoals, goal)}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>
      <button
        className={`w-full py-2 px-4 rounded-md font-semibold transition-colors text-white ${
          canProceed ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 cursor-not-allowed"
        }`}
        onClick={handleNext}
        disabled={!canProceed}
      >
        Next
      </button>
    </div>
  );
};

export default Step2; 