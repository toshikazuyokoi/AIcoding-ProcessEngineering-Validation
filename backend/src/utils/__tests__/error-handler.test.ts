/**
 * ===================================
 * Error Handler Tests
 * ===================================
 * Purpose: Comprehensive testing for ErrorHandler class and custom error classes
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  ErrorHandler,
  ErrorType,
  ErrorSeverity,
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  DatabaseError,
  NetworkError,
  RateLimitError,
  ExternalServiceError,
  createErrorHandler,
  createValidationError,
  createNotFoundError,
  errorHandler
} from '../error-handler';

// Mock logger
jest.mock('../logger', () => ({
  createLogger: jest.fn(() => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    setContext: jest.fn(),
    clearContext: jest.fn()
  }))
}));

// Mock environment variables
const originalEnv = process.env;

describe('ErrorHandler', () => {
  let handler: ErrorHandler;
  let mockLogger: any;

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      ERROR_STACK_TRACE: 'true',
      ERROR_MONITORING_ENABLED: 'false',
      SERVICE_NAME: 'test-service'
    };

    // Clear all mocks
    jest.clearAllMocks();

    handler = new ErrorHandler();
    mockLogger = (handler as any).logger;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Configuration', () => {
    test('should create handler with default configuration', () => {
      const config = handler.getConfig();

      expect(config.enableStackTrace).toBe(true); // NODE_ENV=test
      expect(config.enableMonitoring).toBe(false);
      expect(config.logLevel).toBe('error');
      expect(config.includeContext).toBe(true);
      expect(config.serviceName).toBe('test-service');
    });

    test('should create handler with custom configuration', () => {
      const customConfig = {
        enableStackTrace: false,
        logLevel: 'warn' as const,
        serviceName: 'custom-service'
      };

      const customHandler = new ErrorHandler(customConfig);
      const config = customHandler.getConfig();

      expect(config.enableStackTrace).toBe(false);
      expect(config.logLevel).toBe('warn');
      expect(config.serviceName).toBe('custom-service');
    });

    test('should update configuration', () => {
      handler.updateConfig({ enableMonitoring: true });
      const config = handler.getConfig();

      expect(config.enableMonitoring).toBe(true);
    });
  });

  describe('Error Classification', () => {
    test('should classify AppError instances correctly', () => {
      const validationError = new ValidationError('Invalid input');
      const authError = new AuthenticationError();
      const notFoundError = new NotFoundError('User');

      expect(handler.classifyError(validationError)).toBe(ErrorType.VALIDATION);
      expect(handler.classifyError(authError)).toBe(ErrorType.AUTHENTICATION);
      expect(handler.classifyError(notFoundError)).toBe(ErrorType.NOT_FOUND);
    });

    test('should classify generic errors by message patterns', () => {
      const validationError = new Error('Validation failed');
      const authError = new Error('Unauthorized access');
      const notFoundError = new Error('Resource not found');
      const databaseError = new Error('Database connection failed');
      const unknownError = new Error('Something went wrong');

      expect(handler.classifyError(validationError)).toBe(ErrorType.VALIDATION);
      expect(handler.classifyError(authError)).toBe(ErrorType.AUTHENTICATION);
      expect(handler.classifyError(notFoundError)).toBe(ErrorType.NOT_FOUND);
      expect(handler.classifyError(databaseError)).toBe(ErrorType.DATABASE);
      expect(handler.classifyError(unknownError)).toBe(ErrorType.INTERNAL);
    });
  });

  describe('HTTP Status Code Mapping', () => {
    test('should return correct status codes for different error types', () => {
      const validationError = new ValidationError('Invalid input');
      const authError = new AuthenticationError();
      const authzError = new AuthorizationError();
      const notFoundError = new NotFoundError('User');
      const conflictError = new ConflictError('Duplicate email');
      const databaseError = new DatabaseError('Connection failed');

      expect(handler.getStatusCode(validationError)).toBe(400);
      expect(handler.getStatusCode(authError)).toBe(401);
      expect(handler.getStatusCode(authzError)).toBe(403);
      expect(handler.getStatusCode(notFoundError)).toBe(404);
      expect(handler.getStatusCode(conflictError)).toBe(409);
      expect(handler.getStatusCode(databaseError)).toBe(500);
    });

    test('should return 500 for unknown errors', () => {
      const unknownError = new Error('Unknown error');
      expect(handler.getStatusCode(unknownError)).toBe(500);
    });
  });

  describe('Error Response Formatting', () => {
    test('should format basic error response', () => {
      const error = new ValidationError('Invalid input');
      const context = { requestId: 'req-123' };

      const response = handler.formatErrorResponse(error, context);

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('ValidationError');
      expect(response.error.message).toBe('Invalid input');
      expect(response.error.type).toBe(ErrorType.VALIDATION);
      expect(response.error.requestId).toBe('req-123');
      expect(response.error.timestamp).toBeDefined();
    });

    test('should include validation details for ValidationError', () => {
      const details = { email: ['Invalid format'], password: ['Too short'] };
      const error = new ValidationError('Validation failed', details);

      const response = handler.formatErrorResponse(error);

      expect(response.error.details).toEqual(details);
    });

    test('should include stack trace in development', () => {
      handler.updateConfig({ enableStackTrace: true });
      const error = new Error('Test error');

      const response = handler.formatErrorResponse(error);

      expect(response.error.stack).toBeDefined();
    });

    test('should exclude stack trace in production', () => {
      handler.updateConfig({ enableStackTrace: false });
      const error = new Error('Test error');

      const response = handler.formatErrorResponse(error);

      expect(response.error.stack).toBeUndefined();
    });
  });

  describe('Error Logging', () => {
    test('should log error with appropriate level based on severity', () => {
      const lowError = new ValidationError('Invalid input');
      const mediumError = new AuthenticationError();
      const highError = new DatabaseError('Connection failed');
      // Create a concrete implementation of AppError for testing
      class TestError extends AppError {
        constructor(message: string, type: ErrorType, severity: ErrorSeverity) {
          super(message, type, severity);
        }
      }
      const criticalError = new TestError('Critical failure', ErrorType.INTERNAL, ErrorSeverity.CRITICAL);

      handler.logError(lowError);
      handler.logError(mediumError);
      handler.logError(highError);
      handler.logError(criticalError);

      expect(mockLogger.info).toHaveBeenCalledTimes(1);
      expect(mockLogger.warn).toHaveBeenCalledTimes(1);
      expect(mockLogger.error).toHaveBeenCalledTimes(2);
    });

    test('should set and clear logger context', () => {
      const error = new Error('Test error');
      const context = {
        requestId: 'req-123',
        userId: 'user-456',
        method: 'POST',
        path: '/api/test'
      };

      handler.logError(error, context);

      expect(mockLogger.setContext).toHaveBeenCalledWith({
        requestId: 'req-123',
        userId: 'user-456',
        method: 'POST',
        path: '/api/test'
      });
      expect(mockLogger.clearContext).toHaveBeenCalled();
    });

    test('should include metadata when context is provided', () => {
      const error = new Error('Test error');
      const context = {
        userAgent: 'Mozilla/5.0',
        ip: '192.168.1.1',
        metadata: { custom: 'data' }
      };

      handler.logError(error, context);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Test error',
        error,
        expect.objectContaining({
          userAgent: 'Mozilla/5.0',
          ip: '192.168.1.1',
          custom: 'data'
        })
      );
    });
  });

  describe('Complete Error Handling', () => {
    test('should handle error completely', () => {
      const error = new ValidationError('Invalid input');
      const context = { requestId: 'req-123' };

      const result = handler.handleError(error, context);

      expect(result.statusCode).toBe(400);
      expect(result.response.success).toBe(false);
      expect(result.response.error.message).toBe('Invalid input');
      expect(mockLogger.info).toHaveBeenCalled();
    });

    test('should notify monitoring for critical errors', () => {
      handler.updateConfig({ enableMonitoring: true });
      // Create a concrete implementation of AppError for testing
      class TestError extends AppError {
        constructor(message: string, type: ErrorType, severity: ErrorSeverity) {
          super(message, type, severity);
        }
      }
      const criticalError = new TestError('Critical failure', ErrorType.INTERNAL, ErrorSeverity.CRITICAL);

      handler.handleError(criticalError);

      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Critical error detected - monitoring notification would be sent',
        expect.any(Object)
      );
    });
  });

  describe('Utility Methods', () => {
    test('should check if error is operational', () => {
      const operationalError = new ValidationError('Invalid input');
      const nonOperationalError = new Error('System error');

      expect(handler.isOperationalError(operationalError)).toBe(true);
      expect(handler.isOperationalError(nonOperationalError)).toBe(false);
    });

    test('should get error severity', () => {
      const lowError = new ValidationError('Invalid input');
      const highError = new DatabaseError('Connection failed');
      const genericError = new Error('Generic error');

      expect(handler.getErrorSeverity(lowError)).toBe(ErrorSeverity.LOW);
      expect(handler.getErrorSeverity(highError)).toBe(ErrorSeverity.HIGH);
      expect(handler.getErrorSeverity(genericError)).toBe(ErrorSeverity.HIGH);
    });
  });

  describe('Custom Error Classes', () => {
    test('should create ValidationError with details', () => {
      const details = { email: ['Invalid format'] };
      const error = new ValidationError('Validation failed', details);

      expect(error.name).toBe('ValidationError');
      expect(error.type).toBe(ErrorType.VALIDATION);
      expect(error.severity).toBe(ErrorSeverity.LOW);
      expect(error.details).toEqual(details);
      expect(error.isOperational).toBe(true);
    });

    test('should create AuthenticationError', () => {
      const error = new AuthenticationError();

      expect(error.name).toBe('AuthenticationError');
      expect(error.type).toBe(ErrorType.AUTHENTICATION);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.message).toBe('Authentication failed');
    });

    test('should create NotFoundError', () => {
      const error = new NotFoundError('User');

      expect(error.name).toBe('NotFoundError');
      expect(error.type).toBe(ErrorType.NOT_FOUND);
      expect(error.message).toBe('User not found');
    });

    test('should create ExternalServiceError', () => {
      const error = new ExternalServiceError('PaymentAPI', 'Service unavailable');

      expect(error.name).toBe('ExternalServiceError');
      expect(error.type).toBe(ErrorType.EXTERNAL_SERVICE);
      expect(error.message).toBe('External service error (PaymentAPI): Service unavailable');
    });
  });

  describe('Utility Functions', () => {
    test('createErrorHandler should return new instance', () => {
      const customHandler = createErrorHandler({ enableStackTrace: false });

      expect(customHandler).toBeInstanceOf(ErrorHandler);
      expect(customHandler.getConfig().enableStackTrace).toBe(false);
    });

    test('createValidationError should return ValidationError', () => {
      const details = { field: ['error'] };
      const error = createValidationError('Invalid', details);

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.details).toEqual(details);
    });

    test('createNotFoundError should return NotFoundError', () => {
      const error = createNotFoundError('Resource');

      expect(error).toBeInstanceOf(NotFoundError);
      expect(error.message).toBe('Resource not found');
    });

    test('default errorHandler should be available', () => {
      expect(errorHandler).toBeInstanceOf(ErrorHandler);
    });
  });

  describe('Edge Cases', () => {
    test('should handle error without context', () => {
      const error = new Error('Test error');

      expect(() => handler.logError(error)).not.toThrow();
      expect(() => handler.handleError(error)).not.toThrow();
    });

    test('should handle error with partial context', () => {
      const error = new Error('Test error');
      const context = { requestId: 'req-123' };

      const result = handler.handleError(error, context);

      expect(result.response.error.requestId).toBe('req-123');
    });

    test('should handle error without stack trace', () => {
      const error = new Error('Test error');
      delete error.stack;

      const response = handler.formatErrorResponse(error);

      expect(response.error.stack).toBeUndefined();
    });
  });
});
