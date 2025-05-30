/**
 * ===================================
 * Password Hasher Utility Class
 * ===================================
 * Purpose: Secure password hashing and verification using bcrypt
 * Features:
 * - bcrypt-based password hashing with configurable salt rounds
 * - Secure password comparison with timing attack prevention
 * - Salt generation and management
 * - Error handling for invalid inputs
 * - Performance optimization for authentication flows
 * - Integration with authentication system
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import bcrypt from 'bcrypt';
import { createLogger } from './logger';
import { ValidationError } from './error-handler';

// Node.js global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BCRYPT_SALT_ROUNDS?: string;
      PASSWORD_MIN_LENGTH?: string;
      PASSWORD_MAX_LENGTH?: string;
      HASH_TIMING_SAFE?: string;
    }
  }
}

/**
 * Password hasher configuration interface
 */
export interface PasswordHasherConfig {
  saltRounds: number;
  minLength: number;
  maxLength: number;
  timingSafe: boolean;
}

/**
 * Hash result interface
 */
export interface HashResult {
  hash: string;
  saltRounds: number;
  timestamp: Date;
}

/**
 * Comparison result interface
 */
export interface ComparisonResult {
  isValid: boolean;
  timeTaken: number;
}

/**
 * Password strength interface
 */
export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isStrong: boolean;
}

/**
 * Password hasher class
 */
export class PasswordHasher {
  private config: PasswordHasherConfig;
  private logger = createLogger('PasswordHasher');

