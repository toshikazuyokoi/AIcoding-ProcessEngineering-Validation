// ===================================
// Task Management System - Redis Configuration
// ===================================
// Generated for TSK-036-CFG-Redis
// Project: Task Management System
// Component: Redis Configuration Module
// Purpose: Centralized Redis configuration management with cluster and sentinel support

import { Logger, createLogger } from '../src/utils/logger';

// ===================================
// Type Definitions
// ===================================

/**
 * Redis environment types
 */
export type RedisEnvironment = 'development' | 'production' | 'test' | 'staging';

/**
 * Redis deployment modes
 */
export type RedisMode = 'standalone' | 'cluster' | 'sentinel';

/**
 * Redis connection configuration interface
 */
export interface RedisConnectionConfig {
  /** Redis host */
  host: string;
  /** Redis port */
  port: number;
  /** Redis password */
  password?: string | undefined;
  /** Redis database number */
  db: number;
  /** Connection timeout in milliseconds */
  connectTimeout: number;
  /** Command timeout in milliseconds */
  commandTimeout: number;
  /** Keep alive interval in milliseconds */
  keepAlive: number;
}

/**
 * Redis cluster configuration interface
 */
export interface RedisClusterConfig {
  /** Cluster nodes */
  nodes: Array<{ host: string; port: number }>;
  /** Enable read from replicas */
  enableReadyCheck: boolean;
  /** Redirection limit */
  maxRedirections: number;
  /** Retry delay on failover */
  retryDelayOnFailover: number;
  /** Scale reads */
  scaleReads: 'master' | 'slave' | 'all';
}

/**
 * Redis sentinel configuration interface
 */
export interface RedisSentinelConfig {
  /** Sentinel nodes */
  sentinels: Array<{ host: string; port: number }>;
  /** Master name */
  name: string;
  /** Sentinel password */
  sentinelPassword?: string | undefined;
  /** Role */
  role: 'master' | 'slave';
  /** Failover timeout */
  failoverTimeout: number;
}

/**
 * Redis retry configuration interface
 */
export interface RedisRetryConfig {
  /** Maximum retry attempts */
  retries: number;
  /** Retry delay in milliseconds */
  retryDelayOnFailover: number;
  /** Maximum retry delay */
  maxRetryDelay: number;
  /** Retry delay factor */
  retryDelayFactor: number;
}

/**
 * Redis pool configuration interface
 */
export interface RedisPoolConfig {
  /** Maximum connections */
  max: number;
  /** Minimum connections */
  min: number;
  /** Idle timeout in milliseconds */
  idleTimeoutMillis: number;
  /** Eviction run interval */
  evictionRunIntervalMillis: number;
  /** Maximum lifetime */
  maxLifetimeMillis: number;
}

/**
 * Redis cache configuration interface
 */
export interface RedisCacheConfig {
  /** Default TTL in seconds */
  defaultTTL: number;
  /** Key prefix */
  keyPrefix: string;
  /** Enable compression */
  compression: boolean;
  /** Serialization format */
  serialization: 'json' | 'msgpack' | 'binary';
  /** Maximum key length */
  maxKeyLength: number;
  /** Maximum value size in bytes */
  maxValueSize: number;
}

/**
 * Redis monitoring configuration interface
 */
export interface RedisMonitoringConfig {
  /** Enable monitoring */
  enabled: boolean;
  /** Metrics collection interval */
  metricsInterval: number;
  /** Enable slow log */
  slowLog: boolean;
  /** Slow log threshold in microseconds */
  slowLogThreshold: number;
  /** Health check interval */
  healthCheckInterval: number;
}

/**
 * Complete Redis configuration interface
 */
