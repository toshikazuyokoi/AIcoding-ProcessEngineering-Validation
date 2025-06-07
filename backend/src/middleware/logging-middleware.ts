/**
 * ===================================
 * Logging Middleware Implementation
 * ===================================
 * Purpose: Express request/response logging middleware for monitoring and debugging
 * Features:
 * - Request/response logging
 * - Performance monitoring
 * - Security-aware data sanitization
 * - Structured logging integration
 * - Express middleware integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { Logger, LoggerContext } from '../utils/logger';

// ===================================
// Logging Middleware Types
// ===================================

/**
 * Logging middleware configuration interface
 */
export interface LoggingMiddlewareConfig {
  enableRequestLogging: boolean;
  enableResponseLogging: boolean;
  enablePerformanceLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  includeRequestBody: boolean;
  includeResponseBody: boolean;
  includeHeaders: boolean;
  sanitizeData: boolean;
  serviceName: string;
  enableRequestId: boolean;
  enableUserContext: boolean;
  performanceThreshold: number; // milliseconds
}

/**
 * Default logging middleware configuration
 */
const DEFAULT_CONFIG: LoggingMiddlewareConfig = {
  enableRequestLogging: true,
  enableResponseLogging: true,
  enablePerformanceLogging: true,
  logLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  includeRequestBody: process.env.NODE_ENV !== 'production',
  includeResponseBody: false, // Usually too verbose for production
  includeHeaders: process.env.NODE_ENV !== 'production',
  sanitizeData: true,
  serviceName: 'task-management-api',
  enableRequestId: true,
  enableUserContext: true,
  performanceThreshold: 1000 // 1 second
};

/**
 * Extended request interface with logging context
 */
export interface LoggingRequest extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  startTime?: number;
  logContext?: LoggerContext;
}

/**
 * Request log data interface
 */
export interface RequestLogData {
  method: string;
  url: string;
  path: string;
  query?: any;
  body?: any;
  headers?: any;
  userAgent?: string;
  ip?: string;
  requestId?: string | undefined;
  userId?: string | undefined;
  timestamp: string;
}

/**
 * Response log data interface
 */
export interface ResponseLogData {
  statusCode: number;
  statusMessage: string;
  headers?: any;
  body?: any;
  responseTime: number;
  requestId?: string | undefined;
  userId?: string | undefined;
  timestamp: string;
}

// ===================================
// Logging Middleware Class
// ===================================

/**
 * Express request/response logging middleware
 */
export class LoggingMiddleware {
  private static instance: LoggingMiddleware;
  private logger: Logger;
  private config: LoggingMiddlewareConfig;

