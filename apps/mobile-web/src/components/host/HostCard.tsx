import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NearbyHost } from '@/hooks/useNearbyHosts';

interface HostCardProps {
  host: NearbyHost;
  onPress: () => void;
}

export function HostCard({ host, onPress }: HostCardProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {host.avatar_url ? (
            <Image
              source={{ uri: host.avatar_url }}
              style={styles.avatar}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={28} color="#999" />
            </View>
          )}
        </View>

        {/* Host Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {host.full_name}
          </Text>

          {/* Rating */}
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={14} color="#FFD700" />
            <Text style={styles.rating}>
              {host.rating_avg.toFixed(1)} ({host.rating_count})
            </Text>
          </View>

          {/* Distance */}
          <View style={styles.distanceRow}>
            <Ionicons name="location" size={14} color="#666" />
            <Text style={styles.distance}>
              {host.distance_km.toFixed(1)} km away
            </Text>
          </View>

          {/* Price Indication */}
          <Text style={styles.price}>From $15/load</Text>
        </View>

        {/* Chevron */}
        <Ionicons name="chevron-forward" size={20} color="#999" style={styles.chevron} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.7,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rating: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distance: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  price: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  chevron: {
    marginLeft: 8,
  },
});
