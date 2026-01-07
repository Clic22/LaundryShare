import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Host {
  id: string;
  user_id: string;
  address: string;
  location: any;
  description: string | null;
  machine_type: string;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: Profile | null;
  host: Host | null;
  isLoading: boolean;
  setUser: (user: Profile | null) => void;
  setHost: (host: Host | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      host: null,
      isLoading: true,
      setUser: (user) => set({ user, isLoading: false }),  // Set both user and isLoading
      setHost: (host) => set({ host }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null, host: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, host: state.host }),
    }
  )
);

// Helper hook to check if user is a host
export const useIsHost = () => useAuthStore((state) => !!state.host);
