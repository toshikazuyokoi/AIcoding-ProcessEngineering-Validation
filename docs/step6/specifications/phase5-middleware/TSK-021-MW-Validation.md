# TSK-021-MW-Validation Issue仕様書

## 基本情報
**タスクID**: TSK-021-MW-Validation  
**タスク名**: バリデーションミドルウェア実装  
**関連ファイル**: `src/middleware/validation.ts`  
**担当者**: [TBD]  
**作成日**: 2025-01-31  
**優先度**: 高  
**見積時間**: 6時間  
**複雑度**: 中  

## Overview

### 概要
リクエストデータの包括的バリデーション機能を提供するミドルウェアの実装。Express.jsアプリケーションで使用されるAPIリクエストの型安全性、データ整合性、セキュリティを確保します。

### ビジネス価値
- **データ品質保証**: 不正なデータがシステムに入力されることを防止
- **セキュリティ強化**: インジェクション攻撃や不正データを検出・阻止
- **開発効率向上**: 型安全なバリデーションによる開発体験向上
- **ユーザー体験向上**: 明確なエラーメッセージによる適切なフィードバック

### 技術的位置づけ
- **アーキテクチャ層**: Middleware Layer
- **依存タスク**: TSK-013-TYP-Database, TSK-008-TYP-Error, TSK-010-TYP-Api
- **後続タスク**: TSK-023-SVC-TaskService, TSK-024-CTL-AppController
- **統合ポイント**: Express.js Router, Error Handling, Type System

## Implementation Specifications

### Core Requirements

#### 1. バリデーションエンジン
```typescript
// 主要インターフェース
interface ValidationRule<T = any> {
  field: keyof T;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object' | 'date';
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  enum?: readonly any[];
  custom?: (value: any) => boolean | string;
}

interface ValidationSchema<T = any> {
  body?: ValidationRule<T>[];
  query?: ValidationRule<T>[];
  params?: ValidationRule<T>[];
  headers?: ValidationRule<T>[];
}

interface ValidationError {
  field: string;
  message: string;
  value: any;
  rule: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  sanitizedData?: any;
}

// メインバリデーション関数
export const validateMiddleware = <T = any>(
  schema: ValidationSchema<T>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = validateRequest(req, schema);
    
    if (!result.isValid) {
      return res.status(400).json({
        error: 'Validation Failed',
        details: result.errors,
        timestamp: new Date().toISOString(),
        path: req.path
      });
    }
    
    // サニタイズされたデータを設定
    req.body = result.sanitizedData?.body || req.body;
    req.query = result.sanitizedData?.query || req.query;
    
    next();
  };
};
```

#### 2. スキーマ定義システム
```typescript
// ユーザー関連バリデーションスキーマ
export const UserValidationSchemas = {
  createUser: {
    body: [
      { field: 'username', type: 'string', required: true, min: 3, max: 50 },
      { field: 'email', type: 'string', required: true, pattern: EMAIL_REGEX },
      { field: 'password', type: 'string', required: true, min: 8, max: 100 },
      { field: 'displayName', type: 'string', required: false, max: 100 }
    ]
  } as ValidationSchema,
  
  updateUser: {
    params: [
      { field: 'id', type: 'string', required: true, pattern: UUID_REGEX }
    ],
    body: [
      { field: 'username', type: 'string', required: false, min: 3, max: 50 },
      { field: 'email', type: 'string', required: false, pattern: EMAIL_REGEX },
      { field: 'displayName', type: 'string', required: false, max: 100 }
    ]
  } as ValidationSchema,
  
  getUserById: {
    params: [
      { field: 'id', type: 'string', required: true, pattern: UUID_REGEX }
    ]
  } as ValidationSchema
};

// タスク関連バリデーションスキーマ
export const TaskValidationSchemas = {
  createTask: {
    body: [
      { field: 'title', type: 'string', required: true, min: 1, max: 200 },
      { field: 'description', type: 'string', required: false, max: 2000 },
      { field: 'status', type: 'string', required: false, enum: TASK_STATUSES },
      { field: 'priority', type: 'string', required: false, enum: TASK_PRIORITIES },
      { field: 'dueDate', type: 'date', required: false }
    ]
  } as ValidationSchema,
  
  updateTask: {
    params: [
      { field: 'id', type: 'string', required: true, pattern: UUID_REGEX }
    ],
    body: [
      { field: 'title', type: 'string', required: false, min: 1, max: 200 },
      { field: 'description', type: 'string', required: false, max: 2000 },
      { field: 'status', type: 'string', required: false, enum: TASK_STATUSES },
      { field: 'priority', type: 'string', required: false, enum: TASK_PRIORITIES },
      { field: 'dueDate', type: 'date', required: false }
    ]
  } as ValidationSchema,
  
  getTasksByUser: {
    params: [
      { field: 'userId', type: 'string', required: true, pattern: UUID_REGEX }
    ],
    query: [
      { field: 'status', type: 'string', required: false, enum: TASK_STATUSES },
      { field: 'priority', type: 'string', required: false, enum: TASK_PRIORITIES },
      { field: 'limit', type: 'number', required: false, min: 1, max: 100 },
      { field: 'offset', type: 'number', required: false, min: 0 }
    ]
  } as ValidationSchema
};
```

