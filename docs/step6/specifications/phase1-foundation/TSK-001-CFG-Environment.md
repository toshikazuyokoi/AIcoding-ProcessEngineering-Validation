# TSK-001-CFG-Environment Issue仕様書

## 概要
**タスクID**: TSK-001-CFG-Environment  
**ファイル**: .env, .env.example, src/config/environment.ts  
**複雑度**: 中  
**見積時間**: 2時間  
**優先度**: 🥇最重要（全システムの基盤）  
**フェーズ**: Phase 1: データベース・設定基盤構築  

## 実装対象
- **ファイル**: 
  - `.env` (環境変数定義)
  - `.env.example` (テンプレート)
  - `src/config/environment.ts` (環境変数読み込み)
- **レイヤー**: Configuration
- **依存関係**: なし（最優先実装）

## 実装仕様

### 前提条件
- 依存タスク: なし（プロジェクト開始タスク）
- 参照設計書: `docs/step3/detailed-design/config-design.md`

### 環境変数一覧
```typescript
// 必須環境変数
DATABASE_URL: string          // SQLiteファイルパス
DATABASE_NAME: string         // データベース名
JWT_SECRET: string           // JWT署名秘密鍵
JWT_EXPIRES_IN: string       // JWTトークン有効期限
PORT: number                 // サーバーポート番号
NODE_ENV: string            // 実行環境（development/production/test）

// オプション環境変数
LOG_LEVEL: string           // ログレベル（debug/info/warn/error）
CORS_ORIGIN: string         // CORS許可オリジン
API_PREFIX: string          // APIパスプレフィックス
```

### 機能要件
1. **環境変数読み込み**: dotenvを使用した.envファイル読み込み
2. **バリデーション**: 必須環境変数の存在チェック・型検証
3. **デフォルト値**: 未設定時のフォールバック値設定
4. **エラーハンドリング**: 不正値・未設定時の適切なエラー処理
5. **型安全性**: TypeScript型定義による型安全なアクセス

### メソッド/機能一覧
- `loadEnvironment()`: 環境変数読み込み・バリデーション
- `getConfig()`: 設定値取得（型安全）
- `validateConfig()`: 設定値検証
- `isDevelopment()`: 開発環境判定
- `isProduction()`: 本番環境判定
- `isTest()`: テスト環境判定

### 依存関係
- **参照するライブラリ**: dotenv, joi（バリデーション）
- **提供するインターフェース**: EnvironmentConfig型
- **データベース**: 無関係
- **セキュリティ**: JWT秘密鍵管理

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
- [ ] 2. コーディング
- [ ] 3. テストコーディング
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：有効な環境変数での読み込み成功
- [ ] 異常系テスト：必須変数未設定時のエラー処理
- [ ] 境界値テスト：不正な型・値での動作確認
- [ ] セキュリティテスト：機密情報の適切な管理

## 実装詳細

### .env.example テンプレート
```bash
# データベース設定
DATABASE_URL=./data/tasks.sqlite
DATABASE_NAME=tasks_db

# JWT設定
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# サーバー設定
PORT=3000
NODE_ENV=development

# ログ・デバッグ設定
LOG_LEVEL=info
CORS_ORIGIN=http://localhost:3000
API_PREFIX=/api/v1
```

### TypeScript型定義
```typescript
interface EnvironmentConfig {
  database: {
    url: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  server: {
    port: number;
    nodeEnv: 'development' | 'production' | 'test';
  };
  api: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    corsOrigin: string;
    prefix: string;
  };
}
```

### バリデーションスキーマ
```typescript
const configSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  CORS_ORIGIN: Joi.string().default('*'),
  API_PREFIX: Joi.string().default('/api/v1')
});
```

## 完了条件
- [ ] .env.exampleテンプレート作成完了
- [ ] environment.ts実装完了（読み込み・バリデーション・型安全性）
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] TypeScript厳密モード エラー0件
- [ ] ESLintエラー0件
- [ ] セキュリティ要件（機密情報管理）達成
- [ ] 全後続タスクが環境変数を参照可能

## セキュリティ要件
- [ ] JWT秘密鍵の強度確保（32文字以上）
- [ ] .envファイルの.gitignore登録
- [ ] 本番環境での環境変数適切設定
- [ ] 機密情報のログ出力防止

## 関連情報
- **設計書**: `docs/step3/detailed-design/config-design.md`
- **依存タスク**: なし（最優先）
- **後続タスク**: TSK-002, TSK-003, TSK-006, TSK-007（全タスクが依存）
- **API仕様**: 環境変数はAPI仕様に直接影響なし

## 備考
- このタスクは全システムの基盤となる最重要タスク
- 実装完了まで他のタスクは開始不可
- セキュリティ要件を最優先に実装
- 本番環境での設定変更を考慮した柔軟な設計が必要 