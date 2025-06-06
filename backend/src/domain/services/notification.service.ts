/**
 * ===================================
 * Notification Domain Service
 * ===================================
 * Purpose: Notification management business logic and domain operations
 * Features:
 * - Notification sending and delivery
 * - Notification history management
 * - Notification preferences management
 * - Task-related notifications
 * - System notifications
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { EntityValidationError, EntityNotFoundError } from '../entities/base.entity';
import { EmailService, EmailPriority } from './email.service';

/**
 * Notification types
 */
export enum NotificationType {
  TASK_REMINDER = 'task_reminder',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue',
  TASK_ASSIGNED = 'task_assigned',
  TASK_DUE_SOON = 'task_due_soon',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ACCOUNT_UPDATE = 'account_update',
  SECURITY_ALERT = 'security_alert',
  GENERAL = 'general'
}

/**
 * Notification priority levels
 */
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Notification delivery channels
 */
export enum NotificationChannel {
  EMAIL = 'email',
  IN_APP = 'in_app',
  PUSH = 'push',
  SMS = 'sms'
}

/**
 * Notification status
 */
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read'
}

/**
 * Notification interface
 */
export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  status: NotificationStatus;
  metadata?: Record<string, any> | undefined;
  createdAt: Date;
  sentAt?: Date;
  readAt?: Date;
}

/**
 * Notification creation request interface
 */
export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  metadata?: Record<string, any> | undefined;
}

/**
 * Notification sending result interface
 */
export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  channelResults: ChannelResult[];
  error?: string;
  timestamp: Date;
}

/**
 * Channel delivery result interface
 */
export interface ChannelResult {
  channel: NotificationChannel;
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Notification preferences interface
 */
export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  taskReminders: boolean;
  taskCompletions: boolean;
  systemAnnouncements: boolean;
  securityAlerts: boolean;
  quietHoursStart?: string; // HH:MM format
  quietHoursEnd?: string; // HH:MM format
  timezone?: string;
}

/**
 * Notification repository interface (dependency injection)
 */
export interface INotificationRepository {
  create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification>;
  findById(id: string): Promise<Notification | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<Notification[]>;
  update(id: string, updates: Partial<Notification>): Promise<Notification>;
  delete(id: string): Promise<void>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(userId: string): Promise<number>;
  getUnreadCount(userId: string): Promise<number>;
  deleteOldNotifications(olderThan: Date): Promise<number>;
}

/**
 * Notification preferences repository interface (dependency injection)
 */
export interface INotificationPreferencesRepository {
  findByUserId(userId: string): Promise<NotificationPreferences | null>;
  create(preferences: NotificationPreferences): Promise<NotificationPreferences>;
  update(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences>;
  delete(userId: string): Promise<void>;
}

/**
 * Notification Domain Service Class
 * 
 * Handles notification-related business logic and domain operations.
 * Coordinates between entities and services while enforcing business rules.
 */
export class NotificationService {
  private notificationRepository: INotificationRepository;
  private preferencesRepository: INotificationPreferencesRepository;
  private emailService: EmailService;

  /**
   * Constructor for NotificationService
   * 
   * @param notificationRepository - Notification repository for data access
   * @param preferencesRepository - Notification preferences repository
   * @param emailService - Email service for email notifications
   */
  constructor(
    notificationRepository: INotificationRepository,
    preferencesRepository: INotificationPreferencesRepository,
    emailService: EmailService
  ) {
    this.notificationRepository = notificationRepository;
    this.preferencesRepository = preferencesRepository;
    this.emailService = emailService;
  }

  /**
   * Send a notification
   * 
   * @param request - Notification creation request
   * @returns {Promise<NotificationResult>} Notification sending result
   * @throws {EntityValidationError} When validation fails
   */
  public async sendNotification(request: CreateNotificationRequest): Promise<NotificationResult> {
    // Validate request
    this.validateNotificationRequest(request);

    // Get user preferences
    const preferences = await this.getUserPreferences(request.userId);

    // Determine delivery channels based on preferences
    const channels = this.determineDeliveryChannels(request, preferences);

    // Create notification record
    const notification = await this.notificationRepository.create({
      userId: request.userId,
      type: request.type,
      title: request.title,
      message: request.message,
      priority: request.priority || NotificationPriority.NORMAL,
      channels,
      status: NotificationStatus.PENDING,
      metadata: request.metadata
    });

    // Send through each channel
    const channelResults: ChannelResult[] = [];
    for (const channel of channels) {
      const result = await this.sendThroughChannel(notification, channel);
      channelResults.push(result);
    }

    // Update notification status
    const allSuccessful = channelResults.every(r => r.success);
    const newStatus = allSuccessful ? NotificationStatus.SENT : NotificationStatus.FAILED;
    
    await this.notificationRepository.update(notification.id, {
      status: newStatus,
      sentAt: new Date()
    });

    return {
      success: allSuccessful,
      notificationId: notification.id,
      channelResults,
      timestamp: new Date()
    };
  }

