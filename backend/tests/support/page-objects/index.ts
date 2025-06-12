/**
 * Page Objects Index
 * 
 * Central export file for all page objects
 * Provides easy imports and page object factory functions
 * 
 * @fileoverview Page objects index and factory
 * @version 1.0.0
 * @since 2025-01-28
 */

import { Page } from '@playwright/test';

// Import all page objects
import { BasePage } from './base-page';
import { LoginPage } from './login-page';
import { DashboardPage } from './dashboard-page';
import { TaskFormPage } from './task-form-page';

// Re-export all page objects
export { BasePage, LoginPage, DashboardPage, TaskFormPage };

// Import types and interfaces
export type {
  NavigationOptions,
  ElementOptions,
  PageVerificationResult
} from './base-page';

export type {
  LoginCredentials,
  LoginValidationErrors,
  LoginPageSelectors
} from './login-page';

export type {
  TaskData,
  DashboardStats,
  DashboardPageSelectors
} from './dashboard-page';

export type {
  TaskFormData,
  TaskFormValidationErrors,
  TaskFormPageSelectors
} from './task-form-page';

/**
 * Page Object Factory
 * 
 * Provides convenient factory methods for creating page objects
 * with consistent configuration
 */
export class PageObjectFactory {
  private page: Page;
  private baseURL: string;

  constructor(page: Page, baseURL: string = 'http://localhost:3000') {
    this.page = page;
    this.baseURL = baseURL;
  }

  /**
   * Create login page object
   */
  createLoginPage(): LoginPage {
    return new LoginPage(this.page, this.baseURL);
  }

  /**
   * Create dashboard page object
   */
  createDashboardPage(): DashboardPage {
    return new DashboardPage(this.page, this.baseURL);
  }

  /**
   * Create task creation form page object
   */
  createTaskFormPage(): TaskFormPage {
    return new TaskFormPage(this.page, this.baseURL, false);
  }

  /**
   * Create task edit form page object
   */
  createTaskEditPage(): TaskFormPage {
    return new TaskFormPage(this.page, this.baseURL, true);
  }

  /**
   * Update base URL for all future page objects
   */
  setBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Get current base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }
}

/**
 * Page Object Manager
 * 
 * Manages multiple page objects and provides navigation between them
 */
export class PageObjectManager {
  private factory: PageObjectFactory;
  private currentPage: any = null;

  constructor(page: Page, baseURL?: string) {
    this.factory = new PageObjectFactory(page, baseURL);
  }

  /**
   * Navigate to login page
   */
  async goToLogin(): Promise<LoginPage> {
    const loginPage = this.factory.createLoginPage();
    await loginPage.navigate();
    this.currentPage = loginPage;
    return loginPage;
  }

  /**
   * Navigate to dashboard page
   */
  async goToDashboard(): Promise<DashboardPage> {
    const dashboardPage = this.factory.createDashboardPage();
    await dashboardPage.navigate();
    this.currentPage = dashboardPage;
    return dashboardPage;
  }

  /**
   * Navigate to task creation page
   */
  async goToTaskCreation(): Promise<TaskFormPage> {
    const taskFormPage = this.factory.createTaskFormPage();
    await taskFormPage.navigate();
    this.currentPage = taskFormPage;
    return taskFormPage;
  }

  /**
   * Navigate to task edit page
   */
  async goToTaskEdit(taskId?: string): Promise<TaskFormPage> {
    const taskEditPage = this.factory.createTaskEditPage();
    
    if (taskId) {
      // Navigate to specific task edit URL
      await taskEditPage.navigate({
        expectedUrl: new RegExp(`.*\/tasks\/${taskId}\/edit.*`)
      });
    } else {
      await taskEditPage.navigate();
    }
    
    this.currentPage = taskEditPage;
    return taskEditPage;
  }

  /**
   * Get current page object
   */
  getCurrentPage(): any {
    return this.currentPage;
  }

  /**
   * Get page factory
   */
  getFactory(): PageObjectFactory {
    return this.factory;
  }

  /**
   * Perform complete login workflow
   */
  async performLogin(credentials: {
    email: string;
    password: string;
  }): Promise<DashboardPage> {
    // Go to login page
    const loginPage = await this.goToLogin();
    
    // Perform login
    await loginPage.login(credentials, {
      waitForRedirect: true,
      expectedRedirectUrl: '**/dashboard'
    });
    
    // Return dashboard page object
    return this.factory.createDashboardPage();
  }

  /**
   * Perform complete logout workflow
   */
  async performLogout(): Promise<LoginPage> {
    if (this.currentPage && typeof this.currentPage.logout === 'function') {
      await this.currentPage.logout();
    } else {
      // If current page doesn't have logout, go to dashboard first
      const dashboardPage = this.factory.createDashboardPage();
      await dashboardPage.logout();
    }
    
    // Return login page object
    return this.factory.createLoginPage();
  }

  /**
   * Create task with complete workflow
   */
  async createTask(taskData: {
    title: string;
    description?: string;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    dueDate?: string;
  }): Promise<DashboardPage> {
    // Navigate to task creation
    const taskFormPage = await this.goToTaskCreation();
    
    // Create the task
    await taskFormPage.createTask(taskData, {
      waitForSuccess: true,
      expectedRedirectUrl: '**/dashboard'
    });
    
    // Return dashboard page object
    return this.factory.createDashboardPage();
  }
}

/**
 * Utility function to create page object manager
 */
export function createPageObjectManager(page: Page, baseURL?: string): PageObjectManager {
  return new PageObjectManager(page, baseURL);
}

/**
 * Utility function to create page object factory
 */
export function createPageObjectFactory(page: Page, baseURL?: string): PageObjectFactory {
  return new PageObjectFactory(page, baseURL);
}

/**
 * Common page object utilities
 */
export const PageObjectUtils = {
  /**
   * Wait for any page to load
   */
  async waitForAnyPageLoad(page: Page, timeout: number = 30000): Promise<void> {
    await page.waitForLoadState('networkidle', { timeout });
  },

  /**
   * Take screenshot with timestamp
   */
  async takeTimestampedScreenshot(page: Page, name: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${name}-${timestamp}.png`;
    const filepath = `test-results/screenshots/${filename}`;
    
    await page.screenshot({
      path: filepath,
      fullPage: true
    });
    
    return filepath;
  },

  /**
   * Get current page type based on URL
   */
  getPageTypeFromUrl(url: string): string {
    if (url.includes('/login')) return 'login';
    if (url.includes('/dashboard')) return 'dashboard';
    if (url.includes('/tasks/create')) return 'task-create';
    if (url.includes('/tasks/edit') || url.includes('/tasks/') && url.includes('/edit')) return 'task-edit';
    return 'unknown';
  },

  /**
   * Verify page transition
   */
  async verifyPageTransition(page: Page, fromUrl: string | RegExp, toUrl: string | RegExp, timeout: number = 10000): Promise<void> {
    await page.waitForURL(toUrl, { timeout });
    console.log(`✅ Successfully transitioned from ${fromUrl} to ${toUrl}`);
  }
};
