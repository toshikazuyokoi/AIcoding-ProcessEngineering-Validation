// ===================================
// Task Management System - Database Configuration
// ===================================
// Generated for TSK-035-CFG-Database
// Project: Task Management System
// Component: Database Configuration Module
// Purpose: Centralized database configuration management with validation and environment support

import { Logger, createLogger } from '../src/utils/logger';

// ===================================
// Type Definitions
// ===================================

/**
 * Database environment types
 */
export type DatabaseEnvironment = 'development' | 'production' | 'test' | 'staging';

/**
 * Database provider types
 */
export type DatabaseProvider = 'postgresql' | 'mysql' | 'sqlite';

/**
 * Connection pool configuration interface
 */
export interface ConnectionPoolConfig {
  /** Maximum number of connections in the pool */
  max: number;
  /** Minimum number of connections in the pool */
  min: number;
  /** Connection timeout in milliseconds */
  connectionTimeout: number;
  /** Idle timeout in milliseconds */
  idleTimeout: number;
  /** Maximum lifetime of a connection in milliseconds */
  maxLifetime: number;
}

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  /** Number of retry attempts */
  attempts: number;
  /** Initial delay between retries in milliseconds */
  delay: number;
  /** Maximum delay between retries in milliseconds */
  maxDelay: number;
  /** Backoff factor for exponential backoff */
  backoffFactor: number;
}

/**
 * SSL configuration interface
 */
export interface SSLConfig {
  /** Enable SSL connection */
  enabled: boolean;
  /** Reject unauthorized certificates */
  rejectUnauthorized: boolean;
  /** Path to CA certificate file */
  ca?: string | undefined;
  /** Path to client certificate file */
  cert?: string | undefined;
  /** Path to client key file */
  key?: string | undefined;
}

/**
 * Logging configuration interface
 */
export interface DatabaseLoggingConfig {
  /** Enable query logging */
  enabled: boolean;
  /** Log level for database operations */
  level: 'debug' | 'info' | 'warn' | 'error';
  /** Log slow queries */
  logSlowQueries: boolean;
  /** Slow query threshold in milliseconds */
  slowQueryThreshold: number;
}

/**
 * Migration configuration interface
 */
export interface MigrationConfig {
  /** Enable automatic migrations */
  autoMigrate: boolean;
  /** Migration directory path */
  directory: string;
  /** Migration table name */
  tableName: string;
}

/**
 * Complete database configuration interface
 */
export interface DatabaseConfig {
  /** Database connection URL */
  url: string;
  /** Database provider */
  provider: DatabaseProvider;
  /** Current environment */
  environment: DatabaseEnvironment;
  /** Connection pool configuration */
  pool: ConnectionPoolConfig;
  /** Retry configuration */
  retry: RetryConfig;
  /** SSL configuration */
  ssl: SSLConfig;
  /** Logging configuration */
  logging: DatabaseLoggingConfig;
  /** Migration configuration */
  migration: MigrationConfig;
  /** Enable health checks */
  healthCheck: boolean;
  /** Health check interval in milliseconds */
  healthCheckInterval: number;
}

// ===================================
// Configuration Validation
// ===================================

/**
 * Database configuration validation error
 */
export class DatabaseConfigError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

/**
 * Validates database URL format
 */
function validateDatabaseUrl(url: string): void {
  if (!url) {
    throw new DatabaseConfigError('Database URL is required', 'url');
  }

  // Basic URL format validation
  const urlPattern = /^(postgresql|mysql|sqlite):\/\/.+/;
  if (!urlPattern.test(url)) {
    throw new DatabaseConfigError(
      'Invalid database URL format. Expected: protocol://[user:password@]host[:port]/database',
      'url'
    );
  }
}

/**
 * Validates connection pool configuration
 */
function validatePoolConfig(pool: ConnectionPoolConfig): void {
  if (pool.max <= 0) {
    throw new DatabaseConfigError('Pool max connections must be greater than 0', 'pool.max');
  }

  if (pool.min < 0) {
    throw new DatabaseConfigError('Pool min connections must be greater than or equal to 0', 'pool.min');
  }

  if (pool.min > pool.max) {
    throw new DatabaseConfigError('Pool min connections cannot exceed max connections', 'pool.min');
  }

  if (pool.connectionTimeout <= 0) {
    throw new DatabaseConfigError('Connection timeout must be greater than 0', 'pool.connectionTimeout');
  }

  if (pool.idleTimeout <= 0) {
    throw new DatabaseConfigError('Idle timeout must be greater than 0', 'pool.idleTimeout');
  }
}

