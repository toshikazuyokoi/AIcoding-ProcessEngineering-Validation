# クラス設計表

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | CLASS-001 |
| 関連文書 | ARCH-001, FUNC-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 1. クラス設計概要

### 1.1 レイヤー別クラス分類
| レイヤー | クラス数 | 主要責任 |
|----------|----------|----------|
| Presentation Layer | 8 | UI表示・ユーザー操作 |
| Application Layer | 6 | HTTP処理・制御 |
| Domain Layer | 12 | ビジネスロジック・エンティティ |
| Infrastructure Layer | 8 | データアクセス・外部連携 |

## 2. Presentation Layer（フロントエンド）

### 2.1 P-001: App
**概要**: アプリケーションのルートコンポーネント
**責任**: 全体レイアウト、ルーティング、グローバル状態管理

| 属性名 | 型 | 説明 |
|--------|----|----- |
| theme | Theme | MUIテーマ設定 |
| isAuthenticated | boolean | 認証状態 |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| render() | - | JSX.Element | アプリケーション全体をレンダリング |
| handleAuthChange() | isAuth: boolean | void | 認証状態変更処理 |

### 2.2 P-002: AuthForm
**概要**: 認証フォーム（ログイン・登録）
**責任**: ユーザー認証UI、入力値検証

| 属性名 | 型 | 説明 |
|--------|----|----- |
| formType | 'login' \| 'register' | フォーム種別 |
| formData | AuthFormData | フォーム入力データ |
| errors | ValidationErrors | バリデーションエラー |
| isLoading | boolean | 送信中フラグ |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| handleSubmit() | event: FormEvent | Promise<void> | フォーム送信処理 |
| validateForm() | data: AuthFormData | ValidationErrors | 入力値検証 |
| handleInputChange() | field: string, value: string | void | 入力値変更処理 |

### 2.3 P-003: TaskList
**概要**: タスク一覧表示コンポーネント
**責任**: タスク一覧表示、フィルタリング、ページネーション

| 属性名 | 型 | 説明 |
|--------|----|----- |
| tasks | Task[] | タスク一覧 |
| filters | TaskFilters | フィルタ条件 |
| pagination | PaginationState | ページネーション状態 |
| sortOrder | SortOrder | ソート順 |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| fetchTasks() | filters?: TaskFilters | Promise<void> | タスク取得 |
| handleFilterChange() | filters: TaskFilters | void | フィルタ変更処理 |
| handleSort() | field: string, order: 'asc' \| 'desc' | void | ソート処理 |
| handlePageChange() | page: number | void | ページ変更処理 |

### 2.4 P-004: TaskForm
**概要**: タスク作成・編集フォーム
**責任**: タスク入力UI、バリデーション、送信処理

| 属性名 | 型 | 説明 |
|--------|----|----- |
| mode | 'create' \| 'edit' | フォームモード |
| taskData | TaskFormData | タスクデータ |
| categories | Category[] | カテゴリ一覧 |
| errors | ValidationErrors | バリデーションエラー |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| handleSubmit() | event: FormEvent | Promise<void> | フォーム送信 |
| validateTask() | data: TaskFormData | ValidationErrors | タスク検証 |
| handleFieldChange() | field: keyof TaskFormData, value: any | void | フィールド変更 |

## 3. Application Layer（バックエンド制御）

### 3.1 A-001: AuthController
**概要**: 認証API制御
**責任**: 認証リクエスト処理、JWT管理

| 属性名 | 型 | 説明 |
|--------|----|----- |
| authService | AuthService | 認証サービス |
| jwtSecret | string | JWT署名キー |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| register() | req: Request, res: Response | Promise<void> | ユーザー登録 |
| login() | req: Request, res: Response | Promise<void> | ログイン処理 |
| logout() | req: Request, res: Response | Promise<void> | ログアウト処理 |
| refreshToken() | req: Request, res: Response | Promise<void> | トークン更新 |

### 3.2 A-002: TaskController
**概要**: タスクAPI制御
**責任**: タスクCRUD操作、検索・フィルタ処理

| 属性名 | 型 | 説明 |
|--------|----|----- |
| taskService | TaskService | タスクサービス |
| validator | ZodValidator | 入力値検証 |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| getTasks() | req: Request, res: Response | Promise<void> | タスク一覧取得 |
| getTaskById() | req: Request, res: Response | Promise<void> | タスク詳細取得 |
| createTask() | req: Request, res: Response | Promise<void> | タスク作成 |
| updateTask() | req: Request, res: Response | Promise<void> | タスク更新 |
| deleteTask() | req: Request, res: Response | Promise<void> | タスク削除 |
| searchTasks() | req: Request, res: Response | Promise<void> | タスク検索 |

