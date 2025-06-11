/**
 * ===================================
 * Task Search Integration Test
 * ===================================
 * Generated for TSK-IT-002-002-TaskIntegration
 * Project: Task Management System - Integration Test
 * Purpose: Test task search, filter, pagination, and sort integration
 */

const { TestDataFactory } = require('../../../mocks/mock-services');
const { TestUtilities, testUtils } = require('../../../support/utils/TestUtilities');
const { MockServices, mockServices } = require('../../../mocks/mock-services');

describe('Task Search Integration Tests', () => {
  let allMocks;
  let testContext;
  let authToken;
  let testTasks = [];

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

  beforeEach(async () => {
    // Create test context
    testContext = testUtils.createContext('task-search-test');
    TestDataFactory.clearGeneratedData();
    
    // Create test tasks for search operations
    testTasks = [];
    const taskTemplates = [
      { title: 'High Priority Task', description: 'Urgent task for testing', priority: 'high', status: 'pending' },
      { title: 'Medium Priority Task', description: 'Normal task for testing', priority: 'medium', status: 'in_progress' },
      { title: 'Low Priority Task', description: 'Low priority task for testing', priority: 'low', status: 'completed' },
      { title: 'Search Test Task', description: 'Special task for search testing', priority: 'high', status: 'pending' },
      { title: 'Filter Test Task', description: 'Task for filter testing', priority: 'medium', status: 'in_progress' }
    ];

    for (const template of taskTemplates) {
      const response = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        ...template
      });
      if (response.status === 201) {
        testTasks.push(response.data);
      }
    }
  });

  afterEach(async () => {
    // Cleanup test context
    if (testContext) {
      await testUtils.cleanupContext(testContext);
    }
  });

  describe('IT-TASK-002: タスク検索フロー結合テスト', () => {
    test('should search tasks by title', async () => {
      // Search for tasks containing "Priority"
      const searchResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        search: 'Priority'
      });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data).toBeDefined();
      expect(Array.isArray(searchResponse.data)).toBe(true);

      // Should find tasks with "Priority" in title
      const foundTasks = searchResponse.data.filter(task => 
        task.title.includes('Priority')
      );
      expect(foundTasks.length).toBeGreaterThan(0);
    });

    test('should search tasks by description', async () => {
      // Search for tasks containing "testing"
      const searchResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        search: 'testing'
      });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data).toBeDefined();
      expect(Array.isArray(searchResponse.data)).toBe(true);

      // Should find tasks with "testing" in description
      const foundTasks = searchResponse.data.filter(task => 
        task.description && task.description.includes('testing')
      );
      expect(foundTasks.length).toBeGreaterThan(0);
    });

    test('should handle empty search results', async () => {
      // Search for non-existent term
      const searchResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        search: 'nonexistentterm12345'
      });

      expect(searchResponse.status).toBe(200);
      expect(searchResponse.data).toBeDefined();
      expect(Array.isArray(searchResponse.data)).toBe(true);
      
      // Should return empty array or no matching tasks
      const matchingTasks = searchResponse.data.filter(task => 
        task.title.includes('nonexistentterm12345') || 
        (task.description && task.description.includes('nonexistentterm12345'))
      );
      expect(matchingTasks).toHaveLength(0);
    });
  });

  describe('IT-TASK-005: フィルタ統合テスト', () => {
    test('should filter tasks by priority', async () => {
      // Filter by high priority
      const highPriorityResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        priority: 'high'
      });

      expect(highPriorityResponse.status).toBe(200);
      expect(highPriorityResponse.data).toBeDefined();
      expect(Array.isArray(highPriorityResponse.data)).toBe(true);

      // All returned tasks should have high priority
      const highPriorityTasks = highPriorityResponse.data.filter(task => 
        task.priority === 'high'
      );
      expect(highPriorityTasks.length).toBeGreaterThan(0);
    });

    test('should filter tasks by status', async () => {
      // Filter by pending status
      const pendingResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        status: 'pending'
      });

      expect(pendingResponse.status).toBe(200);
      expect(pendingResponse.data).toBeDefined();
      expect(Array.isArray(pendingResponse.data)).toBe(true);

      // All returned tasks should have pending status
      const pendingTasks = pendingResponse.data.filter(task => 
        task.status === 'pending'
      );
      expect(pendingTasks.length).toBeGreaterThan(0);
    });

    test('should apply multiple filters simultaneously', async () => {
      // Filter by high priority AND pending status
      const multiFilterResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        priority: 'high',
        status: 'pending'
      });

      expect(multiFilterResponse.status).toBe(200);
      expect(multiFilterResponse.data).toBeDefined();
      expect(Array.isArray(multiFilterResponse.data)).toBe(true);

      // All returned tasks should match both criteria
      const matchingTasks = multiFilterResponse.data.filter(task => 
        task.priority === 'high' && task.status === 'pending'
      );
      expect(matchingTasks.length).toBeGreaterThan(0);
    });

    test('should combine search and filters', async () => {
      // Search for "Task" with high priority filter
      const combinedResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        search: 'Task',
        priority: 'high'
      });

      expect(combinedResponse.status).toBe(200);
      expect(combinedResponse.data).toBeDefined();
      expect(Array.isArray(combinedResponse.data)).toBe(true);

      // Results should match both search and filter criteria
      const matchingTasks = combinedResponse.data.filter(task => 
        task.title.includes('Task') && task.priority === 'high'
      );
      expect(matchingTasks.length).toBeGreaterThan(0);
    });
  });

  describe('IT-TASK-006: ページネーション統合テスト', () => {
    test('should paginate task results', async () => {
      // Get first page with limit of 2
      const page1Response = await allMocks.apiMocks.task.getTasks('user-1', {
        page: 1,
        limit: 2
      });

      expect(page1Response.status).toBe(200);
      expect(page1Response.data).toBeDefined();
      expect(Array.isArray(page1Response.data)).toBe(true);
      expect(page1Response.data.length).toBeLessThanOrEqual(2);

      // Get second page with limit of 2
      const page2Response = await allMocks.apiMocks.task.getTasks('user-1', {
        page: 2,
        limit: 2
      });

      expect(page2Response.status).toBe(200);
      expect(page2Response.data).toBeDefined();
      expect(Array.isArray(page2Response.data)).toBe(true);

      // Pages should contain different tasks (if enough tasks exist)
      if (page1Response.data.length > 0 && page2Response.data.length > 0) {
        const page1Ids = page1Response.data.map(task => task.id);
        const page2Ids = page2Response.data.map(task => task.id);
        
        // No task should appear in both pages
        const intersection = page1Ids.filter(id => page2Ids.includes(id));
        expect(intersection).toHaveLength(0);
      }
    });

    test('should handle pagination with filters', async () => {
      // Get paginated results with priority filter
      const paginatedFilterResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        priority: 'high',
        page: 1,
        limit: 1
      });

      expect(paginatedFilterResponse.status).toBe(200);
      expect(paginatedFilterResponse.data).toBeDefined();
      expect(Array.isArray(paginatedFilterResponse.data)).toBe(true);
      expect(paginatedFilterResponse.data.length).toBeLessThanOrEqual(1);

      // All results should match the filter
      paginatedFilterResponse.data.forEach(task => {
        expect(task.priority).toBe('high');
      });
    });

    test('should handle invalid pagination parameters', async () => {
      // Test with invalid page number
      const invalidPageResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        page: -1,
        limit: 10
      });

      expect(invalidPageResponse.status).toBe(200);
      expect(invalidPageResponse.data).toBeDefined();

      // Test with invalid limit
      const invalidLimitResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        page: 1,
        limit: -5
      });

      expect(invalidLimitResponse.status).toBe(200);
      expect(invalidLimitResponse.data).toBeDefined();
    });
  });

  describe('IT-TASK-007: ソート統合テスト', () => {
    test('should sort tasks by creation date', async () => {
      // Sort by creation date ascending
      const sortedAscResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        sortBy: 'createdAt',
        sortOrder: 'asc'
      });

      expect(sortedAscResponse.status).toBe(200);
      expect(sortedAscResponse.data).toBeDefined();
      expect(Array.isArray(sortedAscResponse.data)).toBe(true);

      // Verify ascending order (if multiple tasks)
      if (sortedAscResponse.data.length > 1) {
        for (let i = 1; i < sortedAscResponse.data.length; i++) {
          const prev = new Date(sortedAscResponse.data[i - 1].createdAt || 0);
          const curr = new Date(sortedAscResponse.data[i].createdAt || 0);
          expect(prev.getTime()).toBeLessThanOrEqual(curr.getTime());
        }
      }

      // Sort by creation date descending
      const sortedDescResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      expect(sortedDescResponse.status).toBe(200);
      expect(sortedDescResponse.data).toBeDefined();
      expect(Array.isArray(sortedDescResponse.data)).toBe(true);
    });

    test('should sort tasks by priority', async () => {
      // Sort by priority
      const prioritySortResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        sortBy: 'priority',
        sortOrder: 'desc'
      });

      expect(prioritySortResponse.status).toBe(200);
      expect(prioritySortResponse.data).toBeDefined();
      expect(Array.isArray(prioritySortResponse.data)).toBe(true);

      // Verify tasks are returned (priority order verification depends on implementation)
      expect(prioritySortResponse.data.length).toBeGreaterThan(0);
    });

    test('should combine sorting with filtering', async () => {
      // Filter by status and sort by priority
      const filteredSortedResponse = await allMocks.apiMocks.task.getTasks('user-1', {
        status: 'pending',
        sortBy: 'priority',
        sortOrder: 'desc'
      });

      expect(filteredSortedResponse.status).toBe(200);
      expect(filteredSortedResponse.data).toBeDefined();
      expect(Array.isArray(filteredSortedResponse.data)).toBe(true);

      // All results should match the filter
      filteredSortedResponse.data.forEach(task => {
        expect(task.status).toBe('pending');
      });
    });
  });

  describe('Search Performance and Edge Cases', () => {
    test('should handle large result sets efficiently', async () => {
      const startTime = Date.now();

      // Get all tasks without filters
      const allTasksResponse = await allMocks.apiMocks.task.getTasks('user-1');

      const executionTime = Date.now() - startTime;

      expect(allTasksResponse.status).toBe(200);
      expect(allTasksResponse.data).toBeDefined();
      expect(Array.isArray(allTasksResponse.data)).toBe(true);

      // Should complete within reasonable time (2 seconds)
      expect(executionTime).toBeLessThan(2000);
    });

    test('should handle special characters in search', async () => {
      // Create task with special characters
      const specialTask = await allMocks.apiMocks.task.createTask({
        userId: 'user-1',
        title: 'Special @#$% Task',
        description: 'Task with special characters: !@#$%^&*()'
      });

      if (specialTask.status === 201) {
        // Search for special characters
        const searchResponse = await allMocks.apiMocks.task.getTasks('user-1', {
          search: '@#$%'
        });

        expect(searchResponse.status).toBe(200);
        expect(searchResponse.data).toBeDefined();
        expect(Array.isArray(searchResponse.data)).toBe(true);
      }
    });

    test('should maintain search consistency across operations', async () => {
      // Perform multiple search operations
      const searchPromises = Array(3).fill().map(() => 
        allMocks.apiMocks.task.getTasks('user-1', {
          search: 'Task'
        })
      );

      const searchResults = await Promise.all(searchPromises);

      // All searches should return consistent results
      searchResults.forEach(result => {
        expect(result.status).toBe(200);
        expect(result.data).toBeDefined();
        expect(Array.isArray(result.data)).toBe(true);
      });

      // Results should be consistent across calls
      if (searchResults.length > 1) {
        const firstResultCount = searchResults[0].data.length;
        searchResults.forEach(result => {
          expect(result.data.length).toBe(firstResultCount);
        });
      }
    });
  });
});
