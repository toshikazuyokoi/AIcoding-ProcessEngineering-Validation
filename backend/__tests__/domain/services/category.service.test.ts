/**
 * ===================================
 * Category Service Test Suite
 * ===================================
 * Purpose: Comprehensive tests for CategoryService domain service
 * Features:
 * - Category management operations testing
 * - Business logic validation
 * - Error handling and edge cases
 * - Mock repository and dependencies
 * - Category lifecycle testing
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  CategoryService,
  ICategoryRepository,
  ITaskCategoryRepository,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CategorySearchFilters,
  CategoryWithTaskCount
} from '../../../src/domain/services/category.service';
import { Category, CategoryCreationData, CategoryUpdateData } from '../../../src/domain/entities/category.entity';
import { Task, TaskCreationData, TaskPriority, TaskStatus } from '../../../src/domain/entities/task.entity';
import { EntityValidationError, EntityNotFoundError, EntityConflictError } from '../../../src/domain/entities/base.entity';

// Mock implementations
class MockCategoryRepository implements ICategoryRepository {
  private categories: Map<string, Category> = new Map();
  private userCategories: Map<string, Set<string>> = new Map(); // userId -> categoryIds

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    const categories: Category[] = [];
    for (const id of ids) {
      const category = this.categories.get(id);
      if (category) {
        categories.push(category);
      }
    }
    return categories;
  }

  async findByUserId(userId: string, filters?: CategorySearchFilters): Promise<Category[]> {
    const userCategoryIds = this.userCategories.get(userId) || new Set();
    let categories = Array.from(userCategoryIds).map(id => this.categories.get(id)!).filter(Boolean);

    if (filters?.search) {
      categories = categories.filter(cat => 
        cat.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(filters.search!.toLowerCase()))
      );
    }

    if (filters?.color) {
      categories = categories.filter(cat => cat.color === filters.color);
    }

    if (filters?.hasDescription !== undefined) {
      categories = categories.filter(cat => 
        filters.hasDescription ? cat.description !== undefined : cat.description === undefined
      );
    }

    return categories;
  }

  async findByName(userId: string, name: string): Promise<Category | null> {
    const userCategories = await this.findByUserId(userId);
    return userCategories.find(cat => cat.name === name) || null;
  }

  async create(userId: string, data: CategoryCreationData): Promise<Category> {
    const category = new Category(data);
    this.categories.set(category.id, category);
    
    if (!this.userCategories.has(userId)) {
      this.userCategories.set(userId, new Set());
    }
    this.userCategories.get(userId)!.add(category.id);
    
    return category;
  }

  async update(id: string, data: CategoryUpdateData): Promise<Category> {
    const category = this.categories.get(id);
    if (!category) {
      throw new EntityNotFoundError('Category', id);
    }

    category.updateCategory(data);
    return category;
  }

  async delete(id: string): Promise<void> {
    this.categories.delete(id);
    // Remove from user categories
    for (const categoryIds of this.userCategories.values()) {
      categoryIds.delete(id);
    }
  }

  async count(userId: string, filters?: CategorySearchFilters): Promise<number> {
    const categories = await this.findByUserId(userId, filters);
    return categories.length;
  }

  async search(userId: string, query: string): Promise<Category[]> {
    return await this.findByUserId(userId, { search: query });
  }

  // Helper methods for testing
  clear(): void {
    this.categories.clear();
    this.userCategories.clear();
  }

  addCategory(userId: string, category: Category): void {
    this.categories.set(category.id, category);
    if (!this.userCategories.has(userId)) {
      this.userCategories.set(userId, new Set());
    }
    this.userCategories.get(userId)!.add(category.id);
  }
}

class MockTaskCategoryRepository implements ITaskCategoryRepository {
  private relations: Map<string, string[]> = new Map(); // taskId -> categoryIds
  private categoryTaskCounts: Map<string, number> = new Map(); // categoryId -> taskCount

  async findCategoriesByTaskId(taskId: string): Promise<Category[]> {
    const categoryIds = this.relations.get(taskId) || [];
    return categoryIds.map(id => new Category({ name: `Category ${id}`, color: '#FF0000' }));
  }

  async findTasksByCategory(categoryId: string): Promise<Task[]> {
    const tasks: Task[] = [];
    for (const [taskId, categoryIds] of this.relations.entries()) {
      if (categoryIds.includes(categoryId)) {
        const task = new Task({
          userId: 'user-123',
          title: `Task ${taskId}`,
          description: 'Test task',
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.PENDING
        });
        tasks.push(task);
      }
    }
    return tasks;
  }

  async createRelations(taskId: string, categoryIds: string[]): Promise<void> {
    this.relations.set(taskId, categoryIds);
    // Update task counts
    for (const categoryId of categoryIds) {
      const currentCount = this.categoryTaskCounts.get(categoryId) || 0;
      this.categoryTaskCounts.set(categoryId, currentCount + 1);
    }
  }

  async updateRelations(taskId: string, categoryIds: string[]): Promise<void> {
    // Remove old relations
    const oldCategoryIds = this.relations.get(taskId) || [];
    for (const categoryId of oldCategoryIds) {
      const currentCount = this.categoryTaskCounts.get(categoryId) || 0;
      this.categoryTaskCounts.set(categoryId, Math.max(0, currentCount - 1));
    }

    // Add new relations
    this.relations.set(taskId, categoryIds);
    for (const categoryId of categoryIds) {
      const currentCount = this.categoryTaskCounts.get(categoryId) || 0;
      this.categoryTaskCounts.set(categoryId, currentCount + 1);
    }
  }

  async deleteRelations(taskId: string): Promise<void> {
    const categoryIds = this.relations.get(taskId) || [];
    for (const categoryId of categoryIds) {
      const currentCount = this.categoryTaskCounts.get(categoryId) || 0;
      this.categoryTaskCounts.set(categoryId, Math.max(0, currentCount - 1));
    }
    this.relations.delete(taskId);
  }

  async countTasksByCategory(categoryId: string): Promise<number> {
    return this.categoryTaskCounts.get(categoryId) || 0;
  }

  async findCategoriesWithTaskCounts(userId: string): Promise<{ categoryId: string; taskCount: number }[]> {
    const result: { categoryId: string; taskCount: number }[] = [];
    for (const [categoryId, taskCount] of this.categoryTaskCounts.entries()) {
      result.push({ categoryId, taskCount });
    }
    return result;
  }

  // Helper methods for testing
  clear(): void {
    this.relations.clear();
    this.categoryTaskCounts.clear();
  }

  setTaskCount(categoryId: string, count: number): void {
    this.categoryTaskCounts.set(categoryId, count);
  }
}

describe('CategoryService', () => {
  let categoryService: CategoryService;
  let mockCategoryRepository: MockCategoryRepository;
  let mockTaskCategoryRepository: MockTaskCategoryRepository;

  const testUserId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(() => {
    mockCategoryRepository = new MockCategoryRepository();
    mockTaskCategoryRepository = new MockTaskCategoryRepository();
    categoryService = new CategoryService(mockCategoryRepository, mockTaskCategoryRepository);
  });

  // ===================================
  // Category Creation Tests
  // ===================================

  describe('createCategory', () => {
    const validCreateRequest: CreateCategoryRequest = {
      name: 'Work',
      color: '#FF0000',
      description: 'Work related tasks'
    };

    test('should create category with valid data', async () => {
      const result = await categoryService.createCategory(testUserId, validCreateRequest);

      expect(result.name).toBe('Work');
      expect(result.color).toBe('#FF0000');
      expect(result.description).toBe('Work related tasks');
    });

    test('should create category without description', async () => {
      const request = {
        name: 'Personal',
        color: '#00FF00'
      };

      const result = await categoryService.createCategory(testUserId, request);

      expect(result.name).toBe('Personal');
      expect(result.color).toBe('#00FF00');
      expect(result.description).toBeUndefined();
    });

    test('should throw error for duplicate category name', async () => {
      await categoryService.createCategory(testUserId, validCreateRequest);

      await expect(categoryService.createCategory(testUserId, validCreateRequest))
        .rejects.toThrow(EntityConflictError);
      await expect(categoryService.createCategory(testUserId, validCreateRequest))
        .rejects.toThrow('Category with name "Work" already exists');
    });

    test('should allow same category name for different users', async () => {
      await categoryService.createCategory(testUserId, validCreateRequest);
      
      const result = await categoryService.createCategory(otherUserId, validCreateRequest);

      expect(result.name).toBe('Work');
    });
  });

  // ===================================
  // Category Retrieval Tests
  // ===================================

  describe('getCategoryById', () => {
    let testCategory: Category;

    beforeEach(async () => {
      testCategory = await categoryService.createCategory(testUserId, {
        name: 'Test Category',
        color: '#FF0000',
        description: 'Test description'
      });
    });

    test('should return category when found', async () => {
      const result = await categoryService.getCategoryById(testCategory.id, testUserId);

      expect(result.id).toBe(testCategory.id);
      expect(result.name).toBe('Test Category');
    });

    test('should throw error when category not found', async () => {
      await expect(categoryService.getCategoryById('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // Category Update Tests
  // ===================================

  describe('updateCategory', () => {
    let testCategory: Category;

    beforeEach(async () => {
      testCategory = await categoryService.createCategory(testUserId, {
        name: 'Test Category',
        color: '#FF0000',
        description: 'Test description'
      });
    });

    test('should update category successfully', async () => {
      const updateRequest: UpdateCategoryRequest = {
        name: 'Updated Category',
        color: '#00FF00',
        description: 'Updated description'
      };

      const result = await categoryService.updateCategory(testCategory.id, testUserId, updateRequest);

      expect(result.name).toBe('Updated Category');
      expect(result.color).toBe('#00FF00');
      expect(result.description).toBe('Updated description');
    });

    test('should update only specified fields', async () => {
      const originalName = testCategory.name;
      const updateRequest: UpdateCategoryRequest = {
        description: 'New description only'
      };

      const result = await categoryService.updateCategory(testCategory.id, testUserId, updateRequest);

      expect(result.name).toBe(originalName);
      expect(result.description).toBe('New description only');
    });

    test('should throw error for duplicate name', async () => {
      // Create another category
      await categoryService.createCategory(testUserId, {
        name: 'Another Category',
        color: '#0000FF'
      });

      const updateRequest: UpdateCategoryRequest = {
        name: 'Another Category'
      };

      await expect(categoryService.updateCategory(testCategory.id, testUserId, updateRequest))
        .rejects.toThrow(EntityConflictError);
    });

    test('should allow updating to same name', async () => {
      const updateRequest: UpdateCategoryRequest = {
        name: testCategory.name,
        description: 'Same name, new description'
      };

      const result = await categoryService.updateCategory(testCategory.id, testUserId, updateRequest);

      expect(result.name).toBe(testCategory.name);
      expect(result.description).toBe('Same name, new description');
    });
  });

  // ===================================
  // Category Deletion Tests
  // ===================================

  describe('deleteCategory', () => {
    let testCategory: Category;

    beforeEach(async () => {
      testCategory = await categoryService.createCategory(testUserId, {
        name: 'Test Category',
        color: '#FF0000'
      });
    });

    test('should delete category successfully when no tasks', async () => {
      await categoryService.deleteCategory(testCategory.id, testUserId);

      await expect(categoryService.getCategoryById(testCategory.id, testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when category has tasks', async () => {
      // Set task count for category
      mockTaskCategoryRepository.setTaskCount(testCategory.id, 3);

      await expect(categoryService.deleteCategory(testCategory.id, testUserId))
        .rejects.toThrow(EntityValidationError);
      await expect(categoryService.deleteCategory(testCategory.id, testUserId))
        .rejects.toThrow('Cannot delete category with 3 associated tasks');
    });

    test('should throw error when category not found', async () => {
      await expect(categoryService.deleteCategory('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // Category Search and Filtering Tests
  // ===================================

  describe('getCategoriesByUser', () => {
    beforeEach(async () => {
      await categoryService.createCategory(testUserId, {
        name: 'Work',
        color: '#FF0000',
        description: 'Work tasks'
      });

      await categoryService.createCategory(testUserId, {
        name: 'Personal',
        color: '#00FF00'
      });

      await categoryService.createCategory(otherUserId, {
        name: 'Other User Category',
        color: '#0000FF'
      });
    });

    test('should return all categories for user', async () => {
      const result = await categoryService.getCategoriesByUser(testUserId);

      expect(result).toHaveLength(2);
      expect(result.map(c => c.name)).toContain('Work');
      expect(result.map(c => c.name)).toContain('Personal');
    });

    test('should filter categories by search', async () => {
      const result = await categoryService.getCategoriesByUser(testUserId, {
        search: 'work'
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work');
    });

    test('should filter categories by color', async () => {
      const result = await categoryService.getCategoriesByUser(testUserId, {
        color: '#FF0000'
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work');
    });

    test('should filter categories by description presence', async () => {
      const result = await categoryService.getCategoriesByUser(testUserId, {
        hasDescription: true
      });

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Work');
    });
  });

  describe('searchCategories', () => {
    beforeEach(async () => {
      await categoryService.createCategory(testUserId, {
        name: 'Important Work',
        color: '#FF0000',
        description: 'Critical work tasks'
      });

      await categoryService.createCategory(testUserId, {
        name: 'Personal',
        color: '#00FF00',
        description: 'Personal activities'
      });
    });

    test('should search categories by name', async () => {
      const result = await categoryService.searchCategories(testUserId, 'work');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Important Work');
    });

    test('should search categories by description', async () => {
      const result = await categoryService.searchCategories(testUserId, 'activities');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Personal');
    });

    test('should return empty array for no matches', async () => {
      const result = await categoryService.searchCategories(testUserId, 'nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  // ===================================
  // Category Statistics Tests
  // ===================================

  describe('getCategoriesWithTaskCounts', () => {
    let workCategory: Category;
    let personalCategory: Category;

    beforeEach(async () => {
      workCategory = await categoryService.createCategory(testUserId, {
        name: 'Work',
        color: '#FF0000'
      });

      personalCategory = await categoryService.createCategory(testUserId, {
        name: 'Personal',
        color: '#00FF00'
      });

      // Set task counts
      mockTaskCategoryRepository.setTaskCount(workCategory.id, 5);
      mockTaskCategoryRepository.setTaskCount(personalCategory.id, 0);
    });

    test('should return categories with task counts', async () => {
      const result = await categoryService.getCategoriesWithTaskCounts(testUserId);

      expect(result).toHaveLength(2);

      const workResult = result.find(c => c.category.name === 'Work');
      const personalResult = result.find(c => c.category.name === 'Personal');

      expect(workResult?.taskCount).toBe(5);
      expect(personalResult?.taskCount).toBe(0);
    });
  });

  describe('getCategoryStatistics', () => {
    beforeEach(async () => {
      const workCategory = await categoryService.createCategory(testUserId, {
        name: 'Work',
        color: '#FF0000'
      });

      const personalCategory = await categoryService.createCategory(testUserId, {
        name: 'Personal',
        color: '#00FF00'
      });

      const hobbyCategory = await categoryService.createCategory(testUserId, {
        name: 'Hobby',
        color: '#0000FF'
      });

      // Set task counts
      mockTaskCategoryRepository.setTaskCount(workCategory.id, 10);
      mockTaskCategoryRepository.setTaskCount(personalCategory.id, 5);
      mockTaskCategoryRepository.setTaskCount(hobbyCategory.id, 0);
    });

    test('should return correct statistics', async () => {
      const stats = await categoryService.getCategoryStatistics(testUserId);

      expect(stats.totalCategories).toBe(3);
      expect(stats.categoriesWithTasks).toBe(2);
      expect(stats.categoriesWithoutTasks).toBe(1);
      expect(stats.averageTasksPerCategory).toBe(5); // (10 + 5 + 0) / 3 = 5
      expect(stats.mostUsedCategory?.name).toBe('Work');
      expect(stats.leastUsedCategory?.name).toBe('Hobby');
    });

    test('should return zero statistics for user with no categories', async () => {
      const stats = await categoryService.getCategoryStatistics(otherUserId);

      expect(stats.totalCategories).toBe(0);
      expect(stats.categoriesWithTasks).toBe(0);
      expect(stats.categoriesWithoutTasks).toBe(0);
      expect(stats.averageTasksPerCategory).toBe(0);
      expect(stats.mostUsedCategory).toBeNull();
      expect(stats.leastUsedCategory).toBeNull();
    });
  });

  // ===================================
  // Category Utility Methods Tests
  // ===================================

  describe('Category Utility Methods', () => {
    let testCategory: Category;

    beforeEach(async () => {
      testCategory = await categoryService.createCategory(testUserId, {
        name: 'Test Category',
        color: '#FF0000',
        description: 'Test description'
      });
    });

    test('should update category name', async () => {
      const result = await categoryService.updateCategoryName(testCategory.id, testUserId, 'New Name');

      expect(result.name).toBe('New Name');
    });

    test('should update category color', async () => {
      const result = await categoryService.updateCategoryColor(testCategory.id, testUserId, '#00FF00');

      expect(result.color).toBe('#00FF00');
    });

    test('should update category description', async () => {
      const result = await categoryService.updateCategoryDescription(testCategory.id, testUserId, 'New description');

      expect(result.description).toBe('New description');
    });

    test('should remove category description', async () => {
      const result = await categoryService.removeCategoryDescription(testCategory.id, testUserId);

      expect(result.description).toBeUndefined();
    });

    test('should get category task count', async () => {
      mockTaskCategoryRepository.setTaskCount(testCategory.id, 7);

      const count = await categoryService.getCategoryTaskCount(testCategory.id, testUserId);

      expect(count).toBe(7);
    });
  });

  describe('isCategoryNameAvailable', () => {
    beforeEach(async () => {
      await categoryService.createCategory(testUserId, {
        name: 'Existing Category',
        color: '#FF0000'
      });
    });

    test('should return true for available name', async () => {
      const result = await categoryService.isCategoryNameAvailable(testUserId, 'New Category');

      expect(result).toBe(true);
    });

    test('should return false for existing name', async () => {
      const result = await categoryService.isCategoryNameAvailable(testUserId, 'Existing Category');

      expect(result).toBe(false);
    });

    test('should return true when excluding current category', async () => {
      const category = await categoryService.createCategory(testUserId, {
        name: 'Another Category',
        color: '#00FF00'
      });

      const result = await categoryService.isCategoryNameAvailable(
        testUserId,
        'Another Category',
        category.id
      );

      expect(result).toBe(true);
    });
  });

  describe('getCategoriesByColor', () => {
    beforeEach(async () => {
      await categoryService.createCategory(testUserId, {
        name: 'Red Category 1',
        color: '#FF0000'
      });

      await categoryService.createCategory(testUserId, {
        name: 'Red Category 2',
        color: '#FF0000'
      });

      await categoryService.createCategory(testUserId, {
        name: 'Blue Category',
        color: '#0000FF'
      });
    });

    test('should return categories with specified color', async () => {
      const result = await categoryService.getCategoriesByColor(testUserId, '#FF0000');

      expect(result).toHaveLength(2);
      expect(result.every(c => c.color === '#FF0000')).toBe(true);
    });

    test('should return empty array for non-existent color', async () => {
      const result = await categoryService.getCategoriesByColor(testUserId, '#FFFFFF');

      expect(result).toHaveLength(0);
    });
  });

  describe('getEmptyCategories', () => {
    let emptyCategory1: Category;
    let emptyCategory2: Category;
    let categoryWithTasks: Category;

    beforeEach(async () => {
      emptyCategory1 = await categoryService.createCategory(testUserId, {
        name: 'Empty 1',
        color: '#FF0000'
      });

      emptyCategory2 = await categoryService.createCategory(testUserId, {
        name: 'Empty 2',
        color: '#00FF00'
      });

      categoryWithTasks = await categoryService.createCategory(testUserId, {
        name: 'With Tasks',
        color: '#0000FF'
      });

      // Set task counts
      mockTaskCategoryRepository.setTaskCount(emptyCategory1.id, 0);
      mockTaskCategoryRepository.setTaskCount(emptyCategory2.id, 0);
      mockTaskCategoryRepository.setTaskCount(categoryWithTasks.id, 5);
    });

    test('should return only empty categories', async () => {
      const result = await categoryService.getEmptyCategories(testUserId);

      expect(result).toHaveLength(2);
      expect(result.map(c => c.name)).toContain('Empty 1');
      expect(result.map(c => c.name)).toContain('Empty 2');
      expect(result.map(c => c.name)).not.toContain('With Tasks');
    });
  });

  describe('getPopularCategories', () => {
    beforeEach(async () => {
      const cat1 = await categoryService.createCategory(testUserId, {
        name: 'Most Popular',
        color: '#FF0000'
      });

      const cat2 = await categoryService.createCategory(testUserId, {
        name: 'Medium Popular',
        color: '#00FF00'
      });

      const cat3 = await categoryService.createCategory(testUserId, {
        name: 'Least Popular',
        color: '#0000FF'
      });

      // Set task counts
      mockTaskCategoryRepository.setTaskCount(cat1.id, 10);
      mockTaskCategoryRepository.setTaskCount(cat2.id, 5);
      mockTaskCategoryRepository.setTaskCount(cat3.id, 1);
    });

    test('should return categories sorted by task count', async () => {
      const result = await categoryService.getPopularCategories(testUserId, 3);

      expect(result).toHaveLength(3);
      expect(result[0].category.name).toBe('Most Popular');
      expect(result[0].taskCount).toBe(10);
      expect(result[1].category.name).toBe('Medium Popular');
      expect(result[1].taskCount).toBe(5);
      expect(result[2].category.name).toBe('Least Popular');
      expect(result[2].taskCount).toBe(1);
    });

    test('should respect limit parameter', async () => {
      const result = await categoryService.getPopularCategories(testUserId, 2);

      expect(result).toHaveLength(2);
      expect(result[0].category.name).toBe('Most Popular');
      expect(result[1].category.name).toBe('Medium Popular');
    });
  });

  describe('deleteEmptyCategories', () => {
    beforeEach(async () => {
      const empty1 = await categoryService.createCategory(testUserId, {
        name: 'Empty 1',
        color: '#FF0000'
      });

      const empty2 = await categoryService.createCategory(testUserId, {
        name: 'Empty 2',
        color: '#00FF00'
      });

      const withTasks = await categoryService.createCategory(testUserId, {
        name: 'With Tasks',
        color: '#0000FF'
      });

      // Set task counts
      mockTaskCategoryRepository.setTaskCount(empty1.id, 0);
      mockTaskCategoryRepository.setTaskCount(empty2.id, 0);
      mockTaskCategoryRepository.setTaskCount(withTasks.id, 3);
    });

    test('should delete only empty categories', async () => {
      const deletedCount = await categoryService.deleteEmptyCategories(testUserId);

      expect(deletedCount).toBe(2);

      const remainingCategories = await categoryService.getCategoriesByUser(testUserId);
      expect(remainingCategories).toHaveLength(1);
      expect(remainingCategories[0].name).toBe('With Tasks');
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should throw error when getting non-existent category', async () => {
      await expect(categoryService.getCategoryById('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when updating non-existent category', async () => {
      const updateRequest: UpdateCategoryRequest = {
        name: 'Updated Name'
      };

      await expect(categoryService.updateCategory('nonexistent', testUserId, updateRequest))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when deleting non-existent category', async () => {
      await expect(categoryService.deleteCategory('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when getting task count for non-existent category', async () => {
      await expect(categoryService.getCategoryTaskCount('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when getting tasks for non-existent category', async () => {
      await expect(categoryService.getTasksByCategory('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });
  });
});
