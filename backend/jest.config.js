/**
 * Jest Configuration
 * 
 * Comprehensive Jest configuration for TypeScript Node.js backend testing
 * Includes unit tests, integration tests, coverage reporting, and performance optimization
 * 
 * @fileoverview Jest configuration for task management backend
 * @version 1.0.0
 * @since 2025-02-01
 */

module.exports = {
  // ===================================
  // Basic Configuration
  // ===================================
  
  /**
   * Use ts-jest preset for TypeScript support
   */
  preset: 'ts-jest',
  
  /**
   * Test environment - Node.js for backend testing
   */
  testEnvironment: 'node',
  
  /**
   * Root directories for test discovery
   */
  roots: [
    '<rootDir>/src',
    '<rootDir>/config',
    '<rootDir>/__tests__'
  ],
  
  /**
   * Test file patterns
   */
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.js',
    '**/tests/**/*.test.ts',
    '**/tests/**/*.test.js'
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
    '/tmp/'
  ],
  
  // ===================================
  // Module Resolution
  // ===================================
  
  /**
   * Module name mapping for path aliases
   */
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@tests/(.*)$': '<rootDir>/__tests__/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@repositories/(.*)$': '<rootDir>/src/repositories/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@types/(.*)$': '<rootDir>/src/types/$1'
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
   * Module directories
   */
  moduleDirectories: [
    'node_modules',
    '<rootDir>/src',
    '<rootDir>/config',
    '<rootDir>/__tests__'
  ],
  
  // ===================================
  // Coverage Configuration
  // ===================================
  
  /**
   * Enable coverage collection
   */
  collectCoverage: false, // Enable with --coverage flag
  
  /**
   * Files to include in coverage collection
   */
  collectCoverageFrom: [
    'src/**/*.ts',
    'config/**/*.ts',
    '!src/**/*.d.ts',
    '!config/**/*.d.ts',
    '!src/**/__tests__/**',
    '!config/**/__tests__/**',
    '!__tests__/**',
    '!src/index.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.type.ts',
    '!src/**/*.types.ts',
    '!src/**/*.enum.ts',
    '!src/**/*.constant.ts',
    '!src/**/*.constants.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/coverage/**',
    '!**/build/**'
  ],
  
  /**
   * Coverage output directory
   */
  coverageDirectory: 'coverage',
  
  /**
   * Coverage reporters
   */
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
    'json',
    'json-summary',
    'clover'
  ],
  
  /**
   * Coverage thresholds
   */
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './src/repositories/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/services/': {
      branches: 90,
      functions: 95,
      lines: 95,
      statements: 95
    },
    './src/controllers/': {
      branches: 85,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // ===================================
  // Test Execution Configuration
  // ===================================
  
  /**
   * Test timeout in milliseconds
   */
  testTimeout: 30000,
  
  /**
   * Verbose output
   */
  verbose: true,
  
  /**
   * Detect open handles (useful for debugging)
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
   * Maximum number of concurrent workers
   */
  maxWorkers: '50%',
  
  /**
   * Cache directory
   */
  cacheDirectory: '<rootDir>/node_modules/.cache/jest',
  
  // ===================================
  // Setup and Teardown
  // ===================================
  
  /**
   * Setup files to run before each test file
   */
  // setupFilesAfterEnv: [
  //   '<rootDir>/__tests__/setup/jest.setup.ts'
  // ],

  /**
   * Global setup file
   */
  // globalSetup: '<rootDir>/__tests__/setup/global.setup.ts',

  /**
   * Global teardown file
   */
  // globalTeardown: '<rootDir>/__tests__/setup/global.teardown.ts',
  
  // ===================================
  // Transform Configuration
  // ===================================
  
  /**
   * Transform configuration for different file types
   */
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        target: 'ES2022',
        module: 'commonjs',
        moduleResolution: 'node',
        allowSyntheticDefaultImports: true,
        esModuleInterop: true,
        skipLibCheck: true,
        strict: true
      }
    }]
  },
  
  /**
   * Files to transform
   */
  transformIgnorePatterns: [
    '/node_modules/(?!(.*\\.mjs$))',
    '\\.pnp\\.[^\\/]+$'
  ],
  
  // ===================================
  // Environment Variables
  // ===================================
  
  /**
   * Test environment options
   */
  testEnvironmentOptions: {
    NODE_ENV: 'test'
  },
  
  // ===================================
  // Error Handling
  // ===================================
  
  /**
   * Error on deprecated features
   */
  errorOnDeprecated: true,
  
  /**
   * Notify mode for watch mode
   */
  notify: false,
  
  /**
   * Notify mode configuration
   */
  notifyMode: 'failure-change',
  
  // ===================================
  // Watch Mode Configuration
  // ===================================
  
  /**
   * Watch mode ignore patterns
   */
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/build/',
    '/.next/',
    '/logs/',
    '/tmp/'
  ],
  
  /**
   * Watch plugins (optional - install if needed)
   */
  // watchPlugins: [
  //   'jest-watch-typeahead/filename',
  //   'jest-watch-typeahead/testname'
  // ]
};
