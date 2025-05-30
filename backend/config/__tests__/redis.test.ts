// ===================================
// Task Management System - Redis Configuration Tests
// ===================================
// Generated for TSK-036-CFG-Redis
// Project: Task Management System
// Component: Redis Configuration Test Suite
// Purpose: Comprehensive testing of Redis configuration functionality

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
  RedisConfig,
  RedisConfigBuilder,
  RedisConfigError,
  RedisConfigManager,
  createRedisConfig,
  createRedisConfigFromEnv,
  createRedisConfigForEnvironment,
  createRedisConfigWithUrl,
  createRedisClusterConfig,
  createRedisSentinelConfig,
  getDefaultRedisConfig,
  getRedisConfigManager,
  initializeRedisConfig,
} from '../redis';

// ===================================
// Test Setup and Utilities
// ===================================

describe('Redis Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };

    // Clear environment variables
    delete process.env.NODE_ENV;
    delete process.env.REDIS_URL;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
    delete process.env.REDIS_DB;
    delete process.env.REDIS_MODE;
    delete process.env.CACHE_DEFAULT_TTL;
    delete process.env.CACHE_KEY_PREFIX;

    // Reset singleton
    const manager = getRedisConfigManager();
    manager.reset();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  // ===================================
  // RedisConfigBuilder Tests
  // ===================================

  describe('RedisConfigBuilder', () => {
    test('should create builder with default values', () => {
      const config = new RedisConfigBuilder().build();

      expect(config.mode).toBe('standalone');
      expect(config.environment).toBe('development');
      expect(config.connection.host).toBe('localhost');
      expect(config.connection.port).toBe(6379);
      expect(config.connection.db).toBe(0);
      expect(config.lazyConnect).toBe(true);
      expect(config.enableReadyCheck).toBe(true);
    });

    test('should build configuration with environment variables', () => {
      process.env.REDIS_HOST = 'redis-server';
      process.env.REDIS_PORT = '6380';
      process.env.REDIS_PASSWORD = 'secret';
      process.env.REDIS_DB = '1';
      process.env.CACHE_DEFAULT_TTL = '7200';
      process.env.CACHE_KEY_PREFIX = 'test:';

      const config = new RedisConfigBuilder().build();

      expect(config.connection.host).toBe('redis-server');
      expect(config.connection.port).toBe(6380);
      expect(config.connection.password).toBe('secret');
      expect(config.connection.db).toBe(1);
      expect(config.cache.defaultTTL).toBe(7200);
      expect(config.cache.keyPrefix).toBe('test:');
    });

    test('should build configuration with custom values', () => {
      const config = new RedisConfigBuilder()
        .mode('cluster')
        .environment('production')
        .connection({ host: 'custom-host', port: 6380 })
        .cache({ defaultTTL: 1800, keyPrefix: 'custom:' })
        .enableLazyConnect(false)
        .build();

      expect(config.mode).toBe('cluster');
      expect(config.environment).toBe('production');
      expect(config.connection.host).toBe('custom-host');
      expect(config.connection.port).toBe(6380);
      expect(config.cache.defaultTTL).toBe(1800);
      expect(config.cache.keyPrefix).toBe('custom:');
      expect(config.lazyConnect).toBe(false);
    });

    test('should use environment-specific defaults', () => {
      const devConfig = createRedisConfigForEnvironment('development');
      const prodConfig = createRedisConfigForEnvironment('production');
      const testConfig = createRedisConfigForEnvironment('test');

      expect(devConfig.environment).toBe('development');
      expect(devConfig.pool.max).toBe(20);
      expect(devConfig.retry.retries).toBe(3);

      expect(prodConfig.environment).toBe('production');
      expect(prodConfig.pool.max).toBe(50);
      expect(prodConfig.retry.retries).toBe(5);
      expect(prodConfig.cache.compression).toBe(true);

      expect(testConfig.environment).toBe('test');
      expect(testConfig.pool.max).toBe(5);
      expect(testConfig.retry.retries).toBe(1);
      expect(testConfig.connection.connectTimeout).toBe(5000);
    });
  });

  // ===================================
  // Configuration Validation Tests
  // ===================================

  describe('Configuration Validation', () => {
    test('should throw error for invalid Redis host', () => {
      expect(() => {
        new RedisConfigBuilder()
          .connection({ host: '', port: 6379, db: 0, connectTimeout: 10000, commandTimeout: 5000, keepAlive: 30000 })
          .build();
      }).toThrow(RedisConfigError);
    });

    test('should throw error for invalid Redis port', () => {
      expect(() => {
        new RedisConfigBuilder()
          .connection({ host: 'localhost', port: 0, db: 0, connectTimeout: 10000, commandTimeout: 5000, keepAlive: 30000 })
          .build();
      }).toThrow(RedisConfigError);

      expect(() => {
        new RedisConfigBuilder()
          .connection({ host: 'localhost', port: 70000, db: 0, connectTimeout: 10000, commandTimeout: 5000, keepAlive: 30000 })
          .build();
      }).toThrow(RedisConfigError);
    });

    test('should throw error for invalid Redis database', () => {
      expect(() => {
        new RedisConfigBuilder()
          .connection({ host: 'localhost', port: 6379, db: -1, connectTimeout: 10000, commandTimeout: 5000, keepAlive: 30000 })
          .build();
      }).toThrow(RedisConfigError);

      expect(() => {
        new RedisConfigBuilder()
          .connection({ host: 'localhost', port: 6379, db: 16, connectTimeout: 10000, commandTimeout: 5000, keepAlive: 30000 })
          .build();
      }).toThrow(RedisConfigError);
    });

    test('should throw error for invalid pool configuration', () => {
      expect(() => {
        new RedisConfigBuilder()
          .pool({ max: 0, min: 5, idleTimeoutMillis: 10000, evictionRunIntervalMillis: 30000, maxLifetimeMillis: 1800000 })
          .build();
      }).toThrow(RedisConfigError);

      expect(() => {
        new RedisConfigBuilder()
          .pool({ max: 10, min: 15, idleTimeoutMillis: 10000, evictionRunIntervalMillis: 30000, maxLifetimeMillis: 1800000 })
          .build();
      }).toThrow(RedisConfigError);
    });

    test('should throw error for invalid retry configuration', () => {
      expect(() => {
        new RedisConfigBuilder()
          .retry({ retries: -1, retryDelayOnFailover: 100, maxRetryDelay: 10000, retryDelayFactor: 2 })
          .build();
      }).toThrow(RedisConfigError);

      expect(() => {
        new RedisConfigBuilder()
          .retry({ retries: 3, retryDelayOnFailover: 1000, maxRetryDelay: 500, retryDelayFactor: 2 })
          .build();
      }).toThrow(RedisConfigError);
    });

    test('should throw error for invalid cluster configuration', () => {
      expect(() => {
        new RedisConfigBuilder()
          .mode('cluster')
          .cluster({ nodes: [], enableReadyCheck: true, maxRedirections: 16, retryDelayOnFailover: 100, scaleReads: 'master' })
          .build();
      }).toThrow(RedisConfigError);

      expect(() => {
        new RedisConfigBuilder()
          .mode('cluster')
          .cluster({
            nodes: [{ host: '', port: 6379 }],
            enableReadyCheck: true,
            maxRedirections: 16,
            retryDelayOnFailover: 100,
            scaleReads: 'master'
          })
          .build();
      }).toThrow(RedisConfigError);
    });

    test('should throw error for invalid sentinel configuration', () => {
      expect(() => {
        new RedisConfigBuilder()
          .mode('sentinel')
          .sentinel({ sentinels: [], name: 'mymaster', role: 'master', failoverTimeout: 180000 })
          .build();
      }).toThrow(RedisConfigError);

      expect(() => {
        new RedisConfigBuilder()
          .mode('sentinel')
          .sentinel({
            sentinels: [{ host: 'localhost', port: 26379 }],
            name: '',
            role: 'master',
            failoverTimeout: 180000
          })
          .build();
      }).toThrow(RedisConfigError);
    });
  });

  // ===================================
  // Environment-Specific Configuration Tests
  // ===================================

  describe('Environment-Specific Configuration', () => {
    test('should configure for development environment', () => {
      const config = createRedisConfigForEnvironment('development');

      expect(config.environment).toBe('development');
      expect(config.pool.max).toBe(20);
      expect(config.pool.min).toBe(5);
      expect(config.retry.retries).toBe(3);
      expect(config.monitoring.slowLog).toBe(true);
      expect(config.cache.compression).toBe(false);
    });

    test('should configure for production environment', () => {
      const config = createRedisConfigForEnvironment('production');

      expect(config.environment).toBe('production');
      expect(config.pool.max).toBe(50);
      expect(config.pool.min).toBe(10);
      expect(config.retry.retries).toBe(5);
      expect(config.cache.compression).toBe(true);
      expect(config.monitoring.enabled).toBe(true);
    });

    test('should configure for test environment', () => {
      const config = createRedisConfigForEnvironment('test');

      expect(config.environment).toBe('test');
      expect(config.pool.max).toBe(5);
      expect(config.pool.min).toBe(1);
      expect(config.retry.retries).toBe(1);
      expect(config.connection.connectTimeout).toBe(5000);
      expect(config.connection.commandTimeout).toBe(2000);
      expect(config.monitoring.enabled).toBe(false);
    });

    test('should configure for staging environment', () => {
      const config = createRedisConfigForEnvironment('staging');

      expect(config.environment).toBe('staging');
      expect(config.pool.max).toBe(20);
      expect(config.pool.min).toBe(5);
      expect(config.retry.retries).toBe(3);
    });
  });

  // ===================================
  // RedisConfigManager Tests
  // ===================================

  describe('RedisConfigManager', () => {
    test('should initialize configuration', () => {
      const manager = getRedisConfigManager();
      const config = createRedisConfigForEnvironment('development');

      expect(manager.isInitialized()).toBe(false);

      manager.initialize(config);

      expect(manager.isInitialized()).toBe(true);
      expect(manager.getConfig()).toEqual(config);
    });

    test('should throw error when accessing uninitialized config', () => {
      const manager = getRedisConfigManager();

      expect(() => {
        manager.getConfig();
      }).toThrow(RedisConfigError);
    });

    test('should update configuration', () => {
      const manager = getRedisConfigManager();
      const config = createRedisConfigForEnvironment('development');
      manager.initialize(config);

      const updates = {
        cache: { ...config.cache, defaultTTL: 7200 }
      };

      manager.updateConfig(updates);

      const updatedConfig = manager.getConfig();
      expect(updatedConfig.cache.defaultTTL).toBe(7200);
    });

    test('should reset configuration', () => {
      const manager = getRedisConfigManager();
      const config = createRedisConfigForEnvironment('development');
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
    test('should create configuration with custom URL', () => {
      const config = createRedisConfigWithUrl('redis://user:pass@redis-host:6380/2');

      expect(config.connection.host).toBe('redis-host');
      expect(config.connection.port).toBe(6380);
      expect(config.connection.password).toBe('pass');
      expect(config.connection.db).toBe(2);
    });

    test('should create cluster configuration', () => {
      const nodes = [
        { host: 'redis-1', port: 6379 },
        { host: 'redis-2', port: 6379 },
        { host: 'redis-3', port: 6379 }
      ];

      const config = createRedisClusterConfig(nodes);

      expect(config.mode).toBe('cluster');
      expect(config.cluster?.nodes).toEqual(nodes);
      expect(config.cluster?.enableReadyCheck).toBe(true);
      expect(config.cluster?.maxRedirections).toBe(16);
    });

    test('should create sentinel configuration', () => {
      const sentinels = [
        { host: 'sentinel-1', port: 26379 },
        { host: 'sentinel-2', port: 26379 }
      ];

      const config = createRedisSentinelConfig(sentinels, 'mymaster');

      expect(config.mode).toBe('sentinel');
      expect(config.sentinel?.sentinels).toEqual(sentinels);
      expect(config.sentinel?.name).toBe('mymaster');
      expect(config.sentinel?.role).toBe('master');
    });

    test('should get default configuration', () => {
      const config = getDefaultRedisConfig();

      expect(config).toBeDefined();
      expect(config.mode).toBe('standalone');
      expect(config.environment).toBe('development');
    });

    test('should initialize configuration from environment', () => {
      process.env.REDIS_HOST = 'env-redis';
      process.env.REDIS_PORT = '6380';

      const config = initializeRedisConfig();
      const manager = getRedisConfigManager();

      expect(manager.isInitialized()).toBe(true);
      expect(config.connection.host).toBe('env-redis');
      expect(config.connection.port).toBe(6380);
    });

    test('should create configuration with custom options', () => {
      const config = createRedisConfig({
        mode: 'cluster',
        environment: 'production',
        connection: { host: 'custom-host', port: 6380 },
        cache: { defaultTTL: 1800, keyPrefix: 'custom:' },
        lazyConnect: false,
        enableReadyCheck: false,
      });

      expect(config.mode).toBe('cluster');
      expect(config.environment).toBe('production');
      expect(config.connection.host).toBe('custom-host');
      expect(config.connection.port).toBe(6380);
      expect(config.cache.defaultTTL).toBe(1800);
      expect(config.cache.keyPrefix).toBe('custom:');
      expect(config.lazyConnect).toBe(false);
      expect(config.enableReadyCheck).toBe(false);
    });
  });

  // ===================================
  // Edge Cases Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle missing environment variables gracefully', () => {
      // Clear all Redis-related environment variables
      Object.keys(process.env).forEach(key => {
        if (key.startsWith('REDIS_') || key.startsWith('CACHE_')) {
          delete process.env[key];
        }
      });

      const config = createRedisConfigFromEnv();

      expect(config.connection.host).toBe('localhost');
      expect(config.connection.port).toBe(6379);
      expect(config.connection.db).toBe(0);
      expect(config.cache.defaultTTL).toBe(3600);
      expect(config.cache.keyPrefix).toBe('task-mgmt:');
    });

    test('should handle invalid environment variable values', () => {
      process.env.REDIS_PORT = 'invalid';
      process.env.REDIS_DB = 'not-a-number';
      process.env.CACHE_DEFAULT_TTL = 'invalid-ttl';
      process.env.REDIS_POOL_MAX = 'not-a-number';

      const config = createRedisConfigFromEnv();

      // Should fall back to defaults
      expect(config.connection.port).toBe(6379);
      expect(config.connection.db).toBe(0);
      expect(config.cache.defaultTTL).toBe(3600);
      expect(config.pool.max).toBe(20); // development default
    });

    test('should handle invalid Redis URL format', () => {
      expect(() => {
        createRedisConfigWithUrl('invalid-url');
      }).toThrow(RedisConfigError);

      expect(() => {
        createRedisConfigWithUrl('http://not-redis-url');
      }).toThrow(RedisConfigError);
    });

    test('should parse Redis URL with different formats', () => {
      // URL without password
      const config1 = createRedisConfigWithUrl('redis://localhost:6379');
      expect(config1.connection.host).toBe('localhost');
      expect(config1.connection.port).toBe(6379);
      expect(config1.connection.password).toBeUndefined();

      // URL with password but no database
      const config2 = createRedisConfigWithUrl('redis://:password@localhost:6379');
      expect(config2.connection.password).toBe('password');
      expect(config2.connection.db).toBe(0);

      // URL with database
      const config3 = createRedisConfigWithUrl('redis://localhost:6379/5');
      expect(config3.connection.db).toBe(5);
    });

    test('should handle cluster nodes parsing', () => {
      process.env.REDIS_MODE = 'cluster';
      process.env.REDIS_CLUSTER_NODES = 'redis-1:6379,redis-2:6380,redis-3';

      const config = createRedisConfigFromEnv();

      expect(config.mode).toBe('cluster');
      expect(config.cluster?.nodes).toEqual([
        { host: 'redis-1', port: 6379 },
        { host: 'redis-2', port: 6380 },
        { host: 'redis-3', port: 6379 }, // default port
      ]);
    });

    test('should handle sentinel nodes parsing', () => {
      process.env.REDIS_MODE = 'sentinel';
      process.env.REDIS_SENTINEL_NODES = 'sentinel-1:26379,sentinel-2:26380';
      process.env.REDIS_SENTINEL_MASTER_NAME = 'mymaster';

      const config = createRedisConfigFromEnv();

      expect(config.mode).toBe('sentinel');
      expect(config.sentinel?.sentinels).toEqual([
        { host: 'sentinel-1', port: 26379 },
        { host: 'sentinel-2', port: 26380 },
      ]);
      expect(config.sentinel?.name).toBe('mymaster');
    });

    test('should handle boolean environment variables', () => {
      process.env.REDIS_COMPRESSION = 'true';
      process.env.REDIS_MONITORING_ENABLED = 'false';
      process.env.REDIS_SLOW_LOG_ENABLED = 'TRUE';

      const config = createRedisConfigFromEnv();

      expect(config.cache.compression).toBe(true);
      expect(config.monitoring.enabled).toBe(false);
      expect(config.monitoring.slowLog).toBe(true);
    });

    test('should validate configuration after updates', () => {
      const manager = getRedisConfigManager();
      const config = createRedisConfigForEnvironment('development');
      manager.initialize(config);

      expect(() => {
        manager.updateConfig({
          pool: { ...config.pool, max: 0 }
        });
      }).toThrow(RedisConfigError);
    });

    test('should handle Redis URL from environment', () => {
      process.env.REDIS_URL = 'redis://user:pass@redis-server:6380/3';

      const config = createRedisConfigFromEnv();

      expect(config.connection.host).toBe('redis-server');
      expect(config.connection.port).toBe(6380);
      expect(config.connection.password).toBe('pass');
      expect(config.connection.db).toBe(3);
    });

    test('should prioritize REDIS_URL over individual variables', () => {
      process.env.REDIS_URL = 'redis://url-host:6380/2';
      process.env.REDIS_HOST = 'individual-host';
      process.env.REDIS_PORT = '6381';
      process.env.REDIS_DB = '1';

      const config = createRedisConfigFromEnv();

      // Should use URL values
      expect(config.connection.host).toBe('url-host');
      expect(config.connection.port).toBe(6380);
      expect(config.connection.db).toBe(2);
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration Tests', () => {
    test('should create complete configuration for production', () => {
      process.env.NODE_ENV = 'production';
      process.env.REDIS_URL = 'redis://:prod-password@redis-cluster:6379/0';
      process.env.REDIS_MODE = 'cluster';
      process.env.REDIS_CLUSTER_NODES = 'redis-1:6379,redis-2:6379,redis-3:6379';
      process.env.CACHE_DEFAULT_TTL = '7200';
      process.env.REDIS_POOL_MAX = '100';

      const config = createRedisConfigFromEnv();

      expect(config.mode).toBe('cluster');
      expect(config.environment).toBe('production');
      expect(config.connection.password).toBe('prod-password');
      expect(config.cache.defaultTTL).toBe(7200);
      expect(config.pool.max).toBe(100);
      expect(config.cache.compression).toBe(true);
      expect(config.cluster?.nodes).toHaveLength(3);
    });

    test('should create complete configuration for test environment', () => {
      process.env.NODE_ENV = 'test';
      process.env.REDIS_HOST = 'test-redis';
      process.env.REDIS_PORT = '6380';
      process.env.REDIS_DB = '15';

      const config = createRedisConfigFromEnv();

      expect(config.environment).toBe('test');
      expect(config.connection.host).toBe('test-redis');
      expect(config.connection.port).toBe(6380);
      expect(config.connection.db).toBe(15);
      expect(config.connection.connectTimeout).toBe(5000);
      expect(config.connection.commandTimeout).toBe(2000);
      expect(config.pool.max).toBe(5);
      expect(config.retry.retries).toBe(1);
      expect(config.monitoring.enabled).toBe(false);
    });

    test('should work with configuration manager lifecycle', () => {
      const manager = getRedisConfigManager();

      // Initialize
      const config = createRedisConfigForEnvironment('development');
      manager.initialize(config);

      expect(manager.isInitialized()).toBe(true);

      // Update
      manager.updateConfig({
        cache: { ...config.cache, defaultTTL: 1800 }
      });

      expect(manager.getConfig().cache.defaultTTL).toBe(1800);

      // Reset
      manager.reset();

      expect(manager.isInitialized()).toBe(false);
    });
  });
});
