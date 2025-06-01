# 要求仕様書

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | REQ-001 |
| 関連文書 | GOAL-001, CONST-001, UC-001, NFR-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | プロセスエンジニア |

## 1. システム概要

### 1.1 システム目的
**主目的**: プロセスエンジニアリングアプローチの実証実験を通じて、AIコーディング手法の有効性を検証するためのシンプルタスク管理システムを開発する

**副次目的**: 
- 論文理論の実用性証明
- 段階的詳細化手法の効果測定
- ファイル単位タスク管理の実証
- 品質保証手法の検証

### 1.2 システム範囲
| 項目 | 詳細 |
|------|------|
| 対象ユーザー | 個人ユーザー（小規模・プライベート用途） |
| 機能範囲 | ユーザー管理、タスク管理、カテゴリ管理、基本認証 |
| 技術範囲 | TypeScript, Express.js, SQLite, Jest |
| 規模制約 | 8ファイル、1000-1500行（テスト除く） |

### 1.3 システム境界
````mermaid
graph TB
    U[ユーザー] --> SYS[タスク管理システム]
    SYS --> DB[(SQLite)]
    SYS --> LOG[ログファイル]
    
    subgraph "システム境界内"
        SYS
        DB
        LOG
    end
    
    subgraph "システム境界外"
        U
        EXT[外部システム]
        MAIL[メール通知]
    end
    
    SYS -.-> EXT
    SYS -.-> MAIL
    
    style SYS fill:#e1f5fe
    style DB fill:#e1f5fe
    style LOG fill:#e1f5fe
````

## 2. 機能要件

### 2.1 機能要件一覧
| 機能ID | 機能名 | 優先度 | 複雑度 | 関連UC | 実装ファイル |
|--------|--------|--------|--------|--------|-------------|
| F-001 | ユーザー登録 | 高 | 中 | UC-001 | User.ts, UserService.ts, UserRepository.ts |
| F-002 | ユーザーログイン | 高 | 中 | UC-002 | User.ts, UserService.ts |
| F-003 | プロフィール編集 | 中 | 低 | UC-003 | User.ts, UserService.ts |
| F-004 | タスク作成 | 高 | 中 | UC-004 | Task.ts, TaskService.ts, TaskRepository.ts |
| F-005 | タスク一覧表示 | 高 | 低 | UC-005 | Task.ts, TaskService.ts, TaskRepository.ts |
| F-006 | タスク編集 | 高 | 中 | UC-006 | Task.ts, TaskService.ts |
| F-007 | タスク削除 | 中 | 低 | UC-007 | Task.ts, TaskService.ts |
| F-008 | タスク状態変更 | 高 | 低 | UC-008 | Task.ts, TaskService.ts |
| F-009 | カテゴリ管理 | 中 | 低 | UC-009 | Task.ts, TaskService.ts |
| F-010 | データ永続化 | 高 | 中 | UC-010 | UserRepository.ts, TaskRepository.ts |

### 2.2 ユーザー管理機能

#### F-001: ユーザー登録
**要件**: 新規ユーザーがシステムにアカウントを作成できること
**入力**: 名前、メールアドレス、パスワード
**出力**: 登録完了通知、自動ログイン
**検証**: メール形式チェック、パスワード強度チェック、重複メールエラー

#### F-002: ユーザーログイン
**要件**: 既存ユーザーがメールアドレスとパスワードでログインできること
**入力**: メールアドレス、パスワード
**出力**: 認証成功/失敗、セッション確立
**検証**: 認証情報照合、セッション管理

#### F-003: プロフィール編集
**要件**: ログイン済みユーザーが自分の情報を更新できること
**入力**: 名前、メールアドレス（変更可能項目）
**出力**: 更新完了通知
**検証**: メール形式チェック、重複メールエラー

### 2.3 タスク管理機能

#### F-004: タスク作成
**要件**: ユーザーが新しいタスクを作成できること
**入力**: タスク名（必須）、説明、優先度、カテゴリ
**出力**: 作成完了通知、タスク一覧更新
**検証**: 必須項目チェック、文字数制限

#### F-005: タスク一覧表示
**要件**: ユーザーの全タスクを状態別・優先度別に表示できること
**入力**: なし（ログインユーザー情報から取得）
**出力**: タスク一覧（状態、優先度、カテゴリ別整理）
**検証**: ユーザー権限チェック、データ取得

#### F-006: タスク編集
**要件**: 既存タスクの詳細情報を編集できること
**入力**: タスクID、変更内容（名前、説明、優先度、カテゴリ）
**出力**: 更新完了通知、一覧反映
**検証**: 所有者権限チェック、必須項目チェック

#### F-007: タスク削除
**要件**: 不要なタスクを削除できること
**入力**: タスクID、削除確認
**出力**: 削除完了通知、一覧から除去
**検証**: 所有者権限チェック、削除確認

#### F-008: タスク状態変更
**要件**: タスクの進捗状態を変更できること
**入力**: タスクID、新しい状態（未着手/進行中/完了）
**出力**: 状態更新、一覧反映
**検証**: 所有者権限チェック、有効状態値

