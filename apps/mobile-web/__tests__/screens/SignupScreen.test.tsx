import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock useAuth hook
const mockSignUp = jest.fn();
jest.mock('../../src/hooks/useAuth', () => ({
  useAuth: () => ({
    signUp: mockSignUp,
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
  validatePassword: (password: string) => {
    if (!password) return 'Password is required';
    if (password.length < 8) return 'Password must be at least 8 characters';
    return null;
  },
  validateConfirmPassword: (password: string, confirmPassword: string) => {
    if (!confirmPassword) return 'Please confirm your password';
    if (password !== confirmPassword) return 'Passwords do not match';
    return null;
  },
}));

import SignupScreen from '../../src/screens/auth/SignupScreen';

const mockNavigation = {
  navigate: jest.fn(),
};

describe('SignupScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSignInWithGoogle.mockResolvedValue(null);
    mockSignInWithApple.mockResolvedValue(null);
  });

  it('renders all form fields', () => {
    render(<SignupScreen navigation={mockNavigation} />);

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByTestId('fullName-input')).toBeInTheDocument();
    expect(screen.getByTestId('email-input')).toBeInTheDocument();
    expect(screen.getByTestId('password-input')).toBeInTheDocument();
    expect(screen.getByTestId('confirmPassword-input')).toBeInTheDocument();
    expect(screen.getByTestId('signup-button')).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', () => {
    render(<SignupScreen navigation={mockNavigation} />);

    fireEvent.click(screen.getByTestId('signup-button'));

    expect(screen.getByText('Full name is required')).toBeInTheDocument();
    expect(screen.getByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
    expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
  });

  it('shows error for invalid email format', () => {
    render(<SignupScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('fullName-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'invalid-email' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('confirmPassword-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('signup-button'));

    expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
  });

  it('shows error for short password', () => {
    render(<SignupScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('fullName-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'short' } });
    fireEvent.change(screen.getByTestId('confirmPassword-input'), { target: { value: 'short' } });
    fireEvent.click(screen.getByTestId('signup-button'));

    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('shows error when passwords do not match', () => {
    render(<SignupScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('fullName-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('confirmPassword-input'), { target: { value: 'different123' } });
    fireEvent.click(screen.getByTestId('signup-button'));

    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('navigates to Login when link is pressed', () => {
    render(<SignupScreen navigation={mockNavigation} />);

    fireEvent.click(screen.getByText('Log In'));

    expect(mockNavigation.navigate).toHaveBeenCalledWith('Login');
  });

  it('calls signUp with correct parameters when form is valid', async () => {
    mockSignUp.mockResolvedValue({ user: { id: '123' } });

    render(<SignupScreen navigation={mockNavigation} />);

    fireEvent.change(screen.getByTestId('fullName-input'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByTestId('email-input'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByTestId('password-input'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByTestId('confirmPassword-input'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('signup-button'));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password123', 'Test User');
    });
  });

  describe('OAuth Sign Up', () => {
    it('renders Google Sign-In button', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      expect(screen.getByTestId('google-signin-button')).toBeInTheDocument();
    });

    it('renders Apple Sign-In button', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      expect(screen.getByTestId('apple-signin-button')).toBeInTheDocument();
    });

    it('calls signInWithGoogle when Google button is pressed', async () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.click(screen.getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(mockSignInWithGoogle).toHaveBeenCalled();
      });
    });

    it('calls signInWithApple when Apple button is pressed', async () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.click(screen.getByTestId('apple-signin-button'));

      await waitFor(() => {
        expect(mockSignInWithApple).toHaveBeenCalled();
      });
    });

    it('clears error before OAuth sign up', async () => {
      render(<SignupScreen navigation={mockNavigation} />);

      fireEvent.click(screen.getByTestId('google-signin-button'));

      await waitFor(() => {
        expect(mockClearError).toHaveBeenCalled();
      });
    });

    it('renders social login separator', () => {
      render(<SignupScreen navigation={mockNavigation} />);

      expect(screen.getByText('or continue with')).toBeInTheDocument();
    });
  });
});
