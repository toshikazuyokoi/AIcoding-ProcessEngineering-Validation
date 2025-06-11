/**
 * ===================================
 * Simple Configuration Check Test
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Basic configuration file existence verification
 */

const fs = require('fs');
const path = require('path');

describe('Simple Configuration File Check', () => {
  const projectRoot = path.resolve(__dirname, '../../..');
  const configDir = path.join(projectRoot, 'tests', 'config');
  
  test('should have tests/config directory', () => {
    expect(fs.existsSync(configDir)).toBe(true);
    expect(fs.statSync(configDir).isDirectory()).toBe(true);
  });

  test('should have jest.config.js file', () => {
    const jestConfigPath = path.join(configDir, 'jest.config.js');
    expect(fs.existsSync(jestConfigPath)).toBe(true);
    
    // Check if file is readable
    const content = fs.readFileSync(jestConfigPath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('module.exports');
  });

  test('should have playwright.config.ts file', () => {
    const playwrightConfigPath = path.join(configDir, 'playwright.config.ts');
    expect(fs.existsSync(playwrightConfigPath)).toBe(true);
    
    // Check if file is readable
    const content = fs.readFileSync(playwrightConfigPath, 'utf8');
    expect(content.length).toBeGreaterThan(0);
    expect(content).toContain('defineConfig');
  });

  test('should have tsconfig.test.json file', () => {
    const tsconfigPath = path.join(configDir, 'tsconfig.test.json');
    expect(fs.existsSync(tsconfigPath)).toBe(true);
    
    // Check if file is valid JSON
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    expect(() => JSON.parse(content)).not.toThrow();
    
    const config = JSON.parse(content);
    expect(config).toHaveProperty('compilerOptions');
  });

  test('should have test-setup.ts file', () => {
    const setupPath = path.join(configDir, 'test-setup.ts');
    expect(fs.existsSync(setupPath)).toBe(true);
    
    // Check if file contains expected content
    const content = fs.readFileSync(setupPath, 'utf8');
    expect(content).toContain('Integration Test Setup');
    expect(content).toContain('globalThis.testUtils');
  });

  test('should have global-setup.ts file', () => {
    const globalSetupPath = path.join(configDir, 'global-setup.ts');
    expect(fs.existsSync(globalSetupPath)).toBe(true);
    
    // Check if file contains expected content
    const content = fs.readFileSync(globalSetupPath, 'utf8');
    expect(content).toContain('globalSetup');
    expect(content).toContain('setupIntegrationDatabase');
  });

  test('should have global-teardown.ts file', () => {
    const globalTeardownPath = path.join(configDir, 'global-teardown.ts');
    expect(fs.existsSync(globalTeardownPath)).toBe(true);
    
    // Check if file contains expected content
    const content = fs.readFileSync(globalTeardownPath, 'utf8');
    expect(content).toContain('globalTeardown');
    expect(content).toContain('teardownIntegrationDatabase');
  });

  test('should have valid Jest configuration structure', () => {
    const jestConfigPath = path.join(configDir, 'jest.config.js');
    
    // Clear require cache to ensure fresh load
    delete require.cache[jestConfigPath];
    
    // Load configuration
    const jestConfig = require(jestConfigPath);
    
    // Basic structure checks
    expect(jestConfig).toHaveProperty('preset');
    expect(jestConfig).toHaveProperty('testEnvironment');
    expect(jestConfig).toHaveProperty('testMatch');
    expect(jestConfig).toHaveProperty('coverageDirectory');
    expect(jestConfig).toHaveProperty('testTimeout');
    
    // Verify key values
    expect(jestConfig.preset).toBe('ts-jest');
    expect(jestConfig.testEnvironment).toBe('node');
    expect(Array.isArray(jestConfig.testMatch)).toBe(true);
    expect(jestConfig.testTimeout).toBeGreaterThan(0);
  });

  test('should have valid TypeScript configuration structure', () => {
    const tsconfigPath = path.join(configDir, 'tsconfig.test.json');
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    const tsConfig = JSON.parse(content);
    
    // Basic structure checks
    expect(tsConfig).toHaveProperty('compilerOptions');
    expect(tsConfig).toHaveProperty('include');
    expect(tsConfig).toHaveProperty('exclude');
    
    // Compiler options checks
    expect(tsConfig.compilerOptions).toHaveProperty('target');
    expect(tsConfig.compilerOptions).toHaveProperty('module');
    expect(tsConfig.compilerOptions).toHaveProperty('paths');
    
    // Include/exclude checks
    expect(Array.isArray(tsConfig.include)).toBe(true);
    expect(Array.isArray(tsConfig.exclude)).toBe(true);
  });

  test('should have integration environment file', () => {
    const envPath = path.join(projectRoot, '.env.integration');
    expect(fs.existsSync(envPath)).toBe(true);
    
    // Check if file contains expected variables
    const content = fs.readFileSync(envPath, 'utf8');
    expect(content).toContain('NODE_ENV=integration');
    expect(content).toContain('DATABASE_URL=');
    expect(content).toContain('REDIS_URL=');
    expect(content).toContain('JWT_SECRET=');
  });

  test('should have docker-compose integration test file', () => {
    const dockerComposePath = path.join(projectRoot, 'docker-compose.integration-test.yml');
    expect(fs.existsSync(dockerComposePath)).toBe(true);
    
    // Check if file contains expected services
    const content = fs.readFileSync(dockerComposePath, 'utf8');
    expect(content).toContain('postgres-integration');
    expect(content).toContain('redis-integration');
    expect(content).toContain('backend-integration');
  });
});
