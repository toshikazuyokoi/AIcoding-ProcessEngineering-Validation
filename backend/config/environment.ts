// ===================================
// Task Management System - Environment Configuration
// ===================================
// Generated for TSK-037-CFG-Environment
// Project: Task Management System
// Component: Environment Configuration Module
// Purpose: Centralized environment configuration management with validation and type safety

import { Logger, createLogger } from '../src/utils/logger';
import type { DatabaseEnvironment } from './database';

// ===================================
// Type Definitions
// ===================================

/**
 * Application environment types (unified with database and redis environments)
 */
export type Environment = DatabaseEnvironment;

/**
 * Log level types (string-based for configuration)
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Application configuration interface
 */
export interface AppConfig {
  /** Application environment */
  environment: Environment;
  /** Server port */
  port: number;
  /** Log level */
  logLevel: LogLevel;
  /** Timezone */
  timezone: string;
  /** CORS origin */
  corsOrigin: string;
  /** Debug mode enabled */
  debugEnabled: boolean;
}

/**
 * Database configuration interface
 */
export interface DatabaseConfig {
  /** Database URL */
  url: string;
  /** Test database URL */
  testUrl?: string | undefined;
  /** Maximum connections */
  maxConnections: number;
  /** Minimum connections */
  minConnections: number;
  /** Connection timeout */
  connectionTimeout: number;
  /** Idle timeout */
  idleTimeout: number;
  /** Retry attempts */
  retryAttempts: number;
  /** Retry delay */
  retryDelay: number;
}

/**
 * Redis configuration interface
 */
export interface RedisConfig {
  /** Redis URL */
  url?: string | undefined;
  /** Redis host */
  host: string;
  /** Redis port */
  port: number;
  /** Redis password */
  password?: string | undefined;
  /** Redis database */
  db: number;
  /** Cache default TTL */
  defaultTTL: number;
  /** Cache key prefix */
  keyPrefix: string;
}

/**
 * JWT configuration interface
 */
export interface JWTConfig {
  /** JWT secret */
  secret: string;
  /** Access token expiration */
  accessExpiresIn: string;
  /** Refresh token expiration */
  refreshExpiresIn: string;
  /** JWT algorithm */
  algorithm: string;
  /** JWT issuer */
  issuer: string;
  /** JWT audience */
  audience: string;
}

/**
 * Security configuration interface
 */
export interface SecurityConfig {
  /** Helmet enabled */
  helmetEnabled: boolean;
  /** Rate limiting enabled */
  rateLimitEnabled: boolean;
  /** Rate limit max requests */
  rateLimitMax: number;
  /** Rate limit window */
  rateLimitWindow: number;
  /** Bcrypt salt rounds */
  bcryptSaltRounds: number;
}

/**
 * File upload configuration interface
 */
export interface FileUploadConfig {
  /** Maximum file size */
  maxFileSize: number;
  /** Allowed file types */
  allowedFileTypes: string[];
  /** Upload directory */
  uploadDir: string;
  /** Temporary directory */
  tempDir: string;
}

/**
 * Email configuration interface
 */
export interface EmailConfig {
  /** SMTP host */
  smtpHost: string;
  /** SMTP port */
  smtpPort: number;
  /** SMTP secure */
  smtpSecure: boolean;
  /** SMTP user */
  smtpUser: string;
  /** SMTP password */
  smtpPass: string;
  /** From email */
  fromEmail: string;
  /** From name */
  fromName: string;
}

/**
 * External API configuration interface
 */
export interface ExternalAPIConfig {
  /** Google client ID */
  googleClientId?: string | undefined;
  /** Google client secret */
  googleClientSecret?: string | undefined;
  /** Webhook secret */
  webhookSecret?: string | undefined;
}

/**
 * Monitoring configuration interface
 */
