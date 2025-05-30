/**
 * Environment Template Validation Tests
 * 
 * Tests for TSK-049-ENV-backend-env-example
 * Validates backend/.env.example template file
 */

import fs from 'fs';
import path from 'path';

describe('Backend Environment Template (.env.example)', () => {
  const envExamplePath = path.join(__dirname, '../../../.env.example');
  let envContent: string;

  beforeAll(() => {
    // Read .env.example file
    expect(fs.existsSync(envExamplePath)).toBe(true);
    envContent = fs.readFileSync(envExamplePath, 'utf-8');
  });

  describe('File Structure', () => {
    test('should exist and be readable', () => {
      expect(fs.existsSync(envExamplePath)).toBe(true);
      expect(envContent).toBeDefined();
      expect(envContent.length).toBeGreaterThan(0);
    });

    test('should have proper header documentation', () => {
      expect(envContent).toContain('Task Management System - Backend Environment Variables');
      expect(envContent).toContain('TSK-049-ENV-backend-env-example');
      expect(envContent).toContain('Backend Environment Configuration Template');
    });

    test('should have organized sections with headers', () => {
      const expectedSections = [
        'Application Configuration',
        'Database Configuration',
        'Redis Configuration',
        'JWT Authentication Configuration',
        'Security Configuration'
      ];

      expectedSections.forEach(section => {
        expect(envContent).toContain(section);
      });
    });
  });

  describe('Required Environment Variables', () => {
    test('should contain all database configuration variables', () => {
      const dbVariables = [
        'DATABASE_URL',
        'DB_MAX_CONNECTIONS',
        'DB_MIN_CONNECTIONS',
        'DB_CONNECTION_TIMEOUT',
        'DB_IDLE_TIMEOUT',
        'DB_RETRY_ATTEMPTS',
        'DB_RETRY_DELAY'
      ];

      dbVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all Redis configuration variables', () => {
      const redisVariables = [
        'REDIS_URL',
        'REDIS_HOST',
        'REDIS_PORT',
        'REDIS_PASSWORD',
        'REDIS_DB',
        'CACHE_DEFAULT_TTL',
        'CACHE_KEY_PREFIX'
      ];

      redisVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all JWT configuration variables', () => {
      const jwtVariables = [
        'JWT_SECRET',
        'JWT_ACCESS_EXPIRES_IN',
        'JWT_REFRESH_EXPIRES_IN',
        'JWT_ALGORITHM',
        'JWT_ISSUER',
        'JWT_AUDIENCE'
      ];

      jwtVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all application configuration variables', () => {
      const appVariables = [
        'NODE_ENV',
        'PORT',
        'LOG_LEVEL',
        'TZ',
        'CORS_ORIGIN'
      ];

      appVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all security configuration variables', () => {
      const securityVariables = [
        'HELMET_ENABLED',
        'RATE_LIMIT_ENABLED',
        'RATE_LIMIT_MAX',
        'RATE_LIMIT_WINDOW',
        'BCRYPT_SALT_ROUNDS'
      ];

      securityVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });
  });

  describe('Default Values Validation', () => {
    test('should have appropriate default values for development', () => {
      expect(envContent).toContain('NODE_ENV=development');
      expect(envContent).toContain('PORT=8000');
      expect(envContent).toContain('LOG_LEVEL=debug');
      expect(envContent).toContain('CORS_ORIGIN=http://localhost:3000');
    });

    test('should have secure default values for JWT', () => {
      expect(envContent).toContain('JWT_ACCESS_EXPIRES_IN=1h');
      expect(envContent).toContain('JWT_REFRESH_EXPIRES_IN=7d');
      expect(envContent).toContain('JWT_ALGORITHM=HS256');
      expect(envContent).toContain('JWT_ISSUER=task-management-system');
    });

    test('should have reasonable database connection defaults', () => {
      expect(envContent).toContain('DB_MAX_CONNECTIONS=20');
      expect(envContent).toContain('DB_MIN_CONNECTIONS=5');
      expect(envContent).toContain('DB_CONNECTION_TIMEOUT=30000');
      expect(envContent).toContain('DB_RETRY_ATTEMPTS=3');
    });

    test('should have appropriate Redis defaults', () => {
      expect(envContent).toContain('REDIS_PORT=6379');
      expect(envContent).toContain('REDIS_DB=0');
      expect(envContent).toContain('CACHE_DEFAULT_TTL=3600');
      expect(envContent).toContain('CACHE_KEY_PREFIX=task-mgmt:');
    });
  });

  describe('Security Considerations', () => {
    test('should contain security warnings for production', () => {
      expect(envContent).toContain('CHANGE IN PRODUCTION');
      expect(envContent).toContain('Never commit .env files');
      expect(envContent).toContain('Use strong, unique values');
    });

    test('should have development-only JWT secret warning', () => {
      expect(envContent).toContain('dev_jwt_secret_key_for_development_only');
      expect(envContent).toContain('openssl rand -base64 32');
    });

    test('should enable security features by default', () => {
      expect(envContent).toContain('HELMET_ENABLED=true');
      expect(envContent).toContain('RATE_LIMIT_ENABLED=true');
    });
  });

  describe('Format Validation', () => {
    test('should have proper variable format (KEY=value)', () => {
      const lines = envContent.split('\n');
      const variableLines = lines.filter(line => 
        line.trim() && 
        !line.trim().startsWith('#') && 
        line.includes('=')
      );

      variableLines.forEach(line => {
        expect(line).toMatch(/^[A-Z_][A-Z0-9_]*=.*$/);
      });
    });

    test('should not contain actual sensitive values', () => {
      const sensitivePatterns = [
        /password.*[^=].*[a-zA-Z0-9]{8,}/i,
        /secret.*[^=].*[a-zA-Z0-9]{16,}/i,
        /key.*[^=].*[a-zA-Z0-9]{16,}/i
      ];

      // Should not match actual production values
      const hasActualSecrets = sensitivePatterns.some(pattern => {
        const matches = envContent.match(pattern);
        return matches && !matches[0].includes('dev_') && !matches[0].includes('example');
      });

      expect(hasActualSecrets).toBe(false);
    });
  });

  describe('Documentation Quality', () => {
    test('should have comprehensive comments', () => {
      const commentLines = envContent.split('\n').filter(line => 
        line.trim().startsWith('#')
      );

      expect(commentLines.length).toBeGreaterThan(50);
    });

    test('should have usage instructions', () => {
      expect(envContent).toContain('Copy this file to .env');
      expect(envContent).toContain('update values for your environment');
      expect(envContent).toContain('For more information, see:');
    });

    test('should reference documentation files', () => {
      expect(envContent).toContain('README.md');
      expect(envContent).toContain('docs/');
    });
  });

  describe('Environment-Specific Configuration', () => {
    test('should have development-friendly defaults', () => {
      expect(envContent).toContain('localhost');
      expect(envContent).toContain('dev_password');
      expect(envContent).toContain('DEBUG_ENABLED=true');
    });

    test('should include production configuration examples', () => {
      expect(envContent).toContain('SSL_ENABLED');
      expect(envContent).toContain('BACKUP_ENABLED');
      expect(envContent).toContain('HEALTH_CHECK_ENABLED');
    });

    test('should include test environment configuration', () => {
      expect(envContent).toContain('TEST_DATABASE_URL');
      expect(envContent).toContain('SEED_ENABLED');
    });
  });
});
