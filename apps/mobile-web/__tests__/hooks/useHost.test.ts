import { renderHook, waitFor } from '@testing-library/react';
import { useHost } from '../../src/hooks/useHost';

// Mock Supabase
const mockInsert = jest.fn();
const mockSelect = jest.fn();
const mockSingle = jest.fn();

jest.mock('../../src/services/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
    })),
  },
}));

// Mock authStore
const mockSetHost = jest.fn();
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  full_name: 'Test User',
};

jest.mock('../../src/stores/authStore', () => ({
  useAuthStore: (selector: any) => {
    if (typeof selector === 'function') {
      return selector({ user: mockUser, setHost: mockSetHost });
    }
    return { user: mockUser, setHost: mockSetHost };
  },
}));

describe('useHost', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock chain
    mockSingle.mockResolvedValue({
      data: {
        id: 'host-123',
        user_id: 'user-123',
        address: '123 Test St, Paris',
        location: 'POINT(2.3522 48.8566)',
        machine_type: 'front_load_washer',
        description: 'Test description',
        is_active: false,
        rating_avg: 0,
        rating_count: 0,
        stripe_account_id: null,
        stripe_onboarding_complete: false,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      },
      error: null,
    });
    mockSelect.mockReturnValue({ single: mockSingle });
    mockInsert.mockReturnValue({ select: mockSelect });
  });

  it('returns registerAsHost function', () => {
    const { result } = renderHook(() => useHost());

    expect(result.current.registerAsHost).toBeDefined();
    expect(typeof result.current.registerAsHost).toBe('function');
  });

  it('successfully registers a host with minimal data', async () => {
    const { result } = renderHook(() => useHost());

    const hostData = {
      address: '123 Test St, Paris, France',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    await waitFor(async () => {
      const host = await result.current.registerAsHost(hostData);
      expect(host).toBeDefined();
    });

    // Should format location as PostGIS POINT (lng, lat)
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      address: '123 Test St, Paris, France',
      location: 'POINT(2.3522 48.8566)', // lng first, then lat
      machine_type: 'front_load_washer',
      description: null,
      is_active: false,
    });

    // Should update authStore with host data
    expect(mockSetHost).toHaveBeenCalled();
  });

  it('successfully registers a host with full data', async () => {
    const { result } = renderHook(() => useHost());

    const hostData = {
      address: '123 Test St, Paris, France',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'washer_dryer_combo',
      description: 'Modern washing machine with eco mode',
      photos: [
        'http://example.com/photo1.jpg',
        'http://example.com/photo2.jpg',
      ],
    };

    await waitFor(async () => {
      const host = await result.current.registerAsHost(hostData);
      expect(host).toBeDefined();
    });

    // Should include description
    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      address: '123 Test St, Paris, France',
      location: 'POINT(2.3522 48.8566)',
      machine_type: 'washer_dryer_combo',
      description: 'Modern washing machine with eco mode',
      is_active: false,
    });
  });

  it('sets is_active to false by default', async () => {
    const { result } = renderHook(() => useHost());

    const hostData = {
      address: '123 Test St, Paris',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    await waitFor(async () => {
      await result.current.registerAsHost(hostData);
    });

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        is_active: false,
      })
    );
  });

  it('correctly formats PostGIS location (lng, lat)', async () => {
    const { result } = renderHook(() => useHost());

    const hostData = {
      address: 'Test Address',
      coordinates: { lat: 45.5, lng: -73.5 }, // Montreal coordinates
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    await waitFor(async () => {
      await result.current.registerAsHost(hostData);
    });

    // PostGIS uses GeoJSON format: POINT(lng lat)
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        location: 'POINT(-73.5 45.5)', // lng first, then lat
      })
    );
  });

  it('throws error when user is not authenticated', async () => {
    // Override mock to return null user
    jest.spyOn(require('../../src/stores/authStore'), 'useAuthStore').mockImplementation(
      (selector: any) => {
        if (typeof selector === 'function') {
          return selector({ user: null, setHost: mockSetHost });
        }
        return { user: null, setHost: mockSetHost };
      }
    );

    const { result } = renderHook(() => useHost());

    const hostData = {
      address: 'Test Address',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    await expect(result.current.registerAsHost(hostData)).rejects.toThrow(
      'User must be logged in to register as host'
    );

    // Should not call Supabase
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('handles Supabase insert error', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Database constraint violation' },
    });

    const { result } = renderHook(() => useHost());

    const hostData = {
      address: 'Test Address',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    await expect(result.current.registerAsHost(hostData)).rejects.toThrow(
      'Database constraint violation'
    );

    // Should not update authStore
    expect(mockSetHost).not.toHaveBeenCalled();
  });

  it('shows isRegistering as true during registration', async () => {
    // Mock delayed response
    mockSingle.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({
        data: {
          id: 'host-123',
          user_id: 'user-123',
          is_active: false,
        },
        error: null,
      }), 100))
    );

    const { result } = renderHook(() => useHost());

    const hostData = {
      address: 'Test Address',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    const registerPromise = result.current.registerAsHost(hostData);

    // Should show loading state
    expect(result.current.isRegistering).toBe(true);

    await registerPromise;

    // Should clear loading state
    await waitFor(() => {
      expect(result.current.isRegistering).toBe(false);
    });
  });

  it('sets error state when registration fails', async () => {
    mockSingle.mockResolvedValue({
      data: null,
      error: { message: 'Host registration failed' },
    });

    const { result } = renderHook(() => useHost());

    const hostData = {
      address: 'Test Address',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    try {
      await result.current.registerAsHost(hostData);
    } catch (error) {
      // Expected to throw
    }

    await waitFor(() => {
      expect(result.current.error).toBe('Host registration failed');
    });
  });

  it('clears error state before new registration attempt', async () => {
    // First attempt fails
    mockSingle.mockResolvedValueOnce({
      data: null,
      error: { message: 'First error' },
    });

    const { result } = renderHook(() => useHost());

    const hostData = {
      address: 'Test Address',
      coordinates: { lat: 48.8566, lng: 2.3522 },
      machineType: 'front_load_washer',
      description: '',
      photos: [],
    };

    try {
      await result.current.registerAsHost(hostData);
    } catch (error) {
      // Expected
    }

    await waitFor(() => {
      expect(result.current.error).toBe('First error');
    });

    // Second attempt succeeds
    mockSingle.mockResolvedValueOnce({
      data: { id: 'host-123', user_id: 'user-123', is_active: false },
      error: null,
    });

    await result.current.registerAsHost(hostData);

    // Error should be cleared
    await waitFor(() => {
      expect(result.current.error).toBeNull();
    });
  });
});
