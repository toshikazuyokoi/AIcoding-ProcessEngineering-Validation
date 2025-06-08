/**
 * ===================================
 * Task Controller Implementation
 * ===================================
 * Purpose: HTTP task endpoints for task management
 * Features:
 * - Task CRUD operations
 * - Search and filtering
 * - Pagination and sorting
 * - User ownership validation
 * - BaseController integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { BaseController, ControllerRequest } from './base-controller';
import { TaskService, TaskSearchFilters, CreateTaskRequest, UpdateTaskRequest } from '../domain/services/task.service';
import { ResponseBuilder } from '../utils/response-builder';
import { ErrorHandler } from '../utils/error-handler';
import { Logger } from '../utils/logger';
import { RequestValidator } from '../utils/request-validator';
import { TaskPriority, TaskStatus } from '../domain/entities/task.entity';

// ===================================
// Task Controller Types
// ===================================

/**
 * Task list query interface
 */
export interface TaskListQuery {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  dueDateFrom?: string;
  dueDateTo?: string;
  categoryId?: string;
}

/**
 * Task controller request interface
 */
export interface TaskControllerRequest extends ControllerRequest {
  body: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    dueDate?: string;
    categoryIds?: string[];
  };
  query: TaskListQuery & { [key: string]: any };
  params: {
    id?: string;
  };
}

/**
 * Task list response interface
 */
export interface TaskListResponse {
  tasks: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Task detail response interface
 */
export interface TaskDetailResponse {
  task: any;
}

// ===================================
// TaskController Class
// ===================================

/**
 * Task Controller
 * 
 * Handles HTTP task endpoints:
 * - Task CRUD operations
 * - Search and filtering
 * - Pagination and sorting
 * - User ownership validation
 */
export class TaskController extends BaseController {
  private taskService: TaskService;

  /**
   * Constructor
   */
  constructor(
    taskService: TaskService,
    responseBuilder?: ResponseBuilder,
    errorHandler?: ErrorHandler,
    logger?: Logger,
    validator?: RequestValidator
  ) {
    super(
      'TaskController',
      responseBuilder,
      errorHandler,
      logger,
      validator,
      {
        enableLogging: true,
        enableValidation: true,
        enableErrorHandling: true,
        serviceName: 'task-api',
        enableRequestId: true,
        enableUserContext: true,
        enablePerformanceLogging: true
      }
    );

    this.taskService = taskService;
  }

  /**
   * Get tasks list endpoint
   * GET /api/tasks
   */
  public getTasks = this.wrapAction('getTasks', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Extract and validate query parameters
    const {
      page = 1,
      limit = 20,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dueDateFrom,
      dueDateTo,
      categoryId
    } = req.query as TaskListQuery;

    // Validate pagination parameters
    const validatedPage = Math.max(1, Number(page));
    const validatedLimit = Math.min(100, Math.max(1, Number(limit)));

    // Prepare search filters
    const filters: TaskSearchFilters = {};
    
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (search) filters.search = search;
    if (categoryId) filters.categoryId = categoryId;
    if (dueDateFrom) filters.dueAfter = new Date(dueDateFrom);
    if (dueDateTo) filters.dueBefore = new Date(dueDateTo);

    // Get tasks from service
    const tasksWithCategories = await this.taskService.getTasksByUser(req.user.id, filters);

    // Apply pagination manually (since service doesn't support it yet)
    const startIndex = (validatedPage - 1) * validatedLimit;
    const endIndex = startIndex + validatedLimit;
    const paginatedTasks = tasksWithCategories.slice(startIndex, endIndex);

    // Prepare pagination info
    const total = tasksWithCategories.length;
    const totalPages = Math.ceil(total / validatedLimit);
    const pagination = {
      page: validatedPage,
      limit: validatedLimit,
      total,
      totalPages,
      hasNext: validatedPage < totalPages,
      hasPrev: validatedPage > 1,
      offset: startIndex
    };

    this.sendPaginatedResponse(res, paginatedTasks, pagination, 'Tasks retrieved successfully');
  });

