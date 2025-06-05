/**
 * ===================================
 * Category Entity Test Suite
 * ===================================
 * Purpose: Comprehensive tests for Category entity class
 * Features:
 * - Category creation and validation
 * - Color management and validation
 * - Description management
 * - Business logic testing
 * - Search and display functionality
 * - Error handling and edge cases
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  Category,
  CategoryCreationData,
  CategoryUpdateData,
  CategorySummaryData
} from '../../../src/domain/entities/category.entity';
import { EntityValidationError } from '../../../src/domain/entities/base.entity';

describe('Category Entity', () => {
  let validCategoryData: CategoryCreationData;

  beforeEach(() => {
    validCategoryData = {
      name: 'Work',
      color: '#FF5733',
      description: 'Work-related tasks and projects'
    };
  });

  // ===================================
  // Category Creation Tests
  // ===================================

  describe('Category Creation', () => {
    test('should create category with valid data', () => {
      const category = new Category(validCategoryData);

      expect(category.id).toBeDefined();
      expect(category.name).toBe('Work');
      expect(category.color).toBe('#FF5733');
      expect(category.description).toBe('Work-related tasks and projects');
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.updatedAt).toBeInstanceOf(Date);
    });

    test('should create category without description', () => {
      const categoryData = {
        name: 'Personal',
        color: '#33FF57'
      };

      const category = new Category(categoryData);

      expect(category.name).toBe('Personal');
      expect(category.color).toBe('#33FF57');
      expect(category.description).toBeUndefined();
      expect(category.hasDescription()).toBe(false);
    });

    test('should create category with uppercase hex color', () => {
      const categoryData = {
        ...validCategoryData,
        color: '#ABCDEF'
      };

      const category = new Category(categoryData);

      expect(category.color).toBe('#ABCDEF');
    });

    test('should create category with lowercase hex color', () => {
      const categoryData = {
        ...validCategoryData,
        color: '#abcdef'
      };

      const category = new Category(categoryData);

      expect(category.color).toBe('#abcdef');
    });
  });

  // ===================================
  // Validation Tests
  // ===================================

  describe('Validation', () => {
    test('should throw error for empty name', () => {
      const invalidData = {
        ...validCategoryData,
        name: ''
      };

      expect(() => new Category(invalidData)).toThrow(EntityValidationError);
      expect(() => new Category(invalidData)).toThrow('Category name is required');
    });

    test('should throw error for missing name', () => {
      const invalidData = {
        ...validCategoryData,
        name: undefined as any
      };

      expect(() => new Category(invalidData)).toThrow(EntityValidationError);
      expect(() => new Category(invalidData)).toThrow('Category name is required');
    });

    test('should throw error for long name', () => {
      const invalidData = {
        ...validCategoryData,
        name: 'a'.repeat(51)
      };

      expect(() => new Category(invalidData)).toThrow(EntityValidationError);
      expect(() => new Category(invalidData)).toThrow('Category name must be 50 characters or less');
    });

    test('should throw error for missing color', () => {
      const invalidData = {
        ...validCategoryData,
        color: undefined as any
      };

      expect(() => new Category(invalidData)).toThrow(EntityValidationError);
      expect(() => new Category(invalidData)).toThrow('Category color is required');
    });

    test('should throw error for invalid color format', () => {
      const invalidColors = [
        'FF5733',      // Missing #
        '#FF57',       // Too short
        '#FF5733AA',   // Too long
        '#GG5733',     // Invalid hex characters
        'red',         // Color name
        '#ff57zz'      // Invalid characters
      ];

      invalidColors.forEach(color => {
        const invalidData = {
          ...validCategoryData,
          color
        };

        expect(() => new Category(invalidData)).toThrow(EntityValidationError);
        expect(() => new Category(invalidData)).toThrow('Invalid color format. Expected hex format (#RRGGBB)');
      });
    });

    test('should throw error for empty color', () => {
      const invalidData = {
        ...validCategoryData,
        color: ''
      };

      expect(() => new Category(invalidData)).toThrow(EntityValidationError);
      expect(() => new Category(invalidData)).toThrow('Category color is required');
    });

    test('should throw error for long description', () => {
      const invalidData = {
        ...validCategoryData,
        description: 'a'.repeat(201)
      };

      expect(() => new Category(invalidData)).toThrow(EntityValidationError);
      expect(() => new Category(invalidData)).toThrow('Category description must be 200 characters or less');
    });

    test('should accept valid hex colors', () => {
      const validColors = [
        '#000000',
        '#FFFFFF',
        '#FF5733',
        '#abcdef',
        '#123456',
        '#ABCDEF'
      ];

      validColors.forEach(color => {
        const categoryData = {
          ...validCategoryData,
          color
        };

        expect(() => new Category(categoryData)).not.toThrow();
      });
    });
  });

  // ===================================
  // Color Management Tests
  // ===================================

  describe('Color Management', () => {
    test('should get RGB values from hex color', () => {
      const category = new Category({
        ...validCategoryData,
        color: '#FF5733'
      });

      const rgb = category.getColorRGB();

      expect(rgb).toEqual({ r: 255, g: 87, b: 51 });
    });

    test('should identify dark colors correctly', () => {
      const darkCategory = new Category({
        ...validCategoryData,
        color: '#333333'
      });

      const lightCategory = new Category({
        ...validCategoryData,
        color: '#CCCCCC'
      });

      expect(darkCategory.isDarkColor()).toBe(true);
      expect(lightCategory.isDarkColor()).toBe(false);
    });

    test('should recommend appropriate text color', () => {
      const darkCategory = new Category({
        ...validCategoryData,
        color: '#000000'
      });

      const lightCategory = new Category({
        ...validCategoryData,
        color: '#FFFFFF'
      });

      expect(darkCategory.getRecommendedTextColor()).toBe('#FFFFFF');
      expect(lightCategory.getRecommendedTextColor()).toBe('#000000');
    });

    test('should update color successfully', () => {
      const category = new Category(validCategoryData);
      const newColor = '#00FF00';

      category.updateColor(newColor);

      expect(category.color).toBe(newColor);
    });

    test('should throw error when updating to invalid color', () => {
      const category = new Category(validCategoryData);

      expect(() => category.updateColor('invalid')).toThrow(EntityValidationError);
      expect(() => category.updateColor('invalid')).toThrow('Invalid color format');
    });
  });

  // ===================================
  // Description Management Tests
  // ===================================

  describe('Description Management', () => {
    test('should identify category with description', () => {
      const categoryWithDescription = new Category(validCategoryData);
      const categoryWithoutDescription = new Category({
        name: 'Test',
        color: '#FF0000'
      });

      expect(categoryWithDescription.hasDescription()).toBe(true);
      expect(categoryWithoutDescription.hasDescription()).toBe(false);
    });

    test('should identify empty description as no description', () => {
      const categoryWithEmptyDescription = new Category({
        ...validCategoryData,
        description: '   '
      });

      expect(categoryWithEmptyDescription.hasDescription()).toBe(false);
    });

    test('should update description successfully', () => {
      const category = new Category(validCategoryData);
      const newDescription = 'Updated description';

      category.updateDescription(newDescription);

      expect(category.description).toBe(newDescription);
      expect(category.hasDescription()).toBe(true);
    });

    test('should remove description successfully', () => {
      const category = new Category(validCategoryData);

      category.removeDescription();

      expect(category.description).toBeUndefined();
      expect(category.hasDescription()).toBe(false);
    });
  });

  // ===================================
  // Category Update Tests
  // ===================================

  describe('Category Update', () => {
    test('should update category successfully', () => {
      const category = new Category(validCategoryData);
      const updateData: CategoryUpdateData = {
        name: 'Updated Work',
        color: '#00FF00',
        description: 'Updated description'
      };

      category.updateCategory(updateData);

      expect(category.name).toBe('Updated Work');
      expect(category.color).toBe('#00FF00');
      expect(category.description).toBe('Updated description');
    });

    test('should rollback changes on validation failure', () => {
      const category = new Category(validCategoryData);
      const originalName = category.name;
      const originalColor = category.color;

      const invalidUpdateData: CategoryUpdateData = {
        name: '', // Invalid empty name
        color: 'invalid' // Invalid color
      };

      expect(() => category.updateCategory(invalidUpdateData)).toThrow(EntityValidationError);
      expect(category.name).toBe(originalName);
      expect(category.color).toBe(originalColor);
    });

    test('should update only specified fields', () => {
      const category = new Category(validCategoryData);
      const originalColor = category.color;
      const originalDescription = category.description;

      category.updateCategory({ name: 'New Name Only' });

      expect(category.name).toBe('New Name Only');
      expect(category.color).toBe(originalColor);
      expect(category.description).toBe(originalDescription);
    });

    test('should update name individually', () => {
      const category = new Category(validCategoryData);

      category.updateName('New Name');

      expect(category.name).toBe('New Name');
    });
  });

  // ===================================
  // Display and Search Tests
  // ===================================

  describe('Display and Search', () => {
    test('should get display name with color', () => {
      const category = new Category(validCategoryData);
      const displayName = category.getDisplayName();

      expect(displayName).toBe('Work (#FF5733)');
    });

    test('should match search term in name', () => {
      const category = new Category(validCategoryData);

      expect(category.matchesSearch('work')).toBe(true);
      expect(category.matchesSearch('WORK')).toBe(true);
      expect(category.matchesSearch('wor')).toBe(true);
      expect(category.matchesSearch('personal')).toBe(false);
    });

    test('should match search term in description', () => {
      const category = new Category(validCategoryData);

      expect(category.matchesSearch('tasks')).toBe(true);
      expect(category.matchesSearch('projects')).toBe(true);
      expect(category.matchesSearch('RELATED')).toBe(true);
      expect(category.matchesSearch('shopping')).toBe(false);
    });

    test('should match empty search term', () => {
      const category = new Category(validCategoryData);

      expect(category.matchesSearch('')).toBe(true);
      expect(category.matchesSearch('   ')).toBe(true);
    });

    test('should handle search with no description', () => {
      const category = new Category({
        name: 'Personal',
        color: '#FF0000'
      });

      expect(category.matchesSearch('personal')).toBe(true);
      expect(category.matchesSearch('work')).toBe(false);
    });
  });

  // ===================================
  // Category Summary Tests
  // ===================================

  describe('Category Summary', () => {
    test('should get category summary', () => {
      const category = new Category(validCategoryData);
      const summary = category.getSummary();

      expect(summary).toEqual({
        id: category.id,
        name: 'Work',
        color: '#FF5733',
        description: 'Work-related tasks and projects',
        createdAt: category.createdAt
      });
    });

    test('should include undefined description in summary', () => {
      const category = new Category({
        name: 'Personal',
        color: '#FF0000'
      });

      const summary = category.getSummary();

      expect(summary.description).toBeUndefined();
    });
  });

  // ===================================
  // Serialization Tests
  // ===================================

  describe('Serialization', () => {
    test('should serialize to plain object', () => {
      const category = new Category(validCategoryData);
      const plainObject = category.toPlainObject();

      expect(plainObject).toHaveProperty('id');
      expect(plainObject).toHaveProperty('name', 'Work');
      expect(plainObject).toHaveProperty('color', '#FF5733');
      expect(plainObject).toHaveProperty('description', 'Work-related tasks and projects');
      expect(plainObject).toHaveProperty('createdAt');
      expect(plainObject).toHaveProperty('updatedAt');
    });

    test('should serialize to JSON string', () => {
      const category = new Category(validCategoryData);
      const jsonString = category.toJSON();
      const parsedObject = JSON.parse(jsonString);

      expect(parsedObject).toHaveProperty('name', 'Work');
      expect(parsedObject).toHaveProperty('color', '#FF5733');
      expect(parsedObject).toHaveProperty('description', 'Work-related tasks and projects');
    });
  });

  // ===================================
  // Cloning Tests
  // ===================================

  describe('Cloning', () => {
    test('should clone category with same properties', () => {
      const category = new Category(validCategoryData);
      const clonedCategory = category.clone();

      expect(clonedCategory).not.toBe(category);
      expect(clonedCategory.id).toBe(category.id);
      expect(clonedCategory.name).toBe(category.name);
      expect(clonedCategory.color).toBe(category.color);
      expect(clonedCategory.description).toBe(category.description);
      expect(clonedCategory.createdAt).toEqual(category.createdAt);
      expect(clonedCategory.updatedAt).toEqual(category.updatedAt);
    });

    test('should clone category with updated properties', () => {
      const category = new Category(validCategoryData);
      const updates = {
        name: 'Cloned Category',
        color: '#00FF00'
      };

      const clonedCategory = category.clone(updates);

      expect(clonedCategory).not.toBe(category);
      expect(clonedCategory.id).toBe(category.id);
      expect(clonedCategory.name).toBe('Cloned Category');
      expect(clonedCategory.color).toBe('#00FF00');
      expect(clonedCategory.description).toBe(category.description);
    });
  });

  // ===================================
  // Edge Cases and Error Handling
  // ===================================

  describe('Edge Cases', () => {
    test('should handle name with whitespace', () => {
      const categoryData = {
        ...validCategoryData,
        name: '   Valid Name   '
      };

      const category = new Category(categoryData);
      expect(category.name).toBe('   Valid Name   ');
    });

    test('should maintain entity type', () => {
      const category = new Category(validCategoryData);
      expect(category.getEntityType()).toBe('Category');
    });

    test('should handle timestamp updates correctly', async () => {
      const category = new Category(validCategoryData);
      const originalUpdatedAt = category.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      category.updateCategory({ name: 'Updated Name' });

      expect(category.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('should handle RGB conversion for edge colors', () => {
      const blackCategory = new Category({
        ...validCategoryData,
        color: '#000000'
      });

      const whiteCategory = new Category({
        ...validCategoryData,
        color: '#FFFFFF'
      });

      expect(blackCategory.getColorRGB()).toEqual({ r: 0, g: 0, b: 0 });
      expect(whiteCategory.getColorRGB()).toEqual({ r: 255, g: 255, b: 255 });
    });

    test('should handle case-insensitive search correctly', () => {
      const category = new Category({
        name: 'Work Tasks',
        color: '#FF0000',
        description: 'Important Work Items'
      });

      expect(category.matchesSearch('WORK')).toBe(true);
      expect(category.matchesSearch('tasks')).toBe(true);
      expect(category.matchesSearch('IMPORTANT')).toBe(true);
      expect(category.matchesSearch('items')).toBe(true);
    });

    test('should validate description type correctly', () => {
      const category = new Category(validCategoryData);

      expect(() => {
        category.updateDescription(123 as any);
      }).toThrow(EntityValidationError);
      expect(() => {
        category.updateDescription(123 as any);
      }).toThrow('Category description must be a string');
    });

    test('should handle mixed case hex colors', () => {
      const mixedCaseColors = ['#AbCdEf', '#12aBcD', '#FfFfFf'];

      mixedCaseColors.forEach(color => {
        const category = new Category({
          ...validCategoryData,
          color
        });

        expect(category.color).toBe(color);
        expect(() => category.getColorRGB()).not.toThrow();
      });
    });
  });
});
