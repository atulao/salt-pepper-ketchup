"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { useBagelData, useSubstanceData, useOnboardingNavigation, useOnboardingStore } from "../../store/onboardingStore";

// Animation sequence with emojis
const ANIMATION_STEPS = [
  { name: "bagel", emoji: "🥯", label: "Your bagel..." },
  { name: "substance", emoji: "🍳", label: "Adding toppings..." },
  { name: "salt", emoji: "🧂", label: "A pinch of salt..." },
  { name: "pepper", emoji: "🌶️", label: "A dash of pepper..." },
  { name: "ketchup", emoji: "🍅", label: "Squeezing ketchup..." },
  { name: "complete", emoji: "✅", label: "Order Up!" }
];

// Animation durations
const STEP_DURATION = 800; // ms per step
const TOTAL_DURATION = ANIMATION_STEPS.length * STEP_DURATION; // total animation time

interface OrderSummaryProps {
  isDarkMode?: boolean;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({ isDarkMode = false }) => {
  const router = useRouter();
  const { bagel_type, major_name, college_name } = useBagelData();
  const { events, clubs, goals } = useSubstanceData();
  const { prevStep } = useOnboardingNavigation();
  const setOnboardingCompleted = useOnboardingStore(state => state.setOnboardingCompleted);
  
  // Animation state
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  // Format selections for display
  const formatSubstance = () => {
    const allSubstances = [...events, ...clubs, ...goals];
    if (allSubstances.length <= 3) return allSubstances.join(", ");
    
    // If more than 3, show first 2 and count
    return `${allSubstances[0]}, ${allSubstances[1]}, and ${allSubstances.length - 2} more`;
  };
  
  // Animation sequence
  useEffect(() => {
    if (!orderPlaced) return;
    
    // Start animation
    setCurrentStep(0);
    
    // Set up timers for each step
    const timers: NodeJS.Timeout[] = [];
    
    for (let i = 1; i <= ANIMATION_STEPS.length; i++) {
      timers.push(
        setTimeout(() => {
          setCurrentStep(i);
          
          // Last step
          if (i === ANIMATION_STEPS.length - 1) {
            setTimeout(() => {
              setAnimationComplete(true);
              setOnboardingCompleted(true);
              
              // After a delay, redirect to dashboard
              setTimeout(() => {
                router.push("/dashboard");
              }, 1500);
            }, STEP_DURATION);
          }
        }, i * STEP_DURATION)
      );
    }
    
    // Cleanup
    return () => timers.forEach(clearTimeout);
  }, [orderPlaced, router, setOnboardingCompleted]);
  
  // Navigation handler
  const handleBack = () => {
    prevStep();
    router.push("/onboarding/step2");
  };
  
  // Place order handler
  const handlePlaceOrder = () => {
    setOrderPlaced(true);
  };
  
  // Check if we have all the needed data
  const hasAllData = Boolean(bagel_type && major_name && events.length && clubs.length && goals.length);

  return (
    <div className={`relative ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold mb-2 font-serif text-amber-600">
          Here's Your Order — Hot and Fresh!
        </h1>
        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 px-2 sm:px-0">
          Review and confirm your selections to complete your NJIT experience
        </p>
      </div>
      
      {/* Order Summary Card */}
      <div className={`rounded-lg border p-4 sm:p-6 mb-8 sm:mb-10 ${
        isDarkMode 
          ? 'bg-gray-800 border-gray-700' 
          : 'bg-amber-50 border-amber-200'
      }`}>
        <h2 className="text-xl font-bold mb-4 text-amber-700">Your SPK Order:</h2>
        
        {/* Bagel (Major) Section */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🥯</span>
            <h3 className="text-lg font-medium">Your Bagel:</h3>
          </div>
          <div className="ml-7 sm:ml-9 pl-1 border-l-2 border-amber-300">
            <p className="text-base sm:text-lg">
              <span className="font-semibold">{bagel_type}</span> 
              <span className="text-gray-500"> from </span>
              <span className="text-xs sm:text-sm text-gray-500">{college_name}</span>
            </p>
            <p className="text-sm sm:text-base text-gray-600">{major_name}</p>
          </div>
        </div>
        
        {/* Substance Section */}
        <div className="mb-5 sm:mb-6">
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🍳</span>
            <h3 className="text-lg font-medium">Your Toppings:</h3>
          </div>
          <div className="ml-7 sm:ml-9 pl-1 border-l-2 border-amber-300">
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-medium text-amber-700">Events:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {events.map(event => (
                  <span key={event} className="px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-800">
                    {event}
                  </span>
                ))}
              </div>
            </div>
            <div className="mb-2">
              <p className="text-xs sm:text-sm font-medium text-amber-700">Clubs:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {clubs.map(club => (
                  <span key={club} className="px-2 py-0.5 text-xs rounded bg-purple-100 text-purple-800">
                    {club}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-amber-700">Goals:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {goals.map(goal => (
                  <span key={goal} className="px-2 py-0.5 text-xs rounded bg-green-100 text-green-800">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* SPK Finishing */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-2xl mr-2">🧂🌶️🍅</span>
            <h3 className="text-lg font-medium">The Finishing Touch:</h3>
          </div>
          <div className="ml-7 sm:ml-9 pl-1 border-l-2 border-amber-300">
            <p className="text-sm sm:text-base text-gray-600">Salt-Pepper-Ketchup: The essential NJIT experience!</p>
          </div>
        </div>
        
        {/* Summary Quote */}
        <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-amber-100 rounded-lg border border-amber-200 text-center">
          <p className="italic text-base sm:text-lg text-amber-800">
            "Lemme getta {major_name} Bagel with {formatSubstance()}, Salt-Pepper-Ketchup!"
          </p>
        </div>
      </div>
      
      {/* Animation Area */}
      {orderPlaced && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 sm:p-6 mb-6 sm:mb-8 text-center min-h-[180px] sm:min-h-[200px] flex flex-col items-center justify-center">
          {currentStep >= 0 && currentStep < ANIMATION_STEPS.length && (
            <>
              <div className="text-4xl sm:text-5xl mb-3 sm:mb-4 animate-bounce-in">
                {ANIMATION_STEPS[currentStep].emoji}
              </div>
              <p className="text-base sm:text-lg font-medium text-amber-800 animate-fade-in">
                {ANIMATION_STEPS[currentStep].label}
              </p>
            </>
          )}
          
          {animationComplete && (
            <div className="mt-4 flex flex-col items-center animate-fade-in">
              <div className="text-2xl sm:text-3xl mb-2 animate-slide-in">🥯 + 🍳 + 🧂🌶️🍅 = 😋</div>
              <p className="text-lg sm:text-xl font-bold text-green-600 flex items-center animate-fade-in">
                <Check className="mr-2 h-4 sm:h-5 w-4 sm:w-5" /> Your SPK is Ready!
              </p>
              <p className="text-sm sm:text-base text-gray-600 mt-2 fade-in">Redirecting to dashboard...</p>
            </div>
          )}
        </div>
      )}
      
      {/* Navigation Buttons */}
      {!orderPlaced && (
        <div className="flex flex-col sm:flex-row justify-between mt-6 sm:mt-8 gap-3 sm:gap-0">
          <button
            onClick={handleBack}
            className="px-4 sm:px-6 py-2 rounded-md border border-gray-300 flex items-center justify-center sm:justify-start text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Step 2
          </button>
          
          <button
            onClick={handlePlaceOrder}
            disabled={!hasAllData}
            className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-base sm:text-lg transition-transform transform active:scale-95 diner-btn-pop ${
              hasAllData
                ? 'bg-amber-600 text-white hover:bg-amber-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Place My Order
          </button>
        </div>
      )}
      
      {/* Missing Data Warning */}
      {!hasAllData && !orderPlaced && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-xs sm:text-sm">
          Please complete steps 1 and 2 before placing your order.
        </div>
      )}
    </div>
  );
};

export default OrderSummary; 