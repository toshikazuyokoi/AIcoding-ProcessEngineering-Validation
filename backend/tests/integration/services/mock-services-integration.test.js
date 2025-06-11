/**
 * ===================================
 * MockServices Integration Test
 * ===================================
 * Generated for TSK-IT-001-003-MockServices
 * Project: Task Management System - Integration Test
 * Purpose: Test enhanced MockServices with integration test features
 */

const {
  MockServices,
  MockAuthAPI,
  MockTaskAPI,
  MockCategoryAPI,
  MockBrowserAPI,
  MockLocalStorage,
  mockServices,
} = require("../../mocks/mock-services");

describe("MockServices Integration Tests", () => {
  let mockServicesInstance;

  beforeEach(() => {
    mockServicesInstance = MockServices.getInstance();
    mockServicesInstance.resetAllMocks();
  });

  describe("MockServices Singleton", () => {
    test("should return singleton instance", () => {
      const instance1 = MockServices.getInstance();
      const instance2 = MockServices.getInstance();

      expect(instance1).toBe(instance2);
      expect(instance1).toBe(mockServicesInstance);
    });

    test("should have global instance available", () => {
      expect(mockServices).toBeDefined();
      expect(mockServices).toBeInstanceOf(MockServices);
    });
  });

  describe("API Mock Setup", () => {
    test("should setup Auth API mock", () => {
      const authAPI = mockServicesInstance.setupAuthAPIMock();

      expect(authAPI).toBeInstanceOf(MockAuthAPI);
      expect(mockServicesInstance.getMock("api", "auth")).toBe(authAPI);
    });

    test("should setup Task API mock", () => {
      const taskAPI = mockServicesInstance.setupTaskAPIMock();

      expect(taskAPI).toBeInstanceOf(MockTaskAPI);
      expect(mockServicesInstance.getMock("api", "task")).toBe(taskAPI);
    });

    test("should setup Category API mock", () => {
      const categoryAPI = mockServicesInstance.setupCategoryAPIMock();

      expect(categoryAPI).toBeInstanceOf(MockCategoryAPI);
      expect(mockServicesInstance.getMock("api", "category")).toBe(categoryAPI);
    });
  });

  describe("Browser Mock Setup", () => {
    test("should setup Browser API mock", () => {
      const browserAPI = mockServicesInstance.setupBrowserAPIMock();

      expect(browserAPI).toBeInstanceOf(MockBrowserAPI);
      expect(mockServicesInstance.getMock("browser", "browser")).toBe(
        browserAPI
      );
    });

    test("should setup LocalStorage mock", () => {
      const localStorage = mockServicesInstance.setupLocalStorageMock();

      expect(localStorage).toBeInstanceOf(MockLocalStorage);
      expect(mockServicesInstance.getMock("browser", "localStorage")).toBe(
        localStorage
      );
    });
  });

  describe("Complete Mock Setup", () => {
    test("should setup all mocks", () => {
      const allMocks = mockServicesInstance.setupAllMocks();

      expect(allMocks.apiMocks.auth).toBeInstanceOf(MockAuthAPI);
      expect(allMocks.apiMocks.task).toBeInstanceOf(MockTaskAPI);
      expect(allMocks.apiMocks.category).toBeInstanceOf(MockCategoryAPI);

      expect(allMocks.browserMocks.browser).toBeInstanceOf(MockBrowserAPI);
      expect(allMocks.browserMocks.localStorage).toBeInstanceOf(
        MockLocalStorage
      );

      expect(allMocks.services).toBeDefined();
      expect(allMocks.services.authService).toBeDefined();
      expect(allMocks.services.taskService).toBeDefined();
      expect(allMocks.services.categoryService).toBeDefined();
    });
  });

  describe("MockAuthAPI", () => {
    let authAPI;

    beforeEach(() => {
      authAPI = mockServicesInstance.setupAuthAPIMock();
    });

    test("should handle login request", async () => {
      const credentials = {
        email: "user1@example.com",
        password: "password123",
      };

      const response = await authAPI.login(credentials);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
      expect(response.data.tokens).toBeDefined();
    });

    test("should handle login failure", async () => {
      const credentials = {
        email: "invalid@example.com",
        password: "wrongpassword",
      };

      const response = await authAPI.login(credentials);

      expect(response.status).toBe(401);
      expect(response.error).toBeDefined();
    });

    test("should handle register request", async () => {
      const userData = {
        username: "newuser",
        email: "newuser@example.com",
        password: "password123",
      };

      const response = await authAPI.register(userData);

      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data.user).toBeDefined();
    });

    test("should handle logout request", async () => {
      const response = await authAPI.logout("valid-token");

      expect(response.status).toBe(200);
      expect(response.data.message).toBe("Logged out successfully");
    });

    test("should handle logout without token", async () => {
      const response = await authAPI.logout("");

      expect(response.status).toBe(401);
      expect(response.error).toBe("Token required");
    });

    test("should handle getCurrentUser request", async () => {
      const response = await authAPI.getCurrentUser("valid-token");

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test("should handle refreshToken request", async () => {
      const response = await authAPI.refreshToken("valid-refresh-token");

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.accessToken).toBeDefined();
    });
  });

  describe("MockTaskAPI", () => {
    let taskAPI;

    beforeEach(() => {
      taskAPI = mockServicesInstance.setupTaskAPIMock();
    });

    test("should handle getTasks request", async () => {
      const response = await taskAPI.getTasks("user-1");

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should handle getTask request", async () => {
      const response = await taskAPI.getTask("task-1");

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test("should handle createTask request", async () => {
      const taskData = {
        userId: "user-1",
        title: "New Task",
        description: "Task description",
      };

      const response = await taskAPI.createTask(taskData);

      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data.title).toBe("New Task");
    });

    test("should handle updateTask request", async () => {
      const taskData = {
        title: "Updated Task",
        description: "Updated description",
      };

      const response = await taskAPI.updateTask("task-1", taskData);

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test("should handle deleteTask request", async () => {
      const response = await taskAPI.deleteTask("task-1");

      expect(response.status).toBe(200);
      expect(response.data.message).toBe("Task deleted successfully");
    });

    test("should handle completeTask request", async () => {
      const response = await taskAPI.completeTask("task-1");

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });
  });

  describe("MockCategoryAPI", () => {
    let categoryAPI;

    beforeEach(() => {
      categoryAPI = mockServicesInstance.setupCategoryAPIMock();
    });

    test("should handle getCategories request", async () => {
      const response = await categoryAPI.getCategories();

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(Array.isArray(response.data)).toBe(true);
    });

    test("should handle createCategory request", async () => {
      const categoryData = {
        name: "New Category",
        color: "#FF5722",
        description: "Category description",
      };

      const response = await categoryAPI.createCategory(categoryData);

      expect(response.status).toBe(201);
      expect(response.data).toBeDefined();
      expect(response.data.name).toBe("New Category");
    });

    test("should handle updateCategory request", async () => {
      const categoryData = {
        name: "Updated Category",
        color: "#2196F3",
      };

      const response = await categoryAPI.updateCategory(
        "category-1",
        categoryData
      );

      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
    });

    test("should handle deleteCategory request", async () => {
      const response = await categoryAPI.deleteCategory("category-1");

      expect(response.status).toBe(200);
      expect(response.data.message).toBe("Category deleted successfully");
    });
  });

  describe("MockBrowserAPI", () => {
    let browserAPI;

    beforeEach(() => {
      browserAPI = mockServicesInstance.setupBrowserAPIMock();
    });

    test("should provide mock window object", () => {
      const window = browserAPI.getWindow();

      expect(window.location).toBeDefined();
      expect(window.location.href).toBe("http://localhost:3000");
      expect(window.history).toBeDefined();
      expect(window.alert).toBeDefined();
    });

    test("should provide mock document object", () => {
      const document = browserAPI.getDocument();

      expect(document.title).toBe("Mock Document");
      expect(document.getElementById).toBeDefined();
      expect(document.querySelector).toBeDefined();
    });

    test("should provide mock navigator object", () => {
      const navigator = browserAPI.getNavigator();

      expect(navigator.userAgent).toBe("MockBrowser/1.0");
      expect(navigator.language).toBe("en-US");
      expect(navigator.onLine).toBe(true);
    });

    test("should handle navigation", () => {
      browserAPI.navigate("http://localhost:3000/tasks");
      const window = browserAPI.getWindow();

      expect(window.location.href).toBe("http://localhost:3000/tasks");
      expect(window.location.pathname).toBe("/tasks");
    });

    test("should reset browser mocks", () => {
      browserAPI.navigate("http://localhost:3000/tasks");
      browserAPI.reset();
      const window = browserAPI.getWindow();

      expect(window.location.href).toBe("http://localhost:3000");
      expect(window.location.pathname).toBe("/");
    });
  });

  describe("MockLocalStorage", () => {
    let localStorage;

    beforeEach(() => {
      localStorage = mockServicesInstance.setupLocalStorageMock();
    });

    test("should store and retrieve items", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");

      expect(localStorage.getItem("key1")).toBe("value1");
      expect(localStorage.getItem("key2")).toBe("value2");
      expect(localStorage.getItem("nonexistent")).toBeNull();
    });

    test("should remove items", () => {
      localStorage.setItem("key1", "value1");
      localStorage.removeItem("key1");

      expect(localStorage.getItem("key1")).toBeNull();
    });

    test("should clear all items", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");
      localStorage.clear();

      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem("key1")).toBeNull();
      expect(localStorage.getItem("key2")).toBeNull();
    });

    test("should get storage length", () => {
      expect(localStorage.length).toBe(0);

      localStorage.setItem("key1", "value1");
      expect(localStorage.length).toBe(1);

      localStorage.setItem("key2", "value2");
      expect(localStorage.length).toBe(2);
    });

    test("should get key by index", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");

      expect(localStorage.key(0)).toBe("key1");
      expect(localStorage.key(1)).toBe("key2");
      expect(localStorage.key(2)).toBeNull();
    });

    test("should get all data", () => {
      localStorage.setItem("key1", "value1");
      localStorage.setItem("key2", "value2");

      const allData = localStorage.getAllData();
      expect(allData).toEqual({
        key1: "value1",
        key2: "value2",
      });
    });

    test("should reset storage", () => {
      localStorage.setItem("key1", "value1");
      localStorage.reset();

      expect(localStorage.length).toBe(0);
      expect(localStorage.getItem("key1")).toBeNull();
    });
  });

  describe("Mock Reset and Cleanup", () => {
    test("should reset all mocks", () => {
      const authAPI = mockServicesInstance.setupAuthAPIMock();
      const taskAPI = mockServicesInstance.setupTaskAPIMock();
      const localStorage = mockServicesInstance.setupLocalStorageMock();

      localStorage.setItem("test", "value");

      mockServicesInstance.resetAllMocks();

      expect(mockServicesInstance.getMock("api", "auth")).toBeUndefined();
      expect(mockServicesInstance.getMock("api", "task")).toBeUndefined();
      expect(
        mockServicesInstance.getMock("browser", "localStorage")
      ).toBeUndefined();
    });
  });
});
