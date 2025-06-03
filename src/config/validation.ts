import Joi from 'joi';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Temporary Result type until TSK-007-TYP-Core is implemented
export type Result<T, E> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ success: false, error });

// ===== Core Validation Framework =====

export abstract class ValidationSchema {
  abstract validate<T>(data: unknown): Result<T, ValidationError[]>;
  abstract getDescription(): string;
}

export abstract class CustomValidator {
  abstract validate(value: any): Result<boolean, string>;
  abstract getName(): string;
  abstract getDescription(): string;
}

export class ValidationError {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly path?: string,
    public readonly value?: any
  ) {}

  toString(): string {
    return `ValidationError: ${this.message} (${this.code}) at path: ${this.path}`;
  }
}

// ===== Joi Validation Schema =====

export class JoiValidationSchema extends ValidationSchema {
  constructor(
    private schema: Joi.Schema,
    private options: Joi.ValidationOptions = {}
  ) {
    super();
  }

  validate<T>(data: unknown): Result<T, ValidationError[]> {
    // Handle null and undefined explicitly
    if (data === null || data === undefined) {
      return Err([new ValidationError(
        'Input data cannot be null or undefined',
        'any.required',
        '',
        data
      )]);
    }

    const result = this.schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      ...this.options
    });

    if (result.error) {
      const errors = result.error.details.map(detail => 
        new ValidationError(
          detail.message,
          detail.type,
          detail.path.join('.'),
          detail.context?.value
        )
      );
      return Err(errors);
    }

    return Ok(result.value as T);
  }

  getDescription(): string {
    return this.schema.describe().toString();
  }
}

// ===== Zod Validation Schema =====

export class ZodValidationSchema extends ValidationSchema {
  constructor(private schema: z.ZodSchema) {
    super();
  }

  validate<T>(data: unknown): Result<T, ValidationError[]> {
    const result = this.schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map(issue =>
        new ValidationError(
          issue.message,
          issue.code,
          issue.path.join('.'),
          (issue as any).data || undefined
        )
      );
      return Err(errors);
    }

    return Ok(result.data as T);
  }

  getDescription(): string {
    return JSON.stringify((this.schema as any).describe ? (this.schema as any).describe() : {}, null, 2);
  }
}

// ===== Custom Validators =====

export class StrongPasswordValidator extends CustomValidator {
  private readonly minLength = 8;
  private readonly requirements = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /\d/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  };

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Err('Password must be a string');
    }

    if (value.length < this.minLength) {
      return Err(`Password must be at least ${this.minLength} characters long`);
    }

    const missingRequirements: string[] = [];
    
    if (!this.requirements.uppercase.test(value)) {
      missingRequirements.push('uppercase letter');
    }
    if (!this.requirements.lowercase.test(value)) {
      missingRequirements.push('lowercase letter');
    }
    if (!this.requirements.digit.test(value)) {
      missingRequirements.push('digit');
    }
    if (!this.requirements.special.test(value)) {
      missingRequirements.push('special character');
    }

    if (missingRequirements.length > 0) {
      return Err(`Password must contain: ${missingRequirements.join(', ')}`);
    }

    return Ok(true);
  }

  getName(): string {
    return 'strongPassword';
  }

  getDescription(): string {
    return 'Validates password strength (8+ chars, uppercase, lowercase, digit, special char)';
  }
}

export class EmailDomainValidator extends CustomValidator {
  private readonly allowedDomains = new Set([
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 
    'example.com', 'test.com', 'company.com'
  ]);

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Err('Email must be a string');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return Err('Invalid email format');
    }

    const parts = value.split('@');
    if (parts.length !== 2 || !parts[1]) {
      return Err('Invalid email format');
    }
    
    const domain = parts[1].toLowerCase();
    if (!this.allowedDomains.has(domain)) {
      return Err(`Email domain '${domain}' is not allowed`);
    }

    return Ok(true);
  }

  getName(): string {
    return 'emailDomain';
  }

  getDescription(): string {
    return 'Validates email domain against allowed list';
  }
}

