import {
  ValidationFramework,
  ValidationSchemas,
  ValidationMiddleware,
  ValidationError,
  StrongPasswordValidator,
  EmailDomainValidator,
  SqlInjectionValidator,
  XssContentValidator,
  FileUploadValidator,
  JoiValidationSchema,
  ZodValidationSchema,
  Ok,
  Err
} from '../validation';
import { z } from 'zod';
import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

// Mock Express objects
const mockRequest = (body?: any, query?: any, params?: any): Partial<Request> => ({
  body,
  query,
  params
});

const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext: jest.MockedFunction<NextFunction> = jest.fn();

describe('ValidationFramework', () => {
  let framework: ValidationFramework;

  beforeEach(() => {
    framework = ValidationFramework.getInstance();
    mockNext.mockClear();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = ValidationFramework.getInstance();
      const instance2 = ValidationFramework.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should initialize with default validators and schemas', () => {
      const validators = framework.listCustomValidators();
      const schemas = framework.listSchemas();
      
      expect(validators).toContain('strongPassword');
      expect(validators).toContain('sqlInjection');
      expect(validators).toContain('xssContent');
      expect(schemas).toContain('USER_REGISTRATION');
      expect(schemas).toContain('TASK_CREATION');
    });
  });

  describe('Schema Management', () => {
    it('should register and retrieve custom schemas', () => {
      const customSchema = new JoiValidationSchema(Joi.string().required());
      framework.registerSchema('CUSTOM_TEST', customSchema);
      
      const retrieved = framework.getSchema('CUSTOM_TEST');
      expect(retrieved).toBe(customSchema);
    });

    it('should return undefined for non-existent schema', () => {
      const result = framework.getSchema('NON_EXISTENT');
      expect(result).toBeUndefined();
    });

    it('should validate with registered schema', () => {
      const result = framework.validate({ name: 'John Doe', email: 'john@example.com', password: 'StrongPass123!' }, 'USER_REGISTRATION');
      expect(result.success).toBe(true);
    });

         it('should return error for unknown schema', () => {
       const result = framework.validate({}, 'UNKNOWN_SCHEMA');
       expect(result.success).toBe(false);
       if (!result.success) {
         expect(result.error.length).toBeGreaterThan(0);
         expect(result.error[0]?.code).toBe('SCHEMA_NOT_FOUND');
       }
     });
  });

  describe('Custom Validator Management', () => {
    it('should register and retrieve custom validators', () => {
      const customValidator = new StrongPasswordValidator();
      framework.registerCustomValidator('customTest', customValidator);
      
      const retrieved = framework.getCustomValidator('customTest');
      expect(retrieved).toBe(customValidator);
    });

    it('should return undefined for non-existent validator', () => {
      const result = framework.getCustomValidator('nonExistent');
      expect(result).toBeUndefined();
    });
  });
});

describe('StrongPasswordValidator', () => {
  let validator: StrongPasswordValidator;

  beforeEach(() => {
    validator = new StrongPasswordValidator();
  });

  describe('Valid Passwords', () => {
    it('should accept strong passwords', () => {
      const passwords = ['StrongPass123!', 'MyP@ssw0rd', 'C0mplex!ty', 'Secur3#Pass'];
      
      passwords.forEach(password => {
        const result = validator.validate(password);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Invalid Passwords', () => {
    it('should reject non-string values', () => {
      const result = validator.validate(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Password must be a string');
      }
    });

    it('should reject short passwords', () => {
      const result = validator.validate('Short1!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('at least 8 characters');
      }
    });

    it('should reject passwords without uppercase', () => {
      const result = validator.validate('lowercase123!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('uppercase letter');
      }
    });

    it('should reject passwords without lowercase', () => {
      const result = validator.validate('UPPERCASE123!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('lowercase letter');
      }
    });

    it('should reject passwords without digits', () => {
      const result = validator.validate('NoDigits!');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('digit');
      }
    });

    it('should reject passwords without special characters', () => {
      const result = validator.validate('NoSpecial123');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('special character');
      }
    });
  });
});

describe('SqlInjectionValidator', () => {
  let validator: SqlInjectionValidator;

  beforeEach(() => {
    validator = new SqlInjectionValidator();
  });

  describe('Safe Inputs', () => {
    it('should accept clean strings', () => {
      const safeInputs = ['Hello World', 'user@example.com', 'Task title', '2023-12-31'];
      
      safeInputs.forEach(input => {
        const result = validator.validate(input);
        expect(result.success).toBe(true);
      });
    });

    it('should accept non-string values', () => {
      const result = validator.validate(123);
      expect(result.success).toBe(true);
    });
  });

  describe('Malicious Inputs', () => {
    it('should detect SQL injection patterns', () => {
      const maliciousInputs = [
        "1' OR '1'='1",
        "'; DROP TABLE users; --",
        "UNION SELECT * FROM users",
        "INSERT INTO users VALUES",
        "UPDATE users SET password",
        "DELETE FROM users WHERE"
      ];

      maliciousInputs.forEach(input => {
        const result = validator.validate(input);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('potentially malicious content');
        }
      });
    });
  });
});

describe('XssContentValidator', () => {
  let validator: XssContentValidator;

  beforeEach(() => {
    validator = new XssContentValidator();
  });

  describe('Safe Content', () => {
    it('should accept clean content', () => {
      const safeContent = ['Hello World', 'This is a normal paragraph', 'user@example.com'];
      
      safeContent.forEach(content => {
        const result = validator.validate(content);
        expect(result.success).toBe(true);
      });
    });

    it('should accept non-string values', () => {
      const result = validator.validate(123);
      expect(result.success).toBe(true);
    });
  });

  describe('Malicious Content', () => {
    it('should detect XSS patterns', () => {
      const maliciousContent = [
        '<script>alert("xss")</script>',
        'javascript:alert("xss")',
        '<img onload="alert(1)">',
        '<iframe src="malicious.com"></iframe>',
        '<object data="malicious.swf"></object>',
        '<embed src="malicious.swf">',
        '<link rel="stylesheet" href="malicious.css">'
      ];

      maliciousContent.forEach(content => {
        const result = validator.validate(content);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error).toContain('potentially malicious HTML/JavaScript content');
        }
      });
    });
  });
});

