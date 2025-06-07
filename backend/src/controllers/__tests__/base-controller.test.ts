/**
 * ===================================
 * Base Controller Tests
 * ===================================
 * Purpose: Comprehensive testing for BaseController class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  BaseController,
  BaseControllerConfig,
  ControllerRequest,
  ControllerActionResult,
  PaginationParams,
  FilterParams,
  createBaseController,
  defaultBaseControllerConfig
} from '../base-controller';
import { ResponseBuilder } from '../../utils/response-builder';
import { ErrorHandler, AppError, ErrorType } from '../../utils/error-handler';
import { Logger } from '../../utils/logger';
import { RequestValidator } from '../../utils/request-validator';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockResponseBuilder = {
  sendSuccess: jest.fn(),
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

// Test controller implementation
class TestController extends BaseController {
  constructor(config?: Partial<BaseControllerConfig>) {
    super(
      'TestController',
      mockResponseBuilder,
      mockErrorHandler,
      mockLogger,
      mockValidator,
      config
    );
  }

  public testSendSuccess<T>(res: Response, data?: T, message?: string, statusCode?: number, metadata?: Record<string, any>) {
    return this.sendSuccess(res, data, message, statusCode, metadata);
  }

  public testSendError(res: Response, error: Error) {
    return this.sendError(res, error);
  }

  public testExtractPaginationParams(req: ControllerRequest) {
    return this.extractPaginationParams(req);
  }

  public testExtractFilterParams(req: ControllerRequest, allowedFilters: string[]) {
    return this.extractFilterParams(req, allowedFilters);
  }

  public testSetControllerContext(req: ControllerRequest, actionName: string) {
    return this.setControllerContext(req, actionName);
  }
}

// Test instance
let testController: TestController;

// ===================================
// Test Suite Setup
// ===================================

describe('BaseController', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      query: { page: '2', limit: '20', filter1: 'value1' },
      body: { data: 'test' },
      requestId: 'test-request-id',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER'
      }
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
    testController = new TestController();
  });

  // ===================================
  // Phase 1: Constructor and Configuration Tests
  // ===================================

  describe('Phase 1: Constructor and Configuration', () => {
    it('should create instance with provided dependencies', () => {
      const controller = new TestController();

      expect(controller).toBeInstanceOf(BaseController);
      expect(controller.getControllerName()).toBe('TestController');
      expect(controller.getConfig()).toBeDefined();
    });

    it('should create instance with default configuration', () => {
      const controller = new TestController();
      const config = controller.getConfig();

      expect(config.enableLogging).toBe(true);
      expect(config.enableValidation).toBe(true);
      expect(config.enableErrorHandling).toBe(true);
      expect(config.serviceName).toBe('task-management-api');
    });

    it('should merge custom config with defaults', () => {
      const customConfig: Partial<BaseControllerConfig> = {
        enableLogging: false,
        serviceName: 'custom-service'
      };

      const controller = new TestController(customConfig);
      const config = controller.getConfig();

      expect(config.enableLogging).toBe(false);
      expect(config.serviceName).toBe('custom-service');
      expect(config.enableValidation).toBe(true); // Should have default value
    });

    it('should allow config updates', () => {
      const controller = new TestController();
      const originalConfig = controller.getConfig();

      controller.updateConfig({ enableLogging: false });
      const updatedConfig = controller.getConfig();

      expect(updatedConfig.enableLogging).toBe(false);
      expect(updatedConfig.serviceName).toBe(originalConfig.serviceName);
    });

    it('should return correct controller name', () => {
      const controller = new TestController();

      expect(controller.getControllerName()).toBe('TestController');
    });
  });

  // ===================================
  // Phase 2: Response Handling Tests
  // ===================================

  describe('Phase 2: Response Handling', () => {
    it('should send success response', () => {
      const testData = { id: 1, name: 'test' };
      const message = 'Success message';

      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const result = testController.testSendSuccess(mockResponse as Response, testData, message, 200);

      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        testData,
        200,
        undefined
      );
      expect(result).toBe(mockResponse);
    });

    it('should send success response with metadata', () => {
      const testData = { id: 1, name: 'test' };
      const metadata = { extra: 'info' };

      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const result = testController.testSendSuccess(mockResponse as Response, testData, 'Success', 201, metadata);

      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        testData,
        201,
        { metadata }
      );
      expect(result).toBe(mockResponse);
    });

    it('should handle error in success response', () => {
      const testData = { id: 1, name: 'test' };
      const error = new Error('Response error');

      mockResponseBuilder.sendSuccess.mockImplementation(() => {
        throw error;
      });
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 500,
        response: {
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Internal error',
            type: 'INTERNAL' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        }
      });

      testController.testSendSuccess(mockResponse as Response, testData);

      expect(mockLogger.error).toHaveBeenCalledWith('Failed to send success response', error);
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
    });

    // Phase 2の他のテストは次の段階で追加
  });

  // ===================================
  // Phase 3: Error Handling Tests
  // ===================================

  describe('Phase 3: Error Handling', () => {
    it('should send error response', () => {
      const error = new Error('Test error');

      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 400,
        response: {
          success: false,
          error: {
            code: 'TEST_ERROR',
            message: 'Test error',
            type: 'VALIDATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        }
      });

      const result = testController.testSendError(mockResponse as Response, error);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(error);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalled();
      expect(result).toBe(mockResponse);
    });
  });

  // ===================================
  // Phase 4: Common Processing Tests
  // ===================================

  describe('Phase 4: Common Processing', () => {
    it('should extract pagination parameters', () => {
      const req = {
        query: { page: '3', limit: '25' }
      } as unknown as ControllerRequest;

      const result = testController.testExtractPaginationParams(req);

      expect(result).toEqual({
        page: 3,
        limit: 25,
        offset: 50
      });
    });

    it('should extract filter parameters', () => {
      const req = {
        query: { name: 'test', status: 'active', invalid: 'should-be-ignored' }
      } as unknown as ControllerRequest;

      const result = testController.testExtractFilterParams(req, ['name', 'status']);

      expect(result).toEqual({
        name: 'test',
        status: 'active'
      });
    });
  });

  // ===================================
  // Phase 5: Integration Tests
  // ===================================

  describe('Phase 5: Integration', () => {
    it('should set controller context', () => {
      const req = {
        requestId: 'test-123',
        user: { id: 'user-456', email: 'test@example.com', role: 'USER' },
        method: 'POST',
        path: '/api/test'
      } as ControllerRequest;

      testController.testSetControllerContext(req, 'testAction');

      expect(req.controllerContext).toEqual({
        controllerName: 'TestController',
        actionName: 'testAction'
      });

      expect(mockLogger.setContext).toHaveBeenCalledWith({
        method: 'POST',
        path: '/api/test',
        requestId: 'test-123',
        userId: 'user-456'
      });
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    it('should create base controller instance with factory function', () => {
      const controller = createBaseController(
        'FactoryController',
        mockResponseBuilder,
        mockErrorHandler,
        mockLogger,
        mockValidator
      );

      expect(controller).toBeInstanceOf(BaseController);
      expect(controller.getControllerName()).toBe('FactoryController');
    });

    it('should export default configuration', () => {
      expect(defaultBaseControllerConfig).toBeDefined();
      expect(defaultBaseControllerConfig.enableLogging).toBe(true);
      expect(defaultBaseControllerConfig.serviceName).toBe('task-management-api');
    });
  });
});
