/**
 * ===================================
 * Email Domain Service
 * ===================================
 * Purpose: Email sending business logic and domain operations
 * Features:
 * - Email sending operations
 * - Template-based email generation
 * - User notification emails
 * - Business rule enforcement
 * - Email validation and formatting
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { User } from '../entities/user.entity';
import { Task } from '../entities/task.entity';
import { EntityValidationError, EntityNotFoundError } from '../entities/base.entity';

/**
 * Email template types
 */
export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  TASK_REMINDER = 'task_reminder',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue',
  ACCOUNT_VERIFICATION = 'account_verification',
  NOTIFICATION = 'notification'
}

/**
 * Email priority levels
 */
export enum EmailPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

/**
 * Email sending request interface
 */
export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  priority?: EmailPriority | undefined;
  attachments?: EmailAttachment[] | undefined;
}

/**
 * Email attachment interface
 */
export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
  contentType: string;
  encoding?: string;
}

/**
 * Template email request interface
 */
export interface TemplateEmailRequest {
  to: string;
  template: EmailTemplate;
  variables: Record<string, any>;
  priority?: EmailPriority | undefined;
  attachments?: EmailAttachment[] | undefined;
}

/**
 * Email sending result interface
 */
export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

/**
 * Email configuration interface
 */
export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPass: string;
  fromEmail: string;
  fromName: string;
}

/**
 * Email provider interface (dependency injection)
 */
export interface IEmailProvider {
  sendEmail(request: SendEmailRequest): Promise<EmailResult>;
  validateConfiguration(): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

/**
 * Template engine interface (dependency injection)
 */
export interface ITemplateEngine {
  renderTemplate(template: EmailTemplate, variables: Record<string, any>): Promise<{ subject: string; body: string }>;
  templateExists(template: EmailTemplate): Promise<boolean>;
  getTemplateVariables(template: EmailTemplate): Promise<string[]>;
}

/**
 * Email Domain Service Class
 * 
 * Handles email-related business logic and domain operations.
 * Coordinates between entities and providers while enforcing business rules.
 */
export class EmailService {
  private emailProvider: IEmailProvider;
  private templateEngine: ITemplateEngine;
  private config: EmailConfig;

  /**
   * Constructor for EmailService
   * 
   * @param emailProvider - Email provider for sending emails
   * @param templateEngine - Template engine for rendering email templates
   * @param config - Email configuration
   */
  constructor(
    emailProvider: IEmailProvider,
    templateEngine: ITemplateEngine,
    config: EmailConfig
  ) {
    this.emailProvider = emailProvider;
    this.templateEngine = templateEngine;
    this.config = config;
  }

  /**
   * Send a simple email
   * 
   * @param request - Email sending request
   * @returns {Promise<EmailResult>} Email sending result
   * @throws {EntityValidationError} When email validation fails
   */
  public async sendEmail(request: SendEmailRequest): Promise<EmailResult> {
    // Validate email address
    this.validateEmailAddress(request.to);

    // Validate email content
    this.validateEmailContent(request.subject, request.body);

    // Send email through provider
    const result = await this.emailProvider.sendEmail({
      ...request,
      priority: request.priority || EmailPriority.NORMAL
    });

    return result;
  }

  /**
   * Send template-based email
   * 
   * @param request - Template email request
   * @returns {Promise<EmailResult>} Email sending result
   * @throws {EntityValidationError} When validation fails
   * @throws {EntityNotFoundError} When template not found
   */
  public async sendTemplateEmail(request: TemplateEmailRequest): Promise<EmailResult> {
    // Validate email address
    this.validateEmailAddress(request.to);

    // Check if template exists
    const templateExists = await this.templateEngine.templateExists(request.template);
    if (!templateExists) {
      throw new EntityNotFoundError('EmailTemplate', request.template);
    }

    // Render template
    const { subject, body } = await this.templateEngine.renderTemplate(
      request.template,
      request.variables
    );

    // Send email
    return await this.sendEmail({
      to: request.to,
      subject,
      body,
      isHtml: true,
      priority: request.priority,
      attachments: request.attachments
    });
  }

