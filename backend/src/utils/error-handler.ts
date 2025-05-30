/**
 * ===================================
 * Error Handler Utility Class
 * ===================================
 * Purpose: Comprehensive error handling system with classification and response formatting
 * Features:
 * - Error classification and categorization
 * - HTTP status code mapping
 * - Structured error responses
 * - Logger integration
 * - Environment-specific error information control
 * - Custom error classes
 * - Monitoring and notification support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { createLogger } from './logger';

// Node.js global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV?: string;
      ERROR_STACK_TRACE?: string;
      ERROR_MONITORING_ENABLED?: string;
      SERVICE_NAME?: string;
    }
  }
}

/**
 * Error types enum
 */
export enum ErrorType {
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  DATABASE = 'DATABASE',
  NETWORK = 'NETWORK',
  INTERNAL = 'INTERNAL',
  RATE_LIMIT = 'RATE_LIMIT',
  EXTERNAL_SERVICE = 'EXTERNAL_SERVICE'
}

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

/**
 * HTTP status code mapping
 */
export const HTTP_STATUS_CODES: Record<ErrorType, number> = {
  [ErrorType.VALIDATION]: 400,
  [ErrorType.AUTHENTICATION]: 401,
  [ErrorType.AUTHORIZATION]: 403,
  [ErrorType.NOT_FOUND]: 404,
  [ErrorType.CONFLICT]: 409,
  [ErrorType.RATE_LIMIT]: 429,
  [ErrorType.DATABASE]: 500,
  [ErrorType.NETWORK]: 500,
  [ErrorType.INTERNAL]: 500,
  [ErrorType.EXTERNAL_SERVICE]: 502
};

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    type: ErrorType;
    timestamp: string;
    requestId?: string;
    details?: Record<string, any>;
    stack?: string;
  };
}

/**
 * Error context interface
 */
export interface ErrorContext {
  requestId?: string;
  userId?: string;
  method?: string;
  path?: string;
  userAgent?: string;
  ip?: string;
  metadata?: Record<string, any>;
}

/**
 * Base application error class
 */
export abstract class AppError extends Error {
  public readonly type: ErrorType;
  public readonly severity: ErrorSeverity;
  public readonly isOperational: boolean;
  public readonly context?: ErrorContext | undefined;

  constructor(
    message: string,
    type: ErrorType,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    isOperational: boolean = true,
    context?: ErrorContext | undefined
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.severity = severity;
    this.isOperational = isOperational;
    this.context = context;

    // Maintains proper stack trace for where our error was thrown
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error class
 */
export class ValidationError extends AppError {
  public readonly details: Record<string, string[]>;

  constructor(message: string, details: Record<string, string[]> = {}, context?: ErrorContext) {
    super(message, ErrorType.VALIDATION, ErrorSeverity.LOW, true, context);
    this.details = details;
  }
}

/**
 * Authentication error class
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', context?: ErrorContext) {
    super(message, ErrorType.AUTHENTICATION, ErrorSeverity.MEDIUM, true, context);
  }
}

/**
 * Authorization error class
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: ErrorContext) {
    super(message, ErrorType.AUTHORIZATION, ErrorSeverity.MEDIUM, true, context);
  }
}

/**
 * Not found error class
 */
export class NotFoundError extends AppError {
  constructor(resource: string, context?: ErrorContext) {
    super(`${resource} not found`, ErrorType.NOT_FOUND, ErrorSeverity.LOW, true, context);
  }
}

/**
 * Conflict error class
 */
export class ConflictError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorType.CONFLICT, ErrorSeverity.MEDIUM, true, context);
  }
}

/**
 * Database error class
 */
export class DatabaseError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorType.DATABASE, ErrorSeverity.HIGH, true, context);
  }
}

/**
 * Network error class
 */
export class NetworkError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(message, ErrorType.NETWORK, ErrorSeverity.MEDIUM, true, context);
  }
}

/**
 * Rate limit error class
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(message, ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, true, context);
  }
}

/**
 * External service error class
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: ErrorContext) {
    super(`External service error (${service}): ${message}`, ErrorType.EXTERNAL_SERVICE, ErrorSeverity.HIGH, true, context);
  }
}

/**
 * Error handler configuration interface
 */
export interface ErrorHandlerConfig {
  enableStackTrace: boolean;
  enableMonitoring: boolean;
  logLevel: 'error' | 'warn' | 'info';
  includeContext: boolean;
  serviceName: string;
}

/**
 * Error handler class
 */
export class ErrorHandler {
  private config: ErrorHandlerConfig;
  private logger = createLogger('ErrorHandler');

