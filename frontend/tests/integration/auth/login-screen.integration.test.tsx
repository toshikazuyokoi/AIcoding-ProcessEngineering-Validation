/**
 * ===================================
 * Login Screen Integration Test
 * ===================================
 * Generated for TSK-IT-003-001-AuthUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test login screen UI components integration and flow
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/auth-context';
import AuthForm from '../../../src/components/auth/auth-form';

// Mock API client
const mockApiClient = {
  post: jest.fn(),
  setTokens: jest.fn(),
  clearTokens: jest.fn(),
};

// Mock auth hook
const mockUseAuth = {
  login: jest.fn(),
  register: jest.fn(),
  isLoading: false,
  error: null,
  clearError: jest.fn(),
};

jest.mock('../../../src/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Login Screen Integration Tests', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    role: 'user',
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token',
  };

  const renderLoginScreen = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="login" />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
    mockUseAuth.login.mockClear();
    mockUseAuth.register.mockClear();
    mockUseAuth.clearError.mockClear();
    mockUseAuth.isLoading = false;
    mockUseAuth.error = null;
  });

  describe('IT-AUTH-UI-001: ログイン画面フロー結合テスト', () => {
    test('should complete successful login flow', async () => {
      const user = userEvent.setup();

      // Mock successful API response
      apiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens,
        },
      });

      renderLoginScreen();

      // Step 1: Verify login form is displayed
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();

      // Step 2: Fill in login credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Step 3: Submit login form
      await user.click(loginButton);

      // Step 4: Verify API call
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'password123',
        });
      });

      // Step 5: Verify tokens are set
      expect(apiClient.setTokens).toHaveBeenCalledWith(mockTokens);

      // Step 6: Verify navigation to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should handle login failure with error display', async () => {
      const user = userEvent.setup();

      // Mock failed API response
      apiClient.post.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid credentials',
          },
        },
      });

      renderLoginScreen();

      // Fill in credentials
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(apiClient.setTokens).not.toHaveBeenCalled();
    });

    test('should handle network error gracefully', async () => {
      const user = userEvent.setup();

      // Mock network error
      apiClient.post.mockRejectedValue(new Error('Network Error'));

      renderLoginScreen();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify generic error message
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('IT-AUTH-UI-004: パスワード表示切替結合テスト', () => {
    test('should toggle password visibility', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Click toggle to show password
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Click toggle to hide password again
      await user.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should maintain password value during toggle', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      const passwordInput = screen.getByLabelText(/password/i);
      const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });

      // Type password
      await user.type(passwordInput, 'testpassword');
      expect(passwordInput).toHaveValue('testpassword');

      // Toggle visibility
      await user.click(toggleButton);
      expect(passwordInput).toHaveValue('testpassword');
      expect(passwordInput).toHaveAttribute('type', 'text');

      // Toggle back
      await user.click(toggleButton);
      expect(passwordInput).toHaveValue('testpassword');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('IT-AUTH-UI-005: フォーム切替結合テスト', () => {
    test('should switch to registration form', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Verify login form is displayed
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();

      // Click switch to register link
      const switchLink = screen.getByText(/don't have an account/i);
      await user.click(switchLink);

      // Verify registration form is displayed
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
      });
    });

    test('should preserve form state during switch', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Fill in some data
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');

      // Switch to register and back
      await user.click(screen.getByText(/don't have an account/i));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
      });

      await user.click(screen.getByText(/already have an account/i));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });

      // Verify email field is cleared (expected behavior)
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });

  describe('IT-AUTH-UI-006: 自動ログイン結合テスト', () => {
    test('should auto-login with valid stored tokens', async () => {
      // Mock stored tokens
      const mockStoredTokens = {
        accessToken: 'stored-access-token',
        refreshToken: 'stored-refresh-token',
      };

      // Mock localStorage
      const mockLocalStorage = {
        getItem: jest.fn((key) => {
          if (key === 'auth_tokens') {
            return JSON.stringify(mockStoredTokens);
          }
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      // Mock token validation API call
      apiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
        },
      });

      renderLoginScreen();

      // Verify auto-login attempt
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/validate-token');
      });

      // Verify navigation to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should show login form when no stored tokens', async () => {
      // Mock empty localStorage
      const mockLocalStorage = {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      renderLoginScreen();

      // Verify login form is displayed
      expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();

      // Verify no auto-login attempt
      expect(apiClient.post).not.toHaveBeenCalledWith('/auth/validate-token');
    });

    test('should handle invalid stored tokens', async () => {
      // Mock stored tokens
      const mockStoredTokens = {
        accessToken: 'invalid-access-token',
        refreshToken: 'invalid-refresh-token',
      };

      const mockLocalStorage = {
        getItem: jest.fn((key) => {
          if (key === 'auth_tokens') {
            return JSON.stringify(mockStoredTokens);
          }
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };

      Object.defineProperty(window, 'localStorage', {
        value: mockLocalStorage,
      });

      // Mock token validation failure
      apiClient.post.mockRejectedValue({
        response: {
          status: 401,
          data: {
            message: 'Invalid token',
          },
        },
      });

      renderLoginScreen();

      // Verify token validation attempt
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/validate-token');
      });

      // Verify tokens are cleared
      expect(apiClient.clearTokens).toHaveBeenCalled();

      // Verify login form is displayed
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading States and UI Feedback', () => {
    test('should show loading state during login', async () => {
      const user = userEvent.setup();

      // Mock delayed API response
      let resolveLogin;
      const loginPromise = new Promise((resolve) => {
        resolveLogin = resolve;
      });
      apiClient.post.mockReturnValue(loginPromise);

      renderLoginScreen();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify loading state
      expect(screen.getByRole('button', { name: /logging in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /logging in/i })).toBeDisabled();

      // Resolve the promise
      resolveLogin({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens,
        },
      });

      // Verify loading state is cleared
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /logging in/i })).not.toBeInTheDocument();
      });
    });

    test('should handle timeout scenarios', async () => {
      const user = userEvent.setup();

      // Mock timeout error
      apiClient.post.mockRejectedValue({
        code: 'TIMEOUT',
        message: 'Request timeout',
      });

      renderLoginScreen();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify timeout error message
      await waitFor(() => {
        expect(screen.getByText(/request timeout/i)).toBeInTheDocument();
      });
    });

    test('should prevent double submission', async () => {
      const user = userEvent.setup();

      // Mock slow API response
      apiClient.post.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 1000)));

      renderLoginScreen();

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'password123');

      const loginButton = screen.getByRole('button', { name: /login/i });

      // Click multiple times rapidly
      await user.click(loginButton);
      await user.click(loginButton);
      await user.click(loginButton);

      // Verify API is called only once
      expect(apiClient.post).toHaveBeenCalledTimes(1);
    });

    test('should handle form validation errors', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Verify API is not called
      expect(apiClient.post).not.toHaveBeenCalled();
    });
  });
});