#### F-009: カテゴリ管理
**要件**: タスクのカテゴリを作成・編集・削除できること
**入力**: カテゴリ名、操作種別（作成/編集/削除）
**出力**: カテゴリ一覧更新
**検証**: 重複チェック、使用中カテゴリ削除制限

#### F-010: データ永続化
**要件**: 全ての操作が永続的にデータベースに保存されること
**入力**: 各種データ操作
**出力**: データベース反映、操作ログ
**検証**: ACID特性保証、整合性チェック

## 3. 非機能要件

### 3.1 パフォーマンス要件
| 機能 | 目標応答時間 | 最大許容時間 | スループット |
|------|-------------|-------------|-------------|
| ログイン | <1秒 | 3秒 | 100リクエスト/分 |
| タスク一覧表示 | <0.5秒 | 2秒 | 200リクエスト/分 |
| タスク作成・編集 | <1秒 | 3秒 | 50リクエスト/分 |
| タスク状態変更 | <0.3秒 | 1秒 | 300リクエスト/分 |

### 3.2 セキュリティ要件
| 項目 | 要件 | 実装方法 |
|------|------|----------|
| 認証 | JWTトークンベース認証 | jsonwebtoken使用 |
| パスワード保護 | bcryptハッシュ化（rounds=12） | bcrypt使用 |
| セッション管理 | 安全なセッション管理 | express-session使用 |
| XSS対策 | 入力値サニタイズ | DOMPurify使用 |
| SQL注入対策 | パラメータ化クエリ | TypeORM使用 |

### 3.3 可用性要件
| 項目 | 目標値 | 最小許容値 |
|------|--------|-----------|
| システム稼働率 | 99.5% | 99.0% |
| データベース稼働率 | 99.8% | 99.5% |
| 復旧時間（システム停止） | 30分以内 | 2時間以内 |
| 復旧時間（データ破損） | 1時間以内 | 4時間以内 |

### 3.4 品質要件
| 指標 | 目標値 | 許容基準 | 測定方法 |
|------|--------|----------|----------|
| テストカバレッジ | >95% | >90% | Jest coverage |
| 静的解析スコア | >9.0/10 | >8.5/10 | ESLint + SonarQube |
| バグ密度 | <1.0/KLOC | <2.0/KLOC | テスト・レビュー |
| 循環的複雑度 | <10 | <15 | 静的解析 |

## 4. データ要件

