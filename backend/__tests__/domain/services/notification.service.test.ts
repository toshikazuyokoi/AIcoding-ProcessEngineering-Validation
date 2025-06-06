/**
 * ===================================
 * Notification Service Test Suite
 * ===================================
 * Purpose: Comprehensive tests for NotificationService domain service
 * Features:
 * - Notification sending operations testing
 * - Notification management testing
 * - Business logic validation
 * - Error handling and edge cases
 * - Mock repository and dependencies
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  NotificationService,
  INotificationRepository,
  INotificationPreferencesRepository,
  CreateNotificationRequest,
  Notification,
  NotificationPreferences,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  NotificationStatus,
  NotificationResult
} from '../../../src/domain/services/notification.service';
import { EmailService } from '../../../src/domain/services/email.service';
import { User, UserCreationData, UserRole } from '../../../src/domain/entities/user.entity';
import { Task, TaskCreationData, TaskPriority, TaskStatus } from '../../../src/domain/entities/task.entity';
import { EntityValidationError, EntityNotFoundError } from '../../../src/domain/entities/base.entity';

// Mock implementations
class MockNotificationRepository implements INotificationRepository {
  private notifications: Map<string, Notification> = new Map();
  private idCounter = 1;

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const id = `notification-${this.idCounter++}`;
    const createdNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date()
    };
    this.notifications.set(id, createdNotification);
    return createdNotification;
  }

  async findById(id: string): Promise<Notification | null> {
    return this.notifications.get(id) || null;
  }

  async findByUserId(userId: string, limit?: number, offset?: number): Promise<Notification[]> {
    const userNotifications = Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const start = offset || 0;
    const end = limit ? start + limit : userNotifications.length;
    return userNotifications.slice(start, end);
  }

  async update(id: string, updates: Partial<Notification>): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification ${id} not found`);
    }

    const updatedNotification = { ...notification, ...updates };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async delete(id: string): Promise<void> {
    this.notifications.delete(id);
  }

  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications.get(id);
    if (notification) {
      notification.status = NotificationStatus.READ;
      notification.readAt = new Date();
    }
  }

  async markAllAsRead(userId: string): Promise<number> {
    let count = 0;
    for (const notification of this.notifications.values()) {
      if (notification.userId === userId && notification.status !== NotificationStatus.READ) {
        notification.status = NotificationStatus.READ;
        notification.readAt = new Date();
        count++;
      }
    }
    return count;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && n.status !== NotificationStatus.READ)
      .length;
  }

  async deleteOldNotifications(olderThan: Date): Promise<number> {
    let count = 0;
    for (const [id, notification] of this.notifications.entries()) {
      if (notification.createdAt < olderThan) {
        this.notifications.delete(id);
        count++;
      }
    }
    return count;
  }

  // Helper methods for testing
  clear(): void {
    this.notifications.clear();
    this.idCounter = 1;
  }

  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }
}

class MockNotificationPreferencesRepository implements INotificationPreferencesRepository {
  private preferences: Map<string, NotificationPreferences> = new Map();

  async findByUserId(userId: string): Promise<NotificationPreferences | null> {
    return this.preferences.get(userId) || null;
  }

  async create(preferences: NotificationPreferences): Promise<NotificationPreferences> {
    this.preferences.set(preferences.userId, preferences);
    return preferences;
  }

  async update(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const existing = this.preferences.get(userId);
    if (!existing) {
      throw new Error(`Preferences for user ${userId} not found`);
    }

    const updated = { ...existing, ...updates };
    this.preferences.set(userId, updated);
    return updated;
  }

  async delete(userId: string): Promise<void> {
    this.preferences.delete(userId);
  }

  // Helper methods for testing
  clear(): void {
    this.preferences.clear();
  }

  setPreferences(userId: string, preferences: NotificationPreferences): void {
    this.preferences.set(userId, preferences);
  }
}

class MockEmailService {
  private sentEmails: any[] = [];

  async sendNotificationEmail(): Promise<any> {
    const result = {
      success: true,
      messageId: `email-${Date.now()}`,
      timestamp: new Date()
    };
    this.sentEmails.push(result);
    return result;
  }

  // Helper methods for testing
  getSentEmails(): any[] {
    return [...this.sentEmails];
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

describe('NotificationService', () => {
  let notificationService: NotificationService;
  let mockNotificationRepository: MockNotificationRepository;
  let mockPreferencesRepository: MockNotificationPreferencesRepository;
  let mockEmailService: MockEmailService;

  const testUser = new User({
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    role: UserRole.USER
  });

  const testTask = new Task({
    userId: testUser.id,
    title: 'Test Task',
    description: 'Test task description',
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    dueDate: new Date(Date.now() + 86400000) // Tomorrow
  });

  beforeEach(() => {
    mockNotificationRepository = new MockNotificationRepository();
    mockPreferencesRepository = new MockNotificationPreferencesRepository();
    mockEmailService = new MockEmailService();
    
    notificationService = new NotificationService(
      mockNotificationRepository,
      mockPreferencesRepository,
      mockEmailService as any
    );
  });

  // ===================================
  // Basic Notification Sending Tests
  // ===================================

  describe('sendNotification', () => {
    const validNotificationRequest: CreateNotificationRequest = {
      userId: testUser.id,
      type: NotificationType.GENERAL,
      title: 'Test Notification',
      message: 'This is a test notification',
      priority: NotificationPriority.NORMAL
    };

    test('should send notification successfully', async () => {
      const result = await notificationService.sendNotification(validNotificationRequest);

      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
      expect(result.channelResults).toHaveLength(2); // Default: email + in-app
      expect(result.timestamp).toBeDefined();

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].title).toBe('Test Notification');
      expect(notifications[0].status).toBe(NotificationStatus.SENT);
    });

    test('should create default preferences if none exist', async () => {
      await notificationService.sendNotification(validNotificationRequest);

      const preferences = await notificationService.getUserPreferences(testUser.id);
      expect(preferences.emailEnabled).toBe(true);
      expect(preferences.inAppEnabled).toBe(true);
      expect(preferences.taskReminders).toBe(true);
    });

    test('should use specified channels when provided', async () => {
      const requestWithChannels = {
        ...validNotificationRequest,
        channels: [NotificationChannel.IN_APP]
      };

      const result = await notificationService.sendNotification(requestWithChannels);

      expect(result.channelResults).toHaveLength(1);
      expect(result.channelResults[0].channel).toBe(NotificationChannel.IN_APP);
    });

    test('should throw error for invalid request', async () => {
      const invalidRequest = {
        ...validNotificationRequest,
        title: ''
      };

      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow(EntityValidationError);
      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow('Notification title is required');
    });
  });

  // ===================================
  // Task-related Notification Tests
  // ===================================

  describe('sendTaskReminder', () => {
    test('should send task reminder with normal priority', async () => {
      const result = await notificationService.sendTaskReminder(testUser, testTask);

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.TASK_REMINDER);
      expect(notifications[0].title).toBe('Task Reminder: Test Task');
      expect(notifications[0].priority).toBe(NotificationPriority.NORMAL);
      expect(notifications[0].metadata?.taskId).toBe(testTask.id);
    });

    test('should send overdue task reminder with urgent priority', async () => {
      // Create overdue task
      const overdueTask = new Task({
        userId: testUser.id,
        title: 'Overdue Task',
        description: 'This task is overdue',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() - 86400000) // Yesterday
      }, {
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000)
      });

      const result = await notificationService.sendTaskReminder(testUser, overdueTask);

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications[0].title).toBe('Overdue Task: Overdue Task');
      expect(notifications[0].priority).toBe(NotificationPriority.URGENT);
      expect(notifications[0].metadata?.isOverdue).toBe(true);
    });
  });

  describe('sendTaskCompleted', () => {
    test('should send task completed notification', async () => {
      const result = await notificationService.sendTaskCompleted(testUser, testTask);

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.TASK_COMPLETED);
      expect(notifications[0].title).toBe('Task Completed: Test Task');
      expect(notifications[0].priority).toBe(NotificationPriority.LOW);
      expect(notifications[0].message).toContain('Congratulations!');
    });
  });

  describe('sendTaskOverdue', () => {
    test('should send task overdue notification', async () => {
      const result = await notificationService.sendTaskOverdue(testUser, testTask);

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.TASK_OVERDUE);
      expect(notifications[0].title).toBe('Task Overdue: Test Task');
      expect(notifications[0].priority).toBe(NotificationPriority.URGENT);
      expect(notifications[0].metadata?.overdueDays).toBeDefined();
    });
  });

  describe('sendTaskDueSoon', () => {
    test('should send task due soon notification with high priority for < 24 hours', async () => {
      const result = await notificationService.sendTaskDueSoon(testUser, testTask, 12);

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.TASK_DUE_SOON);
      expect(notifications[0].title).toBe('Task Due Soon: Test Task');
      expect(notifications[0].priority).toBe(NotificationPriority.HIGH);
      expect(notifications[0].message).toContain('12 hour(s)');
    });

    test('should send task due soon notification with normal priority for > 24 hours', async () => {
      const result = await notificationService.sendTaskDueSoon(testUser, testTask, 48);

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications[0].priority).toBe(NotificationPriority.NORMAL);
      expect(notifications[0].message).toContain('2 day(s)');
    });
  });

  // ===================================
  // System Notification Tests
  // ===================================

  describe('sendSystemAnnouncement', () => {
    test('should send system announcement to multiple users', async () => {
      const userIds = [testUser.id, 'user2', 'user3'];
      const results = await notificationService.sendSystemAnnouncement(
        userIds,
        'System Maintenance',
        'The system will be down for maintenance.',
        NotificationPriority.HIGH
      );

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(3);
      expect(notifications.every(n => n.type === NotificationType.SYSTEM_ANNOUNCEMENT)).toBe(true);
      expect(notifications.every(n => n.priority === NotificationPriority.HIGH)).toBe(true);
    });

    test('should handle individual failures in bulk sending', async () => {
      // Mock a failure by using invalid user ID that will cause validation error
      const userIds = [testUser.id, ''];
      const results = await notificationService.sendSystemAnnouncement(
        userIds,
        'Test Announcement',
        'Test message'
      );

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });

  describe('sendSecurityAlert', () => {
    test('should send security alert with forced channels', async () => {
      const result = await notificationService.sendSecurityAlert(
        testUser,
        'Suspicious Login',
        'A suspicious login attempt was detected.'
      );

      expect(result.success).toBe(true);

      const notifications = mockNotificationRepository.getAll();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe(NotificationType.SECURITY_ALERT);
      expect(notifications[0].priority).toBe(NotificationPriority.URGENT);
      expect(notifications[0].channels).toContain(NotificationChannel.EMAIL);
      expect(notifications[0].channels).toContain(NotificationChannel.IN_APP);
      expect(notifications[0].metadata?.isSecurityAlert).toBe(true);
    });
  });

  // ===================================
  // Notification Management Tests
  // ===================================

  describe('getNotifications', () => {
    beforeEach(async () => {
      // Create test notifications
      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Notification 1',
        message: 'Message 1'
      });

      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Notification 2',
        message: 'Message 2'
      });

      await notificationService.sendNotification({
        userId: 'other-user',
        type: NotificationType.GENERAL,
        title: 'Other User Notification',
        message: 'Other message'
      });
    });

    test('should return notifications for specific user', async () => {
      const notifications = await notificationService.getNotifications(testUser.id);

      expect(notifications).toHaveLength(2);
      expect(notifications.every(n => n.userId === testUser.id)).toBe(true);
    });

    test('should respect limit and offset parameters', async () => {
      const notifications = await notificationService.getNotifications(testUser.id, 1, 1);

      expect(notifications).toHaveLength(1);
    });
  });

  describe('getNotificationById', () => {
    let testNotification: Notification;

    beforeEach(async () => {
      const result = await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Test Notification',
        message: 'Test message'
      });
      testNotification = mockNotificationRepository.getAll()[0];
    });

    test('should return notification when user owns it', async () => {
      const notification = await notificationService.getNotificationById(testNotification.id, testUser.id);

      expect(notification.id).toBe(testNotification.id);
      expect(notification.title).toBe('Test Notification');
    });

    test('should throw error when notification not found', async () => {
      await expect(notificationService.getNotificationById('nonexistent', testUser.id))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when user does not own notification', async () => {
      await expect(notificationService.getNotificationById(testNotification.id, 'other-user'))
        .rejects.toThrow(EntityValidationError);
      await expect(notificationService.getNotificationById(testNotification.id, 'other-user'))
        .rejects.toThrow('User does not have permission');
    });
  });

  describe('markAsRead', () => {
    let testNotification: Notification;

    beforeEach(async () => {
      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Test Notification',
        message: 'Test message'
      });
      testNotification = mockNotificationRepository.getAll()[0];
    });

    test('should mark notification as read', async () => {
      await notificationService.markAsRead(testNotification.id, testUser.id);

      const notification = await notificationService.getNotificationById(testNotification.id, testUser.id);
      expect(notification.status).toBe(NotificationStatus.READ);
      expect(notification.readAt).toBeDefined();
    });

    test('should throw error when user does not own notification', async () => {
      await expect(notificationService.markAsRead(testNotification.id, 'other-user'))
        .rejects.toThrow(EntityValidationError);
    });
  });

  describe('markAllAsRead', () => {
    beforeEach(async () => {
      // Create multiple notifications
      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Notification 1',
        message: 'Message 1'
      });

      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Notification 2',
        message: 'Message 2'
      });
    });

    test('should mark all notifications as read for user', async () => {
      const count = await notificationService.markAllAsRead(testUser.id);

      expect(count).toBe(2);

      const unreadCount = await notificationService.getUnreadCount(testUser.id);
      expect(unreadCount).toBe(0);
    });
  });

  describe('getUnreadCount', () => {
    test('should return correct unread count', async () => {
      // Create notifications
      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Notification 1',
        message: 'Message 1'
      });

      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Notification 2',
        message: 'Message 2'
      });

      const unreadCount = await notificationService.getUnreadCount(testUser.id);
      expect(unreadCount).toBe(2);

      // Mark one as read
      const notifications = await notificationService.getNotifications(testUser.id);
      await notificationService.markAsRead(notifications[0].id, testUser.id);

      const newUnreadCount = await notificationService.getUnreadCount(testUser.id);
      expect(newUnreadCount).toBe(1);
    });
  });

  describe('deleteNotification', () => {
    let testNotification: Notification;

    beforeEach(async () => {
      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Test Notification',
        message: 'Test message'
      });
      testNotification = mockNotificationRepository.getAll()[0];
    });

    test('should delete notification when user owns it', async () => {
      await notificationService.deleteNotification(testNotification.id, testUser.id);

      await expect(notificationService.getNotificationById(testNotification.id, testUser.id))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error when user does not own notification', async () => {
      await expect(notificationService.deleteNotification(testNotification.id, 'other-user'))
        .rejects.toThrow(EntityValidationError);
    });
  });

  // ===================================
  // Notification Preferences Tests
  // ===================================

  describe('getUserPreferences', () => {
    test('should return existing preferences', async () => {
      const existingPreferences: NotificationPreferences = {
        userId: testUser.id,
        emailEnabled: false,
        inAppEnabled: true,
        pushEnabled: true,
        smsEnabled: false,
        taskReminders: false,
        taskCompletions: true,
        systemAnnouncements: false,
        securityAlerts: true
      };

      mockPreferencesRepository.setPreferences(testUser.id, existingPreferences);

      const preferences = await notificationService.getUserPreferences(testUser.id);
      expect(preferences.emailEnabled).toBe(false);
      expect(preferences.pushEnabled).toBe(true);
    });

    test('should create default preferences when none exist', async () => {
      const preferences = await notificationService.getUserPreferences(testUser.id);

      expect(preferences.emailEnabled).toBe(true);
      expect(preferences.inAppEnabled).toBe(true);
      expect(preferences.taskReminders).toBe(true);
      expect(preferences.securityAlerts).toBe(true);
    });
  });

  describe('updateUserPreferences', () => {
    beforeEach(async () => {
      // Create initial preferences
      await notificationService.getUserPreferences(testUser.id);
    });

    test('should update user preferences', async () => {
      const updates = {
        emailEnabled: false,
        pushEnabled: true
      };

      const updatedPreferences = await notificationService.updateUserPreferences(testUser.id, updates);

      expect(updatedPreferences.emailEnabled).toBe(false);
      expect(updatedPreferences.pushEnabled).toBe(true);
      expect(updatedPreferences.inAppEnabled).toBe(true); // Should remain unchanged
    });
  });

  // ===================================
  // Utility Tests
  // ===================================

  describe('deleteOldNotifications', () => {
    test('should delete old notifications', async () => {
      // Create notifications
      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Old Notification',
        message: 'Old message'
      });

      await notificationService.sendNotification({
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'New Notification',
        message: 'New message'
      });

      // Wait a moment to ensure notifications are created
      await new Promise(resolve => setTimeout(resolve, 10));

      // Delete notifications older than future date (should delete all)
      const futureDate = new Date(Date.now() + 1000); // 1 second in the future
      const deletedCount = await notificationService.deleteOldNotifications(futureDate);

      expect(deletedCount).toBe(2);
      expect(mockNotificationRepository.getAll()).toHaveLength(0);
    });
  });

  // ===================================
  // Validation Tests
  // ===================================

  describe('Validation', () => {
    test('should throw error for missing user ID', async () => {
      const invalidRequest = {
        userId: '',
        type: NotificationType.GENERAL,
        title: 'Test',
        message: 'Test message'
      };

      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow(EntityValidationError);
      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow('User ID is required');
    });

    test('should throw error for too long title', async () => {
      const invalidRequest = {
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'a'.repeat(201), // Over 200 characters
        message: 'Test message'
      };

      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow(EntityValidationError);
      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow('title is too long');
    });

    test('should throw error for too long message', async () => {
      const invalidRequest = {
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Test',
        message: 'a'.repeat(1001) // Over 1000 characters
      };

      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow(EntityValidationError);
      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow('message is too long');
    });

    test('should throw error for empty message', async () => {
      const invalidRequest = {
        userId: testUser.id,
        type: NotificationType.GENERAL,
        title: 'Test',
        message: ''
      };

      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow(EntityValidationError);
      await expect(notificationService.sendNotification(invalidRequest))
        .rejects.toThrow('Notification message is required');
    });
  });
});
