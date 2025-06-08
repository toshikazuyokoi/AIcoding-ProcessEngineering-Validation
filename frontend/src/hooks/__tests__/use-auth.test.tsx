/**
 * ===================================
 * Authentication Hook Tests
 * ===================================
 * Purpose: Comprehensive testing for useAuth hook and utilities
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { 
  useAuth, 
  useAuthRole, 
  useIsAdmin, 
  useIsUser, 
  useUserInfo,
  UseAuthOptions 
} from '../use-auth';
import { AuthProvider, User, LoginCredentials, RegisterData } from '../../contexts/auth-context';
import * as authContextModule from '../../contexts/auth-context';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock the auth context
const mockAuthContext = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  refreshAuth: jest.fn(),
  clearError: jest.fn(),
  validateToken: jest.fn()
};

// Mock useAuthContext
jest.spyOn(authContextModule, 'useAuthContext').mockReturnValue(mockAuthContext);

// Test data
const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
  isActive: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-123',
  username: 'adminuser',
  email: 'admin@example.com',
  role: 'ADMIN'
};

const mockLoginCredentials: LoginCredentials = {
  email: 'test@example.com',
  password: 'password123'
};

const mockRegisterData: RegisterData = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

// ===================================
// Test Suite Setup
// ===================================

describe('useAuth Hook', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock context to default state
    Object.assign(mockAuthContext, {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isInitialized: false
    });
  });

  // ===================================
  // Phase 1: Basic Hook Functionality Tests
  // ===================================

  describe('Phase 1: Basic Hook Functionality', () => {
    it('should return authentication state from context', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      expect(result.current.user).toBe(null);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.isInitialized).toBe(false);
    });

    it('should return computed properties', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      expect(result.current.isLoggedIn).toBe(false);
      expect(result.current.hasError).toBe(false);
      expect(result.current.isReady).toBe(false);
      expect(result.current.userRole).toBe(null);
      expect(result.current.userName).toBe(null);
      expect(result.current.userEmail).toBe(null);
    });

    it('should return authentication operations', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.register).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.refreshAuth).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
      expect(typeof result.current.validateToken).toBe('function');
    });

    it('should update when context state changes', () => {
      const { result, rerender } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      // Initial state
      expect(result.current.isAuthenticated).toBe(false);

      // Update mock context
      Object.assign(mockAuthContext, {
        user: mockUser,
        isAuthenticated: true,
        isInitialized: true
      });

      rerender();

      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.userRole).toBe('USER');
      expect(result.current.userName).toBe('testuser');
      expect(result.current.userEmail).toBe('test@example.com');
    });
  });

  // ===================================
  // Phase 2: Authentication Operations Tests
  // ===================================

  describe('Phase 2: Authentication Operations', () => {
    it('should call context login method', async () => {
      mockAuthContext.login.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login(mockLoginCredentials);
      });

      expect(mockAuthContext.login).toHaveBeenCalledWith(mockLoginCredentials);
    });

    it('should call context register method', async () => {
      mockAuthContext.register.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.register(mockRegisterData);
      });

      expect(mockAuthContext.register).toHaveBeenCalledWith(mockRegisterData);
    });

    it('should call context logout method', async () => {
      mockAuthContext.logout.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(mockAuthContext.logout).toHaveBeenCalled();
    });

    it('should call context refreshAuth method', async () => {
      mockAuthContext.refreshAuth.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.refreshAuth();
      });

      expect(mockAuthContext.refreshAuth).toHaveBeenCalled();
    });

    it('should call context clearError method', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      act(() => {
        result.current.clearError();
      });

      expect(mockAuthContext.clearError).toHaveBeenCalled();
    });

    it('should call context validateToken method', async () => {
      mockAuthContext.validateToken.mockResolvedValue(true);
      
      const { result } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      let tokenValid: boolean;
      await act(async () => {
        tokenValid = await result.current.validateToken();
      });

      expect(mockAuthContext.validateToken).toHaveBeenCalled();
      expect(tokenValid!).toBe(true);
    });
  });

  // ===================================
  // Phase 3: Callback Options Tests
  // ===================================

  describe('Phase 3: Callback Options', () => {
    it('should call onLoginSuccess callback on successful login', async () => {
      const onLoginSuccess = jest.fn();
      mockAuthContext.login.mockResolvedValue(undefined);
      Object.assign(mockAuthContext, { user: mockUser });

      const { result } = renderHook(() => useAuth({ onLoginSuccess }), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.login(mockLoginCredentials);
      });

      expect(onLoginSuccess).toHaveBeenCalledWith(mockUser);
    });

    it('should call onLoginError callback on login failure', async () => {
      const onLoginError = jest.fn();
      const errorMessage = 'Login failed';
      mockAuthContext.login.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth({ onLoginError }), { wrapper: TestWrapper });

      await act(async () => {
        try {
          await result.current.login(mockLoginCredentials);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(onLoginError).toHaveBeenCalledWith(errorMessage);
    });

    it('should call onLogoutSuccess callback on successful logout', async () => {
      const onLogoutSuccess = jest.fn();
      mockAuthContext.logout.mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth({ onLogoutSuccess }), { wrapper: TestWrapper });

      await act(async () => {
        await result.current.logout();
      });

      expect(onLogoutSuccess).toHaveBeenCalled();
    });

    it('should call onLogoutError callback on logout failure', async () => {
      const onLogoutError = jest.fn();
      const errorMessage = 'Logout failed';
      mockAuthContext.logout.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useAuth({ onLogoutError }), { wrapper: TestWrapper });

      await act(async () => {
        try {
          await result.current.logout();
        } catch (error) {
          // Expected to throw
        }
      });

      expect(onLogoutError).toHaveBeenCalledWith(errorMessage);
    });
  });

  // ===================================
  // Phase 4: Utility Hooks Tests
  // ===================================

  describe('Phase 4: Utility Hooks', () => {
    it('should check user role correctly with useAuthRole', () => {
      Object.assign(mockAuthContext, { user: mockUser });
      
      const { result: userResult } = renderHook(() => useAuthRole('USER'), { wrapper: TestWrapper });
      const { result: adminResult } = renderHook(() => useAuthRole('ADMIN'), { wrapper: TestWrapper });

      expect(userResult.current).toBe(true);
      expect(adminResult.current).toBe(false);
    });

    it('should check admin role with useIsAdmin', () => {
      Object.assign(mockAuthContext, { user: mockAdminUser });
      
      const { result } = renderHook(() => useIsAdmin(), { wrapper: TestWrapper });

      expect(result.current).toBe(true);
    });

    it('should check user role with useIsUser', () => {
      Object.assign(mockAuthContext, { user: mockUser });
      
      const { result } = renderHook(() => useIsUser(), { wrapper: TestWrapper });

      expect(result.current).toBe(true);
    });

    it('should return user info safely with useUserInfo', () => {
      Object.assign(mockAuthContext, { user: mockUser });
      
      const { result } = renderHook(() => useUserInfo(), { wrapper: TestWrapper });

      expect(result.current).toEqual({
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER',
        isActive: true
      });
    });

    it('should return null values when no user with useUserInfo', () => {
      Object.assign(mockAuthContext, { user: null });
      
      const { result } = renderHook(() => useUserInfo(), { wrapper: TestWrapper });

      expect(result.current).toEqual({
        id: null,
        username: null,
        email: null,
        role: null,
        isActive: null
      });
    });
  });

  // ===================================
  // Phase 5: Performance and Memoization Tests
  // ===================================

  describe('Phase 5: Performance and Memoization', () => {
    it('should memoize operations to prevent unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      const firstLogin = result.current.login;
      const firstLogout = result.current.logout;
      const firstRefresh = result.current.refreshAuth;

      rerender();

      expect(result.current.login).toBe(firstLogin);
      expect(result.current.logout).toBe(firstLogout);
      expect(result.current.refreshAuth).toBe(firstRefresh);
    });

    it('should memoize computed properties', () => {
      Object.assign(mockAuthContext, { 
        user: mockUser, 
        isAuthenticated: true,
        isInitialized: true 
      });

      const { result, rerender } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      const firstComputedState = {
        isLoggedIn: result.current.isLoggedIn,
        hasError: result.current.hasError,
        isReady: result.current.isReady,
        userRole: result.current.userRole,
        userName: result.current.userName,
        userEmail: result.current.userEmail
      };

      rerender();

      expect(result.current.isLoggedIn).toBe(firstComputedState.isLoggedIn);
      expect(result.current.hasError).toBe(firstComputedState.hasError);
      expect(result.current.isReady).toBe(firstComputedState.isReady);
      expect(result.current.userRole).toBe(firstComputedState.userRole);
      expect(result.current.userName).toBe(firstComputedState.userName);
      expect(result.current.userEmail).toBe(firstComputedState.userEmail);
    });

    it('should update memoized values when dependencies change', () => {
      const { result, rerender } = renderHook(() => useAuth(), { wrapper: TestWrapper });

      // Initial state
      expect(result.current.isLoggedIn).toBe(false);

      // Update context
      Object.assign(mockAuthContext, { 
        user: mockUser, 
        isAuthenticated: true 
      });

      rerender();

      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.userRole).toBe('USER');
    });
  });
});
