import { useCallback, useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { supabase } from '@/services/supabase';
import { useAuthStore, Profile } from '@/stores/authStore';

// Required for web browser to complete auth session
WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = 'google' | 'apple';

export interface OAuthError {
  code: string;
  message: string;
}

// Get the appropriate redirect URI based on platform
function getRedirectUri(): string {
  if (Platform.OS === 'web') {
    return window.location.origin;
  }
  return makeRedirectUri({
    scheme: 'laundryshare',
    path: 'auth/callback',
    preferLocalhost: false,
  });
}

export function useOAuth() {
  const { setUser, setLoading } = useAuthStore();
  const [error, setError] = useState<OAuthError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Handle OAuth callback on web (check URL for tokens on mount)
  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleWebCallback = async () => {
        const hash = window.location.hash;
        const fullUrl = window.location.href;

        console.log('[OAuth] Checking callback - URL:', fullUrl);
        console.log('[OAuth] Hash:', hash);

        if (hash && hash.includes('access_token')) {
          console.log('[OAuth] Found access_token in hash, processing...');
          setIsLoading(true);
          setLoading(true);
          try {
            const hashParams = new URLSearchParams(hash.substring(1));
            const accessToken = hashParams.get('access_token');
            const refreshToken = hashParams.get('refresh_token');

            if (accessToken && refreshToken) {
              // Clear the hash from URL immediately
              window.history.replaceState(null, '', window.location.pathname);

              // Decode JWT to get user info (don't wait for setSession which can hang)
              const payload = JSON.parse(atob(accessToken.split('.')[1]));
              const userId = payload.sub;
              const email = payload.email || '';
              const userMetadata = payload.user_metadata || {};

              // Fire setSession without waiting (it will persist the session)
              supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

              // Set user immediately from JWT data
              const profile = {
                id: userId,
                email: email,
                full_name: userMetadata.full_name || userMetadata.name || email.split('@')[0] || '',
                avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
                phone: null,
                is_profile_complete: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              } as Profile;
              console.log('[OAuth] Setting user profile:', profile);
              setUser(profile);
            } else {
              console.log('[OAuth] No tokens found in hash');
            }
          } catch (err) {
            console.error('Web OAuth callback error:', err);
            setError({
              code: 'oauth/callback-error',
              message: err instanceof Error ? err.message : 'Failed to complete sign in',
            });
          } finally {
            setIsLoading(false);
            setLoading(false);
          }
        }
      };

      handleWebCallback();
    }
  }, [setUser, setLoading]);

  const signInWithProvider = useCallback(async (provider: OAuthProvider) => {
    setError(null);
    setIsLoading(true);
    setLoading(true);

    try {
      const redirectTo = getRedirectUri();

      // On web, let Supabase handle the redirect directly
      if (Platform.OS === 'web') {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
          provider,
          options: {
            redirectTo,
          },
        });

        if (oauthError) {
          throw oauthError;
        }
        return null;
      }

      // On native, use the browser session approach
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo,
          skipBrowserRedirect: true,
        },
      });

      if (oauthError) {
        throw oauthError;
      }

      if (!data.url) {
        throw new Error('No OAuth URL returned');
      }

      // Open browser for OAuth flow
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo
      );

      if (result.type === 'cancel' || result.type === 'dismiss') {
        setError({
          code: 'oauth/cancelled',
          message: 'Sign in was cancelled',
        });
        return null;
      }

      if (result.type === 'success') {
        const url = new URL(result.url);

        // Check for error in callback URL
        const errorParam = url.searchParams.get('error');
        if (errorParam) {
          const errorDescription = url.searchParams.get('error_description') || 'OAuth authentication failed';
          throw new Error(errorDescription);
        }

        // Extract tokens from URL (could be in hash or query params)
        let accessToken = url.searchParams.get('access_token');
        let refreshToken = url.searchParams.get('refresh_token');

        // Check hash fragment for tokens (Supabase uses hash fragments)
        if (!accessToken && url.hash) {
          const hashParams = new URLSearchParams(url.hash.substring(1));
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
        }

        if (accessToken && refreshToken) {
          // Decode the JWT to get user info
          const payload = JSON.parse(atob(accessToken.split('.')[1]));

          // Fire setSession without waiting (it will persist the session)
          supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          // Create a minimal profile from JWT data
          const userId = payload.sub;
          const email = payload.email || '';
          const userMetadata = payload.user_metadata || {};

          setUser({
            id: userId,
            email: email,
            full_name: userMetadata.full_name || userMetadata.name || email.split('@')[0] || '',
            avatar_url: userMetadata.avatar_url || userMetadata.picture || null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile);

          return { success: true };
        } else {
          throw new Error('No authentication tokens received');
        }
      }

      return null;
    } catch (err) {
      console.error(`OAuth ${provider} error:`, err);

      let errorMessage = 'An unexpected error occurred';
      let errorCode = 'oauth/unknown';

      if (err instanceof Error) {
        errorMessage = err.message;

        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorCode = 'oauth/network-error';
          errorMessage = 'Network error. Please check your connection.';
        } else if (err.message.includes('cancel')) {
          errorCode = 'oauth/cancelled';
          errorMessage = 'Sign in was cancelled';
        } else if (err.message.includes('invalid') || err.message.includes('expired')) {
          errorCode = 'oauth/invalid-token';
          errorMessage = 'Authentication failed. Please try again.';
        }
      }

      setError({ code: errorCode, message: errorMessage });
      return null;
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const signInWithGoogle = useCallback(async () => {
    return signInWithProvider('google');
  }, [signInWithProvider]);

  return {
    signInWithGoogle,
    isLoading,
    error,
    clearError,
  };
}
