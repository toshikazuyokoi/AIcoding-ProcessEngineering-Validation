/**
 * ===================================
 * ESLint Configuration Test Suite
 * ===================================
 * Purpose: Comprehensive tests for ESLint configuration
 * Features:
 * - Configuration structure validation
 * - Rule configuration verification
 * - Plugin and extension validation
 * - Environment and parser settings
 * - Override and ignore pattern testing
 * - Integration with project structure
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

describe('ESLint Configuration Tests', () => {
  const eslintConfigPath = path.join(__dirname, '../.eslintrc.js');
  let eslintConfig: any;

  beforeAll(() => {
    // Load ESLint configuration
    if (fs.existsSync(eslintConfigPath)) {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      eslintConfig = require(eslintConfigPath);
    }
  });

  // ===================================
  // Configuration File Tests
  // ===================================

  describe('Configuration File', () => {
    test('should exist', () => {
      expect(fs.existsSync(eslintConfigPath)).toBe(true);
    });

    test('should be a valid JavaScript module', () => {
      expect(eslintConfig).toBeDefined();
      expect(typeof eslintConfig).toBe('object');
    });

    test('should export module.exports', () => {
      expect(eslintConfig).toHaveProperty('env');
      expect(eslintConfig).toHaveProperty('parser');
      expect(eslintConfig).toHaveProperty('plugins');
      expect(eslintConfig).toHaveProperty('extends');
      expect(eslintConfig).toHaveProperty('rules');
    });
  });

  // ===================================
  // Environment Configuration Tests
  // ===================================

  describe('Environment Configuration', () => {
    test('should have Node.js environment enabled', () => {
      expect(eslintConfig.env).toHaveProperty('node', true);
    });

    test('should have ES2022 environment enabled', () => {
      expect(eslintConfig.env).toHaveProperty('es2022', true);
    });

    test('should have Jest environment enabled', () => {
      expect(eslintConfig.env).toHaveProperty('jest', true);
    });

    test('should not have browser environment enabled', () => {
      expect(eslintConfig.env).not.toHaveProperty('browser');
    });
  });

  // ===================================
  // Parser Configuration Tests
  // ===================================

  describe('Parser Configuration', () => {
    test('should use TypeScript parser', () => {
      expect(eslintConfig.parser).toBe('@typescript-eslint/parser');
    });

    test('should have correct parser options', () => {
      expect(eslintConfig.parserOptions).toHaveProperty('ecmaVersion', 2022);
      expect(eslintConfig.parserOptions).toHaveProperty('sourceType', 'module');
      expect(eslintConfig.parserOptions).toHaveProperty('project', './tsconfig.json');
      expect(eslintConfig.parserOptions).toHaveProperty('tsconfigRootDir');
    });
  });

  // ===================================
  // Plugin Configuration Tests
  // ===================================

  describe('Plugin Configuration', () => {
    test('should include required plugins', () => {
      const requiredPlugins = [
        '@typescript-eslint',
        'import',
        'jest',
        'node',
        'security',
        'prettier',
      ];

      requiredPlugins.forEach(plugin => {
        expect(eslintConfig.plugins).toContain(plugin);
      });
    });

    test('should have correct number of plugins', () => {
      expect(eslintConfig.plugins).toHaveLength(6);
    });
  });

  // ===================================
  // Extended Configuration Tests
  // ===================================

  describe('Extended Configuration', () => {
    test('should extend recommended configurations', () => {
      const requiredExtends = [
        'eslint:recommended',
        '@typescript-eslint/recommended',
        '@typescript-eslint/recommended-requiring-type-checking',
        'plugin:import/recommended',
        'plugin:import/typescript',
        'plugin:jest/recommended',
        'plugin:jest/style',
        'plugin:node/recommended',
        'plugin:security/recommended',
        'prettier',
      ];

      requiredExtends.forEach(extend => {
        expect(eslintConfig.extends).toContain(extend);
      });
    });

    test('should have prettier as last extension', () => {
      const lastExtend = eslintConfig.extends[eslintConfig.extends.length - 1];
      expect(lastExtend).toBe('prettier');
    });
  });

  // ===================================
  // Rule Configuration Tests
  // ===================================

  describe('Rule Configuration', () => {
    test('should have TypeScript specific rules', () => {
      expect(eslintConfig.rules).toHaveProperty('@typescript-eslint/no-unused-vars');
      expect(eslintConfig.rules).toHaveProperty('@typescript-eslint/explicit-function-return-type', 'error');
      expect(eslintConfig.rules).toHaveProperty('@typescript-eslint/no-explicit-any', 'error');
      expect(eslintConfig.rules).toHaveProperty('@typescript-eslint/strict-boolean-expressions', 'error');
    });

    test('should have code quality rules', () => {
      expect(eslintConfig.rules).toHaveProperty('complexity', ['error', 10]);
      expect(eslintConfig.rules).toHaveProperty('max-lines');
      expect(eslintConfig.rules).toHaveProperty('max-depth', ['error', 4]);
      expect(eslintConfig.rules).toHaveProperty('max-params', ['error', 4]);
    });

    test('should have import/export rules', () => {
      expect(eslintConfig.rules).toHaveProperty('import/order');
      expect(eslintConfig.rules).toHaveProperty('import/no-unresolved', 'error');
      expect(eslintConfig.rules).toHaveProperty('import/no-cycle', 'error');
      expect(eslintConfig.rules).toHaveProperty('import/no-duplicates', 'error');
    });

    test('should have Jest testing rules', () => {
      expect(eslintConfig.rules).toHaveProperty('jest/expect-expect', 'error');
      expect(eslintConfig.rules).toHaveProperty('jest/no-focused-tests', 'error');
      expect(eslintConfig.rules).toHaveProperty('jest/valid-expect', 'error');
    });

    test('should have security rules', () => {
      expect(eslintConfig.rules).toHaveProperty('security/detect-object-injection', 'error');
      expect(eslintConfig.rules).toHaveProperty('security/detect-eval-with-expression', 'error');
      expect(eslintConfig.rules).toHaveProperty('security/detect-unsafe-regex', 'error');
    });

    test('should have Prettier integration', () => {
      expect(eslintConfig.rules).toHaveProperty('prettier/prettier');
      expect(eslintConfig.rules['prettier/prettier'][0]).toBe('error');
    });
  });

  // ===================================
  // Settings Configuration Tests
  // ===================================

  describe('Settings Configuration', () => {
    test('should have import resolver settings', () => {
      expect(eslintConfig.settings).toHaveProperty('import/resolver');
      expect(eslintConfig.settings['import/resolver']).toHaveProperty('typescript');
      expect(eslintConfig.settings['import/resolver']).toHaveProperty('node');
    });

    test('should have TypeScript resolver configuration', () => {
      const tsResolver = eslintConfig.settings['import/resolver'].typescript;
      expect(tsResolver).toHaveProperty('alwaysTryTypes', true);
      expect(tsResolver).toHaveProperty('project', './tsconfig.json');
    });

    test('should have import parsers configuration', () => {
      expect(eslintConfig.settings).toHaveProperty('import/parsers');
      expect(eslintConfig.settings['import/parsers']).toHaveProperty('@typescript-eslint/parser');
    });
  });

  // ===================================
  // Override Configuration Tests
  // ===================================

  describe('Override Configuration', () => {
    test('should have overrides for test files', () => {
      const testOverride = eslintConfig.overrides.find((override: any) =>
        override.files.some((file: string) => file.includes('test'))
      );
      
      expect(testOverride).toBeDefined();
      expect(testOverride.env).toHaveProperty('jest', true);
      expect(testOverride.rules).toHaveProperty('@typescript-eslint/no-explicit-any', 'off');
    });

    test('should have overrides for configuration files', () => {
      const configOverride = eslintConfig.overrides.find((override: any) =>
        override.files.some((file: string) => file.includes('config'))
      );
      
      expect(configOverride).toBeDefined();
      expect(configOverride.rules).toHaveProperty('@typescript-eslint/no-var-requires', 'off');
    });

    test('should have overrides for Prisma and script files', () => {
      const prismaOverride = eslintConfig.overrides.find((override: any) =>
        override.files.some((file: string) => file.includes('prisma'))
      );
      
      expect(prismaOverride).toBeDefined();
      expect(prismaOverride.rules).toHaveProperty('no-console', 'off');
    });
  });

  // ===================================
  // Ignore Pattern Tests
  // ===================================

  describe('Ignore Pattern Configuration', () => {
    test('should ignore common directories', () => {
      const expectedIgnorePatterns = [
        'node_modules/',
        'dist/',
        'coverage/',
        '*.js.map',
        '*.d.ts',
        'prisma/migrations/',
      ];

      expectedIgnorePatterns.forEach(pattern => {
        expect(eslintConfig.ignorePatterns).toContain(pattern);
      });
    });

    test('should not ignore source directories', () => {
      const sourcePatterns = ['src/', 'config/', '__tests__/'];
      
      sourcePatterns.forEach(pattern => {
        expect(eslintConfig.ignorePatterns).not.toContain(pattern);
      });
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration with Project Structure', () => {
    test('should be compatible with TypeScript configuration', () => {
      const tsconfigPath = path.join(__dirname, '../tsconfig.json');
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      
      // Verify parser options reference correct tsconfig
      expect(eslintConfig.parserOptions.project).toBe('./tsconfig.json');
    });

    test('should be compatible with Jest configuration', () => {
      const jestConfigPath = path.join(__dirname, '../jest.config.js');
      expect(fs.existsSync(jestConfigPath)).toBe(true);
      
      // Verify Jest environment is enabled
      expect(eslintConfig.env.jest).toBe(true);
    });

    test('should be compatible with package.json scripts', () => {
      const packageJsonPath = path.join(__dirname, '../package.json');
      expect(fs.existsSync(packageJsonPath)).toBe(true);
      
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const packageJson = require(packageJsonPath);
      expect(packageJson.scripts).toHaveProperty('lint');
      expect(packageJson.scripts).toHaveProperty('lint:check');
    });
  });

  // ===================================
  // Rule Consistency Tests
  // ===================================

  describe('Rule Consistency', () => {
    test('should have consistent error levels', () => {
      const rules = eslintConfig.rules;
      
      // Critical rules should be 'error'
      const criticalRules = [
        '@typescript-eslint/no-explicit-any',
        'security/detect-eval-with-expression',
        'jest/no-focused-tests',
        'import/no-cycle',
      ];

      criticalRules.forEach(rule => {
        expect(rules[rule]).toBe('error');
      });
    });

    test('should have appropriate warning levels', () => {
      const rules = eslintConfig.rules;
      
      // Warning rules
      const warningRules = [
        'no-console',
        'jest/no-disabled-tests',
        'jest/prefer-to-have-length',
      ];

      warningRules.forEach(rule => {
        expect(rules[rule]).toBe('warn');
      });
    });

    test('should not have conflicting rules', () => {
      // Prettier should be last in extends to avoid conflicts
      const lastExtend = eslintConfig.extends[eslintConfig.extends.length - 1];
      expect(lastExtend).toBe('prettier');
      
      // Prettier rule should be configured
      expect(eslintConfig.rules).toHaveProperty('prettier/prettier');
    });
  });
});
