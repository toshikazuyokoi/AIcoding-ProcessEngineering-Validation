# 処理フロー定義書

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | FLOW-001 |
| 関連文書 | CLASS-001, METHOD-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 1. 主要処理フロー

### 1.1 ユーザー登録処理フロー

#### AuthController.register()
**処理概要**: 新規ユーザー登録の制御
**呼び出し元**: POST /api/auth/register

**処理ステップ**:
1. **入力値検証**
   - `ZodValidator.validateRegisterData(req.body)` 呼び出し
   - バリデーションエラー時は400エラーレスポンス

2. **重複チェック**
   - `AuthService.checkEmailExists(email)` 呼び出し
   - 重複時は409エラーレスポンス

3. **ユーザー作成**
   - `AuthService.register(userData)` 呼び出し
   - 成功時はユーザー情報とトークンを取得

4. **レスポンス生成**
   - 201ステータスで成功レスポンス
   - エラー時は適切なエラーレスポンス

**呼び出し構造**:
```
AuthController.register()
├── ZodValidator.validateRegisterData()
├── AuthService.checkEmailExists()
│   └── UserRepository.findByEmail()
├── AuthService.register()
│   ├── PasswordHasher.hash()
│   ├── UserRepository.create()
│   └── JWTManager.generateTokens()
└── ResponseBuilder.success() / ResponseBuilder.error()
```

#### AuthService.register()
**処理概要**: ユーザー登録のビジネスロジック
**呼び出し元**: AuthController.register()

**処理ステップ**:
1. **パスワードハッシュ化**
   - `PasswordHasher.hash(password, saltRounds: 12)` 呼び出し
   - bcryptを使用した安全なハッシュ化

2. **ユーザーデータ作成**
   - `UserRepository.create(userData)` 呼び出し
   - データベースへの永続化

3. **トークン生成**
   - `JWTManager.generateTokens(user)` 呼び出し
   - アクセストークンとリフレッシュトークンを生成

4. **キャッシュ設定**
   - `CacheService.set(userCacheKey, user, ttl: 3600)` 呼び出し
   - ユーザー情報の1時間キャッシュ

**呼び出し構造**:
```
AuthService.register()
├── PasswordHasher.hash()
├── UserRepository.create()
│   └── PrismaClient.user.create()
├── JWTManager.generateTokens()
│   ├── jwt.sign() (accessToken)
│   └── jwt.sign() (refreshToken)
└── CacheService.set()
    └── RedisClient.setex()
```

### 1.2 タスク作成処理フロー

#### TaskController.createTask()
**処理概要**: タスク作成の制御
**呼び出し元**: POST /api/tasks

**処理ステップ**:
1. **認証確認**
   - `AuthMiddleware.authenticate()` で事前実行済み
   - `req.user` からユーザー情報取得

2. **入力値検証**
   - `ZodValidator.validateCreateTaskData(req.body)` 呼び出し
   - バリデーションエラー時は400エラーレスポンス

3. **カテゴリ存在確認**
   - `CategoryService.validateCategories(categoryIds)` 呼び出し
   - 存在しないカテゴリがある場合は400エラー

4. **タスク作成**
   - `TaskService.createTask(userId, taskData)` 呼び出し
   - 成功時はタスク情報を取得

5. **レスポンス生成**
   - 201ステータスで成功レスポンス

**呼び出し構造**:
```
TaskController.createTask()
├── ZodValidator.validateCreateTaskData()
├── CategoryService.validateCategories()
│   └── CategoryRepository.findByIds()
├── TaskService.createTask()
│   ├── TaskRepository.create()
│   ├── TaskCategoryRepository.createRelations()
│   └── CacheService.invalidatePattern()
└── ResponseBuilder.success()
```

#### TaskService.createTask()
**処理概要**: タスク作成のビジネスロジック
**呼び出し元**: TaskController.createTask()

**処理ステップ**:
1. **タスクデータ準備**
   - 入力データの正規化
   - デフォルト値の設定（priority: 'medium', status: 'pending'）