export interface MonitoringConfig {
  /** APM enabled */
  apmEnabled: boolean;
  /** APM service name */
  apmServiceName: string;
  /** APM environment */
  apmEnvironment: string;
  /** Sentry DSN */
  sentryDSN?: string | undefined;
  /** Analytics enabled */
  analyticsEnabled: boolean;
  /** Analytics API key */
  analyticsApiKey?: string | undefined;
}

/**
 * Development configuration interface
 */
export interface DevelopmentConfig {
  /** Debug enabled */
  debugEnabled: boolean;
  /** Debug SQL */
  debugSQL: boolean;
  /** Debug cache */
  debugCache: boolean;
  /** Seed enabled */
  seedEnabled: boolean;
  /** Seed admin email */
  seedAdminEmail: string;
  /** Seed admin password */
  seedAdminPassword: string;
}

/**
 * Production configuration interface
 */
export interface ProductionConfig {
  /** SSL enabled */
  sslEnabled: boolean;
  /** SSL certificate path */
  sslCertPath?: string | undefined;
  /** SSL key path */
  sslKeyPath?: string | undefined;
  /** Session secret */
  sessionSecret?: string | undefined;
  /** Session timeout */
  sessionTimeout: number;
  /** Health check enabled */
  healthCheckEnabled: boolean;
  /** Health check endpoint */
  healthCheckEndpoint: string;
  /** Backup enabled */
  backupEnabled: boolean;
  /** Backup schedule */
  backupSchedule?: string | undefined;
  /** Backup retention days */
  backupRetentionDays: number;
}

/**
 * Container configuration interface
 */
export interface ContainerConfig {
  /** Container name */
  containerName: string;
  /** Container restart policy */
  containerRestartPolicy: string;
  /** Compose project name */
  composeProjectName: string;
}

/**
 * Complete environment configuration interface
 */
export interface EnvironmentConfig {
  /** Application configuration */
  app: AppConfig;
  /** Database configuration */
  database: DatabaseConfig;
  /** Redis configuration */
  redis: RedisConfig;
  /** JWT configuration */
  jwt: JWTConfig;
  /** Security configuration */
  security: SecurityConfig;
  /** File upload configuration */
  fileUpload: FileUploadConfig;
  /** Email configuration */
  email: EmailConfig;
  /** External API configuration */
  externalAPI: ExternalAPIConfig;
  /** Monitoring configuration */
  monitoring: MonitoringConfig;
  /** Development configuration */
  development: DevelopmentConfig;
  /** Production configuration */
  production: ProductionConfig;
  /** Container configuration */
  container: ContainerConfig;
}

// ===================================
// Configuration Validation
// ===================================

/**
 * Environment configuration validation error
 */
export class EnvironmentConfigError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'EnvironmentConfigError';
  }
}

/**
 * Validates application configuration
 */
function validateAppConfig(config: AppConfig): void {
  if (!config.environment) {
    throw new EnvironmentConfigError('Environment is required', 'app.environment');
  }

  if (config.port <= 0 || config.port > 65535) {
    throw new EnvironmentConfigError('Port must be between 1 and 65535', 'app.port');
  }

  if (!config.logLevel) {
    throw new EnvironmentConfigError('Log level is required', 'app.logLevel');
  }

  if (!config.corsOrigin) {
    throw new EnvironmentConfigError('CORS origin is required', 'app.corsOrigin');
  }
}

/**
 * Validates database configuration
 */
function validateDatabaseConfig(config: DatabaseConfig): void {
  if (!config.url) {
    throw new EnvironmentConfigError('Database URL is required', 'database.url');
  }

  if (config.maxConnections <= 0) {
    throw new EnvironmentConfigError('Max connections must be greater than 0', 'database.maxConnections');
  }

  if (config.minConnections < 0) {
    throw new EnvironmentConfigError('Min connections must be greater than or equal to 0', 'database.minConnections');
  }

  if (config.minConnections > config.maxConnections) {
    throw new EnvironmentConfigError('Min connections cannot exceed max connections', 'database.minConnections');
  }
}

/**
 * Validates JWT configuration
 */
