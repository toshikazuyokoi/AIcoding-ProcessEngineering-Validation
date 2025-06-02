/**
 * Test Fixtures Test Suite
 * 
 * Tests for the test fixtures module to ensure data consistency and validity
 * Validates fixture data, factory functions, and validation helpers
 * 
 * @fileoverview Test suite for test fixtures
 * @version 1.0.0
 * @since 2025-02-01
 */

import { UserRole, TaskPriority, TaskStatus } from '@prisma/client';
import {
  // Base fixtures
  BASE_USER,
  ADMIN_USER,
  INACTIVE_USER,
  TEST_USERS,
  WORK_CATEGORY,
  PERSONAL_CATEGORY,
  TEST_CATEGORIES,
  PENDING_TASK,
  IN_PROGRESS_TASK,
  COMPLETED_TASK,
  TEST_TASKS,
  TEST_TASK_CATEGORIES,
  TEST_DATES,
  
  // Factory functions
  generateId,
  createUserFixture,
  createTaskFixture,
  createCategoryFixture,
  createTaskCategoryFixture,
  createUserFixtures,
  createTaskFixtures,
  createCategoryFixtures,
  
  // Validation functions
  validateUserFixture,
  validateTaskFixture,
  validateCategoryFixture,
  
  // Collections
  FIXTURES,
  FACTORIES,
  VALIDATORS,
  
  // Types
  FixtureOptions
} from '../../tests/fixtures/test-fixtures';