describe('EmailDomainValidator', () => {
  let validator: EmailDomainValidator;

  beforeEach(() => {
    validator = new EmailDomainValidator();
  });

  describe('Valid Emails', () => {
    it('should accept emails from allowed domains', () => {
      const validEmails = [
        'user@gmail.com',
        'test@yahoo.com',
        'admin@outlook.com',
        'user@example.com'
      ];

      validEmails.forEach(email => {
        const result = validator.validate(email);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Invalid Emails', () => {
    it('should reject non-string values', () => {
      const result = validator.validate(123);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Email must be a string');
      }
    });

    it('should reject invalid email format', () => {
      const result = validator.validate('invalid-email');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid email format');
      }
    });

    it('should reject emails from disallowed domains', () => {
      const result = validator.validate('user@badomain.com');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("domain 'badomain.com' is not allowed");
      }
    });
  });
});

describe('FileUploadValidator', () => {
  let validator: FileUploadValidator;

  beforeEach(() => {
    validator = new FileUploadValidator();
  });

  describe('Valid Files', () => {
    it('should accept valid file objects', () => {
      const validFiles = [
        { mimetype: 'image/jpeg', size: 1024 * 1024 },
        { mimetype: 'application/pdf', size: 512 * 1024 },
        { mimetype: 'text/plain', size: 256 * 1024 }
      ];

      validFiles.forEach(file => {
        const result = validator.validate(file);
        expect(result.success).toBe(true);
      });
    });
  });

  describe('Invalid Files', () => {
    it('should reject non-object values', () => {
      const result = validator.validate('not-a-file');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid file object');
      }
    });

    it('should reject files without mimetype', () => {
      const result = validator.validate({ size: 1024 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('File mime type is required');
      }
    });

    it('should reject disallowed file types', () => {
      const result = validator.validate({ mimetype: 'application/exe', size: 1024 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain("File type 'application/exe' is not allowed");
      }
    });

    it('should reject files that are too large', () => {
      const result = validator.validate({ 
        mimetype: 'image/jpeg', 
        size: 20 * 1024 * 1024 // 20MB
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('exceeds maximum allowed size');
      }
    });
  });
});

describe('JoiValidationSchema', () => {
  describe('Validation', () => {
    it('should validate data successfully', () => {
      const schema = new JoiValidationSchema(Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(0).required()
      }));

      const result = schema.validate({ name: 'John', age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 25 });
      }
    });

    it('should return validation errors', () => {
      const schema = new JoiValidationSchema(Joi.object({
        name: Joi.string().required(),
        age: Joi.number().min(0).required()
      }));

      const result = schema.validate({ name: '', age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toHaveLength(2);
        expect(result.error[0]).toBeInstanceOf(ValidationError);
      }
    });

    it('should strip unknown properties', () => {
      const schema = new JoiValidationSchema(Joi.object({
        name: Joi.string().required()
      }));

      const result = schema.validate({ name: 'John', extra: 'value' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John' });
      }
    });
  });

  it('should provide schema description', () => {
    const schema = new JoiValidationSchema(Joi.string().required());
    const description = schema.getDescription();
    expect(typeof description).toBe('string');
    expect(description.length).toBeGreaterThan(0);
  });
});

describe('ZodValidationSchema', () => {
  describe('Validation', () => {
    it('should validate data successfully', () => {
      const zodSchema = z.object({
        name: z.string(),
        age: z.number().min(0)
      });
      const schema = new ZodValidationSchema(zodSchema);

      const result = schema.validate({ name: 'John', age: 25 });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({ name: 'John', age: 25 });
      }
    });

    it('should return validation errors', () => {
      const zodSchema = z.object({
        name: z.string(),
        age: z.number().min(0)
      });
      const schema = new ZodValidationSchema(zodSchema);

      const result = schema.validate({ name: 123, age: -1 });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.length).toBeGreaterThan(0);
        expect(result.error[0]).toBeInstanceOf(ValidationError);
      }
    });
  });

  it('should provide schema description', () => {
    const zodSchema = z.string();
    const schema = new ZodValidationSchema(zodSchema);
    const description = schema.getDescription();
    expect(typeof description).toBe('string');
  });
});

