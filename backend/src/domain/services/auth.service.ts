/**
 * ===================================
 * Authentication Domain Service
 * ===================================
 * Purpose: Authentication and authorization business logic
 * Features:
 * - User registration and authentication
 * - JWT token management
 * - Password security and validation
 * - Session management
 * - Security policy enforcement
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { User, UserCreationData, UserRole } from '../entities/user.entity';
import { EntityValidationError, EntityNotFoundError, EntityConflictError } from '../entities/base.entity';

/**
 * User registration request interface
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * User login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token pair interface
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Refresh token request interface
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Password reset request interface
 */
export interface PasswordResetRequest {
  email: string;
}

/**
 * Password change request interface
 */
export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * User repository interface (dependency injection)
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsername(username: string): Promise<User | null>;
  create(data: UserCreationData): Promise<User>;
  update(id: string, data: Partial<UserCreationData>): Promise<User>;
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
 * JWT manager interface (dependency injection)
 */
export interface IJWTManager {
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
  generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string;
  verifyAccessToken(token: string): JWTPayload;
  verifyRefreshToken(token: string): JWTPayload;
  getTokenExpiration(): number;
}

/**
 * Authentication Domain Service Class
 * 
 * Handles authentication and authorization business logic.
 * Coordinates between entities and repositories while enforcing security policies.
 */
export class AuthService {
  private userRepository: IUserRepository;
  private passwordHasher: IPasswordHasher;
  private jwtManager: IJWTManager;

  /**
   * Constructor for AuthService
   * 
   * @param userRepository - User repository for data access
   * @param passwordHasher - Password hashing service
   * @param jwtManager - JWT token management service
   */
  constructor(
    userRepository: IUserRepository,
    passwordHasher: IPasswordHasher,
    jwtManager: IJWTManager
  ) {
    this.userRepository = userRepository;
    this.passwordHasher = passwordHasher;
    this.jwtManager = jwtManager;
  }

  /**
   * Register a new user
   * 
   * @param request - Registration request
   * @returns {Promise<AuthResult>} Authentication result with tokens
   * @throws {EntityValidationError} When validation fails
   * @throws {EntityConflictError} When email or username already exists
   */
  public async register(request: RegisterRequest): Promise<AuthResult> {
    // Validate password strength
    this.validatePasswordStrength(request.password);

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
      isActive: true
    };