2. **タスク作成**
   - `TaskRepository.create(taskData)` 呼び出し
   - データベースへの永続化

3. **カテゴリ関連付け**
   - `TaskCategoryRepository.createRelations(taskId, categoryIds)` 呼び出し
   - タスクとカテゴリの多対多関係を作成

4. **キャッシュ無効化**
   - `CacheService.invalidatePattern(userTasksPattern)` 呼び出し
   - ユーザーのタスク一覧キャッシュを無効化

5. **完全なタスク情報取得**
   - `TaskRepository.findByIdWithCategories(taskId)` 呼び出し
   - カテゴリ情報を含む完全なタスクデータを返却

**呼び出し構造**:
```
TaskService.createTask()
├── TaskRepository.create()
│   └── PrismaClient.task.create()
├── TaskCategoryRepository.createRelations()
│   └── PrismaClient.taskCategory.createMany()
├── CacheService.invalidatePattern()
│   └── RedisClient.del()
└── TaskRepository.findByIdWithCategories()
    └── PrismaClient.task.findUnique({ include: { categories: true } })
```

### 1.3 タスク一覧取得処理フロー

#### TaskController.getTasks()
**処理概要**: タスク一覧取得の制御
**呼び出し元**: GET /api/tasks

**処理ステップ**:
1. **認証確認**
   - `AuthMiddleware.authenticate()` で事前実行済み
   - `req.user` からユーザー情報取得

2. **クエリパラメータ検証**
   - `ZodValidator.validateTaskListQuery(req.query)` 呼び出し
   - フィルタ・ページネーション・ソート条件の検証

3. **キャッシュ確認**
   - `CacheService.get(cacheKey)` 呼び出し
   - キャッシュヒット時はキャッシュデータを返却

4. **タスク一覧取得**
   - `TaskService.getTasksByUser(userId, filters)` 呼び出し
   - フィルタ・ソート・ページネーション適用

5. **キャッシュ設定**
   - `CacheService.set(cacheKey, result, ttl: 300)` 呼び出し
   - 5分間のキャッシュ設定

6. **レスポンス生成**
   - 200ステータスで成功レスポンス

**呼び出し構造**:
```
TaskController.getTasks()
├── ZodValidator.validateTaskListQuery()
├── CacheService.get()
├── TaskService.getTasksByUser()
│   ├── TaskRepository.findByUserIdWithFilters()
│   └── TaskRepository.countByUserIdWithFilters()
├── CacheService.set()
└── ResponseBuilder.success()
```

#### TaskService.getTasksByUser()
**処理概要**: ユーザーのタスク一覧取得ビジネスロジック
**呼び出し元**: TaskController.getTasks()

**処理ステップ**:
1. **フィルタ条件構築**
   - 検索クエリ、ステータス、優先度、期限範囲の条件構築
   - Prisma where条件オブジェクトの生成

2. **ソート条件構築**
   - sortBy, sortOrderからPrisma orderBy条件の生成
   - デフォルト: createdAt desc

3. **タスク一覧取得**
   - `TaskRepository.findByUserIdWithFilters(userId, filters, pagination)` 呼び出し
   - カテゴリ情報を含むタスクデータの取得

4. **総件数取得**
   - `TaskRepository.countByUserIdWithFilters(userId, filters)` 呼び出し
   - ページネーション計算用の総件数取得

5. **ページネーション情報計算**
   - 総ページ数、次ページ・前ページ存在フラグの計算
   - PaginationInfo オブジェクトの生成

**呼び出し構造**:
```
TaskService.getTasksByUser()
├── FilterBuilder.buildTaskFilters()
├── SortBuilder.buildTaskSort()
├── TaskRepository.findByUserIdWithFilters()
│   └── PrismaClient.task.findMany({
│       where, orderBy, skip, take,
│       include: { categories: true }
│   })
├── TaskRepository.countByUserIdWithFilters()
│   └── PrismaClient.task.count({ where })
└── PaginationCalculator.calculate()
```

