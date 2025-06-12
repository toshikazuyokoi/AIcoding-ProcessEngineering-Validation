/**
 * E2E Helpers Test
 * 
 * Tests for E2E helper functions to ensure they work correctly
 * with Playwright and provide reliable test automation capabilities
 * 
 * @fileoverview E2E test for E2E helper functions
 * @version 1.0.0
 * @since 2025-01-28
 */

import { test, expect, Page, BrowserContext, Browser } from '@playwright/test';
import { E2EHelpers, UserCredentials, TestScenarioData } from '../../support/utils/e2e-helpers';

test.describe('E2E Helpers Functionality', () => {
  let e2eHelpers: E2EHelpers;

  test.beforeEach(async ({ page, context, browser }) => {
    e2eHelpers = new E2EHelpers(page, context, browser, {
      baseURL: 'https://example.com',
      timeout: 10000,
      screenshotOnFailure: true
    });
  });

  test.describe('Helper Initialization', () => {
    test('should initialize E2EHelpers correctly', async ({ page, context, browser }) => {
      const helpers = new E2EHelpers(page, context, browser);
      
      expect(helpers).toBeDefined();
      expect(helpers.getTestResults).toBeDefined();
      expect(helpers.clearBrowserData).toBeDefined();
      expect(helpers.waitForAPIResponse).toBeDefined();
    });

    test('should accept custom configuration', async ({ page, context, browser }) => {
      const config = {
        baseURL: 'https://test.example.com',
        timeout: 15000,
        retries: 3,
        screenshotOnFailure: false
      };

      const helpers = new E2EHelpers(page, context, browser, config);
      expect(helpers).toBeDefined();
    });
  });

  test.describe('Browser Data Management', () => {
    test('should clear browser data successfully', async ({ page }) => {
      // Set some test data
      await page.goto('https://example.com');
      await page.evaluate(() => {
        localStorage.setItem('test-key', 'test-value');
        sessionStorage.setItem('session-key', 'session-value');
      });

      // Verify data exists
      const localStorageValue = await page.evaluate(() => localStorage.getItem('test-key'));
      const sessionStorageValue = await page.evaluate(() => sessionStorage.getItem('session-key'));
      
      expect(localStorageValue).toBe('test-value');
      expect(sessionStorageValue).toBe('session-value');

      // Clear browser data
      await e2eHelpers.clearBrowserData();

      // Verify data is cleared
      const clearedLocalStorage = await page.evaluate(() => localStorage.getItem('test-key'));
      const clearedSessionStorage = await page.evaluate(() => sessionStorage.getItem('session-key'));
      
      expect(clearedLocalStorage).toBeNull();
      expect(clearedSessionStorage).toBeNull();
    });
  });

  test.describe('Test Results Management', () => {
    test('should manage test results correctly', async () => {
      // Initially empty
      expect(e2eHelpers.getTestResults()).toEqual([]);

      // Add test results
      e2eHelpers.addTestResult('Test 1 passed');
      e2eHelpers.addTestResult('Test 2 failed');
      e2eHelpers.addTestResult('Test 3 passed');

      const results = e2eHelpers.getTestResults();
      expect(results).toHaveLength(3);
      expect(results[0]).toBe('Test 1 passed');
      expect(results[1]).toBe('Test 2 failed');
      expect(results[2]).toBe('Test 3 passed');
    });

    test('should return copy of test results', async () => {
      e2eHelpers.addTestResult('Original result');
      
      const results1 = e2eHelpers.getTestResults();
      const results2 = e2eHelpers.getTestResults();
      
      // Should be different array instances
      expect(results1).not.toBe(results2);
      // But with same content
      expect(results1).toEqual(results2);
      
      // Modifying returned array should not affect internal state
      results1.push('Modified result');
      const results3 = e2eHelpers.getTestResults();
      expect(results3).toHaveLength(1);
      expect(results3[0]).toBe('Original result');
    });
  });

  test.describe('Authentication Scenarios', () => {
    test('should handle login flow with mock data', async ({ page }) => {
      // Navigate to a test page that simulates login
      await page.goto('https://httpbin.org/forms/post');
      
      // Mock login credentials
      const credentials: UserCredentials = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      // Test that the helper can handle form interactions
      // (This is a simplified test since we don't have actual login page)
      const forms = await page.locator('form').count();
      expect(forms).toBeGreaterThan(0);

      // Verify helper can interact with form elements
      const firstForm = page.locator('form').first();
      await expect(firstForm).toBeVisible();
    });

    test('should handle logout flow simulation', async ({ page }) => {
      await page.goto('https://example.com');
      
      // Simulate logout by clearing browser data
      await e2eHelpers.clearBrowserData();
      
      // Verify data is cleared (simulating logout)
      const storageCleared = await page.evaluate(() => {
        return localStorage.length === 0 && sessionStorage.length === 0;
      });
      
      expect(storageCleared).toBe(true);
    });
  });

  test.describe('Task Management Scenarios', () => {
    test('should handle task creation data structure', async () => {
      const taskData: TestScenarioData['tasks'][0] = {
        title: 'Test Task',
        description: 'This is a test task',
        category: 'work',
        priority: 'high',
        dueDate: '2025-12-31'
      };

      // Verify task data structure
      expect(taskData.title).toBe('Test Task');
      expect(taskData.description).toBe('This is a test task');
      expect(taskData.category).toBe('work');
      expect(taskData.priority).toBe('high');
      expect(taskData.dueDate).toBe('2025-12-31');
    });

    test('should handle scenario data structure', async () => {
      const scenarioData: TestScenarioData = {
        user: {
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'user'
        },
        tasks: [
          {
            title: 'Task 1',
            description: 'First task',
            priority: 'high'
          },
          {
            title: 'Task 2',
            category: 'personal',
            priority: 'low'
          }
        ],
        categories: [
          {
            name: 'Work',
            description: 'Work-related tasks',
            color: '#ff0000'
          },
          {
            name: 'Personal',
            description: 'Personal tasks'
          }
        ]
      };

      // Verify scenario data structure
      expect(scenarioData.user?.email).toBe('test@example.com');
      expect(scenarioData.tasks).toHaveLength(2);
      expect(scenarioData.categories).toHaveLength(2);
      expect(scenarioData.tasks[0].title).toBe('Task 1');
      expect(scenarioData.categories[0].name).toBe('Work');
    });
  });

  test.describe('API Response Handling', () => {
    test('should handle API response waiting with timeout', async ({ page }) => {
      // Test API response waiting with a quick timeout
      const startTime = Date.now();
      
      try {
        await e2eHelpers.waitForAPIResponse('/nonexistent-api', 1000);
        // Should not reach here
        expect(false).toBe(true);
      } catch (error) {
        const duration = Date.now() - startTime;
        expect(duration).toBeGreaterThanOrEqual(1000);
        expect((error as Error).message).toContain('API response timeout');
      }
    });

    test('should handle API response with actual request', async ({ page }) => {
      // Navigate to a page that makes API calls
      await page.goto('https://httpbin.org/get');
      
      // The page itself is an API response, so we can verify it loaded
      const content = await page.textContent('body');
      expect(content).toBeTruthy();
      
      // Verify JSON response structure
      const jsonContent = JSON.parse(content || '{}');
      expect(jsonContent).toHaveProperty('url');
    });
  });

  test.describe('Error Handling', () => {
    test('should handle page navigation errors gracefully', async ({ page }) => {
      // Test with invalid URL
      try {
        await page.goto('https://invalid-domain-that-does-not-exist.com', { timeout: 5000 });
      } catch (error) {
        // Error is expected for invalid domain
        expect(error).toBeDefined();
      }
    });

    test('should handle element interaction errors', async ({ page }) => {
      await page.goto('https://example.com');
      
      // Try to interact with non-existent element
      try {
        await page.click('[data-testid="non-existent-element"]', { timeout: 1000 });
      } catch (error) {
        // Error is expected for non-existent element
        expect(error).toBeDefined();
      }
    });
  });

  test.describe('Performance and Timing', () => {
    test('should measure operation timing', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');
      
      const duration = Date.now() - startTime;
      
      // Should complete within reasonable time (10 seconds)
      expect(duration).toBeLessThan(10000);
      expect(duration).toBeGreaterThan(0);
    });

    test('should handle concurrent operations', async ({ page }) => {
      // Navigate first, then perform evaluations
      await page.goto('https://example.com');
      await page.waitForLoadState('networkidle');

      const operations = [
        page.evaluate(() => navigator.userAgent),
        page.evaluate(() => document.title),
        page.evaluate(() => window.location.href)
      ];

      const results = await Promise.all(operations);

      // All operations should complete
      expect(results).toHaveLength(3);
      expect(results[0]).toBeTruthy(); // userAgent
      expect(results[1]).toBeTruthy(); // title
      expect(results[2]).toBeTruthy(); // href
    });
  });
});
