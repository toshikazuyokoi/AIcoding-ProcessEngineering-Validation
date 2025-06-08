/**
 * ===================================
 * User Controller Implementation
 * ===================================
 * Purpose: HTTP user endpoints for user profile and account management
 * Features:
 * - User profile management
 * - Account settings
 * - Profile updates
 * - Account deletion
 * - BaseController integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { BaseController, ControllerRequest } from './base-controller';
import { UserService, UserSearchFilters, CreateUserRequest, UpdateUserRequest } from '../domain/services/user.service';
import { ResponseBuilder } from '../utils/response-builder';
import { ErrorHandler } from '../utils/error-handler';
import { Logger } from '../utils/logger';
import { RequestValidator } from '../utils/request-validator';
import { UserRole } from '../domain/entities/user.entity';

// ===================================
// User Controller Types
// ===================================

/**
 * Profile update request interface
 */
export interface ProfileUpdateRequest {
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * User controller request interface
 */
export interface UserControllerRequest extends ControllerRequest {
  body: {
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  };
  query: { [key: string]: any };
  params: {
    id?: string;
  };
}

/**
 * User profile response interface
 */
export interface UserProfileResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Profile update response interface
 */
export interface ProfileUpdateResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    updatedAt: Date;
  };
  message: string;
}

// ===================================
// UserController Class
// ===================================

/**
 * User Controller
 * 
 * Handles HTTP user endpoints:
 * - User profile management
 * - Account settings
 * - Profile updates
 * - Account deletion
 */
export class UserController extends BaseController {
  private userService: UserService;

  /**
   * Constructor
   */
  constructor(
    userService: UserService,
    responseBuilder?: ResponseBuilder,
    errorHandler?: ErrorHandler,
    logger?: Logger,
    validator?: RequestValidator
  ) {
    super(
      'UserController',
      responseBuilder,
      errorHandler,
      logger,
      validator,
      {
        enableLogging: true,
        enableValidation: true,
        enableErrorHandling: true,
        serviceName: 'user-api',
        enableRequestId: true,
        enableUserContext: true,
        enablePerformanceLogging: true
      }
    );

    this.userService = userService;
  }

  /**
   * Get user profile endpoint
   * GET /api/users/profile
   */
  public getProfile = this.wrapAction('getProfile', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Get user profile from service
    const user = await this.userService.getUserById(req.user.id);

    // Prepare response (exclude sensitive data)
    const response: UserProfileResponse = {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    };

    this.sendSuccess(res, response, 'User profile retrieved successfully');
  });

  /**
   * Update user profile endpoint
   * PUT /api/users/profile
   */
  public updateProfile = this.wrapAction('updateProfile', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Extract update data
    const { username, email, currentPassword, newPassword } = req.body;

    // Validate that at least one field is provided
    if (!username && !email && !newPassword) {
      this.sendError(res, new Error('At least one field (username, email, or newPassword) must be provided'), 400);
      return;
    }

    // Validate password change requirements
    if (newPassword && !currentPassword) {
      this.sendError(res, new Error('Current password is required when changing password'), 400);
      return;
    }

    // Validate username length
    if (username !== undefined) {
      if (username.trim().length === 0) {
        this.sendError(res, new Error('Username cannot be empty'), 400);
        return;
      }
      if (username.length < 3 || username.length > 50) {
        this.sendError(res, new Error('Username must be between 3 and 50 characters'), 400);
        return;
      }
    }

    // Validate email format
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        this.sendError(res, new Error('Invalid email format'), 400);
        return;
      }
    }

    // Validate new password strength
    if (newPassword !== undefined) {
      if (newPassword.length < 8) {
        this.sendError(res, new Error('New password must be at least 8 characters long'), 400);
        return;
      }
    }

    // Prepare update request
    const updateRequest: UpdateUserRequest = {};
    
    if (username !== undefined) updateRequest.username = username.trim();
    if (email !== undefined) updateRequest.email = email.trim().toLowerCase();
    if (newPassword !== undefined) updateRequest.password = newPassword;

    // Update user profile
    const updatedUser = await this.userService.updateUser(req.user.id, updateRequest);

    // Prepare response
    const response: ProfileUpdateResponse = {
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        updatedAt: updatedUser.updatedAt
      },
      message: 'Profile updated successfully'
    };

    this.sendSuccess(res, response, 'Profile updated successfully');
  });

  /**
   * Delete user account endpoint
   * DELETE /api/users/account
   */
  public deleteAccount = this.wrapAction('deleteAccount', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Delete user account (logical deletion)
    await this.userService.deleteUser(req.user.id);

    this.sendSuccess(res, null, 'Account deleted successfully', 204);
  });
}

// ===================================
// Factory Function
// ===================================

/**
 * Create UserController instance
 */
export const createUserController = (
  userService: UserService,
  responseBuilder?: ResponseBuilder,
  errorHandler?: ErrorHandler,
  logger?: Logger,
  validator?: RequestValidator
): UserController => {
  return new UserController(userService, responseBuilder, errorHandler, logger, validator);
};

// Export default instance factory
export default createUserController;
