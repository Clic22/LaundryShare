import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLocation } from '@/hooks/useLocation';
import { useNearbyHosts } from '@/hooks/useNearbyHosts';

// Fix default marker icons for Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom green icon for host markers
const hostIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Component to handle map centering and search area detection
function MapController({ center, onMoveEnd }: { center: [number, number]; onMoveEnd: (center: [number, number]) => void }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);

  useEffect(() => {
    const handleMoveEnd = () => {
      const newCenter = map.getCenter();
      onMoveEnd([newCenter.lat, newCenter.lng]);
    };

    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMoveEnd]);

  return null;
}

export function HostMapView() {
  const { location, isLoading: locationLoading, error: locationError, requestPermission } = useLocation();
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [searchCenter, setSearchCenter] = useState<[number, number] | null>(null);
  const [showSearchButton, setShowSearchButton] = useState(false);

  // Use search center if available, otherwise use current location
  const searchLat = searchCenter?.[0] ?? location?.latitude ?? null;
  const searchLng = searchCenter?.[1] ?? location?.longitude ?? null;

  const { hosts, isLoading: hostsLoading, refetch } = useNearbyHosts({
    latitude: searchLat,
    longitude: searchLng,
    radiusKm: 5,
  });

  // Initialize map center when location is available
  useEffect(() => {
    if (location && !mapCenter) {
      setMapCenter([location.latitude, location.longitude]);
    }
  }, [location, mapCenter]);

  // Calculate distance between two points
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

  const handleMapMoveEnd = (newCenter: [number, number]) => {
    if (location) {
      const distance = getDistance(location.latitude, location.longitude, newCenter[0], newCenter[1]);
      setShowSearchButton(distance > 0.5); // Show if moved more than 500m
      setSearchCenter(newCenter);
    }
  };

  const handleSearchThisArea = () => {
    if (searchCenter) {
      refetch(searchCenter[0], searchCenter[1]);
      setShowSearchButton(false);
    }
  };

  const handleRecenterToUser = () => {
    if (location) {
      setMapCenter([location.latitude, location.longitude]);
      setSearchCenter(null);
      setShowSearchButton(false);
      refetch(location.latitude, location.longitude);
    }
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
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Access Needed</Text>
        <Text style={styles.errorMessage}>{locationError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // No location available
  if (!location || !mapCenter) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorTitle}>Location Unavailable</Text>
        <Text style={styles.errorMessage}>Unable to determine your location</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapContainer
        center={mapCenter}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController center={mapCenter} onMoveEnd={handleMapMoveEnd} />

        {/* User location marker */}
        <Marker position={mapCenter}>
          <Popup>Your location</Popup>
        </Marker>

        {/* Host markers */}
        {hosts.map((host) => (
          <Marker
            key={host.id}
            position={[host.latitude, host.longitude]}
            icon={hostIcon}
          >
            <Popup>
              <div style={{ minWidth: 200 }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: 16, fontWeight: 600 }}>
                  {host.full_name}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ color: '#FFD700', marginRight: 4 }}>★</span>
                  <span style={{ fontSize: 14, color: '#666' }}>
                    {host.rating_avg.toFixed(1)} ({host.rating_count})
                  </span>
                </div>
                <p style={{ margin: '4px 0', fontSize: 14, color: '#666' }}>
                  {host.distance_km.toFixed(1)} km away
                </p>
                {host.description && (
                  <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#999' }}>
                    {host.description}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Search this area button */}
      {showSearchButton && (
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchThisArea}>
          <Text style={styles.searchButtonText}>🔍 Search this area</Text>
        </TouchableOpacity>
      )}

      {/* Recenter button */}
      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenterToUser}>
        <Text style={styles.recenterIcon}>📍</Text>
      </TouchableOpacity>

      {/* Loading indicator */}
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
    position: 'relative',
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
  errorIcon: {
    fontSize: 64,
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
    left: '50%',
    transform: [{ translateX: -75 }],
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  searchButtonText: {
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
    zIndex: 1000,
  },
  recenterIcon: {
    fontSize: 24,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 16,
    left: '50%',
    transform: [{ translateX: -75 }],
    zIndex: 1000,
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
    zIndex: 1000,
  },
  hostsCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
