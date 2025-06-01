# インターフェース設計書

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | INTF-001 |
| 関連文書 | ARCH-001, COMP-001, REQ-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | プロセスエンジニア |

## 1. 技術スタック詳細

### 1.1 ランタイム・フレームワーク
| レイヤー | 技術 | バージョン | 選定理由 | 代替案 | ライセンス | リスク |
|---------|------|----------|----------|--------|-----------|--------|
| Runtime | Node.js | 18.x | TypeScript完全サポート、豊富なライブラリ | Deno, Bun | MIT | セキュリティパッチ遅延 |
| Framework | Express.js | 4.18.x | 軽量、柔軟性、豊富なミドルウェア | Fastify, Koa | MIT | パフォーマンス制限 |
| Language | TypeScript | 5.x | 型安全性、開発効率、コード品質 | JavaScript | Apache 2.0 | コンパイル時間 |

### 1.2 データベース・永続化
| レイヤー | 技術 | バージョン | 選定理由 | 代替案 | ライセンス | リスク |
|---------|------|----------|----------|--------|-----------|--------|
| Database | SQLite | 3.42.x | 軽量、ファイルベース、組み込み可能 | PostgreSQL, MySQL | Public Domain | 同時実行制限 |
| ORM/Query Builder | なし | - | 軽量化、直接SQL制御 | TypeORM, Prisma | - | 開発効率低下 |

### 1.3 開発・テストツール
| ツール | バージョン | 用途 | 設定ファイル | 制約への対応 |
|--------|------------|------|--------------|-------------|
| Jest | 29.x | テスト実行、カバレッジ測定 | jest.config.js | >90%カバレッジ監視 |
| ESLint | 8.x | 静的解析、コード品質 | .eslintrc.json | >8.5/10スコア監視 |
| Prettier | 3.x | コード整形、一貫性 | .prettierrc | 統一フォーマット |
| TypeScript Compiler | 5.x | 型チェック、トランスパイル | tsconfig.json | 厳格型チェック |

### 1.4 ビルド・パッケージ管理
| 項目 | 技術 | 設定 | 目的 |
|------|------|------|------|
| パッケージマネージャ | npm | package.json | 依存関係管理 |
| ビルドツール | tsc (TypeScript Compiler) | tsconfig.json | コンパイル |
| プロセス管理 | nodemon (開発時) | nodemon.json | 開発効率化 |

## 2. 依存関係管理

### 2.1 本番依存関係 (dependencies)
| パッケージ名 | バージョン | 用途 | 更新方針 | セキュリティ考慮 |
|-------------|------------|------|----------|-----------------|
| express | ^4.18.0 | Webフレームワーク | マイナーバージョン自動更新 | セキュリティパッチ即座適用 |
| sqlite3 | ^5.1.0 | SQLiteドライバ | パッチバージョン自動更新 | 定期脆弱性スキャン |
| bcrypt | ^5.1.0 | パスワードハッシュ化 | セキュリティ重視固定 | 手動更新・検証 |
| jsonwebtoken | ^9.0.0 | JWT認証 | セキュリティ重視固定 | 手動更新・検証 |
| cors | ^2.8.0 | CORS設定 | マイナーバージョン自動更新 | 設定見直し |
| helmet | ^7.0.0 | セキュリティヘッダー | マイナーバージョン自動更新 | セキュリティ機能追跡 |
| express-rate-limit | ^6.7.0 | レート制限 | マイナーバージョン自動更新 | 攻撃対策強化 |

### 2.2 開発依存関係 (devDependencies)
| パッケージ名 | バージョン | 用途 | 更新方針 |
|-------------|------------|------|----------|
| @types/node | ^20.0.0 | Node.js型定義 | マイナーバージョン自動更新 |
| @types/express | ^4.17.0 | Express型定義 | マイナーバージョン自動更新 |
| @types/bcrypt | ^5.0.0 | bcrypt型定義 | 対応パッケージ追従 |
| @types/jsonwebtoken | ^9.0.0 | JWT型定義 | 対応パッケージ追従 |
| @types/jest | ^29.0.0 | Jest型定義 | 対応パッケージ追従 |
| typescript | ^5.0.0 | TypeScriptコンパイラ | マイナーバージョン自動更新 |
| jest | ^29.0.0 | テストフレームワーク | マイナーバージョン自動更新 |
| eslint | ^8.0.0 | 静的解析 | マイナーバージョン自動更新 |
| prettier | ^3.0.0 | コード整形 | マイナーバージョン自動更新 |
| nodemon | ^3.0.0 | 開発サーバー | マイナーバージョン自動更新 |

### 2.3 脆弱性対策
| 対策項目 | 実装方法 | 監視方法 |
|----------|----------|----------|
| 依存関係脆弱性スキャン | npm audit | 日次自動実行 |
| セキュリティパッチ適用 | npm update | 週次手動実行 |
| ライセンス違反チェック | license-checker | ビルド時実行 |

