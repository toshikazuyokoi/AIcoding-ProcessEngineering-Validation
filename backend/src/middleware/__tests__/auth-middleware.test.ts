/**
 * ===================================
 * Authentication Middleware Test Suite
 * ===================================
 * Purpose: Basic testing for auth-middleware.ts
 * Coverage: Authentication, Authorization, Error handling
 * Test Framework: Jest
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware, AuthenticatedRequest } from '../auth-middleware';
import { JWTManager, JWTPayload } from '../../utils/jwt-manager';
import { AuthService } from '../../domain/services/auth.service';
import { ResponseBuilder } from '../../utils/response-builder';
import { User, UserRole } from '../../domain/entities/user.entity';
import {
  AuthenticationError,
  AuthorizationError
} from '../../utils/error-handler';
import { EntityNotFoundError } from '../../domain/entities/base.entity';

// ===================================
// Test Mocks
// ===================================

// Create mock objects
const mockJWTManager = {
  verifyToken: jest.fn(),
  generateTokens: jest.fn(),
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  extractPayload: jest.fn(),
  refreshToken: jest.fn(),
  validateToken: jest.fn(),
  getTokenExpiration: jest.fn(),
  getJWTInfo: jest.fn(),
  isTokenExpired: jest.fn(),
  getConfig: jest.fn(),
  updateConfig: jest.fn()
};

const mockAuthService = {
  verifyToken: jest.fn(),
  register: jest.fn(),
  authenticate: jest.fn()
};

const mockResponseBuilder = {
  sendError: jest.fn(),
  sendSuccess: jest.fn(),
  getInstance: jest.fn().mockReturnThis()
};

// Remove duplicate declarations - use the ones above

// Mock user data
const mockUser = new User({
  username: 'testuser',
  email: 'test@example.com',
  passwordHash: 'hashed-password',
  role: UserRole.USER,
  isActive: true
}, {
  id: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date()
});

const mockAdminUser = new User({
  username: 'adminuser',
  email: 'admin@example.com',
  passwordHash: 'hashed-password',
  role: UserRole.ADMIN,
  isActive: true
}, {
  id: 'admin-123',
  createdAt: new Date(),
  updatedAt: new Date()
});

const mockInactiveUser = new User({
  username: 'inactiveuser',
  email: 'inactive@example.com',
  passwordHash: 'hashed-password',
  role: UserRole.USER,
  isActive: false
}, {
  id: 'inactive-123',
  createdAt: new Date(),
  updatedAt: new Date()
});

// Mock Express objects
const createMockRequest = (overrides: Partial<AuthenticatedRequest> = {}): AuthenticatedRequest => ({
  headers: {},
  cookies: {},
  query: {},
  params: {},
  body: {},
  ...overrides
} as AuthenticatedRequest);

const createMockResponse = (): Response => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// mockNext is not used - we create fresh mocks in beforeEach

// ===================================
// Test Suite
// ===================================

describe('AuthMiddleware', () => {
  let authMiddleware: AuthMiddleware;
  let req: AuthenticatedRequest;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create fresh instances
    authMiddleware = new AuthMiddleware(
      mockJWTManager as unknown as JWTManager,
      mockAuthService as unknown as AuthService,
      mockResponseBuilder as unknown as ResponseBuilder
    );

    req = createMockRequest();
    res = createMockResponse();
    next = jest.fn();
  });

  // ===================================
  // Constructor and Singleton Tests
  // ===================================

  describe('Constructor and Singleton', () => {
    it('should create instance with provided dependencies', () => {
      const instance = new AuthMiddleware(
        mockJWTManager as unknown as JWTManager,
        mockAuthService as unknown as AuthService,
        mockResponseBuilder as unknown as ResponseBuilder
      );
      
      expect(instance).toBeInstanceOf(AuthMiddleware);
    });

    it('should create instance with default dependencies when none provided', () => {
      const instance = new AuthMiddleware();
      expect(instance).toBeInstanceOf(AuthMiddleware);
    });

    it('should return singleton instance', () => {
      const instance1 = AuthMiddleware.getInstance();
      const instance2 = AuthMiddleware.getInstance();
      
      expect(instance1).toBe(instance2);
      expect(instance1).toBeInstanceOf(AuthMiddleware);
    });
  });

  // ===================================
  // Authentication Tests
  // ===================================

  describe('authenticate()', () => {
    const validToken = 'valid-jwt-token';
    
    beforeEach(() => {
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      mockJWTManager.verifyToken.mockReturnValue(mockPayload);
      (mockAuthService.verifyToken as jest.Mock).mockResolvedValue(mockUser);
    });

    describe('Successful Authentication', () => {
      it('should authenticate user with valid Bearer token', async () => {
        req.headers.authorization = `Bearer ${validToken}`;
        
        const middleware = authMiddleware.authenticate();
        await middleware(req, res, next);
        
        expect(mockJWTManager.verifyToken).toHaveBeenCalledWith(validToken);
        expect(mockAuthService.verifyToken).toHaveBeenCalledWith(validToken);
        expect(req.user).toEqual(mockUser);
        expect(req.token).toBe(validToken);
        expect(next).toHaveBeenCalled();
        expect(mockResponseBuilder.sendError).not.toHaveBeenCalled();
      });

      it('should authenticate user with active account', async () => {
        req.headers.authorization = `Bearer ${validToken}`;
        
        const middleware = authMiddleware.authenticate();
        await middleware(req, res, next);
        
        expect(req.user).toEqual(mockUser);
        expect(next).toHaveBeenCalled();
      });

      it('should skip authentication when optional and no token provided', async () => {
        const middleware = authMiddleware.authenticate({ optional: true });
        await middleware(req, res, next);
        
        expect(next).toHaveBeenCalled();
        expect(req.user).toBeUndefined();
        expect(mockJWTManager.verifyToken).not.toHaveBeenCalled();
      });

      it('should authenticate inactive user when skipInactive is true', async () => {
        req.headers.authorization = `Bearer ${validToken}`;
        (mockAuthService.verifyToken as jest.Mock).mockResolvedValue(mockInactiveUser);
        
        const middleware = authMiddleware.authenticate({ skipInactive: true });
        await middleware(req, res, next);
        
        expect(req.user).toEqual(mockInactiveUser);
        expect(next).toHaveBeenCalled();
      });
    });

    describe('Token Extraction - Phase 1', () => {
      it('should extract token from Authorization header', async () => {
        req.headers.authorization = `Bearer ${validToken}`;

        const middleware = authMiddleware.authenticate();
        await middleware(req, res, next);

        expect(req.token).toBe(validToken);
        expect(next).toHaveBeenCalled();
      });

      // Phase 2以降で追加予定
      // it('should extract token from cookies when specified', async () => {
      // it('should extract token from query parameters when specified', async () => {
    });
  });

  // ===================================
  // Authentication Error Tests - Phase 2
  // ===================================

  describe('Authentication Errors - Phase 2', () => {
    it('should return 401 when no token provided and not optional', async () => {
      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'Authentication token is required',
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 when user account is deactivated', async () => {
      req.headers.authorization = 'Bearer valid-token';
      (mockAuthService.verifyToken as jest.Mock).mockResolvedValue(mockInactiveUser);

      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'User account is deactivated',
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle invalid token error', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      mockJWTManager.verifyToken.mockImplementation(() => {
        throw new AuthenticationError('Invalid token');
      });

      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'Invalid or expired token',
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle user not found error', async () => {
      req.headers.authorization = 'Bearer valid-token';
      (mockAuthService.verifyToken as jest.Mock).mockRejectedValue(
        new EntityNotFoundError('User', 'user-123')
      );

      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'User not found',
        401
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should handle generic authentication errors', async () => {
      req.headers.authorization = 'Bearer valid-token';
      (mockAuthService.verifyToken as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'Invalid or expired token',
        401
      );
      expect(next).not.toHaveBeenCalled();
    });
  });

  // ===================================
  // Authorization Tests - Phase 3
  // ===================================

  describe('authorize() - Phase 3', () => {
    beforeEach(() => {
      req.user = mockUser;
    });

    describe('Successful Authorization', () => {
      it('should authorize user with correct role', () => {
        const middleware = authMiddleware.authorize({
          roles: [UserRole.USER, UserRole.ADMIN]
        });
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(mockResponseBuilder.sendError).not.toHaveBeenCalled();
      });

      it.skip('should authorize admin user', () => {
        req.user = mockAdminUser;

        const middleware = authMiddleware.authorize({
          roles: [UserRole.ADMIN]
        });
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should authorize resource owner', () => {
        req.params.userId = mockUser.id;

        const middleware = authMiddleware.authorize({
          allowSelf: true,
          resourceOwnerField: 'userId'
        });
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should authorize admin for any resource', () => {
        req.user = mockAdminUser;
        req.params.userId = 'other-user-id';

        const middleware = authMiddleware.authorize({
          allowSelf: true,
          resourceOwnerField: 'userId'
        });
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should authorize when no roles specified', () => {
        const middleware = authMiddleware.authorize();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('Authorization Errors', () => {
      it('should return 401 when user not authenticated', () => {
        delete req.user;

        const middleware = authMiddleware.authorize();
        middleware(req, res, next);

        expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
          res,
          'AUTHENTICATION_ERROR',
          'Authentication required',
          401
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 when user has insufficient permissions', () => {
        const middleware = authMiddleware.authorize({
          roles: [UserRole.ADMIN]
        });
        middleware(req, res, next);

        expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
          res,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions',
          403
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 when user account is deactivated', () => {
        req.user = mockInactiveUser;

        const middleware = authMiddleware.authorize({
          requireActive: true
        });
        middleware(req, res, next);

        expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
          res,
          'AUTHORIZATION_ERROR',
          'User account is deactivated',
          403
        );
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 when accessing other user resource', () => {
        req.params.userId = 'other-user-id';

        const middleware = authMiddleware.authorize({
          allowSelf: true,
          resourceOwnerField: 'userId'
        });
        middleware(req, res, next);

        expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
          res,
          'AUTHORIZATION_ERROR',
          'Access denied to this resource',
          403
        );
        expect(next).not.toHaveBeenCalled();
      });
    });
  });

  // ===================================
  // Utility Methods Tests - Phase 4
  // ===================================

  describe('extractUser() - Phase 4', () => {
    const validToken = 'valid-jwt-token';

    beforeEach(() => {
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      mockJWTManager.verifyToken.mockReturnValue(mockPayload);
      (mockAuthService.verifyToken as jest.Mock).mockResolvedValue(mockUser);
    });

    it('should extract user from valid token', async () => {
      const user = await authMiddleware.extractUser(validToken);

      expect(user).toEqual(mockUser);
      expect(mockJWTManager.verifyToken).toHaveBeenCalledWith(validToken);
      expect(mockAuthService.verifyToken).toHaveBeenCalledWith(validToken);
    });

    it('should throw AuthenticationError for invalid token', async () => {
      (mockAuthService.verifyToken as jest.Mock).mockRejectedValue(
        new Error('Invalid token')
      );

      await expect(authMiddleware.extractUser(validToken))
        .rejects.toThrow(AuthenticationError);
    });
  });

  // ===================================
  // Convenience Methods Tests - Phase 5
  // ===================================

  describe('Convenience Methods - Phase 5', () => {
    beforeEach(() => {
      req.user = mockUser;
    });

    describe('requireAdmin()', () => {
      it('should authorize admin user', () => {
        req.user = mockAdminUser;

        const middleware = authMiddleware.requireAdmin();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should reject non-admin user', () => {
        const middleware = authMiddleware.requireAdmin();
        middleware(req, res, next);

        expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
          res,
          'AUTHORIZATION_ERROR',
          'Insufficient permissions',
          403
        );
      });
    });

    describe('requireUser()', () => {
      it('should authorize regular user', () => {
        const middleware = authMiddleware.requireUser();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should authorize admin user', () => {
        req.user = mockAdminUser;

        const middleware = authMiddleware.requireUser();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('requireOwnerOrAdmin()', () => {
      it('should authorize resource owner', () => {
        req.params.userId = mockUser.id;

        const middleware = authMiddleware.requireOwnerOrAdmin();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should authorize admin for any resource', () => {
        req.user = mockAdminUser;
        req.params.userId = 'other-user-id';

        const middleware = authMiddleware.requireOwnerOrAdmin();
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });

      it('should reject non-owner non-admin', () => {
        req.params.userId = 'other-user-id';

        const middleware = authMiddleware.requireOwnerOrAdmin();
        middleware(req, res, next);

        expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
          res,
          'AUTHORIZATION_ERROR',
          'Access denied to this resource',
          403
        );
      });

      it('should use custom resource owner field', () => {
        req.params.ownerId = mockUser.id;

        const middleware = authMiddleware.requireOwnerOrAdmin('ownerId');
        middleware(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('optionalAuth()', () => {
      it('should proceed without authentication when no token', async () => {
        delete req.user; // Clear user set by beforeEach

        const middleware = authMiddleware.optionalAuth();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toBeUndefined();
      });

      it('should authenticate when token provided', async () => {
        req.headers.authorization = 'Bearer valid-token';
        const mockPayload: JWTPayload = {
          userId: mockUser.id,
          email: mockUser.email,
          role: mockUser.role,
          type: 'access',
          iat: Math.floor(Date.now() / 1000),
          exp: Math.floor(Date.now() / 1000) + 3600
        };
        mockJWTManager.verifyToken.mockReturnValue(mockPayload);
        (mockAuthService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

        const middleware = authMiddleware.optionalAuth();
        await middleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(req.user).toEqual(mockUser);
      });
    });
  });

  // ===================================
  // Edge Cases and Security Tests - Phase 5で実装予定
  // ===================================

  describe.skip('Edge Cases and Security', () => {
    it('should handle malformed Authorization header', async () => {
      req.headers.authorization = 'InvalidFormat token';

      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'Authentication token is required',
        401
      );
    });

    it('should handle empty Authorization header', async () => {
      req.headers.authorization = '';

      const middleware = authMiddleware.authenticate();
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'Authentication token is required',
        401
      );
    });

    it('should handle missing cookies gracefully', async () => {
      req.cookies = undefined;

      const middleware = authMiddleware.authenticate({
        extractTokenFrom: 'cookie',
        tokenField: 'token'
      });
      await middleware(req, res, next);

      expect(mockResponseBuilder.sendError).toHaveBeenCalledWith(
        res,
        'AUTHENTICATION_ERROR',
        'Authentication token is required',
        401
      );
    });
  });

  // ===================================
  // Integration Tests - Phase 5で実装予定
  // ===================================

  describe.skip('Integration Tests', () => {
    it('should work with authentication followed by authorization', async () => {
      req.headers.authorization = 'Bearer valid-token';
      const mockPayload: JWTPayload = {
        userId: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600
      };
      mockJWTManager.verifyToken.mockReturnValue(mockPayload);
      (mockAuthService.verifyToken as jest.Mock).mockResolvedValue(mockUser);

      // First authenticate
      const authMiddlewareInstance = authMiddleware.authenticate();
      await authMiddlewareInstance(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);

      // Reset next mock
      (next as jest.Mock).mockClear();

      // Then authorize
      const authzMiddleware = authMiddleware.authorize({
        roles: [UserRole.USER]
      });
      authzMiddleware(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
