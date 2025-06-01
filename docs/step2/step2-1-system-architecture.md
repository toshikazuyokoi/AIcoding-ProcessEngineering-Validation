# システム構成図

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | ARCH-001 |
| 関連文書 | REQ-001, GOAL-001, UC-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | プロセスエンジニア |

## 1. システム全体アーキテクチャ

````mermaid
graph TD
    CLIENT[Client Applications]
    API[Express.js API Server]
    DB[(SQLite Database)]
    LOG[Application Logs]

    CLIENT -->|HTTP/REST| API
    API -->|SQL Queries| DB
    API -->|Write| LOG
    
    subgraph "System Boundary"
        API
        DB
        LOG
    end
    
    style API fill:#e1f5fe
    style DB fill:#e8f5e8
    style LOG fill:#fff3e0
````

## 2. レイヤー構成

| レイヤー | 内容 | 技術 | 責任 | 実装ファイル |
|----------|------|------|------|-------------|
| Presentation Layer | HTTP API・ルーティング | Express.js, TypeScript | リクエスト/レスポンス処理、認証、バリデーション | AppController.ts |
| Application Layer | ビジネスロジック・使用例制御 | TypeScript | ユースケース実行、トランザクション管理、ビジネスルール | UserService.ts, TaskService.ts |
| Domain Layer | ドメインエンティティ・ビジネスモデル | TypeScript | ドメインオブジェクト、ビジネス不変条件、ドメインロジック | User.ts, Task.ts |
| Infrastructure Layer | データ永続化・外部リソース | SQLite, TypeScript | データアクセス、永続化、リポジトリパターン | UserRepository.ts, TaskRepository.ts |
| Configuration Layer | アプリケーション設定・起動 | Express.js, TypeScript | アプリケーション初期化、設定管理、依存性注入 | app.ts |

## 3. コンポーネント構成図

````mermaid
graph TD
    subgraph "Presentation Layer"
        CTRL[AppController.ts<br/>API Routes & Authentication]
    end
    
    subgraph "Application Layer"
        USRV[UserService.ts<br/>User Business Logic]
        TSRV[TaskService.ts<br/>Task Business Logic]
    end
    
    subgraph "Domain Layer"
        USER[User.ts<br/>User Entity]
        TASK[Task.ts<br/>Task Entity]
    end
    
    subgraph "Infrastructure Layer"
        UREPO[UserRepository.ts<br/>User Data Access]
        TREPO[TaskRepository.ts<br/>Task Data Access]
    end
    
    subgraph "Configuration"
        APP[app.ts<br/>Application Bootstrap]
    end
    
    subgraph "Data Store"
        DB[(SQLite<br/>Database)]
    end

    CTRL --> USRV
    CTRL --> TSRV
    USRV --> USER
    USRV --> UREPO
    TSRV --> TASK
    TSRV --> TREPO
    UREPO --> DB
    TREPO --> DB
    APP --> CTRL
    APP --> DB
    
    style CTRL fill:#ffebee
    style USRV fill:#e3f2fd
    style TSRV fill:#e3f2fd
    style USER fill:#e8f5e8
    style TASK fill:#e8f5e8
    style UREPO fill:#fff3e0
    style TREPO fill:#fff3e0
    style APP fill:#f3e5f5
    style DB fill:#e1f5fe
````

## 4. 8ファイル構成詳細

