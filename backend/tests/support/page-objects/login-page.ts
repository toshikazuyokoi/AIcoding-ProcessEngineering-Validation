/**
 * Login Page Object
 * 
 * Page object for the login page providing login-specific functionality
 * Implements authentication-related user interactions
 * 
 * @fileoverview Login page object for authentication testing
 * @version 1.0.0
 * @since 2025-01-28
 */

import { Page } from '@playwright/test';
import { BasePage, PageVerificationResult, ElementOptions } from './base-page';
import { UIInteractionResult } from '../utils/UIHelper';

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login form validation errors
 */
export interface LoginValidationErrors {
  email?: string;
  password?: string;
  general?: string;
}

/**
 * Login page selectors
 */
export interface LoginPageSelectors {
  emailInput: string;
  passwordInput: string;
  loginButton: string;
  forgotPasswordLink: string;
  registerLink: string;
  errorMessage: string;
  loadingSpinner: string;
  rememberMeCheckbox: string;
  showPasswordButton: string;
}

/**
 * Login Page Object class
 */
export class LoginPage extends BasePage {
  private selectors: LoginPageSelectors;

  constructor(page: Page, baseURL?: string) {
    super(page, baseURL);
    this.selectors = this.getSelectors() as LoginPageSelectors;
  }

  // ===================================
  // Abstract Method Implementations
  // ===================================

  /**
   * Get the login page URL path
   */
  getPath(): string {
    return '/login';
  }

  /**
   * Get login page selectors
   */
  getSelectors(): LoginPageSelectors {
    return {
      emailInput: '[data-testid="email"]',
      passwordInput: '[data-testid="password"]',
      loginButton: '[data-testid="login-button"]',
      forgotPasswordLink: '[data-testid="forgot-password-link"]',
      registerLink: '[data-testid="register-link"]',
      errorMessage: '[data-testid="error-message"]',
      loadingSpinner: '[data-testid="loading-spinner"]',
      rememberMeCheckbox: '[data-testid="remember-me"]',
      showPasswordButton: '[data-testid="show-password"]'
    };
  }

  /**
   * Verify that the login page is loaded correctly
   */
  async verifyPageLoaded(): Promise<PageVerificationResult> {
    try {
      // Check for essential login form elements
      await this.verifyElementVisible(this.selectors.emailInput, 'Email input is visible');
      await this.verifyElementVisible(this.selectors.passwordInput, 'Password input is visible');
      await this.verifyElementVisible(this.selectors.loginButton, 'Login button is visible');

      // Verify page title
      await this.verifyPageTitle(/login|sign in/i);

      return {
        success: true,
        message: 'Login page loaded successfully'
      };
    } catch (error) {
      const screenshot = await this.takeScreenshot('login-page-verification-failed');
      return {
        success: false,
        message: `Login page verification failed: ${(error as Error).message}`,
        screenshot
      };
    }
  }

  // ===================================
  // Login-Specific Actions
  // ===================================

  /**
   * Enter email address
   */
  async enterEmail(email: string, options: ElementOptions = {}): Promise<UIInteractionResult> {
    console.log(`📧 Entering email: ${email}`);
    return await this.typeText(this.selectors.emailInput, email, {
      clear: true,
      ...options
    });
  }

  /**
   * Enter password
   */
  async enterPassword(password: string, options: ElementOptions = {}): Promise<UIInteractionResult> {
    console.log('🔒 Entering password');
    return await this.typeText(this.selectors.passwordInput, password, {
      clear: true,
      ...options
    });
  }

  /**
   * Click login button
   */
  async clickLoginButton(options: ElementOptions = {}): Promise<UIInteractionResult> {
    console.log('🔑 Clicking login button');
    return await this.clickElement(this.selectors.loginButton, options);
  }

