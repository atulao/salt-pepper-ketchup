"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronRight, ChevronLeft, Check, Info } from "lucide-react";
import { useDashboardTour } from "../../store/onboardingStore";
import { createPortal } from "react-dom";

interface TourStep {
  target: string;
  title: string;
  content: string;
  placement: "top" | "right" | "bottom" | "left";
}

interface DashboardTourProps {
  isDarkMode?: boolean;
  onComplete?: () => void;
}

const DashboardTour: React.FC<DashboardTourProps> = ({ 
  isDarkMode = false,
  onComplete
}) => {
  const { tourCompleted, setTourCompleted } = useDashboardTour();
  const [activeStep, setActiveStep] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipDimensions, setTooltipDimensions] = useState({ width: 300, height: 200 });
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Define the tour steps
  const tourSteps: TourStep[] = [
    {
      target: "[data-tour='spk-order']",
      title: "Your SPK Order",
      content: "This is your personalized order summary, showing your selected major and interests. You can edit these at any time!",
      placement: "bottom"
    },
    {
      target: "[data-tour='recommendations']",
      title: "Today's Recommendations",
      content: "We've selected events that match your interests. Check back daily for new suggestions tailored just for you!",
      placement: "left"
    },
    {
      target: "[data-tour='organizations']",
      title: "Explore Organizations",
      content: "Discover student clubs and organizations that align with your interests and academic goals.",
      placement: "right"
    },
    {
      target: "[data-tour='similar-students']", 
      title: "Similar Students",
      content: "Connect with students who share your major or interests to build your campus network.",
      placement: "right"
    },
    {
      target: "[data-tour='resources']",
      title: "Campus Resources",
      content: "Quick links to important campus resources to help you succeed at NJIT.",
      placement: "right"
    }
  ];

  // Update tooltip position based on active step
  const updateTooltipPosition = () => {
    const step = tourSteps[activeStep];
    if (!step) return;
    
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;
    
    const targetRect = targetElement.getBoundingClientRect();
    const tooltipWidth = tooltipDimensions.width;
    const tooltipHeight = tooltipDimensions.height;
    
    // Position based on placement
    let top = 0;
    let left = 0;
    
    switch (step.placement) {
      case "top":
        top = targetRect.top - tooltipHeight - 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case "right":
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.right + 10;
        break;
      case "bottom":
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2);
        break;
      case "left":
        top = targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2);
        left = targetRect.left - tooltipWidth - 10;
        break;
    }
    
    // Keep tooltip within viewport
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    if (left < 10) left = 10;
    if (left + tooltipWidth > windowWidth - 10) left = windowWidth - tooltipWidth - 10;
    if (top < 10) top = 10;
    if (top + tooltipHeight > windowHeight - 10) top = windowHeight - tooltipHeight - 10;
    
    setTooltipPosition({ top, left });
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (tooltipRef.current) {
        setTooltipDimensions({
          width: tooltipRef.current.offsetWidth,
          height: tooltipRef.current.offsetHeight
        });
      }
      updateTooltipPosition();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeStep]);

  // Update on initial render and step change
  useEffect(() => {
    setIsMounted(true);
    
    // Create portal container
    if (typeof document !== 'undefined' && !portalContainer) {
      const container = document.createElement('div');
      container.setAttribute('id', 'dashboard-tour-portal');
      document.body.appendChild(container);
      setPortalContainer(container);
    }
    
    return () => {
      if (portalContainer && typeof document !== 'undefined') {
        document.body.removeChild(portalContainer);
      }
    };
  }, [portalContainer]);

  // Update tooltip position when step changes
  useEffect(() => {
    if (isMounted) {
      // Small delay to ensure DOM is updated
      setTimeout(() => {
        updateTooltipPosition();
      }, 100);
    }
  }, [activeStep, isMounted]);

  // Get tooltip dimensions after render
  useEffect(() => {
    if (tooltipRef.current) {
      setTooltipDimensions({
        width: tooltipRef.current.offsetWidth,
        height: tooltipRef.current.offsetHeight
      });
      updateTooltipPosition();
    }
  }, [tooltipRef, activeStep]);

  // Handle next step
  const handleNext = () => {
    if (activeStep < tourSteps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      completeTour();
    }
  };

  // Handle previous step
  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  // Handle skip tour
  const handleSkip = () => {
    completeTour();
  };

  // Complete the tour
  const completeTour = () => {
    setTourCompleted(true);
    if (onComplete) {
      onComplete();
    }
  };

  // Focus the target element
  useEffect(() => {
    const step = tourSteps[activeStep];
    if (!step) return;
    
    const targetElement = document.querySelector(step.target);
    if (!targetElement) return;
    
    // Highlight the target element
    const prevOutline = targetElement.getAttribute('style') || '';
    targetElement.setAttribute('style', `${prevOutline}; outline: 3px solid #0EA5E9; outline-offset: 4px; position: relative; z-index: 50;`);
    
    // Scroll into view if necessary
    targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    return () => {
      // Reset the outline when changing steps
      targetElement.setAttribute('style', prevOutline);
    };
  }, [activeStep, tourSteps]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        handleSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep]);

  // Return null if tour is already completed or not mounted
  if (tourCompleted || !isMounted || !portalContainer) {
    return null;
  }

  // Current step data
  const currentStep = tourSteps[activeStep];
  
  // Render the tooltip in a portal
  return createPortal(
    <div 
      ref={tooltipRef}
      className={`fixed z-[1000] transition-all duration-300 ease-in-out shadow-xl rounded-lg p-4 ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
      }`}
      style={{ 
        top: `${tooltipPosition.top}px`, 
        left: `${tooltipPosition.left}px`,
        width: '300px',
        maxWidth: '95vw'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      {/* Tour content */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-amber-500 mr-2" />
          <h3 id="tour-title" className="font-bold text-lg">{currentStep.title}</h3>
        </div>
        <button
          onClick={handleSkip}
          className="text-gray-500 hover:text-gray-700 p-1 rounded-full"
          aria-label="Skip tour"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      
      <p className="text-sm mb-4">{currentStep.content}</p>
      
      {/* Step indicator */}
      <div className="flex justify-center mb-4">
        {tourSteps.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 rounded-full mx-1 ${
              index === activeStep
                ? 'bg-amber-500'
                : isDarkMode
                  ? 'bg-gray-600'
                  : 'bg-gray-300'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      
      {/* Navigation buttons */}
      <div className="flex justify-between">
        <button
          onClick={handlePrev}
          className={`flex items-center text-sm font-medium px-3 py-1.5 rounded ${
            activeStep === 0
              ? 'text-gray-400 cursor-not-allowed'
              : isDarkMode
                ? 'text-blue-400 hover:bg-gray-700'
                : 'text-blue-600 hover:bg-gray-100'
          }`}
          disabled={activeStep === 0}
          aria-label="Previous step"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Previous
        </button>
        
        <button
          onClick={handleNext}
          className={`flex items-center text-sm font-medium px-3 py-1.5 rounded ${
            isDarkMode
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-amber-500 hover:bg-amber-600 text-white'
          }`}
          aria-label={activeStep === tourSteps.length - 1 ? "Complete tour" : "Next step"}
        >
          {activeStep === tourSteps.length - 1 ? (
            <>
              <Check className="h-4 w-4 mr-1" /> Got it
            </>
          ) : (
            <>
              Next <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>
      
      {/* Skip link */}
      <div className="text-center mt-3">
        <button
          onClick={handleSkip}
          className="text-xs text-gray-500 hover:underline"
          aria-label="Skip tour"
        >
          Skip tour
        </button>
      </div>

      {/* Helper overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-[-1]" 
        onClick={handleSkip}
        aria-hidden="true"
      />
    </div>,
    portalContainer
  );
};

export default DashboardTour; 