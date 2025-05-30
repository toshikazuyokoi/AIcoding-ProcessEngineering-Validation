/**
 * ===================================
 * Cache Service Tests
 * ===================================
 * Purpose: Comprehensive testing for CacheService class and Redis cache operations
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  CacheService,
  CacheConfig,
  CacheResult,
  CacheStats,
  createCacheService,
  cacheService
} from '../cache-service';
import { ValidationError, NetworkError } from '../error-handler';
import Redis from 'ioredis';

// Mock ioredis
jest.mock('ioredis');
const MockedRedis = Redis as jest.MockedClass<typeof Redis>;

// Mock logger
jest.mock('../logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}));

// Mock environment variables
const originalEnv = process.env;

describe('CacheService', () => {
  let service: CacheService;
  let mockRedis: jest.Mocked<Redis>;

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      REDIS_HOST: 'localhost',
      REDIS_PORT: '6379',
      REDIS_DB: '0',
      CACHE_DEFAULT_TTL: '3600',
      CACHE_KEY_PREFIX: 'test:'
    };

    // Clear all mocks
    jest.clearAllMocks();
    MockedRedis.mockClear();

    // Create mock Redis instance
    mockRedis = {
      get: jest.fn(),
      setex: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      ttl: jest.fn(),
      keys: jest.fn(),
      flushdb: jest.fn(),
      ping: jest.fn(),
      quit: jest.fn(),
      disconnect: jest.fn(),
      on: jest.fn()
    } as any;

    MockedRedis.mockImplementation(() => mockRedis);

    service = new CacheService();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Configuration', () => {
    test('should create service with default configuration', () => {
      const config = service.getConfig();

      expect(config.host).toBe('localhost');
      expect(config.port).toBe(6379);
      expect(config.db).toBe(0);
      expect(config.defaultTTL).toBe(3600);
      expect(config.keyPrefix).toBe('test:');
    });

    test('should create service with custom configuration', () => {
      const customConfig: Partial<CacheConfig> = {
        host: 'redis-server',
        port: 6380,
        db: 1,
        defaultTTL: 7200,
        keyPrefix: 'custom:'
      };

      const customService = new CacheService(customConfig);
      const config = customService.getConfig();

      expect(config.host).toBe('redis-server');
      expect(config.port).toBe(6380);
      expect(config.db).toBe(1);
      expect(config.defaultTTL).toBe(7200);
      expect(config.keyPrefix).toBe('custom:');
    });

    test('should setup Redis event handlers', () => {
      expect(mockRedis.on).toHaveBeenCalledWith('connect', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('ready', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('error', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockRedis.on).toHaveBeenCalledWith('reconnecting', expect.any(Function));
    });
  });

  describe('Key Normalization', () => {
    test('should normalize keys correctly', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.get.mockResolvedValue(null);

      await service.get('TestKey');
      expect(mockRedis.get).toHaveBeenCalledWith('test:testkey');
    });

    test('should reject null key', async () => {
      await expect(service.get(null as any)).rejects.toThrow(ValidationError);
      await expect(service.get(null as any)).rejects.toThrow('Cache key must be a non-empty string');
    });

    test('should reject undefined key', async () => {
      await expect(service.get(undefined as any)).rejects.toThrow(ValidationError);
      await expect(service.get(undefined as any)).rejects.toThrow('Cache key must be a non-empty string');
    });

    test('should reject non-string key', async () => {
      await expect(service.get(123 as any)).rejects.toThrow(ValidationError);
      await expect(service.get(123 as any)).rejects.toThrow('Cache key must be a non-empty string');
    });

    test('should reject empty key', async () => {
      await expect(service.get('')).rejects.toThrow(ValidationError);
      await expect(service.get('')).rejects.toThrow('Cache key cannot be empty');
    });

    test('should reject whitespace-only key', async () => {
      await expect(service.get('   ')).rejects.toThrow(ValidationError);
      await expect(service.get('   ')).rejects.toThrow('Cache key cannot be empty');
    });
  });

  describe('Connection Management', () => {
    test('should check Redis connection', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const connected = await service.isConnected();
      expect(connected).toBe(true);
      expect(mockRedis.ping).toHaveBeenCalled();
    });

    test('should handle connection failure', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const connected = await service.isConnected();
      expect(connected).toBe(false);
    });

    test('should handle invalid ping response', async () => {
      mockRedis.ping.mockResolvedValue('INVALID');

      const connected = await service.isConnected();
      expect(connected).toBe(false);
    });
  });

  describe('Get Operation', () => {
    test('should get data from cache successfully', async () => {
      const testData = { id: 1, name: 'test' };
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.get.mockResolvedValue(JSON.stringify(testData));

      const result = await service.get<typeof testData>('test-key');

      expect(result).toEqual(testData);
      expect(mockRedis.get).toHaveBeenCalledWith('test:test-key');
    });

    test('should return null for cache miss', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.get.mockResolvedValue(null);

      const result = await service.get('non-existent-key');

      expect(result).toBeNull();
    });

    test('should return null when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });

    test('should handle deserialization error', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.get.mockResolvedValue('invalid-json');

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });

    test('should handle Redis get error', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.get.mockRejectedValue(new Error('Redis error'));

      const result = await service.get('test-key');

      expect(result).toBeNull();
    });
  });

  describe('Set Operation', () => {
    test('should set data in cache successfully', async () => {
      const testData = { id: 1, name: 'test' };
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.set('test-key', testData);

      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:test-key',
        3600,
        JSON.stringify(testData)
      );
    });

    test('should set data with custom TTL', async () => {
      const testData = { id: 1, name: 'test' };
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.set('test-key', testData, 7200);

      expect(result).toBe(true);
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'test:test-key',
        7200,
        JSON.stringify(testData)
      );
    });

    test('should return false when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.set('test-key', { data: 'test' });

      expect(result).toBe(false);
    });

    test('should handle Redis set error', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.setex.mockRejectedValue(new Error('Redis error'));

      const result = await service.set('test-key', { data: 'test' });

      expect(result).toBe(false);
    });
  });

  describe('Delete Operation', () => {
    test('should delete data from cache successfully', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.del.mockResolvedValue(1);

      const result = await service.delete('test-key');

      expect(result).toBe(true);
      expect(mockRedis.del).toHaveBeenCalledWith('test:test-key');
    });

    test('should return false when key does not exist', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.del.mockResolvedValue(0);

      const result = await service.delete('non-existent-key');

      expect(result).toBe(false);
    });

    test('should return false when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.delete('test-key');

      expect(result).toBe(false);
    });

    test('should handle Redis delete error', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.del.mockRejectedValue(new Error('Redis error'));

      const result = await service.delete('test-key');

      expect(result).toBe(false);
    });
  });

  describe('Exists Operation', () => {
    test('should check if key exists', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.exists.mockResolvedValue(1);

      const result = await service.exists('test-key');

      expect(result).toBe(true);
      expect(mockRedis.exists).toHaveBeenCalledWith('test:test-key');
    });

    test('should return false when key does not exist', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.exists.mockResolvedValue(0);

      const result = await service.exists('non-existent-key');

      expect(result).toBe(false);
    });

    test('should return false when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.exists('test-key');

      expect(result).toBe(false);
    });
  });

  describe('TTL Operation', () => {
    test('should get TTL for key', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.ttl.mockResolvedValue(3600);

      const result = await service.getTTL('test-key');

      expect(result).toBe(3600);
      expect(mockRedis.ttl).toHaveBeenCalledWith('test:test-key');
    });

    test('should return -1 when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.getTTL('test-key');

      expect(result).toBe(-1);
    });

    test('should handle TTL error', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.ttl.mockRejectedValue(new Error('Redis error'));

      const result = await service.getTTL('test-key');

      expect(result).toBe(-1);
    });
  });

  describe('Pattern Invalidation', () => {
    test('should invalidate keys by pattern', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.keys.mockResolvedValue(['test:user:1', 'test:user:2']);
      mockRedis.del.mockResolvedValue(2);

      const result = await service.invalidatePattern('user:*');

      expect(result).toBe(2);
      expect(mockRedis.keys).toHaveBeenCalledWith('test:user:*');
      expect(mockRedis.del).toHaveBeenCalledWith('test:user:1', 'test:user:2');
    });

    test('should return 0 when no keys match pattern', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.keys.mockResolvedValue([]);

      const result = await service.invalidatePattern('non-existent:*');

      expect(result).toBe(0);
    });

    test('should reject invalid pattern', async () => {
      await expect(service.invalidatePattern('')).rejects.toThrow(ValidationError);
      await expect(service.invalidatePattern('')).rejects.toThrow('Pattern must be a non-empty string');
    });

    test('should return 0 when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.invalidatePattern('test:*');

      expect(result).toBe(0);
    });
  });

  describe('Clear Operation', () => {
    test('should clear all cache', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.flushdb.mockResolvedValue('OK');

      const result = await service.clear();

      expect(result).toBe(true);
      expect(mockRedis.flushdb).toHaveBeenCalled();
    });

    test('should return false when Redis is not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Not connected'));

      const result = await service.clear();

      expect(result).toBe(false);
    });

    test('should handle clear error', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.flushdb.mockRejectedValue(new Error('Redis error'));

      const result = await service.clear();

      expect(result).toBe(false);
    });
  });

  describe('Statistics', () => {
    test('should track cache statistics', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      // Cache hit
      mockRedis.get.mockResolvedValueOnce(JSON.stringify({ data: 'test' }));
      await service.get('hit-key');

      // Cache miss
      mockRedis.get.mockResolvedValueOnce(null);
      await service.get('miss-key');

      // Cache set
      mockRedis.setex.mockResolvedValue('OK');
      await service.set('set-key', { data: 'test' });

      const stats = service.getStats();

      expect(stats.hits).toBe(1);
      expect(stats.misses).toBe(1);
      expect(stats.sets).toBe(1);
      expect(stats.hitRate).toBe(50);
    });

    test('should reset statistics after clear', async () => {
      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.get.mockResolvedValue(JSON.stringify({ data: 'test' }));
      mockRedis.flushdb.mockResolvedValue('OK');

      await service.get('test-key');
      await service.clear();

      const stats = service.getStats();

      expect(stats.hits).toBe(0);
      expect(stats.misses).toBe(0);
      expect(stats.sets).toBe(0);
      expect(stats.hitRate).toBe(0);
    });
  });

  describe('Health Check', () => {
    test('should return healthy status when connected', async () => {
      mockRedis.ping.mockResolvedValue('PONG');

      const health = await service.healthCheck();

      expect(health.status).toBe('healthy');
      expect(health.connected).toBe(true);
      expect(typeof health.latency).toBe('number');
    });

    test('should return unhealthy status when not connected', async () => {
      mockRedis.ping.mockRejectedValue(new Error('Connection failed'));

      const health = await service.healthCheck();

      expect(health.status).toBe('unhealthy');
      expect(health.connected).toBe(false);
      expect(typeof health.latency).toBe('number');
    });
  });

  describe('Disconnect', () => {
    test('should disconnect gracefully', async () => {
      mockRedis.quit.mockResolvedValue('OK');

      await service.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
    });

    test('should force disconnect on quit failure', async () => {
      mockRedis.quit.mockRejectedValue(new Error('Quit failed'));

      await service.disconnect();

      expect(mockRedis.quit).toHaveBeenCalled();
      expect(mockRedis.disconnect).toHaveBeenCalled();
    });
  });

  describe('Utility Functions', () => {
    test('createCacheService should return new instance', () => {
      const customService = createCacheService({ defaultTTL: 7200 });

      expect(customService).toBeInstanceOf(CacheService);
      expect(customService.getConfig().defaultTTL).toBe(7200);
    });

    test('default cacheService should be available', () => {
      expect(cacheService).toBeInstanceOf(CacheService);
    });
  });

  describe('Edge Cases', () => {
    test('should handle complex data structures', async () => {
      const complexData = {
        array: [1, 2, 3],
        nested: { deep: { value: 'test' } },
        date: new Date().toISOString(),
        boolean: true,
        null: null
      };

      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(complexData));

      await service.set('complex-key', complexData);
      const result = await service.get('complex-key');

      expect(result).toEqual(complexData);
    });

    test('should handle unicode characters', async () => {
      const unicodeData = { message: 'こんにちは世界', emoji: '🚀' };

      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.setex.mockResolvedValue('OK');
      mockRedis.get.mockResolvedValue(JSON.stringify(unicodeData));

      await service.set('unicode-key', unicodeData);
      const result = await service.get('unicode-key');

      expect(result).toEqual(unicodeData);
    });

    test('should handle large data objects', async () => {
      const largeData = { data: 'x'.repeat(10000) };

      mockRedis.ping.mockResolvedValue('PONG');
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.set('large-key', largeData);

      expect(result).toBe(true);
    });
  });
});
