/**
 * ===================================
 * Task Domain Service
 * ===================================
 * Purpose: Task management business logic and domain operations
 * Features:
 * - Task CRUD operations
 * - Task lifecycle management
 * - Search and filtering
 * - Progress tracking
 * - Business rule enforcement
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Task, TaskCreationData, TaskUpdateData, TaskPriority, TaskStatus } from '../entities/task.entity';
import { Category } from '../entities/category.entity';
import { EntityValidationError, EntityNotFoundError, EntityConflictError } from '../entities/base.entity';

/**
 * Task search filters interface
 */
export interface TaskSearchFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  search?: string;
  dueBefore?: Date;
  dueAfter?: Date;
  createdAfter?: Date;
  createdBefore?: Date;
  isOverdue?: boolean;
  isCompleted?: boolean;
}

/**
 * Task creation request interface
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: Date;
  categoryIds?: string[];
}

/**
 * Task update request interface
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
  categoryIds?: string[];
}

/**
 * Task statistics interface
 */
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

/**
 * Task with categories interface
 */
export interface TaskWithCategories {
  task: Task;
  categories: Category[];
}

/**
 * Task repository interface (dependency injection)
 */
export interface ITaskRepository {
  findById(id: string): Promise<Task | null>;
  findByUserId(userId: string, filters?: TaskSearchFilters): Promise<Task[]>;
  create(data: TaskCreationData): Promise<Task>;
  update(id: string, data: TaskUpdateData): Promise<Task>;
  delete(id: string): Promise<void>;
  count(userId: string, filters?: TaskSearchFilters): Promise<number>;
  search(userId: string, query: string): Promise<Task[]>;
  findOverdue(userId: string): Promise<Task[]>;
  findByCategory(categoryId: string): Promise<Task[]>;
}

/**
 * Category repository interface (dependency injection)
 */
export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findByIds(ids: string[]): Promise<Category[]>;
  findByUserId(userId: string): Promise<Category[]>;
}

/**
 * Task category repository interface (dependency injection)
 */
export interface ITaskCategoryRepository {
  findCategoriesByTaskId(taskId: string): Promise<Category[]>;
  findTasksByCategory(categoryId: string): Promise<Task[]>;
  createRelations(taskId: string, categoryIds: string[]): Promise<void>;
  updateRelations(taskId: string, categoryIds: string[]): Promise<void>;
  deleteRelations(taskId: string): Promise<void>;
}

/**
 * Task Domain Service Class
 * 
 * Handles task-related business logic and domain operations.
 * Coordinates between entities and repositories while enforcing business rules.
 */
export class TaskService {
  private taskRepository: ITaskRepository;
  private categoryRepository: ICategoryRepository;
  private taskCategoryRepository: ITaskCategoryRepository;

  /**
   * Constructor for TaskService
   * 
   * @param taskRepository - Task repository for data access
   * @param categoryRepository - Category repository for data access
   * @param taskCategoryRepository - Task-Category relationship repository
   */
  constructor(
    taskRepository: ITaskRepository,
    categoryRepository: ICategoryRepository,
    taskCategoryRepository: ITaskCategoryRepository
  ) {
    this.taskRepository = taskRepository;
    this.categoryRepository = categoryRepository;
    this.taskCategoryRepository = taskCategoryRepository;
  }

  /**
   * Create a new task
   * 
   * @param userId - User ID who owns the task
   * @param request - Task creation request
   * @returns {Promise<TaskWithCategories>} Created task with categories
   * @throws {EntityValidationError} When validation fails
   * @throws {EntityNotFoundError} When categories not found
   */
  public async createTask(userId: string, request: CreateTaskRequest): Promise<TaskWithCategories> {
    // Validate categories if provided
    let categories: Category[] = [];
    if (request.categoryIds && request.categoryIds.length > 0) {
      categories = await this.validateCategories(request.categoryIds);
    }

    // Create task data
    const taskData: TaskCreationData = {
      userId,
      title: request.title,
      description: request.description,
      priority: request.priority || TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dueDate: request.dueDate
    };

    // Create task
    const task = await this.taskRepository.create(taskData);

    // Create category relations if categories provided
    if (request.categoryIds && request.categoryIds.length > 0) {
      await this.taskCategoryRepository.createRelations(task.id, request.categoryIds);
    }

    return {
      task,
      categories
    };
  }

