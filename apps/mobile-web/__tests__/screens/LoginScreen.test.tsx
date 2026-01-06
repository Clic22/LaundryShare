import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock useAuth hook
const mockSignIn = jest.fn();
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    user: null,
    isLoading: false,
  }),
}));

// Mock useOAuth hook
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();
const mockClearError = jest.fn();
jest.mock('../../src/hooks/useOAuth', () => ({
  useOAuth: () => ({
    signInWithGoogle: mockSignInWithGoogle,
    signInWithApple: mockSignInWithApple,
    isLoading: false,
    error: null,
    clearError: mockClearError,
  }),
}));

// Mock auth components
jest.mock('../../src/components/auth', () => ({
  GoogleSignInButton: ({ onPress, isLoading, disabled }: { onPress: () => void; isLoading: boolean; disabled: boolean }) => (
    <button onClick={onPress} disabled={disabled || isLoading} data-testid="google-signin-button">
      Continue with Google
    </button>
  ),
  AppleSignInButton: ({ onPress, isLoading, disabled }: { onPress: () => void; isLoading: boolean; disabled: boolean }) => (
    <button onClick={onPress} disabled={disabled || isLoading} data-testid="apple-signin-button">
      Continue with Apple
    </button>
  ),
}));

// Mock validators
jest.mock('../../src/utils/validators', () => ({
  validateEmail: (email: string) => {
    if (!email) return 'Email is required';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
  },
}));

import LoginScreen from '../../src/screens/auth/LoginScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithGoogle.mockResolvedValue(null);
    mockSignInWithApple.mockResolvedValue(null);
  });

  it('renders all form fields', () => {
    render(<LoginScreen navigation={mockNavigation} />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('login-button')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', () => {
    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.click(screen.getByTestId('login-button'));

    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows error for invalid email format', () => {
    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-button'));

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('navigates to Signup when link is pressed', () => {
    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.click(screen.getByText('Sign Up'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Signup');
  });

  it('calls signIn with correct parameters when form is valid', async () => {
    mockSignIn.mockResolvedValue({ user: { id: '123' } });

    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('displays error message when login fails', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid login credentials'));

    render(<LoginScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'wrongpassword' } });
    fireEvent.click(screen.getByTestId('login-button'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });

  describe('OAuth Sign In', () => {
    it('renders Google Sign-In button', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
    });

    it('renders Apple Sign-In button', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      expect(screen.getByTestId('apple-signin-button')).toBeInTheDocument();
    });

    it('calls signInWithGoogle when Google button is pressed', async () => {
      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.click(screen.getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });

    it('calls signInWithApple when Apple button is pressed', async () => {
      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.click(screen.getByTestId('apple-signin-button'));

      await waitFor(() => {
        expect(mockSignInWithApple).toHaveBeenCalled();
      });
    });

    it('clears error before OAuth sign in', async () => {
      render(<LoginScreen navigation={mockNavigation} />);

      fireEvent.click(screen.getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('renders social login separator', () => {
      render(<LoginScreen navigation={mockNavigation} />);

      expect(screen.getByText('or continue with')).toBeInTheDocument();
    });
  });
});
