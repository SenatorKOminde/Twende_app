// Authentication utilities and context for all frontend applications

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useApi } from './api';
import { useLocalStorage } from './hooks';
import { AUTH_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_DATA_KEY } from './constants';
import { User, LoginCredentials, RegisterData, AuthResponse } from './types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authToken, setAuthToken] = useLocalStorage<string | null>(AUTH_TOKEN_KEY, null);
  const [refreshTokenValue, setRefreshTokenValue] = useLocalStorage<string | null>(REFRESH_TOKEN_KEY, null);
  const [userData, setUserData] = useLocalStorage<User | null>(USER_DATA_KEY, null);
  
  const api = useApi();

  // Initialize auth state from storage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (authToken && userData) {
          // Verify token is still valid
          const response = await api.get('/auth/verify/');
          if (response.status === 200) {
            setUser(userData);
          } else {
            // Token is invalid, try to refresh
            if (refreshTokenValue) {
              await refreshToken();
            } else {
              // No refresh token, clear auth
              clearAuth();
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const clearAuth = () => {
    setUser(null);
    setAuthToken(null);
    setRefreshTokenValue(null);
    setUserData(null);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await api.post<AuthResponse>('/auth/login/', credentials);
      
      if (response.data.access && response.data.refresh) {
        const { access, refresh, user: userData } = response.data;
        
        // Store tokens and user data
        setAuthToken(access);
        setRefreshTokenValue(refresh);
        setUserData(userData);
        setUser(userData);
        
        // Set default authorization header
        api.setAuthToken(access);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await api.post<AuthResponse>('/auth/register/', data);
      
      if (response.data.access && response.data.refresh) {
        const { access, refresh, user: userData } = response.data;
        
        // Store tokens and user data
        setAuthToken(access);
        setRefreshTokenValue(refresh);
        setUserData(userData);
        setUser(userData);
        
        // Set default authorization header
        api.setAuthToken(access);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    try {
      // Call logout endpoint to invalidate token on server
      api.post('/auth/logout/').catch(console.error);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuth();
      api.clearAuthToken();
    }
  };

  const refreshToken = async () => {
    try {
      if (!refreshTokenValue) {
        throw new Error('No refresh token available');
      }

      const response = await api.post<AuthResponse>('/auth/refresh/', {
        refresh: refreshTokenValue,
      });

      if (response.data.access) {
        const { access, user: userData } = response.data;
        
        // Update stored token and user data
        setAuthToken(access);
        setUserData(userData);
        setUser(userData);
        
        // Update default authorization header
        api.setAuthToken(access);
      } else {
        throw new Error('Invalid refresh response');
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      api.clearAuthToken();
      throw error;
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      setUserData(updatedUser);
    }
  };

  // Set up automatic token refresh
  useEffect(() => {
    if (authToken && refreshTokenValue) {
      const interval = setInterval(async () => {
        try {
          await refreshToken();
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
        }
      }, 14 * 60 * 1000); // Refresh every 14 minutes (tokens expire in 15 minutes)

      return () => clearInterval(interval);
    }
  }, [authToken, refreshTokenValue]);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user && !!authToken,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Utility functions for authentication
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const getUserData = (): User | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const clearAuthStorage = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

// Role-based access control utilities
export const hasRole = (user: User | null, role: string): boolean => {
  return user?.role === role;
};

export const hasAnyRole = (user: User | null, roles: string[]): boolean => {
  return user ? roles.includes(user.role) : false;
};

export const isRider = (user: User | null): boolean => {
  return hasRole(user, 'RIDER');
};

export const isDriver = (user: User | null): boolean => {
  return hasRole(user, 'DRIVER');
};

export const isAdmin = (user: User | null): boolean => {
  return hasRole(user, 'ADMIN');
};

export const isCorporateAdmin = (user: User | null): boolean => {
  return hasRole(user, 'CORP_ADMIN');
};

// Permission-based access control
export const canAccess = (user: User | null, permission: string): boolean => {
  if (!user) return false;

  const permissions: Record<string, string[]> = {
    'bookings.create': ['RIDER'],
    'bookings.view': ['RIDER', 'DRIVER', 'ADMIN'],
    'bookings.cancel': ['RIDER'],
    'bookings.checkin': ['DRIVER', 'ADMIN'],
    'subscriptions.manage': ['RIDER', 'ADMIN'],
    'routes.manage': ['ADMIN'],
    'schedules.manage': ['ADMIN'],
    'vehicles.manage': ['ADMIN'],
    'drivers.manage': ['ADMIN'],
    'analytics.view': ['ADMIN'],
    'corporate.manage': ['CORP_ADMIN', 'ADMIN'],
    'payments.process': ['ADMIN'],
    'notifications.send': ['ADMIN'],
  };

  const allowedRoles = permissions[permission] || [];
  return allowedRoles.includes(user.role);
};

// Route protection utilities
export const requireAuth = (user: User | null): boolean => {
  return !!user;
};

export const requireRole = (user: User | null, role: string): boolean => {
  return hasRole(user, role);
};

export const requirePermission = (user: User | null, permission: string): boolean => {
  return canAccess(user, permission);
};

// Token utilities
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    return true;
  }
};

export const getTokenExpiration = (token: string): Date | null => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return new Date(payload.exp * 1000);
  } catch (error) {
    return null;
  }
};

export const getTokenTimeUntilExpiry = (token: string): number => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return Math.max(0, payload.exp - currentTime);
  } catch (error) {
    return 0;
  }
};

// Session management
export const startSession = (user: User, token: string, refreshToken: string): void => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

export const endSession = (): void => {
  clearAuthStorage();
};

export const getSessionInfo = (): {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isExpired: boolean;
} => {
  const user = getUserData();
  const token = getAuthToken();
  const refreshToken = getRefreshToken();
  const isExpired = token ? isTokenExpired(token) : true;

  return {
    user,
    token,
    refreshToken,
    isExpired,
  };
};
