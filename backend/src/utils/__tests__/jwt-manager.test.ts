/**
 * ===================================
 * JWT Manager Tests
 * ===================================
 * Purpose: Comprehensive testing for JWTManager class and JWT token operations
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  JWTManager,
  JWTPayload,
  TokenPair,
  UserTokenData,
  createJWTManager,
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  jwtManager
} from '../jwt-manager';
import { ValidationError, AuthenticationError } from '../error-handler';
import jwt from 'jsonwebtoken';

// Mock logger
jest.mock('../logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}));

// Mock environment variables
const originalEnv = process.env;

describe('JWTManager', () => {
  let manager: JWTManager;
  const testSecret = 'test-secret-key';
  const testUser: UserTokenData = {
    id: 'user-123',
    email: 'test@example.com',
    role: 'user'
  };

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      JWT_SECRET: testSecret,
      JWT_ACCESS_EXPIRES_IN: '1h',
      JWT_REFRESH_EXPIRES_IN: '7d',
      JWT_ALGORITHM: 'HS256',
      JWT_ISSUER: 'test-issuer',
      JWT_AUDIENCE: 'test-audience'
    };

    // Clear all mocks
    jest.clearAllMocks();
    
    manager = new JWTManager();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Configuration', () => {
    test('should create manager with default configuration', () => {
      const config = manager.getConfig();

      expect(config.accessExpiresIn).toBe('1h');
      expect(config.refreshExpiresIn).toBe('7d');
      expect(config.algorithm).toBe('HS256');
      expect(config.issuer).toBe('test-issuer');
      expect(config.audience).toBe('test-audience');
    });

    test('should create manager with custom configuration', () => {
      const customConfig = {
        accessExpiresIn: '30m',
        refreshExpiresIn: '30d',
        algorithm: 'HS512' as jwt.Algorithm,
        issuer: 'custom-issuer',
        audience: 'custom-audience'
      };

      const customManager = new JWTManager(customConfig);
      const config = customManager.getConfig();

      expect(config.accessExpiresIn).toBe('30m');
      expect(config.refreshExpiresIn).toBe('30d');
      expect(config.algorithm).toBe('HS512');
      expect(config.issuer).toBe('custom-issuer');
      expect(config.audience).toBe('custom-audience');
    });

    test('should update configuration', () => {
      manager.updateConfig({ accessExpiresIn: '2h' });
      const config = manager.getConfig();

      expect(config.accessExpiresIn).toBe('2h');
    });
  });

  describe('User Data Validation', () => {
    test('should reject null user data', () => {
      expect(() => manager.generateAccessToken(null as any)).toThrow(ValidationError);
      expect(() => manager.generateAccessToken(null as any)).toThrow('User data is required');
    });

    test('should reject undefined user data', () => {
      expect(() => manager.generateAccessToken(undefined as any)).toThrow(ValidationError);
      expect(() => manager.generateAccessToken(undefined as any)).toThrow('User data is required');
    });

    test('should reject user data without ID', () => {
      const invalidUser = { email: 'test@example.com', role: 'user' } as any;
      expect(() => manager.generateAccessToken(invalidUser)).toThrow(ValidationError);
      expect(() => manager.generateAccessToken(invalidUser)).toThrow('User ID is required and must be a string');
    });

    test('should reject user data without email', () => {
      const invalidUser = { id: 'user-123', role: 'user' } as any;
      expect(() => manager.generateAccessToken(invalidUser)).toThrow(ValidationError);
      expect(() => manager.generateAccessToken(invalidUser)).toThrow('User email is required and must be a string');
    });

    test('should reject user data without role', () => {
      const invalidUser = { id: 'user-123', email: 'test@example.com' } as any;
      expect(() => manager.generateAccessToken(invalidUser)).toThrow(ValidationError);
      expect(() => manager.generateAccessToken(invalidUser)).toThrow('User role is required and must be a string');
    });

    test('should accept valid user data', () => {
      expect(() => manager.generateAccessToken(testUser)).not.toThrow();
    });
  });

  describe('Token Validation', () => {
    test('should reject null token', () => {
      expect(() => manager.verifyToken(null as any)).toThrow(ValidationError);
      expect(() => manager.verifyToken(null as any)).toThrow('Token is required');
    });

    test('should reject undefined token', () => {
      expect(() => manager.verifyToken(undefined as any)).toThrow(ValidationError);
      expect(() => manager.verifyToken(undefined as any)).toThrow('Token is required');
    });

    test('should reject non-string token', () => {
      expect(() => manager.verifyToken(123 as any)).toThrow(ValidationError);
      expect(() => manager.verifyToken(123 as any)).toThrow('Token must be a string');
    });

    test('should reject empty token', () => {
      expect(() => manager.verifyToken('')).toThrow(ValidationError);
      expect(() => manager.verifyToken('')).toThrow('Token cannot be empty');
    });

    test('should reject whitespace-only token', () => {
      expect(() => manager.verifyToken('   ')).toThrow(ValidationError);
      expect(() => manager.verifyToken('   ')).toThrow('Token cannot be empty');
    });
  });

  describe('Access Token Generation', () => {
    test('should generate valid access token', () => {
      const token = manager.generateAccessToken(testUser);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature

      // Verify token content
      const decoded = jwt.decode(token) as JWTPayload;
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
      expect(decoded.type).toBe('access');
    });

    test('should include correct claims in access token', () => {
      const token = manager.generateAccessToken(testUser);
      const decoded = jwt.decode(token) as JWTPayload;

      expect(decoded.iss).toBe('test-issuer');
      expect(decoded.aud).toBe('test-audience');
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });

  describe('Refresh Token Generation', () => {
    test('should generate valid refresh token', () => {
      const token = manager.generateRefreshToken(testUser);

      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);

      // Verify token content
      const decoded = jwt.decode(token) as JWTPayload;
      expect(decoded.userId).toBe(testUser.id);
      expect(decoded.email).toBe(testUser.email);
      expect(decoded.role).toBe(testUser.role);
      expect(decoded.type).toBe('refresh');
    });

    test('should have longer expiration than access token', () => {
      const accessToken = manager.generateAccessToken(testUser);
      const refreshToken = manager.generateRefreshToken(testUser);

      const accessDecoded = jwt.decode(accessToken) as JWTPayload;
      const refreshDecoded = jwt.decode(refreshToken) as JWTPayload;

      expect(refreshDecoded.exp).toBeGreaterThan(accessDecoded.exp);
    });
  });

  describe('Token Pair Generation', () => {
    test('should generate token pair successfully', () => {
      const tokenPair = manager.generateTokens(testUser);

      expect(tokenPair).toHaveProperty('accessToken');
      expect(tokenPair).toHaveProperty('refreshToken');
      expect(tokenPair).toHaveProperty('expiresIn');
      expect(tokenPair).toHaveProperty('tokenType');

      expect(typeof tokenPair.accessToken).toBe('string');
      expect(typeof tokenPair.refreshToken).toBe('string');
      expect(typeof tokenPair.expiresIn).toBe('number');
      expect(tokenPair.tokenType).toBe('Bearer');
    });

    test('should generate different tokens for different users', () => {
      const user1: UserTokenData = { id: 'user-1', email: 'user1@example.com', role: 'user' };
      const user2: UserTokenData = { id: 'user-2', email: 'user2@example.com', role: 'admin' };

      const tokens1 = manager.generateTokens(user1);
      const tokens2 = manager.generateTokens(user2);

      expect(tokens1.accessToken).not.toBe(tokens2.accessToken);
      expect(tokens1.refreshToken).not.toBe(tokens2.refreshToken);
    });

    test('should calculate correct expiration time', () => {
      const tokenPair = manager.generateTokens(testUser);

      // 1h = 3600 seconds
      expect(tokenPair.expiresIn).toBe(3600);
    });
  });

  describe('Token Verification', () => {
    test('should verify valid access token', () => {
      const token = manager.generateAccessToken(testUser);
      const payload = manager.verifyToken(token);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.email).toBe(testUser.email);
      expect(payload.role).toBe(testUser.role);
      expect(payload.type).toBe('access');
    });

    test('should reject refresh token in access verification', () => {
      const refreshToken = manager.generateRefreshToken(testUser);

      expect(() => manager.verifyToken(refreshToken)).toThrow(AuthenticationError);
      expect(() => manager.verifyToken(refreshToken)).toThrow('Invalid token type');
    });

    test('should reject expired token', () => {
      // Create manager with very short expiration
      const shortManager = new JWTManager({ accessExpiresIn: '1ms' });
      const token = shortManager.generateAccessToken(testUser);

      // Wait for token to expire
      return new Promise(resolve => {
        setTimeout(() => {
          expect(() => shortManager.verifyToken(token)).toThrow(AuthenticationError);
          expect(() => shortManager.verifyToken(token)).toThrow('Token has expired');
          resolve(undefined);
        }, 10);
      });
    });

    test('should reject tampered token', () => {
      const token = manager.generateAccessToken(testUser);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      expect(() => manager.verifyToken(tamperedToken)).toThrow(AuthenticationError);
      expect(() => manager.verifyToken(tamperedToken)).toThrow('Invalid token');
    });

    test('should reject token with wrong secret', () => {
      const wrongManager = new JWTManager({ secret: 'wrong-secret' });
      const token = manager.generateAccessToken(testUser);

      expect(() => wrongManager.verifyToken(token)).toThrow(AuthenticationError);
      expect(() => wrongManager.verifyToken(token)).toThrow('Invalid token');
    });

    test('should reject malformed token', () => {
      const malformedToken = 'not.a.valid.jwt.token';

      expect(() => manager.verifyToken(malformedToken)).toThrow(AuthenticationError);
      expect(() => manager.verifyToken(malformedToken)).toThrow('Invalid token');
    });
  });

  describe('Refresh Token Verification', () => {
    test('should verify valid refresh token', () => {
      const token = manager.generateRefreshToken(testUser);
      const payload = manager.verifyRefreshToken(token);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.email).toBe(testUser.email);
      expect(payload.role).toBe(testUser.role);
      expect(payload.type).toBe('refresh');
    });

    test('should reject access token in refresh verification', () => {
      const accessToken = manager.generateAccessToken(testUser);

      expect(() => manager.verifyRefreshToken(accessToken)).toThrow(AuthenticationError);
      expect(() => manager.verifyRefreshToken(accessToken)).toThrow('Invalid refresh token type');
    });

    test('should reject expired refresh token', () => {
      const shortManager = new JWTManager({ refreshExpiresIn: '1ms' });
      const token = shortManager.generateRefreshToken(testUser);

      return new Promise(resolve => {
        setTimeout(() => {
          expect(() => shortManager.verifyRefreshToken(token)).toThrow(AuthenticationError);
          expect(() => shortManager.verifyRefreshToken(token)).toThrow('Refresh token has expired');
          resolve(undefined);
        }, 10);
      });
    });
  });

  describe('Payload Extraction', () => {
    test('should extract payload without verification', () => {
      const token = manager.generateAccessToken(testUser);
      const payload = manager.extractPayload(token);

      expect(payload).not.toBeNull();
      expect(payload!.userId).toBe(testUser.id);
      expect(payload!.email).toBe(testUser.email);
      expect(payload!.role).toBe(testUser.role);
    });

    test('should return null for invalid token', () => {
      const invalidToken = 'invalid.token.format';
      const payload = manager.extractPayload(invalidToken);

      expect(payload).toBeNull();
    });

    test('should extract payload from expired token', () => {
      const shortManager = new JWTManager({ accessExpiresIn: '1ms' });
      const token = shortManager.generateAccessToken(testUser);

      return new Promise(resolve => {
        setTimeout(() => {
          const payload = manager.extractPayload(token);
          expect(payload).not.toBeNull();
          expect(payload!.userId).toBe(testUser.id);
          resolve(undefined);
        }, 10);
      });
    });
  });

  describe('Token Expiration Utilities', () => {
    test('should detect expired token', () => {
      const shortManager = new JWTManager({ accessExpiresIn: '1ms' });
      const token = shortManager.generateAccessToken(testUser);

      return new Promise(resolve => {
        setTimeout(() => {
          expect(manager.isTokenExpired(token)).toBe(true);
          resolve(undefined);
        }, 10);
      });
    });

    test('should detect valid token', () => {
      const token = manager.generateAccessToken(testUser);
      expect(manager.isTokenExpired(token)).toBe(false);
    });

    test('should get token expiration time', () => {
      const token = manager.generateAccessToken(testUser);
      const expiration = manager.getTokenExpiration(token);

      expect(expiration).toBeInstanceOf(Date);
      expect(expiration!.getTime()).toBeGreaterThan(Date.now());
    });

    test('should return null for invalid token expiration', () => {
      const invalidToken = 'invalid.token';
      const expiration = manager.getTokenExpiration(invalidToken);

      expect(expiration).toBeNull();
    });
  });

  describe('Utility Functions', () => {
    test('createJWTManager should return new instance', () => {
      const customManager = createJWTManager({ accessExpiresIn: '2h' });
      
      expect(customManager).toBeInstanceOf(JWTManager);
      expect(customManager.getConfig().accessExpiresIn).toBe('2h');
    });

    test('generateTokens should generate tokens', async () => {
      const tokens = await generateTokens(testUser);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
    });

    test('verifyToken should verify token', async () => {
      const token = manager.generateAccessToken(testUser);
      const payload = await verifyToken(token);

      expect(payload.userId).toBe(testUser.id);
    });

    test('verifyRefreshToken should verify refresh token', async () => {
      const token = manager.generateRefreshToken(testUser);
      const payload = await verifyRefreshToken(token);

      expect(payload.userId).toBe(testUser.id);
      expect(payload.type).toBe('refresh');
    });

    test('default jwtManager should be available', () => {
      expect(jwtManager).toBeInstanceOf(JWTManager);
    });
  });

  describe('JWT Info', () => {
    test('should return JWT library info', () => {
      const info = manager.getJWTInfo();

      expect(info.version).toBeDefined();
      expect(Array.isArray(info.supportedAlgorithms)).toBe(true);
      expect(info.supportedAlgorithms).toContain('HS256');
      expect(info.supportedAlgorithms).toContain('RS256');
    });
  });

  describe('Edge Cases', () => {
    test('should handle different expiration formats', () => {
      const configs = [
        { accessExpiresIn: '30s' },
        { accessExpiresIn: '5m' },
        { accessExpiresIn: '2h' },
        { accessExpiresIn: '1d' },
        { accessExpiresIn: '1w' }
      ];

      configs.forEach(config => {
        expect(() => new JWTManager(config)).not.toThrow();
      });
    });

    test('should handle unicode characters in user data', () => {
      const unicodeUser: UserTokenData = {
        id: 'user-123',
        email: 'テスト@example.com',
        role: 'ユーザー'
      };

      expect(() => manager.generateTokens(unicodeUser)).not.toThrow();
    });

    test('should handle very long user data', () => {
      const longUser: UserTokenData = {
        id: 'user-' + 'x'.repeat(100),
        email: 'very-long-email-' + 'x'.repeat(100) + '@example.com',
        role: 'role-' + 'x'.repeat(50)
      };

      expect(() => manager.generateTokens(longUser)).not.toThrow();
    });
  });
});
