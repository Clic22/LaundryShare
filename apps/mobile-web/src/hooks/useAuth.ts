import { useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { supabase } from '@/services/supabase';
import { useAuthStore, Profile } from '@/stores/authStore';

// Helper to fetch profile with retry
async function fetchProfileWithRetry(userId: string, maxAttempts = 3): Promise<Profile | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profile) return profile as Profile;
    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  return null;
}

export function useAuth() {
  const { user, isLoading, setUser, setLoading, signOut: clearStore } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // On web, check for OAuth callback tokens in URL hash FIRST
        if (Platform.OS === 'web' && typeof window !== 'undefined') {
          const hash = window.location.hash;
          if (hash && hash.includes('access_token')) {
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken && refreshToken) {
              const { error: sessionError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              if (!sessionError) {
                window.history.replaceState(null, '', window.location.pathname);
              }
            }
          }
        }

        // Now check for existing session (including the one we just set)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          const profile = await fetchProfileWithRetry(session.user.id);

          if (profile) {
            setUser(profile);
          } else {
            // Create minimal profile from user data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
              avatar_url: session.user.user_metadata?.avatar_url || null,
              phone: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Profile);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser(profile as Profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty deps: initialization runs once on mount, auth listener handles subsequent changes

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName }
        }
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;
        setUser(profile as Profile);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }, [setUser]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;
        setUser(profile as Profile);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }, [setUser]);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      clearStore();
    } catch (error) {
      throw error;
    }
  }, [clearStore]);

  return {
    user,
    isLoading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