function validateJWTConfig(config: JWTConfig): void {
  if (!config.secret) {
    throw new EnvironmentConfigError('JWT secret is required', 'jwt.secret');
  }

  if (config.secret.length < 32) {
    throw new EnvironmentConfigError('JWT secret must be at least 32 characters', 'jwt.secret');
  }

  if (!config.accessExpiresIn) {
    throw new EnvironmentConfigError('Access token expiration is required', 'jwt.accessExpiresIn');
  }

  if (!config.refreshExpiresIn) {
    throw new EnvironmentConfigError('Refresh token expiration is required', 'jwt.refreshExpiresIn');
  }
}

/**
 * Validates complete environment configuration
 */
function validateEnvironmentConfig(config: EnvironmentConfig): void {
  validateAppConfig(config.app);
  validateDatabaseConfig(config.database);
  validateJWTConfig(config.jwt);

  if (config.security.bcryptSaltRounds < 8 || config.security.bcryptSaltRounds > 15) {
    throw new EnvironmentConfigError('Bcrypt salt rounds must be between 8 and 15', 'security.bcryptSaltRounds');
  }

  if (config.fileUpload.maxFileSize <= 0) {
    throw new EnvironmentConfigError('Max file size must be greater than 0', 'fileUpload.maxFileSize');
  }

  if (config.app.environment === 'production' && !config.production.sslEnabled) {
    console.warn('Warning: SSL is not enabled in production environment');
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
 * Safely parses string array from environment variable
 */
function parseEnvStringArray(value: string | undefined, defaultValue: string[]): string[] {
  if (!value) return defaultValue;
  return value.split(',').map(item => item.trim()).filter(item => item.length > 0);
}

/**
 * Gets current environment
 */
function getCurrentEnvironment(): Environment {
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
 * Gets log level from environment
 */
function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL?.toLowerCase();
  switch (level) {
    case 'debug':
      return 'debug';
    case 'info':
      return 'info';
    case 'warn':
      return 'warn';
    case 'error':
      return 'error';
    default:
      return 'debug';
  }
}

// ===================================
// Default Configuration Factory
// ===================================

/**
 * Creates default application configuration
 */
function createDefaultAppConfig(): AppConfig {
  const environment = getCurrentEnvironment();

  return {
    environment,
    port: parseEnvInt(process.env.PORT, 8000),
    logLevel: getLogLevel(),
    timezone: process.env.TZ || 'Asia/Tokyo',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    debugEnabled: parseEnvBoolean(process.env.DEBUG_ENABLED, environment === 'development'),
  };
}

/**
 * Creates default database configuration
 */
function createDefaultDatabaseConfig(environment: Environment): DatabaseConfig {
  const baseConfig = {
    connectionTimeout: parseEnvInt(process.env.DB_CONNECTION_TIMEOUT, 30000),
    idleTimeout: parseEnvInt(process.env.DB_IDLE_TIMEOUT, 10000),
    retryAttempts: parseEnvInt(process.env.DB_RETRY_ATTEMPTS, 3),
    retryDelay: parseEnvInt(process.env.DB_RETRY_DELAY, 1000),
  };

  switch (environment) {
    case 'production':
      return {
        ...baseConfig,
        url: process.env.DATABASE_URL || (() => {
          throw new EnvironmentConfigError('DATABASE_URL must be set in production environment');
        })(),
        testUrl: process.env.TEST_DATABASE_URL,
        maxConnections: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 50),
        minConnections: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 10),
      };
    case 'test':
      return {
        ...baseConfig,
        url: process.env.TEST_DATABASE_URL || 'postgresql://postgres:test_password@localhost:5433/taskdb_test',
        testUrl: process.env.TEST_DATABASE_URL,
        maxConnections: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 5),
        minConnections: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 1),
        connectionTimeout: 5000,
        idleTimeout: 1000,
      };
    case 'staging':
      return {
        ...baseConfig,
        url: process.env.DATABASE_URL || 'postgresql://postgres:staging_password@localhost:5432/taskdb_staging',
        testUrl: process.env.TEST_DATABASE_URL,
        maxConnections: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 30),
        minConnections: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 5),
      };
    default: // development
      return {
        ...baseConfig,
        url: process.env.DATABASE_URL || 'postgresql://postgres:dev_password_123@localhost:5432/taskdb_dev',
        testUrl: process.env.TEST_DATABASE_URL,
        maxConnections: parseEnvInt(process.env.DB_MAX_CONNECTIONS, 20),
        minConnections: parseEnvInt(process.env.DB_MIN_CONNECTIONS, 5),
      };
  }
}

