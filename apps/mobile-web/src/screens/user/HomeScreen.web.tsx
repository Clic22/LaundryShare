import { useState } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HostMapView } from '@/components/map/HostMapView';
import { HostListView } from '@/components/host/HostListView';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyHosts } from '@/hooks/useNearbyHosts';

// Web-specific version with Leaflet maps
// For native, see HomeScreen.tsx

type ViewMode = 'map' | 'list';

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const navigation = useNavigation();

  const { location } = useLocation();
  const { hosts, isLoading, refetch } = useNearbyHosts({
    latitude: location?.latitude ?? null,
    longitude: location?.longitude ?? null,
    radiusKm: 5,
  });

  const handleHostPress = (hostId: string) => {
    // TODO: Navigate to host profile when screen is implemented
    console.log('Navigate to host profile:', hostId);
    // navigation.navigate('HostProfile', { hostId });
  };

  const handleRefresh = () => {
    if (location) {
      refetch(location.latitude, location.longitude);
    }
  };

  return (
    <View style={styles.container}>
      {/* Toggle Buttons */}
      <View style={styles.toggleContainer}>
        <Pressable
          onPress={() => setViewMode('map')}
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            Map
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setViewMode('list')}
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            List
          </Text>
        </Pressable>
      </View>

      {/* Content */}
      {viewMode === 'map' ? (
        <HostMapView />
      ) : (
        <HostListView
          hosts={hosts}
          isLoading={isLoading}
          onRefresh={handleRefresh}
          onHostPress={handleHostPress}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  toggleTextActive: {
    color: '#fff',
  },
});