## 2. 認証・認可処理フロー

### 2.1 JWT認証ミドルウェア

#### AuthMiddleware.authenticate()
**処理概要**: JWT認証の実行
**呼び出し元**: 保護されたAPIエンドポイント

**処理ステップ**:
1. **トークン抽出**
   - `TokenExtractor.extractFromHeader(req.headers.authorization)` 呼び出し
   - Bearer トークンの抽出

2. **トークン検証**
   - `JWTManager.verifyToken(token)` 呼び出し
   - JWT署名・有効期限の検証

3. **ユーザー情報取得**
   - `UserService.getUserById(payload.userId)` 呼び出し
   - キャッシュ優先でユーザー情報取得

4. **リクエストオブジェクト設定**
   - `req.user = user` でユーザー情報を設定
   - 後続処理でユーザー情報を利用可能にする

**呼び出し構造**:
```
AuthMiddleware.authenticate()
├── TokenExtractor.extractFromHeader()
├── JWTManager.verifyToken()
│   └── jwt.verify()
├── UserService.getUserById()
│   ├── CacheService.get()
│   └── UserRepository.findById() (キャッシュミス時)
└── next() (成功時) / ResponseBuilder.error() (失敗時)
```

## 3. データアクセス層処理フロー

### 3.1 UserRepository.create()
**処理概要**: ユーザーデータの永続化
**呼び出し元**: AuthService.register()

**処理ステップ**:
1. **データ検証**
   - 入力データの型チェック
   - 必須フィールドの存在確認

2. **一意性制約チェック**
   - `PrismaClient.user.findUnique({ where: { email } })` 呼び出し
   - メールアドレスの重複確認

3. **ユーザー作成**
   - `PrismaClient.user.create({ data: userData })` 呼び出し
   - データベースへの挿入

4. **エラーハンドリング**
   - Prisma例外の捕捉と適切なエラーへの変換
   - 制約違反、接続エラー等の処理

**呼び出し構造**:
```
UserRepository.create()
├── DataValidator.validateUserData()
├── PrismaClient.user.findUnique() (重複チェック)
├── PrismaClient.user.create()
└── ErrorHandler.handlePrismaError()
```

### 3.2 TaskRepository.findByUserIdWithFilters()
**処理概要**: フィルタ条件付きタスク検索
**呼び出し元**: TaskService.getTasksByUser()

**処理ステップ**:
1. **WHERE条件構築**
   - ユーザーID条件の設定
   - ステータス、優先度フィルタの適用
   - 検索クエリ（タイトル・説明の部分一致）の適用
   - 期限範囲フィルタの適用

2. **ORDER BY条件構築**
   - ソートフィールドとソート順の設定
   - 複数ソート条件の対応

3. **LIMIT/OFFSET設定**
   - ページネーション用のskip, take値の計算
   - 最大取得件数の制限

4. **関連データ取得**
   - カテゴリ情報のinclude設定
   - N+1問題の回避

5. **クエリ実行**
   - `PrismaClient.task.findMany()` 呼び出し
   - 結果の返却

**呼び出し構造**:
```
TaskRepository.findByUserIdWithFilters()
├── WhereBuilder.buildTaskWhere()
│   ├── UserFilter.apply()
│   ├── StatusFilter.apply()
│   ├── PriorityFilter.apply()
│   ├── SearchFilter.apply()
│   └── DateRangeFilter.apply()
├── OrderByBuilder.buildTaskOrderBy()
├── PaginationBuilder.buildPagination()
└── PrismaClient.task.findMany({
    where, orderBy, skip, take,
    include: { categories: true }
})
```

## 4. フロントエンド処理フロー

### 4.1 TaskList.fetchTasks()
**処理概要**: タスク一覧の取得と表示
**呼び出し元**: TaskListコンポーネントのuseEffect

**処理ステップ**:
1. **ローディング状態設定**
   - `setLoading(true)` でローディング表示開始

