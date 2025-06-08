/**
 * ===================================
 * Category Controller Tests
 * ===================================
 * Purpose: Comprehensive testing for CategoryController class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  CategoryController,
  CategoryControllerRequest,
  CategoryListResponse,
  CategoryDetailResponse,
  createCategoryController
} from '../category-controller';
import { ControllerRequest } from '../base-controller';
import { CategoryService, CategorySearchFilters, CreateCategoryRequest, UpdateCategoryRequest } from '../../domain/services/category.service';
import { ResponseBuilder } from '../../utils/response-builder';
import { ErrorHandler } from '../../utils/error-handler';
import { Logger } from '../../utils/logger';
import { RequestValidator } from '../../utils/request-validator';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockCategoryService = {
  getCategoriesByUser: jest.fn(),
  createCategory: jest.fn(),
  getCategoryById: jest.fn(),
  updateCategory: jest.fn(),
  deleteCategory: jest.fn()
} as unknown as jest.Mocked<CategoryService>;

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
let categoryController: CategoryController;

// Test data
const mockCategory = {
  id: 'category-123',
  name: 'Work',
  color: '#FF0000',
  description: 'Work related tasks',
  userId: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date()
} as any;

const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'USER'
};

// ===================================
// Test Suite Setup
// ===================================

describe('CategoryController', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      path: '/api/categories',
      query: {},
      body: {},
      params: {},
      user: mockAuthUser,
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
    categoryController = new CategoryController(
      mockCategoryService,
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
      expect(categoryController).toBeInstanceOf(CategoryController);
      expect(categoryController.getControllerName()).toBe('CategoryController');
    });

    it('should create instance with category-specific configuration', () => {
      const config = categoryController.getConfig();
      
      expect(config.enableLogging).toBe(true);
      expect(config.enableValidation).toBe(true);
      expect(config.serviceName).toBe('category-api');
      expect(config.enableUserContext).toBe(true);
    });

    it('should create instance using factory function', () => {
      const controller = createCategoryController(mockCategoryService);
      
      expect(controller).toBeInstanceOf(CategoryController);
      expect(controller.getControllerName()).toBe('CategoryController');
    });
  });

  // ===================================
  // Phase 2: Category List Tests
  // ===================================

  describe('Phase 2: Category List', () => {
    it('should get categories list successfully', async () => {
      mockCategoryService.getCategoriesByUser.mockResolvedValue([mockCategory]);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockAuthUser,
        query: {}
      } as unknown as ControllerRequest;

      await categoryController.getCategories(req, mockResponse as Response, mockNext);

      expect(mockCategoryService.getCategoriesByUser).toHaveBeenCalledWith(mockAuthUser.id, {});
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });

    it('should handle authentication error for categories list', async () => {
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

      await categoryController.getCategories(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  // ===================================
  // Phase 3: Category CRUD Tests
  // ===================================

  describe('Phase 3: Category CRUD', () => {
    it('should create category successfully', async () => {
      mockCategoryService.createCategory.mockResolvedValue(mockCategory);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockAuthUser,
        body: { name: 'Work', color: '#FF0000', description: 'Work tasks' }
      } as unknown as ControllerRequest;

      await categoryController.createCategory(req, mockResponse as Response, mockNext);

      expect(mockCategoryService.createCategory).toHaveBeenCalled();
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });

    it('should get category by ID successfully', async () => {
      mockCategoryService.getCategoryById.mockResolvedValue(mockCategory);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockAuthUser,
        params: { id: 'category-123' }
      } as unknown as ControllerRequest;

      await categoryController.getCategoryById(req, mockResponse as Response, mockNext);

      expect(mockCategoryService.getCategoryById).toHaveBeenCalledWith('category-123', mockAuthUser.id);
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 4: Validation Tests
  // ===================================

  describe('Phase 4: Validation', () => {
    it('should validate required fields for creation', async () => {
      // Mock error handler to return 400 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 400,
        response: { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Category name is required',
            type: 'VALIDATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          } 
        }
      });

      const req = {
        user: mockAuthUser,
        body: { color: '#FF0000' } // Missing name
      } as unknown as ControllerRequest;

      await categoryController.createCategory(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });

    it('should validate color format', async () => {
      // Mock error handler to return 400 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 400,
        response: { 
          success: false, 
          error: { 
            code: 'VALIDATION_ERROR', 
            message: 'Color must be a valid hex color (e.g., #FF0000)',
            type: 'VALIDATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          } 
        }
      });

      const req = {
        user: mockAuthUser,
        body: { name: 'Work', color: 'invalid-color' }
      } as unknown as ControllerRequest;

      await categoryController.createCategory(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
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
        body: { name: 'Work', color: '#FF0000' }
      } as unknown as ControllerRequest;

      await categoryController.createCategory(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});
