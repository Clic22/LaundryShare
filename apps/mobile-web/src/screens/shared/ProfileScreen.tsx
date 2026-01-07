import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore, useIsHost } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { ModeToggle } from '@/components/common/ModeToggle';

interface ProfileScreenProps {
  navigation: {
    navigate: (screen: string) => void;
  };
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const user = useAuthStore((state) => state.user);
  const isHost = useIsHost();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        {/* Mode Toggle */}
        <View style={styles.modeToggleContainer}>
          <ModeToggle />
        </View>

        {/* User Avatar and Info */}
        <View style={styles.profileSection}>
          {user?.avatar_url ? (
            <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={48} color="#9ca3af" />
            </View>
          )}
          <Text style={styles.name}>{user?.full_name || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          {user?.phone && <Text style={styles.phone}>{user.phone}</Text>}
          {isHost && (
            <View style={styles.hostBadge}>
              <Ionicons name="business" size={16} color="#34C759" />
              <Text style={styles.hostBadgeText}>Host</Text>
            </View>
          )}
        </View>
      </View>

      {/* Menu Options */}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => navigation.navigate('ProfileEdit')}
        >
          <Ionicons name="person-outline" size={24} color="#1a1a1a" />
          <Text style={styles.menuItemText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>

        {!isHost && (
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('HostRegistration')}
          >
            <Ionicons name="business-outline" size={24} color="#1a1a1a" />
            <Text style={styles.menuItemText}>Become a Host</Text>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#dc2626" />
          <Text style={[styles.menuItemText, styles.signOutText]}>Sign Out</Text>
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>LaundryShare v1.0</Text>
        <Text style={styles.footerSubtext}>Built with ❤️ for the community</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingBottom: 24,
    marginBottom: 16,
  },
  modeToggleContainer: {
    alignItems: 'flex-end',
    paddingTop: 8,
    paddingRight: 8,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    marginBottom: 16,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 8,
  },
  hostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4EDDA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  hostBadgeText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: '#34C759',
  },
  menu: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 12,
  },
  signOutText: {
    color: '#dc2626',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#d1d5db',
  },
});
