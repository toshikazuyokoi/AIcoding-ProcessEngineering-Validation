/**
 * Cache Integration Test Suite
 * 
 * Comprehensive tests for Redis cache integration and performance
 * Tests cache operations, TTL management, data consistency, and error handling
 * 
 * @fileoverview Integration tests for cache service
 * @version 1.0.0
 * @since 2025-01-28
 */

import { CacheService } from '../../../../src/utils/cache-service';
import { UserRepository } from '../../../../src/repositories/user-repository';
import { TaskRepository } from '../../../../src/repositories/task-repository';
import { PrismaClient } from '@prisma/client';
import { setupTestDatabase, teardownTestDatabase } from '../../../utils/test-database';

describe('Cache Integration Tests', () => {
  let cacheService: CacheService;
  let userRepository: UserRepository;
  let taskRepository: TaskRepository;
  let prisma: PrismaClient;

  beforeAll(async () => {
    // Setup test database
    await setupTestDatabase();
    
    // Create direct Prisma client for testing
    const databaseUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('Database URL not configured');
    }
    
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl
        }
      }
    });

    // Initialize cache service with test configuration
    cacheService = new CacheService({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      db: parseInt(process.env.REDIS_TEST_DB || '1'), // Use separate test DB
      defaultTTL: 60, // Short TTL for testing
      keyPrefix: 'test:'
    });

    // Initialize repositories
    userRepository = new UserRepository({ prismaClient: prisma });
    taskRepository = new TaskRepository({ prismaClient: prisma });

    // Wait for cache connection
    await new Promise(resolve => setTimeout(resolve, 1000));
  });

  afterAll(async () => {
    // Clear test cache
    await cacheService.clear();
    await cacheService.disconnect();
    await prisma.$disconnect();
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.clear();
    
    // Clean up database data
    await prisma.taskCategory.deleteMany();
    await prisma.task.deleteMany();
    await prisma.category.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('IT-CACHE-001: Basic Cache Operations', () => {
    test('should perform basic cache operations successfully', async () => {
      const testKey = 'test-key';
      const testValue = { id: 1, name: 'Test Data', timestamp: Date.now() };

      // Test set operation
      const setResult = await cacheService.set(testKey, testValue);
      expect(setResult).toBe(true);

      // Test exists operation
      const exists = await cacheService.exists(testKey);
      expect(exists).toBe(true);

      // Test get operation
      const retrievedValue = await cacheService.get<typeof testValue>(testKey);
      expect(retrievedValue).toEqual(testValue);

      // Test delete operation
      const deleteResult = await cacheService.delete(testKey);
      expect(deleteResult).toBe(true);

      // Verify deletion
      const existsAfterDelete = await cacheService.exists(testKey);
      expect(existsAfterDelete).toBe(false);

      const valueAfterDelete = await cacheService.get(testKey);
      expect(valueAfterDelete).toBeNull();
    });

    test('should handle complex data types', async () => {
      const complexData = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          profile: {
            firstName: 'John',
            lastName: 'Doe',
            preferences: ['email', 'sms']
          }
        },
        tasks: [
          { id: 1, title: 'Task 1', completed: false },
          { id: 2, title: 'Task 2', completed: true }
        ],
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        }
      };

      await cacheService.set('complex-data', complexData);
      const retrieved = await cacheService.get('complex-data');

      expect(retrieved).toEqual(complexData);
    });
  });

  describe('IT-CACHE-002: TTL Management', () => {
    test('should respect TTL settings', async () => {
      const testKey = 'ttl-test';
      const testValue = 'expires soon';
      const shortTTL = 2; // 2 seconds

      // Set with short TTL
      await cacheService.set(testKey, testValue, shortTTL);

      // Verify data exists immediately
      const immediate = await cacheService.get(testKey);
      expect(immediate).toBe(testValue);

      // Check TTL
      const ttl = await cacheService.getTTL(testKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(shortTTL);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Verify data has expired
      const afterExpiry = await cacheService.get(testKey);
      expect(afterExpiry).toBeNull();

      const existsAfterExpiry = await cacheService.exists(testKey);
      expect(existsAfterExpiry).toBe(false);
    });

    test('should use default TTL when not specified', async () => {
      const testKey = 'default-ttl-test';
      const testValue = 'uses default TTL';

      await cacheService.set(testKey, testValue);

      const ttl = await cacheService.getTTL(testKey);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(60); // Default TTL from config
    });
  });

  describe('IT-CACHE-003: Cache Hit/Miss Performance', () => {
    test('should track cache statistics', async () => {
      const testKeys = ['perf-1', 'perf-2', 'perf-3'];
      const testValue = 'performance test data';

      // Set test data
      for (const key of testKeys) {
        await cacheService.set(key, testValue);
      }

      // Measure cache hits
      const hitStartTime = Date.now();
      for (const key of testKeys) {
        const value = await cacheService.get(key);
        expect(value).toBe(testValue);
      }
      const hitDuration = Date.now() - hitStartTime;

      // Measure cache misses
      const missStartTime = Date.now();
      for (let i = 0; i < 3; i++) {
        const value = await cacheService.get(`non-existent-${i}`);
        expect(value).toBeNull();
      }
      const missDuration = Date.now() - missStartTime;

      // Get statistics
      const stats = await cacheService.getStats();
      expect(stats.hits).toBeGreaterThanOrEqual(3);
      expect(stats.misses).toBeGreaterThanOrEqual(3);
      expect(stats.hitRate).toBeGreaterThan(0);

      // Cache hits should be faster than misses (generally)
      console.log(`Cache hits: ${hitDuration}ms, Cache misses: ${missDuration}ms`);
    });
  });

  describe('IT-CACHE-004: Data Consistency', () => {
    test('should maintain consistency between cache and database', async () => {
      // Create user in database
      const userData = {
        username: 'cacheuser',
        email: 'cache@example.com',
        passwordHash: 'hashedpassword123'
      };

      const user = await userRepository.create(userData);
      const cacheKey = `user:${user.id}`;

      // Cache the user data
      await cacheService.set(cacheKey, user);

      // Verify cache contains correct data
      const cachedUser = await cacheService.get(cacheKey);
      expect(cachedUser).toMatchObject({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      });

      // Update user in database
      const updatedUser = await userRepository.update(user.id, {
        username: 'updateduser'
      });

      // Cache should still contain old data
      const staleCache = await cacheService.get(cacheKey);
      expect(staleCache).toMatchObject({
        id: user.id,
        username: user.username,
        email: user.email
      }); // Old data
      expect(staleCache).not.toMatchObject({
        username: updatedUser.username
      }); // Not updated data

      // Invalidate cache
      await cacheService.delete(cacheKey);

      // Cache should be empty
      const afterInvalidation = await cacheService.get(cacheKey);
      expect(afterInvalidation).toBeNull();

      // Re-cache with updated data
      await cacheService.set(cacheKey, updatedUser);
      const refreshedCache = await cacheService.get(cacheKey);
      expect(refreshedCache).toMatchObject({
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email
      });
    });
  });

  describe('IT-CACHE-005: Cache Invalidation Patterns', () => {
    test('should support pattern-based cache invalidation', async () => {
      // Set multiple related cache entries
      const userKeys = ['user:1', 'user:2', 'user:3'];
      const taskKeys = ['task:1', 'task:2', 'task:3'];
      const testValue = 'test data';

      // Cache user data
      for (const key of userKeys) {
        await cacheService.set(key, testValue);
      }

      // Cache task data
      for (const key of taskKeys) {
        await cacheService.set(key, testValue);
      }

      // Verify all data is cached
      for (const key of [...userKeys, ...taskKeys]) {
        const value = await cacheService.get(key);
        expect(value).toBe(testValue);
      }

      // Get keys by pattern
      const userCacheKeys = await cacheService.keys('user:*');
      expect(userCacheKeys.length).toBeGreaterThanOrEqual(3);

      // Clear user-related cache
      for (const key of userCacheKeys) {
        await cacheService.delete(key);
      }

      // Verify user cache is cleared
      for (const key of userKeys) {
        const value = await cacheService.get(key);
        expect(value).toBeNull();
      }

      // Verify task cache is still intact
      for (const key of taskKeys) {
        const value = await cacheService.get(key);
        expect(value).toBe(testValue);
      }
    });
  });

  describe('IT-CACHE-006: Error Handling', () => {
    test('should handle Redis connection errors gracefully', async () => {
      // Create a cache service with invalid configuration
      const invalidCacheService = new CacheService({
        host: 'invalid-host',
        port: 9999,
        defaultTTL: 60,
        keyPrefix: 'test:'
      });

      // Operations should fail gracefully without throwing
      const getResult = await invalidCacheService.get('test-key');
      expect(getResult).toBeNull();

      const setResult = await invalidCacheService.set('test-key', 'test-value');
      // May succeed if Redis is available on localhost, so check either true or false
      expect(typeof setResult).toBe('boolean');

      const deleteResult = await invalidCacheService.delete('test-key');
      expect(typeof deleteResult).toBe('boolean');

      const existsResult = await invalidCacheService.exists('test-key');
      expect(typeof existsResult).toBe('boolean');

      await invalidCacheService.disconnect();
    });

    test('should handle serialization errors', async () => {
      // Create circular reference object (cannot be serialized)
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      // Should handle serialization error gracefully
      const setResult = await cacheService.set('circular', circularObj);
      expect(setResult).toBe(false);

      // Verify no data was cached
      const getResult = await cacheService.get('circular');
      expect(getResult).toBeNull();
    });

    test('should handle large data gracefully', async () => {
      // Create large data object
      const largeData = {
        id: 'large-data-test',
        data: 'x'.repeat(1024 * 1024) // 1MB string
      };

      // Should handle large data
      const setResult = await cacheService.set('large-data', largeData);
      expect(typeof setResult).toBe('boolean');

      if (setResult) {
        const getResult = await cacheService.get('large-data');
        expect(getResult).toEqual(largeData);
      }
    });
  });

  describe('IT-CACHE-007: Performance and Statistics', () => {
    test('should provide comprehensive cache statistics', async () => {
      // Reset statistics
      await cacheService.clear();

      // Perform various cache operations
      const operations = [
        { key: 'stat-1', value: 'data-1' },
        { key: 'stat-2', value: 'data-2' },
        { key: 'stat-3', value: 'data-3' }
      ];

      // Set operations
      for (const op of operations) {
        await cacheService.set(op.key, op.value);
      }

      // Get operations (hits)
      for (const op of operations) {
        const value = await cacheService.get(op.key);
        expect(value).toBe(op.value);
      }

      // Get operations (misses)
      for (let i = 0; i < 3; i++) {
        await cacheService.get(`miss-${i}`);
      }

      // Delete operations
      await cacheService.delete('stat-1');

      // Get statistics
      const stats = await cacheService.getStats();

      expect(stats.sets).toBeGreaterThanOrEqual(3);
      expect(stats.hits).toBeGreaterThanOrEqual(3);
      expect(stats.misses).toBeGreaterThanOrEqual(3);
      expect(stats.deletes).toBeGreaterThanOrEqual(1);
      expect(stats.hitRate).toBeGreaterThan(0);
      expect(stats.hitRate).toBeLessThanOrEqual(100); // Hit rate is percentage

      console.log('Cache Statistics:', stats);
    });

    test('should measure cache operation performance', async () => {
      const iterations = 100;
      const testData = { id: 'perf-test', data: 'performance test data' };

      // Measure set performance
      const setStartTime = Date.now();
      for (let i = 0; i < iterations; i++) {
        await cacheService.set(`perf-set-${i}`, testData);
      }
      const setDuration = Date.now() - setStartTime;
      const avgSetTime = setDuration / iterations;

      // Measure get performance
      const getStartTime = Date.now();
      for (let i = 0; i < iterations; i++) {
        await cacheService.get(`perf-set-${i}`);
      }
      const getDuration = Date.now() - getStartTime;
      const avgGetTime = getDuration / iterations;

      // Performance assertions
      expect(avgSetTime).toBeLessThan(50); // Should be under 50ms per operation
      expect(avgGetTime).toBeLessThan(50); // Should be under 50ms per operation

      console.log(`Average set time: ${avgSetTime.toFixed(2)}ms`);
      console.log(`Average get time: ${avgGetTime.toFixed(2)}ms`);
    });

    test('should handle concurrent cache operations', async () => {
      const concurrentOperations = 50;
      const testData = 'concurrent test data';

      // Concurrent set operations
      const setPromises = Array.from({ length: concurrentOperations }, (_, i) =>
        cacheService.set(`concurrent-${i}`, `${testData}-${i}`)
      );

      const setResults = await Promise.all(setPromises);
      expect(setResults.every(result => result === true)).toBe(true);

      // Concurrent get operations
      const getPromises = Array.from({ length: concurrentOperations }, (_, i) =>
        cacheService.get(`concurrent-${i}`)
      );

      const getResults = await Promise.all(getPromises);
      expect(getResults.every((result, i) => result === `${testData}-${i}`)).toBe(true);

      // Concurrent delete operations
      const deletePromises = Array.from({ length: concurrentOperations }, (_, i) =>
        cacheService.delete(`concurrent-${i}`)
      );

      const deleteResults = await Promise.all(deletePromises);
      expect(deleteResults.every(result => result === true)).toBe(true);
    });
  });
});
