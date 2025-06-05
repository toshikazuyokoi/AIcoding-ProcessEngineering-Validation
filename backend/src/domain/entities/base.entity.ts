/**
 * ===================================
 * Base Entity Class
 * ===================================
 * Purpose: Foundation entity class for all domain entities
 * Features:
 * - Common properties (id, createdAt, updatedAt)
 * - Entity identity management
 * - Lifecycle management
 * - Invariant conditions enforcement
 * - Domain-driven design patterns
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { randomUUID } from 'crypto';

/**
 * Base Entity interface defining common properties
 */
export interface IBaseEntity {
  readonly id: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

/**
 * Entity creation options
 */
export interface EntityCreationOptions {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Entity update options
 */
export interface EntityUpdateOptions {
  updatedAt?: Date;
}

/**
 * Base Entity abstract class
 * 
 * Provides common functionality for all domain entities:
 * - Unique identity management
 * - Automatic timestamp management
 * - Entity equality comparison
 * - Invariant condition enforcement
 * - Lifecycle event handling
 */
export abstract class BaseEntity implements IBaseEntity {
  private readonly _id: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  /**
   * Constructor for BaseEntity
   * 
   * @param options - Entity creation options
   * @throws {Error} When invariant conditions are violated
   */
  protected constructor(options: EntityCreationOptions = {}) {
    const now = new Date();

    // Initialize core properties
    this._id = options.id !== undefined ? options.id : this.generateId();
    this._createdAt = options.createdAt || now;
    this._updatedAt = options.updatedAt || now;

    // Validate base invariant conditions only
    this.validateBaseInvariants();

    // Trigger creation lifecycle event
    this.onEntityCreated();
  }

  /**
   * Get entity ID (immutable)
   */
  public get id(): string {
    return this._id;
  }

  /**
   * Get creation timestamp (immutable)
   */
  public get createdAt(): Date {
    return new Date(this._createdAt.getTime());
  }

  /**
   * Get last update timestamp
   */
  public get updatedAt(): Date {
    return new Date(this._updatedAt.getTime());
  }

  /**
   * Generate unique entity ID
   * 
   * @returns {string} UUID v4 string
   */
  private generateId(): string {
    return randomUUID();
  }

  /**
   * Update the entity's timestamp
   * 
   * @param options - Update options
   */
  protected markAsUpdated(options: EntityUpdateOptions = {}): void {
    const previousUpdatedAt = this._updatedAt;
    this._updatedAt = options.updatedAt || new Date();

    // Ensure updated timestamp is not earlier than creation
    if (this._updatedAt < this._createdAt) {
      throw new Error('Updated timestamp cannot be earlier than creation timestamp');
    }

    // Trigger update lifecycle event
    this.onEntityUpdated(previousUpdatedAt);
  }

  /**
   * Check if this entity is the same as another entity
   * 
   * @param other - Another entity to compare
   * @returns {boolean} True if entities have the same ID
   */
  public equals(other: BaseEntity): boolean {
    if (!other) {
      return false;
    }

    if (!(other instanceof BaseEntity)) {
      return false;
    }

    return this._id === other._id;
  }

  /**
   * Check if this entity is newer than another entity
   * 
   * @param other - Another entity to compare
   * @returns {boolean} True if this entity was updated more recently
   */
  public isNewerThan(other: BaseEntity): boolean {
    if (!other || !(other instanceof BaseEntity)) {
      return true;
    }

    return this._updatedAt > other._updatedAt;
  }

  /**
   * Get entity age in milliseconds
   * 
   * @returns {number} Age in milliseconds since creation
   */
  public getAge(): number {
    return Date.now() - this._createdAt.getTime();
  }

  /**
   * Get time since last update in milliseconds
   * 
   * @returns {number} Time in milliseconds since last update
   */
  public getTimeSinceUpdate(): number {
    return Date.now() - this._updatedAt.getTime();
  }

  /**
   * Check if entity was recently created
   * 
   * @param thresholdMs - Threshold in milliseconds (default: 1 minute)
   * @returns {boolean} True if entity was created within threshold
   */
  public isRecentlyCreated(thresholdMs: number = 60000): boolean {
    return this.getAge() <= thresholdMs;
  }

