/**
 * ===================================
 * Service Interfaces Types Definition
 * ===================================
 * Purpose: Centralized service interface definitions and contracts
 * Features:
 * - Unified service interfaces across all domain services
 * - Repository interface contracts
 * - Service communication types
 * - Dependency injection contracts
 * - Type safety and loose coupling
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

// ===================================
// Service Interface Types
// ===================================

// Define all service interface types independently
export interface AuthResult {
  user: any;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export interface PasswordResetRequest {
  email: string;
}

export enum EmailTemplate {
  WELCOME = 'welcome',
  PASSWORD_RESET = 'password_reset',
  TASK_REMINDER = 'task_reminder',
  TASK_COMPLETED = 'task_completed',
  TASK_OVERDUE = 'task_overdue'
}

export interface NotificationResult {
  success: boolean;
  notificationId?: string;
  error?: string;
  timestamp: Date;
}

export interface ChannelResult {
  channel: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IUserRepository {
  findById(id: string): Promise<any>;
  findByEmail(email: string): Promise<any>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface IEmailProvider {
  sendEmail(request: any): Promise<any>;
  validateConfiguration(): Promise<boolean>;
  testConnection(): Promise<boolean>;
}

export interface INotificationRepository {
  create(notification: any): Promise<any>;
  findById(id: string): Promise<any>;
  findByUserId(userId: string): Promise<any[]>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

// ===================================
// Service Request/Response Types
// ===================================

// Define missing types that don't exist in services
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface PasswordResetConfirmation {
  token: string;
  newPassword: string;
}

export interface UserSearchFilters {
  role?: string;
  isActive?: boolean;
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  usersByRole: Record<string, number>;
}

export interface TaskSearchFilters {
  status?: string;
  priority?: string;
  categoryId?: string;
  search?: string;
  dueBefore?: Date;
  dueAfter?: Date;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  dueDate?: Date;
  categoryIds?: string[];
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: Date;
  categoryIds?: string[];
}

export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
}

export interface CategorySearchFilters {
  search?: string;
  color?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

export interface CreateCategoryRequest {
  name: string;
  color: string;
  description?: string;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  description?: string;
}

export interface CategoryStatistics {
  totalCategories: number;
  categoriesWithTasks: number;
  averageTasksPerCategory: number;
}

export interface EmailSendRequest {
  to: string;
  subject: string;
  body: string;
  isHtml?: boolean;
  priority?: string;
}

export interface EmailSendResult {
  success: boolean;
  messageId?: string;
  error?: string;
  timestamp: Date;
}

export interface EmailBatchRequest {
  emails: EmailSendRequest[];
  priority?: string;
}

export interface EmailBatchResult {
  success: boolean;
  results: EmailSendResult[];
  totalSent: number;
  totalFailed: number;
}

export interface NotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  channels?: string[];
}

export interface NotificationPreferences {
  userId: string;
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  inAppEnabled: boolean;
}

export interface NotificationBatchRequest {
  notifications: NotificationRequest[];
  priority?: string;
}

// Repository interfaces
export interface IAuthRepository extends IUserRepository {}

export interface ITaskRepository {
  findById(id: string): Promise<any>;
  findByUserId(userId: string, filters?: TaskSearchFilters): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface ITaskCategoryRepository {
  findByTaskId(taskId: string): Promise<any[]>;
  addCategoryToTask(taskId: string, categoryId: string): Promise<void>;
  removeCategoryFromTask(taskId: string, categoryId: string): Promise<void>;
}

export interface ICategoryRepository {
  findById(id: string): Promise<any>;
  findByUserId(userId: string, filters?: CategorySearchFilters): Promise<any[]>;
  create(data: any): Promise<any>;
  update(id: string, data: any): Promise<any>;
  delete(id: string): Promise<void>;
}

export interface INotificationChannel {
  send(notification: NotificationRequest): Promise<NotificationResult>;
  isEnabled(): boolean;
  getName(): string;
}

// ===================================
// Common Service Interfaces
// ===================================

/**
 * Base service interface
 */
export interface IBaseService {
  readonly serviceName: string;
  readonly version: string;
  isHealthy(): Promise<boolean>;
  getMetrics(): Promise<ServiceMetrics>;
}

/**
 * Service health status
 */
export enum ServiceHealthStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

/**
 * Service metrics
 */
