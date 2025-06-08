/**
 * ===================================
 * Task Controller Tests
 * ===================================
 * Purpose: Comprehensive testing for TaskController class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  TaskController,
  TaskControllerRequest,
  TaskListQuery,
  TaskListResponse,
  TaskDetailResponse,
  createTaskController
} from '../task-controller';
import { ControllerRequest } from '../base-controller';
import { TaskService, TaskSearchFilters, CreateTaskRequest, UpdateTaskRequest, TaskWithCategories } from '../../domain/services/task.service';
import { ResponseBuilder } from '../../utils/response-builder';
import { ErrorHandler } from '../../utils/error-handler';
import { Logger } from '../../utils/logger';
import { RequestValidator } from '../../utils/request-validator';
import { TaskPriority, TaskStatus } from '../../domain/entities/task.entity';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockTaskService = {
  getTasksByUser: jest.fn(),
  createTask: jest.fn(),
  getTaskById: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn()
} as unknown as jest.Mocked<TaskService>;

const mockResponseBuilder = {
  sendSuccess: jest.fn(),
  sendPaginated: jest.fn(),
  sendError: jest.fn()
} as unknown as jest.Mocked<ResponseBuilder>;

const mockErrorHandler = {
  handleError: jest.fn()
} as unknown as jest.Mocked<ErrorHandler>;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn()
} as unknown as jest.Mocked<Logger>;

const mockValidator = {
  validate: jest.fn()
} as unknown as jest.Mocked<RequestValidator>;

// Mock request, response, and next function
let mockRequest: Partial<ControllerRequest>;
let mockResponse: Partial<Response>;
let mockNext: jest.MockedFunction<NextFunction>;

// Test controller instance
let taskController: TaskController;

// Test data
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'USER'
};

// Create proper TaskWithCategories mock
const mockTaskWithCategories: TaskWithCategories = {
  task: {
    id: 'task-123',
    userId: 'user-123',
    title: 'Test Task',
    description: 'Test Description',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.PENDING,
    dueDate: undefined,
    completedAt: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    isCompleted: () => false,
    isInProgress: () => false,
    isPending: () => true,
    isOverdue: () => false,
    isHighPriority: () => false,
    hasDueDate: () => false,
    getDaysUntilDue: () => null,
    updateTask: jest.fn(),
    changeStatus: jest.fn(),
    complete: jest.fn(),
    start: jest.fn(),
    reset: jest.fn(),
    setPriority: jest.fn(),
    setDueDate: jest.fn(),
    getSummary: jest.fn(),
    clone: jest.fn()
  } as any,
  categories: []
};

const mockTaskList = [mockTaskWithCategories];

// ===================================
// Test Suite Setup
// ===================================

describe('TaskController', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      path: '/api/tasks',
      query: {},
      body: {},
      params: {},
      user: mockUser,
      requestId: 'test-request-id'
    } as Partial<ControllerRequest>;

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 200
    } as unknown as Response;

    // Setup mock next function
    mockNext = jest.fn();

    // Create fresh instance
    taskController = new TaskController(
      mockTaskService,
      mockResponseBuilder,
      mockErrorHandler,
      mockLogger,
      mockValidator
    );
  });

  // ===================================
  // Phase 1: Constructor and Configuration Tests
  // ===================================

  describe('Phase 1: Constructor and Configuration', () => {
    it('should create instance with provided dependencies', () => {
      expect(taskController).toBeInstanceOf(TaskController);
      expect(taskController.getControllerName()).toBe('TaskController');
    });

    it('should create instance with task-specific configuration', () => {
      const config = taskController.getConfig();
      
      expect(config.enableLogging).toBe(true);
      expect(config.enableValidation).toBe(true);
      expect(config.serviceName).toBe('task-api');
      expect(config.enableUserContext).toBe(true);
    });

    it('should create instance using factory function', () => {
      const controller = createTaskController(mockTaskService);
      
      expect(controller).toBeInstanceOf(TaskController);
      expect(controller.getControllerName()).toBe('TaskController');
    });
  });

  // ===================================
  // Phase 2: Task List Tests
  // ===================================

  describe('Phase 2: Task List', () => {
    it('should get tasks list successfully', async () => {
      mockTaskService.getTasksByUser.mockResolvedValue(mockTaskList);
      mockResponseBuilder.sendPaginated.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockUser,
        query: { page: '1', limit: '10' }
      } as unknown as ControllerRequest;

      await taskController.getTasks(req, mockResponse as Response, mockNext);

      expect(mockTaskService.getTasksByUser).toHaveBeenCalledWith(mockUser.id, {});
      expect(mockResponseBuilder.sendPaginated).toHaveBeenCalled();
    });

    it('should handle authentication error', async () => {
      // Mock error handler to return 401 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 401,
        response: {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            type: 'AUTHENTICATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        }
      });

      const req = {
        user: null,
        query: {}
      } as unknown as ControllerRequest;

      await taskController.getTasks(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  // ===================================
  // Phase 3: Task CRUD Tests
  // ===================================

  describe('Phase 3: Task CRUD', () => {
    it('should create task successfully', async () => {
      mockTaskService.createTask.mockResolvedValue(mockTaskWithCategories);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockUser,
        body: { title: 'New Task', description: 'Task description' }
      } as unknown as ControllerRequest;

      await taskController.createTask(req, mockResponse as Response, mockNext);

      expect(mockTaskService.createTask).toHaveBeenCalled();
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });

    it('should get task by ID successfully', async () => {
      mockTaskService.getTaskById.mockResolvedValue(mockTaskWithCategories);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockUser,
        params: { id: 'task-123' }
      } as unknown as ControllerRequest;

      await taskController.getTaskById(req, mockResponse as Response, mockNext);

      expect(mockTaskService.getTaskById).toHaveBeenCalledWith('task-123', mockUser.id);
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 4: Search and Filter Tests
  // ===================================

  describe('Phase 4: Search and Filter', () => {
    it('should apply search filters', async () => {
      mockTaskService.getTasksByUser.mockResolvedValue(mockTaskList);
      mockResponseBuilder.sendPaginated.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockUser,
        query: { search: 'test', status: TaskStatus.PENDING, priority: TaskPriority.HIGH }
      } as unknown as ControllerRequest;

      await taskController.getTasks(req, mockResponse as Response, mockNext);

      expect(mockTaskService.getTasksByUser).toHaveBeenCalledWith(mockUser.id, {
        search: 'test',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH
      });
    });
  });

  // ===================================
  // Phase 5: Authorization Tests
  // ===================================

  describe('Phase 5: Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Mock error handler to return 401 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 401,
        response: {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'User authentication required',
            type: 'AUTHENTICATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        }
      });

      const req = {
        user: null,
        body: { title: 'Test' }
      } as unknown as ControllerRequest;

      await taskController.createTask(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});
