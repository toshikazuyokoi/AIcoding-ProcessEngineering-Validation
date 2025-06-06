/**
 * ===================================
 * Task Types Definition
 * ===================================
 * Purpose: Centralized task-related type definitions and interfaces
 * Features:
 * - Task entity type re-exports
 * - Task service type re-exports
 * - Additional task-related types
 * - Type safety and code organization
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

// ===================================
// Re-exports from Task Entity
// ===================================

export {
  TaskPriority,
  TaskStatus,
  TaskCreationData,
  TaskUpdateData
} from '../entities/task.entity';

// ===================================
// Re-exports from Task Service
// ===================================

export {
  TaskSearchFilters,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskWithCategories,
  TaskStatistics,
  ITaskRepository,
  ITaskCategoryRepository
} from '../services/task.service';

// ===================================
// Import for internal use
// ===================================

import { 
  TaskPriority,
  TaskStatus,
  TaskCreationData,
  TaskUpdateData
} from '../entities/task.entity';

import {
  TaskSearchFilters,
  TaskWithCategories
} from '../services/task.service';

// ===================================
// Additional Task Types
// ===================================

/**
 * Task completion status
 */
export enum TaskCompletionStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  OVERDUE = 'overdue',
  CANCELLED = 'cancelled'
}

/**
 * Task assignment status
 */
export enum TaskAssignmentStatus {
  UNASSIGNED = 'unassigned',
  ASSIGNED = 'assigned',
  REASSIGNED = 'reassigned',
  SELF_ASSIGNED = 'self_assigned'
}

/**
 * Task visibility levels
 */
export enum TaskVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
  TEAM = 'team'
}

/**
 * Task sorting options
 */
export enum TaskSortBy {
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  DUE_DATE = 'due_date',
  PRIORITY = 'priority',
  STATUS = 'status',
  TITLE = 'title',
  COMPLETION_DATE = 'completion_date'
}

/**
 * Task sorting direction
 */
export enum TaskSortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Task time tracking information
 */
export interface TaskTimeTracking {
  taskId: string;
  estimatedHours?: number;
  actualHours?: number;
  startedAt?: Date;
  pausedAt?: Date;
  resumedAt?: Date;
  completedAt?: Date;
  timeEntries: TaskTimeEntry[];
}

/**
 * Task time entry
 */
export interface TaskTimeEntry {
  id: string;
  taskId: string;
  userId: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // in minutes
  billable: boolean;
  createdAt: Date;
}

/**
 * Task attachment information
 */
export interface TaskAttachment {
  id: string;
  taskId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  uploadedBy: string;
  uploadedAt: Date;
}

/**
 * Task comment
 */
export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  parentCommentId?: string;
  isEdited: boolean;
  editedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task activity log entry
 */
export interface TaskActivity {
  id: string;
  taskId: string;
  userId: string;
  action: TaskActivityAction;
  oldValue?: any;
  newValue?: any;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

/**
 * Task activity actions
 */
export enum TaskActivityAction {
  CREATED = 'created',
  UPDATED = 'updated',
  STATUS_CHANGED = 'status_changed',
  PRIORITY_CHANGED = 'priority_changed',
  DUE_DATE_CHANGED = 'due_date_changed',
  ASSIGNED = 'assigned',
  UNASSIGNED = 'unassigned',
  COMMENT_ADDED = 'comment_added',
  ATTACHMENT_ADDED = 'attachment_added',
  ATTACHMENT_REMOVED = 'attachment_removed',
  CATEGORY_ADDED = 'category_added',
  CATEGORY_REMOVED = 'category_removed',
  COMPLETED = 'completed',
  REOPENED = 'reopened',
  DELETED = 'deleted'
}

/**
 * Task reminder settings
 */
export interface TaskReminder {
  id: string;
  taskId: string;
  userId: string;
  reminderType: TaskReminderType;
  reminderTime: Date;
  isRecurring: boolean;
  recurringPattern?: TaskRecurringPattern;
  isActive: boolean;
  lastSent?: Date;
  createdAt: Date;
}

/**
 * Task reminder types
 */
export enum TaskReminderType {
  DUE_DATE = 'due_date',
  CUSTOM = 'custom',
  OVERDUE = 'overdue',
  DAILY = 'daily',
  WEEKLY = 'weekly'
}

/**
 * Task recurring pattern
 */
export interface TaskRecurringPattern {
  frequency: TaskRecurringFrequency;
  interval: number;
  daysOfWeek?: number[]; // 0-6, Sunday = 0
  dayOfMonth?: number;
  endDate?: Date;
  maxOccurrences?: number;
}

/**
 * Task recurring frequency
 */
export enum TaskRecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

/**
 * Task template
 */
export interface TaskTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  title: string;
  taskDescription?: string;
  priority: TaskPriority;
  estimatedHours?: number;
  categoryIds: string[];
  isPublic: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task creation from template request
 */
export interface CreateTaskFromTemplateRequest {
  templateId: string;
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: TaskPriority;
  categoryIds?: string[];
}

/**
 * Task bulk operation request
 */
export interface TaskBulkOperationRequest {
  taskIds: string[];
  operation: TaskBulkOperation;
  parameters?: {
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: Date;
    categoryIds?: string[];
    assigneeId?: string;
  };
}

/**
 * Task bulk operations
 */
export enum TaskBulkOperation {
  UPDATE_STATUS = 'update_status',
  UPDATE_PRIORITY = 'update_priority',
  UPDATE_DUE_DATE = 'update_due_date',
  ADD_CATEGORIES = 'add_categories',
  REMOVE_CATEGORIES = 'remove_categories',
  ASSIGN = 'assign',
  DELETE = 'delete',
  COMPLETE = 'complete',
  ARCHIVE = 'archive'
}

/**
 * Task bulk operation result
 */
export interface TaskBulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: {
    taskId: string;
    error: string;
  }[];
  results: {
    taskId: string;
    success: boolean;
    message?: string;
  }[];
}

