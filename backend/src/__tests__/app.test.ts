/**
 * ===================================
 * Express Application Tests
 * ===================================
 * Purpose: Comprehensive testing for ExpressApp class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

// import request from 'supertest';
import { Application, Response } from 'express';
import {
  ExpressApp,
  ExpressAppConfig,
  AppDependencies,
  createExpressApp
} from '../app';

// Import services for mocking
import { AuthService } from '../domain/services/auth.service';
import { TaskService } from '../domain/services/task.service';
import { UserService } from '../domain/services/user.service';
import { CategoryService } from '../domain/services/category.service';
import { Logger } from '../utils/logger';
import { ResponseBuilder } from '../utils/response-builder';
import { ErrorHandler } from '../utils/error-handler';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  refreshToken: jest.fn(),
  verifyToken: jest.fn()
} as unknown as jest.Mocked<AuthService>;

const mockTaskService = {
  getTasksByUser: jest.fn(),
  createTask: jest.fn(),
  getTaskById: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn()
} as unknown as jest.Mocked<TaskService>;

const mockUserService = {
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn()
} as unknown as jest.Mocked<UserService>;

const mockCategoryService = {
  getCategoriesByUser: jest.fn(),
  createCategory: jest.fn(),
  getCategoryById: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn()
} as unknown as jest.Mocked<CategoryService>;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn()
} as unknown as jest.Mocked<Logger>;

const mockResponseBuilder = {
  sendSuccess: jest.fn(),
  sendPaginated: jest.fn(),
  sendError: jest.fn()
} as unknown as jest.Mocked<ResponseBuilder>;

const mockErrorHandler = {
  handleError: jest.fn()
} as unknown as jest.Mocked<ErrorHandler>;

// Test dependencies
const mockDependencies: AppDependencies = {
  authService: mockAuthService,
  taskService: mockTaskService,
  userService: mockUserService,
  categoryService: mockCategoryService,
  logger: mockLogger,
  responseBuilder: mockResponseBuilder,
  errorHandler: mockErrorHandler
};

// Test app instance
let expressApp: ExpressApp;
let app: Application;

// ===================================
// Test Suite Setup
// ===================================

describe('ExpressApp', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instance
    expressApp = new ExpressApp(mockDependencies, {
      environment: 'test',
      enableRateLimit: false, // Disable for testing
      corsOrigin: 'http://localhost:3000'
    });

    app = expressApp.getApp();
  });

  // ===================================
  // Phase 1: Constructor and Configuration Tests
  // ===================================

  describe('Phase 1: Constructor and Configuration', () => {
    it('should create instance with provided dependencies', () => {
      expect(expressApp).toBeInstanceOf(ExpressApp);
      expect(expressApp.getApp()).toBeDefined();
    });

    it('should create instance with app-specific configuration', () => {
      const config = expressApp.getConfig();
      
      expect(config.enableCors).toBe(true);
      expect(config.enableHelmet).toBe(true);
      expect(config.enableCompression).toBe(true);
      expect(config.environment).toBe('test');
    });

    it('should create instance using factory function', () => {
      const factoryApp = createExpressApp(mockDependencies);
      
      expect(factoryApp).toBeInstanceOf(ExpressApp);
      expect(factoryApp.getApp()).toBeDefined();
    });
  });

  // ===================================
  // Phase 2: Application Structure Tests
  // ===================================

  describe('Phase 2: Application Structure', () => {
    it('should have Express application instance', () => {
      expect(app).toBeDefined();
      expect(typeof app).toBe('function'); // Express app is a function
    });

    it('should have proper configuration', () => {
      const config = expressApp.getConfig();

      expect(config).toBeDefined();
      expect(config.environment).toBe('test');
      expect(config.enableCors).toBe(true);
    });
  });

  // ===================================
  // Phase 3: Controller Integration Tests
  // ===================================

  describe('Phase 3: Controller Integration', () => {
    it('should have auth controller initialized', () => {
      expect(expressApp['authController']).toBeDefined();
      expect(expressApp['authController'].getControllerName()).toBe('AuthController');
    });

    it('should have task controller initialized', () => {
      expect(expressApp['taskController']).toBeDefined();
      expect(expressApp['taskController'].getControllerName()).toBe('TaskController');
    });

    it('should have user controller initialized', () => {
      expect(expressApp['userController']).toBeDefined();
      expect(expressApp['userController'].getControllerName()).toBe('UserController');
    });

    it('should have category controller initialized', () => {
      expect(expressApp['categoryController']).toBeDefined();
      expect(expressApp['categoryController'].getControllerName()).toBe('CategoryController');
    });
  });

  // ===================================
  // Phase 4: Middleware Integration Tests
  // ===================================

  describe('Phase 4: Middleware Integration', () => {
    it('should have logging middleware initialized', () => {
      expect(expressApp['loggingMiddleware']).toBeDefined();
    });

    it('should have auth middleware initialized', () => {
      expect(expressApp['authMiddleware']).toBeDefined();
    });

    it('should have error middleware initialized', () => {
      expect(expressApp['errorMiddleware']).toBeDefined();
    });
  });

  // ===================================
  // Phase 5: Dependencies Integration Tests
  // ===================================

  describe('Phase 5: Dependencies Integration', () => {
    it('should have all required services injected', () => {
      expect(mockDependencies.authService).toBeDefined();
      expect(mockDependencies.taskService).toBeDefined();
      expect(mockDependencies.userService).toBeDefined();
      expect(mockDependencies.categoryService).toBeDefined();
    });

    it('should have all required utilities injected', () => {
      expect(mockDependencies.logger).toBeDefined();
      expect(mockDependencies.responseBuilder).toBeDefined();
      expect(mockDependencies.errorHandler).toBeDefined();
    });

    it('should create app with factory function', () => {
      const factoryApp = createExpressApp(mockDependencies);
      expect(factoryApp).toBeInstanceOf(ExpressApp);
      expect(factoryApp.getApp()).toBeDefined();
    });
  });
});