  /**
   * Get task by ID
   * 
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @returns {Promise<TaskWithCategories>} Task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task
   */
  public async getTaskById(taskId: string, userId: string): Promise<TaskWithCategories> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new EntityNotFoundError('Task', taskId);
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new EntityValidationError(
        'User does not have permission to access this task',
        'Task',
        taskId
      );
    }

    // Get categories
    const categories = await this.taskCategoryRepository.findCategoriesByTaskId(taskId);

    return {
      task,
      categories
    };
  }

  /**
   * Update task
   * 
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @param request - Task update request
   * @returns {Promise<TaskWithCategories>} Updated task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task or validation fails
   */
  public async updateTask(taskId: string, userId: string, request: UpdateTaskRequest): Promise<TaskWithCategories> {
    // Get existing task and verify ownership
    const existingTask = await this.getTaskById(taskId, userId);

    // Validate categories if provided
    let categories: Category[] = existingTask.categories;
    if (request.categoryIds !== undefined) {
      if (request.categoryIds.length > 0) {
        categories = await this.validateCategories(request.categoryIds);
      } else {
        categories = [];
      }
    }

    // Prepare update data
    const updateData: TaskUpdateData = {};

    if (request.title !== undefined) {
      updateData.title = request.title;
    }

    if (request.description !== undefined) {
      updateData.description = request.description;
    }

    if (request.priority !== undefined) {
      updateData.priority = request.priority;
    }

    if (request.status !== undefined) {
      updateData.status = request.status;
    }

    if (request.dueDate !== undefined) {
      updateData.dueDate = request.dueDate;
    }

    // Update task
    const updatedTask = await this.taskRepository.update(taskId, updateData);

    // Update category relations if categories were provided
    if (request.categoryIds !== undefined) {
      await this.taskCategoryRepository.updateRelations(taskId, request.categoryIds);
    }

    return {
      task: updatedTask,
      categories
    };
  }

  /**
   * Delete task
   * 
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task
   */
  public async deleteTask(taskId: string, userId: string): Promise<void> {
    // Verify task exists and user owns it
    await this.getTaskById(taskId, userId);

    // Delete category relations first
    await this.taskCategoryRepository.deleteRelations(taskId);

    // Delete task
    await this.taskRepository.delete(taskId);
  }

  /**
   * Get tasks by user with filters
   * 
   * @param userId - User ID
   * @param filters - Search filters
   * @returns {Promise<TaskWithCategories[]>} Array of tasks with categories
   */
  public async getTasksByUser(userId: string, filters: TaskSearchFilters = {}): Promise<TaskWithCategories[]> {
    const tasks = await this.taskRepository.findByUserId(userId, filters);
    
    // Get categories for each task
    const tasksWithCategories: TaskWithCategories[] = [];
    for (const task of tasks) {
      const categories = await this.taskCategoryRepository.findCategoriesByTaskId(task.id);
      tasksWithCategories.push({
        task,
        categories
      });
    }

    return tasksWithCategories;
  }

  /**
   * Search tasks by query
   *
   * @param userId - User ID
   * @param query - Search query
   * @returns {Promise<TaskWithCategories[]>} Array of matching tasks with categories
   */
  public async searchTasks(userId: string, query: string): Promise<TaskWithCategories[]> {
    const tasks = await this.taskRepository.search(userId, query);

    // Get categories for each task
    const tasksWithCategories: TaskWithCategories[] = [];
    for (const task of tasks) {
      const categories = await this.taskCategoryRepository.findCategoriesByTaskId(task.id);
      tasksWithCategories.push({
        task,
        categories
      });
    }

    return tasksWithCategories;
  }

  /**
   * Get overdue tasks for user
   *
   * @param userId - User ID
   * @returns {Promise<TaskWithCategories[]>} Array of overdue tasks with categories
   */
  public async getOverdueTasks(userId: string): Promise<TaskWithCategories[]> {
    const tasks = await this.taskRepository.findOverdue(userId);

    // Get categories for each task
    const tasksWithCategories: TaskWithCategories[] = [];
    for (const task of tasks) {
      const categories = await this.taskCategoryRepository.findCategoriesByTaskId(task.id);
      tasksWithCategories.push({
        task,
        categories
      });
    }

    return tasksWithCategories;
  }

  /**
   * Get tasks by category
   *
   * @param categoryId - Category ID
   * @param userId - User ID for ownership verification
   * @returns {Promise<TaskWithCategories[]>} Array of tasks in category with categories
   * @throws {EntityNotFoundError} When category not found
   */
  public async getTasksByCategory(categoryId: string, userId: string): Promise<TaskWithCategories[]> {
    // Verify category exists
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new EntityNotFoundError('Category', categoryId);
    }

    const tasks = await this.taskCategoryRepository.findTasksByCategory(categoryId);

    // Filter tasks by user ownership
    const userTasks = tasks.filter(task => task.userId === userId);

    // Get categories for each task
    const tasksWithCategories: TaskWithCategories[] = [];
    for (const task of userTasks) {
      const categories = await this.taskCategoryRepository.findCategoriesByTaskId(task.id);
      tasksWithCategories.push({
        task,
        categories
      });
    }

    return tasksWithCategories;
  }

  /**
   * Complete task
   *
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @returns {Promise<TaskWithCategories>} Completed task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task or task is already completed
   */
  public async completeTask(taskId: string, userId: string): Promise<TaskWithCategories> {
    const { task } = await this.getTaskById(taskId, userId);

    if (task.isCompleted()) {
      throw new EntityValidationError(
        'Task is already completed',
        'Task',
        taskId
      );
    }

    // Complete the task
    task.complete();

    // Update in repository
    const updatedTask = await this.taskRepository.update(taskId, {
      status: task.status
    });

    // Get categories
    const categories = await this.taskCategoryRepository.findCategoriesByTaskId(taskId);

    return {
      task: updatedTask,
      categories
    };
  }

  /**
   * Start task (change to in progress)
   *
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @returns {Promise<TaskWithCategories>} Started task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task or task cannot be started
   */
  public async startTask(taskId: string, userId: string): Promise<TaskWithCategories> {
    const { task } = await this.getTaskById(taskId, userId);

    if (task.isCompleted()) {
      throw new EntityValidationError(
        'Cannot start a completed task',
        'Task',
        taskId
      );
    }

    // Start the task
    task.start();

    // Update in repository
    const updatedTask = await this.taskRepository.update(taskId, {
      status: task.status
    });

    // Get categories
    const categories = await this.taskCategoryRepository.findCategoriesByTaskId(taskId);

    return {
      task: updatedTask,
      categories
    };
  }

  /**
   * Reset task to pending
   *
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @returns {Promise<TaskWithCategories>} Reset task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task
   */
  public async resetTask(taskId: string, userId: string): Promise<TaskWithCategories> {
    const { task } = await this.getTaskById(taskId, userId);

    // Reset the task
    task.reset();

    // Update in repository
    const updatedTask = await this.taskRepository.update(taskId, {
      status: task.status
    });

    // Get categories
    const categories = await this.taskCategoryRepository.findCategoriesByTaskId(taskId);

    return {
      task: updatedTask,
      categories
    };
  }

  /**
   * Get task statistics for user
   *
   * @param userId - User ID
   * @returns {Promise<TaskStatistics>} Task statistics
   */
  public async getTaskStatistics(userId: string): Promise<TaskStatistics> {
    const totalTasks = await this.taskRepository.count(userId);
    const completedTasks = await this.taskRepository.count(userId, { status: TaskStatus.COMPLETED });
    const pendingTasks = await this.taskRepository.count(userId, { status: TaskStatus.PENDING });
    const inProgressTasks = await this.taskRepository.count(userId, { status: TaskStatus.IN_PROGRESS });
    const overdueTasks = await this.taskRepository.count(userId, { isOverdue: true });

    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      completionRate: Math.round(completionRate * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Update task priority
   *
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @param priority - New priority
   * @returns {Promise<TaskWithCategories>} Updated task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task
   */
  public async updateTaskPriority(taskId: string, userId: string, priority: TaskPriority): Promise<TaskWithCategories> {
    const { task } = await this.getTaskById(taskId, userId);

    // Update priority
    task.setPriority(priority);

    // Update in repository
    const updatedTask = await this.taskRepository.update(taskId, {
      priority: task.priority
    });

    // Get categories
    const categories = await this.taskCategoryRepository.findCategoriesByTaskId(taskId);

    return {
      task: updatedTask,
      categories
    };
  }

  /**
   * Update task due date
   *
   * @param taskId - Task ID
   * @param userId - User ID for ownership verification
   * @param dueDate - New due date (null to remove)
   * @returns {Promise<TaskWithCategories>} Updated task with categories
   * @throws {EntityNotFoundError} When task not found
   * @throws {EntityValidationError} When user doesn't own the task or due date is invalid
   */
  public async updateTaskDueDate(taskId: string, userId: string, dueDate: Date | null): Promise<TaskWithCategories> {
    const { task } = await this.getTaskById(taskId, userId);

    // Update due date
    task.setDueDate(dueDate);

    // Update in repository
    const updatedTask = await this.taskRepository.update(taskId, {
      dueDate: task.dueDate
    });

    // Get categories
    const categories = await this.taskCategoryRepository.findCategoriesByTaskId(taskId);

    return {
      task: updatedTask,
      categories
    };
  }

  /**
   * Validate categories exist
   *
   * @param categoryIds - Array of category IDs
   * @returns {Promise<Category[]>} Array of validated categories
   * @throws {EntityNotFoundError} When any category not found
   */
  private async validateCategories(categoryIds: string[]): Promise<Category[]> {
    const categories = await this.categoryRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      const foundIds = categories.map(cat => cat.id);
      const missingIds = categoryIds.filter(id => !foundIds.includes(id));
      throw new EntityNotFoundError('Category', missingIds.join(', '));
    }

    return categories;
  }
}
