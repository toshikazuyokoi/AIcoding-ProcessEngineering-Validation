/**
 * ===================================
 * Authentication Hook Implementation
 * ===================================
 * Purpose: Custom hook for authentication functionality
 * Features:
 * - Simplified authentication interface
 * - State management integration
 * - Performance optimization
 * - Type-safe authentication operations
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { useCallback, useMemo } from 'react';
import { 
  useAuthContext, 
  User, 
  LoginCredentials, 
  RegisterData 
} from '../contexts/auth-context';

// ===================================
// Authentication Hook Types
// ===================================

/**
 * Authentication hook return interface
 */
export interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitialized: boolean;

  // Authentication operations
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  
  // Utility operations
  refreshAuth: () => Promise<void>;
  clearError: () => void;
  validateToken: () => Promise<boolean>;

  // Computed properties
  isLoggedIn: boolean;
  hasError: boolean;
  isReady: boolean;
  userRole: 'USER' | 'ADMIN' | null;
  userName: string | null;
  userEmail: string | null;
}

/**
 * Authentication hook options interface
 */
export interface UseAuthOptions {
  autoRefresh?: boolean;
  onLoginSuccess?: (user: User) => void;
  onLoginError?: (error: string) => void;
  onLogoutSuccess?: () => void;
  onLogoutError?: (error: string) => void;
}

// ===================================
// Authentication Hook Implementation
// ===================================

/**
 * Custom hook for authentication functionality
 * 
 * Provides a simplified interface for authentication operations
 * and state management with performance optimizations.
 * 
 * @param options - Optional configuration for the hook
 * @returns Authentication state and operations
 */
export const useAuth = (options: UseAuthOptions = {}): UseAuthReturn => {
  const {
    autoRefresh = false,
    onLoginSuccess,
    onLoginError,
    onLogoutSuccess,
    onLogoutError
  } = options;

  // Get authentication context
  const authContext = useAuthContext();

  // ===================================
  // Memoized Authentication Operations
  // ===================================

  /**
   * Enhanced login with callbacks
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    try {
      await authContext.login(credentials);
      
      // Call success callback if provided
      if (onLoginSuccess && authContext.user) {
        onLoginSuccess(authContext.user);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      
      // Call error callback if provided
      if (onLoginError) {
        onLoginError(errorMessage);
      }
      
      // Re-throw error for component handling
      throw error;
    }
  }, [authContext, onLoginSuccess, onLoginError]);

  /**
   * Enhanced register with callbacks
   */
  const register = useCallback(async (data: RegisterData): Promise<void> => {
    try {
      await authContext.register(data);
      
      // Call success callback if provided
      if (onLoginSuccess && authContext.user) {
        onLoginSuccess(authContext.user);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      
      // Call error callback if provided
      if (onLoginError) {
        onLoginError(errorMessage);
      }
      
      // Re-throw error for component handling
      throw error;
    }
  }, [authContext, onLoginSuccess, onLoginError]);

  /**
   * Enhanced logout with callbacks
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await authContext.logout();
      
      // Call success callback if provided
      if (onLogoutSuccess) {
        onLogoutSuccess();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Logout failed';
      
      // Call error callback if provided
      if (onLogoutError) {
        onLogoutError(errorMessage);
      }
      
      // Re-throw error for component handling
      throw error;
    }
  }, [authContext, onLogoutSuccess, onLogoutError]);

  /**
   * Refresh authentication state
   */
  const refreshAuth = useCallback(async (): Promise<void> => {
    return authContext.refreshAuth();
  }, [authContext]);

  /**
   * Clear authentication error
   */
  const clearError = useCallback((): void => {
    authContext.clearError();
  }, [authContext]);

  /**
   * Validate current token
   */
  const validateToken = useCallback(async (): Promise<boolean> => {
    return authContext.validateToken();
  }, [authContext]);

  // ===================================
  // Memoized Computed Properties
  // ===================================

  /**
   * Computed authentication state
   */
  const computedState = useMemo(() => ({
    // Alias for isAuthenticated
    isLoggedIn: authContext.isAuthenticated,
    
    // Check if there's an error
    hasError: !!authContext.error,
    
    // Check if authentication is ready (initialized and not loading)
    isReady: authContext.isInitialized && !authContext.isLoading,
    
    // User role (null if not authenticated)
    userRole: authContext.user?.role || null,
    
    // User name (null if not authenticated)
    userName: authContext.user?.username || null,
    
    // User email (null if not authenticated)
    userEmail: authContext.user?.email || null
  }), [
    authContext.isAuthenticated,
    authContext.error,
    authContext.isInitialized,
    authContext.isLoading,
    authContext.user
  ]);

  // ===================================
  // Auto-refresh Effect (Optional)
  // ===================================

  // Note: Auto-refresh is handled by AuthContext
  // This hook doesn't need additional effects for auto-refresh

  // ===================================
  // Return Hook Interface
  // ===================================

  return useMemo(() => ({
    // Direct state from context
    user: authContext.user,
    isAuthenticated: authContext.isAuthenticated,
    isLoading: authContext.isLoading,
    error: authContext.error,
    isInitialized: authContext.isInitialized,

    // Enhanced operations
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    validateToken,

    // Computed properties
    ...computedState
  }), [
    authContext.user,
    authContext.isAuthenticated,
    authContext.isLoading,
    authContext.error,
    authContext.isInitialized,
    login,
    register,
    logout,
    refreshAuth,
    clearError,
    validateToken,
    computedState
  ]);
};

// ===================================
// Utility Hooks
// ===================================

/**
 * Hook to check if user has specific role
 */
export const useAuthRole = (requiredRole: 'USER' | 'ADMIN'): boolean => {
  const { user } = useAuth();
  return user?.role === requiredRole;
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = (): boolean => {
  return useAuthRole('ADMIN');
};

/**
 * Hook to check if user is regular user
 */
export const useIsUser = (): boolean => {
  return useAuthRole('USER');
};

/**
 * Hook to get user information safely
 */
export const useUserInfo = (): {
  id: string | null;
  username: string | null;
  email: string | null;
  role: 'USER' | 'ADMIN' | null;
  isActive: boolean | null;
} => {
  const { user } = useAuth();
  
  return useMemo(() => ({
    id: user?.id || null,
    username: user?.username || null,
    email: user?.email || null,
    role: user?.role || null,
    isActive: user?.isActive || null
  }), [user]);
};

// Export default hook
export default useAuth;