/**
 * Creates default Redis configuration
 */
function createDefaultRedisConfig(): RedisConfig {
  return {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseEnvInt(process.env.REDIS_PORT, 6379),
    password: process.env.REDIS_PASSWORD,
    db: parseEnvInt(process.env.REDIS_DB, 0),
    defaultTTL: parseEnvInt(process.env.CACHE_DEFAULT_TTL, 3600),
    keyPrefix: process.env.CACHE_KEY_PREFIX || 'task-mgmt:',
  };
}

/**
 * Creates default JWT configuration
 */
function createDefaultJWTConfig(): JWTConfig {
  return {
    secret: process.env.JWT_SECRET || 'dev_jwt_secret_key_for_development_only_change_in_production',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
    issuer: process.env.JWT_ISSUER || 'task-management-system',
    audience: process.env.JWT_AUDIENCE || 'task-management-users',
  };
}

/**
 * Creates default security configuration
 */
function createDefaultSecurityConfig(): SecurityConfig {
  return {
    helmetEnabled: parseEnvBoolean(process.env.HELMET_ENABLED, true),
    rateLimitEnabled: parseEnvBoolean(process.env.RATE_LIMIT_ENABLED, true),
    rateLimitMax: parseEnvInt(process.env.RATE_LIMIT_MAX, 100),
    rateLimitWindow: parseEnvInt(process.env.RATE_LIMIT_WINDOW, 900000),
    bcryptSaltRounds: parseEnvInt(process.env.BCRYPT_SALT_ROUNDS, 10),
  };
}

/**
 * Creates default file upload configuration
 */
function createDefaultFileUploadConfig(): FileUploadConfig {
  return {
    maxFileSize: parseEnvInt(process.env.MAX_FILE_SIZE, 10485760), // 10MB
    allowedFileTypes: parseEnvStringArray(
      process.env.ALLOWED_FILE_TYPES,
      ['image/jpeg', 'image/png', 'image/gif', 'application/pdf']
    ),
    uploadDir: process.env.UPLOAD_DIR || 'uploads',
    tempDir: process.env.TEMP_DIR || 'temp',
  };
}

/**
 * Creates default email configuration
 */
function createDefaultEmailConfig(): EmailConfig {
  return {
    smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
    smtpPort: parseEnvInt(process.env.SMTP_PORT, 587),
    smtpSecure: parseEnvBoolean(process.env.SMTP_SECURE, false),
    smtpUser: process.env.SMTP_USER || 'your-email@gmail.com',
    smtpPass: process.env.SMTP_PASS || 'your-app-password',
    fromEmail: process.env.FROM_EMAIL || 'noreply@taskmanagement.com',
    fromName: process.env.FROM_NAME || 'Task Management System',
  };
}

/**
 * Creates default external API configuration
 */
function createDefaultExternalAPIConfig(): ExternalAPIConfig {
  return {
    googleClientId: process.env.GOOGLE_CLIENT_ID,
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
    webhookSecret: process.env.WEBHOOK_SECRET,
  };
}

/**
 * Creates default monitoring configuration
 */
