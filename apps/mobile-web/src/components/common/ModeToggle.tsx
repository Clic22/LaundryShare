import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useModeStore } from '@/stores/modeStore';
import { useIsHost } from '@/stores/authStore';

export function ModeToggle() {
  const mode = useModeStore((state) => state.mode);
  const setMode = useModeStore((state) => state.setMode);
  const isHost = useIsHost();

  // Don't render if user is not a host
  if (!isHost) return null;

  const toggleMode = () => {
    setMode(mode === 'user' ? 'host' : 'user');
  };

  return (
    <TouchableOpacity onPress={toggleMode} style={styles.container}>
      <View style={[styles.toggle, mode === 'host' && styles.hostMode]}>
        <Ionicons
          name={mode === 'user' ? 'person' : 'business'}
          size={20}
          color={mode === 'host' ? '#34C759' : '#007AFF'}
        />
        <Text style={[styles.label, mode === 'host' && styles.hostLabel]}>
          {mode === 'user' ? 'User' : 'Host'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  hostMode: {
    backgroundColor: '#D4EDDA',
  },
  label: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  hostLabel: {
    color: '#34C759',
  },
});