export interface RedisConfig {
  /** Redis deployment mode */
  mode: RedisMode;
  /** Current environment */
  environment: RedisEnvironment;
  /** Connection configuration */
  connection: RedisConnectionConfig;
  /** Cluster configuration (if mode is cluster) */
  cluster?: RedisClusterConfig;
  /** Sentinel configuration (if mode is sentinel) */
  sentinel?: RedisSentinelConfig;
  /** Retry configuration */
  retry: RedisRetryConfig;
  /** Connection pool configuration */
  pool: RedisPoolConfig;
  /** Cache configuration */
  cache: RedisCacheConfig;
  /** Monitoring configuration */
  monitoring: RedisMonitoringConfig;
  /** Enable lazy connect */
  lazyConnect: boolean;
  /** Enable ready check */
  enableReadyCheck: boolean;
}

// ===================================
// Configuration Validation
// ===================================

/**
 * Redis configuration validation error
 */
export class RedisConfigError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'RedisConfigError';
  }
}

/**
 * Validates Redis connection configuration
 */
function validateConnectionConfig(connection: RedisConnectionConfig): void {
  if (!connection.host) {
    throw new RedisConfigError('Redis host is required', 'connection.host');
  }

  if (connection.port <= 0 || connection.port > 65535) {
    throw new RedisConfigError('Redis port must be between 1 and 65535', 'connection.port');
  }

  if (connection.db < 0 || connection.db > 15) {
    throw new RedisConfigError('Redis database must be between 0 and 15', 'connection.db');
  }

  if (connection.connectTimeout <= 0) {
    throw new RedisConfigError('Connect timeout must be greater than 0', 'connection.connectTimeout');
  }

  if (connection.commandTimeout <= 0) {
    throw new RedisConfigError('Command timeout must be greater than 0', 'connection.commandTimeout');
  }
}

/**
 * Validates Redis cluster configuration
 */
function validateClusterConfig(cluster: RedisClusterConfig): void {
  if (!cluster.nodes || cluster.nodes.length === 0) {
    throw new RedisConfigError('Cluster nodes are required', 'cluster.nodes');
  }

  cluster.nodes.forEach((node, index) => {
    if (!node.host) {
      throw new RedisConfigError(`Cluster node ${index} host is required`, `cluster.nodes[${index}].host`);
    }
    if (node.port <= 0 || node.port > 65535) {
      throw new RedisConfigError(`Cluster node ${index} port must be between 1 and 65535`, `cluster.nodes[${index}].port`);
    }
  });

  if (cluster.maxRedirections <= 0) {
    throw new RedisConfigError('Max redirections must be greater than 0', 'cluster.maxRedirections');
  }
}

/**
 * Validates Redis sentinel configuration
 */
function validateSentinelConfig(sentinel: RedisSentinelConfig): void {
  if (!sentinel.sentinels || sentinel.sentinels.length === 0) {
    throw new RedisConfigError('Sentinel nodes are required', 'sentinel.sentinels');
  }

  if (!sentinel.name) {
    throw new RedisConfigError('Sentinel master name is required', 'sentinel.name');
  }

  sentinel.sentinels.forEach((node, index) => {
    if (!node.host) {
      throw new RedisConfigError(`Sentinel node ${index} host is required`, `sentinel.sentinels[${index}].host`);
    }
    if (node.port <= 0 || node.port > 65535) {
      throw new RedisConfigError(`Sentinel node ${index} port must be between 1 and 65535`, `sentinel.sentinels[${index}].port`);
    }
  });
}

/**
 * Validates Redis retry configuration
 */
function validateRetryConfig(retry: RedisRetryConfig): void {
  if (retry.retries < 0) {
    throw new RedisConfigError('Retry attempts must be greater than or equal to 0', 'retry.retries');
  }

  if (retry.retryDelayOnFailover <= 0) {
    throw new RedisConfigError('Retry delay must be greater than 0', 'retry.retryDelayOnFailover');
  }

  if (retry.maxRetryDelay < retry.retryDelayOnFailover) {
    throw new RedisConfigError('Max retry delay cannot be less than retry delay', 'retry.maxRetryDelay');
  }
}

/**
 * Validates Redis pool configuration
 */
