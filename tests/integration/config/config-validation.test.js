/**
 * ===================================
 * Configuration Validation Test Suite
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Validate integration test configuration files
 */

const fs = require('fs');
const path = require('path');

describe('Integration Test Configuration Validation', () => {
  const configDir = path.resolve(__dirname, '../../config');
  
  describe('File Existence', () => {
    test('should have jest.config.js file', () => {
      const jestConfigPath = path.join(configDir, 'jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
    });

    test('should have playwright.config.ts file', () => {
      const playwrightConfigPath = path.join(configDir, 'playwright.config.ts');
      expect(fs.existsSync(playwrightConfigPath)).toBe(true);
    });

    test('should have tsconfig.test.json file', () => {
      const tsconfigPath = path.join(configDir, 'tsconfig.test.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
    });

    test('should have test-setup.ts file', () => {
      const setupPath = path.join(configDir, 'test-setup.ts');
      expect(fs.existsSync(setupPath)).toBe(true);
    });

    test('should have global-setup.ts file', () => {
      const globalSetupPath = path.join(configDir, 'global-setup.ts');
      expect(fs.existsSync(globalSetupPath)).toBe(true);
    });

    test('should have global-teardown.ts file', () => {
      const globalTeardownPath = path.join(configDir, 'global-teardown.ts');
      expect(fs.existsSync(globalTeardownPath)).toBe(true);
    });
  });

  describe('Jest Configuration', () => {
    let jestConfig;

    beforeAll(() => {
      const jestConfigPath = path.join(configDir, 'jest.config.js');
      delete require.cache[jestConfigPath];
      jestConfig = require(jestConfigPath);
    });

    test('should have correct basic configuration', () => {
      expect(jestConfig.preset).toBe('ts-jest');
      expect(jestConfig.testEnvironment).toBe('node');
      expect(jestConfig.displayName.name).toBe('Integration Tests');
    });

    test('should have correct test patterns', () => {
      expect(jestConfig.testMatch).toContain('**/integration/**/*.test.ts');
      expect(jestConfig.testMatch).toContain('**/integration/**/*.test.js');
      expect(jestConfig.testMatch).toContain('**/support/**/*.test.ts');
      expect(jestConfig.testMatch).toContain('**/e2e/**/*.test.ts');
    });

    test('should have correct root directories', () => {
      expect(jestConfig.roots).toContain('<rootDir>/../integration');
      expect(jestConfig.roots).toContain('<rootDir>/../support');
      expect(jestConfig.roots).toContain('<rootDir>/../e2e');
    });

    test('should have coverage configuration', () => {
      expect(jestConfig.collectCoverage).toBe(true);
      expect(jestConfig.coverageDirectory).toBe('<rootDir>/../coverage/integration');
      expect(jestConfig.coverageReporters).toContain('html');
      expect(jestConfig.coverageReporters).toContain('lcov');
    });

    test('should have coverage thresholds', () => {
      expect(jestConfig.coverageThreshold.global.branches).toBe(85);
      expect(jestConfig.coverageThreshold.global.functions).toBe(90);
      expect(jestConfig.coverageThreshold.global.lines).toBe(90);
      expect(jestConfig.coverageThreshold.global.statements).toBe(90);
    });

    test('should have correct timeout for integration tests', () => {
      expect(jestConfig.testTimeout).toBe(120000); // 2 minutes
    });

    test('should have setup and teardown files', () => {
      expect(jestConfig.setupFilesAfterEnv).toContain('<rootDir>/test-setup.ts');
      expect(jestConfig.globalSetup).toBe('<rootDir>/global-setup.ts');
      expect(jestConfig.globalTeardown).toBe('<rootDir>/global-teardown.ts');
    });

    test('should have module name mapping', () => {
      expect(jestConfig.moduleNameMapper).toHaveProperty('^@/(.*)$');
      expect(jestConfig.moduleNameMapper).toHaveProperty('^@support/(.*)$');
      expect(jestConfig.moduleNameMapper).toHaveProperty('^@integration/(.*)$');
      expect(jestConfig.moduleNameMapper).toHaveProperty('^@backend/(.*)$');
    });

    test('should have reporters configuration', () => {
      expect(Array.isArray(jestConfig.reporters)).toBe(true);
      expect(jestConfig.reporters).toContain('default');
      
      const htmlReporter = jestConfig.reporters.find(r => Array.isArray(r) && r[0] === 'jest-html-reporters');
      expect(htmlReporter).toBeDefined();
      
      const junitReporter = jestConfig.reporters.find(r => Array.isArray(r) && r[0] === 'jest-junit');
      expect(junitReporter).toBeDefined();
    });
  });

  describe('TypeScript Configuration', () => {
    let tsConfig;

    beforeAll(() => {
      const tsconfigPath = path.join(configDir, 'tsconfig.test.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      tsConfig = JSON.parse(tsconfigContent);
    });

    test('should have correct compiler options', () => {
      expect(tsConfig.compilerOptions.target).toBe('ES2022');
      expect(tsConfig.compilerOptions.module).toBe('CommonJS');
      expect(tsConfig.compilerOptions.moduleResolution).toBe('node');
      expect(tsConfig.compilerOptions.strict).toBe(true);
    });

    test('should have correct path mapping', () => {
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@/*');
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@support/*');
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@integration/*');
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@backend/*');
    });

    test('should include correct directories', () => {
      expect(tsConfig.include).toContain('../integration/**/*');
      expect(tsConfig.include).toContain('../support/**/*');
      expect(tsConfig.include).toContain('../e2e/**/*');
    });

    test('should exclude correct directories', () => {
      expect(tsConfig.exclude).toContain('../node_modules');
      expect(tsConfig.exclude).toContain('../dist');
      expect(tsConfig.exclude).toContain('../coverage');
    });
  });

  describe('Environment Variables', () => {
    test('should have integration environment variables set', () => {
      expect(process.env.NODE_ENV).toBe('integration');
    });

    test('should have database configuration', () => {
      expect(process.env.DATABASE_URL).toContain('taskdb_integration');
      expect(process.env.DATABASE_URL).toContain('integration_user');
      expect(process.env.DATABASE_URL).toContain('5434');
    });

    test('should have Redis configuration', () => {
      expect(process.env.REDIS_URL).toContain('6381');
    });

    test('should have JWT configuration', () => {
      expect(process.env.JWT_SECRET).toContain('integration_jwt_secret');
    });
  });

  describe('Global Test Utilities', () => {
    test('should have global test utilities available', () => {
      expect(globalThis.testUtils).toBeDefined();
      expect(typeof globalThis.testUtils.waitFor).toBe('function');
      expect(typeof globalThis.testUtils.sleep).toBe('function');
      expect(typeof globalThis.testUtils.retry).toBe('function');
      expect(typeof globalThis.testUtils.generateTestId).toBe('function');
      expect(typeof globalThis.testUtils.getCurrentTimestamp).toBe('function');
    });

    test('should generate unique test IDs', () => {
      const id1 = globalThis.testUtils.generateTestId('test');
      const id2 = globalThis.testUtils.generateTestId('test');
      
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test-\d+-[a-z0-9]+$/);
    });

    test('should provide current timestamp', () => {
      const timestamp = globalThis.testUtils.getCurrentTimestamp();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    test('should provide sleep utility', async () => {
      const start = Date.now();
      await globalThis.testUtils.sleep(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(90);
      expect(end - start).toBeLessThan(200);
    });
  });

  describe('Configuration Consistency', () => {
    test('should have consistent path mappings between Jest and TypeScript', () => {
      const jestConfigPath = path.join(configDir, 'jest.config.js');
      const jestConfig = require(jestConfigPath);
      
      const tsconfigPath = path.join(configDir, 'tsconfig.test.json');
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      const tsConfig = JSON.parse(tsconfigContent);
      
      // Check that key path mappings exist in both configurations
      expect(jestConfig.moduleNameMapper).toHaveProperty('^@support/(.*)$');
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@support/*');
      
      expect(jestConfig.moduleNameMapper).toHaveProperty('^@integration/(.*)$');
      expect(tsConfig.compilerOptions.paths).toHaveProperty('@integration/*');
    });

    test('should have consistent timeout settings', () => {
      const jestConfigPath = path.join(configDir, 'jest.config.js');
      const jestConfig = require(jestConfigPath);
      
      // Jest timeout should be reasonable for integration tests
      expect(jestConfig.testTimeout).toBeGreaterThanOrEqual(60000); // At least 1 minute
      expect(jestConfig.testTimeout).toBeLessThanOrEqual(300000); // At most 5 minutes
    });
  });
});
