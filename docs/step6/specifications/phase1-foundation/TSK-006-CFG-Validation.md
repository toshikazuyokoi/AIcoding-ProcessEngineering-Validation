# TSK-006-CFG-Validation Issue仕様書

## 概要
**タスクID**: TSK-006-CFG-Validation  
**ファイル**: src/config/validation.ts  
**複雑度**: 中  
**見積時間**: 3時間  
**優先度**: 🥇最重要（入力検証・セキュリティ基盤）  
**フェーズ**: Phase 1: データベース・設定基盤構築  

## 実装対象
- **ファイル**: `src/config/validation.ts`
- **クラス**: ValidationSchema・CustomValidators・ValidationError・ValidationMiddleware
- **レイヤー**: Configuration（設定・バリデーション層）
- **責任範囲**: 入力検証・データ整合性・セキュリティ検証・エラーレポート

## 実装仕様

### 前提条件
- 依存タスク: TSK-001-CFG-Environment, TSK-007-TYP-Core（型定義）
- 参照設計書: `docs/step3/detailed-design/validation-design.md`
- 技術スタック: Joi, Zod, TypeScript, Express

### バリデーション システム設計

#### 1. Core Validation Framework
```typescript
import Joi from 'joi';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Result, Ok, Err } from '../types/core.js';

export class ValidationFramework {
  private static instance: ValidationFramework;
  private schemas: Map<string, ValidationSchema> = new Map();
  private customValidators: Map<string, CustomValidator> = new Map();

  private constructor() {
    this.registerDefaultValidators();
  }

  public static getInstance(): ValidationFramework {
    if (!ValidationFramework.instance) {
      ValidationFramework.instance = new ValidationFramework();
    }
    return ValidationFramework.instance;
  }

  public registerSchema(name: string, schema: ValidationSchema): void {
    this.schemas.set(name, schema);
  }

  public getSchema(name: string): ValidationSchema | undefined {
    return this.schemas.get(name);
  }

  public registerCustomValidator(name: string, validator: CustomValidator): void {
    this.customValidators.set(name, validator);
  }

  public validate<T>(
    data: unknown, 
    schemaName: string
  ): Result<T, ValidationError[]> {
    const schema = this.schemas.get(schemaName);
    if (!schema) {
      return Err([new ValidationError(`Schema '${schemaName}' not found`, 'SCHEMA_NOT_FOUND')]);
    }

    return schema.validate(data);
  }

  public validateWithCustomSchema<T>(
    data: unknown,
    customSchema: ValidationSchema
  ): Result<T, ValidationError[]> {
    return customSchema.validate(data);
  }

  private registerDefaultValidators(): void {
    this.registerCustomValidator('strongPassword', new StrongPasswordValidator());
    this.registerCustomValidator('emailDomain', new EmailDomainValidator());
    this.registerCustomValidator('sqlInjection', new SqlInjectionValidator());
    this.registerCustomValidator('xssContent', new XssContentValidator());
    this.registerCustomValidator('fileUpload', new FileUploadValidator());
  }
}
```

#### 2. Validation Schemas
```typescript
export abstract class ValidationSchema {
  abstract validate<T>(data: unknown): Result<T, ValidationError[]>;
  abstract getDescription(): string;
}

export class JoiValidationSchema extends ValidationSchema {
  constructor(
    private schema: Joi.Schema,
    private options: Joi.ValidationOptions = {}
  ) {
    super();
  }

  validate<T>(data: unknown): Result<T, ValidationError[]> {
    const result = this.schema.validate(data, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
      ...this.options
    });

    if (result.error) {
      const errors = result.error.details.map(detail => 
        new ValidationError(
          detail.message,
          detail.type,
          detail.path.join('.'),
          detail.context?.value
        )
      );
      return Err(errors);
    }

    return Ok(result.value as T);
  }

  getDescription(): string {
    return this.schema.describe().toString();
  }
}

export class ZodValidationSchema extends ValidationSchema {
  constructor(private schema: z.ZodSchema) {
    super();
  }

  validate<T>(data: unknown): Result<T, ValidationError[]> {
    const result = this.schema.safeParse(data);

    if (!result.success) {
      const errors = result.error.issues.map(issue =>
        new ValidationError(
          issue.message,
          issue.code,
          issue.path.join('.'),
          'data' in issue ? issue.data : undefined
        )
      );
      return Err(errors);
    }

    return Ok(result.data as T);
  }

  getDescription(): string {
    return JSON.stringify(this.schema.describe(), null, 2);
  }
}
```

