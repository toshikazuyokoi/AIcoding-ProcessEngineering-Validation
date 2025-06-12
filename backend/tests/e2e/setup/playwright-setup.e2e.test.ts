/**
 * Playwright Setup E2E Test
 * 
 * Basic E2E test to verify Playwright configuration and setup
 * Tests browser initialization, navigation, and basic interactions
 * 
 * @fileoverview E2E test for Playwright setup verification
 * @version 1.0.0
 * @since 2025-01-28
 */

import { test, expect, Page, BrowserContext } from '@playwright/test';

test.describe('Playwright Setup Verification', () => {
  test.beforeEach(async ({ page }) => {
    // Basic setup for each test
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should verify Playwright configuration', async ({ page }) => {
    // Test basic page navigation to a simple URL
    await page.goto('https://example.com');

    // Verify page loads successfully
    await expect(page).toHaveTitle(/Example Domain/i);

    // Verify basic page structure
    await expect(page.locator('body')).toBeVisible();

    // Take screenshot for verification
    await page.screenshot({
      path: 'test-results/config-test-screenshot.png',
      fullPage: true
    });
  });

  test('should handle basic navigation', async ({ page }) => {
    await page.goto('https://example.com');

    // Test basic page elements exist
    const heading = page.locator('h1');
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Test page responsiveness
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(1000);
  });

  test('should support multiple browser contexts', async ({ browser }) => {
    // Create multiple contexts to test isolation
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    // Navigate both pages
    await page1.goto('https://example.com');
    await page2.goto('https://httpbin.org/get');

    // Verify both pages loaded independently
    await expect(page1.locator('body')).toBeVisible();
    await expect(page2.locator('body')).toBeVisible();

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('should handle API requests', async ({ page, request }) => {
    // Test external API endpoint
    const response = await request.get('https://httpbin.org/get');

    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('url');
    expect(data.url).toBe('https://httpbin.org/get');
  });

  test('should support local storage operations', async ({ page }) => {
    await page.goto('https://example.com');

    // Test local storage functionality
    await page.evaluate(() => {
      localStorage.setItem('test-key', 'test-value');
    });

    const storedValue = await page.evaluate(() => {
      return localStorage.getItem('test-key');
    });

    expect(storedValue).toBe('test-value');

    // Cleanup
    await page.evaluate(() => {
      localStorage.removeItem('test-key');
    });
  });

  test('should handle form interactions', async ({ page }) => {
    await page.goto('https://httpbin.org/forms/post');

    // Look for form elements on httpbin form page
    const forms = await page.locator('form').count();

    if (forms > 0) {
      const firstForm = page.locator('form').first();
      await expect(firstForm).toBeVisible();

      // Test basic form interaction
      const inputs = await firstForm.locator('input[type="text"]').count();
      if (inputs > 0) {
        const firstInput = firstForm.locator('input[type="text"]').first();
        await firstInput.click();
        await firstInput.fill('test input');

        const value = await firstInput.inputValue();
        expect(value).toBe('test input');
      }
    } else {
      console.log('No forms found, skipping form interaction test');
    }
  });

  test('should support error handling', async ({ page }) => {
    // Test error handling with a fresh page context
    await page.goto('https://example.com');
    await expect(page.locator('body')).toBeVisible();

    // Test JavaScript error handling
    const jsError = await page.evaluate(() => {
      try {
        // Intentionally cause an error
        throw new Error('Test error');
      } catch (error) {
        return error.message;
      }
    });

    expect(jsError).toBe('Test error');
    console.log('Error handling verified: JavaScript errors caught successfully');
  });

  test('should measure page performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('https://example.com');

    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time (5 seconds)
    expect(loadTime).toBeLessThan(5000);

    // Test page metrics if available
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      };
    });

    console.log('Page Performance Metrics:', metrics);
  });

  test('should support screenshot and video recording', async ({ page }) => {
    await page.goto('https://example.com');

    // Take element screenshot
    const body = page.locator('body');
    await body.screenshot({ path: 'test-results/body-screenshot.png' });

    // Perform some interactions for video recording
    await page.mouse.move(100, 100);
    await page.mouse.move(200, 200);
    await page.waitForTimeout(1000);

    // Video recording is handled automatically by Playwright config
  });

  test('should verify browser capabilities', async ({ page }) => {
    // This test verifies basic browser capabilities

    await page.goto('https://example.com');

    // Test JavaScript execution
    const jsResult = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        cookieEnabled: navigator.cookieEnabled,
        language: navigator.language,
      };
    });

    expect(jsResult.userAgent).toBeTruthy();
    expect(jsResult.cookieEnabled).toBe(true);
    expect(jsResult.language).toBeTruthy();

    console.log('Browser capabilities verified:', jsResult);
  });
});
