// Shared constants for LaundryShare

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DROPPED_OFF: 'dropped_off',
  WASHING: 'washing',
  DRYING: 'drying',
  READY: 'ready',
  PICKED_UP: 'picked_up',
  CANCELLED: 'cancelled',
} as const;

export const DEFAULT_SEARCH_RADIUS_KM = 5;

export const PLATFORM_COMMISSION_PERCENT = 15;

export const MIN_WITHDRAWAL_AMOUNT_EUR = 10;