2. **APIリクエスト構築**
   - フィルタ条件をクエリパラメータに変換
   - `URLSearchParams` でクエリ文字列生成

3. **API呼び出し**
   - `ApiClient.get('/api/tasks', { params: queryParams })` 呼び出し
   - Axiosインターセプターで認証ヘッダー自動付与

4. **レスポンス処理**
   - 成功時: `setTasks(response.data.tasks)`, `setPagination(response.data.pagination)`
   - エラー時: `setError(error.message)`, エラートースト表示

5. **ローディング状態解除**
   - `setLoading(false)` でローディング表示終了

**呼び出し構造**:
```
TaskList.fetchTasks()
├── setLoading(true)
├── QueryParamsBuilder.build()
├── ApiClient.get()
│   ├── AxiosInterceptor.addAuthHeader()
│   └── AxiosInterceptor.handleResponse()
├── setTasks() / setError()
├── setLoading(false)
└── ToastService.showError() (エラー時)
```

### 4.2 TaskForm.handleSubmit()
**処理概要**: タスクフォームの送信処理
**呼び出し元**: フォームsubmitイベント

**処理ステップ**:
1. **フォーム検証**
   - `validateForm()` でクライアント側バリデーション実行
   - エラー時は送信を中止

2. **送信状態設定**
   - `setIsSubmitting(true)` で送信中状態に設定
   - 送信ボタンの無効化

3. **データ変換**
   - フォームデータをAPI形式に変換
   - 日付文字列のISO形式変換

4. **API呼び出し**
   - 作成モード: `ApiClient.post('/api/tasks', taskData)`
   - 編集モード: `ApiClient.put(`/api/tasks/${taskId}`, taskData)`

5. **結果処理**
   - 成功時: 成功トースト表示、フォームリセット、親コンポーネントへの通知
   - エラー時: エラーメッセージ表示、フィールドエラーの設定

6. **送信状態解除**
   - `setIsSubmitting(false)` で送信中状態を解除

**呼び出し構造**:
```
TaskForm.handleSubmit()
├── validateForm()
│   ├── TitleValidator.validate()
│   ├── DescriptionValidator.validate()
│   ├── DueDateValidator.validate()
│   └── CategoryValidator.validate()
├── setIsSubmitting(true)
├── DataTransformer.toApiFormat()
├── ApiClient.post() / ApiClient.put()
│   └── AxiosInterceptor.addAuthHeader()
├── onSuccess() / setErrors()
├── ToastService.showSuccess() / ToastService.showError()
└── setIsSubmitting(false)
```

## 5. エラーハンドリング処理フロー

### 5.1 グローバルエラーハンドラー
**処理概要**: 未処理例外の統一的な処理
**呼び出し元**: Express エラーミドルウェア

**処理ステップ**:
1. **エラー分類**
   - `ErrorClassifier.classify(error)` でエラー種別を判定
   - ValidationError, DatabaseError, AuthError等に分類

2. **ログ出力**
   - `Logger.error(error, context)` でエラーログ出力
   - スタックトレース、リクエスト情報の記録

3. **レスポンス生成**
   - エラー種別に応じた適切なHTTPステータスコード設定
   - 本番環境では詳細なエラー情報を隠蔽

4. **監視通知**
   - 重要なエラーは監視システムに通知
   - `MonitoringService.notifyError(error)` 呼び出し

**呼び出し構造**:
```
GlobalErrorHandler.handle()
├── ErrorClassifier.classify()
├── Logger.error()
├── ResponseBuilder.errorResponse()
├── MonitoringService.notifyError() (重要エラー時)
└── res.status().json()
```

## 6. キャッシュ戦略処理フロー

### 6.1 CacheService.get()
**処理概要**: キャッシュからのデータ取得
**呼び出し元**: 各サービス層

**処理ステップ**:
1. **キー正規化**
   - `KeyNormalizer.normalize(key)` でキー形式統一

