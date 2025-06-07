/**
 * ===================================
 * Request Validator Implementation
 * ===================================
 * Purpose: Express request validation functionality
 * Features:
 * - Request body, query, and params validation
 * - Integration with ZodValidator
 * - Express middleware support
 * - ResponseBuilder integration
 * - Type-safe validation
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, z } from 'zod';
import { 
  ZodValidator, 
  ValidationPatterns, 
  UserSchemas, 
  TaskSchemas, 
  CategorySchemas,
  ValidationOptions 
} from './zod-validator';
import { ResponseBuilder } from './response-builder';
import { ValidationErrorDetail } from '../domain/types/common.types';

// ===================================
// Request Validation Types
// ===================================

/**
 * Request validation target
 */
export enum ValidationTarget {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params',
  HEADERS = 'headers'
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  target: ValidationTarget;
  schema: ZodSchema<any>;
  options?: ValidationOptions;
  optional?: boolean;
}

/**
 * Multi-target validation configuration
 */
export interface MultiValidationConfig {
  body?: ZodSchema<any>;
  query?: ZodSchema<any>;
  params?: ZodSchema<any>;
  headers?: ZodSchema<any>;
  options?: ValidationOptions;
}

/**
 * Validation middleware options
 */
export interface ValidationMiddlewareOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
  customMessages?: Record<string, string>;
  onError?: (req: Request, res: Response, errors: ValidationErrorDetail[]) => Response | void;
}

// ===================================
// RequestValidator Class
// ===================================

/**
 * Express request validation service
 */
export class RequestValidator {
  private static instance: RequestValidator;
  private zodValidator: ZodValidator;
  private responseBuilder: ResponseBuilder;

