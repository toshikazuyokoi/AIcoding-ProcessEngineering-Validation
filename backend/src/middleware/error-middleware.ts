/**
 * ===================================
 * Error Middleware Implementation
 * ===================================
 * Purpose: Express error handling middleware for centralized error processing
 * Features:
 * - Centralized error handling
 * - Error classification and logging
 * - Security-aware error responses
 * - Integration with monitoring systems
 * - Express middleware integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorHandler, ErrorContext, AppError, ErrorSeverity } from '../utils/error-handler';
import { Logger } from '../utils/logger';
import { ResponseBuilder } from '../utils/response-builder';

// ===================================
// Error Middleware Types
// ===================================

/**
 * Error middleware configuration interface
 */
export interface ErrorMiddlewareConfig {
  enableStackTrace: boolean;
  enableMonitoring: boolean;
  logLevel: 'error' | 'warn' | 'info';
  includeContext: boolean;
  serviceName: string;
  enableRequestId: boolean;
  enableUserContext: boolean;
}

/**
 * Default error middleware configuration
 */
const DEFAULT_CONFIG: ErrorMiddlewareConfig = {
  enableStackTrace: process.env.NODE_ENV !== 'production',
  enableMonitoring: process.env.NODE_ENV === 'production',
  logLevel: 'error',
  includeContext: true,
  serviceName: 'task-management-api',
  enableRequestId: true,
  enableUserContext: true
};

/**
 * Extended request interface with error context
 */
export interface ErrorRequest extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  startTime?: number;
}

// ===================================
// Error Middleware Class
// ===================================

/**
 * Express error handling middleware
 */
export class ErrorMiddleware {
  private static instance: ErrorMiddleware;
  private errorHandler: ErrorHandler;
  private logger: Logger;
  private responseBuilder: ResponseBuilder;
  private config: ErrorMiddlewareConfig;

  /**
   * Constructor
   */
  constructor(
    errorHandler?: ErrorHandler,
    logger?: Logger,
    responseBuilder?: ResponseBuilder,
    config?: Partial<ErrorMiddlewareConfig>
  ) {
    this.errorHandler = errorHandler || new ErrorHandler();
    this.logger = logger || new Logger();
    this.responseBuilder = responseBuilder || new ResponseBuilder();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(
    errorHandler?: ErrorHandler,
    logger?: Logger,
    responseBuilder?: ResponseBuilder,
    config?: Partial<ErrorMiddlewareConfig>
  ): ErrorMiddleware {
    if (!ErrorMiddleware.instance) {
      ErrorMiddleware.instance = new ErrorMiddleware(errorHandler, logger, responseBuilder, config);
    }
    return ErrorMiddleware.instance;
  }

  /**
   * Express error handling middleware
   */
  public handle() {
    return (error: Error, req: ErrorRequest, res: Response, next: NextFunction): Response | void => {
      try {
        // Build error context from request
        const context = this.buildErrorContext(req);

        // Handle the error using ErrorHandler
        const { statusCode, response } = this.errorHandler.handleError(error, context);

        // Add additional middleware-specific information
        const enhancedResponse = this.enhanceErrorResponse(response, req, error);

        // Send error response
        return res.status(statusCode).json(enhancedResponse);
      } catch (handlingError) {
        // Fallback error handling
        return this.handleFallbackError(handlingError, req, res);
      }
    };
  }

  /**
   * Build error context from request
   */
  private buildErrorContext(req: ErrorRequest): ErrorContext {
    const context: ErrorContext = {};

    // Add request ID if enabled
    if (this.config.enableRequestId && req.requestId) {
      context.requestId = req.requestId;
    }

    // Add user context if enabled and available
    if (this.config.enableUserContext && req.user) {
      context.userId = req.user.id;
    }

    // Add request information
    context.method = req.method;
    context.path = req.path;

    // Add user agent if available
    const userAgent = req.get('User-Agent');
    if (userAgent) {
      context.userAgent = userAgent;
    }

    // Add IP address if available
    const ip = req.ip || req.connection?.remoteAddress;
    if (ip) {
      context.ip = ip;
    }

    // Add timing information if available
    if (req.startTime) {
      context.metadata = {
        ...context.metadata,
        duration: Date.now() - req.startTime
      };
    }

    // Add query parameters and body (sanitized)
    if (this.config.includeContext) {
      context.metadata = {
        ...context.metadata,
        query: this.sanitizeData(req.query),
        body: this.sanitizeData(req.body),
        params: req.params
      };
    }

    return context;
  }

  /**
   * Enhance error response with middleware-specific information
   */
  private enhanceErrorResponse(response: any, req: ErrorRequest, error: Error): any {
    const enhanced = { ...response };

    // Add service information
    enhanced.service = this.config.serviceName;

    // Add request correlation ID
    if (req.requestId) {
      enhanced.error.requestId = req.requestId;
    }

    // Add timestamp if not present
    if (!enhanced.error.timestamp) {
      enhanced.error.timestamp = new Date().toISOString();
    }

    // Add stack trace in development (if enabled)
    if (this.config.enableStackTrace && error.stack && process.env.NODE_ENV !== 'production') {
      enhanced.error.stack = error.stack;
    }

    // Add error severity for monitoring
    if (error instanceof AppError) {
      enhanced.error.severity = error.severity;
      enhanced.error.isOperational = error.isOperational;
    }

    return enhanced;
  }

  /**
   * Sanitize sensitive data from request
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Handle fallback errors (when error handling itself fails)
   */
  private handleFallbackError(handlingError: any, req: ErrorRequest, res: Response): Response {
    // Log the fallback error
    this.logger.error('Error handling failed', handlingError, {
      originalUrl: req.originalUrl,
      method: req.method,
      requestId: req.requestId
    });

    // Send minimal error response
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
        requestId: req.requestId
      },
      service: this.config.serviceName
    });
  }

  /**
   * Get middleware configuration
   */
  public getConfig(): ErrorMiddlewareConfig {
    return { ...this.config };
  }

  /**
   * Update middleware configuration
   */
  public updateConfig(newConfig: Partial<ErrorMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Check if error should be monitored
   */
  public shouldMonitorError(error: Error): boolean {
    if (!this.config.enableMonitoring) {
      return false;
    }

    // Monitor critical and high severity errors
    if (error instanceof AppError) {
      return error.severity === ErrorSeverity.CRITICAL || error.severity === ErrorSeverity.HIGH;
    }

    // Monitor all non-operational errors
    return true;
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create error middleware instance
 */
export const createErrorMiddleware = (
  errorHandler?: ErrorHandler,
  logger?: Logger,
  responseBuilder?: ResponseBuilder,
  config?: Partial<ErrorMiddlewareConfig>
): ErrorMiddleware => {
  return new ErrorMiddleware(errorHandler, logger, responseBuilder, config);
};

/**
 * Default error middleware instance
 */
export const errorMiddleware = ErrorMiddleware.getInstance();

// Export default instance
export default errorMiddleware;
