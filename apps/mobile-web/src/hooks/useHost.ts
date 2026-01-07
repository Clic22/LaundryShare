import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/stores/authStore';

interface HostRegistrationData {
  address: string;
  coordinates: { lat: number; lng: number };
  machineType: string;
  description?: string;
  photoUrls?: string[];
}

interface Host {
  id: string;
  user_id: string;
  address: string;
  location: any; // PostGIS geography type
  description: string | null;
  machine_type: string;
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  stripe_account_id: string | null;
  stripe_onboarding_complete: boolean;
  created_at: string;
  updated_at: string;
}

export function useHost() {
  const { user, setHost } = useAuthStore();

  const registerAsHost = async (data: HostRegistrationData): Promise<Host> => {
    if (!user) throw new Error('Not authenticated');

    // Create PostGIS point from coordinates
    // Note: PostGIS uses (lng, lat) order (GeoJSON format)
    const locationPoint = `POINT(${data.coordinates.lng} ${data.coordinates.lat})`;

    const { data: host, error } = await supabase
      .from('hosts')
      .insert({
        user_id: user.id,
        address: data.address,
        location: locationPoint,
        machine_type: data.machineType,
        description: data.description || null,
        is_active: false, // AC 8: Start inactive
      })
      .select()
      .single();

    if (error) throw error;

    // Update authStore with new host
    setHost(host);
    return host;
  };

  const getHostProfile = async (): Promise<Host | null> => {
    if (!user) return null;

    const { data: host, error } = await supabase
      .from('hosts')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      // If no host found, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return host;
  };

  const updateHostProfile = async (updates: Partial<Host>): Promise<Host> => {
    if (!user) throw new Error('Not authenticated');

    const { data: host, error } = await supabase
      .from('hosts')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    // Update authStore
    setHost(host);
    return host;
  };

  return { registerAsHost, getHostProfile, updateHostProfile };
}