#### 3. カスタムバリデータ
```typescript
// セキュリティ関連バリデータ
export const SecurityValidators = {
  noSqlInjection: (value: string): boolean | string => {
    const sqlPatterns = [
      /union\s+select/i,
      /drop\s+table/i,
      /insert\s+into/i,
      /delete\s+from/i,
      /script\s*>/i
    ];
    
    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        return 'Potentially malicious input detected';
      }
    }
    return true;
  },
  
  noXss: (value: string): boolean | string => {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i
    ];
    
    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        return 'XSS pattern detected';
      }
    }
    return true;
  },
  
  strongPassword: (password: string): boolean | string => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain number';
    if (!/[!@#$%^&*]/.test(password)) return 'Password must contain special character';
    return true;
  }
};

// ビジネスロジックバリデータ
export const BusinessValidators = {
  validEmailDomain: (email: string): boolean | string => {
    const allowedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
    const domain = email.split('@')[1];
    return allowedDomains.includes(domain) || 'Email domain not allowed';
  },
  
  futureDate: (date: string): boolean | string => {
    const inputDate = new Date(date);
    const now = new Date();
    return inputDate > now || 'Date must be in the future';
  },
  
  businessHours: (time: string): boolean | string => {
    const hour = new Date(`1970-01-01T${time}`).getHours();
    return (hour >= 9 && hour < 17) || 'Time must be during business hours (9-17)';
  }
};
```

#### 4. エラーハンドリング・ロギング
```typescript
// バリデーションエラー詳細化
class ValidationError extends Error {
  public readonly field: string;
  public readonly value: any;
  public readonly rule: string;
  public readonly code: string;
  
  constructor(field: string, message: string, value: any, rule: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.value = value;
    this.rule = rule;
    this.code = 'VALIDATION_FAILED';
  }
}

// ロギング統合
const validationLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'validation-errors.log' })
  ]
});

// エラー報告機能
export const reportValidationFailure = (
  req: Request,
  errors: ValidationError[],
  metadata: { userId?: string; sessionId?: string }
) => {
  validationLogger.error('Validation failure', {
    path: req.path,
    method: req.method,
    errors: errors.map(e => ({
      field: e.field,
      rule: e.rule,
      message: e.message
    })),
    userAgent: req.get('User-Agent'),
    ip: req.ip,
    timestamp: new Date().toISOString(),
    ...metadata
  });
};
```

#### 5. パフォーマンス最適化
```typescript
// バリデーションキャッシュ
const validationCache = new Map<string, ValidationResult>();

export const getCacheKey = (req: Request, schema: ValidationSchema): string => {
  const data = {
    body: req.body,
    query: req.query,
    params: req.params
  };
  return `${req.path}:${JSON.stringify(data)}:${JSON.stringify(schema)}`;
};

// 高速バリデーション（キャッシュ活用）
export const fastValidateMiddleware = <T = any>(
  schema: ValidationSchema<T>,
  options: { useCache?: boolean; ttl?: number } = {}
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = options.useCache ? getCacheKey(req, schema) : null;
    
    if (cacheKey && validationCache.has(cacheKey)) {
      const cachedResult = validationCache.get(cacheKey)!;
      if (!cachedResult.isValid) {
        return res.status(400).json({
          error: 'Validation Failed',
          details: cachedResult.errors
        });
      }
      return next();
    }
    
    const result = validateRequest(req, schema);
    
    if (cacheKey && options.useCache) {
      validationCache.set(cacheKey, result);
      // TTL適用
      if (options.ttl) {
        setTimeout(() => validationCache.delete(cacheKey), options.ttl);
      }
    }
    
    if (!result.isValid) {
      reportValidationFailure(req, result.errors, {
        userId: req.user?.id,
        sessionId: req.sessionID
      });
      
      return res.status(400).json({
        error: 'Validation Failed',
        details: result.errors,
        timestamp: new Date().toISOString()
      });
    }
    
    next();
  };
};
```

