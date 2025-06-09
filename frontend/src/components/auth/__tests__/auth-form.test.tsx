/**
 * ===================================
 * Authentication Form Component Tests
 * ===================================
 * Purpose: Comprehensive testing for AuthForm component
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { AuthForm, AuthFormMode, AuthFormProps } from '../auth-form';
import { AuthProvider } from '../../../contexts/auth-context';
import * as useAuthModule from '../../../hooks/use-auth';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock the useAuth hook
const mockUseAuth = {
  login: jest.fn(),
  register: jest.fn(),
  isLoading: false,
  error: null,
  clearError: jest.fn(),
  user: null,
  isAuthenticated: false,
  isInitialized: true
};

jest.spyOn(useAuthModule, 'useAuth').mockReturnValue(mockUseAuth);

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AuthProvider>{children}</AuthProvider>
);

// Helper function to render AuthForm with wrapper
const renderAuthForm = (props: Partial<AuthFormProps> = {}) => {
  const defaultProps: AuthFormProps = {
    mode: 'login',
    showModeToggle: true,
    ...props
  };

  return render(
    <TestWrapper>
      <AuthForm {...defaultProps} />
    </TestWrapper>
  );
};

// ===================================
// Test Suite Setup
// ===================================

describe('AuthForm Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock useAuth to default state
    Object.assign(mockUseAuth, {
      login: jest.fn(),
      register: jest.fn(),
      isLoading: false,
      error: null,
      clearError: jest.fn(),
      user: null,
      isAuthenticated: false,
      isInitialized: true
    });
  });

  // ===================================
  // Phase 1: Basic Rendering Tests
  // ===================================

  describe('Phase 1: Basic Rendering', () => {
    it('should render login form by default', () => {
      renderAuthForm();

      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    });

    it('should render register form when mode is register', () => {
      renderAuthForm({ mode: 'register' });

      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
    });

    it('should render custom title when provided', () => {
      const customTitle = 'Custom Login Title';
      renderAuthForm({ title: customTitle });

      expect(screen.getByRole('heading', { name: customTitle })).toBeInTheDocument();
    });

    it('should apply custom className', () => {
      const customClass = 'custom-auth-form';
      const { container } = renderAuthForm({ className: customClass });

      expect(container.firstChild).toHaveClass('auth-form', customClass);
    });

    it('should hide mode toggle when showModeToggle is false', () => {
      renderAuthForm({ showModeToggle: false });

      expect(screen.queryByText(/don't have an account/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /sign up/i })).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 2: Form Interaction Tests
  // ===================================

  describe('Phase 2: Form Interaction', () => {
    it('should update input values when user types', async () => {
      const user = userEvent.setup();
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput).toHaveValue('test@example.com');
      expect(passwordInput).toHaveValue('password123');
    });

    it('should switch between login and register modes', async () => {
      const user = userEvent.setup();
      const { rerender } = renderAuthForm();

      // Initially in login mode
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();

      // Test mode toggle button functionality
      const toggleButton = screen.getByRole('button', { name: /sign up/i });
      expect(toggleButton).toBeInTheDocument();

      // Re-render with register mode to test prop-based mode change
      rerender(
        <TestWrapper>
          <AuthForm mode="register" showModeToggle={true} />
        </TestWrapper>
      );

      // Check for register mode elements
      expect(screen.getByRole('heading', { name: /sign up/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();

      // Re-render back to login mode
      rerender(
        <TestWrapper>
          <AuthForm mode="login" showModeToggle={true} />
        </TestWrapper>
      );

      // Check that we're back to login mode
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByLabelText(/username/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument();
    });

    it('should clear form data when switching modes', async () => {
      const user = userEvent.setup();
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      // Fill in login form
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // Switch to register mode
      await user.click(screen.getByRole('button', { name: /sign up/i }));

      // Form should be cleared
      expect(screen.getByLabelText(/email address/i)).toHaveValue('');
      expect(screen.getByLabelText(/^password$/i)).toHaveValue('');
    });

    it('should call onModeChange callback when mode changes', async () => {
      const user = userEvent.setup();
      const onModeChange = jest.fn();
      renderAuthForm({ onModeChange });

      await user.click(screen.getByRole('button', { name: /sign up/i }));

      expect(onModeChange).toHaveBeenCalledWith('register');
    });
  });

  // ===================================
  // Phase 3: Validation Tests
  // ===================================

  describe('Phase 3: Validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const user = userEvent.setup();
      renderAuthForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      expect(mockUseAuth.login).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'invalid-email');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid email format/i)).toBeInTheDocument();
      });
    });

    it('should validate password strength in register mode', async () => {
      const user = userEvent.setup();
      renderAuthForm({ mode: 'register' });

      const emailInput = screen.getByLabelText(/email address/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'weak');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password complexity in register mode', async () => {
      const user = userEvent.setup();
      renderAuthForm({ mode: 'register' });

      const emailInput = screen.getByLabelText(/email address/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'simplepassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password must contain uppercase, lowercase, number and special character/i)).toBeInTheDocument();
      });
    });

    it('should validate username format in register mode', async () => {
      const user = userEvent.setup();
      renderAuthForm({ mode: 'register' });

      const usernameInput = screen.getByLabelText(/username/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(usernameInput, 'ab');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate password confirmation in register mode', async () => {
      const user = userEvent.setup();
      renderAuthForm({ mode: 'register' });

      const emailInput = screen.getByLabelText(/email address/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'DifferentPass123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Trigger validation error
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      await user.type(emailInput, 'test');
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 4: Authentication Integration Tests
  // ===================================

  describe('Phase 4: Authentication Integration', () => {
    it('should call login function with correct credentials', async () => {
      const user = userEvent.setup();
      mockUseAuth.login.mockResolvedValue(undefined);
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUseAuth.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should call register function with correct data', async () => {
      const user = userEvent.setup();
      mockUseAuth.register.mockResolvedValue(undefined);
      renderAuthForm({ mode: 'register' });

      const emailInput = screen.getByLabelText(/email address/i);
      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const submitButton = screen.getByRole('button', { name: /sign up/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(usernameInput, 'testuser');
      await user.type(passwordInput, 'ValidPass123!');
      await user.type(confirmPasswordInput, 'ValidPass123!');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUseAuth.register).toHaveBeenCalledWith({
          username: 'testuser',
          email: 'test@example.com',
          password: 'ValidPass123!'
        });
      });
    });

    it('should call onSuccess callback after successful authentication', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      mockUseAuth.login.mockResolvedValue(undefined);
      renderAuthForm({ onSuccess });

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    it('should handle authentication errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Invalid credentials';
      mockUseAuth.login.mockRejectedValue(new Error(errorMessage));
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should display auth context errors', () => {
      const errorMessage = 'Network error';
      Object.assign(mockUseAuth, { error: errorMessage });
      renderAuthForm();

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 5: Loading States and Accessibility Tests
  // ===================================

  describe('Phase 5: Loading States and Accessibility', () => {
    it('should show loading state during authentication', () => {
      Object.assign(mockUseAuth, { isLoading: true });
      renderAuthForm();

      const submitButton = screen.getByRole('button', { name: /signing in/i });
      expect(submitButton).toBeDisabled();
      expect(screen.getByText(/signing in, please wait/i)).toBeInTheDocument();
    });

    it('should disable form inputs during loading', () => {
      Object.assign(mockUseAuth, { isLoading: true });
      renderAuthForm();

      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    });

    it('should have proper ARIA attributes for accessibility', () => {
      renderAuthForm();

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('autoComplete', 'email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autoComplete', 'current-password');
    });

    it('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      renderAuthForm();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email address/i);
        const emailError = screen.getByText(/email is required/i);
        
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
        expect(emailError).toHaveAttribute('id', 'email-error');
        expect(emailError).toHaveAttribute('role', 'alert');
      });
    });

    it('should have proper form validation attributes', () => {
      renderAuthForm();

      const form = screen.getByRole('form');
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(form).toHaveAttribute('noValidate');
      expect(emailInput).toHaveAttribute('required');
      expect(passwordInput).toHaveAttribute('required');
    });
  });
});
