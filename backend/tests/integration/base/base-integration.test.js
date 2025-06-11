/**
 * ===================================
 * Base Integration Test
 * ===================================
 * Generated for TSK-IT-001-004-BaseTest
 * Project: Task Management System - Integration Test
 * Purpose: Test integration of all base components (TestDataFactory, TestUtilities, MockServices)
 */

const { TestDataFactory } = require("../../mocks/mock-services");
const {
  TestUtilities,
  testUtils,
} = require("../../../tests/support/utils/TestUtilities");
const { MockServices, mockServices } = require("../../mocks/mock-services");

describe("Base Integration Tests", () => {
  let testContext;
  let allMocks;

  beforeAll(async () => {
    // Initialize all base components
    await testUtils.initialize();
    allMocks = mockServices.setupAllMocks();
  });

  afterAll(async () => {
    // Cleanup all components
    await testUtils.shutdown();
    mockServices.resetAllMocks();
  });

  beforeEach(() => {
    // Create test context for each test
    testContext = testUtils.createContext("base-integration-test");
    TestDataFactory.clearGeneratedData();
  });

  afterEach(async () => {
    // Cleanup test context
    if (testContext) {
      await testUtils.cleanupContext(testContext);
    }
  });

  describe("Component Initialization", () => {
    test("should initialize all base components successfully", () => {
      expect(testUtils).toBeDefined();
      expect(testUtils.authHelper).toBeDefined();
      expect(testUtils.apiHelper).toBeDefined();
      expect(testUtils.dbHelper).toBeDefined();

      expect(allMocks.apiMocks.auth).toBeDefined();
      expect(allMocks.apiMocks.task).toBeDefined();
      expect(allMocks.apiMocks.category).toBeDefined();
      expect(allMocks.browserMocks.browser).toBeDefined();
      expect(allMocks.browserMocks.localStorage).toBeDefined();
      expect(allMocks.services).toBeDefined();
    });

    test("should have singleton instances", () => {
      const testUtils1 = TestUtilities.getInstance();
      const testUtils2 = TestUtilities.getInstance();
      expect(testUtils1).toBe(testUtils2);

      const mockServices1 = MockServices.getInstance();
      const mockServices2 = MockServices.getInstance();
      expect(mockServices1).toBe(mockServices2);
    });
  });

  describe("TestDataFactory Integration", () => {
    test("should integrate with TestUtilities for user scenarios", async () => {
      // Create user scenario using TestDataFactory
      const scenario = TestDataFactory.createUserScenario({
        userType: "user",
        taskCount: 5,
        categoryCount: 3,
      });

      expect(scenario.user).toBeDefined();
      expect(scenario.tasks).toHaveLength(5);
      expect(scenario.categories).toHaveLength(3);

      // Use TestUtilities to authenticate the user (use predefined test user)
      const credentials = {
        email: "test@example.com",
        password: "testpassword123",
      };

      const authResult = await testUtils.authenticateUser(credentials);
      expect(authResult).toBeDefined();
      expect(authResult.accessToken).toBeDefined();

      // Verify data integrity
      const validation = TestDataFactory.validateDataIntegrity();
      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test("should integrate with MockServices for team scenarios", async () => {
      // Create team scenario using TestDataFactory
      const teamScenario = TestDataFactory.createTeamScenario({
        userCount: 2,
        adminCount: 1,
        tasksPerUser: 3,
      });

      expect(teamScenario.allUsers).toHaveLength(3);
      expect(teamScenario.allTasks).toHaveLength(9);

      // Use MockServices to simulate API calls (use predefined test user)
      const loginResponse = await allMocks.apiMocks.auth.login({
        email: "user1@example.com",
        password: "testpassword123",
      });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data.user).toBeDefined();
    });
  });

  describe("TestUtilities Integration", () => {
    test("should integrate with MockServices for API operations", async () => {
      // Use predefined test user for session creation
      const testUser = {
        id: "user-test-1",
        email: "test@example.com",
        username: "testuser",
        role: "user",
      };

      // Use TestUtilities to create user session
      const session = await testUtils.createUserSession(testUser);
      expect(session).toBeDefined();
      expect(session.sessionId).toBeDefined();

      // Use MockServices to simulate API requests
      const taskData = {
        userId: testUser.id,
        title: "Integration Test Task",
        description: "Task created during integration test",
      };

      const createResponse = await allMocks.apiMocks.task.createTask(taskData);
      expect(createResponse.status).toBe(201);
      expect(createResponse.data.title).toBe("Integration Test Task");

      // Cleanup session using TestUtilities
      await testUtils.cleanupUserSession(session.sessionId);
    });

    test("should integrate with browser mocks for UI testing", async () => {
      // Setup browser environment using MockServices
      const browserAPI = allMocks.browserMocks.browser;
      const localStorage = allMocks.browserMocks.localStorage;

      // Use TestUtilities to measure performance
      const { result, metrics } = await testUtils.measurePerformance(
        async () => {
          // Simulate browser operations
          browserAPI.navigate("http://localhost:3000/tasks");
          localStorage.setItem(
            "user-preferences",
            JSON.stringify({ theme: "dark" })
          );

          const window = browserAPI.getWindow();
          expect(window.location.pathname).toBe("/tasks");

          const preferences = JSON.parse(
            localStorage.getItem("user-preferences")
          );
          expect(preferences.theme).toBe("dark");

          return "browser-operations-completed";
        },
        "browser-integration-test"
      );

      expect(result).toBe("browser-operations-completed");
      expect(metrics.executionTime).toBeGreaterThan(0);
    });
  });

  describe("MockServices Integration", () => {
    test("should integrate all mock types for complete workflow", async () => {
      // Create test data using TestDataFactory
      const user = TestDataFactory.createAdminUser();
      const category = TestDataFactory.createWorkCategory();

      // Setup test context using TestUtilities
      const testId = testUtils.createContext("mock-integration-test");

      try {
        // Step 1: Authentication using Auth API Mock
        const loginResponse = await allMocks.apiMocks.auth.login({
          email: user.email,
          password: "adminpassword123",
        });
        expect(loginResponse.status).toBe(200);

        // Step 2: Create category using Category API Mock
        const categoryResponse =
          await allMocks.apiMocks.category.createCategory({
            name: category.name,
            color: category.color,
            description: category.description,
          });
        expect(categoryResponse.status).toBe(201);

        // Step 3: Create task using Task API Mock
        const taskResponse = await allMocks.apiMocks.task.createTask({
          userId: user.id,
          title: "Integration Test Task",
          description: "Complete integration test",
        });
        expect(taskResponse.status).toBe(201);

        // Step 4: Browser operations using Browser API Mock
        const localStorage = allMocks.browserMocks.localStorage;
        localStorage.setItem("current-user", JSON.stringify(user));
        localStorage.setItem(
          "active-tasks",
          JSON.stringify([taskResponse.data])
        );

        // Step 5: Verify all operations
        const storedUser = JSON.parse(localStorage.getItem("current-user"));
        expect(storedUser.id).toBe(user.id);

        const activeTasks = JSON.parse(localStorage.getItem("active-tasks"));
        expect(activeTasks).toHaveLength(1);
        expect(activeTasks[0].title).toBe("Integration Test Task");
      } finally {
        // Cleanup using TestUtilities
        await testUtils.cleanupContext(testId);
      }
    });
  });

  describe("Error Handling Integration", () => {
    test("should handle authentication errors gracefully", async () => {
      // Test invalid credentials
      const invalidCredentials = {
        email: "invalid@example.com",
        password: "wrongpassword",
      };

      await expect(
        testUtils.authenticateUser(invalidCredentials)
      ).rejects.toThrow();

      // Test API error handling
      const errorResponse =
        await allMocks.apiMocks.auth.login(invalidCredentials);
      expect(errorResponse.status).toBe(401);
      expect(errorResponse.error).toBeDefined();
    });

    test("should recover from component failures", async () => {
      // Simulate component failure and recovery
      const originalAuthHelper = testUtils.authHelper;
      testUtils.authHelper = null;

      // Verify error is thrown
      await expect(testUtils.authenticateUser({})).rejects.toThrow(
        "Auth helper not initialized"
      );

      // Restore component
      testUtils.authHelper = originalAuthHelper;

      // Verify recovery
      const user = TestDataFactory.createRegularUser();
      const credentials = {
        email: user.email,
        password: "testpassword123",
      };

      const authResult = await testUtils.authenticateUser(credentials);
      expect(authResult).toBeDefined();
    });
  });

  describe("Data Consistency Integration", () => {
    test("should maintain data consistency across components", async () => {
      // Create related data using TestDataFactory
      const user = TestDataFactory.createRegularUser();
      const tasks = TestDataFactory.createTaskList(user.id, 3);
      const categories = TestDataFactory.createCategories(2);

      // Verify data relationships
      tasks.forEach((task) => {
        expect(task.userId).toBe(user.id);
      });

      // Test data integrity
      const validation = TestDataFactory.validateDataIntegrity();
      expect(validation.isValid).toBe(true);

      // Get generated data statistics
      const data = TestDataFactory.getGeneratedData();
      expect(data.users).toHaveLength(1);
      expect(data.tasks).toHaveLength(3);
      expect(data.categories).toHaveLength(2);

      // Verify data can be retrieved by ID
      expect(TestDataFactory.getUserById(user.id)).toEqual(user);
      tasks.forEach((task) => {
        expect(TestDataFactory.getTaskById(task.id)).toEqual(task);
      });
    });
  });

  describe("Performance Integration", () => {
    test("should perform efficiently under load", async () => {
      const startTime = Date.now();

      // Create large dataset
      const users = TestDataFactory.createUsers(10, "user");
      const admins = TestDataFactory.createUsers(2, "admin");
      const categories = TestDataFactory.createCategories(5);

      // Create tasks for each user
      const allTasks = [];
      for (const user of [...users, ...admins]) {
        const userTasks = TestDataFactory.createTaskList(user.id, 5);
        allTasks.push(...userTasks);
      }

      const dataCreationTime = Date.now() - startTime;

      // Verify performance
      expect(dataCreationTime).toBeLessThan(5000); // Should complete within 5 seconds
      expect(allTasks).toHaveLength(60); // 12 users * 5 tasks each

      // Test API mock performance
      const apiStartTime = Date.now();
      const promises = users.slice(0, 5).map((user) =>
        allMocks.apiMocks.auth.login({
          email: user.email,
          password: "testpassword123",
        })
      );

      const responses = await Promise.all(promises);
      const apiTime = Date.now() - apiStartTime;

      expect(apiTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(responses).toHaveLength(5);
      responses.forEach((response) => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe("Base Component Stability", () => {
    test("should maintain stability under repeated operations", async () => {
      const iterations = 20;
      const results = [];

      for (let i = 0; i < iterations; i++) {
        // Create test scenario
        const scenario = TestDataFactory.createUserScenario({
          userType: "user",
          taskCount: 3,
          categoryCount: 2,
        });

        // Test authentication
        const authResponse = await allMocks.apiMocks.auth.login({
          email: scenario.user.email,
          password: "testpassword123",
        });

        // Test task operations
        const taskResponse = await allMocks.apiMocks.task.createTask({
          userId: scenario.user.id,
          title: `Stability Test Task ${i}`,
          description: "Testing stability",
        });

        // Store results
        results.push({
          iteration: i,
          authSuccess: authResponse.status === 200,
          taskSuccess: taskResponse.status === 201,
          dataIntegrity: TestDataFactory.validateDataIntegrity().isValid,
        });

        // Cleanup for next iteration
        TestDataFactory.clearGeneratedData();
      }

      // Verify all iterations succeeded
      const successfulIterations = results.filter(
        (r) => r.authSuccess && r.taskSuccess && r.dataIntegrity
      );

      expect(successfulIterations).toHaveLength(iterations);
      expect(results.every((r) => r.dataIntegrity)).toBe(true);
    });

    test("should handle concurrent operations safely", async () => {
      const concurrentOperations = 10;
      const promises = [];

      for (let i = 0; i < concurrentOperations; i++) {
        promises.push(async () => {
          const user = TestDataFactory.createRegularUser();
          const tasks = TestDataFactory.createTaskList(user.id, 2);

          const authResponse = await allMocks.apiMocks.auth.login({
            email: user.email,
            password: "testpassword123",
          });

          return {
            user,
            tasks,
            authResponse,
            operationId: i,
          };
        });
      }

      const results = await Promise.all(promises.map((p) => p()));

      // Verify all operations completed successfully
      expect(results).toHaveLength(concurrentOperations);
      results.forEach((result, index) => {
        expect(result.user).toBeDefined();
        expect(result.tasks).toHaveLength(2);
        expect(result.authResponse.status).toBe(200);
        expect(result.operationId).toBe(index);
      });

      // Verify data integrity after concurrent operations
      const validation = TestDataFactory.validateDataIntegrity();
      expect(validation.isValid).toBe(true);
    });
  });

  describe("Base Component Documentation", () => {
    test("should provide comprehensive component information", () => {
      // Test TestDataFactory documentation
      expect(TestDataFactory.createUser).toBeDefined();
      expect(TestDataFactory.createTask).toBeDefined();
      expect(TestDataFactory.createCategory).toBeDefined();
      expect(TestDataFactory.createUserScenario).toBeDefined();
      expect(TestDataFactory.createTeamScenario).toBeDefined();

      // Test TestUtilities documentation
      expect(testUtils.initialize).toBeDefined();
      expect(testUtils.shutdown).toBeDefined();
      expect(testUtils.createContext).toBeDefined();
      expect(testUtils.cleanupContext).toBeDefined();
      expect(testUtils.authenticateUser).toBeDefined();
      expect(testUtils.measurePerformance).toBeDefined();

      // Test MockServices documentation
      expect(mockServices.setupAllMocks).toBeDefined();
      expect(mockServices.resetAllMocks).toBeDefined();
      expect(mockServices.setupAuthAPIMock).toBeDefined();
      expect(mockServices.setupTaskAPIMock).toBeDefined();
      expect(mockServices.setupCategoryAPIMock).toBeDefined();
      expect(mockServices.setupBrowserAPIMock).toBeDefined();
      expect(mockServices.setupLocalStorageMock).toBeDefined();
    });
  });
});
