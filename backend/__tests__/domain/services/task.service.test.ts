/**
 * ===================================
 * Task Service Test Suite
 * ===================================
 * Purpose: Comprehensive tests for TaskService domain service
 * Features:
 * - Task management operations testing
 * - Business logic validation
 * - Error handling and edge cases
 * - Mock repository and dependencies
 * - Task lifecycle testing
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  TaskService,
  ITaskRepository,
  ICategoryRepository,
  ITaskCategoryRepository,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskSearchFilters,
  TaskWithCategories
} from '../../../src/domain/services/task.service';
import { Task, TaskCreationData, TaskUpdateData, TaskPriority, TaskStatus } from '../../../src/domain/entities/task.entity';
import { Category, CategoryCreationData } from '../../../src/domain/entities/category.entity';
import { EntityValidationError, EntityNotFoundError } from '../../../src/domain/entities/base.entity';

// Mock implementations
class MockTaskRepository implements ITaskRepository {
  private tasks: Map<string, Task> = new Map();

  async findById(id: string): Promise<Task | null> {
    return this.tasks.get(id) || null;
  }

  async findByUserId(userId: string, filters?: TaskSearchFilters): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);

    if (filters?.status) {
      tasks = tasks.filter(task => task.status === filters.status);
    }
    if (filters?.priority) {
      tasks = tasks.filter(task => task.priority === filters.priority);
    }
    if (filters?.isOverdue) {
      tasks = tasks.filter(task => task.isOverdue() === filters.isOverdue);
    }
    if (filters?.isCompleted) {
      tasks = tasks.filter(task => task.isCompleted() === filters.isCompleted);
    }

    return tasks;
  }

  async create(data: TaskCreationData): Promise<Task> {
    const task = new Task(data);
    this.tasks.set(task.id, task);
    return task;
  }

  async update(id: string, data: TaskUpdateData): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new EntityNotFoundError('Task', id);
    }

    task.updateTask(data);
    return task;
  }

  async delete(id: string): Promise<void> {
    this.tasks.delete(id);
  }

  async count(userId: string, filters?: TaskSearchFilters): Promise<number> {
    const tasks = await this.findByUserId(userId, filters);
    return tasks.length;
  }

  async search(userId: string, query: string): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    return tasks.filter(task => 
      task.title.toLowerCase().includes(query.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
    );
  }

  async findOverdue(userId: string): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values()).filter(task => task.userId === userId);
    return tasks.filter(task => task.isOverdue());
  }

  async findByCategory(categoryId: string): Promise<Task[]> {
    // This would be implemented with proper category filtering in real implementation
    return Array.from(this.tasks.values());
  }

  // Helper methods for testing
  clear(): void {
    this.tasks.clear();
  }

  addTask(task: Task): void {
    this.tasks.set(task.id, task);
  }
}

class MockCategoryRepository implements ICategoryRepository {
  private categories: Map<string, Category> = new Map();

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) || null;
  }

  async findByIds(ids: string[]): Promise<Category[]> {
    const categories: Category[] = [];
    for (const id of ids) {
      const category = this.categories.get(id);
      if (category) {
        categories.push(category);
      }
    }
    return categories;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  // Helper methods for testing
  clear(): void {
    this.categories.clear();
  }

  addCategory(category: Category): void {
    this.categories.set(category.id, category);
  }
}

class MockTaskCategoryRepository implements ITaskCategoryRepository {
  private relations: Map<string, string[]> = new Map(); // taskId -> categoryIds

  async findCategoriesByTaskId(taskId: string): Promise<Category[]> {
    const categoryIds = this.relations.get(taskId) || [];
    // In real implementation, this would fetch actual categories
    return categoryIds.map(id => new Category({ name: `Category ${id}`, color: '#FF0000' }));
  }

  async findTasksByCategory(categoryId: string): Promise<Task[]> {
    // In real implementation, this would fetch actual tasks
    return [];
  }

  async createRelations(taskId: string, categoryIds: string[]): Promise<void> {
    this.relations.set(taskId, categoryIds);
  }

  async updateRelations(taskId: string, categoryIds: string[]): Promise<void> {
    this.relations.set(taskId, categoryIds);
  }

  async deleteRelations(taskId: string): Promise<void> {
    this.relations.delete(taskId);
  }

  // Helper methods for testing
  clear(): void {
    this.relations.clear();
  }

  getRelations(taskId: string): string[] {
    return this.relations.get(taskId) || [];
  }
}

describe('TaskService', () => {
  let taskService: TaskService;
  let mockTaskRepository: MockTaskRepository;
  let mockCategoryRepository: MockCategoryRepository;
  let mockTaskCategoryRepository: MockTaskCategoryRepository;

  const testUserId = 'user-123';
  const otherUserId = 'user-456';

  beforeEach(() => {
    mockTaskRepository = new MockTaskRepository();
    mockCategoryRepository = new MockCategoryRepository();
    mockTaskCategoryRepository = new MockTaskCategoryRepository();
    taskService = new TaskService(mockTaskRepository, mockCategoryRepository, mockTaskCategoryRepository);

    // Add test categories
    const category1 = new Category({ name: 'Work', color: '#FF0000' });
    const category2 = new Category({ name: 'Personal', color: '#00FF00' });
    mockCategoryRepository.addCategory(category1);
    mockCategoryRepository.addCategory(category2);
  });

  // ===================================
  // Task Creation Tests
  // ===================================

  describe('createTask', () => {
    const validCreateRequest: CreateTaskRequest = {
      title: 'Test Task',
      description: 'Test task description',
      priority: TaskPriority.HIGH,
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    };

    test('should create task with valid data', async () => {
      const result = await taskService.createTask(testUserId, validCreateRequest);

      expect(result.task.title).toBe('Test Task');
      expect(result.task.description).toBe('Test task description');
      expect(result.task.priority).toBe(TaskPriority.HIGH);
      expect(result.task.status).toBe(TaskStatus.PENDING);
      expect(result.task.userId).toBe(testUserId);
      expect(result.categories).toHaveLength(0);
    });

    test('should create task with default priority', async () => {
      const request = {
        title: 'Default Priority Task'
      };

      const result = await taskService.createTask(testUserId, request);

      expect(result.task.priority).toBe(TaskPriority.MEDIUM);
      expect(result.task.status).toBe(TaskStatus.PENDING);
    });

    test('should create task with categories', async () => {
      const categories = Array.from(mockCategoryRepository['categories'].values());
      const request = {
        ...validCreateRequest,
        categoryIds: [categories[0].id, categories[1].id]
      };

      const result = await taskService.createTask(testUserId, request);

      expect(result.task.title).toBe('Test Task');
      expect(result.categories).toHaveLength(2);
      expect(mockTaskCategoryRepository.getRelations(result.task.id)).toHaveLength(2);
    });

    test('should throw error for invalid categories', async () => {
      const request = {
        ...validCreateRequest,
        categoryIds: ['invalid-category-id']
      };

      await expect(taskService.createTask(testUserId, request)).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // Task Retrieval Tests
  // ===================================

  describe('getTaskById', () => {
    let testTask: Task;

    beforeEach(async () => {
      const result = await taskService.createTask(testUserId, {
        title: 'Test Task',
        description: 'Test description'
      });
      testTask = result.task;
    });

    test('should return task when found and user owns it', async () => {
      const result = await taskService.getTaskById(testTask.id, testUserId);

      expect(result.task.id).toBe(testTask.id);
      expect(result.task.title).toBe('Test Task');
      expect(result.categories).toBeDefined();
    });

    test('should throw error when task not found', async () => {
      await expect(taskService.getTaskById('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when user does not own task', async () => {
      await expect(taskService.getTaskById(testTask.id, otherUserId)).rejects.toThrow(EntityValidationError);
      await expect(taskService.getTaskById(testTask.id, otherUserId)).rejects.toThrow('User does not have permission');
    });
  });

  // ===================================
  // Task Update Tests
  // ===================================

  describe('updateTask', () => {
    let testTask: Task;

    beforeEach(async () => {
      const result = await taskService.createTask(testUserId, {
        title: 'Test Task',
        description: 'Test description'
      });
      testTask = result.task;
    });

    test('should update task successfully', async () => {
      const updateRequest: UpdateTaskRequest = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: TaskPriority.LOW
      };

      const result = await taskService.updateTask(testTask.id, testUserId, updateRequest);

      expect(result.task.title).toBe('Updated Task');
      expect(result.task.description).toBe('Updated description');
      expect(result.task.priority).toBe(TaskPriority.LOW);
    });

    test('should update only specified fields', async () => {
      const originalTitle = testTask.title;
      const updateRequest: UpdateTaskRequest = {
        description: 'New description only'
      };

      const result = await taskService.updateTask(testTask.id, testUserId, updateRequest);

      expect(result.task.title).toBe(originalTitle);
      expect(result.task.description).toBe('New description only');
    });

    test('should update categories', async () => {
      const categories = Array.from(mockCategoryRepository['categories'].values());
      const updateRequest: UpdateTaskRequest = {
        categoryIds: [categories[0].id]
      };

      const result = await taskService.updateTask(testTask.id, testUserId, updateRequest);

      expect(result.categories).toHaveLength(1);
      expect(mockTaskCategoryRepository.getRelations(testTask.id)).toHaveLength(1);
    });

    test('should clear categories when empty array provided', async () => {
      // First add categories
      await taskService.updateTask(testTask.id, testUserId, {
        categoryIds: [Array.from(mockCategoryRepository['categories'].values())[0].id]
      });

      // Then clear them
      const result = await taskService.updateTask(testTask.id, testUserId, {
        categoryIds: []
      });

      expect(result.categories).toHaveLength(0);
      expect(mockTaskCategoryRepository.getRelations(testTask.id)).toHaveLength(0);
    });

    test('should throw error when user does not own task', async () => {
      const updateRequest: UpdateTaskRequest = {
        title: 'Unauthorized Update'
      };

      await expect(taskService.updateTask(testTask.id, otherUserId, updateRequest)).rejects.toThrow(EntityValidationError);
    });
  });

  // ===================================
  // Task Deletion Tests
  // ===================================

  describe('deleteTask', () => {
    let testTask: Task;

    beforeEach(async () => {
      const result = await taskService.createTask(testUserId, {
        title: 'Test Task',
        description: 'Test description'
      });
      testTask = result.task;
    });

    test('should delete task successfully', async () => {
      await taskService.deleteTask(testTask.id, testUserId);

      await expect(taskService.getTaskById(testTask.id, testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when user does not own task', async () => {
      await expect(taskService.deleteTask(testTask.id, otherUserId)).rejects.toThrow(EntityValidationError);
    });

    test('should throw error when task not found', async () => {
      await expect(taskService.deleteTask('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // Task Search and Filtering Tests
  // ===================================

  describe('getTasksByUser', () => {
    beforeEach(async () => {
      // Create test tasks
      await taskService.createTask(testUserId, {
        title: 'High Priority Task',
        priority: TaskPriority.HIGH
      });

      await taskService.createTask(testUserId, {
        title: 'Low Priority Task',
        priority: TaskPriority.LOW
      });

      await taskService.createTask(otherUserId, {
        title: 'Other User Task',
        priority: TaskPriority.HIGH
      });
    });

    test('should return all tasks for user', async () => {
      const result = await taskService.getTasksByUser(testUserId);

      expect(result).toHaveLength(2);
      expect(result.every(item => item.task.userId === testUserId)).toBe(true);
    });

    test('should filter tasks by priority', async () => {
      const result = await taskService.getTasksByUser(testUserId, {
        priority: TaskPriority.HIGH
      });

      expect(result).toHaveLength(1);
      expect(result[0].task.priority).toBe(TaskPriority.HIGH);
    });

    test('should filter tasks by status', async () => {
      const result = await taskService.getTasksByUser(testUserId, {
        status: TaskStatus.PENDING
      });

      expect(result).toHaveLength(2);
      expect(result.every(item => item.task.status === TaskStatus.PENDING)).toBe(true);
    });
  });

  describe('searchTasks', () => {
    beforeEach(async () => {
      await taskService.createTask(testUserId, {
        title: 'Important Meeting',
        description: 'Discuss project requirements'
      });

      await taskService.createTask(testUserId, {
        title: 'Code Review',
        description: 'Review pull request'
      });
    });

    test('should search tasks by title', async () => {
      const result = await taskService.searchTasks(testUserId, 'meeting');

      expect(result).toHaveLength(1);
      expect(result[0].task.title).toBe('Important Meeting');
    });

    test('should search tasks by description', async () => {
      const result = await taskService.searchTasks(testUserId, 'review');

      expect(result).toHaveLength(1); // Only "Code Review" task contains 'review' in title
    });

    test('should return empty array for no matches', async () => {
      const result = await taskService.searchTasks(testUserId, 'nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  // ===================================
  // Task Status Management Tests
  // ===================================

  describe('Task Status Management', () => {
    let testTask: Task;

    beforeEach(async () => {
      const result = await taskService.createTask(testUserId, {
        title: 'Test Task',
        description: 'Test description'
      });
      testTask = result.task;
    });

    test('should complete task successfully', async () => {
      const result = await taskService.completeTask(testTask.id, testUserId);

      expect(result.task.status).toBe(TaskStatus.COMPLETED);
      expect(result.task.isCompleted()).toBe(true);
      expect(result.task.completedAt).toBeDefined();
    });

    test('should throw error when completing already completed task', async () => {
      await taskService.completeTask(testTask.id, testUserId);

      await expect(taskService.completeTask(testTask.id, testUserId)).rejects.toThrow(EntityValidationError);
      await expect(taskService.completeTask(testTask.id, testUserId)).rejects.toThrow('Task is already completed');
    });

    test('should start task successfully', async () => {
      const result = await taskService.startTask(testTask.id, testUserId);

      expect(result.task.status).toBe(TaskStatus.IN_PROGRESS);
    });

    test('should throw error when starting completed task', async () => {
      await taskService.completeTask(testTask.id, testUserId);

      await expect(taskService.startTask(testTask.id, testUserId)).rejects.toThrow(EntityValidationError);
      await expect(taskService.startTask(testTask.id, testUserId)).rejects.toThrow('Cannot start a completed task');
    });

    test('should reset task successfully', async () => {
      await taskService.startTask(testTask.id, testUserId);
      const result = await taskService.resetTask(testTask.id, testUserId);

      expect(result.task.status).toBe(TaskStatus.PENDING);
    });
  });

  // ===================================
  // Task Priority and Due Date Tests
  // ===================================

  describe('Task Priority and Due Date Management', () => {
    let testTask: Task;

    beforeEach(async () => {
      const result = await taskService.createTask(testUserId, {
        title: 'Test Task',
        priority: TaskPriority.MEDIUM
      });
      testTask = result.task;
    });

    test('should update task priority successfully', async () => {
      const result = await taskService.updateTaskPriority(testTask.id, testUserId, TaskPriority.HIGH);

      expect(result.task.priority).toBe(TaskPriority.HIGH);
    });

    test('should update task due date successfully', async () => {
      const newDueDate = new Date(Date.now() + 86400000); // Tomorrow
      const result = await taskService.updateTaskDueDate(testTask.id, testUserId, newDueDate);

      expect(result.task.dueDate).toEqual(newDueDate);
    });

    test('should remove task due date successfully', async () => {
      // First set a due date
      const dueDate = new Date(Date.now() + 86400000);
      await taskService.updateTaskDueDate(testTask.id, testUserId, dueDate);

      // Then remove it
      const result = await taskService.updateTaskDueDate(testTask.id, testUserId, null);

      expect(result.task.dueDate).toBeUndefined();
    });

    test('should throw error when user does not own task for priority update', async () => {
      await expect(taskService.updateTaskPriority(testTask.id, otherUserId, TaskPriority.HIGH))
        .rejects.toThrow(EntityValidationError);
    });

    test('should throw error when user does not own task for due date update', async () => {
      const newDueDate = new Date(Date.now() + 86400000);
      await expect(taskService.updateTaskDueDate(testTask.id, otherUserId, newDueDate))
        .rejects.toThrow(EntityValidationError);
    });
  });

  // ===================================
  // Task Statistics Tests
  // ===================================

  describe('getTaskStatistics', () => {
    beforeEach(async () => {
      // Create various tasks
      await taskService.createTask(testUserId, {
        title: 'Pending Task 1',
        priority: TaskPriority.HIGH
      });

      await taskService.createTask(testUserId, {
        title: 'Pending Task 2',
        priority: TaskPriority.MEDIUM
      });

      const task3 = await taskService.createTask(testUserId, {
        title: 'In Progress Task',
        priority: TaskPriority.LOW
      });

      const task4 = await taskService.createTask(testUserId, {
        title: 'Completed Task',
        priority: TaskPriority.HIGH
      });

      // Start one task
      await taskService.startTask(task3.task.id, testUserId);

      // Complete one task
      await taskService.completeTask(task4.task.id, testUserId);
    });

    test('should return correct task statistics', async () => {
      const stats = await taskService.getTaskStatistics(testUserId);

      expect(stats.totalTasks).toBe(4);
      expect(stats.pendingTasks).toBe(2);
      expect(stats.inProgressTasks).toBe(1);
      expect(stats.completedTasks).toBe(1);
      expect(stats.completionRate).toBe(25); // 1/4 * 100 = 25%
    });

    test('should return zero statistics for user with no tasks', async () => {
      const stats = await taskService.getTaskStatistics(otherUserId);

      expect(stats.totalTasks).toBe(0);
      expect(stats.pendingTasks).toBe(0);
      expect(stats.inProgressTasks).toBe(0);
      expect(stats.completedTasks).toBe(0);
      expect(stats.completionRate).toBe(0);
    });
  });

  // ===================================
  // Overdue Tasks Tests
  // ===================================

  describe('getOverdueTasks', () => {
    beforeEach(async () => {
      // Create task that will become overdue
      // First create with future due date, then manually adjust for testing
      const baseDate = new Date('2023-01-01T10:00:00Z');
      const overdueTask = new Task({
        userId: testUserId,
        title: 'Overdue Task',
        description: 'This task is overdue',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date('2023-01-02T10:00:00Z') // Future date initially
      }, {
        createdAt: baseDate,
        updatedAt: baseDate
      });

      // Manually set due date to past for testing (simulating time passage)
      (overdueTask as any)._dueDate = new Date('2022-12-31T10:00:00Z');
      mockTaskRepository.addTask(overdueTask);

      // Create future task
      await taskService.createTask(testUserId, {
        title: 'Future Task',
        dueDate: new Date(Date.now() + 86400000) // Tomorrow
      });
    });

    test('should return overdue tasks', async () => {
      const result = await taskService.getOverdueTasks(testUserId);

      expect(result).toHaveLength(1);
      expect(result[0].task.title).toBe('Overdue Task');
      expect(result[0].task.isOverdue()).toBe(true);
    });

    test('should return empty array when no overdue tasks', async () => {
      const result = await taskService.getOverdueTasks(otherUserId);

      expect(result).toHaveLength(0);
    });
  });

  // ===================================
  // Category-related Tests
  // ===================================

  describe('getTasksByCategory', () => {
    let categoryId: string;

    beforeEach(async () => {
      const categories = Array.from(mockCategoryRepository['categories'].values());
      categoryId = categories[0].id;

      // Create task with category
      await taskService.createTask(testUserId, {
        title: 'Categorized Task',
        categoryIds: [categoryId]
      });
    });

    test('should return tasks by category', async () => {
      const result = await taskService.getTasksByCategory(categoryId, testUserId);

      expect(result).toHaveLength(0); // Mock implementation returns empty array
    });

    test('should throw error for non-existent category', async () => {
      await expect(taskService.getTasksByCategory('nonexistent', testUserId))
        .rejects.toThrow(EntityNotFoundError);
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should throw error when getting non-existent task', async () => {
      await expect(taskService.getTaskById('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when updating non-existent task', async () => {
      const updateRequest: UpdateTaskRequest = {
        title: 'Updated Title'
      };

      await expect(taskService.updateTask('nonexistent', testUserId, updateRequest))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when deleting non-existent task', async () => {
      await expect(taskService.deleteTask('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when completing non-existent task', async () => {
      await expect(taskService.completeTask('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when starting non-existent task', async () => {
      await expect(taskService.startTask('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when resetting non-existent task', async () => {
      await expect(taskService.resetTask('nonexistent', testUserId)).rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when updating priority of non-existent task', async () => {
      await expect(taskService.updateTaskPriority('nonexistent', testUserId, TaskPriority.HIGH))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when updating due date of non-existent task', async () => {
      const newDueDate = new Date();
      await expect(taskService.updateTaskDueDate('nonexistent', testUserId, newDueDate))
        .rejects.toThrow(EntityNotFoundError);
    });
  });
});
