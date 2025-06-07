/**
 * ===================================
 * Error Middleware Tests
 * ===================================
 * Purpose: Comprehensive testing for ErrorMiddleware class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  ErrorMiddleware,
  ErrorMiddlewareConfig,
  ErrorRequest,
  createErrorMiddleware
} from '../error-middleware';
import { ErrorHandler, AppError, ErrorType, ErrorSeverity } from '../../utils/error-handler';
import { Logger } from '../../utils/logger';
import { ResponseBuilder } from '../../utils/response-builder';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockErrorHandler = {
  handleError: jest.fn(),
  classifyError: jest.fn(),
  getStatusCode: jest.fn(),
  formatErrorResponse: jest.fn(),
  logError: jest.fn(),
  isOperationalError: jest.fn(),
  getErrorSeverity: jest.fn(),
  getInstance: jest.fn()
} as unknown as jest.Mocked<ErrorHandler>;

const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn(),
  getInstance: jest.fn()
} as unknown as jest.Mocked<Logger>;

const mockResponseBuilder = {
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
  getInstance: jest.fn()
} as unknown as jest.Mocked<ResponseBuilder>;

// Mock request, response, and next function
let mockRequest: Partial<ErrorRequest>;
let mockResponse: Partial<Response>;
let mockNext: jest.MockedFunction<NextFunction>;

// Test instance
let errorMiddleware: ErrorMiddleware;

// ===================================
// Test Suite Setup
// ===================================

describe('ErrorMiddleware', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      ip: '127.0.0.1',
      requestId: 'test-request-id',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER'
      },
      startTime: Date.now() - 100,
      query: { page: '1' },
      body: { data: 'test' },
      params: { id: '123' },
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      connection: { remoteAddress: '127.0.0.1' }
    } as unknown as Partial<ErrorRequest>;

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    } as Partial<Response>;

    // Setup mock next function
    mockNext = jest.fn();

    // Create fresh instance
    errorMiddleware = new ErrorMiddleware(
      mockErrorHandler,
      mockLogger,
      mockResponseBuilder
    );
  });

  // ===================================
  // Phase 1: Constructor and Singleton Tests
  // ===================================

  describe('Phase 1: Constructor and Singleton', () => {
    it('should create instance with provided dependencies', () => {
      const instance = new ErrorMiddleware(
        mockErrorHandler,
        mockLogger,
        mockResponseBuilder
      );

      expect(instance).toBeInstanceOf(ErrorMiddleware);
      expect(instance.getConfig()).toBeDefined();
    });

    it('should create instance with default dependencies when none provided', () => {
      const instance = new ErrorMiddleware();

      expect(instance).toBeInstanceOf(ErrorMiddleware);
      expect(instance.getConfig()).toBeDefined();
    });

    it('should return singleton instance', () => {
      const instance1 = ErrorMiddleware.getInstance();
      const instance2 = ErrorMiddleware.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(ErrorMiddleware);
    });

    it('should merge custom config with defaults', () => {
      const customConfig: Partial<ErrorMiddlewareConfig> = {
        enableStackTrace: false,
        serviceName: 'custom-service'
      };

      const instance = new ErrorMiddleware(
        mockErrorHandler,
        mockLogger,
        mockResponseBuilder,
        customConfig
      );

      const config = instance.getConfig();
      expect(config.enableStackTrace).toBe(false);
      expect(config.serviceName).toBe('custom-service');
      expect(config.enableMonitoring).toBeDefined(); // Should have default value
    });

    it('should allow config updates', () => {
      const instance = new ErrorMiddleware();
      const originalConfig = instance.getConfig();

      instance.updateConfig({ enableStackTrace: false });
      const updatedConfig = instance.getConfig();

      expect(updatedConfig.enableStackTrace).toBe(false);
      expect(updatedConfig.serviceName).toBe(originalConfig.serviceName);
    });
  });

  // ===================================
  // Phase 2: Error Handling Tests
  // ===================================

  describe('Phase 2: Error Handling', () => {
    it('should handle basic error with middleware', () => {
      const testError = new Error('Test error');
      const expectedResponse = {
        success: false as const,
        error: {
          code: 'Error',
          message: 'Test error',
          type: 'INTERNAL' as any,
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      };

      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 500,
        response: expectedResponse
      });

      const middleware = errorMiddleware.handle();
      middleware(testError, mockRequest as ErrorRequest, mockResponse as Response, mockNext);

      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(testError, expect.any(Object));
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          message: 'Test error'
        })
      }));
    });

    // Phase 2の他のテストは次の段階で追加
  });

  // ===================================
  // Phase 3: Context Building Tests
  // ===================================

  describe('Phase 3: Context Building', () => {
    it('should build error context from request', () => {
      const testError = new Error('Context test');
      const expectedResponse = {
        success: false as const,
        error: {
          code: 'Error',
          message: 'Context test',
          type: 'INTERNAL' as any,
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      };

      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 500,
        response: expectedResponse
      });

      const middleware = errorMiddleware.handle();
      middleware(testError, mockRequest as ErrorRequest, mockResponse as Response, mockNext);

      // Verify context was built with request information
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(testError, expect.objectContaining({
        method: 'GET',
        path: '/api/test',
        requestId: 'test-request-id',
        userId: 'user-123'
      }));
    });

    // Phase 3の他のテストは次の段階で追加
  });

  // ===================================
  // Phase 4: Security Tests
  // ===================================

  describe('Phase 4: Security', () => {
    it('should sanitize sensitive data from request', () => {
      const testError = new Error('Security test');
      const sensitiveRequest = {
        ...mockRequest,
        body: { password: 'secret123', data: 'safe' },
        query: { token: 'secret-token', page: '1' }
      };

      const expectedResponse = {
        success: false as const,
        error: {
          code: 'Error',
          message: 'Security test',
          type: 'INTERNAL' as any,
          timestamp: '2023-01-01T00:00:00.000Z'
        }
      };

      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 500,
        response: expectedResponse
      });

      const middleware = errorMiddleware.handle();
      middleware(testError, sensitiveRequest as ErrorRequest, mockResponse as Response, mockNext);

      // Verify sensitive data was sanitized in context
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(testError, expect.objectContaining({
        metadata: expect.objectContaining({
          body: expect.objectContaining({
            password: '[REDACTED]',
            data: 'safe'
          }),
          query: expect.objectContaining({
            token: '[REDACTED]',
            page: '1'
          })
        })
      }));
    });
  });

  // ===================================
  // Phase 5: Integration Tests
  // ===================================

  describe('Phase 5: Integration', () => {
    it('should handle fallback error when error handling fails', () => {
      const testError = new Error('Original error');

      // Make handleError throw an error
      mockErrorHandler.handleError.mockImplementation(() => {
        throw new Error('Handler failed');
      });

      const middleware = errorMiddleware.handle();
      middleware(testError, mockRequest as ErrorRequest, mockResponse as Response, mockNext);

      // Should fall back to minimal error response
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred'
        })
      }));
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    it('should create error middleware instance with factory function', () => {
      const instance = createErrorMiddleware(
        mockErrorHandler,
        mockLogger,
        mockResponseBuilder
      );

      expect(instance).toBeInstanceOf(ErrorMiddleware);
    });
  });
});
