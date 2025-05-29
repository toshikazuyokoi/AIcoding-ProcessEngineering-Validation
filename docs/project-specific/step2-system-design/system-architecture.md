# システム構成図

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | ARCH-001 |
| 関連文書 | REQ-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 1. システム全体アーキテクチャ

````mermaid
graph TD
    subgraph "Client Layer"
        WEB[Web Browser]
        MOB[Mobile Browser]
    end
    
    subgraph "Presentation Layer"
        UI[React Frontend]
        ROUTER[React Router]
    end
    
    subgraph "Application Layer"
        API[Express API Server]
        AUTH[Authentication Middleware]
        VALID[Validation Middleware]
        RATE[Rate Limiting]
    end
    
    subgraph "Domain Layer"
        USER_SVC[User Service]
        TASK_SVC[Task Service]
        AUTH_SVC[Auth Service]
    end
    
    subgraph "Infrastructure Layer"
        DB[PostgreSQL Database]
        CACHE[Redis Cache]
        LOG[Winston Logger]
        FILE[File System]
    end
    
    WEB -->|HTTPS| UI
    MOB -->|HTTPS| UI
    UI -->|REST API| API
    ROUTER --> UI
    
    API --> AUTH
    API --> VALID
    API --> RATE
    
    AUTH --> AUTH_SVC
    API --> USER_SVC
    API --> TASK_SVC
    
    USER_SVC --> DB
    TASK_SVC --> DB
    AUTH_SVC --> DB
    
    USER_SVC --> CACHE
    TASK_SVC --> CACHE
    
    API --> LOG
    LOG --> FILE
````

## 2. レイヤー構成

| レイヤー | 内容 | 技術 | 責任 |
|----------|------|------|------|
| Client Layer | ユーザーインターフェース | Web/Mobile Browser | ユーザー操作の受付・表示 |
| Presentation Layer | フロントエンド | React + TypeScript | UI表示・ユーザー操作・状態管理 |
| Application Layer | API・制御 | Express + TypeScript | HTTP処理・認証・バリデーション |
| Domain Layer | ビジネスロジック | TypeScript Classes | 業務ルール・データ処理 |
| Infrastructure Layer | データ・外部連携 | PostgreSQL + Redis | データ永続化・キャッシュ・ログ |

## 3. コンポーネント構成図

````mermaid
graph TD
    subgraph "Frontend Components"
        APP[App Component]
        AUTH_COMP[Auth Components]
        TASK_COMP[Task Components]
        LAYOUT[Layout Components]
    end
    
    subgraph "API Endpoints"
        AUTH_API[/api/auth/*]
        USER_API[/api/users/*]
        TASK_API[/api/tasks/*]
    end
    
    subgraph "Services"
        AUTH_SERVICE[AuthService]
        USER_SERVICE[UserService]
        TASK_SERVICE[TaskService]
    end
    
    subgraph "Repositories"
        USER_REPO[UserRepository]
        TASK_REPO[TaskRepository]
    end
    
    subgraph "Database Tables"
        USERS[users]
        TASKS[tasks]
        CATEGORIES[categories]
    end
    
    APP --> AUTH_COMP
    APP --> TASK_COMP
    APP --> LAYOUT
    
    AUTH_COMP -->|HTTP| AUTH_API
    TASK_COMP -->|HTTP| TASK_API
    
    AUTH_API --> AUTH_SERVICE
    USER_API --> USER_SERVICE
    TASK_API --> TASK_SERVICE
    
    USER_SERVICE --> USER_REPO
    TASK_SERVICE --> TASK_REPO
    
    USER_REPO --> USERS
    TASK_REPO --> TASKS
    TASK_REPO --> CATEGORIES
````

## 4. 設計原則

### 4.1 アーキテクチャ原則
- **レイヤー分離**: 各レイヤーの責任を明確に分離し、依存関係を一方向に保つ
- **単一責任**: 各コンポーネントは単一の責任を持つ
- **疎結合**: コンポーネント間の依存関係を最小化
- **高凝集**: 関連する機能を同一コンポーネントに集約
- **テスタビリティ**: 各レイヤーが独立してテスト可能

### 4.2 設計パターン
| パターン名 | 適用箇所 | 目的 |
|------------|----------|------|
| MVC | Frontend Components | 表示・制御・データの分離 |
| Repository | Data Access | データアクセスの抽象化 |
| Service Layer | Business Logic | ビジネスロジックの集約 |
| Middleware | API Layer | 横断的関心事の処理 |
| Dependency Injection | Service Layer | 依存関係の管理 |

## 5. 非機能要件への対応

### 5.1 性能対応
| 要件 | 対応方法 | 実装箇所 |
|------|----------|----------|
| API応答時間200ms以下 | Redis キャッシュ | Infrastructure Layer |
| 画面表示500ms以下 | React.memo、useMemo | Presentation Layer |
| 同時接続50ユーザー | Connection Pool | Database |

### 5.2 セキュリティ対応
| 要件 | 対応方法 | 実装箇所 |
|------|----------|----------|
| JWT認証 | Authentication Middleware | Application Layer |
| 入力値検証 | Validation Middleware | Application Layer |
| レート制限 | Rate Limiting Middleware | Application Layer |
| HTTPS通信 | SSL/TLS | Infrastructure |

### 5.3 拡張性対応
| 要件 | 対応方法 | 実装箇所 |
|------|----------|----------|
| 水平スケーリング | ステートレス設計 | Application Layer |
| データベース拡張 | Repository パターン | Infrastructure Layer |
| 機能追加 | プラグイン設計 | Domain Layer |

## 6. 技術スタック概要

### 6.1 フロントエンド
- **React 18**: UI フレームワーク
- **TypeScript**: 型安全性
- **React Router**: ルーティング
- **Axios**: HTTP クライアント
- **Material-UI**: UI コンポーネント

### 6.2 バックエンド
- **Node.js**: ランタイム
- **Express**: Web フレームワーク
- **TypeScript**: 型安全性
- **JWT**: 認証
- **bcrypt**: パスワードハッシュ化

### 6.3 データベース
- **PostgreSQL**: メインデータベース
- **Redis**: キャッシュ・セッション
- **Prisma**: ORM

### 6.4 開発・運用
- **Jest**: テストフレームワーク
- **ESLint**: 静的解析
- **Winston**: ログ管理
- **Docker**: コンテナ化

## 7. 完了確認
- [x] システム全体像が明確に表現されている
- [x] レイヤー構成が適切に定義されている
- [x] コンポーネント間の関係が明確である
- [x] 設計原則が明文化されている
- [x] 非機能要件への対応が明記されている
- [x] 技術スタックが概要レベルで定義されている
- [x] Mermaid図が正しく作成されている