  /**
   * Toggle remember me checkbox
   */
  async toggleRememberMe(): Promise<UIInteractionResult> {
    console.log('☑️ Toggling remember me checkbox');
    return await this.clickElement(this.selectors.rememberMeCheckbox);
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword(): Promise<UIInteractionResult> {
    console.log('🔗 Clicking forgot password link');
    return await this.clickElement(this.selectors.forgotPasswordLink);
  }

  /**
   * Click register link
   */
  async clickRegisterLink(): Promise<UIInteractionResult> {
    console.log('📝 Clicking register link');
    return await this.clickElement(this.selectors.registerLink);
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(): Promise<UIInteractionResult> {
    console.log('👁️ Toggling password visibility');
    return await this.clickElement(this.selectors.showPasswordButton);
  }

  // ===================================
  // Complete Login Workflows
  // ===================================

  /**
   * Perform complete login with credentials
   */
  async login(credentials: LoginCredentials, options: {
    rememberMe?: boolean;
    waitForRedirect?: boolean;
    expectedRedirectUrl?: string | RegExp;
  } = {}): Promise<UIInteractionResult> {
    const startTime = Date.now();

    try {
      console.log(`🚀 Starting login process for: ${credentials.email}`);

      // Enter email
      const emailResult = await this.enterEmail(credentials.email);
      if (!emailResult.success) {
        throw new Error(`Failed to enter email: ${emailResult.error}`);
      }

      // Enter password
      const passwordResult = await this.enterPassword(credentials.password);
      if (!passwordResult.success) {
        throw new Error(`Failed to enter password: ${passwordResult.error}`);
      }

      // Toggle remember me if requested
      if (options.rememberMe) {
        const rememberResult = await this.toggleRememberMe();
        if (!rememberResult.success) {
          console.warn('Failed to toggle remember me, continuing...');
        }
      }

      // Click login button
      const loginResult = await this.clickLoginButton();
      if (!loginResult.success) {
        throw new Error(`Failed to click login button: ${loginResult.error}`);
      }

      // Wait for redirect if requested
      if (options.waitForRedirect) {
        const expectedUrl = options.expectedRedirectUrl || '**/dashboard';
        await this.page.waitForURL(expectedUrl, { timeout: this.defaultTimeout });
        console.log('✅ Successfully redirected after login');
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Login completed successfully in ${duration}ms`);

      return {
        success: true,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`login-failed-${Date.now()}`);
      
      console.error(`❌ Login failed: ${(error as Error).message}`);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Attempt login with invalid credentials (for testing error handling)
   */
  async loginWithInvalidCredentials(credentials: LoginCredentials): Promise<{
    result: UIInteractionResult;
    errorMessage?: string;
  }> {
    console.log('🚫 Testing login with invalid credentials');
    
    const loginResult = await this.login(credentials, { waitForRedirect: false });
    
    // Check for error message
    let errorMessage: string | undefined;
    try {
      await this.waitForElement(this.selectors.errorMessage, 5000);
      errorMessage = await this.getElementText(this.selectors.errorMessage);
      console.log(`📋 Error message displayed: ${errorMessage}`);
    } catch {
      console.log('ℹ️ No error message found');
    }

    return {
      result: loginResult,
      errorMessage
    };
  }

  // ===================================
  // Validation and State Checking
  // ===================================

  /**
   * Check if login form is valid (no validation errors)
   */
  async isFormValid(): Promise<boolean> {
    const hasErrors = await this.isElementVisible(this.selectors.errorMessage, 1000);
    return !hasErrors;
  }

  /**
   * Get current validation errors
   */
  async getValidationErrors(): Promise<LoginValidationErrors> {
    const errors: LoginValidationErrors = {};

    // Check for general error message
    if (await this.isElementVisible(this.selectors.errorMessage, 1000)) {
      errors.general = await this.getElementText(this.selectors.errorMessage);
    }

    // Check for field-specific errors (if implemented)
    const emailErrorSelector = '[data-testid="email-error"]';
    const passwordErrorSelector = '[data-testid="password-error"]';

    if (await this.isElementVisible(emailErrorSelector, 1000)) {
      errors.email = await this.getElementText(emailErrorSelector);
    }

    if (await this.isElementVisible(passwordErrorSelector, 1000)) {
      errors.password = await this.getElementText(passwordErrorSelector);
    }

    return errors;
  }

  /**
   * Check if login is in progress (loading state)
   */
  async isLoginInProgress(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.loadingSpinner, 1000);
  }

  /**
   * Wait for login to complete (loading to finish)
   */
  async waitForLoginComplete(timeout: number = this.defaultTimeout): Promise<void> {
    try {
      // Wait for loading spinner to appear (if it does)
      await this.waitForElement(this.selectors.loadingSpinner, 2000);
      console.log('⏳ Login in progress...');
      
      // Wait for loading spinner to disappear
      await this.waitForElementHidden(this.selectors.loadingSpinner, timeout);
      console.log('✅ Login process completed');
    } catch {
      // Loading spinner might not appear for fast logins
      console.log('ℹ️ No loading state detected');
    }
  }

  // ===================================
  // Utility Methods
  // ===================================

  /**
   * Clear login form
   */
  async clearForm(): Promise<void> {
    console.log('🧹 Clearing login form');
    await this.typeText(this.selectors.emailInput, '', { clear: true });
    await this.typeText(this.selectors.passwordInput, '', { clear: true });
  }

  /**
   * Get current form values
   */
  async getFormValues(): Promise<{ email: string; password: string }> {
    const email = await this.getElement(this.selectors.emailInput).inputValue();
    const password = await this.getElement(this.selectors.passwordInput).inputValue();
    
    return { email, password };
  }

  /**
   * Check if remember me is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return await this.getElement(this.selectors.rememberMeCheckbox).isChecked();
  }
}
