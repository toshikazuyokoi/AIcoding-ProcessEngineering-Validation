/**
 * ===================================
 * Authentication Context Tests
 * ===================================
 * Purpose: Comprehensive testing for AuthContext and AuthProvider
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuthContext, User, LoginCredentials, RegisterData } from '../auth-context';
import * as apiClientModule from '../../utils/api-client';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock the entire api-client module
jest.mock('../../utils/api-client', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    isAuthenticated: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn()
  },
  AuthenticationError: class AuthenticationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'AuthenticationError';
    }
  },
  NetworkError: class NetworkError extends Error {
    constructor(message: string) {
      super(message);
      this.name = 'NetworkError';
    }
  }
}));

// Get the mocked API client
const mockApiClient = require('../../utils/api-client').apiClient;

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock console methods
const mockConsole = {
  warn: jest.fn(),
  error: jest.fn(),
  log: jest.fn()
};
Object.defineProperty(console, 'warn', { value: mockConsole.warn });
Object.defineProperty(console, 'error', { value: mockConsole.error });
Object.defineProperty(console, 'log', { value: mockConsole.log });

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

const mockTokenPair = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600
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

// Test component to access context
const TestComponent: React.FC = () => {
  const auth = useAuthContext();

  const handleLogin = async () => {
    try {
      await auth.login(mockLoginCredentials);
    } catch (error) {
      // Error is handled by context, no need to do anything
    }
  };

  const handleRegister = async () => {
    try {
      await auth.register(mockRegisterData);
    } catch (error) {
      // Error is handled by context, no need to do anything
    }
  };

  return (
    <div>
      <div data-testid="user-id">{auth.user?.id || 'null'}</div>
      <div data-testid="is-authenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="is-loading">{auth.isLoading.toString()}</div>
      <div data-testid="error">{auth.error || 'null'}</div>
      <div data-testid="is-initialized">{auth.isInitialized.toString()}</div>
      <button data-testid="login-btn" onClick={handleLogin}>
        Login
      </button>
      <button data-testid="register-btn" onClick={handleRegister}>
        Register
      </button>
      <button data-testid="logout-btn" onClick={() => auth.logout()}>
        Logout
      </button>
      <button data-testid="refresh-btn" onClick={() => auth.refreshAuth()}>
        Refresh
      </button>
      <button data-testid="clear-error-btn" onClick={() => auth.clearError()}>
        Clear Error
      </button>
    </div>
  );
};

// ===================================
// Test Suite Setup
// ===================================

describe('AuthContext', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    mockApiClient.post.mockClear();
    mockApiClient.get.mockClear();
    mockApiClient.isAuthenticated.mockClear();
    mockApiClient.setTokens.mockClear();
    mockApiClient.clearTokens.mockClear();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockConsole.warn.mockClear();

    // Default mock implementations
    mockApiClient.isAuthenticated.mockReturnValue(false);
  });

  // ===================================
  // Phase 1: Provider and Hook Tests
  // ===================================

  describe('Phase 1: Provider and Hook', () => {
    it('should provide authentication context', () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      expect(screen.getByTestId('user-id')).toHaveTextContent('null');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });

    it('should throw error when useAuthContext is used outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuthContext must be used within an AuthProvider');

      console.error = originalError;
    });

    it('should initialize with default state', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-initialized')).toHaveTextContent('true');
      });

      expect(screen.getByTestId('user-id')).toHaveTextContent('null');
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    });
  });

  // ===================================
  // Phase 2: Login and Registration Tests
  // ===================================

  describe('Phase 2: Login and Registration', () => {
    it('should handle successful login', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokenPair
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent(mockUser.id);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', mockLoginCredentials);
      expect(mockApiClient.setTokens).toHaveBeenCalledWith(mockTokenPair);
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      mockApiClient.post.mockResolvedValue({
        success: false,
        error: { message: errorMessage }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Click login button and expect it to handle the error internally
      act(() => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
        expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
      });
    });

    it('should handle successful registration', async () => {
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokenPair
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId('register-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent(mockUser.id);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', mockRegisterData);
      expect(mockApiClient.setTokens).toHaveBeenCalledWith(mockTokenPair);
    });

    it('should handle registration failure', async () => {
      const errorMessage = 'Email already exists';
      mockApiClient.post.mockResolvedValue({
        success: false,
        error: { message: errorMessage }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Click register button and expect it to handle the error internally
      act(() => {
        screen.getByTestId('register-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });
  });

  // ===================================
  // Phase 3: Logout and Session Management Tests
  // ===================================

  describe('Phase 3: Logout and Session Management', () => {
    it('should handle logout successfully', async () => {
      // First login
      mockApiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokenPair
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      // Then logout
      mockApiClient.post.mockResolvedValue({ success: true });

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('null');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      expect(mockApiClient.clearTokens).toHaveBeenCalled();
    });

    it('should handle logout even when API call fails', async () => {
      // First login
      mockApiClient.post.mockResolvedValueOnce({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokenPair
        }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId('login-btn').click();
      });

      // Logout API call fails
      mockApiClient.post.mockRejectedValue(new Error('Network error'));

      await act(async () => {
        screen.getByTestId('logout-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent('null');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      expect(mockApiClient.clearTokens).toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalled();
    });

    it('should clear error when clearError is called', async () => {
      // Cause an error first
      mockApiClient.post.mockResolvedValue({
        success: false,
        error: { message: 'Test error' }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Click login button to cause error
      act(() => {
        screen.getByTestId('login-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Test error');
      });

      // Clear error
      act(() => {
        screen.getByTestId('clear-error-btn').click();
      });

      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  // ===================================
  // Phase 4: Token Refresh and Validation Tests
  // ===================================

  describe('Phase 4: Token Refresh and Validation', () => {
    it('should refresh authentication when tokens exist', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockUser
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent(mockUser.id);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    });

    it('should handle refresh failure and clear tokens', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.get.mockResolvedValue({
        success: false,
        error: { message: 'Token expired' }
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Session expired');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      expect(mockApiClient.clearTokens).toHaveBeenCalled();
    });

    it('should manually refresh authentication', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockUser
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await act(async () => {
        screen.getByTestId('refresh-btn').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-id')).toHaveTextContent(mockUser.id);
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true');
      });

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    });
  });

  // ===================================
  // Phase 5: Initialization and Storage Events Tests
  // ===================================

  describe('Phase 5: Initialization and Storage Events', () => {
    it('should initialize without tokens', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(false);

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('is-initialized')).toHaveTextContent('true');
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });

      expect(mockApiClient.get).not.toHaveBeenCalled();
    });

    it('should handle storage events for multi-tab sync', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate token removal in another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'task_management_access_token',
        newValue: null,
        oldValue: 'old-token'
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      await waitFor(() => {
        expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false');
      });
    });

    it('should handle storage events for token addition', async () => {
      mockApiClient.isAuthenticated.mockReturnValue(true);
      mockApiClient.get.mockResolvedValue({
        success: true,
        data: mockUser
      });

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Simulate token addition in another tab
      const storageEvent = new StorageEvent('storage', {
        key: 'task_management_access_token',
        newValue: 'new-token',
        oldValue: null
      });

      act(() => {
        window.dispatchEvent(storageEvent);
      });

      await waitFor(() => {
        expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      });
    });
  });
});
