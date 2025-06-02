import winston, { Logger as WinstonLogger, LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getConfig } from './environment';

/**
 * ログレベル型定義
 */
export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

/**
 * ログメタデータインターフェース
 */
export interface LogMetadata {
  [key: string]: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
}

/**
 * コンソール設定インターフェース
 */
export interface ConsoleConfig {
  enabled: boolean;
  level: LogLevel;
  colorize: boolean;
}

/**
 * ファイル設定インターフェース
 */
export interface FileConfig {
  enabled: boolean;
  filename: string;
  level: LogLevel;
  maxSize: string;
  maxFiles: string;
  datePattern: string;
  zippedArchive: boolean;
}

/**
 * セキュリティ設定インターフェース
 */
export interface SecurityConfig {
  sanitizePasswords: boolean;
  sanitizeTokens: boolean;
  sanitizeCreditCards: boolean;
  maxMetadataSize: number;
}

/**
 * Logger設定インターフェース
 */
export interface LoggerConfig {
  level: LogLevel;
  silent: boolean;
  console: ConsoleConfig;
  file: FileConfig;
  errorFile: FileConfig;
  auditFile: FileConfig;
  security: SecurityConfig;
}

/**
 * Logger設定作成関数
 */
export const createLoggerConfig = (): LoggerConfig => {
  const env = process.env.NODE_ENV || 'development';
  const config = getConfig();
  const logLevel = config.api.logLevel as LogLevel;

  return {
    level: logLevel,
    silent: env === 'test',
    console: {
      enabled: env === 'development',
      level: logLevel,
      colorize: true
    },
    file: {
      enabled: true,
      filename: 'logs/application-%DATE%.log',
      level: logLevel,
      maxSize: '20m',
      maxFiles: '14d',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true
    },
    errorFile: {
      enabled: true,
      filename: 'logs/error-%DATE%.log',
      level: 'error',
      maxSize: '20m',
      maxFiles: '30d',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true
    },
    auditFile: {
      enabled: env === 'production',
      filename: 'logs/audit-%DATE%.log',
      level: 'info',
      maxSize: '50m',
      maxFiles: '90d',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true
    },
    security: {
      sanitizePasswords: true,
      sanitizeTokens: true,
      sanitizeCreditCards: true,
      maxMetadataSize: 10000
    }
  };
};

/**
 * ログセキュリティサニタイザークラス
 */
export class LogSanitizer {
  private static readonly PASSWORD_PATTERNS = [
    /password/i,
    /passwd/i,
    /pwd/i,
    /secret/i,
    /token/i,
    /key/i,
    /auth/i
  ];

  private static readonly CREDIT_CARD_PATTERN = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g;
  private static readonly EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

  /**
   * メタデータサニタイズ
   */
  public static sanitizeMetadata(metadata: any, config: SecurityConfig): any {
    if (!metadata || typeof metadata !== 'object') {
      return metadata;
    }

    let sanitized: any;
    try {
      sanitized = JSON.parse(JSON.stringify(metadata));
    } catch (error) {
      // Handle circular references by creating a simplified version
      sanitized = this.handleCircularReferences(metadata);
    }
    
    this.sanitizePasswords(sanitized, config);
    this.sanitizeCreditCards(sanitized, config);
    return this.truncateIfNeeded(sanitized, config);
  }

  /**
   * 循環参照を処理してオブジェクトを単純化
   */
  private static handleCircularReferences(obj: any, seen = new WeakSet()): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (seen.has(obj)) {
      return '[Circular Reference]';
    }

    seen.add(obj);

    const result: any = Array.isArray(obj) ? [] : {};
    
