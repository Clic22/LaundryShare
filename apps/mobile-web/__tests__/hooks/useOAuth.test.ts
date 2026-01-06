import { renderHook, act } from '@testing-library/react';

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openAuthSessionAsync: jest.fn(),
}));

// Mock expo-auth-session
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'laundryshare://auth/callback'),
}));

// Mock supabase
const mockSignInWithOAuth = jest.fn();
const mockSetSession = jest.fn();
const mockGetUser = jest.fn();
const mockSupabaseSelect = jest.fn();

jest.mock('../../src/services/supabase', () => ({
  supabase: {
    auth: {
      signInWithOAuth: (...args: unknown[]) => mockSignInWithOAuth(...args),
      setSession: (...args: unknown[]) => mockSetSession(...args),
      getUser: () => mockGetUser(),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => mockSupabaseSelect(),
        }),
      }),
    }),
  },
}));

// Mock authStore
const mockSetUser = jest.fn();
const mockSetLoading = jest.fn();
jest.mock('../../src/stores/authStore', () => ({
  useAuthStore: () => ({
    setUser: mockSetUser,
    setLoading: mockSetLoading,
  }),
}));

import * as WebBrowser from 'expo-web-browser';
import { useOAuth } from '../../src/hooks/useOAuth';

describe('useOAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signInWithGoogle', () => {
    it('initiates OAuth flow with Google provider', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.google.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      const { result } = renderHook(() => useOAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSignInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: expect.objectContaining({
          redirectTo: 'laundryshare://auth/callback',
          skipBrowserRedirect: true,
        }),
      });
    });

    it('sets error when user cancels OAuth flow', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.google.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      const { result } = renderHook(() => useOAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toEqual({
        code: 'oauth/cancelled',
        message: 'Sign in was cancelled',
      });
    });

    it('handles successful OAuth flow', async () => {
      const mockProfile = { id: 'user-123', full_name: 'Test User', email: 'test@example.com' };

      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.google.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'success',
        url: 'laundryshare://auth/callback?access_token=token123&refresh_token=refresh123',
      });
      mockSetSession.mockResolvedValue({ error: null });
      mockGetUser.mockResolvedValue({ data: { user: { id: 'user-123' } } });
      mockSupabaseSelect.mockResolvedValue({ data: mockProfile, error: null });

      const { result } = renderHook(() => useOAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockSetSession).toHaveBeenCalledWith({
        access_token: 'token123',
        refresh_token: 'refresh123',
      });
      expect(mockSetUser).toHaveBeenCalledWith(mockProfile);
    });
  });

  describe('error handling', () => {
    it('sets network error for network failures', async () => {
      mockSignInWithOAuth.mockRejectedValue(new Error('network error'));

      const { result } = renderHook(() => useOAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).toEqual({
        code: 'oauth/network-error',
        message: 'Network error. Please check your connection.',
      });
    });

    it('handles OAuth provider errors', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: null,
        error: new Error('OAuth provider error'),
      });

      const { result } = renderHook(() => useOAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).not.toBeNull();
    });

    it('clearError resets error state', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.google.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      const { result } = renderHook(() => useOAuth());

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(result.current.error).not.toBeNull();

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('loading state', () => {
    it('sets loading state during OAuth flow', async () => {
      mockSignInWithOAuth.mockResolvedValue({
        data: { url: 'https://oauth.google.com/auth' },
        error: null,
      });
      (WebBrowser.openAuthSessionAsync as jest.Mock).mockResolvedValue({
        type: 'cancel',
      });

      const { result } = renderHook(() => useOAuth());

      expect(result.current.isLoading).toBe(false);

      const promise = act(async () => {
        await result.current.signInWithGoogle();
      });

      await promise;

      expect(result.current.isLoading).toBe(false);
    });
  });
});