#### 3. Custom Validators
```typescript
export abstract class CustomValidator {
  abstract validate(value: any): Result<boolean, string>;
  abstract getName(): string;
  abstract getDescription(): string;
}

export class StrongPasswordValidator extends CustomValidator {
  private readonly minLength = 8;
  private readonly requirements = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    digit: /\d/,
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/
  };

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Err('Password must be a string');
    }

    if (value.length < this.minLength) {
      return Err(`Password must be at least ${this.minLength} characters long`);
    }

    const missingRequirements: string[] = [];
    
    if (!this.requirements.uppercase.test(value)) {
      missingRequirements.push('uppercase letter');
    }
    if (!this.requirements.lowercase.test(value)) {
      missingRequirements.push('lowercase letter');
    }
    if (!this.requirements.digit.test(value)) {
      missingRequirements.push('digit');
    }
    if (!this.requirements.special.test(value)) {
      missingRequirements.push('special character');
    }

    if (missingRequirements.length > 0) {
      return Err(`Password must contain: ${missingRequirements.join(', ')}`);
    }

    return Ok(true);
  }

  getName(): string {
    return 'strongPassword';
  }

  getDescription(): string {
    return 'Validates password strength (8+ chars, uppercase, lowercase, digit, special char)';
  }
}

export class SqlInjectionValidator extends CustomValidator {
  private readonly suspiciousPatterns = [
    /(\bor\b|\band\b)\s*[\d\w]*\s*=\s*[\d\w]*/i,
    /union\s+select/i,
    /insert\s+into/i,
    /update\s+set/i,
    /delete\s+from/i,
    /drop\s+(table|database)/i,
    /exec\s*\(/i,
    /script\s*>/i,
    /javascript:/i
  ];

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Ok(true); // Only validate strings
    }

    for (const pattern of this.suspiciousPatterns) {
      if (pattern.test(value)) {
        return Err('Input contains potentially malicious content');
      }
    }

    return Ok(true);
  }

  getName(): string {
    return 'sqlInjection';
  }

  getDescription(): string {
    return 'Validates input for potential SQL injection attacks';
  }
}

export class XssContentValidator extends CustomValidator {
  private readonly xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^>]*>/gi,
    /<link\b[^>]*>/gi
  ];

  validate(value: any): Result<boolean, string> {
    if (typeof value !== 'string') {
      return Ok(true);
    }

    for (const pattern of this.xssPatterns) {
      if (pattern.test(value)) {
        return Err('Input contains potentially malicious HTML/JavaScript content');
      }
    }

    return Ok(true);
  }

  getName(): string {
    return 'xssContent';
  }

  getDescription(): string {
    return 'Validates input for potential XSS attacks';
  }
}
```

