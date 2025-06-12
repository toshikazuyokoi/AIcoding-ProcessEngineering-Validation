/**
 * ===================================
 * Cache Service Utility Class
 * ===================================
 * Purpose: Redis cache management and operations
 * Features:
 * - Redis cache integration and connection management
 * - Cache key generation and namespace strategies
 * - Cache TTL (Time To Live) management and expiration policies
 * - Cache operations: get, set, delete, exists, clear
 * - Serialization and deserialization of cached data
 * - Cache invalidation patterns and strategies
 * - Performance optimization and connection pooling
 * - Error handling for cache operations
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import Redis from 'ioredis';
import { createLogger } from './logger';
import { ValidationError, NetworkError } from './error-handler';

// Node.js global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      REDIS_URL?: string;
      REDIS_HOST?: string;
      REDIS_PORT?: string;
      REDIS_PASSWORD?: string;
      REDIS_DB?: string;
      CACHE_DEFAULT_TTL?: string;
      CACHE_KEY_PREFIX?: string;
    }
  }
}

/**
 * Cache configuration interface
 */
export interface CacheConfig {
  host: string;
  port: number;
  password?: string | undefined;
  db: number;
  defaultTTL: number;
  keyPrefix: string;
  maxRetriesPerRequest: number;
  retryDelayOnFailover: number;
  enableReadyCheck: boolean;
  lazyConnect: boolean;
}

/**
 * Cache operation result interface
 */
export interface CacheResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  fromCache: boolean;
  ttl?: number;
}

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  deletes: number;
  errors: number;
  hitRate: number;
}

/**
 * Cache Service class
 */
