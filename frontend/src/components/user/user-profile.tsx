/**
 * ===================================
 * User Profile Component Implementation
 * ===================================
 * Purpose: User profile management with settings and security
 * Features:
 * - Profile information display and editing
 * - Password change functionality
 * - Account settings management
 * - Security validation
 * - Multi-section form layout
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * STEP 2.5 Design: SC-009
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/use-auth';

// ===================================
// User Profile Types and Interfaces
// ===================================

/**
 * Profile form data interface
 */
export interface ProfileFormData {
  username: string;
  email: string;
}

/**
 * Password change form data interface
 */
export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Account settings data interface
 */
export interface AccountSettingsData {
  emailNotifications: boolean;
  language: 'ja' | 'en';
}

/**
 * Form validation errors interface
 */
export interface ValidationErrors {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

/**
 * User profile props interface
 */
export interface UserProfileProps {
  onProfileUpdate?: (data: ProfileFormData) => void;
  onPasswordChange?: (data: PasswordChangeData) => void;
  onSettingsUpdate?: (data: AccountSettingsData) => void;
  onAccountDelete?: () => void;
  className?: string;
  testId?: string;
}

/**
 * Form section state interface
 */
export interface SectionState {
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
}

// ===================================
// Validation Functions
// ===================================

/**
 * Validate username
 */
const validateUsername = (username: string): string | undefined => {
  if (!username || username.trim().length === 0) {
    return 'ユーザー名は必須です';
  }
  
  if (username.length < 3 || username.length > 20) {
    return 'ユーザー名は3-20文字で入力してください';
  }
  
  // Check for valid characters (alphanumeric only)
  const validPattern = /^[a-zA-Z0-9]+$/;
  if (!validPattern.test(username)) {
    return 'ユーザー名は英数字のみ使用できます';
  }
  
  return undefined;
};

/**
 * Validate email address
 */
const validateEmail = (email: string): string | undefined => {
  if (!email || email.trim().length === 0) {
    return 'メールアドレスは必須です';
  }
  
  if (email.length > 100) {
    return 'メールアドレスは100文字以内で入力してください';
  }
  
  // RFC5322 compliant email validation (simplified)
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    return '有効なメールアドレスを入力してください';
  }
  
  return undefined;
};

/**
 * Validate password
 */
const validatePassword = (password: string, isNew: boolean = false): string | undefined => {
  if (!password || password.trim().length === 0) {
    return 'パスワードは必須です';
  }
  
  if (password.length > 128) {
    return 'パスワードは128文字以内で入力してください';
  }
  
  if (isNew) {
    if (password.length < 8) {
      return 'パスワードは8文字以上で入力してください';
    }
    
    // Check for complexity (at least one uppercase, lowercase, number, and symbol)
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    
    if (!hasUppercase || !hasLowercase || !hasNumber || !hasSymbol) {
      return 'パスワードは大文字・小文字・数字・記号を含む必要があります';
    }
  }
  
  return undefined;
};

/**
 * Validate password confirmation
 */
const validatePasswordConfirmation = (password: string, confirmPassword: string): string | undefined => {
  if (!confirmPassword || confirmPassword.trim().length === 0) {
    return 'パスワード確認は必須です';
  }
  
  if (password !== confirmPassword) {
    return 'パスワードが一致しません';
  }
  
  return undefined;
};

// ===================================
// Main User Profile Component
// ===================================

/**
 * User Profile Component
 * 
 * Provides user profile management with multiple sections for different settings.
 */