#### 4. Predefined Schemas
```typescript
export class ValidationSchemas {
  public static readonly USER_REGISTRATION = new JoiValidationSchema(
    Joi.object({
      name: Joi.string()
        .min(2)
        .max(50)
        .pattern(/^[a-zA-Z\s]+$/)
        .required()
        .messages({
          'string.min': 'Name must be at least 2 characters long',
          'string.max': 'Name must not exceed 50 characters',
          'string.pattern.base': 'Name can only contain letters and spaces'
        }),
      
      email: Joi.string()
        .email({ minDomainSegments: 2 })
        .max(100)
        .required()
        .messages({
          'string.email': 'Please provide a valid email address',
          'string.max': 'Email must not exceed 100 characters'
        }),
      
      password: Joi.string()
        .custom((value, helpers) => {
          const validator = new StrongPasswordValidator();
          const result = validator.validate(value);
          if (!result.success) {
            return helpers.error('password.weak', { message: result.error });
          }
          return value;
        })
        .required()
        .messages({
          'password.weak': '{{#message}}'
        })
    })
  );

  public static readonly USER_LOGIN = new JoiValidationSchema(
    Joi.object({
      email: Joi.string()
        .email()
        .required()
        .messages({
          'string.email': 'Please provide a valid email address'
        }),
      
      password: Joi.string()
        .min(1)
        .required()
        .messages({
          'string.min': 'Password is required'
        })
    })
  );

  public static readonly TASK_CREATION = new JoiValidationSchema(
    Joi.object({
      title: Joi.string()
        .min(1)
        .max(200)
        .custom((value, helpers) => {
          const validator = new XssContentValidator();
          const result = validator.validate(value);
          if (!result.success) {
            return helpers.error('string.xss');
          }
          return value;
        })
        .required()
        .messages({
          'string.min': 'Title is required',
          'string.max': 'Title must not exceed 200 characters',
          'string.xss': 'Title contains invalid characters'
        }),
      
      description: Joi.string()
        .max(1000)
        .custom((value, helpers) => {
          const validator = new XssContentValidator();
          const result = validator.validate(value);
          if (!result.success) {
            return helpers.error('string.xss');
          }
          return value;
        })
        .optional()
        .messages({
          'string.max': 'Description must not exceed 1000 characters',
          'string.xss': 'Description contains invalid characters'
        }),
      
      priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .default('medium')
        .messages({
          'any.only': 'Priority must be one of: low, medium, high, urgent'
        }),
      
      dueDate: Joi.date()
        .iso()
        .min('now')
        .optional()
        .messages({
          'date.min': 'Due date must be in the future'
        })
    })
  );

  public static readonly TASK_UPDATE = new JoiValidationSchema(
    Joi.object({
      title: Joi.string().min(1).max(200).optional(),
      description: Joi.string().max(1000).optional(),
      status: Joi.string()
        .valid('pending', 'in_progress', 'completed', 'cancelled', 'on_hold')
        .optional(),
      priority: Joi.string()
        .valid('low', 'medium', 'high', 'urgent')
        .optional(),
      dueDate: Joi.date().iso().optional()
    }).min(1)
  );

  public static readonly TASK_SEARCH = new JoiValidationSchema(
    Joi.object({
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10),
      status: Joi.array()
        .items(Joi.string().valid('pending', 'in_progress', 'completed', 'cancelled', 'on_hold'))
        .optional(),
      priority: Joi.array()
        .items(Joi.string().valid('low', 'medium', 'high', 'urgent'))
        .optional(),
      searchText: Joi.string().max(100).optional(),
      sortBy: Joi.string()
        .valid('createdAt', 'updatedAt', 'dueDate', 'priority', 'title')
        .default('createdAt'),
      sortOrder: Joi.string().valid('asc', 'desc').default('desc')
    })
  );
}
```

