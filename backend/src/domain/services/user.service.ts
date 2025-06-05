/**
 * ===================================
 * User Domain Service
 * ===================================
 * Purpose: User business logic and domain operations
 * Features:
 * - User management operations
 * - Profile management
 * - Permission and role management
 * - Business rule enforcement
 * - User validation and verification
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { User, UserCreationData, UserUpdateData, UserProfileData, UserRole } from '../entities/user.entity';
import { EntityValidationError, EntityNotFoundError, EntityConflictError } from '../entities/base.entity';

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
 * User creation request interface
 */
export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * User update request interface
 */
export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * User statistics interface
 */
export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentlyCreated: number;
}

/**
 * Password validation result interface
 */
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
}

/**
 * User repository interface (dependency injection)
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  findMany(filters?: UserSearchFilters): Promise<User[]>;
  create(data: UserCreationData): Promise<User>;
  update(id: string, data: UserUpdateData): Promise<User>;
  delete(id: string): Promise<void>;
  count(filters?: UserSearchFilters): Promise<number>;
  existsByEmail(email: string): Promise<boolean>;
  existsByUsername(username: string): Promise<boolean>;
}

/**
 * Password hasher interface (dependency injection)
 */
export interface IPasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
}

/**
 * User Domain Service Class
 * 
 * Handles user-related business logic and domain operations.
 * Coordinates between entities and repositories while enforcing business rules.
 */
export class UserService {
  private userRepository: IUserRepository;
  private passwordHasher: IPasswordHasher;

