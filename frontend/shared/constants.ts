// Shared constants for all frontend applications

// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
export const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8000/ws';

// Authentication
export const AUTH_TOKEN_KEY = 'twende_auth_token';
export const REFRESH_TOKEN_KEY = 'twende_refresh_token';
export const USER_DATA_KEY = 'twende_user_data';

// App Configuration
export const APP_NAME = 'Twende';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Digital Public Transit Booking Platform';

// Timeouts
export const API_TIMEOUT = 30000; // 30 seconds
export const WS_TIMEOUT = 10000; // 10 seconds
export const LOCATION_TIMEOUT = 5000; // 5 seconds

// Pagination
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// Booking Configuration
export const BOOKING_ADVANCE_MINUTES = 30; // Minimum 30 minutes before departure
export const CANCELLATION_DEADLINE_MINUTES = 15; // Can cancel up to 15 minutes before
export const CHECK_IN_DEADLINE_MINUTES = 5; // Must check in 5 minutes before departure

// Location Configuration
export const DEFAULT_LOCATION = {
  latitude: -1.2921, // Nairobi coordinates
  longitude: 36.8219,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const LOCATION_ACCURACY = {
  high: 10, // meters
  medium: 50,
  low: 100,
};

// Map Configuration
export const MAP_STYLE = 'standard';
export const MAP_ZOOM_LEVELS = {
  city: 10,
  area: 14,
  street: 16,
  building: 18,
};

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  DAILY: {
    code: 'DAILY',
    name: 'Daily Pass',
    price: 40000, // KSh 400 in cents
    duration_days: 1,
    rides: 2,
    description: 'Perfect for occasional trips',
  },
  WEEKLY: {
    code: 'WEEKLY',
    name: 'Weekly Pass',
    price: 200000, // KSh 2,000 in cents
    duration_days: 7,
    rides: 14,
    description: 'Great for regular commuters',
  },
  MONTHLY: {
    code: 'MONTHLY',
    name: 'Monthly Pass',
    price: 800000, // KSh 8,000 in cents
    duration_days: 30,
    rides: 60,
    description: 'Best value for daily commuters',
  },
};

// User Roles
export const USER_ROLES = {
  RIDER: 'RIDER',
  DRIVER: 'DRIVER',
  ADMIN: 'ADMIN',
  CORP_ADMIN: 'CORP_ADMIN',
} as const;

// Booking Status
export const BOOKING_STATUS = {
  RESERVED: 'RESERVED',
  CHECKED_IN: 'CHECKED_IN',
  CANCELLED: 'CANCELLED',
  NO_SHOW: 'NO_SHOW',
  COMPLETED: 'COMPLETED',
} as const;

// Schedule Status
export const SCHEDULE_STATUS = {
  SCHEDULED: 'SCHEDULED',
  BOARDING: 'BOARDING',
  DEPARTED: 'DEPARTED',
  ARRIVED: 'ARRIVED',
  CANCELLED: 'CANCELLED',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
  MPESA: 'MPESA',
  STRIPE: 'STRIPE',
  CASH: 'CASH',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMATION: 'BOOKING_CONFIRMATION',
  PICKUP_REMINDER: 'PICKUP_REMINDER',
  VEHICLE_ARRIVAL: 'VEHICLE_ARRIVAL',
  ROUTE_UPDATE: 'ROUTE_UPDATE',
  PAYMENT_SUCCESS: 'PAYMENT_SUCCESS',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_EXPIRY: 'SUBSCRIPTION_EXPIRY',
  CREDIT_ROLLOVER: 'CREDIT_ROLLOVER',
} as const;

// Colors
export const COLORS = {
  primary: '#3B82F6',
  primaryDark: '#1E40AF',
  secondary: '#10B981',
  secondaryDark: '#059669',
  accent: '#F59E0B',
  accentDark: '#D97706',
  danger: '#EF4444',
  dangerDark: '#DC2626',
  warning: '#F59E0B',
  warningDark: '#D97706',
  success: '#10B981',
  successDark: '#059669',
  info: '#3B82F6',
  infoDark: '#1E40AF',
  gray: '#6B7280',
  grayLight: '#9CA3AF',
  grayDark: '#374151',
  white: '#FFFFFF',
  black: '#000000',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  border: '#E5E7EB',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
} as const;

