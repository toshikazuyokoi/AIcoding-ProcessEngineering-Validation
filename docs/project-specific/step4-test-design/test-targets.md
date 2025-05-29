# テスト対象一覧

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | TEST-TARGETS-001 |
| 関連文書 | TEST-STRATEGY-001, CLASS-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 1. テスト対象概要

### 1.1 対象システム構成
| レイヤー | コンポーネント数 | テスト優先度 |
|----------|------------------|-------------|
| **Presentation Layer** | 8コンポーネント | 高 |
| **Application Layer** | 6コントローラー | 最高 |
| **Domain Layer** | 12サービス・エンティティ | 最高 |
| **Infrastructure Layer** | 8リポジトリ・サービス | 高 |

### 1.2 テスト分類
| 分類 | 対象数 | カバレッジ目標 |
|------|--------|----------------|
| **単体テスト** | 47クラス・380ケース | 95% |
| **結合テスト** | 20API + 12画面・65ケース | 85% |
| **E2Eテスト** | 12シナリオ・35ケース | 100% |
| **合計** | **480テストケース** | **90%** |

## 2. 単体テスト対象

### 2.1 フロントエンド (Presentation Layer)

#### 2.1.1 P-001: App コンポーネント
| テスト項目 | 優先度 | 複雑度 |
|------------|--------|--------|
| 初期レンダリング | 高 | 低 |
| 認証状態変更 | 最高 | 中 |
| ルーティング | 高 | 中 |
| テーマ切り替え | 中 | 低 |

#### 2.1.2 P-002: AuthForm コンポーネント
| テスト項目 | 優先度 | 複雑度 |
|------------|--------|--------|
| フォーム入力 | 最高 | 中 |
| バリデーション | 最高 | 高 |
| 送信処理 | 最高 | 高 |
| エラー表示 | 高 | 中 |

#### 2.1.3 P-003: TaskList コンポーネント
| テスト項目 | 優先度 | 複雑度 |
|------------|--------|--------|
| タスク一覧表示 | 最高 | 中 |
| フィルタリング | 高 | 高 |
| ページネーション | 高 | 中 |
| ソート機能 | 中 | 中 |

#### 2.1.4 P-004: TaskForm コンポーネント
| テスト項目 | 優先度 | 複雑度 |
|------------|--------|--------|
| フォーム入力 | 最高 | 中 |
| バリデーション | 最高 | 高 |
| 作成・更新処理 | 最高 | 高 |
| カテゴリ選択 | 高 | 中 |

### 2.2 バックエンド (Application Layer)

#### 2.2.1 A-001: AuthController
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| register() | 最高 | 高 | 8 |
| login() | 最高 | 高 | 6 |
| logout() | 高 | 低 | 3 |
| refreshToken() | 高 | 中 | 5 |

#### 2.2.2 A-002: TaskController
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| getTasks() | 最高 | 高 | 10 |
| getTaskById() | 高 | 中 | 6 |
| createTask() | 最高 | 高 | 8 |
| updateTask() | 最高 | 高 | 9 |
| deleteTask() | 高 | 中 | 5 |
| searchTasks() | 中 | 中 | 6 |

#### 2.2.3 A-003: AuthMiddleware
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| authenticate() | 最高 | 高 | 7 |
| authorize() | 最高 | 中 | 5 |
| extractUser() | 高 | 中 | 4 |

### 2.3 ドメイン層 (Domain Layer)

#### 2.3.1 D-001: User エンティティ
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| validatePassword() | 最高 | 中 | 4 |
| updateProfile() | 高 | 中 | 5 |
| isAdmin() | 高 | 低 | 3 |
| deactivate() | 中 | 低 | 2 |

#### 2.3.2 D-002: Task エンティティ
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| complete() | 最高 | 中 | 5 |
| reopen() | 高 | 中 | 4 |
| updatePriority() | 中 | 低 | 3 |
| isOverdue() | 高 | 中 | 6 |
| canEdit() | 高 | 中 | 4 |

#### 2.3.3 D-003: AuthService
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| register() | 最高 | 高 | 8 |
| authenticate() | 最高 | 高 | 7 |
| generateTokens() | 高 | 中 | 4 |
| validateToken() | 最高 | 高 | 6 |
| refreshToken() | 高 | 中 | 5 |
| checkEmailExists() | 高 | 中 | 4 |