  constructor() {
    this.zodValidator = ZodValidator.getInstance();
    this.responseBuilder = ResponseBuilder.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RequestValidator {
    if (!RequestValidator.instance) {
      RequestValidator.instance = new RequestValidator();
    }
    return RequestValidator.instance;
  }

  /**
   * Validate single target (body, query, params, headers)
   */
  public validate(config: ValidationConfig) {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
      try {
        const data = this.extractData(req, config.target);
        
        // Skip validation if optional and data is undefined/null/empty
        if (config.optional && (data === undefined || data === null ||
            (typeof data === 'object' && data !== null && Object.keys(data).length === 0))) {
          return next();
        }

        const result = await this.zodValidator.validate(data, config.schema, config.options);

        if (!result.isValid) {
          const errorDetails: ValidationErrorDetail[] = result.errors.map(error => {
            const detail: ValidationErrorDetail = {
              field: error.field,
              message: error.message,
              value: error.value
            };
            if (error.rule) {
              detail.constraint = error.rule;
            }
            return detail;
          });

          return this.responseBuilder.sendError(
            res,
            'VALIDATION_ERROR',
            'Request validation failed',
            400,
            errorDetails
          );
        }

        // Attach validated data to request
        this.attachValidatedData(req, config.target, result.data);
        next();
      } catch (error) {
        return this.responseBuilder.sendError(
          res,
          'INTERNAL_SERVER_ERROR',
          'Validation processing failed',
          500,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    };
  }

  /**
   * Validate multiple targets
   */
  public validateMultiple(config: MultiValidationConfig) {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
      try {
        const validationPromises: Promise<any>[] = [];
        const validationTargets: ValidationTarget[] = [];

        // Prepare validation for each target
        if (config.body) {
          validationPromises.push(
            this.zodValidator.validate(req.body, config.body, config.options)
          );
          validationTargets.push(ValidationTarget.BODY);
        }

        if (config.query) {
          validationPromises.push(
            this.zodValidator.validate(req.query, config.query, config.options)
          );
          validationTargets.push(ValidationTarget.QUERY);
        }

        if (config.params) {
          validationPromises.push(
            this.zodValidator.validate(req.params, config.params, config.options)
          );
          validationTargets.push(ValidationTarget.PARAMS);
        }

        if (config.headers) {
          validationPromises.push(
            this.zodValidator.validate(req.headers, config.headers, config.options)
          );
          validationTargets.push(ValidationTarget.HEADERS);
        }

        // Execute all validations
        const results = await Promise.all(validationPromises);
        const allErrors: ValidationErrorDetail[] = [];

        // Collect errors first
        results.forEach((result, index) => {
          const target = validationTargets[index];

          if (!result.isValid) {
            const targetErrors: ValidationErrorDetail[] = result.errors.map((error: any) => {
              const detail: ValidationErrorDetail = {
                field: `${target}.${error.field}`,
                message: error.message,
                value: error.value
              };
              if (error.rule) {
                detail.constraint = error.rule;
              }
              return detail;
            });
            allErrors.push(...targetErrors);
          }
        });

        // Only attach validated data if all validations passed
        if (allErrors.length === 0) {
          results.forEach((result, index) => {
            const target = validationTargets[index];
            this.attachValidatedData(req, target, result.data);
          });
        }

        // Return error if any validation failed
        if (allErrors.length > 0) {
          return this.responseBuilder.sendError(
            res,
            'VALIDATION_ERROR',
            'Request validation failed',
            400,
            allErrors
          );
        }

        next();
      } catch (error) {
        return this.responseBuilder.sendError(
          res,
          'INTERNAL_SERVER_ERROR',
          'Validation processing failed',
          500,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    };
  }

  /**
   * Create validation middleware with options
   */
  public middleware(
    target: ValidationTarget,
    schema: ZodSchema<any>,
    options?: ValidationMiddlewareOptions
  ) {
    return async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
      try {
        const data = this.extractData(req, target);
        const validationOptions: ValidationOptions = {
          ...(options?.abortEarly !== undefined && { abortEarly: options.abortEarly }),
          ...(options?.stripUnknown !== undefined && { stripUnknown: options.stripUnknown }),
          ...(options?.allowUnknown !== undefined && { allowUnknown: options.allowUnknown }),
          ...(options?.customMessages !== undefined && { customMessages: options.customMessages })
        };

        const result = await this.zodValidator.validate(data, schema, validationOptions);

        if (!result.isValid) {
          const errorDetails: ValidationErrorDetail[] = result.errors.map(error => {
            const detail: ValidationErrorDetail = {
              field: error.field,
              message: error.message,
              value: error.value
            };
            if (error.rule) {
              detail.constraint = error.rule;
            }
            return detail;
          });

          // Call custom error handler if provided
          if (options?.onError) {
            return options.onError(req, res, errorDetails);
          }

          return this.responseBuilder.sendError(
            res,
            'VALIDATION_ERROR',
            'Request validation failed',
            400,
            errorDetails
          );
        }

        // Attach validated data to request
        this.attachValidatedData(req, target, result.data);
        next();
      } catch (error) {
        return this.responseBuilder.sendError(
          res,
          'INTERNAL_SERVER_ERROR',
          'Validation processing failed',
          500,
          { error: error instanceof Error ? error.message : 'Unknown error' }
        );
      }
    };
  }

  /**
   * Extract data from request based on target
   */
  private extractData(req: Request, target: ValidationTarget): any {
    switch (target) {
      case ValidationTarget.BODY:
        return req.body;
      case ValidationTarget.QUERY:
        return req.query;
      case ValidationTarget.PARAMS:
        return req.params;
      case ValidationTarget.HEADERS:
        return req.headers;
      default:
        return {};
    }
  }

  /**
   * Attach validated data to request object
   */
  private attachValidatedData(req: Request, target: ValidationTarget, data: any): void {
    // Create validated property if it doesn't exist
    if (!req.validated) {
      req.validated = {};
    }

    req.validated[target] = data;
  }
}

// ===================================
// Pre-configured Validators
// ===================================

/**
 * Pre-configured validation middleware for common use cases
 */
export class CommonValidators {
  private static requestValidator = RequestValidator.getInstance();

  // ===================================
  // User Validation Middleware
  // ===================================

  /**
   * User registration validation
   */
  public static validateUserRegistration() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: UserSchemas.register
    });
  }

  /**
   * User login validation
   */
  public static validateUserLogin() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: UserSchemas.login
    });
  }

  /**
   * User update validation
   */
  public static validateUserUpdate() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: UserSchemas.update
    });
  }

  /**
   * Password change validation
   */
  public static validatePasswordChange() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: UserSchemas.passwordChange
    });
  }

  // ===================================
  // Task Validation Middleware
  // ===================================

  /**
   * Task creation validation
   */
  public static validateTaskCreation() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: TaskSchemas.create
    });
  }

  /**
   * Task update validation
   */
  public static validateTaskUpdate() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: TaskSchemas.update
    });
  }

  /**
   * Task search filters validation
   */
  public static validateTaskSearchFilters() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.QUERY,
      schema: TaskSchemas.searchFilters,
      optional: true
    });
  }

  // ===================================
  // Category Validation Middleware
  // ===================================

  /**
   * Category creation validation
   */
  public static validateCategoryCreation() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: CategorySchemas.create
    });
  }

  /**
   * Category update validation
   */
  public static validateCategoryUpdate() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.BODY,
      schema: CategorySchemas.update
    });
  }

  /**
   * Category search filters validation
   */
  public static validateCategorySearchFilters() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.QUERY,
      schema: CategorySchemas.searchFilters,
      optional: true
    });
  }

  // ===================================
  // Common Parameter Validation
  // ===================================

  /**
   * UUID parameter validation
   */
  public static validateUuidParam(paramName: string = 'id') {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.PARAMS,
      schema: z.object({
        [paramName]: ValidationPatterns.uuid
      })
    });
  }

  /**
   * Pagination query validation
   */
  public static validatePagination() {
    return CommonValidators.requestValidator.validate({
      target: ValidationTarget.QUERY,
      schema: z.object({
        page: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().positive()).optional().default(1),
        limit: z.union([z.string(), z.number()]).transform(Number).pipe(z.number().int().min(1).max(100)).optional().default(20)
      }),
      optional: true
    });
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create request validator instance
 */
