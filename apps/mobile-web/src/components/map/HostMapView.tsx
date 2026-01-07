import { useState, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyHosts, NearbyHost } from '@/hooks/useNearbyHosts';

export function HostMapView() {
  const mapRef = useRef<MapView>(null);
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useLocation();
  const [searchRegion, setSearchRegion] = useState<Region | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  // Use search region coordinates if available, otherwise use current location
  const searchLat = searchRegion?.latitude ?? location?.latitude ?? null;
  const searchLng = searchRegion?.longitude ?? location?.longitude ?? null;

  const { hosts, isLoading: hostsLoading, refetch } = useNearbyHosts({
    latitude: searchLat,
    longitude: searchLng,
    radiusKm: 5,
  });

  const handleRegionChangeComplete = (region: Region) => {
    // Only show search button if user has moved the map significantly
    if (location) {
      const distance = getDistance(
        location.latitude,
        location.longitude,
        region.latitude,
        region.longitude
      );
      setShowSearchButton(distance > 0.5); // Show if moved more than 500m
    }
    setSearchRegion(region);
  };

  const handleSearchThisArea = () => {
    if (searchRegion) {
      refetch(searchRegion.latitude, searchRegion.longitude);
      setShowSearchButton(false);
    }
  };

  const handleRecenterToUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
      setShowSearchButton(false);
      refetch(location.latitude, location.longitude);
    }
  };

  // Calculate distance between two points in km
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Loading state
  if (locationLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  // Permission denied state
  if (locationError) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="location-outline" size={64} color="#999" />
        <Text style={styles.errorTitle}>Location Access Needed</Text>
        <Text style={styles.errorMessage}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No location available
  if (!location) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="location-outline" size={64} color="#999" />
        <Text style={styles.errorTitle}>Location Unavailable</Text>
        <Text style={styles.errorMessage}>Unable to determine your location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onRegionChangeComplete={handleRegionChangeComplete}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {/* Host markers */}
        {hosts.map((host) => (
          <Marker
            key={host.id}
            coordinate={{
              latitude: host.latitude,
              longitude: host.longitude,
            }}
            pinColor="#34C759"
          >
            <Callout>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{host.full_name}</Text>
                <View style={styles.calloutRow}>
                  <Ionicons name="star" size={14} color="#FFD700" />
                  <Text style={styles.calloutRating}>
                    {host.rating_avg.toFixed(1)} ({host.rating_count})
                  </Text>
                </View>
                <Text style={styles.calloutDistance}>{host.distance_km.toFixed(1)} km away</Text>
                {host.description && (
                  <Text style={styles.calloutDescription} numberOfLines={2}>
                    {host.description}
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Search this area button */}
      {showSearchButton && (
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchThisArea}>
          <Ionicons name="search" size={16} color="#007AFF" />
          <Text style={styles.searchButtonText}>Search this area</Text>
        </TouchableOpacity>
      )}

      {/* Recenter button */}
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenterToUser}>
        <Ionicons name="locate" size={24} color="#007AFF" />
      </TouchableOpacity>

      {/* Loading indicator for hosts */}
      {hostsLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingCardText}>Loading hosts...</Text>
          </View>
        </View>
      )}

      {/* Hosts count */}
      {!hostsLoading && hosts.length > 0 && (
        <View style={styles.hostsCount}>
          <Text style={styles.hostsCountText}>
            {hosts.length} host{hosts.length !== 1 ? 's' : ''} nearby
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  errorMessage: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  searchButton: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  searchButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  recenterButton: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    backgroundColor: '#fff',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    alignSelf: 'center',
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingCardText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  hostsCount: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  hostsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 200,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  calloutRating: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  calloutDistance: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
