import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// User profile from social auth
export interface SocialUserProfile {
  id: string;
  name?: string;
  email?: string;
  image?: string;
  provider?: string;  // 'google' | 'linkedin' | 'credentials'
}

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
  dashboard_tour_completed: boolean;
  
  // New user profile fields
  name?: string;
  email?: string;
  image?: string;
  auth_provider?: string;
  is_authenticated: boolean;
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
  
  // Dashboard tour status
  dashboard_tour_completed: boolean;
  
  // Authentication state
  name: string;
  email: string;
  image: string | null;
  auth_provider: string | null;
  is_authenticated: boolean;
  
  // Save & resume progress
  saveCode: string | null;
  
  // Actions
  setBagelData: (data: { bagel_type: string; major_name: string; college_name: string }) => void;
  setSubstanceEvents: (events: string[]) => void;
  setSubstanceClubs: (clubs: string[]) => void;
  setSubstanceGoals: (goals: string[]) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setDashboardTourCompleted: (completed: boolean) => void;
  setUserId: (id: string) => void;
  
  // New profile editing methods
  updateBagelData: (data: Partial<{ bagel_type: string; major_name: string; college_name: string }>) => void;
  updateSubstanceEvents: (updater: (current: string[]) => string[]) => void;
  updateSubstanceClubs: (updater: (current: string[]) => string[]) => void;
  updateSubstanceGoals: (updater: (current: string[]) => string[]) => void;
  
  // Authentication methods
  setUserAuthData: (data: SocialUserProfile) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  clearAuthData: () => void;
  
  // Navigation
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  
  // Save & resume progress methods
  generateSaveCode: () => string;
  saveProgress: (email?: string) => string;
  loadProgress: (code: string) => boolean;
  hasSaveCode: () => boolean;
  getSaveCode: () => string | null;
  
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
  dashboard_tour_completed: false,
  
  // Authentication state defaults
  name: '',
  email: '',
  image: null,
  auth_provider: null,
  is_authenticated: false,
  
  // Save & resume defaults
  saveCode: null,
}

// Save code prefix for localStorage
const SAVE_CODE_PREFIX = 'spk-onboarding-';

/**
 * Validates if the provided string is a valid 6-digit order code
 * @param code - The code to validate
 */
export const isValidOrderCode = (code: string): boolean => {
  return /^\d{6}$/.test(code);
};

/**
 * Create the onboarding store with persistence
 */
