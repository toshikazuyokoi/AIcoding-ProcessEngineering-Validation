/**
 * ===================================
 * Integration Test Jest Configuration
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Jest configuration for integration and E2E testing
 */

module.exports = {
  // ===================================
  // Basic Configuration
  // ===================================
  
  /**
   * Display name for this configuration
   */
  displayName: {
    name: 'Integration Tests',
    color: 'blue'
  },

  /**
   * Use ts-jest preset for TypeScript support
   */
  preset: 'ts-jest',
  
  /**
   * Test environment - Node.js for integration testing
   */
  testEnvironment: 'node',
  
  /**
   * Root directories for test discovery
   */
  roots: [
    '<rootDir>/../integration',
    '<rootDir>/../support',
    '<rootDir>/../e2e'
  ],
  
  /**
   * Test file patterns for integration tests
   */
  testMatch: [
    '**/integration/**/*.test.ts',
    '**/integration/**/*.test.js',
    '**/support/**/*.test.ts',
    '**/support/**/*.test.js',
    '**/e2e/**/*.test.ts',
    '**/e2e/**/*.test.js'
  ],
  
  /**
   * Files to ignore during testing
   */
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/build/',
    '/.next/',
    '/tmp/',
    '/test-results/',
    '/playwright-report/'
  ],

  // ===================================
  // Module Resolution
  // ===================================
  
  /**
   * Module name mapping for path aliases
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1',
    '^@support/(.*)$': '<rootDir>/../support/$1',
    '^@integration/(.*)$': '<rootDir>/../integration/$1',
    '^@e2e/(.*)$': '<rootDir>/../e2e/$1',
    '^@backend/(.*)$': '<rootDir>/../../backend/src/$1',
    '^@frontend/(.*)$': '<rootDir>/../../frontend/src/$1'
  },
  
  /**
   * File extensions to consider
   */
  moduleFileExtensions: [
    'ts',
    'tsx',
    'js',
    'jsx',
    'json',
    'node'
  ],

  /**
   * Transform configuration
   */
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: '<rootDir>/tsconfig.test.json',
      isolatedModules: true
    }],
    '^.+\\.(js|jsx)$': 'babel-jest'
  },

  /**
   * Files to ignore during transformation
   */
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$))',
    '\\.pnp\\.[^\\/]+$'
  ],

  // ===================================
  // Coverage Configuration
  // ===================================
  
  /**
   * Enable coverage collection
   */
  collectCoverage: true,
  
  /**
   * Coverage directory
   */
  coverageDirectory: '<rootDir>/../coverage/integration',
  
  /**
   * Coverage file patterns
   */
  collectCoverageFrom: [
    '../integration/**/*.{ts,js}',
    '../support/**/*.{ts,js}',
    '!../integration/**/*.test.{ts,js}',
    '!../support/**/*.test.{ts,js}',
    '!../integration/**/index.{ts,js}',
    '!../support/**/index.{ts,js}',
    '!**/node_modules/**',
    '!**/coverage/**',
    '!**/dist/**',
    '!**/build/**'
  ],
  
  /**
   * Coverage reporters
   */
  coverageReporters: [
    'text',
    'text-summary',
    'html',
    'lcov',
    'json',
    'json-summary'
  ],
  
  /**
   * Coverage thresholds for integration tests
   */
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    '../integration/database/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    '../integration/api/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    '../support/': {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // ===================================
  // Test Execution Configuration
  // ===================================
  
  /**
   * Test timeout in milliseconds (extended for integration tests)
   */
  testTimeout: 120000, // 2 minutes
  
  /**
   * Verbose output for detailed test results
   */
  verbose: true,
  
  /**
   * Detect open handles (useful for debugging database connections)
   */
  detectOpenHandles: true,
  
  /**
   * Force exit after tests complete
   */
  forceExit: true,
  
  /**
   * Clear mocks between tests
   */
  clearMocks: true,
  
  /**
   * Reset mocks between tests
   */
  resetMocks: true,
  
  /**
   * Restore mocks after each test
   */
  restoreMocks: true,
  
  /**
   * Maximum number of concurrent workers (reduced for integration tests)
   */
  maxWorkers: 2,
  
  /**
   * Cache directory
   */
  cacheDirectory: '<rootDir>/../../node_modules/.cache/jest-integration',

  // ===================================
  // Setup and Teardown
  // ===================================
  
  /**
   * Setup files to run before each test file
   */
  setupFilesAfterEnv: [
    '<rootDir>/test-setup.ts'
  ],

  /**
   * Global setup file for integration tests
   */
  globalSetup: '<rootDir>/global-setup.ts',

  /**
   * Global teardown file for integration tests
   */
  globalTeardown: '<rootDir>/global-teardown.ts',

  // ===================================
  // Reporting Configuration
  // ===================================
  
  /**
   * Test result reporters
   */
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: '<rootDir>/../test-results/integration',
      filename: 'integration-test-report.html',
      expand: true,
      hideIcon: false,
      pageTitle: 'Integration Test Report',
      logoImgPath: undefined,
      inlineSource: false
    }],
    ['jest-junit', {
      outputDirectory: '<rootDir>/../test-results/integration',
      outputName: 'integration-test-results.xml',
      ancestorSeparator: ' › ',
      uniqueOutputName: false,
      suiteNameTemplate: '{filepath}',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}'
    }]
  ],

  // ===================================
  // Environment Variables
  // ===================================
  
  /**
   * Environment variables for integration tests
   */
  testEnvironmentOptions: {
    NODE_ENV: 'integration',
    DATABASE_URL: 'postgresql://integration_user:integration_password_123@localhost:5434/taskdb_integration',
    REDIS_URL: 'redis://localhost:6381',
    JWT_SECRET: 'integration_jwt_secret_key_for_testing_only',
    LOG_LEVEL: 'warn'
  },

  // ===================================
  // Advanced Configuration
  // ===================================
  
  /**
   * Bail after first test failure
   */
  bail: false,
  
  /**
   * Error on deprecated features
   */
  errorOnDeprecated: true,
  
  /**
   * Notify mode
   */
  notify: false,
  
  /**
   * Watch mode configuration
   */
  watchman: true,
  
  /**
   * Silent mode
   */
  silent: false,
  
  /**
   * Pass with no tests
   */
  passWithNoTests: true,
  
  /**
   * Test name pattern
   */
  testNamePattern: undefined,
  
  /**
   * Update snapshots
   */
  updateSnapshot: false
};