function createDefaultMonitoringConfig(environment: Environment): MonitoringConfig {
  return {
    apmEnabled: parseEnvBoolean(process.env.APM_ENABLED, false),
    apmServiceName: process.env.APM_SERVICE_NAME || 'task-management-backend',
    apmEnvironment: process.env.APM_ENVIRONMENT || environment,
    sentryDSN: process.env.SENTRY_DSN,
    analyticsEnabled: parseEnvBoolean(process.env.ANALYTICS_ENABLED, false),
    analyticsApiKey: process.env.ANALYTICS_API_KEY,
  };
}

/**
 * Creates default development configuration
 */
function createDefaultDevelopmentConfig(): DevelopmentConfig {
  return {
    debugEnabled: parseEnvBoolean(process.env.DEBUG_ENABLED, true),
    debugSQL: parseEnvBoolean(process.env.DEBUG_SQL, false),
    debugCache: parseEnvBoolean(process.env.DEBUG_CACHE, false),
    seedEnabled: parseEnvBoolean(process.env.SEED_ENABLED, true),
    seedAdminEmail: process.env.SEED_ADMIN_EMAIL || 'admin@taskmanagement.com',
    seedAdminPassword: process.env.SEED_ADMIN_PASSWORD || 'admin123',
  };
}

/**
 * Creates default production configuration
 */
function createDefaultProductionConfig(): ProductionConfig {
  return {
    sslEnabled: parseEnvBoolean(process.env.SSL_ENABLED, false),
    sslCertPath: process.env.SSL_CERT_PATH,
    sslKeyPath: process.env.SSL_KEY_PATH,
    sessionSecret: process.env.SESSION_SECRET,
    sessionTimeout: parseEnvInt(process.env.SESSION_TIMEOUT, 3600000),
    healthCheckEnabled: parseEnvBoolean(process.env.HEALTH_CHECK_ENABLED, true),
    healthCheckEndpoint: process.env.HEALTH_CHECK_ENDPOINT || '/health',
    backupEnabled: parseEnvBoolean(process.env.BACKUP_ENABLED, false),
    backupSchedule: process.env.BACKUP_SCHEDULE,
    backupRetentionDays: parseEnvInt(process.env.BACKUP_RETENTION_DAYS, 30),
  };
}

/**
 * Creates default container configuration
 */
function createDefaultContainerConfig(): ContainerConfig {
  return {
    containerName: process.env.CONTAINER_NAME || 'task-management-backend',
    containerRestartPolicy: process.env.CONTAINER_RESTART_POLICY || 'unless-stopped',
    composeProjectName: process.env.COMPOSE_PROJECT_NAME || 'task-management',
  };
}

// ===================================
// Configuration Builder
// ===================================

/**
 * Environment Configuration Builder Class
 */
export class EnvironmentConfigBuilder {
  private config: Partial<EnvironmentConfig> = {};
  private logger: Logger;

  constructor() {
    this.logger = createLogger('EnvironmentConfigBuilder');
  }

  /**
   * Sets application configuration
   */
  app(app: Partial<AppConfig>): this {
    this.config.app = { ...this.config.app, ...app } as AppConfig;
    return this;
  }

  /**
   * Sets database configuration
   */
  database(database: Partial<DatabaseConfig>): this {
    this.config.database = { ...this.config.database, ...database } as DatabaseConfig;
    return this;
  }

  /**
   * Sets Redis configuration
   */
  redis(redis: Partial<RedisConfig>): this {
    this.config.redis = { ...this.config.redis, ...redis } as RedisConfig;
    return this;
  }

  /**
   * Sets JWT configuration
   */
  jwt(jwt: Partial<JWTConfig>): this {
    this.config.jwt = { ...this.config.jwt, ...jwt } as JWTConfig;
    return this;
  }

  /**
   * Sets security configuration
   */
  security(security: Partial<SecurityConfig>): this {
    this.config.security = { ...this.config.security, ...security } as SecurityConfig;
    return this;
  }

  /**
   * Sets file upload configuration
   */
  fileUpload(fileUpload: Partial<FileUploadConfig>): this {
    this.config.fileUpload = { ...this.config.fileUpload, ...fileUpload } as FileUploadConfig;
    return this;
  }