## 3. REST API 設計仕様

### 3.1 ベースURL・バージョニング
```
Base URL: http://localhost:3000/api
API Version: v1 (URLパスに含めず、将来拡張時に /api/v2/ として追加)
Content-Type: application/json
Charset: UTF-8
```

### 3.2 認証方式
| 方式 | 実装 | ヘッダー | 有効期限 |
|------|------|----------|----------|
| JWT Bearer Token | jsonwebtoken | `Authorization: Bearer <token>` | 24時間 |
| セッション | なし | - | - |
| APIキー | なし | - | - |

### 3.3 エンドポイント詳細仕様

#### 3.3.1 認証エンドポイント

**POST /api/auth/register**
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "string (1-100文字)",
  "email": "string (RFC5322準拠)",
  "password": "string (8文字以上)"
}
```

**レスポンス成功 (201 Created):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "田中太郎",
      "email": "tanaka@example.com",
      "createdAt": "2025-01-28T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "ユーザー登録が完了しました",
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

**エラーレスポンス例:**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_EMAIL",
    "message": "このメールアドレスは既に使用されています",
    "details": {
      "field": "email",
      "value": "tanaka@example.com"
    }
  },
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

**POST /api/auth/login**
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "string",
  "password": "string"
}
```

#### 3.3.2 ユーザー管理エンドポイント

**GET /api/users/profile**
```http
GET /api/users/profile
Authorization: Bearer <token>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "田中太郎",
    "email": "tanaka@example.com",
    "createdAt": "2025-01-28T10:00:00.000Z",
    "updatedAt": "2025-01-28T10:00:00.000Z"
  },
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

**PUT /api/users/profile**
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "string (optional, 1-100文字)",
  "email": "string (optional, RFC5322準拠)"
}
```

#### 3.3.3 タスク管理エンドポイント

**GET /api/tasks**
```http
GET /api/tasks?status=pending&priority=high&category=work&sortBy=createdAt&sortOrder=desc&limit=20&offset=0
Authorization: Bearer <token>
```

**クエリパラメータ:**
| パラメータ | 型 | 必須 | 説明 | デフォルト |
|------------|----|----- |----- |-----------|
| status | enum | No | pending/in_progress/completed | 全て |
| priority | enum | No | low/medium/high | 全て |
| category | string | No | カテゴリ名 | 全て |
| sortBy | enum | No | title/priority/createdAt/updatedAt | createdAt |
| sortOrder | enum | No | asc/desc | desc |
| limit | number | No | 1-100 | 20 |
| offset | number | No | 0以上 | 0 |

**レスポンス (200 OK):**
```json
{
  "success": true,
  "data": {
    "tasks": [
      {
        "id": 1,
        "title": "プロジェクト企画書作成",
        "description": "Q1の新プロジェクト企画書を作成する",
        "status": "in_progress",
        "priority": "high",
        "category": "work",
        "createdAt": "2025-01-28T10:00:00.000Z",
        "updatedAt": "2025-01-28T11:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  },
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

**POST /api/tasks**
```http
POST /api/tasks
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string (1-200文字)",
  "description": "string (optional, 1000文字以下)",
  "priority": "low|medium|high",
  "category": "string (optional, 50文字以下)"
}
```

**PUT /api/tasks/:id**
```http
PUT /api/tasks/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "string (optional, 1-200文字)",
  "description": "string (optional, 1000文字以下)",
  "priority": "low|medium|high (optional)",
  "category": "string (optional, 50文字以下)",
  "status": "pending|in_progress|completed (optional)"
}
```

**DELETE /api/tasks/:id**
```http
DELETE /api/tasks/1
Authorization: Bearer <token>
```

**レスポンス (200 OK):**
```json
{
  "success": true,
  "message": "タスクが正常に削除されました",
  "timestamp": "2025-01-28T10:00:00.000Z"
}
```

### 3.4 エラーレスポンス標準化

#### 3.4.1 HTTPステータスコード
| コード | 用途 | 発生条件 |
|--------|------|----------|
| 200 | 成功 | 正常処理完了 |
| 201 | 作成成功 | リソース作成完了 |
| 400 | 不正リクエスト | バリデーションエラー、形式エラー |
| 401 | 認証エラー | JWTトークン無効・期限切れ |
| 403 | 認可エラー | リソースアクセス権限なし |
| 404 | 未発見 | リソース存在しない |
| 409 | 競合 | 重複データ、制約違反 |
| 422 | 処理不可能 | ビジネスルール違反 |
| 429 | レート制限 | リクエスト頻度制限 |
| 500 | サーバーエラー | 予期しないシステムエラー |

#### 3.4.2 エラーレスポンス形式
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;           // エラーコード（大文字・アンダースコア）
    message: string;        // ユーザー向けメッセージ（日本語）
    details?: any;          // 詳細情報（開発用）
  };
  timestamp: string;        // ISO 8601形式
}
```

