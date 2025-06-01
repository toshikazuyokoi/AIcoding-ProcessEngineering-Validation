# TSK-005-CFG-Logger Issue仕様書

## 概要
**タスクID**: TSK-005-CFG-Logger  
**ファイル**: src/config/logger.ts  
**複雑度**: 中  
**見積時間**: 3時間  
**優先度**: 🥈高（ログ管理・運用監視基盤）  
**フェーズ**: Phase 1: データベース・設定基盤構築  

## 実装対象
- **ファイル**: `src/config/logger.ts`
- **クラス**: Logger・LoggerConfig・LogFormatter・LogTransport
- **レイヤー**: Configuration（設定・インフラ層）
- **責任範囲**: ログレベル管理・フォーマット・出力制御・ローテーション

## 実装仕様

### 前提条件
- 依存タスク: TSK-001-CFG-Environment
- 参照設計書: `docs/step3/detailed-design/logging-design.md`
- 技術スタック: Winston, TypeScript, Node.js

### ログ管理システム設計

#### 1. Logger Core クラス
```typescript
import winston, { Logger as WinstonLogger, LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export class Logger {
  private static instance: Logger;
  private winstonLogger: WinstonLogger;
  private config: LoggerConfig;

  private constructor(config: LoggerConfig) {
    this.config = config;
    this.winstonLogger = this.createWinstonLogger();
  }

  public static getInstance(config?: LoggerConfig): Logger {
    if (!Logger.instance) {
      if (!config) {
        throw new Error('Logger configuration required for first initialization');
      }
      Logger.instance = new Logger(config);
    }
    return Logger.instance;
  }

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
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
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
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
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
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: this.config.auditFile.maxSize,
        maxFiles: this.config.auditFile.maxFiles,
        level: 'info',
        format: this.createAuditFormat()
      }));
    }

    return transports;
  }

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

  // Logging Methods
  public error(message: string, error?: Error, metadata?: LogMetadata): void {
    this.winstonLogger.error(message, {
      error: error?.stack || error?.message,
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  public warn(message: string, metadata?: LogMetadata): void {
    this.winstonLogger.warn(message, {
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  public info(message: string, metadata?: LogMetadata): void {
    this.winstonLogger.info(message, {
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  public debug(message: string, metadata?: LogMetadata): void {
    this.winstonLogger.debug(message, {
      metadata: this.sanitizeMetadata(metadata)
    });
  }

  public audit(action: string, userId: string, resource: string, ip: string, details?: any): void {
    this.winstonLogger.info('Audit Log', {
      userId,
      action,
      resource,
      ip,
      details: this.sanitizeMetadata(details)
    });
  }
}
```

#### 2. Logger Configuration
```typescript
export interface LoggerConfig {
  level: LogLevel;
  silent: boolean;
  console: ConsoleConfig;
  file: FileConfig;
  errorFile: FileConfig;
  auditFile: FileConfig;
  security: SecurityConfig;
}

export interface ConsoleConfig {
  enabled: boolean;
  level: LogLevel;
  colorize: boolean;
}

export interface FileConfig {
  enabled: boolean;
  filename: string;
  level: LogLevel;
  maxSize: string;
  maxFiles: string;
  datePattern: string;
  zippedArchive: boolean;
}

export interface SecurityConfig {
  sanitizePasswords: boolean;
  sanitizeTokens: boolean;
  sanitizeCreditCards: boolean;
  maxMetadataSize: number;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug' | 'verbose' | 'silly';

export interface LogMetadata {
  [key: string]: any;
  userId?: string;
  sessionId?: string;
  requestId?: string;
  ip?: string;
  userAgent?: string;
  correlationId?: string;
}

export const createLoggerConfig = (): LoggerConfig => {
  const env = process.env.NODE_ENV || 'development';
  const logLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

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
```

#### 3. Request Logger Middleware
```typescript
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestLoggerOptions {
  includeBody: boolean;
  includeHeaders: boolean;
  excludeHeaderPatterns: RegExp[];
  maxBodySize: number;
  skipSuccessfulRequests: boolean;
}

export const requestLogger = (options: Partial<RequestLoggerOptions> = {}) => {
  const config: RequestLoggerOptions = {
    includeBody: false,
    includeHeaders: true,
    excludeHeaderPatterns: [/authorization/i, /cookie/i],
    maxBodySize: 1000,
    skipSuccessfulRequests: false,
    ...options
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
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id
    };

    if (config.includeHeaders) {
      requestMetadata.headers = this.sanitizeHeaders(req.headers, config.excludeHeaderPatterns);
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
    const originalEnd = res.end;
    res.end = function(chunk?: any, encoding?: any) {
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

      originalEnd.call(this, chunk, encoding);
    };

    next();
  };

  private sanitizeHeaders(headers: any, excludePatterns: RegExp[]): any {
    const sanitized = { ...headers };
    
    Object.keys(sanitized).forEach(key => {
      if (excludePatterns.some(pattern => pattern.test(key))) {
        sanitized[key] = '[REDACTED]';
      }
    });

    return sanitized;
  }
};
```

