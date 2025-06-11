/**
 * ===================================
 * Integration Test Utilities (JavaScript)
 * ===================================
 * Generated for TSK-IT-001-001-TestUtilities
 * Project: Task Management System - Integration Test
 * Purpose: Comprehensive test utilities for integration and E2E testing
 */

const { AuthHelper } = require('./AuthHelper');
const { APIHelper } = require('./APIHelper');

/**
 * Main TestUtilities class providing comprehensive test support
 */
class TestUtilities {
  constructor() {
    this.dbHelper = null;
    this.authHelper = null;
    this.apiHelper = null;
    this.uiHelper = null;
    this.activeContexts = new Map();
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!TestUtilities.instance) {
      TestUtilities.instance = new TestUtilities();
    }
    return TestUtilities.instance;
  }

  /**
   * Initialize test utilities
   */
  async initialize() {
    try {
      // Initialize database helper (mock for now)
      this.dbHelper = {
        initialize: async () => {},
        cleanup: async () => {},
        seedTestData: async () => {},
        getStatistics: async () => ({}),
        resetToInitialState: async () => {},
        close: async () => {}
      };

      // Initialize other helpers
      this.authHelper = new AuthHelper();
      this.apiHelper = new APIHelper();
      this.uiHelper = null; // Will be initialized when needed

      console.log('✅ TestUtilities initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize TestUtilities:', error);
      throw error;
    }
  }

  /**
   * Cleanup and shutdown test utilities
   */
  async shutdown() {
    try {
      // Cleanup all active contexts
      for (const [contextId, context] of this.activeContexts) {
        await this.cleanupContext(contextId);
      }

      // Shutdown helpers
      if (this.dbHelper) {
        await this.dbHelper.close();
      }

      console.log('✅ TestUtilities shutdown successfully');
    } catch (error) {
      console.error('❌ Failed to shutdown TestUtilities:', error);
      throw error;
    }
  }

  // ===================================
  // Context Management
  // ===================================

  /**
   * Create test context
   */
  createContext(testName, metadata = {}) {
    const testId = this.generateTestId(testName);
    const context = {
      testId,
      startTime: Date.now(),
      metadata,
      cleanup: []
    };

    this.activeContexts.set(testId, context);
    return testId;
  }

  /**
   * Get test context
   */
  getContext(testId) {
    return this.activeContexts.get(testId);
  }

  /**
   * Add cleanup function to context
   */
  addCleanup(testId, cleanupFn) {
    const context = this.activeContexts.get(testId);
    if (context) {
      context.cleanup.push(cleanupFn);
    }
  }

  /**
   * Cleanup test context
   */
  async cleanupContext(testId) {
    const context = this.activeContexts.get(testId);
    if (!context) {
      return;
    }

    try {
      // Execute cleanup functions in reverse order
      for (let i = context.cleanup.length - 1; i >= 0; i--) {
        await context.cleanup[i]();
      }

      this.activeContexts.delete(testId);
    } catch (error) {
      console.error(`❌ Failed to cleanup context ${testId}:`, error);
      throw error;
    }
  }

  // ===================================
  // Database Operations
  // ===================================

  /**
   * Clean database
   */
  async cleanDatabase() {
    if (!this.dbHelper) {
      throw new Error('Database helper not initialized');
    }
    await this.dbHelper.cleanup();
  }

  /**
   * Seed test data
   */
  async seedTestData(options = {}) {
    if (!this.dbHelper) {
      throw new Error('Database helper not initialized');
    }
    await this.dbHelper.seedTestData(options);
  }

  /**
   * Get database statistics
   */
  async getDatabaseStats() {
    if (!this.dbHelper) {
      throw new Error('Database helper not initialized');
    }
    return await this.dbHelper.getStatistics();
  }

  /**
   * Reset database to initial state
   */
  async resetDatabase() {
    if (!this.dbHelper) {
      throw new Error('Database helper not initialized');
    }
    await this.dbHelper.resetToInitialState();
  }

  // ===================================
  // Authentication Operations
  // ===================================

  /**
   * Authenticate user
   */
  async authenticateUser(credentials) {
    if (!this.authHelper) {
      throw new Error('Auth helper not initialized');
    }
    return await this.authHelper.authenticateUser(credentials);
  }

  /**
   * Create test user session
   */
  async createUserSession(userData) {
    if (!this.authHelper) {
      throw new Error('Auth helper not initialized');
    }
    return await this.authHelper.createUserSession(userData);
  }

  /**
   * Cleanup user session
   */
  async cleanupUserSession(sessionId) {
    if (!this.authHelper) {
      throw new Error('Auth helper not initialized');
    }
    await this.authHelper.cleanupSession(sessionId);
  }

  // ===================================
  // API Operations
  // ===================================

  /**
   * Make authenticated API request
   */
  async makeAPIRequest(options) {
    if (!this.apiHelper) {
      throw new Error('API helper not initialized');
    }
    return await this.apiHelper.makeRequest(options);
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(requestId, timeout = 30000) {
    if (!this.apiHelper) {
      throw new Error('API helper not initialized');
    }
    return await this.apiHelper.waitForResponse(requestId, timeout);
  }

  // ===================================
  // Utility Functions
  // ===================================

  /**
   * Generate unique test ID
   */
  generateTestId(prefix = 'test') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Wait for condition
   */
  async waitFor(condition, timeout = 30000, interval = 100) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const result = await condition();
        if (result) {
          return;
        }
      } catch (error) {
        // Continue waiting
      }

      await this.sleep(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Sleep for specified milliseconds
   */
  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry function with exponential backoff
   */
  async retry(fn, retries = 3, delay = 1000) {
    let lastError;

    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;

        if (i === retries) {
          throw lastError;
        }

        await this.sleep(delay * Math.pow(2, i));
      }
    }

    throw lastError;
  }

  /**
   * Measure performance
   */
  async measurePerformance(fn, label = 'operation') {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const result = await fn();
      const endTime = Date.now();
      const endMemory = process.memoryUsage();

      const metrics = {
        executionTime: endTime - startTime,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: endMemory.arrayBuffers - startMemory.arrayBuffers
        },
        databaseQueries: 0, // TODO: Implement query counting
        apiCalls: 0 // TODO: Implement API call counting
      };

      console.log(`📊 Performance metrics for ${label}:`, metrics);
      return { result, metrics };
    } catch (error) {
      console.error(`❌ Performance measurement failed for ${label}:`, error);
      throw error;
    }
  }

  /**
   * Get current timestamp
   */
  getCurrentTimestamp() {
    return new Date().toISOString();
  }

  /**
   * Format test result
   */
  formatTestResult(result, context) {
    const timestamp = this.getCurrentTimestamp();
    const duration = context ? Date.now() - context.startTime : 0;

    return JSON.stringify({
      timestamp,
      duration,
      result,
      context: context?.metadata || {}
    }, null, 2);
  }
}

// Set singleton instance to null initially
TestUtilities.instance = null;

/**
 * Global instance for easy access
 */
const testUtils = TestUtilities.getInstance();

/**
 * Initialize test utilities for Jest setup
 */
async function setupTestUtilities() {
  const utils = TestUtilities.getInstance();
  await utils.initialize();
  return utils;
}

/**
 * Cleanup test utilities for Jest teardown
 */
async function teardownTestUtilities() {
  const utils = TestUtilities.getInstance();
  await utils.shutdown();
}

module.exports = {
  TestUtilities,
  testUtils,
  setupTestUtilities,
  teardownTestUtilities
};
