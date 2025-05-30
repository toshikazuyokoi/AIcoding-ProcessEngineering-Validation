// ===================================
// Task Management System - Environment Configuration Tests
// ===================================
// Generated for TSK-037-CFG-Environment
// Project: Task Management System
// Component: Environment Configuration Test Suite
// Purpose: Comprehensive testing of environment configuration functionality

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
  EnvironmentConfig,
  EnvironmentConfigBuilder,
  EnvironmentConfigError,
  EnvironmentConfigManager,
  createEnvironmentConfig,
  createEnvironmentConfigFromEnv,
  createEnvironmentConfigForEnvironment,
  getDefaultEnvironmentConfig,
  getEnvironmentConfigManager,
  initializeEnvironmentConfig,
} from '../environment';

// ===================================
// Test Setup and Utilities
// ===================================

describe('Environment Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear environment variables
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.LOG_LEVEL;
    delete process.env.DATABASE_URL;
    delete process.env.REDIS_URL;
    delete process.env.JWT_SECRET;
    delete process.env.CORS_ORIGIN;

    // Reset singleton
    const manager = getEnvironmentConfigManager();
    manager.reset();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  // ===================================
  // EnvironmentConfigBuilder Tests
  // ===================================

  describe('EnvironmentConfigBuilder', () => {
    test('should create builder with default values', () => {
      const config = new EnvironmentConfigBuilder().build();

      expect(config.app.environment).toBe('development');
      expect(config.app.port).toBe(8000);
      expect(config.app.logLevel).toBe('debug');
      expect(config.app.corsOrigin).toBe('http://localhost:3000');
      expect(config.database.url).toBe('postgresql://postgres:dev_password_123@localhost:5432/taskdb_dev');
      expect(config.redis.host).toBe('localhost');
      expect(config.redis.port).toBe(6379);
      expect(config.jwt.secret).toBe('dev_jwt_secret_key_for_development_only_change_in_production');
    });

    test('should build configuration with environment variables', () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '3000';
      process.env.LOG_LEVEL = 'info';
      process.env.DATABASE_URL = 'postgresql://user:pass@prod-host:5432/proddb';
      process.env.REDIS_URL = 'redis://redis-host:6379';
      process.env.JWT_SECRET = 'production_jwt_secret_key_very_secure';
      process.env.CORS_ORIGIN = 'https://myapp.com';

      const config = new EnvironmentConfigBuilder().build();

      expect(config.app.environment).toBe('production');
      expect(config.app.port).toBe(3000);
      expect(config.app.logLevel).toBe('info');
      expect(config.app.corsOrigin).toBe('https://myapp.com');
      expect(config.database.url).toBe('postgresql://user:pass@prod-host:5432/proddb');
      expect(config.redis.url).toBe('redis://redis-host:6379');
      expect(config.jwt.secret).toBe('production_jwt_secret_key_very_secure');
    });

    test('should build configuration with custom values', () => {
      const config = new EnvironmentConfigBuilder()
        .app({ environment: 'staging', port: 9000, logLevel: 'warn', corsOrigin: 'https://staging.example.com', timezone: 'UTC', debugEnabled: false })
        .database({ url: 'postgresql://custom:pass@localhost:5432/customdb', maxConnections: 100 })
        .redis({ host: 'custom-redis', port: 6380 })
        .jwt({ secret: 'custom_jwt_secret_with_32_characters', accessExpiresIn: '2h', refreshExpiresIn: '7d', algorithm: 'HS256', issuer: 'test', audience: 'test' })
        .security({ bcryptSaltRounds: 12, rateLimitMax: 200 })
        .build();

      expect(config.app.environment).toBe('staging');
      expect(config.app.port).toBe(9000);
      expect(config.app.logLevel).toBe('warn');
      expect(config.database.url).toBe('postgresql://custom:pass@localhost:5432/customdb');
      expect(config.database.maxConnections).toBe(100);
      expect(config.redis.host).toBe('custom-redis');
      expect(config.redis.port).toBe(6380);
      expect(config.jwt.secret).toBe('custom_jwt_secret_with_32_characters');
      expect(config.jwt.accessExpiresIn).toBe('2h');
      expect(config.security.bcryptSaltRounds).toBe(12);
      expect(config.security.rateLimitMax).toBe(200);
    });

    test('should use environment-specific defaults', () => {
      const devConfig = createEnvironmentConfigForEnvironment('development');

      // Set DATABASE_URL for production test
      process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/proddb';
      const prodConfig = createEnvironmentConfigForEnvironment('production');
      const testConfig = createEnvironmentConfigForEnvironment('test');

      expect(devConfig.app.environment).toBe('development');
      expect(devConfig.database.maxConnections).toBe(20);
      expect(devConfig.app.debugEnabled).toBe(true);
      expect(devConfig.development.seedEnabled).toBe(true);

      expect(prodConfig.app.environment).toBe('production');
      expect(prodConfig.database.maxConnections).toBe(50);
      expect(prodConfig.app.debugEnabled).toBe(false);

      expect(testConfig.app.environment).toBe('test');
      expect(testConfig.database.maxConnections).toBe(5);
      expect(testConfig.database.connectionTimeout).toBe(5000);
      expect(testConfig.monitoring.apmEnabled).toBe(false);
    });
  });

  // ===================================
  // Configuration Validation Tests
  // ===================================

  describe('Configuration Validation', () => {
    test('should throw error for invalid port', () => {
      expect(() => {
        new EnvironmentConfigBuilder()
          .app({ environment: 'development', port: 0, logLevel: 'debug', timezone: 'UTC', corsOrigin: 'http://localhost:3000', debugEnabled: true })
          .build();
      }).toThrow(EnvironmentConfigError);

      expect(() => {
        new EnvironmentConfigBuilder()
          .app({ environment: 'development', port: 70000, logLevel: 'debug', timezone: 'UTC', corsOrigin: 'http://localhost:3000', debugEnabled: true })
          .build();
      }).toThrow(EnvironmentConfigError);
    });

    test('should throw error for missing required fields', () => {
      expect(() => {
        new EnvironmentConfigBuilder()
          .app({ environment: 'development', port: 8000, logLevel: 'debug', timezone: 'UTC', corsOrigin: '', debugEnabled: true })
          .build();
      }).toThrow(EnvironmentConfigError);

      expect(() => {
        new EnvironmentConfigBuilder()
          .database({ url: '', maxConnections: 20, minConnections: 5, connectionTimeout: 30000, idleTimeout: 10000, retryAttempts: 3, retryDelay: 1000 })
          .build();
      }).toThrow(EnvironmentConfigError);
    });

    test('should throw error for invalid database configuration', () => {
      expect(() => {
        new EnvironmentConfigBuilder()
          .database({ url: 'postgresql://localhost:5432/db', maxConnections: 0, minConnections: 5, connectionTimeout: 30000, idleTimeout: 10000, retryAttempts: 3, retryDelay: 1000 })
          .build();
      }).toThrow(EnvironmentConfigError);

      expect(() => {
        new EnvironmentConfigBuilder()
          .database({ url: 'postgresql://localhost:5432/db', maxConnections: 10, minConnections: 15, connectionTimeout: 30000, idleTimeout: 10000, retryAttempts: 3, retryDelay: 1000 })
          .build();
      }).toThrow(EnvironmentConfigError);
    });

    test('should throw error for invalid JWT configuration', () => {
      expect(() => {
        new EnvironmentConfigBuilder()
          .jwt({ secret: '', accessExpiresIn: '1h', refreshExpiresIn: '7d', algorithm: 'HS256', issuer: 'test', audience: 'test' })
          .build();
      }).toThrow(EnvironmentConfigError);

      expect(() => {
        new EnvironmentConfigBuilder()
          .jwt({ secret: 'short', accessExpiresIn: '1h', refreshExpiresIn: '7d', algorithm: 'HS256', issuer: 'test', audience: 'test' })
          .build();
      }).toThrow(EnvironmentConfigError);
    });

    test('should throw error for invalid security configuration', () => {
      expect(() => {
        new EnvironmentConfigBuilder()
          .security({ helmetEnabled: true, rateLimitEnabled: true, rateLimitMax: 100, rateLimitWindow: 900000, bcryptSaltRounds: 5 })
          .build();
      }).toThrow(EnvironmentConfigError);

      expect(() => {
        new EnvironmentConfigBuilder()
          .security({ helmetEnabled: true, rateLimitEnabled: true, rateLimitMax: 100, rateLimitWindow: 900000, bcryptSaltRounds: 20 })
          .build();
      }).toThrow(EnvironmentConfigError);
    });

    test('should throw error for invalid file upload configuration', () => {
      expect(() => {
        new EnvironmentConfigBuilder()
          .fileUpload({ maxFileSize: 0, allowedFileTypes: ['image/jpeg'], uploadDir: 'uploads', tempDir: 'temp' })
          .build();
      }).toThrow(EnvironmentConfigError);
    });

    test('should warn for production without SSL', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      // Set DATABASE_URL for production environment
      process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/proddb';

      new EnvironmentConfigBuilder()
        .app({ environment: 'production', port: 8000, logLevel: 'info', timezone: 'UTC', corsOrigin: 'https://example.com', debugEnabled: false })
        .production({ sslEnabled: false, sessionTimeout: 3600000, healthCheckEnabled: true, healthCheckEndpoint: '/health', backupEnabled: false, backupRetentionDays: 30 })
        .build();

      expect(consoleSpy).toHaveBeenCalledWith('Warning: SSL is not enabled in production environment');
      consoleSpy.mockRestore();
    });
  });

  // ===================================
  // Environment-Specific Configuration Tests
  // ===================================

  describe('Environment-Specific Configuration', () => {
    test('should configure for development environment', () => {
      const config = createEnvironmentConfigForEnvironment('development');

      expect(config.app.environment).toBe('development');
      expect(config.app.debugEnabled).toBe(true);
      expect(config.database.maxConnections).toBe(20);
      expect(config.database.minConnections).toBe(5);
      expect(config.development.seedEnabled).toBe(true);
      expect(config.development.debugEnabled).toBe(true);
      expect(config.monitoring.apmEnabled).toBe(false);
    });

    test('should configure for production environment', () => {
      process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/proddb';

      const config = createEnvironmentConfigForEnvironment('production');

      expect(config.app.environment).toBe('production');
      expect(config.app.debugEnabled).toBe(false);
      expect(config.database.maxConnections).toBe(50);
      expect(config.database.minConnections).toBe(10);
      expect(config.production.healthCheckEnabled).toBe(true);
    });

    test('should configure for test environment', () => {
      const config = createEnvironmentConfigForEnvironment('test');

      expect(config.app.environment).toBe('test');
      expect(config.database.maxConnections).toBe(5);
      expect(config.database.minConnections).toBe(1);
      expect(config.database.connectionTimeout).toBe(5000);
      expect(config.database.idleTimeout).toBe(1000);
      expect(config.monitoring.apmEnabled).toBe(false);
    });

    test('should configure for staging environment', () => {
      const config = createEnvironmentConfigForEnvironment('staging');

      expect(config.app.environment).toBe('staging');
      expect(config.database.maxConnections).toBe(30);
      expect(config.database.minConnections).toBe(5);
    });

    test('should require DATABASE_URL in production', () => {
      delete process.env.DATABASE_URL;

      expect(() => {
        createEnvironmentConfigForEnvironment('production');
      }).toThrow(EnvironmentConfigError);
    });
  });

  // ===================================
  // EnvironmentConfigManager Tests
  // ===================================

  describe('EnvironmentConfigManager', () => {
    test('should initialize configuration', () => {
      const manager = getEnvironmentConfigManager();
      const config = createEnvironmentConfigForEnvironment('development');

      expect(manager.isInitialized()).toBe(false);

      manager.initialize(config);

      expect(manager.isInitialized()).toBe(true);
      expect(manager.getConfig()).toEqual(config);
    });

    test('should throw error when accessing uninitialized config', () => {
      const manager = getEnvironmentConfigManager();

      expect(() => {
        manager.getConfig();
      }).toThrow(EnvironmentConfigError);

      expect(() => {
        manager.getAppConfig();
      }).toThrow(EnvironmentConfigError);
    });

    test('should provide section-specific getters', () => {
      const manager = getEnvironmentConfigManager();
      const config = createEnvironmentConfigForEnvironment('development');
      manager.initialize(config);

      expect(manager.getAppConfig()).toEqual(config.app);
      expect(manager.getDatabaseConfig()).toEqual(config.database);
      expect(manager.getRedisConfig()).toEqual(config.redis);
      expect(manager.getJWTConfig()).toEqual(config.jwt);
      expect(manager.getSecurityConfig()).toEqual(config.security);
    });

    test('should update configuration', () => {
      const manager = getEnvironmentConfigManager();
      const config = createEnvironmentConfigForEnvironment('development');
      manager.initialize(config);

      const updates = {
        app: { ...config.app, port: 9000 }
      };

      manager.updateConfig(updates);

      const updatedConfig = manager.getConfig();
      expect(updatedConfig.app.port).toBe(9000);
    });

    test('should reset configuration', () => {
      const manager = getEnvironmentConfigManager();
      const config = createEnvironmentConfigForEnvironment('development');
      manager.initialize(config);

      expect(manager.isInitialized()).toBe(true);

      manager.reset();

      expect(manager.isInitialized()).toBe(false);
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    test('should create configuration from environment', () => {
      process.env.NODE_ENV = 'staging';
      process.env.PORT = '5000';
      process.env.JWT_SECRET = 'staging_jwt_secret_key_with_32_characters';

      const config = createEnvironmentConfigFromEnv();

      expect(config.app.environment).toBe('staging');
      expect(config.app.port).toBe(5000);
      expect(config.jwt.secret).toBe('staging_jwt_secret_key_with_32_characters');
    });

    test('should get default configuration', () => {
      const config = getDefaultEnvironmentConfig();

      expect(config).toBeDefined();
      expect(config.app.environment).toBe('development');
      expect(config.app.port).toBe(8000);
    });

    test('should initialize configuration from environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.PORT = '8080';

      const config = initializeEnvironmentConfig();
      const manager = getEnvironmentConfigManager();

      expect(manager.isInitialized()).toBe(true);
      expect(config.app.environment).toBe('test');
      expect(config.app.port).toBe(8080);
    });

    test('should create configuration with custom options', () => {
      const config = createEnvironmentConfig({
        app: { environment: 'staging', port: 9000, logLevel: 'info', corsOrigin: 'https://custom.example.com' },
        database: { url: 'postgresql://custom:pass@localhost:5432/customdb' },
        redis: { host: 'custom-redis', port: 6380 },
        jwt: { secret: 'custom_jwt_secret_with_32_characters', accessExpiresIn: '1h', refreshExpiresIn: '7d', algorithm: 'HS256', issuer: 'test', audience: 'test' },
        security: { bcryptSaltRounds: 12 },
      });

      expect(config.app.environment).toBe('staging');
      expect(config.app.port).toBe(9000);
      expect(config.database.url).toBe('postgresql://custom:pass@localhost:5432/customdb');
      expect(config.redis.host).toBe('custom-redis');
      expect(config.redis.port).toBe(6380);
      expect(config.jwt.secret).toBe('custom_jwt_secret_with_32_characters');
      expect(config.security.bcryptSaltRounds).toBe(12);
    });
  });

  // ===================================
  // Edge Cases Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle missing environment variables gracefully', () => {
      // Clear all environment variables
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('NODE_ENV') || key.startsWith('PORT') || key.startsWith('DATABASE_') || key.startsWith('REDIS_') || key.startsWith('JWT_')) {
          delete process.env[key];
        }
      });

      const config = createEnvironmentConfigFromEnv();

      expect(config.app.environment).toBe('development');
      expect(config.app.port).toBe(8000);
      expect(config.app.logLevel).toBe('debug');
      expect(config.database.url).toBe('postgresql://postgres:dev_password_123@localhost:5432/taskdb_dev');
      expect(config.redis.host).toBe('localhost');
      expect(config.redis.port).toBe(6379);
    });

    test('should handle invalid environment variable values', () => {
      process.env.PORT = 'invalid';
      process.env.DB_MAX_CONNECTIONS = 'not-a-number';
      process.env.REDIS_PORT = 'invalid-port';
      process.env.BCRYPT_SALT_ROUNDS = 'invalid-rounds';

      const config = createEnvironmentConfigFromEnv();

      // Should fall back to defaults
      expect(config.app.port).toBe(8000);
      expect(config.database.maxConnections).toBe(20); // development default
      expect(config.redis.port).toBe(6379);
      expect(config.security.bcryptSaltRounds).toBe(10);
    });

    test('should handle boolean environment variables', () => {
      process.env.DEBUG_ENABLED = 'true';
      process.env.HELMET_ENABLED = 'false';
      process.env.SSL_ENABLED = 'TRUE';
      process.env.SEED_ENABLED = 'False';

      const config = createEnvironmentConfigFromEnv();

      expect(config.app.debugEnabled).toBe(true);
      expect(config.security.helmetEnabled).toBe(false);
      expect(config.production.sslEnabled).toBe(true);
      expect(config.development.seedEnabled).toBe(false);
    });

    test('should handle array environment variables', () => {
      process.env.ALLOWED_FILE_TYPES = 'image/jpeg,image/png,application/pdf';

      const config = createEnvironmentConfigFromEnv();

      expect(config.fileUpload.allowedFileTypes).toEqual(['image/jpeg', 'image/png', 'application/pdf']);
    });

    test('should validate configuration after updates', () => {
      const manager = getEnvironmentConfigManager();
      const config = createEnvironmentConfigForEnvironment('development');
      manager.initialize(config);

      expect(() => {
        manager.updateConfig({
          app: { ...config.app, port: 0 }
        });
      }).toThrow(EnvironmentConfigError);
    });

    test('should handle environment switching correctly', () => {
      // Test development to production switch
      const devConfig = createEnvironmentConfigForEnvironment('development');
      expect(devConfig.app.environment).toBe('development');
      expect(devConfig.app.debugEnabled).toBe(true);

      // Set production environment
      process.env.DATABASE_URL = 'postgresql://prod:pass@localhost:5432/proddb';
      const prodConfig = createEnvironmentConfigForEnvironment('production');
      expect(prodConfig.app.environment).toBe('production');
      expect(prodConfig.app.debugEnabled).toBe(false);
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration Tests', () => {
    test('should create complete configuration for production', () => {
      process.env.NODE_ENV = 'production';
      process.env.PORT = '8080';
      process.env.DATABASE_URL = 'postgresql://prod:pass@prod-host:5432/proddb';
      process.env.REDIS_URL = 'redis://redis-prod:6379';
      process.env.JWT_SECRET = 'production_jwt_secret_key_very_secure_32_chars';
      process.env.CORS_ORIGIN = 'https://myapp.com';
      process.env.SSL_ENABLED = 'true';

      const config = createEnvironmentConfigFromEnv();

      expect(config.app.environment).toBe('production');
      expect(config.app.port).toBe(8080);
      expect(config.app.debugEnabled).toBe(false);
      expect(config.database.url).toBe('postgresql://prod:pass@prod-host:5432/proddb');
      expect(config.database.maxConnections).toBe(50);
      expect(config.redis.url).toBe('redis://redis-prod:6379');
      expect(config.jwt.secret).toBe('production_jwt_secret_key_very_secure_32_chars');
      expect(config.app.corsOrigin).toBe('https://myapp.com');
      expect(config.production.sslEnabled).toBe(true);
    });

    test('should work with configuration manager lifecycle', () => {
      const manager = getEnvironmentConfigManager();

      // Initialize
      const config = createEnvironmentConfigForEnvironment('development');
      manager.initialize(config);

      expect(manager.isInitialized()).toBe(true);

      // Update
      manager.updateConfig({
        app: { ...config.app, port: 9000 }
      });

      expect(manager.getConfig().app.port).toBe(9000);

      // Reset
      manager.reset();

      expect(manager.isInitialized()).toBe(false);
    });
  });
});
