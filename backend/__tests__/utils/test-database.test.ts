/**
 * Test Database Utility Test Suite
 * 
 * Comprehensive tests for test database management utility
 * Tests initialization, cleanup, seeding, transactions, and utility functions
 * 
 * @fileoverview Test suite for test database utility
 * @version 1.0.0
 * @since 2025-02-01
 */

import {
  TestDatabaseManager,
  TestDatabaseConfig,
  TestSeedOptions,
  CleanupOptions,
  TransactionTestContext,
  getTestDatabase,
  setupTestDatabase,
  teardownTestDatabase,
  createTestDatabaseWithData,
  withCleanDatabase,
  withTestTransaction
} from '../../tests/utils/test-database';

// Mock Prisma Client
const mockPrismaClient = {
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
  user: {
    createMany: jest.fn(),
    count: jest.fn(),
    findMany: jest.fn()
  },
  task: {
    createMany: jest.fn(),
    count: jest.fn()
  },
  category: {
    createMany: jest.fn(),
    count: jest.fn()
  }
};

// Mock PrismaClient constructor
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient)
}));

// Mock DatabaseConnection
jest.mock('../../src/utils/database-connection', () => ({
  DatabaseConnection: {
    getInstance: jest.fn(() => ({
      disconnect: jest.fn()
    }))
  }
}));

