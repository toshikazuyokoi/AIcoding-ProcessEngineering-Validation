/**
 * Frontend Environment Template Validation Tests
 * 
 * Tests for TSK-050-ENV-frontend-env-example
 * Validates frontend/.env.example template file
 */

import fs from 'fs';
import path from 'path';

describe('Frontend Environment Template (.env.example)', () => {
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
      expect(envContent).toContain('Task Management System - Frontend Environment Variables');
      expect(envContent).toContain('TSK-050-ENV-frontend-env-example');
      expect(envContent).toContain('Frontend React Application Environment Configuration Template');
    });

    test('should have organized sections with headers', () => {
      const expectedSections = [
        'Application Configuration',
        'API Connection Configuration',
        'Authentication Configuration',
        'Development Environment Settings',
        'Feature Flags Configuration'
      ];

      expectedSections.forEach(section => {
        expect(envContent).toContain(section);
      });
    });
  });

  describe('Required Environment Variables', () => {
    test('should contain all API connection variables', () => {
      const apiVariables = [
        'REACT_APP_API_URL',
        'REACT_APP_WS_URL',
        'REACT_APP_API_TIMEOUT',
        'REACT_APP_API_RETRY_ATTEMPTS',
        'REACT_APP_API_RETRY_DELAY',
        'REACT_APP_API_VERSION'
      ];

      apiVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all authentication variables', () => {
      const authVariables = [
        'REACT_APP_JWT_STORAGE_KEY',
        'REACT_APP_REFRESH_TOKEN_KEY',
        'REACT_APP_AUTH_REDIRECT_URL',
        'REACT_APP_LOGIN_REDIRECT_URL',
        'REACT_APP_LOGOUT_REDIRECT_URL',
        'REACT_APP_SESSION_TIMEOUT'
      ];

      authVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all application configuration variables', () => {
      const appVariables = [
        'NODE_ENV',
        'PORT',
        'REACT_APP_APP_NAME',
        'REACT_APP_APP_VERSION',
        'REACT_APP_SUPPORT_EMAIL'
      ];

      appVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all development environment variables', () => {
      const devVariables = [
        'CHOKIDAR_USEPOLLING',
        'WATCHPACK_POLLING',
        'FAST_REFRESH',
        'GENERATE_SOURCEMAP',
        'REACT_APP_DEBUG_MODE'
      ];

      devVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });

    test('should contain all feature flag variables', () => {
      const featureVariables = [
        'REACT_APP_FEATURE_REAL_TIME_UPDATES',
        'REACT_APP_FEATURE_DARK_MODE',
        'REACT_APP_FEATURE_NOTIFICATIONS',
        'REACT_APP_FEATURE_TASK_COMMENTS',
        'REACT_APP_FEATURE_FILE_UPLOADS'
      ];

      featureVariables.forEach(variable => {
        expect(envContent).toContain(variable);
      });
    });
  });

  describe('Default Values Validation', () => {
    test('should have appropriate default values for development', () => {
      expect(envContent).toContain('NODE_ENV=development');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('REACT_APP_API_URL=http://localhost:8000');
      expect(envContent).toContain('REACT_APP_WS_URL=ws://localhost:8000');
    });

    test('should have appropriate authentication defaults', () => {
      expect(envContent).toContain('REACT_APP_JWT_STORAGE_KEY=task-mgmt-token');
      expect(envContent).toContain('REACT_APP_REFRESH_TOKEN_KEY=task-mgmt-refresh-token');
      expect(envContent).toContain('REACT_APP_AUTH_REDIRECT_URL=/dashboard');
      expect(envContent).toContain('REACT_APP_LOGIN_REDIRECT_URL=/login');
    });

    test('should have development-friendly defaults', () => {
      expect(envContent).toContain('CHOKIDAR_USEPOLLING=true');
      expect(envContent).toContain('FAST_REFRESH=true');
      expect(envContent).toContain('GENERATE_SOURCEMAP=true');
      expect(envContent).toContain('REACT_APP_DEBUG_MODE=true');
    });

    test('should have reasonable API defaults', () => {
      expect(envContent).toContain('REACT_APP_API_TIMEOUT=30000');
      expect(envContent).toContain('REACT_APP_API_RETRY_ATTEMPTS=3');
      expect(envContent).toContain('REACT_APP_API_VERSION=v1');
    });
  });

  describe('React App Prefix Validation', () => {
    test('should have REACT_APP_ prefix for client-side variables', () => {
      const lines = envContent.split('\n');
      const reactAppLines = lines.filter(line => 
        line.trim() && 
        !line.trim().startsWith('#') && 
        line.includes('REACT_APP_')
      );

      expect(reactAppLines.length).toBeGreaterThan(10);
      
      reactAppLines.forEach(line => {
        expect(line).toMatch(/^REACT_APP_[A-Z_][A-Z0-9_]*=.*$/);
      });
    });

    test('should not expose sensitive data in REACT_APP_ variables', () => {
      const lines = envContent.split('\n');
      const reactAppLines = lines.filter(line => 
        line.trim() && 
        !line.trim().startsWith('#') && 
        line.includes('REACT_APP_')
      );

      const sensitivePatterns = [
        /secret/i,
        /password/i,
        /private.*key/i,
        /api.*key/i
      ];

      reactAppLines.forEach(line => {
        const hasActualSensitiveData = sensitivePatterns.some(pattern => {
          const matches = line.match(pattern);
          return matches && !line.includes('your-') && !line.includes('example');
        });
        expect(hasActualSensitiveData).toBe(false);
      });
    });
  });

  describe('Security Considerations', () => {
    test('should contain security warnings', () => {
      expect(envContent).toContain('Never commit .env files');
      expect(envContent).toContain('REACT_APP_ prefixed variables are embedded in the build');
      expect(envContent).toContain('production deployment');
    });

    test('should have development-only values', () => {
      expect(envContent).toContain('localhost');
      expect(envContent).toContain('development');
      expect(envContent).toContain('your-google-client-id');
      expect(envContent).toContain('your-sentry-dsn');
    });

    test('should include production configuration examples', () => {
      expect(envContent).toContain('Production API URLs');
      expect(envContent).toContain('Production Build Settings');
      expect(envContent).toContain('Production Security');
    });
  });

  describe('Format Validation', () => {
    test('should have proper variable format', () => {
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

    test('should have consistent naming conventions', () => {
      const lines = envContent.split('\n');
      const reactAppLines = lines.filter(line => 
        line.trim() && 
        !line.trim().startsWith('#') && 
        line.includes('REACT_APP_')
      );

      reactAppLines.forEach(line => {
        const varName = line.split('=')[0];
        expect(varName).toMatch(/^REACT_APP_[A-Z_][A-Z0-9_]*$/);
      });
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
      expect(envContent).toContain('Restart development server');
    });

    test('should reference documentation files', () => {
      expect(envContent).toContain('README.md');
      expect(envContent).toContain('docs/');
    });
  });

  describe('Environment-Specific Configuration', () => {
    test('should have development-friendly defaults', () => {
      expect(envContent).toContain('localhost:8000');
      expect(envContent).toContain('localhost:3000');
      expect(envContent).toContain('development');
    });

    test('should include production configuration guidance', () => {
      expect(envContent).toContain('https://api.taskmanagement.com');
      expect(envContent).toContain('wss://api.taskmanagement.com');
      expect(envContent).toContain('HTTPS=true');
    });

    test('should include testing configuration', () => {
      expect(envContent).toContain('CI=false');
      expect(envContent).toContain('COVERAGE_THRESHOLD=90');
      expect(envContent).toContain('REACT_APP_E2E_BASE_URL');
    });
  });
});