#### 3.4.3 主要エラーコード一覧
| エラーコード | HTTPコード | メッセージ例 |
|-------------|------------|-------------|
| VALIDATION_ERROR | 400 | "入力値が無効です" |
| DUPLICATE_EMAIL | 409 | "このメールアドレスは既に使用されています" |
| INVALID_CREDENTIALS | 401 | "メールアドレスまたはパスワードが正しくありません" |
| TOKEN_EXPIRED | 401 | "認証トークンの有効期限が切れています" |
| TOKEN_INVALID | 401 | "認証トークンが無効です" |
| USER_NOT_FOUND | 404 | "ユーザーが見つかりません" |
| TASK_NOT_FOUND | 404 | "タスクが見つかりません" |
| ACCESS_DENIED | 403 | "このリソースにアクセスする権限がありません" |
| RATE_LIMIT_EXCEEDED | 429 | "リクエストが制限を超えています" |
| INTERNAL_ERROR | 500 | "内部サーバーエラーが発生しました" |

## 4. データベース接続設計

### 4.1 接続設定
```typescript
interface DatabaseConfig {
  filename: string;           // データベースファイルパス
  mode: number;              // 接続モード
  verbose?: boolean;         // 詳細ログ
  busyTimeout?: number;      // ビジートimeout（ms）
}

const dbConfig: DatabaseConfig = {
  filename: process.env.DB_PATH || './database.sqlite',
  mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  verbose: process.env.NODE_ENV === 'development',
  busyTimeout: 5000
};
```

### 4.2 マイグレーション設計
```sql
-- 001_create_users_table.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 002_create_tasks_table.sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  priority VARCHAR(10) NOT NULL DEFAULT 'medium',
  category VARCHAR(50),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_user_status ON tasks(user_id, status);
```

### 4.3 トランザクション管理
```typescript
interface TransactionManager {
  begin(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  run<T>(operation: () => Promise<T>): Promise<T>;
}
```

## 5. セキュリティインターフェース

### 5.1 JWT設定
```typescript
interface JWTConfig {
  secret: string;
  expiresIn: string;
  algorithm: 'HS256';
  issuer: string;
}

interface JWTPayload {
  userId: number;
  email: string;
  iat: number;
  exp: number;
  iss: string;
}
```

### 5.2 パスワードハッシュ化
```typescript
interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
  rounds: 12;  // bcrypt rounds
}
```

### 5.3 レート制限設定
```typescript
interface RateLimitConfig {
  windowMs: number;      // 15分 = 15 * 60 * 1000
  max: number;          // 100リクエスト
  message: string;      // エラーメッセージ
  standardHeaders: boolean;  // `RateLimit-*` ヘッダー
  legacyHeaders: false;      // `X-RateLimit-*` ヘッダー無効
}
```

## 6. パフォーマンス・監視インターフェース

### 6.1 ロギング設計
```typescript
interface Logger {
  info(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  error(message: string, error?: Error, meta?: any): void;
  debug(message: string, meta?: any): void;
}

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  requestId?: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
  meta?: any;
}
```

### 6.2 メトリクス収集
```typescript
interface Metrics {
  requestCount: number;
  responseTime: number[];
  errorCount: number;
  activeConnections: number;
  databaseQueryTime: number[];
}
```

## 7. 完了確認

### 7.1 技術スタック完了確認
- [x] 全技術の選定理由が明確に記述されている
- [x] バージョン指定が具体的である
- [x] 代替案が検討されている
- [x] ライセンス・セキュリティが考慮されている
- [x] 依存関係が適切に管理されている

### 7.2 API設計完了確認
- [x] 全エンドポイントが詳細に定義されている
- [x] リクエスト・レスポンス形式が統一されている
- [x] エラーハンドリングが標準化されている
- [x] 認証・認可方式が明確である
- [x] バリデーションルールが完全である

### 7.3 データベース設計完了確認
- [x] スキーマ設計が最適化されている
- [x] インデックス設計が適切である
- [x] トランザクション管理が設計されている
- [x] マイグレーション戦略が明確である

### 7.4 セキュリティ設計完了確認
- [x] 認証・認可が適切に設計されている
- [x] 入力検証が包括的である
- [x] セキュリティヘッダーが設定されている
- [x] レート制限が実装されている
- [x] パスワード保護が強固である

### 7.5 実証実験要件確認
- [x] 8ファイル制約が技術選択に反映されている
- [x] 行数制約が設計に考慮されている
- [x] 品質目標が技術選択に統合されている
- [x] プロセス完全実行が技術的に可能である
- [x] STEP 1要求仕様との完全対応が確保されている 