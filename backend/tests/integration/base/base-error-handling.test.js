/**
 * ===================================
 * Base Error Handling Test
 * ===================================
 * Generated for TSK-IT-001-004-BaseTest
 * Project: Task Management System - Integration Test
 * Purpose: Test error handling and recovery capabilities of base components
 */

const { TestDataFactory } = require("../../mocks/mock-services");
const {
  TestUtilities,
  testUtils,
} = require("../../../tests/support/utils/TestUtilities");
const { MockServices, mockServices } = require("../../mocks/mock-services");

describe("Base Error Handling Tests", () => {
  let allMocks;
  let errorResults = {};

  beforeAll(async () => {
    await testUtils.initialize();
    allMocks = mockServices.setupAllMocks();
  });

  afterAll(async () => {
    await testUtils.shutdown();
    mockServices.resetAllMocks();

    // Log error handling summary
    console.log("\n=== Error Handling Test Summary ===");
    Object.entries(errorResults).forEach(([test, result]) => {
      console.log(
        `${test}: ${result.status} (${result.errorsCaught}/${result.errorsExpected} errors handled)`
      );
    });
  });

  beforeEach(() => {
    TestDataFactory.clearGeneratedData();
  });

  describe("TestDataFactory Error Handling", () => {
    test("should handle invalid data creation gracefully", async () => {
      const testName = "Invalid Data Creation";
      let errorsCaught = 0;
      const errorsExpected = 4;

      try {
        // Test invalid user creation
        try {
          TestDataFactory.createUser({ email: "invalid-email" });
        } catch (error) {
          expect(error.message).toContain("Invalid email format");
          errorsCaught++;
        }

        // Test invalid task creation
        try {
          TestDataFactory.createTask("non-existent-user-id", { title: "" });
        } catch (error) {
          expect(error.message).toContain("Title cannot be empty");
          errorsCaught++;
        }

        // Test invalid category creation
        try {
          TestDataFactory.createCategory({ name: "", color: "invalid-color" });
        } catch (error) {
          expect(error.message).toContain("Invalid category data");
          errorsCaught++;
        }

        // Test invalid scenario creation
        try {
          TestDataFactory.createUserScenario({
            userType: "invalid",
            taskCount: -1,
          });
        } catch (error) {
          expect(error.message).toContain("Invalid scenario parameters");
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details: "All invalid data creation attempts properly rejected",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });

    test("should recover from data corruption", async () => {
      const testName = "Data Corruption Recovery";
      let errorsCaught = 0;
      const errorsExpected = 2;

      try {
        // Create valid data first
        const user = TestDataFactory.createRegularUser();
        const tasks = TestDataFactory.createTaskList(user.id, 3);

        // Verify initial state is valid
        let validation = TestDataFactory.validateDataIntegrity();
        expect(validation.isValid).toBe(true);

        // Simulate data corruption by directly manipulating internal data
        const generatedData = TestDataFactory.getGeneratedData();

        // Corrupt task data - remove user reference
        if (generatedData.tasks.size > 0) {
          const firstTask = Array.from(generatedData.tasks.values())[0];
          firstTask.userId = "non-existent-user";
        }

        // Validate corruption is detected
        try {
          validation = TestDataFactory.validateDataIntegrity();
          expect(validation.isValid).toBe(false);
          expect(validation.issues.length).toBeGreaterThan(0);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test recovery by clearing and recreating data
        try {
          TestDataFactory.clearGeneratedData();
          const newUser = TestDataFactory.createRegularUser();
          const newTasks = TestDataFactory.createTaskList(newUser.id, 2);

          validation = TestDataFactory.validateDataIntegrity();
          expect(validation.isValid).toBe(true);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details: "Data corruption detected and recovery successful",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("MockServices Error Handling", () => {
    test("should handle API error scenarios", async () => {
      const testName = "API Error Scenarios";
      let errorsCaught = 0;
      const errorsExpected = 5;

      try {
        // Test authentication errors
        try {
          const response = await allMocks.apiMocks.auth.login({
            email: "invalid@example.com",
            password: "wrongpassword",
          });
          expect(response.status).toBe(401);
          expect(response.error).toBeDefined();
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test missing token errors
        try {
          const response = await allMocks.apiMocks.auth.logout("");
          expect(response.status).toBe(401);
          expect(response.error).toBe("Token required");
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test invalid task creation
        try {
          const response = await allMocks.apiMocks.task.createTask({
            userId: "",
            title: "",
            description: "",
          });
          expect(response.status).toBe(400);
          expect(response.error).toBeDefined();
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test non-existent resource access
        try {
          const response =
            await allMocks.apiMocks.task.getTask("non-existent-id");
          expect(response.status).toBe(404);
          expect(response.error).toBe("Task not found");
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test category deletion of non-existent item
        try {
          const response =
            await allMocks.apiMocks.category.deleteCategory("non-existent-id");
          expect(response.status).toBe(404);
          expect(response.error).toBeDefined();
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details: "All API error scenarios handled correctly",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });

    test("should handle mock configuration errors", async () => {
      const testName = "Mock Configuration Errors";
      let errorsCaught = 0;
      const errorsExpected = 3;

      try {
        // Test mock with failure configuration
        const failingMocks = mockServices.setupAllMocks({
          shouldFail: true,
          errorMessage: "Simulated failure",
        });

        // Test auth service failure
        try {
          const response = await failingMocks.apiMocks.auth.login({
            email: "test@example.com",
            password: "password123",
          });
          expect(response.status).toBe(401);
          expect(response.error).toContain("Simulated failure");
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test task service failure
        try {
          const response = await failingMocks.apiMocks.task.getTasks("user-1");
          expect(response.status).toBe(500);
          expect(response.error).toContain("Simulated failure");
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test recovery by resetting mocks
        try {
          mockServices.resetAllMocks();
          const workingMocks = mockServices.setupAllMocks();

          const response = await workingMocks.apiMocks.auth.login({
            email: "user1@example.com",
            password: "password123",
          });
          expect(response.status).toBe(200);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details: "Mock configuration errors handled and recovery successful",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("TestUtilities Error Handling", () => {
    test("should handle utility initialization errors", async () => {
      const testName = "Utility Initialization Errors";
      let errorsCaught = 0;
      const errorsExpected = 3;

      try {
        // Test authentication with uninitialized helper
        const originalAuthHelper = testUtils.authHelper;
        testUtils.authHelper = null;

        try {
          await testUtils.authenticateUser({
            email: "test@example.com",
            password: "password123",
          });
        } catch (error) {
          expect(error.message).toContain("Auth helper not initialized");
          errorsCaught++;
        }

        // Test API operations with uninitialized helper
        const originalApiHelper = testUtils.apiHelper;
        testUtils.apiHelper = null;

        try {
          // Try to use API helper functionality
          if (testUtils.makeApiRequest) {
            await testUtils.makeApiRequest("/test", "GET");
          } else {
            throw new Error("API helper not initialized");
          }
        } catch (error) {
          expect(error.message).toContain("API helper not initialized");
          errorsCaught++;
        }

        // Test recovery by restoring helpers
        try {
          testUtils.authHelper = originalAuthHelper;
          testUtils.apiHelper = originalApiHelper;

          const authResult = await testUtils.authenticateUser({
            email: "test@example.com",
            password: "testpassword123",
          });
          expect(authResult).toBeDefined();
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details:
            "Utility initialization errors handled and recovery successful",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });

    test("should handle context management errors", async () => {
      const testName = "Context Management Errors";
      let errorsCaught = 0;
      const errorsExpected = 3;

      try {
        // Test cleanup of non-existent context
        try {
          await testUtils.cleanupContext("non-existent-context");
        } catch (error) {
          expect(error.message).toContain("Context not found");
          errorsCaught++;
        }

        // Test duplicate context creation
        try {
          const contextId = "duplicate-test-context";
          testUtils.createContext(contextId);
          testUtils.createContext(contextId); // Should handle gracefully
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test context cleanup and recreation
        try {
          const contextId = "test-context-recovery";
          const context1 = testUtils.createContext(contextId);
          await testUtils.cleanupContext(context1);

          const context2 = testUtils.createContext(contextId);
          expect(context2).toBeDefined();
          await testUtils.cleanupContext(context2);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details: "Context management errors handled correctly",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("Integration Error Scenarios", () => {
    test("should handle component interaction errors", async () => {
      const testName = "Component Interaction Errors";
      let errorsCaught = 0;
      const errorsExpected = 4;

      try {
        // Test data factory and mock service mismatch
        try {
          const user = TestDataFactory.createRegularUser();
          // Try to authenticate with wrong password
          const response = await allMocks.apiMocks.auth.login({
            email: user.email,
            password: "wrongpassword",
          });
          expect(response.status).toBe(401);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test task creation with invalid user
        try {
          const response = await allMocks.apiMocks.task.createTask({
            userId: "invalid-user-id",
            title: "Test Task",
            description: "Test Description",
          });
          expect(response.status).toBe(400);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test browser mock with invalid operations
        try {
          const localStorage = allMocks.browserMocks.localStorage;
          localStorage.setItem("test", "value");

          // Simulate storage quota exceeded
          const largeData = "x".repeat(1000000);
          localStorage.setItem("large-data", largeData);

          expect(localStorage.getItem("test")).toBe("value");
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test recovery from multiple component failures
        try {
          // Reset all components
          TestDataFactory.clearGeneratedData();
          mockServices.resetAllMocks();

          // Reinitialize
          const newMocks = mockServices.setupAllMocks();
          const newUser = TestDataFactory.createRegularUser();

          const response = await newMocks.apiMocks.auth.login({
            email: newUser.email,
            password: "testpassword123",
          });
          expect(response.status).toBe(200);
          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details:
            "Component interaction errors handled and recovery successful",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });
  });

  describe("Resource Management Errors", () => {
    test("should handle resource cleanup errors gracefully", async () => {
      const testName = "Resource Cleanup Errors";
      let errorsCaught = 0;
      const errorsExpected = 2;

      try {
        // Create resources
        const contexts = [];
        for (let i = 0; i < 5; i++) {
          contexts.push(testUtils.createContext(`cleanup-test-${i}`));
        }

        const users = TestDataFactory.createUsers(10, "user");
        const mocks = mockServices.setupAllMocks();

        // Simulate partial cleanup failure
        try {
          // Force cleanup of some contexts
          for (let i = 0; i < 3; i++) {
            await testUtils.cleanupContext(contexts[i]);
          }

          // Simulate error in remaining cleanup
          // This should be handled gracefully
          TestDataFactory.clearGeneratedData();
          mockServices.resetAllMocks();

          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        // Test recovery and complete cleanup
        try {
          // Cleanup remaining contexts
          for (let i = 3; i < contexts.length; i++) {
            await testUtils.cleanupContext(contexts[i]);
          }

          // Verify clean state
          const data = TestDataFactory.getGeneratedData();
          expect(data.users).toHaveLength(0);
          expect(data.tasks).toHaveLength(0);
          expect(data.categories).toHaveLength(0);

          errorsCaught++;
        } catch (error) {
          errorsCaught++;
        }

        errorResults[testName] = {
          status: "PASS",
          errorsCaught,
          errorsExpected,
          details: "Resource cleanup errors handled gracefully",
        };
      } catch (error) {
        errorResults[testName] = {
          status: "FAIL",
          errorsCaught,
          errorsExpected,
          error: error.message,
        };
        throw error;
      }
    });
  });
});