export interface ServiceMetrics {
  serviceName: string;
  status: ServiceHealthStatus;
  uptime: number;
  requestCount: number;
  errorCount: number;
  averageResponseTime: number;
  memoryUsage: number;
  cpuUsage: number;
  lastHealthCheck: Date;
}

/**
 * Service configuration
 */
export interface ServiceConfig {
  serviceName: string;
  version: string;
  environment: string;
  logLevel: string;
  enableMetrics: boolean;
  enableHealthCheck: boolean;
  healthCheckInterval: number;
}

// ===================================
// Repository Base Interfaces
// ===================================

/**
 * Base repository interface
 */
export interface IBaseRepository<T, TId = string> {
  findById(id: TId): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: TId, data: Partial<T>): Promise<T>;
  delete(id: TId): Promise<void>;
  exists(id: TId): Promise<boolean>;
  count(): Promise<number>;
}

/**
 * Paginated repository interface
 */
export interface IPaginatedRepository<T, TId = string> extends IBaseRepository<T, TId> {
  findWithPagination(
    page: number,
    limit: number,
    filters?: Record<string, any>
  ): Promise<PaginatedRepositoryResult<T>>;
}

/**
 * Paginated repository result
 */
export interface PaginatedRepositoryResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Searchable repository interface
 */
export interface ISearchableRepository<T, TId = string> extends IBaseRepository<T, TId> {
  search(query: string, filters?: Record<string, any>): Promise<T[]>;
  searchWithPagination(
    query: string,
    page: number,
    limit: number,
    filters?: Record<string, any>
  ): Promise<PaginatedRepositoryResult<T>>;
}

// ===================================
// Service Communication Interfaces
// ===================================

/**
 * Service request context
 */
export interface ServiceRequestContext {
  requestId: string;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  ipAddress?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Service response wrapper
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: ServiceError;
  metadata?: ServiceResponseMetadata;
}

/**
 * Service error
 */
export interface ServiceError {
  code: string;
  message: string;
  details?: any;
  stack?: string;
  timestamp: Date;
}

/**
 * Service response metadata
 */
export interface ServiceResponseMetadata {
  requestId: string;
  processingTime: number;
  serviceName: string;
  version: string;
  timestamp: Date;
}

// ===================================
// Event-Driven Service Interfaces
// ===================================

/**
 * Domain event interface
 */
export interface IDomainEvent {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  eventData: Record<string, any>;
  eventVersion: number;
  occurredAt: Date;
  userId?: string;
}

/**
 * Event handler interface
 */
export interface IEventHandler<T extends IDomainEvent> {
  handle(event: T, context: ServiceRequestContext): Promise<void>;
  canHandle(eventType: string): boolean;
}

/**
 * Event publisher interface
 */
export interface IEventPublisher {
  publish(event: IDomainEvent): Promise<void>;
  publishBatch(events: IDomainEvent[]): Promise<void>;
}

/**
 * Event subscriber interface
 */
export interface IEventSubscriber {
  subscribe(eventType: string, handler: IEventHandler<any>): void;
  unsubscribe(eventType: string): void;
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ===================================
// Cache Service Interfaces
// ===================================

/**
 * Cache service interface
 */
export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  clear(): Promise<void>;
  keys(pattern?: string): Promise<string[]>;
  ttl(key: string): Promise<number>;
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  database?: number;
  keyPrefix?: string;
  defaultTtl: number;
  maxRetries: number;
  retryDelay: number;
}

// ===================================
// Logging Service Interfaces
// ===================================

/**
 * Logger interface
 */
export interface ILogger {
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  info(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
  trace(message: string, meta?: any): void;
}

/**
 * Structured log entry
 */
export interface LogEntry {
  level: string;
  message: string;
  timestamp: Date;
  serviceName: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

// ===================================
// Validation Service Interfaces
// ===================================

/**
 * Validation service interface
 */
export interface IValidationService {
  validate<T>(data: any, schema: ValidationSchema<T>): Promise<ValidationResult<T>>;
  validateField(value: any, rules: ValidationRule[]): Promise<FieldValidationResult>;
}

/**
 * Validation schema
 */
export interface ValidationSchema<T> {
  fields: {
    [K in keyof T]?: ValidationRule[];
  };
  customValidators?: CustomValidator<T>[];
}

/**
 * Validation rule
 */
export interface ValidationRule {
  type: string;
  value?: any;
  message: string;
  condition?: (value: any, data: any) => boolean;
}

/**
 * Custom validator
 */
export interface CustomValidator<T> {
  name: string;
  validate: (data: T) => Promise<string[]>;
}

/**
 * Validation result
 */
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors: ValidationError[];
}

/**
 * Field validation result
 */
export interface FieldValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
  rule?: string;
}