### 4.1 データモデル概要
````mermaid
erDiagram
    User {
        int id PK
        string name
        string email UK
        string password_hash
        datetime created_at
        datetime updated_at
    }
    
    Task {
        int id PK
        int user_id FK
        string title
        text description
        string status
        string priority
        string category
        datetime created_at
        datetime updated_at
    }
    
    User ||--o{ Task : owns
````

### 4.2 データエンティティ定義

#### User（ユーザー）エンティティ
| 属性名 | データ型 | 制約 | 説明 |
|--------|----------|------|------|
| id | INTEGER | PK, AUTO_INCREMENT | ユーザーID |
| name | VARCHAR(100) | NOT NULL | ユーザー名 |
| email | VARCHAR(255) | NOT NULL, UNIQUE | メールアドレス |
| password_hash | VARCHAR(255) | NOT NULL | パスワードハッシュ |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 更新日時 |

#### Task（タスク）エンティティ
| 属性名 | データ型 | 制約 | 説明 |
|--------|----------|------|------|
| id | INTEGER | PK, AUTO_INCREMENT | タスクID |
| user_id | INTEGER | FK, NOT NULL | 所有者ユーザーID |
| title | VARCHAR(200) | NOT NULL | タスク名 |
| description | TEXT | NULL | タスク説明 |
| status | ENUM | NOT NULL, DEFAULT 'pending' | 状態（pending/in_progress/completed） |
| priority | ENUM | NOT NULL, DEFAULT 'medium' | 優先度（low/medium/high） |
| category | VARCHAR(50) | NULL | カテゴリ |
| created_at | DATETIME | NOT NULL, DEFAULT NOW() | 作成日時 |
| updated_at | DATETIME | NOT NULL, DEFAULT NOW() | 更新日時 |

### 4.3 データ制約
| 制約項目 | 内容 | 実装方法 |
|----------|------|----------|
| 参照整合性 | UserとTaskの関係 | FOREIGN KEY制約 |
| ユニーク制約 | メールアドレス重複防止 | UNIQUE制約 |
| NOT NULL制約 | 必須項目の保証 | NOT NULL制約 |
| ENUM制約 | status, priorityの値制限 | ENUM型使用 |

## 5. インターフェース要件

### 5.1 APIエンドポイント一覧
| エンドポイント | メソッド | 機能 | 入力 | 出力 | 認証 |
|---------------|---------|------|------|------|------|
| /api/auth/register | POST | ユーザー登録 | name, email, password | token, user | なし |
| /api/auth/login | POST | ログイン | email, password | token, user | なし |
| /api/users/profile | GET | プロフィール取得 | なし | user | 必須 |
| /api/users/profile | PUT | プロフィール更新 | name, email | user | 必須 |
| /api/tasks | GET | タスク一覧取得 | query params | tasks[] | 必須 |
| /api/tasks | POST | タスク作成 | title, description, priority, category | task | 必須 |
| /api/tasks/:id | GET | タスク詳細取得 | id | task | 必須 |
| /api/tasks/:id | PUT | タスク更新 | title, description, priority, category, status | task | 必須 |
| /api/tasks/:id | DELETE | タスク削除 | id | success | 必須 |

### 5.2 レスポンス形式
```json
{
  "success": true,
  "data": {
    // レスポンスデータ
  },
  "message": "操作完了メッセージ",
  "timestamp": "2025-01-28T10:00:00Z"
}
```

### 5.3 エラーレスポンス形式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": "詳細情報"
  },
  "timestamp": "2025-01-28T10:00:00Z"
}
```

## 6. アーキテクチャ要件

### 6.1 レイヤードアーキテクチャ
````mermaid
graph TD
    API[AppController.ts - API Layer] --> APP[Services - Application Layer]
    APP --> DOM[Entities - Domain Layer]
    APP --> INFRA[Repositories - Infrastructure Layer]
    INFRA --> DB[(SQLite Database)]
    
    subgraph "Presentation Layer"
        API
    end
    
    subgraph "Application Layer"
        USRV[UserService.ts]
        TSRV[TaskService.ts]
    end
    
    subgraph "Domain Layer"
        USER[User.ts]
        TASK[Task.ts]
    end
    
    subgraph "Infrastructure Layer"
        UREPO[UserRepository.ts]
        TREPO[TaskRepository.ts]
    end
    
    subgraph "Configuration"
        APP_TS[app.ts]
    end
    
    API --> USRV
    API --> TSRV
    USRV --> USER
    TSRV --> TASK
    USRV --> UREPO
    TSRV --> TREPO
    APP_TS --> API
````

### 6.2 8ファイル構成と責任分離
| ファイル | レイヤー | 責任 | 複雑度 | 行数目安 |
|----------|----------|------|--------|----------|
| app.ts | Configuration | アプリケーション起動・設定 | 低 | 50-80行 |
| AppController.ts | Presentation | API エンドポイント・ルーティング | 中 | 200-250行 |
| User.ts | Domain | ユーザードメインエンティティ | 中 | 80-120行 |
| Task.ts | Domain | タスクドメインエンティティ | 中 | 120-160行 |
| UserService.ts | Application | ユーザービジネスロジック | 高 | 180-220行 |
| TaskService.ts | Application | タスクビジネスロジック | 高 | 250-300行 |
| UserRepository.ts | Infrastructure | ユーザーデータアクセス | 中 | 120-150行 |
| TaskRepository.ts | Infrastructure | タスクデータアクセス | 中 | 150-180行 |
| **合計** | | | | **1150-1430行** |

### 6.3 依存性注入
- コンストラクタインジェクション使用
- インターフェースベースの設計
- Service層がRepository層に依存
- Controller層がService層に依存

## 7. 制約事項

### 7.1 技術制約
| 項目 | 制約内容 | 理由 | 対応策 |
|------|----------|------|--------|
| ファイル数 | 正確に8ファイル | 実証実験条件 | 責任分離最適化 |
| 行数 | 1000-1500行（テスト除く） | 小規模システム実証 | 簡潔な実装 |
| 技術スタック | TypeScript + Express + SQLite | 論文実験条件 | 最適化実装 |
| 外部依存 | 最小限 | 自己完結性 | 必要最小限のライブラリ |

### 7.2 機能制約
| 項目 | 制約内容 | 理由 | 代替案 |
|------|----------|------|--------|
| ユーザー管理 | シンプル認証のみ | 複雑性回避 | 基本的なJWT認証 |
| ファイル添付 | 対応外 | スコープ制限 | 将来拡張として検討 |
| リアルタイム更新 | 対応外 | 複雑性回避 | ページリロード |
| 多言語対応 | 対応外 | スコープ制限 | 日本語のみ |

## 8. 受け入れ基準

### 8.1 機能受け入れ基準
- [ ] 全10機能の正常動作確認
- [ ] 全ユースケースの完全実行
- [ ] API エンドポイント100%動作
- [ ] エラーハンドリング完全対応

### 8.2 品質受け入れ基準
- [ ] テストカバレッジ >90%
- [ ] 静的解析スコア >8.5/10
- [ ] セキュリティ脆弱性 0件
- [ ] パフォーマンス要件達成

### 8.3 実証実験受け入れ基準
- [ ] 8ファイル構成の厳密遵守
- [ ] 1000-1500行の範囲内
- [ ] プロセス完全実行の証明
- [ ] 品質指標の定量測定

## 9. 完了確認
- [x] 全機能要件が明確に定義されている
- [x] 非機能要件が定量的に設定されている
- [x] データモデルが完全に設計されている
- [x] APIインターフェースが詳細に定義されている
- [x] アーキテクチャ設計が8ファイル構成に対応している
- [x] 制約事項が完全に反映されている
- [x] 受け入れ基準が明確に設定されている
- [x] 実証実験要件が統合されている 