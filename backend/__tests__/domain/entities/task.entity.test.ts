/**
 * ===================================
 * Task Entity Test Suite
 * ===================================
 * Purpose: Comprehensive tests for Task entity class
 * Features:
 * - Task creation and validation
 * - Status management and transitions
 * - Priority and due date management
 * - Business logic testing
 * - Completion and progress tracking
 * - Error handling and edge cases
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  Task,
  TaskPriority,
  TaskStatus,
  TaskCreationData,
  TaskUpdateData,
  TaskSummaryData
} from '../../../src/domain/entities/task.entity';
import { EntityValidationError } from '../../../src/domain/entities/base.entity';

describe('Task Entity', () => {
  let validTaskData: TaskCreationData;
  const testUserId = 'user-123';

  beforeEach(() => {
    validTaskData = {
      userId: testUserId,
      title: 'Test Task',
      description: 'This is a test task description',
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.PENDING,
      dueDate: new Date(Date.now() + 86400000) // Tomorrow
    };
  });

  // ===================================
  // Task Creation Tests
  // ===================================

  describe('Task Creation', () => {
    test('should create task with valid data', () => {
      const task = new Task(validTaskData);

      expect(task.id).toBeDefined();
      expect(task.userId).toBe(testUserId);
      expect(task.title).toBe('Test Task');
      expect(task.description).toBe('This is a test task description');
      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.dueDate).toEqual(validTaskData.dueDate);
      expect(task.completedAt).toBeUndefined();
      expect(task.createdAt).toBeInstanceOf(Date);
      expect(task.updatedAt).toBeInstanceOf(Date);
    });

    test('should create task with default priority and status', () => {
      const minimalData = {
        userId: testUserId,
        title: 'Minimal Task'
      };

      const task = new Task(minimalData);

      expect(task.priority).toBe(TaskPriority.MEDIUM);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.description).toBeUndefined();
      expect(task.dueDate).toBeUndefined();
    });

    test('should create high priority task', () => {
      const highPriorityData = {
        ...validTaskData,
        priority: TaskPriority.HIGH
      };

      const task = new Task(highPriorityData);

      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.isHighPriority()).toBe(true);
    });

    test('should create task without due date', () => {
      const noDueDateData = {
        userId: testUserId,
        title: 'No Due Date Task'
      };

      const task = new Task(noDueDateData);

      expect(task.dueDate).toBeUndefined();
      expect(task.hasDueDate()).toBe(false);
      expect(task.isOverdue()).toBe(false);
    });
  });

  // ===================================
  // Validation Tests
  // ===================================

  describe('Validation', () => {
    test('should throw error for empty user ID', () => {
      const invalidData = {
        ...validTaskData,
        userId: ''
      };

      expect(() => new Task(invalidData)).toThrow(EntityValidationError);
      expect(() => new Task(invalidData)).toThrow('User ID is required');
    });

    test('should throw error for missing title', () => {
      const invalidData = {
        ...validTaskData,
        title: ''
      };

      expect(() => new Task(invalidData)).toThrow(EntityValidationError);
      expect(() => new Task(invalidData)).toThrow('Task title is required');
    });

    test('should throw error for long title', () => {
      const invalidData = {
        ...validTaskData,
        title: 'a'.repeat(101)
      };

      expect(() => new Task(invalidData)).toThrow(EntityValidationError);
      expect(() => new Task(invalidData)).toThrow('Task title must be 100 characters or less');
    });

    test('should throw error for long description', () => {
      const invalidData = {
        ...validTaskData,
        description: 'a'.repeat(1001)
      };

      expect(() => new Task(invalidData)).toThrow(EntityValidationError);
      expect(() => new Task(invalidData)).toThrow('Task description must be 1000 characters or less');
    });

    test('should throw error for due date in the past', () => {
      const pastDate = new Date(Date.now() - 86400000); // Yesterday
      const invalidData = {
        ...validTaskData,
        dueDate: pastDate
      };

      expect(() => new Task(invalidData)).toThrow(EntityValidationError);
      expect(() => new Task(invalidData)).toThrow('Due date must be after creation date');
    });
  });

  // ===================================
  // Status Management Tests
  // ===================================

  describe('Status Management', () => {
    test('should identify task status correctly', () => {
      const pendingTask = new Task({ ...validTaskData, status: TaskStatus.PENDING });
      const inProgressTask = new Task({ ...validTaskData, status: TaskStatus.IN_PROGRESS });

      // Create completed task properly
      const completedTask = new Task({ ...validTaskData, status: TaskStatus.PENDING });
      completedTask.complete(); // This will set both status and completedAt

      expect(pendingTask.isPending()).toBe(true);
      expect(pendingTask.isInProgress()).toBe(false);
      expect(pendingTask.isCompleted()).toBe(false);

      expect(inProgressTask.isPending()).toBe(false);
      expect(inProgressTask.isInProgress()).toBe(true);
      expect(inProgressTask.isCompleted()).toBe(false);

      expect(completedTask.isPending()).toBe(false);
      expect(completedTask.isInProgress()).toBe(false);
      expect(completedTask.isCompleted()).toBe(true);
    });

    test('should start task successfully', () => {
      const task = new Task(validTaskData);

      task.start();

      expect(task.status).toBe(TaskStatus.IN_PROGRESS);
      expect(task.isInProgress()).toBe(true);
    });

    test('should complete task successfully', () => {
      const task = new Task(validTaskData);

      task.complete();

      expect(task.status).toBe(TaskStatus.COMPLETED);
      expect(task.isCompleted()).toBe(true);
      expect(task.completedAt).toBeInstanceOf(Date);
    });

    test('should reset task to pending', () => {
      const task = new Task({ ...validTaskData, status: TaskStatus.IN_PROGRESS });

      task.reset();

      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.isPending()).toBe(true);
    });

    test('should throw error when completing already completed task', () => {
      const task = new Task(validTaskData);
      task.complete(); // Complete the task properly

      expect(() => task.complete()).toThrow(EntityValidationError);
      expect(() => task.complete()).toThrow('Task is already completed');
    });

    test('should throw error when starting completed task', () => {
      const task = new Task(validTaskData);
      task.complete(); // Complete the task properly

      expect(() => task.start()).toThrow(EntityValidationError);
      expect(() => task.start()).toThrow('Cannot start a completed task');
    });

    test('should handle status transitions correctly', () => {
      const task = new Task(validTaskData);

      // Pending -> In Progress
      task.changeStatus(TaskStatus.IN_PROGRESS);
      expect(task.status).toBe(TaskStatus.IN_PROGRESS);

      // In Progress -> Completed
      task.changeStatus(TaskStatus.COMPLETED);
      expect(task.status).toBe(TaskStatus.COMPLETED);
      expect(task.completedAt).toBeInstanceOf(Date);

      // Completed -> Pending (uncomplete)
      task.changeStatus(TaskStatus.PENDING);
      expect(task.status).toBe(TaskStatus.PENDING);
      expect(task.completedAt).toBeUndefined();
    });
  });

  // ===================================
  // Priority Management Tests
  // ===================================

  describe('Priority Management', () => {
    test('should identify high priority task', () => {
      const highPriorityTask = new Task({
        ...validTaskData,
        priority: TaskPriority.HIGH
      });

      expect(highPriorityTask.isHighPriority()).toBe(true);
    });

    test('should identify non-high priority task', () => {
      const mediumPriorityTask = new Task({
        ...validTaskData,
        priority: TaskPriority.MEDIUM
      });

      expect(mediumPriorityTask.isHighPriority()).toBe(false);
    });

    test('should set task priority', () => {
      const task = new Task(validTaskData);

      task.setPriority(TaskPriority.HIGH);

      expect(task.priority).toBe(TaskPriority.HIGH);
      expect(task.isHighPriority()).toBe(true);
    });
  });

  // ===================================
  // Due Date Management Tests
  // ===================================

  describe('Due Date Management', () => {
    test('should identify task with due date', () => {
      const taskWithDueDate = new Task(validTaskData);
      const taskWithoutDueDate = new Task({
        userId: testUserId,
        title: 'No Due Date'
      });

      expect(taskWithDueDate.hasDueDate()).toBe(true);
      expect(taskWithoutDueDate.hasDueDate()).toBe(false);
    });

    test('should identify overdue task', () => {
      const overdueDate = new Date(Date.now() - 86400000); // Yesterday
      const futureDate = new Date(Date.now() + 86400000); // Tomorrow

      // Create task with past due date by bypassing validation
      const overdueTask = new Task({
        userId: testUserId,
        title: 'Overdue Task'
      });
      (overdueTask as any)._dueDate = overdueDate;

      const futureTask = new Task({
        userId: testUserId,
        title: 'Future Task',
        dueDate: futureDate
      });

      expect(overdueTask.isOverdue()).toBe(true);
      expect(futureTask.isOverdue()).toBe(false);
    });

    test('should not consider completed task as overdue', () => {
      const overdueDate = new Date(Date.now() - 86400000); // Yesterday

      // Create task with past due date and complete it
      const completedTask = new Task({
        userId: testUserId,
        title: 'Completed Task'
      });
      (completedTask as any)._dueDate = overdueDate; // Set past due date
      completedTask.complete(); // Complete the task properly

      expect(completedTask.isOverdue()).toBe(false);
    });

    test('should calculate days until due correctly', () => {
      const tomorrow = new Date(Date.now() + 86400000);
      const task = new Task({
        ...validTaskData,
        dueDate: tomorrow
      });

      const daysUntilDue = task.getDaysUntilDue();
      expect(daysUntilDue).toBe(1);
    });

    test('should return null for task without due date', () => {
      const task = new Task({
        userId: testUserId,
        title: 'No Due Date'
      });

      expect(task.getDaysUntilDue()).toBeNull();
    });

    test('should set due date successfully', () => {
      const task = new Task({
        userId: testUserId,
        title: 'Test Task'
      });

      const futureDate = new Date(Date.now() + 86400000);
      task.setDueDate(futureDate);

      expect(task.dueDate).toEqual(futureDate);
      expect(task.hasDueDate()).toBe(true);
    });

    test('should remove due date when set to null', () => {
      const task = new Task(validTaskData);

      task.setDueDate(null);

      expect(task.dueDate).toBeUndefined();
      expect(task.hasDueDate()).toBe(false);
    });

    test('should throw error when setting due date in the past', () => {
      const task = new Task({
        userId: testUserId,
        title: 'Test Task'
      });

      const pastDate = new Date(Date.now() - 86400000);

      expect(() => task.setDueDate(pastDate)).toThrow(EntityValidationError);
      expect(() => task.setDueDate(pastDate)).toThrow('Due date must be in the future');
    });
  });

  // ===================================
  // Task Update Tests
  // ===================================

  describe('Task Update', () => {
    test('should update task successfully', () => {
      const task = new Task(validTaskData);
      const updateData: TaskUpdateData = {
        title: 'Updated Task',
        description: 'Updated description',
        priority: TaskPriority.HIGH
      };

      task.updateTask(updateData);

      expect(task.title).toBe('Updated Task');
      expect(task.description).toBe('Updated description');
      expect(task.priority).toBe(TaskPriority.HIGH);
    });

    test('should rollback changes on validation failure', () => {
      const task = new Task(validTaskData);
      const originalTitle = task.title;
      const originalDescription = task.description;

      const invalidUpdateData: TaskUpdateData = {
        title: '', // Invalid empty title
        description: 'a'.repeat(1001) // Too long
      };

      expect(() => task.updateTask(invalidUpdateData)).toThrow(EntityValidationError);
      expect(task.title).toBe(originalTitle);
      expect(task.description).toBe(originalDescription);
    });

    test('should update only specified fields', () => {
      const task = new Task(validTaskData);
      const originalDescription = task.description;

      task.updateTask({ title: 'New Title Only' });

      expect(task.title).toBe('New Title Only');
      expect(task.description).toBe(originalDescription);
    });
  });

  // ===================================
  // Task Summary Tests
  // ===================================

  describe('Task Summary', () => {
    test('should get task summary', () => {
      const task = new Task(validTaskData);
      const summary = task.getSummary();

      expect(summary).toEqual({
        id: task.id,
        userId: testUserId,
        title: 'Test Task',
        description: 'This is a test task description',
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.PENDING,
        dueDate: validTaskData.dueDate,
        completedAt: undefined,
        isOverdue: false
      });
    });

    test('should include completion date in summary for completed task', () => {
      const task = new Task(validTaskData);
      task.complete(); // Complete the task properly

      const summary = task.getSummary();

      expect(summary.completedAt).toBeInstanceOf(Date);
      expect(summary.status).toBe(TaskStatus.COMPLETED);
    });
  });

  // ===================================
  // Serialization Tests
  // ===================================

  describe('Serialization', () => {
    test('should serialize to plain object', () => {
      const task = new Task(validTaskData);
      const plainObject = task.toPlainObject();

      expect(plainObject).toHaveProperty('id');
      expect(plainObject).toHaveProperty('userId', testUserId);
      expect(plainObject).toHaveProperty('title', 'Test Task');
      expect(plainObject).toHaveProperty('description', 'This is a test task description');
      expect(plainObject).toHaveProperty('priority', TaskPriority.MEDIUM);
      expect(plainObject).toHaveProperty('status', TaskStatus.PENDING);
      expect(plainObject).toHaveProperty('dueDate');
      expect(plainObject).toHaveProperty('createdAt');
      expect(plainObject).toHaveProperty('updatedAt');
    });

    test('should serialize to JSON string', () => {
      const task = new Task(validTaskData);
      const jsonString = task.toJSON();
      const parsedObject = JSON.parse(jsonString);

      expect(parsedObject).toHaveProperty('userId', testUserId);
      expect(parsedObject).toHaveProperty('title', 'Test Task');
      expect(parsedObject).toHaveProperty('priority', TaskPriority.MEDIUM);
      expect(parsedObject).toHaveProperty('status', TaskStatus.PENDING);
    });
  });

  // ===================================
  // Cloning Tests
  // ===================================

  describe('Cloning', () => {
    test('should clone task with same properties', () => {
      const task = new Task(validTaskData);
      const clonedTask = task.clone();

      expect(clonedTask).not.toBe(task);
      expect(clonedTask.id).toBe(task.id);
      expect(clonedTask.userId).toBe(task.userId);
      expect(clonedTask.title).toBe(task.title);
      expect(clonedTask.description).toBe(task.description);
      expect(clonedTask.priority).toBe(task.priority);
      expect(clonedTask.status).toBe(task.status);
    });

    test('should clone task with updated properties', () => {
      const task = new Task(validTaskData);
      const updates = {
        title: 'Cloned Task',
        priority: TaskPriority.HIGH
      };

      const clonedTask = task.clone(updates);

      expect(clonedTask).not.toBe(task);
      expect(clonedTask.id).toBe(task.id);
      expect(clonedTask.title).toBe('Cloned Task');
      expect(clonedTask.priority).toBe(TaskPriority.HIGH);
      expect(clonedTask.userId).toBe(task.userId);
    });

    test('should clone completed task with completion date', () => {
      const task = new Task(validTaskData);
      task.complete(); // Complete the task properly
      const completionDate = task.completedAt;

      const clonedTask = task.clone();

      expect(clonedTask.completedAt).toEqual(completionDate);
      expect(clonedTask.isCompleted()).toBe(true);
    });
  });

  // ===================================
  // Edge Cases and Error Handling
  // ===================================

  describe('Edge Cases', () => {
    test('should handle title with whitespace', () => {
      const taskData = {
        ...validTaskData,
        title: '   Valid Task   '
      };

      const task = new Task(taskData);
      expect(task.title).toBe('   Valid Task   ');
    });

    test('should maintain entity type', () => {
      const task = new Task(validTaskData);
      expect(task.getEntityType()).toBe('Task');
    });

    test('should handle timestamp updates correctly', async () => {
      const task = new Task(validTaskData);
      const originalUpdatedAt = task.updatedAt;

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      task.updateTask({ title: 'Updated Title' });

      expect(task.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    test('should handle undefined description correctly', () => {
      const taskData = {
        userId: testUserId,
        title: 'Task without description'
      };

      const task = new Task(taskData);
      expect(task.description).toBeUndefined();

      const summary = task.getSummary();
      expect(summary.description).toBeUndefined();
    });

    test('should handle defensive copying of dates', () => {
      const task = new Task(validTaskData);
      const returnedDueDate = task.dueDate;

      if (returnedDueDate) {
        returnedDueDate.setFullYear(2000);
        expect(task.dueDate?.getFullYear()).not.toBe(2000);
      }
    });

    test('should validate status transition rules', () => {
      const task = new Task(validTaskData);

      // Test all valid transitions
      expect(() => task.changeStatus(TaskStatus.IN_PROGRESS)).not.toThrow();
      expect(() => task.changeStatus(TaskStatus.COMPLETED)).not.toThrow();
      expect(() => task.changeStatus(TaskStatus.PENDING)).not.toThrow();
    });

    test('should handle same status transition', () => {
      const task = new Task(validTaskData);

      // Same status should not throw error
      expect(() => task.changeStatus(TaskStatus.PENDING)).not.toThrow();
      expect(task.status).toBe(TaskStatus.PENDING);
    });
  });
});
