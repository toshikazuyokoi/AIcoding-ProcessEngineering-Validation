/**
 * TypeScript Configuration Test Suite
 * 
 * Tests for backend/tsconfig.json configuration file validation
 * Validates TypeScript compiler options, paths, and project settings
 * 
 * @fileoverview Comprehensive test suite for TypeScript configuration
 * @version 1.0.0
 * @since 2025-01-31
 */

import * as fs from 'fs';
import * as path from 'path';

describe('TypeScript Configuration Tests', () => {
  let tsconfigJson: any;
  let tsconfigPath: string;

  beforeAll(() => {
    tsconfigPath = path.join(__dirname, '..', 'tsconfig.json');
    
    // Read and parse tsconfig.json
    try {
      const tsconfigContent = fs.readFileSync(tsconfigPath, 'utf8');
      tsconfigJson = JSON.parse(tsconfigContent);
    } catch (error) {
      throw new Error(`Failed to read or parse tsconfig.json: ${error}`);
    }
  });

  describe('File Structure and Format', () => {
    test('should exist and be readable', () => {
      expect(fs.existsSync(tsconfigPath)).toBe(true);
      expect(fs.statSync(tsconfigPath).isFile()).toBe(true);
    });

    test('should be valid JSON format', () => {
      expect(() => {
        JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'));
      }).not.toThrow();
    });

    test('should have required top-level properties', () => {
      expect(tsconfigJson).toHaveProperty('compilerOptions');
      expect(tsconfigJson).toHaveProperty('include');
      expect(tsconfigJson).toHaveProperty('exclude');
    });
  });

  describe('Compiler Options', () => {
    test('should have appropriate target version', () => {
      expect(tsconfigJson.compilerOptions.target).toBe('ES2022');
    });

    test('should use CommonJS module system', () => {
      expect(tsconfigJson.compilerOptions.module).toBe('commonjs');
    });

    test('should include ES2022 library', () => {
      expect(tsconfigJson.compilerOptions.lib).toContain('ES2022');
    });

    test('should include Node.js and Jest types', () => {
      expect(tsconfigJson.compilerOptions.types).toContain('node');
      expect(tsconfigJson.compilerOptions.types).toContain('jest');
    });

    test('should have correct output directory', () => {
      expect(tsconfigJson.compilerOptions.outDir).toBe('./dist');
    });

    test('should have correct root directory', () => {
      expect(tsconfigJson.compilerOptions.rootDir).toBe('./');
    });

    test('should enable strict mode', () => {
      expect(tsconfigJson.compilerOptions.strict).toBe(true);
    });

    test('should enable ES module interop', () => {
      expect(tsconfigJson.compilerOptions.esModuleInterop).toBe(true);
    });

    test('should skip library checks', () => {
      expect(tsconfigJson.compilerOptions.skipLibCheck).toBe(true);
    });

    test('should force consistent casing in file names', () => {
      expect(tsconfigJson.compilerOptions.forceConsistentCasingInFileNames).toBe(true);
    });

    test('should resolve JSON modules', () => {
      expect(tsconfigJson.compilerOptions.resolveJsonModule).toBe(true);
    });

    test('should generate declaration files', () => {
      expect(tsconfigJson.compilerOptions.declaration).toBe(true);
    });

    test('should generate declaration maps', () => {
      expect(tsconfigJson.compilerOptions.declarationMap).toBe(true);
    });

    test('should generate source maps', () => {
      expect(tsconfigJson.compilerOptions.sourceMap).toBe(true);
    });

    test('should remove comments in output', () => {
      expect(tsconfigJson.compilerOptions.removeComments).toBe(true);
    });
  });

  describe('Strict Type Checking Options', () => {
    test('should enforce no implicit any', () => {
      expect(tsconfigJson.compilerOptions.noImplicitAny).toBe(true);
    });

    test('should enforce no implicit returns', () => {
      expect(tsconfigJson.compilerOptions.noImplicitReturns).toBe(true);
    });

    test('should enforce no implicit this', () => {
      expect(tsconfigJson.compilerOptions.noImplicitThis).toBe(true);
    });

    test('should allow unused locals (for development)', () => {
      expect(tsconfigJson.compilerOptions.noUnusedLocals).toBe(false);
    });

    test('should allow unused parameters (for development)', () => {
      expect(tsconfigJson.compilerOptions.noUnusedParameters).toBe(false);
    });

    test('should enforce exact optional property types', () => {
      expect(tsconfigJson.compilerOptions.exactOptionalPropertyTypes).toBe(true);
    });

    test('should enforce no implicit override', () => {
      expect(tsconfigJson.compilerOptions.noImplicitOverride).toBe(true);
    });

    test('should not allow unreachable code', () => {
      expect(tsconfigJson.compilerOptions.allowUnreachableCode).toBe(false);
    });

    test('should not allow unused labels', () => {
      expect(tsconfigJson.compilerOptions.allowUnusedLabels).toBe(false);
    });
  });

  describe('Decorator Support', () => {
    test('should enable experimental decorators', () => {
      expect(tsconfigJson.compilerOptions.experimentalDecorators).toBe(true);
    });

    test('should emit decorator metadata', () => {
      expect(tsconfigJson.compilerOptions.emitDecoratorMetadata).toBe(true);
    });
  });

  describe('Module Resolution', () => {
    test('should use Node.js module resolution', () => {
      expect(tsconfigJson.compilerOptions.moduleResolution).toBe('node');
    });

    test('should have correct base URL', () => {
      expect(tsconfigJson.compilerOptions.baseUrl).toBe('./');
    });

    test('should have path mappings configured', () => {
      expect(tsconfigJson.compilerOptions.paths).toBeDefined();
      expect(tsconfigJson.compilerOptions.paths['@/*']).toEqual(['src/*']);
      expect(tsconfigJson.compilerOptions.paths['@/utils/*']).toEqual(['src/utils/*']);
      expect(tsconfigJson.compilerOptions.paths['@/types/*']).toEqual(['src/types/*']);
      expect(tsconfigJson.compilerOptions.paths['@/config/*']).toEqual(['config/*']);
    });

    test('should have correct type roots', () => {
      expect(tsconfigJson.compilerOptions.typeRoots).toContain('./node_modules/@types');
      expect(tsconfigJson.compilerOptions.typeRoots).toContain('./src/types');
    });
  });

  describe('Include and Exclude Patterns', () => {
    test('should include source files', () => {
      expect(tsconfigJson.include).toContain('src/**/*');
    });

    test('should include config files', () => {
      expect(tsconfigJson.include).toContain('config/**/*');
    });

    test('should include test files', () => {
      expect(tsconfigJson.include).toContain('__tests__/**/*');
    });

    test('should exclude node_modules', () => {
      expect(tsconfigJson.exclude).toContain('node_modules');
    });

    test('should exclude dist directory', () => {
      expect(tsconfigJson.exclude).toContain('dist');
    });

    test('should exclude coverage directory', () => {
      expect(tsconfigJson.exclude).toContain('coverage');
    });

    test('should not exclude test files (for type checking)', () => {
      expect(tsconfigJson.exclude).not.toContain('**/*.test.ts');
    });
  });

  describe('ts-node Configuration', () => {
    test('should have ts-node configuration', () => {
      expect(tsconfigJson['ts-node']).toBeDefined();
    });

    test('should disable ESM for ts-node', () => {
      expect(tsconfigJson['ts-node'].esm).toBe(false);
    });

    test('should use node experimental specifier resolution', () => {
      expect(tsconfigJson['ts-node'].experimentalSpecifierResolution).toBe('node');
    });
  });

  describe('Path Mapping Validation', () => {
    test('should have all required path aliases', () => {
      const paths = tsconfigJson.compilerOptions.paths;
      const requiredPaths = ['@/*', '@/utils/*', '@/types/*', '@/config/*'];
      
      requiredPaths.forEach(pathAlias => {
        expect(paths).toHaveProperty(pathAlias);
        expect(Array.isArray(paths[pathAlias])).toBe(true);
        expect(paths[pathAlias].length).toBeGreaterThan(0);
      });
    });

    test('should have consistent path mapping structure', () => {
      const paths = tsconfigJson.compilerOptions.paths;
      
      Object.entries(paths).forEach(([alias, mappings]: [string, any]) => {
        expect(typeof alias).toBe('string');
        expect(Array.isArray(mappings)).toBe(true);
        mappings.forEach((mapping: any) => {
          expect(typeof mapping).toBe('string');
        });
      });
    });
  });

  describe('Development and Production Compatibility', () => {
    test('should be compatible with Node.js backend development', () => {
      expect(tsconfigJson.compilerOptions.target).toMatch(/ES20(20|21|22)/);
      expect(tsconfigJson.compilerOptions.module).toBe('commonjs');
      expect(tsconfigJson.compilerOptions.types).toContain('node');
    });

    test('should support Jest testing framework', () => {
      expect(tsconfigJson.compilerOptions.types).toContain('jest');
      expect(tsconfigJson.include).toContain('__tests__/**/*');
    });

    test('should support debugging with source maps', () => {
      expect(tsconfigJson.compilerOptions.sourceMap).toBe(true);
      expect(tsconfigJson.compilerOptions.declarationMap).toBe(true);
    });

    test('should support production builds', () => {
      expect(tsconfigJson.compilerOptions.outDir).toBe('./dist');
      expect(tsconfigJson.compilerOptions.removeComments).toBe(true);
      expect(tsconfigJson.compilerOptions.declaration).toBe(true);
    });
  });

  describe('Configuration Consistency', () => {
    test('should have consistent compiler options', () => {
      const options = tsconfigJson.compilerOptions;
      
      // Strict mode should be enabled with related options
      if (options.strict) {
        expect(options.noImplicitAny).toBe(true);
        expect(options.noImplicitReturns).toBe(true);
        expect(options.noImplicitThis).toBe(true);
      }
    });

    test('should have no conflicting options', () => {
      const options = tsconfigJson.compilerOptions;
      
      // Should not have conflicting module settings
      expect(options.module).toBe('commonjs');
      expect(options.moduleResolution).toBe('node');
      
      // Should not have conflicting target and lib settings
      if (options.target === 'ES2022') {
        expect(options.lib).toContain('ES2022');
      }
    });
  });
});
