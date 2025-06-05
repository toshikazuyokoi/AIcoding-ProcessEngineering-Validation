/**
 * ===================================
 * Mock Services for Testing
 * ===================================
 * Purpose: Comprehensive mock implementations for all services and repositories
 * Features:
 * - Mock implementations for all domain services
 * - Mock implementations for all repositories
 * - Mock implementations for utility services
 * - Configurable mock behaviors and responses
 * - Test data factories and fixtures
 * - Error simulation capabilities
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { User, Task, Category, UserRole, TaskStatus, TaskPriority } from '@prisma/client';

// ===================================
// Type Definitions
// ===================================

/**
 * Mock configuration interface
 */
export interface MockConfig {
  shouldFail?: boolean;
  delay?: number;
  errorMessage?: string;
  errorType?: 'ValidationError' | 'NotFoundError' | 'NetworkError' | 'DatabaseError';
}

/**
 * Authentication result interface
 */
export interface AuthResult {
  user: User;
  tokens: TokenPair;
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
 * Task creation data interface
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: Date;
  categoryIds?: string[];
}

/**
 * Task update data interface
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
  categoryIds?: string[];
}

/**
 * Category creation data interface
 */
export interface CreateCategoryData {
  name: string;
  color: string;
  description?: string;
}

/**
 * Category update data interface
 */
export interface UpdateCategoryData {
  name?: string;
  color?: string;
  description?: string;
}

/**
 * Task filters interface
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  categoryIds?: string[];
  dueAfter?: Date;
  dueBefore?: Date;
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
 * Find many options interface
 */
export interface FindManyOptions {
  skip?: number;
  take?: number;
  orderBy?: any;
  where?: any;
}

// ===================================
// Test Data Factories
// ===================================

/**
 * Test data factory class
 */
export class TestDataFactory {
  /**
   * Create mock user
   */
  static createUser(overrides: Partial<User> = {}): User {
    return {
      id: overrides.id || 'user-1',
      username: overrides.username || 'testuser',
      email: overrides.email || 'test@example.com',
      passwordHash: overrides.passwordHash || '$2b$10$hashedpassword',
      role: overrides.role || UserRole.user,
      isActive: overrides.isActive !== undefined ? overrides.isActive : true,
      createdAt: overrides.createdAt || new Date(),
      updatedAt: overrides.updatedAt || new Date(),
      ...overrides
    };
  }

  /**
   * Create mock task
   */
  static createTask(overrides: Partial<Task> = {}): Task {
    return {
      id: overrides.id || 'task-1',
      userId: overrides.userId || 'user-1',
      title: overrides.title || 'Test Task',
      description: overrides.description || 'Test task description',
      priority: overrides.priority || TaskPriority.medium,
      status: overrides.status || TaskStatus.pending,
      dueDate: overrides.dueDate || null,
      completedAt: overrides.completedAt || null,
      createdAt: overrides.createdAt || new Date(),
      updatedAt: overrides.updatedAt || new Date(),
      ...overrides
    };
  }

  /**
   * Create mock category
   */
  static createCategory(overrides: Partial<Category> = {}): Category {
    return {
      id: overrides.id || 'category-1',
      name: overrides.name || 'Test Category',
      color: overrides.color || '#FF5722',
      description: overrides.description || 'Test category description',
      createdAt: overrides.createdAt || new Date(),
      ...overrides
    };
  }

  /**
   * Create mock auth result
   */
  static createAuthResult(user?: User): AuthResult {
    return {
      user: user || this.createUser(),
      tokens: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresIn: 3600
      }
    };
  }
}

// ===================================
// Mock Base Class
// ===================================

/**
 * Base mock class with common functionality
 */
export class BaseMock {
  protected config: MockConfig;

  constructor(config: MockConfig = {}) {
    this.config = config;
  }

  /**
   * Simulate async operation with optional delay and error
   */
  protected async simulateAsync<T>(operation: () => T): Promise<T> {
    if (this.config.delay) {
      await new Promise(resolve => setTimeout(resolve, this.config.delay));
    }

    if (this.config.shouldFail) {
      const errorMessage = this.config.errorMessage || 'Mock operation failed';
      const error = new Error(errorMessage);
      error.name = this.config.errorType || 'MockError';
      throw error;
    }

    return operation();
  }

