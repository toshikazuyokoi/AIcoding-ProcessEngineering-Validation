/**
 * Jest Configuration Test Suite
 * 
 * Comprehensive tests for Jest configuration validation
 * Tests configuration structure, coverage settings, module resolution, and test execution options
 * 
 * @fileoverview Test suite for Jest configuration
 * @version 1.0.0
 * @since 2025-02-01
 */

import * as fs from 'fs';
import * as path from 'path';

// Load Jest configuration
const jestConfigPath = path.join(__dirname, '../../jest.config.js');
let jestConfig: any;

describe('Jest Configuration', () => {
  beforeAll(() => {
    // Load the Jest configuration file
    if (fs.existsSync(jestConfigPath)) {
      // Clear require cache to ensure fresh load
      delete require.cache[require.resolve('../../jest.config.js')];
      jestConfig = require('../../jest.config.js');
    }
  });

  describe('Configuration File Existence', () => {
    test('should have jest.config.js file', () => {
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    test('should export valid configuration object', () => {
      expect(jestConfig).toBeDefined();
      expect(typeof jestConfig).toBe('object');
      expect(jestConfig).not.toBeNull();
    });
  });

  describe('Basic Configuration', () => {
    test('should use ts-jest preset', () => {
      expect(jestConfig.preset).toBe('ts-jest');
    });

    test('should use node test environment', () => {
      expect(jestConfig.testEnvironment).toBe('node');
    });

    test('should have correct test roots', () => {
      expect(jestConfig.roots).toBeDefined();
      expect(Array.isArray(jestConfig.roots)).toBe(true);
      expect(jestConfig.roots).toContain('<rootDir>/src');
      expect(jestConfig.roots).toContain('<rootDir>/config');
      expect(jestConfig.roots).toContain('<rootDir>/__tests__');
    });

    test('should have test match patterns', () => {
      expect(jestConfig.testMatch).toBeDefined();
      expect(Array.isArray(jestConfig.testMatch)).toBe(true);
      expect(jestConfig.testMatch).toContain('**/__tests__/**/*.test.ts');
      expect(jestConfig.testMatch).toContain('**/__tests__/**/*.test.js');
    });

    test('should ignore appropriate test paths', () => {
      expect(jestConfig.testPathIgnorePatterns).toBeDefined();
      expect(Array.isArray(jestConfig.testPathIgnorePatterns)).toBe(true);
      expect(jestConfig.testPathIgnorePatterns).toContain('/node_modules/');
      expect(jestConfig.testPathIgnorePatterns).toContain('/dist/');
      expect(jestConfig.testPathIgnorePatterns).toContain('/coverage/');
    });
  });

  describe('Module Resolution', () => {
    test('should have module name mapper for path aliases', () => {
      expect(jestConfig.moduleNameMapper).toBeDefined();
      expect(typeof jestConfig.moduleNameMapper).toBe('object');
      
      // Check key path aliases
      expect(jestConfig.moduleNameMapper['^@/(.*)$']).toBe('<rootDir>/src/$1');
      expect(jestConfig.moduleNameMapper['^@config/(.*)$']).toBe('<rootDir>/config/$1');
      expect(jestConfig.moduleNameMapper['^@tests/(.*)$']).toBe('<rootDir>/__tests__/$1');
      expect(jestConfig.moduleNameMapper['^@utils/(.*)$']).toBe('<rootDir>/src/utils/$1');
      expect(jestConfig.moduleNameMapper['^@repositories/(.*)$']).toBe('<rootDir>/src/repositories/$1');
      expect(jestConfig.moduleNameMapper['^@services/(.*)$']).toBe('<rootDir>/src/services/$1');
    });

    test('should have correct module file extensions', () => {
      expect(jestConfig.moduleFileExtensions).toBeDefined();
      expect(Array.isArray(jestConfig.moduleFileExtensions)).toBe(true);
      expect(jestConfig.moduleFileExtensions).toContain('ts');
      expect(jestConfig.moduleFileExtensions).toContain('tsx');
      expect(jestConfig.moduleFileExtensions).toContain('js');
      expect(jestConfig.moduleFileExtensions).toContain('jsx');
      expect(jestConfig.moduleFileExtensions).toContain('json');
    });

    test('should have module directories', () => {
      expect(jestConfig.moduleDirectories).toBeDefined();
      expect(Array.isArray(jestConfig.moduleDirectories)).toBe(true);
      expect(jestConfig.moduleDirectories).toContain('node_modules');
      expect(jestConfig.moduleDirectories).toContain('<rootDir>/src');
    });
  });

  describe('Coverage Configuration', () => {
    test('should have coverage collection disabled by default', () => {
      expect(jestConfig.collectCoverage).toBe(false);
    });

    test('should have coverage collection patterns', () => {
      expect(jestConfig.collectCoverageFrom).toBeDefined();
      expect(Array.isArray(jestConfig.collectCoverageFrom)).toBe(true);
      expect(jestConfig.collectCoverageFrom).toContain('src/**/*.ts');
      expect(jestConfig.collectCoverageFrom).toContain('config/**/*.ts');
    });

    test('should exclude appropriate files from coverage', () => {
      const excludePatterns = jestConfig.collectCoverageFrom.filter((pattern: string) => pattern.startsWith('!'));
      expect(excludePatterns).toContain('!src/**/*.d.ts');
      expect(excludePatterns).toContain('!src/index.ts');
      expect(excludePatterns).toContain('!src/**/*.interface.ts');
      expect(excludePatterns).toContain('!src/**/*.type.ts');
      expect(excludePatterns).toContain('!__tests__/**');
    });

    test('should have coverage directory configured', () => {
      expect(jestConfig.coverageDirectory).toBe('coverage');
    });

    test('should have coverage reporters', () => {
      expect(jestConfig.coverageReporters).toBeDefined();
      expect(Array.isArray(jestConfig.coverageReporters)).toBe(true);
      expect(jestConfig.coverageReporters).toContain('text');
      expect(jestConfig.coverageReporters).toContain('lcov');
      expect(jestConfig.coverageReporters).toContain('html');
      expect(jestConfig.coverageReporters).toContain('json');
    });

    test('should have coverage thresholds', () => {
      expect(jestConfig.coverageThreshold).toBeDefined();
      expect(jestConfig.coverageThreshold.global).toBeDefined();
      
      const globalThreshold = jestConfig.coverageThreshold.global;
      expect(globalThreshold.branches).toBeGreaterThanOrEqual(85);
      expect(globalThreshold.functions).toBeGreaterThanOrEqual(90);
      expect(globalThreshold.lines).toBeGreaterThanOrEqual(90);
      expect(globalThreshold.statements).toBeGreaterThanOrEqual(90);
    });

    test('should have specific thresholds for critical directories', () => {
      expect(jestConfig.coverageThreshold['./src/repositories/']).toBeDefined();
      expect(jestConfig.coverageThreshold['./src/services/']).toBeDefined();
      
      const repoThreshold = jestConfig.coverageThreshold['./src/repositories/'];
      expect(repoThreshold.functions).toBe(95);
      expect(repoThreshold.lines).toBe(95);
    });
  });

  describe('Test Execution Configuration', () => {
    test('should have appropriate test timeout', () => {
      expect(jestConfig.testTimeout).toBe(30000);
    });

    test('should have verbose output enabled', () => {
      expect(jestConfig.verbose).toBe(true);
    });

    test('should detect open handles', () => {
      expect(jestConfig.detectOpenHandles).toBe(true);
    });

    test('should force exit after tests', () => {
      expect(jestConfig.forceExit).toBe(true);
    });

    test('should clear mocks between tests', () => {
      expect(jestConfig.clearMocks).toBe(true);
      expect(jestConfig.resetMocks).toBe(true);
      expect(jestConfig.restoreMocks).toBe(true);
    });

    test('should have reasonable max workers setting', () => {
      expect(jestConfig.maxWorkers).toBe('50%');
    });

    test('should have cache directory configured', () => {
      expect(jestConfig.cacheDirectory).toBe('<rootDir>/node_modules/.cache/jest');
    });
  });

  describe('Setup and Teardown Configuration', () => {
    test('should have setup files configuration available (commented out)', () => {
      // Setup files are commented out in the configuration
      // This test verifies the configuration structure is ready
      expect(jestConfig.setupFilesAfterEnv).toBeUndefined();
    });

    test('should have global setup and teardown configuration available (commented out)', () => {
      // Global setup/teardown are commented out in the configuration
      // This test verifies the configuration structure is ready
      expect(jestConfig.globalSetup).toBeUndefined();
      expect(jestConfig.globalTeardown).toBeUndefined();
    });
  });

  describe('Transform Configuration', () => {
    test('should have TypeScript transform configured', () => {
      expect(jestConfig.transform).toBeDefined();
      expect(jestConfig.transform['^.+\\.ts$']).toBeDefined();
      
      const tsTransform = jestConfig.transform['^.+\\.ts$'];
      expect(Array.isArray(tsTransform)).toBe(true);
      expect(tsTransform[0]).toBe('ts-jest');
      expect(tsTransform[1]).toBeDefined();
      expect(typeof tsTransform[1]).toBe('object');
    });

    test('should have transform ignore patterns', () => {
      expect(jestConfig.transformIgnorePatterns).toBeDefined();
      expect(Array.isArray(jestConfig.transformIgnorePatterns)).toBe(true);
    });
  });

  describe('Environment Configuration', () => {
    test('should have test environment options', () => {
      expect(jestConfig.testEnvironmentOptions).toBeDefined();
      expect(jestConfig.testEnvironmentOptions.NODE_ENV).toBe('test');
    });

    test('should have error handling configured', () => {
      expect(jestConfig.errorOnDeprecated).toBe(true);
    });

    test('should have notification settings', () => {
      expect(jestConfig.notify).toBe(false);
      expect(jestConfig.notifyMode).toBe('failure-change');
    });
  });

  describe('Watch Mode Configuration', () => {
    test('should have watch path ignore patterns', () => {
      expect(jestConfig.watchPathIgnorePatterns).toBeDefined();
      expect(Array.isArray(jestConfig.watchPathIgnorePatterns)).toBe(true);
      expect(jestConfig.watchPathIgnorePatterns).toContain('/node_modules/');
      expect(jestConfig.watchPathIgnorePatterns).toContain('/dist/');
      expect(jestConfig.watchPathIgnorePatterns).toContain('/coverage/');
    });

    test('should have watch plugins configuration available (commented out)', () => {
      // Watch plugins are commented out in the configuration
      // This test verifies the configuration structure is ready
      expect(jestConfig.watchPlugins).toBeUndefined();
    });
  });

  describe('Configuration Validation', () => {
    test('should not have conflicting settings', () => {
      // Ensure coverage is disabled by default but can be enabled
      expect(jestConfig.collectCoverage).toBe(false);
      expect(jestConfig.collectCoverageFrom).toBeDefined();
      
      // Ensure test timeout is reasonable
      expect(jestConfig.testTimeout).toBeGreaterThan(0);
      expect(jestConfig.testTimeout).toBeLessThanOrEqual(60000);
    });

    test('should have all required configuration sections', () => {
      const requiredSections = [
        'preset',
        'testEnvironment',
        'roots',
        'testMatch',
        'moduleNameMapper',
        'collectCoverageFrom',
        'coverageDirectory',
        'coverageReporters',
        'testTimeout'
      ];

      requiredSections.forEach(section => {
        expect(jestConfig[section]).toBeDefined();
      });
    });
  });
});