## Test Requirements

### テストカバレッジ目標: 95%以上

#### 1. 単体テスト
```typescript
describe('ValidationMiddleware', () => {
  describe('基本バリデーション', () => {
    it('必須フィールドが存在する場合は成功', async () => {
      const schema: ValidationSchema = {
        body: [
          { field: 'name', type: 'string', required: true }
        ]
      };
      
      const req = mockRequest({ body: { name: 'John' } });
      const res = mockResponse();
      const next = jest.fn();
      
      validateMiddleware(schema)(req, res, next);
      
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });
    
    it('必須フィールドが欠如している場合はエラー', async () => {
      const schema: ValidationSchema = {
        body: [
          { field: 'name', type: 'string', required: true }
        ]
      };
      
      const req = mockRequest({ body: {} });
      const res = mockResponse();
      const next = jest.fn();
      
      validateMiddleware(schema)(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('型バリデーション', () => {
    it('文字列型が正しい場合は成功', () => {
      // テスト実装
    });
    
    it('数値型が正しい場合は成功', () => {
      // テスト実装
    });
    
    it('配列型が正しい場合は成功', () => {
      // テスト実装
    });
  });
  
  describe('セキュリティバリデーション', () => {
    it('SQLインジェクションパターンを検出', () => {
      const maliciousInput = "'; DROP TABLE users; --";
      const result = SecurityValidators.noSqlInjection(maliciousInput);
      expect(result).toBe('Potentially malicious input detected');
    });
    
    it('XSSパターンを検出', () => {
      const maliciousInput = '<script>alert("xss")</script>';
      const result = SecurityValidators.noXss(maliciousInput);
      expect(result).toBe('XSS pattern detected');
    });
  });
});
```

#### 2. 統合テスト
```typescript
describe('ValidationMiddleware Integration', () => {
  describe('Express統合', () => {
    it('実際のExpressアプリケーションでバリデーション動作', async () => {
      const app = express();
      app.use(express.json());
      
      app.post('/users', 
        validateMiddleware(UserValidationSchemas.createUser),
        (req, res) => res.json({ success: true })
      );
      
      const response = await request(app)
        .post('/users')
        .send({ username: 'test', email: 'test@example.com' });
      
      expect(response.status).toBe(400);
    });
  });
  
  describe('エラーハンドリング統合', () => {
    it('カスタムエラーハンドラーとの連携', async () => {
      // テスト実装
    });
  });
});
```

#### 3. パフォーマンステスト
```typescript
describe('ValidationMiddleware Performance', () => {
  it('大量データのバリデーション性能', async () => {
    const largeData = Array(1000).fill(0).map((_, i) => ({
      name: `user${i}`,
      email: `user${i}@example.com`
    }));
    
    const startTime = Date.now();
    // バリデーション実行
    const endTime = Date.now();
    
    expect(endTime - startTime).toBeLessThan(100); // 100ms以内
  });
});
```

### セキュリティテスト
```typescript
describe('Security Tests', () => {
  const securityTestCases = [
    { input: "'; DROP TABLE users; --", expected: false },
    { input: '<script>alert("xss")</script>', expected: false },
    { input: 'javascript:void(0)', expected: false },
    { input: 'normal text', expected: true }
  ];
  
  securityTestCases.forEach(({ input, expected }) => {
    it(`should ${expected ? 'allow' : 'reject'} input: ${input}`, () => {
      const result = SecurityValidators.noSqlInjection(input);
      expect(typeof result === 'boolean' ? result : false).toBe(expected);
    });
  });
});
```

## Subtasks