  /**
   * Update mock configuration
   */
  public updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

// ===================================
// Mock Repository Implementations
// ===================================

/**
 * Mock User Repository
 */
export class MockUserRepository extends BaseMock {
  private users: User[] = [];

  constructor(config?: MockConfig) {
    super(config);
    // Initialize with default test users
    this.users = [
      TestDataFactory.createUser({ id: 'user-1', email: 'user1@example.com', username: 'user1' }),
      TestDataFactory.createUser({ id: 'user-2', email: 'user2@example.com', username: 'user2', role: UserRole.admin }),
    ];
  }

  async create(userData: CreateUserData): Promise<User> {
    return this.simulateAsync(() => {
      const user = TestDataFactory.createUser({
        id: `user-${this.users.length + 1}`,
        ...userData
      });
      this.users.push(user);
      return user;
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.simulateAsync(() => {
      return this.users.find(user => user.id === id) || null;
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.simulateAsync(() => {
      return this.users.find(user => user.email === email) || null;
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.simulateAsync(() => {
      return this.users.find(user => user.username === username) || null;
    });
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.simulateAsync(() => {
      const userIndex = this.users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }

      this.users[userIndex] = {
        ...this.users[userIndex],
        ...data,
        updatedAt: new Date()
      };

      return this.users[userIndex];
    });
  }

  async delete(id: string): Promise<void> {
    return this.simulateAsync(() => {
      const userIndex = this.users.findIndex(user => user.id === id);
      if (userIndex === -1) {
        throw new Error('User not found');
      }
      this.users.splice(userIndex, 1);
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<User[]> {
    return this.simulateAsync(() => {
      let result = [...this.users];

      if (options.skip) {
        result = result.slice(options.skip);
      }

      if (options.take) {
        result = result.slice(0, options.take);
      }

      return result;
    });
  }

  async count(where?: any): Promise<number> {
    return this.simulateAsync(() => {
      return this.users.length;
    });
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.simulateAsync(() => {
      return this.users.some(user => user.email === email);
    });
  }

  async existsByUsername(username: string): Promise<boolean> {
    return this.simulateAsync(() => {
      return this.users.some(user => user.username === username);
    });
  }

  // Test helper methods
  public addUser(user: User): void {
    this.users.push(user);
  }

  public clearUsers(): void {
    this.users = [];
  }

  public getUsers(): User[] {
    return [...this.users];
  }
}

/**
 * Mock Task Repository
 */
export class MockTaskRepository extends BaseMock {
  private tasks: Task[] = [];

  constructor(config?: MockConfig) {
    super(config);
    // Initialize with default test tasks
    this.tasks = [
      TestDataFactory.createTask({ id: 'task-1', userId: 'user-1', title: 'Test Task 1' }),
      TestDataFactory.createTask({ id: 'task-2', userId: 'user-1', title: 'Test Task 2', status: TaskStatus.completed }),
    ];
  }

  async create(taskData: CreateTaskData & { userId: string }): Promise<Task> {
    return this.simulateAsync(() => {
      const task = TestDataFactory.createTask({
        id: `task-${this.tasks.length + 1}`,
        ...taskData
      });
      this.tasks.push(task);
      return task;
    });
  }

  async findById(id: string): Promise<Task | null> {
    return this.simulateAsync(() => {
      return this.tasks.find(task => task.id === id) || null;
    });
  }

  async findByUserId(userId: string, filters?: TaskFilters): Promise<Task[]> {
    return this.simulateAsync(() => {
      let result = this.tasks.filter(task => task.userId === userId);

      if (filters?.status) {
        result = result.filter(task => task.status === filters.status);
      }

      if (filters?.priority) {
        result = result.filter(task => task.priority === filters.priority);
      }

      if (filters?.search) {
        result = result.filter(task =>
          task.title.toLowerCase().includes(filters.search!.toLowerCase()) ||
          (task.description && task.description.toLowerCase().includes(filters.search!.toLowerCase()))
        );
      }

      return result;
    });
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    return this.simulateAsync(() => {
      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }

      this.tasks[taskIndex] = {
        ...this.tasks[taskIndex],
        ...data,
        updatedAt: new Date()
      };

      return this.tasks[taskIndex];
    });
  }

  async delete(id: string): Promise<void> {
    return this.simulateAsync(() => {
      const taskIndex = this.tasks.findIndex(task => task.id === id);
      if (taskIndex === -1) {
        throw new Error('Task not found');
      }
      this.tasks.splice(taskIndex, 1);
    });
  }

  // Test helper methods
  public addTask(task: Task): void {
    this.tasks.push(task);
  }

  public clearTasks(): void {
    this.tasks = [];
  }

  public getTasks(): Task[] {
    return [...this.tasks];
  }
}

/**
 * Mock Category Repository
 */
export class MockCategoryRepository extends BaseMock {
  private categories: Category[] = [];

  constructor(config?: MockConfig) {
    super(config);
    // Initialize with default test categories
    this.categories = [
      TestDataFactory.createCategory({ id: 'category-1', name: 'Work', color: '#2196F3' }),
      TestDataFactory.createCategory({ id: 'category-2', name: 'Personal', color: '#4CAF50' }),
    ];
  }

  async create(categoryData: CreateCategoryData): Promise<Category> {
    return this.simulateAsync(() => {
      const category = TestDataFactory.createCategory({
        id: `category-${this.categories.length + 1}`,
        ...categoryData
      });
      this.categories.push(category);
      return category;
    });
  }

  async findById(id: string): Promise<Category | null> {
    return this.simulateAsync(() => {
      return this.categories.find(category => category.id === id) || null;
    });
  }

  async findMany(options: FindManyOptions = {}): Promise<Category[]> {
    return this.simulateAsync(() => {
      let result = [...this.categories];

      if (options.skip) {
        result = result.slice(options.skip);
      }

      if (options.take) {
        result = result.slice(0, options.take);
      }

      return result;
    });
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    return this.simulateAsync(() => {
      const categoryIndex = this.categories.findIndex(category => category.id === id);
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }

      this.categories[categoryIndex] = {
        ...this.categories[categoryIndex],
        ...data
      };

      return this.categories[categoryIndex];
    });
  }

  async delete(id: string): Promise<void> {
    return this.simulateAsync(() => {
      const categoryIndex = this.categories.findIndex(category => category.id === id);
      if (categoryIndex === -1) {
        throw new Error('Category not found');
      }
      this.categories.splice(categoryIndex, 1);
    });
  }

  // Test helper methods
  public addCategory(category: Category): void {
    this.categories.push(category);
  }

  public clearCategories(): void {
    this.categories = [];
  }

  public getCategories(): Category[] {
    return [...this.categories];
  }
}

// ===================================
// Mock Domain Service Implementations
// ===================================

/**
 * Mock Authentication Service
 */
export class MockAuthService extends BaseMock {
  private userRepository: MockUserRepository;

  constructor(config?: MockConfig, userRepository?: MockUserRepository) {
    super(config);
    this.userRepository = userRepository || new MockUserRepository();
  }

  async register(userData: CreateUserData): Promise<AuthResult> {
    return this.simulateAsync(async () => {
      // Check if user already exists
      const existingUser = await this.userRepository.findByEmail(userData.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      const user = await this.userRepository.create(userData);
      return TestDataFactory.createAuthResult(user);
    });
  }

  async authenticate(email: string, password: string): Promise<AuthResult> {
    return this.simulateAsync(async () => {
      const user = await this.userRepository.findByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.isActive) {
        throw new Error('Account is deactivated');
      }

      return TestDataFactory.createAuthResult(user);
    });
  }

  async validateToken(token: string): Promise<User> {
    return this.simulateAsync(async () => {
      if (token === 'invalid-token') {
        throw new Error('Invalid token');
      }

      // Return default user for valid tokens
      return TestDataFactory.createUser();
    });
  }

  async generateTokens(user: User): Promise<TokenPair> {
    return this.simulateAsync(() => {
      return {
        accessToken: `access-token-${user.id}`,
        refreshToken: `refresh-token-${user.id}`,
        expiresIn: 3600
      };
    });
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    return this.simulateAsync(() => {
      if (refreshToken === 'invalid-refresh-token') {
        throw new Error('Invalid refresh token');
      }

      return {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresIn: 3600
      };
    });
  }
}

/**
 * Mock Task Service
 */
export class MockTaskService extends BaseMock {
  private taskRepository: MockTaskRepository;
  private userRepository: MockUserRepository;

  constructor(config?: MockConfig, taskRepository?: MockTaskRepository, userRepository?: MockUserRepository) {
    super(config);
    this.taskRepository = taskRepository || new MockTaskRepository();
    this.userRepository = userRepository || new MockUserRepository();
  }

  async createTask(userId: string, taskData: CreateTaskData): Promise<Task> {
    return this.simulateAsync(async () => {
      // Verify user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return await this.taskRepository.create({ ...taskData, userId });
    });
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskData): Promise<Task> {
    return this.simulateAsync(async () => {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.userId !== userId) {
        throw new Error('Unauthorized');
      }

      return await this.taskRepository.update(taskId, data);
    });
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    return this.simulateAsync(async () => {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }

      if (task.userId !== userId) {
        throw new Error('Unauthorized');
      }

      await this.taskRepository.delete(taskId);
    });
  }

  async getTasksByUser(userId: string, filters?: TaskFilters): Promise<Task[]> {
    return this.simulateAsync(async () => {
      return await this.taskRepository.findByUserId(userId, filters);
    });
  }

  async searchTasks(userId: string, query: string): Promise<Task[]> {
    return this.simulateAsync(async () => {
      return await this.taskRepository.findByUserId(userId, { search: query });
    });
  }
}

/**
 * Mock User Service
 */
export class MockUserService extends BaseMock {
  private userRepository: MockUserRepository;

  constructor(config?: MockConfig, userRepository?: MockUserRepository) {
    super(config);
    this.userRepository = userRepository || new MockUserRepository();
  }

  async getUserById(id: string): Promise<User | null> {
    return this.simulateAsync(async () => {
      return await this.userRepository.findById(id);
    });
  }

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return this.simulateAsync(async () => {
      return await this.userRepository.update(id, data);
    });
  }

  async deleteUser(id: string): Promise<void> {
    return this.simulateAsync(async () => {
      await this.userRepository.delete(id);
    });
  }

  async searchUsers(filters: UserSearchFilters): Promise<User[]> {
    return this.simulateAsync(async () => {
      // Simple mock implementation
      const allUsers = await this.userRepository.findMany();
      return allUsers.filter(user => {
        if (filters.email && !user.email.includes(filters.email)) return false;
        if (filters.username && !user.username.includes(filters.username)) return false;
        if (filters.role && user.role !== filters.role) return false;
        if (filters.isActive !== undefined && user.isActive !== filters.isActive) return false;
        return true;
      });
    });
  }
}

/**
 * Mock Category Service
 */
export class MockCategoryService extends BaseMock {
  private categoryRepository: MockCategoryRepository;

  constructor(config?: MockConfig, categoryRepository?: MockCategoryRepository) {
    super(config);
    this.categoryRepository = categoryRepository || new MockCategoryRepository();
  }

  async createCategory(data: CreateCategoryData): Promise<Category> {
    return this.simulateAsync(async () => {
      return await this.categoryRepository.create(data);
    });
  }

  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    return this.simulateAsync(async () => {
      return await this.categoryRepository.update(id, data);
    });
  }

  async deleteCategory(id: string): Promise<void> {
    return this.simulateAsync(async () => {
      await this.categoryRepository.delete(id);
    });
  }

  async getAllCategories(): Promise<Category[]> {
    return this.simulateAsync(async () => {
      return await this.categoryRepository.findMany();
    });
  }
}

/**
 * Mock Email Service
 */
export class MockEmailService extends BaseMock {
  private sentEmails: Array<{ to: string; subject: string; body: string; timestamp: Date }> = [];

  async sendEmail(to: string, subject: string, body: string): Promise<boolean> {
    return this.simulateAsync(() => {
      this.sentEmails.push({
        to,
        subject,
        body,
        timestamp: new Date()
      });
      return true;
    });
  }

  async sendWelcomeEmail(user: User): Promise<boolean> {
    return this.sendEmail(user.email, 'Welcome!', `Welcome ${user.username}!`);
  }

  async sendPasswordResetEmail(user: User, resetToken: string): Promise<boolean> {
    return this.sendEmail(user.email, 'Password Reset', `Reset token: ${resetToken}`);
  }

  // Test helper methods
  public getSentEmails() {
    return [...this.sentEmails];
  }

  public clearSentEmails(): void {
    this.sentEmails = [];
  }
}

/**
 * Mock Notification Service
 */
export class MockNotificationService extends BaseMock {
  private notifications: Array<{ userId: string; message: string; type: string; timestamp: Date }> = [];

  async sendNotification(userId: string, message: string, type: string = 'info'): Promise<boolean> {
    return this.simulateAsync(() => {
      this.notifications.push({
        userId,
        message,
        type,
        timestamp: new Date()
      });
      return true;
    });
  }

  async sendTaskReminder(userId: string, task: Task): Promise<boolean> {
    return this.sendNotification(userId, `Reminder: ${task.title}`, 'reminder');
  }

  async sendTaskCompleted(userId: string, task: Task): Promise<boolean> {
    return this.sendNotification(userId, `Task completed: ${task.title}`, 'success');
  }

  // Test helper methods
  public getNotifications() {
    return [...this.notifications];
  }

  public clearNotifications(): void {
    this.notifications = [];
  }
}

/**
 * Mock Cache Service
 */
export class MockCacheService extends BaseMock {
  private cache: Map<string, { value: any; expiry: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    return this.simulateAsync(() => {
      const item = this.cache.get(key);
      if (!item) return null;

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return null;
      }

      return item.value;
    });
  }

  async set<T>(key: string, value: T, ttl: number = 3600): Promise<boolean> {
    return this.simulateAsync(() => {
      this.cache.set(key, {
        value,
        expiry: Date.now() + (ttl * 1000)
      });
      return true;
    });
  }

  async delete(key: string): Promise<boolean> {
    return this.simulateAsync(() => {
      return this.cache.delete(key);
    });
  }

  async exists(key: string): Promise<boolean> {
    return this.simulateAsync(() => {
      const item = this.cache.get(key);
      if (!item) return false;

      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        return false;
      }

      return true;
    });
  }