2. **Redis接続確認**
   - `RedisClient.isConnected()` で接続状態確認
   - 未接続時はnullを返却（キャッシュミス扱い）

3. **データ取得**
   - `RedisClient.get(normalizedKey)` でデータ取得

4. **デシリアライゼーション**
   - `JSON.parse()` でオブジェクトに変換
   - パース失敗時はnullを返却

5. **TTL確認**
   - `RedisClient.ttl(normalizedKey)` で残り有効期限確認
   - 期限切れ間近の場合は事前無効化

**呼び出し構造**:
```
CacheService.get()
├── KeyNormalizer.normalize()
├── RedisClient.isConnected()
├── RedisClient.get()
├── JSON.parse()
├── RedisClient.ttl()
└── return data / null
```

## 7. 未定義メソッドの処理フロー

### 7.1 TaskController.updateTask()
**処理概要**: タスク更新の制御
**呼び出し元**: PUT /api/tasks/:id

**処理ステップ**:
1. **認証・認可確認**
   - AuthMiddleware.authenticate() で事前実行済み
   - TaskService.checkOwnership(taskId, userId) でオーナー確認

2. **入力値検証**
   - ZodValidator.validateUpdateTaskData(req.body) 呼び出し
   - 部分更新対応（undefined値の除外）

3. **タスク更新**
   - TaskService.updateTask(taskId, userId, updateData) 呼び出し
   - 楽観的ロック対応（updatedAt比較）

4. **レスポンス生成**
   - 200ステータスで更新後タスクを返却

**呼び出し構造**:
```
TaskController.updateTask()
├── ZodValidator.validateUpdateTaskData()
├── TaskService.checkOwnership()
│   └── TaskRepository.findById()
├── TaskService.updateTask()
│   ├── TaskRepository.update()
│   ├── TaskCategoryRepository.updateRelations()
│   └── CacheService.invalidatePattern()
└── ResponseBuilder.success()
```

### 7.2 TaskController.deleteTask()
**処理概要**: タスク削除の制御
**呼び出し元**: DELETE /api/tasks/:id

**処理ステップ**:
1. **認証・認可確認**
   - AuthMiddleware.authenticate() で事前実行済み
   - TaskService.checkOwnership(taskId, userId) でオーナー確認

2. **削除実行**
   - TaskService.deleteTask(taskId, userId) 呼び出し
   - 論理削除または物理削除の選択

3. **レスポンス生成**
   - 200ステータスで削除完了メッセージ

**呼び出し構造**:
```
TaskController.deleteTask()
├── TaskService.checkOwnership()
│   └── TaskRepository.findById()
├── TaskService.deleteTask()
│   ├── TaskRepository.delete()
│   ├── TaskCategoryRepository.deleteRelations()
│   └── CacheService.invalidatePattern()
└── ResponseBuilder.success()
```

### 7.3 UserController.getUsers()
**処理概要**: ユーザー一覧取得（管理者用）
**呼び出し元**: GET /api/users

**処理ステップ**:
1. **認証・認可確認**
   - AuthMiddleware.authenticate() で事前実行済み
   - AuthMiddleware.authorize(['admin']) で管理者権限確認

2. **ユーザー一覧取得**
   - UserService.getUsers(filters, pagination) 呼び出し
   - パスワードハッシュ等の機密情報除外

3. **レスポンス生成**
   - 200ステータスでユーザー一覧を返却

**呼び出し構造**:
```
UserController.getUsers()
├── ZodValidator.validateUserListQuery()
├── UserService.getUsers()
│   ├── UserRepository.findManyWithFilters()
│   └── UserRepository.countWithFilters()
└── ResponseBuilder.success()
```

### 7.4 AuthService.checkEmailExists()
**処理概要**: メールアドレス重複チェック
**呼び出し元**: AuthController.register()

**処理ステップ**:
1. **キャッシュ確認**
   - CacheService.get(emailCacheKey) でキャッシュチェック

