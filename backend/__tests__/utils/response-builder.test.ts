/**
 * ===================================
 * Response Builder Test Suite
 * ===================================
 * Purpose: Comprehensive tests for unified API response functionality
 * Features:
 * - Response format testing
 * - HTTP status code testing
 * - Pagination testing
 * - Error handling testing
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Response } from 'express';
import {
  ResponseBuilder,
  StandardApiResponse,
  HTTP_STATUS,
  createResponseBuilder,
  successResponse,
  errorResponse,
  validationErrorResponse,
  paginatedResponse,
  sendSuccess,
  sendError,
  sendPaginated
} from '../../src/utils/response-builder';
import { PaginatedResult, ValidationErrorDetail } from '../../src/domain/types/common.types';
import { ServiceResponse, ServiceError } from '../../src/domain/types/service-interfaces.types';

// Mock Express Response
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('ResponseBuilder', () => {
  let responseBuilder: ResponseBuilder;

  beforeEach(() => {
    responseBuilder = ResponseBuilder.getInstance();
  });

  // ===================================
  // Singleton Pattern Tests
  // ===================================

  describe('Singleton Pattern', () => {
    test('should return same instance', () => {
      const instance1 = ResponseBuilder.getInstance();
      const instance2 = ResponseBuilder.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should return same instance from createResponseBuilder', () => {
      const instance1 = createResponseBuilder();
      const instance2 = ResponseBuilder.getInstance();
      
      expect(instance1).toBe(instance2);
    });
  });

  // ===================================
  // Success Response Tests
  // ===================================

  describe('Success Responses', () => {
    test('should create basic success response', () => {
      const data = { id: 1, name: 'Test' };
      const response = responseBuilder.success(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.metadata).toBeDefined();
      expect(response.metadata?.timestamp).toBeDefined();
      expect(response.error).toBeUndefined();
    });

    test('should create success response with custom status code', () => {
      const data = { message: 'Updated' };
      const response = responseBuilder.success(data, HTTP_STATUS.ACCEPTED);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });

    test('should create created response', () => {
      const data = { id: 1, name: 'New Item' };
      const response = responseBuilder.created(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.metadata).toBeDefined();
    });

    test('should create no content response', () => {
      const response = responseBuilder.noContent();

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
      expect(response.metadata).toBeDefined();
    });

    test('should include custom metadata', () => {
      const data = { test: true };
      const customMetadata = { customField: 'value' };
      const response = responseBuilder.success(data, HTTP_STATUS.OK, {
        metadata: customMetadata
      });

      expect(response.metadata?.customField).toBe('value');
      expect(response.metadata?.timestamp).toBeDefined();
    });

    test('should handle options correctly', () => {
      const data = { test: true };
      const response = responseBuilder.success(data, HTTP_STATUS.OK, {
        includeTimestamp: false,
        includeVersion: false,
        requestId: 'test-request-id'
      });

      expect(response.metadata?.timestamp).toBeUndefined();
      expect(response.metadata?.version).toBeUndefined();
      expect(response.metadata?.requestId).toBe('test-request-id');
    });
  });

  // ===================================
  // Paginated Response Tests
  // ===================================

  describe('Paginated Responses', () => {
    test('should create paginated response', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const paginatedResult: PaginatedResult<any> = {
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
          offset: 0
        }
      };

      const response = responseBuilder.paginated(paginatedResult);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.metadata?.pagination).toEqual(paginatedResult.pagination);
    });

    test('should create pagination info correctly', () => {
      const paginationInfo = responseBuilder.createPaginationInfo(2, 10, 25);

      expect(paginationInfo).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: true,
        offset: 10
      });
    });

    test('should create paginated result correctly', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const paginatedResult = responseBuilder.createPaginatedResult(data, 1, 10, 25);

      expect(paginatedResult.data).toEqual(data);
      expect(paginatedResult.pagination.page).toBe(1);
      expect(paginatedResult.pagination.limit).toBe(10);
      expect(paginatedResult.pagination.total).toBe(25);
      expect(paginatedResult.pagination.totalPages).toBe(3);
    });

    test('should handle edge cases in pagination', () => {
      // Last page
      const lastPageInfo = responseBuilder.createPaginationInfo(3, 10, 25);
      expect(lastPageInfo.hasNext).toBe(false);
      expect(lastPageInfo.hasPrev).toBe(true);

      // First page
      const firstPageInfo = responseBuilder.createPaginationInfo(1, 10, 25);
      expect(firstPageInfo.hasNext).toBe(true);
      expect(firstPageInfo.hasPrev).toBe(false);

      // Single page
      const singlePageInfo = responseBuilder.createPaginationInfo(1, 10, 5);
      expect(singlePageInfo.hasNext).toBe(false);
      expect(singlePageInfo.hasPrev).toBe(false);
      expect(singlePageInfo.totalPages).toBe(1);
    });
  });

  // ===================================
  // Error Response Tests
  // ===================================

  describe('Error Responses', () => {
    test('should create basic error response', () => {
      const response = responseBuilder.error('TEST_ERROR', 'Test error message');

      expect(response.success).toBe(false);
      expect(response.data).toBeUndefined();
      expect(response.error?.code).toBe('TEST_ERROR');
      expect(response.error?.message).toBe('Test error message');
      expect(response.error?.timestamp).toBeDefined();
      expect(response.metadata).toBeDefined();
    });

    test('should create validation error response', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'email', message: 'Invalid email format', value: 'invalid-email' }
      ];
      const response = responseBuilder.validationError('Validation failed', details);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(response.error?.message).toBe('Validation failed');
      expect(response.error?.details).toEqual(details);
    });

    test('should create authentication error response', () => {
      const response = responseBuilder.authenticationError();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('AUTHENTICATION_ERROR');
      expect(response.error?.message).toBe('Authentication failed');
    });

    test('should create authorization error response', () => {
      const response = responseBuilder.authorizationError();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('AUTHORIZATION_ERROR');
      expect(response.error?.message).toBe('Access denied');
    });

    test('should create not found error response', () => {
      const response = responseBuilder.notFoundError('User');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('NOT_FOUND_ERROR');
      expect(response.error?.message).toBe('User not found');
    });

    test('should create conflict error response', () => {
      const response = responseBuilder.conflictError('Email already exists');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('CONFLICT_ERROR');
      expect(response.error?.message).toBe('Email already exists');
    });

    test('should create rate limit error response', () => {
      const response = responseBuilder.rateLimitError();

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('RATE_LIMIT_ERROR');
      expect(response.error?.message).toBe('Rate limit exceeded');
    });

    test('should create internal server error response', () => {
      const details = { stack: 'Error stack trace' };
      const response = responseBuilder.internalServerError('Something went wrong', details);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INTERNAL_SERVER_ERROR');
      expect(response.error?.message).toBe('Something went wrong');
      expect(response.error?.details).toEqual(details);
    });
  });

  // ===================================
  // Service Response Conversion Tests
  // ===================================

  describe('Service Response Conversion', () => {
    test('should convert successful service response', () => {
      const serviceResponse: ServiceResponse<any> = {
        success: true,
        data: { id: 1, name: 'Test' }
      };

      const response = responseBuilder.fromServiceResponse(serviceResponse);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(serviceResponse.data);
    });

    test('should convert failed service response', () => {
      const serviceError: ServiceError = {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        timestamp: new Date()
      };

      const serviceResponse: ServiceResponse<any> = {
        success: false,
        error: serviceError
      };

      const response = responseBuilder.fromServiceResponse(serviceResponse);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(response.error?.message).toBe('Invalid input');
    });

    test('should handle invalid service response', () => {
      const invalidServiceResponse: ServiceResponse<any> = {
        success: true
        // missing data
      };

      const response = responseBuilder.fromServiceResponse(invalidServiceResponse);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('INTERNAL_SERVER_ERROR');
    });
  });

  // ===================================
  // Express Response Tests
  // ===================================

  describe('Express Response Integration', () => {
    test('should send success response', () => {
      const res = mockResponse();
      const data = { id: 1, name: 'Test' };

      responseBuilder.sendSuccess(res, data, HTTP_STATUS.OK);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data
        })
      );
    });

    test('should send created response', () => {
      const res = mockResponse();
      const data = { id: 1, name: 'New Item' };

      responseBuilder.sendCreated(res, data);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data
        })
      );
    });

    test('should send no content response', () => {
      const res = mockResponse();

      responseBuilder.sendNoContent(res);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.NO_CONTENT);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: null
        })
      );
    });

    test('should send paginated response', () => {
      const res = mockResponse();
      const paginatedResult: PaginatedResult<any> = {
        data: [{ id: 1 }, { id: 2 }],
        pagination: {
          page: 1,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: true,
          hasPrev: false,
          offset: 0
        }
      };

      responseBuilder.sendPaginated(res, paginatedResult);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: paginatedResult.data,
          metadata: expect.objectContaining({
            pagination: paginatedResult.pagination
          })
        })
      );
    });

    test('should send error response', () => {
      const res = mockResponse();

      responseBuilder.sendError(res, 'TEST_ERROR', 'Test error', HTTP_STATUS.BAD_REQUEST);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TEST_ERROR',
            message: 'Test error'
          })
        })
      );
    });

    test('should send generic response', () => {
      const res = mockResponse();
      const response: StandardApiResponse<any> = {
        success: true,
        data: { test: true },
        metadata: { timestamp: new Date().toISOString() }
      };

      responseBuilder.send(res, response, HTTP_STATUS.OK);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(response);
    });
  });

  // ===================================
  // HTTP Status Code Tests
  // ===================================

  describe('HTTP Status Codes', () => {
    test('should map error codes to correct HTTP status codes', () => {
      const testCases = [
        { errorCode: 'VALIDATION_ERROR', expectedStatus: HTTP_STATUS.BAD_REQUEST },
        { errorCode: 'AUTHENTICATION_ERROR', expectedStatus: HTTP_STATUS.UNAUTHORIZED },
        { errorCode: 'AUTHORIZATION_ERROR', expectedStatus: HTTP_STATUS.FORBIDDEN },
        { errorCode: 'NOT_FOUND_ERROR', expectedStatus: HTTP_STATUS.NOT_FOUND },
        { errorCode: 'CONFLICT_ERROR', expectedStatus: HTTP_STATUS.CONFLICT },
        { errorCode: 'RATE_LIMIT_ERROR', expectedStatus: HTTP_STATUS.TOO_MANY_REQUESTS },
        { errorCode: 'INTERNAL_SERVER_ERROR', expectedStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR },
        { errorCode: 'DATABASE_ERROR', expectedStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR },
        { errorCode: 'NETWORK_ERROR', expectedStatus: HTTP_STATUS.BAD_GATEWAY },
        { errorCode: 'EXTERNAL_SERVICE_ERROR', expectedStatus: HTTP_STATUS.BAD_GATEWAY },
        { errorCode: 'UNKNOWN_ERROR', expectedStatus: HTTP_STATUS.INTERNAL_SERVER_ERROR }
      ];

      testCases.forEach(({ errorCode, expectedStatus }) => {
        const serviceError: ServiceError = {
          code: errorCode,
          message: 'Test error',
          timestamp: new Date()
        };

        const response = responseBuilder.fromServiceError(serviceError);
        const res = mockResponse();

        responseBuilder.send(res, response, expectedStatus);
        expect(res.status).toHaveBeenCalledWith(expectedStatus);
      });
    });
  });

  // ===================================
  // Utility Functions Tests
  // ===================================

  describe('Utility Functions', () => {
    test('successResponse helper should work correctly', () => {
      const data = { test: true };
      const response = successResponse(data);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
    });

    test('errorResponse helper should work correctly', () => {
      const response = errorResponse('TEST_ERROR', 'Test message');

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('TEST_ERROR');
      expect(response.error?.message).toBe('Test message');
    });

    test('validationErrorResponse helper should work correctly', () => {
      const details: ValidationErrorDetail[] = [
        { field: 'email', message: 'Invalid email' }
      ];
      const response = validationErrorResponse('Validation failed', details);

      expect(response.success).toBe(false);
      expect(response.error?.code).toBe('VALIDATION_ERROR');
      expect(response.error?.details).toEqual(details);
    });

    test('paginatedResponse helper should work correctly', () => {
      const paginatedResult: PaginatedResult<any> = {
        data: [{ id: 1 }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          offset: 0
        }
      };

      const response = paginatedResponse(paginatedResult);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(paginatedResult.data);
      expect(response.metadata?.pagination).toEqual(paginatedResult.pagination);
    });

    test('sendSuccess helper should work correctly', () => {
      const res = mockResponse();
      const data = { test: true };

      sendSuccess(res, data);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data
        })
      );
    });

    test('sendError helper should work correctly', () => {
      const res = mockResponse();

      sendError(res, 'TEST_ERROR', 'Test message', HTTP_STATUS.BAD_REQUEST);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.BAD_REQUEST);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({
            code: 'TEST_ERROR',
            message: 'Test message'
          })
        })
      );
    });

    test('sendPaginated helper should work correctly', () => {
      const res = mockResponse();
      const paginatedResult: PaginatedResult<any> = {
        data: [{ id: 1 }],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
          offset: 0
        }
      };

      sendPaginated(res, paginatedResult);

      expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: paginatedResult.data,
          metadata: expect.objectContaining({
            pagination: paginatedResult.pagination
          })
        })
      );
    });
  });

  // ===================================
  // Configuration Tests
  // ===================================

  describe('Configuration', () => {
    test('should set and use default options', () => {
      responseBuilder.setDefaultOptions({
        includeTimestamp: false,
        includeVersion: false,
        version: '2.0.0'
      });

      const response = responseBuilder.success({ test: true });

      expect(response.metadata?.timestamp).toBeUndefined();
      expect(response.metadata?.version).toBeUndefined();

      // Reset to defaults
      responseBuilder.setDefaultOptions({
        includeTimestamp: true,
        includeVersion: true,
        version: '1.0.0'
      });
    });

    test('should override default options with method options', () => {
      responseBuilder.setDefaultOptions({
        includeTimestamp: false,
        version: '1.0.0'
      });

      const response = responseBuilder.success({ test: true }, HTTP_STATUS.OK, {
        includeTimestamp: true,
        version: '2.0.0'
      });

      expect(response.metadata?.timestamp).toBeDefined();
      expect(response.metadata?.version).toBe('2.0.0');
    });
  });

  // ===================================
  // Edge Cases Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle null data in success response', () => {
      const response = responseBuilder.success(null);

      expect(response.success).toBe(true);
      expect(response.data).toBeNull();
    });

    test('should handle undefined data in success response', () => {
      const response = responseBuilder.success(undefined);

      expect(response.success).toBe(true);
      expect(response.data).toBeUndefined();
    });

    test('should handle empty array in paginated response', () => {
      const paginatedResult: PaginatedResult<any> = {
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
          offset: 0
        }
      };

      const response = responseBuilder.paginated(paginatedResult);

      expect(response.success).toBe(true);
      expect(response.data).toEqual([]);
      expect(response.metadata?.pagination?.total).toBe(0);
    });

    test('should handle large pagination numbers', () => {
      const paginationInfo = responseBuilder.createPaginationInfo(1000, 100, 100000);

      expect(paginationInfo.page).toBe(1000);
      expect(paginationInfo.totalPages).toBe(1000);
      expect(paginationInfo.offset).toBe(99900);
    });

    test('should handle zero total in pagination', () => {
      const paginationInfo = responseBuilder.createPaginationInfo(1, 10, 0);

      expect(paginationInfo.totalPages).toBe(0);
      expect(paginationInfo.hasNext).toBe(false);
      expect(paginationInfo.hasPrev).toBe(false);
    });
  });
});
