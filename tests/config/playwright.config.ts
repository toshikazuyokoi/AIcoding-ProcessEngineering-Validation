/**
 * ===================================
 * Playwright Configuration for E2E Tests
 * ===================================
 * Generated for TSK-IT-000-003-ConfigFiles
 * Project: Task Management System - Integration Test
 * Purpose: Playwright configuration for E2E testing
 */

import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.integration') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // ===================================
  // Basic Configuration
  // ===================================
  
  /**
   * Test directory
   */
  testDir: '../e2e',
  
  /**
   * Test file patterns
   */
  testMatch: [
    '**/*.e2e.test.ts',
    '**/*.e2e.test.js',
    '**/e2e/**/*.test.ts',
    '**/e2e/**/*.test.js'
  ],
  
  /**
   * Test ignore patterns
   */
  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/coverage/**',
    '**/test-results/**',
    '**/playwright-report/**'
  ],

  // ===================================
  // Execution Configuration
  // ===================================
  
  /**
   * Run tests in files in parallel
   */
  fullyParallel: false,
  
  /**
   * Fail the build on CI if you accidentally left test.only in the source code.
   */
  forbidOnly: !!process.env.CI,
  
  /**
   * Retry on CI only
   */
  retries: process.env.CI ? 2 : 1,
  
  /**
   * Opt out of parallel tests on CI.
   */
  workers: process.env.CI ? 1 : 2,
  
  /**
   * Global timeout for each test
   */
  timeout: 120000, // 2 minutes
  
  /**
   * Global timeout for expect assertions
   */
  expect: {
    timeout: 30000 // 30 seconds
  },

  // ===================================
  // Reporter Configuration
  // ===================================
  
  /**
   * Reporter to use. See https://playwright.dev/docs/test-reporters
   */
  reporter: [
    ['html', { 
      outputFolder: '../test-results/e2e/playwright-report',
      open: 'never'
    }],
    ['json', { 
      outputFile: '../test-results/e2e/test-results.json' 
    }],
    ['junit', { 
      outputFile: '../test-results/e2e/test-results.xml' 
    }],
    ['line'],
    ['allure-playwright', {
      detail: true,
      outputFolder: '../test-results/e2e/allure-results',
      suiteTitle: false
    }]
  ],

  // ===================================
  // Output Configuration
  // ===================================
  
  /**
   * Folder for test artifacts such as screenshots, videos, traces, etc.
   */
  outputDir: '../test-results/e2e/test-artifacts',

  // ===================================
  // Global Setup and Teardown
  // ===================================
  
  /**
   * Global setup file
   */
  globalSetup: './global-setup.ts',
  
  /**
   * Global teardown file
   */
  globalTeardown: './global-teardown.ts',

  // ===================================
  // Use Configuration
  // ===================================
  
  /**
   * Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions.
   */
  use: {
    /**
     * Base URL to use in actions like `await page.goto('/')`.
     */
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    /**
     * API base URL for API testing
     */
    extraHTTPHeaders: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    
    /**
     * Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer
     */
    trace: 'on-first-retry',
    
    /**
     * Take screenshot on failure
     */
    screenshot: 'only-on-failure',
    
    /**
     * Record video on failure
     */
    video: 'retain-on-failure',
    
    /**
     * Viewport size
     */
    viewport: { width: 1280, height: 720 },
    
    /**
     * Ignore HTTPS errors
     */
    ignoreHTTPSErrors: true,
    
    /**
     * Action timeout
     */
    actionTimeout: 30000,
    
    /**
     * Navigation timeout
     */
    navigationTimeout: 60000
  },

  // ===================================
  // Projects Configuration
  // ===================================
  
  /**
   * Configure projects for major browsers.
   */
  projects: [
    // ===================================
    // Setup Project
    // ===================================
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      teardown: 'cleanup'
    },
    
    {
      name: 'cleanup',
      testMatch: /.*\.teardown\.ts/
    },

    // ===================================
    // Desktop Browsers
    // ===================================
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome'
      },
      dependencies: ['setup']
    },

    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'] 
      },
      dependencies: ['setup']
    },

    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'] 
      },
      dependencies: ['setup']
    },

    // ===================================
    // Mobile Browsers
    // ===================================
    {
      name: 'Mobile Chrome',
      use: { 
        ...devices['Pixel 5'] 
      },
      dependencies: ['setup']
    },

    {
      name: 'Mobile Safari',
      use: { 
        ...devices['iPhone 12'] 
      },
      dependencies: ['setup']
    },

    // ===================================
    // API Testing
    // ===================================
    {
      name: 'api',
      testMatch: '**/api/**/*.test.ts',
      use: {
        baseURL: process.env.API_URL || 'http://localhost:8002'
      },
      dependencies: ['setup']
    }
  ],

  // ===================================
  // Web Server Configuration
  // ===================================
  
  /**
   * Run your local dev server before starting the tests
   */
  webServer: [
    {
      command: 'npm run start:integration',
      cwd: '../backend',
      port: 8002,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NODE_ENV: 'integration',
        DATABASE_URL: 'postgresql://integration_user:integration_password_123@localhost:5434/taskdb_integration',
        REDIS_URL: 'redis://localhost:6381',
        JWT_SECRET: 'integration_jwt_secret_key_for_testing_only'
      }
    },
    {
      command: 'npm run start:integration',
      cwd: '../frontend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
      env: {
        NODE_ENV: 'integration',
        REACT_APP_API_URL: 'http://localhost:8002'
      }
    }
  ]
});
