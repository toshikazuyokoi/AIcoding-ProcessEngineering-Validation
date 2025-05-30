/**
 * ===================================
 * Logger Utility Class
 * ===================================
 * Purpose: Comprehensive logging system with structured output
 * Features:
 * - Multiple log levels (DEBUG, INFO, WARN, ERROR, FATAL)
 * - Structured JSON logging
 * - Context-aware logging
 * - Environment-specific behavior
 * - Performance optimized
 * - File and console output support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';

// Node.js global types
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      LOG_LEVEL?: string;
      LOG_FORMAT?: string;
      LOG_FILE?: string;
      LOG_DIR?: string;
      NODE_ENV?: string;
      SERVICE_NAME?: string;
      SERVICE_VERSION?: string;
    }
  }
}

/**
 * Log levels enum
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4
}

/**
 * Log level string mapping
 */
export const LogLevelString: Record<LogLevel, string> = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR',
  [LogLevel.FATAL]: 'FATAL'
};

/**
 * Structured log entry interface
 */
export interface StructuredLog {
  timestamp: string;
  level: string;
  service: string;
  version: string;
  context?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  message: string;
  error?: {
    name: string;
    message: string;
    stack: string | undefined;
  };
  metadata?: Record<string, any>;
}

/**
 * Logger configuration interface
 */
export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  enableConsole: boolean;
  enableFile: boolean;
  filePath?: string;
  serviceName: string;
  serviceVersion: string;
  enableColors: boolean;
  enableTimestamp: boolean;
}

/**
 * Logger context interface
 */
export interface LoggerContext {
  traceId?: string;
  spanId?: string;
  userId?: string;
  requestId?: string;
  method?: string;
  path?: string;
}

/**
 * Color codes for console output
 */
const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

/**
 * Logger class for structured logging
 */
export class Logger {
  private config: LoggerConfig;
  private context: string | undefined;
  private loggerContext: LoggerContext | undefined;

  constructor(context?: string, config?: Partial<LoggerConfig>) {
    this.context = context;
    this.config = this.buildConfig(config);
    this.ensureLogDirectory();
  }

  /**
   * Build configuration with defaults
   */
  private buildConfig(config?: Partial<LoggerConfig>): LoggerConfig {
    const defaultConfig: LoggerConfig = {
      level: this.parseLogLevel(process.env.LOG_LEVEL || 'info'),
      format: (process.env.LOG_FORMAT as 'json' | 'text') || 'json',
      enableConsole: true,
      enableFile: process.env.NODE_ENV === 'production',
      filePath: process.env.LOG_FILE || path.join(process.env.LOG_DIR || './logs', 'app.log'),
      serviceName: process.env.SERVICE_NAME || 'task-management-backend',
      serviceVersion: process.env.SERVICE_VERSION || '1.0.0',
      enableColors: process.env.NODE_ENV !== 'production',
      enableTimestamp: true
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * Parse log level from string
   */
  private parseLogLevel(level: string): LogLevel {
    switch (level.toUpperCase()) {
      case 'DEBUG': return LogLevel.DEBUG;
      case 'INFO': return LogLevel.INFO;
      case 'WARN': return LogLevel.WARN;
      case 'ERROR': return LogLevel.ERROR;
      case 'FATAL': return LogLevel.FATAL;
      default: return LogLevel.INFO;
    }
  }

  /**
   * Ensure log directory exists
   */
  private ensureLogDirectory(): void {
    if (this.config.enableFile && this.config.filePath) {
      const logDir = path.dirname(this.config.filePath);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Set logger context
   */
  public setContext(context: LoggerContext): void {
    this.loggerContext = { ...this.loggerContext, ...context };
  }

  /**
   * Clear logger context
   */
  public clearContext(): void {
    this.loggerContext = undefined as LoggerContext | undefined;
  }

  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, any>,
    error?: Error
  ): StructuredLog {
    const logEntry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level: LogLevelString[level],
      service: this.config.serviceName,
      version: this.config.serviceVersion,
      message,
      ...(this.context && { context: this.context }),
      ...(this.loggerContext && this.loggerContext),
      ...(metadata && { metadata }),
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        }
      })
    };

    return logEntry;
  }

  /**
   * Format log entry for console output
   */
  private formatConsoleOutput(logEntry: StructuredLog): string {
    if (this.config.format === 'json') {
      return JSON.stringify(logEntry);
    }

    const { timestamp, level, context, message } = logEntry;
    const contextStr = context ? `[${context}]` : '';
    const timeStr = this.config.enableTimestamp ? `${timestamp} ` : '';

    if (this.config.enableColors) {
      const levelColor = this.getLevelColor(level);
      return `${timeStr}${levelColor}[${level}]${Colors.reset} ${contextStr} ${message}`;
    }

    return `${timeStr}[${level}] ${contextStr} ${message}`;
  }

  /**
   * Get color for log level
   */
  private getLevelColor(level: string): string {
    switch (level) {
      case 'DEBUG': return Colors.cyan;
      case 'INFO': return Colors.blue;
      case 'WARN': return Colors.yellow;
      case 'ERROR': return Colors.red;
      case 'FATAL': return Colors.magenta;
      default: return Colors.white;
    }
  }

  /**
   * Write log entry
   */
  private writeLog(logEntry: StructuredLog): void {
    // Console output
    if (this.config.enableConsole) {
      const output = this.formatConsoleOutput(logEntry);

      switch (logEntry.level) {
        case 'DEBUG':
          console.debug(output);
          break;
        case 'INFO':
          console.log(output);
          break;
        case 'WARN':
          console.warn(output);
          break;
        case 'ERROR':
        case 'FATAL':
          console.error(output);
          break;
        default:
          console.log(output);
      }
    }

    // File output
    if (this.config.enableFile && this.config.filePath) {
      try {
        const fileOutput = JSON.stringify(logEntry) + '\n';
        fs.appendFileSync(this.config.filePath, fileOutput);
      } catch (error) {
        // Fallback to console if file write fails
        console.error('Failed to write to log file:', error);
      }
    }
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  /**
   * Debug level logging
   */
  public debug(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const logEntry = this.createLogEntry(LogLevel.DEBUG, message, metadata);
    this.writeLog(logEntry);
  }

  /**
   * Info level logging
   */
  public info(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const logEntry = this.createLogEntry(LogLevel.INFO, message, metadata);
    this.writeLog(logEntry);
  }

  /**
   * Warning level logging
   */
  public warn(message: string, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const logEntry = this.createLogEntry(LogLevel.WARN, message, metadata);
    this.writeLog(logEntry);
  }

  /**
   * Error level logging
   */
  public error(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const logEntry = this.createLogEntry(LogLevel.ERROR, message, metadata, error);
    this.writeLog(logEntry);
  }

  /**
   * Fatal level logging
   */
  public fatal(message: string, error?: Error, metadata?: Record<string, any>): void {
    if (!this.shouldLog(LogLevel.FATAL)) return;

    const logEntry = this.createLogEntry(LogLevel.FATAL, message, metadata, error);
    this.writeLog(logEntry);
  }

  /**
   * Get current configuration
   */
  public getConfig(): LoggerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  public updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
    this.ensureLogDirectory();
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger('Application');

/**
 * Create logger with context
 */
export function createLogger(context: string, config?: Partial<LoggerConfig>): Logger {
  return new Logger(context, config);
}

/**
 * Get logger instance (singleton pattern)
 */
let defaultLogger: Logger | null = null;

export function getLogger(context?: string): Logger {
  if (!defaultLogger) {
    defaultLogger = new Logger(context || 'Default');
  }
  return defaultLogger;
}
