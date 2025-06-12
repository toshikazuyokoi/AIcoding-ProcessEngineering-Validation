/**
 * Base Page Object
 * 
 * Abstract base class for all page objects providing common functionality
 * Implements the Page Object Model pattern for E2E testing
 * 
 * @fileoverview Base page object with common page operations
 * @version 1.0.0
 * @since 2025-01-28
 */

import { Page, Locator, expect } from '@playwright/test';
import { UIHelper, UIInteractionResult } from '../utils/UIHelper';

/**
 * Page navigation options
 */
export interface NavigationOptions {
  timeout?: number;
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle';
  expectedUrl?: string | RegExp;
}

/**
 * Element interaction options
 */
export interface ElementOptions {
  timeout?: number;
  force?: boolean;
  visible?: boolean;
  enabled?: boolean;
}

/**
 * Page verification result
 */
export interface PageVerificationResult {
  success: boolean;
  message: string;
  screenshot?: string;
}

/**
 * Abstract base page object class
 */
export abstract class BasePage {
  protected page: Page;
  protected uiHelper: UIHelper;
  protected baseURL: string;
  protected defaultTimeout: number;

  constructor(page: Page, baseURL: string = 'http://localhost:3000') {
    this.page = page;
    this.baseURL = baseURL;
    this.defaultTimeout = 30000;
    this.uiHelper = new UIHelper();
    this.uiHelper.setPage(page);
  }

  // ===================================
  // Abstract Methods (must be implemented by subclasses)
  // ===================================

  /**
   * Get the page URL path
   */
  abstract getPath(): string;

  /**
   * Verify that the page is loaded correctly
   */
  abstract verifyPageLoaded(): Promise<PageVerificationResult>;

  /**
   * Get page-specific selectors
   */
  abstract getSelectors(): Record<string, string>;

  // ===================================
  // Common Navigation Methods
  // ===================================

  /**
   * Navigate to this page
   */
  async navigate(options: NavigationOptions = {}): Promise<UIInteractionResult> {
    const url = `${this.baseURL}${this.getPath()}`;
    const timeout = options.timeout || this.defaultTimeout;

    try {
      await this.page.goto(url, {
        timeout,
        waitUntil: options.waitUntil || 'networkidle'
      });

      // Wait for expected URL if specified
      if (options.expectedUrl) {
        await this.page.waitForURL(options.expectedUrl, { timeout });
      }

      // Verify page is loaded
      const verification = await this.verifyPageLoaded();
      if (!verification.success) {
        throw new Error(`Page verification failed: ${verification.message}`);
      }

      console.log(`✅ Successfully navigated to ${url}`);
      return {
        success: true,
        duration: 0 // Will be calculated by caller if needed
      };
    } catch (error) {
      console.error(`❌ Failed to navigate to ${url}:`, error);
      const screenshot = await this.uiHelper.takeScreenshot(`navigation-error-${Date.now()}`);
      
      return {
        success: false,
        duration: 0,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Reload the current page
   */
  async reload(options: { timeout?: number } = {}): Promise<void> {
    await this.page.reload({
      timeout: options.timeout || this.defaultTimeout,
      waitUntil: 'networkidle'
    });

    // Verify page is loaded after reload
    const verification = await this.verifyPageLoaded();
    if (!verification.success) {
      throw new Error(`Page verification failed after reload: ${verification.message}`);
    }
  }

  // ===================================
  // Common Element Interaction Methods
  // ===================================

  /**
   * Get element by selector
   */
  protected getElement(selector: string): Locator {
    return this.page.locator(selector);
  }

  /**
   * Get element by data-testid
   */
  protected getByTestId(testId: string): Locator {
    return this.page.locator(`[data-testid="${testId}"]`);
  }

  /**
   * Click element with error handling
   */
  async clickElement(selector: string, options: ElementOptions = {}): Promise<UIInteractionResult> {
    return await this.uiHelper.clickElement(selector, {
      timeout: options.timeout,
      visible: options.visible,
      enabled: options.enabled
    });
  }

  /**
   * Type text into element
   */
  async typeText(selector: string, text: string, options: ElementOptions & { clear?: boolean } = {}): Promise<UIInteractionResult> {
    return await this.uiHelper.typeText(selector, text, {
      timeout: options.timeout,
      clear: options.clear,
      visible: options.visible,
      enabled: options.enabled
    });
  }

  /**
   * Get text content from element
   */
  async getElementText(selector: string, options: ElementOptions = {}): Promise<string> {
    return await this.uiHelper.getElementText(selector, {
      timeout: options.timeout,
      visible: options.visible
    });
  }

  /**
   * Check if element is visible
   */
  async isElementVisible(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.getElement(selector).waitFor({ 
        state: 'visible', 
        timeout 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if element exists (attached to DOM)
   */
  async isElementPresent(selector: string, timeout: number = 5000): Promise<boolean> {
    try {
      await this.getElement(selector).waitFor({ 
        state: 'attached', 
        timeout 
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string, timeout: number = this.defaultTimeout): Promise<Locator> {
    const element = this.getElement(selector);
    await element.waitFor({ state: 'visible', timeout });
    return element;
  }

  /**
   * Wait for element to be hidden
   */
  async waitForElementHidden(selector: string, timeout: number = this.defaultTimeout): Promise<void> {
    await this.getElement(selector).waitFor({ state: 'hidden', timeout });
  }

  // ===================================
  // Common Verification Methods
  // ===================================

  /**
   * Verify element is visible
   */
  async verifyElementVisible(selector: string, message?: string): Promise<void> {
    await expect(this.getElement(selector)).toBeVisible({
      timeout: this.defaultTimeout
    });
    
    if (message) {
      console.log(`✅ ${message}`);
    }
  }

  /**
   * Verify element contains text
   */
  async verifyElementText(selector: string, expectedText: string | RegExp): Promise<void> {
    await expect(this.getElement(selector)).toContainText(expectedText, {
      timeout: this.defaultTimeout
    });
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string | RegExp): Promise<void> {
    await expect(this.page).toHaveTitle(expectedTitle, {
      timeout: this.defaultTimeout
    });
  }

  /**
   * Verify current URL
   */
  async verifyCurrentUrl(expectedUrl: string | RegExp): Promise<void> {
    await expect(this.page).toHaveURL(expectedUrl, {
      timeout: this.defaultTimeout
    });
  }

  // ===================================
  // Utility Methods
  // ===================================

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string): Promise<string> {
    return await this.uiHelper.takeScreenshot(name);
  }

  /**
   * Wait for page load
   */
  async waitForPageLoad(timeout: number = this.defaultTimeout): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  /**
   * Get current URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return await this.page.title();
  }

  /**
   * Execute JavaScript in page context
   */
  async executeScript<T>(script: string | Function, ...args: any[]): Promise<T> {
    return await this.page.evaluate(script, ...args);
  }

  /**
   * Scroll to element
   */
  async scrollToElement(selector: string): Promise<void> {
    await this.getElement(selector).scrollIntoViewIfNeeded();
  }

  /**
   * Hover over element
   */
  async hoverElement(selector: string): Promise<void> {
    await this.getElement(selector).hover();
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    return await this.getElement(selector).count();
  }
}