  /**
   * Send task reminder notification
   * 
   * @param user - User to notify
   * @param task - Task to remind about
   * @returns {Promise<NotificationResult>} Notification sending result
   */
  public async sendTaskReminder(user: User, task: Task): Promise<NotificationResult> {
    const priority = task.isOverdue() ? NotificationPriority.URGENT : NotificationPriority.NORMAL;
    const title = task.isOverdue() ? `Overdue Task: ${task.title}` : `Task Reminder: ${task.title}`;
    const message = task.isOverdue() 
      ? `Your task "${task.title}" is overdue. Please complete it as soon as possible.`
      : `Don't forget about your task "${task.title}". ${task.dueDate ? `Due: ${task.dueDate.toLocaleDateString()}` : ''}`;

    return await this.sendNotification({
      userId: user.id,
      type: NotificationType.TASK_REMINDER,
      title,
      message,
      priority,
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate?.toISOString(),
        isOverdue: task.isOverdue()
      }
    });
  }

  /**
   * Send task completed notification
   * 
   * @param user - User to notify
   * @param task - Completed task
   * @returns {Promise<NotificationResult>} Notification sending result
   */
  public async sendTaskCompleted(user: User, task: Task): Promise<NotificationResult> {
    return await this.sendNotification({
      userId: user.id,
      type: NotificationType.TASK_COMPLETED,
      title: `Task Completed: ${task.title}`,
      message: `Congratulations! You have completed the task "${task.title}".`,
      priority: NotificationPriority.LOW,
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        completedAt: task.completedAt?.toISOString()
      }
    });
  }

  /**
   * Send task overdue notification
   * 
   * @param user - User to notify
   * @param task - Overdue task
   * @returns {Promise<NotificationResult>} Notification sending result
   */
  public async sendTaskOverdue(user: User, task: Task): Promise<NotificationResult> {
    const overdueDays = task.dueDate ? Math.ceil((Date.now() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    return await this.sendNotification({
      userId: user.id,
      type: NotificationType.TASK_OVERDUE,
      title: `Task Overdue: ${task.title}`,
      message: `Your task "${task.title}" is ${overdueDays} day(s) overdue. Please complete it immediately.`,
      priority: NotificationPriority.URGENT,
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate?.toISOString(),
        overdueDays
      }
    });
  }

  /**
   * Send task due soon notification
   *
   * @param user - User to notify
   * @param task - Task due soon
   * @param hoursUntilDue - Hours until task is due
   * @returns {Promise<NotificationResult>} Notification sending result
   */
  public async sendTaskDueSoon(user: User, task: Task, hoursUntilDue: number): Promise<NotificationResult> {
    const timeText = hoursUntilDue < 24
      ? `${hoursUntilDue} hour(s)`
      : `${Math.ceil(hoursUntilDue / 24)} day(s)`;

    return await this.sendNotification({
      userId: user.id,
      type: NotificationType.TASK_DUE_SOON,
      title: `Task Due Soon: ${task.title}`,
      message: `Your task "${task.title}" is due in ${timeText}.`,
      priority: hoursUntilDue <= 24 ? NotificationPriority.HIGH : NotificationPriority.NORMAL,
      metadata: {
        taskId: task.id,
        taskTitle: task.title,
        dueDate: task.dueDate?.toISOString(),
        hoursUntilDue
      }
    });
  }

  /**
   * Send system announcement
   *
   * @param userIds - User IDs to notify
   * @param title - Announcement title
   * @param message - Announcement message
   * @param priority - Announcement priority
   * @returns {Promise<NotificationResult[]>} Array of notification results
   */
  public async sendSystemAnnouncement(
    userIds: string[],
    title: string,
    message: string,
    priority: NotificationPriority = NotificationPriority.NORMAL
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    for (const userId of userIds) {
      try {
        const result = await this.sendNotification({
          userId,
          type: NotificationType.SYSTEM_ANNOUNCEMENT,
          title,
          message,
          priority,
          metadata: {
            isSystemAnnouncement: true
          }
        });
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          channelResults: [],
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Send security alert
   *
   * @param user - User to notify
   * @param alertType - Type of security alert
   * @param details - Alert details
   * @returns {Promise<NotificationResult>} Notification sending result
   */
  public async sendSecurityAlert(user: User, alertType: string, details: string): Promise<NotificationResult> {
    return await this.sendNotification({
      userId: user.id,
      type: NotificationType.SECURITY_ALERT,
      title: `Security Alert: ${alertType}`,
      message: details,
      priority: NotificationPriority.URGENT,
      channels: [NotificationChannel.EMAIL, NotificationChannel.IN_APP], // Force important channels
      metadata: {
        alertType,
        isSecurityAlert: true
      }
    });
  }

  /**
   * Get notifications for user
   *
   * @param userId - User ID
   * @param limit - Maximum number of notifications to return
   * @param offset - Number of notifications to skip
   * @returns {Promise<Notification[]>} Array of notifications
   */
  public async getNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<Notification[]> {
    return await this.notificationRepository.findByUserId(userId, limit, offset);
  }

  /**
   * Get notification by ID
   *
   * @param notificationId - Notification ID
   * @param userId - User ID for ownership verification
   * @returns {Promise<Notification>} Notification
   * @throws {EntityNotFoundError} When notification not found
   * @throws {EntityValidationError} When user doesn't own the notification
   */
  public async getNotificationById(notificationId: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findById(notificationId);
    if (!notification) {
      throw new EntityNotFoundError('Notification', notificationId);
    }

    if (notification.userId !== userId) {
      throw new EntityValidationError(
        'User does not have permission to access this notification',
        'Notification',
        notificationId
      );
    }

    return notification;
  }

  /**
   * Mark notification as read
   *
   * @param notificationId - Notification ID
   * @param userId - User ID for ownership verification
   * @throws {EntityNotFoundError} When notification not found
   * @throws {EntityValidationError} When user doesn't own the notification
   */
  public async markAsRead(notificationId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getNotificationById(notificationId, userId);

    // Mark as read
    await this.notificationRepository.markAsRead(notificationId);
  }

  /**
   * Mark all notifications as read for user
   *
   * @param userId - User ID
   * @returns {Promise<number>} Number of notifications marked as read
   */
  public async markAllAsRead(userId: string): Promise<number> {
    return await this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Get unread notification count for user
   *
   * @param userId - User ID
   * @returns {Promise<number>} Number of unread notifications
   */
  public async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  /**
   * Delete notification
   *
   * @param notificationId - Notification ID
   * @param userId - User ID for ownership verification
   * @throws {EntityNotFoundError} When notification not found
   * @throws {EntityValidationError} When user doesn't own the notification
   */
  public async deleteNotification(notificationId: string, userId: string): Promise<void> {
    // Verify ownership
    await this.getNotificationById(notificationId, userId);

    // Delete notification
    await this.notificationRepository.delete(notificationId);
  }

  /**
   * Get user notification preferences
   *
   * @param userId - User ID
   * @returns {Promise<NotificationPreferences>} User notification preferences
   */
  public async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    let preferences = await this.preferencesRepository.findByUserId(userId);

    if (!preferences) {
      // Create default preferences
      preferences = await this.preferencesRepository.create({
        userId,
        emailEnabled: true,
        inAppEnabled: true,
        pushEnabled: false,
        smsEnabled: false,
        taskReminders: true,
        taskCompletions: true,
        systemAnnouncements: true,
        securityAlerts: true
      });
    }

    return preferences;
  }

  /**
   * Update user notification preferences
   *
   * @param userId - User ID
   * @param updates - Preference updates
   * @returns {Promise<NotificationPreferences>} Updated preferences
   */
  public async updateUserPreferences(userId: string, updates: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    return await this.preferencesRepository.update(userId, updates);
  }

  /**
   * Delete old notifications
   *
   * @param olderThan - Delete notifications older than this date
   * @returns {Promise<number>} Number of notifications deleted
   */
  public async deleteOldNotifications(olderThan: Date): Promise<number> {
    return await this.notificationRepository.deleteOldNotifications(olderThan);
  }

  /**
   * Validate notification request
   *
   * @param request - Notification request to validate
   * @throws {EntityValidationError} When validation fails
   */
  private validateNotificationRequest(request: CreateNotificationRequest): void {
    if (!request.userId || typeof request.userId !== 'string') {
      throw new EntityValidationError(
        'User ID is required',
        'Notification',
        'validation'
      );
    }

    if (!request.title || typeof request.title !== 'string' || request.title.trim().length === 0) {
      throw new EntityValidationError(
        'Notification title is required',
        'Notification',
        'validation'
      );
    }

    if (request.title.length > 200) {
      throw new EntityValidationError(
        'Notification title is too long (maximum 200 characters)',
        'Notification',
        'validation'
      );
    }

    if (!request.message || typeof request.message !== 'string' || request.message.trim().length === 0) {
      throw new EntityValidationError(
        'Notification message is required',
        'Notification',
        'validation'
      );
    }

    if (request.message.length > 1000) {
      throw new EntityValidationError(
        'Notification message is too long (maximum 1000 characters)',
        'Notification',
        'validation'
      );
    }
  }

  /**
   * Determine delivery channels based on request and user preferences
   *
   * @param request - Notification request
   * @param preferences - User preferences
   * @returns {NotificationChannel[]} Array of delivery channels
   */
  private determineDeliveryChannels(request: CreateNotificationRequest, preferences: NotificationPreferences): NotificationChannel[] {
    // If channels are explicitly specified in request, use those
    if (request.channels && request.channels.length > 0) {
      return request.channels;
    }

    const channels: NotificationChannel[] = [];

    // Check user preferences for each channel
    if (preferences.emailEnabled && this.shouldSendToChannel(request.type, preferences, 'email')) {
      channels.push(NotificationChannel.EMAIL);
    }

    if (preferences.inAppEnabled && this.shouldSendToChannel(request.type, preferences, 'inApp')) {
      channels.push(NotificationChannel.IN_APP);
    }

    if (preferences.pushEnabled && this.shouldSendToChannel(request.type, preferences, 'push')) {
      channels.push(NotificationChannel.PUSH);
    }

    if (preferences.smsEnabled && this.shouldSendToChannel(request.type, preferences, 'sms')) {
      channels.push(NotificationChannel.SMS);
    }

    // Ensure at least in-app notification for important types
    if (channels.length === 0 || request.priority === NotificationPriority.URGENT) {
      if (!channels.includes(NotificationChannel.IN_APP)) {
        channels.push(NotificationChannel.IN_APP);
      }
    }

    return channels;
  }

  /**
   * Check if notification should be sent to specific channel based on type and preferences
   *
   * @param type - Notification type
   * @param preferences - User preferences
   * @param channel - Channel type
   * @returns {boolean} True if should send to channel
   */
  private shouldSendToChannel(type: NotificationType, preferences: NotificationPreferences, _channel: string): boolean {
    switch (type) {
      case NotificationType.TASK_REMINDER:
      case NotificationType.TASK_OVERDUE:
      case NotificationType.TASK_DUE_SOON:
        return preferences.taskReminders;

      case NotificationType.TASK_COMPLETED:
        return preferences.taskCompletions;

      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return preferences.systemAnnouncements;

      case NotificationType.SECURITY_ALERT:
        return preferences.securityAlerts;

      default:
        return true; // Send general notifications by default
    }
  }

  /**
   * Send notification through specific channel
   *
   * @param notification - Notification to send
   * @param channel - Delivery channel
   * @returns {Promise<ChannelResult>} Channel delivery result
   */
  private async sendThroughChannel(notification: Notification, channel: NotificationChannel): Promise<ChannelResult> {
    try {
      switch (channel) {
        case NotificationChannel.EMAIL:
          return await this.sendEmailNotification(notification);

        case NotificationChannel.IN_APP:
          return await this.sendInAppNotification(notification);

        case NotificationChannel.PUSH:
          return await this.sendPushNotification(notification);

        case NotificationChannel.SMS:
          return await this.sendSMSNotification(notification);

        default:
          return {
            channel,
            success: false,
            error: `Unsupported channel: ${channel}`,
            timestamp: new Date()
          };
      }
    } catch (error) {
      return {
        channel,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date()
      };
    }
  }

  /**
   * Send email notification
   *
   * @param notification - Notification to send
   * @returns {Promise<ChannelResult>} Email delivery result
   */
  private async sendEmailNotification(_notification: Notification): Promise<ChannelResult> {
    // This would integrate with EmailService
    // For now, return success
    return {
      channel: NotificationChannel.EMAIL,
      success: true,
      messageId: `email-${Date.now()}`,
      timestamp: new Date()
    };
  }

  /**
   * Send in-app notification
   *
   * @param notification - Notification to send
   * @returns {Promise<ChannelResult>} In-app delivery result
   */
  private async sendInAppNotification(notification: Notification): Promise<ChannelResult> {
    // In-app notifications are stored in database, so this is always successful
    return {
      channel: NotificationChannel.IN_APP,
      success: true,
      messageId: notification.id,
      timestamp: new Date()
    };
  }

  /**
   * Send push notification
   *
   * @param notification - Notification to send
   * @returns {Promise<ChannelResult>} Push delivery result
   */
  private async sendPushNotification(_notification: Notification): Promise<ChannelResult> {
    // This would integrate with push notification service
    // For now, return success
    return {
      channel: NotificationChannel.PUSH,
      success: true,
      messageId: `push-${Date.now()}`,
      timestamp: new Date()
    };
  }

  /**
   * Send SMS notification
   *
   * @param notification - Notification to send
   * @returns {Promise<ChannelResult>} SMS delivery result
   */
  private async sendSMSNotification(_notification: Notification): Promise<ChannelResult> {
    // This would integrate with SMS service
    // For now, return success
    return {
      channel: NotificationChannel.SMS,
      success: true,
      messageId: `sms-${Date.now()}`,
      timestamp: new Date()
    };
  }
}