function validatePoolConfig(pool: RedisPoolConfig): void {
  if (pool.max <= 0) {
    throw new RedisConfigError('Pool max connections must be greater than 0', 'pool.max');
  }

  if (pool.min < 0) {
    throw new RedisConfigError('Pool min connections must be greater than or equal to 0', 'pool.min');
  }

  if (pool.min > pool.max) {
    throw new RedisConfigError('Pool min connections cannot exceed max connections', 'pool.min');
  }
}

/**
 * Validates complete Redis configuration
 */
function validateRedisConfig(config: RedisConfig): void {
  validateConnectionConfig(config.connection);
  validateRetryConfig(config.retry);
  validatePoolConfig(config.pool);

  if (config.mode === 'cluster' && config.cluster) {
    validateClusterConfig(config.cluster);
  }

  if (config.mode === 'sentinel' && config.sentinel) {
    validateSentinelConfig(config.sentinel);
  }

  if (config.cache.defaultTTL <= 0) {
    throw new RedisConfigError('Default TTL must be greater than 0', 'cache.defaultTTL');
  }

  if (config.cache.maxKeyLength <= 0) {
    throw new RedisConfigError('Max key length must be greater than 0', 'cache.maxKeyLength');
  }

  if (config.cache.maxValueSize <= 0) {
    throw new RedisConfigError('Max value size must be greater than 0', 'cache.maxValueSize');
  }
}

// ===================================
// Environment Variable Parsing
// ===================================

/**
 * Safely parses integer from environment variable
 */
function parseEnvInt(value: string | undefined, defaultValue: number): number {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Safely parses boolean from environment variable
 */
function parseEnvBoolean(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) return defaultValue;
  return value.toLowerCase() === 'true';
}

/**
 * Parses Redis URL into connection components
 */
function parseRedisUrl(url: string): Partial<RedisConnectionConfig> {
  try {
    const parsed = new URL(url);

    // Validate that it's a Redis URL
    if (parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') {
      throw new RedisConfigError(`Invalid Redis URL protocol. Expected 'redis:' or 'rediss:', got '${parsed.protocol}'`);
    }

    return {
      host: parsed.hostname,
      port: parseInt(parsed.port) || 6379,
      password: parsed.password || undefined,
      db: parseInt(parsed.pathname.slice(1)) || 0,
    };
  } catch (error) {
    if (error instanceof RedisConfigError) {
      throw error;
    }
    throw new RedisConfigError(`Invalid Redis URL format: ${url}`);
  }
}

/**
 * Gets current environment
 */
function getCurrentEnvironment(): RedisEnvironment {
  const env = process.env.NODE_ENV?.toLowerCase();
  switch (env) {
    case 'production':
      return 'production';
    case 'test':
      return 'test';
    case 'staging':
      return 'staging';
    default:
      return 'development';
  }
}

/**
 * Gets Redis deployment mode from environment
 */
function getRedisMode(): RedisMode {
  const mode = process.env.REDIS_MODE?.toLowerCase();
  switch (mode) {
    case 'cluster':
      return 'cluster';
    case 'sentinel':
      return 'sentinel';
    default:
      return 'standalone';
  }
}

// ===================================
// Default Configuration Factory
// ===================================

/**
 * Creates default connection configuration
 */
function createDefaultConnectionConfig(environment: RedisEnvironment): RedisConnectionConfig {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    const urlConfig = parseRedisUrl(redisUrl);
    return {
      host: urlConfig.host || 'localhost',
      port: urlConfig.port || 6379,
      password: urlConfig.password,
      db: urlConfig.db || 0,
      connectTimeout: parseEnvInt(process.env.REDIS_CONNECT_TIMEOUT, 10000),
      commandTimeout: parseEnvInt(process.env.REDIS_COMMAND_TIMEOUT, 5000),
      keepAlive: parseEnvInt(process.env.REDIS_KEEP_ALIVE, 30000),
    };
  }

  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseEnvInt(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD,
    db: parseEnvInt(process.env.REDIS_DB, 0),
    connectTimeout: parseEnvInt(process.env.REDIS_CONNECT_TIMEOUT, environment === 'test' ? 5000 : 10000),
    commandTimeout: parseEnvInt(process.env.REDIS_COMMAND_TIMEOUT, environment === 'test' ? 2000 : 5000),
    keepAlive: parseEnvInt(process.env.REDIS_KEEP_ALIVE, 30000),
  };
}

