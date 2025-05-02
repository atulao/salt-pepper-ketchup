"use client";

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useOnboardingStore, UserProfile } from '../store/onboardingStore';

interface UseProfileSyncResult {
  isLoading: boolean;
  error: string | null;
  syncProfile: () => Promise<void>;
}

/**
 * Hook to sync the profile state between client and server
 */
export const useProfileSync = (): UseProfileSyncResult => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get store state and actions
  const { 
    getUserProfile, 
    setBagelData, 
    setSubstanceEvents,
    setSubstanceClubs,
    setSubstanceGoals,
    setOnboardingCompleted,
    setDashboardTourCompleted,
    setUserId
  } = useOnboardingStore();
  
  // Fetch profile from server on initial load if authenticated
  useEffect(() => {
    const fetchProfile = async () => {
      if (status === 'authenticated' && session?.user?.id) {
        setIsLoading(true);
        setError(null);
        
        try {
          const response = await fetch('/api/profile/sync');
          const data = await response.json();
          
          if (response.ok && data.profile) {
            // Update the store with profile data from the server
            setUserId(session.user.id);
            
            if (data.profile.bagel_type && data.profile.major_name && data.profile.college_name) {
              setBagelData({
                bagel_type: data.profile.bagel_type,
                major_name: data.profile.major_name,
                college_name: data.profile.college_name,
              });
            }
            
            if (data.profile.substance_events) {
              setSubstanceEvents(data.profile.substance_events);
            }
            
            if (data.profile.substance_clubs) {
              setSubstanceClubs(data.profile.substance_clubs);
            }
            
            if (data.profile.substance_goals) {
              setSubstanceGoals(data.profile.substance_goals);
            }
            
            setOnboardingCompleted(data.profile.onboarding_completed);
            setDashboardTourCompleted(data.profile.dashboard_tour_completed);
          }
        } catch (err) {
          console.error('Failed to fetch profile:', err);
          setError('Failed to load profile data');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchProfile();
  }, [status, session]);
  
  // Function to manually sync profile to server
  const syncProfile = async () => {
    if (status !== 'authenticated' || !session?.user?.id) {
      setError('You must be logged in to sync your profile');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const profile = getUserProfile();
      
      const response = await fetch('/api/profile/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profile),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sync profile');
      }
    } catch (err) {
      console.error('Failed to sync profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to sync profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    isLoading,
    error,
    syncProfile,
  };
}; 