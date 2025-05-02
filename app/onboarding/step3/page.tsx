"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TopNavBar from "../../components/TopNavBar";
import OrderSummary from "../../components/onboarding/OrderSummary";
import { useOnboardingNavigation, useOnboardingCompleted } from "../../store/onboardingStore";
import RedirectDebugger from "../../components/onboarding/RedirectDebugger";

const OnboardingStep3: React.FC = () => {
  const router = useRouter();
  const { isStepComplete } = useOnboardingNavigation();
  const onboardingCompleted = useOnboardingCompleted();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Mounted check for hydration
  useEffect(() => {
    setMounted(true);
    console.log("Step3: Component mounted");
  }, []);

  // Check redirect conditions
  useEffect(() => {
    if (!mounted) return;
    
    if (onboardingCompleted) {
      console.log("Step3: Onboarding already completed, redirecting to dashboard");
      router.replace("/dashboard");
    } else if (!isStepComplete(2)) {
      console.log("Step3: Step 2 not complete, redirecting to step2");
      router.replace("/onboarding/step2");
    }
  }, [mounted, onboardingCompleted, isStepComplete, router]);

  if (!mounted) return null;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-950' : 'bg-white'}`}>
      <RedirectDebugger pageName="OnboardingStep3" />
      <TopNavBar onModeChange={setIsDarkMode} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <OrderSummary isDarkMode={isDarkMode} />
      </main>
    </div>
  );
};

export default OnboardingStep3; 