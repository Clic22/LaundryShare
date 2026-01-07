import { useEffect } from 'react';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useModeStore } from '@/stores/modeStore';
import { useIsHost } from '@/stores/authStore';
import { UserTabNavigator } from './UserTabNavigator';
import { HostTabNavigator } from './HostTabNavigator';

export function MainNavigator() {
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);
  const isHost = useIsHost();

  // Force user mode if not a host
  useEffect(() => {
    if (!isHost && mode === 'host') {
      setMode('user');
    }
  }, [isHost, mode, setMode]);

  const effectiveMode = isHost ? mode : 'user';

  return (
    <Animated.View
      key={effectiveMode}
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(200)}
      style={{ flex: 1 }}
    >
      {effectiveMode === 'host' ? <HostTabNavigator /> : <UserTabNavigator />}
    </Animated.View>
  );
}
