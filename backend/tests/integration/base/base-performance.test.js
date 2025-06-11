/**
 * ===================================
 * Base Performance Test
 * ===================================
 * Generated for TSK-IT-001-004-BaseTest
 * Project: Task Management System - Integration Test
 * Purpose: Test performance of base components under various load conditions
 */

const { TestDataFactory } = require("../../mocks/mock-services");
const {
  TestUtilities,
  testUtils,
} = require("../../../tests/support/utils/TestUtilities");
const { MockServices, mockServices } = require("../../mocks/mock-services");

describe("Base Performance Tests", () => {
  let allMocks;
  let performanceResults = {};

  beforeAll(async () => {
    await testUtils.initialize();
    allMocks = mockServices.setupAllMocks();
  });

  afterAll(async () => {
    await testUtils.shutdown();
    mockServices.resetAllMocks();

    // Log performance summary
    console.log("\n=== Performance Test Summary ===");
    Object.entries(performanceResults).forEach(([test, result]) => {
      console.log(`${test}: ${result.executionTime}ms (${result.status})`);
    });
  });

  beforeEach(() => {
    TestDataFactory.clearGeneratedData();
  });

  describe("TestDataFactory Performance", () => {
    test("should generate large datasets efficiently", async () => {
      const testName = "Large Dataset Generation";
      const startTime = Date.now();

      try {
        // Generate large dataset
        const users = TestDataFactory.createUsers(100, "user");
        const admins = TestDataFactory.createUsers(10, "admin");
        const categories = TestDataFactory.createCategories(20);

        // Generate tasks for each user
        const allTasks = [];
        for (const user of [...users, ...admins]) {
          const userTasks = TestDataFactory.createTaskList(user.id, 10);
          allTasks.push(...userTasks);
        }

        const executionTime = Date.now() - startTime;

        // Performance assertions
        expect(executionTime).toBeLessThan(10000); // Should complete within 10 seconds
        expect(users).toHaveLength(100);
        expect(admins).toHaveLength(10);
        expect(categories).toHaveLength(20);
        expect(allTasks).toHaveLength(1100); // 110 users * 10 tasks each

        // Verify data integrity
        const validation = TestDataFactory.validateDataIntegrity();
        expect(validation.isValid).toBe(true);

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            usersGenerated: users.length + admins.length,
            tasksGenerated: allTasks.length,
            categoriesGenerated: categories.length,
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });

    test("should handle batch operations efficiently", async () => {
      const testName = "Batch Operations";
      const startTime = Date.now();

      try {
        // Test batch user creation
        const batchSize = 50;
        const batches = 5;
        const allUsers = [];

        for (let i = 0; i < batches; i++) {
          const batchUsers = TestDataFactory.createUsers(batchSize, "user");
          allUsers.push(...batchUsers);
        }

        // Test batch scenario creation
        const scenarios = [];
        for (let i = 0; i < 10; i++) {
          const scenario = TestDataFactory.createUserScenario({
            userType: "user",
            taskCount: 5,
            categoryCount: 2,
          });
          scenarios.push(scenario);
        }

        const executionTime = Date.now() - startTime;

        // Performance assertions
        expect(executionTime).toBeLessThan(8000); // Should complete within 8 seconds
        expect(allUsers).toHaveLength(250);
        expect(scenarios).toHaveLength(10);

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            batchesProcessed: batches,
            usersPerBatch: batchSize,
            scenariosCreated: scenarios.length,
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("MockServices Performance", () => {
    test("should handle concurrent API requests efficiently", async () => {
      const testName = "Concurrent API Requests";
      const startTime = Date.now();

      try {
        // Create test users
        const users = TestDataFactory.createUsers(20, "user");

        // Test concurrent authentication (use predefined test user)
        const authPromises = users.slice(0, 5).map(() =>
          allMocks.apiMocks.auth.login({
            email: "user1@example.com",
            password: "testpassword123",
          })
        );

        const authResponses = await Promise.all(authPromises);

        // Test concurrent task creation
        const taskPromises = users.map((user) =>
          allMocks.apiMocks.task.createTask({
            userId: user.id,
            title: `Task for ${user.username}`,
            description: "Performance test task",
          })
        );

        const taskResponses = await Promise.all(taskPromises);

        const executionTime = Date.now() - startTime;

        // Performance assertions
        expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
        expect(authResponses).toHaveLength(5);
        expect(taskResponses).toHaveLength(20);

        authResponses.forEach((response) => {
          expect(response.status).toBe(200);
        });

        taskResponses.forEach((response) => {
          expect(response.status).toBe(201);
        });

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            concurrentRequests: users.length * 2,
            avgResponseTime: executionTime / (users.length * 2),
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });

    test("should handle mock setup and teardown efficiently", async () => {
      const testName = "Mock Setup/Teardown";
      const startTime = Date.now();

      try {
        const iterations = 10;
        const setupTimes = [];
        const teardownTimes = [];

        for (let i = 0; i < iterations; i++) {
          // Measure setup time
          const setupStart = Date.now();
          const mocks = mockServices.setupAllMocks();
          const setupTime = Date.now() - setupStart;
          setupTimes.push(setupTime);

          // Verify mocks are working
          expect(mocks.apiMocks.auth).toBeDefined();
          expect(mocks.apiMocks.task).toBeDefined();
          expect(mocks.browserMocks.localStorage).toBeDefined();

          // Measure teardown time
          const teardownStart = Date.now();
          mockServices.resetAllMocks();
          const teardownTime = Date.now() - teardownStart;
          teardownTimes.push(teardownTime);
        }

        const executionTime = Date.now() - startTime;
        const avgSetupTime =
          setupTimes.reduce((a, b) => a + b, 0) / setupTimes.length;
        const avgTeardownTime =
          teardownTimes.reduce((a, b) => a + b, 0) / teardownTimes.length;

        // Performance assertions
        expect(executionTime).toBeLessThan(3000); // Should complete within 3 seconds
        expect(avgSetupTime).toBeLessThan(100); // Average setup should be under 100ms
        expect(avgTeardownTime).toBeLessThan(50); // Average teardown should be under 50ms

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            iterations,
            avgSetupTime: Math.round(avgSetupTime),
            avgTeardownTime: Math.round(avgTeardownTime),
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("TestUtilities Performance", () => {
    test("should handle utility operations efficiently", async () => {
      const testName = "Utility Operations";
      const startTime = Date.now();

      try {
        // Test context creation/cleanup performance
        const contexts = [];
        for (let i = 0; i < 20; i++) {
          const context = testUtils.createContext(`perf-test-${i}`);
          contexts.push(context);
        }

        // Test authentication performance (use predefined test user)
        const authPromises = Array(5)
          .fill()
          .map(() =>
            testUtils.authenticateUser({
              email: "test@example.com",
              password: "testpassword123",
            })
          );

        const authResults = await Promise.all(authPromises);

        // Test performance measurement utility
        const { result, metrics } = await testUtils.measurePerformance(
          async () => {
            // Simulate some work
            const data = TestDataFactory.createUserScenario({
              userType: "user",
              taskCount: 10,
              categoryCount: 3,
            });
            return data;
          },
          "scenario-creation-test"
        );

        // Cleanup contexts
        for (const context of contexts) {
          await testUtils.cleanupContext(context);
        }

        const executionTime = Date.now() - startTime;

        // Performance assertions
        expect(executionTime).toBeLessThan(6000); // Should complete within 6 seconds
        expect(authResults).toHaveLength(5);
        expect(result.user).toBeDefined();
        expect(metrics.executionTime).toBeGreaterThan(0);

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            contextsCreated: contexts.length,
            authenticationsPerformed: authResults.length,
            measurementOverhead: metrics.executionTime,
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("Memory Usage Performance", () => {
    test("should maintain reasonable memory usage", async () => {
      const testName = "Memory Usage";
      const startTime = Date.now();

      try {
        // Get initial memory usage
        const initialMemory = process.memoryUsage();

        // Create large dataset
        const users = TestDataFactory.createUsers(200, "user");
        const tasks = [];
        for (const user of users) {
          const userTasks = TestDataFactory.createTaskList(user.id, 20);
          tasks.push(...userTasks);
        }

        // Setup multiple mock instances
        const mockInstances = [];
        for (let i = 0; i < 10; i++) {
          const mocks = mockServices.setupAllMocks();
          mockInstances.push(mocks);
        }

        // Get peak memory usage
        const peakMemory = process.memoryUsage();

        // Cleanup
        TestDataFactory.clearGeneratedData();
        mockServices.resetAllMocks();

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        // Get final memory usage
        const finalMemory = process.memoryUsage();

        const executionTime = Date.now() - startTime;
        const memoryIncrease = peakMemory.heapUsed - initialMemory.heapUsed;
        const memoryMB = memoryIncrease / 1024 / 1024;

        // Performance assertions
        expect(executionTime).toBeLessThan(8000); // Should complete within 8 seconds
        expect(memoryMB).toBeLessThan(500); // Should use less than 500MB
        expect(users).toHaveLength(200);
        expect(tasks).toHaveLength(4000);

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            memoryIncreaseMB: Math.round(memoryMB),
            dataItemsCreated: users.length + tasks.length,
            mockInstancesCreated: mockInstances.length,
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("Stress Testing", () => {
    test("should handle stress conditions gracefully", async () => {
      const testName = "Stress Testing";
      const startTime = Date.now();

      try {
        // Stress test with rapid operations
        const operations = [];

        // Rapid data creation
        for (let i = 0; i < 50; i++) {
          operations.push(async () => {
            const user = TestDataFactory.createRegularUser();
            const tasks = TestDataFactory.createTaskList(user.id, 5);
            return { user, tasks };
          });
        }

        // Rapid API calls
        for (let i = 0; i < 30; i++) {
          operations.push(async () => {
            return allMocks.apiMocks.auth.login({
              email: "user1@example.com",
              password: "testpassword123",
            });
          });
        }

        // Execute all operations concurrently
        const results = await Promise.all(operations.map((op) => op()));

        const executionTime = Date.now() - startTime;

        // Verify results
        expect(results).toHaveLength(80);

        // Check data creation results
        const dataResults = results.slice(0, 50);
        dataResults.forEach((result) => {
          expect(result.user).toBeDefined();
          expect(result.tasks).toHaveLength(5);
        });

        // Check API call results
        const apiResults = results.slice(50);
        apiResults.forEach((result) => {
          expect(result.status).toBe(200);
        });

        // Performance assertions
        expect(executionTime).toBeLessThan(15000); // Should complete within 15 seconds

        performanceResults[testName] = {
          executionTime,
          status: "PASS",
          details: {
            totalOperations: operations.length,
            dataOperations: 50,
            apiOperations: 30,
            avgOperationTime: executionTime / operations.length,
          },
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        performanceResults[testName] = {
          executionTime,
          status: "FAIL",
          error: error.message,
        };
        throw error;
      }
    });
  });
});
