/**
 * ===================================
 * Common Types Test Suite
 * ===================================
 * Purpose: Comprehensive tests for common type definitions
 * Features:
 * - Type guard function testing
 * - Interface validation testing
 * - Enum value testing
 * - Utility type testing
 * - Constants validation
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  // Basic Types
  ID,
  Timestamp,
  Nullable,
  Optional,
  Result,
  
  // Enums
  SortDirection,
  ApiResponseStatus,
  Environment,
  LogLevel,
  ValidationRuleType,
  FileType,
  NotificationType,
  NotificationChannel,
  AuditActionType,
  HealthCheckStatus,
  JobStatus,
  JobPriority,
  RateLimitWindow,
  
  // Interfaces
  PaginationParams,
  PaginationInfo,
  PaginatedResult,
  SortOptions,
  MultiSortOptions,
  SearchParams,
  DateRangeFilter,
  NumericRangeFilter,
  BaseFilter,
  BaseApiResponse,
  SuccessApiResponse,
  ErrorApiResponse,
  ValidationErrorDetail,
  ValidationErrorResponse,
  TimePeriod,
  DataPoint,
  TimeSeriesDataPoint,
  StatisticalSummary,
  TrendAnalysis,
  FeatureFlag,
  ApplicationSettings,
  ValidationRule,
  FieldValidation,
  ValidationSchema,
  FileInfo,
  FileUploadOptions,
  Notification,
  AuditLogEntry,
  PerformanceMetric,
  HealthCheckResult,
  SystemHealth,
  CacheOptions,
  CacheEntry,
  Job,
  RateLimitConfig,
  RateLimitStatus,
  
  // Type Guards
  isDefined,
  isString,
  isNumber,
  isBoolean,
  isDate,
  isArray,
  isNonEmptyArray,
  isObject,
  isEmptyObject,
  isSuccessResult,
  isErrorResult,
  
  // Utility Types
  DeepPartial,
  DeepReadonly,
  NonEmptyArray,
  
  // Constants
  DEFAULT_PAGINATION,
  DEFAULT_SORT,
  HTTP_STATUS,
  REGEX_PATTERNS,
  TIME_CONSTANTS
} from '../../../src/domain/types/common.types';

describe('Common Types', () => {
  // ===================================
  // Basic Type Tests
  // ===================================

  describe('Basic Types', () => {
    test('ID should be string type', () => {
      const id: ID = 'test-id-123';
      expect(typeof id).toBe('string');
    });

    test('Timestamp should be Date type', () => {
      const timestamp: Timestamp = new Date();
      expect(timestamp).toBeInstanceOf(Date);
    });

    test('Nullable should allow null', () => {
      const nullableString: Nullable<string> = null;
      const validString: Nullable<string> = 'test';
      
      expect(nullableString).toBeNull();
      expect(validString).toBe('test');
    });

    test('Optional should allow undefined', () => {
      const optionalString: Optional<string> = undefined;
      const validString: Optional<string> = 'test';
      
      expect(optionalString).toBeUndefined();
      expect(validString).toBe('test');
    });

    test('Result should handle success and error cases', () => {
      const successResult: Result<string> = { success: true, data: 'test' };
      const errorResult: Result<string> = { success: false, error: new Error('test error') };
      
      expect(successResult.success).toBe(true);
      expect(errorResult.success).toBe(false);
    });
  });

  // ===================================
  // Enum Tests
  // ===================================

  describe('Enum Values', () => {
    describe('SortDirection', () => {
      test('should have correct values', () => {
        expect(SortDirection.ASC).toBe('asc');
        expect(SortDirection.DESC).toBe('desc');
      });

      test('should have exactly 2 values', () => {
        const values = Object.values(SortDirection);
        expect(values).toHaveLength(2);
      });
    });

    describe('ApiResponseStatus', () => {
      test('should have correct values', () => {
        expect(ApiResponseStatus.SUCCESS).toBe('success');
        expect(ApiResponseStatus.ERROR).toBe('error');
        expect(ApiResponseStatus.WARNING).toBe('warning');
        expect(ApiResponseStatus.INFO).toBe('info');
      });

      test('should have exactly 4 values', () => {
        const values = Object.values(ApiResponseStatus);
        expect(values).toHaveLength(4);
      });
    });

    describe('Environment', () => {
      test('should have correct values', () => {
        expect(Environment.DEVELOPMENT).toBe('development');
        expect(Environment.TESTING).toBe('testing');
        expect(Environment.STAGING).toBe('staging');
        expect(Environment.PRODUCTION).toBe('production');
      });

      test('should have exactly 4 values', () => {
        const values = Object.values(Environment);
        expect(values).toHaveLength(4);
      });
    });

    describe('LogLevel', () => {
      test('should have correct values', () => {
        expect(LogLevel.ERROR).toBe('error');
        expect(LogLevel.WARN).toBe('warn');
        expect(LogLevel.INFO).toBe('info');
        expect(LogLevel.DEBUG).toBe('debug');
        expect(LogLevel.TRACE).toBe('trace');
      });

      test('should have exactly 5 values', () => {
        const values = Object.values(LogLevel);
        expect(values).toHaveLength(5);
      });
    });

    describe('FileType', () => {
      test('should have correct values', () => {
        expect(FileType.IMAGE).toBe('image');
        expect(FileType.DOCUMENT).toBe('document');
        expect(FileType.VIDEO).toBe('video');
        expect(FileType.AUDIO).toBe('audio');
        expect(FileType.ARCHIVE).toBe('archive');
        expect(FileType.OTHER).toBe('other');
      });

      test('should have exactly 6 values', () => {
        const values = Object.values(FileType);
        expect(values).toHaveLength(6);
      });
    });

    describe('JobStatus', () => {
      test('should have correct values', () => {
        expect(JobStatus.PENDING).toBe('pending');
        expect(JobStatus.PROCESSING).toBe('processing');
        expect(JobStatus.COMPLETED).toBe('completed');
        expect(JobStatus.FAILED).toBe('failed');
        expect(JobStatus.CANCELLED).toBe('cancelled');
        expect(JobStatus.RETRYING).toBe('retrying');
      });

      test('should have exactly 6 values', () => {
        const values = Object.values(JobStatus);
        expect(values).toHaveLength(6);
      });
    });
  });

  // ===================================
  // Interface Structure Tests
  // ===================================

  describe('Interface Structures', () => {
    describe('PaginationInfo', () => {
      test('should have all required properties', () => {
        const pagination: PaginationInfo = {
          page: 1,
          limit: 20,
          total: 100,
          totalPages: 5,
          hasNext: true,
          hasPrev: false,
          offset: 0
        };

        expect(pagination.page).toBe(1);
        expect(pagination.limit).toBe(20);
        expect(pagination.total).toBe(100);
        expect(pagination.totalPages).toBe(5);
        expect(pagination.hasNext).toBe(true);
        expect(pagination.hasPrev).toBe(false);
        expect(pagination.offset).toBe(0);
      });

      test('should calculate pagination correctly', () => {
        const pagination: PaginationInfo = {
          page: 3,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasNext: false,
          hasPrev: true,
          offset: 20
        };

        expect(pagination.offset).toBe((pagination.page - 1) * pagination.limit);
        expect(pagination.totalPages).toBe(Math.ceil(pagination.total / pagination.limit));
      });
    });

    describe('SortOptions', () => {
      test('should have required properties', () => {
        const sortOptions: SortOptions = {
          field: 'createdAt',
          direction: SortDirection.DESC
        };

        expect(sortOptions.field).toBe('createdAt');
        expect(sortOptions.direction).toBe(SortDirection.DESC);
      });
    });

    describe('SearchParams', () => {
      test('should allow all optional properties', () => {
        const searchParams: SearchParams = {
          query: 'test search',
          fields: ['title', 'description'],
          caseSensitive: false,
          exactMatch: true
        };

        expect(searchParams.query).toBe('test search');
        expect(searchParams.fields).toHaveLength(2);
        expect(searchParams.caseSensitive).toBe(false);
        expect(searchParams.exactMatch).toBe(true);
      });

      test('should work with minimal properties', () => {
        const searchParams: SearchParams = {};
        
        expect(searchParams.query).toBeUndefined();
        expect(searchParams.fields).toBeUndefined();
      });
    });

    describe('BaseApiResponse', () => {
      test('should have required properties', () => {
        const response: BaseApiResponse = {
          status: ApiResponseStatus.SUCCESS,
          timestamp: new Date()
        };

        expect(response.status).toBe(ApiResponseStatus.SUCCESS);
        expect(response.timestamp).toBeInstanceOf(Date);
      });

      test('should allow optional properties', () => {
        const response: BaseApiResponse<string> = {
          status: ApiResponseStatus.SUCCESS,
          message: 'Operation successful',
          data: 'test data',
          timestamp: new Date(),
          requestId: 'req-123'
        };

        expect(response.message).toBe('Operation successful');
        expect(response.data).toBe('test data');
        expect(response.requestId).toBe('req-123');
      });
    });

    describe('ValidationErrorDetail', () => {
      test('should have required properties', () => {
        const errorDetail: ValidationErrorDetail = {
          field: 'email',
          message: 'Invalid email format'
        };

        expect(errorDetail.field).toBe('email');
        expect(errorDetail.message).toBe('Invalid email format');
      });

      test('should allow optional properties', () => {
        const errorDetail: ValidationErrorDetail = {
          field: 'age',
          message: 'Age must be between 18 and 100',
          value: 15,
          constraint: 'min:18,max:100'
        };

        expect(errorDetail.value).toBe(15);
        expect(errorDetail.constraint).toBe('min:18,max:100');
      });
    });

    describe('StatisticalSummary', () => {
      test('should have all required properties', () => {
        const stats: StatisticalSummary = {
          count: 100,
          sum: 5000,
          average: 50,
          min: 10,
          max: 90
        };

        expect(stats.count).toBe(100);
        expect(stats.sum).toBe(5000);
        expect(stats.average).toBe(50);
        expect(stats.min).toBe(10);
        expect(stats.max).toBe(90);
      });

      test('should allow optional properties', () => {
        const stats: StatisticalSummary = {
          count: 50,
          sum: 2500,
          average: 50,
          min: 20,
          max: 80,
          median: 45,
          standardDeviation: 15.5
        };

        expect(stats.median).toBe(45);
        expect(stats.standardDeviation).toBe(15.5);
      });
    });

    describe('FeatureFlag', () => {
      test('should have required properties', () => {
        const featureFlag: FeatureFlag = {
          name: 'new-dashboard',
          enabled: true
        };

        expect(featureFlag.name).toBe('new-dashboard');
        expect(featureFlag.enabled).toBe(true);
      });

      test('should allow optional properties', () => {
        const featureFlag: FeatureFlag = {
          name: 'beta-feature',
          enabled: true,
          description: 'Beta feature for testing',
          environment: [Environment.DEVELOPMENT, Environment.STAGING],
          rolloutPercentage: 25
        };

        expect(featureFlag.description).toBe('Beta feature for testing');
        expect(featureFlag.environment).toHaveLength(2);
        expect(featureFlag.rolloutPercentage).toBe(25);
      });
    });

    describe('Job', () => {
      test('should have all required properties', () => {
        const job: Job = {
          id: 'job-123',
          type: 'email-send',
          data: { to: 'test@example.com', subject: 'Test' },
          status: JobStatus.PENDING,
          priority: JobPriority.NORMAL,
          attempts: 0,
          maxAttempts: 3,
          createdAt: new Date()
        };

        expect(job.id).toBe('job-123');
        expect(job.type).toBe('email-send');
        expect(job.status).toBe(JobStatus.PENDING);
        expect(job.priority).toBe(JobPriority.NORMAL);
        expect(job.attempts).toBe(0);
        expect(job.maxAttempts).toBe(3);
      });

      test('should allow optional properties', () => {
        const job: Job = {
          id: 'job-456',
          type: 'data-export',
          data: { format: 'csv' },
          status: JobStatus.COMPLETED,
          priority: JobPriority.HIGH,
          attempts: 1,
          maxAttempts: 3,
          delay: 5000,
          createdAt: new Date(),
          startedAt: new Date(),
          completedAt: new Date(),
          result: { fileUrl: 'https://example.com/export.csv' }
        };

        expect(job.delay).toBe(5000);
        expect(job.startedAt).toBeInstanceOf(Date);
        expect(job.completedAt).toBeInstanceOf(Date);
        expect(job.result).toBeDefined();
      });
    });
  });

  // ===================================
  // Type Guard Tests
  // ===================================

  describe('Type Guards', () => {
    describe('isDefined', () => {
      test('should return true for defined values', () => {
        expect(isDefined('test')).toBe(true);
        expect(isDefined(0)).toBe(true);
        expect(isDefined(false)).toBe(true);
        expect(isDefined([])).toBe(true);
        expect(isDefined({})).toBe(true);
      });

      test('should return false for undefined and null', () => {
        expect(isDefined(undefined)).toBe(false);
        expect(isDefined(null)).toBe(false);
      });
    });

    describe('isString', () => {
      test('should return true for strings', () => {
        expect(isString('test')).toBe(true);
        expect(isString('')).toBe(true);
        expect(isString('123')).toBe(true);
      });

      test('should return false for non-strings', () => {
        expect(isString(123)).toBe(false);
        expect(isString(true)).toBe(false);
        expect(isString([])).toBe(false);
        expect(isString({})).toBe(false);
        expect(isString(null)).toBe(false);
        expect(isString(undefined)).toBe(false);
      });
    });

    describe('isNumber', () => {
      test('should return true for valid numbers', () => {
        expect(isNumber(123)).toBe(true);
        expect(isNumber(0)).toBe(true);
        expect(isNumber(-456)).toBe(true);
        expect(isNumber(3.14)).toBe(true);
      });

      test('should return false for invalid numbers and non-numbers', () => {
        expect(isNumber(NaN)).toBe(false);
        expect(isNumber('123')).toBe(false);
        expect(isNumber(true)).toBe(false);
        expect(isNumber([])).toBe(false);
        expect(isNumber({})).toBe(false);
        expect(isNumber(null)).toBe(false);
        expect(isNumber(undefined)).toBe(false);
      });
    });

    describe('isBoolean', () => {
      test('should return true for booleans', () => {
        expect(isBoolean(true)).toBe(true);
        expect(isBoolean(false)).toBe(true);
      });

      test('should return false for non-booleans', () => {
        expect(isBoolean(1)).toBe(false);
        expect(isBoolean(0)).toBe(false);
        expect(isBoolean('true')).toBe(false);
        expect(isBoolean('false')).toBe(false);
        expect(isBoolean([])).toBe(false);
        expect(isBoolean({})).toBe(false);
        expect(isBoolean(null)).toBe(false);
        expect(isBoolean(undefined)).toBe(false);
      });
    });

    describe('isDate', () => {
      test('should return true for valid dates', () => {
        expect(isDate(new Date())).toBe(true);
        expect(isDate(new Date('2024-01-01'))).toBe(true);
      });

      test('should return false for invalid dates and non-dates', () => {
        expect(isDate(new Date('invalid'))).toBe(false);
        expect(isDate('2024-01-01')).toBe(false);
        expect(isDate(1640995200000)).toBe(false);
        expect(isDate({})).toBe(false);
        expect(isDate(null)).toBe(false);
        expect(isDate(undefined)).toBe(false);
      });
    });

    describe('isArray', () => {
      test('should return true for arrays', () => {
        expect(isArray([])).toBe(true);
        expect(isArray([1, 2, 3])).toBe(true);
        expect(isArray(['a', 'b', 'c'])).toBe(true);
      });

      test('should return false for non-arrays', () => {
        expect(isArray('test')).toBe(false);
        expect(isArray(123)).toBe(false);
        expect(isArray({})).toBe(false);
        expect(isArray(null)).toBe(false);
        expect(isArray(undefined)).toBe(false);
      });
    });

    describe('isNonEmptyArray', () => {
      test('should return true for non-empty arrays', () => {
        expect(isNonEmptyArray([1])).toBe(true);
        expect(isNonEmptyArray([1, 2, 3])).toBe(true);
        expect(isNonEmptyArray(['a'])).toBe(true);
      });

      test('should return false for empty arrays and non-arrays', () => {
        expect(isNonEmptyArray([])).toBe(false);
        expect(isNonEmptyArray('test')).toBe(false);
        expect(isNonEmptyArray(123)).toBe(false);
        expect(isNonEmptyArray({})).toBe(false);
        expect(isNonEmptyArray(null)).toBe(false);
        expect(isNonEmptyArray(undefined)).toBe(false);
      });
    });

    describe('isObject', () => {
      test('should return true for objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject({ a: 1 })).toBe(true);
        expect(isObject({ nested: { value: true } })).toBe(true);
      });

      test('should return false for non-objects', () => {
        expect(isObject([])).toBe(false);
        expect(isObject('test')).toBe(false);
        expect(isObject(123)).toBe(false);
        expect(isObject(true)).toBe(false);
        expect(isObject(null)).toBe(false);
        expect(isObject(undefined)).toBe(false);
      });
    });

    describe('isEmptyObject', () => {
      test('should return true for empty objects', () => {
        expect(isEmptyObject({})).toBe(true);
      });

      test('should return false for non-empty objects and non-objects', () => {
        expect(isEmptyObject({ a: 1 })).toBe(false);
        expect(isEmptyObject([])).toBe(false);
        expect(isEmptyObject('test')).toBe(false);
        expect(isEmptyObject(null)).toBe(false);
        expect(isEmptyObject(undefined)).toBe(false);
      });
    });

    describe('Result type guards', () => {
      test('isSuccessResult should identify success results', () => {
        const successResult: Result<string> = { success: true, data: 'test' };
        const errorResult: Result<string> = { success: false, error: new Error('test') };

        expect(isSuccessResult(successResult)).toBe(true);
        expect(isSuccessResult(errorResult)).toBe(false);
      });

      test('isErrorResult should identify error results', () => {
        const successResult: Result<string> = { success: true, data: 'test' };
        const errorResult: Result<string> = { success: false, error: new Error('test') };

        expect(isErrorResult(successResult)).toBe(false);
        expect(isErrorResult(errorResult)).toBe(true);
      });
    });
  });

  // ===================================
  // Constants Tests
  // ===================================

  describe('Constants', () => {
    describe('DEFAULT_PAGINATION', () => {
      test('should have correct default values', () => {
        expect(DEFAULT_PAGINATION.PAGE).toBe(1);
        expect(DEFAULT_PAGINATION.LIMIT).toBe(20);
        expect(DEFAULT_PAGINATION.MAX_LIMIT).toBe(100);
      });
    });

    describe('DEFAULT_SORT', () => {
      test('should have correct default values', () => {
        expect(DEFAULT_SORT.DIRECTION).toBe(SortDirection.ASC);
        expect(DEFAULT_SORT.FIELD).toBe('createdAt');
      });
    });

    describe('HTTP_STATUS', () => {
      test('should have correct status codes', () => {
        expect(HTTP_STATUS.OK).toBe(200);
        expect(HTTP_STATUS.CREATED).toBe(201);
        expect(HTTP_STATUS.BAD_REQUEST).toBe(400);
        expect(HTTP_STATUS.UNAUTHORIZED).toBe(401);
        expect(HTTP_STATUS.NOT_FOUND).toBe(404);
        expect(HTTP_STATUS.INTERNAL_SERVER_ERROR).toBe(500);
      });
    });

    describe('REGEX_PATTERNS', () => {
      test('EMAIL pattern should validate emails correctly', () => {
        expect(REGEX_PATTERNS.EMAIL.test('test@example.com')).toBe(true);
        expect(REGEX_PATTERNS.EMAIL.test('user.name@domain.co.uk')).toBe(true);
        expect(REGEX_PATTERNS.EMAIL.test('invalid-email')).toBe(false);
        expect(REGEX_PATTERNS.EMAIL.test('@domain.com')).toBe(false);
      });

      test('HEX_COLOR pattern should validate hex colors correctly', () => {
        expect(REGEX_PATTERNS.HEX_COLOR.test('#FF0000')).toBe(true);
        expect(REGEX_PATTERNS.HEX_COLOR.test('#00ff00')).toBe(true);
        expect(REGEX_PATTERNS.HEX_COLOR.test('#123ABC')).toBe(true);
        expect(REGEX_PATTERNS.HEX_COLOR.test('FF0000')).toBe(false);
        expect(REGEX_PATTERNS.HEX_COLOR.test('#GG0000')).toBe(false);
        expect(REGEX_PATTERNS.HEX_COLOR.test('#FF')).toBe(false);
      });

      test('URL pattern should validate URLs correctly', () => {
        expect(REGEX_PATTERNS.URL.test('https://example.com')).toBe(true);
        expect(REGEX_PATTERNS.URL.test('http://www.example.com/path')).toBe(true);
        expect(REGEX_PATTERNS.URL.test('https://sub.domain.com/path?query=value')).toBe(true);
        expect(REGEX_PATTERNS.URL.test('invalid-url')).toBe(false);
        expect(REGEX_PATTERNS.URL.test('ftp://example.com')).toBe(false);
      });

      test('PASSWORD_STRONG pattern should validate strong passwords', () => {
        expect(REGEX_PATTERNS.PASSWORD_STRONG.test('StrongPass123!')).toBe(true);
        expect(REGEX_PATTERNS.PASSWORD_STRONG.test('AnotherGood1@')).toBe(true);
        expect(REGEX_PATTERNS.PASSWORD_STRONG.test('weak')).toBe(false);
        expect(REGEX_PATTERNS.PASSWORD_STRONG.test('NoNumbers!')).toBe(false);
        expect(REGEX_PATTERNS.PASSWORD_STRONG.test('nonumbers123')).toBe(false);
      });
    });

    describe('TIME_CONSTANTS', () => {
      test('should have correct time values in milliseconds', () => {
        expect(TIME_CONSTANTS.SECOND).toBe(1000);
        expect(TIME_CONSTANTS.MINUTE).toBe(60 * 1000);
        expect(TIME_CONSTANTS.HOUR).toBe(60 * 60 * 1000);
        expect(TIME_CONSTANTS.DAY).toBe(24 * 60 * 60 * 1000);
        expect(TIME_CONSTANTS.WEEK).toBe(7 * 24 * 60 * 60 * 1000);
      });
    });
  });

  // ===================================
  // Utility Type Tests
  // ===================================

  describe('Utility Types', () => {
    describe('DeepPartial', () => {
      test('should make all properties optional recursively', () => {
        interface TestInterface {
          name: string;
          nested: {
            value: number;
            deep: {
              flag: boolean;
            };
          };
        }

        const partialTest: DeepPartial<TestInterface> = {
          name: 'test',
          nested: {
            deep: {
              flag: true
            }
          }
        };

        expect(partialTest.name).toBe('test');
        expect(partialTest.nested?.deep?.flag).toBe(true);
        expect(partialTest.nested?.value).toBeUndefined();
      });
    });

    describe('NonEmptyArray', () => {
      test('should ensure array has at least one element', () => {
        const nonEmptyNumbers: NonEmptyArray<number> = [1, 2, 3];
        const singleElement: NonEmptyArray<string> = ['test'];

        expect(nonEmptyNumbers).toHaveLength(3);
        expect(singleElement).toHaveLength(1);
        expect(nonEmptyNumbers[0]).toBe(1);
        expect(singleElement[0]).toBe('test');
      });
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration Tests', () => {
    test('should work together in realistic API response scenario', () => {
      // Create a paginated API response
      const users = [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
        { id: '3', name: 'User 3' }
      ];

      const paginationInfo: PaginationInfo = {
        page: 1,
        limit: 20,
        total: 3,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
        offset: 0
      };

      const paginatedResult: PaginatedResult<typeof users[0]> = {
        data: users,
        pagination: paginationInfo
      };

      const apiResponse: SuccessApiResponse<PaginatedResult<typeof users[0]>> = {
        status: ApiResponseStatus.SUCCESS,
        data: paginatedResult,
        timestamp: new Date(),
        requestId: 'req-123'
      };

      expect(apiResponse.status).toBe(ApiResponseStatus.SUCCESS);
      expect(apiResponse.data.data).toHaveLength(3);
      expect(apiResponse.data.pagination.total).toBe(3);
      expect(isSuccessResult({ success: true, data: apiResponse })).toBe(true);
    });

    test('should handle validation error scenario', () => {
      const validationErrors: ValidationErrorDetail[] = [
        {
          field: 'email',
          message: 'Invalid email format',
          value: 'invalid-email',
          constraint: 'email'
        },
        {
          field: 'password',
          message: 'Password too weak',
          value: '123',
          constraint: 'strong-password'
        }
      ];

      const errorResponse: ValidationErrorResponse = {
        status: ApiResponseStatus.ERROR,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: validationErrors
        },
        timestamp: new Date()
      };

      expect(errorResponse.status).toBe(ApiResponseStatus.ERROR);
      expect(errorResponse.error.details).toHaveLength(2);
      expect(errorResponse.error.details[0].field).toBe('email');
      expect(isErrorResult({ success: false, error: errorResponse })).toBe(true);
    });

    test('should handle job processing workflow', () => {
      const job: Job = {
        id: 'job-123',
        type: 'email-send',
        data: { to: 'user@example.com', subject: 'Welcome' },
        status: JobStatus.PENDING,
        priority: JobPriority.HIGH,
        attempts: 0,
        maxAttempts: 3,
        createdAt: new Date()
      };

      // Simulate job processing
      const processingJob: Job = {
        ...job,
        status: JobStatus.PROCESSING,
        startedAt: new Date(),
        attempts: 1
      };

      // Simulate job completion
      const completedJob: Job = {
        ...processingJob,
        status: JobStatus.COMPLETED,
        completedAt: new Date(),
        result: { messageId: 'msg-456' }
      };

      expect(job.status).toBe(JobStatus.PENDING);
      expect(processingJob.status).toBe(JobStatus.PROCESSING);
      expect(completedJob.status).toBe(JobStatus.COMPLETED);
      expect(completedJob.result?.messageId).toBe('msg-456');
    });

    test('should handle statistical analysis workflow', () => {
      const dataPoints: DataPoint[] = [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
        { x: 3, y: 15 },
        { x: 4, y: 25 },
        { x: 5, y: 30 }
      ];

      const values = dataPoints.map(point => point.y);
      const stats: StatisticalSummary = {
        count: values.length,
        sum: values.reduce((a, b) => a + b, 0),
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values)
      };

      const trend: TrendAnalysis = {
        direction: 'increasing',
        percentage: 200, // 300% increase from 10 to 30
        significance: 'high'
      };

      expect(stats.count).toBe(5);
      expect(stats.sum).toBe(100);
      expect(stats.average).toBe(20);
      expect(stats.min).toBe(10);
      expect(stats.max).toBe(30);
      expect(trend.direction).toBe('increasing');
      expect(trend.significance).toBe('high');
    });
  });
});
