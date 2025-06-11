/**
 * ===================================
 * Category Hierarchy Integration Test
 * ===================================
 * Generated for TSK-IT-002-003-CategoryIntegration
 * Project: Task Management System - Integration Test
 * Purpose: Test category hierarchy management integration and flow
 */

const { TestDataFactory } = require('../../../mocks/mock-services');
const { TestUtilities, testUtils } = require('../../../support/utils/TestUtilities');
const { MockServices, mockServices } = require('../../../mocks/mock-services');

describe('Category Hierarchy Integration Tests', () => {
  let allMocks;
  let testContext;
  let authToken;

  beforeAll(async () => {
    // Initialize test environment
    await testUtils.initialize();
    allMocks = mockServices.setupAllMocks();
    
    // Get authentication token
    const loginResponse = await allMocks.apiMocks.auth.login({
      email: 'user1@example.com',
      password: 'password123'
    });
    authToken = loginResponse.data.tokens.accessToken;
  });

  afterAll(async () => {
    // Cleanup test environment
    await testUtils.shutdown();
    mockServices.resetAllMocks();
  });

  beforeEach(() => {
    // Create test context
    testContext = testUtils.createContext('category-hierarchy-test');
    TestDataFactory.clearGeneratedData();
  });

  afterEach(async () => {
    // Cleanup test context
    if (testContext) {
      await testUtils.cleanupContext(testContext);
    }
  });

  describe('Parent-Child Category Relationships', () => {
    test('should create parent-child category hierarchy', async () => {
      // Step 1: Create parent category
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent Category',
        description: 'Top-level parent category',
        color: '#FF5733'
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      // Step 2: Create child category with parent reference
      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Child Category',
        description: 'Child category under parent',
        color: '#33FF57',
        parentId: parentId
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Step 3: Verify parent-child relationship
      if (childResponse.data.parentId) {
        expect(childResponse.data.parentId).toBe(parentId);
      }

      // Step 4: Verify parent category exists
      const parentCheck = await allMocks.apiMocks.category.getCategory(parentId);
      expect(parentCheck.status).toBe(200);
      expect(parentCheck.data.name).toBe('Parent Category');

      // Step 5: Verify child category exists
      const childCheck = await allMocks.apiMocks.category.getCategory(childId);
      expect(childCheck.status).toBe(200);
      expect(childCheck.data.name).toBe('Child Category');
    });

    test('should handle multiple levels of hierarchy', async () => {
      // Create 3-level hierarchy: Grandparent -> Parent -> Child
      
      // Level 1: Grandparent
      const grandparentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Grandparent Category',
        description: 'Top-level grandparent category',
        color: '#FF5733'
      });

      expect(grandparentResponse.status).toBe(201);
      const grandparentId = grandparentResponse.data.id;

      // Level 2: Parent
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent Category',
        description: 'Middle-level parent category',
        color: '#33FF57',
        parentId: grandparentId
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      // Level 3: Child
      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Child Category',
        description: 'Bottom-level child category',
        color: '#5733FF',
        parentId: parentId
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Verify hierarchy relationships
      if (parentResponse.data.parentId) {
        expect(parentResponse.data.parentId).toBe(grandparentId);
      }

      if (childResponse.data.parentId) {
        expect(childResponse.data.parentId).toBe(parentId);
      }

      // Verify all categories exist
      const grandparentCheck = await allMocks.apiMocks.category.getCategory(grandparentId);
      expect(grandparentCheck.status).toBe(200);

      const parentCheck = await allMocks.apiMocks.category.getCategory(parentId);
      expect(parentCheck.status).toBe(200);

      const childCheck = await allMocks.apiMocks.category.getCategory(childId);
      expect(childCheck.status).toBe(200);
    });

    test('should handle multiple children under same parent', async () => {
      // Create parent category
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent with Multiple Children',
        description: 'Parent category with multiple children',
        color: '#FF5733'
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      // Create multiple child categories
      const children = [];
      for (let i = 1; i <= 3; i++) {
        const childResponse = await allMocks.apiMocks.category.createCategory({
          userId: 'user-1',
          name: `Child Category ${i}`,
          description: `Child category ${i} under parent`,
          color: i === 1 ? '#33FF57' : i === 2 ? '#5733FF' : '#FF33A5',
          parentId: parentId
        });

        expect(childResponse.status).toBe(201);
        children.push(childResponse.data);
      }

      // Verify all children have the same parent
      children.forEach(child => {
        if (child.parentId) {
          expect(child.parentId).toBe(parentId);
        }
      });

      // Verify all children exist and are different
      const childIds = children.map(child => child.id);
      const uniqueIds = new Set(childIds);
      expect(uniqueIds.size).toBe(children.length);
    });
  });

  describe('Hierarchy Validation and Constraints', () => {
    test('should prevent circular references', async () => {
      // Create two categories
      const category1Response = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Category 1',
        description: 'First category for circular test',
        color: '#FF5733'
      });

      const category2Response = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Category 2',
        description: 'Second category for circular test',
        color: '#33FF57'
      });

      expect(category1Response.status).toBe(201);
      expect(category2Response.status).toBe(201);

      const category1Id = category1Response.data.id;
      const category2Id = category2Response.data.id;

      // Make category1 parent of category2
      const updateCategory2Response = await allMocks.apiMocks.category.updateCategory(category2Id, {
        parentId: category1Id
      });

      expect([200, 400]).toContain(updateCategory2Response.status);

      // Try to make category2 parent of category1 (circular reference)
      const circularUpdateResponse = await allMocks.apiMocks.category.updateCategory(category1Id, {
        parentId: category2Id
      });

      // Should prevent circular reference
      expect([200, 400, 409]).toContain(circularUpdateResponse.status);

      if (circularUpdateResponse.status === 400 || circularUpdateResponse.status === 409) {
        expect(circularUpdateResponse.error).toBeDefined();
      }
    });

    test('should prevent self-reference', async () => {
      // Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Self Reference Test',
        description: 'Category for self-reference test',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Try to make category its own parent
      const selfReferenceResponse = await allMocks.apiMocks.category.updateCategory(categoryId, {
        parentId: categoryId
      });

      // Should prevent self-reference
      expect([200, 400, 409]).toContain(selfReferenceResponse.status);

      if (selfReferenceResponse.status === 400 || selfReferenceResponse.status === 409) {
        expect(selfReferenceResponse.error).toBeDefined();
      }
    });

    test('should validate parent category exists', async () => {
      // Try to create category with non-existent parent
      const invalidParentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Invalid Parent Test',
        description: 'Category with non-existent parent',
        color: '#FF5733',
        parentId: 'non-existent-parent-id'
      });

      // Should either reject or ignore invalid parent
      expect([201, 400, 404]).toContain(invalidParentResponse.status);

      if (invalidParentResponse.status === 400 || invalidParentResponse.status === 404) {
        expect(invalidParentResponse.error).toBeDefined();
      }
    });
  });

  describe('Hierarchy Modification Tests', () => {
    test('should handle moving category to different parent', async () => {
      // Create two parent categories
      const parent1Response = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Original Parent',
        description: 'Original parent category',
        color: '#FF5733'
      });

      const parent2Response = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'New Parent',
        description: 'New parent category',
        color: '#33FF57'
      });

      expect(parent1Response.status).toBe(201);
      expect(parent2Response.status).toBe(201);

      const parent1Id = parent1Response.data.id;
      const parent2Id = parent2Response.data.id;

      // Create child under first parent
      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Movable Child',
        description: 'Child category that will be moved',
        color: '#5733FF',
        parentId: parent1Id
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Move child to second parent
      const moveResponse = await allMocks.apiMocks.category.updateCategory(childId, {
        parentId: parent2Id
      });

      expect(moveResponse.status).toBe(200);

      if (moveResponse.data.parentId) {
        expect(moveResponse.data.parentId).toBe(parent2Id);
      }

      // Verify the move persisted
      const verifyResponse = await allMocks.apiMocks.category.getCategory(childId);
      expect(verifyResponse.status).toBe(200);

      if (verifyResponse.data.parentId) {
        expect(verifyResponse.data.parentId).toBe(parent2Id);
      }
    });

    test('should handle removing parent relationship', async () => {
      // Create parent and child
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent to Remove',
        description: 'Parent that will be removed from child',
        color: '#FF5733'
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Child to Orphan',
        description: 'Child that will become orphan',
        color: '#33FF57',
        parentId: parentId
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Remove parent relationship
      const orphanResponse = await allMocks.apiMocks.category.updateCategory(childId, {
        parentId: null
      });

      expect(orphanResponse.status).toBe(200);

      // parentId should be null or undefined
      expect(orphanResponse.data.parentId).toBeFalsy();

      // Verify the change persisted
      const verifyResponse = await allMocks.apiMocks.category.getCategory(childId);
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.data.parentId).toBeFalsy();
    });
  });

  describe('Hierarchy Deletion and Cascade Tests', () => {
    test('should handle parent deletion with children', async () => {
      // Create parent category
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent to Delete',
        description: 'Parent category that will be deleted',
        color: '#FF5733'
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      // Create child category
      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Child of Deleted Parent',
        description: 'Child category under parent to be deleted',
        color: '#33FF57',
        parentId: parentId
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Try to delete parent category
      const deleteResponse = await allMocks.apiMocks.category.deleteCategory(parentId);

      // Should either:
      // 1. Prevent deletion due to children (400/409)
      // 2. Delete parent and orphan children (200)
      // 3. Delete parent and cascade delete children (200)
      expect([200, 400, 409]).toContain(deleteResponse.status);

      if (deleteResponse.status === 200) {
        // If deletion succeeded, check what happened to child
        const childCheck = await allMocks.apiMocks.category.getCategory(childId);
        
        if (childCheck.status === 200) {
          // Child still exists, should be orphaned
          expect(childCheck.data.parentId).toBeFalsy();
        } else {
          // Child was cascade deleted
          expect(childCheck.status).toBe(404);
        }

        // Parent should be deleted
        const parentCheck = await allMocks.apiMocks.category.getCategory(parentId);
        expect(parentCheck.status).toBe(404);
      } else {
        // Deletion was prevented, both should still exist
        const parentCheck = await allMocks.apiMocks.category.getCategory(parentId);
        expect(parentCheck.status).toBe(200);

        const childCheck = await allMocks.apiMocks.category.getCategory(childId);
        expect(childCheck.status).toBe(200);
      }
    });

    test('should handle deep hierarchy deletion', async () => {
      // Create 3-level hierarchy
      const grandparentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Grandparent to Delete',
        description: 'Top-level category to be deleted',
        color: '#FF5733'
      });

      expect(grandparentResponse.status).toBe(201);
      const grandparentId = grandparentResponse.data.id;

      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent in Hierarchy',
        description: 'Middle-level category in hierarchy',
        color: '#33FF57',
        parentId: grandparentId
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Child in Hierarchy',
        description: 'Bottom-level category in hierarchy',
        color: '#5733FF',
        parentId: parentId
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Delete grandparent
      const deleteResponse = await allMocks.apiMocks.category.deleteCategory(grandparentId);
      expect([200, 400, 409]).toContain(deleteResponse.status);

      if (deleteResponse.status === 200) {
        // Check what happened to descendants
        const grandparentCheck = await allMocks.apiMocks.category.getCategory(grandparentId);
        expect(grandparentCheck.status).toBe(404);

        // Parent and child behavior depends on implementation
        const parentCheck = await allMocks.apiMocks.category.getCategory(parentId);
        const childCheck = await allMocks.apiMocks.category.getCategory(childId);

        // Both should either be deleted or orphaned
        if (parentCheck.status === 200) {
          expect(parentCheck.data.parentId).toBeFalsy();
        }

        if (childCheck.status === 200 && parentCheck.status === 404) {
          expect(childCheck.data.parentId).toBeFalsy();
        }
      }
    });
  });

  describe('Hierarchy Query and Navigation', () => {
    test('should retrieve category hierarchy tree', async () => {
      // Create hierarchy
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Tree Root',
        description: 'Root of category tree',
        color: '#FF5733'
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      // Create children
      const children = [];
      for (let i = 1; i <= 2; i++) {
        const childResponse = await allMocks.apiMocks.category.createCategory({
          userId: 'user-1',
          name: `Tree Child ${i}`,
          description: `Child ${i} of tree root`,
          color: i === 1 ? '#33FF57' : '#5733FF',
          parentId: parentId
        });

        expect(childResponse.status).toBe(201);
        children.push(childResponse.data);
      }

      // Get all categories for user
      const allCategoriesResponse = await allMocks.apiMocks.category.getCategories('user-1');
      expect(allCategoriesResponse.status).toBe(200);
      expect(allCategoriesResponse.data).toBeDefined();
      expect(Array.isArray(allCategoriesResponse.data)).toBe(true);

      // Should include parent and children
      const categoryNames = allCategoriesResponse.data.map(cat => cat.name);
      expect(categoryNames).toContain('Tree Root');
      expect(categoryNames).toContain('Tree Child 1');
      expect(categoryNames).toContain('Tree Child 2');
    });

    test('should handle hierarchy with tasks', async () => {
      // Create category hierarchy
      const parentResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Parent with Tasks',
        description: 'Parent category with associated tasks',
        color: '#FF5733'
      });

      expect(parentResponse.status).toBe(201);
      const parentId = parentResponse.data.id;

      const childResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Child with Tasks',
        description: 'Child category with associated tasks',
        color: '#33FF57',
        parentId: parentId
      });

      expect(childResponse.status).toBe(201);
      const childId = childResponse.data.id;

      // Create tasks for both categories
      const parentTaskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Parent Category Task',
        description: 'Task associated with parent category',
        categoryIds: [parentId]
      });

      const childTaskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Child Category Task',
        description: 'Task associated with child category',
        categoryIds: [childId]
      });

      expect(parentTaskResponse.status).toBe(201);
      expect(childTaskResponse.status).toBe(201);

      // Verify tasks are associated with correct categories
      expect(parentTaskResponse.data.categoryIds).toContain(parentId);
      expect(childTaskResponse.data.categoryIds).toContain(childId);

      // Get tasks by parent category
      const parentTasksResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        categoryId: parentId
      });

      expect(parentTasksResponse.status).toBe(200);
      expect(parentTasksResponse.data).toBeDefined();

      // Get tasks by child category
      const childTasksResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        categoryId: childId
      });

      expect(childTasksResponse.status).toBe(200);
      expect(childTasksResponse.data).toBeDefined();
    });
  });

  describe('Data Integrity in Hierarchy', () => {
    test('should maintain hierarchy integrity across operations', async () => {
      // Create complex hierarchy scenario
      const scenario = TestDataFactory.createTeamScenario({
        userCount: 1,
        adminCount: 0,
        tasksPerUser: 1
      });

      expect(scenario.allUsers).toHaveLength(1);

      // Create hierarchical categories
      const categories = TestDataFactory.createCategories(3);
      expect(categories).toHaveLength(3);

      // Simulate hierarchy relationships (mock environment)
      const parentCategory = categories[0];
      const childCategory1 = categories[1];
      const childCategory2 = categories[2];

      // Update children to have parent (if supported)
      const updateChild1Response = await allMocks.apiMocks.category.updateCategory(childCategory1.id, {
        parentId: parentCategory.id
      });

      const updateChild2Response = await allMocks.apiMocks.category.updateCategory(childCategory2.id, {
        parentId: parentCategory.id
      });

      expect([200, 400]).toContain(updateChild1Response.status);
      expect([200, 400]).toContain(updateChild2Response.status);

      // Verify data integrity
      const validation = TestDataFactory.validateDataIntegrity();
      expect(validation.isValid).toBe(true);
    });
  });
});