describe('ValidationSchemas', () => {
  describe('USER_REGISTRATION', () => {
    it('should validate valid user registration data', () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'StrongPass123!'
      };

      const result = ValidationSchemas.USER_REGISTRATION.validate(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid user registration data', () => {
      const invalidData = {
        name: 'J',
        email: 'invalid-email',
        password: 'weak'
      };

      const result = ValidationSchemas.USER_REGISTRATION.validate(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TASK_CREATION', () => {
    it('should validate valid task creation data', () => {
      const validData = {
        title: 'New Task',
        description: 'Task description',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };

      const result = ValidationSchemas.TASK_CREATION.validate(validData);
      expect(result.success).toBe(true);
    });

    it('should reject XSS content in task data', () => {
      const maliciousData = {
        title: '<script>alert("xss")</script>',
        description: 'Normal description',
        priority: 'medium'
      };

      const result = ValidationSchemas.TASK_CREATION.validate(maliciousData);
      expect(result.success).toBe(false);
    });
  });
});

describe('ValidationMiddleware', () => {
  describe('validateBody', () => {
    it('should pass validation and call next', () => {
      const req = mockRequest({ name: 'John Doe', email: 'john@example.com', password: 'StrongPass123!' });
      const res = mockResponse();

      const middleware = ValidationMiddleware.validateBody('USER_REGISTRATION');
      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 on validation failure', () => {
      const req = mockRequest({ name: 'J', email: 'invalid' });
      const res = mockResponse();

      const middleware = ValidationMiddleware.validateBody('USER_REGISTRATION');
      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Validation failed',
        details: expect.any(Array)
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    it('should validate query parameters', () => {
      const req = mockRequest(undefined, { page: '1', limit: '10' });
      const res = mockResponse();

      const middleware = ValidationMiddleware.validateQuery('TASK_SEARCH');
      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateParams', () => {
    it('should validate URL parameters', () => {
      const req = mockRequest(undefined, undefined, { id: '123' });
      const res = mockResponse();
      
      // Create a simple schema for ID validation
      const framework = ValidationFramework.getInstance();
      framework.registerSchema('ID_PARAM', new JoiValidationSchema(
        Joi.object({ id: Joi.string().required() })
      ));

      const middleware = ValidationMiddleware.validateParams('ID_PARAM');
      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });
});

describe('Performance Tests', () => {
  it('should handle large number of validations efficiently', () => {
    const framework = ValidationFramework.getInstance();
    const startTime = Date.now();
    
    for (let i = 0; i < 1000; i++) {
      const result = framework.validate({
        name: `User Alpha`,  // Fixed: no numbers in name
        email: `user${i}@example.com`,
        password: 'StrongPass123!'
      }, 'USER_REGISTRATION');
      
      expect(result.success).toBe(true);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Should complete 1000 validations in under 1 second
    expect(duration).toBeLessThan(1000);
  });

  it('should handle concurrent validations', async () => {
    const framework = ValidationFramework.getInstance();
    
    const promises = Array.from({ length: 100 }, (_, i) =>
      Promise.resolve(framework.validate({
        name: `User Beta`,  // Fixed: no numbers in name
        email: `user${i}@example.com`,
        password: 'StrongPass123!'
      }, 'USER_REGISTRATION'))
    );
    
    const results = await Promise.all(promises);
    expect(results.every(result => result.success)).toBe(true);
  });
});

describe('Security Tests', () => {
  it('should prevent bypass attempts', () => {
    const validator = new SqlInjectionValidator();
    
    // Various bypass attempts
    const bypassAttempts = [
      "1' OR '1'='1' --",
      "admin'/**/OR/**/1=1#",
      "'; waitfor delay '00:00:10' --",
      "1'; exec sp_cmdshell 'dir' --"
    ];
    
    bypassAttempts.forEach(attempt => {
      const result = validator.validate(attempt);
      expect(result.success).toBe(false);
    });
  });

  it('should handle encoded attacks', () => {
    const validator = new XssContentValidator();
    
    // URL encoded and other encoded attacks
    const encodedAttacks = [
      "%3Cscript%3Ealert('xss')%3C/script%3E",
      "&#60;script&#62;alert('xss')&#60;/script&#62;",
      "&lt;script&gt;alert('xss')&lt;/script&gt;"
    ];
    
    encodedAttacks.forEach(attack => {
      // Decode the attack first (as a real application might)
      const decoded = decodeURIComponent(attack);
      const result = validator.validate(decoded);
      expect(result.success).toBe(false);
    });
  });
});

describe('Edge Cases', () => {
  it('should handle null and undefined values', () => {
    const framework = ValidationFramework.getInstance();
    
    const result1 = framework.validate(null, 'USER_REGISTRATION');
    expect(result1.success).toBe(false);
    
    const result2 = framework.validate(undefined, 'USER_REGISTRATION');
    expect(result2.success).toBe(false);
  });

  it('should handle empty objects and arrays', () => {
    const framework = ValidationFramework.getInstance();
    
    const result1 = framework.validate({}, 'USER_REGISTRATION');
    expect(result1.success).toBe(false);
    
    const result2 = framework.validate([], 'USER_REGISTRATION');
    expect(result2.success).toBe(false);
  });

  it('should handle very large strings', () => {
    const validator = new XssContentValidator();
    const largeString = 'a'.repeat(10000);
    
    const result = validator.validate(largeString);
    expect(result.success).toBe(true);
  });
});

describe('ValidationSchemas Extended Tests', () => {
  describe('USER_LOGIN', () => {
    it('should validate valid login data', () => {
      const validData = {
        email: 'user@example.com',
        password: 'anypassword'
      };
      const result = ValidationSchemas.USER_LOGIN.validate(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid login data', () => {
      const invalidData = {
        email: 'invalid-email',
        password: ''
      };
      const result = ValidationSchemas.USER_LOGIN.validate(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('TASK_UPDATE', () => {
    it('should validate valid update data', () => {
      const validData = {
        title: 'Updated Task',
        status: 'in_progress',
        priority: 'high'
      };
      const result = ValidationSchemas.TASK_UPDATE.validate(validData);
      expect(result.success).toBe(true);
    });

    it('should reject empty update data', () => {
      const result = ValidationSchemas.TASK_UPDATE.validate({});
      expect(result.success).toBe(false);
    });
  });

  describe('TASK_SEARCH', () => {
    it('should validate search parameters with defaults', () => {
      const validData = {
        searchText: 'test'
      };
      const result = ValidationSchemas.TASK_SEARCH.validate(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        const data = result.data as any;
        expect(data.page).toBe(1);
        expect(data.limit).toBe(10);
        expect(data.sortBy).toBe('createdAt');
        expect(data.sortOrder).toBe('desc');
      }
    });

    it('should validate complex search parameters', () => {
      const validData = {
        page: 2,
        limit: 50,
        status: ['pending', 'in_progress'],
        priority: ['high', 'urgent'],
        sortBy: 'dueDate',
        sortOrder: 'asc'
      };
      const result = ValidationSchemas.TASK_SEARCH.validate(validData);
      expect(result.success).toBe(true);
    });
  });
});

describe('ValidationError', () => {
  it('should format error message correctly', () => {
    const error = new ValidationError(
      'Test error message',
      'test.error',
      'field.path',
      'test value'
    );
    
    const formatted = error.toString();
    expect(formatted).toContain('ValidationError: Test error message');
    expect(formatted).toContain('(test.error)');
    expect(formatted).toContain('at path: field.path');
  });
});

describe('ValidationMiddleware Extended', () => {
  beforeEach(() => {
    mockNext.mockClear();
  });

  describe('validateWithSchema', () => {
    it('should validate with custom schema and call next', () => {
      const req = mockRequest({ test: 'value' });
      const res = mockResponse();
      
      const customSchema = new JoiValidationSchema(
        Joi.object({ test: Joi.string().required() })
      );

      const middleware = ValidationMiddleware.validateWithSchema(customSchema);
      middleware(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should return 400 on schema validation failure', () => {
      const req = mockRequest({ invalid: 'data' });
      const res = mockResponse();
      
      const customSchema = new JoiValidationSchema(
        Joi.object({ test: Joi.string().required() })
      );

      const middleware = ValidationMiddleware.validateWithSchema(customSchema);
      middleware(req as Request, res as Response, mockNext);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        error: 'Schema validation failed'
      }));
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});

describe('Framework Advanced Features', () => {
  let framework: ValidationFramework;

  beforeEach(() => {
    framework = ValidationFramework.getInstance();
  });

  describe('validateWithCustomSchema', () => {
    it('should validate with custom schema instance', () => {
      const customSchema = new ZodValidationSchema(
        z.object({ name: z.string(), age: z.number() })
      );

      const result = framework.validateWithCustomSchema(
        { name: 'John', age: 30 },
        customSchema
      );

      expect(result.success).toBe(true);
    });
  });

  describe('Custom validators usage', () => {
    it('should retrieve and use registered custom validators', () => {
      const passwordValidator = framework.getCustomValidator('strongPassword');
      expect(passwordValidator).toBeInstanceOf(StrongPasswordValidator);
      
      if (passwordValidator) {
        const result = passwordValidator.validate('WeakPass');
        expect(result.success).toBe(false);
      }
    });
  });
});

describe('FileUploadValidator Extended Tests', () => {
  let validator: FileUploadValidator;

  beforeEach(() => {
    validator = new FileUploadValidator();
  });

  it('should provide validator name and description', () => {
    expect(validator.getName()).toBe('fileUpload');
    expect(validator.getDescription()).toContain('file uploads');
  });

  it('should reject files without size', () => {
    const result = validator.validate({ mimetype: 'image/jpeg' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('File size is required');
    }
  });

  it('should handle null file object', () => {
    const result = validator.validate(null);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('Invalid file object');
    }
  });
});

describe('ZodValidationSchema Extended Tests', () => {
  it('should handle complex validation errors', () => {
    const schema = new ZodValidationSchema(
      z.object({
        nested: z.object({
          field: z.string()
        })
      })
    );

    const result = schema.validate({ nested: { field: 123 } });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error[0]?.path).toBe('nested.field');
    }
  });
});

describe('Custom Validator Extended Tests', () => {
  describe('SqlInjectionValidator Extended', () => {
    let validator: SqlInjectionValidator;

    beforeEach(() => {
      validator = new SqlInjectionValidator();
    });

    it('should provide validator name and description', () => {
      expect(validator.getName()).toBe('sqlInjection');
      expect(validator.getDescription()).toContain('SQL injection');
    });
  });

  describe('XssContentValidator Extended', () => {
    let validator: XssContentValidator;

    beforeEach(() => {
      validator = new XssContentValidator();
    });

    it('should provide validator name and description', () => {
      expect(validator.getName()).toBe('xssContent');
      expect(validator.getDescription()).toContain('XSS attacks');
    });
  });

  describe('EmailDomainValidator Extended', () => {
    let validator: EmailDomainValidator;

    beforeEach(() => {
      validator = new EmailDomainValidator();
    });

    it('should provide validator name and description', () => {
      expect(validator.getName()).toBe('emailDomain');
      expect(validator.getDescription()).toContain('email domain');
    });

    it('should handle email with multiple @ symbols', () => {
      const result = validator.validate('user@@example.com');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Invalid email format');
      }
    });
  });

  describe('StrongPasswordValidator Extended', () => {
    let validator: StrongPasswordValidator;

    beforeEach(() => {
      validator = new StrongPasswordValidator();
    });

    it('should provide validator name and description', () => {
      expect(validator.getName()).toBe('strongPassword');
      expect(validator.getDescription()).toContain('password strength');
    });
  });
});

describe('Integration Tests', () => {
  it('should work with complete Express middleware chain', () => {
    const framework = ValidationFramework.getInstance();
    
    // Simulate a complete request flow
    const req = mockRequest({
      name: 'Integration Test User',
      email: 'integration@example.com',
      password: 'IntegrationTest123!'
    });
    const res = mockResponse();
    
    // Body validation
    const bodyMiddleware = ValidationMiddleware.validateBody('USER_REGISTRATION');
    bodyMiddleware(req as Request, res as Response, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(req.body).toEqual(expect.objectContaining({
      name: 'Integration Test User',
      email: 'integration@example.com',
      password: 'IntegrationTest123!'
    }));
  });
}); 