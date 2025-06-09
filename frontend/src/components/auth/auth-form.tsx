/**
 * ===================================
 * Authentication Form Component Implementation
 * ===================================
 * Purpose: Unified login and registration form component
 * Features:
 * - Login and registration form modes
 * - Real-time validation and error handling
 * - Responsive design and accessibility
 * - Integration with authentication hooks
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';
import { LoginCredentials, RegisterData } from '../../contexts/auth-context';

// ===================================
// Authentication Form Types
// ===================================

/**
 * Form mode type
 */
export type AuthFormMode = 'login' | 'register';

/**
 * Form data interface
 */
export interface AuthFormData {
  email: string;
  password: string;
  username?: string;
  confirmPassword?: string;
}

/**
 * Validation errors interface
 */
export interface ValidationErrors {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * Auth form props interface
 */
export interface AuthFormProps {
  mode?: AuthFormMode;
  onSuccess?: () => void;
  onModeChange?: (mode: AuthFormMode) => void;
  className?: string;
  title?: string;
  showModeToggle?: boolean;
}

// ===================================
// Validation Utilities
// ===================================

/**
 * Email validation pattern
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation pattern (strong password)
 */
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;

/**
 * Username validation pattern
 */
const USERNAME_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Validate form data
 */
const validateFormData = (data: AuthFormData, mode: AuthFormMode): ValidationErrors => {
  const errors: ValidationErrors = {};

  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!EMAIL_PATTERN.test(data.email)) {
    errors.email = 'Invalid email format';
  }

  // Password validation
  if (!data.password) {
    errors.password = 'Password is required';
  } else if (mode === 'register') {
    if (data.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!PASSWORD_PATTERN.test(data.password)) {
      errors.password = 'Password must contain uppercase, lowercase, number and special character';
    }
  }