/**
 * Validates retry configuration
 */
function validateRetryConfig(retry: RetryConfig): void {
  if (retry.attempts < 0) {
    throw new DatabaseConfigError('Retry attempts must be greater than or equal to 0', 'retry.attempts');
  }

  if (retry.delay <= 0) {
    throw new DatabaseConfigError('Retry delay must be greater than 0', 'retry.delay');
  }

  if (retry.maxDelay < retry.delay) {
    throw new DatabaseConfigError('Max retry delay cannot be less than initial delay', 'retry.maxDelay');
  }

  if (retry.backoffFactor <= 0) {
    throw new DatabaseConfigError('Backoff factor must be greater than 0', 'retry.backoffFactor');
  }
}

/**
 * Validates complete database configuration
 */
function validateDatabaseConfig(config: DatabaseConfig): void {
  validateDatabaseUrl(config.url);
  validatePoolConfig(config.pool);
  validateRetryConfig(config.retry);

  if (config.healthCheckInterval <= 0) {
    throw new DatabaseConfigError('Health check interval must be greater than 0', 'healthCheckInterval');
  }

  if (config.logging.slowQueryThreshold <= 0) {
    throw new DatabaseConfigError('Slow query threshold must be greater than 0', 'logging.slowQueryThreshold');
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
 * Gets database provider from URL
 */
function getDatabaseProvider(url: string): DatabaseProvider {
  if (url.startsWith('postgresql://')) return 'postgresql';
  if (url.startsWith('mysql://')) return 'mysql';
  if (url.startsWith('sqlite://')) return 'sqlite';
  return 'postgresql'; // Default fallback
}

/**
 * Gets current environment
 */
function getCurrentEnvironment(): DatabaseEnvironment {
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

// ===================================
// Default Configuration Factory
// ===================================

/**
 * Creates default connection pool configuration
 */
function createDefaultPoolConfig(environment: DatabaseEnvironment): ConnectionPoolConfig {
  const baseConfig = {
    connectionTimeout: parseEnvInt(process.env.DB_CONNECTION_TIMEOUT, 30000),
    idleTimeout: parseEnvInt(process.env.DB_IDLE_TIMEOUT, 10000),
    maxLifetime: parseEnvInt(process.env.DB_MAX_LIFETIME, 3600000), // 1 hour
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        max: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 50),
        min: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 10),
      };
    case 'staging':
      return {
        ...baseConfig,
        max: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 30),
        min: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 5),
      };
    case 'test':
      return {
        ...baseConfig,
        max: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 5),
        min: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 1),
        connectionTimeout: 5000,
        idleTimeout: 1000,
      };
    default: // development
      return {
        ...baseConfig,
        max: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 20),
        min: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 5),
      };
  }
}

/**
 * Creates default retry configuration
 */
function createDefaultRetryConfig(environment: DatabaseEnvironment): RetryConfig {
  const baseConfig = {
    attempts: parseEnvInt(process.env.DB_RETRY_ATTEMPTS, 3),
    delay: parseEnvInt(process.env.DB_RETRY_DELAY, 1000),
    backoffFactor: 2,
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        maxDelay: 30000, // 30 seconds
      };
    case 'test':
      return {
        ...baseConfig,
        attempts: 1,
        delay: 100,
        maxDelay: 1000,
      };
    default:
      return {
        ...baseConfig,
        maxDelay: 10000, // 10 seconds
      };
  }
}

/**
 * Creates default SSL configuration
 */
function createDefaultSSLConfig(environment: DatabaseEnvironment): SSLConfig {
  return {
    enabled: parseEnvBoolean(process.env.DB_SSL_ENABLED, environment === 'production'),
    rejectUnauthorized: parseEnvBoolean(process.env.DB_SSL_REJECT_UNAUTHORIZED, environment === 'production'),
    ca: process.env.DB_SSL_CA,
    cert: process.env.DB_SSL_CERT,
    key: process.env.DB_SSL_KEY,
  };
}

