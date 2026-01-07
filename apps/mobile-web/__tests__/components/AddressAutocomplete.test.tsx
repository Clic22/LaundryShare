import React from 'react';
import { render, screen } from '@testing-library/react';

// Simple mock without state
jest.mock('react-native-google-places-autocomplete', () => {
  return {
    GooglePlacesAutocomplete: jest.fn(({ placeholder }) => (
      <div data-testid="google-places-autocomplete">
        <input
          data-testid="address-input"
          placeholder={placeholder}
        />
      </div>
    )),
  };
});

// Set API key before importing component
process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY = 'test-api-key';

import { AddressAutocomplete } from '../../src/components/host/AddressAutocomplete';

describe('AddressAutocomplete', () => {
  it('renders GooglePlacesAutocomplete when API key is present', () => {
    const mockOnSelect = jest.fn();
    render(<AddressAutocomplete onSelect={mockOnSelect} />);

    expect(screen.getByTestId('google-places-autocomplete')).toBeInTheDocument();
  });

  it('renders address input field', () => {
    const mockOnSelect = jest.fn();
    render(<AddressAutocomplete onSelect={mockOnSelect} />);

    const input = screen.getByTestId('address-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter your address');
  });

  it('shows helper text', () => {
    const mockOnSelect = jest.fn();
    render(<AddressAutocomplete onSelect={mockOnSelect} />);

    expect(
      screen.getByText('This will be visible to users looking for nearby hosts')
    ).toBeInTheDocument();
  });
});

describe('AddressAutocomplete - Without API Key', () => {
  it('shows error message when API key is missing', () => {
    // Clear mock and env
    jest.resetModules();
    delete process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;

    const { AddressAutocomplete } = require('../../src/components/host/AddressAutocomplete');
    const mockOnSelect = jest.fn();
    render(<AddressAutocomplete onSelect={mockOnSelect} />);

    expect(screen.getByText('Google Places API key is not configured.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Please add EXPO_PUBLIC_GOOGLE_PLACES_API_KEY to your .env.local file.'
      )
    ).toBeInTheDocument();
  });
});
