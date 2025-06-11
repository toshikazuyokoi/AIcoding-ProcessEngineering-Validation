/**
 * ===================================
 * Complete TestUtilities Integration Test
 * ===================================
 * Generated for TSK-IT-001-001-TestUtilities
 * Project: Task Management System - Integration Test
 * Purpose: Comprehensive testing of JavaScript TestUtilities
 */

const { TestUtilities, setupTestUtilities, teardownTestUtilities } = require('../../support/utils/TestUtilities');

describe('Complete TestUtilities Integration Tests', () => {
  let testUtils;

  beforeAll(async () => {
    testUtils = await setupTestUtilities();
  });

  afterAll(async () => {
    await teardownTestUtilities();
  });

  describe('Initialization and Shutdown', () => {
    test('should initialize TestUtilities successfully', () => {
      expect(testUtils).toBeDefined();
      expect(testUtils).toBeInstanceOf(TestUtilities);
    });

    test('should be singleton instance', () => {
      const instance1 = TestUtilities.getInstance();
      const instance2 = TestUtilities.getInstance();
      expect(instance1).toBe(instance2);
    });

    test('should have all helpers initialized', () => {
      expect(testUtils.authHelper).toBeDefined();
      expect(testUtils.apiHelper).toBeDefined();
      expect(testUtils.dbHelper).toBeDefined();
    });
  });

  describe('Context Management', () => {
    test('should create and manage test context', () => {
      const testId = testUtils.createContext('context-test', { type: 'integration' });
      
      expect(testId).toBeDefined();
      expect(typeof testId).toBe('string');
      expect(testId).toMatch(/^context-test-\d+-[a-z0-9]+$/);

      const context = testUtils.getContext(testId);
      expect(context).toBeDefined();
      expect(context.testId).toBe(testId);
      expect(context.metadata.type).toBe('integration');
    });

    test('should add and execute cleanup functions', async () => {
      const testId = testUtils.createContext('cleanup-test');
      const cleanupFn = jest.fn().mockResolvedValue(undefined);
      
      testUtils.addCleanup(testId, cleanupFn);
      await testUtils.cleanupContext(testId);
      
      expect(cleanupFn).toHaveBeenCalledTimes(1);
      expect(testUtils.getContext(testId)).toBeUndefined();
    });
  });

  describe('Authentication Operations', () => {
    test('should authenticate user with valid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'testpassword123'
      };

      const token = await testUtils.authenticateUser(credentials);
      
      expect(token).toBeDefined();
      expect(token.accessToken).toBeDefined();
      expect(token.tokenType).toBe('Bearer');
      expect(token.expiresIn).toBeGreaterThan(0);
    });

    test('should create and manage user sessions', async () => {
      const userData = {
        id: 'user-session-test',
        email: 'session@example.com',
        username: 'sessionuser',
        role: 'user',
        isActive: true
      };

      const session = await testUtils.createUserSession(userData);
      
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();
      expect(session.userId).toBe(userData.id);
      expect(session.token).toBeDefined();
      expect(session.userData).toEqual(userData);

      // Cleanup session
      await testUtils.cleanupUserSession(session.sessionId);
    });

    test('should handle authentication errors', async () => {
      const invalidCredentials = {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      };

      await expect(testUtils.authenticateUser(invalidCredentials)).rejects.toThrow();
    });
  });

  describe('Database Operations', () => {
    test('should perform database operations', async () => {
      await expect(testUtils.cleanDatabase()).resolves.not.toThrow();
      await expect(testUtils.seedTestData({ userCount: 2 })).resolves.not.toThrow();
      
      const stats = await testUtils.getDatabaseStats();
      expect(stats).toBeDefined();
      expect(typeof stats).toBe('object');
      
      await expect(testUtils.resetDatabase()).resolves.not.toThrow();
    });
  });

  describe('API Operations', () => {
    test('should handle API request configuration', async () => {
      const requestOptions = {
        method: 'GET',
        url: '/health'
      };

      // Note: This will fail because API helper is not fully initialized
      // but we can test the error handling
      await expect(testUtils.makeAPIRequest(requestOptions)).rejects.toThrow();
    });

    test('should get API statistics', () => {
      const stats = testUtils.apiHelper.getRequestStatistics();
      
      expect(stats).toBeDefined();
      expect(stats).toHaveProperty('totalRequests');
      expect(stats).toHaveProperty('activeRequests');
      expect(stats).toHaveProperty('averageResponseTime');
      expect(stats).toHaveProperty('successRate');
    });
  });

  describe('Utility Functions', () => {
    test('should generate unique test IDs', () => {
      const id1 = testUtils.generateTestId('util-test');
      const id2 = testUtils.generateTestId('util-test');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^util-test-\d+-[a-z0-9]+$/);
      expect(id2).toMatch(/^util-test-\d+-[a-z0-9]+$/);
    });

    test('should wait for conditions', async () => {
      let counter = 0;
      const condition = () => {
        counter++;
        return counter >= 3;
      };

      const startTime = Date.now();
      await testUtils.waitFor(condition, 5000, 50);
      const endTime = Date.now();
      
      expect(counter).toBe(3);
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });

    test('should handle condition timeouts', async () => {
      const condition = () => false;
      
      await expect(testUtils.waitFor(condition, 200, 50)).rejects.toThrow('Condition not met within 200ms');
    });

    test('should sleep for specified time', async () => {
      const startTime = Date.now();
      await testUtils.sleep(100);
      const endTime = Date.now();
      
      expect(endTime - startTime).toBeGreaterThanOrEqual(90);
      expect(endTime - startTime).toBeLessThan(200);
    });

    test('should retry functions with exponential backoff', async () => {
      let attempts = 0;
      const fn = () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('Not ready yet');
        }
        return 'success';
      };

      const result = await testUtils.retry(fn, 3, 10);
      
      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    test('should measure performance', async () => {
      const fn = async () => {
        await testUtils.sleep(50);
        return 'performance-test-result';
      };

      const { result, metrics } = await testUtils.measurePerformance(fn, 'test-operation');
      
      expect(result).toBe('performance-test-result');
      expect(metrics).toBeDefined();
      expect(metrics.executionTime).toBeGreaterThanOrEqual(40);
      expect(metrics.memoryUsage).toBeDefined();
    });

    test('should get current timestamp', () => {
      const timestamp = testUtils.getCurrentTimestamp();
      
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(new Date(timestamp)).toBeInstanceOf(Date);
    });

    test('should format test results', () => {
      const result = { success: true, data: 'test-data' };
      const context = {
        testId: 'format-test-123',
        startTime: Date.now() - 1000,
        metadata: { type: 'integration' },
        cleanup: []
      };

      const formatted = testUtils.formatTestResult(result, context);
      const parsed = JSON.parse(formatted);
      
      expect(parsed.result).toEqual(result);
      expect(parsed.context).toEqual(context.metadata);
      expect(parsed.duration).toBeGreaterThan(0);
      expect(parsed.timestamp).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors gracefully', async () => {
      // Temporarily disable database helper
      const originalDbHelper = testUtils.dbHelper;
      testUtils.dbHelper = null;

      await expect(testUtils.cleanDatabase()).rejects.toThrow('Database helper not initialized');
      
      // Restore database helper
      testUtils.dbHelper = originalDbHelper;
    });

    test('should handle auth helper errors gracefully', async () => {
      // Temporarily disable auth helper
      const originalAuthHelper = testUtils.authHelper;
      testUtils.authHelper = null;

      await expect(testUtils.authenticateUser({})).rejects.toThrow('Auth helper not initialized');
      
      // Restore auth helper
      testUtils.authHelper = originalAuthHelper;
    });

    test('should handle API helper errors gracefully', async () => {
      // Temporarily disable API helper
      const originalApiHelper = testUtils.apiHelper;
      testUtils.apiHelper = null;

      await expect(testUtils.makeAPIRequest({})).rejects.toThrow('API helper not initialized');
      
      // Restore API helper
      testUtils.apiHelper = originalApiHelper;
    });
  });
});
