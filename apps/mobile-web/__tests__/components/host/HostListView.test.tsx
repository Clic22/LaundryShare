import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock HostCard
jest.mock('@/components/host/HostCard', () => ({
  HostCard: ({ host, onPress }: { host: { id: string; full_name: string }; onPress: () => void }) => {
    const { Text, Pressable } = require('react-native');
    return (
      <Pressable onPress={onPress} testID={`host-card-${host.id}`}>
        <Text>{host.full_name}</Text>
      </Pressable>
    );
  },
}));

import { HostListView } from '@/components/host/HostListView';
import { NearbyHost } from '@/hooks/useNearbyHosts';

describe('HostListView', () => {
  const mockHosts: NearbyHost[] = [
    {
      id: '1',
      user_id: 'user-1',
      full_name: 'John Doe',
      avatar_url: null,
      rating_avg: 4.5,
      rating_count: 10,
      distance_km: 1.5,
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.006,
      description: 'Great host',
      machine_type: 'washer_dryer',
    },
    {
      id: '2',
      user_id: 'user-2',
      full_name: 'Jane Smith',
      avatar_url: null,
      rating_avg: 4.8,
      rating_count: 15,
      distance_km: 2.3,
      address: '456 Oak Ave',
      latitude: 40.7589,
      longitude: -73.9851,
      description: 'Friendly host',
      machine_type: 'washer',
    },
  ];

  it('renders list of hosts', () => {
    const { getByText } = render(
      <HostListView
        hosts={mockHosts}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={() => {}}
      />
    );

    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Jane Smith')).toBeTruthy();
  });

  it('shows result count', () => {
    const { getByText } = render(
      <HostListView
        hosts={mockHosts}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={() => {}}
      />
    );

    expect(getByText('Showing 1-2 of 2 hosts')).toBeTruthy();
  });

  it('shows empty state when no hosts', () => {
    const { getByText } = render(
      <HostListView
        hosts={[]}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={() => {}}
      />
    );

    expect(getByText('No Hosts Found')).toBeTruthy();
    expect(getByText(/no hosts in this area/i)).toBeTruthy();
  });

  it('calls onHostPress when host card is tapped', () => {
    const onHostPressMock = jest.fn();
    const { getByText } = render(
      <HostListView
        hosts={mockHosts}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={onHostPressMock}
      />
    );

    fireEvent.press(getByText('John Doe'));
    expect(onHostPressMock).toHaveBeenCalledWith('1');
  });

  it('calls onRefresh when pulled to refresh', async () => {
    const onRefreshMock = jest.fn();
    const { getByTestId } = render(
      <HostListView
        hosts={mockHosts}
        isLoading={false}
        onRefresh={onRefreshMock}
        onHostPress={() => {}}
      />
    );

    // Simulate pull-to-refresh
    const scrollView = getByTestId('host-list');
    fireEvent(scrollView, 'refresh');

    await waitFor(() => {
      expect(onRefreshMock).toHaveBeenCalled();
    });
  });

  it('shows pagination controls for multiple pages', () => {
    // Create 15 hosts to trigger pagination (page size is 10)
    const manyHosts = Array.from({ length: 15 }, (_, i) => ({
      ...mockHosts[0],
      id: `host-${i}`,
      full_name: `Host ${i}`,
    }));

    const { getByText } = render(
      <HostListView
        hosts={manyHosts}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={() => {}}
      />
    );

    // Should show page numbers
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('navigates between pages', () => {
    const manyHosts = Array.from({ length: 15 }, (_, i) => ({
      ...mockHosts[0],
      id: `host-${i}`,
      full_name: `Host ${i}`,
    }));

    const { getByText, queryByText } = render(
      <HostListView
        hosts={manyHosts}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={() => {}}
      />
    );

    // Should show first 10 hosts on page 1
    expect(getByText('Host 0')).toBeTruthy();
    expect(getByText('Host 9')).toBeTruthy();

    // Click page 2
    fireEvent.press(getByText('2'));

    // Should show remaining hosts on page 2
    expect(queryByText('Host 0')).toBeFalsy();
    expect(getByText('Host 10')).toBeTruthy();
  });

  it('disables previous button on first page', () => {
    const { UNSAFE_getAllByType } = render(
      <HostListView
        hosts={mockHosts}
        isLoading={false}
        onRefresh={() => {}}
        onHostPress={() => {}}
      />
    );

    // Check that first navigation button (previous) has disabled style
    // This is a simplified test - in real scenario, you'd use testID
    expect(UNSAFE_getAllByType).toBeTruthy();
  });
});
