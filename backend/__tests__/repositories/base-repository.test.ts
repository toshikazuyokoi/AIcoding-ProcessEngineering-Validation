/**
 * Base Repository Test Suite
 * 
 * Comprehensive tests for base repository implementation
 * Tests CRUD operations, error handling, transactions, and configuration
 * 
 * @fileoverview Test suite for BaseRepository class
 * @version 1.0.0
 * @since 2025-02-01
 */

import { PrismaClient } from '@prisma/client';
import { BaseRepository, IBaseRepository, FindManyOptions, RepositoryConfig } from '../../src/repositories/base-repository';
import { DatabaseConnection } from '../../src/utils/database-connection';
import { NotFoundError, ValidationError, DatabaseError } from '../../src/utils/error-handler';

// Mock dependencies
jest.mock('../../src/utils/database-connection');
jest.mock('../../src/utils/logger');

// Don't mock error-handler to test actual error handling logic

// Test data interfaces
interface TestEntity {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CreateTestData {
  name: string;
  email: string;
}

interface UpdateTestData {
  name?: string | undefined;
  email?: string | undefined;
}

// Test repository implementation
class TestRepository extends BaseRepository<TestEntity, CreateTestData, UpdateTestData> {
  constructor(config?: RepositoryConfig) {
    super('TestEntity', config);
  }