  /**
   * Send welcome email to new user
   * 
   * @param user - User to send welcome email to
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendWelcomeEmail(user: User): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.WELCOME,
      variables: {
        username: user.username,
        email: user.email,
        loginUrl: `${this.getBaseUrl()}/login`,
        supportEmail: this.config.fromEmail
      },
      priority: EmailPriority.HIGH
    });
  }

  /**
   * Send password reset email
   * 
   * @param user - User requesting password reset
   * @param resetToken - Password reset token
   * @param resetUrl - Password reset URL
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendPasswordResetEmail(user: User, resetToken: string, resetUrl: string): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.PASSWORD_RESET,
      variables: {
        username: user.username,
        resetToken,
        resetUrl,
        expirationTime: '24 hours',
        supportEmail: this.config.fromEmail
      },
      priority: EmailPriority.URGENT
    });
  }

  /**
   * Send account verification email
   * 
   * @param user - User to verify
   * @param verificationToken - Verification token
   * @param verificationUrl - Verification URL
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendAccountVerificationEmail(user: User, verificationToken: string, verificationUrl: string): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.ACCOUNT_VERIFICATION,
      variables: {
        username: user.username,
        verificationToken,
        verificationUrl,
        expirationTime: '7 days',
        supportEmail: this.config.fromEmail
      },
      priority: EmailPriority.HIGH
    });
  }

  /**
   * Send task reminder email
   * 
   * @param user - User to send reminder to
   * @param task - Task to remind about
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendTaskReminderEmail(user: User, task: Task): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.TASK_REMINDER,
      variables: {
        username: user.username,
        taskTitle: task.title,
        taskDescription: task.description || 'No description',
        dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date',
        priority: task.priority,
        taskUrl: `${this.getBaseUrl()}/tasks/${task.id}`
      },
      priority: task.isOverdue() ? EmailPriority.URGENT : EmailPriority.NORMAL
    });
  }

  /**
   * Send task completed notification email
   * 
   * @param user - User to notify
   * @param task - Completed task
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendTaskCompletedEmail(user: User, task: Task): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.TASK_COMPLETED,
      variables: {
        username: user.username,
        taskTitle: task.title,
        completedAt: task.completedAt ? task.completedAt.toLocaleDateString() : new Date().toLocaleDateString(),
        taskUrl: `${this.getBaseUrl()}/tasks/${task.id}`
      },
      priority: EmailPriority.LOW
    });
  }

  /**
   * Send task overdue notification email
   * 
   * @param user - User to notify
   * @param task - Overdue task
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendTaskOverdueEmail(user: User, task: Task): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.TASK_OVERDUE,
      variables: {
        username: user.username,
        taskTitle: task.title,
        taskDescription: task.description || 'No description',
        dueDate: task.dueDate ? task.dueDate.toLocaleDateString() : 'No due date',
        overdueDays: task.dueDate ? Math.ceil((Date.now() - task.dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0,
        taskUrl: `${this.getBaseUrl()}/tasks/${task.id}`
      },
      priority: EmailPriority.URGENT
    });
  }

  /**
   * Send general notification email
   *
   * @param user - User to notify
   * @param subject - Email subject
   * @param message - Notification message
   * @param priority - Email priority
   * @returns {Promise<EmailResult>} Email sending result
   */
  public async sendNotificationEmail(
    user: User,
    subject: string,
    message: string,
    priority: EmailPriority = EmailPriority.NORMAL
  ): Promise<EmailResult> {
    return await this.sendTemplateEmail({
      to: user.email,
      template: EmailTemplate.NOTIFICATION,
      variables: {
        username: user.username,
        subject,
        message,
        timestamp: new Date().toLocaleString(),
        supportEmail: this.config.fromEmail
      },
      priority
    });
  }