2. **データベース検索**
   - UserRepository.findByEmail(email) 呼び出し
   - 存在確認のみ（ユーザー情報は返却しない）

3. **結果キャッシュ**
   - CacheService.set(emailCacheKey, exists, ttl: 300) で5分キャッシュ

**呼び出し構造**:
```
AuthService.checkEmailExists()
├── CacheService.get()
├── UserRepository.findByEmail()
│   └── PrismaClient.user.findUnique()
└── CacheService.set()
```

### 7.5 TaskService.checkOwnership()
**処理概要**: タスクオーナーシップ確認
**呼び出し元**: TaskController.updateTask(), TaskController.deleteTask()

**処理ステップ**:
1. **タスク取得**
   - TaskRepository.findById(taskId) 呼び出し
   - タスクが存在しない場合は404エラー

2. **オーナーシップ確認**
   - task.userId === userId の比較
   - 不一致の場合は403エラー

3. **管理者権限確認**
   - user.role === 'admin' の場合は権限許可
   - 管理者は全タスクにアクセス可能

**呼び出し構造**:
```
TaskService.checkOwnership()
├── TaskRepository.findById()
│   └── PrismaClient.task.findUnique()
├── OwnershipValidator.validate()
└── AdminPrivilegeChecker.check()
```

## 8. フロントエンド未定義メソッド

### 8.1 AuthForm.validateForm()
**処理概要**: 認証フォームのクライアント側バリデーション
**呼び出し元**: AuthForm.handleSubmit()

**処理ステップ**:
1. **必須項目チェック**
   - email, password の存在確認
   - register モードでは username も確認

2. **形式チェック**
   - EmailValidator.validate(email) でメール形式確認
   - PasswordValidator.validate(password) で強度確認

3. **エラー設定**
   - setErrors() でフィールド別エラーメッセージ設定
   - 全体エラーの場合は general エラー設定

**呼び出し構造**:
```
AuthForm.validateForm()
├── RequiredFieldValidator.validate()
├── EmailValidator.validate()
├── PasswordValidator.validate()
├── UsernameValidator.validate() (register時)
└── setErrors()
```

### 8.2 TaskList.handleFilterChange()
**処理概要**: フィルタ条件変更処理
**呼び出し元**: フィルタコンポーネントのonChange

**処理ステップ**:
1. **フィルタ状態更新**
   - setFilters() で新しいフィルタ条件を設定
   - ページネーションをリセット（page: 1）

2. **URL更新**
   - URLSearchParams でクエリパラメータ更新
   - history.pushState() でブラウザ履歴更新

3. **タスク再取得**
   - fetchTasks(newFilters) で新しい条件でタスク取得
   - ローディング状態の管理

**呼び出し構造**:
```
TaskList.handleFilterChange()
├── setFilters()
├── setPagination()
├── URLManager.updateQueryParams()
├── history.pushState()
└── fetchTasks()
```

## 9. データアクセス層未定義メソッド

### 9.1 TaskRepository.update()
**処理概要**: タスクデータの更新
**呼び出し元**: TaskService.updateTask()

**処理ステップ**:
1. **楽観的ロック確認**
   - 現在のupdatedAtと比較
   - 不一致の場合は409エラー（競合状態）

2. **更新データ準備**
   - undefined値の除外
   - updatedAt の自動設定

3. **データベース更新**
   - PrismaClient.task.update() 呼び出し
   - WHERE条件にid + updatedAt を指定

**呼び出し構造**:
```
TaskRepository.update()
├── OptimisticLockChecker.check()
├── UpdateDataBuilder.build()
├── PrismaClient.task.update()
└── ErrorHandler.handlePrismaError()
```

### 9.2 TaskCategoryRepository.createRelations()
**処理概要**: タスク・カテゴリ関連の作成
**呼び出し元**: TaskService.createTask()

**処理ステップ**:
1. **既存関連削除**
   - PrismaClient.taskCategory.deleteMany() で既存関連を削除

