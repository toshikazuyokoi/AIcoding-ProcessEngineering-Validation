/**
 * ===================================
 * Common Types Definition
 * ===================================
 * Purpose: Centralized common type definitions and interfaces
 * Features:
 * - Shared types across all entities and services
 * - Pagination, sorting, and search utilities
 * - API response and error handling types
 * - Date, time, and statistics types
 * - Validation and configuration types
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

// ===================================
// Basic Common Types
// ===================================

/**
 * Generic ID type
 */
export type ID = string;

/**
 * Generic timestamp type
 */
export type Timestamp = Date;

/**
 * Generic nullable type
 */
export type Nullable<T> = T | null;

/**
 * Generic optional type
 */
export type Optional<T> = T | undefined;

/**
 * Generic result type
 */
export type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

// ===================================
// Pagination Types
// ===================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  offset?: number;
}

/**
 * Pagination information
 */
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  offset: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationInfo;
}

// ===================================
// Sorting Types
// ===================================

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Sort options
 */
export interface SortOptions {
  field: string;
  direction: SortDirection;
}

/**
 * Multiple sort options
 */
export interface MultiSortOptions {
  sorts: SortOptions[];
}

// ===================================
// Search and Filter Types
// ===================================

/**
 * Search parameters
 */
export interface SearchParams {
  query?: string;
  fields?: string[];
  caseSensitive?: boolean;
  exactMatch?: boolean;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  startDate?: Date;
  endDate?: Date;
}

/**
 * Numeric range filter
 */
export interface NumericRangeFilter {
  min?: number;
  max?: number;
}

/**
 * Base filter interface
 */
export interface BaseFilter {
  search?: SearchParams;
  dateRange?: DateRangeFilter;
  createdAt?: DateRangeFilter;
  updatedAt?: DateRangeFilter;
}

// ===================================
// API Response Types
// ===================================

/**
 * API response status
 */
export enum ApiResponseStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info'
}

/**
 * Base API response
 */
export interface BaseApiResponse<T = any> {
  status: ApiResponseStatus;
  message?: string;
  data?: T;
  timestamp: Date;
  requestId?: string;
}

/**
 * Success API response
 */
export interface SuccessApiResponse<T> extends BaseApiResponse<T> {
  status: ApiResponseStatus.SUCCESS;
  data: T;
}

/**
 * Error API response
 */
export interface ErrorApiResponse extends BaseApiResponse {
  status: ApiResponseStatus.ERROR;
  error: {
    code: string;
    message: string;
    details?: any;
    stack?: string;
  };
}

/**
 * Validation error details
 */
export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
  constraint?: string;
}

/**
 * Validation error response
 */
export interface ValidationErrorResponse extends ErrorApiResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: ValidationErrorDetail[];
  };
}

// ===================================
// Statistics and Analytics Types
// ===================================

/**
 * Time period
 */
export interface TimePeriod {
  startDate: Date;
  endDate: Date;
  label?: string;
}

/**
 * Data point for charts/graphs
 */
export interface DataPoint {
  x: number | string | Date;
  y: number;
  label?: string;
}

/**
 * Time series data point
 */
export interface TimeSeriesDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

/**
 * Statistical summary
 */
export interface StatisticalSummary {
  count: number;
  sum: number;
  average: number;
  min: number;
  max: number;
  median?: number;
  standardDeviation?: number;
}

/**
 * Trend analysis
 */
export interface TrendAnalysis {
  direction: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  significance: 'low' | 'medium' | 'high';
}

// ===================================
// Configuration Types
// ===================================

/**
 * Environment type
 */
export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

/**
 * Log level
 */
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
  TRACE = 'trace'
}

/**
 * Feature flag
 */
export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
  environment?: Environment[];
  rolloutPercentage?: number;
}

/**
 * Application settings
 */
export interface ApplicationSettings {
  environment: Environment;
  logLevel: LogLevel;
  featureFlags: FeatureFlag[];
  maintenance: {
    enabled: boolean;
    message?: string;
    scheduledAt?: Date;
  };
}

// ===================================
// Validation Types
// ===================================

/**
 * Validation rule type
 */
export enum ValidationRuleType {
  REQUIRED = 'required',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  PATTERN = 'pattern',
  EMAIL = 'email',
  URL = 'url',
  NUMERIC = 'numeric',
  DATE = 'date',
  CUSTOM = 'custom'
}

/**
 * Validation rule
 */
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  condition?: (value: any) => boolean;
}

/**
 * Field validation
 */
export interface FieldValidation {
  field: string;
  rules: ValidationRule[];
  required?: boolean;
}

/**
 * Validation schema
 */
export interface ValidationSchema {
  fields: FieldValidation[];
  customValidators?: ((data: any) => ValidationErrorDetail[])[];
}

// ===================================
// File and Media Types
// ===================================

/**
 * File type
 */
export enum FileType {
  IMAGE = 'image',
  DOCUMENT = 'document',
  VIDEO = 'video',
  AUDIO = 'audio',
  ARCHIVE = 'archive',
  OTHER = 'other'
}

/**
 * File information
 */
