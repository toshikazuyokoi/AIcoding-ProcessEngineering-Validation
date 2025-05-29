# ファイル単位タスクリスト

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | TASK-001 |
| 関連文書 | IMPL-PLAN-001, CLASS-001, FLOW-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 概要

本文書は、STEP 6「ToDoリスト作成」の第一段階として、実装対象ファイルを洗い出し、タスクIDを付与したファイル単位タスクリストです。

**重要**: このリストは、プロセスエンジニアリング手法の核心部分であり、ファイル単位タスク管理と7つの標準サブタスクによる品質保証を実現します。

## 参照文書
- `docs/project-specific/step5-implementation/implementation-plan.md` - 実装計画書
- `docs/project-specific/step3-detailed-design/class-design.md` - クラス設計表
- `docs/templates/step6-todo-creation-guide.md` - 作成手順書

## 1. プロジェクト規模判定

### 1.1 基本情報
- **総実装ファイル数**: 89ファイル
- **プロジェクト規模**: 大規模プロジェクト（30ファイル以上）
- **管理方式**: 実装フェーズ単位管理
- **カテゴリ数**: 8カテゴリ

### 1.2 複雑度評価
| 要素 | 評価 | 係数 | 説明 |
|------|------|------|------|
| ドメイン複雑度 | 中 | 1.3 | タスク管理システム（標準的なCRUD） |
| 技術複雑度 | 高 | 1.5 | TypeScript + React + Express + Docker + CI/CD |
| チーム規模 | 小 | 1.0 | 1-2名での開発 |
| **調整後ファイル数** | **116ファイル相当** | **1.3** | 大規模プロジェクト |

## 2. タスクID命名規則

### 2.1 基本形式
**TSK-{連番3桁}-{レイヤー}-{ファイル名}**

### 2.2 レイヤー略語
| 略語 | 意味 | 例 |
|------|------|-----|
| **ENV** | Environment（環境設定） | TSK-001-ENV-gitignore |
| **INF** | Infrastructure（インフラ層） | TSK-002-INF-DatabaseConnection |
| **ENT** | Entity（エンティティ） | TSK-003-ENT-User |
| **SVC** | Service（サービス） | TSK-004-SVC-AuthService |
| **REP** | Repository（リポジトリ） | TSK-005-REP-UserRepository |
| **CTL** | Controller（コントローラ） | TSK-006-CTL-AuthController |
| **MID** | Middleware（ミドルウェア） | TSK-007-MID-AuthMiddleware |
| **UTL** | Utility（ユーティリティ） | TSK-008-UTL-ZodValidator |
| **CMP** | Component（コンポーネント） | TSK-009-CMP-AuthForm |
| **CTX** | Context（コンテキスト） | TSK-010-CTX-AuthContext |
| **CFG** | Configuration（設定） | TSK-011-CFG-Database |
| **SCR** | Script（スクリプト） | TSK-012-SCR-SetupDev |
| **TST** | Test（テスト） | TSK-013-TST-AuthService |
| **TYP** | Types（型定義） | TSK-014-TYP-User |
| **HKS** | Hooks（フック） | TSK-015-HKS-UseAuth |
| **K8S** | Kubernetes（K8s設定） | TSK-016-K8S-Deployment |
| **TER** | Terraform（インフラコード） | TSK-017-TER-Main |

## 3. 実装順序と依存関係

### 3.1 依存関係マップ
```
Phase 0 (環境) → Phase 1 (Infrastructure) → Phase 2 (Domain) → Phase 3 (Application) → Phase 4 (Presentation)
```

### 3.2 レイヤー内依存関係
```
Entity → Repository Interface → Service → Controller
Entity → Repository Implementation (Infrastructure)
Utility → Service → Controller → Component
```

## 4. ファイル単位タスク一覧（概要）

### 4.1 タスクリスト分割構成
詳細なタスクリストは以下のファイルに分割して管理：

| Phase | ファイル名 | タスク数 | 説明 |
|-------|------------|----------|------|
| **Phase 0** | `phase0-environment-tasks.md` | 28タスク | 環境セットアップ |
| **Phase 1** | `phase1-infrastructure-tasks.md` | 20タスク | Infrastructure Layer |
| **Phase 2** | `phase2-domain-tasks.md` | 15タスク | Domain Layer |
| **Phase 3** | `phase3-application-tasks.md` | 12タスク | Application Layer |
| **Phase 4** | `phase4-presentation-tasks.md` | 14タスク | Presentation Layer |

