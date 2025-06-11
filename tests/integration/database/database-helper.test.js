/**
 * ===================================
 * Integration Database Helper Test Suite
 * ===================================
 * Generated for TSK-IT-000-002-TestDatabase
 * Project: Task Management System - Integration Test
 * Purpose: Test database helper functionality for integration testing
 */

const { Pool } = require('pg');
const {
  IntegrationDatabaseHelper,
  getIntegrationDatabaseHelper,
  setupIntegrationDatabase,
  teardownIntegrationDatabase
} = require('../../support/database-helper');

describe('Integration Database Helper', () => {
  let dbHelper;
  const TEST_TIMEOUT = 60000; // 1 minute timeout for database operations

  beforeAll(async () => {
    // Initialize database helper with test configuration
    dbHelper = new IntegrationDatabaseHelper({
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5434'),
      database: process.env.POSTGRES_DB || 'taskdb_integration',
      username: process.env.POSTGRES_USER || 'integration_user',
      password: process.env.POSTGRES_PASSWORD || 'integration_password_123'
    });
  }, TEST_TIMEOUT);

  afterAll(async () => {
    // Clean up database connection
    if (dbHelper) {
      await dbHelper.close();
    }
    await teardownIntegrationDatabase();
  }, TEST_TIMEOUT);

  describe('Database Connection', () => {
    test('should initialize database connection successfully', async () => {
      await expect(dbHelper.initialize()).resolves.not.toThrow();
    }, TEST_TIMEOUT);

    test('should establish connection to integration database', async () => {
      await dbHelper.initialize();
      const isHealthy = await dbHelper.healthCheck();
      expect(isHealthy).toBe(true);
    }, TEST_TIMEOUT);

    test('should execute simple queries', async () => {
      await dbHelper.initialize();
      const result = await dbHelper.query('SELECT 1 as test_value');
      expect(result.rows).toHaveLength(1);
      expect(result.rows[0].test_value).toBe(1);
    }, TEST_TIMEOUT);

    test('should handle query parameters correctly', async () => {
      await dbHelper.initialize();
      const result = await dbHelper.query('SELECT $1 as param_value', ['test_param']);
      expect(result.rows[0].param_value).toBe('test_param');
    }, TEST_TIMEOUT);
  });

  describe('Database Cleanup', () => {
    beforeEach(async () => {
      await dbHelper.initialize();
      // Ensure we have some test data to clean
      await dbHelper.seedTestData({
        userCount: 2,
        categoryCount: 2,
        taskCount: 5,
        cleanBeforeSeed: false
      });
    });

    test('should clean all test data successfully', async () => {
      // Verify data exists before cleanup
      const beforeStats = await dbHelper.getStatistics();
      expect(beforeStats.users).toBeGreaterThan(0);
      expect(beforeStats.tasks).toBeGreaterThan(0);
      expect(beforeStats.categories).toBeGreaterThan(0);

      // Perform cleanup
      await dbHelper.cleanup();

      // Verify data is cleaned
      const afterStats = await dbHelper.getStatistics();
      expect(afterStats.users).toBe(0);
      expect(afterStats.tasks).toBe(0);
      expect(afterStats.categories).toBe(0);
    }, TEST_TIMEOUT);

    test('should clean specific tables only', async () => {
      // Clean only tasks table
      await dbHelper.cleanup({ tables: ['tasks'] });

      const stats = await dbHelper.getStatistics();
      expect(stats.tasks).toBe(0);
      expect(stats.users).toBeGreaterThan(0);
      expect(stats.categories).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('should handle cleanup with cascade delete', async () => {
      await dbHelper.cleanup({ cascadeDelete: true });

      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(0);
      expect(stats.tasks).toBe(0);
      expect(stats.categories).toBe(0);
    }, TEST_TIMEOUT);
  });

  describe('Test Data Seeding', () => {
    beforeEach(async () => {
      await dbHelper.initialize();
      await dbHelper.cleanup(); // Start with clean database
    });

    test('should seed default test data', async () => {
      await dbHelper.seedTestData();

      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBeGreaterThan(0);
      expect(stats.tasks).toBeGreaterThan(0);
      expect(stats.categories).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('should seed specific number of records', async () => {
      const userCount = 5;
      const taskCount = 15;
      const categoryCount = 8;

      await dbHelper.seedTestData({
        userCount,
        taskCount,
        categoryCount
      });

      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(userCount);
      expect(stats.categories).toBe(categoryCount);
      // Tasks might be less than requested due to user availability
      expect(stats.tasks).toBeGreaterThan(0);
    }, TEST_TIMEOUT);

    test('should seed only specific data types', async () => {
      await dbHelper.seedTestData({
        includeUsers: true,
        includeTasks: false,
        includeCategories: false,
        userCount: 3
      });

      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(3);
      expect(stats.tasks).toBe(0);
      expect(stats.categories).toBe(0);
    }, TEST_TIMEOUT);

    test('should clean before seeding when requested', async () => {
      // Seed initial data
      await dbHelper.seedTestData({ userCount: 2 });
      
      // Seed again with clean before seed
      await dbHelper.seedTestData({ 
        userCount: 3, 
        cleanBeforeSeed: true 
      });

      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(3); // Should have only new data
    }, TEST_TIMEOUT);
  });

  describe('Transaction Support', () => {
    beforeEach(async () => {
      await dbHelper.initialize();
      await dbHelper.cleanup();
    });

    test('should execute queries within transaction successfully', async () => {
      const result = await dbHelper.queryWithTransaction(async (client) => {
        await client.query(`
          INSERT INTO users (id, email, password_hash, first_name, last_name)
          VALUES ('550e8400-e29b-41d4-a716-446655440999', 'transaction@test.com', 'hash', 'Trans', 'User')
        `);
        
        const userResult = await client.query('SELECT COUNT(*) as count FROM users');
        return parseInt(userResult.rows[0].count);
      });

      expect(result).toBe(1);

      // Verify data was committed
      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(1);
    }, TEST_TIMEOUT);

    test('should rollback transaction on error', async () => {
      try {
        await dbHelper.queryWithTransaction(async (client) => {
          await client.query(`
            INSERT INTO users (id, email, password_hash, first_name, last_name)
            VALUES ('550e8400-e29b-41d4-a716-446655440998', 'rollback@test.com', 'hash', 'Roll', 'Back')
          `);
          
          // Force an error
          throw new Error('Intentional error for rollback test');
        });
      } catch (error) {
        expect(error.message).toBe('Intentional error for rollback test');
      }

      // Verify data was rolled back
      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(0);
    }, TEST_TIMEOUT);
  });

  describe('Database Statistics', () => {
    beforeEach(async () => {
      await dbHelper.initialize();
      await dbHelper.cleanup();
    });

    test('should return accurate statistics for empty database', async () => {
      const stats = await dbHelper.getStatistics();
      
      expect(stats).toHaveProperty('users');
      expect(stats).toHaveProperty('tasks');
      expect(stats).toHaveProperty('categories');
      expect(stats).toHaveProperty('timestamp');
      
      expect(stats.users).toBe(0);
      expect(stats.tasks).toBe(0);
      expect(stats.categories).toBe(0);
    }, TEST_TIMEOUT);

    test('should return accurate statistics after seeding', async () => {
      await dbHelper.seedTestData({
        userCount: 3,
        categoryCount: 5,
        taskCount: 10
      });

      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBe(3);
      expect(stats.categories).toBe(5);
      expect(stats.tasks).toBeGreaterThan(0);
    }, TEST_TIMEOUT);
  });

  describe('Database Reset', () => {
    beforeEach(async () => {
      await dbHelper.initialize();
    });

    test('should reset database to initial state', async () => {
      // Add some test data
      await dbHelper.seedTestData({ userCount: 5 });
      
      // Reset to initial state
      await dbHelper.resetToInitialState();

      // Verify reset worked
      const stats = await dbHelper.getStatistics();
      expect(stats.users).toBeGreaterThan(0); // Should have initial test users
      expect(stats.categories).toBeGreaterThan(0); // Should have initial test categories
      expect(stats.tasks).toBeGreaterThan(0); // Should have initial test tasks
    }, TEST_TIMEOUT);
  });

  describe('Error Handling', () => {
    test('should throw error when querying without initialization', async () => {
      const uninitializedHelper = new IntegrationDatabaseHelper();
      
      await expect(uninitializedHelper.query('SELECT 1'))
        .rejects
        .toThrow('Database not initialized');
    });

    test('should handle invalid SQL queries gracefully', async () => {
      await dbHelper.initialize();
      
      await expect(dbHelper.query('INVALID SQL QUERY'))
        .rejects
        .toThrow();
    });

    test('should handle connection failures gracefully', async () => {
      const invalidHelper = new IntegrationDatabaseHelper({
        host: 'invalid-host',
        port: 9999,
        database: 'invalid-db',
        username: 'invalid-user',
        password: 'invalid-password'
      });

      await expect(invalidHelper.initialize())
        .rejects
        .toThrow();
    });
  });

  describe('Global Helper Functions', () => {
    test('should get global database helper instance', () => {
      const helper1 = getIntegrationDatabaseHelper();
      const helper2 = getIntegrationDatabaseHelper();
      
      expect(helper1).toBe(helper2); // Should return same instance
    });

    test('should setup integration database', async () => {
      const helper = await setupIntegrationDatabase();
      expect(helper).toBeInstanceOf(IntegrationDatabaseHelper);
      
      const isHealthy = await helper.healthCheck();
      expect(isHealthy).toBe(true);
    }, TEST_TIMEOUT);

    test('should teardown integration database', async () => {
      await setupIntegrationDatabase();
      await expect(teardownIntegrationDatabase()).resolves.not.toThrow();
    }, TEST_TIMEOUT);
  });
});
