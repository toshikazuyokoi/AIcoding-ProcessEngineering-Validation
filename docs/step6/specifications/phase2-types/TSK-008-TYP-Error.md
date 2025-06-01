# TSK-008-TYP-Error Issue仕様書

## 概要
**タスクID**: TSK-008-TYP-Error  
**ファイル**: src/types/error.ts  
**複雑度**: 中  
**見積時間**: 2.5時間  
**優先度**: 🥇最重要（エラーハンドリング・例外管理）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/error.ts`
- **型定義**: アプリケーションエラー型・エラーコード・エラーレスポンス型
- **レイヤー**: Types（型定義層）
- **責任範囲**: エラー分類・エラー情報構造・エラーハンドリング統一

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core
- 参照設計書: `docs/step3/detailed-design/error-handling.md`
- 技術スタック: TypeScript, HTTP Status Codes

### エラー型システム設計

#### 1. Base Error Types
```typescript
import { Brand } from './core.js';

export type ErrorCode = Brand<string, 'ErrorCode'>;
export type ErrorMessage = Brand<string, 'ErrorMessage'>;
export type ErrorStack = Brand<string, 'ErrorStack'>;

export interface BaseError {
  readonly code: ErrorCode;
  readonly message: ErrorMessage;
  readonly timestamp: Date;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly context?: Record<string, unknown>;
}

export abstract class ApplicationError extends Error implements BaseError {
  public readonly code: ErrorCode;
  public readonly timestamp: Date;
  public readonly correlationId?: string;
  public readonly userId?: string;
  public readonly context?: Record<string, unknown>;

  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.timestamp = new Date();
    this.correlationId = options?.correlationId;
    this.userId = options?.userId;
    this.context = options?.context;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON(): ErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message as ErrorMessage,
        timestamp: this.timestamp.toISOString(),
        correlationId: this.correlationId,
        context: this.sanitizeContext()
      }
    };
  }

  private sanitizeContext(): Record<string, unknown> | undefined {
    if (!this.context) return undefined;
    
    // Remove sensitive information
    const sanitized = { ...this.context };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.secret;
    
    return sanitized;
  }

  public abstract getHttpStatusCode(): number;
  public abstract getLogLevel(): LogLevel;
}

export interface ErrorOptions {
  correlationId?: string;
  userId?: string;
  context?: Record<string, unknown>;
  cause?: Error;
}

export type LogLevel = 'error' | 'warn' | 'info' | 'debug';
```

#### 2. Domain-Specific Error Classes
```typescript
// User-related errors
export class UserError extends ApplicationError {
  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ) {
    super(code, message, options);
  }

  public getHttpStatusCode(): number {
    switch (this.code) {
      case 'USER_NOT_FOUND':
        return 404;
      case 'USER_ALREADY_EXISTS':
        return 409;
      case 'INVALID_CREDENTIALS':
        return 401;
      case 'INSUFFICIENT_PERMISSIONS':
        return 403;
      case 'ACCOUNT_LOCKED':
        return 423;
      default:
        return 400;
    }
  }

  public getLogLevel(): LogLevel {
    switch (this.code) {
      case 'INVALID_CREDENTIALS':
      case 'INSUFFICIENT_PERMISSIONS':
        return 'warn';
      case 'USER_NOT_FOUND':
        return 'info';
      default:
        return 'error';
    }
  }
}

// Task-related errors
export class TaskError extends ApplicationError {
  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ) {
    super(code, message, options);
  }

  public getHttpStatusCode(): number {
    switch (this.code) {
      case 'TASK_NOT_FOUND':
        return 404;
      case 'TASK_ACCESS_DENIED':
        return 403;
      case 'INVALID_TASK_STATUS':
        return 400;
      case 'TASK_DEADLINE_PASSED':
        return 422;
      default:
        return 400;
    }
  }

  public getLogLevel(): LogLevel {
    switch (this.code) {
      case 'TASK_ACCESS_DENIED':
        return 'warn';
      case 'TASK_NOT_FOUND':
        return 'info';
      default:
        return 'error';
    }
  }
}

