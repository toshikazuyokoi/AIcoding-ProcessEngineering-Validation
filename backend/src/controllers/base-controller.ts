/**
 * ===================================
 * Base Controller Implementation
 * ===================================
 * Purpose: Foundation controller class for all Express controllers
 * Features:
 * - Common response handling
 * - Unified error handling
 * - Request validation utilities
 * - Logging integration
 * - Express middleware integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { ResponseBuilder, StandardApiResponse } from '../utils/response-builder';
import { ErrorHandler, AppError, ValidationError, ErrorType } from '../utils/error-handler';
import { Logger, LoggerContext } from '../utils/logger';
import { RequestValidator } from '../utils/request-validator';

// ===================================
// Base Controller Types
// ===================================

/**
 * Base controller configuration interface
 */
export interface BaseControllerConfig {
  enableLogging: boolean;
  enableValidation: boolean;
  enableErrorHandling: boolean;
  serviceName: string;
  enableRequestId: boolean;
  enableUserContext: boolean;
  enablePerformanceLogging: boolean;
}

/**
 * Default base controller configuration
 */
const DEFAULT_CONFIG: BaseControllerConfig = {
  enableLogging: true,
  enableValidation: true,
  enableErrorHandling: true,
  serviceName: 'task-management-api',
  enableRequestId: true,
  enableUserContext: true,
  enablePerformanceLogging: process.env.NODE_ENV !== 'production'
};

/**
 * Extended request interface with controller context
 */
export interface ControllerRequest extends Request {
  requestId?: string;
  user?: {
    id: string;
    email: string;
    role: string;
  };
  startTime?: number;
  controllerContext?: {
    controllerName: string;
    actionName: string;
    metadata?: Record<string, any>;
  };
}

/**
 * Controller action result interface
 */
export interface ControllerActionResult<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  statusCode?: number;
  metadata?: Record<string, any>;
}

/**
 * Pagination parameters interface
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

/**
 * Filter parameters interface
 */
export interface FilterParams {
  [key: string]: any;
}

// ===================================
// Base Controller Class
// ===================================

/**
 * Base Controller abstract class
 * 
 * Provides common functionality for all Express controllers:
 * - Response handling and formatting
 * - Error handling and logging
 * - Request validation utilities
 * - Performance monitoring
 * - User context management
 */
export abstract class BaseController {
  protected readonly responseBuilder: ResponseBuilder;
  protected readonly errorHandler: ErrorHandler;
  protected readonly logger: Logger;
  protected readonly validator: RequestValidator;
  protected readonly config: BaseControllerConfig;
  protected readonly controllerName: string;

  /**
   * Constructor
   */
  constructor(
    controllerName: string,
    responseBuilder?: ResponseBuilder,
    errorHandler?: ErrorHandler,
    logger?: Logger,
    validator?: RequestValidator,
    config?: Partial<BaseControllerConfig>
  ) {
    this.controllerName = controllerName;
    this.responseBuilder = responseBuilder || new ResponseBuilder();
    this.errorHandler = errorHandler || new ErrorHandler();
    this.logger = logger || new Logger(controllerName);
    this.validator = validator || new RequestValidator();
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.logger.info(`Initializing ${controllerName} controller`);
  }

  /**
   * Send success response
   */
  protected sendSuccess<T>(
    res: Response,
    data?: T,
    message?: string,
    statusCode: number = 200,
    metadata?: Record<string, any>
  ): Response {
    try {
      const options = metadata ? { metadata } : undefined;
      return this.responseBuilder.sendSuccess(res, data, statusCode, options);
    } catch (error) {
      this.logger.error('Failed to send success response', error as Error);
      return this.sendError(res, error as Error);
    }
  }

