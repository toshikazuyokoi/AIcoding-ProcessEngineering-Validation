/**
 * User Repository Implementation
 * 
 * User-specific data access operations extending base repository functionality
 * Provides user authentication, email validation, and user management features
 * 
 * @fileoverview User repository class for user data access operations
 * @version 1.0.0
 * @since 2025-02-01
 */

import { User, UserRole, Prisma } from '@prisma/client';
import { BaseRepository, IBaseRepository, FindManyOptions, RepositoryConfig } from './base-repository';
import { NotFoundError, ValidationError } from '@/utils/error-handler';

/**
 * User creation data interface
 */
export interface CreateUserData {
  username: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * User update data interface
 */
export interface UpdateUserData {
  username?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * User search filters interface
 */
export interface UserSearchFilters {
  username?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * User repository interface extending base repository
 */
export interface IUserRepository extends IBaseRepository<User, CreateUserData, UpdateUserData> {
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findActiveUsers(options?: FindManyOptions): Promise<User[]>;
  findByRole(role: UserRole, options?: FindManyOptions): Promise<User[]>;
  searchUsers(filters: UserSearchFilters, options?: FindManyOptions): Promise<User[]>;
  deactivateUser(id: string): Promise<User>;
  activateUser(id: string): Promise<User>;
  changeUserRole(id: string, role: UserRole): Promise<User>;
  countByRole(role: UserRole): Promise<number>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
}

/**
 * User Repository Class
 * 
 * Provides user-specific data access operations
 * Extends BaseRepository with user authentication and management features
 */
export class UserRepository extends BaseRepository<User, CreateUserData, UpdateUserData> implements IUserRepository {
  
  /**
   * Constructor
   */
  constructor(config?: RepositoryConfig) {
    super('User', {
      enableCaching: true,
      cacheTimeout: 600, // 10 minutes for user data
      enableLogging: true,
      enableMetrics: true,
      ...config
    });
  }

  /**
   * Get Prisma user model
   */
  protected getModel() {
    return this.prisma.user;
  }

  /**
   * Get repository configuration (for testing)
   */
  public override getConfig() {
    return this.config;
  }

  /**
   * Get model name (for testing)
   */
  public override getModelName() {
    return this.modelName;
  }

