/**
 * ===================================
 * Category Types Test Suite
 * ===================================
 * Purpose: Comprehensive tests for category-related type definitions
 * Features:
 * - Type guard function testing
 * - Interface validation testing
 * - Enum value testing
 * - Type safety verification
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  // Enums
  CategoryVisibility,
  CategorySortBy,
  CategorySortDirection,
  CategoryStatus,
  CategoryIconType,
  CategoryBulkOperation,
  
  // Interfaces
  CategoryTemplate,
  CategoryIcon,
  CategoryHierarchy,
  CategoryUsageStats,
  CategoryColorPalette,
  CategoryBulkOperationRequest,
  CategoryBulkOperationResult,
  CategorySearchResult,
  CategoryDashboardSummary,
  CategoryExportData,
  CategoryImportData,
  CategoryValidationRules,
  CategoryNotificationSettings,
  CategoryAnalytics,
  CategoryFilterPreset,
  CategoryWorkspaceSettings,
  CategoryColorScheme,
  CategoryTag,
  CategoryRelationship,
  CategoryAutomationRule,
  
  // Type Guards
  hasValidHexColor,
  categoryHasTasks,
  isCategoryActive,
  isCategoryArchived,
  isCategoryPublic,
  categoryHasDescription,
  categoryHasIcon,
  categoryIsInHierarchy,
  
  // Utility Types
  PublicCategoryData,
  CategoryCreationInput,
  CategoryUpdateInput,
  ExtendedCategorySearchFilters,
  CategoryWithComputedProperties,
  CategorySummary,
  CategoryCreationResult,
  CategoryUpdateResult,
  CategoryDeletionResult,
  CategoryMergeResult,
  CategoryColorValidationResult,
  CategoryHierarchyValidationResult,
  CategoryUsageTrend,
  CategoryRecommendation,
  CategoryTemplateApplicationResult
} from '../../../src/domain/types/category.types';

import { CategoryWithTaskCount } from '../../../src/domain/services/category.service';

describe('Category Types', () => {
  // ===================================
  // Enum Tests
  // ===================================

  describe('CategoryVisibility Enum', () => {
    test('should have correct values', () => {
      expect(CategoryVisibility.PRIVATE).toBe('private');
      expect(CategoryVisibility.SHARED).toBe('shared');
      expect(CategoryVisibility.PUBLIC).toBe('public');
      expect(CategoryVisibility.TEAM).toBe('team');
    });

    test('should have exactly 4 values', () => {
      const values = Object.values(CategoryVisibility);
      expect(values).toHaveLength(4);
      expect(values).toContain('private');
      expect(values).toContain('shared');
      expect(values).toContain('public');
      expect(values).toContain('team');
    });
  });

  describe('CategorySortBy Enum', () => {
    test('should have correct values', () => {
      expect(CategorySortBy.NAME).toBe('name');
      expect(CategorySortBy.COLOR).toBe('color');
      expect(CategorySortBy.CREATED_AT).toBe('created_at');
      expect(CategorySortBy.UPDATED_AT).toBe('updated_at');
      expect(CategorySortBy.TASK_COUNT).toBe('task_count');
      expect(CategorySortBy.USAGE_FREQUENCY).toBe('usage_frequency');
    });

    test('should have exactly 6 values', () => {
      const values = Object.values(CategorySortBy);
      expect(values).toHaveLength(6);
    });
  });

  describe('CategoryStatus Enum', () => {
    test('should have correct values', () => {
      expect(CategoryStatus.ACTIVE).toBe('active');
      expect(CategoryStatus.INACTIVE).toBe('inactive');
      expect(CategoryStatus.ARCHIVED).toBe('archived');
      expect(CategoryStatus.DELETED).toBe('deleted');
    });

    test('should have exactly 4 values', () => {
      const values = Object.values(CategoryStatus);
      expect(values).toHaveLength(4);
    });
  });

  describe('CategoryIconType Enum', () => {
    test('should have correct values', () => {
      expect(CategoryIconType.EMOJI).toBe('emoji');
      expect(CategoryIconType.ICON).toBe('icon');
      expect(CategoryIconType.IMAGE).toBe('image');
      expect(CategoryIconType.NONE).toBe('none');
    });

    test('should have exactly 4 values', () => {
      const values = Object.values(CategoryIconType);
      expect(values).toHaveLength(4);
    });
  });

  describe('CategoryBulkOperation Enum', () => {
    test('should have correct values', () => {
      expect(CategoryBulkOperation.UPDATE_COLOR).toBe('update_color');
      expect(CategoryBulkOperation.UPDATE_STATUS).toBe('update_status');
      expect(CategoryBulkOperation.DELETE).toBe('delete');
      expect(CategoryBulkOperation.ARCHIVE).toBe('archive');
      expect(CategoryBulkOperation.MERGE).toBe('merge');
    });

    test('should have exactly 7 values', () => {
      const values = Object.values(CategoryBulkOperation);
      expect(values).toHaveLength(7);
    });
  });

  // ===================================
  // Type Guard Tests
  // ===================================

  describe('Type Guards', () => {
    describe('hasValidHexColor', () => {
      test('should return true for valid hex colors', () => {
        expect(hasValidHexColor({ color: '#FF0000' })).toBe(true);
        expect(hasValidHexColor({ color: '#00ff00' })).toBe(true);
        expect(hasValidHexColor({ color: '#0000FF' })).toBe(true);
        expect(hasValidHexColor({ color: '#123ABC' })).toBe(true);
      });

      test('should return false for invalid hex colors', () => {
        expect(hasValidHexColor({ color: 'red' })).toBe(false);
        expect(hasValidHexColor({ color: '#FF' })).toBe(false);
        expect(hasValidHexColor({ color: '#GGGGGG' })).toBe(false);
        expect(hasValidHexColor({ color: 'FF0000' })).toBe(false);
        expect(hasValidHexColor({ color: '#FF00000' })).toBe(false);
      });
    });

    describe('categoryHasTasks', () => {
      test('should return true for category with tasks', () => {
        const categoryWithTasks: CategoryWithTaskCount = {
          category: {
            id: 'cat-1',
            name: 'Work',
            color: '#FF0000',
            description: 'Work category',
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          taskCount: 5
        };
        expect(categoryHasTasks(categoryWithTasks)).toBe(true);
      });

      test('should return false for category without tasks', () => {
        const categoryWithoutTasks: CategoryWithTaskCount = {
          category: {
            id: 'cat-1',
            name: 'Empty',
            color: '#FF0000',
            description: 'Empty category',
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          taskCount: 0
        };
        expect(categoryHasTasks(categoryWithoutTasks)).toBe(false);
      });
    });

    describe('isCategoryActive', () => {
      test('should return true for active category', () => {
        expect(isCategoryActive({ status: CategoryStatus.ACTIVE })).toBe(true);
      });

      test('should return true for category without status (default active)', () => {
        expect(isCategoryActive({})).toBe(true);
      });

      test('should return false for inactive category', () => {
        expect(isCategoryActive({ status: CategoryStatus.INACTIVE })).toBe(false);
        expect(isCategoryActive({ status: CategoryStatus.ARCHIVED })).toBe(false);
        expect(isCategoryActive({ status: CategoryStatus.DELETED })).toBe(false);
      });
    });

    describe('isCategoryArchived', () => {
      test('should return true for archived category', () => {
        expect(isCategoryArchived({ status: CategoryStatus.ARCHIVED })).toBe(true);
      });

      test('should return false for non-archived category', () => {
        expect(isCategoryArchived({ status: CategoryStatus.ACTIVE })).toBe(false);
        expect(isCategoryArchived({ status: CategoryStatus.INACTIVE })).toBe(false);
        expect(isCategoryArchived({})).toBe(false);
      });
    });

    describe('isCategoryPublic', () => {
      test('should return true for public category', () => {
        expect(isCategoryPublic({ visibility: CategoryVisibility.PUBLIC })).toBe(true);
      });

      test('should return false for non-public category', () => {
        expect(isCategoryPublic({ visibility: CategoryVisibility.PRIVATE })).toBe(false);
        expect(isCategoryPublic({ visibility: CategoryVisibility.SHARED })).toBe(false);
        expect(isCategoryPublic({})).toBe(false);
      });
    });

    describe('categoryHasDescription', () => {
      test('should return true for category with description', () => {
        expect(categoryHasDescription({ description: 'This is a description' })).toBe(true);
        expect(categoryHasDescription({ description: '   Valid description   ' })).toBe(true);
      });

      test('should return false for category without description', () => {
        expect(categoryHasDescription({})).toBe(false);
        expect(categoryHasDescription({ description: '' })).toBe(false);
        expect(categoryHasDescription({ description: '   ' })).toBe(false);
        expect(categoryHasDescription({ description: undefined as string | undefined })).toBe(false);
      });
    });

    describe('categoryHasIcon', () => {
      test('should return true for category with icon', () => {
        expect(categoryHasIcon({ 
          icon: { type: CategoryIconType.EMOJI, value: '📝' } 
        })).toBe(true);
        expect(categoryHasIcon({ 
          icon: { type: CategoryIconType.ICON, value: 'work' } 
        })).toBe(true);
      });

      test('should return false for category without icon', () => {
        expect(categoryHasIcon({})).toBe(false);
        expect(categoryHasIcon({ 
          icon: { type: CategoryIconType.NONE, value: '' } 
        })).toBe(false);
      });
    });

    describe('categoryIsInHierarchy', () => {
      test('should return true for category in hierarchy', () => {
        const hierarchyCategory: CategoryHierarchy = {
          categoryId: 'cat-1',
          level: 1,
          path: ['root', 'cat-1'],
          children: [],
          hasChildren: false
        };
        expect(categoryIsInHierarchy(hierarchyCategory)).toBe(true);
      });

      test('should return true for category with children', () => {
        const parentCategory: CategoryHierarchy = {
          categoryId: 'cat-1',
          level: 0,
          path: ['cat-1'],
          children: [],
          hasChildren: true
        };
        expect(categoryIsInHierarchy(parentCategory)).toBe(true);
      });

      test('should return false for root category without children', () => {
        const rootCategory: CategoryHierarchy = {
          categoryId: 'cat-1',
          level: 0,
          path: ['cat-1'],
          children: [],
          hasChildren: false
        };
        expect(categoryIsInHierarchy(rootCategory)).toBe(false);
      });
    });
  });

  // ===================================
  // Interface Structure Tests
  // ===================================

  describe('Interface Structures', () => {
    describe('CategoryTemplate', () => {
      test('should have required properties', () => {
        const template: CategoryTemplate = {
          id: 'template-123',
          name: 'Work Template',
          color: '#FF0000',
          isPublic: true,
          usageCount: 10,
          createdBy: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(template.id).toBeDefined();
        expect(template.name).toBeDefined();
        expect(template.color).toBeDefined();
        expect(template.isPublic).toBeDefined();
        expect(template.usageCount).toBeDefined();
        expect(template.createdBy).toBeDefined();
        expect(template.createdAt).toBeDefined();
        expect(template.updatedAt).toBeDefined();
      });

      test('should allow optional properties', () => {
        const template: CategoryTemplate = {
          id: 'template-123',
          name: 'Work Template',
          description: 'Template for work categories',
          color: '#FF0000',
          icon: { type: CategoryIconType.EMOJI, value: '💼' },
          isPublic: true,
          usageCount: 10,
          createdBy: 'user-123',
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(template.description).toBe('Template for work categories');
        expect(template.icon?.type).toBe(CategoryIconType.EMOJI);
        expect(template.icon?.value).toBe('💼');
      });
    });

    describe('CategoryIcon', () => {
      test('should have all required properties', () => {
        const icon: CategoryIcon = {
          type: CategoryIconType.EMOJI,
          value: '📝'
        };

        expect(icon.type).toBe(CategoryIconType.EMOJI);
        expect(icon.value).toBe('📝');
      });

      test('should allow optional color properties', () => {
        const icon: CategoryIcon = {
          type: CategoryIconType.ICON,
          value: 'work',
          backgroundColor: '#FF0000',
          foregroundColor: '#FFFFFF'
        };

        expect(icon.backgroundColor).toBe('#FF0000');
        expect(icon.foregroundColor).toBe('#FFFFFF');
      });
    });

    describe('CategoryHierarchy', () => {
      test('should have all required properties', () => {
        const hierarchy: CategoryHierarchy = {
          categoryId: 'cat-123',
          level: 2,
          path: ['root', 'parent', 'cat-123'],
          children: [],
          hasChildren: false
        };

        expect(hierarchy.categoryId).toBe('cat-123');
        expect(hierarchy.level).toBe(2);
        expect(hierarchy.path).toHaveLength(3);
        expect(hierarchy.children).toEqual([]);
        expect(hierarchy.hasChildren).toBe(false);
      });

      test('should allow optional parent ID', () => {
        const hierarchy: CategoryHierarchy = {
          categoryId: 'cat-123',
          parentId: 'parent-456',
          level: 1,
          path: ['parent-456', 'cat-123'],
          children: [],
          hasChildren: false
        };

        expect(hierarchy.parentId).toBe('parent-456');
      });
    });

    describe('CategoryUsageStats', () => {
      test('should have all required properties', () => {
        const stats: CategoryUsageStats = {
          categoryId: 'cat-123',
          categoryName: 'Work',
          totalTasks: 25,
          completedTasks: 15,
          pendingTasks: 8,
          inProgressTasks: 2,
          overdueTasks: 3,
          averageTaskDuration: 48.5,
          lastUsed: new Date(),
          usageFrequency: 5.2
        };

        expect(stats.categoryId).toBe('cat-123');
        expect(stats.categoryName).toBe('Work');
        expect(stats.totalTasks).toBe(25);
        expect(stats.completedTasks).toBe(15);
        expect(stats.averageTaskDuration).toBe(48.5);
        expect(stats.usageFrequency).toBe(5.2);
      });

      test('should calculate completion rate correctly', () => {
        const stats: CategoryUsageStats = {
          categoryId: 'cat-123',
          categoryName: 'Work',
          totalTasks: 20,
          completedTasks: 16,
          pendingTasks: 3,
          inProgressTasks: 1,
          overdueTasks: 0,
          averageTaskDuration: 24,
          lastUsed: new Date(),
          usageFrequency: 3.5
        };

        const completionRate = stats.completedTasks / stats.totalTasks;
        expect(completionRate).toBe(0.8); // 80%
      });
    });

    describe('CategoryBulkOperationRequest', () => {
      test('should have all required properties', () => {
        const bulkRequest: CategoryBulkOperationRequest = {
          categoryIds: ['cat-1', 'cat-2', 'cat-3'],
          operation: CategoryBulkOperation.UPDATE_COLOR
        };

        expect(bulkRequest.categoryIds).toHaveLength(3);
        expect(bulkRequest.operation).toBe(CategoryBulkOperation.UPDATE_COLOR);
      });

      test('should allow optional parameters', () => {
        const bulkRequest: CategoryBulkOperationRequest = {
          categoryIds: ['cat-1', 'cat-2'],
          operation: CategoryBulkOperation.UPDATE_COLOR,
          parameters: {
            color: '#00FF00',
            status: CategoryStatus.ACTIVE
          }
        };

        expect(bulkRequest.parameters?.color).toBe('#00FF00');
        expect(bulkRequest.parameters?.status).toBe(CategoryStatus.ACTIVE);
      });

      test('should validate operation values', () => {
        const validOperations = [
          'update_color', 'update_status', 'move_to_parent',
          'update_visibility', 'delete', 'archive', 'merge'
        ];

        validOperations.forEach(operation => {
          const request: CategoryBulkOperationRequest = {
            categoryIds: ['cat-1'],
            operation: operation as any
          };
          expect(validOperations).toContain(request.operation);
        });
      });
    });

    describe('CategoryDashboardSummary', () => {
      test('should have all required properties', () => {
        const dashboard: CategoryDashboardSummary = {
          userId: 'user-123',
          totalCategories: 15,
          activeCategories: 12,
          archivedCategories: 3,
          categoriesWithTasks: 10,
          categoriesWithoutTasks: 5,
          mostUsedCategories: [],
          recentlyCreated: [],
          colorDistribution: []
        };

        expect(dashboard.userId).toBe('user-123');
        expect(dashboard.totalCategories).toBe(15);
        expect(dashboard.activeCategories).toBe(12);
        expect(dashboard.archivedCategories).toBe(3);
        expect(dashboard.categoriesWithTasks).toBe(10);
        expect(dashboard.categoriesWithoutTasks).toBe(5);
      });

      test('should calculate totals correctly', () => {
        const dashboard: CategoryDashboardSummary = {
          userId: 'user-123',
          totalCategories: 20,
          activeCategories: 15,
          archivedCategories: 5,
          categoriesWithTasks: 12,
          categoriesWithoutTasks: 8,
          mostUsedCategories: [],
          recentlyCreated: [],
          colorDistribution: [
            { color: '#FF0000', count: 5 },
            { color: '#00FF00', count: 8 },
            { color: '#0000FF', count: 7 }
          ]
        };

        const totalFromStatus = dashboard.activeCategories + dashboard.archivedCategories;
        expect(totalFromStatus).toBe(20);

        const totalFromUsage = dashboard.categoriesWithTasks + dashboard.categoriesWithoutTasks;
        expect(totalFromUsage).toBe(20);

        const totalFromColors = dashboard.colorDistribution.reduce((sum, item) => sum + item.count, 0);
        expect(totalFromColors).toBe(20);
      });
    });

    describe('CategoryValidationRules', () => {
      test('should have all required properties', () => {
        const validationRules: CategoryValidationRules = {
          name: {
            minLength: 1,
            maxLength: 50,
            allowedCharacters: /^[a-zA-Z0-9\s\-_]+$/,
            reservedNames: ['system', 'admin', 'default']
          },
          color: {
            format: 'hex'
          },
          description: {
            maxLength: 200,
            allowHtml: false
          },
          hierarchy: {
            maxDepth: 5,
            allowCircularReferences: false
          }
        };

        expect(validationRules.name.minLength).toBe(1);
        expect(validationRules.name.maxLength).toBe(50);
        expect(validationRules.color.format).toBe('hex');
        expect(validationRules.description.maxLength).toBe(200);
        expect(validationRules.hierarchy.maxDepth).toBe(5);
        expect(validationRules.hierarchy.allowCircularReferences).toBe(false);
      });

      test('should handle regex patterns', () => {
        const validationRules: CategoryValidationRules = {
          name: {
            minLength: 1,
            maxLength: 30,
            allowedCharacters: /^[a-zA-Z0-9\s]+$/,
            reservedNames: []
          },
          color: {
            format: 'hex',
            allowedColors: ['#FF0000', '#00FF00', '#0000FF']
          },
          description: {
            maxLength: 100,
            allowHtml: true
          },
          hierarchy: {
            maxDepth: 3,
            allowCircularReferences: false
          }
        };

        expect(validationRules.name.allowedCharacters).toBeInstanceOf(RegExp);
        expect(validationRules.name.allowedCharacters.test('Valid Name 123')).toBe(true);
        expect(validationRules.name.allowedCharacters.test('Invalid-Name!')).toBe(false);
        expect(validationRules.color.allowedColors).toHaveLength(3);
      });
    });
  });

  // ===================================
  // Utility Type Tests
  // ===================================

  describe('Utility Types', () => {
    describe('PublicCategoryData', () => {
      test('should exclude id and include publicId', () => {
        const publicData: PublicCategoryData = {
          publicId: 'pub-cat-123',
          name: 'Public Category',
          color: '#FF0000',
          description: 'Public category description',
          createdAt: new Date(),
          taskCount: 5
        };

        expect(publicData.publicId).toBe('pub-cat-123');
        expect(publicData.name).toBe('Public Category');
        expect(publicData.taskCount).toBe(5);
        expect('id' in publicData).toBe(false);
      });
    });

    describe('CategoryCreationInput', () => {
      test('should extend CategoryCreationData with additional fields', () => {
        const creationInput: CategoryCreationInput = {
          name: 'New Category',
          color: '#00FF00',
          description: 'New category description',
          icon: { type: CategoryIconType.EMOJI, value: '📁' },
          visibility: CategoryVisibility.PUBLIC,
          status: CategoryStatus.ACTIVE
        };

        expect(creationInput.name).toBe('New Category');
        expect(creationInput.color).toBe('#00FF00');
        expect(creationInput.icon?.type).toBe(CategoryIconType.EMOJI);
        expect(creationInput.visibility).toBe(CategoryVisibility.PUBLIC);
        expect(creationInput.status).toBe(CategoryStatus.ACTIVE);
      });
    });

    describe('CategoryUpdateInput', () => {
      test('should allow partial updates', () => {
        const updateInput: CategoryUpdateInput = {
          name: 'Updated Name',
          color: '#0000FF'
        };

        expect(updateInput.name).toBe('Updated Name');
        expect(updateInput.color).toBe('#0000FF');
        expect(updateInput.description).toBeUndefined();
      });

      test('should allow icon and visibility updates', () => {
        const updateInput: CategoryUpdateInput = {
          icon: { type: CategoryIconType.ICON, value: 'folder' },
          visibility: CategoryVisibility.PRIVATE,
          status: CategoryStatus.ARCHIVED
        };

        expect(updateInput.icon?.type).toBe(CategoryIconType.ICON);
        expect(updateInput.visibility).toBe(CategoryVisibility.PRIVATE);
        expect(updateInput.status).toBe(CategoryStatus.ARCHIVED);
      });
    });

    describe('ExtendedCategorySearchFilters', () => {
      test('should extend CategorySearchFilters with additional properties', () => {
        const extendedFilters: ExtendedCategorySearchFilters = {
          name: 'Work',
          color: '#FF0000',
          status: CategoryStatus.ACTIVE,
          visibility: CategoryVisibility.PUBLIC,
          hasIcon: true,
          hasParent: false,
          hasChildren: true,
          minTaskCount: 1,
          maxTaskCount: 10,
          lastUsedAfter: new Date(Date.now() - 86400000 * 7), // 7 days ago
          lastUsedBefore: new Date(),
          usageFrequencyMin: 1.0,
          usageFrequencyMax: 5.0
        };

        expect(extendedFilters.name).toBe('Work');
        expect(extendedFilters.status).toBe(CategoryStatus.ACTIVE);
        expect(extendedFilters.hasIcon).toBe(true);
        expect(extendedFilters.minTaskCount).toBe(1);
        expect(extendedFilters.usageFrequencyMin).toBe(1.0);
      });
    });

    describe('CategoryWithComputedProperties', () => {
      test('should extend CategoryWithTaskCount with computed properties', () => {
        const categoryWithComputed: CategoryWithComputedProperties = {
          category: {
            id: 'cat-123',
            name: 'Work Category',
            color: '#FF0000',
            description: 'Work related tasks',
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          taskCount: 20,
          isActive: true,
          isArchived: false,
          isPublic: true,
          hasDescription: true,
          hasIcon: false,
          hasValidColor: true,
          usageFrequency: 3.5,
          lastUsed: new Date(),
          completionRate: 75.0
        };

        expect(categoryWithComputed.taskCount).toBe(20);
        expect(categoryWithComputed.isActive).toBe(true);
        expect(categoryWithComputed.isPublic).toBe(true);
        expect(categoryWithComputed.hasDescription).toBe(true);
        expect(categoryWithComputed.usageFrequency).toBe(3.5);
        expect(categoryWithComputed.completionRate).toBe(75.0);
      });
    });

    describe('CategorySummary', () => {
      test('should provide summary information', () => {
        const categorySummary: CategorySummary = {
          id: 'cat-123',
          name: 'Summary Category',
          color: '#00FF00',
          taskCount: 8,
          isActive: true,
          hasDescription: false
        };

        expect(categorySummary.id).toBe('cat-123');
        expect(categorySummary.name).toBe('Summary Category');
        expect(categorySummary.color).toBe('#00FF00');
        expect(categorySummary.taskCount).toBe(8);
        expect(categorySummary.isActive).toBe(true);
        expect(categorySummary.hasDescription).toBe(false);
      });
    });

    describe('CategoryCreationResult', () => {
      test('should include category and optional warnings/suggestions', () => {
        const creationResult: CategoryCreationResult = {
          category: {
            category: {
              id: 'cat-123',
              name: 'Created Category',
              color: '#FF0000',
              description: 'Newly created category',
              createdAt: new Date(),
              updatedAt: new Date()
            } as any,
            taskCount: 0
          },
          warnings: ['Color is very similar to existing category'],
          suggestions: ['Consider adding an icon', 'Set up notification preferences']
        };

        expect(creationResult.category).toBeDefined();
        expect(creationResult.warnings).toHaveLength(1);
        expect(creationResult.suggestions).toHaveLength(2);
        expect(creationResult.warnings?.[0]).toContain('Color is very similar');
      });
    });

    describe('CategoryDeletionResult', () => {
      test('should track deletion and related data handling', () => {
        const deletionResult: CategoryDeletionResult = {
          success: true,
          categoryId: 'cat-123',
          relatedDataHandled: {
            tasksReassigned: 15,
            childCategoriesReassigned: 3,
            notificationsDeleted: 5
          }
        };

        expect(deletionResult.success).toBe(true);
        expect(deletionResult.categoryId).toBe('cat-123');
        expect(deletionResult.relatedDataHandled.tasksReassigned).toBe(15);
        expect(deletionResult.relatedDataHandled.childCategoriesReassigned).toBe(3);
        expect(deletionResult.relatedDataHandled.notificationsDeleted).toBe(5);
      });
    });

    describe('CategoryMergeResult', () => {
      test('should track merge operation results', () => {
        const mergeResult: CategoryMergeResult = {
          success: true,
          targetCategoryId: 'cat-target',
          sourceCategoryIds: ['cat-1', 'cat-2', 'cat-3'],
          mergedData: {
            tasksMoved: 25,
            childCategoriesMoved: 2,
            notificationsMerged: 8
          }
        };

        expect(mergeResult.success).toBe(true);
        expect(mergeResult.targetCategoryId).toBe('cat-target');
        expect(mergeResult.sourceCategoryIds).toHaveLength(3);
        expect(mergeResult.mergedData.tasksMoved).toBe(25);
        expect(mergeResult.mergedData.childCategoriesMoved).toBe(2);
        expect(mergeResult.mergedData.notificationsMerged).toBe(8);
      });
    });

    describe('CategoryColorValidationResult', () => {
      test('should validate color formats', () => {
        const validHexResult: CategoryColorValidationResult = {
          isValid: true,
          format: 'hex',
          normalizedColor: '#FF0000'
        };

        const invalidResult: CategoryColorValidationResult = {
          isValid: false,
          format: 'invalid',
          suggestions: ['Use hex format like #FF0000', 'Try a predefined color']
        };

        expect(validHexResult.isValid).toBe(true);
        expect(validHexResult.format).toBe('hex');
        expect(validHexResult.normalizedColor).toBe('#FF0000');

        expect(invalidResult.isValid).toBe(false);
        expect(invalidResult.format).toBe('invalid');
        expect(invalidResult.suggestions).toHaveLength(2);
      });
    });

    describe('CategoryUsageTrend', () => {
      test('should track usage trends over time', () => {
        const usageTrend: CategoryUsageTrend = {
          categoryId: 'cat-123',
          categoryName: 'Work',
          period: {
            startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
            endDate: new Date()
          },
          dataPoints: [
            { date: new Date(), taskCount: 5, completionRate: 80 },
            { date: new Date(), taskCount: 8, completionRate: 75 }
          ],
          trend: 'increasing',
          growthRate: 15.5
        };

        expect(usageTrend.categoryId).toBe('cat-123');
        expect(usageTrend.categoryName).toBe('Work');
        expect(usageTrend.dataPoints).toHaveLength(2);
        expect(usageTrend.trend).toBe('increasing');
        expect(usageTrend.growthRate).toBe(15.5);
      });
    });

    describe('CategoryRecommendation', () => {
      test('should provide category recommendations', () => {
        const recommendation: CategoryRecommendation = {
          type: 'color',
          categoryId: 'cat-123',
          recommendation: 'Consider using a more distinct color',
          reason: 'Current color is too similar to 3 other categories',
          confidence: 85,
          impact: 'medium'
        };

        expect(recommendation.type).toBe('color');
        expect(recommendation.categoryId).toBe('cat-123');
        expect(recommendation.confidence).toBe(85);
        expect(recommendation.impact).toBe('medium');
      });

      test('should validate recommendation types', () => {
        const validTypes = ['color', 'name', 'hierarchy', 'merge', 'split'];
        const validImpacts = ['low', 'medium', 'high'];

        validTypes.forEach(type => {
          const recommendation: CategoryRecommendation = {
            type: type as any,
            categoryId: 'cat-1',
            recommendation: 'Test recommendation',
            reason: 'Test reason',
            confidence: 50,
            impact: 'low'
          };
          expect(validTypes).toContain(recommendation.type);
        });

        validImpacts.forEach(impact => {
          const recommendation: CategoryRecommendation = {
            type: 'color',
            categoryId: 'cat-1',
            recommendation: 'Test recommendation',
            reason: 'Test reason',
            confidence: 50,
            impact: impact as any
          };
          expect(validImpacts).toContain(recommendation.impact);
        });
      });
    });
  });

  // ===================================
  // Type Compatibility Tests
  // ===================================

  describe('Type Compatibility', () => {
    test('should be compatible with CategoryVisibility from types', () => {
      const visibility: CategoryVisibility = CategoryVisibility.PUBLIC;
      expect(visibility).toBe('public');
    });

    test('should work with type guards on different object shapes', () => {
      interface TestCategory {
        color: string;
        status?: CategoryStatus;
        visibility?: CategoryVisibility;
        description?: string;
        name: string;
      }

      const testCategory: TestCategory = {
        color: '#FF0000',
        status: CategoryStatus.ACTIVE,
        visibility: CategoryVisibility.PUBLIC,
        description: 'Test category',
        name: 'Test'
      };

      expect(hasValidHexColor(testCategory)).toBe(true);
      expect(isCategoryActive(testCategory)).toBe(true);
      expect(isCategoryPublic(testCategory)).toBe(true);
      expect(categoryHasDescription(testCategory)).toBe(true);
    });

    test('should handle partial objects correctly', () => {
      const partialCategory: Partial<CategoryWithComputedProperties> = {
        category: {
          color: '#00FF00',
          name: 'Partial Category'
        } as any,
        isActive: true,
        hasValidColor: true
      };

      if (partialCategory.category?.color) {
        expect(hasValidHexColor({ color: partialCategory.category.color })).toBe(true);
      }

      expect(partialCategory.isActive).toBe(true);
      expect(partialCategory.hasValidColor).toBe(true);
    });
  });

  // ===================================
  // Edge Case Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle empty arrays in bulk operations', () => {
      const emptyBulkRequest: CategoryBulkOperationRequest = {
        categoryIds: [],
        operation: CategoryBulkOperation.DELETE
      };

      expect(emptyBulkRequest.categoryIds).toHaveLength(0);
    });

    test('should handle undefined optional properties', () => {
      const minimalIcon: CategoryIcon = {
        type: CategoryIconType.EMOJI,
        value: '📁'
        // backgroundColor, foregroundColor are undefined
      };

      expect(minimalIcon.backgroundColor).toBeUndefined();
      expect(minimalIcon.foregroundColor).toBeUndefined();
    });

    test('should handle complex nested objects', () => {
      const complexDashboard: CategoryDashboardSummary = {
        userId: 'user-123',
        totalCategories: 25,
        activeCategories: 20,
        archivedCategories: 5,
        categoriesWithTasks: 18,
        categoriesWithoutTasks: 7,
        mostUsedCategories: [
          {
            categoryId: 'cat-1',
            categoryName: 'Work',
            totalTasks: 50,
            completedTasks: 40,
            pendingTasks: 8,
            inProgressTasks: 2,
            overdueTasks: 0,
            averageTaskDuration: 24,
            lastUsed: new Date(),
            usageFrequency: 8.5
          }
        ],
        recentlyCreated: [],
        colorDistribution: [
          { color: '#FF0000', count: 8 },
          { color: '#00FF00', count: 10 },
          { color: '#0000FF', count: 7 }
        ]
      };

      expect(complexDashboard.mostUsedCategories).toHaveLength(1);
      expect(complexDashboard.mostUsedCategories[0].usageFrequency).toBe(8.5);
      expect(complexDashboard.colorDistribution).toHaveLength(3);
    });

    test('should handle date objects in interfaces', () => {
      const analytics: CategoryAnalytics = {
        userId: 'user-123',
        period: {
          startDate: new Date('2024-01-01T00:00:00Z'),
          endDate: new Date('2024-01-31T23:59:59Z')
        },
        categoryMetrics: [],
        trends: {
          categoryUsage: [
            {
              date: new Date('2024-01-15T12:00:00Z'),
              categoryId: 'cat-1',
              taskCount: 5
            }
          ],
          colorPreferences: []
        }
      };

      expect(analytics.period.startDate).toBeInstanceOf(Date);
      expect(analytics.period.endDate).toBeInstanceOf(Date);
      expect(analytics.trends.categoryUsage[0].date).toBeInstanceOf(Date);
    });

    test('should handle regex patterns in validation rules', () => {
      const validationRules: CategoryValidationRules = {
        name: {
          minLength: 1,
          maxLength: 50,
          allowedCharacters: /^[a-zA-Z0-9\s\-_]+$/,
          reservedNames: ['system', 'admin', 'default']
        },
        color: {
          format: 'hex',
          forbiddenColors: ['#000000', '#FFFFFF']
        },
        description: {
          maxLength: 200,
          allowHtml: false
        },
        hierarchy: {
          maxDepth: 5,
          allowCircularReferences: false
        }
      };

      expect(validationRules.name.allowedCharacters).toBeInstanceOf(RegExp);
      expect(validationRules.name.allowedCharacters.test('Valid Category Name')).toBe(true);
      expect(validationRules.name.allowedCharacters.test('Invalid@Category!')).toBe(false);
      expect(validationRules.name.reservedNames).toContain('system');
      expect(validationRules.color.forbiddenColors).toContain('#000000');
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration Tests', () => {
    test('should work together in realistic category creation scenario', () => {
      // Create a category creation input
      const creationInput: CategoryCreationInput = {
        name: 'Project Management',
        color: '#4A90E2',
        description: 'Categories for project management tasks',
        icon: { type: CategoryIconType.EMOJI, value: '📊' },
        visibility: CategoryVisibility.TEAM,
        status: CategoryStatus.ACTIVE
      };

      // Simulate category creation result
      const creationResult: CategoryCreationResult = {
        category: {
          category: {
            id: 'cat-pm-123',
            name: creationInput.name,
            color: creationInput.color,
            description: creationInput.description,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          taskCount: 0
        },
        suggestions: ['Consider creating subcategories', 'Set up notification preferences']
      };

      // Validate the created category
      expect(hasValidHexColor(creationResult.category.category)).toBe(true);
      expect(isCategoryActive({ status: creationInput.status! })).toBe(true);
      expect(categoryHasDescription(creationResult.category.category)).toBe(true);
      expect(categoryHasIcon({ icon: creationInput.icon! })).toBe(true);
      expect(creationResult.suggestions).toHaveLength(2);
    });

    test('should handle category bulk operations workflow', () => {
      // Bulk operation request
      const bulkRequest: CategoryBulkOperationRequest = {
        categoryIds: ['cat-1', 'cat-2', 'cat-3'],
        operation: CategoryBulkOperation.UPDATE_COLOR,
        parameters: {
          color: '#FF6B6B'
        }
      };

      // Bulk operation result
      const bulkResult: CategoryBulkOperationResult = {
        success: true,
        processedCount: 3,
        failedCount: 0,
        errors: [],
        results: [
          { categoryId: 'cat-1', success: true, message: 'Color updated successfully' },
          { categoryId: 'cat-2', success: true, message: 'Color updated successfully' },
          { categoryId: 'cat-3', success: true, message: 'Color updated successfully' }
        ]
      };

      expect(bulkRequest.categoryIds).toHaveLength(3);
      expect(bulkRequest.parameters?.color).toBe('#FF6B6B');
      expect(hasValidHexColor({ color: bulkRequest.parameters?.color! })).toBe(true);
      expect(bulkResult.processedCount).toBe(3);
      expect(bulkResult.failedCount).toBe(0);
      expect(bulkResult.results).toHaveLength(3);
      expect(bulkResult.results.every(r => r.success)).toBe(true);
    });

    test('should handle category dashboard and analytics together', () => {
      const dashboard: CategoryDashboardSummary = {
        userId: 'user-123',
        totalCategories: 12,
        activeCategories: 10,
        archivedCategories: 2,
        categoriesWithTasks: 8,
        categoriesWithoutTasks: 4,
        mostUsedCategories: [],
        recentlyCreated: [],
        colorDistribution: [
          { color: '#FF0000', count: 4 },
          { color: '#00FF00', count: 5 },
          { color: '#0000FF', count: 3 }
        ]
      };

      const analytics: CategoryAnalytics = {
        userId: dashboard.userId,
        period: {
          startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
          endDate: new Date()
        },
        categoryMetrics: [
          {
            categoryId: 'cat-1',
            categoryName: 'Work',
            tasksCreated: 25,
            tasksCompleted: 20,
            averageCompletionTime: 36,
            productivityScore: 80
          }
        ],
        trends: {
          categoryUsage: [],
          colorPreferences: dashboard.colorDistribution.map(item => ({
            color: item.color,
            usageCount: item.count,
            trend: 'stable' as const
          }))
        }
      };

      expect(analytics.userId).toBe(dashboard.userId);
      expect(analytics.categoryMetrics).toHaveLength(1);
      expect(analytics.trends.colorPreferences).toHaveLength(3);
      expect(analytics.trends.colorPreferences[0].color).toBe('#FF0000');
      expect(analytics.trends.colorPreferences[0].usageCount).toBe(4);
    });

    test('should handle category hierarchy and relationships', () => {
      const parentHierarchy: CategoryHierarchy = {
        categoryId: 'cat-parent',
        level: 0,
        path: ['cat-parent'],
        children: [
          {
            categoryId: 'cat-child-1',
            parentId: 'cat-parent',
            level: 1,
            path: ['cat-parent', 'cat-child-1'],
            children: [],
            hasChildren: false
          }
        ],
        hasChildren: true
      };

      const relationship: CategoryRelationship = {
        id: 'rel-123',
        parentCategoryId: 'cat-parent',
        childCategoryId: 'cat-child-1',
        relationshipType: 'parent_child',
        strength: 100,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      expect(categoryIsInHierarchy(parentHierarchy)).toBe(true);
      expect(parentHierarchy.hasChildren).toBe(true);
      expect(parentHierarchy.children).toHaveLength(1);
      expect(relationship.relationshipType).toBe('parent_child');
      expect(relationship.strength).toBe(100);
    });
  });
});