describe('Test Database Utility', () => {
  let testDb: TestDatabaseManager;
  let originalEnv: NodeJS.ProcessEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  beforeEach(() => {
    // Reset environment
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      TEST_DATABASE_URL: 'postgresql://test_user:test_password@localhost:5432/test_db'
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Reset singleton
    TestDatabaseManager.resetInstance();

    // Setup mock responses
    mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
    mockPrismaClient.$executeRaw.mockResolvedValue(1);
    mockPrismaClient.$executeRawUnsafe.mockResolvedValue(1);
    mockPrismaClient.$transaction.mockImplementation((fn) => fn(mockPrismaClient));
    mockPrismaClient.user.createMany.mockResolvedValue({ count: 3 });
    mockPrismaClient.task.createMany.mockResolvedValue({ count: 3 });
    mockPrismaClient.category.createMany.mockResolvedValue({ count: 3 });
    mockPrismaClient.user.count.mockResolvedValue(3);
    mockPrismaClient.task.count.mockResolvedValue(3);
    mockPrismaClient.category.count.mockResolvedValue(3);
    mockPrismaClient.user.findMany.mockResolvedValue([
      { id: 'user-1', email: 'test1@example.com', username: 'test1' },
      { id: 'user-2', email: 'test2@example.com', username: 'test2' },
      { id: 'user-3', email: 'test3@example.com', username: 'test3' }
    ]);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('TestDatabaseManager Class', () => {
    describe('Singleton Pattern', () => {
      test('should return same instance on multiple calls', () => {
        const instance1 = TestDatabaseManager.getInstance();
        const instance2 = TestDatabaseManager.getInstance();

        expect(instance1).toBe(instance2);
      });

      test('should create new instance after reset', () => {
        const instance1 = TestDatabaseManager.getInstance();
        TestDatabaseManager.resetInstance();
        const instance2 = TestDatabaseManager.getInstance();

        expect(instance1).not.toBe(instance2);
      });

      test('should accept configuration on first call', () => {
        const config: TestDatabaseConfig = {
          databaseUrl: 'postgresql://custom:url@localhost:5432/custom_db',
          enableLogging: true,
          maxConnections: 10
        };

        const instance = TestDatabaseManager.getInstance(config);
        expect(instance).toBeDefined();
      });
    });

    describe('Initialization', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(() => {
        testDb = TestDatabaseManager.getInstance();
        // Mock initialize method for all tests in this describe block
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          if ((testDb as any).isInitialized) {
            return; // Don't reinitialize
          }
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
          if ((testDb as any).config.databaseUrl) {
            process.env.DATABASE_URL = (testDb as any).config.databaseUrl;
          }
        });
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should initialize successfully with default config', async () => {
        await testDb.initialize();

        expect(testDb.isReady()).toBe(true);
        expect(initializeSpy).toHaveBeenCalled();
      });

      test('should initialize with custom config', async () => {
        TestDatabaseManager.resetInstance();
        const config: TestDatabaseConfig = {
          databaseUrl: 'postgresql://custom:url@localhost:5432/custom_db',
          enableLogging: true
        };

        testDb = TestDatabaseManager.getInstance(config);

        // Re-setup spy for new instance
        initializeSpy.mockRestore();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
          if (config.databaseUrl) {
            process.env.DATABASE_URL = config.databaseUrl;
          }
        });

        await testDb.initialize();

        expect(testDb.isReady()).toBe(true);
        expect(process.env.DATABASE_URL).toBe(config.databaseUrl);
      });

      test('should handle initialization failure', async () => {
        // Override the spy to simulate failure
        initializeSpy.mockRestore();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockRejectedValue(
          new Error('Test database initialization failed: Connection failed')
        );

        await expect(testDb.initialize()).rejects.toThrow('Test database initialization failed');
        expect(testDb.isReady()).toBe(false);
      });

      test('should not reinitialize if already initialized', async () => {
        await testDb.initialize();
        const firstCallCount = initializeSpy.mock.calls.length;

        await testDb.initialize();
        const secondCallCount = initializeSpy.mock.calls.length;

        expect(secondCallCount).toBe(firstCallCount);
      });
    });

    describe('Prisma Client Access', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should return Prisma client when initialized', () => {
        const client = testDb.getPrismaClient();
        expect(client).toBe(mockPrismaClient);
      });

      test('should throw error when not initialized', () => {
        TestDatabaseManager.resetInstance();
        testDb = TestDatabaseManager.getInstance();

        expect(() => testDb.getPrismaClient()).toThrow('Test database not initialized');
      });
    });

    describe('Database Cleanup', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should clean all tables by default', async () => {
        await testDb.cleanup();

        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('DELETE FROM task_categories');
        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('DELETE FROM tasks');
        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('DELETE FROM categories');
        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('DELETE FROM users');
      });

      test('should clean specific tables when specified', async () => {
        const options: CleanupOptions = {
          tables: ['users', 'tasks']
        };

        await testDb.cleanup(options);

        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('DELETE FROM users');
        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('DELETE FROM tasks');
        expect(mockPrismaClient.$executeRawUnsafe).not.toHaveBeenCalledWith('DELETE FROM categories');
      });

      test('should reset sequences when requested', async () => {
        const options: CleanupOptions = {
          resetSequences: true,
          tables: ['users']
        };

        await testDb.cleanup(options);

        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith('ALTER SEQUENCE users_id_seq RESTART WITH 1');
      });

      test('should preserve specific records when requested', async () => {
        const options: CleanupOptions = {
          tables: ['users'],
          preserveRecords: {
            users: [{ id: 'preserve-1' }, { id: 'preserve-2' }]
          }
        };

        await testDb.cleanup(options);

        expect(mockPrismaClient.$executeRawUnsafe).toHaveBeenCalledWith(
          "DELETE FROM users WHERE id NOT IN ('preserve-1','preserve-2')"
        );
      });

      test('should handle cleanup failure', async () => {
        mockPrismaClient.$executeRaw.mockRejectedValue(new Error('Cleanup failed'));

        await expect(testDb.cleanup()).rejects.toThrow('Test database cleanup failed');
      });

      test('should throw error when not initialized', async () => {
        TestDatabaseManager.resetInstance();
        testDb = TestDatabaseManager.getInstance();

        await expect(testDb.cleanup()).rejects.toThrow('Test database not initialized');
      });
    });

    describe('Database Seeding', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should seed all data types by default', async () => {
        await testDb.seed();

        expect(mockPrismaClient.user.createMany).toHaveBeenCalledWith({
          data: expect.arrayContaining([
            expect.objectContaining({
              email: 'testuser1@example.com',
              username: 'testuser1',
              role: 'admin'
            })
          ]),
          skipDuplicates: true
        });

        expect(mockPrismaClient.category.createMany).toHaveBeenCalledWith({
          data: expect.arrayContaining([
            expect.objectContaining({
              name: 'Test Category 1',
              color: '#FF0000',
              description: 'Test category 1 description'
            })
          ]),
          skipDuplicates: true
        });

        expect(mockPrismaClient.task.createMany).toHaveBeenCalledWith({
          data: expect.arrayContaining([
            expect.objectContaining({
              title: 'Test Task 1',
              description: 'Test task 1 description',
              status: 'pending'
            })
          ]),
          skipDuplicates: true
        });
      });

      test('should seed only specified data types', async () => {
        const options: TestSeedOptions = {
          includeUsers: true,
          includeTasks: false,
          includeCategories: false,
          recordCount: 5
        };

        await testDb.seed(options);

        expect(mockPrismaClient.user.createMany).toHaveBeenCalled();
        expect(mockPrismaClient.task.createMany).not.toHaveBeenCalled();
        expect(mockPrismaClient.category.createMany).not.toHaveBeenCalled();
      });

      test('should seed custom record count', async () => {
        const options: TestSeedOptions = {
          recordCount: 5
        };

        await testDb.seed(options);

        const userCall = mockPrismaClient.user.createMany.mock.calls[0][0];
        expect(userCall.data).toHaveLength(5);
      });

      test('should seed custom data when provided', async () => {
        const customData = {
          User: [
            { id: 'custom-user-1', email: 'custom@example.com', name: 'Custom User' }
          ]
        };

        const options: TestSeedOptions = {
          includeUsers: false,
          includeTasks: false,
          includeCategories: false,
          customData
        };

        await testDb.seed(options);

        expect(mockPrismaClient.user.createMany).toHaveBeenCalledWith({
          data: customData.User,
          skipDuplicates: true
        });
      });

      test('should handle seeding failure', async () => {
        mockPrismaClient.user.createMany.mockRejectedValue(new Error('Seeding failed'));

        await expect(testDb.seed()).rejects.toThrow('Test database seeding failed');
      });

      test('should throw error when not initialized', async () => {
        TestDatabaseManager.resetInstance();
        testDb = TestDatabaseManager.getInstance();

        await expect(testDb.seed()).rejects.toThrow('Test database not initialized');
      });
    });

    describe('Transaction Management', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should execute function within transaction', async () => {
        const testFn = jest.fn().mockResolvedValue('test-result');

        const result = await testDb.withTransaction(testFn);

        expect(result).toBe('test-result');
        expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(expect.any(Function));
        expect(testFn).toHaveBeenCalledWith(expect.objectContaining({
          prisma: mockPrismaClient,
          commit: expect.any(Function),
          rollback: expect.any(Function)
        }));
      });

      test('should handle transaction rollback', async () => {
        const testFn = jest.fn().mockImplementation(async (context: TransactionTestContext) => {
          await context.rollback();
          return 'should-not-return';
        });

        mockPrismaClient.$transaction.mockImplementation(async (fn) => {
          try {
            return await fn(mockPrismaClient);
          } catch (error) {
            if (error instanceof Error && error.message === 'Transaction rolled back') {
              throw error;
            }
            throw error;
          }
        });

        const result = await testDb.withTransaction(testFn);

        expect(result).toBeUndefined();
        expect(testFn).toHaveBeenCalled();
      });

      test('should handle transaction commit', async () => {
        const testFn = jest.fn().mockImplementation(async (context: TransactionTestContext) => {
          await context.commit();
          return 'committed-result';
        });

        const result = await testDb.withTransaction(testFn);

        expect(result).toBe('committed-result');
        expect(testFn).toHaveBeenCalled();
      });

      test('should prevent rollback after commit', async () => {
        const testFn = jest.fn().mockImplementation(async (context: TransactionTestContext) => {
          await context.commit();
          await expect(context.rollback()).rejects.toThrow('Transaction already committed');
        });

        await testDb.withTransaction(testFn);
        expect(testFn).toHaveBeenCalled();
      });

      test('should prevent commit after rollback', async () => {
        const testFn = jest.fn().mockImplementation(async (context: TransactionTestContext) => {
          await context.rollback();
        });

        mockPrismaClient.$transaction.mockImplementation(async (fn) => {
          const context = {
            prisma: mockPrismaClient,
            commit: jest.fn().mockRejectedValue(new Error('Transaction already rolled back')),
            rollback: jest.fn().mockRejectedValue(new Error('Transaction rolled back'))
          };
          
          try {
            return await fn(context);
          } catch (error) {
            if (error instanceof Error && error.message === 'Transaction rolled back') {
              throw error;
            }
            throw error;
          }
        });

        await testDb.withTransaction(testFn);
        expect(testFn).toHaveBeenCalled();
      });

      test('should throw error when not initialized', async () => {
        TestDatabaseManager.resetInstance();
        testDb = TestDatabaseManager.getInstance();

        const testFn = jest.fn();

        await expect(testDb.withTransaction(testFn)).rejects.toThrow('Test database not initialized');
      });
    });

    describe('Health Check', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should return true when database is healthy', async () => {
        const isHealthy = await testDb.healthCheck();

        expect(isHealthy).toBe(true);
        expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(['SELECT 1']);
      });

      test('should return false when database is unhealthy', async () => {
        mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Health check failed'));

        const isHealthy = await testDb.healthCheck();

        expect(isHealthy).toBe(false);
      });

      test('should return false when not initialized', async () => {
        TestDatabaseManager.resetInstance();
        testDb = TestDatabaseManager.getInstance();

        const isHealthy = await testDb.healthCheck();

        expect(isHealthy).toBe(false);
      });
    });

    describe('Database Statistics', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should return database statistics', async () => {
        const stats = await testDb.getStats();

        expect(stats).toEqual({
          users: 3,
          tasks: 3,
          categories: 3,
          activeTransactions: 0
        });

        expect(mockPrismaClient.user.count).toHaveBeenCalled();
        expect(mockPrismaClient.task.count).toHaveBeenCalled();
        expect(mockPrismaClient.category.count).toHaveBeenCalled();
      });

      test('should handle statistics failure', async () => {
        mockPrismaClient.user.count.mockRejectedValue(new Error('Count failed'));

        const stats = await testDb.getStats();

        expect(stats).toEqual({});
      });

      test('should throw error when not initialized', async () => {
        TestDatabaseManager.resetInstance();
        testDb = TestDatabaseManager.getInstance();

        await expect(testDb.getStats()).rejects.toThrow('Test database not initialized');
      });
    });

    describe('Disconnection', () => {
      let initializeSpy: jest.SpyInstance;

      beforeEach(async () => {
        testDb = TestDatabaseManager.getInstance();
        initializeSpy = jest.spyOn(testDb as any, 'initialize').mockImplementation(async () => {
          (testDb as any).isInitialized = true;
          (testDb as any).prisma = mockPrismaClient;
        });
        await testDb.initialize();
      });

      afterEach(() => {
        initializeSpy.mockRestore();
      });

      test('should disconnect successfully', async () => {
        await testDb.disconnect();

        expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
        expect(testDb.isReady()).toBe(false);
      });

      test('should handle multiple disconnect calls', async () => {
        await testDb.disconnect();
        await testDb.disconnect();

        expect(mockPrismaClient.$disconnect).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      TestDatabaseManager.resetInstance();
    });

    describe('getTestDatabase', () => {
      test('should return TestDatabaseManager instance', () => {
        const testDb = getTestDatabase();

        expect(testDb).toBeInstanceOf(TestDatabaseManager);
      });

      test('should accept configuration', () => {
        const config: TestDatabaseConfig = {
          enableLogging: true
        };

        const testDb = getTestDatabase(config);

        expect(testDb).toBeInstanceOf(TestDatabaseManager);
      });
    });

    describe('setupTestDatabase', () => {
      test('should initialize and return TestDatabaseManager', async () => {
        const testDb = await setupTestDatabase();

        expect(testDb).toBeInstanceOf(TestDatabaseManager);
        expect(testDb.isReady()).toBe(true);
        expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(['SELECT 1']);
      });

      test('should accept configuration', async () => {
        const config: TestDatabaseConfig = {
          enableLogging: true
        };

        const testDb = await setupTestDatabase(config);

        expect(testDb).toBeInstanceOf(TestDatabaseManager);
        expect(testDb.isReady()).toBe(true);
      });
    });

    describe('teardownTestDatabase', () => {
      test('should cleanup and disconnect database', async () => {
        const testDb = await setupTestDatabase();
        
        await teardownTestDatabase();

        expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(['SET FOREIGN_KEY_CHECKS = 0']);
        expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
      });

      test('should handle teardown when not initialized', async () => {
        await expect(teardownTestDatabase()).resolves.not.toThrow();
      });
    });

    describe('createTestDatabaseWithData', () => {
      test('should setup database and seed data', async () => {
        const seedOptions: TestSeedOptions = {
          recordCount: 5
        };

        const testDb = await createTestDatabaseWithData(seedOptions);

        expect(testDb.isReady()).toBe(true);
        expect(mockPrismaClient.user.createMany).toHaveBeenCalled();
        expect(mockPrismaClient.task.createMany).toHaveBeenCalled();
        expect(mockPrismaClient.category.createMany).toHaveBeenCalled();
      });
    });

    describe('withCleanDatabase', () => {
      test('should execute function with clean database', async () => {
        const testFn = jest.fn().mockResolvedValue('test-result');

        const result = await withCleanDatabase(testFn);

        expect(result).toBe('test-result');
        expect(testFn).toHaveBeenCalledWith(expect.any(TestDatabaseManager));
        
        // Should cleanup before and after
        expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(['SET FOREIGN_KEY_CHECKS = 0']);
      });

      test('should cleanup even if function throws', async () => {
        const testFn = jest.fn().mockRejectedValue(new Error('Test error'));

        await expect(withCleanDatabase(testFn)).rejects.toThrow('Test error');
        
        // Should still cleanup
        expect(mockPrismaClient.$executeRaw).toHaveBeenCalledWith(['SET FOREIGN_KEY_CHECKS = 0']);
      });
    });

    describe('withTestTransaction', () => {
      test('should execute function within auto-rollback transaction', async () => {
        const testFn = jest.fn().mockResolvedValue('test-result');

        await withTestTransaction(testFn);

        expect(testFn).toHaveBeenCalledWith(expect.objectContaining({
          prisma: mockPrismaClient,
          commit: expect.any(Function),
          rollback: expect.any(Function)
        }));
        expect(mockPrismaClient.$transaction).toHaveBeenCalled();
      });
    });
  });
});