describe('Test Fixtures', () => {
  describe('Base Fixtures', () => {
    describe('User Fixtures', () => {
      test('BASE_USER should have valid structure', () => {
        expect(BASE_USER).toMatchObject({
          id: expect.any(String),
          username: expect.any(String),
          email: expect.any(String),
          passwordHash: expect.any(String),
          role: UserRole.user,
          isActive: true,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
        
        expect(BASE_USER.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
        expect(BASE_USER.passwordHash).toMatch(/^\$2b\$/);
      });

      test('ADMIN_USER should have admin role', () => {
        expect(ADMIN_USER.role).toBe(UserRole.admin);
        expect(ADMIN_USER.isActive).toBe(true);
        expect(ADMIN_USER.username).toBe('admin');
      });

      test('INACTIVE_USER should be inactive', () => {
        expect(INACTIVE_USER.isActive).toBe(false);
        expect(INACTIVE_USER.role).toBe(UserRole.user);
      });

      test('TEST_USERS should contain multiple valid users', () => {
        expect(TEST_USERS).toHaveLength(3);
        
        TEST_USERS.forEach(user => {
          expect(validateUserFixture(user)).toBe(true);
          expect(user.role).toBe(UserRole.user);
          expect(user.isActive).toBe(true);
        });
        
        // Check unique emails
        const emails = TEST_USERS.map(u => u.email);
        expect(new Set(emails).size).toBe(emails.length);
      });
    });

    describe('Category Fixtures', () => {
      test('WORK_CATEGORY should have valid structure', () => {
        expect(WORK_CATEGORY).toMatchObject({
          id: expect.any(String),
          name: 'Work',
          color: expect.stringMatching(/^#[0-9A-Fa-f]{6}$/),
          description: expect.any(String),
          createdAt: expect.any(Date)
        });
      });

      test('TEST_CATEGORIES should contain multiple valid categories', () => {
        expect(TEST_CATEGORIES).toHaveLength(6);
        
        TEST_CATEGORIES.forEach(category => {
          expect(validateCategoryFixture(category)).toBe(true);
          expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });
        
        // Check unique names
        const names = TEST_CATEGORIES.map(c => c.name);
        expect(new Set(names).size).toBe(names.length);
      });
    });

    describe('Task Fixtures', () => {
      test('PENDING_TASK should have valid structure', () => {
        expect(PENDING_TASK).toMatchObject({
          id: expect.any(String),
          userId: expect.any(String),
          title: expect.any(String),
          description: expect.any(String),
          priority: TaskPriority.medium,
          status: TaskStatus.pending,
          dueDate: expect.any(Date),
          completedAt: null,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date)
        });
      });

      test('COMPLETED_TASK should have completedAt date', () => {
        expect(COMPLETED_TASK.status).toBe(TaskStatus.completed);
        expect(COMPLETED_TASK.completedAt).toBeInstanceOf(Date);
      });

      test('TEST_TASKS should contain multiple valid tasks', () => {
        expect(TEST_TASKS).toHaveLength(8);
        
        TEST_TASKS.forEach(task => {
          expect(validateTaskFixture(task)).toBe(true);
          expect(Object.values(TaskPriority)).toContain(task.priority);
          expect(Object.values(TaskStatus)).toContain(task.status);
        });
      });
    });

    describe('TaskCategory Fixtures', () => {
      test('TEST_TASK_CATEGORIES should have valid relationships', () => {
        expect(TEST_TASK_CATEGORIES.length).toBeGreaterThan(0);
        
        TEST_TASK_CATEGORIES.forEach(taskCategory => {
          expect(taskCategory).toMatchObject({
            taskId: expect.any(String),
            categoryId: expect.any(String),
            createdAt: expect.any(Date)
          });
        });
      });
    });
  });

  describe('Factory Functions', () => {
    describe('generateId', () => {
      test('should generate unique IDs with prefix', () => {
        const id1 = generateId('test');
        const id2 = generateId('test');
        
        expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
        expect(id2).toMatch(/^test-\d+-[a-z0-9]+$/);
        expect(id1).not.toBe(id2);
      });

      test('should include index when provided', () => {
        const id = generateId('test', 5);
        expect(id).toMatch(/^test-\d+-[a-z0-9]+-5$/);
      });
    });

    describe('createUserFixture', () => {
      test('should create user with default values', () => {
        const user = createUserFixture();
        
        expect(validateUserFixture(user)).toBe(true);
        expect(user.id).toBe(BASE_USER.id);
        expect(user.role).toBe(UserRole.user);
      });

      test('should apply overrides', () => {
        const user = createUserFixture({
          overrides: {
            username: 'customuser',
            role: UserRole.admin
          }
        });
        
        expect(user.username).toBe('customuser');
        expect(user.role).toBe(UserRole.admin);
      });

      test('should generate unique ID when requested', () => {
        const user = createUserFixture({ generateIds: true });
        
        expect(user.id).not.toBe(BASE_USER.id);
        expect(user.id).toMatch(/^user-\d+-[a-z0-9]+$/);
      });

      test('should exclude timestamps when requested', () => {
        const user = createUserFixture({ includeTimestamps: false });
        
        expect(user).not.toHaveProperty('createdAt');
        expect(user).not.toHaveProperty('updatedAt');
      });
    });

    describe('createTaskFixture', () => {
      test('should create task with default values', () => {
        const task = createTaskFixture();
        
        expect(validateTaskFixture(task)).toBe(true);
        expect(task.status).toBe(TaskStatus.pending);
        expect(task.priority).toBe(TaskPriority.medium);
      });

      test('should apply overrides', () => {
        const task = createTaskFixture({
          overrides: {
            title: 'Custom Task',
            priority: TaskPriority.high,
            status: TaskStatus.completed
          }
        });
        
        expect(task.title).toBe('Custom Task');
        expect(task.priority).toBe(TaskPriority.high);
        expect(task.status).toBe(TaskStatus.completed);
      });
    });

    describe('createCategoryFixture', () => {
      test('should create category with default values', () => {
        const category = createCategoryFixture();
        
        expect(validateCategoryFixture(category)).toBe(true);
        expect(category.name).toBe(WORK_CATEGORY.name);
        expect(category.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });

    describe('createUserFixtures', () => {
      test('should create multiple users with unique data', () => {
        const users = createUserFixtures(3);
        
        expect(users).toHaveLength(3);
        
        users.forEach((user, index) => {
          expect(validateUserFixture(user)).toBe(true);
          expect(user.username).toBe(`testuser${index + 1}`);
          expect(user.email).toBe(`test${index + 1}@example.com`);
        });
        
        // Check unique IDs
        const ids = users.map(u => u.id);
        expect(new Set(ids).size).toBe(ids.length);
      });
    });

    describe('createTaskFixtures', () => {
      test('should create multiple tasks for user', () => {
        const userId = 'test-user-123';
        const tasks = createTaskFixtures(3, userId);
        
        expect(tasks).toHaveLength(3);
        
        tasks.forEach((task, index) => {
          expect(validateTaskFixture(task)).toBe(true);
          expect(task.userId).toBe(userId);
          expect(task.title).toBe(`Test Task ${index + 1}`);
        });
      });
    });

    describe('createCategoryFixtures', () => {
      test('should create multiple categories with different colors', () => {
        const categories = createCategoryFixtures(4);
        
        expect(categories).toHaveLength(4);
        
        categories.forEach((category, index) => {
          expect(validateCategoryFixture(category)).toBe(true);
          expect(category.name).toBe(`Test Category ${index + 1}`);
        });
        
        // Check different colors
        const colors = categories.map(c => c.color);
        expect(new Set(colors).size).toBeGreaterThan(1);
      });
    });
  });

  describe('Validation Functions', () => {
    describe('validateUserFixture', () => {
      test('should validate valid user', () => {
        expect(validateUserFixture(BASE_USER)).toBe(true);
        expect(validateUserFixture(ADMIN_USER)).toBe(true);
      });

      test('should reject invalid user', () => {
        const invalidUser = { ...BASE_USER, id: '' };
        expect(validateUserFixture(invalidUser as any)).toBe(false);
      });
    });

    describe('validateTaskFixture', () => {
      test('should validate valid task', () => {
        expect(validateTaskFixture(PENDING_TASK)).toBe(true);
        expect(validateTaskFixture(COMPLETED_TASK)).toBe(true);
      });

      test('should reject invalid task', () => {
        const invalidTask = { ...PENDING_TASK, title: '' };
        expect(validateTaskFixture(invalidTask as any)).toBe(false);
      });
    });

    describe('validateCategoryFixture', () => {
      test('should validate valid category', () => {
        expect(validateCategoryFixture(WORK_CATEGORY)).toBe(true);
        expect(validateCategoryFixture(PERSONAL_CATEGORY)).toBe(true);
      });

      test('should reject invalid category', () => {
        const invalidCategory = { ...WORK_CATEGORY, color: 'invalid' };
        expect(validateCategoryFixture(invalidCategory as any)).toBe(false);
      });
    });
  });

  describe('Collections', () => {
    test('FIXTURES should provide organized access', () => {
      expect(FIXTURES.users.base).toBe(BASE_USER);
      expect(FIXTURES.users.admin).toBe(ADMIN_USER);
      expect(FIXTURES.tasks.pending).toBe(PENDING_TASK);
      expect(FIXTURES.categories.work).toBe(WORK_CATEGORY);
      expect(FIXTURES.dates).toBe(TEST_DATES);
    });

    test('FACTORIES should provide all factory functions', () => {
      expect(typeof FACTORIES.user).toBe('function');
      expect(typeof FACTORIES.task).toBe('function');
      expect(typeof FACTORIES.category).toBe('function');
      expect(typeof FACTORIES.users).toBe('function');
    });

    test('VALIDATORS should provide all validation functions', () => {
      expect(typeof VALIDATORS.user).toBe('function');
      expect(typeof VALIDATORS.task).toBe('function');
      expect(typeof VALIDATORS.category).toBe('function');
    });
  });

  describe('Date Constants', () => {
    test('TEST_DATES should have proper date relationships', () => {
      expect(TEST_DATES.PAST_DATE.getTime()).toBeLessThan(TEST_DATES.CURRENT_DATE.getTime());
      expect(TEST_DATES.CURRENT_DATE.getTime()).toBeLessThan(TEST_DATES.FUTURE_DATE.getTime());
      expect(TEST_DATES.OVERDUE_DATE.getTime()).toBeLessThan(TEST_DATES.CURRENT_DATE.getTime());
      expect(TEST_DATES.TOMORROW.getTime()).toBeGreaterThan(TEST_DATES.CURRENT_DATE.getTime());
    });
  });
});