  /**
   * Constructor for UserService
   * 
   * @param userRepository - User repository for data access
   * @param passwordHasher - Password hashing service
   */
  constructor(userRepository: IUserRepository, passwordHasher: IPasswordHasher) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
  }

  /**
   * Create a new user
   * 
   * @param request - User creation request
   * @returns {Promise<User>} Created user entity
   * @throws {EntityValidationError} When validation fails
   * @throws {EntityConflictError} When email or username already exists
   */
  public async createUser(request: CreateUserRequest): Promise<User> {
    // Validate password strength
    const passwordValidation = this.validatePassword(request.password);
    if (!passwordValidation.isValid) {
      throw new EntityValidationError(
        `Password validation failed: ${passwordValidation.errors.join(', ')}`,
        'User',
        'new'
      );
    }

    // Check for existing email
    const existingUserByEmail = await this.userRepository.findByEmail(request.email);
    if (existingUserByEmail) {
      throw new EntityConflictError(
        'A user with this email already exists',
        'User',
        existingUserByEmail.id
      );
    }

    // Check for existing username
    const existingUserByUsername = await this.userRepository.findByUsername(request.username);
    if (existingUserByUsername) {
      throw new EntityConflictError(
        'A user with this username already exists',
        'User',
        existingUserByUsername.id
      );
    }

    // Hash password
    const passwordHash = await this.passwordHasher.hash(request.password);

    // Create user data
    const userData: UserCreationData = {
      username: request.username,
      email: request.email,
      passwordHash,
      role: request.role || UserRole.USER,
      isActive: request.isActive !== undefined ? request.isActive : true
    };

    // Create and return user
    return await this.userRepository.create(userData);
  }

  /**
   * Get user by ID
   * 
   * @param id - User ID
   * @returns {Promise<User>} User entity
   * @throws {EntityNotFoundError} When user not found
   */
  public async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new EntityNotFoundError('User', id);
    }
    return user;
  }

  /**
   * Get user by email
   * 
   * @param email - User email
   * @returns {Promise<User | null>} User entity or null
   */
  public async getUserByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findByEmail(email);
  }

  /**
   * Get user by username
   * 
   * @param username - Username
   * @returns {Promise<User | null>} User entity or null
   */
  public async getUserByUsername(username: string): Promise<User | null> {
    return await this.userRepository.findByUsername(username);
  }

  /**
   * Update user information
   * 
   * @param id - User ID
   * @param request - Update request
   * @returns {Promise<User>} Updated user entity
   * @throws {EntityNotFoundError} When user not found
   * @throws {EntityConflictError} When email or username conflict
   */
  public async updateUser(id: string, request: UpdateUserRequest): Promise<User> {
    // Get existing user
    const existingUser = await this.getUserById(id);

    // Check for email conflicts (if email is being updated)
    if (request.email && request.email !== existingUser.email) {
      const userWithEmail = await this.userRepository.findByEmail(request.email);
      if (userWithEmail && userWithEmail.id !== id) {
        throw new EntityConflictError(
          'A user with this email already exists',
          'User',
          userWithEmail.id
        );
      }
    }

    // Check for username conflicts (if username is being updated)
    if (request.username && request.username !== existingUser.username) {
      const userWithUsername = await this.userRepository.findByUsername(request.username);
      if (userWithUsername && userWithUsername.id !== id) {
        throw new EntityConflictError(
          'A user with this username already exists',
          'User',
          userWithUsername.id
        );
      }
    }

    // Prepare update data
    const updateData: UserUpdateData = {};

    if (request.username !== undefined) {
      updateData.username = request.username;
    }

    if (request.email !== undefined) {
      updateData.email = request.email;
    }

    if (request.password !== undefined) {
      // Validate new password
      const passwordValidation = this.validatePassword(request.password);
      if (!passwordValidation.isValid) {
        throw new EntityValidationError(
          `Password validation failed: ${passwordValidation.errors.join(', ')}`,
          'User',
          id
        );
      }
      updateData.passwordHash = await this.passwordHasher.hash(request.password);
    }

    if (request.role !== undefined) {
      updateData.role = request.role;
    }

    if (request.isActive !== undefined) {
      updateData.isActive = request.isActive;
    }

    // Update and return user
    return await this.userRepository.update(id, updateData);
  }

  /**
   * Delete user
   * 
   * @param id - User ID
   * @throws {EntityNotFoundError} When user not found
   */
  public async deleteUser(id: string): Promise<void> {
    // Verify user exists
    await this.getUserById(id);
    
    // Delete user
    await this.userRepository.delete(id);
  }

  /**
   * Search users with filters
   * 
   * @param filters - Search filters
   * @returns {Promise<User[]>} Array of matching users
   */
  public async searchUsers(filters: UserSearchFilters = {}): Promise<User[]> {
    return await this.userRepository.findMany(filters);
  }

  /**
   * Get user statistics
   *
   * @returns {Promise<UserStatistics>} User statistics
   */
  public async getUserStatistics(): Promise<UserStatistics> {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ isActive: true });
    const adminUsers = await this.userRepository.count({ role: UserRole.ADMIN });

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCreated = await this.userRepository.count({ createdAfter: thirtyDaysAgo });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      recentlyCreated
    };
  }

  /**
   * Promote user to admin role
   *
   * @param id - User ID
   * @returns {Promise<User>} Updated user entity
   * @throws {EntityNotFoundError} When user not found
   * @throws {EntityValidationError} When user cannot be promoted
   */
  public async promoteToAdmin(id: string): Promise<User> {
    const user = await this.getUserById(id);

    if (!user.isActive) {
      throw new EntityValidationError(
        'Cannot promote inactive user to admin',
        'User',
        id
      );
    }

    if (user.role === UserRole.ADMIN) {
      throw new EntityValidationError(
        'User is already an admin',
        'User',
        id
      );
    }

    return await this.userRepository.update(id, { role: UserRole.ADMIN });
  }

  /**
   * Demote admin to regular user
   *
   * @param id - User ID
   * @returns {Promise<User>} Updated user entity
   * @throws {EntityNotFoundError} When user not found
   */
  public async demoteToUser(id: string): Promise<User> {
    const user = await this.getUserById(id);

    if (user.role === UserRole.USER) {
      throw new EntityValidationError(
        'User is already a regular user',
        'User',
        id
      );
    }

    return await this.userRepository.update(id, { role: UserRole.USER });
  }

  /**
   * Activate user account
   *
   * @param id - User ID
   * @returns {Promise<User>} Updated user entity
   * @throws {EntityNotFoundError} When user not found
   */
  public async activateUser(id: string): Promise<User> {
    const user = await this.getUserById(id);

    if (user.isActive) {
      throw new EntityValidationError(
        'User is already active',
        'User',
        id
      );
    }

    return await this.userRepository.update(id, { isActive: true });
  }

  /**
   * Deactivate user account
   *
   * @param id - User ID
   * @returns {Promise<User>} Updated user entity
   * @throws {EntityNotFoundError} When user not found
   */
  public async deactivateUser(id: string): Promise<User> {
    const user = await this.getUserById(id);

    if (!user.isActive) {
      throw new EntityValidationError(
        'User is already inactive',
        'User',
        id
      );
    }

    return await this.userRepository.update(id, { isActive: false });
  }

  /**
   * Change user password
   *
   * @param id - User ID
   * @param currentPassword - Current password for verification
   * @param newPassword - New password
   * @returns {Promise<User>} Updated user entity
   * @throws {EntityNotFoundError} When user not found
   * @throws {EntityValidationError} When current password is incorrect or new password is invalid
   */
  public async changePassword(id: string, currentPassword: string, newPassword: string): Promise<User> {
    const user = await this.getUserById(id);

    // Verify current password
    const isCurrentPasswordValid = await this.passwordHasher.verify(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new EntityValidationError(
        'Current password is incorrect',
        'User',
        id
      );
    }

    // Validate new password
    const passwordValidation = this.validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      throw new EntityValidationError(
        `New password validation failed: ${passwordValidation.errors.join(', ')}`,
        'User',
        id
      );
    }

    // Hash new password and update
    const newPasswordHash = await this.passwordHasher.hash(newPassword);
    return await this.userRepository.update(id, { passwordHash: newPasswordHash });
  }

  /**
   * Verify user password
   *
   * @param id - User ID
   * @param password - Password to verify
   * @returns {Promise<boolean>} True if password is correct
   * @throws {EntityNotFoundError} When user not found
   */
  public async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this.getUserById(id);
    return await this.passwordHasher.verify(password, user.passwordHash);
  }

  /**
   * Get user profile data (safe for external use)
   *
   * @param id - User ID
   * @returns {Promise<UserProfileData>} User profile data
   * @throws {EntityNotFoundError} When user not found
   */
  public async getUserProfile(id: string): Promise<UserProfileData> {
    const user = await this.getUserById(id);
    return user.getProfile();
  }

  /**
   * Check if email is available
   *
   * @param email - Email to check
   * @param excludeUserId - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if email is available
   */
  public async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(email);
    return !existingUser || (excludeUserId !== undefined && existingUser.id === excludeUserId);
  }

  /**
   * Check if username is available
   *
   * @param username - Username to check
   * @param excludeUserId - User ID to exclude from check (for updates)
   * @returns {Promise<boolean>} True if username is available
   */
  public async isUsernameAvailable(username: string, excludeUserId?: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByUsername(username);
    return !existingUser || (excludeUserId !== undefined && existingUser.id === excludeUserId);
  }

  /**
   * Validate password strength
   *
   * @param password - Password to validate
   * @returns {PasswordValidationResult} Validation result
   */
  public validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength: 'weak' | 'medium' | 'strong' = 'weak';

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Check for lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Check for number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Check for special character
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Determine strength
    if (errors.length === 0) {
      if (password.length >= 12 && /[!@#$%^&*(),.?":{}|<>].*[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        strength = 'strong';
      } else {
        strength = 'medium';
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength
    };
  }
}