2. **新規関連作成**
   - categoryIds をループして関連レコード作成
   - PrismaClient.taskCategory.createMany() で一括作成

3. **エラーハンドリング**
   - 外部キー制約エラーの処理
   - 存在しないカテゴリIDの検出

**呼び出し構造**:
```
TaskCategoryRepository.createRelations()
├── PrismaClient.taskCategory.deleteMany()
├── RelationDataBuilder.build()
├── PrismaClient.taskCategory.createMany()
└── ErrorHandler.handleForeignKeyError()
```

## 10. 残りの未定義メソッド処理フロー

### 10.1 TaskController.getTaskById()
**処理概要**: タスク詳細取得の制御
**呼び出し元**: GET /api/tasks/:id

**処理ステップ**:
1. **認証・認可確認**
   - AuthMiddleware.authenticate() で事前実行済み
   - TaskService.checkOwnership(taskId, userId) でオーナー確認

2. **タスク取得**
   - TaskService.getTaskById(taskId, userId) 呼び出し
   - カテゴリ情報を含む完全なタスクデータ取得

3. **レスポンス生成**
   - 200ステータスでタスク詳細を返却

**呼び出し構造**:
```
TaskController.getTaskById()
├── TaskService.checkOwnership()
│   └── TaskRepository.findById()
├── TaskService.getTaskById()
│   └── TaskRepository.findByIdWithCategories()
└── ResponseBuilder.success()
```

### 10.2 TaskController.searchTasks()
**処理概要**: タスク検索の制御
**呼び出し元**: GET /api/tasks/search

**処理ステップ**:
1. **認証確認**
   - AuthMiddleware.authenticate() で事前実行済み

2. **検索パラメータ検証**
   - ZodValidator.validateSearchQuery(req.query) 呼び出し
   - 検索クエリの形式・長さ確認

3. **検索実行**
   - TaskService.searchTasks(userId, searchQuery) 呼び出し
   - 全文検索とフィルタリングの実行

4. **レスポンス生成**
   - 200ステータスで検索結果を返却

**呼び出し構造**:
```
TaskController.searchTasks()
├── ZodValidator.validateSearchQuery()
├── TaskService.searchTasks()
│   ├── TaskRepository.search()
│   └── TaskRepository.applyFilters()
└── ResponseBuilder.success()
```

### 10.3 AuthController.refreshToken()
**処理概要**: JWTトークン更新の制御
**呼び出し元**: POST /api/auth/refresh

**処理ステップ**:
1. **リフレッシュトークン検証**
   - TokenExtractor.extractFromBody(req.body.refreshToken) 呼び出し
   - JWTManager.verifyRefreshToken(refreshToken) で検証

2. **新しいトークン生成**
   - AuthService.refreshToken(refreshToken) 呼び出し
   - 新しいアクセストークンとリフレッシュトークンを生成

3. **レスポンス生成**
   - 200ステータスで新しいトークンペアを返却

**呼び出し構造**:
```
AuthController.refreshToken()
├── TokenExtractor.extractFromBody()
├── JWTManager.verifyRefreshToken()
├── AuthService.refreshToken()
│   ├── UserRepository.findById()
│   └── JWTManager.generateTokens()
└── ResponseBuilder.success()
```

### 10.4 User.validatePassword()
**処理概要**: ユーザーエンティティのパスワード検証
**呼び出し元**: AuthService.authenticate()

**処理ステップ**:
1. **パスワードハッシュ比較**
   - PasswordHasher.compare(password, this.passwordHash) 呼び出し
   - bcryptによる安全な比較

2. **結果返却**
   - boolean値で検証結果を返却

**呼び出し構造**:
```
User.validatePassword()
└── PasswordHasher.compare()
    └── bcrypt.compare()
```

### 10.5 Task.complete()
**処理概要**: タスクエンティティの完了処理
**呼び出し元**: TaskService.updateTask()

**処理ステップ**:
1. **状態変更**
   - this.status = 'completed' に設定
   - this.completedAt = new Date() に設定

