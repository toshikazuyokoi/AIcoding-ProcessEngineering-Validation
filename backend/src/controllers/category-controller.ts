/**
 * ===================================
 * Category Controller Implementation
 * ===================================
 * Purpose: HTTP category endpoints for category management
 * Features:
 * - Category CRUD operations
 * - User ownership validation
 * - Color and name validation
 * - Task count integration
 * - BaseController integration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { BaseController, ControllerRequest } from './base-controller';
import { CategoryService, CategorySearchFilters, CreateCategoryRequest, UpdateCategoryRequest } from '../domain/services/category.service';
import { ResponseBuilder } from '../utils/response-builder';
import { ErrorHandler } from '../utils/error-handler';
import { Logger } from '../utils/logger';
import { RequestValidator } from '../utils/request-validator';

// ===================================
// Category Controller Types
// ===================================

/**
 * Category controller request interface
 */
export interface CategoryControllerRequest extends ControllerRequest {
  body: {
    name?: string;
    color?: string;
    description?: string;
  };
  query: { [key: string]: any };
  params: {
    id?: string;
  };
}

/**
 * Category list response interface
 */
export interface CategoryListResponse {
  categories: any[];
}

/**
 * Category detail response interface
 */
export interface CategoryDetailResponse {
  category: any;
}

// ===================================
// CategoryController Class
// ===================================

/**
 * Category Controller
 * 
 * Handles HTTP category endpoints:
 * - Category CRUD operations
 * - User ownership validation
 * - Color and name validation
 * - Task count integration
 */
export class CategoryController extends BaseController {
  private categoryService: CategoryService;

  /**
   * Constructor
   */
  constructor(
    categoryService: CategoryService,
    responseBuilder?: ResponseBuilder,
    errorHandler?: ErrorHandler,
    logger?: Logger,
    validator?: RequestValidator
  ) {
    super(
      'CategoryController',
      responseBuilder,
      errorHandler,
      logger,
      validator,
      {
        enableLogging: true,
        enableValidation: true,
        enableErrorHandling: true,
        serviceName: 'category-api',
        enableRequestId: true,
        enableUserContext: true,
        enablePerformanceLogging: true
      }
    );

    this.categoryService = categoryService;
  }

  /**
   * Get categories list endpoint
   * GET /api/categories
   */
  public getCategories = this.wrapAction('getCategories', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Extract query parameters for filtering
    const { search, color } = req.query;

    // Prepare search filters
    const filters: CategorySearchFilters = {};
    if (search) filters.search = search as string;
    if (color) filters.color = color as string;

    // Get categories from service
    const categories = await this.categoryService.getCategoriesByUser(req.user.id, filters);

    // Prepare response
    const response: CategoryListResponse = {
      categories
    };

    this.sendSuccess(res, response, 'Categories retrieved successfully');
  });

  /**
   * Create category endpoint
   * POST /api/categories
   */
  public createCategory = this.wrapAction('createCategory', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    // Extract and validate category data
    const { name, color, description } = req.body;

    // Basic validation
    if (!name || name.trim().length === 0) {
      this.sendError(res, new Error('Category name is required'), 400);
      return;
    }

    if (name.length > 50) {
      this.sendError(res, new Error('Category name must be 50 characters or less'), 400);
      return;
    }

    if (!color || color.trim().length === 0) {
      this.sendError(res, new Error('Category color is required'), 400);
      return;
    }

    // Validate color format (hex color)
    const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    if (!colorRegex.test(color)) {
      this.sendError(res, new Error('Color must be a valid hex color (e.g., #FF0000)'), 400);
      return;
    }

    // Validate description length
    if (description && description.length > 200) {
      this.sendError(res, new Error('Description must be 200 characters or less'), 400);
      return;
    }

    // Prepare create request
    const createRequest: CreateCategoryRequest = {
      name: name.trim(),
      color: color.trim().toUpperCase(),
      description: description?.trim()
    };

    // Create category
    const category = await this.categoryService.createCategory(req.user.id, createRequest);

    // Prepare response
    const response: CategoryDetailResponse = {
      category
    };

    this.sendSuccess(res, response, 'Category created successfully', 201);
  });

  /**
   * Get category by ID endpoint
   * GET /api/categories/:id
   */
  public getCategoryById = this.wrapAction('getCategoryById', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID and category ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    const categoryId = req.params.id;
    if (!categoryId) {
      this.sendError(res, new Error('Category ID is required'), 400);
      return;
    }

    // Get category by ID
    const category = await this.categoryService.getCategoryById(categoryId, req.user.id);

    // Prepare response
    const response: CategoryDetailResponse = {
      category
    };

    this.sendSuccess(res, response, 'Category retrieved successfully');
  });

  /**
   * Update category endpoint
   * PUT /api/categories/:id
   */
  public updateCategory = this.wrapAction('updateCategory', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID and category ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    const categoryId = req.params.id;
    if (!categoryId) {
      this.sendError(res, new Error('Category ID is required'), 400);
      return;
    }

    // Extract update data
    const { name, color, description } = req.body;

    // Validate that at least one field is provided
    if (!name && !color && description === undefined) {
      this.sendError(res, new Error('At least one field (name, color, or description) must be provided'), 400);
      return;
    }

    // Prepare update request
    const updateRequest: UpdateCategoryRequest = {};
    
    if (name !== undefined) {
      if (name.trim().length === 0) {
        this.sendError(res, new Error('Category name cannot be empty'), 400);
        return;
      }
      if (name.length > 50) {
        this.sendError(res, new Error('Category name must be 50 characters or less'), 400);
        return;
      }
      updateRequest.name = name.trim();
    }
    
    if (color !== undefined) {
      if (color.trim().length === 0) {
        this.sendError(res, new Error('Category color cannot be empty'), 400);
        return;
      }
      const colorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (!colorRegex.test(color)) {
        this.sendError(res, new Error('Color must be a valid hex color (e.g., #FF0000)'), 400);
        return;
      }
      updateRequest.color = color.trim().toUpperCase();
    }
    
    if (description !== undefined) {
      if (description && description.length > 200) {
        this.sendError(res, new Error('Description must be 200 characters or less'), 400);
        return;
      }
      updateRequest.description = description?.trim();
    }

    // Update category
    const category = await this.categoryService.updateCategory(categoryId, req.user.id, updateRequest);

    // Prepare response
    const response: CategoryDetailResponse = {
      category
    };

    this.sendSuccess(res, response, 'Category updated successfully');
  });

  /**
   * Delete category endpoint
   * DELETE /api/categories/:id
   */
  public deleteCategory = this.wrapAction('deleteCategory', async (req: ControllerRequest, res: Response): Promise<void> => {
    // Extract user ID and category ID
    if (!req.user?.id) {
      this.sendError(res, new Error('User authentication required'), 401);
      return;
    }

    const categoryId = req.params.id;
    if (!categoryId) {
      this.sendError(res, new Error('Category ID is required'), 400);
      return;
    }

    // Delete category
    await this.categoryService.deleteCategory(categoryId, req.user.id);

    this.sendSuccess(res, null, 'Category deleted successfully', 204);
  });
}

// ===================================
// Factory Function
// ===================================

/**
 * Create CategoryController instance
 */
export const createCategoryController = (
  categoryService: CategoryService,
  responseBuilder?: ResponseBuilder,
  errorHandler?: ErrorHandler,
  logger?: Logger,
  validator?: RequestValidator
): CategoryController => {
  return new CategoryController(categoryService, responseBuilder, errorHandler, logger, validator);
};

// Export default instance factory
export default createCategoryController;
