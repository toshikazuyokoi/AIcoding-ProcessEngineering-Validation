/**
 * ===================================
 * Task Types Test Suite
 * ===================================
 * Purpose: Comprehensive tests for task-related type definitions
 * Features:
 * - Type guard function testing
 * - Interface validation testing
 * - Enum value testing
 * - Type safety verification
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  // Enums
  TaskPriority,
  TaskStatus,
  TaskCompletionStatus,
  TaskAssignmentStatus,
  TaskVisibility,
  TaskSortBy,
  TaskSortDirection,
  TaskActivityAction,
  TaskReminderType,
  TaskRecurringFrequency,
  TaskBulkOperation,
  
  // Interfaces
  TaskTimeTracking,
  TaskTimeEntry,
  TaskAttachment,
  TaskComment,
  TaskActivity,
  TaskReminder,
  TaskRecurringPattern,
  TaskTemplate,
  CreateTaskFromTemplateRequest,
  TaskBulkOperationRequest,
  TaskBulkOperationResult,
  TaskSearchResult,
  TaskDashboardSummary,
  TaskExportData,
  TaskImportData,
  TaskValidationRules,
  TaskNotificationSettings,
  TaskAnalytics,
  TaskFilterPreset,
  TaskWorkspaceSettings,
  
  // Type Guards
  isTaskOverdue,
  isTaskDueToday,
  isTaskDueThisWeek,
  isHighPriorityTask,
  isTaskCompleted,
  isTaskInProgress,
  canStartTask,
  canCompleteTask,
  
  // Utility Types
  PublicTaskData,
  TaskCreationInput,
  TaskUpdateInput,
  ExtendedTaskSearchFilters,
  TaskWithComputedProperties,
  TaskSummary,
  TaskCreationResult,
  TaskUpdateResult,
  TaskDeletionResult
} from '../../../src/domain/types/task.types';

import { TaskWithCategories } from '../../../src/domain/services/task.service';

describe('Task Types', () => {
  // ===================================
  // Enum Tests
  // ===================================

  describe('TaskPriority Enum', () => {
    test('should have correct values', () => {
      expect(TaskPriority.HIGH).toBe('high');
      expect(TaskPriority.MEDIUM).toBe('medium');
      expect(TaskPriority.LOW).toBe('low');
    });

    test('should have exactly 3 values', () => {
      const values = Object.values(TaskPriority);
      expect(values).toHaveLength(3);
      expect(values).toContain('high');
      expect(values).toContain('medium');
      expect(values).toContain('low');
    });
  });

  describe('TaskStatus Enum', () => {
    test('should have correct values', () => {
      expect(TaskStatus.PENDING).toBe('pending');
      expect(TaskStatus.IN_PROGRESS).toBe('in_progress');
      expect(TaskStatus.COMPLETED).toBe('completed');
    });

    test('should have exactly 3 values', () => {
      const values = Object.values(TaskStatus);
      expect(values).toHaveLength(3);
    });
  });

  describe('TaskCompletionStatus Enum', () => {
    test('should have correct values', () => {
      expect(TaskCompletionStatus.NOT_STARTED).toBe('not_started');
      expect(TaskCompletionStatus.IN_PROGRESS).toBe('in_progress');
      expect(TaskCompletionStatus.COMPLETED).toBe('completed');
      expect(TaskCompletionStatus.OVERDUE).toBe('overdue');
      expect(TaskCompletionStatus.CANCELLED).toBe('cancelled');
    });

    test('should have exactly 5 values', () => {
      const values = Object.values(TaskCompletionStatus);
      expect(values).toHaveLength(5);
    });
  });

  describe('TaskSortBy Enum', () => {
    test('should have correct values', () => {
      expect(TaskSortBy.CREATED_AT).toBe('created_at');
      expect(TaskSortBy.UPDATED_AT).toBe('updated_at');
      expect(TaskSortBy.DUE_DATE).toBe('due_date');
      expect(TaskSortBy.PRIORITY).toBe('priority');
      expect(TaskSortBy.STATUS).toBe('status');
      expect(TaskSortBy.TITLE).toBe('title');
    });

    test('should have exactly 7 values', () => {
      const values = Object.values(TaskSortBy);
      expect(values).toHaveLength(7);
    });
  });

  describe('TaskBulkOperation Enum', () => {
    test('should have correct values', () => {
      expect(TaskBulkOperation.UPDATE_STATUS).toBe('update_status');
      expect(TaskBulkOperation.UPDATE_PRIORITY).toBe('update_priority');
      expect(TaskBulkOperation.DELETE).toBe('delete');
      expect(TaskBulkOperation.COMPLETE).toBe('complete');
    });

    test('should have exactly 9 values', () => {
      const values = Object.values(TaskBulkOperation);
      expect(values).toHaveLength(9);
    });
  });

  // ===================================
  // Type Guard Tests
  // ===================================

  describe('Type Guards', () => {
    describe('isTaskOverdue', () => {
      test('should return true for overdue task', () => {
        const overdueTask = {
          dueDate: new Date(Date.now() - 86400000), // Yesterday
          status: TaskStatus.PENDING
        };
        expect(isTaskOverdue(overdueTask)).toBe(true);
      });

      test('should return false for future due date', () => {
        const futureTask = {
          dueDate: new Date(Date.now() + 86400000), // Tomorrow
          status: TaskStatus.PENDING
        };
        expect(isTaskOverdue(futureTask)).toBe(false);
      });

      test('should return false for completed task even if past due', () => {
        const completedTask = {
          dueDate: new Date(Date.now() - 86400000), // Yesterday
          status: TaskStatus.COMPLETED
        };
        expect(isTaskOverdue(completedTask)).toBe(false);
      });

      test('should return false for task without due date', () => {
        const taskWithoutDue = {
          status: TaskStatus.PENDING
        };
        expect(isTaskOverdue(taskWithoutDue)).toBe(false);
      });
    });

    describe('isTaskDueToday', () => {
      test('should return true for task due today', () => {
        const todayTask = {
          dueDate: new Date()
        };
        expect(isTaskDueToday(todayTask)).toBe(true);
      });

      test('should return false for task due tomorrow', () => {
        const tomorrowTask = {
          dueDate: new Date(Date.now() + 86400000)
        };
        expect(isTaskDueToday(tomorrowTask)).toBe(false);
      });

      test('should return false for task without due date', () => {
        const taskWithoutDue = {};
        expect(isTaskDueToday(taskWithoutDue)).toBe(false);
      });
    });

    describe('isTaskDueThisWeek', () => {
      test('should return true for task due within a week', () => {
        const thisWeekTask = {
          dueDate: new Date(Date.now() + 3 * 86400000) // 3 days from now
        };
        expect(isTaskDueThisWeek(thisWeekTask)).toBe(true);
      });

      test('should return false for task due next week', () => {
        const nextWeekTask = {
          dueDate: new Date(Date.now() + 10 * 86400000) // 10 days from now
        };
        expect(isTaskDueThisWeek(nextWeekTask)).toBe(false);
      });

      test('should return false for past due task', () => {
        const pastTask = {
          dueDate: new Date(Date.now() - 86400000) // Yesterday
        };
        expect(isTaskDueThisWeek(pastTask)).toBe(false);
      });
    });

    describe('isHighPriorityTask', () => {
      test('should return true for high priority task', () => {
        const highPriorityTask = { priority: TaskPriority.HIGH };
        expect(isHighPriorityTask(highPriorityTask)).toBe(true);
      });

      test('should return false for medium priority task', () => {
        const mediumPriorityTask = { priority: TaskPriority.MEDIUM };
        expect(isHighPriorityTask(mediumPriorityTask)).toBe(false);
      });

      test('should return false for low priority task', () => {
        const lowPriorityTask = { priority: TaskPriority.LOW };
        expect(isHighPriorityTask(lowPriorityTask)).toBe(false);
      });
    });

    describe('isTaskCompleted', () => {
      test('should return true for completed task', () => {
        const completedTask = { status: TaskStatus.COMPLETED };
        expect(isTaskCompleted(completedTask)).toBe(true);
      });

      test('should return false for pending task', () => {
        const pendingTask = { status: TaskStatus.PENDING };
        expect(isTaskCompleted(pendingTask)).toBe(false);
      });

      test('should return false for in progress task', () => {
        const inProgressTask = { status: TaskStatus.IN_PROGRESS };
        expect(isTaskCompleted(inProgressTask)).toBe(false);
      });
    });

    describe('canStartTask', () => {
      test('should return true for pending task', () => {
        const pendingTask = { status: TaskStatus.PENDING };
        expect(canStartTask(pendingTask)).toBe(true);
      });

      test('should return false for in progress task', () => {
        const inProgressTask = { status: TaskStatus.IN_PROGRESS };
        expect(canStartTask(inProgressTask)).toBe(false);
      });

      test('should return false for completed task', () => {
        const completedTask = { status: TaskStatus.COMPLETED };
        expect(canStartTask(completedTask)).toBe(false);
      });
    });

    describe('canCompleteTask', () => {
      test('should return true for pending task', () => {
        const pendingTask = { status: TaskStatus.PENDING };
        expect(canCompleteTask(pendingTask)).toBe(true);
      });

      test('should return true for in progress task', () => {
        const inProgressTask = { status: TaskStatus.IN_PROGRESS };
        expect(canCompleteTask(inProgressTask)).toBe(true);
      });

      test('should return false for completed task', () => {
        const completedTask = { status: TaskStatus.COMPLETED };
        expect(canCompleteTask(completedTask)).toBe(false);
      });
    });
  });

  // ===================================
  // Interface Structure Tests
  // ===================================

  describe('Interface Structures', () => {
    describe('TaskTimeTracking', () => {
      test('should have required properties', () => {
        const timeTracking: TaskTimeTracking = {
          taskId: 'task-123',
          timeEntries: []
        };

        expect(timeTracking.taskId).toBeDefined();
        expect(timeTracking.timeEntries).toBeDefined();
      });

      test('should allow optional properties', () => {
        const timeTracking: TaskTimeTracking = {
          taskId: 'task-123',
          estimatedHours: 8,
          actualHours: 6.5,
          startedAt: new Date(),
          completedAt: new Date(),
          timeEntries: []
        };

        expect(timeTracking.estimatedHours).toBe(8);
        expect(timeTracking.actualHours).toBe(6.5);
        expect(timeTracking.startedAt).toBeDefined();
        expect(timeTracking.completedAt).toBeDefined();
      });
    });

    describe('TaskTimeEntry', () => {
      test('should have all required properties', () => {
        const timeEntry: TaskTimeEntry = {
          id: 'entry-123',
          taskId: 'task-123',
          userId: 'user-123',
          startTime: new Date(),
          billable: true,
          createdAt: new Date()
        };

        expect(timeEntry.id).toBeDefined();
        expect(timeEntry.taskId).toBeDefined();
        expect(timeEntry.userId).toBeDefined();
        expect(timeEntry.startTime).toBeDefined();
        expect(timeEntry.billable).toBeDefined();
        expect(timeEntry.createdAt).toBeDefined();
      });

      test('should allow optional properties', () => {
        const timeEntry: TaskTimeEntry = {
          id: 'entry-123',
          taskId: 'task-123',
          userId: 'user-123',
          description: 'Working on feature implementation',
          startTime: new Date(),
          endTime: new Date(),
          duration: 120, // 2 hours in minutes
          billable: true,
          createdAt: new Date()
        };

        expect(timeEntry.description).toBe('Working on feature implementation');
        expect(timeEntry.endTime).toBeDefined();
        expect(timeEntry.duration).toBe(120);
      });
    });

    describe('TaskAttachment', () => {
      test('should have all required properties', () => {
        const attachment: TaskAttachment = {
          id: 'attachment-123',
          taskId: 'task-123',
          fileName: 'document.pdf',
          originalName: 'Project Document.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024000,
          filePath: '/uploads/documents/document.pdf',
          uploadedBy: 'user-123',
          uploadedAt: new Date()
        };

        expect(attachment.id).toBeDefined();
        expect(attachment.taskId).toBeDefined();
        expect(attachment.fileName).toBeDefined();
        expect(attachment.originalName).toBeDefined();
        expect(attachment.mimeType).toBeDefined();
        expect(attachment.fileSize).toBeDefined();
        expect(attachment.filePath).toBeDefined();
        expect(attachment.uploadedBy).toBeDefined();
        expect(attachment.uploadedAt).toBeDefined();
      });
    });

    describe('TaskComment', () => {
      test('should have all required properties', () => {
        const comment: TaskComment = {
          id: 'comment-123',
          taskId: 'task-123',
          userId: 'user-123',
          content: 'This is a comment on the task',
          isEdited: false,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(comment.id).toBeDefined();
        expect(comment.taskId).toBeDefined();
        expect(comment.userId).toBeDefined();
        expect(comment.content).toBeDefined();
        expect(comment.isEdited).toBeDefined();
        expect(comment.createdAt).toBeDefined();
        expect(comment.updatedAt).toBeDefined();
      });

      test('should allow optional properties', () => {
        const comment: TaskComment = {
          id: 'comment-123',
          taskId: 'task-123',
          userId: 'user-123',
          content: 'This is a reply to another comment',
          parentCommentId: 'comment-456',
          isEdited: true,
          editedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(comment.parentCommentId).toBe('comment-456');
        expect(comment.editedAt).toBeDefined();
      });
    });

    describe('TaskBulkOperationRequest', () => {
      test('should have all required properties', () => {
        const bulkRequest: TaskBulkOperationRequest = {
          taskIds: ['task-1', 'task-2', 'task-3'],
          operation: TaskBulkOperation.UPDATE_STATUS
        };

        expect(bulkRequest.taskIds).toHaveLength(3);
        expect(bulkRequest.operation).toBe(TaskBulkOperation.UPDATE_STATUS);
      });

      test('should allow optional parameters', () => {
        const bulkRequest: TaskBulkOperationRequest = {
          taskIds: ['task-1', 'task-2'],
          operation: TaskBulkOperation.UPDATE_STATUS,
          parameters: {
            status: TaskStatus.COMPLETED,
            priority: TaskPriority.HIGH
          }
        };

        expect(bulkRequest.parameters?.status).toBe(TaskStatus.COMPLETED);
        expect(bulkRequest.parameters?.priority).toBe(TaskPriority.HIGH);
      });

      test('should validate operation values', () => {
        const validOperations = [
          'update_status', 'update_priority', 'update_due_date',
          'add_categories', 'remove_categories', 'assign', 'delete', 'complete', 'archive'
        ];

        validOperations.forEach(operation => {
          const request: TaskBulkOperationRequest = {
            taskIds: ['task-1'],
            operation: operation as any
          };
          expect(validOperations).toContain(request.operation);
        });
      });
    });

    describe('TaskDashboardSummary', () => {
      test('should have all required properties', () => {
        const dashboard: TaskDashboardSummary = {
          userId: 'user-123',
          totalTasks: 25,
          completedTasks: 15,
          pendingTasks: 8,
          inProgressTasks: 2,
          overdueTasks: 3,
          dueTodayTasks: 1,
          dueThisWeekTasks: 5,
          recentTasks: [],
          upcomingTasks: [],
          priorityBreakdown: {
            high: 5,
            medium: 12,
            low: 8
          },
          categoryBreakdown: []
        };

        expect(dashboard.userId).toBe('user-123');
        expect(dashboard.totalTasks).toBe(25);
        expect(dashboard.completedTasks).toBe(15);
        expect(dashboard.priorityBreakdown.high).toBe(5);
        expect(dashboard.categoryBreakdown).toEqual([]);
      });

      test('should calculate totals correctly', () => {
        const dashboard: TaskDashboardSummary = {
          userId: 'user-123',
          totalTasks: 20,
          completedTasks: 10,
          pendingTasks: 6,
          inProgressTasks: 4,
          overdueTasks: 2,
          dueTodayTasks: 1,
          dueThisWeekTasks: 3,
          recentTasks: [],
          upcomingTasks: [],
          priorityBreakdown: {
            high: 3,
            medium: 10,
            low: 7
          },
          categoryBreakdown: []
        };

        const activeTasks = dashboard.pendingTasks + dashboard.inProgressTasks;
        expect(activeTasks).toBe(10);

        const priorityTotal = dashboard.priorityBreakdown.high +
                            dashboard.priorityBreakdown.medium +
                            dashboard.priorityBreakdown.low;
        expect(priorityTotal).toBe(20);
      });
    });

    describe('TaskValidationRules', () => {
      test('should have all required properties', () => {
        const validationRules: TaskValidationRules = {
          title: {
            minLength: 3,
            maxLength: 200,
            allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?]+$/,
            forbiddenWords: ['spam', 'test']
          },
          description: {
            maxLength: 2000,
            allowHtml: false
          },
          dueDate: {
            minDaysFromNow: 0,
            maxDaysFromNow: 365,
            allowPastDates: false
          }
        };

        expect(validationRules.title.minLength).toBe(3);
        expect(validationRules.description.maxLength).toBe(2000);
        expect(validationRules.dueDate.allowPastDates).toBe(false);
      });

      test('should handle regex patterns', () => {
        const validationRules: TaskValidationRules = {
          title: {
            minLength: 1,
            maxLength: 100,
            allowedCharacters: /^[a-zA-Z0-9\s]+$/,
            forbiddenWords: []
          },
          description: {
            maxLength: 1000,
            allowHtml: true
          },
          dueDate: {
            minDaysFromNow: 1,
            maxDaysFromNow: 30,
            allowPastDates: true
          }
        };

        expect(validationRules.title.allowedCharacters).toBeInstanceOf(RegExp);
        expect(validationRules.title.allowedCharacters.test('Valid Title 123')).toBe(true);
        expect(validationRules.title.allowedCharacters.test('Invalid@Title!')).toBe(false);
      });
    });
  });

  // ===================================
  // Utility Type Tests
  // ===================================

  describe('Utility Types', () => {
    describe('PublicTaskData', () => {
      test('should exclude userId from TaskWithCategories', () => {
        const publicData: PublicTaskData = {
          id: 'task-123',
          task: {
            id: 'task-123',
            title: 'Test Task',
            description: 'Test Description',
            priority: TaskPriority.HIGH,
            status: TaskStatus.PENDING,
            dueDate: new Date(),
            completedAt: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          categories: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        expect(publicData.id).toBeDefined();
        expect(publicData.task).toBeDefined();
        expect(publicData.categories).toBeDefined();
        expect(publicData.createdAt).toBeDefined();
        expect(publicData.updatedAt).toBeDefined();
        // userId should not be present in PublicTaskData
        expect('userId' in publicData).toBe(false);
      });
    });

    describe('TaskCreationInput', () => {
      test('should exclude userId from TaskCreationData', () => {
        const creationInput: TaskCreationInput = {
          title: 'New Task',
          description: 'Task description',
          priority: TaskPriority.MEDIUM,
          dueDate: new Date(),
          categoryIds: ['cat-1', 'cat-2']
        };

        expect(creationInput.title).toBe('New Task');
        expect(creationInput.priority).toBe(TaskPriority.MEDIUM);
        expect(creationInput.categoryIds).toHaveLength(2);
        expect('userId' in creationInput).toBe(false);
      });
    });

    describe('TaskUpdateInput', () => {
      test('should allow partial updates', () => {
        const updateInput: TaskUpdateInput = {
          title: 'Updated Title',
          priority: TaskPriority.HIGH
        };

        expect(updateInput.title).toBe('Updated Title');
        expect(updateInput.priority).toBe(TaskPriority.HIGH);
        expect(updateInput.description).toBeUndefined();
      });

      test('should allow category updates', () => {
        const updateInput: TaskUpdateInput = {
          categoryIds: ['cat-3', 'cat-4', 'cat-5']
        };

        expect(updateInput.categoryIds).toHaveLength(3);
        expect(updateInput.categoryIds).toContain('cat-3');
      });
    });

    describe('ExtendedTaskSearchFilters', () => {
      test('should extend TaskSearchFilters with additional properties', () => {
        const extendedFilters: ExtendedTaskSearchFilters = {
          status: TaskStatus.PENDING,
          priority: TaskPriority.HIGH,
          isOverdue: true,
          isDueToday: false,
          isDueThisWeek: true,
          hasCategories: true,
          hasAttachments: false,
          createdAfter: new Date(Date.now() - 86400000 * 7), // 7 days ago
          createdBefore: new Date(),
          estimatedHoursMin: 2,
          estimatedHoursMax: 8
        };

        expect(extendedFilters.status).toBe(TaskStatus.PENDING);
        expect(extendedFilters.isOverdue).toBe(true);
        expect(extendedFilters.hasCategories).toBe(true);
        expect(extendedFilters.estimatedHoursMin).toBe(2);
        expect(extendedFilters.estimatedHoursMax).toBe(8);
      });
    });

    describe('TaskWithComputedProperties', () => {
      test('should extend TaskWithCategories with computed properties', () => {
        const taskWithComputed: TaskWithComputedProperties = {
          task: {
            id: 'task-123',
            title: 'Test Task',
            description: 'Test Description',
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
            completedAt: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          categories: [],
          isOverdue: false,
          isDueToday: false,
          isDueThisWeek: true,
          daysUntilDue: 3,
          completionPercentage: 50,
          timeSpent: 4.5,
          estimatedTimeRemaining: 3.5
        };

        expect(taskWithComputed.isOverdue).toBe(false);
        expect(taskWithComputed.isDueThisWeek).toBe(true);
        expect(taskWithComputed.daysUntilDue).toBe(3);
        expect(taskWithComputed.completionPercentage).toBe(50);
        expect(taskWithComputed.timeSpent).toBe(4.5);
        expect(taskWithComputed.estimatedTimeRemaining).toBe(3.5);
      });
    });

    describe('TaskSummary', () => {
      test('should provide summary information', () => {
        const taskSummary: TaskSummary = {
          task: {
            id: 'task-123',
            title: 'Summary Task',
            description: 'Task for summary',
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.PENDING,
            dueDate: new Date(),
            completedAt: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          categoryCount: 2,
          commentCount: 5,
          attachmentCount: 1,
          isOverdue: false,
          daysUntilDue: 2
        };

        expect(taskSummary.categoryCount).toBe(2);
        expect(taskSummary.commentCount).toBe(5);
        expect(taskSummary.attachmentCount).toBe(1);
        expect(taskSummary.isOverdue).toBe(false);
        expect(taskSummary.daysUntilDue).toBe(2);
      });
    });

    describe('TaskCreationResult', () => {
      test('should include task and optional warnings/suggestions', () => {
        const creationResult: TaskCreationResult = {
          task: {
            task: {
              id: 'task-123',
              title: 'Created Task',
              description: 'Newly created task',
              priority: TaskPriority.HIGH,
              status: TaskStatus.PENDING,
              dueDate: new Date(),
              completedAt: undefined,
              createdAt: new Date(),
              updatedAt: new Date()
            } as any,
            categories: []
          },
          warnings: ['Due date is very close'],
          suggestions: ['Consider adding categories', 'Set estimated time']
        };

        expect(creationResult.task).toBeDefined();
        expect(creationResult.warnings).toHaveLength(1);
        expect(creationResult.suggestions).toHaveLength(2);
        expect(creationResult.warnings?.[0]).toBe('Due date is very close');
      });
    });

    describe('TaskDeletionResult', () => {
      test('should track deletion and related data cleanup', () => {
        const deletionResult: TaskDeletionResult = {
          success: true,
          taskId: 'task-123',
          relatedDataDeleted: {
            comments: 3,
            attachments: 2,
            timeEntries: 5,
            activities: 12
          }
        };

        expect(deletionResult.success).toBe(true);
        expect(deletionResult.taskId).toBe('task-123');
        expect(deletionResult.relatedDataDeleted.comments).toBe(3);
        expect(deletionResult.relatedDataDeleted.attachments).toBe(2);
        expect(deletionResult.relatedDataDeleted.timeEntries).toBe(5);
        expect(deletionResult.relatedDataDeleted.activities).toBe(12);
      });
    });
  });

  // ===================================
  // Type Compatibility Tests
  // ===================================

  describe('Type Compatibility', () => {
    test('should be compatible with TaskPriority from entity', () => {
      const priority: TaskPriority = TaskPriority.HIGH;
      expect(priority).toBe('high');
    });

    test('should work with type guards on different object shapes', () => {
      interface TestTask {
        priority: TaskPriority;
        status: TaskStatus;
        dueDate?: Date;
        title: string;
      }

      const testTask: TestTask = {
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() + 86400000), // Tomorrow
        title: 'Test Task'
      };

      expect(isHighPriorityTask(testTask)).toBe(true);
      expect(isTaskCompleted(testTask)).toBe(false);
      expect(canStartTask(testTask)).toBe(true);
      expect(isTaskOverdue(testTask)).toBe(false);
    });

    test('should handle partial objects correctly', () => {
      const partialTask: Partial<TaskWithComputedProperties> = {
        task: {
          priority: TaskPriority.MEDIUM,
          status: TaskStatus.IN_PROGRESS
        } as any,
        isOverdue: false
      };

      if (partialTask.task?.priority) {
        expect(isHighPriorityTask({ priority: partialTask.task.priority })).toBe(false);
      }

      if (partialTask.task?.status) {
        expect(isTaskInProgress({ status: partialTask.task.status })).toBe(true);
      }
    });
  });

  // ===================================
  // Edge Case Tests
  // ===================================

  describe('Edge Cases', () => {
    test('should handle empty arrays in bulk operations', () => {
      const emptyBulkRequest: TaskBulkOperationRequest = {
        taskIds: [],
        operation: TaskBulkOperation.DELETE
      };

      expect(emptyBulkRequest.taskIds).toHaveLength(0);
    });

    test('should handle undefined optional properties', () => {
      const minimalTimeEntry: TaskTimeEntry = {
        id: 'entry-123',
        taskId: 'task-123',
        userId: 'user-123',
        startTime: new Date(),
        billable: false,
        createdAt: new Date()
        // endTime, duration, description are undefined
      };

      expect(minimalTimeEntry.endTime).toBeUndefined();
      expect(minimalTimeEntry.duration).toBeUndefined();
      expect(minimalTimeEntry.description).toBeUndefined();
    });

    test('should handle complex nested objects', () => {
      const complexDashboard: TaskDashboardSummary = {
        userId: 'user-123',
        totalTasks: 50,
        completedTasks: 30,
        pendingTasks: 15,
        inProgressTasks: 5,
        overdueTasks: 8,
        dueTodayTasks: 2,
        dueThisWeekTasks: 7,
        recentTasks: [],
        upcomingTasks: [],
        priorityBreakdown: {
          high: 10,
          medium: 25,
          low: 15
        },
        categoryBreakdown: [
          { categoryId: 'cat-1', categoryName: 'Work', taskCount: 20 },
          { categoryId: 'cat-2', categoryName: 'Personal', taskCount: 15 },
          { categoryId: 'cat-3', categoryName: 'Learning', taskCount: 15 }
        ]
      };

      expect(complexDashboard.categoryBreakdown).toHaveLength(3);
      expect(complexDashboard.categoryBreakdown[0].taskCount).toBe(20);
      expect(complexDashboard.priorityBreakdown.high).toBe(10);
    });

    test('should handle date objects in interfaces', () => {
      const timeTracking: TaskTimeTracking = {
        taskId: 'task-123',
        startedAt: new Date('2024-01-01T09:00:00Z'),
        pausedAt: new Date('2024-01-01T12:00:00Z'),
        resumedAt: new Date('2024-01-01T13:00:00Z'),
        completedAt: new Date('2024-01-01T17:00:00Z'),
        timeEntries: []
      };

      expect(timeTracking.startedAt).toBeInstanceOf(Date);
      expect(timeTracking.pausedAt).toBeInstanceOf(Date);
      expect(timeTracking.resumedAt).toBeInstanceOf(Date);
      expect(timeTracking.completedAt).toBeInstanceOf(Date);
    });

    test('should handle regex patterns in validation rules', () => {
      const validationRules: TaskValidationRules = {
        title: {
          minLength: 1,
          maxLength: 100,
          allowedCharacters: /^[a-zA-Z0-9\s\-_.,!?]+$/,
          forbiddenWords: ['spam', 'test', 'dummy']
        },
        description: {
          maxLength: 2000,
          allowHtml: true
        },
        dueDate: {
          minDaysFromNow: 0,
          maxDaysFromNow: 365,
          allowPastDates: false
        }
      };

      expect(validationRules.title.allowedCharacters).toBeInstanceOf(RegExp);
      expect(validationRules.title.allowedCharacters.test('Valid Task Title!')).toBe(true);
      expect(validationRules.title.allowedCharacters.test('Invalid@Title#')).toBe(false);
      expect(validationRules.title.forbiddenWords).toContain('spam');
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration Tests', () => {
    test('should work together in realistic task creation scenario', () => {
      // Create a task creation input
      const creationInput: TaskCreationInput = {
        title: 'Implement user authentication',
        description: 'Add JWT-based authentication to the application',
        priority: TaskPriority.HIGH,
        dueDate: new Date(Date.now() + 86400000 * 7), // 1 week from now
        categoryIds: ['cat-work', 'cat-development']
      };

      // Simulate task creation result
      const creationResult: TaskCreationResult = {
        task: {
          task: {
            id: 'task-auth-123',
            title: creationInput.title,
            description: creationInput.description,
            priority: creationInput.priority,
            status: TaskStatus.PENDING,
            dueDate: creationInput.dueDate,
            completedAt: undefined,
            createdAt: new Date(),
            updatedAt: new Date()
          } as any,
          categories: [
            { id: 'cat-work', name: 'Work', color: '#ff0000' } as any,
            { id: 'cat-development', name: 'Development', color: '#00ff00' } as any
          ]
        },
        suggestions: ['Consider breaking this into smaller tasks', 'Add time estimation']
      };

      // Validate the created task
      expect(isHighPriorityTask(creationResult.task.task)).toBe(true);
      expect(isTaskDueThisWeek(creationResult.task.task)).toBe(true);
      expect(canStartTask(creationResult.task.task)).toBe(true);
      expect(creationResult.task.categories).toHaveLength(2);
      expect(creationResult.suggestions).toHaveLength(2);
    });

    test('should handle task bulk operations workflow', () => {
      // Bulk operation request
      const bulkRequest: TaskBulkOperationRequest = {
        taskIds: ['task-1', 'task-2', 'task-3'],
        operation: TaskBulkOperation.UPDATE_STATUS,
        parameters: {
          status: TaskStatus.COMPLETED
        }
      };

      // Bulk operation result
      const bulkResult: TaskBulkOperationResult = {
        success: true,
        processedCount: 3,
        failedCount: 0,
        errors: [],
        results: [
          { taskId: 'task-1', success: true, message: 'Task completed successfully' },
          { taskId: 'task-2', success: true, message: 'Task completed successfully' },
          { taskId: 'task-3', success: true, message: 'Task completed successfully' }
        ]
      };

      expect(bulkRequest.taskIds).toHaveLength(3);
      expect(bulkRequest.parameters?.status).toBe(TaskStatus.COMPLETED);
      expect(bulkResult.processedCount).toBe(3);
      expect(bulkResult.failedCount).toBe(0);
      expect(bulkResult.results).toHaveLength(3);
      expect(bulkResult.results.every(r => r.success)).toBe(true);
    });

    test('should handle task dashboard and analytics together', () => {
      const dashboard: TaskDashboardSummary = {
        userId: 'user-123',
        totalTasks: 25,
        completedTasks: 15,
        pendingTasks: 8,
        inProgressTasks: 2,
        overdueTasks: 3,
        dueTodayTasks: 1,
        dueThisWeekTasks: 5,
        recentTasks: [],
        upcomingTasks: [],
        priorityBreakdown: {
          high: 8,
          medium: 12,
          low: 5
        },
        categoryBreakdown: [
          { categoryId: 'cat-1', categoryName: 'Work', taskCount: 15 },
          { categoryId: 'cat-2', categoryName: 'Personal', taskCount: 10 }
        ]
      };

      const analytics: TaskAnalytics = {
        userId: dashboard.userId,
        period: {
          startDate: new Date(Date.now() - 86400000 * 30), // 30 days ago
          endDate: new Date()
        },
        metrics: {
          tasksCreated: dashboard.totalTasks,
          tasksCompleted: dashboard.completedTasks,
          tasksOverdue: dashboard.overdueTasks,
          averageCompletionTime: 48, // hours
          productivityScore: 85
        },
        trends: {
          completionRate: dashboard.completedTasks / dashboard.totalTasks,
          overdueRate: dashboard.overdueTasks / dashboard.totalTasks,
          averagePriority: 2.1
        },
        categoryPerformance: dashboard.categoryBreakdown.map(cat => ({
          categoryId: cat.categoryId,
          categoryName: cat.categoryName,
          completionRate: 0.8,
          averageTime: 36
        }))
      };

      expect(analytics.userId).toBe(dashboard.userId);
      expect(analytics.metrics.tasksCompleted).toBe(dashboard.completedTasks);
      expect(analytics.trends.completionRate).toBe(0.6); // 15/25
      expect(analytics.categoryPerformance).toHaveLength(2);
    });
  });
});
