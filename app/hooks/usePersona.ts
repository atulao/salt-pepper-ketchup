// app/hooks/usePersona.ts
import { useState, useEffect } from 'react';

export const usePersona = () => {
  const [personaType, setPersonaType] = useState<string>('commuter');

  // Load last used persona from localStorage
  useEffect(() => {
    const savedPersona = localStorage.getItem('personaType');
    if (savedPersona === 'resident' || savedPersona === 'commuter') {
      setPersonaType(savedPersona);
    }
  }, []);

  // Save persona when it changes
  useEffect(() => {
    localStorage.setItem('personaType', personaType);
  }, [personaType]);

  // Toggle between commuter and resident
  const togglePersona = () => {
    setPersonaType(prev => prev === 'commuter' ? 'resident' : 'commuter');
  };

  return {
    personaType,
    setPersonaType,
    togglePersona
  };
};

export default usePersona;