export class SqlInjectionValidator extends CustomValidator {
  private readonly suspiciousPatterns = [
    /\'\s*(or|and)\s*\'\d*\'\s*=\s*\'\d*\'/i,  // Matches "' OR '1'='1"
    /\d+\'\s*(or|and)\s*\'\d+\'\s*=\s*\'\d+/i,  // Matches "1' OR '1'='1"  
    /\'\s*;\s*drop\s+table/i,                    // Matches "'; DROP TABLE"
    /union\s+(all\s+)?select/i,                  // Matches "UNION SELECT"
    /insert\s+into/i,                            // Matches "INSERT INTO"
    /update\s+.+\s+set/i,                        // Matches "UPDATE ... SET"
    /delete\s+from/i,                            // Matches "DELETE FROM"
    /drop\s+(table|database|index|view)/i,       // Matches "DROP TABLE"
    /exec\s*\(/i,
    /script\s*>/i,
    /javascript:/i,
    /--\s*$/m,
    /\/\*.*?\*\//s,
    /;\s*(drop|delete|update|insert|create|alter)/i
  ];

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Ok(true); // Only validate strings
    }

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(value)) {
        return Err('Input contains potentially malicious content');
      }
    }

    return Ok(true);
  }

  getName(): string {
    return 'sqlInjection';
  }

  getDescription(): string {
    return 'Validates input for potential SQL injection attacks';
  }
}

export class XssContentValidator extends CustomValidator {
  private readonly xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi,
    /&lt;script&gt;.*?&lt;\/script&gt;/gi,
    /&#60;script&#62;.*?&#60;\/script&#62;/gi,
    /%3cscript%3e.*?%3c\/script%3e/gi
  ];

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Ok(true);
    }

    for (const pattern of this.xssPatterns) {
      if (pattern.test(value)) {
        return Err('Input contains potentially malicious HTML/JavaScript content');
      }
    }

    return Ok(true);
  }

  getName(): string {
    return 'xssContent';
  }

  getDescription(): string {
    return 'Validates input for potential XSS attacks';
  }
}

export class FileUploadValidator extends CustomValidator {
  private readonly allowedMimeTypes = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'text/plain', 'text/csv',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]);

  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  validate(value: any): Result<boolean, string> {
    if (!value || typeof value !== 'object') {
      return Err('Invalid file object');
    }

    if (!value.mimetype || typeof value.mimetype !== 'string') {
      return Err('File mime type is required');
    }

    if (!this.allowedMimeTypes.has(value.mimetype)) {
      return Err(`File type '${value.mimetype}' is not allowed`);
    }

    if (!value.size || typeof value.size !== 'number') {
      return Err('File size is required');
    }

    if (value.size > this.maxFileSize) {
      return Err(`File size ${value.size} exceeds maximum allowed size ${this.maxFileSize}`);
    }

    return Ok(true);
  }

  getName(): string {
    return 'fileUpload';
  }

  getDescription(): string {
    return 'Validates file uploads (type, size, security)';
  }
}

// ===== Validation Framework =====

export class ValidationFramework {
  private static instance: ValidationFramework;
  private schemas: Map<string, ValidationSchema> = new Map();
  private customValidators: Map<string, CustomValidator> = new Map();

  private constructor() {
    this.registerDefaultValidators();
    this.registerDefaultSchemas();
  }

  public static getInstance(): ValidationFramework {
    if (!ValidationFramework.instance) {
      ValidationFramework.instance = new ValidationFramework();
    }
    return ValidationFramework.instance;
  }

  public registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema);
  }

  public getSchema(name: string): ValidationSchema | undefined {
    return this.schemas.get(name);
  }

  public registerCustomValidator(name: string, validator: CustomValidator): void {
    this.customValidators.set(name, validator);
  }

  public getCustomValidator(name: string): CustomValidator | undefined {
    return this.customValidators.get(name);
  }

  public validate<T>(
    data: unknown, 
    schemaName: string
  ): Result<T, ValidationError[]> {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return Err([new ValidationError(`Schema '${schemaName}' not found`, 'SCHEMA_NOT_FOUND')]);
    }

    return schema.validate(data);
  }

  public validateWithCustomSchema<T>(
    data: unknown,
    customSchema: ValidationSchema
  ): Result<T, ValidationError[]> {
    return customSchema.validate(data);
  }

  public listSchemas(): string[] {
    return Array.from(this.schemas.keys());
  }

  public listCustomValidators(): string[] {
    return Array.from(this.customValidators.keys());
  }

  private registerDefaultValidators(): void {
    this.registerCustomValidator('strongPassword', new StrongPasswordValidator());
    this.registerCustomValidator('emailDomain', new EmailDomainValidator());
    this.registerCustomValidator('sqlInjection', new SqlInjectionValidator());
    this.registerCustomValidator('xssContent', new XssContentValidator());
    this.registerCustomValidator('fileUpload', new FileUploadValidator());
  }

  private registerDefaultSchemas(): void {
    this.registerSchema('USER_REGISTRATION', ValidationSchemas.USER_REGISTRATION);
    this.registerSchema('USER_LOGIN', ValidationSchemas.USER_LOGIN);
    this.registerSchema('TASK_CREATION', ValidationSchemas.TASK_CREATION);
    this.registerSchema('TASK_UPDATE', ValidationSchemas.TASK_UPDATE);
    this.registerSchema('TASK_SEARCH', ValidationSchemas.TASK_SEARCH);
  }
}

