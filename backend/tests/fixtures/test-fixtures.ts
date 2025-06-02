/**
 * Test Fixtures
 * 
 * Comprehensive test data fixtures for the Task Management System
 * Provides consistent, reusable test data for all test scenarios
 * 
 * @fileoverview Test fixtures for users, tasks, categories, and relationships
 * @version 1.0.0
 * @since 2025-02-01
 */

import { User, Task, Category, TaskCategory, UserRole, TaskPriority, TaskStatus } from '@prisma/client';

// ===================================
// Type Definitions
// ===================================

/**
 * Test fixture configuration options
 */
export interface FixtureOptions {
  /** Override default values */
  overrides?: Partial<any>;
  /** Generate unique IDs */
  generateIds?: boolean;
  /** Include timestamps */
  includeTimestamps?: boolean;
}

/**
 * User fixture data without relations
 */
export type UserFixture = Omit<User, 'tasks'>;

/**
 * Task fixture data without relations
 */
export type TaskFixture = Omit<Task, 'user' | 'taskCategories'>;

/**
 * Category fixture data without relations
 */
export type CategoryFixture = Omit<Category, 'taskCategories'>;

/**
 * TaskCategory fixture data without relations
 */
export type TaskCategoryFixture = Omit<TaskCategory, 'task' | 'category'>;

// ===================================
// Base Fixture Data
// ===================================

/**
 * Default timestamps for consistent testing
 */
export const DEFAULT_TIMESTAMPS = {
  createdAt: new Date('2025-01-01T00:00:00.000Z'),
  updatedAt: new Date('2025-01-01T00:00:00.000Z')
};

/**
 * Test date constants
 */
export const TEST_DATES = {
  PAST_DATE: new Date('2024-12-01T00:00:00.000Z'),
  CURRENT_DATE: new Date('2025-01-15T12:00:00.000Z'),
  FUTURE_DATE: new Date('2025-12-31T23:59:59.000Z'),
  OVERDUE_DATE: new Date('2024-11-30T23:59:59.000Z'),
  TOMORROW: new Date('2025-01-16T12:00:00.000Z'),
  NEXT_WEEK: new Date('2025-01-22T12:00:00.000Z'),
  NEXT_MONTH: new Date('2025-02-15T12:00:00.000Z')
};

// ===================================
// User Fixtures
// ===================================

/**
 * Base user fixture
 */
export const BASE_USER: UserFixture = {
  id: 'user-test-001',
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: '$2b$10$hashedPasswordForTesting',
  role: UserRole.user,
  isActive: true,
  ...DEFAULT_TIMESTAMPS
};

/**
 * Admin user fixture
 */
export const ADMIN_USER: UserFixture = {
  id: 'user-admin-001',
  username: 'admin',
  email: 'admin@example.com',
  passwordHash: '$2b$10$hashedAdminPasswordForTesting',
  role: UserRole.admin,
  isActive: true,
  ...DEFAULT_TIMESTAMPS
};

/**
 * Inactive user fixture
 */
export const INACTIVE_USER: UserFixture = {
  id: 'user-inactive-001',
  username: 'inactiveuser',
  email: 'inactive@example.com',
  passwordHash: '$2b$10$hashedInactivePasswordForTesting',
  role: UserRole.user,
  isActive: false,
  ...DEFAULT_TIMESTAMPS
};

/**
 * Additional test users
 */
export const TEST_USERS: UserFixture[] = [
  {
    id: 'user-john-001',
    username: 'john_doe',
    email: 'john.doe@example.com',
    passwordHash: '$2b$10$hashedJohnPasswordForTesting',
    role: UserRole.user,
    isActive: true,
    ...DEFAULT_TIMESTAMPS
  },
  {
    id: 'user-jane-001',
    username: 'jane_smith',
    email: 'jane.smith@example.com',
    passwordHash: '$2b$10$hashedJanePasswordForTesting',
    role: UserRole.user,
    isActive: true,
    ...DEFAULT_TIMESTAMPS
  },
  {
    id: 'user-demo-001',
    username: 'demo_user',
    email: 'demo@example.com',
    passwordHash: '$2b$10$hashedDemoPasswordForTesting',
    role: UserRole.user,
    isActive: true,
    ...DEFAULT_TIMESTAMPS
  }
];

