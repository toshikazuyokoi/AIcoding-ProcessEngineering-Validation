/**
 * ===================================
 * Auth Service Test Suite
 * ===================================
 * Purpose: Comprehensive tests for AuthService domain service
 * Features:
 * - Authentication and authorization testing
 * - JWT token management testing
 * - Password security validation
 * - Business logic validation
 * - Error handling and edge cases
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  AuthService,
  IUserRepository,
  IPasswordHasher,
  IJWTManager,
  RegisterRequest,
  LoginRequest,
  AuthResult,
  TokenPair,
  JWTPayload,
  RefreshTokenRequest,
  PasswordChangeRequest
} from '../../../src/domain/services/auth.service';
import { User, UserRole, UserCreationData } from '../../../src/domain/entities/user.entity';
import { EntityValidationError, EntityNotFoundError, EntityConflictError } from '../../../src/domain/entities/base.entity';

// Mock implementations
class MockUserRepository implements IUserRepository {
  private users: Map<string, User> = new Map();
  private emailIndex: Map<string, string> = new Map();
  private usernameIndex: Map<string, string> = new Map();

  async findById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userId = this.emailIndex.get(email);
    return userId ? this.users.get(userId) || null : null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const userId = this.usernameIndex.get(username);
    return userId ? this.users.get(userId) || null : null;
  }

  async create(data: UserCreationData): Promise<User> {
    const user = new User(data);
    this.users.set(user.id, user);
    this.emailIndex.set(data.email, user.id);
    this.usernameIndex.set(data.username, user.id);
    return user;
  }

  async update(id: string, data: Partial<UserCreationData>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new EntityNotFoundError('User', id);
    }

    // Update indexes if email or username changed
    if (data.email && data.email !== user.email) {
      this.emailIndex.delete(user.email);
      this.emailIndex.set(data.email, id);
    }
    if (data.username && data.username !== user.username) {
      this.usernameIndex.delete(user.username);
      this.usernameIndex.set(data.username, id);
    }

    user.updateProfile(data);
    return user;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.emailIndex.has(email);
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.usernameIndex.has(username);
  }

  // Helper methods for testing
  clear(): void {
    this.users.clear();
    this.emailIndex.clear();
    this.usernameIndex.clear();
  }

  addUser(user: User): void {
    this.users.set(user.id, user);
    this.emailIndex.set(user.email, user.id);
    this.usernameIndex.set(user.username, user.id);
  }
}

class MockPasswordHasher implements IPasswordHasher {
  async hash(password: string): Promise<string> {
    return `hashed_${password}`;
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return hash === `hashed_${password}`;
  }
}

class MockJWTManager implements IJWTManager {
  private accessTokenExpiration = 3600; // 1 hour

  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + this.accessTokenExpiration
    };
    return `access_${JSON.stringify(fullPayload)}`;
  }

  generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    const now = Math.floor(Date.now() / 1000);
    const fullPayload = {
      ...payload,
      iat: now,
      exp: now + (this.accessTokenExpiration * 24) // 24 hours
    };
    return `refresh_${JSON.stringify(fullPayload)}`;
  }

  verifyAccessToken(token: string): JWTPayload {
    if (!token.startsWith('access_')) {
      throw new Error('Invalid access token');
    }
    const payloadStr = token.replace('access_', '');
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('Token expired');
    }
    
    return payload;
  }

  verifyRefreshToken(token: string): JWTPayload {
    if (!token.startsWith('refresh_')) {
      throw new Error('Invalid refresh token');
    }
    const payloadStr = token.replace('refresh_', '');
    const payload = JSON.parse(payloadStr);
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new Error('Token expired');
    }
    
    return payload;
  }

  getTokenExpiration(): number {
    return this.accessTokenExpiration;
  }
}

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserRepository: MockUserRepository;
  let mockPasswordHasher: MockPasswordHasher;
  let mockJWTManager: MockJWTManager;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockPasswordHasher = new MockPasswordHasher();
    mockJWTManager = new MockJWTManager();
    authService = new AuthService(mockUserRepository, mockPasswordHasher, mockJWTManager);
  });

  // ===================================
  // User Registration Tests
  // ===================================

  describe('register', () => {
    const validRegisterRequest: RegisterRequest = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongP@ssw0rd!',
      role: UserRole.USER
    };

    test('should register user with valid data', async () => {
      const result = await authService.register(validRegisterRequest);

      expect(result.user.username).toBe('testuser');
      expect(result.user.email).toBe('test@example.com');
      expect(result.user.passwordHash).toBe('hashed_StrongP@ssw0rd!');
      expect(result.user.role).toBe(UserRole.USER);
      expect(result.user.isActive).toBe(true);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(3600);
    });

    test('should register user with default role', async () => {
      const request = {
        username: 'defaultuser',
        email: 'default@example.com',
        password: 'StrongP@ssw0rd!'
      };

      const result = await authService.register(request);

      expect(result.user.role).toBe(UserRole.USER);
    });

    test('should throw error for weak password', async () => {
      const request = {
        ...validRegisterRequest,
        password: 'weak'
      };

      await expect(authService.register(request)).rejects.toThrow(EntityValidationError);
      await expect(authService.register(request)).rejects.toThrow('Password validation failed');
    });

    test('should throw error for duplicate email', async () => {
      // Register first user
      await authService.register(validRegisterRequest);

      // Try to register second user with same email
      const duplicateRequest = {
        ...validRegisterRequest,
        username: 'differentuser'
      };

      await expect(authService.register(duplicateRequest)).rejects.toThrow(EntityConflictError);
      await expect(authService.register(duplicateRequest)).rejects.toThrow('A user with this email already exists');
    });

    test('should throw error for duplicate username', async () => {
      // Register first user
      await authService.register(validRegisterRequest);

      // Try to register second user with same username
      const duplicateRequest = {
        ...validRegisterRequest,
        email: 'different@example.com'
      };

      await expect(authService.register(duplicateRequest)).rejects.toThrow(EntityConflictError);
      await expect(authService.register(duplicateRequest)).rejects.toThrow('A user with this username already exists');
    });
  });

  // ===================================
  // User Authentication Tests
  // ===================================

  describe('authenticate', () => {
    let existingUser: User;

    beforeEach(async () => {
      const registerResult = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!'
      });
      existingUser = registerResult.user;
    });

    test('should authenticate user with valid credentials', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!'
      };

      const result = await authService.authenticate(loginRequest);

      expect(result.user.id).toBe(existingUser.id);
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(3600);
    });

    test('should throw error for non-existent user', async () => {
      const loginRequest: LoginRequest = {
        email: 'nonexistent@example.com',
        password: 'StrongP@ssw0rd!'
      };

      await expect(authService.authenticate(loginRequest)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error for invalid password', async () => {
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'WrongPassword123!'
      };

      await expect(authService.authenticate(loginRequest)).rejects.toThrow(EntityValidationError);
      await expect(authService.authenticate(loginRequest)).rejects.toThrow('Invalid credentials');
    });

    test('should throw error for inactive user', async () => {
      // Deactivate user
      await mockUserRepository.update(existingUser.id, { isActive: false });

      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!'
      };

      await expect(authService.authenticate(loginRequest)).rejects.toThrow(EntityValidationError);
      await expect(authService.authenticate(loginRequest)).rejects.toThrow('User account is deactivated');
    });
  });

  // ===================================
  // Token Management Tests
  // ===================================

  describe('Token Management', () => {
    let existingUser: User;
    let authResult: AuthResult;

    beforeEach(async () => {
      authResult = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!'
      });
      existingUser = authResult.user;
    });

    test('should refresh token with valid refresh token', async () => {
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: authResult.refreshToken
      };

      const result = await authService.refreshToken(refreshRequest);

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.expiresIn).toBe(3600);
    });

    test('should throw error for invalid refresh token', async () => {
      const refreshRequest: RefreshTokenRequest = {
        refreshToken: 'invalid_token'
      };

      await expect(authService.refreshToken(refreshRequest)).rejects.toThrow(EntityValidationError);
      await expect(authService.refreshToken(refreshRequest)).rejects.toThrow('Invalid refresh token');
    });

    test('should verify valid access token', async () => {
      const user = await authService.verifyToken(authResult.accessToken);

      expect(user.id).toBe(existingUser.id);
      expect(user.email).toBe(existingUser.email);
    });

    test('should throw error for invalid access token', async () => {
      await expect(authService.verifyToken('invalid_token')).rejects.toThrow(EntityValidationError);
      await expect(authService.verifyToken('invalid_token')).rejects.toThrow('Invalid access token');
    });

    test('should extract user ID from token', () => {
      const userId = authService.extractUserIdFromToken(authResult.accessToken);

      expect(userId).toBe(existingUser.id);
    });

    test('should throw error when extracting user ID from invalid token', () => {
      expect(() => authService.extractUserIdFromToken('invalid_token')).toThrow(EntityValidationError);
    });
  });

  // ===================================
  // Password Management Tests
  // ===================================

  describe('Password Management', () => {
    let existingUser: User;

    beforeEach(async () => {
      const authResult = await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!'
      });
      existingUser = authResult.user;
    });

    test('should change password with valid current password', async () => {
      const changeRequest: PasswordChangeRequest = {
        currentPassword: 'StrongP@ssw0rd!',
        newPassword: 'NewStr0ngP@ss!'
      };

      await authService.changePassword(existingUser.id, changeRequest);

      // Verify new password works
      const loginRequest: LoginRequest = {
        email: 'test@example.com',
        password: 'NewStr0ngP@ss!'
      };

      const result = await authService.authenticate(loginRequest);
      expect(result.user.id).toBe(existingUser.id);
    });

    test('should throw error with incorrect current password', async () => {
      const changeRequest: PasswordChangeRequest = {
        currentPassword: 'WrongPassword',
        newPassword: 'NewStrongPass456!'
      };

      await expect(authService.changePassword(existingUser.id, changeRequest)).rejects.toThrow(EntityValidationError);
      await expect(authService.changePassword(existingUser.id, changeRequest)).rejects.toThrow('Current password is incorrect');
    });

    test('should throw error with weak new password', async () => {
      const changeRequest: PasswordChangeRequest = {
        currentPassword: 'StrongP@ssw0rd!',
        newPassword: 'weak'
      };

      await expect(authService.changePassword(existingUser.id, changeRequest)).rejects.toThrow(EntityValidationError);
      await expect(authService.changePassword(existingUser.id, changeRequest)).rejects.toThrow('Password validation failed');
    });
  });

  // ===================================
  // Validation Tests
  // ===================================

  describe('Validation', () => {
    test('should validate strong password', () => {
      expect(() => authService.validatePasswordStrength('StrongP@ssw0rd!')).not.toThrow();
    });

    test('should reject weak passwords', () => {
      const weakPasswords = [
        'short',           // Too short
        'nouppercase123!', // No uppercase
        'NOLOWERCASE123!', // No lowercase
        'NoNumbers!',      // No numbers
        'NoSpecialChars123', // No special characters
        'aaa123ABC!',      // Repeated characters
        'abc123ABC!',      // Sequential characters
        'A'.repeat(129) + '1!'  // Too long
      ];

      weakPasswords.forEach(password => {
        expect(() => authService.validatePasswordStrength(password)).toThrow(EntityValidationError);
      });
    });

    test('should validate email format', () => {
      expect(() => authService.validateEmailFormat('test@example.com')).not.toThrow();
      expect(() => authService.validateEmailFormat('user.name+tag@domain.co.uk')).not.toThrow();
    });

    test('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'test@',
        'test..test@example.com',
        'a'.repeat(250) + '@example.com' // Too long
      ];

      invalidEmails.forEach(email => {
        expect(() => authService.validateEmailFormat(email)).toThrow(EntityValidationError);
      });
    });

    test('should validate username format', () => {
      expect(() => authService.validateUsernameFormat('validuser')).not.toThrow();
      expect(() => authService.validateUsernameFormat('user_123')).not.toThrow();
      expect(() => authService.validateUsernameFormat('user-name')).not.toThrow();
    });

    test('should reject invalid username formats', () => {
      const invalidUsernames = [
        'ab',              // Too short
        'a'.repeat(31),    // Too long
        'user@name',       // Invalid characters
        '_username',       // Starts with underscore
        'username_',       // Ends with underscore
        '-username',       // Starts with hyphen
        'username-'        // Ends with hyphen
      ];

      invalidUsernames.forEach(username => {
        expect(() => authService.validateUsernameFormat(username)).toThrow(EntityValidationError);
      });
    });
  });

  // ===================================
  // Authorization Tests
  // ===================================

  describe('Authorization', () => {
    let regularUser: User;
    let adminUser: User;

    beforeEach(async () => {
      const regularResult = await authService.register({
        username: 'regularuser',
        email: 'regular@example.com',
        password: 'StrongP@ssw0rd!',
        role: UserRole.USER
      });
      regularUser = regularResult.user;

      const adminResult = await authService.register({
        username: 'adminuser',
        email: 'admin@example.com',
        password: 'StrongP@ssw0rd!',
        role: UserRole.ADMIN
      });
      adminUser = adminResult.user;
    });

    test('should check if user has required role', async () => {
      const regularHasUserRole = await authService.hasRole(regularUser.id, UserRole.USER);
      const regularHasAdminRole = await authService.hasRole(regularUser.id, UserRole.ADMIN);
      const adminHasUserRole = await authService.hasRole(adminUser.id, UserRole.USER);
      const adminHasAdminRole = await authService.hasRole(adminUser.id, UserRole.ADMIN);

      expect(regularHasUserRole).toBe(true);
      expect(regularHasAdminRole).toBe(false);
      expect(adminHasUserRole).toBe(true); // Admin has access to everything
      expect(adminHasAdminRole).toBe(true);
    });

    test('should check if user is admin', async () => {
      const regularIsAdmin = await authService.isAdmin(regularUser.id);
      const adminIsAdmin = await authService.isAdmin(adminUser.id);

      expect(regularIsAdmin).toBe(false);
      expect(adminIsAdmin).toBe(true);
    });

    test('should check if user is active', async () => {
      const isActive = await authService.isUserActive(regularUser.id);
      expect(isActive).toBe(true);

      // Deactivate user
      await mockUserRepository.update(regularUser.id, { isActive: false });
      const isActiveAfterDeactivation = await authService.isUserActive(regularUser.id);
      expect(isActiveAfterDeactivation).toBe(false);
    });
  });

  // ===================================
  // Utility Tests
  // ===================================

  describe('Utility Methods', () => {
    beforeEach(async () => {
      await authService.register({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongP@ssw0rd!'
      });
    });

    test('should check if email exists', async () => {
      const existingEmailExists = await authService.checkEmailExists('test@example.com');
      const nonExistingEmailExists = await authService.checkEmailExists('nonexistent@example.com');

      expect(existingEmailExists).toBe(true);
      expect(nonExistingEmailExists).toBe(false);
    });

    test('should check if username exists', async () => {
      const existingUsernameExists = await authService.checkUsernameExists('testuser');
      const nonExistingUsernameExists = await authService.checkUsernameExists('nonexistent');

      expect(existingUsernameExists).toBe(true);
      expect(nonExistingUsernameExists).toBe(false);
    });

    test('should validate credentials without generating tokens', async () => {
      const user = await authService.validateCredentials('test@example.com', 'StrongP@ssw0rd!');

      expect(user.email).toBe('test@example.com');
    });

    test('should throw error for invalid credentials in validation', async () => {
      await expect(authService.validateCredentials('test@example.com', 'WrongPassword'))
        .rejects.toThrow(EntityValidationError);
      await expect(authService.validateCredentials('nonexistent@example.com', 'StrongP@ssw0rd!'))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should generate tokens for user', async () => {
      const user = await authService.validateCredentials('test@example.com', 'StrongP@ssw0rd!');
      const tokens = authService.generateTokens(user);

      expect(tokens.accessToken).toBeDefined();
      expect(tokens.refreshToken).toBeDefined();
      expect(tokens.expiresIn).toBe(3600);
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should throw error when getting non-existent user', async () => {
      await expect(authService.getUserById('nonexistent')).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when changing password for non-existent user', async () => {
      const changeRequest: PasswordChangeRequest = {
        currentPassword: 'current',
        newPassword: 'NewStrongP@ssw0rd!'
      };

      await expect(authService.changePassword('nonexistent', changeRequest)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when checking role for non-existent user', async () => {
      await expect(authService.hasRole('nonexistent', UserRole.USER)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when checking admin status for non-existent user', async () => {
      await expect(authService.isAdmin('nonexistent')).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when checking active status for non-existent user', async () => {
      await expect(authService.isUserActive('nonexistent')).rejects.toThrow(EntityNotFoundError);
    });
  });
});