// Status Colors
export const STATUS_COLORS = {
  [BOOKING_STATUS.RESERVED]: COLORS.primary,
  [BOOKING_STATUS.CHECKED_IN]: COLORS.success,
  [BOOKING_STATUS.CANCELLED]: COLORS.danger,
  [BOOKING_STATUS.NO_SHOW]: COLORS.warning,
  [BOOKING_STATUS.COMPLETED]: COLORS.gray,
  [SCHEDULE_STATUS.SCHEDULED]: COLORS.primary,
  [SCHEDULE_STATUS.BOARDING]: COLORS.success,
  [SCHEDULE_STATUS.DEPARTED]: COLORS.warning,
  [SCHEDULE_STATUS.ARRIVED]: COLORS.gray,
  [SCHEDULE_STATUS.CANCELLED]: COLORS.danger,
  [PAYMENT_STATUS.PENDING]: COLORS.warning,
  [PAYMENT_STATUS.SUCCESS]: COLORS.success,
  [PAYMENT_STATUS.FAILED]: COLORS.danger,
  [PAYMENT_STATUS.REFUNDED]: COLORS.gray,
} as const;

// Routes
export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  
  // Rider
  RIDER_HOME: '/rider',
  RIDER_BOOKINGS: '/rider/bookings',
  RIDER_SUBSCRIPTIONS: '/rider/subscriptions',
  RIDER_PROFILE: '/rider/profile',
  RIDER_TRACKING: '/rider/tracking',
  RIDER_HISTORY: '/rider/history',
  
  // Driver
  DRIVER_HOME: '/driver',
  DRIVER_SCHEDULE: '/driver/schedule',
  DRIVER_PASSENGERS: '/driver/passengers',
  DRIVER_LOCATION: '/driver/location',
  DRIVER_HISTORY: '/driver/history',
  DRIVER_PROFILE: '/driver/profile',
  
  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_ROUTES: '/admin/routes',
  ADMIN_SCHEDULES: '/admin/schedules',
  ADMIN_VEHICLES: '/admin/vehicles',
  ADMIN_DRIVERS: '/admin/drivers',
  ADMIN_BOOKINGS: '/admin/bookings',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_CORPORATE: '/admin/corporate',
} as const;

// Mobile App Routes
export const MOBILE_ROUTES = {
  // Auth
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Rider
  RIDER_TABS: 'RiderTabs',
  RIDER_HOME: 'RiderHome',
  RIDER_BOOKINGS: 'RiderBookings',
  RIDER_SUBSCRIPTIONS: 'RiderSubscriptions',
  RIDER_PROFILE: 'RiderProfile',
  RIDER_TRACKING: 'RiderTracking',
  RIDER_QR: 'RiderQR',
  
  // Driver
  DRIVER_TABS: 'DriverTabs',
  DRIVER_HOME: 'DriverHome',
  DRIVER_SCHEDULE: 'DriverSchedule',
  DRIVER_PASSENGERS: 'DriverPassengers',
  DRIVER_QR_SCANNER: 'DriverQRScanner',
  DRIVER_PROFILE: 'DriverProfile',
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'twende_auth_token',
  REFRESH_TOKEN: 'twende_refresh_token',
  USER_DATA: 'twende_user_data',
  ONBOARDING_COMPLETED: 'twende_onboarding_completed',
  NOTIFICATION_SETTINGS: 'twende_notification_settings',
  LOCATION_PERMISSION: 'twende_location_permission',
  PUSH_TOKEN: 'twende_push_token',
  THEME: 'twende_theme',
  LANGUAGE: 'twende_language',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  PHONE_MIN_LENGTH: 9,
  PHONE_MAX_LENGTH: 15,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  EMAIL_MAX_LENGTH: 254,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred.',
  
  // Auth
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_DISABLED: 'Your account has been disabled.',
  EMAIL_NOT_VERIFIED: 'Please verify your email address.',
  PHONE_NOT_VERIFIED: 'Please verify your phone number.',
  
  // Booking
  SEAT_NOT_AVAILABLE: 'This seat is no longer available.',
  BOOKING_CLOSED: 'Booking is closed for this schedule.',
  CANCELLATION_DEADLINE: 'Cancellation deadline has passed.',
  INVALID_QR_CODE: 'Invalid QR code.',
  ALREADY_CHECKED_IN: 'Already checked in for this booking.',
  
  // Payment
  PAYMENT_FAILED: 'Payment failed. Please try again.',
  INSUFFICIENT_FUNDS: 'Insufficient funds.',
  CARD_DECLINED: 'Card was declined.',
  MPESA_ERROR: 'M-Pesa payment failed.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Welcome back!',
  REGISTER_SUCCESS: 'Account created successfully!',
  BOOKING_SUCCESS: 'Booking confirmed!',
  CANCELLATION_SUCCESS: 'Booking cancelled successfully.',
  PAYMENT_SUCCESS: 'Payment successful!',
  PROFILE_UPDATE: 'Profile updated successfully.',
  PASSWORD_CHANGE: 'Password changed successfully.',
  CHECK_IN_SUCCESS: 'Checked in successfully!',
} as const;

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_LOCATION_TRACKING: true,
  ENABLE_QR_SCANNING: true,
  ENABLE_OFFLINE_MODE: false,
  ENABLE_DARK_MODE: true,
  ENABLE_BIOMETRIC_AUTH: true,
  ENABLE_CORPORATE_ACCOUNTS: true,
  ENABLE_ANALYTICS: true,
} as const;

