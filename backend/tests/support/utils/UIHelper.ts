/**
 * ===================================
 * UI Helper for Integration Tests
 * ===================================
 * Generated for TSK-IT-001-001-TestUtilities
 * Project: Task Management System - Integration Test
 * Purpose: UI interaction utilities for E2E testing
 */

import { Page, Browser, ElementHandle, Locator } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Element wait options
 */
export interface WaitOptions {
  timeout?: number;
  visible?: boolean;
  hidden?: boolean;
  enabled?: boolean;
  disabled?: boolean;
}

/**
 * Screenshot options
 */
export interface ScreenshotOptions {
  fullPage?: boolean;
  quality?: number;
  type?: 'png' | 'jpeg';
  path?: string;
  clip?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

/**
 * Form data interface
 */
export interface FormData {
  [fieldName: string]: string | number | boolean;
}

/**
 * UI interaction result
 */
export interface UIInteractionResult {
  success: boolean;
  duration: number;
  error?: string;
  screenshot?: string;
}

/**
 * UI Helper class
 */
export class UIHelper {
  private page: Page | null = null;
  private browser: Browser | null = null;
  private screenshotDir: string;
  private defaultTimeout: number;

  constructor() {
    this.screenshotDir = path.resolve(process.cwd(), 'test-results', 'screenshots');
    this.defaultTimeout = parseInt(process.env.UI_TIMEOUT || '30000');
    this.ensureScreenshotDir();
  }

  // ===================================
  // Page Management
  // ===================================

  /**
   * Set page instance
   */
  public setPage(page: Page): void {
    this.page = page;
  }

  /**
   * Set browser instance
   */
  public setBrowser(browser: Browser): void {
    this.browser = browser;
  }

  /**
   * Get current page
   */
  public getPage(): Page {
    if (!this.page) {
      throw new Error('Page not initialized. Call setPage() first.');
    }
    return this.page;
  }

  // ===================================
  // Element Operations
  // ===================================

