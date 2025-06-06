/**
 * ===================================
 * Response Builder Implementation
 * ===================================
 * Purpose: Unified API response format functionality
 * Features:
 * - Standardized success and error responses
 * - HTTP status code management
 * - Pagination support
 * - Metadata handling
 * - Type-safe response generation
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Response } from 'express';
import { 
  PaginatedResult, 
  PaginationInfo,
  ApiResponseStatus,
  BaseApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
  ValidationErrorResponse,
  ValidationErrorDetail
} from '../domain/types/common.types';
import { 
  ServiceResponse, 
  ServiceError, 
  ServiceResponseMetadata 
} from '../domain/types/service-interfaces.types';

// ===================================
// Response Types
// ===================================

/**
 * Standard API response format
 */
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
  metadata?: {
    timestamp?: string;
    requestId?: string;
    version?: string;
    pagination?: PaginationInfo;
    [key: string]: any;
  };
}

/**
 * Response builder options
 */
export interface ResponseBuilderOptions {
  includeTimestamp?: boolean;
  includeRequestId?: boolean;
  includeVersion?: boolean;
  version?: string;
  requestId?: string;
  metadata?: Record<string, any>;
}

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const;

// ===================================
// ResponseBuilder Class
// ===================================

/**
 * Unified API response builder
 */
export class ResponseBuilder {
  private static instance: ResponseBuilder;
  private defaultOptions: ResponseBuilderOptions = {
    includeTimestamp: true,
    includeRequestId: true,
    includeVersion: true,
    version: '1.0.0'
  };

  /**
   * Get singleton instance
   */
  public static getInstance(): ResponseBuilder {
    if (!ResponseBuilder.instance) {
      ResponseBuilder.instance = new ResponseBuilder();
    }
    return ResponseBuilder.instance;
  }

  /**
   * Set default options
   */
  public setDefaultOptions(options: Partial<ResponseBuilderOptions>): void {
    this.defaultOptions = { ...this.defaultOptions, ...options };
  }

  /**
   * Build success response
   */
  public success<T>(
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<T> {
    const opts = { ...this.defaultOptions, ...options };
    
    return {
      success: true,
      data,
      metadata: this.buildMetadata(opts)
    };
  }

  /**
   * Build created response
   */
  public created<T>(
    data: T,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<T> {
    return this.success(data, HTTP_STATUS.CREATED, options);
  }

  /**
   * Build no content response
   */
  public noContent(options?: ResponseBuilderOptions): StandardApiResponse<null> {
    return this.success(null, HTTP_STATUS.NO_CONTENT, options);
  }

  /**
   * Build paginated response
   */
  public paginated<T>(
    paginatedResult: PaginatedResult<T>,
    statusCode: number = HTTP_STATUS.OK,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<T[]> {
    const opts = { ...this.defaultOptions, ...options };
    
    return {
      success: true,
      data: paginatedResult.data,
      metadata: {
        ...this.buildMetadata(opts),
        pagination: paginatedResult.pagination
      }
    };
  }

  /**
   * Build error response
   */
  public error(
    code: string,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: any,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    const opts = { ...this.defaultOptions, ...options };
    
    return {
      success: false,
      error: {
        code,
        message,
        details,
        timestamp: new Date().toISOString()
      },
      metadata: this.buildMetadata(opts)
    };
  }

  /**
   * Build validation error response
   */
  public validationError(
    message: string = 'Validation failed',
    details: ValidationErrorDetail[] = [],
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'VALIDATION_ERROR',
      message,
      HTTP_STATUS.BAD_REQUEST,
      details,
      options
    );
  }

  /**
   * Build authentication error response
   */
  public authenticationError(
    message: string = 'Authentication failed',
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'AUTHENTICATION_ERROR',
      message,
      HTTP_STATUS.UNAUTHORIZED,
      undefined,
      options
    );
  }

  /**
   * Build authorization error response
   */
  public authorizationError(
    message: string = 'Access denied',
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'AUTHORIZATION_ERROR',
      message,
      HTTP_STATUS.FORBIDDEN,
      undefined,
      options
    );
  }

