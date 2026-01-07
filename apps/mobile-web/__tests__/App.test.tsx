import React from 'react';
import { render, screen } from '@testing-library/react';
import HomeScreen from '../src/screens/user/HomeScreen';

describe('HomeScreen', () => {
  it('renders search placeholder title', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/Search Hosts/i)).toBeInTheDocument();
  });

  it('renders coming soon message', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/Coming soon in Epic 3/i)).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<HomeScreen />);
    expect(screen.getByText(/Find nearby hosts with available washing machines/i)).toBeInTheDocument();
  });
});
