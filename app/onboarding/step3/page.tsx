"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNavBar from "../../components/TopNavBar";
import OrderSummary from "../../components/onboarding/OrderSummary";
import { useOnboardingNavigation, useOnboardingCompleted } from "../../store/onboardingStore";

const OnboardingStep3: React.FC = () => {
  const router = useRouter();
  const { isStepComplete } = useOnboardingNavigation();
  const onboardingCompleted = useOnboardingCompleted();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mounted check for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect guards
  useEffect(() => {
    if (onboardingCompleted) {
      // If onboarding is already completed, redirect to dashboard
      router.push('/dashboard');
      return;
    }
    
    // Check if previous steps were completed
    if (!isStepComplete(1) || !isStepComplete(2)) {
      // Redirect to the first incomplete step
      if (!isStepComplete(1)) {
        router.push('/onboarding/step1');
      } else {
        router.push('/onboarding/step2');
      }
    }
  }, [onboardingCompleted, isStepComplete, router]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <OrderSummary isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default OnboardingStep3; 