// Analytics Events
export const ANALYTICS_EVENTS = {
  // User Actions
  USER_REGISTER: 'user_register',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout',
  
  // Booking Actions
  BOOKING_CREATE: 'booking_create',
  BOOKING_CANCEL: 'booking_cancel',
  BOOKING_CHECK_IN: 'booking_check_in',
  
  // Payment Actions
  PAYMENT_INITIATE: 'payment_initiate',
  PAYMENT_SUCCESS: 'payment_success',
  PAYMENT_FAILED: 'payment_failed',
  
  // Subscription Actions
  SUBSCRIPTION_PURCHASE: 'subscription_purchase',
  SUBSCRIPTION_RENEW: 'subscription_renew',
  SUBSCRIPTION_CANCEL: 'subscription_cancel',
  
  // App Usage
  SCREEN_VIEW: 'screen_view',
  FEATURE_USE: 'feature_use',
  ERROR_OCCURRED: 'error_occurred',
} as const;

// WebSocket Events
export const WS_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  
  // Location Updates
  LOCATION_UPDATE: 'location_update',
  DRIVER_LOCATION: 'driver_location',
  
  // Booking Updates
  BOOKING_UPDATE: 'booking_update',
  BOOKING_STATUS_CHANGE: 'booking_status_change',
  
  // Schedule Updates
  SCHEDULE_UPDATE: 'schedule_update',
  SCHEDULE_STATUS_CHANGE: 'schedule_status_change',
  
  // Notifications
  NOTIFICATION: 'notification',
  PUSH_NOTIFICATION: 'push_notification',
  
  // Admin Events
  ADMIN_UPDATE: 'admin_update',
  SYSTEM_ALERT: 'system_alert',
} as const;

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
} as const;

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  DISPLAY_WITH_TIME: 'MMM dd, yyyy h:mm a',
  API: 'yyyy-MM-dd',
  API_WITH_TIME: 'yyyy-MM-dd HH:mm:ss',
  TIME_ONLY: 'h:mm a',
  DATE_ONLY: 'MMM dd',
} as const;

// File Upload
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif'],
} as const;

// Push Notification Categories
export const PUSH_CATEGORIES = {
  BOOKING: 'booking',
  PAYMENT: 'payment',
  ROUTE: 'route',
  GENERAL: 'general',
} as const;

// App Store Links
export const APP_STORE_LINKS = {
  IOS: 'https://apps.apple.com/app/twende/id123456789',
  ANDROID: 'https://play.google.com/store/apps/details?id=com.twende.app',
} as const;

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/twende',
  TWITTER: 'https://twitter.com/twende',
  INSTAGRAM: 'https://instagram.com/twende',
  LINKEDIN: 'https://linkedin.com/company/twende',
} as const;

// Support
export const SUPPORT = {
  EMAIL: 'support@twende.com',
  PHONE: '+254 700 000 000',
  WHATSAPP: '+254 700 000 000',
  WEBSITE: 'https://twende.com',
} as const;