  /**
   * Send error response
   */
  protected sendError(
    res: Response,
    error: Error | AppError,
    statusCode?: number
  ): Response {
    try {
      const { statusCode: errorStatusCode, response } = this.errorHandler.handleError(error);
      const finalStatusCode = statusCode || errorStatusCode;
      
      return res.status(finalStatusCode).json(response);
    } catch (handlingError) {
      this.logger.error('Failed to handle error response', handlingError as Error);
      
      // Fallback error response
      return res.status(500).json({
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An unexpected error occurred',
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  /**
   * Send paginated response
   */
  protected sendPaginatedResponse<T>(
    res: Response,
    data: T[],
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
    message?: string,
    metadata?: Record<string, any>
  ): Response {
    try {
      const paginatedResult = {
        data,
        pagination: {
          ...pagination,
          hasNext: pagination.page < pagination.totalPages,
          hasPrev: pagination.page > 1,
          offset: (pagination.page - 1) * pagination.limit
        }
      };

      const options = metadata ? { metadata } : undefined;
      return this.responseBuilder.sendPaginated(res, paginatedResult, 200, options);
    } catch (error) {
      this.logger.error('Failed to send paginated response', error as Error);
      return this.sendError(res, error as Error);
    }
  }

  /**
   * Extract pagination parameters from request
   */
  protected extractPaginationParams(req: ControllerRequest): PaginationParams {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 10));
    const offset = (page - 1) * limit;

    return { page, limit, offset };
  }

  /**
   * Extract filter parameters from request
   */
  protected extractFilterParams(req: ControllerRequest, allowedFilters: string[]): FilterParams {
    const filters: FilterParams = {};

    for (const filter of allowedFilters) {
      if (req.query[filter] !== undefined) {
        filters[filter] = req.query[filter];
      }
    }

    return filters;
  }

  /**
   * Validate request data
   */
  protected async validateRequest<T>(
    data: any,
    schema: any,
    errorMessage?: string
  ): Promise<T> {
    try {
      // Note: This is a simplified validation - in practice, use ZodValidator directly
      // The RequestValidator is designed for Express middleware, not direct validation
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data provided');
      }
      return data as T;
    } catch (error) {
      const message = errorMessage || 'Request validation failed';
      throw new ValidationError(message, {}, { metadata: { originalError: error } });
    }
  }

  /**
   * Set controller context for request
   */
  protected setControllerContext(
    req: ControllerRequest,
    actionName: string,
    metadata?: Record<string, any>
  ): void {
    req.controllerContext = {
      controllerName: this.controllerName,
      actionName,
      ...(metadata && { metadata })
    };

    // Set logger context
    const loggerContext: LoggerContext = {
      method: req.method,
      path: req.path
    };

    // Add optional properties only if they exist
    if (req.requestId) {
      loggerContext.requestId = req.requestId;
    }
    if (req.user?.id) {
      loggerContext.userId = req.user.id;
    }

    this.logger.setContext(loggerContext);
  }

  /**
   * Log controller action start
   */
  protected logActionStart(req: ControllerRequest, actionName: string): void {
    if (!this.config.enableLogging) return;

    const startTime = Date.now();
    req.startTime = startTime;

    this.logger.info(`${this.controllerName}.${actionName} started`, {
      method: req.method,
      path: req.path,
      requestId: req.requestId,
      userId: req.user?.id,
      startTime
    });
  }

  /**
   * Log controller action end
   */
  protected logActionEnd(
    req: ControllerRequest,
    actionName: string,
    statusCode: number,
    error?: Error
  ): void {
    if (!this.config.enableLogging) return;

    const endTime = Date.now();
    const duration = req.startTime ? endTime - req.startTime : 0;

    const logData = {
      method: req.method,
      path: req.path,
      statusCode,
      duration,
      requestId: req.requestId,
      userId: req.user?.id,
      endTime
    };

    if (error) {
      this.logger.error(`${this.controllerName}.${actionName} failed`, error, logData);
    } else {
      this.logger.info(`${this.controllerName}.${actionName} completed`, logData);
    }

    // Log performance warning for slow actions
    if (this.config.enablePerformanceLogging && duration > 1000) {
      this.logger.warn(`Slow controller action detected`, {
        controller: this.controllerName,
        action: actionName,
        threshold: 1000,
        ...logData
      });
    }
  }

  /**
   * Wrap controller action with common functionality
   */
  protected wrapAction(
    actionName: string,
    action: (req: ControllerRequest, res: Response, next: NextFunction) => Promise<any>
  ) {
    return async (req: ControllerRequest, res: Response, next: NextFunction): Promise<void> => {
      try {
        // Set controller context
        this.setControllerContext(req, actionName);

        // Log action start
        this.logActionStart(req, actionName);

        // Execute action
        const result = await action(req, res, next);

        // Log action end
        this.logActionEnd(req, actionName, res.statusCode);

        return result;
      } catch (error) {
        // Log action error
        this.logActionEnd(req, actionName, 500, error as Error);

        // Handle error
        if (this.config.enableErrorHandling) {
          this.sendError(res, error as Error);
        } else {
          next(error);
        }
      }
    };
  }

  /**
   * Get controller configuration
   */
  public getConfig(): BaseControllerConfig {
    return { ...this.config };
  }

  /**
   * Update controller configuration
   */
  public updateConfig(newConfig: Partial<BaseControllerConfig>): void {
    Object.assign(this.config, newConfig);
  }

  /**
   * Get controller name
   */
  public getControllerName(): string {
    return this.controllerName;
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create base controller instance
 */
export const createBaseController = (
  controllerName: string,
  responseBuilder?: ResponseBuilder,
  errorHandler?: ErrorHandler,
  logger?: Logger,
  validator?: RequestValidator,
  config?: Partial<BaseControllerConfig>
): BaseController => {
  // Since BaseController is abstract, we create a concrete implementation for testing
  class ConcreteBaseController extends BaseController {
    constructor() {
      super(controllerName, responseBuilder, errorHandler, logger, validator, config);
    }
  }
  
  return new ConcreteBaseController();
};

// Export default configuration
export { DEFAULT_CONFIG as defaultBaseControllerConfig };
