/**
 * Category Repository Implementation
 * 
 * Category-specific data access operations extending base repository functionality
 * Provides category management, color validation, task relationships, and search features
 * 
 * @fileoverview Category repository class for category data access operations
 * @version 1.0.0
 * @since 2025-02-01
 */

import { Category, TaskStatus, Prisma } from '@prisma/client';
import { BaseRepository, IBaseRepository, FindManyOptions, RepositoryConfig } from './base-repository';
import { NotFoundError, ValidationError } from '@/utils/error-handler';

/**
 * Category creation data interface
 */
export interface CreateCategoryData {
  name: string;
  color: string;
  description?: string;
}

/**
 * Category update data interface
 */
export interface UpdateCategoryData {
  name?: string;
  color?: string;
  description?: string;
}

/**
 * Category search filters interface
 */
export interface CategorySearchFilters {
  name?: string;
  color?: string;
  description?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  hasActiveTasks?: boolean;
}

/**
 * Category with task count interface
 */
export interface CategoryWithTaskCount extends Category {
  taskCount: number;
  activeTaskCount: number;
}

/**
 * Category with tasks interface
 */
export interface CategoryWithTasks extends Category {
  taskCategories: Array<{
    taskId: string;
    task: {
      id: string;
      title: string;
      status: string;
      priority: string;
      dueDate?: Date;
    };
  }>;
}

/**
 * Category repository interface extending base repository
 */
export interface ICategoryRepository extends IBaseRepository<Category, CreateCategoryData, UpdateCategoryData> {
  findByName(name: string): Promise<Category | null>;
  findByColor(color: string, options?: FindManyOptions): Promise<Category[]>;
  searchCategories(filters: CategorySearchFilters, options?: FindManyOptions): Promise<Category[]>;
  findCategoriesWithTaskCount(options?: FindManyOptions): Promise<CategoryWithTaskCount[]>;
  findCategoriesByTaskId(taskId: string): Promise<Category[]>;
  findCategoriesWithTasks(options?: FindManyOptions): Promise<CategoryWithTasks[]>;
  findPopularCategories(limit?: number): Promise<CategoryWithTaskCount[]>;
  countCategoriesWithTasks(): Promise<number>;
  countTasksByCategory(categoryId: string): Promise<number>;
  countActiveTasksByCategory(categoryId: string): Promise<number>;
  existsByName(name: string): Promise<boolean>;
  validateColorFormat(color: string): boolean;
}

/**
 * Category Repository Class
 * 
 * Provides category-specific data access operations
 * Extends BaseRepository with category management and task relationship features
 */
export class CategoryRepository extends BaseRepository<Category, CreateCategoryData, UpdateCategoryData> implements ICategoryRepository {
  
  /**
   * Constructor
   */
  constructor(config?: RepositoryConfig) {
    super('Category', {
      enableCaching: true,
      cacheTimeout: 600, // 10 minutes for category data (longer than tasks)
      enableLogging: true,
      enableMetrics: true,
      ...config
    });
  }

  /**
   * Get Prisma category model
   */
  protected getModel() {
    return this.prisma.category;
  }

  /**
   * Get repository configuration (for testing)
   */
  public override getConfig() {
    return this.config;
  }

  /**
   * Get model name (for testing)
   */
  public override getModelName() {
    return this.modelName;
  }

