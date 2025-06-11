/**
 * ===================================
 * TestDataFactory Integration Test
 * ===================================
 * Generated for TSK-IT-001-001-TestDataFactory
 * Project: Task Management System - Integration Test
 * Purpose: Test enhanced TestDataFactory with integration test features
 */

const { TestDataFactory } = require("../../mocks/mock-services");

describe("TestDataFactory Integration Tests", () => {
  beforeEach(() => {
    // Clear generated data before each test
    TestDataFactory.clearGeneratedData();
  });

  describe("Basic Data Creation", () => {
    test("should create user with unique ID", () => {
      const user1 = TestDataFactory.createUser();
      const user2 = TestDataFactory.createUser();

      expect(user1.id).toBeDefined();
      expect(user2.id).toBeDefined();
      expect(user1.id).not.toBe(user2.id);
      expect(user1.email).toBe("test@example.com");
    });

    test("should create task with unique ID", () => {
      const task1 = TestDataFactory.createTask();
      const task2 = TestDataFactory.createTask();

      expect(task1.id).toBeDefined();
      expect(task2.id).toBeDefined();
      expect(task1.id).not.toBe(task2.id);
      expect(task1.title).toBe("Test Task");
    });

    test("should create category with unique ID", () => {
      const category1 = TestDataFactory.createCategory();
      const category2 = TestDataFactory.createCategory();

      expect(category1.id).toBeDefined();
      expect(category2.id).toBeDefined();
      expect(category1.id).not.toBe(category2.id);
      expect(category1.name).toBe("Test Category");
    });
  });

  describe("Specialized User Creation", () => {
    test("should create admin user", () => {
      const admin = TestDataFactory.createAdminUser();

      expect(admin.username).toBe("admin");
      expect(admin.email).toBe("admin@integration-test.com");
      expect(admin.role).toBe("admin");
      expect(admin.isActive).toBe(true);
    });

    test("should create regular user", () => {
      const user = TestDataFactory.createRegularUser();

      expect(user.username).toBe("user");
      expect(user.email).toBe("user@integration-test.com");
      expect(user.role).toBe("user");
      expect(user.isActive).toBe(true);
    });

    test("should create inactive user", () => {
      const user = TestDataFactory.createInactiveUser();

      expect(user.username).toBe("inactive");
      expect(user.email).toBe("inactive@integration-test.com");
      expect(user.isActive).toBe(false);
    });
  });

  describe("Specialized Task Creation", () => {
    test("should create completed task", () => {
      const userId = "test-user-1";
      const task = TestDataFactory.createCompletedTask(userId);

      expect(task.userId).toBe(userId);
      expect(task.title).toBe("Completed Task");
      expect(task.status).toBe("completed");
      expect(task.completedAt).toBeDefined();
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    test("should create overdue task", () => {
      const userId = "test-user-1";
      const task = TestDataFactory.createOverdueTask(userId);

      expect(task.userId).toBe(userId);
      expect(task.title).toBe("Overdue Task");
      expect(task.status).toBe("pending");
      expect(task.priority).toBe("high");
      expect(task.dueDate).toBeDefined();
      expect(task.dueDate).toBeInstanceOf(Date);
      expect(task.dueDate.getTime()).toBeLessThan(Date.now());
    });
  });

  describe("Specialized Category Creation", () => {
    test("should create work category", () => {
      const category = TestDataFactory.createWorkCategory();

      expect(category.name).toBe("Work");
      expect(category.color).toBe("#2196F3");
      expect(category.description).toBe("Work-related tasks");
    });

    test("should create personal category", () => {
      const category = TestDataFactory.createPersonalCategory();

      expect(category.name).toBe("Personal");
      expect(category.color).toBe("#4CAF50");
      expect(category.description).toBe("Personal tasks");
    });
  });

  describe("Batch Creation Methods", () => {
    test("should create multiple users", () => {
      const users = TestDataFactory.createUsers(3, "user");

      expect(users).toHaveLength(3);
      expect(users[0].username).toBe("user1");
      expect(users[1].username).toBe("user2");
      expect(users[2].username).toBe("user3");

      // Check unique emails
      const emails = users.map((u) => u.email);
      expect(new Set(emails).size).toBe(3);
    });

    test("should create multiple admin users", () => {
      const admins = TestDataFactory.createUsers(2, "admin");

      expect(admins).toHaveLength(2);
      expect(admins[0].role).toBe("admin");
      expect(admins[1].role).toBe("admin");
      expect(admins[0].username).toBe("admin1");
      expect(admins[1].username).toBe("admin2");
    });

    test("should create task list for user", () => {
      const userId = "test-user-1";
      const tasks = TestDataFactory.createTaskList(userId, 5);

      expect(tasks).toHaveLength(5);
      tasks.forEach((task) => {
        expect(task.userId).toBe(userId);
        expect(task.title).toMatch(/^Task \d+$/);
      });

      // Check status distribution
      const statuses = tasks.map((t) => t.status);
      expect(statuses).toContain("pending");
      expect(statuses).toContain("completed");
    });

    test("should create multiple categories", () => {
      const categories = TestDataFactory.createCategories(4);

      expect(categories).toHaveLength(4);
      expect(categories[0].name).toBe("Work 1");
      expect(categories[1].name).toBe("Personal 2");
      expect(categories[2].name).toBe("Work 3");
      expect(categories[3].name).toBe("Personal 4");
    });
  });

  describe("Scenario Generation", () => {
    test("should create user scenario", () => {
      const scenario = TestDataFactory.createUserScenario({
        userType: "user",
        taskCount: 5,
        categoryCount: 3,
        includeOverdue: true,
      });

      expect(scenario.user).toBeDefined();
      expect(scenario.user.role).toBe("user");

      expect(scenario.categories).toHaveLength(3);
      expect(scenario.tasks).toHaveLength(5);

      expect(scenario.scenario.userType).toBe("user");
      expect(scenario.scenario.taskCount).toBe(5);
      expect(scenario.scenario.categoryCount).toBe(3);
      expect(scenario.scenario.completedTasks).toBeGreaterThanOrEqual(0);
      expect(scenario.scenario.activeTasks).toBeGreaterThanOrEqual(0);
    });

    test("should create admin scenario", () => {
      const scenario = TestDataFactory.createUserScenario({
        userType: "admin",
        taskCount: 3,
        categoryCount: 2,
      });

      expect(scenario.user.role).toBe("admin");
      expect(scenario.scenario.userType).toBe("admin");
    });

    test("should create team scenario", () => {
      const scenario = TestDataFactory.createTeamScenario({
        userCount: 3,
        adminCount: 2,
        sharedCategoryCount: 2,
        tasksPerUser: 3,
      });

      expect(scenario.admins).toHaveLength(2);
      expect(scenario.users).toHaveLength(3);
      expect(scenario.allUsers).toHaveLength(5);
      expect(scenario.sharedCategories).toHaveLength(2);
      expect(scenario.allTasks).toHaveLength(15); // 5 users * 3 tasks each

      expect(scenario.scenario.totalUsers).toBe(5);
      expect(scenario.scenario.adminCount).toBe(2);
      expect(scenario.scenario.regularUserCount).toBe(3);
      expect(scenario.scenario.totalTasks).toBe(15);
      expect(scenario.scenario.sharedCategoryCount).toBe(2);
    });
  });

  describe("Data Management", () => {
    test("should track generated data", () => {
      TestDataFactory.createUser();
      TestDataFactory.createTask();
      TestDataFactory.createCategory();

      const data = TestDataFactory.getGeneratedData();

      expect(data.users).toHaveLength(1);
      expect(data.tasks).toHaveLength(1);
      expect(data.categories).toHaveLength(1);
      expect(data.counts.users).toBe(1);
      expect(data.counts.tasks).toBe(1);
      expect(data.counts.categories).toBe(1);
    });

    test("should clear generated data", () => {
      TestDataFactory.createUser();
      TestDataFactory.createTask();
      TestDataFactory.createCategory();

      let data = TestDataFactory.getGeneratedData();
      expect(data.counts.users).toBe(1);

      TestDataFactory.clearGeneratedData();

      data = TestDataFactory.getGeneratedData();
      expect(data.counts.users).toBe(0);
      expect(data.counts.tasks).toBe(0);
      expect(data.counts.categories).toBe(0);
    });

    test("should retrieve data by ID", () => {
      const user = TestDataFactory.createUser();
      const task = TestDataFactory.createTask();
      const category = TestDataFactory.createCategory();

      expect(TestDataFactory.getUserById(user.id)).toEqual(user);
      expect(TestDataFactory.getTaskById(task.id)).toEqual(task);
      expect(TestDataFactory.getCategoryById(category.id)).toEqual(category);

      expect(TestDataFactory.getUserById("non-existent")).toBeUndefined();
    });
  });

  describe("Data Integrity Validation", () => {
    test("should validate data integrity - valid case", () => {
      const user = TestDataFactory.createUser();
      TestDataFactory.createTask({ userId: user.id });

      const validation = TestDataFactory.validateDataIntegrity();

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });

    test("should detect integrity issues", () => {
      TestDataFactory.createTask({ userId: "non-existent-user" });

      const validation = TestDataFactory.validateDataIntegrity();

      expect(validation.isValid).toBe(false);
      expect(validation.issues).toHaveLength(1);
      expect(validation.issues[0]).toContain("references non-existent user");
    });
  });

  describe("Auth Result Creation", () => {
    test("should create auth result with user", () => {
      const user = TestDataFactory.createUser();
      const authResult = TestDataFactory.createAuthResult(user);

      expect(authResult.user).toEqual(user);
      expect(authResult.tokens).toBeDefined();
      expect(authResult.tokens.accessToken).toBe("mock-access-token");
      expect(authResult.tokens.refreshToken).toBe("mock-refresh-token");
      expect(authResult.tokens.expiresIn).toBe(3600);
    });

    test("should create auth result without user", () => {
      const authResult = TestDataFactory.createAuthResult();

      expect(authResult.user).toBeDefined();
      expect(authResult.tokens).toBeDefined();
    });
  });
});