/**
 * Creates default logging configuration
 */
function createDefaultLoggingConfig(environment: DatabaseEnvironment): DatabaseLoggingConfig {
  return {
    enabled: parseEnvBoolean(process.env.DB_LOGGING_ENABLED, environment === 'development'),
    level: (process.env.DB_LOG_LEVEL as any) || (environment === 'development' ? 'debug' : 'error'),
    logSlowQueries: parseEnvBoolean(process.env.DB_LOG_SLOW_QUERIES, environment !== 'production'),
    slowQueryThreshold: parseEnvInt(process.env.DB_SLOW_QUERY_THRESHOLD, 1000),
  };
}

/**
 * Creates default migration configuration
 */
function createDefaultMigrationConfig(environment: DatabaseEnvironment): MigrationConfig {
  return {
    autoMigrate: parseEnvBoolean(process.env.DB_AUTO_MIGRATE, environment === 'development'),
    directory: process.env.DB_MIGRATION_DIR || 'prisma/migrations',
    tableName: process.env.DB_MIGRATION_TABLE || '_prisma_migrations',
  };
}

// ===================================
// Configuration Builder
// ===================================

/**
 * Database Configuration Builder Class
 */
export class DatabaseConfigBuilder {
  private config: Partial<DatabaseConfig> = {};
  private logger: Logger;

  constructor() {
    this.logger = createLogger('DatabaseConfigBuilder');
  }

  /**
   * Sets database URL
   */
  url(url: string): this {
    this.config.url = url;
    return this;
  }

  /**
   * Sets database provider
   */
  provider(provider: DatabaseProvider): this {
    this.config.provider = provider;
    return this;
  }

  /**
   * Sets environment
   */
  environment(environment: DatabaseEnvironment): this {
    this.config.environment = environment;
    return this;
  }

  /**
   * Sets connection pool configuration
   */
  pool(pool: Partial<ConnectionPoolConfig>): this {
    this.config.pool = { ...this.config.pool, ...pool } as ConnectionPoolConfig;
    return this;
  }

  /**
   * Sets retry configuration
   */
  retry(retry: Partial<RetryConfig>): this {
    this.config.retry = { ...this.config.retry, ...retry } as RetryConfig;
    return this;
  }

  /**
   * Sets SSL configuration
   */
  ssl(ssl: Partial<SSLConfig>): this {
    this.config.ssl = { ...this.config.ssl, ...ssl } as SSLConfig;
    return this;
  }

  /**
   * Sets logging configuration
   */
  logging(logging: Partial<DatabaseLoggingConfig>): this {
    this.config.logging = { ...this.config.logging, ...logging } as DatabaseLoggingConfig;
    return this;
  }

  /**
   * Sets migration configuration
   */
  migration(migration: Partial<MigrationConfig>): this {
    this.config.migration = { ...this.config.migration, ...migration } as MigrationConfig;
    return this;
  }

  /**
   * Enables health checks
   */
  enableHealthCheck(interval: number = 30000): this {
    this.config.healthCheck = true;
    this.config.healthCheckInterval = interval;
    return this;
  }

  /**
   * Builds and validates the configuration
   */
  build(): DatabaseConfig {
    const environment = this.config.environment || getCurrentEnvironment();
    const url = this.config.url || this.getDefaultDatabaseUrl(environment);

    const finalConfig: DatabaseConfig = {
      url,
      provider: this.config.provider || getDatabaseProvider(url),
      environment,
      pool: this.config.pool || createDefaultPoolConfig(environment),
      retry: this.config.retry || createDefaultRetryConfig(environment),
      ssl: this.config.ssl || createDefaultSSLConfig(environment),
      logging: this.config.logging || createDefaultLoggingConfig(environment),
      migration: this.config.migration || createDefaultMigrationConfig(environment),
      healthCheck: this.config.healthCheck ?? true,
      healthCheckInterval: this.config.healthCheckInterval || 30000,
    };

    // Validate the final configuration
    validateDatabaseConfig(finalConfig);

    this.logger.info('Database configuration built successfully', {
      environment: finalConfig.environment,
      provider: finalConfig.provider,
      poolMax: finalConfig.pool.max,
      healthCheck: finalConfig.healthCheck,
    });

    return finalConfig;
  }

