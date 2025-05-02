"use client";

import React, { useState, useEffect } from "react";
import TopNavBar from "../../components/TopNavBar";
import SubstancePicker from "../../components/onboarding/SubstancePicker";
import { useOnboardingCompleted, useOnboardingNavigation } from "../../store/onboardingStore";
import { useRouter } from "next/navigation";
import RedirectDebugger from "../../components/onboarding/RedirectDebugger";

export default function OnboardingStep2() {
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const { isStepComplete } = useOnboardingNavigation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mounted check for hydration
  useEffect(() => {
    setMounted(true);
    console.log("Step2: Component mounted");
  }, []);

  // Check if onboarding is already completed or previous step is not complete
  useEffect(() => {
    if (!mounted) return;
    
    if (onboardingCompleted) {
      console.log("Step2: Onboarding already completed, redirecting to dashboard");
      router.replace("/dashboard");
    } else if (!isStepComplete(1)) {
      console.log("Step2: Step 1 not complete, redirecting to step1");
      router.replace("/onboarding/step1");
    }
  }, [mounted, onboardingCompleted, isStepComplete, router]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <RedirectDebugger pageName="OnboardingStep2" />
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <SubstancePicker isDarkMode={isDarkMode} />
      </main>
    </div>
  );
} 