"use client";

import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import SubstancePicker from "../../components/onboarding/SubstancePicker";
import { useOnboardingCompleted } from "../../store/onboardingStore";
import { useRouter } from "next/navigation";

export default function OnboardingStep2() {
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
        <SubstancePicker isDarkMode={isDarkMode} />
      </main>
    </div>
  );
} 