/**
 * Task search result with pagination
 */
export interface TaskSearchResult {
  tasks: TaskWithCategories[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: TaskSearchFilters;
  sorting: {
    sortBy: TaskSortBy;
    direction: TaskSortDirection;
  };
}

/**
 * Task dashboard summary
 */
export interface TaskDashboardSummary {
  userId: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  dueThisWeekTasks: number;
  recentTasks: TaskWithCategories[];
  upcomingTasks: TaskWithCategories[];
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    taskCount: number;
  }[];
}

/**
 * Task export data
 */
export interface TaskExportData {
  task: TaskWithCategories;
  timeTracking?: TaskTimeTracking;
  comments: TaskComment[];
  attachments: TaskAttachment[];
  activities: TaskActivity[];
}

/**
 * Task import data
 */
export interface TaskImportData {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  dueDate?: Date;
  categoryNames?: string[];
  estimatedHours?: number;
  tags?: string[];
}

/**
 * Task validation rules
 */
export interface TaskValidationRules {
  title: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
    forbiddenWords: string[];
  };
  description: {
    maxLength: number;
    allowHtml: boolean;
  };
  dueDate: {
    minDaysFromNow: number;
    maxDaysFromNow: number;
    allowPastDates: boolean;
  };
}

/**
 * Task notification settings
 */