  async clear(): Promise<boolean> {
    return this.simulateAsync(() => {
      this.cache.clear();
      return true;
    });
  }

  async invalidatePattern(pattern: string): Promise<number> {
    return this.simulateAsync(() => {
      let count = 0;
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
          count++;
        }
      }
      return count;
    });
  }

  // Test helper methods
  public getCacheSize(): number {
    return this.cache.size;
  }

  public getCacheKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// ===================================
// Mock Factory and Exports
// ===================================

/**
 * Mock factory for creating configured mock instances
 */
export class MockFactory {
  /**
   * Create a complete set of mock services
   */
  static createMockServices(config?: MockConfig) {
    const userRepository = new MockUserRepository(config);
    const taskRepository = new MockTaskRepository(config);
    const categoryRepository = new MockCategoryRepository(config);

    const authService = new MockAuthService(config, userRepository);
    const taskService = new MockTaskService(config, taskRepository, userRepository);
    const userService = new MockUserService(config, userRepository);
    const categoryService = new MockCategoryService(config, categoryRepository);
    const emailService = new MockEmailService(config);
    const notificationService = new MockNotificationService(config);
    const cacheService = new MockCacheService(config);

    return {
      // Repositories
      userRepository,
      taskRepository,
      categoryRepository,

      // Domain Services
      authService,
      taskService,
      userService,
      categoryService,
      emailService,
      notificationService,

      // Utility Services
      cacheService
    };
  }

  /**
   * Create mock services with failure configuration
   */
  static createFailingMockServices(errorType: string = 'MockError', errorMessage: string = 'Mock operation failed') {
    return this.createMockServices({
      shouldFail: true,
      errorType: errorType as any,
      errorMessage
    });
  }

  /**
   * Create mock services with delay configuration
   */
  static createSlowMockServices(delay: number = 1000) {
    return this.createMockServices({
      delay
    });
  }
}

// Default export
export default MockFactory;