  /**
   * Create task endpoint
   * POST /api/tasks
   */
  public createTask = this.wrapAction('createTask', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Extract and validate task data
    const { title, description, priority, dueDate, categoryIds } = req.body;

    // Basic validation
    if (!title || title.trim().length === 0) {
      this.sendError(res, new Error('Task title is required'), 400);
      return;
    }

    if (title.length > 100) {
      this.sendError(res, new Error('Task title must be 100 characters or less'), 400);
      return;
    }

    // Prepare create request
    const createRequest: CreateTaskRequest = {
      title: title.trim(),
      description: description?.trim(),
      priority: priority || TaskPriority.MEDIUM,
      categoryIds: categoryIds || []
    };

    // Add dueDate only if provided
    if (dueDate) {
      createRequest.dueDate = new Date(dueDate);
    }

    // Create task
    const task = await this.taskService.createTask(req.user.id, createRequest);

    // Prepare response
    const response: TaskDetailResponse = {
      task
    };

    this.sendSuccess(res, response, 'Task created successfully', 201);
  });

  /**
   * Get task by ID endpoint
   * GET /api/tasks/:id
   */
  public getTaskById = this.wrapAction('getTaskById', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID and task ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    const taskId = req.params.id;
    if (!taskId) {
      this.sendError(res, new Error('Task ID is required'), 400);
      return;
    }

    // Get task by ID
    const result = await this.taskService.getTaskById(taskId, req.user.id);

    // Prepare response
    const response: TaskDetailResponse = {
      task: result
    };

    this.sendSuccess(res, response, 'Task retrieved successfully');
  });

  /**
   * Update task endpoint
   * PUT /api/tasks/:id
   */
  public updateTask = this.wrapAction('updateTask', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID and task ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    const taskId = req.params.id;
    if (!taskId) {
      this.sendError(res, new Error('Task ID is required'), 400);
      return;
    }

    // Extract update data
    const { title, description, priority, status, dueDate, categoryIds } = req.body;

    // Prepare update request
    const updateRequest: UpdateTaskRequest = {};
    
    if (title !== undefined) {
      if (title.trim().length === 0) {
        this.sendError(res, new Error('Task title cannot be empty'), 400);
        return;
      }
      if (title.length > 100) {
        this.sendError(res, new Error('Task title must be 100 characters or less'), 400);
        return;
      }
      updateRequest.title = title.trim();
    }
    
    if (description !== undefined) updateRequest.description = description?.trim();
    if (priority !== undefined) updateRequest.priority = priority;
    if (status !== undefined) updateRequest.status = status;
    if (dueDate !== undefined) {
      if (dueDate) {
        updateRequest.dueDate = new Date(dueDate);
      }
      // Note: To remove dueDate, we would need to extend UpdateTaskRequest to support null
      // For now, we only support updating to a new date
    }
    if (categoryIds !== undefined) updateRequest.categoryIds = categoryIds;

    // Update task
    const task = await this.taskService.updateTask(taskId, req.user.id, updateRequest);

    // Prepare response
    const response: TaskDetailResponse = {
      task
    };

    this.sendSuccess(res, response, 'Task updated successfully');
  });

  /**
   * Delete task endpoint
   * DELETE /api/tasks/:id
   */
  public deleteTask = this.wrapAction('deleteTask', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID and task ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    const taskId = req.params.id;
    if (!taskId) {
      this.sendError(res, new Error('Task ID is required'), 400);
      return;
    }

    // Delete task
    await this.taskService.deleteTask(taskId, req.user.id);

    this.sendSuccess(res, null, 'Task deleted successfully', 204);
  });
}

// ===================================
// Factory Function
// ===================================

/**
 * Create TaskController instance
 */
export const createTaskController = (
  taskService: TaskService,
  responseBuilder?: ResponseBuilder,
  errorHandler?: ErrorHandler,
  logger?: Logger,
  validator?: RequestValidator
): TaskController => {
  return new TaskController(taskService, responseBuilder, errorHandler, logger, validator);
};

// Export default instance factory
export default createTaskController;
