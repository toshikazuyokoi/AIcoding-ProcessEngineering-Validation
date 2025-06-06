/**
 * ===================================
 * Category Types Definition
 * ===================================
 * Purpose: Centralized category-related type definitions and interfaces
 * Features:
 * - Category entity type re-exports
 * - Category service type re-exports
 * - Additional category-related types
 * - Type safety and code organization
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

// ===================================
// Re-exports from Category Entity
// ===================================

export {
  CategoryCreationData,
  CategoryUpdateData,
  CategorySummaryData
} from '../entities/category.entity';

// ===================================
// Re-exports from Category Service
// ===================================

export {
  CategorySearchFilters,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategoryWithTaskCount,
  CategoryStatistics,
  ICategoryRepository,
  ITaskCategoryRepository
} from '../services/category.service';

// ===================================
// Import for internal use
// ===================================

import { 
  CategoryCreationData,
  CategoryUpdateData,
  CategorySummaryData
} from '../entities/category.entity';

import {
  CategorySearchFilters,
  CategoryWithTaskCount
} from '../services/category.service';

// ===================================
// Additional Category Types
// ===================================

/**
 * Category visibility levels
 */
export enum CategoryVisibility {
  PRIVATE = 'private',
  SHARED = 'shared',
  PUBLIC = 'public',
  TEAM = 'team'
}

/**
 * Category sorting options
 */
export enum CategorySortBy {
  NAME = 'name',
  COLOR = 'color',
  CREATED_AT = 'created_at',
  UPDATED_AT = 'updated_at',
  TASK_COUNT = 'task_count',
  USAGE_FREQUENCY = 'usage_frequency'
}

/**
 * Category sorting direction
 */
export enum CategorySortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Category status
 */
export enum CategoryStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ARCHIVED = 'archived',
  DELETED = 'deleted'
}

/**
 * Category icon types
 */
export enum CategoryIconType {
  EMOJI = 'emoji',
  ICON = 'icon',
  IMAGE = 'image',
  NONE = 'none'
}

/**
 * Category template
 */
export interface CategoryTemplate {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: CategoryIcon;
  isPublic: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category icon information
 */
export interface CategoryIcon {
  type: CategoryIconType;
  value: string; // emoji, icon name, or image URL
  backgroundColor?: string;
  foregroundColor?: string;
}

/**
 * Category hierarchy information
 */
export interface CategoryHierarchy {
  categoryId: string;
  parentId?: string;
  level: number;
  path: string[]; // Array of category IDs from root to current
  children: CategoryHierarchy[];
  hasChildren: boolean;
}

/**
 * Category usage statistics
 */
export interface CategoryUsageStats {
  categoryId: string;
  categoryName: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  averageTaskDuration: number; // in hours
  lastUsed: Date;
  usageFrequency: number; // tasks per week
}

/**
 * Category color palette
 */
export interface CategoryColorPalette {
  id: string;
  name: string;
  colors: string[];
  isDefault: boolean;
  isCustom: boolean;
  createdBy?: string;
  createdAt: Date;
}

/**
 * Category bulk operation request
 */
export interface CategoryBulkOperationRequest {
  categoryIds: string[];
  operation: CategoryBulkOperation;
  parameters?: {
    color?: string;
    status?: CategoryStatus;
    parentId?: string;
    visibility?: CategoryVisibility;
  };
}

/**
 * Category bulk operations
 */
export enum CategoryBulkOperation {
  UPDATE_COLOR = 'update_color',
  UPDATE_STATUS = 'update_status',
  MOVE_TO_PARENT = 'move_to_parent',
  UPDATE_VISIBILITY = 'update_visibility',
  DELETE = 'delete',
  ARCHIVE = 'archive',
  MERGE = 'merge'
}

/**
 * Category bulk operation result
 */
export interface CategoryBulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: {
    categoryId: string;
    error: string;
  }[];
  results: {
    categoryId: string;
    success: boolean;
    message?: string;
  }[];
}

/**
 * Category search result with pagination
 */