#### 5. Express Middleware
```typescript
export class ValidationMiddleware {
  public static validateBody(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const framework = ValidationFramework.getInstance();
      const result = framework.validate(req.body, schemaName);

      if (!result.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.body = result.data;
      next();
    };
  }

  public static validateQuery(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const framework = ValidationFramework.getInstance();
      const result = framework.validate(req.query, schemaName);

      if (!result.success) {
        res.status(400).json({
          error: 'Query validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.query = result.data as any;
      next();
    };
  }

  public static validateParams(schemaName: string) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const framework = ValidationFramework.getInstance();
      const result = framework.validate(req.params, schemaName);

      if (!result.success) {
        res.status(400).json({
          error: 'Parameter validation failed',
          details: result.error.map(err => ({
            field: err.path,
            message: err.message,
            code: err.code
          }))
        });
        return;
      }

      req.params = result.data;
      next();
    };
  }
}

export class ValidationError {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly path?: string,
    public readonly value?: any
  ) {}

  toString(): string {
    return `ValidationError: ${this.message} (${this.code}) at path: ${this.path}`;
  }
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] バリデーション戦略・セキュリティ要件確認
  - [ ] 入力検証パターン・カスタマイズ可能性
  - [ ] パフォーマンス要件・大量データ処理
  - [ ] エラーハンドリング・ユーザビリティ
  - [ ] 国際化・多言語対応要件
- [ ] 2. コーディング
  - [ ] ValidationFramework Core実装
    - [ ] スキーマ管理・登録システム
    - [ ] カスタムバリデーター機能
    - [ ] エラー収集・レポート機能
  - [ ] Validation Schemas実装
    - [ ] Joi・Zod統合アダプター
    - [ ] 型安全性・TypeScript連携
    - [ ] スキーマ記述・ドキュメント生成
  - [ ] Custom Validators実装
    - [ ] セキュリティ検証（SQL Injection・XSS）
    - [ ] ビジネスルール検証（パスワード強度等）
    - [ ] パフォーマンス最適化・キャッシュ
  - [ ] Express Middleware実装
    - [ ] Body・Query・Params検証
    - [ ] エラーレスポンス・国際化
    - [ ] ログ出力・監査証跡
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全スキーマでの有効データ検証
    - [ ] カスタムバリデーター正常動作
    - [ ] ミドルウェア統合・リクエスト処理
  - [ ] 異常系テスト
    - [ ] 無効データ・境界値・null/undefined
    - [ ] セキュリティ攻撃パターン（XSS・SQLi）
    - [ ] 大量データ・メモリ不足・タイムアウト
  - [ ] セキュリティテスト
    - [ ] 入力サニタイゼーション・エスケープ
    - [ ] バイパス攻撃・エンコーディング攻撃
    - [ ] 権限昇格・データ漏洩防止
  - [ ] パフォーマンステスト
    - [ ] 大量バリデーション・同時リクエスト
    - [ ] メモリ使用量・CPU負荷測定
    - [ ] レスポンス時間・スループット
- [ ] 4. 単体テスト実行
  - [ ] 全バリデーター・スキーマテスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] セキュリティ検証・脆弱性テスト
  - [ ] パフォーマンス・メモリリーク確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#006): バリデーションシステム実装
  - [ ] セキュリティ強化・入力検証機能
  - [ ] ドキュメント・使用例・ガイド更新
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] 品質基準・セキュリティ基準達成
  - [ ] 他コンポーネントとの統合確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] セキュリティ監査・レビュー完了
  - [ ] 運用ガイド・トラブルシューティング

## テスト要件
- [ ] 正常系テスト：全スキーマ・バリデーター正常動作確認
- [ ] 異常系テスト：無効データ・攻撃パターン・境界値処理
- [ ] セキュリティテスト：XSS・SQLインジェクション・入力検証バイパス
- [ ] パフォーマンステスト：大量データ・同時リクエスト・レスポンス時間
- [ ] 統合テスト：Express統合・他ミドルウェア連携・エンドツーエンド
- [ ] ユーザビリティテスト：エラーメッセージ・国際化・アクセシビリティ

## 完了条件
- [ ] ValidationFramework・CustomValidators実装完了
- [ ] 全スキーマ定義・Express Middleware実装完了
- [ ] セキュリティ検証機能・攻撃対策実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] セキュリティテスト100%通過
- [ ] パフォーマンス要件達成（1000req/sec処理可能）
- [ ] TypeScript厳密モード エラー0件
- [ ] セキュリティ監査・脆弱性スキャン合格

## 関連情報
- **設計書**: `docs/step3/detailed-design/validation-design.md`
- **依存タスク**: TSK-001 (環境変数), TSK-007 (型定義)
- **後続タスク**: 全Controller・Middleware（入力検証利用）
- **技術**: Joi, Zod, Express, TypeScript
- **セキュリティ**: OWASP Top 10対策, 入力検証, サニタイゼーション

## 備考
- セキュリティファースト設計・OWASP準拠
- 本番環境での高性能・低遅延要件対応
- 開発効率・保守性を重視したAPI設計
- 段階的セキュリティ強化・継続的改善対応
- 国際化・多言語対応・アクセシビリティ考慮 