2. **バリデーション**
   - 既に完了済みの場合はエラー
   - 削除済みタスクの場合はエラー

**呼び出し構造**:
```
Task.complete()
├── StatusValidator.validateTransition()
└── DateTimeHelper.getCurrentTimestamp()
```

### 10.6 Task.isOverdue()
**処理概要**: タスクエンティティの期限切れ判定
**呼び出し元**: TaskList表示時、ダッシュボード表示時

**処理ステップ**:
1. **期限確認**
   - this.dueDate が null の場合は false
   - this.status が 'completed' の場合は false

2. **現在時刻との比較**
   - DateTimeHelper.isAfter(new Date(), this.dueDate) で比較
   - 現在時刻が期限を過ぎている場合は true

**呼び出し構造**:
```
Task.isOverdue()
├── DateTimeHelper.isAfter()
└── StatusChecker.isCompleted()
```

### 10.7 UserRepository.update()
**処理概要**: ユーザーデータの更新
**呼び出し元**: UserService.updateProfile()

**処理ステップ**:
1. **存在確認**
   - PrismaClient.user.findUnique() でユーザー存在確認
   - 存在しない場合は404エラー

2. **更新データ準備**
   - undefined値の除外
   - updatedAt の自動設定

3. **データベース更新**
   - PrismaClient.user.update() 呼び出し
   - 楽観的ロック対応

**呼び出し構造**:
```
UserRepository.update()
├── PrismaClient.user.findUnique()
├── UpdateDataBuilder.build()
├── PrismaClient.user.update()
└── ErrorHandler.handlePrismaError()
```

### 10.8 TaskRepository.delete()
**処理概要**: タスクデータの削除
**呼び出し元**: TaskService.deleteTask()

**処理ステップ**:
1. **関連データ削除**
   - TaskCategoryRepository.deleteByTaskId() で関連削除
   - カスケード削除の確認

2. **タスク削除**
   - PrismaClient.task.delete() 呼び出し
   - 物理削除または論理削除の選択

3. **キャッシュ無効化**
   - CacheService.invalidatePattern() でキャッシュクリア

**呼び出し構造**:
```
TaskRepository.delete()
├── TaskCategoryRepository.deleteByTaskId()
├── PrismaClient.task.delete()
├── CacheService.invalidatePattern()
└── ErrorHandler.handlePrismaError()
```

## 11. 呼び出し順序の検証

### 11.1 依存関係レベル分析
**レベル1（最下層）**: Infrastructure Layer
- PrismaClient, RedisClient
- 外部ライブラリ（bcrypt, jwt等）

**レベル2**: Repository Layer
- UserRepository, TaskRepository, CategoryRepository
- レベル1に依存

**レベル3**: Domain Service Layer
- AuthService, TaskService, UserService
- レベル2に依存

**レベル4**: Application Controller Layer
- AuthController, TaskController, UserController
- レベル3に依存

**レベル5**: Presentation Layer
- React Components
- レベル4に依存（API呼び出し）

### 11.2 循環依存チェック
✅ **検証結果**: 循環依存なし
- 各レイヤーは下位レイヤーのみに依存
- 同一レイヤー内での相互依存なし
- インターフェースによる依存性逆転を適用

## 12. 完了確認（最終版）
- [x] 全クラスの全メソッドが定義されている
- [x] 各メソッドの処理ステップが明確である
- [x] クラス・メソッド間の呼び出し構造が正しい階層で可視化されている
- [x] 依存関係を考慮した呼び出し順序になっている
- [x] 循環依存がないことを確認している
- [x] エラーハンドリングフローが定義されている
- [x] データアクセス層の処理が詳細化されている
- [x] フロントエンド処理フローが含まれている
- [x] キャッシュ戦略が明確に定義されている
- [x] 各処理の責任範囲が明確である
- [x] コードブロックの記法が正しく修正されている
- [x] 呼び出し順序の妥当性が検証されている
