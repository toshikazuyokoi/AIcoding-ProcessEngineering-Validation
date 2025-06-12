/**
 * E2E Test Helpers
 * 
 * High-level E2E testing utilities that build upon basic UI helpers
 * Provides scenario-based testing functions and complex user workflows
 * 
 * @fileoverview E2E-specific helper functions for complex test scenarios
 * @version 1.0.0
 * @since 2025-01-28
 */

import { Page, Browser, BrowserContext, expect } from '@playwright/test';
import { UIHelper, FormData, UIInteractionResult } from './UIHelper';
import * as path from 'path';
import * as fs from 'fs/promises';

/**
 * E2E test configuration
 */
export interface E2EConfig {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  screenshotOnFailure?: boolean;
  videoOnFailure?: boolean;
}

/**
 * User credentials for authentication tests
 */
export interface UserCredentials {
  email: string;
  password: string;
  name?: string;
  role?: 'admin' | 'user';
}

/**
 * Test data for scenarios
 */
export interface TestScenarioData {
  user?: UserCredentials;
  tasks?: Array<{
    title: string;
    description?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  }>;
  categories?: Array<{
    name: string;
    description?: string;
    color?: string;
  }>;
}

/**
 * E2E test result
 */
export interface E2ETestResult {
  success: boolean;
  duration: number;
  steps: Array<{
    name: string;
    success: boolean;
    duration: number;
    error?: string;
    screenshot?: string;
  }>;
  screenshots: string[];
  error?: string;
}

/**
 * E2E Helper class for complex test scenarios
 */
export class E2EHelpers {
  private page: Page;
  private context: BrowserContext;
  private browser: Browser;
  private uiHelper: UIHelper;
  private config: E2EConfig;
  private testResults: string[];

  constructor(page: Page, context: BrowserContext, browser: Browser, config: E2EConfig = {}) {
    this.page = page;
    this.context = context;
    this.browser = browser;
    this.uiHelper = new UIHelper();
    this.uiHelper.setPage(page);
    this.uiHelper.setBrowser(browser);
    this.config = {
      baseURL: config.baseURL || 'http://localhost:3000',
      timeout: config.timeout || 30000,
      retries: config.retries || 2,
      screenshotOnFailure: config.screenshotOnFailure !== false,
      videoOnFailure: config.videoOnFailure !== false,
    };
    this.testResults = [];
  }

  // ===================================
  // Authentication Scenarios
  // ===================================