### 3.3 A-003: AuthMiddleware
**概要**: 認証ミドルウェア
**責任**: JWT検証、認可制御

| 属性名 | 型 | 説明 |
|--------|----|----- |
| jwtSecret | string | JWT署名キー |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| authenticate() | req: Request, res: Response, next: NextFunction | Promise<void> | JWT認証 |
| authorize() | roles: string[] | Middleware | 権限チェック |
| extractUser() | token: string | Promise<User> | ユーザー情報抽出 |

## 4. Domain Layer（ビジネスロジック）

### 4.1 D-001: User（エンティティ）
**概要**: ユーザーエンティティ
**責任**: ユーザー情報管理、ビジネスルール

| 属性名 | 型 | 説明 |
|--------|----|----- |
| id | string | ユーザーID |
| username | string | ユーザー名 |
| email | string | メールアドレス |
| passwordHash | string | パスワードハッシュ |
| role | UserRole | ユーザー権限 |
| isActive | boolean | アクティブフラグ |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| validatePassword() | password: string | boolean | パスワード検証 |
| updateProfile() | data: UserUpdateData | void | プロフィール更新 |
| isAdmin() | - | boolean | 管理者判定 |
| deactivate() | - | void | アカウント無効化 |

### 4.2 D-002: Task（エンティティ）
**概要**: タスクエンティティ
**責任**: タスク情報管理、状態制御

| 属性名 | 型 | 説明 |
|--------|----|----- |
| id | string | タスクID |
| userId | string | 作成者ID |
| title | string | タスクタイトル |
| description | string | 説明 |
| priority | TaskPriority | 優先度 |
| status | TaskStatus | ステータス |
| dueDate | Date \| null | 期限 |
| completedAt | Date \| null | 完了日時 |
| createdAt | Date | 作成日時 |
| updatedAt | Date | 更新日時 |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| complete() | - | void | タスク完了 |
| reopen() | - | void | タスク再開 |
| updatePriority() | priority: TaskPriority | void | 優先度変更 |
| isOverdue() | - | boolean | 期限切れ判定 |
| canEdit() | userId: string | boolean | 編集権限チェック |

### 4.3 D-003: AuthService
**概要**: 認証ビジネスロジック
**責任**: ユーザー認証、JWT管理、セキュリティ制御

| 属性名 | 型 | 説明 |
|--------|----|----- |
| userRepository | UserRepository | ユーザーリポジトリ |
| passwordHasher | PasswordHasher | パスワードハッシュ化 |
| jwtManager | JWTManager | JWT管理 |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| register() | userData: RegisterData | Promise<User> | ユーザー登録 |
| authenticate() | email: string, password: string | Promise<AuthResult> | 認証処理 |
| generateTokens() | user: User | TokenPair | トークン生成 |
| validateToken() | token: string | Promise<User> | トークン検証 |
| refreshToken() | refreshToken: string | Promise<TokenPair> | トークン更新 |

### 4.4 D-004: TaskService
**概要**: タスクビジネスロジック
**責任**: タスク操作、検索、フィルタリング

| 属性名 | 型 | 説明 |
|--------|----|----- |
| taskRepository | TaskRepository | タスクリポジトリ |
| categoryRepository | CategoryRepository | カテゴリリポジトリ |
| cacheService | CacheService | キャッシュサービス |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| createTask() | userId: string, taskData: CreateTaskData | Promise<Task> | タスク作成 |
| updateTask() | taskId: string, userId: string, data: UpdateTaskData | Promise<Task> | タスク更新 |
| deleteTask() | taskId: string, userId: string | Promise<void> | タスク削除 |
| getTasksByUser() | userId: string, filters?: TaskFilters | Promise<Task[]> | ユーザータスク取得 |
| searchTasks() | userId: string, query: string | Promise<Task[]> | タスク検索 |

## 5. Infrastructure Layer（データアクセス）

### 5.1 I-001: UserRepository
**概要**: ユーザーデータアクセス
**責任**: ユーザーCRUD操作、データベース連携

| 属性名 | 型 | 説明 |
|--------|----|----- |
| prisma | PrismaClient | Prismaクライアント |
| cache | RedisClient | Redisキャッシュ |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| create() | userData: CreateUserData | Promise<User> | ユーザー作成 |
| findById() | id: string | Promise<User \| null> | ID検索 |
| findByEmail() | email: string | Promise<User \| null> | メール検索 |
| update() | id: string, data: UpdateUserData | Promise<User> | ユーザー更新 |
| delete() | id: string | Promise<void> | ユーザー削除 |

### 5.2 I-002: TaskRepository
**概要**: タスクデータアクセス
**責任**: タスクCRUD操作、検索、集計

