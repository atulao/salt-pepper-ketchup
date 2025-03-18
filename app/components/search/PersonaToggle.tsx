'use client';

import React from 'react';

interface PersonaToggleProps {
  personaType: string;
  onToggle: () => void;
}

const PersonaToggle: React.FC<PersonaToggleProps> = ({
  personaType,
  onToggle
}) => {
  return (
    <div className="mb-6">
      <div className="text-center mb-2 text-sm text-gray-600 font-medium">
        What's your campus status?
      </div>
      <div className="flex justify-center space-x-3">
        <button 
          onClick={() => personaType !== 'commuter' && onToggle()}
          className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            personaType === 'commuter' 
              ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 scale-105' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {personaType === 'commuter' && (
            <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🚗</span>
            <div className="font-semibold">Commuter</div>
            <div className="text-xs font-normal mt-1 max-w-40 text-center">
              Shows general campus events for non-resident students
            </div>
          </div>
        </button>
        
        <button 
          onClick={() => personaType !== 'resident' && onToggle()}
          className={`relative px-5 py-3 rounded-xl text-sm font-medium transition-all ${
            personaType === 'resident' 
              ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-300 scale-105' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {personaType === 'resident' && (
            <div className="absolute -top-2 -right-2 bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
              Active
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-2xl mb-1">🏠</span>
            <div className="font-semibold">Resident</div>
            <div className="text-xs font-normal mt-1 max-w-40 text-center">
              Only shows events for students living in campus housing
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default PersonaToggle;