  /**
   * Sets email configuration
   */
  email(email: Partial<EmailConfig>): this {
    this.config.email = { ...this.config.email, ...email } as EmailConfig;
    return this;
  }

  /**
   * Sets external API configuration
   */
  externalAPI(externalAPI: Partial<ExternalAPIConfig>): this {
    this.config.externalAPI = { ...this.config.externalAPI, ...externalAPI } as ExternalAPIConfig;
    return this;
  }

  /**
   * Sets monitoring configuration
   */
  monitoring(monitoring: Partial<MonitoringConfig>): this {
    this.config.monitoring = { ...this.config.monitoring, ...monitoring } as MonitoringConfig;
    return this;
  }

  /**
   * Sets development configuration
   */
  development(development: Partial<DevelopmentConfig>): this {
    this.config.development = { ...this.config.development, ...development } as DevelopmentConfig;
    return this;
  }

  /**
   * Sets production configuration
   */
  production(production: Partial<ProductionConfig>): this {
    this.config.production = { ...this.config.production, ...production } as ProductionConfig;
    return this;
  }

  /**
   * Sets container configuration
   */
  container(container: Partial<ContainerConfig>): this {
    this.config.container = { ...this.config.container, ...container } as ContainerConfig;
    return this;
  }

  /**
   * Builds and validates the configuration
   */
  build(): EnvironmentConfig {
    const environment = this.config.app?.environment || getCurrentEnvironment();

    const finalConfig: EnvironmentConfig = {
      app: this.config.app || createDefaultAppConfig(),
      database: this.config.database || createDefaultDatabaseConfig(environment),
      redis: this.config.redis || createDefaultRedisConfig(),
      jwt: this.config.jwt || createDefaultJWTConfig(),
      security: this.config.security || createDefaultSecurityConfig(),
      fileUpload: this.config.fileUpload || createDefaultFileUploadConfig(),
      email: this.config.email || createDefaultEmailConfig(),
      externalAPI: this.config.externalAPI || createDefaultExternalAPIConfig(),
      monitoring: this.config.monitoring || createDefaultMonitoringConfig(environment),
      development: this.config.development || createDefaultDevelopmentConfig(),
      production: this.config.production || createDefaultProductionConfig(),
      container: this.config.container || createDefaultContainerConfig(),
    };

    // Validate the final configuration
    validateEnvironmentConfig(finalConfig);

    this.logger.info('Environment configuration built successfully', {
      environment: finalConfig.app.environment,
      port: finalConfig.app.port,
      logLevel: finalConfig.app.logLevel,
      debugEnabled: finalConfig.app.debugEnabled,
    });

    return finalConfig;
  }
}

// ===================================
// Configuration Manager
// ===================================

/**
 * Environment Configuration Manager (Singleton)
 */
export class EnvironmentConfigManager {
  private static instance: EnvironmentConfigManager;
  private config: EnvironmentConfig | null = null;
  private logger: Logger;

  private constructor() {
    this.logger = createLogger('EnvironmentConfigManager');
  }

  /**
   * Gets the singleton instance
   */
  static getInstance(): EnvironmentConfigManager {
    if (!EnvironmentConfigManager.instance) {
      EnvironmentConfigManager.instance = new EnvironmentConfigManager();
    }
    return EnvironmentConfigManager.instance;
  }

  /**
   * Initializes the configuration
   */
  initialize(config: EnvironmentConfig): void {
    this.config = config;
    this.logger.info('Environment configuration initialized', {
      environment: config.app.environment,
      port: config.app.port,
    });
  }

  /**
   * Gets the current configuration
   */
  getConfig(): EnvironmentConfig {
    if (!this.config) {
      throw new EnvironmentConfigError('Environment configuration not initialized. Call initialize() first.');
    }
    return this.config;
  }

