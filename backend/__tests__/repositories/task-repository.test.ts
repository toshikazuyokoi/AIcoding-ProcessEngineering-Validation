/**
 * Task Repository Test Suite
 * 
 * Comprehensive tests for task repository implementation
 * Tests task-specific operations, filtering, search, and status management
 * 
 * @fileoverview Test suite for TaskRepository class
 * @version 1.0.0
 * @since 2025-02-01
 */

import { Task, TaskPriority, TaskStatus } from '@prisma/client';
import { TaskRepository, CreateTaskData, UpdateTaskData, TaskSearchFilters } from '../../src/repositories/task-repository';
import { ValidationError, NotFoundError } from '../../src/utils/error-handler';

// Mock dependencies
jest.mock('../../src/utils/database-connection');
jest.mock('../../src/utils/logger');

// Test data
const mockTask: Task = {
  id: 'task-123',
  userId: 'user-123',
  title: 'Test Task',
  description: 'Test task description',
  priority: TaskPriority.medium,
  status: TaskStatus.pending,
  dueDate: new Date('2025-12-31T23:59:59Z'),
  completedAt: null,
  createdAt: new Date('2025-01-01T00:00:00Z'),
  updatedAt: new Date('2025-01-01T00:00:00Z')
};

const mockHighPriorityTask: Task = {
  id: 'task-456',
  userId: 'user-123',
  title: 'High Priority Task',
  description: 'Urgent task',
  priority: TaskPriority.high,
  status: TaskStatus.in_progress,
  dueDate: new Date('2025-02-15T12:00:00Z'),
  completedAt: null,
  createdAt: new Date('2025-01-02T00:00:00Z'),
  updatedAt: new Date('2025-01-02T00:00:00Z')
};

const mockCompletedTask: Task = {
  id: 'task-789',
  userId: 'user-123',
  title: 'Completed Task',
  description: 'This task is done',
  priority: TaskPriority.low,
  status: TaskStatus.completed,
  dueDate: new Date('2025-01-15T10:00:00Z'),
  completedAt: new Date('2025-01-15T09:30:00Z'),
  createdAt: new Date('2025-01-03T00:00:00Z'),
  updatedAt: new Date('2025-01-15T09:30:00Z')
};