/**
 * Creates default cluster configuration
 */
function createDefaultClusterConfig(): RedisClusterConfig {
  const nodesStr = process.env.REDIS_CLUSTER_NODES;
  const nodes = nodesStr
    ? nodesStr.split(',').map(node => {
        const [host, port] = node.trim().split(':');
        return { host, port: parseInt(port) || 6379 };
      })
    : [{ host: 'localhost', port: 6379 }];

  return {
    nodes,
    enableReadyCheck: parseEnvBoolean(process.env.REDIS_CLUSTER_READY_CHECK, true),
    maxRedirections: parseEnvInt(process.env.REDIS_CLUSTER_MAX_REDIRECTIONS, 16),
    retryDelayOnFailover: parseEnvInt(process.env.REDIS_CLUSTER_RETRY_DELAY, 100),
    scaleReads: (process.env.REDIS_CLUSTER_SCALE_READS as any) || 'master',
  };
}

/**
 * Creates default sentinel configuration
 */
function createDefaultSentinelConfig(): RedisSentinelConfig {
  const sentinelsStr = process.env.REDIS_SENTINEL_NODES;
  const sentinels = sentinelsStr
    ? sentinelsStr.split(',').map(node => {
        const [host, port] = node.trim().split(':');
        return { host, port: parseInt(port) || 26379 };
      })
    : [{ host: 'localhost', port: 26379 }];

  return {
    sentinels,
    name: process.env.REDIS_SENTINEL_MASTER_NAME || 'mymaster',
    sentinelPassword: process.env.REDIS_SENTINEL_PASSWORD,
    role: (process.env.REDIS_SENTINEL_ROLE as any) || 'master',
    failoverTimeout: parseEnvInt(process.env.REDIS_SENTINEL_FAILOVER_TIMEOUT, 180000),
  };
}

/**
 * Creates default retry configuration
 */
function createDefaultRetryConfig(environment: RedisEnvironment): RedisRetryConfig {
  switch (environment) {
    case 'production':
      return {
        retries: parseEnvInt(process.env.REDIS_RETRIES, 5),
        retryDelayOnFailover: parseEnvInt(process.env.REDIS_RETRY_DELAY, 100),
        maxRetryDelay: parseEnvInt(process.env.REDIS_MAX_RETRY_DELAY, 30000),
        retryDelayFactor: 2,
      };
    case 'test':
      return {
        retries: parseEnvInt(process.env.REDIS_RETRIES, 1),
        retryDelayOnFailover: parseEnvInt(process.env.REDIS_RETRY_DELAY, 50),
        maxRetryDelay: parseEnvInt(process.env.REDIS_MAX_RETRY_DELAY, 1000),
        retryDelayFactor: 1.5,
      };
    default:
      return {
        retries: parseEnvInt(process.env.REDIS_RETRIES, 3),
        retryDelayOnFailover: parseEnvInt(process.env.REDIS_RETRY_DELAY, 100),
        maxRetryDelay: parseEnvInt(process.env.REDIS_MAX_RETRY_DELAY, 10000),
        retryDelayFactor: 2,
      };
  }
}

/**
 * Creates default pool configuration
 */
