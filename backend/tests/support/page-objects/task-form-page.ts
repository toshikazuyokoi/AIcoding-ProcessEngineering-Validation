/**
 * Task Form Page Object
 * 
 * Page object for task creation and editing forms
 * Handles task form interactions and validation
 * 
 * @fileoverview Task form page object for task management testing
 * @version 1.0.0
 * @since 2025-01-28
 */

import { Page } from '@playwright/test';
import { BasePage, PageVerificationResult, ElementOptions } from './base-page';
import { UIInteractionResult } from '../utils/UIHelper';

/**
 * Task form data interface
 */
export interface TaskFormData {
  title: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
  status?: 'pending' | 'in_progress' | 'completed';
}

/**
 * Task form validation errors
 */
export interface TaskFormValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  priority?: string;
  dueDate?: string;
  general?: string;
}

/**
 * Task form page selectors
 */
export interface TaskFormPageSelectors {
  // Form container
  taskForm: string;
  formTitle: string;
  
  // Form fields
  titleInput: string;
  descriptionInput: string;
  categorySelect: string;
  prioritySelect: string;
  dueDateInput: string;
  statusSelect: string;
  
  // Form actions
  saveButton: string;
  cancelButton: string;
  resetButton: string;
  
  // Validation and messages
  errorMessage: string;
  successMessage: string;
  fieldError: string;
  
  // Loading states
  loadingSpinner: string;
  savingSpinner: string;
  
  // Category options
  categoryOption: string;
  
  // Priority options
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  
  // Status options
  statusPending: string;
  statusInProgress: string;
  statusCompleted: string;
}

/**
 * Task Form Page Object class
 */
export class TaskFormPage extends BasePage {
  private selectors: TaskFormPageSelectors;
  private isEditMode: boolean;

  constructor(page: Page, baseURL?: string, isEditMode: boolean = false) {
    super(page, baseURL);
    this.isEditMode = isEditMode;
    this.selectors = this.getSelectors() as TaskFormPageSelectors;
  }

  // ===================================
  // Abstract Method Implementations
  // ===================================

  /**
   * Get the task form page URL path
   */
  getPath(): string {
    return this.isEditMode ? '/tasks/edit' : '/tasks/create';
  }

  /**
   * Get task form page selectors
   */
  getSelectors(): TaskFormPageSelectors {
    return {
      // Form container
      taskForm: '[data-testid="task-form"]',
      formTitle: '[data-testid="form-title"]',
      
      // Form fields
      titleInput: '[data-testid="task-title"]',
      descriptionInput: '[data-testid="task-description"]',
      categorySelect: '[data-testid="task-category"]',
      prioritySelect: '[data-testid="task-priority"]',
      dueDateInput: '[data-testid="task-due-date"]',
      statusSelect: '[data-testid="task-status"]',
      
      // Form actions
      saveButton: '[data-testid="save-task-button"]',
      cancelButton: '[data-testid="cancel-button"]',
      resetButton: '[data-testid="reset-button"]',
      
      // Validation and messages
      errorMessage: '[data-testid="error-message"]',
      successMessage: '[data-testid="task-success-message"]',
      fieldError: '[data-testid*="error"]',
      
      // Loading states
      loadingSpinner: '[data-testid="loading-spinner"]',
      savingSpinner: '[data-testid="saving-spinner"]',
      
      // Category options
      categoryOption: '[data-testid^="category-"]',
      
      // Priority options
      priorityLow: '[data-testid="priority-low"]',
      priorityMedium: '[data-testid="priority-medium"]',
      priorityHigh: '[data-testid="priority-high"]',
      
      // Status options
      statusPending: '[data-testid="status-pending"]',
      statusInProgress: '[data-testid="status-in_progress"]',
      statusCompleted: '[data-testid="status-completed"]'
    };
  }

  /**
   * Verify that the task form page is loaded correctly
   */
  async verifyPageLoaded(): Promise<PageVerificationResult> {
    try {
      // Check for essential form elements
      await this.verifyElementVisible(this.selectors.taskForm, 'Task form is visible');
      await this.verifyElementVisible(this.selectors.titleInput, 'Title input is visible');
      await this.verifyElementVisible(this.selectors.saveButton, 'Save button is visible');

      // Verify form title based on mode
      const expectedTitle = this.isEditMode ? /edit.*task/i : /create.*task|new.*task/i;
      if (await this.isElementVisible(this.selectors.formTitle, 2000)) {
        await this.verifyElementText(this.selectors.formTitle, expectedTitle);
      }

      return {
        success: true,
        message: `Task form page loaded successfully (${this.isEditMode ? 'edit' : 'create'} mode)`
      };
    } catch (error) {
      const screenshot = await this.takeScreenshot('task-form-page-verification-failed');
      return {
        success: false,
        message: `Task form page verification failed: ${(error as Error).message}`,
        screenshot
      };
    }
  }

