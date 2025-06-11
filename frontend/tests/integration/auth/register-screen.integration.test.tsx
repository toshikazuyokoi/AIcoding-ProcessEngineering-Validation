/**
 * ===================================
 * Register Screen Integration Test
 * ===================================
 * Generated for TSK-IT-003-001-AuthUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test registration screen UI components integration and flow
 */

import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/AuthContext';
import AuthForm from '../../../src/components/auth/AuthForm';
import { apiClient } from '../../../src/services/api';

// Mock API client
jest.mock('../../../src/services/api', () => ({
  apiClient: {
    post: jest.fn(),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
  }
}));

// Mock router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Register Screen Integration Tests', () => {
  const mockUser = {
    id: 'user-1',
    email: 'newuser@example.com',
    username: 'newuser',
    role: 'user'
  };

  const mockTokens = {
    accessToken: 'mock-access-token',
    refreshToken: 'mock-refresh-token'
  };

  const renderRegisterScreen = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode="register" />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('IT-AUTH-UI-003: 登録画面フロー結合テスト', () => {
    test('should complete successful registration flow', async () => {
      const user = userEvent.setup();
      
      // Mock successful API response
      apiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens
        }
      });

      renderRegisterScreen();

      // Step 1: Verify registration form is displayed
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();

      // Step 2: Fill in registration data
      const usernameInput = screen.getByLabelText(/username/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const registerButton = screen.getByRole('button', { name: /register/i });

      await user.type(usernameInput, 'newuser');
      await user.type(emailInput, 'newuser@example.com');
      await user.type(passwordInput, 'NewPassword123!');

      // Step 3: Submit registration form
      await user.click(registerButton);

      // Step 4: Verify API call
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'NewPassword123!'
        });
      });

      // Step 5: Verify tokens are set
      expect(apiClient.setTokens).toHaveBeenCalledWith(mockTokens);

      // Step 6: Verify navigation to dashboard
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    test('should handle registration failure with error display', async () => {
      const user = userEvent.setup();
      
      // Mock failed API response
      apiClient.post.mockRejectedValue({
        response: {
          data: {
            message: 'Email already exists'
          }
        }
      });

      renderRegisterScreen();

      // Fill in registration data
      await user.type(screen.getByLabelText(/username/i), 'existinguser');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
      });

      // Verify no navigation occurred
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(apiClient.setTokens).not.toHaveBeenCalled();
    });

    test('should handle validation errors', async () => {
      const user = userEvent.setup();
      
      // Mock validation error response
      apiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: {
              username: 'Username must be at least 3 characters',
              email: 'Invalid email format',
              password: 'Password must contain uppercase, lowercase, number and special character'
            }
          }
        }
      });

      renderRegisterScreen();

      // Fill in invalid data
      await user.type(screen.getByLabelText(/username/i), 'ab');
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.type(screen.getByLabelText(/password/i), 'weak');
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify validation error messages
      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
        expect(screen.getByText(/password must contain uppercase/i)).toBeInTheDocument();
      });
    });
  });

  describe('Registration Form Validation', () => {
    test('should validate required fields', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Verify API is not called
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Enter invalid email
      await user.type(screen.getByLabelText(/email/i), 'invalid-email');
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify email validation error
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    test('should validate password strength', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Enter weak password
      await user.type(screen.getByLabelText(/password/i), '123');
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify password validation error
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    test('should validate username length', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Enter short username
      await user.type(screen.getByLabelText(/username/i), 'ab');
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify username validation error
      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('Password Strength Indicator', () => {
    test('should show password strength indicator', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      const passwordInput = screen.getByLabelText(/password/i);

      // Test weak password
      await user.type(passwordInput, '123');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      // Clear and test medium password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Password123');
      expect(screen.getByText(/medium/i)).toBeInTheDocument();

      // Clear and test strong password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'StrongPassword123!');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });

    test('should update strength indicator in real-time', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      const passwordInput = screen.getByLabelText(/password/i);

      // Type password character by character
      await user.type(passwordInput, '1');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      await user.type(passwordInput, '23abc');
      expect(screen.getByText(/weak/i)).toBeInTheDocument();

      await user.type(passwordInput, 'ABC');
      expect(screen.getByText(/medium/i)).toBeInTheDocument();

      await user.type(passwordInput, '!@#');
      expect(screen.getByText(/strong/i)).toBeInTheDocument();
    });
  });

  describe('Terms and Conditions', () => {
    test('should require terms acceptance', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Fill in valid data but don't accept terms
      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');

      // Try to submit without accepting terms
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify terms acceptance error
      await waitFor(() => {
        expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
      });

      // Verify API is not called
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('should allow registration after accepting terms', async () => {
      const user = userEvent.setup();
      
      apiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens
        }
      });

      renderRegisterScreen();

      // Fill in data and accept terms
      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByLabelText(/i accept the terms and conditions/i));

      // Submit form
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify API is called
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/register', {
          username: 'newuser',
          email: 'newuser@example.com',
          password: 'Password123!'
        });
      });
    });
  });

  describe('Loading States and UI Feedback', () => {
    test('should show loading state during registration', async () => {
      const user = userEvent.setup();
      
      // Mock delayed API response
      let resolveRegister;
      const registerPromise = new Promise((resolve) => {
        resolveRegister = resolve;
      });
      apiClient.post.mockReturnValue(registerPromise);

      renderRegisterScreen();

      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByLabelText(/i accept the terms and conditions/i));
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify loading state
      expect(screen.getByRole('button', { name: /registering/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /registering/i })).toBeDisabled();

      // Resolve the promise
      resolveRegister({
        success: true,
        data: {
          user: mockUser,
          tokens: mockTokens
        }
      });

      // Verify loading state is cleared
      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /registering/i })).not.toBeInTheDocument();
      });
    });

    test('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      
      // Mock network error
      apiClient.post.mockRejectedValue(new Error('Network Error'));

      renderRegisterScreen();

      await user.type(screen.getByLabelText(/username/i), 'newuser');
      await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByLabelText(/i accept the terms and conditions/i));
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify generic error message
      await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Switching Integration', () => {
    test('should switch to login form', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Verify registration form is displayed
      expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();

      // Click switch to login link
      const switchLink = screen.getByText(/already have an account/i);
      await user.click(switchLink);

      // Verify login form is displayed
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });

    test('should clear form data when switching', async () => {
      const user = userEvent.setup();
      renderRegisterScreen();

      // Fill in some data
      await user.type(screen.getByLabelText(/username/i), 'testuser');
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');

      // Switch to login and back
      await user.click(screen.getByText(/already have an account/i));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
      });

      await user.click(screen.getByText(/don't have an account/i));
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
      });

      // Verify form fields are cleared
      expect(screen.getByLabelText(/username/i)).toHaveValue('');
      expect(screen.getByLabelText(/email/i)).toHaveValue('');
    });
  });
});