export interface CategorySearchResult {
  categories: CategoryWithTaskCount[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: CategorySearchFilters;
  sorting: {
    sortBy: CategorySortBy;
    direction: CategorySortDirection;
  };
}

/**
 * Category dashboard summary
 */
export interface CategoryDashboardSummary {
  userId: string;
  totalCategories: number;
  activeCategories: number;
  archivedCategories: number;
  categoriesWithTasks: number;
  categoriesWithoutTasks: number;
  mostUsedCategories: CategoryUsageStats[];
  recentlyCreated: CategoryWithTaskCount[];
  colorDistribution: {
    color: string;
    count: number;
  }[];
}

/**
 * Category export data
 */
export interface CategoryExportData {
  category: CategorySummaryData;
  hierarchy?: CategoryHierarchy;
  usageStats: CategoryUsageStats;
  relatedTasks: {
    taskId: string;
    taskTitle: string;
    taskStatus: string;
    createdAt: Date;
  }[];
}

/**
 * Category import data
 */
export interface CategoryImportData {
  name: string;
  color: string;
  description?: string;
  icon?: CategoryIcon;
  parentName?: string;
  visibility?: CategoryVisibility;
  status?: CategoryStatus;
}

/**
 * Category validation rules
 */
export interface CategoryValidationRules {
  name: {
    minLength: number;
    maxLength: number;
    allowedCharacters: RegExp;
    reservedNames: string[];
  };
  color: {
    format: 'hex' | 'rgb' | 'hsl';
    allowedColors?: string[];
    forbiddenColors?: string[];
  };
  description: {
    maxLength: number;
    allowHtml: boolean;
  };
  hierarchy: {
    maxDepth: number;
    allowCircularReferences: boolean;
  };
}

/**
 * Category notification settings
 */
export interface CategoryNotificationSettings {
  userId: string;
  categoryId: string;
  notifyOnTaskAdded: boolean;
  notifyOnTaskCompleted: boolean;
  notifyOnTaskOverdue: boolean;
  notifyOnCategoryUpdated: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category analytics data
 */
export interface CategoryAnalytics {
  userId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  categoryMetrics: {
    categoryId: string;
    categoryName: string;
    tasksCreated: number;
    tasksCompleted: number;
    averageCompletionTime: number; // in hours
    productivityScore: number; // 0-100
  }[];
  trends: {
    categoryUsage: {
      date: Date;
      categoryId: string;
      taskCount: number;
    }[];
    colorPreferences: {
      color: string;
      usageCount: number;
      trend: 'increasing' | 'decreasing' | 'stable';
    }[];
  };
}

/**
 * Category filter preset
 */
export interface CategoryFilterPreset {
  id: string;
  userId: string;
  name: string;
  description?: string;
  filters: CategorySearchFilters;
  sorting: {
    sortBy: CategorySortBy;
    direction: CategorySortDirection;
  };
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category workspace settings
 */
export interface CategoryWorkspaceSettings {
  userId: string;
  defaultView: 'list' | 'grid' | 'tree' | 'color_grid';
  defaultSorting: {
    sortBy: CategorySortBy;
    direction: CategorySortDirection;
  };
  defaultFilters: CategorySearchFilters;
  showTaskCounts: boolean;
  showColorCodes: boolean;
  groupBy?: 'color' | 'status' | 'hierarchy' | 'usage';
  pageSize: number;
  autoRefresh: boolean;
  refreshInterval: number; // in seconds
}

// ===================================
// Type Guards
// ===================================

/**
 * Type guard to check if a category has a valid hex color
 */
export function hasValidHexColor(category: { color: string }): boolean {
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  return hexColorRegex.test(category.color);
}

/**
 * Type guard to check if a category has tasks
 */
export function categoryHasTasks(category: CategoryWithTaskCount): boolean {
  return category.taskCount > 0;
}

/**
 * Type guard to check if a category is active
 */
export function isCategoryActive(category: { status?: CategoryStatus }): boolean {
  return !category.status || category.status === CategoryStatus.ACTIVE;
}

/**
 * Type guard to check if a category is archived
 */
export function isCategoryArchived(category: { status?: CategoryStatus }): boolean {
  return category.status === CategoryStatus.ARCHIVED;
}

/**
 * Type guard to check if a category is public
 */
export function isCategoryPublic(category: { visibility?: CategoryVisibility }): boolean {
  return category.visibility === CategoryVisibility.PUBLIC;
}

/**
 * Type guard to check if a category has description
 */
export function categoryHasDescription(category: { description?: string | undefined }): boolean {
  return Boolean(category.description && category.description.trim().length > 0);
}

/**
 * Type guard to check if a category has icon
 */
export function categoryHasIcon(category: { icon?: CategoryIcon | undefined }): boolean {
  return Boolean(category.icon && category.icon.type !== CategoryIconType.NONE);
}

/**
 * Type guard to check if a category is in hierarchy
 */
export function categoryIsInHierarchy(hierarchy: CategoryHierarchy): boolean {
  return hierarchy.level > 0 || hierarchy.hasChildren;
}

// ===================================
// Utility Types
// ===================================

/**
 * Category entity without sensitive information
 */
export type PublicCategoryData = Omit<CategorySummaryData, 'id'> & {
  publicId: string;
  taskCount?: number;
};

/**
 * Category creation data without internal fields
 */
export type CategoryCreationInput = CategoryCreationData & {
  icon?: CategoryIcon;
  visibility?: CategoryVisibility;
  status?: CategoryStatus;
};

/**
 * Category update data with optional fields
 */
export type CategoryUpdateInput = Partial<CategoryUpdateData> & {
  icon?: CategoryIcon;
  visibility?: CategoryVisibility;
  status?: CategoryStatus;
};

/**
 * Extended category search filters
 */
export type ExtendedCategorySearchFilters = CategorySearchFilters & {
  name?: string;
  status?: CategoryStatus;
  visibility?: CategoryVisibility;
  hasIcon?: boolean;
  hasParent?: boolean;
  hasChildren?: boolean;
  minTaskCount?: number;
  maxTaskCount?: number;
  lastUsedAfter?: Date;
  lastUsedBefore?: Date;
  usageFrequencyMin?: number;
  usageFrequencyMax?: number;
};

/**
 * Category with computed properties
 */
export type CategoryWithComputedProperties = CategoryWithTaskCount & {
  isActive: boolean;
  isArchived: boolean;
  isPublic: boolean;
  hasDescription: boolean;
  hasIcon: boolean;
  hasValidColor: boolean;
  usageFrequency: number;
  lastUsed?: Date;
  completionRate: number; // percentage of completed tasks
};

/**
 * Category summary for lists
 */
export type CategorySummary = Pick<CategorySummaryData, 'id' | 'name' | 'color'> & {
  taskCount: number;
  isActive: boolean;
  hasDescription: boolean;
};

/**
 * Category creation result
 */
export type CategoryCreationResult = {
  category: CategoryWithTaskCount;
  warnings?: string[];
  suggestions?: string[];
};

/**
 * Category update result
 */
export type CategoryUpdateResult = {
  category: CategoryWithTaskCount;
  changes: string[];
  warnings?: string[];
};

/**
 * Category deletion result
 */
export type CategoryDeletionResult = {
  success: boolean;
  categoryId: string;
  relatedDataHandled: {
    tasksReassigned: number;
    childCategoriesReassigned: number;
    notificationsDeleted: number;
  };
};

/**
 * Category merge result
 */
export type CategoryMergeResult = {
  success: boolean;
  targetCategoryId: string;
  sourceCategoryIds: string[];
  mergedData: {
    tasksMoved: number;
    childCategoriesMoved: number;
    notificationsMerged: number;
  };
};

/**
 * Category color validation result
 */
export type CategoryColorValidationResult = {
  isValid: boolean;
  format: 'hex' | 'rgb' | 'hsl' | 'invalid';
  normalizedColor?: string;
  suggestions?: string[];
};

/**
 * Category hierarchy validation result
 */
export type CategoryHierarchyValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  maxDepthReached: number;
  circularReferences: string[];
};

/**
 * Category usage trend
 */
export type CategoryUsageTrend = {
  categoryId: string;
  categoryName: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  dataPoints: {
    date: Date;
    taskCount: number;
    completionRate: number;
  }[];
  trend: 'increasing' | 'decreasing' | 'stable';
  growthRate: number; // percentage
};

/**
 * Category recommendation
 */
export type CategoryRecommendation = {
  type: 'color' | 'name' | 'hierarchy' | 'merge' | 'split';
  categoryId: string;
  recommendation: string;
  reason: string;
  confidence: number; // 0-100
  impact: 'low' | 'medium' | 'high';
};

/**
 * Category template application result
 */
export type CategoryTemplateApplicationResult = {
  success: boolean;
  createdCategories: CategoryWithTaskCount[];
  errors: string[];
  warnings: string[];
};

/**
 * Category color scheme
 */
export interface CategoryColorScheme {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  isDefault: boolean;
  createdBy?: string;
  createdAt: Date;
}

/**
 * Category tag
 */
export interface CategoryTag {
  id: string;
  name: string;
  color: string;
  description?: string;
  categoryIds: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category relationship
 */
export interface CategoryRelationship {
  id: string;
  parentCategoryId: string;
  childCategoryId: string;
  relationshipType: 'parent_child' | 'related' | 'similar' | 'opposite';
  strength: number; // 0-100
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Category automation rule
 */
export interface CategoryAutomationRule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  trigger: {
    type: 'task_created' | 'task_completed' | 'keyword_match' | 'time_based';
    conditions: Record<string, any>;
  };
  action: {
    type: 'assign_category' | 'suggest_category' | 'create_category';
    parameters: Record<string, any>;
  };
  isActive: boolean;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}
