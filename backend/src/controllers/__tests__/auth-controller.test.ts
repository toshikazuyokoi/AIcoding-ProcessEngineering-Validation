/**
 * ===================================
 * Authentication Controller Tests
 * ===================================
 * Purpose: Comprehensive testing for AuthController class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  AuthController,
  AuthControllerRequest,
  RegistrationResponse,
  LoginResponse,
  TokenRefreshResponse,
  createAuthController
} from '../auth-controller';
import { ControllerRequest } from '../base-controller';
import { AuthService } from '../../domain/services/auth.service';
import { ResponseBuilder } from '../../utils/response-builder';
import { ErrorHandler } from '../../utils/error-handler';
import { Logger } from '../../utils/logger';
import { RequestValidator } from '../../utils/request-validator';
import { UserRole } from '../../domain/types/user.types';
import { AuthResult, TokenPair } from '../../domain/types/service-interfaces.types';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockAuthService = {
  register: jest.fn(),
  authenticate: jest.fn(),
  refreshToken: jest.fn(),
  verifyToken: jest.fn()
} as unknown as jest.Mocked<AuthService>;

const mockResponseBuilder = {
  sendSuccess: jest.fn(),
  sendError: jest.fn()
} as unknown as jest.Mocked<ResponseBuilder>;

const mockErrorHandler = {
  handleError: jest.fn()
} as unknown as jest.Mocked<ErrorHandler>;

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  setContext: jest.fn(),
  clearContext: jest.fn()
} as unknown as jest.Mocked<Logger>;

const mockValidator = {
  validate: jest.fn()
} as unknown as jest.Mocked<RequestValidator>;

// Mock request, response, and next function
let mockRequest: Partial<AuthControllerRequest>;
let mockResponse: Partial<Response>;
let mockNext: jest.MockedFunction<NextFunction>;

// Test controller instance
let authController: AuthController;

// Test data
const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockAuthResult: AuthResult = {
  user: mockUser,
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  expiresIn: 3600
};

const mockTokenPair: TokenPair = {
  accessToken: 'new-access-token',
  refreshToken: 'new-refresh-token',
  expiresIn: 3600
};

// ===================================
// Test Suite Setup
// ===================================

describe('AuthController', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'POST',
      path: '/auth/register',
      body: {},
      headers: {},
      requestId: 'test-request-id'
    } as Partial<AuthControllerRequest>;

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 200
    } as unknown as Response;

    // Setup mock next function
    mockNext = jest.fn();

    // Create fresh instance
    authController = new AuthController(
      mockAuthService,
      mockResponseBuilder,
      mockErrorHandler,
      mockLogger,
      mockValidator
    );
  });

  // ===================================
  // Phase 1: Constructor and Configuration Tests
  // ===================================

  describe('Phase 1: Constructor and Configuration', () => {
    it('should create instance with provided dependencies', () => {
      expect(authController).toBeInstanceOf(AuthController);
      expect(authController.getControllerName()).toBe('AuthController');
    });

    it('should create instance with auth-specific configuration', () => {
      const config = authController.getConfig();
      
      expect(config.enableLogging).toBe(true);
      expect(config.enableValidation).toBe(true);
      expect(config.serviceName).toBe('auth-api');
      expect(config.enableUserContext).toBe(false); // Auth endpoints don't need user context
    });

    it('should create instance using factory function', () => {
      const controller = createAuthController(mockAuthService);
      
      expect(controller).toBeInstanceOf(AuthController);
      expect(controller.getControllerName()).toBe('AuthController');
    });
  });

  // ===================================
  // Phase 2: Registration Tests
  // ===================================

  describe('Phase 2: Registration', () => {
    it('should handle successful registration', async () => {
      mockAuthService.register.mockResolvedValue(mockAuthResult);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        body: { username: 'testuser', email: 'test@example.com', password: 'password123' }
      } as unknown as ControllerRequest;

      await authController.register(req, mockResponse as Response, mockNext);

      expect(mockAuthService.register).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
        role: UserRole.USER
      });
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });

    it('should handle registration validation errors', async () => {
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 400,
        response: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid input',
            type: 'VALIDATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        }
      });

      const req = {
        body: { email: 'test@example.com' } // Missing username and password
      } as unknown as ControllerRequest;

      await authController.register(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  // ===================================
  // Phase 3: Login Tests
  // ===================================

  describe('Phase 3: Login', () => {
    it('should handle successful login', async () => {
      mockAuthService.authenticate.mockResolvedValue(mockAuthResult);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        body: { email: 'test@example.com', password: 'password123' }
      } as unknown as ControllerRequest;

      await authController.login(req, mockResponse as Response, mockNext);

      expect(mockAuthService.authenticate).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 4: Token Management Tests
  // ===================================

  describe('Phase 4: Token Management', () => {
    it('should handle token refresh', async () => {
      mockAuthService.refreshToken.mockResolvedValue(mockTokenPair);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        body: { refreshToken: 'valid-refresh-token' }
      } as unknown as ControllerRequest;

      await authController.refreshToken(req, mockResponse as Response, mockNext);

      expect(mockAuthService.refreshToken).toHaveBeenCalledWith({
        refreshToken: 'valid-refresh-token'
      });
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 5: Security Tests
  // ===================================

  describe('Phase 5: Security', () => {
    it('should handle logout', async () => {
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {} as unknown as ControllerRequest;

      await authController.logout(req, mockResponse as Response, mockNext);

      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalledWith(
        mockResponse,
        null,
        204,
        undefined
      );
    });
  });
});