  /**
   * Gets default database URL for environment
   */
  private getDefaultDatabaseUrl(environment: DatabaseEnvironment): string {
    const envUrl = process.env.DATABASE_URL;
    if (envUrl) return envUrl;

    // Environment-specific defaults
    switch (environment) {
      case 'test':
        return process.env.TEST_DATABASE_URL || 'postgresql://postgres:test_password@localhost:5433/taskdb_test';
      case 'production':
        throw new DatabaseConfigError('DATABASE_URL must be set in production environment');
      case 'staging':
        return 'postgresql://postgres:staging_password@localhost:5432/taskdb_staging';
      default: // development
        return 'postgresql://postgres:dev_password_123@localhost:5432/taskdb_dev';
    }
  }
}

// ===================================
// Configuration Factory Functions
// ===================================

/**
 * Creates a new database configuration builder
 */
export function createDatabaseConfig(): DatabaseConfigBuilder {
  return new DatabaseConfigBuilder();
}

/**
 * Creates database configuration from environment variables
 */
export function createDatabaseConfigFromEnv(): DatabaseConfig {
  return new DatabaseConfigBuilder().build();
}

/**
 * Creates database configuration for specific environment
 */
export function createDatabaseConfigForEnvironment(environment: DatabaseEnvironment): DatabaseConfig {
  return new DatabaseConfigBuilder()
    .environment(environment)
    .build();
}

/**
 * Creates database configuration with custom URL
 */
export function createDatabaseConfigWithUrl(url: string): DatabaseConfig {
  return new DatabaseConfigBuilder()
    .url(url)
    .build();
}

// ===================================
// Configuration Utilities
// ===================================

/**
 * Database configuration manager singleton
 */
class DatabaseConfigManager {
  private static instance: DatabaseConfigManager;
  private config: DatabaseConfig | null = null;
  private logger: Logger;

  private constructor() {
    this.logger = createLogger('DatabaseConfigManager');
  }

  /**
   * Gets singleton instance
   */
  static getInstance(): DatabaseConfigManager {
    if (!DatabaseConfigManager.instance) {
      DatabaseConfigManager.instance = new DatabaseConfigManager();
    }
    return DatabaseConfigManager.instance;
  }

  /**
   * Initializes configuration
   */
  initialize(config?: DatabaseConfig): void {
    if (this.config) {
      this.logger.warn('Database configuration already initialized');
      return;
    }

    this.config = config || createDatabaseConfigFromEnv();
    this.logger.info('Database configuration initialized', {
      environment: this.config.environment,
      provider: this.config.provider,
    });
  }

  /**
   * Gets current configuration
   */
  getConfig(): DatabaseConfig {
    if (!this.config) {
      throw new DatabaseConfigError('Database configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Updates configuration
   */
  updateConfig(updates: Partial<DatabaseConfig>): void {
    if (!this.config) {
      throw new DatabaseConfigError('Database configuration not initialized. Call initialize() first.');
    }

    const newConfig = { ...this.config, ...updates };
    validateDatabaseConfig(newConfig);

    this.config = newConfig;
    this.logger.info('Database configuration updated');
  }

  /**
   * Resets configuration
   */
  reset(): void {
    this.config = null;
    this.logger.info('Database configuration reset');
  }
}

/**
 * Gets the database configuration manager instance
 */
export function getDatabaseConfigManager(): DatabaseConfigManager {
  return DatabaseConfigManager.getInstance();
}

/**
 * Gets the current database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  return getDatabaseConfigManager().getConfig();
}

/**
 * Initializes database configuration
 */
export function initializeDatabaseConfig(config?: DatabaseConfig): void {
  getDatabaseConfigManager().initialize(config);
}

// ===================================
// Default Export
// ===================================

/**
 * Default database configuration instance
 * Automatically created from environment variables
 */
let defaultConfig: DatabaseConfig | null = null;

/**
 * Gets or creates the default database configuration
 */
export function getDefaultDatabaseConfig(): DatabaseConfig {
  if (!defaultConfig) {
    defaultConfig = createDatabaseConfigFromEnv();
  }
  return defaultConfig;
}

/**
 * Export default configuration
 */
export default getDefaultDatabaseConfig;
