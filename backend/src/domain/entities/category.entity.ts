/**
 * ===================================
 * Category Entity Class
 * ===================================
 * Purpose: Category domain entity with business logic
 * Features:
 * - Category information management
 * - Color management with hex validation
 * - Description management
 * - Business rule enforcement
 * - Task categorization support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { BaseEntity, EntityCreationOptions, EntityValidationError } from './base.entity';

/**
 * Category creation data interface
 */
export interface CategoryCreationData {
  name: string;
  color: string;
  description?: string | undefined;
}

/**
 * Category update data interface
 */
export interface CategoryUpdateData {
  name?: string | undefined;
  color?: string | undefined;
  description?: string | undefined;
}

/**
 * Category summary data interface
 */
export interface CategorySummaryData {
  id: string;
  name: string;
  color: string;
  description: string | undefined;
  createdAt: Date;
}

/**
 * Category Entity Class
 * 
 * Represents a category in the system for task classification.
 * Extends BaseEntity to inherit common entity functionality.
 */
export class Category extends BaseEntity {
  private _name: string;
  private _color: string;
  private _description: string | undefined;

  /**
   * Constructor for Category entity
   * 
   * @param data - Category creation data
   * @param options - Entity creation options
   * @throws {EntityValidationError} When validation fails
   */
  constructor(data: CategoryCreationData, options: EntityCreationOptions = {}) {
    super(options);
    
    // Initialize category-specific properties
    this._name = data.name;
    this._color = data.color;
    this._description = data.description;

    // Validate all properties after initialization
    this.validateInvariants();
  }

  /**
   * Get category name
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Get category color (hex format)
   */
  public get color(): string {
    return this._color;
  }

  /**
   * Get category description
   */
  public get description(): string | undefined {
    return this._description;
  }

  /**
   * Check if category has description
   * 
   * @returns {boolean} True if category has description
   */
  public hasDescription(): boolean {
    return this._description !== undefined && this._description.trim().length > 0;
  }

  /**
   * Get color as RGB values
   * 
   * @returns {object} RGB color values
   */
  public getColorRGB(): { r: number; g: number; b: number } {
    const hex = this._color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return { r, g, b };
  }

  /**
   * Check if color is dark (for text contrast)
   * 
   * @returns {boolean} True if color is considered dark
   */
  public isDarkColor(): boolean {
    const { r, g, b } = this.getColorRGB();
    // Calculate luminance using standard formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5;
  }

  /**
   * Get recommended text color for this category
   * 
   * @returns {string} Recommended text color (white or black)
   */
  public getRecommendedTextColor(): string {
    return this.isDarkColor() ? '#FFFFFF' : '#000000';
  }

  /**
   * Update category information
   * 
   * @param data - Category update data
   * @throws {EntityValidationError} When validation fails
   */
  public updateCategory(data: CategoryUpdateData): void {
    const previousData = {
      name: this._name,
      color: this._color,
      description: this._description
    };

    try {
      // Update properties if provided
      if (data.name !== undefined) {
        this._name = data.name;
      }
      
      if (data.color !== undefined) {
        this._color = data.color;
      }
      
      if (data.description !== undefined) {
        this._description = data.description;
      }

      // Validate updated data
      this.validateInvariants();
      
      // Mark entity as updated
      this.markAsUpdated();

    } catch (error) {
      // Rollback changes on validation failure
      this._name = previousData.name;
      this._color = previousData.color;
      this._description = previousData.description;
      
      throw error;
    }
  }

  /**
   * Update category name
   * 
   * @param newName - New category name
   * @throws {EntityValidationError} When validation fails
   */
  public updateName(newName: string): void {
    this.updateCategory({ name: newName });
  }

  /**
   * Update category color
   * 
   * @param newColor - New category color (hex format)
   * @throws {EntityValidationError} When validation fails
   */
  public updateColor(newColor: string): void {
    this.updateCategory({ color: newColor });
  }

  /**
   * Update category description
   * 
   * @param newDescription - New category description
   * @throws {EntityValidationError} When validation fails
   */
  public updateDescription(newDescription: string | undefined): void {
    this.updateCategory({ description: newDescription });
  }

  /**
   * Remove category description
   */
  public removeDescription(): void {
    this._description = undefined;
    this.markAsUpdated();
  }

  /**
   * Get category display name with color indicator
   * 
   * @returns {string} Display name with color
   */
  public getDisplayName(): string {
    return `${this._name} (${this._color})`;
  }

  /**
   * Check if category matches search term
   * 
   * @param searchTerm - Search term to match against
   * @returns {boolean} True if category matches search term
   */
  public matchesSearch(searchTerm: string): boolean {
    if (!searchTerm || searchTerm.trim().length === 0) {
      return true;
    }

    const term = searchTerm.toLowerCase().trim();
    const nameMatch = this._name.toLowerCase().includes(term);
    const descriptionMatch = this._description?.toLowerCase().includes(term) || false;
    
    return nameMatch || descriptionMatch;
  }

  /**
   * Get category summary
   * 
   * @returns {CategorySummaryData} Category summary information
   */
  public getSummary(): CategorySummaryData {
    return {
      id: this.id,
      name: this._name,
      color: this._color,
      description: this._description,
      createdAt: this.createdAt
    };
  }

  /**
   * Clone category entity with optional updates
   * 
   * @param updates - Optional property updates
   * @returns {Category} New category instance
   */
  public clone(updates?: Partial<CategoryCreationData>): Category {
    const categoryData: CategoryCreationData = {
      name: updates?.name ?? this._name,
      color: updates?.color ?? this._color,
      description: updates?.description ?? this._description
    };

    return new Category(categoryData, {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    });
  }

  /**
   * Get additional properties for serialization
   * 
   * @returns {object} Category-specific properties
   */
  protected override getAdditionalProperties(): Record<string, any> {
    return {
      name: this._name,
      color: this._color,
      description: this._description
    };
  }

  /**
   * Validate category-specific invariant conditions
   * 
   * @throws {EntityValidationError} When validation fails
   */
  protected override validateInvariants(): void {
    super.validateInvariants();

    // Validate name
    if (!this._name || typeof this._name !== 'string') {
      throw new EntityValidationError('Category name is required', 'Category', this.id);
    }

    if (this._name.trim().length === 0) {
      throw new EntityValidationError('Category name cannot be empty', 'Category', this.id);
    }

    if (this._name.trim().length > 50) {
      throw new EntityValidationError('Category name must be 50 characters or less', 'Category', this.id);
    }

    // Validate color
    if (!this._color || typeof this._color !== 'string') {
      throw new EntityValidationError('Category color is required', 'Category', this.id);
    }

    if (!this.isValidHexColor(this._color)) {
      throw new EntityValidationError('Invalid color format. Expected hex format (#RRGGBB)', 'Category', this.id);
    }

    // Validate description
    if (this._description !== undefined) {
      if (typeof this._description !== 'string') {
        throw new EntityValidationError('Category description must be a string', 'Category', this.id);
      }

      if (this._description.length > 200) {
        throw new EntityValidationError('Category description must be 200 characters or less', 'Category', this.id);
      }
    }
  }

  /**
   * Validate hex color format
   * 
   * @param color - Color string to validate
   * @returns {boolean} True if valid hex color
   */
  private isValidHexColor(color: string): boolean {
    // Check for hex color format: #RRGGBB
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    return hexColorRegex.test(color);
  }
}
