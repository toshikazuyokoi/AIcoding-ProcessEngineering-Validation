/**
 * ===================================
 * User Entity Class
 * ===================================
 * Purpose: User domain entity with business logic
 * Features:
 * - User information management
 * - Authentication and authorization
 * - Profile management
 * - Business rule enforcement
 * - Password validation
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { BaseEntity, EntityCreationOptions, EntityValidationError } from './base.entity';

/**
 * User role enumeration
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

/**
 * User creation data interface
 */
export interface UserCreationData {
  username: string;
  email: string;
  passwordHash: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * User update data interface
 */
export interface UserUpdateData {
  username?: string;
  email?: string;
  passwordHash?: string;
  role?: UserRole;
  isActive?: boolean;
}

/**
 * User profile data interface
 */
export interface UserProfileData {
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

/**
 * User Entity Class
 * 
 * Represents a user in the system with authentication and authorization capabilities.
 * Extends BaseEntity to inherit common entity functionality.
 */
export class User extends BaseEntity {
  private _username: string;
  private _email: string;
  private _passwordHash: string;
  private _role: UserRole;
  private _isActive: boolean;

  /**
   * Constructor for User entity
   * 
   * @param data - User creation data
   * @param options - Entity creation options
   * @throws {EntityValidationError} When validation fails
   */
  constructor(data: UserCreationData, options: EntityCreationOptions = {}) {
    super(options);
    
    // Initialize user-specific properties
    this._username = data.username;
    this._email = data.email;
    this._passwordHash = data.passwordHash;
    this._role = data.role || UserRole.USER;
    this._isActive = data.isActive !== undefined ? data.isActive : true;

    // Validate all properties after initialization
    this.validateInvariants();
  }

  /**
   * Get username (immutable)
   */
  public get username(): string {
    return this._username;
  }

  /**
   * Get email (immutable)
   */
  public get email(): string {
    return this._email;
  }

  /**
   * Get password hash (immutable)
   */
  public get passwordHash(): string {
    return this._passwordHash;
  }

  /**
   * Get user role
   */
  public get role(): UserRole {
    return this._role;
  }

  /**
   * Get active status
   */
  public get isActive(): boolean {
    return this._isActive;
  }

  /**
   * Check if user is an administrator
   * 
   * @returns {boolean} True if user has admin role
   */
  public isAdmin(): boolean {
    return this._role === UserRole.ADMIN;
  }

  /**
   * Check if user is a regular user
   * 
   * @returns {boolean} True if user has user role
   */
  public isUser(): boolean {
    return this._role === UserRole.USER;
  }

  /**
   * Check if user account is active
   * 
   * @returns {boolean} True if account is active
   */
  public isAccountActive(): boolean {
    return this._isActive;
  }

  /**
   * Validate password against stored hash
   * Note: This method should be used with a proper password hashing library
   * 
   * @param password - Plain text password to validate
   * @returns {boolean} True if password is valid
   */
  public validatePassword(password: string): boolean {
    if (!password || typeof password !== 'string') {
      return false;
    }

    // In a real implementation, this would use bcrypt or similar
    // For now, we'll do a simple comparison (NOT secure for production)
    // This is just for demonstration purposes
    return password.length >= 8; // Placeholder validation
  }

  /**
   * Update user profile information
   * 
   * @param data - Profile update data
   * @throws {EntityValidationError} When validation fails
   */
  public updateProfile(data: UserUpdateData): void {
    const previousData = {
      username: this._username,
      email: this._email,
      role: this._role,
      isActive: this._isActive
    };

    try {
      // Update properties if provided
      if (data.username !== undefined) {
        this._username = data.username;
      }
      
      if (data.email !== undefined) {
        this._email = data.email;
      }
      
      if (data.passwordHash !== undefined) {
        this._passwordHash = data.passwordHash;
      }
      
      if (data.role !== undefined) {
        this._role = data.role;
      }
      
      if (data.isActive !== undefined) {
        this._isActive = data.isActive;
      }

      // Validate updated data
      this.validateInvariants();
      
      // Mark entity as updated
      this.markAsUpdated();

    } catch (error) {
      // Rollback changes on validation failure
      this._username = previousData.username;
      this._email = previousData.email;
      this._role = previousData.role;
      this._isActive = previousData.isActive;
      
      throw error;
    }
  }

  /**
   * Change user password
   * 
   * @param newPasswordHash - New password hash
   * @throws {EntityValidationError} When validation fails
   */
  public changePassword(newPasswordHash: string): void {
    if (!newPasswordHash || typeof newPasswordHash !== 'string') {
      throw new EntityValidationError('Password hash is required', 'User', this.id);
    }

    if (newPasswordHash.length < 10) {
      throw new EntityValidationError('Password hash must be properly formatted', 'User', this.id);
    }

    this._passwordHash = newPasswordHash;
    this.markAsUpdated();
  }