function createDefaultPoolConfig(environment: RedisEnvironment): RedisPoolConfig {
  switch (environment) {
    case 'production':
      return {
        max: parseEnvInt(process.env.REDIS_POOL_MAX, 50),
        min: parseEnvInt(process.env.REDIS_POOL_MIN, 10),
        idleTimeoutMillis: parseEnvInt(process.env.REDIS_POOL_IDLE_TIMEOUT, 30000),
        evictionRunIntervalMillis: parseEnvInt(process.env.REDIS_POOL_EVICTION_INTERVAL, 60000),
        maxLifetimeMillis: parseEnvInt(process.env.REDIS_POOL_MAX_LIFETIME, 3600000),
      };
    case 'test':
      return {
        max: parseEnvInt(process.env.REDIS_POOL_MAX, 5),
        min: parseEnvInt(process.env.REDIS_POOL_MIN, 1),
        idleTimeoutMillis: parseEnvInt(process.env.REDIS_POOL_IDLE_TIMEOUT, 5000),
        evictionRunIntervalMillis: parseEnvInt(process.env.REDIS_POOL_EVICTION_INTERVAL, 10000),
        maxLifetimeMillis: parseEnvInt(process.env.REDIS_POOL_MAX_LIFETIME, 300000),
      };
    default:
      return {
        max: parseEnvInt(process.env.REDIS_POOL_MAX, 20),
        min: parseEnvInt(process.env.REDIS_POOL_MIN, 5),
        idleTimeoutMillis: parseEnvInt(process.env.REDIS_POOL_IDLE_TIMEOUT, 10000),
        evictionRunIntervalMillis: parseEnvInt(process.env.REDIS_POOL_EVICTION_INTERVAL, 30000),
        maxLifetimeMillis: parseEnvInt(process.env.REDIS_POOL_MAX_LIFETIME, 1800000),
      };
  }
}

/**
 * Creates default cache configuration
 */
function createDefaultCacheConfig(environment: RedisEnvironment): RedisCacheConfig {
  return {
    defaultTTL: parseEnvInt(process.env.CACHE_DEFAULT_TTL, 3600),
    keyPrefix: process.env.CACHE_KEY_PREFIX || 'task-mgmt:',
    compression: parseEnvBoolean(process.env.REDIS_COMPRESSION, environment === 'production'),
    serialization: (process.env.REDIS_SERIALIZATION as any) || 'json',
    maxKeyLength: parseEnvInt(process.env.REDIS_MAX_KEY_LENGTH, 512),
    maxValueSize: parseEnvInt(process.env.REDIS_MAX_VALUE_SIZE, 1048576), // 1MB
  };
}

/**
 * Creates default monitoring configuration
 */
function createDefaultMonitoringConfig(environment: RedisEnvironment): RedisMonitoringConfig {
  return {
    enabled: parseEnvBoolean(process.env.REDIS_MONITORING_ENABLED, environment !== 'test'),
    metricsInterval: parseEnvInt(process.env.REDIS_METRICS_INTERVAL, 60000),
    slowLog: parseEnvBoolean(process.env.REDIS_SLOW_LOG_ENABLED, environment === 'development'),
    slowLogThreshold: parseEnvInt(process.env.REDIS_SLOW_LOG_THRESHOLD, 10000),
    healthCheckInterval: parseEnvInt(process.env.REDIS_HEALTH_CHECK_INTERVAL, 30000),
  };
}

// ===================================
// Configuration Builder
// ===================================

/**
 * Redis Configuration Builder Class
 */
export class RedisConfigBuilder {
  private config: Partial<RedisConfig> = {};
  private logger: Logger;

  constructor() {
    this.logger = createLogger('RedisConfigBuilder');
  }

  /**
   * Sets Redis deployment mode
   */
  mode(mode: RedisMode): this {
    this.config.mode = mode;
    return this;
  }

  /**
   * Sets environment
   */
  environment(environment: RedisEnvironment): this {
    this.config.environment = environment;
    return this;
  }

  /**
   * Sets connection configuration
   */
  connection(connection: Partial<RedisConnectionConfig>): this {
    this.config.connection = { ...this.config.connection, ...connection } as RedisConnectionConfig;
    return this;
  }

  /**
   * Sets cluster configuration
   */
  cluster(cluster: Partial<RedisClusterConfig>): this {
    this.config.cluster = { ...this.config.cluster, ...cluster } as RedisClusterConfig;
    return this;
  }

