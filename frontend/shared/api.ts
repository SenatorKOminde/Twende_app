// Shared API client for all frontend applications
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  Profile,
  Route,
  Schedule,
  Booking,
  Subscription,
  SubscriptionPlan,
  Payment,
  DriverLocation,
  Notification,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  TokenRefreshResponse,
  CreateBookingRequest,
  ProfileUpdateRequest,
  ApiResponse,
  PaginatedResponse,
  ApiError,
} from './types';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api/v1' 
  : 'https://api.twende.com/api/v1';

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to add auth token
  client.interceptors.request.use(
    async (config) => {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle token refresh
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await AsyncStorage.getItem('refresh_token');
          if (refreshToken) {
            const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
              refresh: refreshToken,
            });

            const { access } = response.data;
            await AsyncStorage.setItem('access_token', access);

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${access}`;
            return client(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed, redirect to login
          await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
          // Navigate to login screen (implementation depends on navigation library)
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

// API client instance
export const apiClient = createApiClient();

// API Service Class
export class ApiService {
  // Authentication
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login/', credentials);
    return response.data;
  }

  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register/', userData);
    return response.data;
  }

  static async refreshToken(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await apiClient.post<TokenRefreshResponse>('/auth/token/refresh/', {
      refresh: refreshToken,
    });
    return response.data;
  }

  static async logout(): Promise<void> {
    await apiClient.post('/auth/logout/');
    await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
  }

  // User Profile
  static async getProfile(): Promise<User> {
    const response = await apiClient.get<User>('/auth/profile/');
    return response.data;
  }

  static async updateProfile(profileData: ProfileUpdateRequest): Promise<User> {
    const response = await apiClient.put<User>('/auth/profile/', profileData);
    return response.data;
  }

  static async getExtendedProfile(): Promise<Profile> {
    const response = await apiClient.get<Profile>('/auth/profile/extended/');
    return response.data;
  }

  // Routes
  static async getRoutes(): Promise<Route[]> {
    const response = await apiClient.get<Route[]>('/routes/');
    return response.data;
  }

  static async getRoute(id: number): Promise<Route> {
    const response = await apiClient.get<Route>(`/routes/${id}/`);
    return response.data;
  }

  // Schedules
  static async getSchedules(params?: {
    route_id?: number;
    date?: string;
    status?: string;
  }): Promise<Schedule[]> {
    const response = await apiClient.get<Schedule[]>('/schedules/', { params });
    return response.data;
  }

  static async getSchedule(id: number): Promise<Schedule> {
    const response = await apiClient.get<Schedule>(`/schedules/${id}/`);
    return response.data;
  }

  // Bookings
  static async getBookings(): Promise<Booking[]> {
    const response = await apiClient.get<Booking[]>('/bookings/');
    return response.data;
  }

  static async getBooking(id: number): Promise<Booking> {
    const response = await apiClient.get<Booking>(`/bookings/${id}/`);
    return response.data;
  }

  static async createBooking(bookingData: CreateBookingRequest): Promise<Booking> {
    const response = await apiClient.post<Booking>('/bookings/', bookingData);
    return response.data;
  }

  static async cancelBooking(id: number, reason?: string): Promise<Booking> {
    const response = await apiClient.post<Booking>(`/bookings/${id}/cancel/`, {
      reason,
    });
    return response.data;
  }

  static async getBookingQR(id: number): Promise<{ qr_code: string }> {
    const response = await apiClient.get<{ qr_code: string }>(`/bookings/${id}/qr/`);
    return response.data;
  }

  // Subscriptions
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const response = await apiClient.get<SubscriptionPlan[]>('/subscriptions/plans/');
    return response.data;
  }

  static async getSubscriptions(): Promise<Subscription[]> {
    const response = await apiClient.get<Subscription[]>('/subscriptions/');
    return response.data;
  }

  static async getActiveSubscription(): Promise<Subscription | null> {
    const response = await apiClient.get<Subscription>('/subscriptions/active/');
    return response.data;
  }

  static async subscribeToPlan(planId: number, paymentMethod: string): Promise<Subscription> {
    const response = await apiClient.post<Subscription>('/subscriptions/subscribe/', {
      plan_id: planId,
      payment_method: paymentMethod,
    });
    return response.data;
  }

  // Payments
  static async getPayments(): Promise<Payment[]> {
    const response = await apiClient.get<Payment[]>('/payments/');
    return response.data;
  }

  static async initiateMpesaPayment(amount: number, phone: string): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments/mpesa/', {
      amount,
      phone,
    });
    return response.data;
  }

  static async initiateStripePayment(amount: number, token: string): Promise<Payment> {
    const response = await apiClient.post<Payment>('/payments/stripe/', {
      amount,
      token,
    });
    return response.data;
  }

  // Driver specific
  static async getDriverSchedule(): Promise<Schedule[]> {
    const response = await apiClient.get<Schedule[]>('/driver/schedule/');
    return response.data;
  }

  static async updateDriverLocation(location: {
    latitude: number;
    longitude: number;
    bearing?: number;
    speed?: number;
    accuracy?: number;
  }): Promise<DriverLocation> {
    const response = await apiClient.post<DriverLocation>('/driver/location/', location);
    return response.data;
  }

  static async startTrip(scheduleId: number): Promise<Schedule> {
    const response = await apiClient.post<Schedule>(`/driver/start_trip/`, {
      schedule_id: scheduleId,
    });
    return response.data;
  }

  static async endTrip(scheduleId: number): Promise<Schedule> {
    const response = await apiClient.post<Schedule>(`/driver/end_trip/`, {
      schedule_id: scheduleId,
    });
    return response.data;
  }

  static async checkInPassenger(bookingId: number, qrCode: string): Promise<Booking> {
    const response = await apiClient.post<Booking>('/driver/checkin/', {
      booking_id: bookingId,
      qr: qrCode,
    });
    return response.data;
  }

  // Notifications
  static async getNotifications(): Promise<Notification[]> {
    const response = await apiClient.get<Notification[]>('/notifications/');
    return response.data;
  }

  static async markNotificationAsRead(id: number): Promise<Notification> {
    const response = await apiClient.patch<Notification>(`/notifications/${id}/read/`);
    return response.data;
  }

  // Health check
  static async healthCheck(): Promise<{ status: string; service: string; version: string }> {
    const response = await apiClient.get('/health/');
    return response.data;
  }
}

// Utility functions
export const storeAuthTokens = async (tokens: { access: string; refresh: string }) => {
  await AsyncStorage.multiSet([
    ['access_token', tokens.access],
    ['refresh_token', tokens.refresh],
  ]);
};

export const getStoredTokens = async (): Promise<{ access: string | null; refresh: string | null }> => {
  const [access, refresh] = await AsyncStorage.multiGet(['access_token', 'refresh_token']);
  return {
    access: access[1],
    refresh: refresh[1],
  };
};

export const storeUser = async (user: User) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getStoredUser = async (): Promise<User | null> => {
  const userString = await AsyncStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

export const clearStoredData = async () => {
  await AsyncStorage.multiRemove(['access_token', 'refresh_token', 'user']);
};

// Error handling utility
export const handleApiError = (error: any): ApiError => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || error.response.data?.detail || 'An error occurred',
      code: error.response.data?.code,
      details: error.response.data,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR',
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
    };
  }
};

export default ApiService;