export class CacheService {
  private redis: Redis;
  private config: CacheConfig;
  private logger = createLogger('CacheService');
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    sets: 0,
    deletes: 0,
    errors: 0,
    hitRate: 0
  };

  constructor(config?: Partial<CacheConfig>) {
    this.config = this.buildConfig(config);
    this.redis = this.createRedisClient();
    this.setupEventHandlers();

    this.logger.info('CacheService initialized', {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      defaultTTL: this.config.defaultTTL,
      keyPrefix: this.config.keyPrefix
    });
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<CacheConfig>): CacheConfig {
    const redisUrl = process.env.REDIS_URL;

    const defaultConfig: CacheConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      defaultTTL: parseInt(process.env.CACHE_DEFAULT_TTL || '3600'), // 1 hour
      keyPrefix: process.env.CACHE_KEY_PREFIX || 'task-mgmt:',
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Create Redis client
   */
  private createRedisClient(): Redis {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
      return new Redis(redisUrl, {
        maxRetriesPerRequest: this.config.maxRetriesPerRequest,
        enableReadyCheck: this.config.enableReadyCheck,
        lazyConnect: this.config.lazyConnect
      });
    }

    const redisOptions: any = {
      host: this.config.host,
      port: this.config.port,
      db: this.config.db,
      maxRetriesPerRequest: this.config.maxRetriesPerRequest,
      enableReadyCheck: this.config.enableReadyCheck,
      lazyConnect: this.config.lazyConnect
    };

    if (this.config.password) {
      redisOptions.password = this.config.password;
    }

    return new Redis(redisOptions);
  }

  /**
   * Setup Redis event handlers
   */
  private setupEventHandlers(): void {
    this.redis.on('connect', () => {
      this.logger.info('Redis connected');
    });

    this.redis.on('ready', () => {
      this.logger.info('Redis ready');
    });

    this.redis.on('error', (error) => {
      this.logger.error('Redis error', error);
      this.stats.errors++;
    });

    this.redis.on('close', () => {
      this.logger.warn('Redis connection closed');
    });

    this.redis.on('reconnecting', () => {
      this.logger.info('Redis reconnecting');
    });
  }

  /**
   * Normalize cache key
   */
  private normalizeKey(key: string): string {
    if (key === null || key === undefined || typeof key !== 'string') {
      throw new ValidationError('Cache key must be a non-empty string');
    }

    if (key.length === 0 || key.trim().length === 0) {
      throw new ValidationError('Cache key cannot be empty');
    }

    const normalizedKey = key.trim().toLowerCase();
    return `${this.config.keyPrefix}${normalizedKey}`;
  }

  /**
   * Serialize data for caching
   */
  private serialize<T>(data: T): string {
    try {
      return JSON.stringify(data);
    } catch (error) {
      this.logger.error('Serialization failed', error as Error);
      throw new NetworkError('Failed to serialize data for caching');
    }
  }

  /**
   * Deserialize cached data
   */
  private deserialize<T>(data: string): T {
    try {
      return JSON.parse(data);
    } catch (error) {
      this.logger.error('Deserialization failed', error as Error);
      throw new NetworkError('Failed to deserialize cached data');
    }
  }

  /**
   * Check if Redis is connected
   */
  public async isConnected(): Promise<boolean> {
    try {
      const result = await this.redis.ping();
      return result === 'PONG';
    } catch (error) {
      return false;
    }
  }

  /**
   * Get data from cache
   */
  public async get<T>(key: string): Promise<T | null> {
    const startTime = Date.now();

    try {
      const normalizedKey = this.normalizeKey(key);

      if (!(await this.isConnected())) {
        this.logger.warn('Redis not connected, cache miss', { key });
        this.stats.misses++;
        return null;
      }

      const cachedData = await this.redis.get(normalizedKey);

      if (cachedData === null) {
        this.stats.misses++;
        this.logger.debug('Cache miss', { key, normalizedKey });
        return null;
      }

      const data = this.deserialize<T>(cachedData);
      this.stats.hits++;

      const timeTaken = Date.now() - startTime;
      this.logger.debug('Cache hit', {
        key,
        normalizedKey,
        timeTaken,
        dataSize: cachedData.length
      });

      return data;
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      this.stats.errors++;
      this.stats.misses++;

      const timeTaken = Date.now() - startTime;
      this.logger.error('Cache get failed', error as Error, {
        key,
        timeTaken
      });

      return null; // Return null on error to allow fallback
    } finally {
      this.updateHitRate();
    }
  }

  /**
   * Set data in cache
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    const startTime = Date.now();

    try {
      const normalizedKey = this.normalizeKey(key);
      const serializedData = this.serialize(value);
      const cacheTTL = ttl || this.config.defaultTTL;

      if (!(await this.isConnected())) {
        this.logger.warn('Redis not connected, cache set failed', { key });
        return false;
      }

      await this.redis.setex(normalizedKey, cacheTTL, serializedData);
      this.stats.sets++;

      const timeTaken = Date.now() - startTime;
      this.logger.debug('Cache set successful', {
        key,
        normalizedKey,
        ttl: cacheTTL,
        dataSize: serializedData.length,
        timeTaken
      });

      return true;
    } catch (error) {
      this.stats.errors++;

      const timeTaken = Date.now() - startTime;
      this.logger.error('Cache set failed', error as Error, {
        key,
        ttl,
        timeTaken
      });

      return false;
    }
  }

  /**
   * Delete data from cache
   */
  public async delete(key: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      const normalizedKey = this.normalizeKey(key);

      if (!(await this.isConnected())) {
        this.logger.warn('Redis not connected, cache delete failed', { key });
        return false;
      }

      const result = await this.redis.del(normalizedKey);
      const deleted = result > 0;

      if (deleted) {
        this.stats.deletes++;
      }

      const timeTaken = Date.now() - startTime;
      this.logger.debug('Cache delete', {
        key,
        normalizedKey,
        deleted,
        timeTaken
      });

      return deleted;
    } catch (error) {
      this.stats.errors++;

      const timeTaken = Date.now() - startTime;
      this.logger.error('Cache delete failed', error as Error, {
        key,
        timeTaken
      });

      return false;
    }
  }

  /**
   * Check if key exists in cache
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const normalizedKey = this.normalizeKey(key);

      if (!(await this.isConnected())) {
        return false;
      }

      const result = await this.redis.exists(normalizedKey);
      return result === 1;
    } catch (error) {
      this.logger.error('Cache exists check failed', error as Error, { key });
      return false;
    }
  }

  /**
   * Get TTL for a key
   */
  public async getTTL(key: string): Promise<number> {
    try {
      const normalizedKey = this.normalizeKey(key);

      if (!(await this.isConnected())) {
        return -1;
      }

      return await this.redis.ttl(normalizedKey);
    } catch (error) {
      this.logger.error('Cache TTL check failed', error as Error, { key });
      return -1;
    }
  }

  /**
   * Get keys by pattern
   */
  public async keys(pattern: string = '*'): Promise<string[]> {
    try {
      if (!(await this.isConnected())) {
        this.logger.warn('Redis not connected, keys operation failed', { pattern });
        return [];
      }

      const normalizedPattern = `${this.config.keyPrefix}${pattern}`;
      const keys = await this.redis.keys(normalizedPattern);

      // Remove prefix from keys for consistent API
      return keys.map(key => key.replace(this.config.keyPrefix, ''));
    } catch (error) {
      this.logger.error('Keys operation failed', error as Error, { pattern });
      return [];
    }
  }

  /**
   * Invalidate cache by pattern
   */
  public async invalidatePattern(pattern: string): Promise<number> {
    const startTime = Date.now();

    try {
      if (!pattern || typeof pattern !== 'string') {
        throw new ValidationError('Pattern must be a non-empty string');
      }

      if (pattern.trim().length === 0) {
        throw new ValidationError('Pattern must be a non-empty string');
      }

      const normalizedPattern = `${this.config.keyPrefix}${pattern}`;

      if (!(await this.isConnected())) {
        this.logger.warn('Redis not connected, pattern invalidation failed', { pattern });
        return 0;
      }

      const keys = await this.redis.keys(normalizedPattern);

      if (keys.length === 0) {
        this.logger.debug('No keys found for pattern', { pattern, normalizedPattern });
        return 0;
      }

      const result = await this.redis.del(...keys);
      this.stats.deletes += result;

      const timeTaken = Date.now() - startTime;
      this.logger.info('Pattern invalidation completed', {
        pattern,
        normalizedPattern,
        keysFound: keys.length,
        keysDeleted: result,
        timeTaken
      });

      return result;
    } catch (error) {
      // Re-throw validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      this.stats.errors++;

      const timeTaken = Date.now() - startTime;
      this.logger.error('Pattern invalidation failed', error as Error, {
        pattern,
        timeTaken
      });

      return 0;
    }
  }

  /**
   * Clear all cache
   */
  public async clear(): Promise<boolean> {
    const startTime = Date.now();

    try {
      if (!(await this.isConnected())) {
        this.logger.warn('Redis not connected, cache clear failed');
        return false;
      }

      await this.redis.flushdb();

      const timeTaken = Date.now() - startTime;
      this.logger.info('Cache cleared successfully', { timeTaken });

      // Reset stats
      this.stats = {
        hits: 0,
        misses: 0,
        sets: 0,
        deletes: 0,
        errors: 0,
        hitRate: 0
      };

      return true;
    } catch (error) {
      this.stats.errors++;

      const timeTaken = Date.now() - startTime;
      this.logger.error('Cache clear failed', error as Error, { timeTaken });

      return false;
    }
  }

  /**
   * Update hit rate statistics
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    this.updateHitRate();
    return { ...this.stats };
  }

  /**
   * Get cache configuration (without sensitive data)
   */
  public getConfig(): Omit<CacheConfig, 'password'> {
    const { password, ...config } = this.config;
    return config;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<{ status: string; latency: number; connected: boolean }> {
    const startTime = Date.now();

    try {
      const connected = await this.isConnected();
      const latency = Date.now() - startTime;

      return {
        status: connected ? 'healthy' : 'unhealthy',
        latency,
        connected
      };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        status: 'error',
        latency,
        connected: false
      };
    }
  }

  /**
   * Disconnect from Redis
   */
  public async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
      this.logger.info('Redis disconnected gracefully');
    } catch (error) {
      this.logger.error('Redis disconnect failed', error as Error);
      this.redis.disconnect();
    }
  }
}

/**
 * Default cache service instance
 */
export const cacheService = new CacheService();

/**
 * Create cache service with custom configuration
 */
export function createCacheService(config?: Partial<CacheConfig>): CacheService {
  return new CacheService(config);
}
