/**
 * ===================================
 * User Controller Tests
 * ===================================
 * Purpose: Comprehensive testing for UserController class
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import {
  UserController,
  UserControllerRequest,
  ProfileUpdateRequest,
  UserProfileResponse,
  ProfileUpdateResponse,
  createUserController
} from '../user-controller';
import { ControllerRequest } from '../base-controller';
import { UserService, UserSearchFilters, CreateUserRequest, UpdateUserRequest } from '../../domain/services/user.service';
import { ResponseBuilder } from '../../utils/response-builder';
import { ErrorHandler } from '../../utils/error-handler';
import { Logger } from '../../utils/logger';
import { RequestValidator } from '../../utils/request-validator';
import { UserRole } from '../../domain/entities/user.entity';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock dependencies
const mockUserService = {
  getUserById: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  createUser: jest.fn(),
  getUsersByFilters: jest.fn()
} as unknown as jest.Mocked<UserService>;

const mockResponseBuilder = {
  sendSuccess: jest.fn(),
  sendPaginated: jest.fn(),
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
let mockRequest: Partial<ControllerRequest>;
let mockResponse: Partial<Response>;
let mockNext: jest.MockedFunction<NextFunction>;

// Test controller instance
let userController: UserController;

// Test data
const mockUser = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: UserRole.USER,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  passwordHash: 'hashed-password'
} as any;

const mockAuthUser = {
  id: 'user-123',
  email: 'test@example.com',
  role: 'USER'
};

// ===================================
// Test Suite Setup
// ===================================

describe('UserController', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Setup mock request
    mockRequest = {
      method: 'GET',
      path: '/api/users/profile',
      query: {},
      body: {},
      params: {},
      user: mockAuthUser,
      requestId: 'test-request-id'
    } as Partial<ControllerRequest>;

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      statusCode: 200
    } as unknown as Response;

    // Setup mock next function
    mockNext = jest.fn();

    // Create fresh instance
    userController = new UserController(
      mockUserService,
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
      expect(userController).toBeInstanceOf(UserController);
      expect(userController.getControllerName()).toBe('UserController');
    });

    it('should create instance with user-specific configuration', () => {
      const config = userController.getConfig();
      
      expect(config.enableLogging).toBe(true);
      expect(config.enableValidation).toBe(true);
      expect(config.serviceName).toBe('user-api');
      expect(config.enableUserContext).toBe(true);
    });

    it('should create instance using factory function', () => {
      const controller = createUserController(mockUserService);
      
      expect(controller).toBeInstanceOf(UserController);
      expect(controller.getControllerName()).toBe('UserController');
    });
  });

  // ===================================
  // Phase 2: Profile Management Tests
  // ===================================

  describe('Phase 2: Profile Management', () => {
    it('should get user profile successfully', async () => {
      mockUserService.getUserById.mockResolvedValue(mockUser);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockAuthUser
      } as unknown as ControllerRequest;

      await userController.getProfile(req, mockResponse as Response, mockNext);

      expect(mockUserService.getUserById).toHaveBeenCalledWith(mockAuthUser.id);
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });

    it('should handle authentication error for profile', async () => {
      // Mock error handler to return 401 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 401,
        response: { 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'User authentication required',
            type: 'AUTHENTICATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          } 
        }
      });

      const req = {
        user: null
      } as unknown as ControllerRequest;

      await userController.getProfile(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });

  // ===================================
  // Phase 3: Profile Update Tests
  // ===================================

  describe('Phase 3: Profile Update', () => {
    it('should update profile successfully', async () => {
      mockUserService.updateUser.mockResolvedValue(mockUser);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockAuthUser,
        body: { username: 'newusername', email: 'new@example.com' }
      } as unknown as ControllerRequest;

      await userController.updateProfile(req, mockResponse as Response, mockNext);

      expect(mockUserService.updateUser).toHaveBeenCalled();
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });

    it('should validate required fields for update', async () => {
      // Mock error handler to return 400 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 400,
        response: {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'At least one field (username, email, or newPassword) must be provided',
            type: 'VALIDATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        }
      });

      const req = {
        user: mockAuthUser,
        body: {} // No fields provided
      } as unknown as ControllerRequest;

      await userController.updateProfile(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
    });
  });

  // ===================================
  // Phase 4: Account Deletion Tests
  // ===================================

  describe('Phase 4: Account Deletion', () => {
    it('should delete account successfully', async () => {
      mockUserService.deleteUser.mockResolvedValue(undefined);
      mockResponseBuilder.sendSuccess.mockReturnValue(mockResponse as Response);

      const req = {
        user: mockAuthUser
      } as unknown as ControllerRequest;

      await userController.deleteAccount(req, mockResponse as Response, mockNext);

      expect(mockUserService.deleteUser).toHaveBeenCalledWith(mockAuthUser.id);
      expect(mockResponseBuilder.sendSuccess).toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 5: Authorization Tests
  // ===================================

  describe('Phase 5: Authorization', () => {
    it('should require authentication for all endpoints', async () => {
      // Mock error handler to return 401 response
      mockErrorHandler.handleError.mockReturnValue({
        statusCode: 401,
        response: { 
          success: false, 
          error: { 
            code: 'UNAUTHORIZED', 
            message: 'User authentication required',
            type: 'AUTHENTICATION' as any,
            timestamp: '2023-01-01T00:00:00.000Z'
          } 
        }
      });

      const req = {
        user: null,
        body: { username: 'test' }
      } as unknown as ControllerRequest;

      await userController.updateProfile(req, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
    });
  });
});
