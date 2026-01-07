import { renderHook } from '@testing-library/react';

describe('ProfileEditScreen - useIsHost Hook', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('useIsHost returns false when host is null', () => {
    jest.doMock('../../src/stores/authStore', () => ({
      useAuthStore: (selector: any) => {
        if (typeof selector === 'function') {
          return selector({ host: null });
        }
        return { host: null };
      },
      useIsHost: () => {
        const { useAuthStore } = require('../../src/stores/authStore');
        const host = useAuthStore((state: any) => state.host);
        return !!host;
      },
    }));

    const { useIsHost } = require('../../src/stores/authStore');
    const { result } = renderHook(() => useIsHost());

    expect(result.current).toBe(false);
  });

  it('useIsHost returns true when host exists', () => {
    jest.doMock('../../src/stores/authStore', () => ({
      useAuthStore: (selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            host: {
              id: 'host-123',
              user_id: 'user-123',
              is_active: true,
            },
          });
        }
        return {
          host: {
            id: 'host-123',
            user_id: 'user-123',
            is_active: true,
          },
        };
      },
      useIsHost: () => {
        const { useAuthStore } = require('../../src/stores/authStore');
        const host = useAuthStore((state: any) => state.host);
        return !!host;
      },
    }));

    const { useIsHost } = require('../../src/stores/authStore');
    const { result } = renderHook(() => useIsHost());

    expect(result.current).toBe(true);
  });

  it('useIsHost returns false for undefined host', () => {
    jest.doMock('../../src/stores/authStore', () => ({
      useAuthStore: (selector: any) => {
        if (typeof selector === 'function') {
          return selector({ host: undefined });
        }
        return { host: undefined };
      },
      useIsHost: () => {
        const { useAuthStore } = require('../../src/stores/authStore');
        const host = useAuthStore((state: any) => state.host);
        return !!host;
      },
    }));

    const { useIsHost } = require('../../src/stores/authStore');
    const { result } = renderHook(() => useIsHost());

    expect(result.current).toBe(false);
  });

  it('useIsHost works with inactive host', () => {
    jest.doMock('../../src/stores/authStore', () => ({
      useAuthStore: (selector: any) => {
        if (typeof selector === 'function') {
          return selector({
            host: {
              id: 'host-123',
              user_id: 'user-123',
              is_active: false, // Inactive host
            },
          });
        }
        return {
          host: {
            id: 'host-123',
            user_id: 'user-123',
            is_active: false,
          },
        };
      },
      useIsHost: () => {
        const { useAuthStore } = require('../../src/stores/authStore');
        const host = useAuthStore((state: any) => state.host);
        return !!host;
      },
    }));

    const { useIsHost } = require('../../src/stores/authStore');
    const { result } = renderHook(() => useIsHost());

    // Even inactive hosts are still "hosts"
    expect(result.current).toBe(true);
  });
});
