/**
 * ===================================
 * Zod Validator Implementation
 * ===================================
 * Purpose: Validation functionality using Zod library
 * Features:
 * - Schema definition and validation
 * - Type-safe validation with TypeScript
 * - Custom error message generation
 * - Performance optimization
 * - Reusable validation patterns
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { z, ZodSchema, ZodError, ZodIssue } from 'zod';
import { 
  ValidationResult, 
  ValidationError, 
  FieldValidationResult 
} from '../domain/types/service-interfaces.types';

// ===================================
// Validation Error Types
// ===================================

/**
 * Zod validation error detail
 */
export interface ZodValidationError extends ValidationError {
  path: (string | number)[];
  code: string;
  expected?: any;
  received?: any;
}

/**
 * Validation options
 */
export interface ValidationOptions {
  abortEarly?: boolean;
  stripUnknown?: boolean;
  allowUnknown?: boolean;
  customMessages?: Record<string, string>;
}

// ===================================
// Common Validation Schemas
// ===================================

/**
 * Common validation patterns
 */
export const ValidationPatterns = {
  // Email validation
  email: z.string().email('Invalid email format'),
  
  // Password validation (strong password)
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number and special character'),
  
  // Username validation
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must not exceed 50 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscore and hyphen'),
  
  // UUID validation
  uuid: z.string().uuid('Invalid UUID format'),
  
  // Hex color validation
  hexColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format'),
  
  // URL validation
  url: z.string().url('Invalid URL format'),
  
  // Phone number validation
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
  
  // Date validation
  dateString: z.string().datetime('Invalid date format'),
  
  // Positive integer
  positiveInt: z.number().int().positive('Must be a positive integer'),
  
  // Non-negative integer
  nonNegativeInt: z.number().int().min(0, 'Must be a non-negative integer')
} as const;

/**
 * User validation schemas
 */
export const UserSchemas = {
  // User registration
  register: z.object({
    username: ValidationPatterns.username,
    email: ValidationPatterns.email,
    password: ValidationPatterns.password,
    role: z.enum(['admin', 'user']).optional().default('user')
  }),
  
  // User login
  login: z.object({
    email: ValidationPatterns.email,
    password: z.string().min(1, 'Password is required')
  }),
  
  // User update
  update: z.object({
    username: ValidationPatterns.username.optional(),
    email: ValidationPatterns.email.optional(),
    role: z.enum(['admin', 'user']).optional(),
    isActive: z.boolean().optional()
  }),
  
  // Password change
  passwordChange: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: ValidationPatterns.password,
    confirmPassword: z.string().min(1, 'Password confirmation is required')
  }).refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
  })
} as const;

/**
 * Task validation schemas
 */
export const TaskSchemas = {
  // Task creation
  create: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title must not exceed 100 characters'),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
    priority: z.enum(['low', 'medium', 'high']).default('medium'),
    dueDate: z.string().datetime().optional(),
    categoryIds: z.array(ValidationPatterns.uuid).optional()
  }),
  
  // Task update
  update: z.object({
    title: z.string()
      .min(1, 'Title is required')
      .max(100, 'Title must not exceed 100 characters')
      .optional(),
    description: z.string()
      .max(1000, 'Description must not exceed 1000 characters')
      .optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    dueDate: z.string().datetime().optional(),
    categoryIds: z.array(ValidationPatterns.uuid).optional()
  }),
  
  // Task search filters
  searchFilters: z.object({
    status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
    priority: z.enum(['low', 'medium', 'high']).optional(),
    categoryId: ValidationPatterns.uuid.optional(),
    search: z.string().optional(),
    dueBefore: z.string().datetime().optional(),
    dueAfter: z.string().datetime().optional(),
    page: ValidationPatterns.positiveInt.optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20)
  })
} as const;

/**
 * Category validation schemas
 */
export const CategorySchemas = {
  // Category creation
  create: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(50, 'Name must not exceed 50 characters'),
    color: ValidationPatterns.hexColor,
    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
  }),
  
  // Category update
  update: z.object({
    name: z.string()
      .min(1, 'Name is required')
      .max(50, 'Name must not exceed 50 characters')
      .optional(),
    color: ValidationPatterns.hexColor.optional(),
    description: z.string()
      .max(500, 'Description must not exceed 500 characters')
      .optional()
  }),
  
  // Category search filters
  searchFilters: z.object({
    search: z.string().optional(),
    color: ValidationPatterns.hexColor.optional(),
    page: ValidationPatterns.positiveInt.optional().default(1),
    limit: z.number().int().min(1).max(100).optional().default(20)
  })
} as const;