  constructor(config?: Partial<PasswordHasherConfig>) {
    this.config = this.buildConfig(config);
    this.logger.info('PasswordHasher initialized', {
      saltRounds: this.config.saltRounds,
      minLength: this.config.minLength,
      maxLength: this.config.maxLength,
      timingSafe: this.config.timingSafe
    });
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<PasswordHasherConfig>): PasswordHasherConfig {
    const defaultConfig: PasswordHasherConfig = {
      saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
      minLength: parseInt(process.env.PASSWORD_MIN_LENGTH || '8'),
      maxLength: parseInt(process.env.PASSWORD_MAX_LENGTH || '128'),
      timingSafe: process.env.HASH_TIMING_SAFE === 'true'
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Validate password input
   */
  private validatePassword(password: string): void {
    if (password === null || password === undefined) {
      throw new ValidationError('Password cannot be null or undefined');
    }

    if (typeof password !== 'string') {
      throw new ValidationError('Password must be a string');
    }

    if (password.length === 0) {
      throw new ValidationError('Password cannot be empty');
    }

    if (password.length < this.config.minLength) {
      throw new ValidationError(`Password must be at least ${this.config.minLength} characters long`);
    }

    if (password.length > this.config.maxLength) {
      throw new ValidationError(`Password cannot exceed ${this.config.maxLength} characters`);
    }
  }

  /**
   * Validate hash input
   */
  private validateHash(hash: string): void {
    if (hash === null || hash === undefined) {
      throw new ValidationError('Hash cannot be null or undefined');
    }

    if (typeof hash !== 'string') {
      throw new ValidationError('Hash must be a string');
    }

    if (hash.length === 0) {
      throw new ValidationError('Hash cannot be empty');
    }

    // Basic bcrypt hash format validation
    if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$') && !hash.startsWith('$2y$')) {
      throw new ValidationError('Invalid hash format');
    }
  }

  /**
   * Generate salt with specified rounds
   */
  public async generateSalt(rounds?: number): Promise<string> {
    const saltRounds = rounds || this.config.saltRounds;

    if (saltRounds < 4 || saltRounds > 31) {
      throw new ValidationError('Salt rounds must be between 4 and 31');
    }

    try {
      const startTime = Date.now();
      const salt = await bcrypt.genSalt(saltRounds);
      const timeTaken = Date.now() - startTime;

      this.logger.debug('Salt generated', {
        saltRounds,
        timeTaken,
        saltLength: salt.length
      });

      return salt;
    } catch (error) {
      this.logger.error('Salt generation failed', error as Error);
      throw new Error('Failed to generate salt');
    }
  }

  /**
   * Hash password with bcrypt
   */
  public async hash(password: string, saltRounds?: number): Promise<string> {
    const startTime = Date.now();

    try {
      // Validate input
      this.validatePassword(password);

      const rounds = saltRounds || this.config.saltRounds;

      if (rounds < 4 || rounds > 31) {
        throw new ValidationError('Salt rounds must be between 4 and 31');
      }

      // Hash password
      const hash = await bcrypt.hash(password, rounds);
      const timeTaken = Date.now() - startTime;

      this.logger.info('Password hashed successfully', {
        saltRounds: rounds,
        timeTaken,
        hashLength: hash.length
      });

      return hash;
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      this.logger.error('Password hashing failed', error as Error, {
        timeTaken,
        saltRounds: saltRounds || this.config.saltRounds
      });

      if (error instanceof ValidationError) {
        throw error;
      }

      throw new Error('Failed to hash password');
    }
  }

  /**
   * Compare password with hash
   */
  public async compare(password: string, hash: string): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Validate inputs
      this.validatePassword(password);
      this.validateHash(hash);

      // Compare password with hash
      const isValid = await bcrypt.compare(password, hash);
      const timeTaken = Date.now() - startTime;

      this.logger.debug('Password comparison completed', {
        isValid,
        timeTaken,
        hashLength: hash.length
      });

      return isValid;
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      this.logger.error('Password comparison failed', error as Error, {
        timeTaken,
        hashLength: hash?.length || 0
      });

      if (error instanceof ValidationError) {
        throw error;
      }

      // For security, return false on any comparison error
      return false;
    }
  }

  /**
   * Compare password with detailed result
   */
  public async compareDetailed(password: string, hash: string): Promise<ComparisonResult> {
    const startTime = Date.now();

    try {
      const isValid = await this.compare(password, hash);
      const timeTaken = Date.now() - startTime;

      return {
        isValid,
        timeTaken
      };
    } catch (error) {
      const timeTaken = Date.now() - startTime;
      return {
        isValid: false,
        timeTaken
      };
    }
  }

  /**
   * Hash password with detailed result
   */
  public async hashDetailed(password: string, saltRounds?: number): Promise<HashResult> {
    const timestamp = new Date();
    const rounds = saltRounds || this.config.saltRounds;

    const hash = await this.hash(password, rounds);

    return {
      hash,
      saltRounds: rounds,
      timestamp
    };
  }

  /**
   * Check if hash needs rehashing (due to different salt rounds)
   */
  public needsRehash(hash: string, saltRounds?: number): boolean {
    try {
      this.validateHash(hash);

      const targetRounds = saltRounds || this.config.saltRounds;

      // Extract salt rounds from hash
      const hashParts = hash.split('$');
      if (hashParts.length < 4) {
        return true; // Invalid hash format, needs rehashing
      }

      const currentRounds = parseInt(hashParts[2]);
      const needsRehash = currentRounds !== targetRounds;

      this.logger.debug('Hash rehash check', {
        currentRounds,
        targetRounds,
        needsRehash
      });

      return needsRehash;
    } catch (error) {
      this.logger.warn('Hash rehash check failed', { error: (error as Error).message });
      return true; // If we can't determine, assume it needs rehashing
    }
  }

  /**
   * Analyze password strength (basic implementation)
   */
  public analyzeStrength(password: string): PasswordStrength {
    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) score++;
    else feedback.push('Password should be at least 8 characters long');

    if (password.length >= 12) score++;

    // Character variety checks
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Password should contain lowercase letters');

    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Password should contain uppercase letters');

    if (/[0-9]/.test(password)) score++;
    else feedback.push('Password should contain numbers');

    if (/[^a-zA-Z0-9]/.test(password)) score++;
    else feedback.push('Password should contain special characters');

    // Adjust score based on length
    if (password.length >= 16) score++;

    // Cap score at 4
    score = Math.min(score, 4);

    const isStrong = score >= 3;

    return {
      score,
      feedback,
      isStrong
    };
  }

  /**
   * Get current configuration
   */
  public getConfig(): PasswordHasherConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<PasswordHasherConfig>): void {
    this.config = { ...this.config, ...config };
    this.logger.info('PasswordHasher configuration updated', this.config);
  }

  /**
   * Get bcrypt version info
   */
  public getBcryptInfo(): { version: string; supportedVersions: string[] } {
    return {
      version: '5.1.0', // Current bcrypt version
      supportedVersions: ['$2a$', '$2b$', '$2y$']
    };
  }
}

/**
 * Default password hasher instance
 */
export const passwordHasher = new PasswordHasher();

/**
 * Create password hasher with custom configuration
 */
export function createPasswordHasher(config?: Partial<PasswordHasherConfig>): PasswordHasher {
  return new PasswordHasher(config);
}

/**
 * Utility function to hash password
 */
export async function hashPassword(password: string, saltRounds?: number): Promise<string> {
  return passwordHasher.hash(password, saltRounds);
}

/**
 * Utility function to compare password
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return passwordHasher.compare(password, hash);
}

/**
 * Utility function to check password strength
 */
export function checkPasswordStrength(password: string): PasswordStrength {
  return passwordHasher.analyzeStrength(password);
}
