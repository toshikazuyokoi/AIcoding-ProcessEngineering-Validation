/**
 * ===================================
 * Auth Validation Integration Test
 * ===================================
 * Generated for TSK-IT-003-001-AuthUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test authentication validation UI components integration and flow
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

describe('Auth Validation Integration Tests', () => {
  const renderAuthForm = (mode = 'login') => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <AuthForm mode={mode} />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockClear();
  });

  describe('IT-AUTH-UI-002: バリデーションエラー表示結合テスト', () => {
    test('should display real-time email validation', async () => {
      const user = userEvent.setup();
      renderAuthForm('login');

      const emailInput = screen.getByLabelText(/email/i);

      // Test invalid email formats
      const invalidEmails = [
        'invalid',
        'invalid@',
        '@invalid.com',
        'invalid@invalid',
        'invalid.email',
        'invalid@.com'
      ];

      for (const invalidEmail of invalidEmails) {
        await user.clear(emailInput);
        await user.type(emailInput, invalidEmail);
        await user.tab(); // Trigger blur event

        await waitFor(() => {
          expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
        });
      }

      // Test valid email
      await user.clear(emailInput);
      await user.type(emailInput, 'valid@example.com');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/please enter a valid email/i)).not.toBeInTheDocument();
      });
    });

    test('should display password validation errors', async () => {
      const user = userEvent.setup();
      renderAuthForm('register');

      const passwordInput = screen.getByLabelText(/password/i);

      // Test empty password
      await user.click(passwordInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Test short password
      await user.type(passwordInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });

      // Test password without uppercase
      await user.clear(passwordInput);
      await user.type(passwordInput, 'password123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one uppercase letter/i)).toBeInTheDocument();
      });

      // Test password without lowercase
      await user.clear(passwordInput);
      await user.type(passwordInput, 'PASSWORD123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one lowercase letter/i)).toBeInTheDocument();
      });

      // Test password without number
      await user.clear(passwordInput);
      await user.type(passwordInput, 'Password');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/password must contain at least one number/i)).toBeInTheDocument();
      });

      // Test valid password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'ValidPassword123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/password must/i)).not.toBeInTheDocument();
      });
    });

    test('should display username validation for registration', async () => {
      const user = userEvent.setup();
      renderAuthForm('register');

      const usernameInput = screen.getByLabelText(/username/i);

      // Test empty username
      await user.click(usernameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });

      // Test short username
      await user.type(usernameInput, 'ab');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/username must be at least 3 characters/i)).toBeInTheDocument();
      });

      // Test username with special characters
      await user.clear(usernameInput);
      await user.type(usernameInput, 'user@name');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/username can only contain letters, numbers, and underscores/i)).toBeInTheDocument();
      });

      // Test valid username
      await user.clear(usernameInput);
      await user.type(usernameInput, 'valid_username123');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/username/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Server-side Validation Integration', () => {
    test('should display server validation errors for login', async () => {
      const user = userEvent.setup();
      
      // Mock server validation error
      apiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: {
              email: 'User not found',
              password: 'Invalid password'
            }
          }
        }
      });

      renderAuthForm('login');

      await user.type(screen.getByLabelText(/email/i), 'nonexistent@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify server validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/user not found/i)).toBeInTheDocument();
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
      });
    });

    test('should display server validation errors for registration', async () => {
      const user = userEvent.setup();
      
      // Mock server validation error
      apiClient.post.mockRejectedValue({
        response: {
          status: 400,
          data: {
            errors: {
              username: 'Username already taken',
              email: 'Email already registered'
            }
          }
        }
      });

      renderAuthForm('register');

      await user.type(screen.getByLabelText(/username/i), 'existinguser');
      await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
      await user.type(screen.getByLabelText(/password/i), 'Password123!');
      await user.click(screen.getByLabelText(/i accept the terms and conditions/i));
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify server validation errors are displayed
      await waitFor(() => {
        expect(screen.getByText(/username already taken/i)).toBeInTheDocument();
        expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
      });
    });

    test('should clear server errors when form is modified', async () => {
      const user = userEvent.setup();
      
      // Mock server error first
      apiClient.post.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            message: 'Invalid credentials'
          }
        }
      });

      renderAuthForm('login');

      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });

      // Modify form
      await user.type(screen.getByLabelText(/email/i), 'updated');

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/invalid credentials/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Form Validation State Management', () => {
    test('should prevent submission with validation errors', async () => {
      const user = userEvent.setup();
      renderAuthForm('login');

      // Try to submit with empty fields
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify validation errors prevent submission
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Verify API was not called
      expect(apiClient.post).not.toHaveBeenCalled();
    });

    test('should enable submission when all validations pass', async () => {
      const user = userEvent.setup();
      
      apiClient.post.mockResolvedValue({
        success: true,
        data: {
          user: { id: '1', email: 'test@example.com' },
          tokens: { accessToken: 'token', refreshToken: 'refresh' }
        }
      });

      renderAuthForm('login');

      // Fill valid data
      await user.type(screen.getByLabelText(/email/i), 'test@example.com');
      await user.type(screen.getByLabelText(/password/i), 'ValidPassword123!');

      // Submit form
      await user.click(screen.getByRole('button', { name: /login/i }));

      // Verify API was called
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
          email: 'test@example.com',
          password: 'ValidPassword123!'
        });
      });
    });

    test('should show validation summary for multiple errors', async () => {
      const user = userEvent.setup();
      renderAuthForm('register');

      // Submit form with multiple validation errors
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify all validation errors are shown
      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
        expect(screen.getByText(/you must accept the terms and conditions/i)).toBeInTheDocument();
      });

      // Verify error count or summary
      const errorElements = screen.getAllByText(/is required|must accept/i);
      expect(errorElements).toHaveLength(4);
    });
  });

  describe('Accessibility and UX Integration', () => {
    test('should associate error messages with form fields', async () => {
      const user = userEvent.setup();
      renderAuthForm('login');

      // Trigger validation errors
      await user.click(screen.getByRole('button', { name: /login/i }));

      await waitFor(() => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        // Check aria-describedby attributes
        expect(emailInput).toHaveAttribute('aria-describedby');
        expect(passwordInput).toHaveAttribute('aria-describedby');

        // Check aria-invalid attributes
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      });
    });

    test('should focus first error field on submission', async () => {
      const user = userEvent.setup();
      renderAuthForm('register');

      // Submit empty form
      await user.click(screen.getByRole('button', { name: /register/i }));

      // Verify first error field (username) receives focus
      await waitFor(() => {
        expect(screen.getByLabelText(/username/i)).toHaveFocus();
      });
    });

    test('should provide live validation feedback', async () => {
      const user = userEvent.setup();
      renderAuthForm('register');

      const passwordInput = screen.getByLabelText(/password/i);

      // Type invalid password
      await user.type(passwordInput, 'weak');

      // Verify live feedback without form submission
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });

      // Continue typing to make it valid
      await user.type(passwordInput, 'Password123!');

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/password must be at least 8 characters/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Cross-field Validation', () => {
    test('should validate password confirmation match', async () => {
      const user = userEvent.setup();
      renderAuthForm('register');

      // Assume password confirmation field exists
      const passwordInput = screen.getByLabelText(/^password$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);

      await user.type(passwordInput, 'Password123!');
      await user.type(confirmPasswordInput, 'DifferentPassword123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Fix the confirmation
      await user.clear(confirmPasswordInput);
      await user.type(confirmPasswordInput, 'Password123!');
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
      });
    });

    test('should validate email uniqueness on blur', async () => {
      const user = userEvent.setup();
      
      // Mock email check API
      apiClient.post.mockResolvedValue({
        success: false,
        data: {
          available: false
        }
      });

      renderAuthForm('register');

      const emailInput = screen.getByLabelText(/email/i);

      await user.type(emailInput, 'existing@example.com');
      await user.tab();

      // Verify email availability check
      await waitFor(() => {
        expect(apiClient.post).toHaveBeenCalledWith('/auth/check-email', {
          email: 'existing@example.com'
        });
      });

      await waitFor(() => {
        expect(screen.getByText(/email is already registered/i)).toBeInTheDocument();
      });
    });
  });
});