// ===================================
// ZodValidator Class
// ===================================

/**
 * Zod-based validation service
 */
export class ZodValidator {
  private static instance: ZodValidator;
  private customMessages: Record<string, string> = {};

  /**
   * Get singleton instance
   */
  public static getInstance(): ZodValidator {
    if (!ZodValidator.instance) {
      ZodValidator.instance = new ZodValidator();
    }
    return ZodValidator.instance;
  }

  /**
   * Set custom error messages
   */
  public setCustomMessages(messages: Record<string, string>): void {
    this.customMessages = { ...this.customMessages, ...messages };
  }

  /**
   * Validate data against schema
   */
  public async validate<T>(
    data: unknown,
    schema: ZodSchema<T>,
    options: ValidationOptions = {}
  ): Promise<ValidationResult<T>> {
    try {
      // Configure schema based on options
      let validationSchema = schema;

      // Note: Zod doesn't have a strict() method like Joi
      // stripUnknown is handled by default in Zod schemas

      // Perform validation
      const result = validationSchema.parse(data);
      
      return {
        isValid: true,
        data: result,
        errors: []
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors = this.formatZodErrors(error.issues);
        
        return {
          isValid: false,
          errors: validationErrors
        };
      }
      
      // Handle unexpected errors
      return {
        isValid: false,
        errors: [{
          field: 'unknown',
          message: 'Validation failed due to unexpected error',
          rule: 'unknown'
        }]
      };
    }
  }

  /**
   * Validate single field
   */
  public async validateField<T>(
    value: unknown,
    schema: ZodSchema<T>,
    fieldName: string = 'field'
  ): Promise<FieldValidationResult> {
    try {
      schema.parse(value);
      return {
        isValid: true,
        errors: []
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map(issue => 
          this.getCustomMessage(issue.code, fieldName) || issue.message
        );
        
        return {
          isValid: false,
          errors
        };
      }
      
      return {
        isValid: false,
        errors: ['Field validation failed']
      };
    }
  }

  /**
   * Safe parse with detailed error information
   */
  public safeParse<T>(
    data: unknown,
    schema: ZodSchema<T>
  ): { success: true; data: T } | { success: false; errors: ZodValidationError[] } {
    const result = schema.safeParse(data);
    
    if (result.success) {
      return { success: true, data: result.data };
    }
    
    return {
      success: false,
      errors: this.formatZodErrorsDetailed(result.error.issues)
    };
  }

  /**
   * Format Zod errors to ValidationError format
   */
  private formatZodErrors(issues: ZodIssue[]): ValidationError[] {
    return issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: this.getCustomMessage(issue.code, issue.path.join('.')) || issue.message,
      value: 'received' in issue ? issue.received : undefined,
      rule: issue.code
    }));
  }

  /**
   * Format Zod errors with detailed information
   */
  private formatZodErrorsDetailed(issues: ZodIssue[]): ZodValidationError[] {
    return issues.map(issue => ({
      field: issue.path.join('.') || 'root',
      message: this.getCustomMessage(issue.code, issue.path.join('.')) || issue.message,
      value: 'received' in issue ? issue.received : undefined,
      rule: issue.code,
      path: issue.path,
      code: issue.code,
      expected: 'expected' in issue ? issue.expected : undefined,
      received: 'received' in issue ? issue.received : undefined
    }));
  }

  /**
   * Get custom error message
   */
  private getCustomMessage(code: string, field: string): string | undefined {
    const key = `${field}.${code}`;
    return this.customMessages[key] || this.customMessages[code];
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create validator instance
 */
export const createValidator = (): ZodValidator => {
  return ZodValidator.getInstance();
};

/**
 * Quick validation helper
 */
export const validateData = async <T>(
  data: unknown,
  schema: ZodSchema<T>,
  options?: ValidationOptions
): Promise<ValidationResult<T>> => {
  const validator = ZodValidator.getInstance();
  return validator.validate(data, schema, options);
};

/**
 * Quick field validation helper
 */
export const validateField = async <T>(
  value: unknown,
  schema: ZodSchema<T>,
  fieldName?: string
): Promise<FieldValidationResult> => {
  const validator = ZodValidator.getInstance();
  return validator.validateField(value, schema, fieldName);
};

// Export default instance
export default ZodValidator.getInstance();
