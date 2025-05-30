// ===================================
// Task Management System - Database Configuration Tests
// ===================================
// Generated for TSK-035-CFG-Database
// Project: Task Management System
// Component: Database Configuration Test Suite
// Purpose: Comprehensive testing of database configuration functionality

// Mock logger to avoid dependency issues
jest.mock('../../src/utils/logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  })),
}));

import {
  DatabaseConfig,
  DatabaseConfigBuilder,
  DatabaseConfigError,
  createDatabaseConfig,
  createDatabaseConfigFromEnv,
  createDatabaseConfigForEnvironment,
  createDatabaseConfigWithUrl,
  getDatabaseConfigManager,
  getDefaultDatabaseConfig,
  initializeDatabaseConfig,
} from '../database';

// ===================================
// Test Setup and Utilities
// ===================================

describe('Database Configuration', () => {
  // Store original environment variables
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment variables for each test
    jest.resetModules();
    process.env = { ...originalEnv };

    // Reset configuration manager
    getDatabaseConfigManager().reset();
  });

  afterAll(() => {
    // Restore original environment variables
    process.env = originalEnv;
  });

  // ===================================
  // Configuration Builder Tests
  // ===================================

  describe('DatabaseConfigBuilder', () => {
    test('should create builder with default values', () => {
      const builder = createDatabaseConfig();
      expect(builder).toBeInstanceOf(DatabaseConfigBuilder);
    });

    test('should build configuration with environment variables', () => {
      process.env.NODE_ENV = 'development';
      process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
      process.env.DB_MAX_CONNECTIONS = '25';
      process.env.DB_MIN_CONNECTIONS = '3';

      const config = createDatabaseConfigFromEnv();

      expect(config.url).toBe('postgresql://test:test@localhost:5432/testdb');
      expect(config.environment).toBe('development');
      expect(config.provider).toBe('postgresql');
      expect(config.pool.max).toBe(25);
      expect(config.pool.min).toBe(3);
    });

    test('should build configuration with custom values', () => {
      const config = createDatabaseConfig()
        .url('postgresql://custom:pass@localhost:5432/customdb')
        .environment('test')
        .pool({ max: 10, min: 2 })
        .enableHealthCheck(60000)
        .build();

      expect(config.url).toBe('postgresql://custom:pass@localhost:5432/customdb');
      expect(config.environment).toBe('test');
      expect(config.pool.max).toBe(10);
      expect(config.pool.min).toBe(2);
      expect(config.healthCheck).toBe(true);
      expect(config.healthCheckInterval).toBe(60000);
    });

    test('should use environment-specific defaults', () => {
      const devConfig = createDatabaseConfigForEnvironment('development');

      // Set DATABASE_URL for production test
      process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/proddb';
      const prodConfig = createDatabaseConfigForEnvironment('production');

      expect(devConfig.environment).toBe('development');
      expect(devConfig.pool.max).toBe(20);
      expect(devConfig.logging.enabled).toBe(true);

      expect(prodConfig.environment).toBe('production');
      expect(prodConfig.pool.max).toBe(50);
      expect(prodConfig.ssl.enabled).toBe(true);
    });
  });

  // ===================================
  // Configuration Validation Tests
  // ===================================

  describe('Configuration Validation', () => {
    test('should throw error for invalid database URL', () => {
      expect(() => {
        createDatabaseConfig()
          .url('invalid-url')
          .build();
      }).toThrow(DatabaseConfigError);
    });

    test('should throw error for invalid pool configuration', () => {
      expect(() => {
        createDatabaseConfig()
          .url('postgresql://test:test@localhost:5432/testdb')
          .pool({ max: 0, min: 1 })
          .build();
      }).toThrow(DatabaseConfigError);

      expect(() => {
        createDatabaseConfig()
          .url('postgresql://test:test@localhost:5432/testdb')
          .pool({ max: 5, min: 10 })
          .build();
      }).toThrow(DatabaseConfigError);
    });

    test('should throw error for invalid retry configuration', () => {
      expect(() => {
        createDatabaseConfig()
          .url('postgresql://test:test@localhost:5432/testdb')
          .retry({ attempts: -1, delay: 1000, maxDelay: 5000, backoffFactor: 2 })
          .build();
      }).toThrow(DatabaseConfigError);
    });

    test('should throw error for missing DATABASE_URL in production', () => {
      delete process.env.DATABASE_URL;

      expect(() => {
        createDatabaseConfigForEnvironment('production');
      }).toThrow(DatabaseConfigError);
    });
  });

  // ===================================
  // Environment-Specific Tests
  // ===================================

  describe('Environment-Specific Configuration', () => {
    test('should configure for development environment', () => {
      const config = createDatabaseConfigForEnvironment('development');

      expect(config.environment).toBe('development');
      expect(config.pool.max).toBe(20);
      expect(config.pool.min).toBe(5);
      expect(config.logging.enabled).toBe(true);
      expect(config.ssl.enabled).toBe(false);
      expect(config.migration.autoMigrate).toBe(true);
    });

    test('should configure for production environment', () => {
      process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/proddb';

      const config = createDatabaseConfigForEnvironment('production');

      expect(config.environment).toBe('production');
      expect(config.pool.max).toBe(50);
      expect(config.pool.min).toBe(10);
      expect(config.ssl.enabled).toBe(true);
      expect(config.retry.maxDelay).toBe(30000);
    });

    test('should configure for test environment', () => {
      const config = createDatabaseConfigForEnvironment('test');

      expect(config.environment).toBe('test');
      expect(config.pool.max).toBe(5);
      expect(config.pool.min).toBe(1);
      expect(config.retry.attempts).toBe(1);
      expect(config.pool.connectionTimeout).toBe(5000);
    });

    test('should configure for staging environment', () => {
      const config = createDatabaseConfigForEnvironment('staging');

      expect(config.environment).toBe('staging');
      expect(config.pool.max).toBe(30);
      expect(config.pool.min).toBe(5);
    });
  });

  // ===================================
  // Configuration Manager Tests
  // ===================================

  describe('DatabaseConfigManager', () => {
    test('should initialize configuration', () => {
      const customConfig = createDatabaseConfigWithUrl('postgresql://test:test@localhost:5432/testdb');

      initializeDatabaseConfig(customConfig);

      const manager = getDatabaseConfigManager();
      const config = manager.getConfig();

      expect(config.url).toBe('postgresql://test:test@localhost:5432/testdb');
    });

    test('should throw error when accessing uninitialized config', () => {
      const manager = getDatabaseConfigManager();

      expect(() => {
        manager.getConfig();
      }).toThrow(DatabaseConfigError);
    });

    test('should update configuration', () => {
      initializeDatabaseConfig();

      const manager = getDatabaseConfigManager();
      manager.updateConfig({ healthCheckInterval: 45000 });

      const config = manager.getConfig();
      expect(config.healthCheckInterval).toBe(45000);
    });

    test('should reset configuration', () => {
      initializeDatabaseConfig();

      const manager = getDatabaseConfigManager();
      manager.reset();

      expect(() => {
        manager.getConfig();
      }).toThrow(DatabaseConfigError);
    });
  });

  // ===================================
  // Utility Function Tests
  // ===================================

  describe('Utility Functions', () => {
    test('should create configuration with custom URL', () => {
      const config = createDatabaseConfigWithUrl('mysql://user:pass@localhost:3306/mydb');

      expect(config.url).toBe('mysql://user:pass@localhost:3306/mydb');
      expect(config.provider).toBe('mysql');
    });

    test('should get default configuration', () => {
      process.env.DATABASE_URL = 'postgresql://default:pass@localhost:5432/defaultdb';

      const config = getDefaultDatabaseConfig();

      expect(config.url).toBe('postgresql://default:pass@localhost:5432/defaultdb');
    });
  });

  // ===================================
  // Edge Cases and Error Handling
  // ===================================

  describe('Edge Cases', () => {
    test('should handle missing environment variables gracefully', () => {
      // Clear all database-related environment variables
      delete process.env.DATABASE_URL;
      delete process.env.DB_MAX_CONNECTIONS;
      delete process.env.DB_MIN_CONNECTIONS;
      delete process.env.NODE_ENV;

      const config = createDatabaseConfigFromEnv();

      expect(config.environment).toBe('development');
      expect(config.pool.max).toBe(20);
      expect(config.pool.min).toBe(5);
      expect(config.url).toContain('taskdb_dev');
    });

    test('should handle invalid environment variable values', () => {
      // Clear NODE_ENV to ensure development defaults
      delete process.env.NODE_ENV;
      process.env.DB_MAX_CONNECTIONS = 'invalid';
      process.env.DB_MIN_CONNECTIONS = 'also-invalid';
      process.env.DB_CONNECTION_TIMEOUT = 'not-a-number';

      const config = createDatabaseConfigFromEnv();

      // Should fall back to development defaults (since NODE_ENV is not set)
      expect(config.pool.max).toBe(20);
      expect(config.pool.min).toBe(5);
      expect(config.pool.connectionTimeout).toBe(30000);
    });

    test('should detect database provider from URL', () => {
      const postgresConfig = createDatabaseConfigWithUrl('postgresql://user:pass@localhost:5432/db');
      const mysqlConfig = createDatabaseConfigWithUrl('mysql://user:pass@localhost:3306/db');
      const sqliteConfig = createDatabaseConfigWithUrl('sqlite://./database.db');

      expect(postgresConfig.provider).toBe('postgresql');
      expect(mysqlConfig.provider).toBe('mysql');
      expect(sqliteConfig.provider).toBe('sqlite');
    });
  });
});