export const createRequestValidator = (): RequestValidator => {
  return RequestValidator.getInstance();
};

/**
 * Quick body validation helper
 */
export const validateBody = (schema: ZodSchema<any>, options?: ValidationOptions) => {
  const validator = RequestValidator.getInstance();
  return validator.validate({
    target: ValidationTarget.BODY,
    schema,
    ...(options && { options })
  });
};

/**
 * Quick query validation helper
 */
export const validateQuery = (schema: ZodSchema<any>, options?: ValidationOptions) => {
  const validator = RequestValidator.getInstance();
  return validator.validate({
    target: ValidationTarget.QUERY,
    schema,
    ...(options && { options })
  });
};

/**
 * Quick params validation helper
 */
export const validateParams = (schema: ZodSchema<any>, options?: ValidationOptions) => {
  const validator = RequestValidator.getInstance();
  return validator.validate({
    target: ValidationTarget.PARAMS,
    schema,
    ...(options && { options })
  });
};

/**
 * Quick headers validation helper
 */
export const validateHeaders = (schema: ZodSchema<any>, options?: ValidationOptions) => {
  const validator = RequestValidator.getInstance();
  return validator.validate({
    target: ValidationTarget.HEADERS,
    schema,
    ...(options && { options })
  });
};

/**
 * Multi-target validation helper
 */
export const validateRequest = (config: MultiValidationConfig) => {
  const validator = RequestValidator.getInstance();
  return validator.validateMultiple(config);
};

// ===================================
// Express Request Type Extension
// ===================================

declare global {
  namespace Express {
    interface Request {
      validated?: {
        [ValidationTarget.BODY]?: any;
        [ValidationTarget.QUERY]?: any;
        [ValidationTarget.PARAMS]?: any;
        [ValidationTarget.HEADERS]?: any;
      };
    }
  }
}

// Export default instance
export default RequestValidator.getInstance();
