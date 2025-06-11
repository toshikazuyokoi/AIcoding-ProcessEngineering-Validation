/**
 * Jest Setup Configuration
 * 
 * Global setup configuration for Jest test environment
 * Configures test environment, mocks, and global test utilities
 * 
 * @fileoverview Jest setup file for test environment configuration
 * @version 1.0.0
 * @since 2025-02-01
 */

import { jest } from '@jest/globals';

// ===================================
// Global Test Configuration
// ===================================

/**
 * Set test timeout for all tests
 */
jest.setTimeout(30000);

/**
 * Configure console methods for testing
 */
const originalConsole = global.console;

// Suppress console output during tests unless explicitly needed
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// ===================================
// Environment Variables
// ===================================

/**
 * Set test environment variables
 */
process.env.NODE_ENV = 'test';
process.env.LOG_LEVEL = 'error';
process.env.DATABASE_URL = 'postgresql://test_user:test_password@localhost:5432/test_db';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.JWT_SECRET = 'test_jwt_secret_key_for_testing_only';
process.env.JWT_EXPIRES_IN = '1h';

// ===================================
// Global Mocks
// ===================================

/**
 * Mock external dependencies that should not be called during unit tests
 */

// Mock database connection
jest.mock('../../src/utils/database-connection', () => ({
  getPrismaClient: jest.fn(() => ({
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $transaction: jest.fn()
  })),
  connectDatabase: jest.fn(),
  disconnectDatabase: jest.fn()
}));

// Mock Redis connection
jest.mock('../../src/utils/redis-connection', () => ({
  getRedisClient: jest.fn(() => ({
    connect: jest.fn(),
    disconnect: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  })),
  connectRedis: jest.fn(),
  disconnectRedis: jest.fn()
}));

// Mock logger
jest.mock('../../src/utils/logger', () => ({
  createLogger: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  })),
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }
}));

// ===================================
// Global Test Utilities
// ===================================

/**
 * Global test utilities available in all test files
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
      toBeValidUUID(): R;
      toBeValidEmail(): R;
    }
  }
}

/**
 * Custom Jest matchers
 */
expect.extend({
  toBeValidDate(received: any) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false
      };
    }
  },

  toBeValidUUID(received: any) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = typeof received === 'string' && uuidRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false
      };
    }
  },

  toBeValidEmail(received: any) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pass = typeof received === 'string' && emailRegex.test(received);
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false
      };
    }
  }
});

// ===================================
// Test Data Factories
// ===================================

/**
 * Import TestDataFactory from mock-services for consistency
 * This provides type-safe test data generation across all tests
 */
export { TestDataFactory } from '../tests/mocks/mock-services';

// ===================================
// Test Cleanup
// ===================================

/**
 * Global test cleanup
 */
afterEach(() => {
  // Clear all mocks after each test
  jest.clearAllMocks();
});

/**
 * Global test teardown
 */
afterAll(() => {
  // Restore original console
  global.console = originalConsole;
});
