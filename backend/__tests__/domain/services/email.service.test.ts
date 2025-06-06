/**
 * ===================================
 * Email Service Test Suite
 * ===================================
 * Purpose: Comprehensive tests for EmailService domain service
 * Features:
 * - Email sending operations testing
 * - Template-based email testing
 * - Business logic validation
 * - Error handling and edge cases
 * - Mock provider and dependencies
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import {
  EmailService,
  IEmailProvider,
  ITemplateEngine,
  SendEmailRequest,
  TemplateEmailRequest,
  EmailTemplate,
  EmailPriority,
  EmailResult,
  EmailConfig
} from '../../../src/domain/services/email.service';
import { User, UserCreationData, UserRole } from '../../../src/domain/entities/user.entity';
import { Task, TaskCreationData, TaskPriority, TaskStatus } from '../../../src/domain/entities/task.entity';
import { EntityValidationError, EntityNotFoundError } from '../../../src/domain/entities/base.entity';

// Mock implementations
class MockEmailProvider implements IEmailProvider {
  private shouldFail: boolean = false;
  private sentEmails: SendEmailRequest[] = [];

  async sendEmail(request: SendEmailRequest): Promise<EmailResult> {
    if (this.shouldFail) {
      return {
        success: false,
        error: 'Mock email sending failed',
        timestamp: new Date()
      };
    }

    this.sentEmails.push(request);
    return {
      success: true,
      messageId: `mock-message-${Date.now()}`,
      timestamp: new Date()
    };
  }

  async validateConfiguration(): Promise<boolean> {
    return !this.shouldFail;
  }

  async testConnection(): Promise<boolean> {
    return !this.shouldFail;
  }

  // Helper methods for testing
  setShouldFail(shouldFail: boolean): void {
    this.shouldFail = shouldFail;
  }

  getSentEmails(): SendEmailRequest[] {
    return [...this.sentEmails];
  }

  clearSentEmails(): void {
    this.sentEmails = [];
  }
}

class MockTemplateEngine implements ITemplateEngine {
  private templates: Map<EmailTemplate, { subject: string; body: string; variables: string[] }> = new Map();

  constructor() {
    // Initialize with default templates
    this.templates.set(EmailTemplate.WELCOME, {
      subject: 'Welcome to Task Management System',
      body: '<h1>Welcome {{username}}!</h1><p>Your email: {{email}}</p>',
      variables: ['username', 'email', 'loginUrl', 'supportEmail']
    });

    this.templates.set(EmailTemplate.PASSWORD_RESET, {
      subject: 'Password Reset Request',
      body: '<h1>Password Reset</h1><p>Hello {{username}}, reset token: {{resetToken}}</p>',
      variables: ['username', 'resetToken', 'resetUrl', 'expirationTime', 'supportEmail']
    });

    this.templates.set(EmailTemplate.TASK_REMINDER, {
      subject: 'Task Reminder: {{taskTitle}}',
      body: '<h1>Task Reminder</h1><p>{{username}}, don\'t forget: {{taskTitle}}</p>',
      variables: ['username', 'taskTitle', 'taskDescription', 'dueDate', 'priority', 'taskUrl']
    });

    this.templates.set(EmailTemplate.TASK_COMPLETED, {
      subject: 'Task Completed: {{taskTitle}}',
      body: '<h1>Task Completed</h1><p>{{username}}, you completed: {{taskTitle}}</p>',
      variables: ['username', 'taskTitle', 'completedAt', 'taskUrl']
    });

    this.templates.set(EmailTemplate.TASK_OVERDUE, {
      subject: 'Task Overdue: {{taskTitle}}',
      body: '<h1>Task Overdue</h1><p>{{username}}, task is overdue: {{taskTitle}}</p>',
      variables: ['username', 'taskTitle', 'taskDescription', 'dueDate', 'overdueDays', 'taskUrl']
    });

    this.templates.set(EmailTemplate.ACCOUNT_VERIFICATION, {
      subject: 'Account Verification Required',
      body: '<h1>Verify Account</h1><p>{{username}}, verify token: {{verificationToken}}</p>',
      variables: ['username', 'verificationToken', 'verificationUrl', 'expirationTime', 'supportEmail']
    });

    this.templates.set(EmailTemplate.NOTIFICATION, {
      subject: '{{subject}}',
      body: '<h1>{{subject}}</h1><p>{{username}}, {{message}}</p>',
      variables: ['username', 'subject', 'message', 'timestamp', 'supportEmail']
    });
  }

  async renderTemplate(template: EmailTemplate, variables: Record<string, any>): Promise<{ subject: string; body: string }> {
    const templateData = this.templates.get(template);
    if (!templateData) {
      throw new Error(`Template ${template} not found`);
    }

    let subject = templateData.subject;
    let body = templateData.body;

    // Simple template variable replacement
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    }

    return { subject, body };
  }

  async templateExists(template: EmailTemplate): Promise<boolean> {
    return this.templates.has(template);
  }

  async getTemplateVariables(template: EmailTemplate): Promise<string[]> {
    const templateData = this.templates.get(template);
    return templateData ? templateData.variables : [];
  }

  // Helper methods for testing
  addTemplate(template: EmailTemplate, subject: string, body: string, variables: string[]): void {
    this.templates.set(template, { subject, body, variables });
  }

  removeTemplate(template: EmailTemplate): void {
    this.templates.delete(template);
  }
}

describe('EmailService', () => {
  let emailService: EmailService;
  let mockEmailProvider: MockEmailProvider;
  let mockTemplateEngine: MockTemplateEngine;
  let emailConfig: EmailConfig;

  const testUser = new User({
    username: 'testuser',
    email: 'test@example.com',
    passwordHash: 'hashedpassword',
    role: UserRole.USER
  });

  const testTask = new Task({
    userId: 'user-123',
    title: 'Test Task',
    description: 'Test task description',
    priority: TaskPriority.HIGH,
    status: TaskStatus.PENDING,
    dueDate: new Date(Date.now() + 86400000) // Tomorrow
  });

  beforeEach(() => {
    mockEmailProvider = new MockEmailProvider();
    mockTemplateEngine = new MockTemplateEngine();
    emailConfig = {
      smtpHost: 'smtp.test.com',
      smtpPort: 587,
      smtpSecure: false,
      smtpUser: 'test@test.com',
      smtpPass: 'password',
      fromEmail: 'noreply@test.com',
      fromName: 'Test System'
    };

    emailService = new EmailService(mockEmailProvider, mockTemplateEngine, emailConfig);
  });

  // ===================================
  // Basic Email Sending Tests
  // ===================================

  describe('sendEmail', () => {
    const validEmailRequest: SendEmailRequest = {
      to: 'recipient@example.com',
      subject: 'Test Subject',
      body: 'Test email body',
      isHtml: false,
      priority: EmailPriority.NORMAL
    };

    test('should send email successfully', async () => {
      const result = await emailService.sendEmail(validEmailRequest);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.timestamp).toBeDefined();

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe('recipient@example.com');
      expect(sentEmails[0].subject).toBe('Test Subject');
    });

    test('should set default priority when not specified', async () => {
      const request = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        body: 'Test email body'
      };

      await emailService.sendEmail(request);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails[0].priority).toBe(EmailPriority.NORMAL);
    });

    test('should throw error for invalid email address', async () => {
      const invalidRequest = {
        ...validEmailRequest,
        to: 'invalid-email'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('Invalid email address format');
    });

    test('should throw error for empty subject', async () => {
      const invalidRequest = {
        ...validEmailRequest,
        subject: ''
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('Email subject is required');
    });

    test('should throw error for empty body', async () => {
      const invalidRequest = {
        ...validEmailRequest,
        body: ''
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('Email body is required');
    });
  });

  // ===================================
  // Template Email Tests
  // ===================================

  describe('sendTemplateEmail', () => {
    const validTemplateRequest: TemplateEmailRequest = {
      to: 'recipient@example.com',
      template: EmailTemplate.WELCOME,
      variables: {
        username: 'testuser',
        email: 'test@example.com',
        loginUrl: 'http://localhost:3000/login',
        supportEmail: 'support@test.com'
      },
      priority: EmailPriority.HIGH
    };

    test('should send template email successfully', async () => {
      const result = await emailService.sendTemplateEmail(validTemplateRequest);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe('recipient@example.com');
      expect(sentEmails[0].subject).toBe('Welcome to Task Management System');
      expect(sentEmails[0].body).toContain('Welcome testuser!');
      expect(sentEmails[0].isHtml).toBe(true);
    });

    test('should throw error for non-existent template', async () => {
      mockTemplateEngine.removeTemplate(EmailTemplate.WELCOME);

      await expect(emailService.sendTemplateEmail(validTemplateRequest))
        .rejects.toThrow(EntityNotFoundError);
    });

    test('should throw error for invalid email in template request', async () => {
      const invalidRequest = {
        ...validTemplateRequest,
        to: 'invalid-email'
      };

      await expect(emailService.sendTemplateEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
    });
  });

  // ===================================
  // User Notification Email Tests
  // ===================================

  describe('sendWelcomeEmail', () => {
    test('should send welcome email successfully', async () => {
      const result = await emailService.sendWelcomeEmail(testUser);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Welcome to Task Management System');
      expect(sentEmails[0].body).toContain('Welcome testuser!');
      expect(sentEmails[0].priority).toBe(EmailPriority.HIGH);
    });
  });

  describe('sendPasswordResetEmail', () => {
    test('should send password reset email successfully', async () => {
      const resetToken = 'reset-token-123';
      const resetUrl = 'http://localhost:3000/reset-password?token=reset-token-123';

      const result = await emailService.sendPasswordResetEmail(testUser, resetToken, resetUrl);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Password Reset Request');
      expect(sentEmails[0].body).toContain('reset token: reset-token-123');
      expect(sentEmails[0].priority).toBe(EmailPriority.URGENT);
    });
  });

  describe('sendAccountVerificationEmail', () => {
    test('should send account verification email successfully', async () => {
      const verificationToken = 'verify-token-123';
      const verificationUrl = 'http://localhost:3000/verify?token=verify-token-123';

      const result = await emailService.sendAccountVerificationEmail(testUser, verificationToken, verificationUrl);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Account Verification Required');
      expect(sentEmails[0].body).toContain('verify token: verify-token-123');
      expect(sentEmails[0].priority).toBe(EmailPriority.HIGH);
    });
  });

  // ===================================
  // Task-related Email Tests
  // ===================================

  describe('sendTaskReminderEmail', () => {
    test('should send task reminder email successfully', async () => {
      const result = await emailService.sendTaskReminderEmail(testUser, testTask);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Task Reminder: Test Task');
      expect(sentEmails[0].body).toContain('don\'t forget: Test Task');
      expect(sentEmails[0].priority).toBe(EmailPriority.NORMAL);
    });

    test('should send urgent priority for overdue task', async () => {
      // Create overdue task
      const overdueTask = new Task({
        userId: 'user-123',
        title: 'Overdue Task',
        description: 'This task is overdue',
        priority: TaskPriority.HIGH,
        status: TaskStatus.PENDING,
        dueDate: new Date(Date.now() - 86400000) // Yesterday
      }, {
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        updatedAt: new Date(Date.now() - 172800000)
      });

      const result = await emailService.sendTaskReminderEmail(testUser, overdueTask);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails[0].priority).toBe(EmailPriority.URGENT);
    });
  });

  describe('sendTaskCompletedEmail', () => {
    test('should send task completed email successfully', async () => {
      const result = await emailService.sendTaskCompletedEmail(testUser, testTask);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Task Completed: Test Task');
      expect(sentEmails[0].body).toContain('you completed: Test Task');
      expect(sentEmails[0].priority).toBe(EmailPriority.LOW);
    });
  });

  describe('sendTaskOverdueEmail', () => {
    test('should send task overdue email successfully', async () => {
      const result = await emailService.sendTaskOverdueEmail(testUser, testTask);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Task Overdue: Test Task');
      expect(sentEmails[0].body).toContain('task is overdue: Test Task');
      expect(sentEmails[0].priority).toBe(EmailPriority.URGENT);
    });
  });

  // ===================================
  // General Notification Tests
  // ===================================

  describe('sendNotificationEmail', () => {
    test('should send notification email successfully', async () => {
      const subject = 'Important Notification';
      const message = 'This is an important notification message.';

      const result = await emailService.sendNotificationEmail(testUser, subject, message, EmailPriority.HIGH);

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(1);
      expect(sentEmails[0].to).toBe(testUser.email);
      expect(sentEmails[0].subject).toBe('Important Notification');
      expect(sentEmails[0].body).toContain('This is an important notification message.');
      expect(sentEmails[0].priority).toBe(EmailPriority.HIGH);
    });

    test('should use default priority when not specified', async () => {
      const result = await emailService.sendNotificationEmail(testUser, 'Test', 'Test message');

      expect(result.success).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails[0].priority).toBe(EmailPriority.NORMAL);
    });
  });

  describe('sendBulkEmails', () => {
    test('should send bulk emails successfully', async () => {
      const users = [
        testUser,
        new User({
          username: 'user2',
          email: 'user2@example.com',
          passwordHash: 'hashedpassword',
          role: UserRole.USER
        }),
        new User({
          username: 'user3',
          email: 'user3@example.com',
          passwordHash: 'hashedpassword',
          role: UserRole.USER
        })
      ];

      const results = await emailService.sendBulkEmails(users, 'Bulk Message', 'This is a bulk message');

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);

      const sentEmails = mockEmailProvider.getSentEmails();
      expect(sentEmails).toHaveLength(3);
      expect(sentEmails.map(e => e.to)).toContain('test@example.com');
      expect(sentEmails.map(e => e.to)).toContain('user2@example.com');
      expect(sentEmails.map(e => e.to)).toContain('user3@example.com');
    });

    test('should handle individual email failures in bulk sending', async () => {
      // Create a user with valid email first, then manually set invalid email for testing
      const invalidUser = new User({
        username: 'invalid',
        email: 'valid@example.com', // Valid email for creation
        passwordHash: 'hashedpassword',
        role: UserRole.USER
      });

      // Manually set invalid email for testing email validation
      (invalidUser as any)._email = 'invalid-email';

      const users = [testUser, invalidUser];

      const results = await emailService.sendBulkEmails(users, 'Bulk Message', 'This is a bulk message');

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBeDefined();
    });
  });

  // ===================================
  // Configuration and Utility Tests
  // ===================================

  describe('testEmailConfiguration', () => {
    test('should return true for valid configuration', async () => {
      const result = await emailService.testEmailConfiguration();

      expect(result).toBe(true);
    });

    test('should return false when provider fails', async () => {
      mockEmailProvider.setShouldFail(true);

      const result = await emailService.testEmailConfiguration();

      expect(result).toBe(false);
    });
  });

  describe('validateConfiguration', () => {
    test('should return true for valid configuration', async () => {
      const result = await emailService.validateConfiguration();

      expect(result).toBe(true);
    });

    test('should return false when provider validation fails', async () => {
      mockEmailProvider.setShouldFail(true);

      const result = await emailService.validateConfiguration();

      expect(result).toBe(false);
    });
  });

  describe('getAvailableTemplates', () => {
    test('should return all available templates', async () => {
      const templates = await emailService.getAvailableTemplates();

      expect(templates).toContain(EmailTemplate.WELCOME);
      expect(templates).toContain(EmailTemplate.PASSWORD_RESET);
      expect(templates).toContain(EmailTemplate.TASK_REMINDER);
      expect(templates).toContain(EmailTemplate.TASK_COMPLETED);
      expect(templates).toContain(EmailTemplate.TASK_OVERDUE);
      expect(templates).toContain(EmailTemplate.ACCOUNT_VERIFICATION);
      expect(templates).toContain(EmailTemplate.NOTIFICATION);
    });

    test('should not include non-existent templates', async () => {
      mockTemplateEngine.removeTemplate(EmailTemplate.WELCOME);

      const templates = await emailService.getAvailableTemplates();

      expect(templates).not.toContain(EmailTemplate.WELCOME);
    });
  });

  describe('getTemplateVariables', () => {
    test('should return template variables for existing template', async () => {
      const variables = await emailService.getTemplateVariables(EmailTemplate.WELCOME);

      expect(variables).toContain('username');
      expect(variables).toContain('email');
      expect(variables).toContain('loginUrl');
      expect(variables).toContain('supportEmail');
    });

    test('should throw error for non-existent template', async () => {
      mockTemplateEngine.removeTemplate(EmailTemplate.WELCOME);

      await expect(emailService.getTemplateVariables(EmailTemplate.WELCOME))
        .rejects.toThrow(EntityNotFoundError);
    });
  });

  describe('getSenderAddress', () => {
    test('should return formatted sender address', () => {
      const senderAddress = emailService.getSenderAddress();

      expect(senderAddress).toBe('"Test System" <noreply@test.com>');
    });
  });

  describe('isEmailEnabled', () => {
    test('should return true when all required config is present', () => {
      const result = emailService.isEmailEnabled();

      expect(result).toBe(true);
    });

    test('should return false when SMTP host is missing', () => {
      const incompleteConfig = { ...emailConfig, smtpHost: '' };
      const incompleteEmailService = new EmailService(mockEmailProvider, mockTemplateEngine, incompleteConfig);

      const result = incompleteEmailService.isEmailEnabled();

      expect(result).toBe(false);
    });

    test('should return false when SMTP user is missing', () => {
      const incompleteConfig = { ...emailConfig, smtpUser: '' };
      const incompleteEmailService = new EmailService(mockEmailProvider, mockTemplateEngine, incompleteConfig);

      const result = incompleteEmailService.isEmailEnabled();

      expect(result).toBe(false);
    });

    test('should return false when from email is missing', () => {
      const incompleteConfig = { ...emailConfig, fromEmail: '' };
      const incompleteEmailService = new EmailService(mockEmailProvider, mockTemplateEngine, incompleteConfig);

      const result = incompleteEmailService.isEmailEnabled();

      expect(result).toBe(false);
    });
  });

  // ===================================
  // Email Validation Tests
  // ===================================

  describe('Email Validation', () => {
    test('should reject email with consecutive dots', async () => {
      const invalidRequest: SendEmailRequest = {
        to: 'test..user@example.com',
        subject: 'Test',
        body: 'Test body'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('consecutive dots');
    });

    test('should reject email starting with dot', async () => {
      const invalidRequest: SendEmailRequest = {
        to: '.testuser@example.com',
        subject: 'Test',
        body: 'Test body'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('cannot start or end with dot');
    });

    test('should reject email ending with dot', async () => {
      const invalidRequest: SendEmailRequest = {
        to: 'testuser.@example.com',
        subject: 'Test',
        body: 'Test body'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('cannot start or end with dot');
    });

    test('should reject too long email address', async () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const invalidRequest: SendEmailRequest = {
        to: longEmail,
        subject: 'Test',
        body: 'Test body'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('too long');
    });

    test('should reject too long subject', async () => {
      const longSubject = 'a'.repeat(1000);
      const invalidRequest: SendEmailRequest = {
        to: 'test@example.com',
        subject: longSubject,
        body: 'Test body'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('subject is too long');
    });

    test('should reject too long body', async () => {
      const longBody = 'a'.repeat(1000001); // Over 1MB
      const invalidRequest: SendEmailRequest = {
        to: 'test@example.com',
        subject: 'Test',
        body: longBody
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('body is too long');
    });

    test('should reject null or undefined email', async () => {
      const invalidRequest: SendEmailRequest = {
        to: null as any,
        subject: 'Test',
        body: 'Test body'
      };

      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow(EntityValidationError);
      await expect(emailService.sendEmail(invalidRequest)).rejects.toThrow('Email address is required');
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should handle email provider failure', async () => {
      mockEmailProvider.setShouldFail(true);

      const request: SendEmailRequest = {
        to: 'test@example.com',
        subject: 'Test',
        body: 'Test body'
      };

      const result = await emailService.sendEmail(request);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Mock email sending failed');
    });

    test('should handle template rendering failure', async () => {
      // Remove template to cause failure
      mockTemplateEngine.removeTemplate(EmailTemplate.WELCOME);

      const request: TemplateEmailRequest = {
        to: 'test@example.com',
        template: EmailTemplate.WELCOME,
        variables: { username: 'test' }
      };

      await expect(emailService.sendTemplateEmail(request)).rejects.toThrow(EntityNotFoundError);
    });
  });
});
