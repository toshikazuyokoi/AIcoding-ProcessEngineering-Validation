/**
 * Task Repository Implementation
 * 
 * Task-specific data access operations extending base repository functionality
 * Provides task management, filtering, search, and category relationship features
 * 
 * @fileoverview Task repository class for task data access operations
 * @version 1.0.0
 * @since 2025-02-01
 */

import { Task, TaskPriority, TaskStatus, Prisma } from '@prisma/client';
import { BaseRepository, IBaseRepository, FindManyOptions, RepositoryConfig } from './base-repository';
import { NotFoundError, ValidationError } from '@/utils/error-handler';

/**
 * Task creation data interface
 */
export interface CreateTaskData {
  userId: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
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
  completedAt?: Date | null;
}

/**
 * Task search filters interface
 */
export interface TaskSearchFilters {
  userId?: string;
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  isOverdue?: boolean;
}

/**
 * Task sort options interface
 */
export interface TaskSortOptions {
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'status' | 'title';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Task with categories interface
 */
export interface TaskWithCategories extends Task {
  taskCategories: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
      color: string;
      description?: string;
    };
  }>;
}

/**
 * Task repository interface extending base repository
 */
export interface ITaskRepository extends IBaseRepository<Task, CreateTaskData, UpdateTaskData> {
  findByUserId(userId: string, options?: FindManyOptions): Promise<Task[]>;
  findByUserIdWithFilters(userId: string, filters: TaskSearchFilters, options?: FindManyOptions): Promise<Task[]>;
  findByIdWithCategories(id: string): Promise<TaskWithCategories | null>;
  searchTasks(userId: string, query: string, options?: FindManyOptions): Promise<Task[]>;
  findByStatus(status: TaskStatus, options?: FindManyOptions): Promise<Task[]>;
  findByPriority(priority: TaskPriority, options?: FindManyOptions): Promise<Task[]>;
  findOverdueTasks(userId?: string, options?: FindManyOptions): Promise<Task[]>;
  findCompletedTasks(userId: string, options?: FindManyOptions): Promise<Task[]>;
  findPendingTasks(userId: string, options?: FindManyOptions): Promise<Task[]>;
  countByStatus(userId: string, status: TaskStatus): Promise<number>;
  countByPriority(userId: string, priority: TaskPriority): Promise<number>;
  countOverdueTasks(userId: string): Promise<number>;
  markAsCompleted(id: string): Promise<Task>;
  markAsPending(id: string): Promise<Task>;
  markAsInProgress(id: string): Promise<Task>;
  updatePriority(id: string, priority: TaskPriority): Promise<Task>;
}

/**
 * Task Repository Class
 * 
 * Provides task-specific data access operations
 * Extends BaseRepository with task management and filtering features
 */
export class TaskRepository extends BaseRepository<Task, CreateTaskData, UpdateTaskData> implements ITaskRepository {
  
  /**
   * Constructor
   */
  constructor(config?: RepositoryConfig) {
    super('Task', {
      enableCaching: true,
      cacheTimeout: 300, // 5 minutes for task data
      enableLogging: true,
      enableMetrics: true,
      ...config
    });
  }