    // Create user
    const user = await this.userRepository.create(userData);

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens
    };
  }

  /**
   * Authenticate user with email and password
   * 
   * @param request - Login request
   * @returns {Promise<AuthResult>} Authentication result with tokens
   * @throws {EntityNotFoundError} When user not found
   * @throws {EntityValidationError} When credentials are invalid
   */
  public async authenticate(request: LoginRequest): Promise<AuthResult> {
    // Find user by email
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new EntityNotFoundError('User', request.email);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new EntityValidationError(
        'User account is deactivated',
        'User',
        user.id
      );
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.verify(request.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new EntityValidationError(
        'Invalid credentials',
        'User',
        user.id
      );
    }

    // Generate tokens
    const tokens = this.generateTokens(user);

    return {
      user,
      ...tokens
    };
  }

  /**
   * Refresh access token using refresh token
   * 
   * @param request - Refresh token request
   * @returns {Promise<TokenPair>} New token pair
   * @throws {EntityValidationError} When refresh token is invalid
   * @throws {EntityNotFoundError} When user not found
   */
  public async refreshToken(request: RefreshTokenRequest): Promise<TokenPair> {
    try {
      // Verify refresh token
      const payload = this.jwtManager.verifyRefreshToken(request.refreshToken);

      // Get user
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new EntityNotFoundError('User', payload.userId);
      }

      // Check if user is still active
      if (!user.isActive) {
        throw new EntityValidationError(
          'User account is deactivated',
          'User',
          user.id
        );
      }

      // Generate new tokens
      return this.generateTokens(user);
    } catch (error) {
      throw new EntityValidationError(
        'Invalid refresh token',
        'RefreshToken',
        'unknown'
      );
    }
  }

  /**
   * Verify access token and return user
   * 
   * @param token - Access token
   * @returns {Promise<User>} User entity
   * @throws {EntityValidationError} When token is invalid
   * @throws {EntityNotFoundError} When user not found
   */
  public async verifyToken(token: string): Promise<User> {
    try {
      // Verify token
      const payload = this.jwtManager.verifyAccessToken(token);

      // Get user
      const user = await this.userRepository.findById(payload.userId);
      if (!user) {
        throw new EntityNotFoundError('User', payload.userId);
      }

      // Check if user is still active
      if (!user.isActive) {
        throw new EntityValidationError(
          'User account is deactivated',
          'User',
          user.id
        );
      }

      return user;
    } catch (error) {
      throw new EntityValidationError(
        'Invalid access token',
        'AccessToken',
        'unknown'
      );
    }
  }

  /**
   * Change user password
   * 
   * @param userId - User ID
   * @param request - Password change request
   * @returns {Promise<void>}
   * @throws {EntityNotFoundError} When user not found
   * @throws {EntityValidationError} When current password is incorrect or new password is invalid
   */
  public async changePassword(userId: string, request: PasswordChangeRequest): Promise<void> {
    // Get user
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new EntityNotFoundError('User', userId);
    }

    // Verify current password
    const isCurrentPasswordValid = await this.passwordHasher.verify(
      request.currentPassword,
      user.passwordHash
    );
    if (!isCurrentPasswordValid) {
      throw new EntityValidationError(
        'Current password is incorrect',
        'User',
        userId
      );
    }

    // Validate new password strength
    this.validatePasswordStrength(request.newPassword);

    // Hash new password
    const newPasswordHash = await this.passwordHasher.hash(request.newPassword);

    // Update user password
    await this.userRepository.update(userId, { passwordHash: newPasswordHash });
  }

  /**
   * Check if email exists
   *
   * @param email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  public async checkEmailExists(email: string): Promise<boolean> {
    return await this.userRepository.existsByEmail(email);
  }

  /**
   * Check if username exists
   *
   * @param username - Username to check
   * @returns {Promise<boolean>} True if username exists
   */
  public async checkUsernameExists(username: string): Promise<boolean> {
    return await this.userRepository.existsByUsername(username);
  }

  /**
   * Get user by ID (for token verification)
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
   * Validate user credentials without generating tokens
   *
   * @param email - User email
   * @param password - User password
   * @returns {Promise<User>} User entity if credentials are valid
   * @throws {EntityNotFoundError} When user not found
   * @throws {EntityValidationError} When credentials are invalid
   */
  public async validateCredentials(email: string, password: string): Promise<User> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new EntityNotFoundError('User', email);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new EntityValidationError(
        'User account is deactivated',
        'User',
        user.id
      );
    }

    // Verify password
    const isPasswordValid = await this.passwordHasher.verify(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new EntityValidationError(
        'Invalid credentials',
        'User',
        user.id
      );
    }

    return user;
  }

  /**
   * Generate token pair for user
   *
   * @param user - User entity
   * @returns {TokenPair} Token pair with expiration
   */
  public generateTokens(user: User): TokenPair {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const accessToken = this.jwtManager.generateAccessToken(payload);
    const refreshToken = this.jwtManager.generateRefreshToken(payload);
    const expiresIn = this.jwtManager.getTokenExpiration();

    return {
      accessToken,
      refreshToken,
      expiresIn
    };
  }

  /**
   * Validate password strength
   *
   * @param password - Password to validate
   * @throws {EntityValidationError} When password doesn't meet requirements
   */
  public validatePasswordStrength(password: string): void {
    const errors: string[] = [];

    // Check minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Check maximum length
    if (password.length > 128) {
      errors.push('Password must be 128 characters or less');
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

    // Check for common patterns
    if (/(.)\1{2,}/.test(password)) {
      errors.push('Password cannot contain repeated characters');
    }

    // Check for sequential characters (3 or more consecutive)
    if (/(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|stu|tuv|uvw|vwx|wxy|xyz|123|234|345|456|567|678|789|012)/i.test(password)) {
      errors.push('Password cannot contain 3 or more sequential characters');
    }

    if (errors.length > 0) {
      throw new EntityValidationError(
        `Password validation failed: ${errors.join(', ')}`,
        'Password',
        'validation'
      );
    }
  }

  /**
   * Extract user ID from token
   *
   * @param token - Access token
   * @returns {string} User ID
   * @throws {EntityValidationError} When token is invalid
   */
  public extractUserIdFromToken(token: string): string {
    try {
      const payload = this.jwtManager.verifyAccessToken(token);
      return payload.userId;
    } catch (error) {
      throw new EntityValidationError(
        'Invalid access token',
        'AccessToken',
        'unknown'
      );
    }
  }

  /**
   * Check if user has required role
   *
   * @param userId - User ID
   * @param requiredRole - Required role
   * @returns {Promise<boolean>} True if user has required role
   * @throws {EntityNotFoundError} When user not found
   */
  public async hasRole(userId: string, requiredRole: UserRole): Promise<boolean> {
    const user = await this.getUserById(userId);

    // Admin has access to everything
    if (user.role === UserRole.ADMIN) {
      return true;
    }

    // Check specific role
    return user.role === requiredRole;
  }

  /**
   * Check if user is admin
   *
   * @param userId - User ID
   * @returns {Promise<boolean>} True if user is admin
   * @throws {EntityNotFoundError} When user not found
   */
  public async isAdmin(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.role === UserRole.ADMIN;
  }

  /**
   * Check if user is active
   *
   * @param userId - User ID
   * @returns {Promise<boolean>} True if user is active
   * @throws {EntityNotFoundError} When user not found
   */
  public async isUserActive(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId);
    return user.isActive;
  }

  /**
   * Validate email format
   *
   * @param email - Email to validate
   * @throws {EntityValidationError} When email format is invalid
   */
  public validateEmailFormat(email: string): void {
    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!email || typeof email !== 'string') {
      throw new EntityValidationError(
        'Email is required',
        'Email',
        'validation'
      );
    }

    if (email.length > 254) {
      throw new EntityValidationError(
        'Email address is too long',
        'Email',
        'validation'
      );
    }

    if (!emailRegex.test(email)) {
      throw new EntityValidationError(
        'Invalid email format',
        'Email',
        'validation'
      );
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      throw new EntityValidationError(
        'Email cannot contain consecutive dots',
        'Email',
        'validation'
      );
    }

    // Check if starts or ends with dot
    const localPart = email.split('@')[0];
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      throw new EntityValidationError(
        'Email local part cannot start or end with dot',
        'Email',
        'validation'
      );
    }
  }

  /**
   * Validate username format
   *
   * @param username - Username to validate
   * @throws {EntityValidationError} When username format is invalid
   */
  public validateUsernameFormat(username: string): void {
    if (username.length < 3) {
      throw new EntityValidationError(
        'Username must be at least 3 characters long',
        'Username',
        'validation'
      );
    }

    if (username.length > 30) {
      throw new EntityValidationError(
        'Username must be 30 characters or less',
        'Username',
        'validation'
      );
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new EntityValidationError(
        'Username can only contain letters, numbers, underscores, and hyphens',
        'Username',
        'validation'
      );
    }

    if (/^[_-]|[_-]$/.test(username)) {
      throw new EntityValidationError(
        'Username cannot start or end with underscore or hyphen',
        'Username',
        'validation'
      );
    }
  }
}