  /**
   * Find category by name
   */
  public async findByName(name: string): Promise<Category | null> {
    try {
      this.logger.debug('Finding category by name', { name });

      if (!name || name.trim().length === 0) {
        throw new ValidationError('Category name is required');
      }

      const category = await this.getModel().findUnique({
        where: { name: name.trim() }
      });

      if (category) {
        this.logger.debug('Category found by name', { name, categoryId: category.id });
      } else {
        this.logger.debug('Category not found by name', { name });
      }

      return category;
    } catch (error) {
      this.logger.error('Failed to find category by name', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find categories by color
   */
  public async findByColor(color: string, options: FindManyOptions = {}): Promise<Category[]> {
    try {
      this.logger.debug('Finding categories by color', { color, options });

      if (!color || color.trim().length === 0) {
        throw new ValidationError('Color is required');
      }

      if (!this.validateColorFormat(color)) {
        throw new ValidationError('Invalid color format. Expected hex format (#RRGGBB)');
      }

      const whereClause = {
        color: color.trim().toUpperCase(),
        ...options.where
      };

      const categories = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${categories.length} categories with color ${color}`);
      return categories;
    } catch (error) {
      this.logger.error('Failed to find categories by color', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Search categories with filters
   */
  public async searchCategories(
    filters: CategorySearchFilters, 
    options: FindManyOptions = {}
  ): Promise<Category[]> {
    try {
      this.logger.debug('Searching categories with filters', { filters, options });

      const whereClause: Prisma.CategoryWhereInput = {
        ...options.where
      };

      // Apply filters
      if (filters.name) {
        whereClause.name = {
          contains: filters.name,
          mode: 'insensitive'
        };
      }

      if (filters.color) {
        if (!this.validateColorFormat(filters.color)) {
          throw new ValidationError('Invalid color format. Expected hex format (#RRGGBB)');
        }
        whereClause.color = filters.color.toUpperCase();
      }

      if (filters.description) {
        whereClause.description = {
          contains: filters.description,
          mode: 'insensitive'
        };
      }

      if (filters.createdAfter || filters.createdBefore) {
        whereClause.createdAt = {};
        if (filters.createdAfter) {
          whereClause.createdAt.gte = filters.createdAfter;
        }
        if (filters.createdBefore) {
          whereClause.createdAt.lte = filters.createdBefore;
        }
      }

      if (filters.hasActiveTasks === true) {
        whereClause.taskCategories = {
          some: {
            task: {
              status: {
                not: TaskStatus.completed
              }
            }
          }
        };
      } else if (filters.hasActiveTasks === false) {
        whereClause.taskCategories = {
          none: {
            task: {
              status: {
                not: TaskStatus.completed
              }
            }
          }
        };
      }

      const categories = await this.findMany({
        ...options,
        where: whereClause
      });

      this.logger.debug(`Found ${categories.length} categories matching filters`);
      return categories;
    } catch (error) {
      this.logger.error('Failed to search categories', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find categories with task count
   */
  public async findCategoriesWithTaskCount(options: FindManyOptions = {}): Promise<CategoryWithTaskCount[]> {
    try {
      this.logger.debug('Finding categories with task count', { options });

      const queryOptions: any = {
        where: options.where,
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
      };

      if (options.orderBy) queryOptions.orderBy = options.orderBy;
      if (options.skip !== undefined) queryOptions.skip = options.skip;
      if (options.take !== undefined) queryOptions.take = options.take;

      const categories = await this.getModel().findMany(queryOptions);

      const categoriesWithCount: CategoryWithTaskCount[] = categories.map((category: any) => {
        const taskCount = category.taskCategories.length;
        const activeTaskCount = category.taskCategories.filter(
          (tc: any) => tc.task.status !== TaskStatus.completed
        ).length;

        return {
          ...category,
          taskCount,
          activeTaskCount
        };
      });

      this.logger.debug(`Found ${categoriesWithCount.length} categories with task counts`);
      return categoriesWithCount;
    } catch (error) {
      this.logger.error('Failed to find categories with task count', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find categories by task ID
   */
  public async findCategoriesByTaskId(taskId: string): Promise<Category[]> {
    try {
      this.logger.debug('Finding categories by task ID', { taskId });

      if (!taskId || taskId.trim().length === 0) {
        throw new ValidationError('Task ID is required');
      }

      const categories = await this.getModel().findMany({
        where: {
          taskCategories: {
            some: {
              taskId: taskId.trim()
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      this.logger.debug(`Found ${categories.length} categories for task ${taskId}`);
      return categories;
    } catch (error) {
      this.logger.error('Failed to find categories by task ID', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find categories with their tasks
   */
  public async findCategoriesWithTasks(options: FindManyOptions = {}): Promise<CategoryWithTasks[]> {
    try {
      this.logger.debug('Finding categories with tasks', { options });

      const queryOptions: any = {
        where: options.where,
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
      };

      if (options.orderBy) queryOptions.orderBy = options.orderBy;
      if (options.skip !== undefined) queryOptions.skip = options.skip;
      if (options.take !== undefined) queryOptions.take = options.take;

      const categories = await this.getModel().findMany(queryOptions);

      this.logger.debug(`Found ${categories.length} categories with tasks`);
      return categories as CategoryWithTasks[];
    } catch (error) {
      this.logger.error('Failed to find categories with tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Find popular categories (most used)
   */
  public async findPopularCategories(limit: number = 10): Promise<CategoryWithTaskCount[]> {
    try {
      this.logger.debug('Finding popular categories', { limit });

      if (limit <= 0) {
        throw new ValidationError('Limit must be greater than 0');
      }

      const categoriesWithCount = await this.findCategoriesWithTaskCount({
        take: limit
      });

      // Sort by task count (descending)
      const sortedCategories = categoriesWithCount.sort((a, b) => b.taskCount - a.taskCount);

      this.logger.debug(`Found ${sortedCategories.length} popular categories`);
      return sortedCategories;
    } catch (error) {
      this.logger.error('Failed to find popular categories', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count categories that have tasks
   */
  public async countCategoriesWithTasks(): Promise<number> {
    try {
      this.logger.debug('Counting categories with tasks');

      const count = await this.getModel().count({
        where: {
          taskCategories: {
            some: {}
          }
        }
      });

      this.logger.debug(`Found ${count} categories with tasks`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count categories with tasks', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count tasks by category
   */
  public async countTasksByCategory(categoryId: string): Promise<number> {
    try {
      this.logger.debug('Counting tasks by category', { categoryId });

      if (!categoryId || categoryId.trim().length === 0) {
        throw new ValidationError('Category ID is required');
      }

      const count = await this.prisma.taskCategory.count({
        where: {
          categoryId: categoryId.trim()
        }
      });

      this.logger.debug(`Found ${count} tasks for category ${categoryId}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count tasks by category', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Count active tasks by category
   */
  public async countActiveTasksByCategory(categoryId: string): Promise<number> {
    try {
      this.logger.debug('Counting active tasks by category', { categoryId });

      if (!categoryId || categoryId.trim().length === 0) {
        throw new ValidationError('Category ID is required');
      }

      const count = await this.prisma.taskCategory.count({
        where: {
          categoryId: categoryId.trim(),
          task: {
            status: {
              not: TaskStatus.completed
            }
          }
        }
      });

      this.logger.debug(`Found ${count} active tasks for category ${categoryId}`);
      return count;
    } catch (error) {
      this.logger.error('Failed to count active tasks by category', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Check if category exists by name
   */
  public async existsByName(name: string): Promise<boolean> {
    try {
      this.logger.debug('Checking if category exists by name', { name });

      if (!name || name.trim().length === 0) {
        throw new ValidationError('Category name is required');
      }

      const category = await this.findByName(name.trim());
      const exists = category !== null;

      this.logger.debug(`Category exists by name: ${exists}`, { name });
      return exists;
    } catch (error) {
      this.logger.error('Failed to check category existence by name', error as Error);
      throw this.handleError(error);
    }
  }

  /**
   * Validate color format (hex color code)
   */
  public validateColorFormat(color: string): boolean {
    if (!color || typeof color !== 'string') {
      return false;
    }

    // Check hex color format: #RRGGBB
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color.trim());
  }

  /**
   * Prepare create data with validation
   */
  protected override prepareCreateData(data: CreateCategoryData): any {
    // Validate required fields
    if (!data.name || data.name.trim().length === 0) {
      throw new ValidationError('Category name is required');
    }

    if (data.name.trim().length > 50) {
      throw new ValidationError('Category name must be 50 characters or less');
    }

    if (!data.color || data.color.trim().length === 0) {
      throw new ValidationError('Category color is required');
    }

    if (!this.validateColorFormat(data.color)) {
      throw new ValidationError('Invalid color format. Expected hex format (#RRGGBB)');
    }

    if (data.description && data.description.length > 200) {
      throw new ValidationError('Category description must be 200 characters or less');
    }

    return {
      name: data.name.trim(),
      color: data.color.trim().toUpperCase(),
      description: data.description?.trim() || null
    };
  }

  /**
   * Prepare update data with validation
   */
  protected override prepareUpdateData(data: UpdateCategoryData): any {
    const cleanData = super.prepareUpdateData(data);

    // Validate name if provided
    if (cleanData.name !== undefined) {
      if (!cleanData.name || cleanData.name.trim().length === 0) {
        throw new ValidationError('Category name cannot be empty');
      }
      if (cleanData.name.trim().length > 50) {
        throw new ValidationError('Category name must be 50 characters or less');
      }
      cleanData.name = cleanData.name.trim();
    }

    // Validate color if provided
    if (cleanData.color !== undefined) {
      if (!cleanData.color || cleanData.color.trim().length === 0) {
        throw new ValidationError('Category color cannot be empty');
      }
      if (!this.validateColorFormat(cleanData.color)) {
        throw new ValidationError('Invalid color format. Expected hex format (#RRGGBB)');
      }
      cleanData.color = cleanData.color.trim().toUpperCase();
    }

    // Validate description if provided
    if (cleanData.description !== undefined) {
      if (cleanData.description && cleanData.description.length > 200) {
        throw new ValidationError('Category description must be 200 characters or less');
      }
      cleanData.description = cleanData.description?.trim() || null;
    }

    return cleanData;
  }
}

/**
 * Export default category repository
 */
export default CategoryRepository;