export interface TaskNotificationSettings {
  userId: string;
  dueDateReminders: boolean;
  overdueNotifications: boolean;
  statusChangeNotifications: boolean;
  assignmentNotifications: boolean;
  commentNotifications: boolean;
  reminderAdvanceDays: number;
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

/**
 * Task analytics data
 */
export interface TaskAnalytics {
  userId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  metrics: {
    tasksCreated: number;
    tasksCompleted: number;
    tasksOverdue: number;
    averageCompletionTime: number; // in hours
    productivityScore: number; // 0-100
  };
  trends: {
    completionRate: number;
    overdueRate: number;
    averagePriority: number;
  };
  categoryPerformance: {
    categoryId: string;
    categoryName: string;
    completionRate: number;
    averageTime: number;
  }[];
}

// ===================================
// Type Guards
// ===================================

/**
 * Type guard to check if a task is overdue
 */
export function isTaskOverdue(task: { dueDate?: Date | undefined; status: TaskStatus }): boolean {
  if (!task.dueDate || task.status === TaskStatus.COMPLETED) {
    return false;
  }
  return new Date() > task.dueDate;
}

/**
 * Type guard to check if a task is due today
 */
export function isTaskDueToday(task: { dueDate?: Date | undefined }): boolean {
  if (!task.dueDate) {
    return false;
  }
  const today = new Date();
  const dueDate = new Date(task.dueDate);
  return today.toDateString() === dueDate.toDateString();
}

/**
 * Type guard to check if a task is due this week
 */
export function isTaskDueThisWeek(task: { dueDate?: Date | undefined }): boolean {
  if (!task.dueDate) {
    return false;
  }
  const today = new Date();
  const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const dueDate = new Date(task.dueDate);
  return dueDate >= today && dueDate <= weekFromNow;
}

/**
 * Type guard to check if a task is high priority
 */
export function isHighPriorityTask(task: { priority: TaskPriority }): boolean {
  return task.priority === TaskPriority.HIGH;
}

/**
 * Type guard to check if a task is completed
 */
export function isTaskCompleted(task: { status: TaskStatus }): boolean {
  return task.status === TaskStatus.COMPLETED;
}

/**
 * Type guard to check if a task is in progress
 */
export function isTaskInProgress(task: { status: TaskStatus }): boolean {
  return task.status === TaskStatus.IN_PROGRESS;
}

/**
 * Type guard to check if a task can be started
 */
export function canStartTask(task: { status: TaskStatus }): boolean {
  return task.status === TaskStatus.PENDING;
}

/**
 * Type guard to check if a task can be completed
 */
export function canCompleteTask(task: { status: TaskStatus }): boolean {
  return task.status === TaskStatus.PENDING || task.status === TaskStatus.IN_PROGRESS;
}

// ===================================
// Utility Types
// ===================================

/**
 * Task entity without sensitive information
 */
export type PublicTaskData = Omit<TaskWithCategories, 'userId'> & {
  id: string;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Task creation data without internal fields
 */
export type TaskCreationInput = Omit<TaskCreationData, 'userId'> & {
  categoryIds?: string[];
};

/**
 * Task update data with optional fields
 */
export type TaskUpdateInput = Partial<TaskUpdateData> & {
  categoryIds?: string[];
};

/**
 * Extended task search filters
 */
export type ExtendedTaskSearchFilters = TaskSearchFilters & {
  isOverdue?: boolean;
  isDueToday?: boolean;
  isDueThisWeek?: boolean;
  hasCategories?: boolean;
  hasAttachments?: boolean;
  hasComments?: boolean;
  createdAfter?: Date;
  createdBefore?: Date;
  completedAfter?: Date;
  completedBefore?: Date;
  estimatedHoursMin?: number;
  estimatedHoursMax?: number;
};

/**
 * Task with computed properties
 */
export type TaskWithComputedProperties = TaskWithCategories & {
  isOverdue: boolean;
  isDueToday: boolean;
  isDueThisWeek: boolean;
  daysUntilDue?: number;
  daysOverdue?: number;
  completionPercentage: number;
  timeSpent?: number; // in hours
  estimatedTimeRemaining?: number; // in hours
};

/**
 * Task summary for lists
 */
export type TaskSummary = Pick<TaskWithCategories, 'task'> & {
  categoryCount: number;
  commentCount: number;
  attachmentCount: number;
  isOverdue: boolean;
  daysUntilDue?: number;
};

/**
 * Task creation result
 */
export type TaskCreationResult = {
  task: TaskWithCategories;
  warnings?: string[];
  suggestions?: string[];
};

/**
 * Task update result
 */
export type TaskUpdateResult = {
  task: TaskWithCategories;
  changes: string[];
  warnings?: string[];
};

/**
 * Task deletion result
 */
export type TaskDeletionResult = {
  success: boolean;
  taskId: string;
  relatedDataDeleted: {
    comments: number;
    attachments: number;
    timeEntries: number;
    activities: number;
  };
};

/**
 * Task status transition map
 */
export type TaskStatusTransitionMap = {
  [K in TaskStatus]: TaskStatus[];
};

/**
 * Task priority weight for sorting
 */
export type TaskPriorityWeight = {
  [K in TaskPriority]: number;
};

/**
 * Task filter preset
 */
export interface TaskFilterPreset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filters: ExtendedTaskSearchFilters;
  sorting: {
    sortBy: TaskSortBy;
    direction: TaskSortDirection;
  };
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Task workspace settings
 */
export interface TaskWorkspaceSettings {
  userId: string;
  defaultView: 'list' | 'board' | 'calendar' | 'timeline';
  defaultSorting: {
    sortBy: TaskSortBy;
    direction: TaskSortDirection;
  };
  defaultFilters: ExtendedTaskSearchFilters;
  showCompletedTasks: boolean;
  groupBy?: 'status' | 'priority' | 'category' | 'dueDate';
  pageSize: number;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}