#### 2.3.4 D-004: TaskService
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| createTask() | 最高 | 高 | 8 |
| updateTask() | 最高 | 高 | 9 |
| deleteTask() | 高 | 中 | 5 |
| getTasksByUser() | 最高 | 高 | 10 |
| searchTasks() | 中 | 中 | 6 |
| checkOwnership() | 最高 | 中 | 5 |

### 2.4 インフラ層 (Infrastructure Layer)

#### 2.4.1 I-001: UserRepository
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| create() | 最高 | 中 | 6 |
| findById() | 最高 | 低 | 4 |
| findByEmail() | 最高 | 低 | 4 |
| update() | 高 | 中 | 5 |
| delete() | 中 | 低 | 3 |
| findManyWithFilters() | 高 | 高 | 7 |
| countWithFilters() | 高 | 中 | 4 |

#### 2.4.2 I-002: TaskRepository
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| create() | 最高 | 中 | 6 |
| findById() | 最高 | 低 | 4 |
| findByUserId() | 最高 | 高 | 8 |
| findByUserIdWithFilters() | 最高 | 高 | 10 |
| countByUserIdWithFilters() | 高 | 中 | 5 |
| update() | 最高 | 中 | 6 |
| delete() | 高 | 中 | 4 |
| search() | 中 | 高 | 7 |
| findByIdWithCategories() | 高 | 中 | 5 |
| applyFilters() | 高 | 高 | 8 |

#### 2.4.3 I-003: TaskCategoryRepository
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| createRelations() | 最高 | 高 | 8 |
| updateRelations() | 高 | 高 | 7 |
| deleteRelations() | 高 | 中 | 5 |
| deleteByTaskId() | 高 | 中 | 4 |
| findByTaskId() | 中 | 低 | 3 |

#### 2.4.4 I-004: CategoryRepository
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| create() | 高 | 中 | 5 |
| findById() | 高 | 低 | 3 |
| findAll() | 高 | 低 | 3 |
| update() | 中 | 中 | 4 |
| delete() | 中 | 中 | 4 |
| findByName() | 中 | 低 | 3 |

#### 2.4.5 I-005: CacheService
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| get() | 高 | 中 | 5 |
| set() | 高 | 中 | 4 |
| delete() | 中 | 低 | 3 |
| invalidatePattern() | 中 | 中 | 4 |
| clear() | 中 | 低 | 2 |
| exists() | 中 | 低 | 3 |

#### 2.4.6 I-006: DatabaseConnection
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| connect() | 高 | 中 | 4 |
| disconnect() | 高 | 中 | 3 |
| isConnected() | 中 | 低 | 2 |
| healthCheck() | 中 | 中 | 3 |

#### 2.4.7 I-007: Logger
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| info() | 中 | 低 | 3 |
| error() | 高 | 中 | 4 |
| warn() | 中 | 低 | 3 |
| debug() | 低 | 低 | 2 |
| setLevel() | 中 | 低 | 3 |

#### 2.4.8 I-008: ErrorHandler
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| handlePrismaError() | 最高 | 高 | 8 |
| handleValidationError() | 最高 | 中 | 6 |
| handleAuthError() | 最高 | 中 | 5 |
| handleForeignKeyError() | 高 | 中 | 4 |
| handleGenericError() | 中 | 中 | 4 |

### 2.5 ユーティリティ・ヘルパー層

#### 2.5.1 U-001: PasswordHasher
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| hash() | 最高 | 中 | 5 |
| compare() | 最高 | 中 | 6 |
| generateSalt() | 高 | 低 | 3 |

#### 2.5.2 U-002: JWTManager
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| generateTokens() | 最高 | 高 | 7 |
| verifyToken() | 最高 | 高 | 8 |
| verifyRefreshToken() | 高 | 中 | 6 |
| extractPayload() | 高 | 中 | 5 |

#### 2.5.3 U-003: ZodValidator
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| validateRegisterData() | 最高 | 高 | 8 |
| validateLoginData() | 最高 | 中 | 6 |
| validateCreateTaskData() | 最高 | 高 | 9 |
| validateUpdateTaskData() | 最高 | 高 | 8 |
| validateSearchQuery() | 高 | 中 | 5 |
| validateUserListQuery() | 中 | 中 | 4 |

#### 2.5.4 U-004: ResponseBuilder
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| success() | 高 | 低 | 4 |
| error() | 高 | 中 | 5 |
| errorResponse() | 高 | 中 | 6 |
| paginatedResponse() | 中 | 中 | 4 |