  // ===================================
  // Form Field Actions
  // ===================================

  /**
   * Enter task title
   */
  async enterTitle(title: string, options: ElementOptions = {}): Promise<UIInteractionResult> {
    console.log(`📝 Entering task title: ${title}`);
    return await this.typeText(this.selectors.titleInput, title, {
      clear: true,
      ...options
    });
  }

  /**
   * Enter task description
   */
  async enterDescription(description: string, options: ElementOptions = {}): Promise<UIInteractionResult> {
    console.log(`📄 Entering task description: ${description.substring(0, 50)}...`);
    return await this.typeText(this.selectors.descriptionInput, description, {
      clear: true,
      ...options
    });
  }

  /**
   * Select task category
   */
  async selectCategory(category: string): Promise<UIInteractionResult> {
    console.log(`🏷️ Selecting category: ${category}`);
    
    // Click category dropdown
    const dropdownResult = await this.clickElement(this.selectors.categorySelect);
    if (!dropdownResult.success) {
      return dropdownResult;
    }

    // Wait for options to appear and select the category
    await this.waitForElement(`[data-testid="category-${category}"]`);
    return await this.clickElement(`[data-testid="category-${category}"]`);
  }

  /**
   * Select task priority
   */
  async selectPriority(priority: 'low' | 'medium' | 'high'): Promise<UIInteractionResult> {
    console.log(`⚡ Selecting priority: ${priority}`);
    return await this.clickElement(`[data-testid="priority-${priority}"]`);
  }

  /**
   * Enter due date
   */
  async enterDueDate(dueDate: string, options: ElementOptions = {}): Promise<UIInteractionResult> {
    console.log(`📅 Entering due date: ${dueDate}`);
    return await this.typeText(this.selectors.dueDateInput, dueDate, {
      clear: true,
      ...options
    });
  }

  /**
   * Select task status (for edit mode)
   */
  async selectStatus(status: 'pending' | 'in_progress' | 'completed'): Promise<UIInteractionResult> {
    console.log(`📊 Selecting status: ${status}`);
    return await this.clickElement(`[data-testid="status-${status}"]`);
  }

  // ===================================
  // Form Actions
  // ===================================

  /**
   * Save task form
   */
  async saveTask(): Promise<UIInteractionResult> {
    console.log('💾 Saving task');
    return await this.clickElement(this.selectors.saveButton);
  }

  /**
   * Cancel task form
   */
  async cancelForm(): Promise<UIInteractionResult> {
    console.log('❌ Cancelling task form');
    return await this.clickElement(this.selectors.cancelButton);
  }

  /**
   * Reset task form
   */
  async resetForm(): Promise<UIInteractionResult> {
    console.log('🔄 Resetting task form');
    return await this.clickElement(this.selectors.resetButton);
  }

  // ===================================
  // Complete Form Workflows
  // ===================================

