/**
 * Dashboard Page Object
 * 
 * Page object for the main dashboard page providing task management functionality
 * Implements dashboard-specific user interactions and navigation
 * 
 * @fileoverview Dashboard page object for main application testing
 * @version 1.0.0
 * @since 2025-01-28
 */

import { Page } from '@playwright/test';
import { BasePage, PageVerificationResult, ElementOptions } from './base-page';
import { UIInteractionResult } from '../utils/UIHelper';

/**
 * Task data interface for dashboard operations
 */
export interface TaskData {
  title: string;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  dueDate?: string;
}

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

/**
 * Dashboard page selectors
 */
export interface DashboardPageSelectors {
  // Navigation
  userMenu: string;
  logoutButton: string;
  profileLink: string;
  settingsLink: string;
  
  // Welcome/Header
  welcomeMessage: string;
  pageTitle: string;
  
  // Task Management
  createTaskButton: string;
  taskList: string;
  taskItem: string;
  taskTitle: string;
  taskDescription: string;
  taskStatus: string;
  taskPriority: string;
  
  // Task Actions
  editTaskButton: string;
  deleteTaskButton: string;
  completeTaskButton: string;
  
  // Filters and Search
  searchInput: string;
  filterByStatus: string;
  filterByPriority: string;
  filterByCategory: string;
  
  // Statistics
  statsContainer: string;
  totalTasksCount: string;
  completedTasksCount: string;
  pendingTasksCount: string;
  overdueTasksCount: string;
  
  // Loading and Messages
  loadingSpinner: string;
  emptyState: string;
  successMessage: string;
  errorMessage: string;
}

/**
 * Dashboard Page Object class
 */
export class DashboardPage extends BasePage {
  private selectors: DashboardPageSelectors;

  constructor(page: Page, baseURL?: string) {
    super(page, baseURL);
    this.selectors = this.getSelectors() as DashboardPageSelectors;
  }

  // ===================================
  // Abstract Method Implementations
  // ===================================

  /**
   * Get the dashboard page URL path
   */
  getPath(): string {
    return '/dashboard';
  }

  /**
   * Get dashboard page selectors
   */
  getSelectors(): DashboardPageSelectors {
    return {
      // Navigation
      userMenu: '[data-testid="user-menu"]',
      logoutButton: '[data-testid="logout-button"]',
      profileLink: '[data-testid="profile-link"]',
      settingsLink: '[data-testid="settings-link"]',
      
      // Welcome/Header
      welcomeMessage: '[data-testid="welcome-message"]',
      pageTitle: '[data-testid="page-title"]',
      
      // Task Management
      createTaskButton: '[data-testid="create-task-button"]',
      taskList: '[data-testid="task-list"]',
      taskItem: '[data-testid="task-item"]',
      taskTitle: '[data-testid="task-title"]',
      taskDescription: '[data-testid="task-description"]',
      taskStatus: '[data-testid="task-status"]',
      taskPriority: '[data-testid="task-priority"]',
      
      // Task Actions
      editTaskButton: '[data-testid="edit-task-button"]',
      deleteTaskButton: '[data-testid="delete-task-button"]',
      completeTaskButton: '[data-testid="complete-task-button"]',
      
      // Filters and Search
      searchInput: '[data-testid="search-input"]',
      filterByStatus: '[data-testid="filter-status"]',
      filterByPriority: '[data-testid="filter-priority"]',
      filterByCategory: '[data-testid="filter-category"]',
      
      // Statistics
      statsContainer: '[data-testid="stats-container"]',
      totalTasksCount: '[data-testid="total-tasks-count"]',
      completedTasksCount: '[data-testid="completed-tasks-count"]',
      pendingTasksCount: '[data-testid="pending-tasks-count"]',
      overdueTasksCount: '[data-testid="overdue-tasks-count"]',
      
      // Loading and Messages
      loadingSpinner: '[data-testid="loading-spinner"]',
      emptyState: '[data-testid="empty-state"]',
      successMessage: '[data-testid="success-message"]',
      errorMessage: '[data-testid="error-message"]'
    };
  }

  /**
   * Verify that the dashboard page is loaded correctly
   */
  async verifyPageLoaded(): Promise<PageVerificationResult> {
    try {
      // Check for essential dashboard elements
      await this.verifyElementVisible(this.selectors.userMenu, 'User menu is visible');
      await this.verifyElementVisible(this.selectors.createTaskButton, 'Create task button is visible');
      
      // Verify page title or welcome message
      const hasWelcome = await this.isElementVisible(this.selectors.welcomeMessage, 2000);
      const hasTitle = await this.isElementVisible(this.selectors.pageTitle, 2000);
      
      if (!hasWelcome && !hasTitle) {
        throw new Error('Neither welcome message nor page title found');
      }

      // Verify URL
      await this.verifyCurrentUrl(/.*\/dashboard.*/);

      return {
        success: true,
        message: 'Dashboard page loaded successfully'
      };
    } catch (error) {
      const screenshot = await this.takeScreenshot('dashboard-page-verification-failed');
      return {
        success: false,
        message: `Dashboard page verification failed: ${(error as Error).message}`,
        screenshot
      };
    }
  }

  // ===================================
  // Navigation Actions
  // ===================================

  /**
   * Open user menu
   */
  async openUserMenu(): Promise<UIInteractionResult> {
    console.log('👤 Opening user menu');
    return await this.clickElement(this.selectors.userMenu);
  }

