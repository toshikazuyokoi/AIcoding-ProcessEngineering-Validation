/**
 * ===================================
 * User Entity Test Suite
 * ===================================
 * Purpose: Comprehensive tests for User entity class
 * Features:
 * - User creation and validation
 * - Business logic testing
 * - Profile management
 * - Authentication and authorization
 * - Role management
 * - Error handling and edge cases
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  User,
  UserRole,
  UserCreationData,
  UserUpdateData,
  UserProfileData
} from '../../../src/domain/entities/user.entity';
import { EntityValidationError } from '../../../src/domain/entities/base.entity';

describe('User Entity', () => {
  let validUserData: UserCreationData;

  beforeEach(() => {
    validUserData = {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: '$2b$10$validHashedPassword123',
      role: UserRole.USER,
      isActive: true
    };
  });

  // ===================================
  // User Creation Tests
  // ===================================

  describe('User Creation', () => {
    test('should create user with valid data', () => {
      const user = new User(validUserData);

      expect(user.id).toBeDefined();
      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('$2b$10$validHashedPassword123');
      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    test('should create user with default role and active status', () => {
      const userData = {
        username: 'defaultuser',
        email: 'default@example.com',
        passwordHash: '$2b$10$validHashedPassword123'
      };

      const user = new User(userData);

      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
    });

    test('should create admin user', () => {
      const adminData = {
        ...validUserData,
        role: UserRole.ADMIN
      };

      const user = new User(adminData);

      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.isAdmin()).toBe(true);
      expect(user.isUser()).toBe(false);
    });

    test('should create inactive user', () => {
      const inactiveData = {
        ...validUserData,
        isActive: false
      };

      const user = new User(inactiveData);

      expect(user.isActive).toBe(false);
      expect(user.canAccessSystem()).toBe(false);
    });
  });

  // ===================================
  // Validation Tests
  // ===================================

  describe('Validation', () => {
    test('should throw error for empty username', () => {
      const invalidData = {
        ...validUserData,
        username: ''
      };

      expect(() => new User(invalidData)).toThrow(EntityValidationError);
      expect(() => new User(invalidData)).toThrow('Username is required');
    });

    test('should throw error for short username', () => {
      const invalidData = {
        ...validUserData,
        username: 'ab'
      };

      expect(() => new User(invalidData)).toThrow(EntityValidationError);
      expect(() => new User(invalidData)).toThrow('Username must be at least 3 characters long');
    });

    test('should throw error for long username', () => {
      const invalidData = {
        ...validUserData,
        username: 'a'.repeat(51)
      };

      expect(() => new User(invalidData)).toThrow(EntityValidationError);
      expect(() => new User(invalidData)).toThrow('Username must not exceed 50 characters');
    });

    test('should throw error for invalid email format', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        '.test@example.com',
        'test.@example.com',
        'test@.example.com',
        'test@example..com'
      ];

      invalidEmails.forEach(email => {
        const invalidData = {
          ...validUserData,
          email
        };

        expect(() => new User(invalidData)).toThrow(EntityValidationError);
        expect(() => new User(invalidData)).toThrow('Invalid email format');
      });
    });

    test('should throw error for empty email', () => {
      const invalidData = {
        ...validUserData,
        email: ''
      };

      expect(() => new User(invalidData)).toThrow(EntityValidationError);
      expect(() => new User(invalidData)).toThrow('Email is required');
    });

    test('should throw error for short password hash', () => {
      const invalidData = {
        ...validUserData,
        passwordHash: 'short'
      };

      expect(() => new User(invalidData)).toThrow(EntityValidationError);
      expect(() => new User(invalidData)).toThrow('Password hash must be properly formatted');
    });

    test('should throw error for empty password hash', () => {
      const invalidData = {
        ...validUserData,
        passwordHash: ''
      };

      expect(() => new User(invalidData)).toThrow(EntityValidationError);
      expect(() => new User(invalidData)).toThrow('Password hash is required');
    });
  });

  // ===================================
  // Role and Permission Tests
  // ===================================

  describe('Role and Permissions', () => {
    test('should identify admin user correctly', () => {
      const adminUser = new User({
        ...validUserData,
        role: UserRole.ADMIN
      });

      expect(adminUser.isAdmin()).toBe(true);
      expect(adminUser.isUser()).toBe(false);
      expect(adminUser.canPerformAdminActions()).toBe(true);
    });

    test('should identify regular user correctly', () => {
      const regularUser = new User(validUserData);

      expect(regularUser.isAdmin()).toBe(false);
      expect(regularUser.isUser()).toBe(true);
      expect(regularUser.canPerformAdminActions()).toBe(false);
    });

    test('should prevent admin actions for inactive admin', () => {
      const inactiveAdmin = new User({
        ...validUserData,
        role: UserRole.ADMIN,
        isActive: false
      });

      expect(inactiveAdmin.isAdmin()).toBe(true);
      expect(inactiveAdmin.canPerformAdminActions()).toBe(false);
    });

    test('should promote user to admin', () => {
      const user = new User(validUserData);

      user.promoteToAdmin();

      expect(user.role).toBe(UserRole.ADMIN);
      expect(user.isAdmin()).toBe(true);
    });

    test('should throw error when promoting inactive user', () => {
      const inactiveUser = new User({
        ...validUserData,
        isActive: false
      });

      expect(() => inactiveUser.promoteToAdmin()).toThrow(EntityValidationError);
      expect(() => inactiveUser.promoteToAdmin()).toThrow('Cannot promote inactive user to admin');
    });

    test('should demote admin to user', () => {
      const adminUser = new User({
        ...validUserData,
        role: UserRole.ADMIN
      });

      adminUser.demoteToUser();

      expect(adminUser.role).toBe(UserRole.USER);
      expect(adminUser.isUser()).toBe(true);
    });
  });

  // ===================================
  // Account Management Tests
  // ===================================

  describe('Account Management', () => {
    test('should activate user account', () => {
      const inactiveUser = new User({
        ...validUserData,
        isActive: false
      });

      inactiveUser.activate();

      expect(inactiveUser.isActive).toBe(true);
      expect(inactiveUser.canAccessSystem()).toBe(true);
    });

    test('should deactivate user account', () => {
      const user = new User(validUserData);

      user.deactivate();

      expect(user.isActive).toBe(false);
      expect(user.canAccessSystem()).toBe(false);
    });

    test('should check account active status', () => {
      const activeUser = new User(validUserData);
      const inactiveUser = new User({
        ...validUserData,
        isActive: false
      });

      expect(activeUser.isAccountActive()).toBe(true);
      expect(inactiveUser.isAccountActive()).toBe(false);
    });
  });

  // ===================================
  // Password Management Tests
  // ===================================

  describe('Password Management', () => {
    test('should validate password (placeholder implementation)', () => {
      const user = new User(validUserData);

      // Note: This is a placeholder implementation
      expect(user.validatePassword('validpassword')).toBe(true);
      expect(user.validatePassword('short')).toBe(false);
      expect(user.validatePassword('')).toBe(false);
    });

    test('should change password', () => {
      const user = new User(validUserData);
      const newPasswordHash = '$2b$10$newValidHashedPassword456';

      user.changePassword(newPasswordHash);

      expect(user.passwordHash).toBe(newPasswordHash);
    });

    test('should throw error for invalid new password hash', () => {
      const user = new User(validUserData);

      expect(() => user.changePassword('')).toThrow(EntityValidationError);
      expect(() => user.changePassword('short')).toThrow(EntityValidationError);
    });
  });

  // ===================================
  // Profile Management Tests
  // ===================================

  describe('Profile Management', () => {
    test('should update profile successfully', () => {
      const user = new User(validUserData);
      const updateData: UserUpdateData = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      user.updateProfile(updateData);

      expect(user.username).toBe('updateduser');
      expect(user.email).toBe('updated@example.com');
    });

    test('should rollback changes on validation failure', () => {
      const user = new User(validUserData);
      const originalUsername = user.username;
      const originalEmail = user.email;

      const invalidUpdateData: UserUpdateData = {
        username: 'ab', // Too short
        email: 'invalid-email'
      };

      expect(() => user.updateProfile(invalidUpdateData)).toThrow(EntityValidationError);
      expect(user.username).toBe(originalUsername);
      expect(user.email).toBe(originalEmail);
    });

    test('should get user profile', () => {
      const user = new User(validUserData);
      const profile = user.getProfile();

      expect(profile).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        role: UserRole.USER,
        isActive: true
      });
    });

    test('should update only specified fields', () => {
      const user = new User(validUserData);
      const originalEmail = user.email;

      user.updateProfile({ username: 'newusername' });

      expect(user.username).toBe('newusername');
      expect(user.email).toBe(originalEmail);
    });
  });

  // ===================================
  // Serialization Tests
  // ===================================

  describe('Serialization', () => {
    test('should serialize to plain object without password hash', () => {
      const user = new User(validUserData);
      const plainObject = user.toPlainObject();

      expect(plainObject).toHaveProperty('id');
      expect(plainObject).toHaveProperty('username', 'testuser');
      expect(plainObject).toHaveProperty('email', 'test@example.com');
      expect(plainObject).toHaveProperty('role', UserRole.USER);
      expect(plainObject).toHaveProperty('isActive', true);
      expect(plainObject).toHaveProperty('createdAt');
      expect(plainObject).toHaveProperty('updatedAt');
      expect(plainObject).not.toHaveProperty('passwordHash');
    });

    test('should serialize to JSON without password hash', () => {
      const user = new User(validUserData);
      const jsonString = user.toJSON();
      const parsedObject = JSON.parse(jsonString);

      expect(parsedObject).toHaveProperty('username', 'testuser');
      expect(parsedObject).toHaveProperty('email', 'test@example.com');
      expect(parsedObject).not.toHaveProperty('passwordHash');
    });
  });

  // ===================================
  // Cloning Tests
  // ===================================

  describe('Cloning', () => {
    test('should clone user with same properties', () => {
      const user = new User(validUserData);
      const clonedUser = user.clone();

      expect(clonedUser).not.toBe(user);
      expect(clonedUser.id).toBe(user.id);
      expect(clonedUser.username).toBe(user.username);
      expect(clonedUser.email).toBe(user.email);
      expect(clonedUser.role).toBe(user.role);
      expect(clonedUser.isActive).toBe(user.isActive);
    });

    test('should clone user with updated properties', () => {
      const user = new User(validUserData);
      const updates = {
        username: 'cloneduser',
        role: UserRole.ADMIN
      };

      const clonedUser = user.clone(updates);

      expect(clonedUser).not.toBe(user);
      expect(clonedUser.id).toBe(user.id);
      expect(clonedUser.username).toBe('cloneduser');
      expect(clonedUser.role).toBe(UserRole.ADMIN);
      expect(clonedUser.email).toBe(user.email);
    });
  });

  // ===================================
  // Edge Cases and Error Handling
  // ===================================

  describe('Edge Cases', () => {
    test('should handle username with whitespace', () => {
      const userData = {
        ...validUserData,
        username: '   validuser   '
      };

      // The entity should handle trimming in validation
      expect(() => new User(userData)).not.toThrow();
    });

    test('should handle email case sensitivity', () => {
      const userData = {
        ...validUserData,
        email: 'TEST@EXAMPLE.COM'
      };

      const user = new User(userData);
      expect(user.email).toBe('TEST@EXAMPLE.COM');
    });

    test('should maintain entity type', () => {
      const user = new User(validUserData);
      expect(user.getEntityType()).toBe('User');
    });

    test('should handle timestamp updates correctly', async () => {
      const user = new User(validUserData);
      const originalUpdatedAt = user.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      user.updateProfile({ username: 'newusername' });

      expect(user.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });
});