    try {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = this.handleCircularReferences(obj[key], seen);
        }
      }
    } catch (error) {
      return '[Complex Object]';
    }

    seen.delete(obj);
    return result;
  }

  /**
   * パスワード系フィールドのサニタイズ
   */
  private static sanitizePasswords(obj: any, config: SecurityConfig): void {
    if (!config.sanitizePasswords) return;

    const traverse = (current: any): void => {
      if (typeof current !== 'object' || current === null) return;

      Object.keys(current).forEach(key => {
        if (this.PASSWORD_PATTERNS.some(pattern => pattern.test(key))) {
          current[key] = '[REDACTED]';
        } else if (typeof current[key] === 'object') {
          traverse(current[key]);
        }
      });
    };

    traverse(obj);
  }

  /**
   * クレジットカード番号のサニタイズ
   */
  private static sanitizeCreditCards(obj: any, config: SecurityConfig): void {
    if (!config.sanitizeCreditCards) return;

    const sanitizeString = (str: string): string => {
      return str.replace(this.CREDIT_CARD_PATTERN, 'XXXX-XXXX-XXXX-XXXX');
    };

    const traverse = (current: any): any => {
      if (typeof current === 'string') {
        return sanitizeString(current);
      } else if (typeof current === 'object' && current !== null) {
        Object.keys(current).forEach(key => {
          current[key] = traverse(current[key]);
        });
      }
      return current;
    };

    traverse(obj);
  }

  /**
   * サイズ制限によるトランケート
   */
  private static truncateIfNeeded(obj: any, config: SecurityConfig): any {
    const serialized = JSON.stringify(obj);
    if (serialized.length > config.maxMetadataSize) {
      return {
        ...obj,
        _truncated: true,
        _originalSize: serialized.length,
        _note: 'Metadata truncated due to size limit'
      };
    }
    return obj;
  }
}

/**
 * メインLoggerクラス（シングルトン）
 */
export class Logger {
  private static instance: Logger;
  private winstonLogger: WinstonLogger;
  private config: LoggerConfig;

  private constructor(config: LoggerConfig) {
    this.config = config;
    this.winstonLogger = this.createWinstonLogger();
  }

  /**
   * シングルトンインスタンス取得
   */
  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      if (!config) {
        config = createLoggerConfig();
      }
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

  /**
   * Winston Loggerインスタンス作成
   */
  private createWinstonLogger(): WinstonLogger {
    const transports = this.createTransports();
    const format = this.createFormat();

    const options: LoggerOptions = {
      level: this.config.level,
      format,
      transports,
      exitOnError: false,
      silent: this.config.silent,
    };

    return winston.createLogger(options);
  }