// Database-related errors
export class DatabaseError extends ApplicationError {
  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ) {
    super(code, message, options);
  }

  public getHttpStatusCode(): number {
    switch (this.code) {
      case 'CONNECTION_FAILED':
      case 'QUERY_TIMEOUT':
      case 'TRANSACTION_FAILED':
        return 503;
      case 'CONSTRAINT_VIOLATION':
      case 'DUPLICATE_KEY':
        return 409;
      case 'FOREIGN_KEY_VIOLATION':
        return 422;
      default:
        return 500;
    }
  }

  public getLogLevel(): LogLevel {
    return 'error'; // All database errors are serious
  }
}

// Validation-related errors
export class ValidationError extends ApplicationError {
  public readonly field?: string;
  public readonly value?: unknown;

  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    field?: string,
    value?: unknown,
    options?: ErrorOptions
  ) {
    super(code, message, options);
    this.field = field;
    this.value = value;
  }

  public getHttpStatusCode(): number {
    return 400;
  }

  public getLogLevel(): LogLevel {
    return 'info'; // Validation errors are usually client-side issues
  }

  public toJSON(): ValidationErrorResponse {
    return {
      error: {
        code: this.code,
        message: this.message as ErrorMessage,
        field: this.field,
        value: this.field ? '[REDACTED]' : undefined, // Don't expose actual values
        timestamp: this.timestamp.toISOString(),
        correlationId: this.correlationId
      }
    };
  }
}

// Authentication & Authorization errors
export class AuthError extends ApplicationError {
  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ) {
    super(code, message, options);
  }

  public getHttpStatusCode(): number {
    switch (this.code) {
      case 'TOKEN_EXPIRED':
      case 'TOKEN_INVALID':
      case 'NO_TOKEN':
        return 401;
      case 'INSUFFICIENT_PERMISSIONS':
      case 'RESOURCE_ACCESS_DENIED':
        return 403;
      case 'RATE_LIMIT_EXCEEDED':
        return 429;
      default:
        return 401;
    }
  }

  public getLogLevel(): LogLevel {
    switch (this.code) {
      case 'RATE_LIMIT_EXCEEDED':
        return 'warn';
      case 'TOKEN_EXPIRED':
        return 'info';
      default:
        return 'warn';
    }
  }
}

// System & Infrastructure errors
export class SystemError extends ApplicationError {
  constructor(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ) {
    super(code, message, options);
  }

  public getHttpStatusCode(): number {
    switch (this.code) {
      case 'SERVICE_UNAVAILABLE':
      case 'MAINTENANCE_MODE':
        return 503;
      case 'RATE_LIMIT_EXCEEDED':
        return 429;
      case 'PAYLOAD_TOO_LARGE':
        return 413;
      case 'TIMEOUT':
        return 408;
      default:
        return 500;
    }
  }

  public getLogLevel(): LogLevel {
    return 'error'; // All system errors are serious
  }
}
```

#### 3. Error Response Types
```typescript
export interface ErrorResponse {
  error: {
    code: ErrorCode;
    message: ErrorMessage;
    timestamp: string;
    correlationId?: string;
    context?: Record<string, unknown>;
  };
}

export interface ValidationErrorResponse {
  error: {
    code: ErrorCode;
    message: ErrorMessage;
    field?: string;
    value?: unknown;
    timestamp: string;
    correlationId?: string;
  };
}