### 4.1 ファイル責任分離
| ファイル名 | レイヤー | 行数目安 | 主要責任 | 依存先 |
|------------|----------|----------|----------|--------|
| app.ts | Configuration | 50-80行 | アプリケーション起動、Express設定、ミドルウェア設定、ポート設定 | AppController.ts |
| AppController.ts | Presentation | 200-250行 | REST API、ルーティング、リクエスト/レスポンス、認証、バリデーション | UserService.ts, TaskService.ts |
| User.ts | Domain | 80-120行 | ユーザーエンティティ、ユーザービジネスルール、バリデーション | なし（Pure Domain） |
| Task.ts | Domain | 120-160行 | タスクエンティティ、タスクビジネスルール、状態管理、バリデーション | なし（Pure Domain） |
| UserService.ts | Application | 180-220行 | ユーザー使用例、認証ロジック、プロフィール管理、トランザクション | User.ts, UserRepository.ts |
| TaskService.ts | Application | 250-300行 | タスク使用例、CRUD操作、状態変更、カテゴリ管理、トランザクション | Task.ts, TaskRepository.ts |
| UserRepository.ts | Infrastructure | 120-150行 | ユーザーデータアクセス、SQL操作、データマッピング | User.ts |
| TaskRepository.ts | Infrastructure | 150-180行 | タスクデータアクセス、SQL操作、データマッピング、検索 | Task.ts |
| **合計** | | **1150-1430行** | | |

### 4.2 依存関係マトリックス
| ファイル | app.ts | AppController.ts | User.ts | Task.ts | UserService.ts | TaskService.ts | UserRepository.ts | TaskRepository.ts |
|----------|--------|-----------------|---------|---------|----------------|----------------|--------------------|-------------------|
| app.ts | - | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| AppController.ts | ✗ | - | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ |
| User.ts | ✗ | ✗ | - | ✗ | ✗ | ✗ | ✗ | ✗ |
| Task.ts | ✗ | ✗ | ✗ | - | ✗ | ✗ | ✗ | ✗ |
| UserService.ts | ✗ | ✗ | ✓ | ✗ | - | ✗ | ✓ | ✗ |
| TaskService.ts | ✗ | ✗ | ✗ | ✓ | ✗ | - | ✗ | ✓ |
| UserRepository.ts | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | - | ✗ |
| TaskRepository.ts | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✗ | - |

## 5. 設計原則

### 5.1 アーキテクチャ原則
- **単一責任原則**: 各ファイルは明確な単一責任を持つ
- **依存性逆転原則**: 上位レイヤーは下位レイヤーのインターフェースに依存
- **オープン・クローズ原則**: 拡張に対して開放、修正に対して閉鎖
- **関心の分離**: ビジネスロジック、データアクセス、プレゼンテーションの明確な分離
- **制約遵守**: 8ファイル・1000-1500行制約の厳格な遵守

### 5.2 設計パターン
| パターン名 | 適用箇所 | 目的 | 実装ファイル |
|------------|----------|------|-------------|
| Repository Pattern | データアクセス層 | データアクセスロジックの抽象化、テストアビリティ向上 | UserRepository.ts, TaskRepository.ts |
| Service Layer Pattern | アプリケーション層 | ビジネスロジックの集約、トランザクション境界の明確化 | UserService.ts, TaskService.ts |
| Domain Model Pattern | ドメイン層 | ビジネスルールの集約、ドメイン不変条件の保証 | User.ts, Task.ts |
| MVC Pattern | 全体アーキテクチャ | 関心の分離、責任の明確化 | AppController.ts (Controller), Service層 (Model), REST API (View) |
| Dependency Injection | 依存性管理 | 疎結合、テストアビリティ、設定の外部化 | app.ts で実装 |

### 5.3 品質属性設計
| 品質属性 | 設計アプローチ | 実装方法 |
|----------|---------------|----------|
| **保守性** | レイヤード分離、単一責任 | 明確な責任分離、低結合・高凝集 |
| **テスタビリティ** | 依存性注入、Repository Pattern | インターフェース分離、モック可能な設計 |
| **拡張性** | オープン・クローズ原則 | インターフェースベース設計、プラグイン可能構造 |
| **パフォーマンス** | 効率的データアクセス | SQLiteクエリ最適化、適切なインデックス設計 |
| **セキュリティ** | レイヤー別セキュリティ | 認証はPresentation層、認可はApplication層 |

## 6. データフロー設計

