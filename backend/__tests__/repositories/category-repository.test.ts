/**
 * Category Repository Test Suite
 * 
 * Comprehensive tests for category repository implementation
 * Tests category-specific operations, color validation, task relationships, and search functionality
 * 
 * @fileoverview Test suite for CategoryRepository class
 * @version 1.0.0
 * @since 2025-02-01
 */

import { Category, TaskStatus } from '@prisma/client';
import { CategoryRepository, CreateCategoryData, UpdateCategoryData, CategorySearchFilters } from '../../src/repositories/category-repository';
import { ValidationError, NotFoundError } from '../../src/utils/error-handler';

// Mock dependencies
jest.mock('../../src/utils/database-connection');
jest.mock('../../src/utils/logger');

// Test data
const mockCategory: Category = {
  id: 'cat-123',
  name: 'Work',
  color: '#FF0000',
  description: 'Work related tasks',
  createdAt: new Date('2025-01-01T00:00:00Z')
};

const mockPersonalCategory: Category = {
  id: 'cat-456',
  name: 'Personal',
  color: '#00FF00',
  description: 'Personal tasks',
  createdAt: new Date('2025-01-02T00:00:00Z')
};

const mockProjectCategory: Category = {
  id: 'cat-789',
  name: 'Project',
  color: '#0000FF',
  description: null,
  createdAt: new Date('2025-01-03T00:00:00Z')
};

const mockCategoryWithTasks = {
  ...mockCategory,
  taskCategories: [
    {
      taskId: 'task-1',
      task: {
        id: 'task-1',
        title: 'Task 1',
        status: TaskStatus.pending,
        priority: 'high',
        dueDate: new Date('2025-02-01T00:00:00Z')
      }
    },
    {
      taskId: 'task-2',
      task: {
        id: 'task-2',
        title: 'Task 2',
        status: TaskStatus.completed,
        priority: 'medium',
        dueDate: null
      }
    }
  ]
};

