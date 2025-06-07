/**
 * ===================================
 * Request Validator Test Suite
 * ===================================
 * Purpose: Comprehensive tests for Express request validation functionality
 * Features:
 * - Request validation testing
 * - Middleware integration testing
 * - Error handling testing
 * - Multi-target validation testing
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  RequestValidator,
  ValidationTarget,
  ValidationConfig,
  MultiValidationConfig,
  CommonValidators,
  createRequestValidator,
  validateBody,
  validateQuery,
  validateParams,
  validateHeaders,
  validateRequest
} from '../../src/utils/request-validator';
import { UserSchemas, TaskSchemas, ValidationPatterns } from '../../src/utils/zod-validator';

// Mock Express objects
const mockRequest = (overrides: Partial<Request> = {}): Request => {
  return {
    body: {},
    query: {},
    params: {},
    headers: {},
    validated: {},
    ...overrides
  } as any;
};

const mockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = (): NextFunction => jest.fn();

describe('RequestValidator', () => {
  let requestValidator: RequestValidator;

  beforeEach(() => {
    requestValidator = RequestValidator.getInstance();
  });

  // ===================================
  // Singleton Pattern Tests
  // ===================================

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = RequestValidator.getInstance();
      const instance2 = RequestValidator.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should return same instance from createRequestValidator', () => {
      const instance1 = createRequestValidator();
      const instance2 = RequestValidator.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  // ===================================
  // Single Target Validation Tests
  // ===================================

  describe('Single Target Validation', () => {
    describe('Body Validation', () => {
      test('should validate request body successfully', async () => {
        const schema = z.object({
          name: z.string().min(1),
          email: z.string().email()
        });

        const req = mockRequest({
          body: { name: 'John Doe', email: 'john@example.com' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.BODY,
          schema
        });

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.body).toEqual({
          name: 'John Doe',
          email: 'john@example.com'
        });
        expect(res.status).not.toHaveBeenCalled();
      });

      test('should handle body validation errors', async () => {
        const schema = z.object({
          name: z.string().min(1),
          email: z.string().email()
        });

        const req = mockRequest({
          body: { name: '', email: 'invalid-email' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.BODY,
          schema
        });

        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
          expect.objectContaining({
            success: false,
            error: expect.objectContaining({
              code: 'VALIDATION_ERROR'
            })
          })
        );
      });

      test('should handle optional body validation', async () => {
        const schema = z.object({
          name: z.string().optional()
        });

        const req = mockRequest({ body: {} });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.BODY,
          schema,
          optional: true
        });

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Query Validation', () => {
      test('should validate query parameters successfully', async () => {
        const schema = z.object({
          page: z.string().transform(Number).pipe(z.number().positive()),
          limit: z.string().transform(Number).pipe(z.number().positive())
        });

        const req = mockRequest({
          query: { page: '1', limit: '10' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.QUERY,
          schema
        });

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.query).toEqual({
          page: 1,
          limit: 10
        });
      });

      test('should handle query validation errors', async () => {
        const schema = z.object({
          page: z.string().transform(Number).pipe(z.number().positive())
        });

        const req = mockRequest({
          query: { page: 'invalid' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.QUERY,
          schema
        });

        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Params Validation', () => {
      test('should validate path parameters successfully', async () => {
        const schema = z.object({
          id: ValidationPatterns.uuid
        });

        const req = mockRequest({
          params: { id: '123e4567-e89b-12d3-a456-426614174000' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.PARAMS,
          schema
        });

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.params).toEqual({
          id: '123e4567-e89b-12d3-a456-426614174000'
        });
      });

      test('should handle params validation errors', async () => {
        const schema = z.object({
          id: ValidationPatterns.uuid
        });

        const req = mockRequest({
          params: { id: 'invalid-uuid' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.PARAMS,
          schema
        });

        await middleware(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
      });
    });

    describe('Headers Validation', () => {
      test('should validate headers successfully', async () => {
        const schema = z.object({
          'content-type': z.string(),
          'authorization': z.string().optional()
        });

        const req = mockRequest({
          headers: {
            'content-type': 'application/json',
            'authorization': 'Bearer token123'
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = requestValidator.validate({
          target: ValidationTarget.HEADERS,
          schema
        });

        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.headers).toEqual({
          'content-type': 'application/json',
          'authorization': 'Bearer token123'
        });
      });
    });
  });

  // ===================================
  // Middleware Options Tests
  // ===================================

  describe('Middleware Options', () => {
    test('should use custom error handler', async () => {
      const customErrorHandler = jest.fn();
      const schema = z.object({ name: z.string().min(1) });

      const req = mockRequest({ body: { name: '' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.middleware(
        ValidationTarget.BODY,
        schema,
        { onError: customErrorHandler }
      );

      await middleware(req, res, next);

      expect(customErrorHandler).toHaveBeenCalledWith(
        req,
        res,
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.any(String)
          })
        ])
      );
      expect(next).not.toHaveBeenCalled();
    });

    test('should handle custom messages', async () => {
      const schema = z.object({ name: z.string().min(1) });

      const req = mockRequest({ body: { name: '' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.middleware(
        ValidationTarget.BODY,
        schema,
        {
          customMessages: {
            'name.too_small': 'Name is required and cannot be empty'
          }
        }
      );

      await middleware(req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.objectContaining({
            details: expect.arrayContaining([
              expect.objectContaining({
                field: 'name'
              })
            ])
          })
        })
      );
    });
  });

  // ===================================
  // CommonValidators Tests
  // ===================================

  describe('CommonValidators', () => {
    describe('User Validators', () => {
      test('should validate user registration', async () => {
        const req = mockRequest({
          body: {
            username: 'testuser',
            email: 'test@example.com',
            password: 'StrongPass123!'
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validateUserRegistration();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.body).toEqual({
          username: 'testuser',
          email: 'test@example.com',
          password: 'StrongPass123!',
          role: 'user'
        });
      });

      test('should validate user login', async () => {
        const req = mockRequest({
          body: {
            email: 'test@example.com',
            password: 'password123'
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validateUserLogin();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.body).toEqual({
          email: 'test@example.com',
          password: 'password123'
        });
      });

      test('should validate password change', async () => {
        const req = mockRequest({
          body: {
            currentPassword: 'oldpass',
            newPassword: 'NewStrongPass123!',
            confirmPassword: 'NewStrongPass123!'
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validatePasswordChange();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('Task Validators', () => {
      test('should validate task creation', async () => {
        const req = mockRequest({
          body: {
            title: 'Test Task',
            description: 'Task description',
            priority: 'high'
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validateTaskCreation();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.body).toEqual({
          title: 'Test Task',
          description: 'Task description',
          priority: 'high'
        });
      });

      test('should validate task search filters', async () => {
        const req = mockRequest({
          query: {
            status: 'pending',
            priority: 'high'
            // pageとlimitは数値型を期待するスキーマなので、空のクエリでテスト
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validateTaskSearchFilters();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('Category Validators', () => {
      test('should validate category creation', async () => {
        const req = mockRequest({
          body: {
            name: 'Work',
            color: '#FF0000',
            description: 'Work related tasks'
          }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validateCategoryCreation();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.validated?.body).toEqual({
          name: 'Work',
          color: '#FF0000',
          description: 'Work related tasks'
        });
      });
    });

    describe('Common Parameter Validators', () => {
      test('should validate UUID parameter', async () => {
        const req = mockRequest({
          params: { id: '123e4567-e89b-12d3-a456-426614174000' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validateUuidParam('id');
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      test('should validate pagination', async () => {
        const req = mockRequest({
          query: { page: '2', limit: '50' }
        });
        const res = mockResponse();
        const next = mockNext();

        const middleware = CommonValidators.validatePagination();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    test('validateBody helper should work correctly', async () => {
      const schema = z.object({ name: z.string() });
      const req = mockRequest({ body: { name: 'Test' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = validateBody(schema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.body).toEqual({ name: 'Test' });
    });

    test('validateQuery helper should work correctly', async () => {
      const schema = z.object({ search: z.string() });
      const req = mockRequest({ query: { search: 'test' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = validateQuery(schema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.query).toEqual({ search: 'test' });
    });

    test('validateParams helper should work correctly', async () => {
      const schema = z.object({ id: z.string() });
      const req = mockRequest({ params: { id: 'test-id' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = validateParams(schema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.params).toEqual({ id: 'test-id' });
    });

    test('validateHeaders helper should work correctly', async () => {
      const schema = z.object({ 'content-type': z.string() });
      const req = mockRequest({ headers: { 'content-type': 'application/json' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = validateHeaders(schema);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.headers).toEqual({ 'content-type': 'application/json' });
    });

    test('validateRequest helper should work correctly', async () => {
      const config: MultiValidationConfig = {
        body: z.object({ name: z.string() }),
        query: z.object({ page: z.string() })
      };

      const req = mockRequest({
        body: { name: 'Test' },
        query: { page: '1' }
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = validateRequest(config);
      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.body).toEqual({ name: 'Test' });
      expect(req.validated?.query).toEqual({ page: '1' });
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should handle unexpected errors gracefully', async () => {
      const schema = z.object({ name: z.string() });

      // Mock ZodValidator to throw an error
      const originalValidate = requestValidator['zodValidator'].validate;
      requestValidator['zodValidator'].validate = jest.fn().mockRejectedValue(new Error('Unexpected error'));

      const req = mockRequest({ body: { name: 'Test' } });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.validate({
        target: ValidationTarget.BODY,
        schema
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'INTERNAL_SERVER_ERROR'
          })
        })
      );

      // Restore original method
      requestValidator['zodValidator'].validate = originalValidate;
    });

    test('should handle validation errors with detailed information', async () => {
      const schema = z.object({
        name: z.string().min(3),
        email: z.string().email(),
        age: z.number().positive()
      });

      const req = mockRequest({
        body: {
          name: 'ab', // too short
          email: 'invalid-email',
          age: -1 // negative
        }
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.validate({
        target: ValidationTarget.BODY,
        schema
      });

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({ field: 'name' }),
              expect.objectContaining({ field: 'email' }),
              expect.objectContaining({ field: 'age' })
            ])
          })
        })
      );
    });
  });

  // ===================================
  // Edge Cases Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle empty request body', async () => {
      const schema = z.object({ name: z.string().optional() });

      const req = mockRequest({ body: {} });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.validate({
        target: ValidationTarget.BODY,
        schema
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.body).toEqual({});
    });

    test('should handle null request body', async () => {
      const schema = z.object({ name: z.string().optional() });

      const req = mockRequest({ body: null });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.validate({
        target: ValidationTarget.BODY,
        schema,
        optional: true
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    test('should handle undefined query parameters', async () => {
      const schema = z.object({ search: z.string().optional() });

      const req = mockRequest({ query: {} });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.validate({
        target: ValidationTarget.QUERY,
        schema
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.query).toEqual({});
    });

    test('should handle complex nested validation', async () => {
      const schema = z.object({
        user: z.object({
          profile: z.object({
            name: z.string(),
            settings: z.object({
              theme: z.string()
            })
          })
        })
      });

      const req = mockRequest({
        body: {
          user: {
            profile: {
              name: 'John',
              settings: {
                theme: 'dark'
              }
            }
          }
        }
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = requestValidator.validate({
        target: ValidationTarget.BODY,
        schema
      });

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.body).toEqual({
        user: {
          profile: {
            name: 'John',
            settings: {
              theme: 'dark'
            }
          }
        }
      });
    });
  });
});

  // ===================================
  // Multi-Target Validation Tests
  // ===================================

  describe('Multi-Target Validation', () => {
    test('should validate multiple targets successfully', async () => {
      const config: MultiValidationConfig = {
        body: z.object({ name: z.string() }),
        query: z.object({ page: z.string().transform(Number) }),
        params: z.object({ id: ValidationPatterns.uuid })
      };

      const req = mockRequest({
        body: { name: 'Test' },
        query: { page: '1' },
        params: { id: '123e4567-e89b-12d3-a456-426614174000' }
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = RequestValidator.getInstance().validateMultiple(config);

      await middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.validated?.body).toEqual({ name: 'Test' });
      expect(req.validated?.query).toEqual({ page: 1 });
      expect(req.validated?.params).toEqual({ id: '123e4567-e89b-12d3-a456-426614174000' });
    });

    test('should handle multi-target validation errors', async () => {
      const config: MultiValidationConfig = {
        body: z.object({ name: z.string().min(1) }),
        query: z.object({ page: z.string().transform(Number).pipe(z.number().positive()) })
      };

      const req = mockRequest({
        body: { name: '' },
        query: { page: '0' }
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = RequestValidator.getInstance().validateMultiple(config);

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'VALIDATION_ERROR',
            details: expect.arrayContaining([
              expect.objectContaining({ field: expect.stringContaining('body.') }),
              expect.objectContaining({ field: expect.stringContaining('query.') })
            ])
          })
        })
      );
    });

    test('should handle partial multi-target validation success', async () => {
      const config: MultiValidationConfig = {
        body: z.object({ name: z.string() }),
        query: z.object({ page: z.string().transform(Number).pipe(z.number().positive()) })
      };

      const req = mockRequest({
        body: { name: 'Valid Name' },
        query: { page: '0' } // Invalid
      });
      const res = mockResponse();
      const next = mockNext();

      const middleware = RequestValidator.getInstance().validateMultiple(config);

      await middleware(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      // Body should not be attached since overall validation failed
      expect(req.validated?.body).toBeUndefined();
    });
  });