const mockOverdueTask: Task = {
  id: 'task-overdue',
  userId: 'user-123',
  title: 'Overdue Task',
  description: 'This task is overdue',
  priority: TaskPriority.high,
  status: TaskStatus.pending,
  dueDate: new Date('2024-12-31T23:59:59Z'), // Past date
  completedAt: null,
  createdAt: new Date('2024-12-01T00:00:00Z'),
  updatedAt: new Date('2024-12-01T00:00:00Z')
};

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let mockPrisma: any;
  let mockTaskModel: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Prisma task model
    mockTaskModel = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    mockPrisma = {
      task: mockTaskModel
    };

    // Mock getPrismaClient
    (require('../../src/utils/database-connection').getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

    // Create repository instance
    repository = new TaskRepository();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with task-specific configuration', () => {
      const config = repository.getConfig();

      expect(config.enableCaching).toBe(true);
      expect(config.cacheTimeout).toBe(300);
      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(true);
    });

    test('should return correct model name', () => {
      expect(repository.getModelName()).toBe('Task');
    });
  });

  describe('User-based Task Operations', () => {
    test('should find tasks by user ID successfully', async () => {
      const userTasks = [mockTask, mockHighPriorityTask];
      mockTaskModel.findMany.mockResolvedValue(userTasks);

      const result = await repository.findByUserId('user-123');

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(userTasks);
    });

    test('should return empty array when no tasks found for user', async () => {
      mockTaskModel.findMany.mockResolvedValue([]);

      const result = await repository.findByUserId('user-456');

      expect(result).toEqual([]);
    });

    test('should throw ValidationError for empty user ID', async () => {
      await expect(repository.findByUserId('')).rejects.toThrow(ValidationError);
      await expect(repository.findByUserId('   ')).rejects.toThrow(ValidationError);
    });

    test('should find tasks with additional filters', async () => {
      const userTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(userTasks);

      const options = {
        where: { priority: TaskPriority.medium },
        take: 10
      };

      const result = await repository.findByUserId('user-123', options);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', priority: TaskPriority.medium },
        orderBy: undefined,
        skip: undefined,
        take: 10,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(userTasks);
    });
  });

  describe('Filtered Task Search', () => {
    test('should find tasks with title filter', async () => {
      const filteredTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const filters: TaskSearchFilters = {
        title: 'Test'
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          title: {
            contains: 'Test',
            mode: 'insensitive'
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(filteredTasks);
    });

    test('should find tasks with description filter', async () => {
      const filteredTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const filters: TaskSearchFilters = {
        description: 'description'
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          description: {
            contains: 'description',
            mode: 'insensitive'
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(filteredTasks);
    });

    test('should find tasks with priority and status filters', async () => {
      const filteredTasks = [mockHighPriorityTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const filters: TaskSearchFilters = {
        priority: TaskPriority.high,
        status: TaskStatus.in_progress
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          priority: TaskPriority.high,
          status: TaskStatus.in_progress
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(filteredTasks);
    });

    test('should find tasks with due date range filter', async () => {
      const filteredTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const dueDateFrom = new Date('2025-01-01');
      const dueDateTo = new Date('2025-12-31');

      const filters: TaskSearchFilters = {
        dueDateFrom,
        dueDateTo
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          dueDate: {
            gte: dueDateFrom,
            lte: dueDateTo
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(filteredTasks);
    });

    test('should find tasks with creation date range filter', async () => {
      const filteredTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const createdAfter = new Date('2025-01-01');
      const createdBefore = new Date('2025-01-31');

      const filters: TaskSearchFilters = {
        createdAfter,
        createdBefore
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          createdAt: {
            gte: createdAfter,
            lte: createdBefore
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(filteredTasks);
    });

    test('should find overdue tasks with isOverdue filter', async () => {
      const overdueDate = new Date();
      const filteredTasks = [mockOverdueTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const filters: TaskSearchFilters = {
        isOverdue: true
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      const expectedCall = mockTaskModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.userId).toBe('user-123');
      expect(expectedCall.where.dueDate.lt).toBeInstanceOf(Date);
      expect(expectedCall.where.status.not).toBe(TaskStatus.completed);
      expect(result).toEqual(filteredTasks);
    });

    test('should find tasks with combined filters', async () => {
      const filteredTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(filteredTasks);

      const filters: TaskSearchFilters = {
        title: 'Test',
        priority: TaskPriority.medium,
        status: TaskStatus.pending,
        dueDateFrom: new Date('2025-01-01')
      };

      const result = await repository.findByUserIdWithFilters('user-123', filters);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          title: {
            contains: 'Test',
            mode: 'insensitive'
          },
          priority: TaskPriority.medium,
          status: TaskStatus.pending,
          dueDate: {
            gte: new Date('2025-01-01')
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(filteredTasks);
    });

    test('should throw ValidationError for empty user ID in filtered search', async () => {
      const filters: TaskSearchFilters = { title: 'Test' };

      await expect(repository.findByUserIdWithFilters('', filters)).rejects.toThrow(ValidationError);
    });
  });

  describe('Task with Categories', () => {
    test('should find task by ID with categories', async () => {
      const taskWithCategories = {
        ...mockTask,
        taskCategories: [
          {
            categoryId: 'cat-1',
            category: {
              id: 'cat-1',
              name: 'Work',
              color: '#FF0000',
              description: 'Work related tasks'
            }
          }
        ]
      };

      mockTaskModel.findUnique.mockResolvedValue(taskWithCategories);

      const result = await repository.findByIdWithCategories('task-123');

      expect(mockTaskModel.findUnique).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        include: {
          taskCategories: {
            include: {
              category: {
                select: {
                  id: true,
                  name: true,
                  color: true,
                  description: true
                }
              }
            }
          }
        }
      });
      expect(result).toEqual(taskWithCategories);
    });

    test('should return null when task not found with categories', async () => {
      mockTaskModel.findUnique.mockResolvedValue(null);

      const result = await repository.findByIdWithCategories('nonexistent');

      expect(result).toBeNull();
    });

    test('should throw ValidationError for empty task ID', async () => {
      await expect(repository.findByIdWithCategories('')).rejects.toThrow(ValidationError);
    });
  });

  describe('Task Search', () => {
    test('should search tasks by query in title', async () => {
      const searchResults = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(searchResults);

      const result = await repository.searchTasks('user-123', 'Test');

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          OR: [
            {
              title: {
                contains: 'Test',
                mode: 'insensitive'
              }
            },
            {
              description: {
                contains: 'Test',
                mode: 'insensitive'
              }
            }
          ]
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(searchResults);
    });

    test('should search tasks by query in description', async () => {
      const searchResults = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(searchResults);

      const result = await repository.searchTasks('user-123', 'description');

      expect(result).toEqual(searchResults);
    });

    test('should trim search query', async () => {
      const searchResults = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(searchResults);

      await repository.searchTasks('user-123', '  Test  ');

      const expectedCall = mockTaskModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.OR[0].title.contains).toBe('Test');
    });

    test('should throw ValidationError for empty user ID in search', async () => {
      await expect(repository.searchTasks('', 'query')).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for empty search query', async () => {
      await expect(repository.searchTasks('user-123', '')).rejects.toThrow(ValidationError);
      await expect(repository.searchTasks('user-123', '   ')).rejects.toThrow(ValidationError);
    });
  });

  describe('Status-based Operations', () => {
    test('should find tasks by status', async () => {
      const pendingTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(pendingTasks);

      const result = await repository.findByStatus(TaskStatus.pending);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { status: TaskStatus.pending },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(pendingTasks);
    });

    test('should find completed tasks for user', async () => {
      const completedTasks = [mockCompletedTask];
      mockTaskModel.findMany.mockResolvedValue(completedTasks);

      const result = await repository.findCompletedTasks('user-123');

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', status: TaskStatus.completed },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(completedTasks);
    });

    test('should find pending tasks for user', async () => {
      const pendingTasks = [mockTask];
      mockTaskModel.findMany.mockResolvedValue(pendingTasks);

      const result = await repository.findPendingTasks('user-123');

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123', status: TaskStatus.pending },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(pendingTasks);
    });

    test('should throw ValidationError for empty user ID in status operations', async () => {
      await expect(repository.findCompletedTasks('')).rejects.toThrow(ValidationError);
      await expect(repository.findPendingTasks('')).rejects.toThrow(ValidationError);
    });
  });

  describe('Priority-based Operations', () => {
    test('should find tasks by priority', async () => {
      const highPriorityTasks = [mockHighPriorityTask];
      mockTaskModel.findMany.mockResolvedValue(highPriorityTasks);

      const result = await repository.findByPriority(TaskPriority.high);

      expect(mockTaskModel.findMany).toHaveBeenCalledWith({
        where: { priority: TaskPriority.high },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      expect(result).toEqual(highPriorityTasks);
    });
  });

  describe('Overdue Tasks', () => {
    test('should find overdue tasks for specific user', async () => {
      const overdueTasks = [mockOverdueTask];
      mockTaskModel.findMany.mockResolvedValue(overdueTasks);

      const result = await repository.findOverdueTasks('user-123');

      const expectedCall = mockTaskModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.userId).toBe('user-123');
      expect(expectedCall.where.dueDate.lt).toBeInstanceOf(Date);
      expect(expectedCall.where.status.not).toBe(TaskStatus.completed);
      expect(result).toEqual(overdueTasks);
    });

    test('should find overdue tasks for all users', async () => {
      const overdueTasks = [mockOverdueTask];
      mockTaskModel.findMany.mockResolvedValue(overdueTasks);

      const result = await repository.findOverdueTasks();

      const expectedCall = mockTaskModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.userId).toBeUndefined();
      expect(expectedCall.where.dueDate.lt).toBeInstanceOf(Date);
      expect(expectedCall.where.status.not).toBe(TaskStatus.completed);
      expect(result).toEqual(overdueTasks);
    });
  });

  describe('Count Operations', () => {
    test('should count tasks by status for user', async () => {
      mockTaskModel.count.mockResolvedValue(5);

      const count = await repository.countByStatus('user-123', TaskStatus.pending);

      expect(mockTaskModel.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', status: TaskStatus.pending }
      });
      expect(count).toBe(5);
    });

    test('should count tasks by priority for user', async () => {
      mockTaskModel.count.mockResolvedValue(3);

      const count = await repository.countByPriority('user-123', TaskPriority.high);

      expect(mockTaskModel.count).toHaveBeenCalledWith({
        where: { userId: 'user-123', priority: TaskPriority.high }
      });
      expect(count).toBe(3);
    });

    test('should count overdue tasks for user', async () => {
      mockTaskModel.count.mockResolvedValue(2);

      const count = await repository.countOverdueTasks('user-123');

      const expectedCall = mockTaskModel.count.mock.calls[0][0];
      expect(expectedCall.where.userId).toBe('user-123');
      expect(expectedCall.where.dueDate.lt).toBeInstanceOf(Date);
      expect(expectedCall.where.status.not).toBe(TaskStatus.completed);
      expect(count).toBe(2);
    });

    test('should throw ValidationError for empty user ID in count operations', async () => {
      await expect(repository.countByStatus('', TaskStatus.pending)).rejects.toThrow(ValidationError);
      await expect(repository.countByPriority('', TaskPriority.high)).rejects.toThrow(ValidationError);
      await expect(repository.countOverdueTasks('')).rejects.toThrow(ValidationError);
    });
  });

  describe('Status Update Operations', () => {
    test('should mark task as completed', async () => {
      const completedTask = { ...mockTask, status: TaskStatus.completed, completedAt: new Date() };
      mockTaskModel.findUnique.mockResolvedValue(mockTask); // exists check
      mockTaskModel.update.mockResolvedValue(completedTask);

      const result = await repository.markAsCompleted('task-123');

      expect(mockTaskModel.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: {
          status: TaskStatus.completed,
          completedAt: expect.any(Date)
        }
      });
      expect(result).toEqual(completedTask);
    });

    test('should mark task as pending', async () => {
      const pendingTask = { ...mockCompletedTask, status: TaskStatus.pending, completedAt: null };
      mockTaskModel.findUnique.mockResolvedValue(mockCompletedTask); // exists check
      mockTaskModel.update.mockResolvedValue(pendingTask);

      const result = await repository.markAsPending('task-789');

      expect(mockTaskModel.update).toHaveBeenCalledWith({
        where: { id: 'task-789' },
        data: {
          status: TaskStatus.pending,
          completedAt: null
        }
      });
      expect(result).toEqual(pendingTask);
    });

    test('should mark task as in progress', async () => {
      const inProgressTask = { ...mockTask, status: TaskStatus.in_progress };
      mockTaskModel.findUnique.mockResolvedValue(mockTask); // exists check
      mockTaskModel.update.mockResolvedValue(inProgressTask);

      const result = await repository.markAsInProgress('task-123');

      expect(mockTaskModel.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: {
          status: TaskStatus.in_progress,
          completedAt: null
        }
      });
      expect(result).toEqual(inProgressTask);
    });

    test('should update task priority', async () => {
      const highPriorityTask = { ...mockTask, priority: TaskPriority.high };
      mockTaskModel.findUnique.mockResolvedValue(mockTask); // exists check
      mockTaskModel.update.mockResolvedValue(highPriorityTask);

      const result = await repository.updatePriority('task-123', TaskPriority.high);

      expect(mockTaskModel.update).toHaveBeenCalledWith({
        where: { id: 'task-123' },
        data: { priority: TaskPriority.high }
      });
      expect(result).toEqual(highPriorityTask);
    });
  });

  describe('Data Preparation and Validation', () => {
    test('should create task with valid data', async () => {
      const createData: CreateTaskData = {
        userId: 'user-123',
        title: 'New Task',
        description: 'Task description',
        priority: TaskPriority.high,
        dueDate: new Date('2025-12-31')
      };

      const expectedTask = {
        ...mockTask,
        title: 'New Task',
        priority: TaskPriority.high
      };

      mockTaskModel.create.mockResolvedValue(expectedTask);

      const result = await repository.create(createData);

      expect(mockTaskModel.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          title: 'New Task',
          description: 'Task description',
          priority: TaskPriority.high,
          status: TaskStatus.pending,
          dueDate: new Date('2025-12-31')
        }
      });
      expect(result).toEqual(expectedTask);
    });

    test('should create task with minimal data', async () => {
      const createData: CreateTaskData = {
        userId: 'user-123',
        title: 'Minimal Task'
      };

      mockTaskModel.create.mockResolvedValue(mockTask);

      await repository.create(createData);

      expect(mockTaskModel.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-123',
          title: 'Minimal Task',
          description: null,
          priority: TaskPriority.medium,
          status: TaskStatus.pending,
          dueDate: null
        }
      });
    });

    test('should trim whitespace in create data', async () => {
      const createData: CreateTaskData = {
        userId: '  user-123  ',
        title: '  Task Title  ',
        description: '  Task Description  '
      };

      mockTaskModel.create.mockResolvedValue(mockTask);

      await repository.create(createData);

      const expectedCall = mockTaskModel.create.mock.calls[0][0];
      expect(expectedCall.data.userId).toBe('user-123');
      expect(expectedCall.data.title).toBe('Task Title');
      expect(expectedCall.data.description).toBe('Task Description');
    });

    test('should throw ValidationError for invalid create data', async () => {
      // Empty user ID
      await expect(repository.create({
        userId: '',
        title: 'Task'
      })).rejects.toThrow(ValidationError);

      // Empty title
      await expect(repository.create({
        userId: 'user-123',
        title: ''
      })).rejects.toThrow(ValidationError);

      // Title too long
      await expect(repository.create({
        userId: 'user-123',
        title: 'a'.repeat(101)
      })).rejects.toThrow(ValidationError);

      // Description too long
      await expect(repository.create({
        userId: 'user-123',
        title: 'Task',
        description: 'a'.repeat(1001)
      })).rejects.toThrow(ValidationError);

      // Due date in past
      await expect(repository.create({
        userId: 'user-123',
        title: 'Task',
        dueDate: new Date('2020-01-01')
      })).rejects.toThrow(ValidationError);
    });

    test('should update task with valid data', async () => {
      const updateData: UpdateTaskData = {
        title: '  Updated Task  ',
        description: '  Updated description  ',
        priority: TaskPriority.high,
        status: TaskStatus.completed
      };

      const updatedTask = {
        ...mockTask,
        title: 'Updated Task',
        description: 'Updated description',
        priority: TaskPriority.high,
        status: TaskStatus.completed,
        completedAt: new Date()
      };

      mockTaskModel.findUnique.mockResolvedValue(mockTask); // exists check
      mockTaskModel.update.mockResolvedValue(updatedTask);

      const result = await repository.update('task-123', updateData);

      const expectedCall = mockTaskModel.update.mock.calls[0][0];
      expect(expectedCall.data.title).toBe('Updated Task');
      expect(expectedCall.data.description).toBe('Updated description');
      expect(expectedCall.data.priority).toBe(TaskPriority.high);
      expect(expectedCall.data.status).toBe(TaskStatus.completed);
      expect(expectedCall.data.completedAt).toBeInstanceOf(Date);
      expect(result).toEqual(updatedTask);
    });

    test('should clear completedAt when status changes from completed', async () => {
      const updateData: UpdateTaskData = {
        status: TaskStatus.pending
      };

      mockTaskModel.findUnique.mockResolvedValue(mockCompletedTask); // exists check
      mockTaskModel.update.mockResolvedValue(mockTask);

      await repository.update('task-789', updateData);

      const expectedCall = mockTaskModel.update.mock.calls[0][0];
      expect(expectedCall.data.status).toBe(TaskStatus.pending);
      expect(expectedCall.data.completedAt).toBeNull();
    });

    test('should throw ValidationError for invalid update data', async () => {
      mockTaskModel.findUnique.mockResolvedValue(mockTask); // exists check

      // Empty title
      await expect(repository.update('task-123', {
        title: ''
      })).rejects.toThrow(ValidationError);

      // Title too long
      await expect(repository.update('task-123', {
        title: 'a'.repeat(101)
      })).rejects.toThrow(ValidationError);

      // Description too long
      await expect(repository.update('task-123', {
        description: 'a'.repeat(1001)
      })).rejects.toThrow(ValidationError);

      // Due date in past
      await expect(repository.update('task-123', {
        dueDate: new Date('2020-01-01')
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors in findByUserId', async () => {
      const dbError = new Error('Database connection failed');
      mockTaskModel.findMany.mockRejectedValue(dbError);

      await expect(repository.findByUserId('user-123')).rejects.toThrow();
    });

    test('should handle database errors in searchTasks', async () => {
      const dbError = new Error('Database connection failed');
      mockTaskModel.findMany.mockRejectedValue(dbError);

      await expect(repository.searchTasks('user-123', 'query')).rejects.toThrow();
    });

    test('should handle database errors in count operations', async () => {
      const dbError = new Error('Database connection failed');
      mockTaskModel.count.mockRejectedValue(dbError);

      await expect(repository.countByStatus('user-123', TaskStatus.pending)).rejects.toThrow();
      await expect(repository.countOverdueTasks('user-123')).rejects.toThrow();
    });
  });
});
