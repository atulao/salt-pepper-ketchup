"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore, useOnboardingCompleted } from "../store/onboardingStore";
import RedirectDebugger from "../components/onboarding/RedirectDebugger";

export default function OnboardingRootPage() {
  const router = useRouter();
  const onboardingCompleted = useOnboardingCompleted();
  const { currentStep } = useOnboardingStore();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  useEffect(() => {
    console.log("OnboardingRootPage: Component mounted");
    
    // Add a safety check to prevent redirect loops
    const currentPath = window.location.pathname;
    
    // Only redirect if we're exactly at /onboarding AND we haven't tried redirecting yet
    if (currentPath === "/onboarding" && !redirectAttempted) {
      console.log("OnboardingRootPage: Redirecting from /onboarding");
      setRedirectAttempted(true);
      
      if (onboardingCompleted) {
        // If onboarding is completed, go to dashboard
        console.log("OnboardingRootPage: Redirecting to dashboard (onboarding completed)");
        router.replace("/dashboard");
      } else {
        // Otherwise, go to the current step or step1 if no step is set
        const targetStep = currentStep > 0 && currentStep <= 3 ? currentStep : 1;
        console.log(`OnboardingRootPage: Redirecting to step${targetStep}`);
        router.replace(`/onboarding/step${targetStep}`);
      }
    }
  }, [router, onboardingCompleted, currentStep, redirectAttempted]);

  // Return a simple loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <RedirectDebugger pageName="OnboardingRootPage" />
      <div className="text-center">
        <h1 className="text-2xl font-bold text-amber-800 mb-4">
          Setting up your order...
        </h1>
        <div className="w-16 h-16 border-t-4 border-amber-600 border-solid rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
} 