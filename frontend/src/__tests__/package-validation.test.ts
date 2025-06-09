/**
 * Package.json Validation Tests
 * 
 * Comprehensive test suite for package.json configuration using staged quality improvement approach.
 * Tests cover package structure, dependencies, scripts, configuration, and integration.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import fs from 'fs';
import path from 'path';

// ===================================
// Test Data and Fixtures
// ===================================

const packageJsonPath = path.resolve(__dirname, '../../package.json');
let packageJson: any;

// Load package.json
beforeAll(() => {
  const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
  packageJson = JSON.parse(packageJsonContent);
});

// ===================================
// Phase 1: Basic Package Structure
// ===================================

describe('Package.json Validation', () => {
  describe('Phase 1: Basic Package Structure', () => {
    test('should have required basic fields', () => {
      expect(packageJson.name).toBe('task-management-frontend');
      expect(packageJson.version).toBe('1.0.0');
      expect(packageJson.description).toContain('Task Management System Frontend');
      expect(packageJson.private).toBe(true);
      expect(packageJson.type).toBe('module');
    });

    test('should have proper engine requirements', () => {
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toBe('>=20.11.0');
      expect(packageJson.engines.npm).toBe('>=10.2.0');
    });

    test('should have repository information', () => {
      expect(packageJson.repository).toBeDefined();
      expect(packageJson.repository.type).toBe('git');
      expect(packageJson.repository.url).toContain('github.com');
      expect(packageJson.repository.directory).toBe('frontend');
    });

    test('should have proper metadata', () => {
      expect(packageJson.author).toBeDefined();
      expect(packageJson.license).toBe('MIT');
      expect(packageJson.keywords).toBeInstanceOf(Array);
      expect(packageJson.keywords).toContain('react');
      expect(packageJson.keywords).toContain('typescript');
      expect(packageJson.keywords).toContain('process-engineering');
    });

    test('should have volta configuration', () => {
      expect(packageJson.volta).toBeDefined();
      expect(packageJson.volta.node).toBe('20.11.0');
      expect(packageJson.volta.npm).toBeDefined();
    });
  });

  // ===================================
  // Phase 2: Dependencies and Versions
  // ===================================

  describe('Phase 2: Dependencies and Versions', () => {
    test('should have required production dependencies', () => {
      const requiredDeps = [
        'react',
        'react-dom',
        'react-router-dom'
      ];

      requiredDeps.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    test('should have utility dependencies', () => {
      const utilityDeps = [
        'clsx',
        'date-fns',
        'axios'
      ];

      utilityDeps.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
      });
    });

    test('should have required development dependencies', () => {
      const requiredDevDeps = [
        '@types/react',
        '@types/react-dom',
        '@types/node',
        'typescript',
        'vite',
        '@vitejs/plugin-react'
      ];

      requiredDevDeps.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });

    test('should have testing dependencies', () => {
      const testingDeps = [
        'jest',
        '@testing-library/react',
        '@testing-library/jest-dom',
        '@testing-library/user-event',
        'jest-environment-jsdom',
        'ts-jest'
      ];

      testingDeps.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });

    test('should have code quality dependencies', () => {
      const qualityDeps = [
        'eslint',
        '@typescript-eslint/eslint-plugin',
        '@typescript-eslint/parser',
        'prettier',
        'husky',
        'lint-staged'
      ];

      qualityDeps.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
      });
    });

    test('should have compatible React versions', () => {
      const reactVersion = packageJson.dependencies.react;
      const reactDomVersion = packageJson.dependencies['react-dom'];
      const reactTypesVersion = packageJson.devDependencies['@types/react'];

      expect(reactVersion).toMatch(/^\^18\./);
      expect(reactDomVersion).toMatch(/^\^18\./);
      expect(reactTypesVersion).toMatch(/^\^18\./);
    });
  });

  // ===================================
  // Phase 3: Scripts Configuration
  // ===================================

  describe('Phase 3: Scripts Configuration', () => {
    test('should have development scripts', () => {
      const devScripts = [
        'dev',
        'dev:host',
        'dev:debug'
      ];

      devScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    test('should have build scripts', () => {
      const buildScripts = [
        'build',
        'build:analyze',
        'build:prod',
        'preview',
        'preview:host'
      ];

      buildScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    test('should have test scripts', () => {
      const testScripts = [
        'test',
        'test:watch',
        'test:coverage',
        'test:ci',
        'test:unit',
        'test:integration'
      ];

      testScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    test('should have quality scripts', () => {
      const qualityScripts = [
        'lint',
        'lint:fix',
        'lint:check',
        'format',
        'format:check',
        'type-check',
        'quality-check'
      ];

      qualityScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    test('should have utility scripts', () => {
      const utilityScripts = [
        'clean',
        'clean:deps',
        'prepare',
        'postinstall'
      ];

      utilityScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
      });
    });

    test('should have proper script commands', () => {
      expect(packageJson.scripts.dev).toContain('vite');
      expect(packageJson.scripts.build).toContain('tsc');
      expect(packageJson.scripts.build).toContain('vite build');
      expect(packageJson.scripts.test).toBe('jest');
      expect(packageJson.scripts.lint).toContain('eslint');
      expect(packageJson.scripts.format).toContain('prettier');
    });
  });

  // ===================================
  // Phase 4: Configuration Settings
  // ===================================

  describe('Phase 4: Configuration Settings', () => {
    test('should have Jest configuration', () => {
      expect(packageJson.jest).toBeDefined();
      expect(packageJson.jest.preset).toBe('ts-jest');
      expect(packageJson.jest.testEnvironment).toBe('jsdom');
      expect(packageJson.jest.setupFilesAfterEnv).toContain('<rootDir>/src/setupTests.ts');
    });

    test('should have Jest coverage configuration', () => {
      expect(packageJson.jest.collectCoverageFrom).toBeDefined();
      expect(packageJson.jest.coverageThreshold).toBeDefined();
      expect(packageJson.jest.coverageThreshold.global.lines).toBe(90);
      expect(packageJson.jest.coverageThreshold.global.functions).toBe(90);
      expect(packageJson.jest.coverageThreshold.global.branches).toBe(90);
      expect(packageJson.jest.coverageThreshold.global.statements).toBe(90);
    });

    test('should have ESLint configuration', () => {
      expect(packageJson.eslintConfig).toBeDefined();
      expect(packageJson.eslintConfig.extends).toContain('@typescript-eslint/recommended');
      expect(packageJson.eslintConfig.extends).toContain('plugin:react/recommended');
      expect(packageJson.eslintConfig.extends).toContain('prettier');
    });

    test('should have Prettier configuration', () => {
      expect(packageJson.prettier).toBeDefined();
      expect(packageJson.prettier.semi).toBe(true);
      expect(packageJson.prettier.singleQuote).toBe(true);
      expect(packageJson.prettier.printWidth).toBe(100);
      expect(packageJson.prettier.tabWidth).toBe(2);
    });

    test('should have lint-staged configuration', () => {
      expect(packageJson['lint-staged']).toBeDefined();
      expect(packageJson['lint-staged']['*.{ts,tsx}']).toBeDefined();
      expect(packageJson['lint-staged']['*.{js,jsx,json,css,md}']).toBeDefined();
    });

    test('should have browserslist configuration', () => {
      expect(packageJson.browserslist).toBeDefined();
      expect(packageJson.browserslist.production).toBeDefined();
      expect(packageJson.browserslist.development).toBeDefined();
    });
  });

  // ===================================
  // Phase 5: Integration and Quality
  // ===================================

  describe('Phase 5: Integration and Quality', () => {
    test('should have no conflicting dependencies', () => {
      const dependencies = Object.keys(packageJson.dependencies || {});
      const devDependencies = Object.keys(packageJson.devDependencies || {});

      const conflicts = dependencies.filter(dep => devDependencies.includes(dep));
      expect(conflicts).toHaveLength(0);
    });

    test('should have proper TypeScript configuration dependencies', () => {
      expect(packageJson.devDependencies.typescript).toBeDefined();
      expect(packageJson.devDependencies['@typescript-eslint/parser']).toBeDefined();
      expect(packageJson.devDependencies['@typescript-eslint/eslint-plugin']).toBeDefined();
    });

    test('should have proper React configuration', () => {
      expect(packageJson.eslintConfig.settings.react.version).toBe('detect');
      expect(packageJson.eslintConfig.rules['react/react-in-jsx-scope']).toBe('off');
    });

    test('should have security-focused configurations', () => {
      // Check for security-related ESLint rules
      expect(packageJson.eslintConfig.extends).toContain('plugin:jsx-a11y/recommended');

      // Check for proper dependency versions (no wildcards in production)
      const prodDeps = packageJson.dependencies || {};
      Object.values(prodDeps).forEach((version: any) => {
        expect(version).toMatch(/^\^/); // Should use caret ranges
      });
    });

    test('should have proper Git hooks configuration', () => {
      expect(packageJson.husky).toBeDefined();
      expect(packageJson.husky.hooks).toBeDefined();
      expect(packageJson.husky.hooks['pre-commit']).toBe('lint-staged');
      expect(packageJson.husky.hooks['pre-push']).toBe('npm run quality-check');
    });

    test('should have comprehensive quality check script', () => {
      const qualityCheck = packageJson.scripts['quality-check'];
      expect(qualityCheck).toContain('type-check');
      expect(qualityCheck).toContain('lint:check');
      expect(qualityCheck).toContain('format:check');
      expect(qualityCheck).toContain('test:ci');
    });

    test('should have proper test patterns', () => {
      expect(packageJson.jest.testMatch).toContain('**/__tests__/**/*.test.{ts,tsx}');
      expect(packageJson.jest.testMatch).toContain('**/*.test.{ts,tsx}');
    });

    test('should exclude proper files from coverage', () => {
      const excludePatterns = packageJson.jest.collectCoverageFrom.filter((pattern: string) =>
        pattern.startsWith('!')
      );

      expect(excludePatterns).toContain('!src/**/*.d.ts');
      expect(excludePatterns).toContain('!src/main.tsx');
      expect(excludePatterns).toContain('!src/vite-env.d.ts');
    });

    test('should have proper module resolution', () => {
      expect(packageJson.jest.moduleNameMapping).toBeDefined();
      expect(packageJson.jest.moduleNameMapping['^@/(.*)$']).toBe('<rootDir>/src/$1');
    });

    test('should have proper file extensions configuration', () => {
      const extensions = packageJson.jest.moduleFileExtensions;
      expect(extensions).toContain('ts');
      expect(extensions).toContain('tsx');
      expect(extensions).toContain('js');
      expect(extensions).toContain('jsx');
      expect(extensions).toContain('json');
    });

    test('should have proper coverage reporters', () => {
      const reporters = packageJson.jest.coverageReporters;
      expect(reporters).toContain('text');
      expect(reporters).toContain('lcov');
      expect(reporters).toContain('html');
      expect(reporters).toContain('json-summary');
    });

    test('should have proper build analysis tools', () => {
      expect(packageJson.devDependencies['vite-bundle-analyzer']).toBeDefined();
      expect(packageJson.scripts['build:analyze']).toContain('vite-bundle-analyzer');
    });

    test('should have proper development tools', () => {
      expect(packageJson.devDependencies.concurrently).toBeDefined();
      expect(packageJson.devDependencies['cross-env']).toBeDefined();
      expect(packageJson.devDependencies.rimraf).toBeDefined();
    });

    test('should have proper E2E testing setup', () => {
      expect(packageJson.devDependencies['@playwright/test']).toBeDefined();
      expect(packageJson.scripts['test:e2e']).toBe('playwright test');
      expect(packageJson.scripts['test:e2e:ui']).toBe('playwright test --ui');
      expect(packageJson.scripts['test:e2e:debug']).toBe('playwright test --debug');
    });

    test('should have proper accessibility testing', () => {
      expect(packageJson.devDependencies['eslint-plugin-jsx-a11y']).toBeDefined();
      expect(packageJson.eslintConfig.plugins).toContain('jsx-a11y');
    });

    test('should have proper import management', () => {
      expect(packageJson.devDependencies['eslint-plugin-import']).toBeDefined();
    });

    test('should have proper React development tools', () => {
      expect(packageJson.devDependencies['eslint-plugin-react-refresh']).toBeDefined();
      expect(packageJson.eslintConfig.plugins).toContain('react-refresh');
      expect(packageJson.eslintConfig.rules['react-refresh/only-export-components']).toBe('warn');
    });
  });
});
