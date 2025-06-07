/**
 * ===================================
 * Authentication Middleware Implementation
 * ===================================
 * Purpose: Express authentication and authorization middleware
 * Features:
 * - JWT token verification
 * - User authentication
 * - Role-based authorization
 * - Security controls
 * - Express middleware integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { JWTManager } from '../utils/jwt-manager';
import { AuthService } from '../domain/services/auth.service';
import { ResponseBuilder } from '../utils/response-builder';
import { User } from '../domain/entities/user.entity';
import { UserRole } from '../domain/types/user.types';
import {
  AuthenticationError,
  AuthorizationError
} from '../utils/error-handler';
import { EntityNotFoundError } from '../domain/entities/base.entity';

// ===================================
// Authentication Middleware Types
// ===================================

/**
 * Authenticated request interface
 */
export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

/**
 * Authorization options
 */
export interface AuthorizationOptions {
  roles?: UserRole[];
  requireActive?: boolean;
  allowSelf?: boolean;
  resourceOwnerField?: string;
}

/**
 * Authentication middleware options
 */
export interface AuthMiddlewareOptions {
  optional?: boolean;
  skipInactive?: boolean;
  extractTokenFrom?: 'header' | 'cookie' | 'query';
  tokenField?: string;
}

// ===================================
// AuthMiddleware Class
// ===================================

/**
 * Authentication and authorization middleware
 */
export class AuthMiddleware {
  private static instance: AuthMiddleware;
  private jwtManager: JWTManager;
  private authService: AuthService;
  private responseBuilder: ResponseBuilder;