  /**
   * Complete user registration flow
   */
  async registerUser(userData: UserCredentials): Promise<E2ETestResult> {
    const startTime = Date.now();
    const steps: E2ETestResult['steps'] = [];
    const screenshots: string[] = [];

    try {
      // Step 1: Navigate to registration page
      const navResult = await this.executeStep('Navigate to registration', async () => {
        await this.page.goto(`${this.config.baseURL}/register`);
        await this.page.waitForLoadState('networkidle');
      });
      steps.push(navResult);

      // Step 2: Fill registration form
      const fillResult = await this.executeStep('Fill registration form', async () => {
        await this.uiHelper.typeText('[data-testid="email"]', userData.email);
        await this.uiHelper.typeText('[data-testid="password"]', userData.password);
        if (userData.name) {
          await this.uiHelper.typeText('[data-testid="name"]', userData.name);
        }
      });
      steps.push(fillResult);

      // Step 3: Submit registration
      const submitResult = await this.executeStep('Submit registration', async () => {
        await this.uiHelper.clickElement('[data-testid="register-button"]');
        await this.page.waitForURL('**/dashboard', { timeout: this.config.timeout });
      });
      steps.push(submitResult);

      // Step 4: Verify registration success
      const verifyResult = await this.executeStep('Verify registration success', async () => {
        await expect(this.page.locator('[data-testid="welcome-message"]')).toBeVisible();
        const welcomeText = await this.page.locator('[data-testid="welcome-message"]').textContent();
        expect(welcomeText).toContain(userData.name || userData.email);
      });
      steps.push(verifyResult);

      const duration = Date.now() - startTime;
      return {
        success: true,
        duration,
        steps,
        screenshots
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      if (this.config.screenshotOnFailure) {
        const screenshot = await this.uiHelper.takeScreenshot('registration-failure');
        screenshots.push(screenshot);
      }

      return {
        success: false,
        duration,
        steps,
        screenshots,
        error: (error as Error).message
      };
    }
  }

  /**
   * Complete user login flow
   */
  async loginUser(credentials: UserCredentials): Promise<E2ETestResult> {
    const startTime = Date.now();
    const steps: E2ETestResult['steps'] = [];
    const screenshots: string[] = [];

    try {
      // Step 1: Navigate to login page
      const navResult = await this.executeStep('Navigate to login', async () => {
        await this.page.goto(`${this.config.baseURL}/login`);
        await this.page.waitForLoadState('networkidle');
      });
      steps.push(navResult);

      // Step 2: Fill login form
      const fillResult = await this.executeStep('Fill login form', async () => {
        await this.uiHelper.typeText('[data-testid="email"]', credentials.email);
        await this.uiHelper.typeText('[data-testid="password"]', credentials.password);
      });
      steps.push(fillResult);

      // Step 3: Submit login
      const submitResult = await this.executeStep('Submit login', async () => {
        await this.uiHelper.clickElement('[data-testid="login-button"]');
        await this.page.waitForURL('**/dashboard', { timeout: this.config.timeout });
      });
      steps.push(submitResult);

      // Step 4: Verify login success
      const verifyResult = await this.executeStep('Verify login success', async () => {
        await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
      });
      steps.push(verifyResult);

      const duration = Date.now() - startTime;
      return {
        success: true,
        duration,
        steps,
        screenshots
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      if (this.config.screenshotOnFailure) {
        const screenshot = await this.uiHelper.takeScreenshot('login-failure');
        screenshots.push(screenshot);
      }

      return {
        success: false,
        duration,
        steps,
        screenshots,
        error: (error as Error).message
      };
    }
  }

  /**
   * Logout user
   */
  async logoutUser(): Promise<E2ETestResult> {
    const startTime = Date.now();
    const steps: E2ETestResult['steps'] = [];
    const screenshots: string[] = [];

    try {
      // Step 1: Open user menu
      const menuResult = await this.executeStep('Open user menu', async () => {
        await this.uiHelper.clickElement('[data-testid="user-menu"]');
        await expect(this.page.locator('[data-testid="logout-button"]')).toBeVisible();
      });
      steps.push(menuResult);

      // Step 2: Click logout
      const logoutResult = await this.executeStep('Click logout', async () => {
        await this.uiHelper.clickElement('[data-testid="logout-button"]');
        await this.page.waitForURL('**/login', { timeout: this.config.timeout });
      });
      steps.push(logoutResult);

      const duration = Date.now() - startTime;
      return {
        success: true,
        duration,
        steps,
        screenshots
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      if (this.config.screenshotOnFailure) {
        const screenshot = await this.uiHelper.takeScreenshot('logout-failure');
        screenshots.push(screenshot);
      }

      return {
        success: false,
        duration,
        steps,
        screenshots,
        error: (error as Error).message
      };
    }
  }

  // ===================================
  // Task Management Scenarios
  // ===================================

  /**
   * Create a new task
   */
  async createTask(taskData: TestScenarioData['tasks'][0]): Promise<E2ETestResult> {
    const startTime = Date.now();
    const steps: E2ETestResult['steps'] = [];
    const screenshots: string[] = [];

    try {
      // Step 1: Navigate to task creation
      const navResult = await this.executeStep('Navigate to task creation', async () => {
        await this.uiHelper.clickElement('[data-testid="create-task-button"]');
        await expect(this.page.locator('[data-testid="task-form"]')).toBeVisible();
      });
      steps.push(navResult);

      // Step 2: Fill task form
      const fillResult = await this.executeStep('Fill task form', async () => {
        await this.uiHelper.typeText('[data-testid="task-title"]', taskData.title);
        if (taskData.description) {
          await this.uiHelper.typeText('[data-testid="task-description"]', taskData.description);
        }
        if (taskData.category) {
          await this.uiHelper.clickElement('[data-testid="task-category"]');
          await this.uiHelper.clickElement(`[data-testid="category-${taskData.category}"]`);
        }
        if (taskData.priority) {
          await this.uiHelper.clickElement(`[data-testid="priority-${taskData.priority}"]`);
        }
        if (taskData.dueDate) {
          await this.uiHelper.typeText('[data-testid="task-due-date"]', taskData.dueDate);
        }
      });
      steps.push(fillResult);

      // Step 3: Submit task
      const submitResult = await this.executeStep('Submit task', async () => {
        await this.uiHelper.clickElement('[data-testid="save-task-button"]');
        await expect(this.page.locator('[data-testid="task-success-message"]')).toBeVisible();
      });
      steps.push(submitResult);

      const duration = Date.now() - startTime;
      return {
        success: true,
        duration,
        steps,
        screenshots
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      if (this.config.screenshotOnFailure) {
        const screenshot = await this.uiHelper.takeScreenshot('create-task-failure');
        screenshots.push(screenshot);
      }

      return {
        success: false,
        duration,
        steps,
        screenshots,
        error: (error as Error).message
      };
    }
  }

  // ===================================
  // Utility Methods
  // ===================================

  /**
   * Execute a test step with error handling
   */
  private async executeStep(stepName: string, stepFunction: () => Promise<void>): Promise<E2ETestResult['steps'][0]> {
    const startTime = Date.now();
    
    try {
      await stepFunction();
      const duration = Date.now() - startTime;
      
      console.log(`✅ Step completed: ${stepName} (${duration}ms)`);
      return {
        name: stepName,
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.uiHelper.takeScreenshot(`step-error-${stepName.replace(/\s+/g, '-')}`);
      
      console.error(`❌ Step failed: ${stepName} (${duration}ms)`, error);
      return {
        name: stepName,
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Wait for API response
   */
  async waitForAPIResponse(urlPattern: string, timeout: number = this.config.timeout): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`API response timeout for ${urlPattern}`));
      }, timeout);

      this.page.on('response', async (response) => {
        if (response.url().includes(urlPattern)) {
          clearTimeout(timeoutId);
          try {
            const data = await response.json();
            resolve(data);
          } catch (error) {
            resolve(response);
          }
        }
      });
    });
  }

  /**
   * Clear browser data
   */
  async clearBrowserData(): Promise<void> {
    await this.context.clearCookies();
    await this.context.clearPermissions();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  /**
   * Get test results summary
   */
  getTestResults(): string[] {
    return [...this.testResults];
  }

  /**
   * Add test result
   */
  addTestResult(result: string): void {
    this.testResults.push(result);
  }
}