  /**
   * Build not found error response
   */
  public notFoundError(
    resource: string = 'Resource',
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'NOT_FOUND_ERROR',
      `${resource} not found`,
      HTTP_STATUS.NOT_FOUND,
      undefined,
      options
    );
  }

  /**
   * Build conflict error response
   */
  public conflictError(
    message: string = 'Resource conflict',
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'CONFLICT_ERROR',
      message,
      HTTP_STATUS.CONFLICT,
      undefined,
      options
    );
  }

  /**
   * Build rate limit error response
   */
  public rateLimitError(
    message: string = 'Rate limit exceeded',
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'RATE_LIMIT_ERROR',
      message,
      HTTP_STATUS.TOO_MANY_REQUESTS,
      undefined,
      options
    );
  }

  /**
   * Build internal server error response
   */
  public internalServerError(
    message: string = 'Internal server error',
    details?: any,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    return this.error(
      'INTERNAL_SERVER_ERROR',
      message,
      HTTP_STATUS.INTERNAL_SERVER_ERROR,
      details,
      options
    );
  }

  /**
   * Send response to Express response object
   */
  public send<T>(
    res: Response,
    response: StandardApiResponse<T>,
    statusCode?: number
  ): Response {
    const status = statusCode || (response.success ? HTTP_STATUS.OK : HTTP_STATUS.INTERNAL_SERVER_ERROR);
    return res.status(status).json(response);
  }

  /**
   * Send success response
   */
  public sendSuccess<T>(
    res: Response,
    data: T,
    statusCode: number = HTTP_STATUS.OK,
    options?: ResponseBuilderOptions
  ): Response {
    const response = this.success(data, statusCode, options);
    return this.send(res, response, statusCode);
  }

  /**
   * Send created response
   */
  public sendCreated<T>(
    res: Response,
    data: T,
    options?: ResponseBuilderOptions
  ): Response {
    const response = this.created(data, options);
    return this.send(res, response, HTTP_STATUS.CREATED);
  }

  /**
   * Send no content response
   */
  public sendNoContent(
    res: Response,
    options?: ResponseBuilderOptions
  ): Response {
    const response = this.noContent(options);
    return this.send(res, response, HTTP_STATUS.NO_CONTENT);
  }

  /**
   * Send paginated response
   */
  public sendPaginated<T>(
    res: Response,
    paginatedResult: PaginatedResult<T>,
    statusCode: number = HTTP_STATUS.OK,
    options?: ResponseBuilderOptions
  ): Response {
    const response = this.paginated(paginatedResult, statusCode, options);
    return this.send(res, response, statusCode);
  }

  /**
   * Send error response
   */
  public sendError(
    res: Response,
    code: string,
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    details?: any,
    options?: ResponseBuilderOptions
  ): Response {
    const response = this.error(code, message, statusCode, details, options);
    return this.send(res, response, statusCode);
  }

  /**
   * Build metadata object
   */
  private buildMetadata(options: ResponseBuilderOptions): Record<string, any> {
    const metadata: Record<string, any> = {};

    if (options.includeTimestamp) {
      metadata.timestamp = new Date().toISOString();
    }

    if (options.includeRequestId && options.requestId) {
      metadata.requestId = options.requestId;
    }

    if (options.includeVersion && options.version) {
      metadata.version = options.version;
    }

    if (options.metadata) {
      Object.assign(metadata, options.metadata);
    }

    return metadata;
  }

  /**
   * Convert service response to standard API response
   */
  public fromServiceResponse<T>(
    serviceResponse: ServiceResponse<T>,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<T | null> {
    if (serviceResponse.success && serviceResponse.data !== undefined) {
      return this.success(serviceResponse.data, HTTP_STATUS.OK, options);
    } else if (serviceResponse.error) {
      return this.fromServiceError(serviceResponse.error, options) as StandardApiResponse<T | null>;
    } else {
      return this.internalServerError('Invalid service response', undefined, options) as StandardApiResponse<T | null>;
    }
  }

  /**
   * Convert service error to standard API response
   */
  public fromServiceError(
    serviceError: ServiceError,
    options?: ResponseBuilderOptions
  ): StandardApiResponse<null> {
    const statusCode = this.getStatusCodeFromErrorCode(serviceError.code);

    return this.error(
      serviceError.code,
      serviceError.message,
      statusCode,
      serviceError.details,
      options
    );
  }

  /**
   * Get HTTP status code from error code
   */
  private getStatusCodeFromErrorCode(errorCode: string): number {
    const errorCodeMap: Record<string, number> = {
      'VALIDATION_ERROR': HTTP_STATUS.BAD_REQUEST,
      'AUTHENTICATION_ERROR': HTTP_STATUS.UNAUTHORIZED,
      'AUTHORIZATION_ERROR': HTTP_STATUS.FORBIDDEN,
      'NOT_FOUND_ERROR': HTTP_STATUS.NOT_FOUND,
      'CONFLICT_ERROR': HTTP_STATUS.CONFLICT,
      'RATE_LIMIT_ERROR': HTTP_STATUS.TOO_MANY_REQUESTS,
      'INTERNAL_SERVER_ERROR': HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'DATABASE_ERROR': HTTP_STATUS.INTERNAL_SERVER_ERROR,
      'NETWORK_ERROR': HTTP_STATUS.BAD_GATEWAY,
      'EXTERNAL_SERVICE_ERROR': HTTP_STATUS.BAD_GATEWAY
    };

    return errorCodeMap[errorCode] || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  }

  /**
   * Create pagination info
   */
  public createPaginationInfo(
    page: number,
    limit: number,
    total: number
  ): PaginationInfo {
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
      offset
    };
  }

  /**
   * Create paginated result
   */
  public createPaginatedResult<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResult<T> {
    return {
      data,
      pagination: this.createPaginationInfo(page, limit, total)
    };
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create response builder instance
 */
export const createResponseBuilder = (): ResponseBuilder => {
  return ResponseBuilder.getInstance();
};

/**
 * Quick success response helper
 */
export const successResponse = <T>(
  data: T,
  statusCode?: number,
  options?: ResponseBuilderOptions
): StandardApiResponse<T> => {
  const builder = ResponseBuilder.getInstance();
  return builder.success(data, statusCode, options);
};

/**
 * Quick error response helper
 */
export const errorResponse = (
  code: string,
  message: string,
  statusCode?: number,
  details?: any,
  options?: ResponseBuilderOptions
): StandardApiResponse<null> => {
  const builder = ResponseBuilder.getInstance();
  return builder.error(code, message, statusCode, details, options);
};

/**
 * Quick validation error response helper
 */
export const validationErrorResponse = (
  message?: string,
  details?: ValidationErrorDetail[],
  options?: ResponseBuilderOptions
): StandardApiResponse<null> => {
  const builder = ResponseBuilder.getInstance();
  return builder.validationError(message, details, options);
};

/**
 * Quick paginated response helper
 */
export const paginatedResponse = <T>(
  paginatedResult: PaginatedResult<T>,
  statusCode?: number,
  options?: ResponseBuilderOptions
): StandardApiResponse<T[]> => {
  const builder = ResponseBuilder.getInstance();
  return builder.paginated(paginatedResult, statusCode, options);
};

/**
 * Express response helpers
 */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  statusCode?: number,
  options?: ResponseBuilderOptions
): Response => {
  const builder = ResponseBuilder.getInstance();
  return builder.sendSuccess(res, data, statusCode, options);
};

export const sendError = (
  res: Response,
  code: string,
  message: string,
  statusCode?: number,
  details?: any,
  options?: ResponseBuilderOptions
): Response => {
  const builder = ResponseBuilder.getInstance();
  return builder.sendError(res, code, message, statusCode, details, options);
};

export const sendPaginated = <T>(
  res: Response,
  paginatedResult: PaginatedResult<T>,
  statusCode?: number,
  options?: ResponseBuilderOptions
): Response => {
  const builder = ResponseBuilder.getInstance();
  return builder.sendPaginated(res, paginatedResult, statusCode, options);
};

// Export default instance
export default ResponseBuilder.getInstance();