  /**
   * Constructor
   */
  constructor(
    logger?: Logger,
    config?: Partial<LoggingMiddlewareConfig>
  ) {
    this.logger = logger || new Logger('LoggingMiddleware');
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(
    logger?: Logger,
    config?: Partial<LoggingMiddlewareConfig>
  ): LoggingMiddleware {
    if (!LoggingMiddleware.instance) {
      LoggingMiddleware.instance = new LoggingMiddleware(logger, config);
    }
    return LoggingMiddleware.instance;
  }

  /**
   * Express logging middleware
   */
  public log() {
    return (req: LoggingRequest, res: Response, next: NextFunction): void => {
      // Set start time for performance measurement (only if not already set)
      if (!req.startTime) {
        req.startTime = Date.now();
      }

      // Generate request ID if enabled and not present
      if (this.config.enableRequestId && !req.requestId) {
        req.requestId = this.generateRequestId();
      }

      // Set logger context
      this.setLoggerContext(req);

      // Log incoming request
      if (this.config.enableRequestLogging) {
        this.logRequest(req);
      }

      // Capture original response methods
      const originalSend = res.send;
      const originalJson = res.json;
      const originalEnd = res.end;

      let responseBody: any;

      // Override response methods to capture response data
      res.send = function(body: any) {
        responseBody = body;
        return originalSend.call(this, body);
      };

      res.json = function(body: any) {
        responseBody = body;
        return originalJson.call(this, body);
      };

      res.end = function(chunk?: any, encoding?: any) {
        if (chunk && !responseBody) {
          responseBody = chunk;
        }
        return originalEnd.call(this, chunk, encoding);
      };

      // Log response when finished
      res.on('finish', () => {
        if (this.config.enableResponseLogging) {
          this.logResponse(req, res, responseBody);
        }

        if (this.config.enablePerformanceLogging) {
          this.logPerformance(req, res);
        }
      });

      next();
    };
  }

  /**
   * Set logger context from request
   */
  private setLoggerContext(req: LoggingRequest): void {
    const context: LoggerContext = {};

    if (this.config.enableRequestId && req.requestId) {
      context.requestId = req.requestId;
    }

    if (this.config.enableUserContext && req.user) {
      context.userId = req.user.id;
    }

    context.method = req.method;
    context.path = req.path;

    req.logContext = context;
    this.logger.setContext(context);
  }

  /**
   * Log incoming request
   */
  private logRequest(req: LoggingRequest): void {
    const requestData: RequestLogData = {
      method: req.method,
      url: req.originalUrl || req.url,
      path: req.path,
      requestId: req.requestId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };

    // Add query parameters
    if (Object.keys(req.query).length > 0) {
      requestData.query = this.config.sanitizeData ? 
        this.sanitizeData(req.query) : req.query;
    }

    // Add request body if enabled
    if (this.config.includeRequestBody && req.body) {
      requestData.body = this.config.sanitizeData ? 
        this.sanitizeData(req.body) : req.body;
    }

    // Add headers if enabled
    if (this.config.includeHeaders) {
      requestData.headers = this.config.sanitizeData ? 
        this.sanitizeHeaders(req.headers) : req.headers;
    }

    // Add additional request information
    const userAgent = req.get('User-Agent');
    if (userAgent) {
      requestData.userAgent = userAgent;
    }

    const ip = req.ip || req.connection?.remoteAddress;
    if (ip) {
      requestData.ip = ip;
    }

    // Log request based on configured level
    switch (this.config.logLevel) {
      case 'debug':
        this.logger.debug('Incoming request', requestData);
        break;
      case 'info':
        this.logger.info(`${req.method} ${req.originalUrl || req.url}`, requestData);
        break;
      default:
        this.logger.info(`${req.method} ${req.originalUrl || req.url}`, requestData);
    }
  }

  /**
   * Log outgoing response
   */
  private logResponse(req: LoggingRequest, res: Response, responseBody?: any): void {
    const responseTime = req.startTime ? Date.now() - req.startTime : 0;

    const responseData: ResponseLogData = {
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime,
      requestId: req.requestId,
      userId: req.user?.id,
      timestamp: new Date().toISOString()
    };

    // Add response body if enabled
    if (this.config.includeResponseBody && responseBody) {
      responseData.body = this.config.sanitizeData ? 
        this.sanitizeData(responseBody) : responseBody;
    }

    // Add response headers if enabled
    if (this.config.includeHeaders) {
      responseData.headers = res.getHeaders();
    }

    // Determine log level based on status code
    const logLevel = this.getLogLevelForStatus(res.statusCode);
    const message = `${req.method} ${req.originalUrl || req.url} ${res.statusCode} ${responseTime}ms`;

    switch (logLevel) {
      case 'error':
        this.logger.error(message, undefined, responseData);
        break;
      case 'warn':
        this.logger.warn(message, responseData);
        break;
      case 'info':
        this.logger.info(message, responseData);
        break;
      case 'debug':
        this.logger.debug(message, responseData);
        break;
    }
  }

  /**
   * Log performance metrics
   */
  private logPerformance(req: LoggingRequest, res: Response): void {
    if (!req.startTime) return;

    const responseTime = Date.now() - req.startTime;

    // Log slow requests
    if (responseTime > this.config.performanceThreshold) {
      this.logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl || req.url,
        responseTime,
        threshold: this.config.performanceThreshold,
        statusCode: res.statusCode,
        requestId: req.requestId,
        userId: req.user?.id
      });
    }

    // Log performance metrics
    this.logger.debug('Request performance', {
      method: req.method,
      url: req.originalUrl || req.url,
      responseTime,
      statusCode: res.statusCode,
      requestId: req.requestId,
      userId: req.user?.id
    });
  }

  /**
   * Generate unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitize sensitive data from object
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];
    const sanitized = Array.isArray(data) ? [...data] : { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Sanitize sensitive headers
   */
  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key', 'x-auth-token'];
    const sanitized = { ...headers };

    for (const header of sensitiveHeaders) {
      if (sanitized[header]) {
        sanitized[header] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  /**
   * Get appropriate log level for HTTP status code
   */
  private getLogLevelForStatus(statusCode: number): 'debug' | 'info' | 'warn' | 'error' {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    if (statusCode >= 300) return 'info';
    return 'debug';
  }

  /**
   * Get middleware configuration
   */
  public getConfig(): LoggingMiddlewareConfig {
    return { ...this.config };
  }

  /**
   * Update middleware configuration
   */
  public updateConfig(newConfig: Partial<LoggingMiddlewareConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Clear logger context
   */
  public clearContext(): void {
    this.logger.clearContext();
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create logging middleware instance
 */
export const createLoggingMiddleware = (
  logger?: Logger,
  config?: Partial<LoggingMiddlewareConfig>
): LoggingMiddleware => {
  return new LoggingMiddleware(logger, config);
};

/**
 * Default logging middleware instance
 */
export const loggingMiddleware = LoggingMiddleware.getInstance();

// Export default instance
export default loggingMiddleware;