// ===================================
// Security Service Interfaces
// ===================================

/**
 * Security service interface
 */
export interface ISecurityService {
  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;
  generateToken(payload: any, expiresIn?: string): Promise<string>;
  verifyToken(token: string): Promise<any>;
  generateSecureId(): string;
  sanitizeInput(input: string): string;
}

/**
 * Encryption service interface
 */
export interface IEncryptionService {
  encrypt(data: string, key?: string): Promise<string>;
  decrypt(encryptedData: string, key?: string): Promise<string>;
  generateKey(): string;
  hash(data: string, algorithm?: string): string;
}

// ===================================
// File Service Interfaces
// ===================================

/**
 * File service interface
 */
export interface IFileService {
  upload(file: FileUploadRequest): Promise<FileUploadResult>;
  download(fileId: string): Promise<FileDownloadResult>;
  delete(fileId: string): Promise<void>;
  getMetadata(fileId: string): Promise<FileMetadata>;
  generatePresignedUrl(fileId: string, expiresIn?: number): Promise<string>;
}

/**
 * File upload request
 */
export interface FileUploadRequest {
  fileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  userId: string;
  metadata?: Record<string, any>;
}

/**
 * File upload result
 */
export interface FileUploadResult {
  fileId: string;
  fileName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

/**
 * File download result
 */
export interface FileDownloadResult {
  fileName: string;
  mimeType: string;
  size: number;
  buffer: Buffer;
  metadata?: Record<string, any>;
}

/**
 * File metadata
 */
export interface FileMetadata {
  fileId: string;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  userId: string;
  uploadedAt: Date;
  metadata?: Record<string, any>;
}

// ===================================
// Queue Service Interfaces
// ===================================

/**
 * Queue service interface
 */
export interface IQueueService {
  enqueue<T>(queueName: string, job: QueueJob<T>): Promise<string>;
  dequeue<T>(queueName: string): Promise<QueueJob<T> | null>;
  getQueueStatus(queueName: string): Promise<QueueStatus>;
  clearQueue(queueName: string): Promise<void>;
  retryFailedJobs(queueName: string): Promise<number>;
}

/**
 * Queue job
 */
export interface QueueJob<T = any> {
  id: string;
  type: string;
  data: T;
  priority: number;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
}

/**
 * Queue status
 */
export interface QueueStatus {
  queueName: string;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  totalJobs: number;
}

// ===================================
// Monitoring Service Interfaces
// ===================================

/**
 * Monitoring service interface
 */
export interface IMonitoringService {
  recordMetric(metric: MetricData): Promise<void>;
  recordEvent(event: MonitoringEvent): Promise<void>;
  getMetrics(query: MetricQuery): Promise<MetricResult[]>;
  createAlert(alert: AlertDefinition): Promise<string>;
  checkAlerts(): Promise<AlertResult[]>;
}

/**
 * Metric data
 */
export interface MetricData {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
  metadata?: Record<string, any>;
}

/**
 * Monitoring event
 */
export interface MonitoringEvent {
  eventType: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  source: string;
  metadata?: Record<string, any>;
}

/**
 * Metric query
 */
export interface MetricQuery {
  metricName: string;
  startTime: Date;
  endTime: Date;
  aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count';
  groupBy?: string[];
  filters?: Record<string, any>;
}

/**
 * Metric result
 */
export interface MetricResult {
  timestamp: Date;
  value: number;
  tags?: Record<string, string>;
}

/**
 * Alert definition
 */
export interface AlertDefinition {
  name: string;
  description: string;
  metricName: string;
  condition: AlertCondition;
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

/**
 * Alert condition
 */
export interface AlertCondition {
  operator: 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'ne';
  timeWindow: number; // in minutes
  evaluationFrequency: number; // in minutes
}

/**
 * Alert result
 */
export interface AlertResult {
  alertId: string;
  alertName: string;
  triggered: boolean;
  currentValue: number;
  threshold: number;
  severity: string;
  triggeredAt?: Date;
  message: string;
}

// ===================================
// Configuration Service Interfaces
// ===================================

/**
 * Configuration service interface
 */
export interface IConfigurationService {
  get<T>(key: string, defaultValue?: T): T;
  set(key: string, value: any): Promise<void>;
  has(key: string): boolean;
  delete(key: string): Promise<void>;
  getAll(): Record<string, any>;
  reload(): Promise<void>;
  watch(key: string, callback: (value: any) => void): void;
}

/**
 * Configuration source
 */
export interface IConfigurationSource {
  load(): Promise<Record<string, any>>;
  watch(callback: (config: Record<string, any>) => void): void;
  stop(): void;
}

// ===================================
// Service Factory Interfaces
// ===================================

/**
 * Service factory interface
 */
export interface IServiceFactory {
  createUserService(): IUserService;
  createAuthService(): IAuthService;
  createTaskService(): ITaskService;
  createCategoryService(): ICategoryService;
  createEmailService(): IEmailService;
  createNotificationService(): INotificationService;
  createCacheService(): ICacheService;
  createLogger(): ILogger;
}

/**
 * Service container interface
 */
export interface IServiceContainer {
  register<T>(name: string, factory: () => T): void;
  registerSingleton<T>(name: string, factory: () => T): void;
  resolve<T>(name: string): T;
  has(name: string): boolean;
  clear(): void;
}

// ===================================
// Unified Service Interfaces
// ===================================

/**
 * User service interface
 */
export interface IUserService extends IBaseService {
  findById(id: string): Promise<ServiceResponse<any>>;
  findByEmail(email: string): Promise<ServiceResponse<any>>;
  create(request: CreateUserRequest, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  update(id: string, request: UpdateUserRequest, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  delete(id: string, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
  search(filters: UserSearchFilters, context: ServiceRequestContext): Promise<ServiceResponse<any[]>>;
  getStatistics(userId: string, context: ServiceRequestContext): Promise<ServiceResponse<UserStatistics>>;
}

/**
 * Auth service interface
 */
export interface IAuthService extends IBaseService {
  register(request: RegisterData, context: ServiceRequestContext): Promise<ServiceResponse<AuthResult>>;
  login(request: LoginData, context: ServiceRequestContext): Promise<ServiceResponse<AuthResult>>;
  logout(token: string, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
  validateToken(token: string, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  refreshToken(refreshToken: string, context: ServiceRequestContext): Promise<ServiceResponse<TokenPair>>;
  resetPassword(request: PasswordResetRequest, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
}

/**
 * Task service interface
 */
export interface ITaskService extends IBaseService {
  findById(id: string, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  findByUserId(userId: string, filters: TaskSearchFilters, context: ServiceRequestContext): Promise<ServiceResponse<any[]>>;
  create(request: CreateTaskRequest, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  update(id: string, request: UpdateTaskRequest, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  delete(id: string, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
  complete(id: string, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  getStatistics(userId: string, context: ServiceRequestContext): Promise<ServiceResponse<TaskStatistics>>;
}

/**
 * Category service interface
 */
export interface ICategoryService extends IBaseService {
  findById(id: string, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  findByUserId(userId: string, filters: CategorySearchFilters, context: ServiceRequestContext): Promise<ServiceResponse<any[]>>;
  create(request: CreateCategoryRequest, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  update(id: string, request: UpdateCategoryRequest, context: ServiceRequestContext): Promise<ServiceResponse<any>>;
  delete(id: string, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
  getStatistics(userId: string, context: ServiceRequestContext): Promise<ServiceResponse<CategoryStatistics>>;
}

/**
 * Email service interface
 */
export interface IEmailService extends IBaseService {
  send(request: EmailSendRequest, context: ServiceRequestContext): Promise<ServiceResponse<EmailSendResult>>;
  sendBatch(request: EmailBatchRequest, context: ServiceRequestContext): Promise<ServiceResponse<EmailBatchResult>>;
  getTemplate(templateId: string): Promise<ServiceResponse<EmailTemplate>>;
  validateEmail(email: string): Promise<ServiceResponse<boolean>>;
}

/**
 * Notification service interface
 */
export interface INotificationService extends IBaseService {
  send(request: NotificationRequest, context: ServiceRequestContext): Promise<ServiceResponse<NotificationResult>>;
  sendBatch(request: NotificationBatchRequest, context: ServiceRequestContext): Promise<ServiceResponse<NotificationResult[]>>;
  getPreferences(userId: string): Promise<ServiceResponse<NotificationPreferences>>;
  updatePreferences(userId: string, preferences: NotificationPreferences, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
  markAsRead(notificationId: string, context: ServiceRequestContext): Promise<ServiceResponse<void>>;
}
