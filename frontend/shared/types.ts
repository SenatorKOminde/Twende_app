// Shared TypeScript types for all frontend applications

export interface User {
  id: number;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: 'RIDER' | 'DRIVER' | 'ADMIN' | 'CORP_ADMIN' | 'DISPATCHER';
  is_active: boolean;
  is_verified: boolean;
  date_joined: string;
}

export interface Profile {
  id: number;
  user: number;
  avatar?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  license_number?: string;
  license_expiry?: string;
  company?: number;
  employee_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Route {
  id: number;
  name: string;
  origin: string;
  destination: string;
  polyline?: string;
  distance_km: number;
  estimated_duration_mins: number;
  base_fare: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RouteStop {
  id: number;
  route: number;
  name: string;
  latitude: number;
  longitude: number;
  sequence_order: number;
}

export interface Vehicle {
  id: number;
  plate_number: string;
  vehicle_type: 'BUS' | 'MINIBUS' | 'VAN';
  capacity: number;
  make: string;
  model: string;
  year: number;
  color: string;
  owner: string;
  owner_contact?: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  active: boolean;
  insurance_expiry?: string;
  inspection_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface Schedule {
  id: number;
  route: Route;
  vehicle?: Vehicle;
  driver?: User;
  departure_time: string;
  estimated_arrival_time: string;
  seats_total: number;
  seats_booked: number;
  seats_available: number;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'ARRIVED' | 'CANCELLED';
  fare_override?: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  rider: User;
  schedule: Schedule;
  seat_number?: number;
  pickup_stop?: RouteStop;
  dropoff_stop?: RouteStop;
  status: 'RESERVED' | 'CHECKED_IN' | 'CANCELLED' | 'NO_SHOW' | 'COMPLETED';
  qr_code: string;
  fare_amount: number;
  payment_method: 'SUBSCRIPTION' | 'CARD' | 'MPESA' | 'CASH';
  created_at: string;
  updated_at: string;
  check_in_time?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  refund_amount: number;
}

export interface SubscriptionPlan {
  id: number;
  code: string;
  name: string;
  plan_type: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  price: number; // in KSh cents
  duration_days: number;
  rides_limit?: number;
  allow_rollover: boolean;
  max_rollover_percentage: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: number;
  user: User;
  plan: SubscriptionPlan;
  start_date: string;
  end_date: string;
  rides_remaining: number;
  rollover_credits: number;
  active: boolean;
  auto_renew: boolean;
  corporate?: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  user: User;
  amount: number;
  currency: string;
  payment_method: 'MPESA' | 'STRIPE' | 'BANK_TRANSFER' | 'CASH';
  payment_type: 'SUBSCRIPTION' | 'BOOKING' | 'REFUND';
  status: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  external_transaction_id?: string;
  external_reference?: string;
  subscription?: Subscription;
  booking?: Booking;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface DriverLocation {
  id: number;
  driver: User;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number;
  accuracy?: number;
  timestamp: string;
}

export interface Notification {
  id: number;
  user: User;
  notification_type: string;
  channel: 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';
  title: string;
  message: string;
  booking?: Booking;
  payment?: Payment;
  subscription?: Subscription;
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED' | 'READ';
  external_message_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  read_at?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Authentication types
export interface LoginRequest {
  email_or_phone: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: 'RIDER' | 'DRIVER';
  password: string;
  password_confirm: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    refresh: string;
    access: string;
  };
}

export interface TokenRefreshResponse {
  access: string;
}

// Booking types
export interface CreateBookingRequest {
  schedule_id: number;
  pickup_stop_id?: number;
  dropoff_stop_id?: number;
  payment_method: 'SUBSCRIPTION' | 'CARD' | 'MPESA' | 'CASH';
}

// WebSocket message types
export interface WebSocketMessage {
  type: string;
  data: any;
}

export interface LocationUpdateMessage {
  type: 'driver_location_update';
  data: {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
    timestamp: string;
  };
}

export interface BookingUpdateMessage {
  type: 'booking_update';
  data: {
    booking_id: number;
    status: string;
    timestamp: string;
  };
}

export interface ScheduleUpdateMessage {
  type: 'schedule_status_update';
  data: {
    schedule_id: number;
    status: string;
    timestamp: string;
  };
}

// Form types
export interface ProfileUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}

// Map types
export interface MapLocation {
  latitude: number;
  longitude: number;
  title?: string;
  description?: string;
}

export interface RoutePolyline {
  coordinates: [number, number][];
  color?: string;
  width?: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, any>;
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Booking: { scheduleId: number };
  QRCode: { bookingId: number };
  Profile: undefined;
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Bookings: undefined;
  Subscriptions: undefined;
  Profile: undefined;
};

export type DriverStackParamList = {
  Schedule: undefined;
  Trip: { scheduleId: number };
  QRScanner: undefined;
  Profile: undefined;
};
