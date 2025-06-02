/**
 * Base Repository Implementation
 * 
 * Generic repository pattern implementation providing common CRUD operations
 * with transaction support, error handling, and caching capabilities
 * 
 * @fileoverview Base repository class for all data access operations
 * @version 1.0.0
 * @since 2025-02-01
 */

import { PrismaClient } from '@prisma/client';
import { DatabaseConnection, getPrismaClient } from '@/utils/database-connection';
import { ErrorHandler, DatabaseError, NotFoundError, ValidationError } from '@/utils/error-handler';
import { Logger } from '@/utils/logger';

/**
 * Generic repository interface
 */
export interface IBaseRepository<T, CreateData, UpdateData> {
  create(data: CreateData): Promise<T>;
  findById(id: string): Promise<T | null>;
  findMany(options?: FindManyOptions): Promise<T[]>;
  update(id: string, data: UpdateData): Promise<T>;
  delete(id: string): Promise<void>;
  count(where?: any): Promise<number>;
  exists(id: string): Promise<boolean>;
}

/**
 * Find many options interface
 */
export interface FindManyOptions {
  where?: any;
  orderBy?: any;
  skip?: number;
  take?: number;
  include?: any;
  select?: any;
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
 * Repository configuration interface
 */
export interface RepositoryConfig {
  enableCaching?: boolean;
  cacheTimeout?: number;
  enableLogging?: boolean;
  enableMetrics?: boolean;
}

/**
 * Base Repository Class
 * 
 * Provides common CRUD operations and utilities for all repositories
 * Implements repository pattern with Prisma ORM integration
 */
export abstract class BaseRepository<T, CreateData, UpdateData> implements IBaseRepository<T, CreateData, UpdateData> {
  protected readonly prisma: PrismaClient;
  protected readonly logger: Logger;
  protected readonly errorHandler: ErrorHandler;
  protected readonly config: RepositoryConfig;
  protected readonly modelName: string;

  /**
   * Constructor
   */
  constructor(
    modelName: string,
    config: RepositoryConfig = {}
  ) {
    this.modelName = modelName;
    this.config = {
      enableCaching: false,
      cacheTimeout: 300, // 5 minutes
      enableLogging: true,
      enableMetrics: false,
      ...config
    };

    // Initialize dependencies
    this.prisma = getPrismaClient();
    this.logger = new Logger();
    this.errorHandler = new ErrorHandler();

    this.logger.info(`Initializing ${modelName} repository`);
  }

  /**
   * Get Prisma model delegate
   */
  protected abstract getModel(): any;

  /**
   * Create a new record
   */
  public async create(data: CreateData): Promise<T> {
    try {
      this.logger.debug(`Creating ${this.modelName}`, { data });

      const result = await this.getModel().create({
        data: this.prepareCreateData(data)
      });

      this.logger.info(`${this.modelName} created successfully`, { id: result.id });
      return result;
    } catch (error) {
      this.logger.error(`Failed to create ${this.modelName}`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find record by ID
   */
  public async findById(id: string): Promise<T | null> {
    try {
      this.logger.debug(`Finding ${this.modelName} by ID`, { id });

      const result = await this.getModel().findUnique({
        where: { id }
      });

      if (result) {
        this.logger.debug(`${this.modelName} found`, { id });
      } else {
        this.logger.debug(`${this.modelName} not found`, { id });
      }

      return result;
    } catch (error) {
      this.logger.error(`Failed to find ${this.modelName} by ID`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find multiple records
   */
  public async findMany(options: FindManyOptions = {}): Promise<T[]> {
    try {
      this.logger.debug(`Finding multiple ${this.modelName}`, { options });

      const result = await this.getModel().findMany({
        where: options.where,
        orderBy: options.orderBy,
        skip: options.skip,
        take: options.take,
        include: options.include,
        select: options.select
      });

      this.logger.debug(`Found ${result.length} ${this.modelName} records`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to find multiple ${this.modelName}`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Update record by ID
   */
  public async update(id: string, data: UpdateData): Promise<T> {
    try {
      this.logger.debug(`Updating ${this.modelName}`, { id, data });

      // Check if record exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new NotFoundError(`${this.modelName} with ID ${id} not found`);
      }

      const result = await this.getModel().update({
        where: { id },
        data: this.prepareUpdateData(data)
      });

      this.logger.info(`${this.modelName} updated successfully`, { id });
      return result;
    } catch (error) {
      this.logger.error(`Failed to update ${this.modelName}`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete record by ID
   */
  public async delete(id: string): Promise<void> {
    try {
      this.logger.debug(`Deleting ${this.modelName}`, { id });

      // Check if record exists
      const exists = await this.exists(id);
      if (!exists) {
        throw new NotFoundError(`${this.modelName} with ID ${id} not found`);
      }

      await this.getModel().delete({
        where: { id }
      });

      this.logger.info(`${this.modelName} deleted successfully`, { id });
    } catch (error) {
      this.logger.error(`Failed to delete ${this.modelName}`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count records
   */
  public async count(where?: any): Promise<number> {
    try {
      this.logger.debug(`Counting ${this.modelName}`, { where });

      const result = await this.getModel().count({
        where
      });

      this.logger.debug(`${this.modelName} count: ${result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to count ${this.modelName}`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if record exists
   */
  public async exists(id: string): Promise<boolean> {
    try {
      const result = await this.getModel().findUnique({
        where: { id },
        select: { id: true }
      });

      return result !== null;
    } catch (error) {
      this.logger.error(`Failed to check ${this.modelName} existence`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Execute transaction
   */
  public async transaction<R>(
    fn: (prisma: PrismaClient) => Promise<R>,
    options?: TransactionOptions
  ): Promise<R> {
    try {
      this.logger.debug(`Starting transaction for ${this.modelName}`);

      const database = DatabaseConnection.getInstance();
      const result = await database.transaction(fn, options);

      this.logger.info(`Transaction completed successfully for ${this.modelName}`);
      return result;
    } catch (error) {
      this.logger.error(`Transaction failed for ${this.modelName}`, error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Prepare create data (override in subclasses if needed)
   */
  protected prepareCreateData(data: CreateData): any {
    return data;
  }

  /**
   * Prepare update data (override in subclasses if needed)
   */
  protected prepareUpdateData(data: UpdateData): any {
    // Remove undefined values
    const cleanData: any = {};
    for (const [key, value] of Object.entries(data as any)) {
      if (value !== undefined) {
        cleanData[key] = value;
      }
    }
    return cleanData;
  }

  /**
   * Handle repository errors
   */
  protected handleError(error: any): Error {
    // Handle Prisma-specific errors
    if (error.code) {
      switch (error.code) {
        case 'P2002':
          return new ValidationError('Unique constraint violation', { field: error.meta?.target });
        case 'P2025':
          return new NotFoundError('Record not found');
        case 'P2003':
          return new ValidationError('Foreign key constraint violation');
        case 'P2014':
          return new ValidationError('Required relation missing');
        default:
          return new DatabaseError(`Database operation failed: ${error.message}`);
      }
    }

    // Handle custom application errors
    if (error instanceof NotFoundError || error instanceof ValidationError) {
      return error;
    }

    // Handle generic errors
    return new DatabaseError(`Repository operation failed: ${error.message}`);
  }

  /**
   * Get repository configuration
   */
  public getConfig(): RepositoryConfig {
    return { ...this.config };
  }

  /**
   * Get model name
   */
  public getModelName(): string {
    return this.modelName;
  }
}

/**
 * Export default base repository
 */
export default BaseRepository;
