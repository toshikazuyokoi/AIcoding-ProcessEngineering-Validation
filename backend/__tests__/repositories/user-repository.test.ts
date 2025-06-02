/**
 * User Repository Test Suite
 * 
 * Comprehensive tests for user repository implementation
 * Tests user-specific operations, authentication support, and validation
 * 
 * @fileoverview Test suite for UserRepository class
 * @version 1.0.0
 * @since 2025-02-01
 */

import { User, UserRole } from '@prisma/client';
import { UserRepository, CreateUserData, UpdateUserData, UserSearchFilters } from '../../src/repositories/user-repository';
import { ValidationError, NotFoundError } from '../../src/utils/error-handler';

// Mock dependencies
jest.mock('../../src/utils/database-connection');
jest.mock('../../src/utils/logger');

// Test data
const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: '$2b$12$hashedpassword123456789',
  role: UserRole.user,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z')
};

const mockAdminUser: User = {
  id: 'admin-123',
  username: 'adminuser',
  email: 'admin@example.com',
  passwordHash: '$2b$12$hashedpassword123456789',
  role: UserRole.admin,
  isActive: true,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z')
};

describe('UserRepository', () => {
  let repository: UserRepository;
  let mockPrisma: any;
  let mockUserModel: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Prisma user model
    mockUserModel = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    mockPrisma = {
      user: mockUserModel
    };

    // Mock getPrismaClient
    (require('../../src/utils/database-connection').getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

    // Create repository instance
    repository = new UserRepository();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with user-specific configuration', () => {
      const config = repository.getConfig();

      expect(config.enableCaching).toBe(true);
      expect(config.cacheTimeout).toBe(600);
      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(true);
    });

    test('should return correct model name', () => {
      expect(repository.getModelName()).toBe('User');
    });
  });

  describe('Email-based Operations', () => {
    test('should find user by email successfully', async () => {
      mockUserModel.findUnique.mockResolvedValue(mockUser);

      const result = await repository.findByEmail('test@example.com');

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
      expect(result).toEqual(mockUser);
    });

    test('should return null when user not found by email', async () => {
      mockUserModel.findUnique.mockResolvedValue(null);

      const result = await repository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });

    test('should normalize email to lowercase', async () => {
      mockUserModel.findUnique.mockResolvedValue(mockUser);

      await repository.findByEmail('TEST@EXAMPLE.COM');

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' }
      });
    });

    test('should throw ValidationError for invalid email format', async () => {
      await expect(repository.findByEmail('invalid-email')).rejects.toThrow(ValidationError);
      await expect(repository.findByEmail('')).rejects.toThrow(ValidationError);
    });

    test('should check if user exists by email', async () => {
      mockUserModel.findUnique.mockResolvedValue({ id: 'user-123' });

      const exists = await repository.existsByEmail('test@example.com');

      expect(mockUserModel.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        select: { id: true }
      });
      expect(exists).toBe(true);
    });

    test('should return false when user does not exist by email', async () => {
      mockUserModel.findUnique.mockResolvedValue(null);

      const exists = await repository.existsByEmail('nonexistent@example.com');

      expect(exists).toBe(false);
    });
  });

  describe('Username-based Operations', () => {
    test('should find user by username successfully', async () => {
      mockUserModel.findFirst.mockResolvedValue(mockUser);

      const result = await repository.findByUsername('testuser');

      expect(mockUserModel.findFirst).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
      expect(result).toEqual(mockUser);
    });

    test('should return null when user not found by username', async () => {
      mockUserModel.findFirst.mockResolvedValue(null);

      const result = await repository.findByUsername('nonexistent');

      expect(result).toBeNull();
    });

    test('should trim username before search', async () => {
      mockUserModel.findFirst.mockResolvedValue(mockUser);

      await repository.findByUsername('  testuser  ');

      expect(mockUserModel.findFirst).toHaveBeenCalledWith({
        where: { username: 'testuser' }
      });
    });

    test('should throw ValidationError for short username', async () => {
      await expect(repository.findByUsername('ab')).rejects.toThrow(ValidationError);
      await expect(repository.findByUsername('')).rejects.toThrow(ValidationError);
    });

    test('should check if user exists by username', async () => {
      mockUserModel.findFirst.mockResolvedValue({ id: 'user-123' });

      const exists = await repository.existsByUsername('testuser');

      expect(mockUserModel.findFirst).toHaveBeenCalledWith({
        where: { username: 'testuser' },
        select: { id: true }
      });
      expect(exists).toBe(true);
    });

    test('should return false when user does not exist by username', async () => {
      mockUserModel.findFirst.mockResolvedValue(null);

      const exists = await repository.existsByUsername('nonexistent');

      expect(exists).toBe(false);
    });
  });

  describe('Active User Operations', () => {
    test('should find active users only', async () => {
      const activeUsers = [mockUser, mockAdminUser];
      mockUserModel.findMany.mockResolvedValue(activeUsers);

      const result = await repository.findActiveUsers();

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(activeUsers);
    });

    test('should find active users with additional filters', async () => {
      const activeUsers = [mockUser];
      mockUserModel.findMany.mockResolvedValue(activeUsers);

      const options = {
        where: { role: UserRole.user },
        take: 10
      };

      const result = await repository.findActiveUsers(options);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: { isActive: true, role: UserRole.user },
        orderBy: undefined,
        skip: undefined,
        take: 10,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(activeUsers);
    });
  });

  describe('Role-based Operations', () => {
    test('should find users by role', async () => {
      const adminUsers = [mockAdminUser];
      mockUserModel.findMany.mockResolvedValue(adminUsers);

      const result = await repository.findByRole(UserRole.admin);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: { role: UserRole.admin },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(adminUsers);
    });

    test('should count users by role', async () => {
      mockUserModel.count.mockResolvedValue(5);

      const count = await repository.countByRole(UserRole.user);

      expect(mockUserModel.count).toHaveBeenCalledWith({
        where: { role: UserRole.user }
      });
      expect(count).toBe(5);
    });

    test('should change user role', async () => {
      const updatedUser = { ...mockUser, role: UserRole.admin };
      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check
      mockUserModel.update.mockResolvedValue(updatedUser);

      const result = await repository.changeUserRole('user-123', UserRole.admin);

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { role: UserRole.admin }
      });
      expect(result).toEqual(updatedUser);
    });
  });

  describe('User Status Management', () => {
    test('should deactivate user', async () => {
      const deactivatedUser = { ...mockUser, isActive: false };
      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check
      mockUserModel.update.mockResolvedValue(deactivatedUser);

      const result = await repository.deactivateUser('user-123');

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: false }
      });
      expect(result).toEqual(deactivatedUser);
    });

    test('should activate user', async () => {
      const activatedUser = { ...mockUser, isActive: true };
      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check
      mockUserModel.update.mockResolvedValue(activatedUser);

      const result = await repository.activateUser('user-123');

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: { isActive: true }
      });
      expect(result).toEqual(activatedUser);
    });
  });

  describe('User Search Operations', () => {
    test('should search users with username filter', async () => {
      const searchResults = [mockUser];
      mockUserModel.findMany.mockResolvedValue(searchResults);

      const filters: UserSearchFilters = {
        username: 'test'
      };

      const result = await repository.searchUsers(filters);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: {
          username: {
            contains: 'test',
            mode: 'insensitive'
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(searchResults);
    });

    test('should search users with email filter', async () => {
      const searchResults = [mockUser];
      mockUserModel.findMany.mockResolvedValue(searchResults);

      const filters: UserSearchFilters = {
        email: 'example.com'
      };

      const result = await repository.searchUsers(filters);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: {
          email: {
            contains: 'example.com',
            mode: 'insensitive'
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(searchResults);
    });

    test('should search users with role and active status filters', async () => {
      const searchResults = [mockUser];
      mockUserModel.findMany.mockResolvedValue(searchResults);

      const filters: UserSearchFilters = {
        role: UserRole.user,
        isActive: true
      };

      const result = await repository.searchUsers(filters);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: {
          role: UserRole.user,
          isActive: true
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(searchResults);
    });

    test('should search users with date range filters', async () => {
      const searchResults = [mockUser];
      mockUserModel.findMany.mockResolvedValue(searchResults);

      const createdAfter = new Date('2024-01-01');
      const createdBefore = new Date('2025-12-31');

      const filters: UserSearchFilters = {
        createdAfter,
        createdBefore
      };

      const result = await repository.searchUsers(filters);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: createdAfter,
            lte: createdBefore
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(searchResults);
    });

    test('should search users with combined filters', async () => {
      const searchResults = [mockUser];
      mockUserModel.findMany.mockResolvedValue(searchResults);

      const filters: UserSearchFilters = {
        username: 'test',
        role: UserRole.user,
        isActive: true,
        createdAfter: new Date('2024-01-01')
      };

      const result = await repository.searchUsers(filters);

      expect(mockUserModel.findMany).toHaveBeenCalledWith({
        where: {
          username: {
            contains: 'test',
            mode: 'insensitive'
          },
          role: UserRole.user,
          isActive: true,
          createdAt: {
            gte: new Date('2024-01-01')
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(searchResults);
    });
  });

  describe('Data Preparation and Validation', () => {
    test('should create user with valid data', async () => {
      const createData: CreateUserData = {
        username: 'newuser',
        email: 'NEW@EXAMPLE.COM',
        passwordHash: '$2b$12$hashedpassword123456789'
      };

      const expectedUser = {
        ...mockUser,
        username: 'newuser',
        email: 'new@example.com'
      };

      mockUserModel.create.mockResolvedValue(expectedUser);

      const result = await repository.create(createData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        data: {
          username: 'newuser',
          email: 'new@example.com',
          passwordHash: '$2b$12$hashedpassword123456789',
          role: UserRole.user,
          isActive: true
        }
      });
      expect(result).toEqual(expectedUser);
    });

    test('should create user with custom role and status', async () => {
      const createData: CreateUserData = {
        username: 'adminuser',
        email: 'admin@example.com',
        passwordHash: '$2b$12$hashedpassword123456789',
        role: UserRole.admin,
        isActive: false
      };

      mockUserModel.create.mockResolvedValue(mockAdminUser);

      await repository.create(createData);

      expect(mockUserModel.create).toHaveBeenCalledWith({
        data: {
          username: 'adminuser',
          email: 'admin@example.com',
          passwordHash: '$2b$12$hashedpassword123456789',
          role: UserRole.admin,
          isActive: false
        }
      });
    });

    test('should throw ValidationError for invalid username in create', async () => {
      const createData: CreateUserData = {
        username: 'ab', // too short
        email: 'test@example.com',
        passwordHash: '$2b$12$hashedpassword123456789'
      };

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid email in create', async () => {
      const createData: CreateUserData = {
        username: 'testuser',
        email: 'invalid-email',
        passwordHash: '$2b$12$hashedpassword123456789'
      };

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid password hash in create', async () => {
      const createData: CreateUserData = {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: 'short' // too short
      };

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should update user with valid data', async () => {
      const updateData: UpdateUserData = {
        username: '  UPDATED USER  ',
        email: 'UPDATED@EXAMPLE.COM'
      };

      const updatedUser = {
        ...mockUser,
        username: 'UPDATED USER',
        email: 'updated@example.com'
      };

      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check
      mockUserModel.update.mockResolvedValue(updatedUser);

      const result = await repository.update('user-123', updateData);

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          username: 'UPDATED USER',
          email: 'updated@example.com'
        }
      });
      expect(result).toEqual(updatedUser);
    });

    test('should throw ValidationError for invalid username in update', async () => {
      const updateData: UpdateUserData = {
        username: 'ab' // too short
      };

      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check

      await expect(repository.update('user-123', updateData)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid email in update', async () => {
      const updateData: UpdateUserData = {
        email: 'invalid-email'
      };

      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check

      await expect(repository.update('user-123', updateData)).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid password hash in update', async () => {
      const updateData: UpdateUserData = {
        passwordHash: 'short' // too short
      };

      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check

      await expect(repository.update('user-123', updateData)).rejects.toThrow(ValidationError);
    });

    test('should filter undefined values in update', async () => {
      const updateData: UpdateUserData = {
        username: 'newusername'
        // email and passwordHash are omitted (undefined)
      };

      mockUserModel.findUnique.mockResolvedValue(mockUser); // exists check
      mockUserModel.update.mockResolvedValue(mockUser);

      await repository.update('user-123', updateData);

      expect(mockUserModel.update).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: {
          username: 'newusername'
        }
      });
    });
  });

  describe('Email Validation', () => {
    test('should validate correct email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      for (const email of validEmails) {
        mockUserModel.findUnique.mockResolvedValue(null);
        await expect(repository.findByEmail(email)).resolves.toBeNull();
      }
    });

    test('should reject invalid email formats', async () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@.com',
        ''
      ];

      for (const email of invalidEmails) {
        await expect(repository.findByEmail(email)).rejects.toThrow(ValidationError);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors in findByEmail', async () => {
      const dbError = new Error('Database connection failed');
      mockUserModel.findUnique.mockRejectedValue(dbError);

      await expect(repository.findByEmail('test@example.com')).rejects.toThrow();
    });

    test('should handle database errors in findByUsername', async () => {
      const dbError = new Error('Database connection failed');
      mockUserModel.findFirst.mockRejectedValue(dbError);

      await expect(repository.findByUsername('testuser')).rejects.toThrow();
    });

    test('should handle database errors in searchUsers', async () => {
      const dbError = new Error('Database connection failed');
      mockUserModel.findMany.mockRejectedValue(dbError);

      const filters: UserSearchFilters = { username: 'test' };

      await expect(repository.searchUsers(filters)).rejects.toThrow();
    });
  });
});
