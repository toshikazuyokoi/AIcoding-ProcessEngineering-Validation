/**
 * ===================================
 * JWT Manager Utility Class
 * ===================================
 * Purpose: JWT token generation, verification, and management
 * Features:
 * - Access token and refresh token generation
 * - JWT signature verification and payload extraction
 * - Token expiration and renewal mechanisms
 * - Security considerations and error handling
 * - Integration with authentication system
 * - Performance optimization and caching
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import jwt from 'jsonwebtoken';
import { createLogger } from './logger';
import { ValidationError, AuthenticationError } from './error-handler';

// Node.js global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET?: string;
      JWT_ACCESS_EXPIRES_IN?: string;
      JWT_REFRESH_EXPIRES_IN?: string;
      JWT_ALGORITHM?: string;
      JWT_ISSUER?: string;
      JWT_AUDIENCE?: string;
    }
  }
}

/**
 * JWT configuration interface
 */
export interface JWTConfig {
  secret: string;
  accessExpiresIn: string;
  refreshExpiresIn: string;
  algorithm: jwt.Algorithm;
  issuer: string;
  audience: string;
}

/**
 * JWT payload interface
 */
export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}

/**
 * Token pair interface
 */
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

/**
 * User data for token generation
 */
export interface UserTokenData {
  id: string;
  email: string;
  role: string;
}

/**
 * Token verification result
 */
export interface TokenVerificationResult {
  payload: JWTPayload;
  isValid: boolean;
  error?: string;
}

/**
 * JWT Manager class
 */
export class JWTManager {
  private config: JWTConfig;
  private logger = createLogger('JWTManager');

  constructor(config?: Partial<JWTConfig>) {
    this.config = this.buildConfig(config);
    this.logger.info('JWTManager initialized', {
      algorithm: this.config.algorithm,
      accessExpiresIn: this.config.accessExpiresIn,
      refreshExpiresIn: this.config.refreshExpiresIn,
      issuer: this.config.issuer,
      audience: this.config.audience
    });
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<JWTConfig>): JWTConfig {
    const defaultConfig: JWTConfig = {
      secret: process.env.JWT_SECRET || 'default-secret-key-change-in-production',
      accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '1h',
      refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: (process.env.JWT_ALGORITHM as jwt.Algorithm) || 'HS256',
      issuer: process.env.JWT_ISSUER || 'task-management-system',
      audience: process.env.JWT_AUDIENCE || 'task-management-users'
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Validate user data for token generation
   */
  private validateUserData(userData: UserTokenData): void {
    if (!userData) {
      throw new ValidationError('User data is required');
    }

    if (!userData.id || typeof userData.id !== 'string') {
      throw new ValidationError('User ID is required and must be a string');
    }

    if (!userData.email || typeof userData.email !== 'string') {
      throw new ValidationError('User email is required and must be a string');
    }

    if (!userData.role || typeof userData.role !== 'string') {
      throw new ValidationError('User role is required and must be a string');
    }
  }

  /**
   * Validate token input
   */
  private validateToken(token: string): void {
    if (token === null || token === undefined) {
      throw new ValidationError('Token is required');
    }

    if (typeof token !== 'string') {
      throw new ValidationError('Token must be a string');
    }

    if (token.length === 0) {
      throw new ValidationError('Token cannot be empty');
    }

    if (token.trim().length === 0) {
      throw new ValidationError('Token cannot be empty');
    }
  }

  /**
   * Generate access token
   */
  public generateAccessToken(userData: UserTokenData): string {
    this.validateUserData(userData);

    const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      type: 'access'
    };

    const options: jwt.SignOptions = {
      expiresIn: this.config.accessExpiresIn as any,
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience
    };

    try {
      const token = jwt.sign(payload, this.config.secret, options);

      this.logger.debug('Access token generated', {
        userId: userData.id,
        expiresIn: this.config.accessExpiresIn
      });

      return token;
    } catch (error) {
      this.logger.error('Access token generation failed', error as Error, {
        userId: userData.id,
        errorMessage: (error as Error).message
      });
      throw error; // Re-throw original error for debugging
    }
  }

  /**
   * Generate refresh token
   */
  public generateRefreshToken(userData: UserTokenData): string {
    this.validateUserData(userData);

    const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
      userId: userData.id,
      email: userData.email,
      role: userData.role,
      type: 'refresh'
    };

    const options: jwt.SignOptions = {
      expiresIn: this.config.refreshExpiresIn as any,
      algorithm: this.config.algorithm,
      issuer: this.config.issuer,
      audience: this.config.audience
    };

    try {
      const token = jwt.sign(payload, this.config.secret, options);

      this.logger.debug('Refresh token generated', {
        userId: userData.id,
        expiresIn: this.config.refreshExpiresIn
      });

      return token;
    } catch (error) {
      this.logger.error('Refresh token generation failed', error as Error, {
        userId: userData.id,
        errorMessage: (error as Error).message
      });
      throw error; // Re-throw original error for debugging
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  public generateTokens(userData: UserTokenData): TokenPair {
    this.validateUserData(userData);

    const startTime = Date.now();

    try {
      const accessToken = this.generateAccessToken(userData);
      const refreshToken = this.generateRefreshToken(userData);

      // Calculate expiration time in seconds
      const expiresIn = this.parseExpirationTime(this.config.accessExpiresIn);

      const tokenPair: TokenPair = {
        accessToken,
        refreshToken,
        expiresIn,
        tokenType: 'Bearer'
      };

      const timeTaken = Date.now() - startTime;
      this.logger.info('Token pair generated successfully', {
        userId: userData.id,
        timeTaken,
        expiresIn
      });

      return tokenPair;
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      this.logger.error('Token pair generation failed', error as Error, {
        userId: userData.id,
        timeTaken
      });
      throw error;
    }
  }

  /**
   * Verify access token
   */
  public verifyToken(token: string): JWTPayload {
    this.validateToken(token);

    const options: jwt.VerifyOptions = {
      algorithms: [this.config.algorithm],
      issuer: this.config.issuer,
      audience: this.config.audience
    };

    try {
      const decoded = jwt.verify(token, this.config.secret, options) as JWTPayload;

      // Verify token type
      if (decoded.type !== 'access') {
        throw new AuthenticationError('Invalid token type');
      }

      this.logger.debug('Token verified successfully', {
        userId: decoded.userId,
        type: decoded.type
      });

      return decoded;
    } catch (error) {
      this.logger.warn('Token verification failed', {
        error: (error as Error).message,
        tokenLength: token.length
      });

      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid token');
      } else if (error instanceof jwt.NotBeforeError) {
        throw new AuthenticationError('Token not active');
      } else {
        throw new AuthenticationError('Token verification failed');
      }
    }
  }

  /**
   * Verify refresh token
   */
  public verifyRefreshToken(token: string): JWTPayload {
    this.validateToken(token);

    const options: jwt.VerifyOptions = {
      algorithms: [this.config.algorithm],
      issuer: this.config.issuer,
      audience: this.config.audience
    };

    try {
      const decoded = jwt.verify(token, this.config.secret, options) as JWTPayload;

      // Verify token type
      if (decoded.type !== 'refresh') {
        throw new AuthenticationError('Invalid refresh token type');
      }

      this.logger.debug('Refresh token verified successfully', {
        userId: decoded.userId,
        type: decoded.type
      });

      return decoded;
    } catch (error) {
      this.logger.warn('Refresh token verification failed', {
        error: (error as Error).message,
        tokenLength: token.length
      });

      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthenticationError('Refresh token has expired');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthenticationError('Invalid refresh token');
      } else if (error instanceof jwt.NotBeforeError) {
        throw new AuthenticationError('Refresh token not active');
      } else {
        throw new AuthenticationError('Refresh token verification failed');
      }
    }
  }

