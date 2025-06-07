/**
 * ===================================
 * Authentication Controller Implementation
 * ===================================
 * Purpose: HTTP authentication endpoints for user management
 * Features:
 * - User registration and login
 * - JWT token management
 * - Secure authentication flow
 * - Input validation and error handling
 * - BaseController integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { BaseController, ControllerRequest } from './base-controller';
import { AuthService } from '../domain/services/auth.service';
import { ResponseBuilder } from '../utils/response-builder';
import { ErrorHandler } from '../utils/error-handler';
import { Logger } from '../utils/logger';
import { RequestValidator } from '../utils/request-validator';
import {
  AuthResult,
  TokenPair
} from '../domain/types/service-interfaces.types';
import { UserRole } from '../domain/types/user.types';

// ===================================
// Authentication Controller Types
// ===================================

/**
 * Registration request interface
 */
export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Refresh token request interface
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Authentication request interface
 */
export interface AuthControllerRequest extends ControllerRequest {
  body: {
    username?: string;
    email?: string;
    password?: string;
    role?: UserRole;
    refreshToken?: string;
  };
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
}

/**
 * Registration response interface
 */
export interface RegistrationResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
  };
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Token refresh response interface
 */
export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// ===================================
// AuthController Class
// ===================================

/**
 * Authentication Controller
 * 
 * Handles HTTP authentication endpoints:
 * - User registration
 * - User login/logout
 * - Token refresh
 * - Secure authentication flow
 */
export class AuthController extends BaseController {
  private authService: AuthService;

  /**
   * Constructor
   */
  constructor(
    authService: AuthService,
    responseBuilder?: ResponseBuilder,
    errorHandler?: ErrorHandler,
    logger?: Logger,
    validator?: RequestValidator
  ) {
    super(
      'AuthController',
      responseBuilder,
      errorHandler,
      logger,
      validator,
      {
        enableLogging: true,
        enableValidation: true,
        enableErrorHandling: true,
        serviceName: 'auth-api',
        enableRequestId: true,
        enableUserContext: false, // Not applicable for auth endpoints
        enablePerformanceLogging: true
      }
    );

    this.authService = authService;
  }

  /**
   * User registration endpoint
   * POST /auth/register
   */
  public register = this.wrapAction('register', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract and validate registration data
    const { username, email, password, role } = req.body;

    // Basic validation
    if (!username || !email || !password) {
      this.sendError(res, new Error('Username, email, and password are required'), 400);
      return;
    }

    // Prepare registration request
    const registerRequest: RegisterRequest = {
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: role || UserRole.USER
    };

    // Call auth service
    const authResult = await this.authService.register(registerRequest);

    // Prepare response
    const response: RegistrationResponse = {
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
        role: authResult.user.role,
        isActive: authResult.user.isActive
      },
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn
    };

    this.sendSuccess(res, response, 'User registered successfully', 201);
  });

  /**
   * User login endpoint
   * POST /auth/login
   */
  public login = this.wrapAction('login', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract and validate login data
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      this.sendError(res, new Error('Email and password are required'), 400);
      return;
    }

    // Prepare login request
    const loginRequest: LoginRequest = {
      email: email.trim().toLowerCase(),
      password
    };

    // Call auth service
    const authResult = await this.authService.authenticate(loginRequest);

    // Prepare response
    const response: LoginResponse = {
      user: {
        id: authResult.user.id,
        username: authResult.user.username,
        email: authResult.user.email,
        role: authResult.user.role,
        isActive: authResult.user.isActive
      },
      accessToken: authResult.accessToken,
      refreshToken: authResult.refreshToken,
      expiresIn: authResult.expiresIn
    };

    this.sendSuccess(res, response, 'Login successful');
  });

  /**
   * User logout endpoint
   * POST /auth/logout
   */
  public logout = this.wrapAction('logout', async (req: ControllerRequest, res: Response): Promise<void> => {
    // For stateless JWT, logout is typically handled client-side
    // Here we can implement token blacklisting if needed
    
    this.sendSuccess(res, null, 'Logout successful', 204);
  });

  /**
   * Token refresh endpoint
   * POST /auth/refresh
   */
  public refreshToken = this.wrapAction('refreshToken', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract refresh token
    const { refreshToken } = req.body;

    // Basic validation
    if (!refreshToken) {
      this.sendError(res, new Error('Refresh token is required'), 400);
      return;
    }

    // Prepare refresh request
    const refreshRequest: RefreshTokenRequest = {
      refreshToken
    };

    // Call auth service
    const tokenPair = await this.authService.refreshToken(refreshRequest);

    // Prepare response
    const response: TokenRefreshResponse = {
      accessToken: tokenPair.accessToken,
      refreshToken: tokenPair.refreshToken,
      expiresIn: tokenPair.expiresIn
    };

    this.sendSuccess(res, response, 'Token refreshed successfully');
  });

  /**
   * Get current user endpoint (protected)
   * GET /auth/me
   */
  public getCurrentUser = this.wrapAction('getCurrentUser', async (req: ControllerRequest, res: Response): Promise<void> => {
    // User should be attached by auth middleware
    if (!req.user) {
      this.sendError(res, new Error('User not authenticated'), 401);
      return;
    }

    // Prepare response (exclude sensitive data)
    const response = {
      id: req.user.id,
      username: (req.user as any).username || 'Unknown',
      email: req.user.email,
      role: req.user.role,
      isActive: (req.user as any).isActive || true,
      createdAt: (req.user as any).createdAt || new Date(),
      updatedAt: (req.user as any).updatedAt || new Date()
    };

    this.sendSuccess(res, response, 'User information retrieved successfully');
  });

  /**
   * Validate token endpoint
   * POST /auth/validate
   */
  public validateToken = this.wrapAction('validateToken', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      this.sendError(res, new Error('Authorization header with Bearer token is required'), 400);
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Validate token
    const user = await this.authService.verifyToken(token);

    // Prepare response
    const response = {
      valid: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    };

    this.sendSuccess(res, response, 'Token is valid');
  });
}

// ===================================
// Factory Function
// ===================================

/**
 * Create AuthController instance
 */
export const createAuthController = (
  authService: AuthService,
  responseBuilder?: ResponseBuilder,
  errorHandler?: ErrorHandler,
  logger?: Logger,
  validator?: RequestValidator
): AuthController => {
  return new AuthController(authService, responseBuilder, errorHandler, logger, validator);
};

// Export default instance factory
export default createAuthController;
