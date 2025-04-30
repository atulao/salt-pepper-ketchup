"use client";

import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import BagelPicker from "../../components/onboarding/BagelPicker";
import { useOnboardingCompleted } from "../../store/onboardingStore";
import { useRouter } from "next/navigation";

const OnboardingStep1: React.FC = () => {
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mounted check for hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if onboarding is already completed
  useEffect(() => {
    if (onboardingCompleted) {
      router.push('/');
    }
  }, [onboardingCompleted, router]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <BagelPicker isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default OnboardingStep1; 