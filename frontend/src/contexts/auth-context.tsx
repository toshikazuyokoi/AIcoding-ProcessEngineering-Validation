/**
 * ===================================
 * Authentication Context Implementation
 * ===================================
 * Purpose: Application-wide authentication state management
 * Features:
 * - User authentication state management
 * - Login/logout functionality
 * - Token management and auto-refresh
 * - Session persistence
 * - Security policy enforcement
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiClient, TokenPair, AuthenticationError, NetworkError } from '../utils/api-client';

// ===================================
// Authentication Types
// ===================================

/**
 * User information interface
 */
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data interface
 */
export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

/**
 * Authentication state interface
 */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;
}

/**
 * Authentication context interface
 */
export interface AuthContextType {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  validateToken: () => Promise<boolean>;
}

// ===================================
// Authentication Actions
// ===================================

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User } }
  | { type: 'AUTH_FAILURE'; payload: { error: string } }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_INITIALIZE' }
  | { type: 'AUTH_SET_LOADING'; payload: { isLoading: boolean } };

// ===================================
// Authentication Reducer
// ===================================

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isInitialized: true
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        isInitialized: true
      };

    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isInitialized: true
      };

    case 'AUTH_CLEAR_ERROR':
      return {
        ...state,
        error: null
      };

    case 'AUTH_INITIALIZE':
      return {
        ...state,
        isInitialized: true
      };

    case 'AUTH_SET_LOADING':
      return {
        ...state,
        isLoading: action.payload.isLoading
      };

    default:
      return state;
  }
}

// ===================================
// Authentication Context
// ===================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ===================================
// Authentication Provider
// ===================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ===================================
  // Authentication Actions
  // ===================================

  /**
   * Login user with credentials
   */
  const login = async (credentials: LoginCredentials): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiClient.post<{
        user: User;
        tokens: TokenPair;
      }>('/auth/login', credentials);

      if (response.success && response.data) {
        // Store tokens
        apiClient.setTokens(response.data.tokens);

        // Update state
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user }
        });
      } else {
        throw new Error(response.error?.message || 'Login failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: { error: errorMessage }
      });
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (data: RegisterData): Promise<void> => {
    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiClient.post<{
        user: User;
        tokens: TokenPair;
      }>('/auth/register', data);

      if (response.success && response.data) {
        // Store tokens
        apiClient.setTokens(response.data.tokens);

        // Update state
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data.user }
        });
      } else {
        throw new Error(response.error?.message || 'Registration failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      dispatch({
        type: 'AUTH_FAILURE',
        payload: { error: errorMessage }
      });
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async (): Promise<void> => {
    try {
      // Call logout endpoint (optional)
      await apiClient.post('/auth/logout', {}, { requireAuth: false });
    } catch (error) {
      // Ignore logout API errors
      console.warn('Logout API call failed:', error);
    } finally {
      // Clear tokens and state regardless of API call result
      apiClient.clearTokens();
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  };

  /**
   * Refresh authentication state
   */
  const refreshAuth = async (): Promise<void> => {
    if (!apiClient.isAuthenticated()) {
      dispatch({ type: 'AUTH_INITIALIZE' });
      return;
    }

    dispatch({ type: 'AUTH_START' });

    try {
      const response = await apiClient.get<User>('/auth/me');

      if (response.success && response.data) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: { user: response.data }
        });
      } else {
        throw new Error('Failed to get user information');
      }
    } catch (error) {
      // Clear invalid tokens
      apiClient.clearTokens();
      dispatch({
        type: 'AUTH_FAILURE',
        payload: { error: 'Session expired' }
      });
    }
  };

  /**
   * Validate current token
   */
  const validateToken = async (): Promise<boolean> => {
    if (!apiClient.isAuthenticated()) {
      return false;
    }

    try {
      const response = await apiClient.post('/auth/validate');
      return response.success;
    } catch (error) {
      if (error instanceof AuthenticationError) {
        // Clear invalid tokens
        apiClient.clearTokens();
        dispatch({ type: 'AUTH_LOGOUT' });
      }
      return false;
    }
  };

  /**
   * Clear authentication error
   */
  const clearError = (): void => {
    dispatch({ type: 'AUTH_CLEAR_ERROR' });
  };

  // ===================================
  // Effects
  // ===================================

  /**
   * Initialize authentication on mount
   */
  useEffect(() => {
    const initializeAuth = async () => {
      if (apiClient.isAuthenticated()) {
        await refreshAuth();
      } else {
        dispatch({ type: 'AUTH_INITIALIZE' });
      }
    };

    initializeAuth();
  }, []);

  /**
   * Handle storage events for multi-tab synchronization
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'task_management_access_token') {
        if (event.newValue === null) {
          // Token was removed in another tab
          dispatch({ type: 'AUTH_LOGOUT' });
        } else if (event.oldValue === null) {
          // Token was added in another tab
          refreshAuth();
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // ===================================
  // Context Value
  // ===================================

  const contextValue: AuthContextType = {
    // State
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    isInitialized: state.isInitialized,

    // Actions
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    validateToken
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ===================================
// Custom Hook
// ===================================

/**
 * Custom hook to use authentication context
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  
  return context;
};

// Export default provider
export default AuthProvider;
