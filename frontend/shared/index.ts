// Main export file for shared frontend utilities

// Types
export * from './types';

// API client
export * from './api';

// WebSocket client
export * from './websocket';

// Authentication
export * from './auth';

// Utilities
export * from './utils';

// Constants
export * from './constants';

// Hooks
export * from './hooks';

// Re-export commonly used items for convenience
export {
  // Types
  type User,
  type Booking,
  type Schedule,
  type Route,
  type Subscription,
  type Payment,
  type Notification,
  
  // API
  useApi,
  apiClient,
  
  // WebSocket
  useWebSocket,
  WebSocketProvider,
  
  // Auth
  useAuth,
  AuthProvider,
  isAuthenticated,
  hasRole,
  canAccess,
  
  // Utils
  formatDate,
  formatTime,
  formatCurrency,
  formatPhoneNumber,
  validateEmail,
  validatePassword,
  
  // Constants
  API_BASE_URL,
  WS_BASE_URL,
  COLORS,
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
  
  // Hooks
  useLocalStorage,
  useLoading,
  usePagination,
  useForm,
  useLocation,
  useNotifications,
} from './index';