  /**
   * Find user by email address
   */
  public async findByEmail(email: string): Promise<User | null> {
    try {
      this.logger.debug('Finding user by email', { email });

      if (!email || !this.isValidEmail(email)) {
        throw new ValidationError('Invalid email format');
      }

      const user = await this.getModel().findUnique({
        where: { email: email.toLowerCase() }
      });

      if (user) {
        this.logger.debug('User found by email', { userId: user.id, email });
      } else {
        this.logger.debug('User not found by email', { email });
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to find user by email', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find user by username
   */
  public async findByUsername(username: string): Promise<User | null> {
    try {
      this.logger.debug('Finding user by username', { username });

      if (!username || username.trim().length < 3) {
        throw new ValidationError('Username must be at least 3 characters long');
      }

      const user = await this.getModel().findFirst({
        where: { username: username.trim() }
      });

      if (user) {
        this.logger.debug('User found by username', { userId: user.id, username });
      } else {
        this.logger.debug('User not found by username', { username });
      }

      return user;
    } catch (error) {
      this.logger.error('Failed to find user by username', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find active users only
   */
  public async findActiveUsers(options: FindManyOptions = {}): Promise<User[]> {
    try {
      this.logger.debug('Finding active users', { options });

      const whereClause = {
        isActive: true,
        ...options.where
      };

      const users = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${users.length} active users`);
      return users;
    } catch (error) {
      this.logger.error('Failed to find active users', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find users by role
   */
  public async findByRole(role: UserRole, options: FindManyOptions = {}): Promise<User[]> {
    try {
      this.logger.debug('Finding users by role', { role, options });

      const whereClause = {
        role,
        ...options.where
      };

      const users = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${users.length} users with role ${role}`);
      return users;
    } catch (error) {
      this.logger.error('Failed to find users by role', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Search users with filters
   */
  public async searchUsers(filters: UserSearchFilters, options: FindManyOptions = {}): Promise<User[]> {
    try {
      this.logger.debug('Searching users with filters', { filters, options });

      const whereClause: Prisma.UserWhereInput = {
        ...options.where
      };

      // Apply filters
      if (filters.username) {
        whereClause.username = {
          contains: filters.username,
          mode: 'insensitive'
        };
      }

      if (filters.email) {
        whereClause.email = {
          contains: filters.email,
          mode: 'insensitive'
        };
      }

      if (filters.role !== undefined) {
        whereClause.role = filters.role;
      }

      if (filters.isActive !== undefined) {
        whereClause.isActive = filters.isActive;
      }

      if (filters.createdAfter || filters.createdBefore) {
        whereClause.createdAt = {};
        if (filters.createdAfter) {
          whereClause.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          whereClause.createdAt.lte = filters.createdBefore;
        }
      }

      const users = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${users.length} users matching search criteria`);
      return users;
    } catch (error) {
      this.logger.error('Failed to search users', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Deactivate user account
   */
  public async deactivateUser(id: string): Promise<User> {
    try {
      this.logger.debug('Deactivating user', { userId: id });

      const user = await this.update(id, { isActive: false });

      this.logger.info('User deactivated successfully', { userId: id });
      return user;
    } catch (error) {
      this.logger.error('Failed to deactivate user', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Activate user account
   */
  public async activateUser(id: string): Promise<User> {
    try {
      this.logger.debug('Activating user', { userId: id });

      const user = await this.update(id, { isActive: true });

      this.logger.info('User activated successfully', { userId: id });
      return user;
    } catch (error) {
      this.logger.error('Failed to activate user', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Change user role
   */
  public async changeUserRole(id: string, role: UserRole): Promise<User> {
    try {
      this.logger.debug('Changing user role', { userId: id, role });

      const user = await this.update(id, { role });

      this.logger.info('User role changed successfully', { userId: id, role });
      return user;
    } catch (error) {
      this.logger.error('Failed to change user role', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count users by role
   */
  public async countByRole(role: UserRole): Promise<number> {
    try {
      this.logger.debug('Counting users by role', { role });

      const count = await this.count({ role });

      this.logger.debug(`Found ${count} users with role ${role}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count users by role', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if user exists by email
   */
  public async existsByEmail(email: string): Promise<boolean> {
    try {
      if (!email || !this.isValidEmail(email)) {
        return false;
      }

      const user = await this.getModel().findUnique({
        where: { email: email.toLowerCase() },
        select: { id: true }
      });

      return user !== null;
    } catch (error) {
      this.logger.error('Failed to check user existence by email', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if user exists by username
   */
  public async existsByUsername(username: string): Promise<boolean> {
    try {
      if (!username || username.trim().length < 3) {
        return false;
      }

      const user = await this.getModel().findFirst({
        where: { username: username.trim() },
        select: { id: true }
      });

      return user !== null;
    } catch (error) {
      this.logger.error('Failed to check user existence by username', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Prepare create data with validation
   */
  protected override prepareCreateData(data: CreateUserData): any {
    // Validate required fields
    if (!data.username || data.username.trim().length < 3) {
      throw new ValidationError('Username must be at least 3 characters long');
    }

    if (!data.email || !this.isValidEmail(data.email)) {
      throw new ValidationError('Invalid email format');
    }

    if (!data.passwordHash || data.passwordHash.length < 10) {
      throw new ValidationError('Password hash is required and must be properly formatted');
    }

    return {
      username: data.username.trim(),
      email: data.email.toLowerCase(),
      passwordHash: data.passwordHash,
      role: data.role || UserRole.user,
      isActive: data.isActive !== undefined ? data.isActive : true
    };
  }

  /**
   * Prepare update data with validation
   */
  protected override prepareUpdateData(data: UpdateUserData): any {
    const cleanData = super.prepareUpdateData(data);

    // Validate username if provided
    if (cleanData.username !== undefined) {
      if (!cleanData.username || cleanData.username.trim().length < 3) {
        throw new ValidationError('Username must be at least 3 characters long');
      }
      cleanData.username = cleanData.username.trim();
    }

    // Validate email if provided
    if (cleanData.email !== undefined) {
      if (!cleanData.email || !this.isValidEmail(cleanData.email)) {
        throw new ValidationError('Invalid email format');
      }
      cleanData.email = cleanData.email.toLowerCase();
    }

    // Validate password hash if provided
    if (cleanData.passwordHash !== undefined) {
      if (!cleanData.passwordHash || cleanData.passwordHash.length < 10) {
        throw new ValidationError('Password hash must be properly formatted');
      }
    }

    return cleanData;
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    // More strict email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Additional checks for edge cases
    if (!email || email.length === 0) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    // Check for dots at start or end of local part
    const [localPart, domainPart] = email.split('@');
    if (!localPart || !domainPart) {
      return false;
    }

    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    // Check for dots at start or end of domain part
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
      return false;
    }

    return emailRegex.test(email);
  }
}

/**
 * Export default user repository
 */
export default UserRepository;