export const UserProfile: React.FC<UserProfileProps> = ({
  onProfileUpdate,
  onPasswordChange,
  onSettingsUpdate,
  onAccountDelete,
  className = '',
  testId = 'user-profile'
}) => {
  // ===================================
  // Dependencies and Configuration
  // ===================================

  const { user, isAuthenticated, updateProfile, changePassword, updateSettings, deleteAccount } = useAuth();

  // ===================================
  // State Management
  // ===================================

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileFormData>({
    username: user?.username || '',
    email: user?.email || ''
  });

  // Password form state
  const [passwordData, setPasswordData] = useState<PasswordChangeData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Settings form state
  const [settingsData, setSettingsData] = useState<AccountSettingsData>({
    emailNotifications: user?.settings?.emailNotifications || false,
    language: user?.settings?.language || 'ja'
  });

  // Section states
  const [profileState, setProfileState] = useState<SectionState>({
    isLoading: false,
    error: null,
    isDirty: false
  });

  const [passwordState, setPasswordState] = useState<SectionState>({
    isLoading: false,
    error: null,
    isDirty: false
  });

  const [settingsState, setSettingsState] = useState<SectionState>({
    isLoading: false,
    error: null,
    isDirty: false
  });

  // Validation errors
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Success messages
  const [successMessages, setSuccessMessages] = useState<{
    profile?: string;
    password?: string;
    settings?: string;
  }>({});

  // ===================================
  // Computed Properties
  // ===================================

  const canUpdateProfile = useMemo(() => {
    return isAuthenticated && profileState.isDirty && !profileState.isLoading;
  }, [isAuthenticated, profileState.isDirty, profileState.isLoading]);

  const canChangePassword = useMemo(() => {
    return isAuthenticated && passwordState.isDirty && !passwordState.isLoading;
  }, [isAuthenticated, passwordState.isDirty, passwordState.isLoading]);

  const canUpdateSettings = useMemo(() => {
    return isAuthenticated && settingsState.isDirty && !settingsState.isLoading;
  }, [isAuthenticated, settingsState.isDirty, settingsState.isLoading]);

  // ===================================
  // Data Loading and Initialization
  // ===================================

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || ''
      });
      
      setSettingsData({
        emailNotifications: user.settings?.emailNotifications || false,
        language: user.settings?.language || 'ja'
      });
    }
  }, [user]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleProfileFieldChange = useCallback((field: keyof ProfileFormData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));

    setProfileState(prev => ({ ...prev, isDirty: true }));

    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear success message
    if (successMessages.profile) {
      setSuccessMessages(prev => ({
        ...prev,
        profile: undefined
      }));
    }
  }, [errors, successMessages.profile]);

  const handlePasswordFieldChange = useCallback((field: keyof PasswordChangeData, value: string) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));

    setPasswordState(prev => ({ ...prev, isDirty: true }));

    // Clear field error
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }

    // Clear success message
    if (successMessages.password) {
      setSuccessMessages(prev => ({
        ...prev,
        password: undefined
      }));
    }
  }, [errors, successMessages.password]);

  const handleSettingsFieldChange = useCallback((field: keyof AccountSettingsData, value: boolean | string) => {
    setSettingsData(prev => ({
      ...prev,
      [field]: value
    }));

    setSettingsState(prev => ({ ...prev, isDirty: true }));

    // Clear success message
    if (successMessages.settings) {
      setSuccessMessages(prev => ({
        ...prev,
        settings: undefined
      }));
    }
  }, [successMessages.settings]);

  const handleProfileSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate profile data
    const usernameError = validateUsername(profileData.username);
    const emailError = validateEmail(profileData.email);

    if (usernameError || emailError) {
      setErrors(prev => ({
        ...prev,
        username: usernameError,
        email: emailError
      }));
      return;
    }

    setProfileState(prev => ({ ...prev, isLoading: true, error: null }));
    setErrors(prev => ({
      ...prev,
      username: undefined,
      email: undefined
    }));

    try {
      if (updateProfile) {
        await updateProfile(profileData);
      }

      if (onProfileUpdate) {
        onProfileUpdate(profileData);
      }

      setSuccessMessages(prev => ({
        ...prev,
        profile: 'プロフィールを更新しました'
      }));

      setProfileState(prev => ({ ...prev, isDirty: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'プロフィールの更新に失敗しました';
      setProfileState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setProfileState(prev => ({ ...prev, isLoading: false }));
    }
  }, [profileData, updateProfile, onProfileUpdate]);

  const handlePasswordSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    // Validate password data
    const currentPasswordError = validatePassword(passwordData.currentPassword);
    const newPasswordError = validatePassword(passwordData.newPassword, true);
    const confirmPasswordError = validatePasswordConfirmation(passwordData.newPassword, passwordData.confirmPassword);

    if (currentPasswordError || newPasswordError || confirmPasswordError) {
      setErrors(prev => ({
        ...prev,
        currentPassword: currentPasswordError,
        newPassword: newPasswordError,
        confirmPassword: confirmPasswordError
      }));
      return;
    }

    setPasswordState(prev => ({ ...prev, isLoading: true, error: null }));
    setErrors(prev => ({
      ...prev,
      currentPassword: undefined,
      newPassword: undefined,
      confirmPassword: undefined
    }));

    try {
      if (changePassword) {
        await changePassword({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
      }

      if (onPasswordChange) {
        onPasswordChange(passwordData);
      }

      setSuccessMessages(prev => ({
        ...prev,
        password: 'パスワードを変更しました'
      }));

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      setPasswordState(prev => ({ ...prev, isDirty: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'パスワードの変更に失敗しました';
      setPasswordState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setPasswordState(prev => ({ ...prev, isLoading: false }));
    }
  }, [passwordData, changePassword, onPasswordChange]);

  const handleSettingsSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    setSettingsState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      if (updateSettings) {
        await updateSettings(settingsData);
      }

      if (onSettingsUpdate) {
        onSettingsUpdate(settingsData);
      }

      setSuccessMessages(prev => ({
        ...prev,
        settings: '設定を保存しました'
      }));

      setSettingsState(prev => ({ ...prev, isDirty: false }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '設定の保存に失敗しました';
      setSettingsState(prev => ({ ...prev, error: errorMessage }));
    } finally {
      setSettingsState(prev => ({ ...prev, isLoading: false }));
    }
  }, [settingsData, updateSettings, onSettingsUpdate]);

  const handleAccountDelete = useCallback(async () => {
    const confirmDelete = window.confirm(
      'アカウントを削除してもよろしいですか？\nこの操作は取り消せません。\n\n削除を実行する場合は「OK」をクリックしてください。'
    );

    if (!confirmDelete) return;

    const doubleConfirm = window.confirm(
      '本当にアカウントを削除しますか？\nすべてのデータが永久に失われます。'
    );

    if (!doubleConfirm) return;

    try {
      if (deleteAccount) {
        await deleteAccount();
      }

      if (onAccountDelete) {
        onAccountDelete();
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'アカウントの削除に失敗しました'
      }));
    }
  }, [deleteAccount, onAccountDelete]);

  // ===================================
  // Render Methods
  // ===================================

  const renderProfileSection = () => (
    <section className="user-profile__section">
      <h2 className="user-profile__section-title">基本情報設定</h2>

      {successMessages.profile && (
        <div className="user-profile__success" data-testid={`${testId}-profile-success`}>
          {successMessages.profile}
        </div>
      )}

      {profileState.error && (
        <div className="user-profile__error" data-testid={`${testId}-profile-error`}>
          {profileState.error}
        </div>
      )}

      <form onSubmit={handleProfileSubmit} className="user-profile__form">
        <div className="user-profile__field">
          <label htmlFor="username" className="user-profile__label">
            ユーザー名
          </label>
          <input
            id="username"
            type="text"
            className={`user-profile__input ${errors.username ? 'user-profile__input--error' : ''}`}
            value={profileData.username}
            onChange={(e) => handleProfileFieldChange('username', e.target.value)}
            disabled={profileState.isLoading}
            maxLength={20}
            data-testid={`${testId}-username`}
            required
          />
          {errors.username && (
            <div className="user-profile__field-error" data-testid={`${testId}-username-error`}>
              {errors.username}
            </div>
          )}
        </div>

        <div className="user-profile__field">
          <label htmlFor="email" className="user-profile__label">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            className={`user-profile__input ${errors.email ? 'user-profile__input--error' : ''}`}
            value={profileData.email}
            onChange={(e) => handleProfileFieldChange('email', e.target.value)}
            disabled={profileState.isLoading}
            maxLength={100}
            data-testid={`${testId}-email`}
            required
          />
          {errors.email && (
            <div className="user-profile__field-error" data-testid={`${testId}-email-error`}>
              {errors.email}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="user-profile__submit"
          disabled={!canUpdateProfile}
          data-testid={`${testId}-profile-submit`}
        >
          {profileState.isLoading ? '更新中...' : '基本情報更新'}
        </button>
      </form>
    </section>
  );

  const renderPasswordSection = () => (
    <section className="user-profile__section">
      <h2 className="user-profile__section-title">パスワード変更</h2>

      {successMessages.password && (
        <div className="user-profile__success" data-testid={`${testId}-password-success`}>
          {successMessages.password}
        </div>
      )}

      {passwordState.error && (
        <div className="user-profile__error" data-testid={`${testId}-password-error`}>
          {passwordState.error}
        </div>
      )}

      <form onSubmit={handlePasswordSubmit} className="user-profile__form">
        <div className="user-profile__field">
          <label htmlFor="currentPassword" className="user-profile__label">
            現在のパスワード
          </label>
          <input
            id="currentPassword"
            type="password"
            className={`user-profile__input ${errors.currentPassword ? 'user-profile__input--error' : ''}`}
            value={passwordData.currentPassword}
            onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
            disabled={passwordState.isLoading}
            maxLength={128}
            data-testid={`${testId}-current-password`}
            required
          />
          {errors.currentPassword && (
            <div className="user-profile__field-error" data-testid={`${testId}-current-password-error`}>
              {errors.currentPassword}
            </div>
          )}
        </div>

        <div className="user-profile__field">
          <label htmlFor="newPassword" className="user-profile__label">
            新しいパスワード
          </label>
          <input
            id="newPassword"
            type="password"
            className={`user-profile__input ${errors.newPassword ? 'user-profile__input--error' : ''}`}
            value={passwordData.newPassword}
            onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
            disabled={passwordState.isLoading}
            maxLength={128}
            data-testid={`${testId}-new-password`}
            required
          />
          {errors.newPassword && (
            <div className="user-profile__field-error" data-testid={`${testId}-new-password-error`}>
              {errors.newPassword}
            </div>
          )}
        </div>

        <div className="user-profile__field">
          <label htmlFor="confirmPassword" className="user-profile__label">
            新しいパスワード（確認）
          </label>
          <input
            id="confirmPassword"
            type="password"
            className={`user-profile__input ${errors.confirmPassword ? 'user-profile__input--error' : ''}`}
            value={passwordData.confirmPassword}
            onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
            disabled={passwordState.isLoading}
            maxLength={128}
            data-testid={`${testId}-confirm-password`}
            required
          />
          {errors.confirmPassword && (
            <div className="user-profile__field-error" data-testid={`${testId}-confirm-password-error`}>
              {errors.confirmPassword}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="user-profile__submit"
          disabled={!canChangePassword}
          data-testid={`${testId}-password-submit`}
        >
          {passwordState.isLoading ? '変更中...' : 'パスワード変更'}
        </button>
      </form>
    </section>
  );

  const renderSettingsSection = () => (
    <section className="user-profile__section">
      <h2 className="user-profile__section-title">アカウント設定</h2>

      {successMessages.settings && (
        <div className="user-profile__success" data-testid={`${testId}-settings-success`}>
          {successMessages.settings}
        </div>
      )}

      {settingsState.error && (
        <div className="user-profile__error" data-testid={`${testId}-settings-error`}>
          {settingsState.error}
        </div>
      )}

      <form onSubmit={handleSettingsSubmit} className="user-profile__form">
        <div className="user-profile__field user-profile__field--checkbox">
          <label className="user-profile__checkbox-label">
            <input
              type="checkbox"
              className="user-profile__checkbox"
              checked={settingsData.emailNotifications}
              onChange={(e) => handleSettingsFieldChange('emailNotifications', e.target.checked)}
              disabled={settingsState.isLoading}
              data-testid={`${testId}-email-notifications`}
            />
            <span className="user-profile__checkbox-text">メール通知を受け取る</span>
          </label>
        </div>

        <div className="user-profile__field">
          <label htmlFor="language" className="user-profile__label">
            言語設定
          </label>
          <select
            id="language"
            className="user-profile__select"
            value={settingsData.language}
            onChange={(e) => handleSettingsFieldChange('language', e.target.value as 'ja' | 'en')}
            disabled={settingsState.isLoading}
            data-testid={`${testId}-language`}
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
        </div>

        <button
          type="submit"
          className="user-profile__submit"
          disabled={!canUpdateSettings}
          data-testid={`${testId}-settings-submit`}
        >
          {settingsState.isLoading ? '保存中...' : '設定保存'}
        </button>
      </form>
    </section>
  );

  const renderDangerSection = () => (
    <section className="user-profile__section user-profile__section--danger">
      <h2 className="user-profile__section-title">危険な操作</h2>

      <div className="user-profile__danger-content">
        <p className="user-profile__danger-description">
          アカウントを削除すると、すべてのデータが永久に失われます。この操作は取り消せません。
        </p>

        <button
          type="button"
          className="user-profile__danger-button"
          onClick={handleAccountDelete}
          data-testid={`${testId}-delete-account`}
        >
          アカウント削除
        </button>
      </div>
    </section>
  );

  // ===================================
  // Main Render
  // ===================================

  if (!isAuthenticated) {
    return (
      <div className="user-profile__unauthorized" data-testid={`${testId}-unauthorized`}>
        <div className="user-profile__unauthorized-message">
          ユーザー設定を表示するにはログインが必要です
        </div>
      </div>
    );
  }

  return (
    <div
      className={`user-profile ${className}`}
      data-testid={testId}
    >
      <div className="user-profile__header">
        <h1 className="user-profile__title">ユーザー設定</h1>
      </div>

      {errors.general && (
        <div className="user-profile__error user-profile__error--general" data-testid={`${testId}-general-error`}>
          {errors.general}
        </div>
      )}

      <div className="user-profile__content">
        {renderProfileSection()}
        {renderPasswordSection()}
        {renderSettingsSection()}
        {renderDangerSection()}
      </div>
    </div>
  );
};

// Set display name for debugging
UserProfile.displayName = 'UserProfile';

// ===================================
// Export Default Component
// ===================================

export default UserProfile;
