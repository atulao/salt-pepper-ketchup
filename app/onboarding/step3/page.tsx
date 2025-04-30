"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const ANIMATION_STEPS = [
  "bagel",
  "substance",
  "spk",
  "done"
];

const emojiForBagel = "🥯";
const emojiForSubstance = "🍳";
const emojiForSPK = "🧂";

const Step3: React.FC = () => {
  const router = useRouter();
  const [bagel, setBagel] = useState<{
    bagel_type: string;
    major_name: string;
    college_name: string;
  } | null>(null);
  const [substance, setSubstance] = useState<{
    substance_events: string[];
    substance_clubs: string[];
    substance_goals: string[];
  }>({ substance_events: [], substance_clubs: [], substance_goals: [] });
  const [animStep, setAnimStep] = useState<string | null>(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Load onboarding data from localStorage
  useEffect(() => {
    const bagelStr = localStorage.getItem("onboarding_bagel");
    if (bagelStr) setBagel(JSON.parse(bagelStr));
    const substanceStr = localStorage.getItem("onboarding_substance");
    if (substanceStr) setSubstance(JSON.parse(substanceStr));
  }, []);

  // Animation sequence
  useEffect(() => {
    if (!orderPlaced) return;
    let stepIdx = 0;
    setAnimStep(ANIMATION_STEPS[stepIdx]);
    const timers: NodeJS.Timeout[] = [];
    for (let i = 1; i < ANIMATION_STEPS.length; i++) {
      timers.push(
        setTimeout(() => {
          setAnimStep(ANIMATION_STEPS[i]);
        }, i * 700)
      );
    }
    // After all animations, simulate save and redirect
    timers.push(
      setTimeout(() => {
        // Simulate saving onboarding_completed
        localStorage.setItem("onboarding_completed", "true");
        router.push("/dashboard");
      }, ANIMATION_STEPS.length * 700 + 800)
    );
    return () => timers.forEach(clearTimeout);
  }, [orderPlaced, router]);

  // Compose summary text
  const summary = bagel && substance ? (
    <div className="text-lg md:text-xl font-medium text-gray-800 leading-relaxed text-center">
      <div>
        Lemmegetta a <span className="font-bold">{emojiForBagel} {bagel.bagel_type}</span>
      </div>
      <div className="mt-2">
        with <span className="font-bold">{emojiForSubstance} {[
          ...substance.substance_events,
          ...substance.substance_clubs,
          ...substance.substance_goals
        ].join(", ")}</span>
      </div>
      <div className="mt-2">
        and top it off with <span className="font-bold">{emojiForSPK} Salt Pepper Ketchup!</span>
      </div>
    </div>
  ) : null;

  // Animation classes
  const bagelAnim = animStep === "bagel" ? "animate-bounce-in" : "opacity-0";
  const substanceAnim = animStep === "substance" ? "animate-fade-in" : "opacity-0";
  const spkAnim = animStep === "spk" ? "animate-slide-in" : "opacity-0";
  const doneAnim = animStep === "done" ? "animate-fade-in" : "opacity-0";

  return (
    <div className="max-w-2xl mx-auto py-12 px-4 flex flex-col items-center">
      <h2 className="text-3xl font-extrabold mb-2 text-center diner-font">Lemmegetta</h2>
      <p className="mb-8 text-gray-600 text-center text-lg">You're one step away from building your perfect NJIT experience.</p>
      <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl shadow p-6 mb-8">
        {summary}
      </div>
      {/* Animation sequence */}
      <div className="flex flex-col items-center min-h-[120px] w-full mb-8">
        <span className={`text-5xl mb-2 transition-all duration-500 ${bagelAnim}`}>{emojiForBagel}</span>
        <span className={`text-5xl mb-2 transition-all duration-500 ${substanceAnim}`}>{emojiForSubstance}</span>
        <span className={`text-5xl mb-2 transition-all duration-500 ${spkAnim}`}>{emojiForSPK}</span>
        {animStep === "done" && (
          <div className={`mt-4 text-xl font-bold text-green-700 ${doneAnim}`}>✅ Order Up! Your SPK is Ready. 🚀</div>
        )}
      </div>
      {!orderPlaced && (
        <button
          className="w-full py-3 px-6 rounded-md font-bold text-white bg-red-600 hover:bg-red-700 text-lg shadow diner-btn diner-btn-pop"
          onClick={() => setOrderPlaced(true)}
        >
          Place My Order
        </button>
      )}
    </div>
  );
};

// Tailwind animation utilities (add to globals.css or tailwind config if needed)
// .animate-bounce-in { animation: bounce-in 0.7s; }
// .animate-fade-in { animation: fade-in 0.7s; }
// .animate-slide-in { animation: slide-in 0.7s; }
//
// @keyframes bounce-in { 0% { transform: scale(0.5); opacity: 0; } 60% { transform: scale(1.2); opacity: 1; } 100% { transform: scale(1); } }
// @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
// @keyframes slide-in { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
//
// .diner-font { font-family: 'Pacifico', cursive; }
// .diner-btn-pop { transition: transform 0.1s; }
// .diner-btn-pop:active { transform: scale(0.96); }

export default Step3; 