  /**
   * Fill complete task form
   */
  async fillTaskForm(taskData: TaskFormData): Promise<UIInteractionResult> {
    const startTime = Date.now();

    try {
      console.log('📋 Filling task form with data:', taskData);

      // Enter title (required)
      const titleResult = await this.enterTitle(taskData.title);
      if (!titleResult.success) {
        throw new Error(`Failed to enter title: ${titleResult.error}`);
      }

      // Enter description (optional)
      if (taskData.description) {
        const descResult = await this.enterDescription(taskData.description);
        if (!descResult.success) {
          console.warn(`Failed to enter description: ${descResult.error}`);
        }
      }

      // Select category (optional)
      if (taskData.category) {
        const categoryResult = await this.selectCategory(taskData.category);
        if (!categoryResult.success) {
          console.warn(`Failed to select category: ${categoryResult.error}`);
        }
      }

      // Select priority (optional)
      if (taskData.priority) {
        const priorityResult = await this.selectPriority(taskData.priority);
        if (!priorityResult.success) {
          console.warn(`Failed to select priority: ${priorityResult.error}`);
        }
      }

      // Enter due date (optional)
      if (taskData.dueDate) {
        const dueDateResult = await this.enterDueDate(taskData.dueDate);
        if (!dueDateResult.success) {
          console.warn(`Failed to enter due date: ${dueDateResult.error}`);
        }
      }

      // Select status (for edit mode only)
      if (this.isEditMode && taskData.status) {
        const statusResult = await this.selectStatus(taskData.status);
        if (!statusResult.success) {
          console.warn(`Failed to select status: ${statusResult.error}`);
        }
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Task form filled successfully in ${duration}ms`);

      return {
        success: true,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`fill-task-form-failed-${Date.now()}`);
      
      console.error(`❌ Failed to fill task form: ${(error as Error).message}`);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  /**
   * Create task with complete workflow
   */
  async createTask(taskData: TaskFormData, options: {
    waitForSuccess?: boolean;
    expectedRedirectUrl?: string | RegExp;
  } = {}): Promise<UIInteractionResult> {
    const startTime = Date.now();

    try {
      console.log('🚀 Starting task creation workflow');

      // Fill the form
      const fillResult = await this.fillTaskForm(taskData);
      if (!fillResult.success) {
        throw new Error(`Failed to fill form: ${fillResult.error}`);
      }

      // Save the task
      const saveResult = await this.saveTask();
      if (!saveResult.success) {
        throw new Error(`Failed to save task: ${saveResult.error}`);
      }

      // Wait for success message if requested
      if (options.waitForSuccess) {
        await this.waitForElement(this.selectors.successMessage, 10000);
        console.log('✅ Success message displayed');
      }

      // Wait for redirect if expected
      if (options.expectedRedirectUrl) {
        await this.page.waitForURL(options.expectedRedirectUrl, { timeout: this.defaultTimeout });
        console.log('✅ Successfully redirected after task creation');
      }

      const duration = Date.now() - startTime;
      console.log(`✅ Task creation completed successfully in ${duration}ms`);

      return {
        success: true,
        duration
      };

    } catch (error) {
      const duration = Date.now() - startTime;
      const screenshot = await this.takeScreenshot(`create-task-failed-${Date.now()}`);
      
      console.error(`❌ Task creation failed: ${(error as Error).message}`);
      
      return {
        success: false,
        duration,
        error: (error as Error).message,
        screenshot
      };
    }
  }

  // ===================================
  // Validation and State Checking
  // ===================================

  /**
   * Check if form is valid (no validation errors)
   */
  async isFormValid(): Promise<boolean> {
    const hasErrors = await this.isElementVisible(this.selectors.errorMessage, 1000);
    const hasFieldErrors = await this.getElementCount(this.selectors.fieldError) > 0;
    return !hasErrors && !hasFieldErrors;
  }

  /**
   * Get current validation errors
   */
  async getValidationErrors(): Promise<TaskFormValidationErrors> {
    const errors: TaskFormValidationErrors = {};

    // Check for general error message
    if (await this.isElementVisible(this.selectors.errorMessage, 1000)) {
      errors.general = await this.getElementText(this.selectors.errorMessage);
    }

    // Check for field-specific errors
    const fieldErrorSelectors = [
      { field: 'title', selector: '[data-testid="title-error"]' },
      { field: 'description', selector: '[data-testid="description-error"]' },
      { field: 'category', selector: '[data-testid="category-error"]' },
      { field: 'priority', selector: '[data-testid="priority-error"]' },
      { field: 'dueDate', selector: '[data-testid="due-date-error"]' }
    ];

    for (const { field, selector } of fieldErrorSelectors) {
      if (await this.isElementVisible(selector, 1000)) {
        errors[field as keyof TaskFormValidationErrors] = await this.getElementText(selector);
      }
    }

    return errors;
  }

  /**
   * Check if form is saving
   */
  async isSaving(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.savingSpinner, 1000);
  }

  /**
   * Wait for save operation to complete
   */
  async waitForSaveComplete(timeout: number = this.defaultTimeout): Promise<void> {
    try {
      // Wait for saving spinner to appear (if it does)
      await this.waitForElement(this.selectors.savingSpinner, 2000);
      console.log('⏳ Save in progress...');
      
      // Wait for saving spinner to disappear
      await this.waitForElementHidden(this.selectors.savingSpinner, timeout);
      console.log('✅ Save operation completed');
    } catch {
      // Saving spinner might not appear for fast saves
      console.log('ℹ️ No saving state detected');
    }
  }
}