  /**
   * Check if entity was recently updated
   * 
   * @param thresholdMs - Threshold in milliseconds (default: 1 minute)
   * @returns {boolean} True if entity was updated within threshold
   */
  public isRecentlyUpdated(thresholdMs: number = 60000): boolean {
    return this.getTimeSinceUpdate() <= thresholdMs;
  }

  /**
   * Convert entity to plain object for serialization
   * 
   * @returns {object} Plain object representation
   */
  public toPlainObject(): Record<string, any> {
    return {
      id: this._id,
      createdAt: this._createdAt.toISOString(),
      updatedAt: this._updatedAt.toISOString(),
      ...this.getAdditionalProperties()
    };
  }

  /**
   * Convert entity to JSON string
   * 
   * @returns {string} JSON representation
   */
  public toJSON(): string {
    return JSON.stringify(this.toPlainObject());
  }

  /**
   * Create a copy of the entity with updated properties
   * This method should be implemented by concrete entities
   * 
   * @param updates - Properties to update
   * @returns {BaseEntity} New entity instance with updates
   */
  public abstract clone(updates?: Partial<any>): BaseEntity;

  /**
   * Validate base entity invariant conditions
   * Called during construction to validate core properties
   *
   * @throws {Error} When base invariant conditions are violated
   */
  private validateBaseInvariants(): void {
    // Validate ID
    if (!this._id || typeof this._id !== 'string' || this._id.length === 0 || this._id.trim().length === 0) {
      throw new Error('Entity ID must be a non-empty string');
    }

    // Validate timestamps
    if (!this._createdAt || !(this._createdAt instanceof Date) || isNaN(this._createdAt.getTime())) {
      throw new Error('Entity createdAt must be a valid Date');
    }

    if (!this._updatedAt || !(this._updatedAt instanceof Date) || isNaN(this._updatedAt.getTime())) {
      throw new Error('Entity updatedAt must be a valid Date');
    }

    // Validate timestamp relationship
    if (this._updatedAt < this._createdAt) {
      throw new Error('Entity updatedAt cannot be earlier than createdAt');
    }
  }

  /**
   * Validate entity invariant conditions
   * Override in concrete entities for specific validation
   * Call this method after all properties are initialized
   *
   * @throws {Error} When invariant conditions are violated
   */
  protected validateInvariants(): void {
    // Re-validate base conditions
    this.validateBaseInvariants();

    // Override in concrete entities for additional validation
  }

  /**
   * Get additional properties for serialization
   * Override in concrete entities to include specific properties
   * 
   * @returns {object} Additional properties
   */
  protected getAdditionalProperties(): Record<string, any> {
    return {};
  }

  /**
   * Lifecycle event: Called when entity is created
   * Override in concrete entities for specific creation logic
   */
  protected onEntityCreated(): void {
    // Default implementation - can be overridden
  }

  /**
   * Lifecycle event: Called when entity is updated
   * Override in concrete entities for specific update logic
   * 
   * @param previousUpdatedAt - Previous update timestamp
   */
  protected onEntityUpdated(previousUpdatedAt: Date): void {
    // Default implementation - can be overridden
  }

  /**
   * Get entity type name
   * Override in concrete entities to return specific type
   * 
   * @returns {string} Entity type name
   */
  public getEntityType(): string {
    return this.constructor.name;
  }

  /**
   * Get entity summary for logging/debugging
   * 
   * @returns {string} Entity summary
   */
  public toString(): string {
    return `${this.getEntityType()}(id=${this._id}, created=${this._createdAt.toISOString()}, updated=${this._updatedAt.toISOString()})`;
  }
}

/**
 * Entity validation error
 */
export class EntityValidationError extends Error {
  constructor(message: string, public readonly entityType: string, public readonly entityId?: string) {
    super(message);
    this.name = 'EntityValidationError';
  }
}

/**
 * Entity not found error
 */
export class EntityNotFoundError extends Error {
  constructor(entityType: string, entityId: string) {
    super(`${entityType} with ID ${entityId} not found`);
    this.name = 'EntityNotFoundError';
  }
}

/**
 * Entity conflict error
 */
export class EntityConflictError extends Error {
  constructor(message: string, public readonly entityType: string, public readonly entityId?: string) {
    super(message);
    this.name = 'EntityConflictError';
  }
}