### 4.2 Phase別概要

#### Phase 0: 環境セットアップ（28タスク）
- **基本環境設定**: .gitignore, README.md, Makefile
- **Docker環境**: docker-compose.yml, Dockerfile群
- **データベース・インフラ設定**: Prisma, PostgreSQL, Redis, Nginx
- **CI/CD・スクリプト**: GitHub Actions, クロスプラットフォームスクリプト

#### Phase 1: Infrastructure Layer（20タスク）
- **基盤ユーティリティ**: database-connection, logger, error-handler
- **セキュリティ**: password-hasher, jwt-manager
- **キャッシュ・設定**: cache-service, 設定ファイル群
- **リポジトリ層**: user-repository, task-repository

#### Phase 2: Domain Layer（15タスク）
- **エンティティ**: User, Task, Category
- **ドメインサービス**: AuthService, TaskService, UserService
- **型定義**: エンティティ型, ビジネスロジック型

#### Phase 3: Application Layer（12タスク）
- **バリデーション・ユーティリティ**: zod-validator, response-builder
- **ミドルウェア**: auth-middleware
- **コントローラー**: auth-controller, task-controller, user-controller

#### Phase 4: Presentation Layer（14タスク）
- **API・認証**: api-client, auth-context
- **コンポーネント**: AuthForm, TaskList, TaskForm, Dashboard, App
- **フック・ユーティリティ**: カスタムフック群

## 5. 統計情報

### 5.1 Phase別集計
| Phase | タスク数 | 総見積時間 | 平均複雑度 | 最高優先度タスク数 |
|-------|----------|------------|------------|-------------------|
| Phase 0 | 28 | 62h | 低-中 | 12 |
| Phase 1 | 20 | 98h | 中-高 | 8 |
| Phase 2 | 15 | 84h | 中-高 | 9 |
| Phase 3 | 12 | 67h | 中-高 | 6 |
| Phase 4 | 14 | 89h | 中-高 | 8 |
| **合計** | **89** | **400h** | **中** | **43** |

### 5.2 複雑度別集計
| 複雑度 | タスク数 | 割合 | 展開レベル |
|--------|----------|------|------------|
| 高 | 26 | 29% | 全展開（詳細サブタスク） |
| 中 | 45 | 51% | 中展開（標準サブタスク） |
| 低 | 18 | 20% | 簡略展開（7つの標準サブタスクのみ） |

### 5.3 優先度別集計
| 優先度 | タスク数 | 割合 | 実装順序 |
|--------|----------|------|----------|
| 最高 | 43 | 48% | 最優先実装 |
| 高 | 28 | 31% | 通常優先度 |
| 中 | 18 | 21% | 後回し可能 |

### 5.4 ファイル分割構成
| 分割ファイル | 管理対象 | タスク数 | 目的 |
|-------------|----------|----------|------|
| `phase0-environment-tasks.md` | 環境セットアップ | 28 | Docker、CI/CD、スクリプト |
| `phase1-infrastructure-tasks.md` | インフラ層 | 20 | DB接続、ユーティリティ、リポジトリ |
| `phase2-domain-tasks.md` | ドメイン層 | 15 | エンティティ、ビジネスロジック |
| `phase3-application-tasks.md` | アプリケーション層 | 12 | コントローラー、ミドルウェア |
| `phase4-presentation-tasks.md` | プレゼンテーション層 | 14 | React コンポーネント、UI |

## 6. 完了確認
- [x] 全実装ファイル（89ファイル）がタスクとして定義されている
- [x] タスクIDが命名規則に従っている
- [x] 依存関係が正しく設定されている
- [x] 見積時間が設定されている
- [x] 優先度が設定されている
- [x] 複雑度が評価されている
- [x] プロジェクト規模（大規模）に応じた管理方式が選択されている
- [x] ファイル分割によるタスクリスト管理が計画されている
- [x] Phase別詳細タスクリストの作成準備が完了している
- [x] 次ステップ（ToDoリスト作成）への引き継ぎ情報が整理されている