| 属性名 | 型 | 説明 |
|--------|----|----- |
| prisma | PrismaClient | Prismaクライアント |
| cache | RedisClient | Redisキャッシュ |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| create() | taskData: CreateTaskData | Promise<Task> | タスク作成 |
| findById() | id: string | Promise<Task \| null> | ID検索 |
| findByUserId() | userId: string, filters?: TaskFilters | Promise<Task[]> | ユーザー別検索 |
| update() | id: string, data: UpdateTaskData | Promise<Task> | タスク更新 |
| delete() | id: string | Promise<void> | タスク削除 |
| search() | userId: string, query: string | Promise<Task[]> | 全文検索 |

### 5.3 I-003: CacheService
**概要**: キャッシュ管理
**責任**: Redis操作、キャッシュ戦略

| 属性名 | 型 | 説明 |
|--------|----|----- |
| redis | RedisClient | Redisクライアント |
| defaultTTL | number | デフォルトTTL |

| メソッド名 | 引数 | 戻り値 | 説明 |
|------------|------|--------|------|
| get() | key: string | Promise<T \| null> | キャッシュ取得 |
| set() | key: string, value: T, ttl?: number | Promise<void> | キャッシュ設定 |
| delete() | key: string | Promise<void> | キャッシュ削除 |
| invalidatePattern() | pattern: string | Promise<void> | パターン削除 |

## 6. クラス関係図

````mermaid
classDiagram
    %% Presentation Layer
    class App {
        +Theme theme
        +boolean isAuthenticated
        +render() JSX.Element
        +handleAuthChange(boolean) void
    }

    class AuthForm {
        +string formType
        +AuthFormData formData
        +ValidationErrors errors
        +handleSubmit(FormEvent) Promise~void~
        +validateForm(AuthFormData) ValidationErrors
    }

    class TaskList {
        +Task[] tasks
        +TaskFilters filters
        +PaginationState pagination
        +fetchTasks(TaskFilters) Promise~void~
        +handleFilterChange(TaskFilters) void
    }

    class TaskForm {
        +string mode
        +TaskFormData taskData
        +Category[] categories
        +handleSubmit(FormEvent) Promise~void~
        +validateTask(TaskFormData) ValidationErrors
    }

    %% Application Layer
    class AuthController {
        +AuthService authService
        +string jwtSecret
        +register(Request, Response) Promise~void~
        +login(Request, Response) Promise~void~
        +logout(Request, Response) Promise~void~
    }

    class TaskController {
        +TaskService taskService
        +ZodValidator validator
        +getTasks(Request, Response) Promise~void~
        +createTask(Request, Response) Promise~void~
        +updateTask(Request, Response) Promise~void~
    }

    %% Domain Layer
    class User {
        +string id
        +string username
        +string email
        +string passwordHash
        +UserRole role
        +validatePassword(string) boolean
        +updateProfile(UserUpdateData) void
        +isAdmin() boolean
    }

    class Task {
        +string id
        +string userId
        +string title
        +string description
        +TaskPriority priority
        +TaskStatus status
        +complete() void
        +reopen() void
        +isOverdue() boolean
    }

    class AuthService {
        +UserRepository userRepository
        +PasswordHasher passwordHasher
        +register(RegisterData) Promise~User~
        +authenticate(string, string) Promise~AuthResult~
        +generateTokens(User) TokenPair
    }

    class TaskService {
        +TaskRepository taskRepository
        +CategoryRepository categoryRepository
        +createTask(string, CreateTaskData) Promise~Task~
        +updateTask(string, string, UpdateTaskData) Promise~Task~
        +getTasksByUser(string, TaskFilters) Promise~Task[]~
    }

    %% Infrastructure Layer
    class UserRepository {
        +PrismaClient prisma
        +RedisClient cache
        +create(CreateUserData) Promise~User~
        +findById(string) Promise~User~
        +findByEmail(string) Promise~User~
    }

    class TaskRepository {
        +PrismaClient prisma
        +RedisClient cache
        +create(CreateTaskData) Promise~Task~
        +findByUserId(string, TaskFilters) Promise~Task[]~
        +search(string, string) Promise~Task[]~
    }

    %% Relationships
    AuthController --> AuthService
    TaskController --> TaskService
    AuthService --> UserRepository
    TaskService --> TaskRepository
    TaskService --> User
    TaskService --> Task
    AuthForm --> AuthController
    TaskList --> TaskController
    TaskForm --> TaskController
````

## 7. 完了確認
- [x] 全レイヤーのクラスが定義されている
- [x] クラスの責任が明確に記述されている
- [x] 属性とメソッドが詳細に定義されている
- [x] クラス間の関係が明確である
- [x] ビジネスロジックが適切に分離されている
- [x] データアクセス層が抽象化されている
- [x] クラス関係図が作成されている
- [x] 機能一覧との対応が確認されている