  /**
   * Gets application configuration
   */
  getAppConfig(): AppConfig {
    return this.getConfig().app;
  }

  /**
   * Gets database configuration
   */
  getDatabaseConfig(): DatabaseConfig {
    return this.getConfig().database;
  }

  /**
   * Gets Redis configuration
   */
  getRedisConfig(): RedisConfig {
    return this.getConfig().redis;
  }

  /**
   * Gets JWT configuration
   */
  getJWTConfig(): JWTConfig {
    return this.getConfig().jwt;
  }

  /**
   * Gets security configuration
   */
  getSecurityConfig(): SecurityConfig {
    return this.getConfig().security;
  }

  /**
   * Updates the configuration
   */
  updateConfig(updates: Partial<EnvironmentConfig>): void {
    if (!this.config) {
      throw new EnvironmentConfigError('Environment configuration not initialized. Call initialize() first.');
    }

    this.config = { ...this.config, ...updates };
    validateEnvironmentConfig(this.config);

    this.logger.info('Environment configuration updated', {
      updatedSections: Object.keys(updates),
    });
  }

  /**
   * Resets the configuration
   */
  reset(): void {
    this.config = null;
    this.logger.info('Environment configuration reset');
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
 * Creates an environment configuration from environment variables
 */
export function createEnvironmentConfigFromEnv(): EnvironmentConfig {
  return new EnvironmentConfigBuilder().build();
}

/**
 * Creates an environment configuration for a specific environment
 */
export function createEnvironmentConfigForEnvironment(environment: Environment): EnvironmentConfig {
  // Temporarily set NODE_ENV for configuration creation
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = environment;

  try {
    const config = new EnvironmentConfigBuilder().build();
    return config;
  } finally {
    // Restore original NODE_ENV
    if (originalEnv !== undefined) {
      process.env.NODE_ENV = originalEnv;
    } else {
      delete process.env.NODE_ENV;
    }
  }
}

/**
 * Gets the default environment configuration
 */
export function getDefaultEnvironmentConfig(): EnvironmentConfig {
  return createEnvironmentConfigFromEnv();
}

/**
 * Gets the environment configuration manager instance
 */
export function getEnvironmentConfigManager(): EnvironmentConfigManager {
  return EnvironmentConfigManager.getInstance();
}

/**
 * Initializes environment configuration from environment variables
 */
export function initializeEnvironmentConfig(): EnvironmentConfig {
  const config = createEnvironmentConfigFromEnv();
  const manager = getEnvironmentConfigManager();
  manager.initialize(config);
  return config;
}

/**
 * Creates an environment configuration with custom settings
 */
export function createEnvironmentConfig(options: {
  app?: Partial<AppConfig>;
  database?: Partial<DatabaseConfig>;
  redis?: Partial<RedisConfig>;
  jwt?: Partial<JWTConfig>;
  security?: Partial<SecurityConfig>;
  fileUpload?: Partial<FileUploadConfig>;
  email?: Partial<EmailConfig>;
  externalAPI?: Partial<ExternalAPIConfig>;
  monitoring?: Partial<MonitoringConfig>;
  development?: Partial<DevelopmentConfig>;
  production?: Partial<ProductionConfig>;
  container?: Partial<ContainerConfig>;
}): EnvironmentConfig {
  const builder = new EnvironmentConfigBuilder();

  if (options.app) builder.app(options.app);
  if (options.database) builder.database(options.database);
  if (options.redis) builder.redis(options.redis);
  if (options.jwt) builder.jwt(options.jwt);
  if (options.security) builder.security(options.security);
  if (options.fileUpload) builder.fileUpload(options.fileUpload);
  if (options.email) builder.email(options.email);
  if (options.externalAPI) builder.externalAPI(options.externalAPI);
  if (options.monitoring) builder.monitoring(options.monitoring);
  if (options.development) builder.development(options.development);
  if (options.production) builder.production(options.production);
  if (options.container) builder.container(options.container);

  return builder.build();
}
