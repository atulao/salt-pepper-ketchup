import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * User profile type that matches the required data model
 */
export type UserProfile = {
  user_id: string;
  bagel_type: string;
  major_name: string;
  college_name: string;
  substance_events: string[];
  substance_clubs: string[];
  substance_goals: string[];
  onboarding_completed: boolean;
}

/**
 * Onboarding state slice type
 */
interface OnboardingState {
  // Current step in the onboarding process (1-3)
  currentStep: number;
  
  // Profile data
  user_id: string;
  
  // Step 1: Bagel (academic program) data
  bagel_type: string;
  major_name: string;
  college_name: string;
  
  // Step 2: Substance (interests) data
  substance_events: string[];
  substance_clubs: string[];
  substance_goals: string[];
  
  // Completion status
  onboarding_completed: boolean;
  
  // Actions
  setBagelData: (data: { bagel_type: string; major_name: string; college_name: string }) => void;
  setSubstanceEvents: (events: string[]) => void;
  setSubstanceClubs: (clubs: string[]) => void;
  setSubstanceGoals: (goals: string[]) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setUserId: (id: string) => void;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Utils
  reset: () => void;
  getUserProfile: () => UserProfile;
  isStepComplete: (step: number) => boolean;
}

/**
 * Default state to use when initializing or resetting
 */
const defaultState = {
  currentStep: 1,
  user_id: '',
  bagel_type: '',
  major_name: '',
  college_name: '',
  substance_events: [],
  substance_clubs: [],
  substance_goals: [],
  onboarding_completed: false,
}

/**
 * Create the onboarding store with persistence
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultState,
      
      // Actions to update state
      setBagelData: (data) => set({
        bagel_type: data.bagel_type,
        major_name: data.major_name,
        college_name: data.college_name,
      }),
      
      setSubstanceEvents: (events) => set({ substance_events: events }),
      setSubstanceClubs: (clubs) => set({ substance_clubs: clubs }),
      setSubstanceGoals: (goals) => set({ substance_goals: goals }),
      setOnboardingCompleted: (completed) => set({ onboarding_completed: completed }),
      setUserId: (id) => set({ user_id: id }),
      
      // Navigation methods
      nextStep: () => {
        const { currentStep } = get();
        // Only allow advancing if the current step is complete
        if (get().isStepComplete(currentStep) && currentStep < 3) {
          set({ currentStep: currentStep + 1 });
        }
        
        // Automatically mark onboarding as completed when advancing from step 3
        if (currentStep === 3) {
          set({ onboarding_completed: true });
        }
      },
      
      prevStep: () => {
        const { currentStep } = get();
        if (currentStep > 1) {
          set({ currentStep: currentStep - 1 });
        }
      },
      
      goToStep: (step) => {
        // Validate the step number
        if (step >= 1 && step <= 3) {
          set({ currentStep: step });
        }
      },
      
      // Utility methods
      reset: () => set(defaultState),
      
      getUserProfile: () => ({
        user_id: get().user_id,
        bagel_type: get().bagel_type,
        major_name: get().major_name,
        college_name: get().college_name,
        substance_events: get().substance_events,
        substance_clubs: get().substance_clubs,
        substance_goals: get().substance_goals,
        onboarding_completed: get().onboarding_completed,
      }),
      
      // Check if a specific step is complete
      isStepComplete: (step) => {
        const state = get();
        
        switch (step) {
          case 1:
            // Step 1 is complete if bagel data is provided
            return Boolean(state.bagel_type && state.major_name && state.college_name);
          case 2:
            // Step 2 is complete if at least one selection in each substance category
            return (
              state.substance_events.length > 0 &&
              state.substance_clubs.length > 0 &&
              state.substance_goals.length > 0
            );
          case 3:
            // Step 3 criteria (can be customized)
            return true;
          default:
            return false;
        }
      },
    }),
    {
      name: 'spk-onboarding-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist these specific keys to localStorage
      partialize: (state) => ({
        user_id: state.user_id,
        bagel_type: state.bagel_type,
        major_name: state.major_name,
        college_name: state.college_name,
        substance_events: state.substance_events,
        substance_clubs: state.substance_clubs,
        substance_goals: state.substance_goals,
        onboarding_completed: state.onboarding_completed,
        currentStep: state.currentStep,
      }),
    }
  )
);

/**
 * Helper hooks for commonly used store patterns
 */

// Get the current onboarding step
export const useOnboardingStep = () => useOnboardingStore((state) => state.currentStep);

// Check if onboarding is completed
export const useOnboardingCompleted = () => useOnboardingStore((state) => state.onboarding_completed);

// Get bagel (academic program) data
export const useBagelData = () => {
  const store = useOnboardingStore();
  return {
    bagel_type: store.bagel_type,
    major_name: store.major_name,
    college_name: store.college_name,
    setBagelData: store.setBagelData,
  };
};

// Get substance (interests) data
export const useSubstanceData = () => {
  const store = useOnboardingStore();
  return {
    events: store.substance_events,
    clubs: store.substance_clubs,
    goals: store.substance_goals,
    setEvents: store.setSubstanceEvents,
    setClubs: store.setSubstanceClubs,
    setGoals: store.setSubstanceGoals,
  };
};

// Get navigation controls
export const useOnboardingNavigation = () => {
  const store = useOnboardingStore();
  return {
    currentStep: store.currentStep,
    nextStep: store.nextStep,
    prevStep: store.prevStep,
    goToStep: store.goToStep,
    isStepComplete: store.isStepComplete,
  };
}; 