import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeScreen from '../src/screens/HomeScreen';

// Mock navigation prop
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setOptions: jest.fn(),
  isFocused: jest.fn(),
  canGoBack: jest.fn(),
} as unknown as Parameters<typeof HomeScreen>[0]['navigation'];

describe('HomeScreen', () => {
  it('renders welcome message', () => {
    render(<HomeScreen navigation={mockNavigation} />);
    expect(screen.getByText(/Welcome to LaundryShare/i)).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<HomeScreen navigation={mockNavigation} />);
    expect(screen.getByText(/Find nearby hosts for your laundry/i)).toBeInTheDocument();
  });
});