export interface FileInfo {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: FileType;
  path: string;
  url?: string;
  uploadedAt: Date;
  uploadedBy: string;
}

/**
 * File upload options
 */
export interface FileUploadOptions {
  maxSize?: number;
  allowedTypes?: string[];
  allowedExtensions?: string[];
  generateThumbnail?: boolean;
  compress?: boolean;
}

// ===================================
// Notification Types
// ===================================

/**
 * Notification type
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Notification channel
 */
export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook'
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  channel: NotificationChannel;
  recipientId: string;
  data?: Record<string, any>;
  isRead: boolean;
  sentAt?: Date;
  readAt?: Date;
  createdAt: Date;
}

// ===================================
// Audit and Tracking Types
// ===================================

/**
 * Audit action type
 */
export enum AuditActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  EXPORT = 'export',
  IMPORT = 'import'
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string;
  userId: string;
  action: AuditActionType;
  resource: string;
  resourceId?: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// ===================================
// Performance and Monitoring Types
// ===================================

/**
 * Performance metric
 */
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

/**
 * Health check status
 */
export enum HealthCheckStatus {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  UNHEALTHY = 'unhealthy',
  UNKNOWN = 'unknown'
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  service: string;
  status: HealthCheckStatus;
  message?: string;
  responseTime?: number;
  timestamp: Date;
  details?: Record<string, any>;
}

/**
 * System health
 */
export interface SystemHealth {
  overall: HealthCheckStatus;
  services: HealthCheckResult[];
  uptime: number;
  version: string;
  timestamp: Date;
}

// ===================================
// Cache Types
// ===================================

/**
 * Cache key
 */
export type CacheKey = string;

/**
 * Cache options
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  tags?: string[];
  namespace?: string;
}

/**
 * Cache entry
 */
export interface CacheEntry<T> {
  key: CacheKey;
  value: T;
  expiresAt?: Date;
  createdAt: Date;
  accessCount: number;
  lastAccessedAt: Date;
}

// ===================================
// Queue and Job Types
// ===================================

/**
 * Job status
 */
export enum JobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

/**
 * Job priority
 */
export enum JobPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Job
 */
export interface Job<T = any> {
  id: string;
  type: string;
  data: T;
  status: JobStatus;
  priority: JobPriority;
  attempts: number;
  maxAttempts: number;
  delay?: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: any;
}

// ===================================
// Rate Limiting Types
// ===================================

/**
 * Rate limit window
 */
export enum RateLimitWindow {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
  DAY = 'day'
}

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  requests: number;
  window: RateLimitWindow;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (req: any) => string;
}

/**
 * Rate limit status
 */
export interface RateLimitStatus {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}

// ===================================
// Utility Types
// ===================================

/**
 * Deep partial type
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Deep readonly type
 */
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Exact type
 */
export type Exact<T, U> = T extends U ? (U extends T ? T : never) : never;

/**
 * Pick by type
 */
export type PickByType<T, U> = {
  [K in keyof T as T[K] extends U ? K : never]: T[K];
};

/**
 * Omit by type
 */
export type OmitByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

/**
 * Required keys
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Optional keys
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// ===================================
// Type Guards
// ===================================

/**
 * Type guard to check if value is defined
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null;
}

/**
 * Type guard to check if value is string
 */
export function isString(value: any): value is string {
  return typeof value === 'string';
}

/**
 * Type guard to check if value is number
 */
export function isNumber(value: any): value is number {
  return typeof value === 'number' && !isNaN(value);
}

/**
 * Type guard to check if value is boolean
 */
export function isBoolean(value: any): value is boolean {
  return typeof value === 'boolean';
}

/**
 * Type guard to check if value is date
 */
export function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Type guard to check if value is array
 */
export function isArray<T>(value: any): value is T[] {
  return Array.isArray(value);
}

/**
 * Type guard to check if value is non-empty array
 */
export function isNonEmptyArray<T>(value: any): value is NonEmptyArray<T> {
  return Array.isArray(value) && value.length > 0;
}

/**
 * Type guard to check if value is object
 */
export function isObject(value: any): value is Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Type guard to check if value is empty object
 */
export function isEmptyObject(value: any): boolean {
  return isObject(value) && Object.keys(value).length === 0;
}

/**
 * Type guard to check if result is success
 */
export function isSuccessResult<T, E>(result: Result<T, E>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard to check if result is error
 */
export function isErrorResult<T, E>(result: Result<T, E>): result is { success: false; error: E } {
  return result.success === false;
}

// ===================================
// Constants
// ===================================

/**
 * Default pagination settings
 */
export const DEFAULT_PAGINATION = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100
} as const;

/**
 * Default sort settings
 */
export const DEFAULT_SORT = {
  DIRECTION: SortDirection.ASC,
  FIELD: 'createdAt'
} as const;

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Common regex patterns
 */
export const REGEX_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  HEX_COLOR: /^#[0-9A-Fa-f]{6}$/,
  URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  PHONE: /^\+?[1-9]\d{1,14}$/,
  PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
} as const;

/**
 * Time constants
 */
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000
} as const;