  /**
   * Sets sentinel configuration
   */
  sentinel(sentinel: Partial<RedisSentinelConfig>): this {
    this.config.sentinel = { ...this.config.sentinel, ...sentinel } as RedisSentinelConfig;
    return this;
  }

  /**
   * Sets retry configuration
   */
  retry(retry: Partial<RedisRetryConfig>): this {
    this.config.retry = { ...this.config.retry, ...retry } as RedisRetryConfig;
    return this;
  }

  /**
   * Sets pool configuration
   */
  pool(pool: Partial<RedisPoolConfig>): this {
    this.config.pool = { ...this.config.pool, ...pool } as RedisPoolConfig;
    return this;
  }

  /**
   * Sets cache configuration
   */
  cache(cache: Partial<RedisCacheConfig>): this {
    this.config.cache = { ...this.config.cache, ...cache } as RedisCacheConfig;
    return this;
  }

  /**
   * Sets monitoring configuration
   */
  monitoring(monitoring: Partial<RedisMonitoringConfig>): this {
    this.config.monitoring = { ...this.config.monitoring, ...monitoring } as RedisMonitoringConfig;
    return this;
  }

  /**
   * Enables lazy connect
   */
  enableLazyConnect(enabled: boolean = true): this {
    this.config.lazyConnect = enabled;
    return this;
  }

  /**
   * Enables ready check
   */
  enableReadyCheck(enabled: boolean = true): this {
    this.config.enableReadyCheck = enabled;
    return this;
  }

  /**
   * Builds and validates the configuration
   */
  build(): RedisConfig {
    const environment = this.config.environment || getCurrentEnvironment();
    const mode = this.config.mode || getRedisMode();

    const finalConfig: RedisConfig = {
      mode,
      environment,
      connection: this.config.connection || createDefaultConnectionConfig(environment),
      retry: this.config.retry || createDefaultRetryConfig(environment),
      pool: this.config.pool || createDefaultPoolConfig(environment),
      cache: this.config.cache || createDefaultCacheConfig(environment),
      monitoring: this.config.monitoring || createDefaultMonitoringConfig(environment),
      lazyConnect: this.config.lazyConnect ?? true,
      enableReadyCheck: this.config.enableReadyCheck ?? true,
    };

    // Add mode-specific configurations
    if (mode === 'cluster') {
      finalConfig.cluster = this.config.cluster || createDefaultClusterConfig();
    }

    if (mode === 'sentinel') {
      finalConfig.sentinel = this.config.sentinel || createDefaultSentinelConfig();
    }

    // Validate the final configuration
    validateRedisConfig(finalConfig);

    this.logger.info('Redis configuration built successfully', {
      mode: finalConfig.mode,
      environment: finalConfig.environment,
      host: finalConfig.connection.host,
      port: finalConfig.connection.port,
      poolMax: finalConfig.pool.max,
    });

    return finalConfig;
  }
}

// ===================================
// Configuration Manager
// ===================================

/**
 * Redis Configuration Manager (Singleton)
 */
export class RedisConfigManager {
  private static instance: RedisConfigManager;
  private config: RedisConfig | null = null;
  private logger: Logger;

  private constructor() {
    this.logger = createLogger('RedisConfigManager');
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): RedisConfigManager {
    if (!RedisConfigManager.instance) {
      RedisConfigManager.instance = new RedisConfigManager();
    }
    return RedisConfigManager.instance;
  }

  /**
   * Initializes the configuration
   */
  initialize(config: RedisConfig): void {
    this.config = config;
    this.logger.info('Redis configuration initialized', {
      mode: config.mode,
      environment: config.environment,
    });
  }

