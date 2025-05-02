"use client";

import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import BagelPicker from "../../components/onboarding/BagelPicker";
import { useOnboardingCompleted } from "../../store/onboardingStore";
import { useRouter } from "next/navigation";
import RedirectDebugger from "../../components/onboarding/RedirectDebugger";

const OnboardingStep1: React.FC = () => {
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mounted check for hydration
  useEffect(() => {
    setMounted(true);
    console.log("Step1: Component mounted");
  }, []);

  // Check if onboarding is already completed
  useEffect(() => {
    if (mounted && onboardingCompleted) {
      console.log("Step1: Onboarding already completed, redirecting to dashboard");
      router.replace("/dashboard");
    }
  }, [mounted, onboardingCompleted, router]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <RedirectDebugger pageName="OnboardingStep1" />
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <BagelPicker isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default OnboardingStep1; 