### STEP 1: 仕様書レビュー (30分)
- [ ] 要求仕様の理解・確認
- [ ] 技術仕様書レビュー
- [ ] 依存関係確認
- [ ] インターフェース仕様確認

### STEP 2: コーディング (3.5時間)
- [ ] 基本バリデーション関数実装
- [ ] バリデーションスキーマ定義
- [ ] カスタムバリデータ実装  
- [ ] Express.jsミドルウェア統合
- [ ] エラーハンドリング実装
- [ ] パフォーマンス最適化

### STEP 3: テスト実装 (1.5時間)
- [ ] 単体テスト作成
- [ ] 統合テスト作成
- [ ] セキュリティテスト作成
- [ ] パフォーマンステスト作成

### STEP 4: 単体テスト実行 (30分)
- [ ] 基本機能テスト
- [ ] 異常系テスト
- [ ] エッジケーステスト
- [ ] カバレッジ確認 (>95%)

### STEP 5: リポジトリコミット (15分)
- [ ] ファイル追加・変更確認
- [ ] コミットメッセージ作成
- [ ] プッシュ実行

### STEP 6: ToDoチェック (15分)
- [ ] 実装完了確認
- [ ] 依存タスク状況確認
- [ ] 次タスクの準備確認

### STEP 7: Issue クローズ (15分)
- [ ] 完了報告作成
- [ ] Issue更新・クローズ
- [ ] プルリクエスト作成

## Completion Criteria

### 機能完了基準
- [ ] バリデーションミドルウェアが正常動作
- [ ] すべてのバリデーションスキーマが実装済み
- [ ] カスタムバリデータが動作
- [ ] Express.js統合が完了
- [ ] エラーハンドリングが適切に動作

### 品質基準
- [ ] 単体テストカバレッジ > 95%
- [ ] 統合テスト成功
- [ ] セキュリティテスト成功
- [ ] パフォーマンステスト基準達成
- [ ] TypeScript型チェック成功
- [ ] ESLint警告 0件

### セキュリティ基準
- [ ] SQLインジェクション対策実装
- [ ] XSS対策実装
- [ ] 入力サニタイゼーション実装
- [ ] ログ記録機能実装
- [ ] レート制限サポート

### パフォーマンス基準
- [ ] バリデーション処理時間 < 10ms (通常ケース)
- [ ] メモリ使用量増加 < 50MB
- [ ] キャッシュ機能動作確認
- [ ] 大量データ処理対応 (>1000件)

## Related Information

### 依存技術・ライブラリ
- **Express.js**: ミドルウェア統合
- **Winston**: ロギング機能
- **TypeScript**: 型安全性
- **Jest**: テストフレームワーク

### 参考文書
- `docs/step3/step3-5-data-type-specification.md` - 型定義仕様
- `docs/step3/step3-8-type-definition-specification.md` - TypeScript型定義
- `docs/step4/step4-3-test-case-design.md` - テスト設計書

### 外部仕様
- **OWASP Top 10**: セキュリティ対策基準
- **Express.js Middleware**: 実装パターン
- **REST API Security**: APIセキュリティベストプラクティス

## Technical Notes

### アーキテクチャ判断
- **バリデーションエンジン**: カスタム実装 vs ライブラリ選択
- **スキーマ定義**: JSON Schema vs TypeScript型活用
- **キャッシュ戦略**: メモリキャッシュ vs Redis
- **エラーレポート**: ローカルログ vs 外部監視サービス

### パフォーマンス考慮
- **最適化ポイント**: スキーマコンパイル、キャッシュ戦略
- **メモリ効率**: バリデーション結果キャッシュのTTL管理
- **CPU効率**: 正規表現の最適化、並列バリデーション

### セキュリティ考慮
- **入力検証**: すべての入力ポイントでのバリデーション
- **ログ記録**: 悪意ある入力の監視・記録
- **レスポンス**: エラー情報の適切な制限

### 拡張性設計
- **プラグイン機能**: カスタムバリデータの追加サポート
- **国際化**: エラーメッセージの多言語対応
- **監視連携**: メトリクス収集・アラート機能

---

**作成者**: Process Engineer  
**レビュワー**: [TBD]  
**承認者**: [TBD]  
**更新履歴**: v1.0 初版作成 (2025-01-31) 