#### 2.5.5 U-005: DateTimeHelper
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| isAfter() | 高 | 低 | 4 |
| getCurrentTimestamp() | 中 | 低 | 2 |
| formatDate() | 中 | 低 | 3 |
| parseDate() | 中 | 中 | 4 |

### 2.6 フロントエンド追加コンポーネント

#### 2.6.1 P-005: Dashboard
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| render() | 高 | 中 | 5 |
| fetchDashboardData() | 高 | 高 | 6 |
| handleRefresh() | 中 | 中 | 3 |

#### 2.6.2 P-006: Navigation
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| render() | 高 | 低 | 3 |
| handleNavigation() | 高 | 中 | 4 |
| handleLogout() | 高 | 中 | 3 |

#### 2.6.3 P-007: ErrorBoundary
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| componentDidCatch() | 高 | 中 | 4 |
| render() | 高 | 中 | 3 |
| handleError() | 高 | 中 | 4 |

#### 2.6.4 P-008: LoadingSpinner
| メソッド | 優先度 | 複雑度 | テストケース数 |
|----------|--------|--------|----------------|
| render() | 中 | 低 | 2 |
| show() | 中 | 低 | 2 |
| hide() | 中 | 低 | 2 |

## 3. 結合テスト対象

### 3.1 API結合テスト
| API エンドポイント | 優先度 | 複雑度 | 依存コンポーネント |
|-------------------|--------|--------|-------------------|
| POST /api/auth/register | 最高 | 高 | AuthController → AuthService → UserRepository |
| POST /api/auth/login | 最高 | 高 | AuthController → AuthService → UserRepository |
| GET /api/tasks | 最高 | 高 | TaskController → TaskService → TaskRepository |
| POST /api/tasks | 最高 | 高 | TaskController → TaskService → TaskRepository |
| PUT /api/tasks/:id | 最高 | 高 | TaskController → TaskService → TaskRepository |
| DELETE /api/tasks/:id | 高 | 中 | TaskController → TaskService → TaskRepository |

### 3.2 フロントエンド結合テスト
| 画面・機能 | 優先度 | 複雑度 | 依存コンポーネント |
|------------|--------|--------|-------------------|
| ログイン画面 | 最高 | 中 | AuthForm → API Client → AuthController |
| タスク一覧画面 | 最高 | 高 | TaskList → API Client → TaskController |
| タスク作成画面 | 最高 | 高 | TaskForm → API Client → TaskController |
| タスク編集画面 | 高 | 高 | TaskForm → API Client → TaskController |

## 4. E2Eテスト対象

### 4.1 ユーザーシナリオ
| シナリオ | 優先度 | 複雑度 | 実行時間目安 |
|----------|--------|--------|-------------|
| ユーザー登録〜ログイン | 最高 | 中 | 2分 |
| タスク作成〜完了 | 最高 | 高 | 3分 |
| タスク検索〜フィルタ | 高 | 中 | 2分 |
| タスク編集〜削除 | 高 | 中 | 2分 |
| 権限管理（管理者） | 中 | 高 | 4分 |
| エラーハンドリング | 中 | 中 | 3分 |
| パフォーマンス | 中 | 低 | 5分 |
| セキュリティ | 高 | 高 | 6分 |

## 5. テスト優先度マトリクス

### 5.1 優先度判定基準
| 優先度 | ビジネス影響 | 技術的複雑度 | 変更頻度 |
|--------|-------------|-------------|----------|
| **最高** | 高 | 高 | 高 |
| **高** | 高 | 中 | 中 |
| **中** | 中 | 中 | 低 |
| **低** | 低 | 低 | 低 |

### 5.2 テスト実行順序
1. **最高優先度**: 認証・タスクCRUD・権限管理
2. **高優先度**: 検索・フィルタ・エラーハンドリング
3. **中優先度**: UI/UX・パフォーマンス
4. **低優先度**: 管理機能・レポート

## 6. 完了確認
- [x] 全レイヤーのテスト対象が網羅されている
- [x] テスト優先度が適切に設定されている
- [x] 複雑度評価が実施されている
- [x] テストケース数が見積もられている
- [x] 結合テスト対象が明確である
- [x] E2Eシナリオが定義されている
- [x] 優先度マトリクスが作成されている
- [x] 実行順序が計画されている