  protected getModel() {
    return (this.prisma as any).testEntity;
  }
}

describe('BaseRepository', () => {
  let repository: TestRepository;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockModel: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Prisma client
    mockModel = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    mockPrisma = {
      testEntity: mockModel
    } as any;

    // Mock getPrismaClient
    (require('../../src/utils/database-connection').getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

    // Create repository instance
    repository = new TestRepository();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with default configuration', () => {
      const repo = new TestRepository();
      const config = repo.getConfig();

      expect(config.enableCaching).toBe(false);
      expect(config.cacheTimeout).toBe(300);
      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(false);
    });

    test('should initialize with custom configuration', () => {
      const customConfig: RepositoryConfig = {
        enableCaching: true,
        cacheTimeout: 600,
        enableLogging: false,
        enableMetrics: true
      };

      const repo = new TestRepository(customConfig);
      const config = repo.getConfig();

      expect(config.enableCaching).toBe(true);
      expect(config.cacheTimeout).toBe(600);
      expect(config.enableLogging).toBe(false);
      expect(config.enableMetrics).toBe(true);
    });

    test('should return correct model name', () => {
      expect(repository.getModelName()).toBe('TestEntity');
    });
  });

  describe('Create Operations', () => {
    test('should create record successfully', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const expectedResult: TestEntity = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockModel.create.mockResolvedValue(expectedResult);

      const result = await repository.create(createData);

      expect(mockModel.create).toHaveBeenCalledWith({
        data: createData
      });
      expect(result).toEqual(expectedResult);
    });

    test('should handle create validation error', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'invalid-email'
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] }
      };

      mockModel.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should handle create database error', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      mockModel.create.mockRejectedValue(new Error('Database connection failed'));

      await expect(repository.create(createData)).rejects.toThrow(DatabaseError);
    });
  });

  describe('Read Operations', () => {
    test('should find record by ID successfully', async () => {
      const testId = 'test-id';
      const expectedResult: TestEntity = {
        id: testId,
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockModel.findUnique.mockResolvedValue(expectedResult);

      const result = await repository.findById(testId);

      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: testId }
      });
      expect(result).toEqual(expectedResult);
    });

    test('should return null when record not found', async () => {
      const testId = 'non-existent-id';

      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.findById(testId);

      expect(result).toBeNull();
    });

    test('should find multiple records with options', async () => {
      const options: FindManyOptions = {
        where: { name: 'Test' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10
      };

      const expectedResults: TestEntity[] = [
        {
          id: 'test-id-1',
          name: 'Test User 1',
          email: 'test1@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'test-id-2',
          name: 'Test User 2',
          email: 'test2@example.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockModel.findMany.mockResolvedValue(expectedResults);

      const result = await repository.findMany(options);

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: options.where,
        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        include: options.include,
        select: options.select
      });
      expect(result).toEqual(expectedResults);
    });

    test('should find multiple records without options', async () => {
      const expectedResults: TestEntity[] = [];

      mockModel.findMany.mockResolvedValue(expectedResults);

      const result = await repository.findMany();

      expect(mockModel.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(expectedResults);
    });
  });

  describe('Update Operations', () => {
    test('should update record successfully', async () => {
      const testId = 'test-id';
      const updateData: UpdateTestData = {
        name: 'Updated Name'
      };

      const expectedResult: TestEntity = {
        id: testId,
        name: 'Updated Name',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock exists check
      mockModel.findUnique.mockResolvedValue({ id: testId });
      mockModel.update.mockResolvedValue(expectedResult);

      const result = await repository.update(testId, updateData);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: testId },
        data: updateData
      });
      expect(result).toEqual(expectedResult);
    });

    test('should throw NotFoundError when updating non-existent record', async () => {
      const testId = 'non-existent-id';
      const updateData: UpdateTestData = {
        name: 'Updated Name'
      };

      // Mock exists check to return false
      mockModel.findUnique.mockResolvedValue(null);

      await expect(repository.update(testId, updateData)).rejects.toThrow(NotFoundError);
    });

    test('should filter undefined values in update data', async () => {
      const testId = 'test-id';
      const updateData: UpdateTestData = {
        name: 'Updated Name',
        email: undefined
      };

      const expectedResult: TestEntity = {
        id: testId,
        name: 'Updated Name',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Mock exists check
      mockModel.findUnique.mockResolvedValue({ id: testId });
      mockModel.update.mockResolvedValue(expectedResult);

      await repository.update(testId, updateData);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: testId },
        data: { name: 'Updated Name' } // email should be filtered out
      });
    });
  });

  describe('Delete Operations', () => {
    test('should delete record successfully', async () => {
      const testId = 'test-id';

      // Mock exists check
      mockModel.findUnique.mockResolvedValue({ id: testId });
      mockModel.delete.mockResolvedValue({ id: testId });

      await repository.delete(testId);

      expect(mockModel.delete).toHaveBeenCalledWith({
        where: { id: testId }
      });
    });

    test('should throw NotFoundError when deleting non-existent record', async () => {
      const testId = 'non-existent-id';

      // Mock exists check to return false
      mockModel.findUnique.mockResolvedValue(null);

      await expect(repository.delete(testId)).rejects.toThrow(NotFoundError);
    });
  });

  describe('Utility Operations', () => {
    test('should count records with where clause', async () => {
      const whereClause = { name: 'Test' };
      const expectedCount = 5;

      mockModel.count.mockResolvedValue(expectedCount);

      const result = await repository.count(whereClause);

      expect(mockModel.count).toHaveBeenCalledWith({
        where: whereClause
      });
      expect(result).toBe(expectedCount);
    });

    test('should count all records without where clause', async () => {
      const expectedCount = 10;

      mockModel.count.mockResolvedValue(expectedCount);

      const result = await repository.count();

      expect(mockModel.count).toHaveBeenCalledWith({
        where: undefined
      });
      expect(result).toBe(expectedCount);
    });

    test('should check if record exists', async () => {
      const testId = 'test-id';

      mockModel.findUnique.mockResolvedValue({ id: testId });

      const result = await repository.exists(testId);

      expect(mockModel.findUnique).toHaveBeenCalledWith({
        where: { id: testId },
        select: { id: true }
      });
      expect(result).toBe(true);
    });

    test('should return false when record does not exist', async () => {
      const testId = 'non-existent-id';

      mockModel.findUnique.mockResolvedValue(null);

      const result = await repository.exists(testId);

      expect(result).toBe(false);
    });
  });

  describe('Transaction Operations', () => {
    test('should execute transaction successfully', async () => {
      const mockDatabase = {
        transaction: jest.fn()
      };

      (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockDatabase);

      const transactionFn = jest.fn().mockResolvedValue('transaction result');
      const options = { maxWait: 5000, timeout: 10000 };

      mockDatabase.transaction.mockResolvedValue('transaction result');

      const result = await repository.transaction(transactionFn, options);

      expect(DatabaseConnection.getInstance).toHaveBeenCalled();
      expect(mockDatabase.transaction).toHaveBeenCalledWith(transactionFn, options);
      expect(result).toBe('transaction result');
    });

    test('should handle transaction failure', async () => {
      const mockDatabase = {
        transaction: jest.fn()
      };

      (DatabaseConnection.getInstance as jest.Mock).mockReturnValue(mockDatabase);

      const transactionFn = jest.fn();
      const transactionError = new Error('Transaction failed');

      mockDatabase.transaction.mockRejectedValue(transactionError);

      await expect(repository.transaction(transactionFn)).rejects.toThrow(DatabaseError);
    });
  });

  describe('Error Handling', () => {
    test('should handle Prisma unique constraint error (P2002)', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'duplicate@example.com'
      };

      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] }
      };

      mockModel.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should handle Prisma record not found error (P2025)', async () => {
      const testId = 'test-id';

      const prismaError = {
        code: 'P2025'
      };

      mockModel.findUnique.mockResolvedValue({ id: testId }); // exists check passes
      mockModel.update.mockRejectedValue(prismaError);

      await expect(repository.update(testId, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });

    test('should handle Prisma foreign key constraint error (P2003)', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const prismaError = {
        code: 'P2003'
      };

      mockModel.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should handle Prisma required relation missing error (P2014)', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const prismaError = {
        code: 'P2014'
      };

      mockModel.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
    });

    test('should handle unknown Prisma error', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const prismaError = {
        code: 'P9999',
        message: 'Unknown Prisma error'
      };

      mockModel.create.mockRejectedValue(prismaError);

      await expect(repository.create(createData)).rejects.toThrow(DatabaseError);
    });

    test('should handle generic error', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const genericError = new Error('Generic error');

      mockModel.create.mockRejectedValue(genericError);

      await expect(repository.create(createData)).rejects.toThrow(DatabaseError);
    });

    test('should preserve custom application errors', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const customError = new ValidationError('Custom validation error');

      mockModel.create.mockRejectedValue(customError);

      await expect(repository.create(createData)).rejects.toThrow(ValidationError);
      await expect(repository.create(createData)).rejects.toThrow('Custom validation error');
    });
  });

  describe('Data Preparation', () => {
    test('should prepare create data correctly', async () => {
      const createData: CreateTestData = {
        name: 'Test User',
        email: 'test@example.com'
      };

      const expectedResult: TestEntity = {
        id: 'test-id',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockModel.create.mockResolvedValue(expectedResult);

      await repository.create(createData);

      expect(mockModel.create).toHaveBeenCalledWith({
        data: createData
      });
    });

    test('should prepare update data by filtering undefined values', async () => {
      const testId = 'test-id';
      const updateData: UpdateTestData = {
        name: 'Updated Name',
        email: undefined
      };

      // Mock exists check
      mockModel.findUnique.mockResolvedValue({ id: testId });
      mockModel.update.mockResolvedValue({});

      await repository.update(testId, updateData);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: testId },
        data: { name: 'Updated Name' }
      });
    });

    test('should handle empty update data', async () => {
      const testId = 'test-id';
      const updateData: UpdateTestData = {
        name: undefined,
        email: undefined
      };

      // Mock exists check
      mockModel.findUnique.mockResolvedValue({ id: testId });
      mockModel.update.mockResolvedValue({});

      await repository.update(testId, updateData);

      expect(mockModel.update).toHaveBeenCalledWith({
        where: { id: testId },
        data: {}
      });
    });
  });
});
