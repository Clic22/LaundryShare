// Shared type definitions for LaundryShare
// These types will be populated as the project grows

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface Host {
  id: string;
  user_id: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  is_active: boolean;
  rating_avg: number;
  rating_count: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  host_id: string;
  status: BookingStatus;
  total_amount: number;
  scheduled_time: string;
  created_at: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'dropped_off'
  | 'washing'
  | 'drying'
  | 'ready'
  | 'picked_up'
  | 'cancelled';
