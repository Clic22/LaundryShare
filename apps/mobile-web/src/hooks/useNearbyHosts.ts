import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase';

export interface NearbyHost {
  id: string;
  user_id: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  description: string | null;
  machine_type: string;
  rating_avg: number;
  rating_count: number;
  full_name: string;
  avatar_url: string | null;
}

interface UseNearbyHostsParams {
  latitude: number | null;
  longitude: number | null;
  radiusKm?: number;
}

export function useNearbyHosts({ latitude, longitude, radiusKm = 5 }: UseNearbyHostsParams) {
  const [hosts, setHosts] = useState<NearbyHost[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHosts = async (lat: number, lng: number, radius: number = radiusKm) => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_nearby_hosts', {
        user_lat: lat,
        user_lng: lng,
        radius_km: radius,
      });

      if (rpcError) {
        throw rpcError;
      }

      setHosts(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch nearby hosts');
      console.error('Error fetching nearby hosts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      fetchHosts(latitude, longitude, radiusKm);
    }
  }, [latitude, longitude, radiusKm]);

  const refetch = async (lat?: number, lng?: number) => {
    const searchLat = lat ?? latitude;
    const searchLng = lng ?? longitude;

    if (searchLat !== null && searchLng !== null) {
      await fetchHosts(searchLat, searchLng, radiusKm);
    }
  };

  return {
    hosts,
    isLoading,
    error,
    refetch,
  };
}
