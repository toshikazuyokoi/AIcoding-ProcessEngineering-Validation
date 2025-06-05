/**
 * ===================================
 * User Service Test Suite
 * ===================================
 * Purpose: Comprehensive tests for UserService domain service
 * Features:
 * - User management operations testing
 * - Business logic validation
 * - Error handling and edge cases
 * - Mock repository and dependencies
 * - Password validation testing
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  UserService,
  IUserRepository,
  IPasswordHasher,
  CreateUserRequest,
  UpdateUserRequest,
  UserSearchFilters,
  PasswordValidationResult
} from '../../../src/domain/services/user.service';
import { User, UserRole, UserCreationData, UserUpdateData } from '../../../src/domain/entities/user.entity';
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

  async findMany(filters?: UserSearchFilters): Promise<User[]> {
    let users = Array.from(this.users.values());

    if (filters?.username) {
      users = users.filter(u => u.username.includes(filters.username!));
    }
    if (filters?.email) {
      users = users.filter(u => u.email.includes(filters.email!));
    }
    if (filters?.role !== undefined) {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters?.isActive !== undefined) {
      users = users.filter(u => u.isActive === filters.isActive);
    }

    return users;
  }

  async create(data: UserCreationData): Promise<User> {
    const user = new User(data);
    this.users.set(user.id, user);
    this.emailIndex.set(data.email, user.id);
    this.usernameIndex.set(data.username, user.id);
    return user;
  }

  async update(id: string, data: UserUpdateData): Promise<User> {
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

  async delete(id: string): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      this.users.delete(id);
      this.emailIndex.delete(user.email);
      this.usernameIndex.delete(user.username);
    }
  }

  async count(filters?: UserSearchFilters): Promise<number> {
    const users = await this.findMany(filters);
    return users.length;
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

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: MockUserRepository;
  let mockPasswordHasher: MockPasswordHasher;

  beforeEach(() => {
    mockUserRepository = new MockUserRepository();
    mockPasswordHasher = new MockPasswordHasher();
    userService = new UserService(mockUserRepository, mockPasswordHasher);
  });

  // ===================================
  // User Creation Tests
  // ===================================

  describe('createUser', () => {
    const validCreateRequest: CreateUserRequest = {
      username: 'testuser',
      email: 'test@example.com',
      password: 'StrongPass123!',
      role: UserRole.USER,
      isActive: true
    };

    test('should create user with valid data', async () => {
      const user = await userService.createUser(validCreateRequest);

      expect(user.username).toBe('testuser');
      expect(user.email).toBe('test@example.com');
      expect(user.passwordHash).toBe('hashed_StrongPass123!');
      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
    });

    test('should create user with default role and active status', async () => {
      const request = {
        username: 'defaultuser',
        email: 'default@example.com',
        password: 'StrongPass123!'
      };

      const user = await userService.createUser(request);

      expect(user.role).toBe(UserRole.USER);
      expect(user.isActive).toBe(true);
    });

    test('should throw error for weak password', async () => {
      const request = {
        ...validCreateRequest,
        password: 'weak'
      };

      await expect(userService.createUser(request)).rejects.toThrow(EntityValidationError);
      await expect(userService.createUser(request)).rejects.toThrow('Password validation failed');
    });

    test('should throw error for duplicate email', async () => {
      // Create first user
      await userService.createUser(validCreateRequest);

      // Try to create second user with same email
      const duplicateRequest = {
        ...validCreateRequest,
        username: 'differentuser'
      };

      await expect(userService.createUser(duplicateRequest)).rejects.toThrow(EntityConflictError);
      await expect(userService.createUser(duplicateRequest)).rejects.toThrow('A user with this email already exists');
    });

    test('should throw error for duplicate username', async () => {
      // Create first user
      await userService.createUser(validCreateRequest);

      // Try to create second user with same username
      const duplicateRequest = {
        ...validCreateRequest,
        email: 'different@example.com'
      };

      await expect(userService.createUser(duplicateRequest)).rejects.toThrow(EntityConflictError);
      await expect(userService.createUser(duplicateRequest)).rejects.toThrow('A user with this username already exists');
    });
  });

  // ===================================
  // User Retrieval Tests
  // ===================================

  describe('getUserById', () => {
    test('should return user when found', async () => {
      const createdUser = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });

      const foundUser = await userService.getUserById(createdUser.id);

      expect(foundUser.id).toBe(createdUser.id);
      expect(foundUser.username).toBe('testuser');
    });

    test('should throw error when user not found', async () => {
      await expect(userService.getUserById('nonexistent')).rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('getUserByEmail', () => {
    test('should return user when found', async () => {
      await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });

      const foundUser = await userService.getUserByEmail('test@example.com');

      expect(foundUser).not.toBeNull();
      expect(foundUser!.email).toBe('test@example.com');
    });

    test('should return null when user not found', async () => {
      const foundUser = await userService.getUserByEmail('nonexistent@example.com');

      expect(foundUser).toBeNull();
    });
  });

  describe('getUserByUsername', () => {
    test('should return user when found', async () => {
      await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });

      const foundUser = await userService.getUserByUsername('testuser');

      expect(foundUser).not.toBeNull();
      expect(foundUser!.username).toBe('testuser');
    });

    test('should return null when user not found', async () => {
      const foundUser = await userService.getUserByUsername('nonexistent');

      expect(foundUser).toBeNull();
    });
  });

  // ===================================
  // User Update Tests
  // ===================================

  describe('updateUser', () => {
    let existingUser: User;

    beforeEach(async () => {
      existingUser = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });
    });

    test('should update user successfully', async () => {
      const updateRequest: UpdateUserRequest = {
        username: 'updateduser',
        email: 'updated@example.com'
      };

      const updatedUser = await userService.updateUser(existingUser.id, updateRequest);

      expect(updatedUser.username).toBe('updateduser');
      expect(updatedUser.email).toBe('updated@example.com');
    });

    test('should update password successfully', async () => {
      const updateRequest: UpdateUserRequest = {
        password: 'NewStrongPass456!'
      };

      const updatedUser = await userService.updateUser(existingUser.id, updateRequest);

      expect(updatedUser.passwordHash).toBe('hashed_NewStrongPass456!');
    });

    test('should throw error for weak new password', async () => {
      const updateRequest: UpdateUserRequest = {
        password: 'weak'
      };

      await expect(userService.updateUser(existingUser.id, updateRequest)).rejects.toThrow(EntityValidationError);
    });

    test('should throw error for duplicate email', async () => {
      // Create another user
      await userService.createUser({
        username: 'otheruser',
        email: 'other@example.com',
        password: 'StrongPass123!'
      });

      // Try to update first user with second user's email
      const updateRequest: UpdateUserRequest = {
        email: 'other@example.com'
      };

      await expect(userService.updateUser(existingUser.id, updateRequest)).rejects.toThrow(EntityConflictError);
    });

    test('should throw error when user not found', async () => {
      const updateRequest: UpdateUserRequest = {
        username: 'newname'
      };

      await expect(userService.updateUser('nonexistent', updateRequest)).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // User Deletion Tests
  // ===================================

  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });

      await userService.deleteUser(user.id);

      await expect(userService.getUserById(user.id)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when user not found', async () => {
      await expect(userService.deleteUser('nonexistent')).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // User Search Tests
  // ===================================

  describe('searchUsers', () => {
    beforeEach(async () => {
      await userService.createUser({
        username: 'admin1',
        email: 'admin1@example.com',
        password: 'StrongPass123!',
        role: UserRole.ADMIN
      });

      await userService.createUser({
        username: 'user1',
        email: 'user1@example.com',
        password: 'StrongPass123!',
        role: UserRole.USER
      });

      await userService.createUser({
        username: 'inactive',
        email: 'inactive@example.com',
        password: 'StrongPass123!',
        isActive: false
      });
    });

    test('should return all users with no filters', async () => {
      const users = await userService.searchUsers();

      expect(users).toHaveLength(3);
    });

    test('should filter by role', async () => {
      const adminUsers = await userService.searchUsers({ role: UserRole.ADMIN });
      const regularUsers = await userService.searchUsers({ role: UserRole.USER });

      expect(adminUsers).toHaveLength(1);
      expect(adminUsers[0].username).toBe('admin1');
      expect(regularUsers).toHaveLength(2);
    });

    test('should filter by active status', async () => {
      const activeUsers = await userService.searchUsers({ isActive: true });
      const inactiveUsers = await userService.searchUsers({ isActive: false });

      expect(activeUsers).toHaveLength(2);
      expect(inactiveUsers).toHaveLength(1);
      expect(inactiveUsers[0].username).toBe('inactive');
    });

    test('should filter by username', async () => {
      const users = await userService.searchUsers({ username: 'admin' });

      expect(users).toHaveLength(1);
      expect(users[0].username).toBe('admin1');
    });
  });

  // ===================================
  // Role Management Tests
  // ===================================

  describe('Role Management', () => {
    let user: User;

    beforeEach(async () => {
      user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!',
        role: UserRole.USER
      });
    });

    test('should promote user to admin', async () => {
      const updatedUser = await userService.promoteToAdmin(user.id);

      expect(updatedUser.role).toBe(UserRole.ADMIN);
    });

    test('should throw error when promoting already admin user', async () => {
      await userService.promoteToAdmin(user.id);

      await expect(userService.promoteToAdmin(user.id)).rejects.toThrow(EntityValidationError);
      await expect(userService.promoteToAdmin(user.id)).rejects.toThrow('User is already an admin');
    });

    test('should throw error when promoting inactive user', async () => {
      await userService.deactivateUser(user.id);

      await expect(userService.promoteToAdmin(user.id)).rejects.toThrow(EntityValidationError);
      await expect(userService.promoteToAdmin(user.id)).rejects.toThrow('Cannot promote inactive user to admin');
    });

    test('should demote admin to user', async () => {
      await userService.promoteToAdmin(user.id);
      const demotedUser = await userService.demoteToUser(user.id);

      expect(demotedUser.role).toBe(UserRole.USER);
    });

    test('should throw error when demoting already regular user', async () => {
      await expect(userService.demoteToUser(user.id)).rejects.toThrow(EntityValidationError);
      await expect(userService.demoteToUser(user.id)).rejects.toThrow('User is already a regular user');
    });
  });

  // ===================================
  // Account Status Management Tests
  // ===================================

  describe('Account Status Management', () => {
    let user: User;

    beforeEach(async () => {
      user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });
    });

    test('should deactivate user', async () => {
      const deactivatedUser = await userService.deactivateUser(user.id);

      expect(deactivatedUser.isActive).toBe(false);
    });

    test('should activate user', async () => {
      await userService.deactivateUser(user.id);
      const activatedUser = await userService.activateUser(user.id);

      expect(activatedUser.isActive).toBe(true);
    });

    test('should throw error when deactivating already inactive user', async () => {
      await userService.deactivateUser(user.id);

      await expect(userService.deactivateUser(user.id)).rejects.toThrow(EntityValidationError);
      await expect(userService.deactivateUser(user.id)).rejects.toThrow('User is already inactive');
    });

    test('should throw error when activating already active user', async () => {
      await expect(userService.activateUser(user.id)).rejects.toThrow(EntityValidationError);
      await expect(userService.activateUser(user.id)).rejects.toThrow('User is already active');
    });
  });

  // ===================================
  // Password Management Tests
  // ===================================

  describe('Password Management', () => {
    let user: User;

    beforeEach(async () => {
      user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });
    });

    test('should change password with correct current password', async () => {
      const updatedUser = await userService.changePassword(user.id, 'StrongPass123!', 'NewStrongPass456!');

      expect(updatedUser.passwordHash).toBe('hashed_NewStrongPass456!');
    });

    test('should throw error with incorrect current password', async () => {
      await expect(userService.changePassword(user.id, 'WrongPassword', 'NewStrongPass456!'))
        .rejects.toThrow(EntityValidationError);
      await expect(userService.changePassword(user.id, 'WrongPassword', 'NewStrongPass456!'))
        .rejects.toThrow('Current password is incorrect');
    });

    test('should throw error with weak new password', async () => {
      await expect(userService.changePassword(user.id, 'StrongPass123!', 'weak'))
        .rejects.toThrow(EntityValidationError);
      await expect(userService.changePassword(user.id, 'StrongPass123!', 'weak'))
        .rejects.toThrow('New password validation failed');
    });

    test('should verify correct password', async () => {
      const isValid = await userService.verifyPassword(user.id, 'StrongPass123!');

      expect(isValid).toBe(true);
    });

    test('should reject incorrect password', async () => {
      const isValid = await userService.verifyPassword(user.id, 'WrongPassword');

      expect(isValid).toBe(false);
    });
  });

  // ===================================
  // Availability Check Tests
  // ===================================

  describe('Availability Checks', () => {
    beforeEach(async () => {
      await userService.createUser({
        username: 'existinguser',
        email: 'existing@example.com',
        password: 'StrongPass123!'
      });
    });

    test('should check email availability', async () => {
      const availableEmail = await userService.isEmailAvailable('new@example.com');
      const unavailableEmail = await userService.isEmailAvailable('existing@example.com');

      expect(availableEmail).toBe(true);
      expect(unavailableEmail).toBe(false);
    });

    test('should check username availability', async () => {
      const availableUsername = await userService.isUsernameAvailable('newuser');
      const unavailableUsername = await userService.isUsernameAvailable('existinguser');

      expect(availableUsername).toBe(true);
      expect(unavailableUsername).toBe(false);
    });

    test('should exclude user from availability check', async () => {
      const user = await userService.getUserByEmail('existing@example.com');
      const isAvailable = await userService.isEmailAvailable('existing@example.com', user!.id);

      expect(isAvailable).toBe(true);
    });
  });

  // ===================================
  // Password Validation Tests
  // ===================================

  describe('Password Validation', () => {
    test('should validate strong password', () => {
      const result = userService.validatePassword('StrongPass123!@');

      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('strong');
      expect(result.errors).toHaveLength(0);
    });

    test('should validate medium password', () => {
      const result = userService.validatePassword('StrongPass123!');

      expect(result.isValid).toBe(true);
      expect(result.strength).toBe('medium');
      expect(result.errors).toHaveLength(0);
    });

    test('should reject weak password', () => {
      const result = userService.validatePassword('weak');

      expect(result.isValid).toBe(false);
      expect(result.strength).toBe('weak');
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should provide specific error messages', () => {
      const result = userService.validatePassword('short');

      expect(result.errors).toContain('Password must be at least 8 characters long');
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
      expect(result.errors).toContain('Password must contain at least one number');
      expect(result.errors).toContain('Password must contain at least one special character');
    });
  });

  // ===================================
  // Statistics Tests
  // ===================================

  describe('getUserStatistics', () => {
    beforeEach(async () => {
      await userService.createUser({
        username: 'admin1',
        email: 'admin1@example.com',
        password: 'StrongPass123!',
        role: UserRole.ADMIN
      });

      await userService.createUser({
        username: 'user1',
        email: 'user1@example.com',
        password: 'StrongPass123!',
        role: UserRole.USER
      });

      await userService.createUser({
        username: 'inactive',
        email: 'inactive@example.com',
        password: 'StrongPass123!',
        isActive: false
      });
    });

    test('should return correct statistics', async () => {
      const stats = await userService.getUserStatistics();

      expect(stats.totalUsers).toBe(3);
      expect(stats.activeUsers).toBe(2);
      expect(stats.adminUsers).toBe(1);
      expect(stats.recentlyCreated).toBe(3);
    });
  });

  // ===================================
  // Profile Tests
  // ===================================

  describe('getUserProfile', () => {
    test('should return user profile data', async () => {
      const user = await userService.createUser({
        username: 'testuser',
        email: 'test@example.com',
        password: 'StrongPass123!'
      });

      const profile = await userService.getUserProfile(user.id);

      expect(profile.username).toBe('testuser');
      expect(profile.email).toBe('test@example.com');
      expect(profile.role).toBe(UserRole.USER);
      expect(profile.isActive).toBe(true);
    });

    test('should throw error when user not found', async () => {
      await expect(userService.getUserProfile('nonexistent')).rejects.toThrow(EntityNotFoundError);
    });
  });
});
