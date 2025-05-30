/**
 * ===================================
 * Database Connection Manager
 * ===================================
 * Purpose: Manage database connections with Prisma ORM
 * Author: Process Engineering Approach
 * Version: 1.0.0
 *
 * Features:
 * - Connection pool management
 * - Transaction support
 * - Error handling and retry logic
 * - Health check functionality
 * - Environment-specific configuration
 */

import { PrismaClient } from '@prisma/client';

// Node.js global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string;
      DB_MAX_CONNECTIONS?: string;
      DB_MIN_CONNECTIONS?: string;
      DB_CONNECTION_TIMEOUT?: string;
      DB_IDLE_TIMEOUT?: string;
      DB_RETRY_ATTEMPTS?: string;
      DB_RETRY_DELAY?: string;
      NODE_ENV?: string;
    }
  }
}

/**
 * Simple Logger implementation for database connection
 */
class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  info(message: string, ...args: any[]): void {
    console.log(`[INFO] [${this.context}] ${message}`, ...args);
  }

  success(message: string, ...args: any[]): void {
    console.log(`[SUCCESS] [${this.context}] ${message}`, ...args);
  }

  warning(message: string, ...args: any[]): void {
    console.warn(`[WARNING] [${this.context}] ${message}`, ...args);
  }

  error(message: string, error?: any): void {
    console.error(`[ERROR] [${this.context}] ${message}`, error);
  }

  debug(message: string, ...args: any[]): void {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] [${this.context}] ${message}`, ...args);
    }
  }
}

/**
 * Database connection configuration interface
 */
export interface DatabaseConfig {
  url: string;
  maxConnections: number;
  minConnections: number;
  connectionTimeout: number;
  idleTimeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableLogging: boolean;
}

/**
 * Transaction options interface
 */
export interface TransactionOptions {
  maxWait?: number;
  timeout?: number;
  isolationLevel?: 'ReadUncommitted' | 'ReadCommitted' | 'RepeatableRead' | 'Serializable';
}

/**
 * Database connection status
 */
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
  RECONNECTING = 'reconnecting'
}

/**
 * Database Connection Manager Class
 *
 * Manages database connections using Prisma ORM with advanced features:
 * - Connection pooling
 * - Transaction management
 * - Error handling and retry logic
 * - Health monitoring
 */
export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private prisma: PrismaClient | null = null;
  private config: DatabaseConfig;
  private status: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private retryCount: number = 0;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private readonly logger: Logger;

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config?: Partial<DatabaseConfig>) {
    this.logger = new Logger('DatabaseConnection');
    this.config = this.buildConfig(config);
    this.initializeConnection();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: Partial<DatabaseConfig>): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<DatabaseConfig>): DatabaseConfig {
    const defaultConfig: DatabaseConfig = {
      url: process.env.DATABASE_URL || 'postgresql://postgres:sxe-10Zz@localhost:5432/taskdb_dev',
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || '20'),
      minConnections: parseInt(process.env.DB_MIN_CONNECTIONS || '5'),
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '30000'),
      idleTimeout: parseInt(process.env.DB_IDLE_TIMEOUT || '10000'),
      retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3'),
      retryDelay: parseInt(process.env.DB_RETRY_DELAY || '1000'),
      enableLogging: process.env.NODE_ENV === 'development'
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Initialize database connection
   */
  private async initializeConnection(): Promise<void> {
    try {
      this.status = ConnectionStatus.CONNECTING;
      this.logger.info('Initializing database connection...');

      // Create Prisma client with configuration
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.url
          }
        },
        log: this.config.enableLogging
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
        errorFormat: 'pretty'
      });

      // Test connection
      await this.testConnection();

      this.status = ConnectionStatus.CONNECTED;
      this.retryCount = 0;
      this.logger.success('Database connection established successfully');

      // Start health check
      this.startHealthCheck();

    } catch (error) {
      this.status = ConnectionStatus.ERROR;
      this.logger.error('Failed to initialize database connection', error);
      await this.handleConnectionError(error);
    }
  }

  /**
   * Test database connection
   */
  private async testConnection(): Promise<void> {
    if (!this.prisma) {
      throw new Error('Prisma client not initialized');
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      this.logger.info('Database connection test successful');
    } catch (error) {
      this.logger.error('Database connection test failed', error);
      throw error;
    }
  }

  /**
   * Handle connection errors with retry logic
   */
  private async handleConnectionError(error: any): Promise<void> {
    this.retryCount++;

    if (this.retryCount <= this.config.retryAttempts) {
      this.status = ConnectionStatus.RECONNECTING;
      this.logger.warning(`Connection failed, retrying... (${this.retryCount}/${this.config.retryAttempts})`);

      await this.delay(this.config.retryDelay * this.retryCount);
      await this.initializeConnection();
    } else {
      this.status = ConnectionStatus.ERROR;
      this.logger.error('Max retry attempts reached. Database connection failed permanently.');
      throw new Error(`Database connection failed after ${this.config.retryAttempts} attempts: ${error.message}`);
    }
  }

  /**
   * Start health check monitoring
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.healthCheck();
      } catch (error) {
        this.logger.warning('Health check failed, attempting reconnection...');
        await this.reconnect();
      }
    }, 30000); // Check every 30 seconds
  }

  /**
   * Perform health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      if (!this.prisma) {
        throw new Error('Prisma client not available');
      }

      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Health check failed', error);
      return false;
    }
  }

  /**
   * Reconnect to database
   */
  public async reconnect(): Promise<void> {
    this.logger.info('Attempting to reconnect to database...');

    try {
      await this.disconnect();
      this.retryCount = 0;
      await this.initializeConnection();
    } catch (error) {
      this.logger.error('Reconnection failed', error);
      throw error;
    }
  }

  /**
   * Get Prisma client instance
   */
  public getClient(): PrismaClient {
    if (!this.prisma || this.status !== ConnectionStatus.CONNECTED) {
      throw new Error('Database connection not available');
    }
    return this.prisma;
  }

  /**
   * Execute transaction
   */
  public async transaction<T>(
    fn: (prisma: any) => Promise<T>,
    options?: TransactionOptions
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database connection not available');
    }

    try {
      this.logger.info('Starting database transaction');

      const transactionOptions: any = {
        maxWait: options?.maxWait || 5000,
        timeout: options?.timeout || 10000,
      };

      if (options?.isolationLevel) {
        transactionOptions.isolationLevel = options.isolationLevel;
      }

      const result = await this.prisma.$transaction(fn, transactionOptions);

      this.logger.info('Transaction completed successfully');
      return result;
    } catch (error) {
      this.logger.error('Transaction failed', error);
      throw error;
    }
  }

  /**
   * Execute raw query
   */
  public async executeRaw<T = any>(query: string, ...values: any[]): Promise<T> {
    if (!this.prisma) {
      throw new Error('Database connection not available');
    }

    try {
      this.logger.debug(`Executing raw query: ${query}`);
      return await this.prisma.$queryRawUnsafe(query, ...values);
    } catch (error) {
      this.logger.error('Raw query execution failed', error);
      throw error;
    }
  }

  /**
   * Get connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Get connection configuration
   */
  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }

  /**
   * Get connection statistics
   */
  public getStats(): {
    status: ConnectionStatus;
    retryCount: number;
    uptime: number;
    config: DatabaseConfig;
  } {
    return {
      status: this.status,
      retryCount: this.retryCount,
      uptime: process.uptime(),
      config: this.getConfig()
    };
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      if (this.prisma) {
        await this.prisma.$disconnect();
        this.prisma = null;
      }

      this.status = ConnectionStatus.DISCONNECTED;
      this.logger.info('Database connection closed');
    } catch (error) {
      this.logger.error('Error during disconnect', error);
      throw error;
    }
  }

  /**
   * Utility method for delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Export singleton instance getter
 */
export const getDatabase = (config?: Partial<DatabaseConfig>): DatabaseConnection => {
  return DatabaseConnection.getInstance(config);
};

/**
 * Export Prisma client getter for convenience
 */
export const getPrismaClient = (): PrismaClient => {
  return getDatabase().getClient();
};

/**
 * Export default instance
 */
export default DatabaseConnection;