// ===================================
// Category Fixtures
// ===================================

/**
 * Work category fixture
 */
export const WORK_CATEGORY: CategoryFixture = {
  id: 'cat-work-001',
  name: 'Work',
  color: '#3B82F6',
  description: 'Work-related tasks and projects',
  createdAt: DEFAULT_TIMESTAMPS.createdAt
};

/**
 * Personal category fixture
 */
export const PERSONAL_CATEGORY: CategoryFixture = {
  id: 'cat-personal-001',
  name: 'Personal',
  color: '#10B981',
  description: 'Personal tasks and activities',
  createdAt: DEFAULT_TIMESTAMPS.createdAt
};

/**
 * Shopping category fixture
 */
export const SHOPPING_CATEGORY: CategoryFixture = {
  id: 'cat-shopping-001',
  name: 'Shopping',
  color: '#F59E0B',
  description: 'Shopping lists and purchases',
  createdAt: DEFAULT_TIMESTAMPS.createdAt
};

/**
 * Health category fixture
 */
export const HEALTH_CATEGORY: CategoryFixture = {
  id: 'cat-health-001',
  name: 'Health',
  color: '#EF4444',
  description: 'Health and fitness related tasks',
  createdAt: DEFAULT_TIMESTAMPS.createdAt
};

/**
 * All test categories
 */
export const TEST_CATEGORIES: CategoryFixture[] = [
  WORK_CATEGORY,
  PERSONAL_CATEGORY,
  SHOPPING_CATEGORY,
  HEALTH_CATEGORY,
  {
    id: 'cat-learning-001',
    name: 'Learning',
    color: '#8B5CF6',
    description: 'Educational and learning activities',
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    id: 'cat-home-001',
    name: 'Home',
    color: '#06B6D4',
    description: 'Home maintenance and household tasks',
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  }
];

// ===================================
// Task Fixtures
// ===================================

/**
 * Pending task fixture
 */
export const PENDING_TASK: TaskFixture = {
  id: 'task-pending-001',
  userId: BASE_USER.id,
  title: 'Pending Task',
  description: 'This is a pending task for testing',
  priority: TaskPriority.medium,
  status: TaskStatus.pending,
  dueDate: TEST_DATES.FUTURE_DATE,
  completedAt: null,
  ...DEFAULT_TIMESTAMPS
};

/**
 * In progress task fixture
 */
export const IN_PROGRESS_TASK: TaskFixture = {
  id: 'task-progress-001',
  userId: BASE_USER.id,
  title: 'In Progress Task',
  description: 'This task is currently being worked on',
  priority: TaskPriority.high,
  status: TaskStatus.in_progress,
  dueDate: TEST_DATES.NEXT_WEEK,
  completedAt: null,
  ...DEFAULT_TIMESTAMPS
};

/**
 * Completed task fixture
 */
export const COMPLETED_TASK: TaskFixture = {
  id: 'task-completed-001',
  userId: BASE_USER.id,
  title: 'Completed Task',
  description: 'This task has been completed',
  priority: TaskPriority.low,
  status: TaskStatus.completed,
  dueDate: TEST_DATES.PAST_DATE,
  completedAt: TEST_DATES.CURRENT_DATE,
  ...DEFAULT_TIMESTAMPS
};

/**
 * Overdue task fixture
 */
export const OVERDUE_TASK: TaskFixture = {
  id: 'task-overdue-001',
  userId: BASE_USER.id,
  title: 'Overdue Task',
  description: 'This task is overdue',
  priority: TaskPriority.high,
  status: TaskStatus.pending,
  dueDate: TEST_DATES.OVERDUE_DATE,
  completedAt: null,
  ...DEFAULT_TIMESTAMPS
};

/**
 * High priority task fixture
 */
export const HIGH_PRIORITY_TASK: TaskFixture = {
  id: 'task-high-001',
  userId: BASE_USER.id,
  title: 'High Priority Task',
  description: 'This is an urgent task',
  priority: TaskPriority.high,
  status: TaskStatus.pending,
  dueDate: TEST_DATES.TOMORROW,
  completedAt: null,
  ...DEFAULT_TIMESTAMPS
};

/**
 * Task without due date fixture
 */