export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultState,
      
      // Actions to update state
      setBagelData: (data: { bagel_type: string; major_name: string; college_name: string }) => set({
        bagel_type: data.bagel_type,
        major_name: data.major_name,
        college_name: data.college_name,
      }),
      
      setSubstanceEvents: (events: string[]) => set({ substance_events: events }),
      setSubstanceClubs: (clubs: string[]) => set({ substance_clubs: clubs }),
      setSubstanceGoals: (goals: string[]) => set({ substance_goals: goals }),
      setOnboardingCompleted: (completed: boolean) => set({ onboarding_completed: completed }),
      setDashboardTourCompleted: (completed: boolean) => set({ dashboard_tour_completed: completed }),
      setUserId: (id: string) => set({ user_id: id }),
      
      // New profile editing methods that allow partial updates
      updateBagelData: (data: Partial<{ bagel_type: string; major_name: string; college_name: string }>) => set((state) => ({
        bagel_type: data.bagel_type ?? state.bagel_type,
        major_name: data.major_name ?? state.major_name,
        college_name: data.college_name ?? state.college_name,
      })),
      
      updateSubstanceEvents: (updater: (current: string[]) => string[]) => set((state) => ({
        substance_events: updater(state.substance_events)
      })),
      
      updateSubstanceClubs: (updater: (current: string[]) => string[]) => set((state) => ({
        substance_clubs: updater(state.substance_clubs)
      })),
      
      updateSubstanceGoals: (updater: (current: string[]) => string[]) => set((state) => ({
        substance_goals: updater(state.substance_goals)
      })),
      
      // Authentication methods
      setUserAuthData: (data: SocialUserProfile) => set((state) => ({
        user_id: data.id || state.user_id,
        name: data.name || state.name,
        email: data.email || state.email,
        image: data.image || state.image,
        auth_provider: data.provider || state.auth_provider,
        is_authenticated: true
      })),
      
      setAuthenticated: (isAuthenticated: boolean) => set({ is_authenticated: isAuthenticated }),
      
      clearAuthData: () => set({
        name: '',
        email: '',
        image: null,
        auth_provider: null,
        is_authenticated: false
      }),
      
      // Save & resume progress methods
      generateSaveCode: () => {
        // Generate a random 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        return code;
      },
      
      saveProgress: (email?: string) => {
        const state = get();
        const code = state.generateSaveCode();
        
        // Create save data object with current state and timestamp
        const saveData = {
          currentStep: state.currentStep,
          bagel_type: state.bagel_type,
          major_name: state.major_name,
          college_name: state.college_name,
          substance_events: state.substance_events,
          substance_clubs: state.substance_clubs,
          substance_goals: state.substance_goals,
          email: email || state.email,
          timestamp: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days expiration
        };
        
        // Save to localStorage with the code as key
        if (typeof window !== 'undefined') {
          localStorage.setItem(`${SAVE_CODE_PREFIX}${code}`, JSON.stringify(saveData));
        }
        
        // Update the save code in the store
        set({ saveCode: code });
        
        return code;
      },
      
      loadProgress: (code: string) => {
        if (typeof window === 'undefined') return false;
        
        // Validate code format
        if (!isValidOrderCode(code)) {
          return false;
        }
        
        // Get saved data from localStorage
        const savedDataString = localStorage.getItem(`${SAVE_CODE_PREFIX}${code}`);
        if (!savedDataString) return false;
        
        try {
          const savedData = JSON.parse(savedDataString);
          
          // Check if the save is expired
          if (savedData.expiresAt && new Date(savedData.expiresAt) < new Date()) {
            // Remove expired save
            localStorage.removeItem(`${SAVE_CODE_PREFIX}${code}`);
            return false;
          }
          
          // Update store with saved data
          set({
            currentStep: savedData.currentStep || 1,
            bagel_type: savedData.bagel_type || '',
            major_name: savedData.major_name || '',
            college_name: savedData.college_name || '',
            substance_events: savedData.substance_events || [],
            substance_clubs: savedData.substance_clubs || [],
            substance_goals: savedData.substance_goals || [],
            email: savedData.email || '',
            saveCode: code
          });
          
          return true;
        } catch (error) {
          console.error('Error loading progress:', error);
          return false;
        }
      },
      
      hasSaveCode: () => {
        return Boolean(get().saveCode);
      },
      
      getSaveCode: () => {
        return get().saveCode;
      },
      
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
      
      goToStep: (step: number) => {
        // Validate the step number
        if (step >= 1 && step <= 3) {
          set({ currentStep: step });
        }
      },
      
      // Utility methods
      reset: () => set({
        ...defaultState,
        // Preserve authentication data during reset
        name: get().name,
        email: get().email,
        image: get().image,
        auth_provider: get().auth_provider,
        is_authenticated: get().is_authenticated,
        user_id: get().user_id,
      }),
      
      getUserProfile: () => ({
        user_id: get().user_id,
        bagel_type: get().bagel_type,
        major_name: get().major_name,
        college_name: get().college_name,
        substance_events: get().substance_events,
        substance_clubs: get().substance_clubs,
        substance_goals: get().substance_goals,
        onboarding_completed: get().onboarding_completed,
        dashboard_tour_completed: get().dashboard_tour_completed,
        name: get().name,
        email: get().email,
        image: get().image,
        auth_provider: get().auth_provider,
        is_authenticated: get().is_authenticated,
      }),
      
      // Check if a specific step is complete
      isStepComplete: (step: number) => {
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
            // Step 3 is always complete (review step)
            return true;
          default:
            return false;
        }
      },
    }),
    {
      name: 'onboarding-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Named exports for specific slices of state
export const useOnboardingStep = () => useOnboardingStore((state) => state.currentStep);
export const useOnboardingCompleted = () => useOnboardingStore((state) => state.onboarding_completed);
export const useDashboardTourCompleted = () => useOnboardingStore((state) => state.dashboard_tour_completed);

// Access bagel data
export const useBagelData = () => {
  const store = useOnboardingStore();
  return {
    bagel_type: store.bagel_type,
    major_name: store.major_name,
    college_name: store.college_name,
    setBagelData: store.setBagelData,
    updateBagelData: store.updateBagelData,
  };
};

// Access substance data
export const useSubstanceData = () => {
  const store = useOnboardingStore();
  return {
    events: store.substance_events,
    clubs: store.substance_clubs,
    goals: store.substance_goals,
    setEvents: store.setSubstanceEvents,
    setClubs: store.setSubstanceClubs,
    setGoals: store.setSubstanceGoals,
    updateEvents: store.updateSubstanceEvents,
    updateClubs: store.updateSubstanceClubs,
    updateGoals: store.updateSubstanceGoals,
  };
};

// Onboarding navigation controls
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

// Dashboard tour controls
export const useDashboardTour = () => {
  const store = useOnboardingStore();
  return {
    tourCompleted: store.dashboard_tour_completed,
    setTourCompleted: store.setDashboardTourCompleted,
  };
};

// Authentication state
export const useAuth = () => {
  const store = useOnboardingStore();
  return {
    user_id: store.user_id,
    name: store.name,
    email: store.email,
    image: store.image,
    provider: store.auth_provider,
    isAuthenticated: store.is_authenticated,
    setUserAuthData: store.setUserAuthData,
    setAuthenticated: store.setAuthenticated,
    clearAuthData: store.clearAuthData,
  };
};

// Save & resume progress
export const useSaveProgress = () => {
  const store = useOnboardingStore();
  return {
    generateSaveCode: store.generateSaveCode,
    saveProgress: store.saveProgress,
    loadProgress: store.loadProgress,
    hasSaveCode: store.hasSaveCode,
    getSaveCode: store.getSaveCode,
  };
}; 