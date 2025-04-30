"use client";

import React, { useState } from "react";
import BagelPicker from "./BagelPicker";

const Onboarding: React.FC = () => {
  const [bagel, setBagel] = useState<{
    bagel_type: string;
    major_name: string;
    college_name: string;
  } | null>(null);

  // For now, just log the result and show a placeholder for Step 2
  if (bagel) {
    return (
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-4">Step 2 coming soon...</h2>
        <pre className="bg-gray-100 p-4 rounded text-sm">{JSON.stringify(bagel, null, 2)}</pre>
      </div>
    );
  }

  return <BagelPicker onNext={setBagel} />;
};

export default Onboarding; 