  // Username validation (register mode only)
  if (mode === 'register') {
    if (!data.username) {
      errors.username = 'Username is required';
    } else if (data.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    } else if (data.username.length > 50) {
      errors.username = 'Username must not exceed 50 characters';
    } else if (!USERNAME_PATTERN.test(data.username)) {
      errors.username = 'Username can only contain letters, numbers, underscore and hyphen';
    }

    // Confirm password validation
    if (!data.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
  }

  return errors;
};

// ===================================
// Authentication Form Component
// ===================================

export const AuthForm: React.FC<AuthFormProps> = ({
  mode = 'login',
  onSuccess,
  onModeChange,
  className = '',
  title,
  showModeToggle = true
}) => {
  // ===================================
  // State Management
  // ===================================

  const [currentMode, setCurrentMode] = useState<AuthFormMode>(mode);
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    username: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Authentication hook
  const { login, register, isLoading, error, clearError } = useAuth();

  // ===================================
  // Form Handlers
  // ===================================

  /**
   * Handle input change
   */
  const handleInputChange = useCallback((field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear general error
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: undefined
      }));
    }
  }, [errors]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Clear previous errors
    setErrors({});
    clearError();

    // Validate form
    const validationErrors = validateFormData(formData, currentMode);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      if (currentMode === 'login') {
        const credentials: LoginCredentials = {
          email: formData.email,
          password: formData.password
        };
        await login(credentials);
      } else {
        const registerData: RegisterData = {
          username: formData.username!,
          email: formData.email,
          password: formData.password
        };
        await register(registerData);
      }

      // Call success callback
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error is handled by auth context and displayed via error prop
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'Authentication failed'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, currentMode, login, register, clearError, onSuccess]);

  /**
   * Handle mode change
   */
  const handleModeChange = useCallback((newMode: AuthFormMode) => {
    setCurrentMode(newMode);
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
    setErrors({});
    clearError();

    if (onModeChange) {
      onModeChange(newMode);
    }
  }, [clearError, onModeChange]);

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setFormData({
      email: '',
      password: '',
      username: '',
      confirmPassword: ''
    });
    setErrors({});
    clearError();
  }, [clearError]);

  // ===================================
  // Effects
  // ===================================

  /**
   * Update mode when prop changes
   */
  useEffect(() => {
    if (mode !== currentMode) {
      handleModeChange(mode);
    }
  }, [mode, currentMode, handleModeChange]);

  /**
   * Handle auth context errors
   */
  useEffect(() => {
    if (error) {
      setErrors(prev => ({
        ...prev,
        general: error
      }));
    }
  }, [error]);

  // ===================================
  // Render Helpers
  // ===================================

  const isFormLoading = isLoading || isSubmitting;
  const formTitle = title || (currentMode === 'login' ? 'Sign In' : 'Sign Up');

  return (
    <div className={`auth-form ${className}`}>
      <div className="auth-form__container">
        {/* Form Header */}
        <div className="auth-form__header">
          <h2 className="auth-form__title">{formTitle}</h2>
        </div>

        {/* Form */}
        <form className="auth-form__form" onSubmit={handleSubmit} noValidate role="form">
          {/* Email Field */}
          <div className="auth-form__field">
            <label htmlFor="email" className="auth-form__label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`auth-form__input ${errors.email ? 'auth-form__input--error' : ''}`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isFormLoading}
              required
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <div id="email-error" className="auth-form__error" role="alert">
                {errors.email}
              </div>
            )}
          </div>

          {/* Username Field (Register only) */}
          {currentMode === 'register' && (
            <div className="auth-form__field">
              <label htmlFor="username" className="auth-form__label">
                Username
              </label>
              <input
                id="username"
                type="text"
                className={`auth-form__input ${errors.username ? 'auth-form__input--error' : ''}`}
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                disabled={isFormLoading}
                required
                aria-describedby={errors.username ? 'username-error' : undefined}
                autoComplete="username"
              />
              {errors.username && (
                <div id="username-error" className="auth-form__error" role="alert">
                  {errors.username}
                </div>
              )}
            </div>
          )}

          {/* Password Field */}
          <div className="auth-form__field">
            <label htmlFor="password" className="auth-form__label">
              Password
            </label>
            <input
              id="password"
              type="password"
              className={`auth-form__input ${errors.password ? 'auth-form__input--error' : ''}`}
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              disabled={isFormLoading}
              required
              aria-describedby={errors.password ? 'password-error' : undefined}
              autoComplete={currentMode === 'login' ? 'current-password' : 'new-password'}
            />
            {errors.password && (
              <div id="password-error" className="auth-form__error" role="alert">
                {errors.password}
              </div>
            )}
          </div>

          {/* Confirm Password Field (Register only) */}
          {currentMode === 'register' && (
            <div className="auth-form__field">
              <label htmlFor="confirmPassword" className="auth-form__label">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`auth-form__input ${errors.confirmPassword ? 'auth-form__input--error' : ''}`}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                disabled={isFormLoading}
                required
                aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div id="confirm-password-error" className="auth-form__error" role="alert">
                  {errors.confirmPassword}
                </div>
              )}
            </div>
          )}

          {/* General Error */}
          {errors.general && (
            <div className="auth-form__error auth-form__error--general" role="alert">
              {errors.general}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-form__submit"
            disabled={isFormLoading}
            aria-describedby={isFormLoading ? 'loading-status' : undefined}
          >
            {isFormLoading ? (
              <>
                <span className="auth-form__spinner" aria-hidden="true"></span>
                {currentMode === 'login' ? 'Signing In...' : 'Signing Up...'}
              </>
            ) : (
              currentMode === 'login' ? 'Sign In' : 'Sign Up'
            )}
          </button>

          {/* Loading Status (for screen readers) */}
          {isFormLoading && (
            <div id="loading-status" className="sr-only" aria-live="polite">
              {currentMode === 'login' ? 'Signing in, please wait...' : 'Signing up, please wait...'}
            </div>
          )}
        </form>

        {/* Mode Toggle */}
        {showModeToggle && (
          <div className="auth-form__toggle">
            <p className="auth-form__toggle-text">
              {currentMode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              <button
                type="button"
                className="auth-form__toggle-button"
                onClick={() => handleModeChange(currentMode === 'login' ? 'register' : 'login')}
                disabled={isFormLoading}
              >
                {currentMode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Export default component
export default AuthForm;