  /**
   * Logout from dashboard
   */
  async logout(): Promise<UIInteractionResult> {
    console.log('🚪 Logging out');
    
    // Open user menu first
    const menuResult = await this.openUserMenu();
    if (!menuResult.success) {
      return menuResult;
    }

    // Wait for logout button to be visible
    await this.waitForElement(this.selectors.logoutButton);
    
    // Click logout
    const logoutResult = await this.clickElement(this.selectors.logoutButton);
    
    if (logoutResult.success) {
      // Wait for redirect to login page
      await this.page.waitForURL('**/login', { timeout: this.defaultTimeout });
      console.log('✅ Successfully logged out');
    }
    
    return logoutResult;
  }

  /**
   * Navigate to profile page
   */
  async goToProfile(): Promise<UIInteractionResult> {
    console.log('👤 Navigating to profile');
    
    const menuResult = await this.openUserMenu();
    if (!menuResult.success) {
      return menuResult;
    }

    await this.waitForElement(this.selectors.profileLink);
    return await this.clickElement(this.selectors.profileLink);
  }

  // ===================================
  // Task Management Actions
  // ===================================

  /**
   * Click create task button
   */
  async clickCreateTask(): Promise<UIInteractionResult> {
    console.log('➕ Clicking create task button');
    return await this.clickElement(this.selectors.createTaskButton);
  }

  /**
   * Search for tasks
   */
  async searchTasks(searchTerm: string): Promise<UIInteractionResult> {
    console.log(`🔍 Searching for tasks: ${searchTerm}`);
    return await this.typeText(this.selectors.searchInput, searchTerm, { clear: true });
  }

  /**
   * Filter tasks by status
   */
  async filterByStatus(status: string): Promise<UIInteractionResult> {
    console.log(`📋 Filtering by status: ${status}`);
    await this.clickElement(this.selectors.filterByStatus);
    return await this.clickElement(`[data-testid="status-${status}"]`);
  }

  /**
   * Filter tasks by priority
   */
  async filterByPriority(priority: string): Promise<UIInteractionResult> {
    console.log(`⚡ Filtering by priority: ${priority}`);
    await this.clickElement(this.selectors.filterByPriority);
    return await this.clickElement(`[data-testid="priority-${priority}"]`);
  }

  /**
   * Get task count
   */
  async getTaskCount(): Promise<number> {
    return await this.getElementCount(this.selectors.taskItem);
  }

  /**
   * Get task by index
   */
  async getTaskByIndex(index: number): Promise<{
    title: string;
    description?: string;
    status?: string;
    priority?: string;
  }> {
    const taskSelector = `${this.selectors.taskItem}:nth-child(${index + 1})`;
    
    const title = await this.getElementText(`${taskSelector} ${this.selectors.taskTitle}`);
    
    let description: string | undefined;
    let status: string | undefined;
    let priority: string | undefined;
    
    try {
      description = await this.getElementText(`${taskSelector} ${this.selectors.taskDescription}`);
    } catch {
      // Description might be optional
    }
    
    try {
      status = await this.getElementText(`${taskSelector} ${this.selectors.taskStatus}`);
    } catch {
      // Status might not be visible
    }
    
    try {
      priority = await this.getElementText(`${taskSelector} ${this.selectors.taskPriority}`);
    } catch {
      // Priority might not be visible
    }

    return { title, description, status, priority };
  }

  /**
   * Complete task by index
   */
  async completeTaskByIndex(index: number): Promise<UIInteractionResult> {
    console.log(`✅ Completing task at index ${index}`);
    const taskSelector = `${this.selectors.taskItem}:nth-child(${index + 1})`;
    return await this.clickElement(`${taskSelector} ${this.selectors.completeTaskButton}`);
  }

  /**
   * Delete task by index
   */
  async deleteTaskByIndex(index: number): Promise<UIInteractionResult> {
    console.log(`🗑️ Deleting task at index ${index}`);
    const taskSelector = `${this.selectors.taskItem}:nth-child(${index + 1})`;
    return await this.clickElement(`${taskSelector} ${this.selectors.deleteTaskButton}`);
  }

  // ===================================
  // Information Retrieval
  // ===================================

  /**
   * Get welcome message text
   */
  async getWelcomeMessage(): Promise<string> {
    return await this.getElementText(this.selectors.welcomeMessage);
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const totalTasks = parseInt(await this.getElementText(this.selectors.totalTasksCount) || '0');
    const completedTasks = parseInt(await this.getElementText(this.selectors.completedTasksCount) || '0');
    const pendingTasks = parseInt(await this.getElementText(this.selectors.pendingTasksCount) || '0');
    const overdueTasks = parseInt(await this.getElementText(this.selectors.overdueTasksCount) || '0');

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks
    };
  }

  /**
   * Check if dashboard is empty (no tasks)
   */
  async isEmpty(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.emptyState, 2000);
  }

  /**
   * Check if dashboard is loading
   */
  async isLoading(): Promise<boolean> {
    return await this.isElementVisible(this.selectors.loadingSpinner, 1000);
  }

  /**
   * Wait for dashboard to load completely
   */
  async waitForDashboardLoad(): Promise<void> {
    // Wait for loading to finish
    try {
      await this.waitForElementHidden(this.selectors.loadingSpinner, 10000);
    } catch {
      // Loading spinner might not appear
    }

    // Ensure task list or empty state is visible
    const hasTaskList = await this.isElementVisible(this.selectors.taskList, 2000);
    const hasEmptyState = await this.isElementVisible(this.selectors.emptyState, 2000);
    
    if (!hasTaskList && !hasEmptyState) {
      throw new Error('Dashboard did not load properly - neither task list nor empty state found');
    }
  }
}
