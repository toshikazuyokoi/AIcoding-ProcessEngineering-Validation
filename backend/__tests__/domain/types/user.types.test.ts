/**
 * ===================================
 * User Types Test Suite
 * ===================================
 * Purpose: Comprehensive tests for user-related type definitions
 * Features:
 * - Type guard function testing
 * - Interface validation testing
 * - Enum value testing
 * - Type safety verification
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  // Enums
  UserRole,
  UserAuthStatus,
  UserAccountStatus,
  UserPermission,
  
  // Interfaces
  UserSession,
  UserCredentials,
  UserRegistrationData,
  UserLoginResponse,
  UserPasswordChangeRequest,
  UserPasswordResetRequest,
  UserPasswordResetConfirmation,
  UserEmailVerificationRequest,
  UserEmailVerificationConfirmation,
  UserProfileUpdateRequest,
  UserPreferences,
  UserActivityLog,
  UserSecuritySettings,
  UserNotificationSettings,
  UserDashboardSummary,
  UserSearchResult,
  UserBulkOperationRequest,
  UserBulkOperationResult,
  UserExportData,
  UserImportData,
  UserValidationRules,
  UserAuditTrail,
  
  // Type Guards
  isAdminUser,
  isActiveUser,
  canPerformAdminActions,
  isValidUserSession,
  
  // Utility Types
  PublicUserData,
  UserRegistrationInput,
  UserUpdateInput,
  ExtendedUserSearchFilters,
  UserWithComputedProperties
} from '../../../src/domain/types/user.types';

import { UserProfileData } from '../../../src/domain/entities/user.entity';

describe('User Types', () => {
  // ===================================
  // Enum Tests
  // ===================================

  describe('UserRole Enum', () => {
    test('should have correct values', () => {
      expect(UserRole.USER).toBe('user');
      expect(UserRole.ADMIN).toBe('admin');
    });

    test('should have exactly 2 values', () => {
      const values = Object.values(UserRole);
      expect(values).toHaveLength(2);
      expect(values).toContain('user');
      expect(values).toContain('admin');
    });
  });

  describe('UserAuthStatus Enum', () => {
    test('should have correct values', () => {
      expect(UserAuthStatus.AUTHENTICATED).toBe('authenticated');
      expect(UserAuthStatus.UNAUTHENTICATED).toBe('unauthenticated');
      expect(UserAuthStatus.EXPIRED).toBe('expired');
      expect(UserAuthStatus.LOCKED).toBe('locked');
    });

    test('should have exactly 4 values', () => {
      const values = Object.values(UserAuthStatus);
      expect(values).toHaveLength(4);
    });
  });

  describe('UserAccountStatus Enum', () => {
    test('should have correct values', () => {
      expect(UserAccountStatus.ACTIVE).toBe('active');
      expect(UserAccountStatus.INACTIVE).toBe('inactive');
      expect(UserAccountStatus.SUSPENDED).toBe('suspended');
      expect(UserAccountStatus.PENDING_VERIFICATION).toBe('pending_verification');
      expect(UserAccountStatus.DELETED).toBe('deleted');
    });

    test('should have exactly 5 values', () => {
      const values = Object.values(UserAccountStatus);
      expect(values).toHaveLength(5);
    });
  });

  describe('UserPermission Enum', () => {
    test('should have correct values', () => {
      expect(UserPermission.READ).toBe('read');
      expect(UserPermission.WRITE).toBe('write');
      expect(UserPermission.DELETE).toBe('delete');
      expect(UserPermission.ADMIN).toBe('admin');
      expect(UserPermission.SUPER_ADMIN).toBe('super_admin');
    });

    test('should have exactly 5 values', () => {
      const values = Object.values(UserPermission);
      expect(values).toHaveLength(5);
    });
  });

  // ===================================
  // Type Guard Tests
  // ===================================

  describe('Type Guards', () => {
    describe('isAdminUser', () => {
      test('should return true for admin user', () => {
        const adminUser = { role: UserRole.ADMIN };
        expect(isAdminUser(adminUser)).toBe(true);
      });

      test('should return false for regular user', () => {
        const regularUser = { role: UserRole.USER };
        expect(isAdminUser(regularUser)).toBe(false);
      });
    });

    describe('isActiveUser', () => {
      test('should return true for active user', () => {
        const activeUser = { isActive: true };
        expect(isActiveUser(activeUser)).toBe(true);
      });

      test('should return false for inactive user', () => {
        const inactiveUser = { isActive: false };
        expect(isActiveUser(inactiveUser)).toBe(false);
      });
    });

    describe('canPerformAdminActions', () => {
      test('should return true for active admin user', () => {
        const activeAdmin = { role: UserRole.ADMIN, isActive: true };
        expect(canPerformAdminActions(activeAdmin)).toBe(true);
      });

      test('should return false for inactive admin user', () => {
        const inactiveAdmin = { role: UserRole.ADMIN, isActive: false };
        expect(canPerformAdminActions(inactiveAdmin)).toBe(false);
      });

      test('should return false for active regular user', () => {
        const activeUser = { role: UserRole.USER, isActive: true };
        expect(canPerformAdminActions(activeUser)).toBe(false);
      });

      test('should return false for inactive regular user', () => {
        const inactiveUser = { role: UserRole.USER, isActive: false };
        expect(canPerformAdminActions(inactiveUser)).toBe(false);
      });
    });

    describe('isValidUserSession', () => {
      test('should return true for valid session', () => {
        const validSession: UserSession = {
          userId: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: UserRole.USER,
          authStatus: UserAuthStatus.AUTHENTICATED,
          loginAt: new Date(Date.now() - 3600000), // 1 hour ago
          lastActivityAt: new Date(Date.now() - 300000), // 5 minutes ago
          expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0'
        };

        expect(isValidUserSession(validSession)).toBe(true);
      });

      test('should return false for expired session', () => {
        const expiredSession: UserSession = {
          userId: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: UserRole.USER,
          authStatus: UserAuthStatus.AUTHENTICATED,
          loginAt: new Date(Date.now() - 7200000), // 2 hours ago
          lastActivityAt: new Date(Date.now() - 3900000), // 65 minutes ago
          expiresAt: new Date(Date.now() - 300000), // 5 minutes ago (expired)
        };

        expect(isValidUserSession(expiredSession)).toBe(false);
      });

      test('should return false for unauthenticated session', () => {
        const unauthenticatedSession: UserSession = {
          userId: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: UserRole.USER,
          authStatus: UserAuthStatus.UNAUTHENTICATED,
          loginAt: new Date(Date.now() - 3600000),
          lastActivityAt: new Date(Date.now() - 300000),
          expiresAt: new Date(Date.now() + 3600000),
        };

        expect(isValidUserSession(unauthenticatedSession)).toBe(false);
      });
    });
  });

  // ===================================
  // Interface Structure Tests
  // ===================================

  describe('Interface Structures', () => {
    describe('UserCredentials', () => {
      test('should have required properties', () => {
        const credentials: UserCredentials = {
          email: 'test@example.com',
          password: 'password123'
        };

        expect(credentials.email).toBeDefined();
        expect(credentials.password).toBeDefined();
      });

      test('should allow optional rememberMe property', () => {
        const credentials: UserCredentials = {
          email: 'test@example.com',
          password: 'password123',
          rememberMe: true
        };

        expect(credentials.rememberMe).toBe(true);
      });
    });

    describe('UserRegistrationData', () => {
      test('should have all required properties', () => {
        const registrationData: UserRegistrationData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          acceptTerms: true
        };

        expect(registrationData.username).toBeDefined();
        expect(registrationData.email).toBeDefined();
        expect(registrationData.password).toBeDefined();
        expect(registrationData.confirmPassword).toBeDefined();
        expect(registrationData.acceptTerms).toBeDefined();
      });

      test('should allow optional newsletter property', () => {
        const registrationData: UserRegistrationData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          acceptTerms: true,
          newsletter: false
        };

        expect(registrationData.newsletter).toBe(false);
      });
    });

    describe('UserPreferences', () => {
      test('should have all required properties', () => {
        const preferences: UserPreferences = {
          userId: 'user-123',
          language: 'en',
          timezone: 'UTC',
          dateFormat: 'YYYY-MM-DD',
          timeFormat: '24h',
          theme: 'light',
          notifications: {
            email: true,
            push: false,
            sms: false,
            inApp: true
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showLastSeen: true
          }
        };

        expect(preferences.userId).toBeDefined();
        expect(preferences.language).toBeDefined();
        expect(preferences.timezone).toBeDefined();
        expect(preferences.notifications).toBeDefined();
        expect(preferences.privacy).toBeDefined();
      });

      test('should validate theme values', () => {
        const lightTheme: UserPreferences['theme'] = 'light';
        const darkTheme: UserPreferences['theme'] = 'dark';
        const autoTheme: UserPreferences['theme'] = 'auto';

        expect(['light', 'dark', 'auto']).toContain(lightTheme);
        expect(['light', 'dark', 'auto']).toContain(darkTheme);
        expect(['light', 'dark', 'auto']).toContain(autoTheme);
      });

      test('should validate time format values', () => {
        const format12h: UserPreferences['timeFormat'] = '12h';
        const format24h: UserPreferences['timeFormat'] = '24h';

        expect(['12h', '24h']).toContain(format12h);
        expect(['12h', '24h']).toContain(format24h);
      });
    });

    describe('UserActivityLog', () => {
      test('should have all required properties', () => {
        const activityLog: UserActivityLog = {
          id: 'activity-123',
          userId: 'user-123',
          action: 'login',
          timestamp: new Date()
        };

        expect(activityLog.id).toBeDefined();
        expect(activityLog.userId).toBeDefined();
        expect(activityLog.action).toBeDefined();
        expect(activityLog.timestamp).toBeDefined();
      });

      test('should allow optional properties', () => {
        const activityLog: UserActivityLog = {
          id: 'activity-123',
          userId: 'user-123',
          action: 'update_task',
          resource: 'task',
          resourceId: 'task-456',
          details: { field: 'title', oldValue: 'Old Title', newValue: 'New Title' },
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          timestamp: new Date()
        };

        expect(activityLog.resource).toBe('task');
        expect(activityLog.resourceId).toBe('task-456');
        expect(activityLog.details).toBeDefined();
        expect(activityLog.ipAddress).toBeDefined();
        expect(activityLog.userAgent).toBeDefined();
      });
    });

    describe('UserBulkOperationRequest', () => {
      test('should have all required properties', () => {
        const bulkRequest: UserBulkOperationRequest = {
          userIds: ['user-1', 'user-2', 'user-3'],
          operation: 'activate'
        };

        expect(bulkRequest.userIds).toHaveLength(3);
        expect(bulkRequest.operation).toBe('activate');
      });

      test('should allow optional parameters', () => {
        const bulkRequest: UserBulkOperationRequest = {
          userIds: ['user-1', 'user-2'],
          operation: 'change_role',
          parameters: {
            role: UserRole.ADMIN,
            reason: 'Promotion to admin'
          }
        };

        expect(bulkRequest.parameters?.role).toBe(UserRole.ADMIN);
        expect(bulkRequest.parameters?.reason).toBeDefined();
      });

      test('should validate operation values', () => {
        const validOperations = ['activate', 'deactivate', 'delete', 'change_role'];

        validOperations.forEach(operation => {
          const request: UserBulkOperationRequest = {
            userIds: ['user-1'],
            operation: operation as any
          };
          expect(validOperations).toContain(request.operation);
        });
      });
    });

    describe('UserValidationRules', () => {
      test('should have all required properties', () => {
        const validationRules: UserValidationRules = {
          username: {
            minLength: 3,
            maxLength: 50,
            allowedCharacters: /^[a-zA-Z0-9_-]+$/,
            reservedNames: ['admin', 'root', 'system']
          },
          email: {
            maxLength: 255
          },
          password: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            forbiddenPasswords: ['password', '123456', 'qwerty']
          }
        };

        expect(validationRules.username.minLength).toBe(3);
        expect(validationRules.email.maxLength).toBe(255);
        expect(validationRules.password.minLength).toBe(8);
      });

      test('should allow optional email properties', () => {
        const validationRules: UserValidationRules = {
          username: {
            minLength: 3,
            maxLength: 50,
            allowedCharacters: /^[a-zA-Z0-9_-]+$/,
            reservedNames: []
          },
          email: {
            maxLength: 255,
            domainWhitelist: ['company.com', 'partner.com'],
            domainBlacklist: ['spam.com', 'temp.com']
          },
          password: {
            minLength: 8,
            maxLength: 128,
            requireUppercase: false,
            requireLowercase: false,
            requireNumbers: false,
            requireSpecialChars: false,
            forbiddenPasswords: []
          }
        };

        expect(validationRules.email.domainWhitelist).toHaveLength(2);
        expect(validationRules.email.domainBlacklist).toHaveLength(2);
      });
    });
  });

  // ===================================
  // Utility Type Tests
  // ===================================

  describe('Utility Types', () => {
    describe('PublicUserData', () => {
      test('should exclude email from UserProfileData', () => {
        const publicData: PublicUserData = {
          id: 'user-123',
          username: 'testuser',
          role: UserRole.USER,
          isActive: true,
          createdAt: new Date()
        };

        expect(publicData.id).toBeDefined();
        expect(publicData.username).toBeDefined();
        expect(publicData.role).toBeDefined();
        expect(publicData.isActive).toBeDefined();
        expect(publicData.createdAt).toBeDefined();
        // Email should not be present in PublicUserData
        expect('email' in publicData).toBe(false);
      });
    });

    describe('UserRegistrationInput', () => {
      test('should have password instead of passwordHash', () => {
        const registrationInput: UserRegistrationInput = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'plainPassword123',
          role: UserRole.USER,
          isActive: true
        };

        expect(registrationInput.password).toBeDefined();
        expect('passwordHash' in registrationInput).toBe(false);
      });
    });

    describe('UserUpdateInput', () => {
      test('should allow optional password instead of passwordHash', () => {
        const updateInput: UserUpdateInput = {
          username: 'newusername',
          password: 'newPassword123'
        };

        expect(updateInput.username).toBe('newusername');
        expect(updateInput.password).toBe('newPassword123');
        expect('passwordHash' in updateInput).toBe(false);
      });
    });

    describe('ExtendedUserSearchFilters', () => {
      test('should extend UserSearchFilters with additional properties', () => {
        const extendedFilters: ExtendedUserSearchFilters = {
          username: 'test',
          email: 'test@example.com',
          role: UserRole.USER,
          isActive: true,
          accountStatus: UserAccountStatus.ACTIVE,
          hasRecentActivity: true,
          lastLoginBefore: new Date(),
          lastLoginAfter: new Date(Date.now() - 86400000) // 24 hours ago
        };

        expect(extendedFilters.accountStatus).toBe(UserAccountStatus.ACTIVE);
        expect(extendedFilters.hasRecentActivity).toBe(true);
        expect(extendedFilters.lastLoginBefore).toBeDefined();
        expect(extendedFilters.lastLoginAfter).toBeDefined();
      });
    });

    describe('UserWithComputedProperties', () => {
      test('should extend UserProfileData with computed properties', () => {
        const userWithComputed: UserWithComputedProperties = {
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          role: UserRole.ADMIN,
          isActive: true,
          createdAt: new Date(Date.now() - 86400000 * 30), // 30 days ago
          updatedAt: new Date(),
          isAdmin: true,
          canAccessSystem: true,
          daysSinceCreation: 30,
          accountAge: '1 month'
        };

        expect(userWithComputed.isAdmin).toBe(true);
        expect(userWithComputed.canAccessSystem).toBe(true);
        expect(userWithComputed.daysSinceCreation).toBe(30);
        expect(userWithComputed.accountAge).toBe('1 month');
      });
    });
  });

  // ===================================
  // Type Compatibility Tests
  // ===================================

  describe('Type Compatibility', () => {
    test('should be compatible with UserRole from entity', () => {
      const role: UserRole = UserRole.ADMIN;
      expect(role).toBe('admin');
    });

    test('should work with type guards on different object shapes', () => {
      interface TestUser {
        role: UserRole;
        isActive: boolean;
        name: string;
      }

      const testUser: TestUser = {
        role: UserRole.ADMIN,
        isActive: true,
        name: 'Test User'
      };

      expect(isAdminUser(testUser)).toBe(true);
      expect(isActiveUser(testUser)).toBe(true);
      expect(canPerformAdminActions(testUser)).toBe(true);
    });

    test('should handle partial objects correctly', () => {
      const partialUser: Partial<UserWithComputedProperties> = {
        username: 'partialuser',
        role: UserRole.USER
      };

      if (partialUser.role) {
        expect(isAdminUser({ role: partialUser.role })).toBe(false);
      }
    });
  });

  // ===================================
  // Edge Case Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle empty arrays in bulk operations', () => {
      const emptyBulkRequest: UserBulkOperationRequest = {
        userIds: [],
        operation: 'activate'
      };

      expect(emptyBulkRequest.userIds).toHaveLength(0);
    });

    test('should handle undefined optional properties', () => {
      const minimalCredentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123'
        // rememberMe is undefined
      };

      expect(minimalCredentials.rememberMe).toBeUndefined();
    });

    test('should handle complex nested objects', () => {
      const complexPreferences: UserPreferences = {
        userId: 'user-123',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        theme: 'dark',
        notifications: {
          email: true,
          push: true,
          sms: false,
          inApp: true
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showLastSeen: false
        }
      };

      expect(complexPreferences.notifications.email).toBe(true);
      expect(complexPreferences.privacy.profileVisibility).toBe('private');
    });

    test('should handle date objects in interfaces', () => {
      const session: UserSession = {
        userId: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        authStatus: UserAuthStatus.AUTHENTICATED,
        loginAt: new Date('2024-01-01T10:00:00Z'),
        lastActivityAt: new Date('2024-01-01T11:00:00Z'),
        expiresAt: new Date('2024-01-01T18:00:00Z')
      };

      expect(session.loginAt).toBeInstanceOf(Date);
      expect(session.lastActivityAt).toBeInstanceOf(Date);
      expect(session.expiresAt).toBeInstanceOf(Date);
    });

    test('should handle regex patterns in validation rules', () => {
      const validationRules: UserValidationRules = {
        username: {
          minLength: 3,
          maxLength: 50,
          allowedCharacters: /^[a-zA-Z0-9_-]+$/,
          reservedNames: ['admin', 'root']
        },
        email: {
          maxLength: 255
        },
        password: {
          minLength: 8,
          maxLength: 128,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSpecialChars: true,
          forbiddenPasswords: []
        }
      };

      expect(validationRules.username.allowedCharacters).toBeInstanceOf(RegExp);
      expect(validationRules.username.allowedCharacters.test('valid_username')).toBe(true);
      expect(validationRules.username.allowedCharacters.test('invalid username!')).toBe(false);
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration Tests', () => {
    test('should work together in realistic scenarios', () => {
      // Create a user registration scenario
      const registrationData: UserRegistrationData = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'SecurePass123!',
        confirmPassword: 'SecurePass123!',
        acceptTerms: true,
        newsletter: true
      };

      // Convert to registration input
      const registrationInput: UserRegistrationInput = {
        username: registrationData.username,
        email: registrationData.email,
        password: registrationData.password,
        role: UserRole.USER,
        isActive: true
      };

      // Create user session after login
      const userSession: UserSession = {
        userId: 'user-123',
        username: registrationInput.username,
        email: registrationInput.email,
        role: registrationInput.role!,
        authStatus: UserAuthStatus.AUTHENTICATED,
        loginAt: new Date(),
        lastActivityAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000) // 1 hour
      };

      // Validate session
      expect(isValidUserSession(userSession)).toBe(true);
      expect(isActiveUser({ isActive: registrationInput.isActive! })).toBe(true);
      expect(isAdminUser({ role: registrationInput.role! })).toBe(false);
    });

    test('should handle admin user workflow', () => {
      // Admin user data
      const adminUser = {
        role: UserRole.ADMIN,
        isActive: true
      };

      // Bulk operation by admin
      const bulkOperation: UserBulkOperationRequest = {
        userIds: ['user-1', 'user-2', 'user-3'],
        operation: 'change_role',
        parameters: {
          role: UserRole.ADMIN,
          reason: 'Promotion to admin role'
        }
      };

      // Validate admin permissions
      expect(canPerformAdminActions(adminUser)).toBe(true);
      expect(bulkOperation.userIds).toHaveLength(3);
      expect(bulkOperation.parameters?.role).toBe(UserRole.ADMIN);
    });

    test('should handle user preferences and settings together', () => {
      const userId = 'user-123';

      const preferences: UserPreferences = {
        userId,
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        theme: 'dark',
        notifications: {
          email: true,
          push: false,
          sms: false,
          inApp: true
        },
        privacy: {
          profileVisibility: 'private',
          showEmail: false,
          showLastSeen: true
        }
      };

      const notificationSettings: UserNotificationSettings = {
        userId,
        emailNotifications: preferences.notifications.email,
        pushNotifications: preferences.notifications.push,
        smsNotifications: preferences.notifications.sms,
        taskReminders: true,
        taskDeadlines: true,
        systemAnnouncements: true,
        securityAlerts: true,
        marketingEmails: false,
        quietHours: {
          enabled: true,
          startTime: '22:00',
          endTime: '08:00',
          timezone: preferences.timezone
        }
      };

      expect(preferences.userId).toBe(notificationSettings.userId);
      expect(notificationSettings.emailNotifications).toBe(preferences.notifications.email);
      expect(notificationSettings.quietHours.timezone).toBe(preferences.timezone);
    });
  });
});
