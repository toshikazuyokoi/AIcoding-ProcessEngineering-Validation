/**
 * ===================================
 * Login Screen Integration Test (Simplified)
 * ===================================
 * Generated for TSK-IT-003-001-AuthUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test login screen UI components integration and flow
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/auth-context';
import AuthForm from '../../../src/components/auth/auth-form';

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
    test('should display login form elements', async () => {
      renderLoginScreen();

      // Verify login form is displayed
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    test('should handle form submission', async () => {
      const user = userEvent.setup();
      mockUseAuth.login.mockResolvedValue(undefined);

      renderLoginScreen();

      // Fill in login credentials
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Submit login form
      await user.click(loginButton);

      // Verify login function is called
      await waitFor(() => {
        expect(mockUseAuth.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    test('should display validation errors for empty fields', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Try to submit empty form
      const loginButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(loginButton);

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Verify login function is not called
      expect(mockUseAuth.login).not.toHaveBeenCalled();
    });

    test('should display error message on login failure', async () => {
      const user = userEvent.setup();
      mockUseAuth.error = 'Invalid credentials';

      renderLoginScreen();

      // Fill in credentials
      await user.type(screen.getByLabelText(/email address/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');

      // Verify error message is displayed
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  describe('IT-AUTH-UI-005: フォーム切替結合テスト', () => {
    test('should switch to registration form', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Verify login form is displayed
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();

      // Click switch to register link
      const switchLink = screen.getByText(/sign up/i);
      await user.click(switchLink);

      // Verify registration form is displayed
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      });
    });
  });

  describe('Loading States and UI Feedback', () => {
    test('should show loading state during login', async () => {
      const user = userEvent.setup();
      mockUseAuth.isLoading = true;

      renderLoginScreen();

      // Verify loading state
      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
    });

    test('should handle form validation errors', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Verify login function is not called
      expect(mockUseAuth.login).not.toHaveBeenCalled();
    });

    test('should validate email format', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Enter invalid email
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'invalid-email');
      await user.click(screen.getByRole('button', { name: /sign in/i }));

      // Verify email validation error
      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and UX', () => {
    test('should have proper form labels and accessibility attributes', () => {
      renderLoginScreen();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Check that inputs have proper labels
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Check form has proper role
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Tab through form elements
      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();

      await user.tab();
      expect(submitButton).toHaveFocus();
    });
  });

  describe('Form State Management', () => {
    test('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      // Trigger validation error
      await user.click(screen.getByRole('button', { name: /sign in/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing in email field
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test');

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
      });
    });

    test('should maintain form data during interaction', async () => {
      const user = userEvent.setup();
      renderLoginScreen();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/password/i);

      // Type in form fields
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Verify values are maintained
      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });
  });

  describe('Error Handling Integration', () => {
    test('should display server error messages', () => {
      mockUseAuth.error = 'Server error occurred';
      renderLoginScreen();

      // Verify error message is displayed
      expect(screen.getByText(/server error occurred/i)).toBeInTheDocument();
    });

    test('should clear errors when clearError is called', async () => {
      const user = userEvent.setup();
      mockUseAuth.error = 'Some error';
      
      renderLoginScreen();

      // Verify error is displayed
      expect(screen.getByText(/some error/i)).toBeInTheDocument();

      // Start typing to trigger error clearing
      const emailInput = screen.getByLabelText(/email address/i);
      await user.type(emailInput, 'test');

      // Verify clearError was called
      expect(mockUseAuth.clearError).toHaveBeenCalled();
    });
  });
});
