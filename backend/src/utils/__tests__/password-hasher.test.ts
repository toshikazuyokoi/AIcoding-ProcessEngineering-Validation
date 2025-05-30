/**
 * ===================================
 * Password Hasher Tests
 * ===================================
 * Purpose: Comprehensive testing for PasswordHasher class and password security functions
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  PasswordHasher,
  createPasswordHasher,
  hashPassword,
  comparePassword,
  checkPasswordStrength,
  passwordHasher
} from '../password-hasher';
import { ValidationError } from '../error-handler';

// Mock logger
jest.mock('../logger', () => ({
  createLogger: jest.fn(() => ({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn()
  }))
}));

// Mock bcrypt for controlled testing
jest.mock('bcrypt', () => ({
  genSalt: jest.fn().mockResolvedValue('$2b$12$saltsaltsaltsaltsaltsa'),
  hash: jest.fn().mockResolvedValue('$2b$12$hashedpassword'),
  compare: jest.fn().mockResolvedValue(true)
}));

import bcrypt from 'bcrypt';

// Mock environment variables
const originalEnv = process.env;

describe('PasswordHasher', () => {
  let hasher: PasswordHasher;
  let mockBcrypt: any;

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      BCRYPT_SALT_ROUNDS: '12',
      PASSWORD_MIN_LENGTH: '8',
      PASSWORD_MAX_LENGTH: '128',
      HASH_TIMING_SAFE: 'true'
    };

    // Clear all mocks
    jest.clearAllMocks();

    mockBcrypt = bcrypt as any;
    hasher = new PasswordHasher();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('Constructor and Configuration', () => {
    test('should create hasher with default configuration', () => {
      const config = hasher.getConfig();

      expect(config.saltRounds).toBe(12);
      expect(config.minLength).toBe(8);
      expect(config.maxLength).toBe(128);
      expect(config.timingSafe).toBe(true);
    });

    test('should create hasher with custom configuration', () => {
      const customConfig = {
        saltRounds: 10,
        minLength: 6,
        maxLength: 64,
        timingSafe: false
      };

      const customHasher = new PasswordHasher(customConfig);
      const config = customHasher.getConfig();

      expect(config.saltRounds).toBe(10);
      expect(config.minLength).toBe(6);
      expect(config.maxLength).toBe(64);
      expect(config.timingSafe).toBe(false);
    });

    test('should update configuration', () => {
      hasher.updateConfig({ saltRounds: 14 });
      const config = hasher.getConfig();

      expect(config.saltRounds).toBe(14);
    });
  });

  describe('Password Validation', () => {
    test('should reject null password', async () => {
      await expect(hasher.hash(null as any)).rejects.toThrow(ValidationError);
      await expect(hasher.hash(null as any)).rejects.toThrow('Password cannot be null or undefined');
    });

    test('should reject undefined password', async () => {
      await expect(hasher.hash(undefined as any)).rejects.toThrow(ValidationError);
      await expect(hasher.hash(undefined as any)).rejects.toThrow('Password cannot be null or undefined');
    });

    test('should reject non-string password', async () => {
      await expect(hasher.hash(123 as any)).rejects.toThrow(ValidationError);
      await expect(hasher.hash(123 as any)).rejects.toThrow('Password must be a string');
    });

    test('should reject empty password', async () => {
      await expect(hasher.hash('')).rejects.toThrow(ValidationError);
      await expect(hasher.hash('')).rejects.toThrow('Password cannot be empty');
    });

    test('should reject too short password', async () => {
      await expect(hasher.hash('short')).rejects.toThrow(ValidationError);
      await expect(hasher.hash('short')).rejects.toThrow('Password must be at least 8 characters long');
    });

    test('should reject too long password', async () => {
      const longPassword = 'a'.repeat(129);
      await expect(hasher.hash(longPassword)).rejects.toThrow(ValidationError);
      await expect(hasher.hash(longPassword)).rejects.toThrow('Password cannot exceed 128 characters');
    });

    test('should accept valid password', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      await expect(hasher.hash('validPassword123!')).resolves.toBe('$2b$12$hashedpassword');
    });
  });

  describe('Hash Validation', () => {
    test('should reject null hash', async () => {
      await expect(hasher.compare('password', null as any)).rejects.toThrow(ValidationError);
      await expect(hasher.compare('password', null as any)).rejects.toThrow('Hash cannot be null or undefined');
    });

    test('should reject undefined hash', async () => {
      await expect(hasher.compare('password', undefined as any)).rejects.toThrow(ValidationError);
      await expect(hasher.compare('password', undefined as any)).rejects.toThrow('Hash cannot be null or undefined');
    });

    test('should reject non-string hash', async () => {
      await expect(hasher.compare('password', 123 as any)).rejects.toThrow(ValidationError);
      await expect(hasher.compare('password', 123 as any)).rejects.toThrow('Hash must be a string');
    });

    test('should reject empty hash', async () => {
      await expect(hasher.compare('password', '')).rejects.toThrow(ValidationError);
      await expect(hasher.compare('password', '')).rejects.toThrow('Hash cannot be empty');
    });

    test('should reject invalid hash format', async () => {
      await expect(hasher.compare('password', 'invalidhash')).rejects.toThrow(ValidationError);
      await expect(hasher.compare('password', 'invalidhash')).rejects.toThrow('Invalid hash format');
    });

    test('should accept valid hash formats', async () => {
      mockBcrypt.compare.mockResolvedValue(true);

      const validHashes = [
        '$2a$12$hashedpassword',
        '$2b$12$hashedpassword',
        '$2y$12$hashedpassword'
      ];

      for (const hash of validHashes) {
        await expect(hasher.compare('password', hash)).resolves.toBe(true);
      }
    });
  });

  describe('Salt Generation', () => {
    test('should generate salt with default rounds', async () => {
      mockBcrypt.genSalt.mockResolvedValue('$2b$12$saltsaltsaltsaltsaltsa');

      const salt = await hasher.generateSalt();

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(12);
      expect(salt).toBe('$2b$12$saltsaltsaltsaltsaltsa');
    });

    test('should generate salt with custom rounds', async () => {
      mockBcrypt.genSalt.mockResolvedValue('$2b$10$saltsaltsaltsaltsaltsa');

      const salt = await hasher.generateSalt(10);

      expect(mockBcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(salt).toBe('$2b$10$saltsaltsaltsaltsaltsa');
    });

    test('should reject invalid salt rounds', async () => {
      await expect(hasher.generateSalt(3)).rejects.toThrow(ValidationError);
      await expect(hasher.generateSalt(32)).rejects.toThrow(ValidationError);
    });

    test('should handle salt generation failure', async () => {
      mockBcrypt.genSalt.mockRejectedValue(new Error('Salt generation failed'));

      await expect(hasher.generateSalt()).rejects.toThrow('Failed to generate salt');
    });
  });

  describe('Password Hashing', () => {
    test('should hash password successfully', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      const hash = await hasher.hash('validPassword123!');

      expect(mockBcrypt.hash).toHaveBeenCalledWith('validPassword123!', 12);
      expect(hash).toBe('$2b$12$hashedpassword');
    });

    test('should hash password with custom salt rounds', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$10$hashedpassword');

      const hash = await hasher.hash('validPassword123!', 10);

      expect(mockBcrypt.hash).toHaveBeenCalledWith('validPassword123!', 10);
      expect(hash).toBe('$2b$10$hashedpassword');
    });

    test('should reject invalid salt rounds', async () => {
      await expect(hasher.hash('validPassword123!', 3)).rejects.toThrow(ValidationError);
      await expect(hasher.hash('validPassword123!', 32)).rejects.toThrow(ValidationError);
    });

    test('should handle hashing failure', async () => {
      mockBcrypt.hash.mockRejectedValue(new Error('Hashing failed'));

      await expect(hasher.hash('validPassword123!')).rejects.toThrow('Failed to hash password');
    });

    test('should hash long password successfully', async () => {
      const longPassword = 'a'.repeat(100) + '123!';
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedlongpassword');

      const hash = await hasher.hash(longPassword);

      expect(hash).toBe('$2b$12$hashedlongpassword');
    });

    test('should hash password with special characters', async () => {
      const specialPassword = 'P@ssw0rd!@#$%^&*()';
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedspecialpassword');

      const hash = await hasher.hash(specialPassword);

      expect(hash).toBe('$2b$12$hashedspecialpassword');
    });
  });

  describe('Password Comparison', () => {
    test('should return true for correct password', async () => {
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await hasher.compare('correctPassword', '$2b$12$hashedpassword');

      expect(mockBcrypt.compare).toHaveBeenCalledWith('correctPassword', '$2b$12$hashedpassword');
      expect(result).toBe(true);
    });

    test('should return false for incorrect password', async () => {
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await hasher.compare('wrongPassword', '$2b$12$hashedpassword');

      expect(mockBcrypt.compare).toHaveBeenCalledWith('wrongPassword', '$2b$12$hashedpassword');
      expect(result).toBe(false);
    });

    test('should return false on comparison error', async () => {
      mockBcrypt.compare.mockRejectedValue(new Error('Comparison failed'));

      const result = await hasher.compare('password', '$2b$12$hashedpassword');

      expect(result).toBe(false);
    });

    test('should handle case sensitivity', async () => {
      mockBcrypt.compare.mockResolvedValue(false);

      const result = await hasher.compare('PASSWORD', '$2b$12$hashedpassword');

      expect(result).toBe(false);
    });
  });

  describe('Detailed Operations', () => {
    test('should return detailed hash result', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      const result = await hasher.hashDetailed('password', 10);

      expect(result.hash).toBe('$2b$12$hashedpassword');
      expect(result.saltRounds).toBe(10);
      expect(result.timestamp).toBeInstanceOf(Date);
    });

    test('should return detailed comparison result', async () => {
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await hasher.compareDetailed('password', '$2b$12$hashedpassword');

      expect(result.isValid).toBe(true);
      expect(typeof result.timeTaken).toBe('number');
      expect(result.timeTaken).toBeGreaterThanOrEqual(0);
    });

    test('should return detailed comparison result on error', async () => {
      mockBcrypt.compare.mockRejectedValue(new Error('Comparison failed'));

      const result = await hasher.compareDetailed('password', '$2b$12$hashedpassword');

      expect(result.isValid).toBe(false);
      expect(typeof result.timeTaken).toBe('number');
    });
  });

  describe('Rehash Detection', () => {
    test('should detect when rehash is needed', () => {
      const oldHash = '$2b$10$saltsaltsaltsaltsaltsa.hashedpassword';

      const needsRehash = hasher.needsRehash(oldHash, 12);

      expect(needsRehash).toBe(true);
    });

    test('should detect when rehash is not needed', () => {
      const currentHash = '$2b$12$saltsaltsaltsaltsaltsa.hashedpassword';

      const needsRehash = hasher.needsRehash(currentHash, 12);

      expect(needsRehash).toBe(false);
    });

    test('should return true for invalid hash format', () => {
      const invalidHash = 'invalidhashformat';

      const needsRehash = hasher.needsRehash(invalidHash);

      expect(needsRehash).toBe(true);
    });
  });

  describe('Password Strength Analysis', () => {
    test('should analyze weak password', () => {
      const strength = hasher.analyzeStrength('weak');

      expect(strength.score).toBeLessThan(3);
      expect(strength.isStrong).toBe(false);
      expect(strength.feedback.length).toBeGreaterThan(0);
    });

    test('should analyze strong password', () => {
      const strength = hasher.analyzeStrength('StrongP@ssw0rd123!');

      expect(strength.score).toBeGreaterThanOrEqual(3);
      expect(strength.isStrong).toBe(true);
    });

    test('should provide feedback for missing elements', () => {
      const strength = hasher.analyzeStrength('lowercase');

      expect(strength.feedback).toContain('Password should contain uppercase letters');
      expect(strength.feedback).toContain('Password should contain numbers');
      expect(strength.feedback).toContain('Password should contain special characters');
    });
  });

  describe('Utility Functions', () => {
    test('createPasswordHasher should return new instance', () => {
      const customHasher = createPasswordHasher({ saltRounds: 10 });

      expect(customHasher).toBeInstanceOf(PasswordHasher);
      expect(customHasher.getConfig().saltRounds).toBe(10);
    });

    test('hashPassword should hash password', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      const hash = await hashPassword('password');

      expect(hash).toBe('$2b$12$hashedpassword');
    });

    test('comparePassword should compare password', async () => {
      mockBcrypt.compare.mockResolvedValue(true);

      const result = await comparePassword('password', '$2b$12$hashedpassword');

      expect(result).toBe(true);
    });

    test('checkPasswordStrength should analyze strength', () => {
      const strength = checkPasswordStrength('StrongP@ssw0rd!');

      expect(strength.score).toBeGreaterThan(0);
      expect(typeof strength.isStrong).toBe('boolean');
    });

    test('default passwordHasher should be available', () => {
      expect(passwordHasher).toBeInstanceOf(PasswordHasher);
    });
  });

  describe('Bcrypt Info', () => {
    test('should return bcrypt version info', () => {
      const info = hasher.getBcryptInfo();

      expect(info.version).toBeDefined();
      expect(Array.isArray(info.supportedVersions)).toBe(true);
      expect(info.supportedVersions).toContain('$2a$');
      expect(info.supportedVersions).toContain('$2b$');
      expect(info.supportedVersions).toContain('$2y$');
    });
  });

  describe('Edge Cases', () => {
    test('should handle minimum length password', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      const minPassword = 'a'.repeat(8);
      const hash = await hasher.hash(minPassword);

      expect(hash).toBe('$2b$12$hashedpassword');
    });

    test('should handle maximum length password', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      const maxPassword = 'a'.repeat(128);
      const hash = await hasher.hash(maxPassword);

      expect(hash).toBe('$2b$12$hashedpassword');
    });

    test('should handle unicode characters', async () => {
      mockBcrypt.hash.mockResolvedValue('$2b$12$hashedpassword');

      const unicodePassword = 'パスワード123!';
      const hash = await hasher.hash(unicodePassword);

      expect(hash).toBe('$2b$12$hashedpassword');
    });
  });
});