  /**
   * トランスポート作成
   */
  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];

    // Console Transport
    if (this.config.console.enabled) {
      transports.push(new winston.transports.Console({
        level: this.config.console.level,
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }

    // File Transport - Application Logs
    if (this.config.file.enabled) {
      transports.push(new DailyRotateFile({
        filename: this.config.file.filename,
        datePattern: this.config.file.datePattern,
        zippedArchive: this.config.file.zippedArchive,
        maxSize: this.config.file.maxSize,
        maxFiles: this.config.file.maxFiles,
        level: this.config.file.level,
        format: this.createFileFormat()
      }));
    }

    // Error File Transport
    if (this.config.errorFile.enabled) {
      transports.push(new DailyRotateFile({
        filename: this.config.errorFile.filename,
        datePattern: this.config.errorFile.datePattern,
        zippedArchive: this.config.errorFile.zippedArchive,
        maxSize: this.config.errorFile.maxSize,
        maxFiles: this.config.errorFile.maxFiles,
        level: 'error',
        format: this.createFileFormat()
      }));
    }

    // Audit Log Transport
    if (this.config.auditFile.enabled) {
      transports.push(new DailyRotateFile({
        filename: this.config.auditFile.filename,
        datePattern: this.config.auditFile.datePattern,
        zippedArchive: this.config.auditFile.zippedArchive,
        maxSize: this.config.auditFile.maxSize,
        maxFiles: this.config.auditFile.maxFiles,
        level: 'info',
        format: this.createAuditFormat()
      }));
    }

    return transports;
  }

  /**
   * 共通フォーマット作成
   */
  private createFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.metadata({
        fillExcept: ['message', 'level', 'timestamp', 'label']
      }),
      winston.format.json()
    );
  }

  /**
   * ファイル用フォーマット作成
   */
  private createFileFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.errors({ stack: true }),
      winston.format.json(),
      winston.format.prettyPrint()
    );
  }

  /**
   * 監査ログ用フォーマット作成
   */
  private createAuditFormat(): winston.Logform.Format {
    return winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss.SSS'
      }),
      winston.format.printf(({ timestamp, level, message, userId, action, resource, ip }) => {
        return JSON.stringify({
          timestamp,
          level,
          type: 'AUDIT',
          userId,
          action,
          resource,
          ip,
          message
        });
      })
    );
  }

  /**
   * メタデータサニタイズ
   */
  private sanitizeMetadata(metadata?: LogMetadata): any {
    if (!metadata) return undefined;
    return LogSanitizer.sanitizeMetadata(metadata, this.config.security);
  }

  /**
   * エラーログ
   */
  public error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.winstonLogger.error(message, {
      error: error?.stack || error?.message,
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  /**
   * 警告ログ
   */
  public warn(message: string, metadata?: LogMetadata): void {
    this.winstonLogger.warn(message, {
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  /**
   * 情報ログ
   */
  public info(message: string, metadata?: LogMetadata): void {
    this.winstonLogger.info(message, {
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  /**
   * デバッグログ
   */
  public debug(message: string, metadata?: LogMetadata): void {
    this.winstonLogger.debug(message, {
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  /**
   * 監査ログ
   */
  public audit(action: string, userId: string, resource: string, ip: string, details?: any): void {
    this.winstonLogger.info('Audit Log', {
      userId,
      action,
      resource,
      ip,
      details: this.sanitizeMetadata(details)
    });
  }

  /**
   * ログレベル変更
   */
  public setLevel(level: LogLevel): void {
    this.winstonLogger.level = level;
  }

  /**
   * Winston Loggerインスタンス取得（高度な操作用）
   */
  public getWinstonLogger(): WinstonLogger {
    return this.winstonLogger;
  }
}

/**
 * RequestLoggerミドルウェアオプション
 */
export interface RequestLoggerOptions {
  includeBody: boolean;
  includeHeaders: boolean;
  excludeHeaderPatterns: RegExp[];
  maxBodySize: number;
  skipSuccessfulRequests: boolean;
}

/**
 * HTTPリクエストログミドルウェア
 */
export const requestLogger = (options: Partial<RequestLoggerOptions> = {}) => {
  const config: RequestLoggerOptions = {
    includeBody: false,
    includeHeaders: true,
    excludeHeaderPatterns: [/authorization/i, /cookie/i],
    maxBodySize: 1000,
    skipSuccessfulRequests: false,
    ...options
  };

  const sanitizeHeaders = (headers: any, excludePatterns: RegExp[]): any => {
    const sanitized = { ...headers };
    
    Object.keys(sanitized).forEach(key => {
      if (excludePatterns.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  };

  return (req: Request, res: Response, next: NextFunction): void => {
    const requestId = uuidv4();
    const startTime = Date.now();
    
    // Add request ID to request object
    (req as any).requestId = requestId;

    const logger = Logger.getInstance();

    // Log incoming request
    const requestMetadata: LogMetadata = {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown',
      userId: (req as any).user?.id
    };

    if (config.includeHeaders) {
      requestMetadata.headers = sanitizeHeaders(req.headers, config.excludeHeaderPatterns);
    }

    if (config.includeBody && req.body) {
      const bodyString = JSON.stringify(req.body);
      if (bodyString.length <= config.maxBodySize) {
        requestMetadata.body = req.body;
      } else {
        requestMetadata.body = '[Body too large to log]';
      }
    }

    logger.info(`Incoming ${req.method} ${req.url}`, requestMetadata);

    // Override res.end to log response
    const originalEnd = res.end.bind(res);
    res.end = function(chunk?: any, encoding?: any, cb?: any) {
      const duration = Date.now() - startTime;
      const responseMetadata: LogMetadata = {
        requestId,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        contentLength: res.get('content-length')
      };

      if (!config.skipSuccessfulRequests || res.statusCode >= 400) {
        if (res.statusCode >= 400) {
          logger.warn(`Request completed with error`, responseMetadata);
        } else {
          logger.info(`Request completed successfully`, responseMetadata);
        }
      }

      return originalEnd(chunk, encoding, cb);
    } as any;

    next();
  };
};

/**
 * デフォルトLoggerインスタンス作成・エクスポート
 */
export const logger = Logger.getInstance();

/**
 * Logger設定リセット（テスト用）
 */
export const resetLogger = (): void => {
  (Logger as any).instance = null;
}; 