  /**
   * Gets the current configuration
   */
  getConfig(): RedisConfig {
    if (!this.config) {
      throw new RedisConfigError('Redis configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Updates the configuration
   */
  updateConfig(updates: Partial<RedisConfig>): void {
    if (!this.config) {
      throw new RedisConfigError('Redis configuration not initialized. Call initialize() first.');
    }

    this.config = { ...this.config, ...updates };
    validateRedisConfig(this.config);

    this.logger.info('Redis configuration updated', {
      updatedFields: Object.keys(updates),
    });
  }

  /**
   * Resets the configuration
   */
  reset(): void {
    this.config = null;
    this.logger.info('Redis configuration reset');
  }

  /**
   * Checks if configuration is initialized
   */
  isInitialized(): boolean {
    return this.config !== null;
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Creates a Redis configuration from environment variables
 */
export function createRedisConfigFromEnv(): RedisConfig {
  return new RedisConfigBuilder().build();
}

/**
 * Creates a Redis configuration for a specific environment
 */
export function createRedisConfigForEnvironment(environment: RedisEnvironment): RedisConfig {
  return new RedisConfigBuilder()
    .environment(environment)
    .build();
}

/**
 * Creates a Redis configuration with custom connection URL
 */
export function createRedisConfigWithUrl(url: string): RedisConfig {
  const urlConfig = parseRedisUrl(url);
  return new RedisConfigBuilder()
    .connection(urlConfig)
    .build();
}

/**
 * Creates a Redis configuration for cluster mode
 */
export function createRedisClusterConfig(nodes: Array<{ host: string; port: number }>): RedisConfig {
  return new RedisConfigBuilder()
    .mode('cluster')
    .cluster({ nodes, enableReadyCheck: true, maxRedirections: 16, retryDelayOnFailover: 100, scaleReads: 'master' })
    .build();
}

/**
 * Creates a Redis configuration for sentinel mode
 */
export function createRedisSentinelConfig(
  sentinels: Array<{ host: string; port: number }>,
  masterName: string
): RedisConfig {
  return new RedisConfigBuilder()
    .mode('sentinel')
    .sentinel({ sentinels, name: masterName, role: 'master', failoverTimeout: 180000 })
    .build();
}

/**
 * Gets the default Redis configuration
 */
export function getDefaultRedisConfig(): RedisConfig {
  return createRedisConfigFromEnv();
}

/**
 * Gets the Redis configuration manager instance
 */
export function getRedisConfigManager(): RedisConfigManager {
  return RedisConfigManager.getInstance();
}

/**
 * Initializes Redis configuration from environment
 */
export function initializeRedisConfig(): RedisConfig {
  const config = createRedisConfigFromEnv();
  const manager = getRedisConfigManager();
  manager.initialize(config);
  return config;
}

/**
 * Creates a Redis configuration with custom settings
 */
export function createRedisConfig(options: {
  mode?: RedisMode;
  environment?: RedisEnvironment;
  connection?: Partial<RedisConnectionConfig>;
  cluster?: Partial<RedisClusterConfig>;
  sentinel?: Partial<RedisSentinelConfig>;
  retry?: Partial<RedisRetryConfig>;
  pool?: Partial<RedisPoolConfig>;
  cache?: Partial<RedisCacheConfig>;
  monitoring?: Partial<RedisMonitoringConfig>;
  lazyConnect?: boolean;
  enableReadyCheck?: boolean;
}): RedisConfig {
  const builder = new RedisConfigBuilder();

  if (options.mode) builder.mode(options.mode);
  if (options.environment) builder.environment(options.environment);
  if (options.connection) builder.connection(options.connection);
  if (options.cluster) builder.cluster(options.cluster);
  if (options.sentinel) builder.sentinel(options.sentinel);
  if (options.retry) builder.retry(options.retry);
  if (options.pool) builder.pool(options.pool);
  if (options.cache) builder.cache(options.cache);
  if (options.monitoring) builder.monitoring(options.monitoring);
  if (options.lazyConnect !== undefined) builder.enableLazyConnect(options.lazyConnect);
  if (options.enableReadyCheck !== undefined) builder.enableReadyCheck(options.enableReadyCheck);

  return builder.build();
}