// ===================================
// Task Management System - Package.json Configuration Tests
// ===================================
// Generated for TSK-038-ENV-backend-package
// Project: Task Management System
// Component: Package Configuration Test Suite
// Purpose: Comprehensive testing of package.json configuration

import * as fs from 'fs';
import * as path from 'path';

// ===================================
// Test Setup and Utilities
// ===================================

describe('Package.json Configuration', () => {
  let packageJson: any;
  const packagePath = path.join(__dirname, '..', 'package.json');

  beforeAll(() => {
    // Load package.json
    const packageContent = fs.readFileSync(packagePath, 'utf8');
    packageJson = JSON.parse(packageContent);
  });

  // ===================================
  // Basic Configuration Tests
  // ===================================

  describe('Basic Configuration', () => {
    test('should have correct package name', () => {
      expect(packageJson.name).toBe('task-management-backend');
    });

    test('should have version defined', () => {
      expect(packageJson.version).toBeDefined();
      expect(typeof packageJson.version).toBe('string');
      expect(packageJson.version).toMatch(/^\d+\.\d+\.\d+$/);
    });

    test('should have description', () => {
      expect(packageJson.description).toBeDefined();
      expect(typeof packageJson.description).toBe('string');
      expect(packageJson.description.length).toBeGreaterThan(10);
    });

    test('should have main entry point', () => {
      expect(packageJson.main).toBe('dist/index.js');
    });

    test('should have author', () => {
      expect(packageJson.author).toBeDefined();
      expect(typeof packageJson.author).toBe('string');
    });

    test('should have license', () => {
      expect(packageJson.license).toBe('MIT');
    });
  });

  // ===================================
  // Engine Requirements Tests
  // ===================================

  describe('Engine Requirements', () => {
    test('should specify Node.js version requirement', () => {
      expect(packageJson.engines).toBeDefined();
      expect(packageJson.engines.node).toBeDefined();
      expect(packageJson.engines.node).toMatch(/>=\d+\.\d+\.\d+/);
    });

    test('should specify npm version requirement', () => {
      expect(packageJson.engines.npm).toBeDefined();
      expect(packageJson.engines.npm).toMatch(/>=\d+\.\d+\.\d+/);
    });

    test('should require Node.js 20.11.0 or higher', () => {
      const nodeVersion = packageJson.engines.node.replace('>=', '');
      const [major, minor, patch] = nodeVersion.split('.').map(Number);
      expect(major).toBeGreaterThanOrEqual(20);
      if (major === 20) {
        expect(minor).toBeGreaterThanOrEqual(11);
      }
    });
  });

  // ===================================
  // Scripts Configuration Tests
  // ===================================

  describe('Scripts Configuration', () => {
    const requiredScripts = [
      'dev',
      'dev:debug',
      'build',
      'start',
      'start:prod',
      'test',
      'test:watch',
      'test:coverage',
      'test:unit',
      'test:integration',
      'test:e2e',
      'test:ci',
      'lint',
      'lint:check',
      'format',
      'format:check',
      'type-check',
      'quality-check',
      'db:generate',
      'db:push',
      'db:migrate',
      'db:migrate:prod',
      'db:seed',
      'db:reset',
      'db:studio',
      'security:audit',
      'security:fix',
      'clean',
      'precommit',
      'prepare'
    ];

    test('should have all required scripts', () => {
      expect(packageJson.scripts).toBeDefined();
      
      requiredScripts.forEach(script => {
        expect(packageJson.scripts[script]).toBeDefined();
        expect(typeof packageJson.scripts[script]).toBe('string');
        expect(packageJson.scripts[script].length).toBeGreaterThan(0);
      });
    });

    test('should have development script with proper configuration', () => {
      expect(packageJson.scripts.dev).toContain('ts-node-dev');
      expect(packageJson.scripts.dev).toContain('--respawn');
      expect(packageJson.scripts.dev).toContain('--transpile-only');
    });

    test('should have debug script with inspect flag', () => {
      expect(packageJson.scripts['dev:debug']).toContain('--inspect');
    });

    test('should have build script', () => {
      expect(packageJson.scripts.build).toContain('tsc');
    });

    test('should have test scripts for different environments', () => {
      expect(packageJson.scripts.test).toContain('jest');
      expect(packageJson.scripts['test:watch']).toContain('jest --watch');
      expect(packageJson.scripts['test:coverage']).toContain('jest --coverage');
      expect(packageJson.scripts['test:ci']).toContain('--ci');
    });

    test('should have linting and formatting scripts', () => {
      expect(packageJson.scripts.lint).toContain('eslint');
      expect(packageJson.scripts.format).toContain('prettier');
    });

    test('should have database management scripts', () => {
      expect(packageJson.scripts['db:generate']).toContain('prisma generate');
      expect(packageJson.scripts['db:migrate']).toContain('prisma migrate');
      expect(packageJson.scripts['db:studio']).toContain('prisma studio');
    });

    test('should have security audit scripts', () => {
      expect(packageJson.scripts['security:audit']).toContain('npm audit');
      expect(packageJson.scripts['security:fix']).toContain('npm audit fix');
    });

    test('should have quality check script', () => {
      expect(packageJson.scripts['quality-check']).toContain('lint:check');
      expect(packageJson.scripts['quality-check']).toContain('format:check');
      expect(packageJson.scripts['quality-check']).toContain('type-check');
      expect(packageJson.scripts['quality-check']).toContain('test:ci');
    });
  });

  // ===================================
  // Dependencies Tests
  // ===================================

  describe('Dependencies', () => {
    const requiredDependencies = [
      '@prisma/client',
      'bcrypt',
      'compression',
      'cors',
      'dotenv',
      'express',
      'express-rate-limit',
      'helmet',
      'ioredis',
      'jsonwebtoken',
      'morgan',
      'multer',
      'winston',
      'zod'
    ];

    test('should have all required production dependencies', () => {
      expect(packageJson.dependencies).toBeDefined();
      
      requiredDependencies.forEach(dep => {
        expect(packageJson.dependencies[dep]).toBeDefined();
        expect(typeof packageJson.dependencies[dep]).toBe('string');
        expect(packageJson.dependencies[dep]).toMatch(/^\^?\d+\.\d+\.\d+/);
      });
    });

    test('should have Express.js for web framework', () => {
      expect(packageJson.dependencies.express).toBeDefined();
    });

    test('should have Prisma client for database', () => {
      expect(packageJson.dependencies['@prisma/client']).toBeDefined();
    });

    test('should have Redis client', () => {
      expect(packageJson.dependencies.ioredis).toBeDefined();
    });

    test('should have security dependencies', () => {
      expect(packageJson.dependencies.helmet).toBeDefined();
      expect(packageJson.dependencies.bcrypt).toBeDefined();
      expect(packageJson.dependencies.jsonwebtoken).toBeDefined();
    });

    test('should have validation library', () => {
      expect(packageJson.dependencies.zod).toBeDefined();
    });

    test('should have logging library', () => {
      expect(packageJson.dependencies.winston).toBeDefined();
    });
  });

  // ===================================
  // Development Dependencies Tests
  // ===================================

  describe('Development Dependencies', () => {
    const requiredDevDependencies = [
      '@types/bcrypt',
      '@types/compression',
      '@types/cors',
      '@types/express',
      '@types/jest',
      '@types/jsonwebtoken',
      '@types/morgan',
      '@types/multer',
      '@types/node',
      '@types/supertest',
      '@typescript-eslint/eslint-plugin',
      '@typescript-eslint/parser',
      'eslint',
      'eslint-config-prettier',
      'eslint-plugin-import',
      'eslint-plugin-jest',
      'eslint-plugin-prettier',
      'eslint-plugin-security',
      'husky',
      'jest',
      'lint-staged',
      'prettier',
      'prisma',
      'rimraf',
      'supertest',
      'ts-jest',
      'ts-node',
      'ts-node-dev',
      'typescript'
    ];

    test('should have all required development dependencies', () => {
      expect(packageJson.devDependencies).toBeDefined();
      
      requiredDevDependencies.forEach(dep => {
        expect(packageJson.devDependencies[dep]).toBeDefined();
        expect(typeof packageJson.devDependencies[dep]).toBe('string');
      });
    });

    test('should have TypeScript and related tools', () => {
      expect(packageJson.devDependencies.typescript).toBeDefined();
      expect(packageJson.devDependencies['ts-node']).toBeDefined();
      expect(packageJson.devDependencies['ts-node-dev']).toBeDefined();
      expect(packageJson.devDependencies['ts-jest']).toBeDefined();
    });

    test('should have testing framework and tools', () => {
      expect(packageJson.devDependencies.jest).toBeDefined();
      expect(packageJson.devDependencies.supertest).toBeDefined();
    });

    test('should have linting and formatting tools', () => {
      expect(packageJson.devDependencies.eslint).toBeDefined();
      expect(packageJson.devDependencies.prettier).toBeDefined();
      expect(packageJson.devDependencies['@typescript-eslint/eslint-plugin']).toBeDefined();
      expect(packageJson.devDependencies['@typescript-eslint/parser']).toBeDefined();
    });

    test('should have Git hooks and pre-commit tools', () => {
      expect(packageJson.devDependencies.husky).toBeDefined();
      expect(packageJson.devDependencies['lint-staged']).toBeDefined();
    });

    test('should have Prisma CLI', () => {
      expect(packageJson.devDependencies.prisma).toBeDefined();
    });
  });

  // ===================================
  // Jest Configuration Tests
  // ===================================

  describe('Jest Configuration', () => {
    test('should have Jest configuration', () => {
      expect(packageJson.jest).toBeDefined();
      expect(typeof packageJson.jest).toBe('object');
    });

    test('should use ts-jest preset', () => {
      expect(packageJson.jest.preset).toBe('ts-jest');
    });

    test('should use node test environment', () => {
      expect(packageJson.jest.testEnvironment).toBe('node');
    });

    test('should have correct test roots', () => {
      expect(packageJson.jest.roots).toBeDefined();
      expect(Array.isArray(packageJson.jest.roots)).toBe(true);
      expect(packageJson.jest.roots).toContain('<rootDir>/src');
      expect(packageJson.jest.roots).toContain('<rootDir>/config');
      expect(packageJson.jest.roots).toContain('<rootDir>/__tests__');
    });

    test('should have test match patterns', () => {
      expect(packageJson.jest.testMatch).toBeDefined();
      expect(Array.isArray(packageJson.jest.testMatch)).toBe(true);
      expect(packageJson.jest.testMatch).toContain('**/__tests__/**/*.test.ts');
    });

    test('should have coverage configuration', () => {
      expect(packageJson.jest.collectCoverageFrom).toBeDefined();
      expect(packageJson.jest.coverageDirectory).toBe('coverage');
      expect(packageJson.jest.coverageReporters).toContain('text');
      expect(packageJson.jest.coverageReporters).toContain('lcov');
      expect(packageJson.jest.coverageReporters).toContain('html');
    });

    test('should have proper test timeout', () => {
      expect(packageJson.jest.testTimeout).toBe(30000);
    });
  });

  // ===================================
  // Keywords and Metadata Tests
  // ===================================

  describe('Keywords and Metadata', () => {
    test('should have relevant keywords', () => {
      expect(packageJson.keywords).toBeDefined();
      expect(Array.isArray(packageJson.keywords)).toBe(true);
      expect(packageJson.keywords.length).toBeGreaterThan(0);

      const expectedKeywords = [
        'task-management',
        'backend',
        'api',
        'express',
        'typescript',
        'prisma',
        'redis',
        'postgresql',
        'process-engineering'
      ];

      expectedKeywords.forEach(keyword => {
        expect(packageJson.keywords).toContain(keyword);
      });
    });

    test('should have repository information', () => {
      expect(packageJson.repository).toBeDefined();
      expect(packageJson.repository.type).toBe('git');
      expect(packageJson.repository.url).toContain('github.com');
      expect(packageJson.repository.directory).toBe('backend');
    });

    test('should have bugs URL', () => {
      expect(packageJson.bugs).toBeDefined();
      expect(packageJson.bugs.url).toContain('github.com');
      expect(packageJson.bugs.url).toContain('issues');
    });

    test('should have homepage URL', () => {
      expect(packageJson.homepage).toBeDefined();
      expect(packageJson.homepage).toContain('github.com');
    });
  });

  // ===================================
  // Development Tools Configuration Tests
  // ===================================

  describe('Development Tools Configuration', () => {
    test('should have lint-staged configuration', () => {
      expect(packageJson['lint-staged']).toBeDefined();
      expect(typeof packageJson['lint-staged']).toBe('object');
    });

    test('should have lint-staged rules for TypeScript files', () => {
      const lintStaged = packageJson['lint-staged'];
      expect(lintStaged['*.{ts,js}']).toBeDefined();
      expect(Array.isArray(lintStaged['*.{ts,js}'])).toBe(true);
      expect(lintStaged['*.{ts,js}']).toContain('eslint --fix');
      expect(lintStaged['*.{ts,js}']).toContain('prettier --write');
    });

    test('should have lint-staged rules for JSON and Markdown files', () => {
      const lintStaged = packageJson['lint-staged'];
      expect(lintStaged['*.{json,md}']).toBeDefined();
      expect(Array.isArray(lintStaged['*.{json,md}'])).toBe(true);
      expect(lintStaged['*.{json,md}']).toContain('prettier --write');
    });

    test('should have Husky configuration', () => {
      expect(packageJson.husky).toBeDefined();
      expect(typeof packageJson.husky).toBe('object');
      expect(packageJson.husky.hooks).toBeDefined();
    });

    test('should have pre-commit hook', () => {
      expect(packageJson.husky.hooks['pre-commit']).toBe('lint-staged');
    });

    test('should have pre-push hook', () => {
      expect(packageJson.husky.hooks['pre-push']).toBe('npm run quality-check');
    });

    test('should have Volta configuration', () => {
      expect(packageJson.volta).toBeDefined();
      expect(packageJson.volta.node).toBeDefined();
      expect(packageJson.volta.npm).toBeDefined();
    });
  });

  // ===================================
  // Version Compatibility Tests
  // ===================================

  describe('Version Compatibility', () => {
    test('should have compatible dependency versions', () => {
      // Check for major version compatibility
      const dependencies = packageJson.dependencies;
      const devDependencies = packageJson.devDependencies;

      // Express should be v4.x
      expect(dependencies.express).toMatch(/^\^4\./);

      // TypeScript should be v5.x
      expect(devDependencies.typescript).toMatch(/^\^5\./);

      // Jest should be v29.x
      expect(devDependencies.jest).toMatch(/^\^29\./);

      // Prisma should be v5.x
      expect(dependencies['@prisma/client']).toMatch(/^\^5\./);
      expect(devDependencies.prisma).toMatch(/^\^5\./);
    });

    test('should have Node.js types matching engine requirement', () => {
      const nodeTypesVersion = packageJson.devDependencies['@types/node'];
      expect(nodeTypesVersion).toMatch(/^\^20\./);
    });
  });

  // ===================================
  // Security and Quality Tests
  // ===================================

  describe('Security and Quality', () => {
    test('should have security-related dependencies', () => {
      expect(packageJson.dependencies.helmet).toBeDefined();
      expect(packageJson.dependencies.bcrypt).toBeDefined();
      expect(packageJson.dependencies['express-rate-limit']).toBeDefined();
      expect(packageJson.devDependencies['eslint-plugin-security']).toBeDefined();
    });

    test('should have quality assurance tools', () => {
      expect(packageJson.devDependencies.eslint).toBeDefined();
      expect(packageJson.devDependencies.prettier).toBeDefined();
      expect(packageJson.devDependencies['@typescript-eslint/eslint-plugin']).toBeDefined();
      expect(packageJson.devDependencies['@typescript-eslint/parser']).toBeDefined();
    });

    test('should have testing utilities', () => {
      expect(packageJson.devDependencies.supertest).toBeDefined();
      expect(packageJson.devDependencies['@types/supertest']).toBeDefined();
    });
  });

  // ===================================
  // File Structure Validation Tests
  // ===================================

  describe('File Structure Validation', () => {
    test('package.json should be valid JSON', () => {
      expect(() => {
        JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      }).not.toThrow();
    });

    test('should not have any undefined or null values in scripts', () => {
      Object.values(packageJson.scripts).forEach((script: any) => {
        expect(script).toBeDefined();
        expect(script).not.toBeNull();
        expect(typeof script).toBe('string');
        expect(script.length).toBeGreaterThan(0);
      });
    });

    test('should not have duplicate dependencies', () => {
      const allDeps = {
        ...packageJson.dependencies,
        ...packageJson.devDependencies
      };

      const depNames = Object.keys(allDeps);
      const uniqueDepNames = [...new Set(depNames)];

      expect(depNames.length).toBe(uniqueDepNames.length);
    });
  });

  // ===================================
  // Process Engineering Compliance Tests
  // ===================================

  describe('Process Engineering Compliance', () => {
    test('should support all required development workflows', () => {
      const requiredWorkflows = [
        'dev',
        'build',
        'test',
        'lint',
        'format',
        'quality-check',
        'security:audit'
      ];

      requiredWorkflows.forEach(workflow => {
        expect(packageJson.scripts[workflow]).toBeDefined();
      });
    });

    test('should have Jest configuration for testing', () => {
      expect(packageJson.jest).toBeDefined();
      expect(packageJson.jest.preset).toBe('ts-jest');
      expect(packageJson.jest.testEnvironment).toBe('node');
    });

    test('should include process engineering in keywords', () => {
      expect(packageJson.keywords).toContain('process-engineering');
    });

    test('should have proper author attribution', () => {
      expect(packageJson.author).toContain('Process Engineering Approach');
    });
  });
});