export const NO_DUE_DATE_TASK: TaskFixture = {
  id: 'task-no-due-001',
  userId: BASE_USER.id,
  title: 'Task Without Due Date',
  description: 'This task has no specific due date',
  priority: TaskPriority.low,
  status: TaskStatus.pending,
  dueDate: null,
  completedAt: null,
  ...DEFAULT_TIMESTAMPS
};

/**
 * All test tasks
 */
export const TEST_TASKS: TaskFixture[] = [
  PENDING_TASK,
  IN_PROGRESS_TASK,
  COMPLETED_TASK,
  OVERDUE_TASK,
  HIGH_PRIORITY_TASK,
  NO_DUE_DATE_TASK,
  {
    id: 'task-work-001',
    userId: TEST_USERS[0].id,
    title: 'Complete Project Proposal',
    description: 'Finish writing the Q2 project proposal document',
    priority: TaskPriority.high,
    status: TaskStatus.in_progress,
    dueDate: TEST_DATES.NEXT_WEEK,
    completedAt: null,
    ...DEFAULT_TIMESTAMPS
  },
  {
    id: 'task-personal-001',
    userId: TEST_USERS[1].id,
    title: 'Buy Groceries',
    description: 'Weekly grocery shopping - milk, bread, fruits, vegetables',
    priority: TaskPriority.medium,
    status: TaskStatus.pending,
    dueDate: TEST_DATES.TOMORROW,
    completedAt: null,
    ...DEFAULT_TIMESTAMPS
  }
];

// ===================================
// TaskCategory Fixtures
// ===================================

/**
 * Task-Category relationship fixtures
 */
export const TEST_TASK_CATEGORIES: TaskCategoryFixture[] = [
  {
    taskId: PENDING_TASK.id,
    categoryId: WORK_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    taskId: IN_PROGRESS_TASK.id,
    categoryId: WORK_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    taskId: COMPLETED_TASK.id,
    categoryId: PERSONAL_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    taskId: OVERDUE_TASK.id,
    categoryId: HEALTH_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    taskId: 'task-work-001',
    categoryId: WORK_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    taskId: 'task-personal-001',
    categoryId: PERSONAL_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  },
  {
    taskId: 'task-personal-001',
    categoryId: SHOPPING_CATEGORY.id,
    createdAt: DEFAULT_TIMESTAMPS.createdAt
  }
];

// ===================================
// Fixture Factory Functions
// ===================================

/**
 * Generate unique ID with prefix
 */
export function generateId(prefix: string, index?: number): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const suffix = index !== undefined ? `-${index}` : '';
  return `${prefix}-${timestamp}-${random}${suffix}`;
}

/**
 * Create user fixture with options
 */
export function createUserFixture(options: FixtureOptions = {}): UserFixture {
  const { overrides = {}, generateIds = false, includeTimestamps = true } = options;

  const baseUser = { ...BASE_USER };

  if (generateIds) {
    baseUser.id = generateId('user');
  }

  if (!includeTimestamps) {
    delete (baseUser as any).createdAt;
    delete (baseUser as any).updatedAt;
  }

  return {
    ...baseUser,
    ...overrides
  };
}

/**
 * Create task fixture with options
 */
export function createTaskFixture(options: FixtureOptions = {}): TaskFixture {
  const { overrides = {}, generateIds = false, includeTimestamps = true } = options;

  const baseTask = { ...PENDING_TASK };

  if (generateIds) {
    baseTask.id = generateId('task');
    baseTask.userId = generateId('user');
  }

  if (!includeTimestamps) {
    delete (baseTask as any).createdAt;
    delete (baseTask as any).updatedAt;
  }

  return {
    ...baseTask,
    ...overrides
  };
}

/**
 * Create category fixture with options
 */
export function createCategoryFixture(options: FixtureOptions = {}): CategoryFixture {
  const { overrides = {}, generateIds = false, includeTimestamps = true } = options;

  const baseCategory = { ...WORK_CATEGORY };

  if (generateIds) {
    baseCategory.id = generateId('cat');
  }

  if (!includeTimestamps) {
    delete (baseCategory as any).createdAt;
  }

  return {
    ...baseCategory,
    ...overrides
  };
}

/**
 * Create task-category relationship fixture with options
 */
