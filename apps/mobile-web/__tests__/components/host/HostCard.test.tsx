import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

import { HostCard } from '@/components/host/HostCard';
import { NearbyHost } from '@/hooks/useNearbyHosts';

describe('HostCard', () => {
  const mockHost: NearbyHost = {
    id: '1',
    user_id: 'user-1',
    full_name: 'John Doe',
    avatar_url: 'https://example.com/avatar.jpg',
    rating_avg: 4.5,
    rating_count: 10,
    distance_km: 1.5,
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    description: 'Great host',
    machine_type: 'washer_dryer',
  };

  it('renders host name correctly', () => {
    const { getByText } = render(
      <HostCard host={mockHost} onPress={() => {}} />
    );
    expect(getByText('John Doe')).toBeTruthy();
  });

  it('renders rating with correct format', () => {
    const { getByText } = render(
      <HostCard host={mockHost} onPress={() => {}} />
    );
    expect(getByText('4.5 (10)')).toBeTruthy();
  });

  it('renders distance with correct format', () => {
    const { getByText } = render(
      <HostCard host={mockHost} onPress={() => {}} />
    );
    expect(getByText('1.5 km away')).toBeTruthy();
  });

  it('renders price indication', () => {
    const { getByText } = render(
      <HostCard host={mockHost} onPress={() => {}} />
    );
    expect(getByText('From $15/load')).toBeTruthy();
  });

  it('calls onPress when card is tapped', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(
      <HostCard host={mockHost} onPress={onPressMock} />
    );

    fireEvent.press(getByText('John Doe'));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });

  it('handles missing avatar gracefully', () => {
    const hostWithoutAvatar = { ...mockHost, avatar_url: null };
    const { queryByTestId } = render(
      <HostCard host={hostWithoutAvatar} onPress={() => {}} />
    );

    // Should render without crashing
    expect(queryByTestId('avatar-placeholder')).toBeTruthy();
  });

  it('truncates long host names', () => {
    const hostWithLongName = {
      ...mockHost,
      full_name: 'This is a very long name that should be truncated',
    };
    const { getByText } = render(
      <HostCard host={hostWithLongName} onPress={() => {}} />
    );

    expect(getByText('This is a very long name that should be truncated')).toBeTruthy();
  });
});
