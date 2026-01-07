import { useModeStore } from '../../src/stores/modeStore';

describe('modeStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useModeStore.setState({ mode: 'user' });
  });

  it('defaults to user mode', () => {
    const mode = useModeStore.getState().mode;
    expect(mode).toBe('user');
  });

  it('can switch to host mode', () => {
    const { setMode } = useModeStore.getState();
    setMode('host');
    expect(useModeStore.getState().mode).toBe('host');
  });

  it('can switch back to user mode', () => {
    const { setMode } = useModeStore.getState();
    setMode('host');
    expect(useModeStore.getState().mode).toBe('host');

    setMode('user');
    expect(useModeStore.getState().mode).toBe('user');
  });

  it('persists mode changes', () => {
    const { setMode } = useModeStore.getState();
    setMode('host');

    // Mode should remain after getting state again
    const mode = useModeStore.getState().mode;
    expect(mode).toBe('host');
  });
});
