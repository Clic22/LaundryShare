import { Platform, View, Text, StyleSheet } from 'react-native';
import { HostMapView } from '@/components/map/HostMapView';

export default function HomeScreen() {
  // react-native-maps is not compatible with web, show placeholder
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webTitle}>🗺️ Host Map View</Text>
        <Text style={styles.webSubtitle}>Available on iOS and Android</Text>
        <Text style={styles.webDescription}>
          The interactive map with nearby hosts is available on the mobile app.
          Download the app to find and book hosts near you!
        </Text>
      </View>
    );
  }

  return <HostMapView />;
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 40,
  },
  webTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  webSubtitle: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 24,
    fontWeight: '600',
  },
  webDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 600,
  },
});
