/**
 * ===================================
 * ESLint Configuration for Backend
 * ===================================
 * Purpose: Comprehensive ESLint configuration for Node.js + TypeScript + Express backend
 * Features:
 * - TypeScript support with strict type checking
 * - Node.js environment configuration
 * - Jest testing framework support
 * - Security rules and best practices
 * - Import/export management
 * - Code quality and complexity rules
 * - Prettier integration for consistent formatting
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

module.exports = {
  // ===================================
  // Environment Configuration
  // ===================================
  env: {
    node: true,
    es2022: true,
    jest: true,
  },

  // ===================================
  // Parser Configuration
  // ===================================
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },

  // ===================================
  // Plugin Configuration
  // ===================================
  plugins: [
    '@typescript-eslint',
    'import',
    'jest',
    'node',
    'security',
    'prettier',
  ],

  // ===================================
  // Extended Configurations
  // ===================================
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended',
    '@typescript-eslint/recommended-requiring-type-checking',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:jest/recommended',
    'plugin:jest/style',
    'plugin:node/recommended',
    'plugin:security/recommended',
    'prettier', // Must be last to override other configs
  ],

  // ===================================
  // Rule Configuration
  // ===================================
  rules: {
    // ===================================
    // TypeScript Specific Rules
    // ===================================
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unsafe-assignment': 'error',
    '@typescript-eslint/no-unsafe-call': 'error',
    '@typescript-eslint/no-unsafe-member-access': 'error',
    '@typescript-eslint/no-unsafe-return': 'error',
    '@typescript-eslint/prefer-nullish-coalescing': 'error',
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': [
      'error',
      { prefer: 'type-imports' },
    ],

    // ===================================
    // Code Quality Rules
    // ===================================
    complexity: ['error', 10],
    'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
    'max-lines-per-function': ['error', { max: 50, skipBlankLines: true, skipComments: true }],
    'max-depth': ['error', 4],
    'max-params': ['error', 4],
    'max-nested-callbacks': ['error', 3],
    'no-duplicate-imports': 'error',
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-eval': 'error',
    'no-implied-eval': 'error',
    'no-new-func': 'error',
    'no-script-url': 'error',
    'no-return-await': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'arrow-body-style': ['error', 'as-needed'],

    // ===================================
    // Import/Export Rules
    // ===================================
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-duplicates': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',

    // ===================================
    // Node.js Specific Rules
    // ===================================
    'node/no-unsupported-features/es-syntax': 'off', // TypeScript handles this
    'node/no-missing-import': 'off', // TypeScript handles this
    'node/no-unpublished-import': [
      'error',
      {
        allowModules: ['supertest', '@types/supertest'],
      },
    ],
    'node/prefer-global/buffer': ['error', 'always'],
    'node/prefer-global/console': ['error', 'always'],
    'node/prefer-global/process': ['error', 'always'],
    'node/prefer-global/url-search-params': ['error', 'always'],
    'node/prefer-global/url': ['error', 'always'],
    'node/prefer-promises/dns': 'error',
    'node/prefer-promises/fs': 'error',

    // ===================================
    // Jest Testing Rules
    // ===================================
    'jest/expect-expect': 'error',
    'jest/no-disabled-tests': 'warn',
    'jest/no-focused-tests': 'error',
    'jest/no-identical-title': 'error',
    'jest/prefer-to-have-length': 'warn',
    'jest/valid-expect': 'error',
    'jest/consistent-test-it': ['error', { fn: 'test' }],
    'jest/prefer-strict-equal': 'error',
    'jest/prefer-to-be': 'error',
    'jest/prefer-to-contain': 'error',

    // ===================================
    // Security Rules
    // ===================================
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error',

    // ===================================
    // Prettier Integration
    // ===================================
    'prettier/prettier': [
      'error',
      {
        semi: true,
        trailingComma: 'es5',
        singleQuote: true,
        printWidth: 100,
        tabWidth: 2,
        useTabs: false,
        endOfLine: 'lf',
      },
    ],
  },

  // ===================================
  // Settings Configuration
  // ===================================
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },

  // ===================================
  // File-specific Overrides
  // ===================================
  overrides: [
    // Test files
    {
      files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
      env: {
        jest: true,
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        'max-lines': 'off',
        'max-lines-per-function': 'off',
      },
    },
    // Configuration files
    {
      files: ['*.config.js', '*.config.ts'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off',
        'node/no-unpublished-require': 'off',
      },
    },
    // Migration and seed files
    {
      files: ['prisma/**/*.ts', 'scripts/**/*.ts'],
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
      },
    },
  ],

  // ===================================
  // Ignored Patterns
  // ===================================
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    '*.js.map',
    '*.d.ts',
    'prisma/migrations/',
  ],
};