  /**
   * Send bulk emails to multiple users
   *
   * @param users - Users to send emails to
   * @param subject - Email subject
   * @param message - Email message
   * @param priority - Email priority
   * @returns {Promise<EmailResult[]>} Array of email sending results
   */
  public async sendBulkEmails(
    users: User[],
    subject: string,
    message: string,
    priority: EmailPriority = EmailPriority.NORMAL
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const user of users) {
      try {
        const result = await this.sendNotificationEmail(user, subject, message, priority);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    return results;
  }

  /**
   * Test email configuration
   *
   * @returns {Promise<boolean>} True if configuration is valid
   */
  public async testEmailConfiguration(): Promise<boolean> {
    try {
      return await this.emailProvider.testConnection();
    } catch (error) {
      return false;
    }
  }

  /**
   * Validate email configuration
   *
   * @returns {Promise<boolean>} True if configuration is valid
   */
  public async validateConfiguration(): Promise<boolean> {
    try {
      return await this.emailProvider.validateConfiguration();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get available email templates
   *
   * @returns {Promise<EmailTemplate[]>} Array of available templates
   */
  public async getAvailableTemplates(): Promise<EmailTemplate[]> {
    const templates: EmailTemplate[] = [];

    for (const template of Object.values(EmailTemplate)) {
      const exists = await this.templateEngine.templateExists(template);
      if (exists) {
        templates.push(template);
      }
    }

    return templates;
  }

  /**
   * Get template variables for a specific template
   *
   * @param template - Email template
   * @returns {Promise<string[]>} Array of template variables
   * @throws {EntityNotFoundError} When template not found
   */
  public async getTemplateVariables(template: EmailTemplate): Promise<string[]> {
    const templateExists = await this.templateEngine.templateExists(template);
    if (!templateExists) {
      throw new EntityNotFoundError('EmailTemplate', template);
    }

    return await this.templateEngine.getTemplateVariables(template);
  }

  /**
   * Validate email address format
   *
   * @param email - Email address to validate
   * @throws {EntityValidationError} When email format is invalid
   */
  private validateEmailAddress(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new EntityValidationError(
        'Email address is required',
        'Email',
        'validation'
      );
    }

    // Use comprehensive email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (email.length > 254) {
      throw new EntityValidationError(
        'Email address is too long (maximum 254 characters)',
        'Email',
        'validation'
      );
    }

    if (!emailRegex.test(email)) {
      throw new EntityValidationError(
        'Invalid email address format',
        'Email',
        'validation'
      );
    }

    // Check for consecutive dots
    if (email.includes('..')) {
      throw new EntityValidationError(
        'Email address cannot contain consecutive dots',
        'Email',
        'validation'
      );
    }

    // Check if local part starts or ends with dot
    const localPart = email.split('@')[0];
    if (localPart.startsWith('.') || localPart.endsWith('.')) {
      throw new EntityValidationError(
        'Email local part cannot start or end with dot',
        'Email',
        'validation'
      );
    }
  }

  /**
   * Validate email content
   *
   * @param subject - Email subject
   * @param body - Email body
   * @throws {EntityValidationError} When content validation fails
   */
  private validateEmailContent(subject: string, body: string): void {
    if (!subject || typeof subject !== 'string' || subject.trim().length === 0) {
      throw new EntityValidationError(
        'Email subject is required',
        'Email',
        'validation'
      );
    }

    if (subject.length > 998) {
      throw new EntityValidationError(
        'Email subject is too long (maximum 998 characters)',
        'Email',
        'validation'
      );
    }

    if (!body || typeof body !== 'string' || body.trim().length === 0) {
      throw new EntityValidationError(
        'Email body is required',
        'Email',
        'validation'
      );
    }

    if (body.length > 1000000) { // 1MB limit
      throw new EntityValidationError(
        'Email body is too long (maximum 1MB)',
        'Email',
        'validation'
      );
    }
  }

  /**
   * Get base URL for the application
   *
   * @returns {string} Base URL
   */
  private getBaseUrl(): string {
    // In a real implementation, this would come from configuration
    return process.env.APP_BASE_URL || 'http://localhost:3000';
  }

  /**
   * Format email address with name
   *
   * @param email - Email address
   * @param name - Display name
   * @returns {string} Formatted email address
   */
  private formatEmailAddress(email: string, name?: string): string {
    if (name && name.trim().length > 0) {
      return `"${name}" <${email}>`;
    }
    return email;
  }

  /**
   * Get sender email address
   *
   * @returns {string} Formatted sender email address
   */
  public getSenderAddress(): string {
    return this.formatEmailAddress(this.config.fromEmail, this.config.fromName);
  }

  /**
   * Check if email sending is enabled
   *
   * @returns {boolean} True if email sending is enabled
   */
  public isEmailEnabled(): boolean {
    return !!(this.config.smtpHost && this.config.smtpUser && this.config.fromEmail);
  }
}