  /**
   * Get Prisma task model
   */
  protected getModel() {
    return this.prisma.task;
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
   * Find tasks by user ID
   */
  public async findByUserId(userId: string, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Finding tasks by user ID', { userId, options });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const whereClause = {
        userId,
        ...options.where
      };

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} tasks for user ${userId}`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find tasks by user ID', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find tasks by user ID with filters
   */
  public async findByUserIdWithFilters(
    userId: string, 
    filters: TaskSearchFilters, 
    options: FindManyOptions = {}
  ): Promise<Task[]> {
    try {
      this.logger.debug('Finding tasks by user ID with filters', { userId, filters, options });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const whereClause: Prisma.TaskWhereInput = {
        userId,
        ...options.where
      };

      // Apply filters
      if (filters.title) {
        whereClause.title = {
          contains: filters.title,
          mode: 'insensitive'
        };
      }

      if (filters.description) {
        whereClause.description = {
          contains: filters.description,
          mode: 'insensitive'
        };
      }

      if (filters.priority !== undefined) {
        whereClause.priority = filters.priority;
      }

      if (filters.status !== undefined) {
        whereClause.status = filters.status;
      }

      if (filters.dueDateFrom || filters.dueDateTo) {
        whereClause.dueDate = {};
        if (filters.dueDateFrom) {
          whereClause.dueDate.gte = filters.dueDateFrom;
        }
        if (filters.dueDateTo) {
          whereClause.dueDate.lte = filters.dueDateTo;
        }
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

      if (filters.isOverdue === true) {
        whereClause.dueDate = {
          ...(whereClause.dueDate as object || {}),
          lt: new Date()
        };
        whereClause.status = {
          ...(whereClause.status as object || {}),
          not: TaskStatus.completed
        };
      }

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} tasks matching filters for user ${userId}`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find tasks with filters', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find task by ID with categories
   */
  public async findByIdWithCategories(id: string): Promise<TaskWithCategories | null> {
    try {
      this.logger.debug('Finding task by ID with categories', { taskId: id });

      if (!id || id.trim().length === 0) {
        throw new ValidationError('Task ID is required');
      }

      const task = await this.getModel().findUnique({
        where: { id },
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

      if (task) {
        this.logger.debug('Task found with categories', { taskId: id, categoriesCount: task.taskCategories.length });
      } else {
        this.logger.debug('Task not found', { taskId: id });
      }

      return task as TaskWithCategories | null;
    } catch (error) {
      this.logger.error('Failed to find task with categories', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Search tasks by query string
   */
  public async searchTasks(userId: string, query: string, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Searching tasks', { userId, query, options });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      if (!query || query.trim().length === 0) {
        throw new ValidationError('Search query is required');
      }

      const searchQuery = query.trim();
      const whereClause: Prisma.TaskWhereInput = {
        userId,
        OR: [
          {
            title: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchQuery,
              mode: 'insensitive'
            }
          }
        ],
        ...options.where
      };

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} tasks matching search query "${searchQuery}"`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to search tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find tasks by status
   */
  public async findByStatus(status: TaskStatus, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Finding tasks by status', { status, options });

      const whereClause = {
        status,
        ...options.where
      };

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} tasks with status ${status}`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find tasks by status', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find tasks by priority
   */
  public async findByPriority(priority: TaskPriority, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Finding tasks by priority', { priority, options });

      const whereClause = {
        priority,
        ...options.where
      };

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} tasks with priority ${priority}`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find tasks by priority', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find overdue tasks
   */
  public async findOverdueTasks(userId?: string, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Finding overdue tasks', { userId, options });

      const whereClause: Prisma.TaskWhereInput = {
        dueDate: {
          lt: new Date()
        },
        status: {
          not: TaskStatus.completed
        },
        ...options.where
      };

      if (userId) {
        whereClause.userId = userId;
      }

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} overdue tasks`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find overdue tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find completed tasks for user
   */
  public async findCompletedTasks(userId: string, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Finding completed tasks', { userId, options });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const whereClause = {
        userId,
        status: TaskStatus.completed,
        ...options.where
      };

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} completed tasks for user ${userId}`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find completed tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find pending tasks for user
   */
  public async findPendingTasks(userId: string, options: FindManyOptions = {}): Promise<Task[]> {
    try {
      this.logger.debug('Finding pending tasks', { userId, options });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const whereClause = {
        userId,
        status: TaskStatus.pending,
        ...options.where
      };

      const tasks = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${tasks.length} pending tasks for user ${userId}`);
      return tasks;
    } catch (error) {
      this.logger.error('Failed to find pending tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count tasks by status for user
   */
  public async countByStatus(userId: string, status: TaskStatus): Promise<number> {
    try {
      this.logger.debug('Counting tasks by status', { userId, status });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const count = await this.count({
        userId,
        status
      });

      this.logger.debug(`Found ${count} tasks with status ${status} for user ${userId}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count tasks by status', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count tasks by priority for user
   */
  public async countByPriority(userId: string, priority: TaskPriority): Promise<number> {
    try {
      this.logger.debug('Counting tasks by priority', { userId, priority });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const count = await this.count({
        userId,
        priority
      });

      this.logger.debug(`Found ${count} tasks with priority ${priority} for user ${userId}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count tasks by priority', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count overdue tasks for user
   */
  public async countOverdueTasks(userId: string): Promise<number> {
    try {
      this.logger.debug('Counting overdue tasks', { userId });

      if (!userId || userId.trim().length === 0) {
        throw new ValidationError('User ID is required');
      }

      const count = await this.getModel().count({
        where: {
          userId,
          dueDate: {
            lt: new Date()
          },
          status: {
            not: TaskStatus.completed
          }
        }
      });

      this.logger.debug(`Found ${count} overdue tasks for user ${userId}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count overdue tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark task as completed
   */
  public async markAsCompleted(id: string): Promise<Task> {
    try {
      this.logger.debug('Marking task as completed', { taskId: id });

      const task = await this.update(id, {
        status: TaskStatus.completed,
        completedAt: new Date()
      });

      this.logger.info('Task marked as completed successfully', { taskId: id });
      return task;
    } catch (error) {
      this.logger.error('Failed to mark task as completed', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark task as pending
   */
  public async markAsPending(id: string): Promise<Task> {
    try {
      this.logger.debug('Marking task as pending', { taskId: id });

      const task = await this.update(id, {
        status: TaskStatus.pending,
        completedAt: null
      });

      this.logger.info('Task marked as pending successfully', { taskId: id });
      return task;
    } catch (error) {
      this.logger.error('Failed to mark task as pending', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Mark task as in progress
   */
  public async markAsInProgress(id: string): Promise<Task> {
    try {
      this.logger.debug('Marking task as in progress', { taskId: id });

      const task = await this.update(id, {
        status: TaskStatus.in_progress,
        completedAt: null
      });

      this.logger.info('Task marked as in progress successfully', { taskId: id });
      return task;
    } catch (error) {
      this.logger.error('Failed to mark task as in progress', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Update task priority
   */
  public async updatePriority(id: string, priority: TaskPriority): Promise<Task> {
    try {
      this.logger.debug('Updating task priority', { taskId: id, priority });

      const task = await this.update(id, { priority });

      this.logger.info('Task priority updated successfully', { taskId: id, priority });
      return task;
    } catch (error) {
      this.logger.error('Failed to update task priority', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Prepare create data with validation
   */
  protected override prepareCreateData(data: CreateTaskData): any {
    // Validate required fields
    if (!data.userId || data.userId.trim().length === 0) {
      throw new ValidationError('User ID is required');
    }

    if (!data.title || data.title.trim().length === 0) {
      throw new ValidationError('Task title is required');
    }

    if (data.title.trim().length > 100) {
      throw new ValidationError('Task title must be 100 characters or less');
    }

    if (data.description && data.description.length > 1000) {
      throw new ValidationError('Task description must be 1000 characters or less');
    }

    if (data.dueDate && data.dueDate < new Date()) {
      throw new ValidationError('Due date cannot be in the past');
    }

    return {
      userId: data.userId.trim(),
      title: data.title.trim(),
      description: data.description?.trim() || null,
      priority: data.priority || TaskPriority.medium,
      status: data.status || TaskStatus.pending,
      dueDate: data.dueDate || null
    };
  }

  /**
   * Prepare update data with validation
   */
  protected override prepareUpdateData(data: UpdateTaskData): any {
    const cleanData = super.prepareUpdateData(data);

    // Validate title if provided
    if (cleanData.title !== undefined) {
      if (!cleanData.title || cleanData.title.trim().length === 0) {
        throw new ValidationError('Task title cannot be empty');
      }
      if (cleanData.title.trim().length > 100) {
        throw new ValidationError('Task title must be 100 characters or less');
      }
      cleanData.title = cleanData.title.trim();
    }

    // Validate description if provided
    if (cleanData.description !== undefined) {
      if (cleanData.description && cleanData.description.length > 1000) {
        throw new ValidationError('Task description must be 1000 characters or less');
      }
      cleanData.description = cleanData.description?.trim() || null;
    }

    // Validate due date if provided
    if (cleanData.dueDate !== undefined) {
      if (cleanData.dueDate && cleanData.dueDate < new Date()) {
        throw new ValidationError('Due date cannot be in the past');
      }
    }

    // Auto-set completedAt when status changes to completed
    if (cleanData.status === TaskStatus.completed && !cleanData.completedAt) {
      cleanData.completedAt = new Date();
    }

    // Clear completedAt when status changes from completed
    if (cleanData.status && cleanData.status !== TaskStatus.completed) {
      cleanData.completedAt = null;
    }

    return cleanData;
  }
}

/**
 * Export default task repository
 */
export default TaskRepository;