  /**
   * Extract payload without verification (for debugging)
   */
  public extractPayload(token: string): JWTPayload | null {
    this.validateToken(token);

    try {
      const decoded = jwt.decode(token) as JWTPayload;
      return decoded;
    } catch (error) {
      this.logger.warn('Payload extraction failed', {
        error: (error as Error).message
      });
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  public isTokenExpired(token: string): boolean {
    try {
      const payload = this.extractPayload(token);
      if (!payload || !payload.exp) {
        return true;
      }

      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  /**
   * Get token expiration time
   */
  public getTokenExpiration(token: string): Date | null {
    try {
      const payload = this.extractPayload(token);
      if (!payload || !payload.exp) {
        return null;
      }

      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const timeUnits: Record<string, number> = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400,
      w: 604800
    };

    const match = expiresIn.match(/^(\d+)([smhdw])$/);
    if (!match) {
      throw new Error(`Invalid expiration time format: ${expiresIn}`);
    }

    const [, value, unit] = match;
    return parseInt(value) * timeUnits[unit];
  }

  /**
   * Get current configuration
   */
  public getConfig(): Omit<JWTConfig, 'secret'> {
    const { secret, ...config } = this.config;
    return config;
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<Omit<JWTConfig, 'secret'>>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('JWTManager configuration updated', config);
  }

  /**
   * Get JWT library version info
   */
  public getJWTInfo(): { version: string; supportedAlgorithms: string[] } {
    return {
      version: '9.0.2', // Current jsonwebtoken version
      supportedAlgorithms: ['HS256', 'HS384', 'HS512', 'RS256', 'RS384', 'RS512', 'ES256', 'ES384', 'ES512']
    };
  }
}

/**
 * Default JWT manager instance
 */
export const jwtManager = new JWTManager();

/**
 * Create JWT manager with custom configuration
 */
export function createJWTManager(config?: Partial<JWTConfig>): JWTManager {
  return new JWTManager(config);
}

/**
 * Utility function to generate tokens
 */
export async function generateTokens(userData: UserTokenData): Promise<TokenPair> {
  return jwtManager.generateTokens(userData);
}

/**
 * Utility function to verify token
 */
export async function verifyToken(token: string): Promise<JWTPayload> {
  return jwtManager.verifyToken(token);
}

/**
 * Utility function to verify refresh token
 */
export async function verifyRefreshToken(token: string): Promise<JWTPayload> {
  return jwtManager.verifyRefreshToken(token);
}