export function createTaskCategoryFixture(options: FixtureOptions = {}): TaskCategoryFixture {
  const { overrides = {}, generateIds = false, includeTimestamps = true } = options;

  const baseTaskCategory = { ...TEST_TASK_CATEGORIES[0] };

  if (generateIds) {
    baseTaskCategory.taskId = generateId('task');
    baseTaskCategory.categoryId = generateId('cat');
  }

  if (!includeTimestamps) {
    delete (baseTaskCategory as any).createdAt;
  }

  return {
    ...baseTaskCategory,
    ...overrides
  };
}

/**
 * Create multiple user fixtures
 */
export function createUserFixtures(count: number, options: FixtureOptions = {}): UserFixture[] {
  return Array.from({ length: count }, (_, index) =>
    createUserFixture({
      ...options,
      overrides: {
        ...options.overrides,
        id: generateId('user', index),
        username: `testuser${index + 1}`,
        email: `test${index + 1}@example.com`
      }
    })
  );
}

/**
 * Create multiple task fixtures
 */
export function createTaskFixtures(count: number, userId: string, options: FixtureOptions = {}): TaskFixture[] {
  return Array.from({ length: count }, (_, index) =>
    createTaskFixture({
      ...options,
      overrides: {
        ...options.overrides,
        id: generateId('task', index),
        userId,
        title: `Test Task ${index + 1}`,
        description: `Test task ${index + 1} description`
      }
    })
  );
}

/**
 * Create multiple category fixtures
 */
export function createCategoryFixtures(count: number, options: FixtureOptions = {}): CategoryFixture[] {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

  return Array.from({ length: count }, (_, index) =>
    createCategoryFixture({
      ...options,
      overrides: {
        ...options.overrides,
        id: generateId('cat', index),
        name: `Test Category ${index + 1}`,
        color: colors[index % colors.length],
        description: `Test category ${index + 1} description`
      }
    })
  );
}

// ===================================
// Validation Helpers
// ===================================

/**
 * Validate user fixture data
 */
export function validateUserFixture(user: UserFixture): boolean {
  return !!(
    user.id &&
    user.username &&
    user.email &&
    user.passwordHash &&
    user.role &&
    typeof user.isActive === 'boolean'
  );
}

/**
 * Validate task fixture data
 */
export function validateTaskFixture(task: TaskFixture): boolean {
  return !!(
    task.id &&
    task.userId &&
    task.title &&
    task.priority &&
    task.status
  );
}

/**
 * Validate category fixture data
 */
export function validateCategoryFixture(category: CategoryFixture): boolean {
  return !!(
    category.id &&
    category.name &&
    category.color &&
    category.color.match(/^#[0-9A-Fa-f]{6}$/)
  );
}

// ===================================
// Export Collections
// ===================================

/**
 * All fixture collections for easy access
 */
export const FIXTURES = {
  users: {
    base: BASE_USER,
    admin: ADMIN_USER,
    inactive: INACTIVE_USER,
    all: [BASE_USER, ADMIN_USER, INACTIVE_USER, ...TEST_USERS]
  },
  tasks: {
    pending: PENDING_TASK,
    inProgress: IN_PROGRESS_TASK,
    completed: COMPLETED_TASK,
    overdue: OVERDUE_TASK,
    highPriority: HIGH_PRIORITY_TASK,
    noDueDate: NO_DUE_DATE_TASK,
    all: TEST_TASKS
  },
  categories: {
    work: WORK_CATEGORY,
    personal: PERSONAL_CATEGORY,
    shopping: SHOPPING_CATEGORY,
    health: HEALTH_CATEGORY,
    all: TEST_CATEGORIES
  },
  taskCategories: {
    all: TEST_TASK_CATEGORIES
  },
  dates: TEST_DATES
};

/**
 * Factory functions collection
 */
export const FACTORIES = {
  user: createUserFixture,
  task: createTaskFixture,
  category: createCategoryFixture,
  taskCategory: createTaskCategoryFixture,
  users: createUserFixtures,
  tasks: createTaskFixtures,
  categories: createCategoryFixtures
};

/**
 * Validation functions collection
 */
export const VALIDATORS = {
  user: validateUserFixture,
  task: validateTaskFixture,
  category: validateCategoryFixture
};
