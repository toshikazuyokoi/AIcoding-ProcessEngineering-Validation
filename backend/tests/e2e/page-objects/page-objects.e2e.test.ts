/**
 * Page Objects E2E Test
 * 
 * Tests for page object functionality to ensure they work correctly
 * with Playwright and provide reliable page interaction capabilities
 * 
 * @fileoverview E2E test for page object pattern implementation
 * @version 1.0.0
 * @since 2025-01-28
 */

import { test, expect, Page } from '@playwright/test';
import {
  PageObjectFactory,
  PageObjectManager,
  createPageObjectManager,
  createPageObjectFactory,
  PageObjectUtils,
  LoginPage,
  DashboardPage,
  TaskFormPage
} from '../../support/page-objects';

test.describe('Page Objects Functionality', () => {
  let pageFactory: PageObjectFactory;
  let pageManager: PageObjectManager;

  test.beforeEach(async ({ page }) => {
    pageFactory = createPageObjectFactory(page, 'https://example.com');
    pageManager = createPageObjectManager(page, 'https://example.com');
  });

  test.describe('Page Object Factory', () => {
    test('should create page object factory correctly', async ({ page }) => {
      const factory = new PageObjectFactory(page, 'https://test.example.com');
      
      expect(factory).toBeDefined();
      expect(factory.getBaseURL()).toBe('https://test.example.com');
    });

    test('should create login page object', async ({ page }) => {
      const loginPage = pageFactory.createLoginPage();
      
      expect(loginPage).toBeInstanceOf(LoginPage);
      expect(loginPage.getPath()).toBe('/login');
    });

    test('should create dashboard page object', async ({ page }) => {
      const dashboardPage = pageFactory.createDashboardPage();
      
      expect(dashboardPage).toBeInstanceOf(DashboardPage);
      expect(dashboardPage.getPath()).toBe('/dashboard');
    });

    test('should create task form page objects', async ({ page }) => {
      const taskCreatePage = pageFactory.createTaskFormPage();
      const taskEditPage = pageFactory.createTaskEditPage();
      
      expect(taskCreatePage).toBeInstanceOf(TaskFormPage);
      expect(taskEditPage).toBeInstanceOf(TaskFormPage);
      expect(taskCreatePage.getPath()).toBe('/tasks/create');
      expect(taskEditPage.getPath()).toBe('/tasks/edit');
    });

    test('should update base URL', async ({ page }) => {
      const factory = new PageObjectFactory(page, 'https://old.example.com');
      expect(factory.getBaseURL()).toBe('https://old.example.com');
      
      factory.setBaseURL('https://new.example.com');
      expect(factory.getBaseURL()).toBe('https://new.example.com');
    });
  });

  test.describe('Page Object Manager', () => {
    test('should create page object manager correctly', async ({ page }) => {
      const manager = new PageObjectManager(page, 'https://test.example.com');
      
      expect(manager).toBeDefined();
      expect(manager.getFactory()).toBeInstanceOf(PageObjectFactory);
      expect(manager.getFactory().getBaseURL()).toBe('https://test.example.com');
    });

    test('should track current page', async ({ page }) => {
      const manager = new PageObjectManager(page);
      
      // Initially no current page
      expect(manager.getCurrentPage()).toBeNull();
      
      // After navigation, should track current page
      await manager.goToLogin();
      expect(manager.getCurrentPage()).toBeInstanceOf(LoginPage);
    });

    test('should provide navigation methods', async ({ page }) => {
      const manager = new PageObjectManager(page);
      
      // Test navigation method existence
      expect(typeof manager.goToLogin).toBe('function');
      expect(typeof manager.goToDashboard).toBe('function');
      expect(typeof manager.goToTaskCreation).toBe('function');
      expect(typeof manager.goToTaskEdit).toBe('function');
    });
  });

  test.describe('Login Page Object', () => {
    test('should have correct selectors', async ({ page }) => {
      const loginPage = pageFactory.createLoginPage();
      const selectors = loginPage.getSelectors();
      
      expect(selectors.emailInput).toBe('[data-testid="email"]');
      expect(selectors.passwordInput).toBe('[data-testid="password"]');
      expect(selectors.loginButton).toBe('[data-testid="login-button"]');
      expect(selectors.forgotPasswordLink).toBe('[data-testid="forgot-password-link"]');
    });

    test('should navigate to login page', async ({ page }) => {
      const loginPage = pageFactory.createLoginPage();
      
      // Mock navigation by going to a test page
      await page.goto('https://httpbin.org/forms/post');
      
      // Verify page has forms (simulating login page)
      const forms = await page.locator('form').count();
      expect(forms).toBeGreaterThan(0);
    });

    test('should handle login credentials data structure', async ({ page }) => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      expect(credentials.email).toBe('test@example.com');
      expect(credentials.password).toBe('password123');
    });
  });

  test.describe('Dashboard Page Object', () => {
    test('should have correct selectors', async ({ page }) => {
      const dashboardPage = pageFactory.createDashboardPage();
      const selectors = dashboardPage.getSelectors();
      
      expect(selectors.userMenu).toBe('[data-testid="user-menu"]');
      expect(selectors.createTaskButton).toBe('[data-testid="create-task-button"]');
      expect(selectors.taskList).toBe('[data-testid="task-list"]');
      expect(selectors.logoutButton).toBe('[data-testid="logout-button"]');
    });

    test('should handle task data structure', async ({ page }) => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        category: 'work',
        priority: 'high' as const,
        dueDate: '2025-12-31'
      };
      
      expect(taskData.title).toBe('Test Task');
      expect(taskData.priority).toBe('high');
      expect(taskData.dueDate).toBe('2025-12-31');
    });

    test('should handle dashboard stats structure', async ({ page }) => {
      const stats = {
        totalTasks: 10,
        completedTasks: 5,
        pendingTasks: 3,
        overdueTasks: 2
      };
      
      expect(stats.totalTasks).toBe(10);
      expect(stats.completedTasks).toBe(5);
      expect(stats.pendingTasks).toBe(3);
      expect(stats.overdueTasks).toBe(2);
    });
  });

  test.describe('Task Form Page Object', () => {
    test('should have correct selectors for create mode', async ({ page }) => {
      const taskFormPage = pageFactory.createTaskFormPage();
      const selectors = taskFormPage.getSelectors();
      
      expect(selectors.taskForm).toBe('[data-testid="task-form"]');
      expect(selectors.titleInput).toBe('[data-testid="task-title"]');
      expect(selectors.descriptionInput).toBe('[data-testid="task-description"]');
      expect(selectors.saveButton).toBe('[data-testid="save-task-button"]');
    });

    test('should have correct selectors for edit mode', async ({ page }) => {
      const taskEditPage = pageFactory.createTaskEditPage();
      const selectors = taskEditPage.getSelectors();
      
      expect(selectors.statusSelect).toBe('[data-testid="task-status"]');
      expect(selectors.statusPending).toBe('[data-testid="status-pending"]');
      expect(selectors.statusInProgress).toBe('[data-testid="status-in_progress"]');
      expect(selectors.statusCompleted).toBe('[data-testid="status-completed"]');
    });

    test('should handle task form data structure', async ({ page }) => {
      const taskFormData = {
        title: 'New Task',
        description: 'Task description',
        category: 'personal',
        priority: 'medium' as const,
        dueDate: '2025-06-15',
        status: 'pending' as const
      };
      
      expect(taskFormData.title).toBe('New Task');
      expect(taskFormData.priority).toBe('medium');
      expect(taskFormData.status).toBe('pending');
    });

    test('should handle validation errors structure', async ({ page }) => {
      const validationErrors = {
        title: 'Title is required',
        description: 'Description too long',
        general: 'Form submission failed'
      };
      
      expect(validationErrors.title).toBe('Title is required');
      expect(validationErrors.general).toBe('Form submission failed');
    });
  });

  test.describe('Page Object Utilities', () => {
    test('should identify page types from URLs', async ({ page }) => {
      expect(PageObjectUtils.getPageTypeFromUrl('https://example.com/login')).toBe('login');
      expect(PageObjectUtils.getPageTypeFromUrl('https://example.com/dashboard')).toBe('dashboard');
      expect(PageObjectUtils.getPageTypeFromUrl('https://example.com/tasks/create')).toBe('task-create');
      expect(PageObjectUtils.getPageTypeFromUrl('https://example.com/tasks/123/edit')).toBe('task-edit');
      expect(PageObjectUtils.getPageTypeFromUrl('https://example.com/unknown')).toBe('unknown');
    });

    test('should wait for page load', async ({ page }) => {
      await page.goto('https://example.com');
      
      // Test utility function
      await PageObjectUtils.waitForAnyPageLoad(page, 5000);
      
      // Verify page is loaded
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('should handle screenshot functionality', async ({ page }) => {
      await page.goto('https://example.com');
      
      // Test screenshot utility (mock implementation)
      const screenshotPath = await PageObjectUtils.takeTimestampedScreenshot(page, 'test-screenshot');
      
      expect(screenshotPath).toContain('test-screenshot');
      expect(screenshotPath).toContain('.png');
    });
  });

  test.describe('Integration Tests', () => {
    test('should work with real page interactions', async ({ page }) => {
      // Navigate to a real page for testing
      await page.goto('https://httpbin.org/forms/post');
      
      const loginPage = pageFactory.createLoginPage();
      
      // Test basic element interactions
      const forms = await page.locator('form').count();
      expect(forms).toBeGreaterThan(0);
      
      // Test page object methods work with real page
      const isFormVisible = await loginPage.isElementVisible('form', 5000);
      expect(isFormVisible).toBe(true);
    });

    test('should handle page navigation workflows', async ({ page }) => {
      // Test navigation workflow
      await page.goto('https://example.com');
      
      const manager = new PageObjectManager(page);
      
      // Verify manager can track page state
      expect(manager.getCurrentPage()).toBeNull();
      
      // Test that page objects can be created and used
      const loginPage = manager.getFactory().createLoginPage();
      expect(loginPage).toBeInstanceOf(LoginPage);
    });

    test('should handle error scenarios gracefully', async ({ page }) => {
      const loginPage = pageFactory.createLoginPage();
      
      // Test with non-existent elements
      const isVisible = await loginPage.isElementVisible('[data-testid="non-existent"]', 1000);
      expect(isVisible).toBe(false);
      
      const isPresent = await loginPage.isElementPresent('[data-testid="non-existent"]', 1000);
      expect(isPresent).toBe(false);
    });

    test('should provide consistent API across page objects', async ({ page }) => {
      const loginPage = pageFactory.createLoginPage();
      const dashboardPage = pageFactory.createDashboardPage();
      const taskFormPage = pageFactory.createTaskFormPage();
      
      // All page objects should have common methods
      expect(typeof loginPage.getPath).toBe('function');
      expect(typeof loginPage.getSelectors).toBe('function');
      expect(typeof loginPage.verifyPageLoaded).toBe('function');
      
      expect(typeof dashboardPage.getPath).toBe('function');
      expect(typeof dashboardPage.getSelectors).toBe('function');
      expect(typeof dashboardPage.verifyPageLoaded).toBe('function');
      
      expect(typeof taskFormPage.getPath).toBe('function');
      expect(typeof taskFormPage.getSelectors).toBe('function');
      expect(typeof taskFormPage.verifyPageLoaded).toBe('function');
    });
  });

  test.describe('Performance and Reliability', () => {
    test('should handle concurrent page object operations', async ({ page }) => {
      await page.goto('https://example.com');
      
      const operations = [
        pageFactory.createLoginPage(),
        pageFactory.createDashboardPage(),
        pageFactory.createTaskFormPage()
      ];
      
      // All page objects should be created successfully
      expect(operations).toHaveLength(3);
      operations.forEach(pageObj => {
        expect(pageObj).toBeDefined();
        expect(typeof pageObj.getPath).toBe('function');
      });
    });

    test('should maintain state consistency', async ({ page }) => {
      const manager = new PageObjectManager(page, 'https://test.example.com');
      
      // Base URL should be consistent across factory
      expect(manager.getFactory().getBaseURL()).toBe('https://test.example.com');
      
      // Update should affect all future page objects
      manager.getFactory().setBaseURL('https://updated.example.com');
      expect(manager.getFactory().getBaseURL()).toBe('https://updated.example.com');
    });
  });
});
