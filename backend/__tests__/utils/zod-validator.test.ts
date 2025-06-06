/**
 * ===================================
 * Zod Validator Test Suite
 * ===================================
 * Purpose: Comprehensive tests for Zod validation functionality
 * Features:
 * - Schema validation testing
 * - Error handling testing
 * - Performance testing
 * - Edge case testing
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { z } from 'zod';
import {
  ZodValidator,
  ValidationPatterns,
  UserSchemas,
  TaskSchemas,
  CategorySchemas,
  createValidator,
  validateData,
  validateField,
  ZodValidationError
} from '../../src/utils/zod-validator';

describe('ZodValidator', () => {
  let validator: ZodValidator;

  beforeEach(() => {
    validator = ZodValidator.getInstance();
  });

  // ===================================
  // Singleton Pattern Tests
  // ===================================

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ZodValidator.getInstance();
      const instance2 = ZodValidator.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should return same instance from createValidator', () => {
      const instance1 = createValidator();
      const instance2 = ZodValidator.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  // ===================================
  // Validation Pattern Tests
  // ===================================

  describe('ValidationPatterns', () => {
    describe('email pattern', () => {
      test('should validate correct email addresses', async () => {
        const validEmails = [
          'test@example.com',
          'user.name@domain.co.uk',
          'user+tag@example.org'
        ];

        for (const email of validEmails) {
          const result = await validateField(email, ValidationPatterns.email, 'email');
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('should reject invalid email addresses', async () => {
        const invalidEmails = [
          'invalid-email',
          '@domain.com',
          'user@',
          'user.domain.com'
        ];

        for (const email of invalidEmails) {
          const result = await validateField(email, ValidationPatterns.email, 'email');
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });

    describe('password pattern', () => {
      test('should validate strong passwords', async () => {
        const validPasswords = [
          'StrongPass123!',
          'AnotherGood1@',
          'Complex9$Pass'
        ];

        for (const password of validPasswords) {
          const result = await validateField(password, ValidationPatterns.password, 'password');
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('should reject weak passwords', async () => {
        const invalidPasswords = [
          'weak',
          'NoNumbers!',
          'nonumbers123',
          'NOLOWERCASE123!',
          'nouppercase123!',
          'NoSpecial123'
        ];

        for (const password of invalidPasswords) {
          const result = await validateField(password, ValidationPatterns.password, 'password');
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });

    describe('username pattern', () => {
      test('should validate correct usernames', async () => {
        const validUsernames = [
          'user123',
          'test_user',
          'user-name',
          'TestUser'
        ];

        for (const username of validUsernames) {
          const result = await validateField(username, ValidationPatterns.username, 'username');
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('should reject invalid usernames', async () => {
        const invalidUsernames = [
          'ab', // too short
          'a'.repeat(51), // too long
          'user@name', // invalid character
          'user name', // space
          'user.name' // dot
        ];

        for (const username of invalidUsernames) {
          const result = await validateField(username, ValidationPatterns.username, 'username');
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });

    describe('uuid pattern', () => {
      test('should validate correct UUIDs', async () => {
        const validUUIDs = [
          '123e4567-e89b-12d3-a456-426614174000',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          '6ba7b810-9dad-11d1-80b4-00c04fd430c8'
        ];

        for (const uuid of validUUIDs) {
          const result = await validateField(uuid, ValidationPatterns.uuid, 'uuid');
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('should reject invalid UUIDs', async () => {
        const invalidUUIDs = [
          'not-a-uuid',
          '123e4567-e89b-12d3-a456',
          '123e4567-e89b-12d3-a456-426614174000-extra'
        ];

        for (const uuid of invalidUUIDs) {
          const result = await validateField(uuid, ValidationPatterns.uuid, 'uuid');
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });

    describe('hexColor pattern', () => {
      test('should validate correct hex colors', async () => {
        const validColors = [
          '#FF0000',
          '#00ff00',
          '#123ABC'
        ];

        for (const color of validColors) {
          const result = await validateField(color, ValidationPatterns.hexColor, 'color');
          expect(result.isValid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }
      });

      test('should reject invalid hex colors', async () => {
        const invalidColors = [
          'FF0000', // missing #
          '#GG0000', // invalid character
          '#FF', // too short
          '#FF00000' // too long
        ];

        for (const color of invalidColors) {
          const result = await validateField(color, ValidationPatterns.hexColor, 'color');
          expect(result.isValid).toBe(false);
          expect(result.errors.length).toBeGreaterThan(0);
        }
      });
    });
  });

  // ===================================
  // User Schema Tests
  // ===================================

  describe('UserSchemas', () => {
    describe('register schema', () => {
      test('should validate correct registration data', async () => {
        const validData = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'StrongPass123!',
          role: 'user' as const
        };

        const result = await validateData(validData, UserSchemas.register);
        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(validData);
        expect(result.errors).toHaveLength(0);
      });

      test('should apply default role', async () => {
        const dataWithoutRole = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'StrongPass123!'
        };

        const result = await validateData(dataWithoutRole, UserSchemas.register);
        expect(result.isValid).toBe(true);
        expect(result.data?.role).toBe('user');
      });

      test('should reject invalid registration data', async () => {
        const invalidData = {
          username: 'ab', // too short
          email: 'invalid-email',
          password: 'weak',
          role: 'invalid' as any
        };

        const result = await validateData(invalidData, UserSchemas.register);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('login schema', () => {
      test('should validate correct login data', async () => {
        const validData = {
          email: 'test@example.com',
          password: 'anypassword'
        };

        const result = await validateData(validData, UserSchemas.login);
        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(validData);
      });

      test('should reject missing fields', async () => {
        const invalidData = {
          email: 'test@example.com'
          // missing password
        };

        const result = await validateData(invalidData, UserSchemas.login);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'password')).toBe(true);
      });
    });

    describe('passwordChange schema', () => {
      test('should validate matching passwords', async () => {
        const validData = {
          currentPassword: 'oldpass',
          newPassword: 'NewStrongPass123!',
          confirmPassword: 'NewStrongPass123!'
        };

        const result = await validateData(validData, UserSchemas.passwordChange);
        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(validData);
      });

      test('should reject non-matching passwords', async () => {
        const invalidData = {
          currentPassword: 'oldpass',
          newPassword: 'NewStrongPass123!',
          confirmPassword: 'DifferentPass123!'
        };

        const result = await validateData(invalidData, UserSchemas.passwordChange);
        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.field === 'confirmPassword')).toBe(true);
      });
    });
  });

  // ===================================
  // Task Schema Tests
  // ===================================

  describe('TaskSchemas', () => {
    describe('create schema', () => {
      test('should validate correct task creation data', async () => {
        const validData = {
          title: 'Test Task',
          description: 'Task description',
          priority: 'high' as const,
          dueDate: '2024-12-31T23:59:59.000Z',
          categoryIds: ['123e4567-e89b-12d3-a456-426614174000']
        };

        const result = await validateData(validData, TaskSchemas.create);
        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(validData);
      });

      test('should apply default priority', async () => {
        const dataWithoutPriority = {
          title: 'Test Task'
        };

        const result = await validateData(dataWithoutPriority, TaskSchemas.create);
        expect(result.isValid).toBe(true);
        expect(result.data?.priority).toBe('medium');
      });

      test('should reject invalid task data', async () => {
        const invalidData = {
          title: '', // empty title
          description: 'a'.repeat(1001), // too long
          priority: 'invalid' as any,
          dueDate: 'invalid-date',
          categoryIds: ['invalid-uuid']
        };

        const result = await validateData(invalidData, TaskSchemas.create);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('searchFilters schema', () => {
      test('should validate search filters with defaults', async () => {
        const validData = {
          status: 'pending' as const,
          search: 'test'
        };

        const result = await validateData(validData, TaskSchemas.searchFilters);
        expect(result.isValid).toBe(true);
        expect(result.data?.page).toBe(1);
        expect(result.data?.limit).toBe(20);
      });

      test('should validate pagination limits', async () => {
        const invalidData = {
          page: 0, // invalid page
          limit: 101 // exceeds max limit
        };

        const result = await validateData(invalidData, TaskSchemas.searchFilters);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  // ===================================
  // Category Schema Tests
  // ===================================

  describe('CategorySchemas', () => {
    describe('create schema', () => {
      test('should validate correct category creation data', async () => {
        const validData = {
          name: 'Work',
          color: '#FF0000',
          description: 'Work related tasks'
        };

        const result = await validateData(validData, CategorySchemas.create);
        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(validData);
      });

      test('should reject invalid category data', async () => {
        const invalidData = {
          name: '', // empty name
          color: 'invalid-color',
          description: 'a'.repeat(501) // too long
        };

        const result = await validateData(invalidData, CategorySchemas.create);
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });
  });

  // ===================================
  // Validator Methods Tests
  // ===================================

  describe('Validator Methods', () => {
    describe('validate method', () => {
      test('should handle successful validation', async () => {
        const schema = z.object({
          name: z.string().min(1),
          age: z.number().positive()
        });

        const validData = { name: 'John', age: 25 };
        const result = await validator.validate(validData, schema);

        expect(result.isValid).toBe(true);
        expect(result.data).toEqual(validData);
        expect(result.errors).toHaveLength(0);
      });

      test('should handle validation errors', async () => {
        const schema = z.object({
          name: z.string().min(1),
          age: z.number().positive()
        });

        const invalidData = { name: '', age: -1 };
        const result = await validator.validate(invalidData, schema);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
        expect(result.errors.some(e => e.field === 'name')).toBe(true);
        expect(result.errors.some(e => e.field === 'age')).toBe(true);
      });

      test('should handle unexpected errors', async () => {
        const schema = z.object({
          name: z.string()
        });

        // Simulate unexpected error by passing null
        const result = await validator.validate(null, schema);

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('validateField method', () => {
      test('should validate single field successfully', async () => {
        const result = await validator.validateField('test@example.com', ValidationPatterns.email, 'email');

        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });

      test('should handle single field validation errors', async () => {
        const result = await validator.validateField('invalid-email', ValidationPatterns.email, 'email');

        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
      });
    });

    describe('safeParse method', () => {
      test('should return success result for valid data', () => {
        const schema = z.object({ name: z.string() });
        const validData = { name: 'test' };

        const result = validator.safeParse(validData, schema);

        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toEqual(validData);
        }
      });

      test('should return detailed error information for invalid data', () => {
        const schema = z.object({
          name: z.string().min(1),
          age: z.number().positive()
        });
        const invalidData = { name: '', age: -1 };

        const result = validator.safeParse(invalidData, schema);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.errors.length).toBeGreaterThan(0);
          expect(result.errors[0]).toHaveProperty('path');
          expect(result.errors[0]).toHaveProperty('code');
        }
      });
    });

    describe('custom messages', () => {
      test('should use custom error messages', async () => {
        validator.setCustomMessages({
          'name.too_small': 'Name is required and cannot be empty'
        });

        const schema = z.object({ name: z.string().min(1) });
        const result = await validator.validate({ name: '' }, schema);

        expect(result.isValid).toBe(false);
        expect(result.errors.some(e => e.message.includes('Name is required'))).toBe(true);
      });
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    test('validateData helper should work correctly', async () => {
      const schema = z.object({ name: z.string() });
      const data = { name: 'test' };

      const result = await validateData(data, schema);

      expect(result.isValid).toBe(true);
      expect(result.data).toEqual(data);
    });

    test('validateField helper should work correctly', async () => {
      const result = await validateField('test@example.com', ValidationPatterns.email);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  // ===================================
  // Performance Tests
  // ===================================

  describe('Performance Tests', () => {
    test('should validate large datasets efficiently', async () => {
      const schema = UserSchemas.register;
      const validData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      };

      const startTime = Date.now();

      // Validate 100 times (reduced for test performance)
      const promises = Array(100).fill(null).map(() =>
        validateData(validData, schema)
      );

      await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time
      expect(duration).toBeLessThan(2000); // 2 seconds
    });

    test('should handle concurrent validations', async () => {
      const schema = TaskSchemas.create;
      const validData = {
        title: 'Test Task',
        priority: 'medium' as const
      };

      const promises = Array(50).fill(null).map((_, index) =>
        validateData({ ...validData, title: `Task ${index}` }, schema)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(50);
      expect(results.every(r => r.isValid)).toBe(true);
    });
  });

  // ===================================
  // Edge Cases Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle null and undefined values', async () => {
      const schema = z.object({ name: z.string().optional() });

      const nullResult = await validateData({ name: null }, schema);
      const undefinedResult = await validateData({ name: undefined }, schema);
      const missingResult = await validateData({}, schema);

      expect(undefinedResult.isValid).toBe(true);
      expect(missingResult.isValid).toBe(true);
      // null should be invalid for optional string
      expect(nullResult.isValid).toBe(false);
    });

    test('should handle empty objects and arrays', async () => {
      const schema = z.object({
        tags: z.array(z.string()).optional(),
        metadata: z.object({}).optional()
      });

      const result = await validateData({
        tags: [],
        metadata: {}
      }, schema);

      expect(result.isValid).toBe(true);
    });

    test('should handle deeply nested objects', async () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            settings: z.object({
              theme: z.string()
            })
          })
        })
      });

      const validData = {
        user: {
          profile: {
            settings: {
              theme: 'dark'
            }
          }
        }
      };

      const result = await validateData(validData, schema);
      expect(result.isValid).toBe(true);
    });
  });
});
