'use client';

import { useEffect } from 'react';

interface RedirectDebuggerProps {
  pageName: string; 
}

export default function RedirectDebugger({ pageName }: RedirectDebuggerProps) {
  
  useEffect(() => {
    console.log(`🔍 [${pageName}] Component mounted`);
    console.log(`🔍 [${pageName}] Current path: ${window.location.pathname}`);
    
    return () => {
      console.log(`🔍 [${pageName}] Component unmounted`);
    };
  }, [pageName]);
  
  useEffect(() => {
    // Track navigation events
    const handleRouteChange = () => {
      console.log(`🔍 [${pageName}] History state changed to: ${window.location.pathname}`);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [pageName]);
  
  return null; // This component doesn't render anything
} 