  /**
   * Promote user to admin role
   * 
   * @throws {EntityValidationError} When user is not active
   */
  public promoteToAdmin(): void {
    if (!this._isActive) {
      throw new EntityValidationError('Cannot promote inactive user to admin', 'User', this.id);
    }

    this._role = UserRole.ADMIN;
    this.markAsUpdated();
  }

  /**
   * Demote admin to regular user role
   */
  public demoteToUser(): void {
    this._role = UserRole.USER;
    this.markAsUpdated();
  }

  /**
   * Activate user account
   */
  public activate(): void {
    this._isActive = true;
    this.markAsUpdated();
  }

  /**
   * Deactivate user account
   */
  public deactivate(): void {
    this._isActive = false;
    this.markAsUpdated();
  }

  /**
   * Get user profile data
   * 
   * @returns {UserProfileData} User profile information
   */
  public getProfile(): UserProfileData {
    return {
      username: this._username,
      email: this._email,
      role: this._role,
      isActive: this._isActive
    };
  }

  /**
   * Check if user can perform admin actions
   * 
   * @returns {boolean} True if user is active admin
   */
  public canPerformAdminActions(): boolean {
    return this._isActive && this._role === UserRole.ADMIN;
  }

  /**
   * Check if user can access the system
   * 
   * @returns {boolean} True if user is active
   */
  public canAccessSystem(): boolean {
    return this._isActive;
  }

  /**
   * Clone user entity with optional updates
   * 
   * @param updates - Optional property updates
   * @returns {User} New user instance
   */
  public clone(updates?: Partial<UserCreationData>): User {
    const userData: UserCreationData = {
      username: updates?.username ?? this._username,
      email: updates?.email ?? this._email,
      passwordHash: updates?.passwordHash ?? this._passwordHash,
      role: updates?.role ?? this._role,
      isActive: updates?.isActive ?? this._isActive
    };

    return new User(userData, {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }

  /**
   * Get additional properties for serialization
   * 
   * @returns {object} User-specific properties
   */
  protected override getAdditionalProperties(): Record<string, any> {
    return {
      username: this._username,
      email: this._email,
      role: this._role,
      isActive: this._isActive
      // Note: passwordHash is intentionally excluded from serialization for security
    };
  }

  /**
   * Validate user-specific invariant conditions
   * 
   * @throws {EntityValidationError} When validation fails
   */
  protected override validateInvariants(): void {
    super.validateInvariants();

    // Validate username
    if (!this._username || typeof this._username !== 'string') {
      throw new EntityValidationError('Username is required', 'User', this.id);
    }

    if (this._username.trim().length < 3) {
      throw new EntityValidationError('Username must be at least 3 characters long', 'User', this.id);
    }

    if (this._username.trim().length > 50) {
      throw new EntityValidationError('Username must not exceed 50 characters', 'User', this.id);
    }

    // Validate email
    if (!this._email || typeof this._email !== 'string') {
      throw new EntityValidationError('Email is required', 'User', this.id);
    }

    if (!this.isValidEmail(this._email)) {
      throw new EntityValidationError('Invalid email format', 'User', this.id);
    }

    // Validate password hash
    if (!this._passwordHash || typeof this._passwordHash !== 'string') {
      throw new EntityValidationError('Password hash is required', 'User', this.id);
    }

    if (this._passwordHash.length < 10) {
      throw new EntityValidationError('Password hash must be properly formatted', 'User', this.id);
    }

    // Validate role
    if (!Object.values(UserRole).includes(this._role)) {
      throw new EntityValidationError('Invalid user role', 'User', this.id);
    }

    // Validate isActive
    if (typeof this._isActive !== 'boolean') {
      throw new EntityValidationError('isActive must be a boolean value', 'User', this.id);
    }
  }

  /**
   * Validate email format
   * 
   * @param email - Email to validate
   * @returns {boolean} True if email is valid
   */
  private isValidEmail(email: string): boolean {
    // Comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!email || email.length === 0 || email.length > 255) {
      return false;
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      return false;
    }

    // Split email into local and domain parts
    const [localPart, domainPart] = email.split('@');
    if (!localPart || !domainPart) {
      return false;
    }

    // Check local part constraints
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      return false;
    }

    // Check domain part constraints
    if (domainPart.startsWith('.') || domainPart.endsWith('.')) {
      return false;
    }

    return emailRegex.test(email);
  }
}
