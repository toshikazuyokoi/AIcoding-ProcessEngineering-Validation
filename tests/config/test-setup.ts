/**
 * ===================================
 * Integration Test Setup Configuration
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Global test setup for integration and E2E testing
 */

import { jest } from '@jest/globals';
import dotenv from 'dotenv';
import path from 'path';

// ===================================
// Environment Configuration
// ===================================

/**
 * Load integration test environment variables
 */
dotenv.config({ 
  path: path.resolve(__dirname, '../../.env.integration') 
});

/**
 * Set Node environment for testing
 */
process.env.NODE_ENV = 'integration';

// ===================================
// Global Test Configuration
// ===================================

/**
 * Set global test timeout
 */
jest.setTimeout(120000); // 2 minutes for integration tests

/**
 * Configure console methods for testing
 */
const originalConsole = global.console;

// Suppress console output during tests unless explicitly needed
global.console = {
  ...originalConsole,
  log: process.env.TEST_VERBOSE === 'true' ? originalConsole.log : jest.fn(),
  debug: process.env.TEST_VERBOSE === 'true' ? originalConsole.debug : jest.fn(),
  info: process.env.TEST_VERBOSE === 'true' ? originalConsole.info : jest.fn(),
  warn: originalConsole.warn, // Keep warnings visible
  error: originalConsole.error // Keep errors visible
};

// ===================================
// Global Test Utilities
// ===================================

/**
 * Global test utilities available in all test files
 */
declare global {
  namespace globalThis {
    var testUtils: {
      waitFor: (condition: () => boolean | Promise<boolean>, timeout?: number) => Promise<void>;
      sleep: (ms: number) => Promise<void>;
      retry: <T>(fn: () => Promise<T>, retries?: number, delay?: number) => Promise<T>;
      generateTestId: (prefix?: string) => string;
      getCurrentTimestamp: () => string;
    };
  }
}

/**
 * Wait for a condition to be true
 */
const waitFor = async (
  condition: () => boolean | Promise<boolean>, 
  timeout: number = 30000
): Promise<void> => {
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
    
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`Condition not met within ${timeout}ms`);
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Retry a function with exponential backoff
 */
const retry = async <T>(
  fn: () => Promise<T>, 
  retries: number = 3, 
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (i === retries) {
        throw lastError;
      }
      
      await sleep(delay * Math.pow(2, i)); // Exponential backoff
    }
  }
  
  throw lastError!;
};

/**
 * Generate unique test ID
 */
const generateTestId = (prefix: string = 'test'): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
};

/**
 * Get current timestamp in ISO format
 */
const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Assign global test utilities
 */
globalThis.testUtils = {
  waitFor,
  sleep,
  retry,
  generateTestId,
  getCurrentTimestamp
};

// ===================================
// Global Test Hooks
// ===================================

/**
 * Global beforeAll hook
 */
beforeAll(async () => {
  // Set test start time
  global.testStartTime = Date.now();
  
  // Log test environment info
  if (process.env.TEST_VERBOSE === 'true') {
    console.log('🚀 Integration Test Environment Started');
    console.log(`📅 Start Time: ${getCurrentTimestamp()}`);
    console.log(`🌍 Node Environment: ${process.env.NODE_ENV}`);
    console.log(`🗄️  Database URL: ${process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':***@')}`);
    console.log(`🔴 Redis URL: ${process.env.REDIS_URL}`);
  }
});

/**
 * Global afterAll hook
 */
afterAll(async () => {
  // Calculate test duration
  const duration = Date.now() - global.testStartTime;
  
  if (process.env.TEST_VERBOSE === 'true') {
    console.log('🏁 Integration Test Environment Finished');
    console.log(`⏱️  Total Duration: ${duration}ms`);
    console.log(`📅 End Time: ${getCurrentTimestamp()}`);
  }
});

/**
 * Global beforeEach hook
 */
beforeEach(async () => {
  // Set test case start time
  global.testCaseStartTime = Date.now();
});

/**
 * Global afterEach hook
 */
afterEach(async () => {
  // Calculate test case duration
  const duration = Date.now() - global.testCaseStartTime;
  
  // Log slow tests
  if (duration > 30000 && process.env.TEST_VERBOSE === 'true') {
    console.warn(`⚠️  Slow test detected: ${duration}ms`);
  }
});

// ===================================
// Error Handling
// ===================================

/**
 * Global error handler for unhandled promise rejections
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process in test environment
});

/**
 * Global error handler for uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process in test environment
});

// ===================================
// Mock Configuration
// ===================================

/**
 * Mock external services for integration tests
 */
jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' })
  }))
}));

/**
 * Mock file system operations that might interfere with tests
 */
jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  unlinkSync: jest.fn()
}));

// ===================================
// Type Declarations
// ===================================

declare global {
  var testStartTime: number;
  var testCaseStartTime: number;
}

// ===================================
// Export Configuration
// ===================================

export {
  waitFor,
  sleep,
  retry,
  generateTestId,
  getCurrentTimestamp
};