export interface MultipleErrorsResponse {
  errors: Array<{
    code: ErrorCode;
    message: ErrorMessage;
    field?: string;
    timestamp: string;
  }>;
  correlationId?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ErrorResponse['error'];
  requestId?: string;
}
```

#### 4. Error Code Constants
```typescript
export const ErrorCodes = {
  // User errors
  USER_NOT_FOUND: 'USER_NOT_FOUND' as ErrorCode,
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS' as ErrorCode,
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS' as ErrorCode,
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS' as ErrorCode,
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED' as ErrorCode,
  ACCOUNT_DISABLED: 'ACCOUNT_DISABLED' as ErrorCode,

  // Task errors
  TASK_NOT_FOUND: 'TASK_NOT_FOUND' as ErrorCode,
  TASK_ACCESS_DENIED: 'TASK_ACCESS_DENIED' as ErrorCode,
  INVALID_TASK_STATUS: 'INVALID_TASK_STATUS' as ErrorCode,
  TASK_DEADLINE_PASSED: 'TASK_DEADLINE_PASSED' as ErrorCode,
  TASK_LIMIT_EXCEEDED: 'TASK_LIMIT_EXCEEDED' as ErrorCode,

  // Database errors
  CONNECTION_FAILED: 'CONNECTION_FAILED' as ErrorCode,
  QUERY_TIMEOUT: 'QUERY_TIMEOUT' as ErrorCode,
  TRANSACTION_FAILED: 'TRANSACTION_FAILED' as ErrorCode,
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION' as ErrorCode,
  DUPLICATE_KEY: 'DUPLICATE_KEY' as ErrorCode,
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION' as ErrorCode,

  // Validation errors
  VALIDATION_FAILED: 'VALIDATION_FAILED' as ErrorCode,
  INVALID_INPUT: 'INVALID_INPUT' as ErrorCode,
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD' as ErrorCode,
  INVALID_FORMAT: 'INVALID_FORMAT' as ErrorCode,
  VALUE_OUT_OF_RANGE: 'VALUE_OUT_OF_RANGE' as ErrorCode,

  // Authentication & Authorization errors
  TOKEN_EXPIRED: 'TOKEN_EXPIRED' as ErrorCode,
  TOKEN_INVALID: 'TOKEN_INVALID' as ErrorCode,
  NO_TOKEN: 'NO_TOKEN' as ErrorCode,
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED' as ErrorCode,
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED' as ErrorCode,

  // System errors
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR' as ErrorCode,
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE' as ErrorCode,
  MAINTENANCE_MODE: 'MAINTENANCE_MODE' as ErrorCode,
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE' as ErrorCode,
  TIMEOUT: 'TIMEOUT' as ErrorCode,
  CONFIGURATION_ERROR: 'CONFIGURATION_ERROR' as ErrorCode
} as const;

export type ErrorCodeType = typeof ErrorCodes[keyof typeof ErrorCodes];
```

#### 5. Error Factory & Utilities
```typescript
export class ErrorFactory {
  public static createUserError(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ): UserError {
    return new UserError(code, message, options);
  }

  public static createTaskError(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ): TaskError {
    return new TaskError(code, message, options);
  }

  public static createDatabaseError(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ): DatabaseError {
    return new DatabaseError(code, message, options);
  }

  public static createValidationError(
    code: ErrorCode,
    message: ErrorMessage,
    field?: string,
    value?: unknown,
    options?: ErrorOptions
  ): ValidationError {
    return new ValidationError(code, message, field, value, options);
  }

  public static createAuthError(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ): AuthError {
    return new AuthError(code, message, options);
  }

  public static createSystemError(
    code: ErrorCode,
    message: ErrorMessage,
    options?: ErrorOptions
  ): SystemError {
    return new SystemError(code, message, options);
  }

  public static fromUnknownError(
    error: unknown,
    correlationId?: string
  ): ApplicationError {
    if (error instanceof ApplicationError) {
      return error;
    }

    if (error instanceof Error) {
      return new SystemError(
        ErrorCodes.INTERNAL_SERVER_ERROR,
        error.message as ErrorMessage,
        { correlationId, cause: error }
      );
    }

    return new SystemError(
      ErrorCodes.INTERNAL_SERVER_ERROR,
      'An unknown error occurred' as ErrorMessage,
      { correlationId, context: { originalError: String(error) } }
    );
  }
}

export const isApplicationError = (error: unknown): error is ApplicationError => {
  return error instanceof ApplicationError;
};

export const isUserError = (error: unknown): error is UserError => {
  return error instanceof UserError;
};

export const isTaskError = (error: unknown): error is TaskError => {
  return error instanceof TaskError;
};

export const isDatabaseError = (error: unknown): error is DatabaseError => {
  return error instanceof DatabaseError;
};

export const isValidationError = (error: unknown): error is ValidationError => {
  return error instanceof ValidationError;
};