### 6.1 リクエスト処理フロー
````mermaid
sequenceDiagram
    participant Client
    participant AppController
    participant UserService
    participant User
    participant UserRepository
    participant Database

    Client->>AppController: HTTP Request
    AppController->>AppController: Authentication & Validation
    AppController->>UserService: Business Operation
    UserService->>User: Domain Logic
    User-->>UserService: Domain Result
    UserService->>UserRepository: Data Operation
    UserRepository->>Database: SQL Query
    Database-->>UserRepository: Query Result
    UserRepository-->>UserService: Domain Object
    UserService-->>AppController: Business Result
    AppController-->>Client: HTTP Response
````

### 6.2 エラー処理フロー
````mermaid
graph TD
    REQ[Request] --> VAL{Validation}
    VAL -->|Invalid| ERR1[400 Bad Request]
    VAL -->|Valid| AUTH{Authentication}
    AUTH -->|Unauthorized| ERR2[401 Unauthorized]
    AUTH -->|Authorized| BIZ[Business Logic]
    BIZ -->|Business Error| ERR3[422 Unprocessable Entity]
    BIZ -->|System Error| ERR4[500 Internal Server Error]
    BIZ -->|Success| RES[200 Success Response]
    
    style ERR1 fill:#ffcdd2
    style ERR2 fill:#ffcdd2
    style ERR3 fill:#ffcdd2
    style ERR4 fill:#ffcdd2
    style RES fill:#c8e6c9
````

## 7. セキュリティアーキテクチャ

### 7.1 認証・認可設計
| セキュリティ層 | 実装箇所 | 方式 | 責任 |
|---------------|----------|------|------|
| **認証 (Authentication)** | AppController.ts | JWT Token | ユーザー身元確認 |
| **認可 (Authorization)** | UserService.ts, TaskService.ts | Resource Ownership | リソースアクセス権限確認 |
| **入力検証** | AppController.ts | Express Validator | 不正入力防止 |
| **データ保護** | UserRepository.ts | bcrypt | パスワードハッシュ化 |

### 7.2 セキュリティ対策マッピング
| 脅威 | 対策レイヤー | 実装方法 | 実装ファイル |
|------|-------------|----------|-------------|
| 不正アクセス | Presentation | JWT認証ミドルウェア | AppController.ts |
| SQLインジェクション | Infrastructure | パラメータ化クエリ | UserRepository.ts, TaskRepository.ts |
| XSS攻撃 | Presentation | 入力サニタイズ | AppController.ts |
| CSRF攻撃 | Presentation | CSRF トークン | AppController.ts |
| パスワード攻撃 | Application | bcryptハッシュ化 | UserService.ts |

## 8. パフォーマンス設計

### 8.1 パフォーマンス要件マッピング
| 要件 | 目標値 | 設計アプローチ | 実装箇所 |
|------|--------|---------------|----------|
| API応答時間 | <1秒 | 効率的クエリ設計 | Repository層 |
| タスク一覧表示 | <0.5秒 | インデックス最適化 | TaskRepository.ts |
| 同時接続数 | 100ユーザー | 非同期処理 | 全Service層 |
| データベースレスポンス | <100ms | クエリ最適化 | Repository層 |

### 8.2 最適化ポイント
| 最適化項目 | 実装方法 | 対象ファイル |
|------------|----------|-------------|
| **データベースクエリ** | インデックス、効率的JOIN | TaskRepository.ts |
| **メモリ使用量** | オブジェクトプーリング | Service層 |
| **ネットワーク** | レスポンス圧縮 | app.ts |
| **CPU使用率** | 非同期処理、バッチ処理 | Service層 |

## 9. 完了確認
- [x] システム全体像が明確に表現されている
- [x] レイヤー構成が適切に定義されている
- [x] コンポーネント間の関係が明確である
- [x] 設計原則が明文化されている
- [x] 8ファイル構成の詳細設計が完了している
- [x] 行数配分が制約内で最適化されている
- [x] 依存関係が適切に設計されている
- [x] セキュリティアーキテクチャが定義されている
- [x] パフォーマンス設計が考慮されている
- [x] エラー処理フローが設計されている
- [x] STEP 1要求仕様との完全整合性が確保されている
- [x] 実証実験要件が統合されている 