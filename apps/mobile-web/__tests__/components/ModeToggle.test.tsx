import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModeToggle } from '../../src/components/common/ModeToggle';
import { useIsHost } from '../../src/stores/authStore';
import { useModeStore } from '../../src/stores/modeStore';

// Mock Ionicons
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

// Mock the stores
jest.mock('../../src/stores/authStore', () => ({
  useIsHost: jest.fn(),
}));

jest.mock('../../src/stores/modeStore', () => ({
  useModeStore: jest.fn(),
}));

describe('ModeToggle', () => {
  const mockSetMode = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock implementation
    (useModeStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        mode: 'user' as const,
        setMode: mockSetMode,
      };
      return selector ? selector(state) : state;
    });
  });

  it('renders for hosts in user mode', () => {
    (useIsHost as jest.Mock).mockReturnValue(true);
    (useModeStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        mode: 'user' as const,
        setMode: mockSetMode,
      };
      return selector(state);
    });

    render(<ModeToggle />);
    expect(screen.getByText('User')).toBeInTheDocument();
  });

  it('renders for hosts in host mode', () => {
    (useIsHost as jest.Mock).mockReturnValue(true);
    (useModeStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        mode: 'host' as const,
        setMode: mockSetMode,
      };
      return selector(state);
    });

    render(<ModeToggle />);
    expect(screen.getByText('Host')).toBeInTheDocument();
  });

  it('does not render for non-hosts', () => {
    (useIsHost as jest.Mock).mockReturnValue(false);

    const { container } = render(<ModeToggle />);
    expect(container.firstChild).toBeNull();
  });

  it('switches mode when clicked', () => {
    (useIsHost as jest.Mock).mockReturnValue(true);

    // Start in user mode
    let currentMode: 'user' | 'host' = 'user';
    (useModeStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        mode: currentMode,
        setMode: (newMode: 'user' | 'host') => {
          currentMode = newMode;
          mockSetMode(newMode);
        },
      };
      return selector(state);
    });

    const { rerender } = render(<ModeToggle />);

    const toggle = screen.getByText('User').closest('div');
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle!);
    expect(mockSetMode).toHaveBeenCalledWith('host');
  });

  it('switches from host mode to user mode when clicked', () => {
    (useIsHost as jest.Mock).mockReturnValue(true);

    // Start in host mode
    let currentMode: 'user' | 'host' = 'host';
    (useModeStore as jest.Mock).mockImplementation((selector) => {
      const state = {
        mode: currentMode,
        setMode: (newMode: 'user' | 'host') => {
          currentMode = newMode;
          mockSetMode(newMode);
        },
      };
      return selector(state);
    });

    const { rerender } = render(<ModeToggle />);

    const toggle = screen.getByText('Host').closest('div');
    expect(toggle).toBeInTheDocument();

    fireEvent.click(toggle!);
    expect(mockSetMode).toHaveBeenCalledWith('user');
  });
});