export const isAuthError = (error: unknown): error is AuthError => {
  return error instanceof AuthError;
};

export const isSystemError = (error: unknown): error is SystemError => {
  return error instanceof SystemError;
};
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] エラーハンドリング戦略・エラー分類理解
  - [ ] HTTPステータスコード・エラーレスポンス仕様
  - [ ] ログレベル・監視要件・アラート戦略
  - [ ] セキュリティ要件・エラー情報漏洩対策
  - [ ] 国際化・多言語エラーメッセージ要件
- [ ] 2. コーディング
  - [ ] Base Error Types実装
    - [ ] ApplicationError基底クラス
    - [ ] ErrorCode・ErrorMessage型定義
    - [ ] エラーオプション・コンテキスト管理
  - [ ] Domain-Specific Errors実装
    - [ ] User・Task・Database・Validation・Auth・System エラー
    - [ ] 各エラーのHTTPステータス・ログレベル設定
    - [ ] エラー固有プロパティ・メソッド実装
  - [ ] Error Response Types実装
    - [ ] API レスポンス形式統一
    - [ ] バリデーションエラー・複数エラー対応
    - [ ] セキュリティ考慮・機密情報マスキング
  - [ ] Error Factory & Utilities実装
    - [ ] エラー生成ファクトリー
    - [ ] 型ガード・判定ユーティリティ
    - [ ] 未知エラー変換・ラッピング機能
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 各エラータイプの生成・変換・シリアライズ
    - [ ] HTTPステータス・ログレベル正確性
    - [ ] エラーファクトリー・ユーティリティ動作
  - [ ] 異常系テスト
    - [ ] 不正エラーコード・メッセージ処理
    - [ ] 循環参照・深いネスト・メモリリーク
    - [ ] 大量エラー・スタックオーバーフロー
  - [ ] セキュリティテスト
    - [ ] 機密情報マスキング・サニタイゼーション
    - [ ] エラー情報漏洩・攻撃者情報収集防止
    - [ ] ログインジェクション・XSS対策
  - [ ] 統合テスト
    - [ ] 他システム連携・エラー伝播
    - [ ] ログ出力・監視システム連携
- [ ] 4. 単体テスト実行
  - [ ] 全エラークラス・ユーティリティテスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] セキュリティ・情報漏洩テスト
  - [ ] パフォーマンス・メモリ使用量確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#008): エラーハンドリング型システム実装
  - [ ] セキュリティ強化・情報保護機能
  - [ ] ドキュメント・エラーコード一覧更新
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] 品質・セキュリティ基準達成確認
  - [ ] 他システムとの整合性確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] セキュリティレビュー・監査完了
  - [ ] 運用チーム・監視設定連携

## テスト要件
- [ ] 正常系テスト：全エラータイプ生成・変換・レスポンス形式確認
- [ ] 異常系テスト：不正入力・メモリリーク・パフォーマンス限界
- [ ] セキュリティテスト：機密情報保護・情報漏洩防止・ログインジェクション対策
- [ ] 統合テスト：他システム連携・ログ出力・監視システム統合
- [ ] ユーザビリティテスト：エラーメッセージ品質・国際化・アクセシビリティ

## 完了条件
- [ ] 全エラータイプ・レスポンス型実装完了
- [ ] エラーファクトリー・ユーティリティ実装完了
- [ ] セキュリティ機能・情報保護機能実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] セキュリティテスト100%通過
- [ ] TypeScript厳密モード エラー0件
- [ ] ESLint・型安全性チェック合格

## 関連情報
- **設計書**: `docs/step3/detailed-design/error-handling.md`
- **依存タスク**: TSK-007 (コア型定義)
- **後続タスク**: 全レイヤー（エラーハンドリング利用）
- **HTTP仕様**: RFC 7231, HTTP Status Codes
- **セキュリティ**: OWASP, 情報漏洩防止, ログセキュリティ

## 備考
- セキュリティファースト・情報漏洩防止最優先
- 本番環境での監視・アラート連携重要
- 開発者体験・デバッグ効率性考慮
- 国際化・多言語対応・アクセシビリティ準拠
- 継続的改善・エラー分析・品質向上 