  /**
   * Wait for element
   */
  public async waitForElement(
    selector: string, 
    options: WaitOptions = {}
  ): Promise<Locator> {
    const page = this.getPage();
    const timeout = options.timeout || this.defaultTimeout;

    try {
      const locator = page.locator(selector);
      
      if (options.visible !== false) {
        await locator.waitFor({ state: 'visible', timeout });
      }
      
      if (options.enabled) {
        await locator.waitFor({ state: 'attached', timeout });
        await page.waitForFunction(
          (sel) => {
            const el = document.querySelector(sel);
            return el && !el.hasAttribute('disabled');
          },
          selector,
          { timeout }
        );
      }

      console.log(`✅ Element found: ${selector}`);
      return locator;
    } catch (error) {
      console.error(`❌ Element not found: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Click element
   */
  public async clickElement(selector: string, options: WaitOptions = {}): Promise<UIInteractionResult> {
    const startTime = Date.now();
    
    try {
      const locator = await this.waitForElement(selector, options);
      await locator.click();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Clicked element: ${selector} (${duration}ms)`);
      
      return {
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`click-error-${Date.now()}`);
      
      console.error(`❌ Failed to click element: ${selector}`, error);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Type text into element
   */
  public async typeText(
    selector: string, 
    text: string, 
    options: WaitOptions & { clear?: boolean } = {}
  ): Promise<UIInteractionResult> {
    const startTime = Date.now();
    
    try {
      const locator = await this.waitForElement(selector, options);
      
      if (options.clear !== false) {
        await locator.clear();
      }
      
      await locator.type(text);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Typed text into element: ${selector} (${duration}ms)`);
      
      return {
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`type-error-${Date.now()}`);
      
      console.error(`❌ Failed to type text into element: ${selector}`, error);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Get element text
   */
  public async getElementText(selector: string, options: WaitOptions = {}): Promise<string> {
    try {
      const locator = await this.waitForElement(selector, options);
      const text = await locator.textContent();
      
      console.log(`✅ Got text from element: ${selector}`);
      return text || '';
    } catch (error) {
      console.error(`❌ Failed to get text from element: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Get element attribute
   */
  public async getElementAttribute(
    selector: string, 
    attribute: string, 
    options: WaitOptions = {}
  ): Promise<string | null> {
    try {
      const locator = await this.waitForElement(selector, options);
      const value = await locator.getAttribute(attribute);
      
      console.log(`✅ Got attribute ${attribute} from element: ${selector}`);
      return value;
    } catch (error) {
      console.error(`❌ Failed to get attribute ${attribute} from element: ${selector}`, error);
      throw error;
    }
  }

  // ===================================
  // Form Operations
  // ===================================

  /**
   * Fill form
   */
  public async fillForm(formData: FormData, formSelector?: string): Promise<UIInteractionResult> {
    const startTime = Date.now();
    
    try {
      for (const [fieldName, value] of Object.entries(formData)) {
        const selector = formSelector 
          ? `${formSelector} [name="${fieldName}"], ${formSelector} #${fieldName}`
          : `[name="${fieldName}"], #${fieldName}`;
        
        if (typeof value === 'boolean') {
          const locator = await this.waitForElement(selector);
          if (value) {
            await locator.check();
          } else {
            await locator.uncheck();
          }
        } else {
          await this.typeText(selector, String(value));
        }
      }
      
      const duration = Date.now() - startTime;
      console.log(`✅ Form filled successfully (${duration}ms)`);
      
      return {
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`form-error-${Date.now()}`);
      
      console.error('❌ Failed to fill form:', error);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Submit form
   */
  public async submitForm(formSelector: string): Promise<UIInteractionResult> {
    const startTime = Date.now();
    
    try {
      const submitSelector = `${formSelector} [type="submit"], ${formSelector} button[type="submit"]`;
      await this.clickElement(submitSelector);
      
      const duration = Date.now() - startTime;
      console.log(`✅ Form submitted successfully (${duration}ms)`);
      
      return {
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`submit-error-${Date.now()}`);
      
      console.error('❌ Failed to submit form:', error);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  // ===================================
  // Navigation Operations
  // ===================================

  /**
   * Navigate to URL
   */
  public async navigateTo(url: string, options: { timeout?: number } = {}): Promise<UIInteractionResult> {
    const startTime = Date.now();
    
    try {
      const page = this.getPage();
      await page.goto(url, { timeout: options.timeout || this.defaultTimeout });
      
      const duration = Date.now() - startTime;
      console.log(`✅ Navigated to: ${url} (${duration}ms)`);
      
      return {
        success: true,
        duration
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`navigation-error-${Date.now()}`);
      
      console.error(`❌ Failed to navigate to: ${url}`, error);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Wait for page load
   */
  public async waitForPageLoad(timeout: number = this.defaultTimeout): Promise<void> {
    try {
      const page = this.getPage();
      await page.waitForLoadState('networkidle', { timeout });
      console.log('✅ Page loaded successfully');
    } catch (error) {
      console.error('❌ Page load timeout:', error);
      throw error;
    }
  }

  // ===================================
  // Screenshot Operations
  // ===================================

  /**
   * Take screenshot
   */
  public async takeScreenshot(name: string, options: ScreenshotOptions = {}): Promise<string> {
    try {
      const page = this.getPage();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `${name}-${timestamp}.png`;
      const filepath = path.join(this.screenshotDir, filename);
      
      await page.screenshot({
        path: filepath,
        fullPage: options.fullPage !== false,
        quality: options.quality,
        type: options.type || 'png',
        clip: options.clip
      });
      
      console.log(`✅ Screenshot saved: ${filepath}`);
      return filepath;
    } catch (error) {
      console.error('❌ Failed to take screenshot:', error);
      throw error;
    }
  }

  // ===================================
  // Utility Functions
  // ===================================

  /**
   * Wait for condition
   */
  public async waitForCondition(
    condition: () => Promise<boolean>,
    timeout: number = this.defaultTimeout,
    interval: number = 100
  ): Promise<void> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      try {
        if (await condition()) {
          return;
        }
      } catch (error) {
        // Continue waiting
      }
      
      await this.sleep(interval);
    }
    
    throw new Error(`Condition not met within ${timeout}ms`);
  }

  /**
   * Sleep utility
   */
  public async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ensure screenshot directory exists
   */
  private ensureScreenshotDir(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }
}