  constructor(config?: Partial<ErrorHandlerConfig>) {
    this.config = this.buildConfig(config);
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<ErrorHandlerConfig>): ErrorHandlerConfig {
    const defaultConfig: ErrorHandlerConfig = {
      enableStackTrace: process.env.NODE_ENV !== 'production',
      enableMonitoring: process.env.ERROR_MONITORING_ENABLED === 'true',
      logLevel: 'error',
      includeContext: true,
      serviceName: process.env.SERVICE_NAME || 'task-management-backend'
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Classify error type
   */
  public classifyError(error: Error): ErrorType {
    if (error instanceof AppError) {
      return error.type;
    }

    // Check error message patterns
    const message = error.message.toLowerCase();

    if (message.includes('validation') || message.includes('invalid')) {
      return ErrorType.VALIDATION;
    }
    if (message.includes('unauthorized') || message.includes('authentication')) {
      return ErrorType.AUTHENTICATION;
    }
    if (message.includes('forbidden') || message.includes('access denied')) {
      return ErrorType.AUTHORIZATION;
    }
    if (message.includes('not found')) {
      return ErrorType.NOT_FOUND;
    }
    if (message.includes('duplicate') || message.includes('conflict')) {
      return ErrorType.CONFLICT;
    }
    if (message.includes('database') || message.includes('connection')) {
      return ErrorType.DATABASE;
    }
    if (message.includes('network') || message.includes('timeout')) {
      return ErrorType.NETWORK;
    }

    return ErrorType.INTERNAL;
  }

  /**
   * Get HTTP status code for error
   */
  public getStatusCode(error: Error): number {
    const errorType = this.classifyError(error);
    return HTTP_STATUS_CODES[errorType] || 500;
  }

  /**
   * Format error response
   */
  public formatErrorResponse(error: Error, context?: ErrorContext): ErrorResponse {
    const errorType = this.classifyError(error);
    const timestamp = new Date().toISOString();

    const response: ErrorResponse = {
      success: false,
      error: {
        code: error.name || 'UnknownError',
        message: error.message,
        type: errorType,
        timestamp,
        ...(context?.requestId && { requestId: context.requestId })
      }
    };

    // Add validation details for ValidationError
    if (error instanceof ValidationError) {
      response.error.details = error.details;
    }

    // Add stack trace in development
    if (this.config.enableStackTrace && error.stack) {
      response.error.stack = error.stack;
    }

    return response;
  }

  /**
   * Log error with context
   */
  public logError(error: Error, context?: ErrorContext): void {
    const errorType = this.classifyError(error);
    const severity = error instanceof AppError ? error.severity : ErrorSeverity.HIGH;

    // Set logger context
    if (context) {
      const loggerContext: any = {};
      if (context.requestId) loggerContext.requestId = context.requestId;
      if (context.userId) loggerContext.userId = context.userId;
      if (context.method) loggerContext.method = context.method;
      if (context.path) loggerContext.path = context.path;

      this.logger.setContext(loggerContext);
    }

    const metadata = {
      errorType,
      severity,
      isOperational: error instanceof AppError ? error.isOperational : false,
      ...(context && this.config.includeContext && {
        userAgent: context.userAgent,
        ip: context.ip,
        ...context.metadata
      })
    };

    // Log based on severity
    switch (severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        this.logger.error(error.message, error, metadata);
        break;
      case ErrorSeverity.MEDIUM:
        this.logger.warn(error.message, metadata);
        break;
      case ErrorSeverity.LOW:
        this.logger.info(error.message, metadata);
        break;
    }

    // Clear context after logging
    this.logger.clearContext();
  }

  /**
   * Handle error with logging and response formatting
   */
  public handleError(error: Error, context?: ErrorContext): {
    statusCode: number;
    response: ErrorResponse;
  } {
    // Log the error
    this.logError(error, context);

    // Notify monitoring if enabled and error is critical
    if (this.config.enableMonitoring && error instanceof AppError && error.severity === ErrorSeverity.CRITICAL) {
      this.notifyMonitoring(error, context);
    }

    // Format response
    const statusCode = this.getStatusCode(error);
    const response = this.formatErrorResponse(error, context);

    return { statusCode, response };
  }

  /**
   * Notify monitoring system (placeholder for future implementation)
   */
  private notifyMonitoring(error: Error, context?: ErrorContext): void {
    // TODO: Implement monitoring notification
    // This could integrate with services like Sentry, DataDog, etc.
    this.logger.warn('Critical error detected - monitoring notification would be sent', {
      error: error.message,
      context
    });
  }

  /**
   * Check if error is operational
   */
  public isOperationalError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }
    return false;
  }

  /**
   * Get error severity
   */
  public getErrorSeverity(error: Error): ErrorSeverity {
    if (error instanceof AppError) {
      return error.severity;
    }
    return ErrorSeverity.HIGH;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  public getConfig(): ErrorHandlerConfig {
    return { ...this.config };
  }
}

/**
 * Default error handler instance
 */
export const errorHandler = new ErrorHandler();

/**
 * Create error handler with custom configuration
 */
export function createErrorHandler(config?: Partial<ErrorHandlerConfig>): ErrorHandler {
  return new ErrorHandler(config);
}

/**
 * Utility function to create validation error
 */
export function createValidationError(message: string, details: Record<string, string[]> = {}): ValidationError {
  return new ValidationError(message, details);
}

/**
 * Utility function to create not found error
 */
export function createNotFoundError(resource: string): NotFoundError {
  return new NotFoundError(resource);
}