  constructor(
    jwtManager?: JWTManager,
    authService?: AuthService,
    responseBuilder?: ResponseBuilder
  ) {
    this.jwtManager = jwtManager || new JWTManager();
    this.authService = authService || ({} as AuthService);
    this.responseBuilder = responseBuilder || ResponseBuilder.getInstance();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AuthMiddleware {
    if (!AuthMiddleware.instance) {
      AuthMiddleware.instance = new AuthMiddleware();
    }
    return AuthMiddleware.instance;
  }

  /**
   * JWT authentication middleware
   */
  public authenticate(options: AuthMiddlewareOptions = {}) {
    return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<Response | void> => {
      try {
        // Extract token from request
        const token = this.extractToken(req, options);

        // Handle optional authentication
        if (!token && options.optional) {
          return next();
        }

        if (!token) {
          return this.responseBuilder.sendError(
            res,
            'AUTHENTICATION_ERROR',
            'Authentication token is required',
            401
          );
        }

        // Verify token and get user
        const user = await this.verifyTokenAndGetUser(token);

        // Check if user is active (unless skipped)
        if (!options.skipInactive && !user.isActive) {
          return this.responseBuilder.sendError(
            res,
            'AUTHENTICATION_ERROR',
            'User account is deactivated',
            401
          );
        }

        // Attach user and token to request
        req.user = user;
        req.token = token;

        next();
      } catch (error) {
        return this.handleAuthenticationError(res, error);
      }
    };
  }

  /**
   * Role-based authorization middleware
   */
  public authorize(options: AuthorizationOptions = {}) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): Response | void => {
      try {
        // Check if user is authenticated
        if (!req.user) {
          return this.responseBuilder.sendError(
            res,
            'AUTHENTICATION_ERROR',
            'Authentication required',
            401
          );
        }

        const user = req.user;

        // Check if user is active
        if (options.requireActive !== false && !user.isActive) {
          return this.responseBuilder.sendError(
            res,
            'AUTHORIZATION_ERROR',
            'User account is deactivated',
            403
          );
        }

        // Check role-based authorization
        if (options.roles && options.roles.length > 0) {
          if (!options.roles.includes(user.role)) {
            return this.responseBuilder.sendError(
              res,
              'AUTHORIZATION_ERROR',
              'Insufficient permissions',
              403
            );
          }
        }

        // Check resource ownership (if specified)
        if (options.allowSelf && options.resourceOwnerField) {
          const resourceOwnerId = req.params[options.resourceOwnerField] || req.body[options.resourceOwnerField];
          if (resourceOwnerId && resourceOwnerId !== user.id && user.role !== UserRole.ADMIN) {
            return this.responseBuilder.sendError(
              res,
              'AUTHORIZATION_ERROR',
              'Access denied to this resource',
              403
            );
          }
        }

        next();
      } catch (error) {
        return this.handleAuthorizationError(res, error);
      }
    };
  }

  /**
   * Extract user information from token
   */
  public async extractUser(token: string): Promise<User> {
    try {
      return await this.verifyTokenAndGetUser(token);
    } catch (error) {
      throw new AuthenticationError('Failed to extract user from token');
    }
  }

  /**
   * Admin-only authorization middleware
   */
  public requireAdmin() {
    return this.authorize({
      roles: [UserRole.ADMIN],
      requireActive: true
    });
  }

  /**
   * User or admin authorization middleware
   */
  public requireUser() {
    return this.authorize({
      roles: [UserRole.USER, UserRole.ADMIN],
      requireActive: true
    });
  }

  /**
   * Resource owner or admin authorization middleware
   */
  public requireOwnerOrAdmin(resourceOwnerField: string = 'userId') {
    return this.authorize({
      roles: [UserRole.USER, UserRole.ADMIN],
      requireActive: true,
      allowSelf: true,
      resourceOwnerField
    });
  }

  /**
   * Optional authentication middleware
   */
  public optionalAuth() {
    return this.authenticate({
      optional: true,
      skipInactive: false
    });
  }

  /**
   * Extract token from request
   */
  private extractToken(req: AuthenticatedRequest, options: AuthMiddlewareOptions): string | null {
    const extractFrom = options.extractTokenFrom || 'header';
    const tokenField = options.tokenField || 'authorization';

    switch (extractFrom) {
      case 'header':
        const authHeader = req.headers[tokenField] as string;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          return authHeader.substring(7);
        }
        break;

      case 'cookie':
        return req.cookies?.[tokenField] || null;

      case 'query':
        return req.query[tokenField] as string || null;

      default:
        return null;
    }

    return null;
  }

  /**
   * Verify token and get user
   */
  private async verifyTokenAndGetUser(token: string): Promise<User> {
    try {
      // Verify JWT token
      const payload = this.jwtManager.verifyToken(token);

      // Get user from auth service
      const user = await this.authService.verifyToken(token);

      return user;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new AuthenticationError('User not found');
      }
      throw new AuthenticationError('Invalid or expired token');
    }
  }

  /**
   * Handle authentication errors
   */
  private handleAuthenticationError(res: Response, error: any): Response {
    if (error instanceof AuthenticationError) {
      return this.responseBuilder.sendError(
        res,
        'AUTHENTICATION_ERROR',
        error.message,
        401
      );
    }

    return this.responseBuilder.sendError(
      res,
      'AUTHENTICATION_ERROR',
      'Authentication failed',
      401
    );
  }

  /**
   * Handle authorization errors
   */
  private handleAuthorizationError(res: Response, error: any): Response {
    if (error instanceof AuthorizationError) {
      return this.responseBuilder.sendError(
        res,
        'AUTHORIZATION_ERROR',
        error.message,
        403
      );
    }

    return this.responseBuilder.sendError(
      res,
      'AUTHORIZATION_ERROR',
      'Authorization failed',
      403
    );
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Create authentication middleware instance
 */
export const createAuthMiddleware = (
  jwtManager?: JWTManager,
  authService?: AuthService,
  responseBuilder?: ResponseBuilder
): AuthMiddleware => {
  return new AuthMiddleware(jwtManager, authService, responseBuilder);
};

/**
 * Default authentication middleware instance
 */
export const authMiddleware = AuthMiddleware.getInstance();

// Export default instance
export default authMiddleware;
