/**
 * ===================================
 * Base Entity Test Suite
 * ===================================
 * Purpose: Comprehensive tests for BaseEntity class
 * Features:
 * - Entity creation and initialization
 * - Invariant condition validation
 * - Lifecycle management testing
 * - Entity equality and comparison
 * - Serialization and cloning
 * - Error handling and edge cases
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  BaseEntity,
  IBaseEntity,
  EntityCreationOptions,
  EntityUpdateOptions,
  EntityValidationError,
  EntityNotFoundError,
  EntityConflictError
} from '../../../src/domain/entities/base.entity';

// Test implementation of BaseEntity for testing purposes
class TestEntity extends BaseEntity {
  private _name: string;
  private _value: number;

  constructor(name: string, value: number, options: EntityCreationOptions = {}) {
    // Initialize properties before calling super() to avoid validation issues
    super(options);
    this._name = name;
    this._value = value;

    // Validate after all properties are set
    this.validateInvariants();
  }

  public get name(): string {
    return this._name;
  }

  public get value(): number {
    return this._value;
  }

  public updateName(newName: string): void {
    this._name = newName;
    this.markAsUpdated();
  }

  public updateValue(newValue: number): void {
    this._value = newValue;
    this.markAsUpdated();
  }

  public clone(updates?: Partial<{ name: string; value: number }>): TestEntity {
    return new TestEntity(
      updates?.name ?? this._name,
      updates?.value ?? this._value,
      { id: this.id, createdAt: this.createdAt, updatedAt: this.updatedAt }
    );
  }

  protected override getAdditionalProperties(): Record<string, any> {
    return {
      name: this._name,
      value: this._value
    };
  }

  protected override validateInvariants(): void {
    super.validateInvariants();
    
    if (!this._name || this._name.trim().length === 0) {
      throw new EntityValidationError('Name cannot be empty', 'TestEntity', this.id);
    }

    if (this._value < 0) {
      throw new EntityValidationError('Value cannot be negative', 'TestEntity', this.id);
    }
  }
}

describe('BaseEntity', () => {
  let testEntity: TestEntity;
  const testName = 'Test Entity';
  const testValue = 42;

  beforeEach(() => {
    testEntity = new TestEntity(testName, testValue);
  });

  // ===================================
  // Entity Creation Tests
  // ===================================

  describe('Entity Creation', () => {
    test('should create entity with default options', () => {
      const entity = new TestEntity('Default Entity', 100);

      expect(entity.id).toBeDefined();
      expect(entity.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(entity.createdAt).toBeInstanceOf(Date);
      expect(entity.updatedAt).toBeInstanceOf(Date);
      expect(entity.name).toBe('Default Entity');
      expect(entity.value).toBe(100);
    });

    test('should create entity with custom ID', () => {
      const customId = 'custom-test-id';
      const entity = new TestEntity('Custom Entity', 200, { id: customId });

      expect(entity.id).toBe(customId);
      expect(entity.name).toBe('Custom Entity');
      expect(entity.value).toBe(200);
    });

    test('should create entity with custom timestamps', () => {
      const customCreatedAt = new Date('2023-01-01T00:00:00Z');
      const customUpdatedAt = new Date('2023-01-02T00:00:00Z');
      
      const entity = new TestEntity('Timestamped Entity', 300, {
        createdAt: customCreatedAt,
        updatedAt: customUpdatedAt
      });

      expect(entity.createdAt).toEqual(customCreatedAt);
      expect(entity.updatedAt).toEqual(customUpdatedAt);
    });

    test('should ensure updatedAt is not earlier than createdAt on creation', () => {
      const createdAt = new Date('2023-01-02T00:00:00Z');
      const updatedAt = new Date('2023-01-01T00:00:00Z'); // Earlier than createdAt

      expect(() => {
        new TestEntity('Invalid Entity', 400, { createdAt, updatedAt });
      }).toThrow('Entity updatedAt cannot be earlier than createdAt');
    });
  });

  // ===================================
  // Property Access Tests
  // ===================================

  describe('Property Access', () => {
    test('should provide immutable access to ID', () => {
      const originalId = testEntity.id;
      
      // ID should be readonly - TypeScript prevents modification
      expect(testEntity.id).toBe(originalId);
      expect(typeof testEntity.id).toBe('string');
    });

    test('should provide immutable access to createdAt', () => {
      const originalCreatedAt = testEntity.createdAt;
      const returnedCreatedAt = testEntity.createdAt;
      
      // Should return a new Date object (defensive copy)
      expect(returnedCreatedAt).toEqual(originalCreatedAt);
      expect(returnedCreatedAt).not.toBe(originalCreatedAt);
      
      // Modifying returned date should not affect entity
      returnedCreatedAt.setFullYear(2000);
      expect(testEntity.createdAt).toEqual(originalCreatedAt);
    });

    test('should provide immutable access to updatedAt', () => {
      const originalUpdatedAt = testEntity.updatedAt;
      const returnedUpdatedAt = testEntity.updatedAt;
      
      // Should return a new Date object (defensive copy)
      expect(returnedUpdatedAt).toEqual(originalUpdatedAt);
      expect(returnedUpdatedAt).not.toBe(originalUpdatedAt);
      
      // Modifying returned date should not affect entity
      returnedUpdatedAt.setFullYear(2000);
      expect(testEntity.updatedAt).toEqual(originalUpdatedAt);
    });
  });

  // ===================================
  // Update and Lifecycle Tests
  // ===================================

  describe('Update and Lifecycle', () => {
    test('should update timestamp when entity is modified', async () => {
      const originalUpdatedAt = testEntity.updatedAt;
      
      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      testEntity.updateName('Updated Name');
      
      expect(testEntity.updatedAt).not.toEqual(originalUpdatedAt);
      expect(testEntity.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      expect(testEntity.name).toBe('Updated Name');
    });

    test('should prevent updatedAt from being earlier than createdAt', () => {
      const earlyDate = new Date(testEntity.createdAt.getTime() - 1000);
      
      expect(() => {
        (testEntity as any).markAsUpdated({ updatedAt: earlyDate });
      }).toThrow('Updated timestamp cannot be earlier than creation timestamp');
    });

    test('should allow custom updatedAt timestamp', () => {
      const customUpdatedAt = new Date(testEntity.createdAt.getTime() + 5000);
      
      (testEntity as any).markAsUpdated({ updatedAt: customUpdatedAt });
      
      expect(testEntity.updatedAt).toEqual(customUpdatedAt);
    });
  });

  // ===================================
  // Entity Comparison Tests
  // ===================================

  describe('Entity Comparison', () => {
    test('should identify equal entities by ID', () => {
      const entity1 = new TestEntity('Entity 1', 100, { id: 'same-id' });
      const entity2 = new TestEntity('Entity 2', 200, { id: 'same-id' });
      
      expect(entity1.equals(entity2)).toBe(true);
      expect(entity2.equals(entity1)).toBe(true);
    });

    test('should identify different entities by ID', () => {
      const entity1 = new TestEntity('Entity 1', 100);
      const entity2 = new TestEntity('Entity 2', 200);
      
      expect(entity1.equals(entity2)).toBe(false);
      expect(entity2.equals(entity1)).toBe(false);
    });

    test('should handle null/undefined comparison', () => {
      expect(testEntity.equals(null as any)).toBe(false);
      expect(testEntity.equals(undefined as any)).toBe(false);
    });

    test('should handle non-BaseEntity comparison', () => {
      const plainObject = { id: testEntity.id };
      
      expect(testEntity.equals(plainObject as any)).toBe(false);
    });

    test('should compare entity update times', async () => {
      const entity1 = new TestEntity('Entity 1', 100);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const entity2 = new TestEntity('Entity 2', 200);
      
      expect(entity2.isNewerThan(entity1)).toBe(true);
      expect(entity1.isNewerThan(entity2)).toBe(false);
    });
  });

  // ===================================
  // Age and Time Calculation Tests
  // ===================================

  describe('Age and Time Calculations', () => {
    test('should calculate entity age correctly', () => {
      const age = testEntity.getAge();
      
      expect(age).toBeGreaterThanOrEqual(0);
      expect(age).toBeLessThan(1000); // Should be very recent
    });

    test('should calculate time since update correctly', () => {
      const timeSinceUpdate = testEntity.getTimeSinceUpdate();
      
      expect(timeSinceUpdate).toBeGreaterThanOrEqual(0);
      expect(timeSinceUpdate).toBeLessThan(1000); // Should be very recent
    });

    test('should identify recently created entities', () => {
      expect(testEntity.isRecentlyCreated(60000)).toBe(true); // 1 minute threshold

      // Create an old entity for comparison
      const oldDate = new Date(Date.now() - 120000); // 2 minutes ago
      const oldEntity = new TestEntity('Old Entity', 100, { createdAt: oldDate, updatedAt: oldDate });
      expect(oldEntity.isRecentlyCreated(60000)).toBe(false); // Should be false for old entity
    });

    test('should identify recently updated entities', () => {
      expect(testEntity.isRecentlyUpdated(60000)).toBe(true); // 1 minute threshold

      // Create an old entity for comparison
      const oldDate = new Date(Date.now() - 120000); // 2 minutes ago
      const oldEntity = new TestEntity('Old Entity', 100, { createdAt: oldDate, updatedAt: oldDate });
      expect(oldEntity.isRecentlyUpdated(60000)).toBe(false); // Should be false for old entity
    });
  });

  // ===================================
  // Serialization Tests
  // ===================================

  describe('Serialization', () => {
    test('should convert to plain object', () => {
      const plainObject = testEntity.toPlainObject();
      
      expect(plainObject).toEqual({
        id: testEntity.id,
        createdAt: testEntity.createdAt.toISOString(),
        updatedAt: testEntity.updatedAt.toISOString(),
        name: testEntity.name,
        value: testEntity.value
      });
    });

    test('should convert to JSON string', () => {
      const jsonString = testEntity.toJSON();
      const parsedObject = JSON.parse(jsonString);
      
      expect(parsedObject).toEqual({
        id: testEntity.id,
        createdAt: testEntity.createdAt.toISOString(),
        updatedAt: testEntity.updatedAt.toISOString(),
        name: testEntity.name,
        value: testEntity.value
      });
    });

    test('should provide entity type name', () => {
      expect(testEntity.getEntityType()).toBe('TestEntity');
    });

    test('should provide string representation', () => {
      const stringRep = testEntity.toString();
      
      expect(stringRep).toContain('TestEntity');
      expect(stringRep).toContain(testEntity.id);
      expect(stringRep).toContain(testEntity.createdAt.toISOString());
      expect(stringRep).toContain(testEntity.updatedAt.toISOString());
    });
  });

  // ===================================
  // Cloning Tests
  // ===================================

  describe('Cloning', () => {
    test('should clone entity with same properties', () => {
      const clonedEntity = testEntity.clone();
      
      expect(clonedEntity).not.toBe(testEntity);
      expect(clonedEntity.id).toBe(testEntity.id);
      expect(clonedEntity.name).toBe(testEntity.name);
      expect(clonedEntity.value).toBe(testEntity.value);
      expect(clonedEntity.createdAt).toEqual(testEntity.createdAt);
      expect(clonedEntity.updatedAt).toEqual(testEntity.updatedAt);
    });

    test('should clone entity with updated properties', () => {
      const updates = { name: 'Updated Name', value: 999 };
      const clonedEntity = testEntity.clone(updates);
      
      expect(clonedEntity).not.toBe(testEntity);
      expect(clonedEntity.id).toBe(testEntity.id);
      expect(clonedEntity.name).toBe('Updated Name');
      expect(clonedEntity.value).toBe(999);
      expect(clonedEntity.createdAt).toEqual(testEntity.createdAt);
      expect(clonedEntity.updatedAt).toEqual(testEntity.updatedAt);
    });
  });

  // ===================================
  // Invariant Validation Tests
  // ===================================

  describe('Invariant Validation', () => {
    test('should throw error for empty ID', () => {
      expect(() => {
        new TestEntity('Valid Name', 100, { id: '' });
      }).toThrow('Entity ID must be a non-empty string');
    });

    test('should throw error for invalid createdAt', () => {
      expect(() => {
        new TestEntity('Valid Name', 100, { createdAt: new Date('invalid') });
      }).toThrow('Entity createdAt must be a valid Date');
    });

    test('should throw error for invalid updatedAt', () => {
      expect(() => {
        new TestEntity('Valid Name', 100, { updatedAt: new Date('invalid') });
      }).toThrow('Entity updatedAt must be a valid Date');
    });

    test('should throw error for empty name (custom validation)', () => {
      expect(() => {
        new TestEntity('', 100);
      }).toThrow(EntityValidationError);
    });

    test('should throw error for negative value (custom validation)', () => {
      expect(() => {
        new TestEntity('Valid Name', -1);
      }).toThrow(EntityValidationError);
    });
  });

  // ===================================
  // Error Classes Tests
  // ===================================

  describe('Error Classes', () => {
    test('should create EntityValidationError correctly', () => {
      const error = new EntityValidationError('Test message', 'TestEntity', 'test-id');
      
      expect(error.name).toBe('EntityValidationError');
      expect(error.message).toBe('Test message');
      expect(error.entityType).toBe('TestEntity');
      expect(error.entityId).toBe('test-id');
    });

    test('should create EntityNotFoundError correctly', () => {
      const error = new EntityNotFoundError('TestEntity', 'test-id');
      
      expect(error.name).toBe('EntityNotFoundError');
      expect(error.message).toBe('TestEntity with ID test-id not found');
    });

    test('should create EntityConflictError correctly', () => {
      const error = new EntityConflictError('Conflict message', 'TestEntity', 'test-id');
      
      expect(error.name).toBe('EntityConflictError');
      expect(error.message).toBe('Conflict message');
      expect(error.entityType).toBe('TestEntity');
      expect(error.entityId).toBe('test-id');
    });
  });
});
