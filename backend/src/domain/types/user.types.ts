/**
 * ===================================
 * User Types Definition
 * ===================================
 * Purpose: Centralized user-related type definitions and interfaces
 * Features:
 * - User entity type re-exports
 * - User service type re-exports
 * - Additional user-related types
 * - Type safety and code organization
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

// ===================================
// Re-exports from User Entity
// ===================================

export {
  UserRole,
  UserCreationData,
  UserUpdateData,
  UserProfileData
} from '../entities/user.entity';

// ===================================
// Re-exports from User Service
// ===================================

export {
  UserSearchFilters,
  CreateUserRequest,
  UpdateUserRequest,
  UserStatistics,
  PasswordValidationResult,
  IUserRepository
} from '../services/user.service';

// ===================================
// Import for internal use
// ===================================

import {
  UserRole,
  UserCreationData,
  UserUpdateData,
  UserProfileData
} from '../entities/user.entity';

import {
  UserSearchFilters
} from '../services/user.service';

// ===================================
// Additional User Types
// ===================================

/**
 * User authentication status
 */
export enum UserAuthStatus {
  AUTHENTICATED = 'authenticated',
  UNAUTHENTICATED = 'unauthenticated',
  EXPIRED = 'expired',
  LOCKED = 'locked'
}

/**
 * User account status
 */
export enum UserAccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  DELETED = 'deleted'
}

/**
 * User permission levels
 */
export enum UserPermission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

/**
 * User session information
 */
export interface UserSession {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  authStatus: UserAuthStatus;
  loginAt: Date;
  lastActivityAt: Date;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * User authentication credentials
 */
export interface UserCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * User registration data
 */
export interface UserRegistrationData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  newsletter?: boolean;
}

/**
 * User login response
 */
export interface UserLoginResponse {
  user: UserProfileData;
  token: string;
  refreshToken?: string;
  expiresAt: Date;
  session: UserSession;
}

/**
 * User password change request
 */
export interface UserPasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User password reset request
 */
export interface UserPasswordResetRequest {
  email: string;
  resetUrl?: string;
}

/**
 * User password reset confirmation
 */
export interface UserPasswordResetConfirmation {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * User email verification request
 */
export interface UserEmailVerificationRequest {
  email: string;
  verificationUrl?: string;
}

/**
 * User email verification confirmation
 */
export interface UserEmailVerificationConfirmation {
  token: string;
  email: string;
}

/**
 * User profile update request
 */
export interface UserProfileUpdateRequest {
  username?: string;
  email?: string;
  currentPassword?: string; // Required for sensitive changes
}

/**
 * User preferences
 */
export interface UserPreferences {
  userId: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'auto';
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    inApp: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showLastSeen: boolean;
  };
}

/**
 * User activity log entry
 */
export interface UserActivityLog {
  id: string;
  userId: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

/**
 * User security settings
 */
export interface UserSecuritySettings {
  userId: string;
  twoFactorEnabled: boolean;
  twoFactorMethod?: 'sms' | 'email' | 'app';
  passwordLastChanged: Date;
  loginAttempts: number;
  lockedUntil?: Date;
  trustedDevices: string[];
  securityQuestions?: {
    question: string;
    answerHash: string;
  }[];
}

/**
 * User notification settings
 */
export interface UserNotificationSettings {
  userId: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  taskReminders: boolean;
  taskDeadlines: boolean;
  systemAnnouncements: boolean;
  securityAlerts: boolean;
  marketingEmails: boolean;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string;   // HH:MM format
    timezone: string;
  };
}

/**
 * User dashboard summary
 */
export interface UserDashboardSummary {
  user: UserProfileData;
  statistics: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    overdueTasks: number;
  };
  recentActivity: UserActivityLog[];
  notifications: {
    unreadCount: number;
    recent: any[]; // Will be typed when notification types are available
  };
}

/**
 * User search result
 */
export interface UserSearchResult {
  users: UserProfileData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: UserSearchFilters;
}

/**
 * User bulk operation request
 */
export interface UserBulkOperationRequest {
  userIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'change_role';
  parameters?: {
    role?: UserRole;
    reason?: string;
  };
}

/**
 * User bulk operation result
 */
export interface UserBulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: {
    userId: string;
    error: string;
  }[];
  results: {
    userId: string;
    success: boolean;
    message?: string;
  }[];
}

/**
 * User export data
 */
export interface UserExportData {
  profile: UserProfileData;
  preferences: UserPreferences;
  securitySettings: Omit<UserSecuritySettings, 'passwordLastChanged' | 'loginAttempts' | 'lockedUntil'>;
  activitySummary: {
    totalLogins: number;
    lastLogin: Date;
    accountCreated: Date;
    tasksCreated: number;
    tasksCompleted: number;
  };
}

/**
 * User import data
 */
export interface UserImportData {
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  preferences?: Partial<UserPreferences>;
  temporaryPassword?: string;
  sendWelcomeEmail?: boolean;
}

/**
 * User validation rules
 */
export interface UserValidationRules {
  username: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
    reservedNames: string[];
  };
  email: {
    maxLength: number;
    domainWhitelist?: string[];
    domainBlacklist?: string[];
  };
  password: {
    minLength: number;
    maxLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    forbiddenPasswords: string[];
  };
}

/**
 * User audit trail entry
 */
export interface UserAuditTrail {
  id: string;
  userId: string;
  action: 'created' | 'updated' | 'deleted' | 'login' | 'logout' | 'password_changed' | 'role_changed';
  performedBy: string; // User ID of who performed the action
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ===================================
// Type Guards
// ===================================

/**
 * Type guard to check if a user has admin role
 */
export function isAdminUser(user: { role: UserRole }): boolean {
  return user.role === UserRole.ADMIN;
}

/**
 * Type guard to check if a user is active
 */
export function isActiveUser(user: { isActive: boolean }): boolean {
  return user.isActive === true;
}

/**
 * Type guard to check if a user can perform admin actions
 */
export function canPerformAdminActions(user: { role: UserRole; isActive: boolean }): boolean {
  return isActiveUser(user) && isAdminUser(user);
}

/**
 * Type guard to check if user session is valid
 */
export function isValidUserSession(session: UserSession): boolean {
  const now = new Date();
  return session.expiresAt > now && session.authStatus === UserAuthStatus.AUTHENTICATED;
}

// ===================================
// Utility Types
// ===================================

/**
 * User entity without sensitive information
 */
export type PublicUserData = Omit<UserProfileData, 'email'> & {
  id: string;
  createdAt: Date;
};

/**
 * User creation data without password hash
 */
export type UserRegistrationInput = Omit<UserCreationData, 'passwordHash'> & {
  password: string;
};

/**
 * User update data without password hash
 */
export type UserUpdateInput = Omit<UserUpdateData, 'passwordHash'> & {
  password?: string;
};

/**
 * User search filters with extended options
 */
export type ExtendedUserSearchFilters = UserSearchFilters & {
  accountStatus?: UserAccountStatus;
  hasRecentActivity?: boolean;
  lastLoginBefore?: Date;
  lastLoginAfter?: Date;
};

/**
 * User with computed properties
 */
export type UserWithComputedProperties = UserProfileData & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  isAdmin: boolean;
  canAccessSystem: boolean;
  daysSinceCreation: number;
  accountAge: string;
};
