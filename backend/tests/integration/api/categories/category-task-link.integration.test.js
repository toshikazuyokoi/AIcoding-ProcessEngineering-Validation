/**
 * ===================================
 * Category Task Link Integration Test
 * ===================================
 * Generated for TSK-IT-002-003-CategoryIntegration
 * Project: Task Management System - Integration Test
 * Purpose: Test category-task relationship integration and flow
 */

const { TestDataFactory } = require('../../../mocks/mock-services');
const { TestUtilities, testUtils } = require('../../../support/utils/TestUtilities');
const { MockServices, mockServices } = require('../../../mocks/mock-services');

describe('Category Task Link Integration Tests', () => {
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
    testContext = testUtils.createContext('category-task-link-test');
    TestDataFactory.clearGeneratedData();
  });

  afterEach(async () => {
    // Cleanup test context
    if (testContext) {
      await testUtils.cleanupContext(testContext);
    }
  });

  describe('Category-Task Association Tests', () => {
    test('should create task with category association', async () => {
      // Step 1: Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Work Category',
        description: 'Category for work-related tasks',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Step 2: Create task with category
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Task with Category',
        description: 'Task associated with work category',
        categoryIds: [categoryId]
      });

      expect(taskResponse.status).toBe(201);
      expect(taskResponse.data.title).toBe('Task with Category');
      expect(taskResponse.data.categoryIds).toContain(categoryId);

      // Step 3: Verify task-category association
      const taskDetails = await allMocks.apiMocks.task.getTask(taskResponse.data.id);
      expect(taskDetails.status).toBe(200);
      expect(taskDetails.data.categoryIds).toContain(categoryId);

      // Step 4: Verify category can be retrieved
      const categoryDetails = await allMocks.apiMocks.category.getCategory(categoryId);
      expect(categoryDetails.status).toBe(200);
      expect(categoryDetails.data.name).toBe('Work Category');
    });

    test('should handle multiple categories per task', async () => {
      // Create multiple categories
      const categories = [];
      for (let i = 1; i <= 3; i++) {
        const response = await allMocks.apiMocks.category.createCategory({
          userId: 'user-1',
          name: `Category ${i}`,
          description: `Description for category ${i}`,
          color: i === 1 ? '#FF5733' : i === 2 ? '#33FF57' : '#5733FF'
        });

        expect(response.status).toBe(201);
        categories.push(response.data);
      }

      const categoryIds = categories.map(cat => cat.id);

      // Create task with multiple categories
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Multi-Category Task',
        description: 'Task associated with multiple categories',
        categoryIds: categoryIds
      });

      expect(taskResponse.status).toBe(201);
      expect(taskResponse.data.categoryIds).toEqual(expect.arrayContaining(categoryIds));

      // Verify all category associations
      categoryIds.forEach(categoryId => {
        expect(taskResponse.data.categoryIds).toContain(categoryId);
      });
    });

    test('should handle task without categories', async () => {
      // Create task without categories
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Task without Categories',
        description: 'Task not associated with any category'
      });

      expect(taskResponse.status).toBe(201);
      expect(taskResponse.data.title).toBe('Task without Categories');
      
      // categoryIds should be empty or undefined
      if (taskResponse.data.categoryIds) {
        expect(taskResponse.data.categoryIds).toHaveLength(0);
      }
    });
  });

  describe('Category Change Impact Tests', () => {
    test('should handle category changes in tasks', async () => {
      // Create categories
      const category1Response = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Original Category',
        description: 'Original category for task',
        color: '#FF5733'
      });

      const category2Response = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'New Category',
        description: 'New category for task',
        color: '#33FF57'
      });

      expect(category1Response.status).toBe(201);
      expect(category2Response.status).toBe(201);

      const category1Id = category1Response.data.id;
      const category2Id = category2Response.data.id;

      // Create task with first category
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Category Change Test Task',
        description: 'Task for testing category changes',
        categoryIds: [category1Id]
      });

      expect(taskResponse.status).toBe(201);
      const taskId = taskResponse.data.id;

      // Update task to use second category
      const updateResponse = await allMocks.apiMocks.task.updateTask(taskId, {
        categoryIds: [category2Id]
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.categoryIds).toContain(category2Id);
      expect(updateResponse.data.categoryIds).not.toContain(category1Id);

      // Verify the change persisted
      const verifyResponse = await allMocks.apiMocks.task.getTask(taskId);
      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.data.categoryIds).toContain(category2Id);
      expect(verifyResponse.data.categoryIds).not.toContain(category1Id);
    });

    test('should handle adding categories to existing task', async () => {
      // Create task without categories
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Task for Category Addition',
        description: 'Task to test adding categories'
      });

      expect(taskResponse.status).toBe(201);
      const taskId = taskResponse.data.id;

      // Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Added Category',
        description: 'Category to be added to task',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Add category to task
      const updateResponse = await allMocks.apiMocks.task.updateTask(taskId, {
        categoryIds: [categoryId]
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.categoryIds).toContain(categoryId);
    });

    test('should handle removing categories from task', async () => {
      // Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Category to Remove',
        description: 'Category that will be removed from task',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Create task with category
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Task for Category Removal',
        description: 'Task to test removing categories',
        categoryIds: [categoryId]
      });

      expect(taskResponse.status).toBe(201);
      const taskId = taskResponse.data.id;

      // Remove category from task
      const updateResponse = await allMocks.apiMocks.task.updateTask(taskId, {
        categoryIds: []
      });

      expect(updateResponse.status).toBe(200);
      
      // categoryIds should be empty
      if (updateResponse.data.categoryIds) {
        expect(updateResponse.data.categoryIds).toHaveLength(0);
      }
    });
  });

  describe('IT-CAT-003: カテゴリ使用中削除テスト', () => {
    test('should handle category deletion with associated tasks', async () => {
      // Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Category with Tasks',
        description: 'Category that has associated tasks',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Create task with category
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Task with Category to Delete',
        description: 'Task associated with category that will be deleted',
        categoryIds: [categoryId]
      });

      expect(taskResponse.status).toBe(201);
      const taskId = taskResponse.data.id;

      // Try to delete category that has associated tasks
      const deleteResponse = await allMocks.apiMocks.category.deleteCategory(categoryId);
      
      // Should either:
      // 1. Prevent deletion (400/409 error)
      // 2. Allow deletion and remove category from tasks (200)
      expect([200, 400, 409]).toContain(deleteResponse.status);

      if (deleteResponse.status === 200) {
        // If deletion succeeded, verify task no longer has the category
        const taskCheck = await allMocks.apiMocks.task.getTask(taskId);
        expect(taskCheck.status).toBe(200);
        
        if (taskCheck.data.categoryIds) {
          expect(taskCheck.data.categoryIds).not.toContain(categoryId);
        }

        // Verify category is deleted
        const categoryCheck = await allMocks.apiMocks.category.getCategory(categoryId);
        expect(categoryCheck.status).toBe(404);
      } else {
        // If deletion was prevented, verify category and task still exist
        const categoryCheck = await allMocks.apiMocks.category.getCategory(categoryId);
        expect(categoryCheck.status).toBe(200);

        const taskCheck = await allMocks.apiMocks.task.getTask(taskId);
        expect(taskCheck.status).toBe(200);
        expect(taskCheck.data.categoryIds).toContain(categoryId);
      }
    });

    test('should handle category deletion with multiple associated tasks', async () => {
      // Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Category with Multiple Tasks',
        description: 'Category associated with multiple tasks',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Create multiple tasks with the category
      const tasks = [];
      for (let i = 1; i <= 3; i++) {
        const response = await allMocks.apiMocks.task.createTask({
          userId: 'user-1',
          title: `Task ${i} with Category`,
          description: `Task ${i} associated with category`,
          categoryIds: [categoryId]
        });

        expect(response.status).toBe(201);
        tasks.push(response.data);
      }

      // Try to delete category
      const deleteResponse = await allMocks.apiMocks.category.deleteCategory(categoryId);
      expect([200, 400, 409]).toContain(deleteResponse.status);

      if (deleteResponse.status === 200) {
        // If deletion succeeded, verify all tasks no longer have the category
        for (const task of tasks) {
          const taskCheck = await allMocks.apiMocks.task.getTask(task.id);
          expect(taskCheck.status).toBe(200);
          
          if (taskCheck.data.categoryIds) {
            expect(taskCheck.data.categoryIds).not.toContain(categoryId);
          }
        }
      }
    });
  });

  describe('Category Filtering and Search', () => {
    test('should filter tasks by category', async () => {
      // Create categories
      const workCategoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Work',
        description: 'Work-related tasks',
        color: '#FF5733'
      });

      const personalCategoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Personal',
        description: 'Personal tasks',
        color: '#33FF57'
      });

      expect(workCategoryResponse.status).toBe(201);
      expect(personalCategoryResponse.status).toBe(201);

      const workCategoryId = workCategoryResponse.data.id;
      const personalCategoryId = personalCategoryResponse.data.id;

      // Create tasks with different categories
      const workTaskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Work Task',
        description: 'Task for work',
        categoryIds: [workCategoryId]
      });

      const personalTaskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Personal Task',
        description: 'Task for personal use',
        categoryIds: [personalCategoryId]
      });

      expect(workTaskResponse.status).toBe(201);
      expect(personalTaskResponse.status).toBe(201);

      // Filter tasks by work category
      const workTasksResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        categoryId: workCategoryId
      });

      expect(workTasksResponse.status).toBe(200);
      expect(workTasksResponse.data).toBeDefined();
      expect(Array.isArray(workTasksResponse.data)).toBe(true);

      // All returned tasks should have the work category
      workTasksResponse.data.forEach(task => {
        expect(task.categoryIds).toContain(workCategoryId);
      });

      // Filter tasks by personal category
      const personalTasksResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        categoryId: personalCategoryId
      });

      expect(personalTasksResponse.status).toBe(200);
      expect(personalTasksResponse.data).toBeDefined();
      expect(Array.isArray(personalTasksResponse.data)).toBe(true);

      // All returned tasks should have the personal category
      personalTasksResponse.data.forEach(task => {
        expect(task.categoryIds).toContain(personalCategoryId);
      });
    });

    test('should handle category-based task statistics', async () => {
      // Create category
      const categoryResponse = await allMocks.apiMocks.category.createCategory({
        userId: 'user-1',
        name: 'Statistics Category',
        description: 'Category for statistics testing',
        color: '#FF5733'
      });

      expect(categoryResponse.status).toBe(201);
      const categoryId = categoryResponse.data.id;

      // Create tasks with different statuses
      const taskStatuses = ['pending', 'in_progress', 'completed'];
      const tasks = [];

      for (const status of taskStatuses) {
        const response = await allMocks.apiMocks.task.createTask({
          userId: 'user-1',
          title: `${status} Task`,
          description: `Task with ${status} status`,
          status: status,
          categoryIds: [categoryId]
        });

        expect(response.status).toBe(201);
        tasks.push(response.data);
      }

      // Get tasks by category and verify status distribution
      const categoryTasksResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        categoryId: categoryId
      });

      expect(categoryTasksResponse.status).toBe(200);
      expect(categoryTasksResponse.data).toBeDefined();
      expect(Array.isArray(categoryTasksResponse.data)).toBe(true);

      // Should have tasks with different statuses
      const returnedStatuses = categoryTasksResponse.data.map(task => task.status);
      expect(returnedStatuses.length).toBeGreaterThan(0);
    });
  });

  describe('Data Integrity and Consistency', () => {
    test('should maintain referential integrity', async () => {
      // Create test scenario with categories and tasks
      const scenario = TestDataFactory.createTeamScenario({
        userCount: 1,
        adminCount: 0,
        tasksPerUser: 2
      });

      expect(scenario.allUsers).toHaveLength(1);
      expect(scenario.allTasks).toHaveLength(2);

      // Create categories and associate with tasks
      const categories = TestDataFactory.createCategories(2);
      expect(categories).toHaveLength(2);

      // Associate tasks with categories
      for (let i = 0; i < scenario.allTasks.length; i++) {
        const task = scenario.allTasks[i];
        const category = categories[i % categories.length];

        const updateResponse = await allMocks.apiMocks.task.updateTask(task.id, {
          categoryIds: [category.id]
        });

        expect(updateResponse.status).toBe(200);
      }

      // Verify data integrity
      const validation = TestDataFactory.validateDataIntegrity();
      expect(validation.isValid).toBe(true);
    });

    test('should handle complex category-task relationships', async () => {
      // Create multiple categories
      const categories = [];
      for (let i = 1; i <= 3; i++) {
        const response = await allMocks.apiMocks.category.createCategory({
          userId: 'user-1',
          name: `Complex Category ${i}`,
          description: `Category ${i} for complex relationship testing`,
          color: i === 1 ? '#FF5733' : i === 2 ? '#33FF57' : '#5733FF'
        });

        expect(response.status).toBe(201);
        categories.push(response.data);
      }

      // Create task with multiple categories
      const taskResponse = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Complex Relationship Task',
        description: 'Task with complex category relationships',
        categoryIds: categories.map(cat => cat.id)
      });

      expect(taskResponse.status).toBe(201);

      // Verify all category relationships
      categories.forEach(category => {
        expect(taskResponse.data.categoryIds).toContain(category.id);
      });

      // Update to remove one category
      const updatedCategoryIds = categories.slice(0, 2).map(cat => cat.id);
      const updateResponse = await allMocks.apiMocks.task.updateTask(taskResponse.data.id, {
        categoryIds: updatedCategoryIds
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.categoryIds).toHaveLength(2);
      expect(updateResponse.data.categoryIds).toEqual(expect.arrayContaining(updatedCategoryIds));
    });
  });
});