describe('CategoryRepository', () => {
  let repository: CategoryRepository;
  let mockPrisma: any;
  let mockCategoryModel: any;
  let mockTaskCategoryModel: any;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock Prisma category model
    mockCategoryModel = {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn()
    };

    // Mock Prisma taskCategory model
    mockTaskCategoryModel = {
      count: jest.fn()
    };

    mockPrisma = {
      category: mockCategoryModel,
      taskCategory: mockTaskCategoryModel
    };

    // Mock getPrismaClient
    (require('../../src/utils/database-connection').getPrismaClient as jest.Mock).mockReturnValue(mockPrisma);

    // Create repository instance
    repository = new CategoryRepository();
  });

  describe('Constructor and Configuration', () => {
    test('should initialize with category-specific configuration', () => {
      const config = repository.getConfig();

      expect(config.enableCaching).toBe(true);
      expect(config.cacheTimeout).toBe(600);
      expect(config.enableLogging).toBe(true);
      expect(config.enableMetrics).toBe(true);
    });

    test('should return correct model name', () => {
      expect(repository.getModelName()).toBe('Category');
    });
  });

  describe('Find by Name', () => {
    test('should find category by name successfully', () => {
      mockCategoryModel.findUnique.mockResolvedValue(mockCategory);

      const result = repository.findByName('Work');

      expect(mockCategoryModel.findUnique).toHaveBeenCalledWith({
        where: { name: 'Work' }
      });
      return expect(result).resolves.toEqual(mockCategory);
    });

    test('should return null when category not found by name', () => {
      mockCategoryModel.findUnique.mockResolvedValue(null);

      const result = repository.findByName('NonExistent');

      expect(result).resolves.toBeNull();
    });

    test('should trim whitespace from name', () => {
      mockCategoryModel.findUnique.mockResolvedValue(mockCategory);

      repository.findByName('  Work  ');

      expect(mockCategoryModel.findUnique).toHaveBeenCalledWith({
        where: { name: 'Work' }
      });
    });

    test('should throw ValidationError for empty name', () => {
      return expect(repository.findByName('')).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for whitespace-only name', () => {
      return expect(repository.findByName('   ')).rejects.toThrow(ValidationError);
    });
  });

  describe('Find by Color', () => {
    test('should find categories by color successfully', () => {
      const redCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(redCategories);

      const result = repository.findByColor('#FF0000');

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: { color: '#FF0000' },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(redCategories);
    });

    test('should normalize color to uppercase', () => {
      mockCategoryModel.findMany.mockResolvedValue([mockCategory]);

      repository.findByColor('#ff0000');

      const expectedCall = mockCategoryModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.color).toBe('#FF0000');
    });

    test('should trim whitespace from color', () => {
      mockCategoryModel.findMany.mockResolvedValue([mockCategory]);

      repository.findByColor('  #FF0000  ');

      const expectedCall = mockCategoryModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.color).toBe('#FF0000');
    });

    test('should throw ValidationError for empty color', () => {
      return expect(repository.findByColor('')).rejects.toThrow(ValidationError);
    });

    test('should throw ValidationError for invalid color format', async () => {
      await expect(repository.findByColor('red')).rejects.toThrow(ValidationError);
      await expect(repository.findByColor('#FF00')).rejects.toThrow(ValidationError);
      await expect(repository.findByColor('#GGGGGG')).rejects.toThrow(ValidationError);
    });

    test('should find categories with additional filters', () => {
      mockCategoryModel.findMany.mockResolvedValue([mockCategory]);

      const options = {
        where: { name: { contains: 'Work' } },
        take: 5
      };

      repository.findByColor('#FF0000', options);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: { color: '#FF0000', name: { contains: 'Work' } },
        orderBy: undefined,
        skip: undefined,
        take: 5,
        include: undefined,
        select: undefined
      });
    });
  });

  describe('Color Validation', () => {
    test('should validate correct hex color formats', () => {
      expect(repository.validateColorFormat('#FF0000')).toBe(true);
      expect(repository.validateColorFormat('#00FF00')).toBe(true);
      expect(repository.validateColorFormat('#0000FF')).toBe(true);
      expect(repository.validateColorFormat('#123456')).toBe(true);
      expect(repository.validateColorFormat('#ABCDEF')).toBe(true);
      expect(repository.validateColorFormat('#abcdef')).toBe(true);
    });

    test('should reject invalid color formats', () => {
      expect(repository.validateColorFormat('')).toBe(false);
      expect(repository.validateColorFormat('red')).toBe(false);
      expect(repository.validateColorFormat('#FF00')).toBe(false);
      expect(repository.validateColorFormat('#FF0000FF')).toBe(false);
      expect(repository.validateColorFormat('FF0000')).toBe(false);
      expect(repository.validateColorFormat('#GGGGGG')).toBe(false);
      expect(repository.validateColorFormat(null as any)).toBe(false);
      expect(repository.validateColorFormat(undefined as any)).toBe(false);
      expect(repository.validateColorFormat(123 as any)).toBe(false);
    });

    test('should handle whitespace in color validation', () => {
      expect(repository.validateColorFormat('  #FF0000  ')).toBe(true);
      expect(repository.validateColorFormat('  #FF00  ')).toBe(false);
    });
  });

  describe('Search Categories', () => {
    test('should search categories by name filter', () => {
      const filteredCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const filters: CategorySearchFilters = {
        name: 'Work'
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'Work',
            mode: 'insensitive'
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should search categories by color filter', () => {
      const filteredCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const filters: CategorySearchFilters = {
        color: '#FF0000'
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          color: '#FF0000'
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should search categories by description filter', () => {
      const filteredCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const filters: CategorySearchFilters = {
        description: 'work'
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          description: {
            contains: 'work',
            mode: 'insensitive'
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should search categories with date range filters', () => {
      const filteredCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const createdAfter = new Date('2025-01-01');
      const createdBefore = new Date('2025-01-31');

      const filters: CategorySearchFilters = {
        createdAfter,
        createdBefore
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          createdAt: {
            gte: createdAfter,
            lte: createdBefore
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should search categories with hasActiveTasks filter (true)', () => {
      const filteredCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const filters: CategorySearchFilters = {
        hasActiveTasks: true
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          taskCategories: {
            some: {
              task: {
                status: {
                  not: TaskStatus.completed
                }
              }
            }
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should search categories with hasActiveTasks filter (false)', () => {
      const filteredCategories = [mockProjectCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const filters: CategorySearchFilters = {
        hasActiveTasks: false
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          taskCategories: {
            none: {
              task: {
                status: {
                  not: TaskStatus.completed
                }
              }
            }
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should search categories with combined filters', () => {
      const filteredCategories = [mockCategory];
      mockCategoryModel.findMany.mockResolvedValue(filteredCategories);

      const filters: CategorySearchFilters = {
        name: 'Work',
        color: '#FF0000',
        description: 'work',
        hasActiveTasks: true
      };

      const result = repository.searchCategories(filters);

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'Work',
            mode: 'insensitive'
          },
          color: '#FF0000',
          description: {
            contains: 'work',
            mode: 'insensitive'
          },
          taskCategories: {
            some: {
              task: {
                status: {
                  not: TaskStatus.completed
                }
              }
            }
          }
        },
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: undefined,
        select: undefined
      });
      return expect(result).resolves.toEqual(filteredCategories);
    });

    test('should throw ValidationError for invalid color in search filters', () => {
      const filters: CategorySearchFilters = {
        color: 'invalid-color'
      };

      return expect(repository.searchCategories(filters)).rejects.toThrow(ValidationError);
    });
  });

  describe('Categories with Task Count', () => {
    test('should find categories with task count successfully', () => {
      const categoriesWithTaskCategories = [mockCategoryWithTasks];
      mockCategoryModel.findMany.mockResolvedValue(categoriesWithTaskCategories);

      const result = repository.findCategoriesWithTaskCount();

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: {
          taskCategories: {
            include: {
              task: {
                select: {
                  id: true,
                  status: true
                }
              }
            }
          }
        }
      });

      return result.then(categories => {
        expect(categories).toHaveLength(1);
        expect(categories[0].taskCount).toBe(2);
        expect(categories[0].activeTaskCount).toBe(1); // Only pending task
      });
    });

    test('should calculate task counts correctly', () => {
      const categoryWithMixedTasks = {
        ...mockCategory,
        taskCategories: [
          { task: { id: 'task-1', status: TaskStatus.pending } },
          { task: { id: 'task-2', status: TaskStatus.in_progress } },
          { task: { id: 'task-3', status: TaskStatus.completed } },
          { task: { id: 'task-4', status: TaskStatus.completed } }
        ]
      };

      mockCategoryModel.findMany.mockResolvedValue([categoryWithMixedTasks]);

      return repository.findCategoriesWithTaskCount().then(categories => {
        expect(categories[0].taskCount).toBe(4);
        expect(categories[0].activeTaskCount).toBe(2); // pending + in_progress
      });
    });

    test('should handle categories with no tasks', () => {
      const categoryWithNoTasks = {
        ...mockCategory,
        taskCategories: []
      };

      mockCategoryModel.findMany.mockResolvedValue([categoryWithNoTasks]);

      return repository.findCategoriesWithTaskCount().then(categories => {
        expect(categories[0].taskCount).toBe(0);
        expect(categories[0].activeTaskCount).toBe(0);
      });
    });
  });

  describe('Categories by Task ID', () => {
    test('should find categories by task ID successfully', () => {
      const categories = [mockCategory, mockPersonalCategory];
      mockCategoryModel.findMany.mockResolvedValue(categories);

      const result = repository.findCategoriesByTaskId('task-123');

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: {
          taskCategories: {
            some: {
              taskId: 'task-123'
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });
      return expect(result).resolves.toEqual(categories);
    });

    test('should return empty array when no categories found for task', () => {
      mockCategoryModel.findMany.mockResolvedValue([]);

      const result = repository.findCategoriesByTaskId('nonexistent-task');

      return expect(result).resolves.toEqual([]);
    });

    test('should trim whitespace from task ID', () => {
      mockCategoryModel.findMany.mockResolvedValue([mockCategory]);

      repository.findCategoriesByTaskId('  task-123  ');

      const expectedCall = mockCategoryModel.findMany.mock.calls[0][0];
      expect(expectedCall.where.taskCategories.some.taskId).toBe('task-123');
    });

    test('should throw ValidationError for empty task ID', () => {
      return expect(repository.findCategoriesByTaskId('')).rejects.toThrow(ValidationError);
    });
  });

  describe('Categories with Tasks', () => {
    test('should find categories with their tasks successfully', () => {
      const categoriesWithTasks = [mockCategoryWithTasks];
      mockCategoryModel.findMany.mockResolvedValue(categoriesWithTasks);

      const result = repository.findCategoriesWithTasks();

      expect(mockCategoryModel.findMany).toHaveBeenCalledWith({
        where: undefined,
        orderBy: undefined,
        skip: undefined,
        take: undefined,
        include: {
          taskCategories: {
            include: {
              task: {
                select: {
                  id: true,
                  title: true,
                  status: true,
                  priority: true,
                  dueDate: true
                }
              }
            },
            orderBy: {
              task: {
                createdAt: 'desc'
              }
            }
          }
        }
      });
      return expect(result).resolves.toEqual(categoriesWithTasks);
    });
  });

  describe('Popular Categories', () => {
    test('should find popular categories successfully', () => {
      const categoriesWithCount = [
        { ...mockCategory, taskCount: 5, activeTaskCount: 3 },
        { ...mockPersonalCategory, taskCount: 3, activeTaskCount: 2 },
        { ...mockProjectCategory, taskCount: 1, activeTaskCount: 1 }
      ];

      // Mock the findCategoriesWithTaskCount method
      jest.spyOn(repository, 'findCategoriesWithTaskCount').mockResolvedValue(categoriesWithCount);

      const result = repository.findPopularCategories(2);

      return result.then(popular => {
        expect(popular).toHaveLength(3); // All categories returned, but sorted
        expect(popular[0].taskCount).toBe(5); // Most popular first
        expect(popular[1].taskCount).toBe(3);
        expect(popular[2].taskCount).toBe(1);
      });
    });

    test('should use default limit of 10', () => {
      jest.spyOn(repository, 'findCategoriesWithTaskCount').mockResolvedValue([]);

      repository.findPopularCategories();

      expect(repository.findCategoriesWithTaskCount).toHaveBeenCalledWith({
        take: 10
      });
    });

    test('should throw ValidationError for invalid limit', async () => {
      await expect(repository.findPopularCategories(0)).rejects.toThrow(ValidationError);
      await expect(repository.findPopularCategories(-1)).rejects.toThrow(ValidationError);
    });
  });

  describe('Count Operations', () => {
    test('should count categories with tasks', () => {
      mockCategoryModel.count.mockResolvedValue(5);

      const result = repository.countCategoriesWithTasks();

      expect(mockCategoryModel.count).toHaveBeenCalledWith({
        where: {
          taskCategories: {
            some: {}
          }
        }
      });
      return expect(result).resolves.toBe(5);
    });

    test('should count tasks by category', () => {
      mockTaskCategoryModel.count.mockResolvedValue(3);

      const result = repository.countTasksByCategory('cat-123');

      expect(mockTaskCategoryModel.count).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-123'
        }
      });
      return expect(result).resolves.toBe(3);
    });

    test('should count active tasks by category', () => {
      mockTaskCategoryModel.count.mockResolvedValue(2);

      const result = repository.countActiveTasksByCategory('cat-123');

      expect(mockTaskCategoryModel.count).toHaveBeenCalledWith({
        where: {
          categoryId: 'cat-123',
          task: {
            status: {
              not: TaskStatus.completed
            }
          }
        }
      });
      return expect(result).resolves.toBe(2);
    });

    test('should throw ValidationError for empty category ID in count operations', async () => {
      await expect(repository.countTasksByCategory('')).rejects.toThrow(ValidationError);
      await expect(repository.countActiveTasksByCategory('')).rejects.toThrow(ValidationError);
    });
  });

  describe('Existence Check', () => {
    test('should return true when category exists by name', () => {
      jest.spyOn(repository, 'findByName').mockResolvedValue(mockCategory);

      const result = repository.existsByName('Work');

      return expect(result).resolves.toBe(true);
    });

    test('should return false when category does not exist by name', () => {
      jest.spyOn(repository, 'findByName').mockResolvedValue(null);

      const result = repository.existsByName('NonExistent');

      return expect(result).resolves.toBe(false);
    });

    test('should throw ValidationError for empty name in existence check', () => {
      return expect(repository.existsByName('')).rejects.toThrow(ValidationError);
    });
  });

  describe('Data Preparation and Validation', () => {
    test('should create category with valid data', () => {
      const createData: CreateCategoryData = {
        name: 'Work',
        color: '#FF0000',
        description: 'Work related tasks'
      };

      const expectedCategory = {
        ...mockCategory,
        name: 'Work',
        color: '#FF0000'
      };

      mockCategoryModel.create.mockResolvedValue(expectedCategory);

      const result = repository.create(createData);

      expect(mockCategoryModel.create).toHaveBeenCalledWith({
        data: {
          name: 'Work',
          color: '#FF0000',
          description: 'Work related tasks'
        }
      });
      return expect(result).resolves.toEqual(expectedCategory);
    });

    test('should create category with minimal data', () => {
      const createData: CreateCategoryData = {
        name: 'Minimal',
        color: '#00FF00'
      };

      mockCategoryModel.create.mockResolvedValue(mockPersonalCategory);

      repository.create(createData);

      expect(mockCategoryModel.create).toHaveBeenCalledWith({
        data: {
          name: 'Minimal',
          color: '#00FF00',
          description: null
        }
      });
    });

    test('should trim whitespace and normalize color in create data', () => {
      const createData: CreateCategoryData = {
        name: '  Work  ',
        color: '  #ff0000  ',
        description: '  Work description  '
      };

      mockCategoryModel.create.mockResolvedValue(mockCategory);

      repository.create(createData);

      const expectedCall = mockCategoryModel.create.mock.calls[0][0];
      expect(expectedCall.data.name).toBe('Work');
      expect(expectedCall.data.color).toBe('#FF0000');
      expect(expectedCall.data.description).toBe('Work description');
    });

    test('should throw ValidationError for invalid create data', async () => {
      // Empty name
      await expect(repository.create({
        name: '',
        color: '#FF0000'
      })).rejects.toThrow(ValidationError);

      // Name too long
      await expect(repository.create({
        name: 'a'.repeat(51),
        color: '#FF0000'
      })).rejects.toThrow(ValidationError);

      // Empty color
      await expect(repository.create({
        name: 'Work',
        color: ''
      })).rejects.toThrow(ValidationError);

      // Invalid color format
      await expect(repository.create({
        name: 'Work',
        color: 'red'
      })).rejects.toThrow(ValidationError);

      // Description too long
      await expect(repository.create({
        name: 'Work',
        color: '#FF0000',
        description: 'a'.repeat(201)
      })).rejects.toThrow(ValidationError);
    });

    test('should update category with valid data', () => {
      const updateData: UpdateCategoryData = {
        name: '  Updated Work  ',
        color: '  #00ff00  ',
        description: '  Updated description  '
      };

      const updatedCategory = {
        ...mockCategory,
        name: 'Updated Work',
        color: '#00FF00',
        description: 'Updated description'
      };

      mockCategoryModel.findUnique.mockResolvedValue(mockCategory); // exists check
      mockCategoryModel.update.mockResolvedValue(updatedCategory);

      const result = repository.update('cat-123', updateData);

      return result.then(category => {
        const expectedCall = mockCategoryModel.update.mock.calls[0][0];
        expect(expectedCall.data.name).toBe('Updated Work');
        expect(expectedCall.data.color).toBe('#00FF00');
        expect(expectedCall.data.description).toBe('Updated description');
        expect(category).toEqual(updatedCategory);
      });
    });

    test('should throw ValidationError for invalid update data', async () => {
      mockCategoryModel.findUnique.mockResolvedValue(mockCategory); // exists check

      // Empty name
      await expect(repository.update('cat-123', {
        name: ''
      })).rejects.toThrow(ValidationError);

      // Name too long
      await expect(repository.update('cat-123', {
        name: 'a'.repeat(51)
      })).rejects.toThrow(ValidationError);

      // Empty color
      await expect(repository.update('cat-123', {
        color: ''
      })).rejects.toThrow(ValidationError);

      // Invalid color format
      await expect(repository.update('cat-123', {
        color: 'blue'
      })).rejects.toThrow(ValidationError);

      // Description too long
      await expect(repository.update('cat-123', {
        description: 'a'.repeat(201)
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('Error Handling', () => {
    test('should handle database errors in findByName', () => {
      const dbError = new Error('Database connection failed');
      mockCategoryModel.findUnique.mockRejectedValue(dbError);

      return expect(repository.findByName('Work')).rejects.toThrow();
    });

    test('should handle database errors in searchCategories', () => {
      const dbError = new Error('Database connection failed');
      mockCategoryModel.findMany.mockRejectedValue(dbError);

      const filters: CategorySearchFilters = { name: 'Work' };
      return expect(repository.searchCategories(filters)).rejects.toThrow();
    });

    test('should handle database errors in count operations', () => {
      const dbError = new Error('Database connection failed');
      mockCategoryModel.count.mockRejectedValue(dbError);

      return expect(repository.countCategoriesWithTasks()).rejects.toThrow();
    });

    test('should handle database errors in task count operations', async () => {
      const dbError = new Error('Database connection failed');
      mockTaskCategoryModel.count.mockRejectedValue(dbError);

      await expect(repository.countTasksByCategory('cat-123')).rejects.toThrow();
      await expect(repository.countActiveTasksByCategory('cat-123')).rejects.toThrow();
    });
  });
});