#### 4. Security Utilities
```typescript
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

  public static sanitizeMetadata(metadata: any, config: SecurityConfig): any {
    if (!metadata || typeof metadata !== 'object') {
      return metadata;
    }

    const sanitized = JSON.parse(JSON.stringify(metadata));
    
    this.sanitizePasswords(sanitized, config);
    this.sanitizeCreditCards(sanitized, config);
    this.truncateIfNeeded(sanitized, config);

    return sanitized;
  }

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

  private static sanitizeCreditCards(obj: any, config: SecurityConfig): void {
    if (!config.sanitizeCreditCards) return;

    const sanitizeString = (str: string): string => {
      return str.replace(this.CREDIT_CARD_PATTERN, 'XXXX-XXXX-XXXX-XXXX');
    };

    const traverse = (current: any): void => {
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
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] ログレベル戦略・運用ポリシー確認
  - [ ] セキュリティ要件・データ保護規則理解
  - [ ] パフォーマンス影響・非同期処理設計
  - [ ] ログローテーション・アーカイブ戦略
  - [ ] 監視・アラート連携要件確認
- [ ] 2. コーディング
  - [ ] Logger Core クラス実装
    - [ ] Winston設定・トランスポート管理
    - [ ] ログレベル・フォーマット制御
    - [ ] エラーハンドリング・例外処理
  - [ ] Configuration Management実装
    - [ ] 環境別設定・動的設定変更
    - [ ] 設定検証・デフォルト値管理
  - [ ] Security Utilities実装
    - [ ] 機密データサニタイズ・マスキング
    - [ ] PII保護・GDPR準拠処理
  - [ ] Request Logger Middleware実装
    - [ ] HTTP リクエスト/レスポンスログ
    - [ ] 相関ID・トレーサビリティ
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 各ログレベルでの出力確認
    - [ ] ファイルローテーション・アーカイブ
    - [ ] 設定変更・動的更新
  - [ ] 異常系テスト
    - [ ] ディスク容量不足・権限エラー
    - [ ] 不正設定・設定ファイル破損
    - [ ] 大量ログ・メモリ不足
  - [ ] セキュリティテスト
    - [ ] 機密データマスキング検証
    - [ ] ログインジェクション対策
    - [ ] アクセス制御・ファイル権限
  - [ ] パフォーマンステスト
    - [ ] 高負荷時のログ出力性能
    - [ ] 非同期処理・バッファリング
    - [ ] メモリ使用量・リソース管理
- [ ] 4. 単体テスト実行
  - [ ] 全メソッド・設定パターンテスト
  - [ ] カバレッジ90%以上達成確認
  - [ ] セキュリティ・サニタイズ機能検証
  - [ ] パフォーマンス・メモリリーク確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#005): ログ管理システム実装
  - [ ] 設定ファイル・環境変数更新
  - [ ] ドキュメント・運用手順更新
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] 品質基準達成確認
  - [ ] 他システムとの連携確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] 運用チームへの引き継ぎ
  - [ ] 監視設定・アラート設定

## テスト要件
- [ ] 正常系テスト：全ログレベル出力・ローテーション・アーカイブ
- [ ] 異常系テスト：ディスク不足・権限エラー・不正設定
- [ ] セキュリティテスト：機密データマスキング・ログインジェクション対策
- [ ] パフォーマンステスト：高負荷時性能・メモリ使用量・非同期処理
- [ ] 統合テスト：他システム連携・設定管理・監視システム連携
- [ ] 運用テスト：ログローテーション・バックアップ・復旧

## 完了条件
- [ ] Logger Core・Configuration・Middleware実装完了
- [ ] セキュリティ機能・データ保護機能実装完了
- [ ] パフォーマンス最適化・非同期処理実装完了
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] セキュリティ要件100%達成
- [ ] 運用テスト・負荷テスト合格
- [ ] TypeScript厳密モード エラー0件
- [ ] 運用ドキュメント・手順書完成

## 関連情報
- **設計書**: `docs/step3/detailed-design/logging-design.md`
- **依存タスク**: TSK-001 (環境変数設定)
- **後続タスク**: 全タスク（ログ出力機能利用）
- **技術**: Winston, DailyRotateFile, TypeScript
- **セキュリティ**: PII保護, GDPR準拠, ログインジェクション対策

## 備考
- 本番環境でのパフォーマンス最適化必須
- セキュリティ監査・コンプライアンス要件対応
- 運用チームとの連携・引き継ぎ重要
- ログ分析・監視システムとの連携準備
- 災害復旧・ログバックアップ戦略含む 