// ===== Predefined Schemas =====

export class ValidationSchemas {
  public static readonly USER_REGISTRATION = new JoiValidationSchema(
    Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name must not exceed 50 characters',
          'string.pattern.base': 'Name can only contain letters and spaces'
        }),
      
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .max(100)
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.max': 'Email must not exceed 100 characters'
        }),
      
      password: Joi.string()
        .custom((value, helpers) => {
          const validator = new StrongPasswordValidator();
          const result = validator.validate(value);
          if (!result.success) {
            return helpers.error('any.custom', { message: result.error });
          }
          return value;
        })
        .required()
        .messages({
          'any.custom': '{{#message}}'
        })
    })
  );

  public static readonly USER_LOGIN = new JoiValidationSchema(
    Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address'
        }),
      
      password: Joi.string()
        .min(1)
        .required()
        .messages({
          'string.min': 'Password is required'
        })
    })
  );

  public static readonly TASK_CREATION = new JoiValidationSchema(
    Joi.object({
      title: Joi.string()
        .min(1)
        .max(200)
        .custom((value, helpers) => {
          const validator = new XssContentValidator();
          const result = validator.validate(value);
          if (!result.success) {
            return helpers.error('any.custom', { message: result.error });
          }
          return value;
        })
        .required()
        .messages({
          'string.min': 'Title is required',
          'string.max': 'Title must not exceed 200 characters',
          'any.custom': '{{#message}}'
        }),
      
      description: Joi.string()
        .max(1000)
        .custom((value, helpers) => {
          const validator = new XssContentValidator();
          const result = validator.validate(value);
          if (!result.success) {
            return helpers.error('any.custom', { message: result.error });
          }
          return value;
        })
        .optional()
        .messages({
          'string.max': 'Description must not exceed 1000 characters',
          'any.custom': '{{#message}}'
        }),
      
      priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .default('medium')
        .messages({
          'any.only': 'Priority must be one of: low, medium, high, urgent'
        }),
      
      dueDate: Joi.date()
        .iso()
        .min('now')
        .optional()
        .messages({
          'date.min': 'Due date must be in the future'
        })
    })
  );

  public static readonly TASK_UPDATE = new JoiValidationSchema(
    Joi.object({
      title: Joi.string().min(1).max(200).optional(),
      description: Joi.string().max(1000).optional(),
      status: Joi.string()
        .valid('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')
        .optional(),
      priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .optional(),
      dueDate: Joi.date().iso().optional()
    }).min(1)
  );

  public static readonly TASK_SEARCH = new JoiValidationSchema(
    Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.array()
        .items(Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled', 'on_hold'))
        .optional(),
      priority: Joi.array()
        .items(Joi.string().valid('low', 'medium', 'high', 'urgent'))
        .optional(),
      searchText: Joi.string().max(100).optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'dueDate', 'priority', 'title')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  );
}

// ===== Express Middleware =====

export class ValidationMiddleware {
  public static validateBody(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const framework = ValidationFramework.getInstance();
      const result = framework.validate(req.body, schemaName);

      if (!result.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.body = result.data;
      next();
    };
  }

  public static validateQuery(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const framework = ValidationFramework.getInstance();
      const result = framework.validate(req.query, schemaName);

      if (!result.success) {
        res.status(400).json({
          error: 'Query validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.query = result.data as any;
      next();
    };
  }

  public static validateParams(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const framework = ValidationFramework.getInstance();
      const result = framework.validate(req.params, schemaName);

      if (!result.success) {
        res.status(400).json({
          error: 'Parameter validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.params = result.data as any;
      next();
    };
  }

  public static validateWithSchema(schema: ValidationSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const result = schema.validate(req.body);

      if (!result.success) {
        res.status(400).json({
          error: 'Schema validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.body = result.data;
      next();
    };
  }
}

// ===== Default Export =====
export default ValidationFramework; 