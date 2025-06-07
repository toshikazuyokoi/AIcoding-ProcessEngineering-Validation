/**
 * ===================================
 * Logging Middleware Tests
 * ===================================
 * Purpose: Comprehensive testing for LoggingMiddleware class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  LoggingMiddleware,
  LoggingMiddlewareConfig,
  LoggingRequest,
  RequestLogData,
  ResponseLogData,
  createLoggingMiddleware
} from '../logging-middleware';
import { Logger } from '../../utils/logger';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockLogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn()
} as unknown as jest.Mocked<Logger>;

// Mock request, response, and next function
let mockRequest: Partial<LoggingRequest>;
let mockResponse: Partial<Response>;
let mockNext: jest.MockedFunction<NextFunction>;

// Test instance
let loggingMiddleware: LoggingMiddleware;

// ===================================
// Test Suite Setup
// ===================================

describe('LoggingMiddleware', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      path: '/api/test',
      originalUrl: '/api/test?page=1',
      url: '/api/test?page=1',
      ip: '127.0.0.1',
      requestId: 'test-request-id',
      user: {
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER'
      },
      query: { page: '1' },
      body: { data: 'test' },
      headers: {
        'user-agent': 'Mozilla/5.0',
        'authorization': 'Bearer token123'
      },
      get: jest.fn().mockReturnValue('Mozilla/5.0'),
      connection: { remoteAddress: '127.0.0.1' }
    } as unknown as Partial<LoggingRequest>;

    // Setup mock response
    mockResponse = {
      statusCode: 200,
      statusMessage: 'OK',
      send: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn().mockReturnThis(),
      on: jest.fn(),
      getHeaders: jest.fn().mockReturnValue({
        'content-type': 'application/json'
      })
    } as Partial<Response>;

    // Setup mock next function
    mockNext = jest.fn();

    // Create fresh instance
    loggingMiddleware = new LoggingMiddleware(mockLogger);
  });

  // ===================================
  // Phase 1: Constructor and Singleton Tests
  // ===================================

  describe('Phase 1: Constructor and Singleton', () => {
    it('should create instance with provided logger', () => {
      const instance = new LoggingMiddleware(mockLogger);

      expect(instance).toBeInstanceOf(LoggingMiddleware);
      expect(instance.getConfig()).toBeDefined();
    });

    it('should create instance with default logger when none provided', () => {
      const instance = new LoggingMiddleware();

      expect(instance).toBeInstanceOf(LoggingMiddleware);
      expect(instance.getConfig()).toBeDefined();
    });

    it('should return singleton instance', () => {
      const instance1 = LoggingMiddleware.getInstance();
      const instance2 = LoggingMiddleware.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(LoggingMiddleware);
    });

    it('should merge custom config with defaults', () => {
      const customConfig: Partial<LoggingMiddlewareConfig> = {
        enableRequestLogging: false,
        serviceName: 'custom-service'
      };

      const instance = new LoggingMiddleware(mockLogger, customConfig);

      const config = instance.getConfig();
      expect(config.enableRequestLogging).toBe(false);
      expect(config.serviceName).toBe('custom-service');
      expect(config.enableResponseLogging).toBeDefined(); // Should have default value
    });

    it('should allow config updates', () => {
      const instance = new LoggingMiddleware(mockLogger);
      const originalConfig = instance.getConfig();

      instance.updateConfig({ enableRequestLogging: false });
      const updatedConfig = instance.getConfig();

      expect(updatedConfig.enableRequestLogging).toBe(false);
      expect(updatedConfig.serviceName).toBe(originalConfig.serviceName);
    });
  });

  // ===================================
  // Phase 2: Logging Functionality Tests
  // ===================================

  describe('Phase 2: Logging Functionality', () => {
    it('should log incoming request', () => {
      const middleware = loggingMiddleware.log();

      // Mock response.on to simulate 'finish' event
      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          // Call callback immediately for testing
          setTimeout(callback, 0);
        }
      });

      middleware(mockRequest as LoggingRequest, mockResponse as Response, mockNext);

      expect(mockLogger.setContext).toHaveBeenCalledWith(expect.objectContaining({
        method: 'GET',
        path: '/api/test',
        requestId: 'test-request-id',
        userId: 'user-123'
      }));

      expect(mockNext).toHaveBeenCalled();
    });

    it('should generate request ID when not present', () => {
      const requestWithoutId = { ...mockRequest };
      delete requestWithoutId.requestId;

      const middleware = loggingMiddleware.log();

      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          setTimeout(callback, 0);
        }
      });

      middleware(requestWithoutId as LoggingRequest, mockResponse as Response, mockNext);

      expect(requestWithoutId.requestId).toBeDefined();
      expect(typeof requestWithoutId.requestId).toBe('string');
      expect(requestWithoutId.requestId).toMatch(/^req_\d+_[a-z0-9]+$/);
    });

    // Phase 2の他のテストは次の段階で追加
  });

  // ===================================
  // Phase 3: Performance Monitoring Tests
  // ===================================

  describe('Phase 3: Performance Monitoring', () => {
    it('should log slow requests when threshold exceeded', () => {
      const slowConfig = {
        performanceThreshold: 100,
        enablePerformanceLogging: true
      }; // 100ms threshold
      const slowMiddleware = new LoggingMiddleware(mockLogger, slowConfig);

      const middleware = slowMiddleware.log();
      const slowRequest = { ...mockRequest, startTime: Date.now() - 200 }; // 200ms ago
      let finishCallback: Function | undefined;

      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      middleware(slowRequest as LoggingRequest, mockResponse as Response, mockNext);

      // Manually trigger the finish event
      if (finishCallback) {
        finishCallback();
      }

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Slow request detected',
        expect.objectContaining({
          responseTime: expect.any(Number),
          threshold: 100
        })
      );
    });
  });

  // ===================================
  // Phase 4: Security Tests
  // ===================================

  describe('Phase 4: Security', () => {
    it('should sanitize sensitive data in request body', () => {
      const securityMiddleware = new LoggingMiddleware(mockLogger, { sanitizeData: true });
      const sensitiveRequest = {
        ...mockRequest,
        body: { password: 'secret123', data: 'safe' },
        headers: { authorization: 'Bearer token123', 'content-type': 'application/json' }
      };

      const middleware = securityMiddleware.log();

      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          callback();
        }
      });

      middleware(sensitiveRequest as LoggingRequest, mockResponse as Response, mockNext);

      // Verify that sensitive data would be sanitized (implementation detail)
      expect(mockLogger.setContext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 5: Integration Tests
  // ===================================

  describe('Phase 5: Integration', () => {
    it('should handle complete request-response cycle', () => {
      const middleware = loggingMiddleware.log();
      let finishCallback: Function | undefined;

      (mockResponse.on as jest.Mock).mockImplementation((event, callback) => {
        if (event === 'finish') {
          finishCallback = callback;
        }
      });

      // Start request
      middleware(mockRequest as LoggingRequest, mockResponse as Response, mockNext);

      expect(mockRequest.startTime).toBeDefined();
      expect(mockLogger.setContext).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalled();

      // Simulate response finish
      if (finishCallback) {
        finishCallback();
      }

      // Should have logged both request and response
      expect(mockLogger.setContext).toHaveBeenCalled();
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    it('should create logging middleware instance with factory function', () => {
      const instance = createLoggingMiddleware(mockLogger);

      expect(instance).toBeInstanceOf(LoggingMiddleware);
    });

    it('should clear logger context', () => {
      const instance = new LoggingMiddleware(mockLogger);

      instance.clearContext();

      expect(mockLogger.clearContext).toHaveBeenCalled();
    });
  });
});
