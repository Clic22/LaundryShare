import { useCallback, useState } from 'react';
import { supabase } from '@/services/supabase';
import { useAuthStore, Profile } from '@/stores/authStore';

interface ProfileUpdateData {
  full_name?: string;
  phone?: string | null;
  avatar_url?: string | null;
}

interface UseProfileResult {
  updateProfile: (data: ProfileUpdateData) => Promise<Profile>;
  isUpdating: boolean;
  error: string | null;
  clearError: () => void;
  isProfileComplete: boolean;
}

export function useProfile(): UseProfileResult {
  const { user, setUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const updateProfile = useCallback(async (data: ProfileUpdateData): Promise<Profile> => {
    if (!user) {
      throw new Error('Not authenticated');
    }

    setIsUpdating(true);
    setError(null);

    try {
      // Determine if profile should be marked as complete
      // Profile is complete if full_name is provided and not empty
      const newFullName = data.full_name ?? user.full_name;
      const isComplete = newFullName && newFullName.trim() !== '';

      const { data: updated, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...data,
          is_profile_complete: isComplete,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      if (!updated) {
        throw new Error('Failed to update profile');
      }

      // Update local state
      setUser(updated as Profile);
      return updated as Profile;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
      throw new Error(message);
    } finally {
      setIsUpdating(false);
    }
  }, [user, setUser]);

  const isProfileComplete = user?.is_profile_complete ?? false;

  return {
    updateProfile,
    isUpdating,
    error,
    clearError,
    isProfileComplete,
  };
}
