/**
 * ===================================
 * User Profile Component Test Suite
 * ===================================
 * Purpose: Comprehensive testing for UserProfile component
 * Features:
 * - Component rendering tests
 * - Form validation tests
 * - User interaction tests
 * - Security tests
 * - Integration tests
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * TSK-R2-002-CMP-UserProfile
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../user-profile';

// ===================================
// Mock Dependencies
// ===================================

// Mock useAuth hook
const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER' as const,
  isActive: true,
  settings: {
    emailNotifications: true,
    language: 'ja' as const
  }
};

const mockUseAuth = {
  user: mockUser,
  isAuthenticated: true,
  isLoading: false,
  error: null,
  isInitialized: true,
  updateProfile: jest.fn(),
  changePassword: jest.fn(),
  updateSettings: jest.fn(),
  deleteAccount: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
  checkAuthStatus: jest.fn()
};

jest.mock('../../../hooks/use-auth', () => ({
  useAuth: () => mockUseAuth
}));

// ===================================
// Test Data
// ===================================

const mockProfileData = {
  username: 'newusername',
  email: 'newemail@example.com'
};

const mockPasswordData = {
  currentPassword: 'currentpass123',
  newPassword: 'NewPass123!',
  confirmPassword: 'NewPass123!'
};

const mockSettingsData = {
  emailNotifications: false,
  language: 'en' as const
};

// ===================================
// Test Utilities
// ===================================

const renderUserProfile = (props = {}) => {
  const defaultProps = {
    testId: 'user-profile'
  };

  return render(<UserProfile {...defaultProps} {...props} />);
};

// ===================================
// Test Suite
// ===================================

describe('UserProfile Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuth.user = mockUser;
    mockUseAuth.isAuthenticated = true;
    mockUseAuth.updateProfile.mockResolvedValue(undefined);
    mockUseAuth.changePassword.mockResolvedValue(undefined);
    mockUseAuth.updateSettings.mockResolvedValue(undefined);
    mockUseAuth.deleteAccount.mockResolvedValue(undefined);
  });

  // ===================================
  // Rendering Tests
  // ===================================

  describe('Rendering', () => {
    test('should render user profile with all sections', () => {
      renderUserProfile();

      expect(screen.getByTestId('user-profile')).toBeInTheDocument();
      expect(screen.getByText('ユーザー設定')).toBeInTheDocument();
      expect(screen.getByText('基本情報設定')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'パスワード変更' })).toBeInTheDocument();
      expect(screen.getByText('アカウント設定')).toBeInTheDocument();
      expect(screen.getByText('危険な操作')).toBeInTheDocument();
    });

    test('should render profile form with current user data', () => {
      renderUserProfile();
      
      expect(screen.getByTestId('user-profile-username')).toHaveValue('testuser');
      expect(screen.getByTestId('user-profile-email')).toHaveValue('test@example.com');
    });

    test('should render settings form with current user settings', () => {
      renderUserProfile();
      
      expect(screen.getByTestId('user-profile-email-notifications')).toBeChecked();
      expect(screen.getByTestId('user-profile-language')).toHaveValue('ja');
    });

    test('should render password form with empty fields', () => {
      renderUserProfile();
      
      expect(screen.getByTestId('user-profile-current-password')).toHaveValue('');
      expect(screen.getByTestId('user-profile-new-password')).toHaveValue('');
      expect(screen.getByTestId('user-profile-confirm-password')).toHaveValue('');
    });

    test('should render unauthorized message when not authenticated', () => {
      mockUseAuth.isAuthenticated = false;
      
      renderUserProfile();
      
      expect(screen.getByTestId('user-profile-unauthorized')).toBeInTheDocument();
      expect(screen.getByText('ユーザー設定を表示するにはログインが必要です')).toBeInTheDocument();
    });

    test('should render all form buttons', () => {
      renderUserProfile();
      
      expect(screen.getByTestId('user-profile-profile-submit')).toBeInTheDocument();
      expect(screen.getByTestId('user-profile-password-submit')).toBeInTheDocument();
      expect(screen.getByTestId('user-profile-settings-submit')).toBeInTheDocument();
      expect(screen.getByTestId('user-profile-delete-account')).toBeInTheDocument();
    });
  });

  // ===================================
  // Form Validation Tests
  // ===================================

  describe('Form Validation', () => {
    test('should have validation functions working', () => {
      // Test that the component renders validation-ready forms
      renderUserProfile();

      expect(screen.getByTestId('user-profile-username')).toHaveAttribute('required');
      expect(screen.getByTestId('user-profile-email')).toHaveAttribute('required');
      expect(screen.getByTestId('user-profile-current-password')).toHaveAttribute('required');
      expect(screen.getByTestId('user-profile-new-password')).toHaveAttribute('required');
      expect(screen.getByTestId('user-profile-confirm-password')).toHaveAttribute('required');
    });

    test('should have proper input constraints', () => {
      renderUserProfile();

      expect(screen.getByTestId('user-profile-username')).toHaveAttribute('maxlength', '20');
      expect(screen.getByTestId('user-profile-email')).toHaveAttribute('maxlength', '100');
      expect(screen.getByTestId('user-profile-current-password')).toHaveAttribute('maxlength', '128');
      expect(screen.getByTestId('user-profile-new-password')).toHaveAttribute('maxlength', '128');
      expect(screen.getByTestId('user-profile-confirm-password')).toHaveAttribute('maxlength', '128');
    });
  });

  // ===================================
  // User Interaction Tests
  // ===================================

  describe('User Interactions', () => {
    test('should update profile when form is submitted', async () => {
      const mockOnProfileUpdate = jest.fn();
      renderUserProfile({ onProfileUpdate: mockOnProfileUpdate });
      
      const usernameInput = screen.getByTestId('user-profile-username');
      const emailInput = screen.getByTestId('user-profile-email');
      const submitButton = screen.getByTestId('user-profile-profile-submit');
      
      fireEvent.change(usernameInput, { target: { value: 'newusername' } });
      fireEvent.change(emailInput, { target: { value: 'newemail@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockUseAuth.updateProfile).toHaveBeenCalledWith({
          username: 'newusername',
          email: 'newemail@example.com'
        });
      });
      
      expect(mockOnProfileUpdate).toHaveBeenCalledWith({
        username: 'newusername',
        email: 'newemail@example.com'
      });
      
      await waitFor(() => {
        expect(screen.getByTestId('user-profile-profile-success')).toHaveTextContent('プロフィールを更新しました');
      });
    });

    test('should change password when form is submitted', async () => {
      const mockOnPasswordChange = jest.fn();
      renderUserProfile({ onPasswordChange: mockOnPasswordChange });

      const currentPasswordInput = screen.getByTestId('user-profile-current-password');
      const newPasswordInput = screen.getByTestId('user-profile-new-password');
      const confirmPasswordInput = screen.getByTestId('user-profile-confirm-password');
      const submitButton = screen.getByTestId('user-profile-password-submit');

      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUseAuth.changePassword).toHaveBeenCalledWith({
          currentPassword: 'currentpass123',
          newPassword: 'NewPass123!'
        });
      });

      expect(mockOnPasswordChange).toHaveBeenCalledWith({
        currentPassword: 'currentpass123',
        newPassword: 'NewPass123!',
        confirmPassword: 'NewPass123!'
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-password-success')).toHaveTextContent('パスワードを変更しました');
      });
    });

    test('should update settings when form is submitted', async () => {
      const mockOnSettingsUpdate = jest.fn();
      renderUserProfile({ onSettingsUpdate: mockOnSettingsUpdate });

      const emailNotificationsCheckbox = screen.getByTestId('user-profile-email-notifications');
      const languageSelect = screen.getByTestId('user-profile-language');
      const submitButton = screen.getByTestId('user-profile-settings-submit');

      fireEvent.click(emailNotificationsCheckbox); // Toggle to false
      fireEvent.change(languageSelect, { target: { value: 'en' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockUseAuth.updateSettings).toHaveBeenCalledWith({
          emailNotifications: false,
          language: 'en'
        });
      });

      expect(mockOnSettingsUpdate).toHaveBeenCalledWith({
        emailNotifications: false,
        language: 'en'
      });

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-settings-success')).toHaveTextContent('設定を保存しました');
      });
    });

    test('should show confirmation dialog and delete account', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn()
        .mockReturnValueOnce(true)  // First confirmation
        .mockReturnValueOnce(true); // Second confirmation

      const mockOnAccountDelete = jest.fn();
      renderUserProfile({ onAccountDelete: mockOnAccountDelete });

      const deleteButton = screen.getByTestId('user-profile-delete-account');
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledTimes(2);
      expect(window.confirm).toHaveBeenNthCalledWith(1,
        'アカウントを削除してもよろしいですか？\nこの操作は取り消せません。\n\n削除を実行する場合は「OK」をクリックしてください。'
      );
      expect(window.confirm).toHaveBeenNthCalledWith(2,
        '本当にアカウントを削除しますか？\nすべてのデータが永久に失われます。'
      );

      await waitFor(() => {
        expect(mockUseAuth.deleteAccount).toHaveBeenCalled();
      });

      expect(mockOnAccountDelete).toHaveBeenCalled();

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    test('should not delete account when confirmation is cancelled', async () => {
      // Mock window.confirm to return false
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      renderUserProfile();

      const deleteButton = screen.getByTestId('user-profile-delete-account');
      fireEvent.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledTimes(1);
      expect(mockUseAuth.deleteAccount).not.toHaveBeenCalled();

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    test('should handle form input changes', async () => {
      renderUserProfile();

      const usernameInput = screen.getByTestId('user-profile-username');
      const emailInput = screen.getByTestId('user-profile-email');

      // Test input changes
      fireEvent.change(usernameInput, { target: { value: 'newusername' } });
      fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

      expect(usernameInput).toHaveValue('newusername');
      expect(emailInput).toHaveValue('new@example.com');
    });

    test('should disable submit buttons when forms are not dirty', () => {
      renderUserProfile();

      expect(screen.getByTestId('user-profile-profile-submit')).toBeDisabled();
      expect(screen.getByTestId('user-profile-password-submit')).toBeDisabled();
      expect(screen.getByTestId('user-profile-settings-submit')).toBeDisabled();
    });

    test('should enable submit buttons when forms are dirty', async () => {
      renderUserProfile();

      // Make profile form dirty
      fireEvent.change(screen.getByTestId('user-profile-username'), { target: { value: 'newname' } });
      await waitFor(() => {
        expect(screen.getByTestId('user-profile-profile-submit')).not.toBeDisabled();
      });

      // Make password form dirty
      fireEvent.change(screen.getByTestId('user-profile-current-password'), { target: { value: 'pass' } });
      await waitFor(() => {
        expect(screen.getByTestId('user-profile-password-submit')).not.toBeDisabled();
      });

      // Make settings form dirty
      fireEvent.click(screen.getByTestId('user-profile-email-notifications'));
      await waitFor(() => {
        expect(screen.getByTestId('user-profile-settings-submit')).not.toBeDisabled();
      });
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should handle profile update error', async () => {
      const errorMessage = 'Profile update failed';
      mockUseAuth.updateProfile.mockRejectedValue(new Error(errorMessage));

      renderUserProfile();

      const usernameInput = screen.getByTestId('user-profile-username');
      const submitButton = screen.getByTestId('user-profile-profile-submit');

      fireEvent.change(usernameInput, { target: { value: 'newusername' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-profile-error')).toHaveTextContent(errorMessage);
      });
    });

    test('should handle password change error', async () => {
      const errorMessage = 'Password change failed';
      mockUseAuth.changePassword.mockRejectedValue(new Error(errorMessage));

      renderUserProfile();

      const currentPasswordInput = screen.getByTestId('user-profile-current-password');
      const newPasswordInput = screen.getByTestId('user-profile-new-password');
      const confirmPasswordInput = screen.getByTestId('user-profile-confirm-password');
      const submitButton = screen.getByTestId('user-profile-password-submit');

      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-password-error')).toHaveTextContent(errorMessage);
      });
    });

    test('should handle settings update error', async () => {
      const errorMessage = 'Settings update failed';
      mockUseAuth.updateSettings.mockRejectedValue(new Error(errorMessage));

      renderUserProfile();

      const emailNotificationsCheckbox = screen.getByTestId('user-profile-email-notifications');
      const submitButton = screen.getByTestId('user-profile-settings-submit');

      fireEvent.click(emailNotificationsCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-settings-error')).toHaveTextContent(errorMessage);
      });
    });

    test('should handle account deletion error', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn()
        .mockReturnValueOnce(true)
        .mockReturnValueOnce(true);

      const errorMessage = 'Account deletion failed';
      mockUseAuth.deleteAccount.mockRejectedValue(new Error(errorMessage));

      renderUserProfile();

      const deleteButton = screen.getByTestId('user-profile-delete-account');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-general-error')).toHaveTextContent(errorMessage);
      });

      window.confirm = originalConfirm;
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration', () => {
    test('should initialize with user data from auth context', () => {
      const customUser = {
        ...mockUser,
        username: 'customuser',
        email: 'custom@example.com',
        settings: {
          emailNotifications: false,
          language: 'en' as const
        }
      };

      mockUseAuth.user = customUser;

      renderUserProfile();

      expect(screen.getByTestId('user-profile-username')).toHaveValue('customuser');
      expect(screen.getByTestId('user-profile-email')).toHaveValue('custom@example.com');
      expect(screen.getByTestId('user-profile-email-notifications')).not.toBeChecked();
      expect(screen.getByTestId('user-profile-language')).toHaveValue('en');
    });

    test('should handle user data updates from auth context', () => {
      const { rerender } = renderUserProfile();

      // Update user data
      const updatedUser = {
        ...mockUser,
        username: 'updateduser',
        email: 'updated@example.com'
      };

      mockUseAuth.user = updatedUser;

      rerender(<UserProfile testId="user-profile" />);

      expect(screen.getByTestId('user-profile-username')).toHaveValue('updateduser');
      expect(screen.getByTestId('user-profile-email')).toHaveValue('updated@example.com');
    });

    test('should clear password fields after successful password change', async () => {
      renderUserProfile();

      const currentPasswordInput = screen.getByTestId('user-profile-current-password');
      const newPasswordInput = screen.getByTestId('user-profile-new-password');
      const confirmPasswordInput = screen.getByTestId('user-profile-confirm-password');
      const submitButton = screen.getByTestId('user-profile-password-submit');

      fireEvent.change(currentPasswordInput, { target: { value: 'currentpass123' } });
      fireEvent.change(newPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'NewPass123!' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByTestId('user-profile-password-success')).toBeInTheDocument();
      });

      // Check that password fields are cleared
      expect(currentPasswordInput).toHaveValue('');
      expect(newPasswordInput).toHaveValue('');
      expect(confirmPasswordInput).toHaveValue('');
    });
  });
});
