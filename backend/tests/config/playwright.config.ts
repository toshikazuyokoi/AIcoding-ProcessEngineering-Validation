/**
 * Playwright Configuration for E2E Testing
 * 
 * Comprehensive E2E test configuration supporting multiple browsers,
 * environments, and test execution modes with detailed reporting
 * 
 * @fileoverview Playwright configuration for E2E testing
 * @version 1.0.0
 * @since 2025-01-28
 */

import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Environment configuration
 */
const getBaseURL = (): string => {
  const env = process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return process.env.PROD_BASE_URL || 'https://taskmanager.example.com';
    case 'staging':
      return process.env.STAGING_BASE_URL || 'https://staging.taskmanager.example.com';
    case 'development':
    default:
      return process.env.DEV_BASE_URL || 'http://localhost:3000';
  }
};

/**
 * Test configuration paths
 */
const testConfig = {
  testDir: path.join(__dirname, '../e2e'),
  outputDir: path.join(__dirname, '../../test-results'),
  reportDir: path.join(__dirname, '../../playwright-report'),
  globalSetup: path.join(__dirname, '../support/global-setup.ts'),
  globalTeardown: path.join(__dirname, '../support/global-teardown.ts'),
};

/**
 * Playwright configuration
 */
export default defineConfig({
  // Test directory and file patterns
  testDir: testConfig.testDir,
  testMatch: ['**/*.e2e.test.ts', '**/*.e2e.spec.ts'],
  
  // Global test settings
  timeout: 30 * 1000, // 30 seconds per test
  expect: {
    timeout: 10 * 1000, // 10 seconds for assertions
  },
  
  // Test execution settings
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter configuration
  reporter: [
    ['html', { 
      outputFolder: testConfig.reportDir,
      open: process.env.CI ? 'never' : 'on-failure'
    }],
    ['json', { 
      outputFile: path.join(testConfig.outputDir, 'test-results.json')
    }],
    ['junit', { 
      outputFile: path.join(testConfig.outputDir, 'junit-results.xml')
    }],
    ['line'],
    ...(process.env.CI ? [['github']] : [])
  ],
  
  // Output directories
  outputDir: testConfig.outputDir,
  
  // Global setup and teardown - disabled for basic setup testing
  // globalSetup: testConfig.globalSetup,
  // globalTeardown: testConfig.globalTeardown,
  
  // Use configuration
  use: {
    // Base URL for all tests
    baseURL: getBaseURL(),
    
    // Browser settings
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    
    // Action settings
    actionTimeout: 10 * 1000,
    navigationTimeout: 30 * 1000,
    
    // Screenshot and video settings
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/New_York',
    
    // Additional context options
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
  },

  // Project configurations for different browsers
  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Use bundled chromium instead of system chrome
        // channel: 'chrome',
      },
    },
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
      },
    },
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
      },
    },
    
    // Mobile browsers
    {
      name: 'mobile-chrome',
      use: { 
        ...devices['Pixel 5'],
      },
    },
    {
      name: 'mobile-safari',
      use: { 
        ...devices['iPhone 12'],
      },
    },
    
    // Tablet browsers
    {
      name: 'tablet-chrome',
      use: { 
        ...devices['Galaxy Tab S4'],
      },
    },
    {
      name: 'tablet-safari',
      use: { 
        ...devices['iPad Pro'],
      },
    },
    
    // High DPI displays
    {
      name: 'high-dpi',
      use: {
        ...devices['Desktop Chrome HiDPI'],
      },
    },
  ],

  // Web server configuration for local development
  // Disabled for setup testing - will be enabled when backend is ready
  // webServer: process.env.CI ? undefined : {
  //   command: 'npm run dev',
  //   port: 3000,
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 120 * 1000, // 2 minutes
  //   env: {
  //     NODE_ENV: 'test',
  //     PORT: '3000',
  //   },
  // },
});

/**
 * Environment-specific configuration overrides
 */
export const getEnvironmentConfig = () => {
  const env = process.env.NODE_ENV || 'development';
  
  const configs = {
    development: {
      workers: 2,
      retries: 0,
      headless: false,
      timeout: 60 * 1000,
    },
    staging: {
      workers: 3,
      retries: 1,
      headless: true,
      timeout: 45 * 1000,
    },
    production: {
      workers: 4,
      retries: 2,
      headless: true,
      timeout: 30 * 1000,
    },
  };
  
  return configs[env as keyof typeof configs] || configs.development;
};

/**
 * Browser-specific configuration
 */
export const getBrowserConfig = (browserName: string) => {
  const configs = {
    chromium: {
      launchOptions: {
        args: [
          '--disable-web-security',
          '--disable-features=TranslateUI',
          '--disable-ipc-flooding-protection',
        ],
      },
    },
    firefox: {
      launchOptions: {
        firefoxUserPrefs: {
          'media.navigator.streams.fake': true,
          'media.navigator.permission.disabled': true,
        },
      },
    },
    webkit: {
      launchOptions: {
        // WebKit specific options
      },
    },
  };
  
  return configs[browserName as keyof typeof configs] || {};
};

/**
 * Test data configuration
 */
export const testDataConfig = {
  users: {
    admin: {
      email: 'admin@test.com',
      password: 'admin123',
      role: 'admin',
    },
    user: {
      email: 'user@test.com',
      password: 'user123',
      role: 'user',
    },
    guest: {
      email: 'guest@test.com',
      password: 'guest123',
      role: 'guest',
    },
  },
  api: {
    timeout: 10000,
    retries: 3,
  },
  database: {
    testDbUrl: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/taskdb_test',
  },
};

/**
 * Performance thresholds
 */
export const performanceThresholds = {
  pageLoad: 3000, // 3 seconds
  apiResponse: 1000, // 1 second
  interaction: 500, // 500ms
  navigation: 2000, // 2 seconds
};
