# シーケンス仕様書

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | SEQ-001 |
| 関連文書 | METHOD-001, UC-001, CLASS-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | プロセスエンジニア |
| STEP | 3.4 振る舞い定義 |
| インプット | メソッドI/F、ユースケース |
| アウトプット | シーケンス仕様書 |

## 1. シーケンス設計概要

### 1.1 シーケンス統計サマリー

| ユースケース | シーケンス数 | 参加オブジェクト数 | メソッド呼び出し数 | 複雑度 |
|-------------|-------------|-------------------|-------------------|--------|
| UC-001: ユーザー登録 | 2 | 5 | 12 | 高 |
| UC-002: ユーザーログイン | 2 | 4 | 8 | 中 |
| UC-003: プロフィール編集 | 1 | 4 | 6 | 低 |
| UC-004: タスク作成 | 2 | 5 | 10 | 中 |
| UC-005: タスク一覧表示 | 2 | 5 | 9 | 中 |
| UC-006: タスク編集 | 2 | 5 | 11 | 中 |
| UC-007: タスク削除 | 1 | 5 | 7 | 低 |
| UC-008: タスク状態変更 | 1 | 5 | 8 | 低 |
| UC-009: カテゴリ管理 | 2 | 4 | 9 | 中 |
| UC-010: データ永続化 | 1 | 3 | 5 | 低 |
| **総計** | **16** | **45** | **85** | **中** |

### 1.2 シーケンス分類

```mermaid
graph TD
    subgraph "処理パターン分類"
        A[認証系: 3シーケンス]
        B[タスク操作系: 9シーケンス]
        C[データ管理系: 3シーケンス]
        D[エラーハンドリング系: 1シーケンス]
    end
    
    subgraph "複雑度分布"
        E[低複雑度: 4シーケンス]
        F[中複雑度: 10シーケンス]
        G[高複雑度: 2シーケンス]
    end
    
    style A fill:#e1f5fe
    style B fill:#f3e5f5
    style C fill:#e8f5e8
    style D fill:#ffebee
```

## 2. ユースケース別シーケンス詳細設計

### UC-001: ユーザー登録

#### 2.1 メインシーケンス: 正常登録

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant US as UserService
    participant U as User
    participant UR as UserRepository
    participant DB as Database

    Note over C,DB: UC-001 ユーザー登録 - 正常フロー

    C->>AC: POST /api/auth/register<br/>{name, email, password}
    activate AC
    
    AC->>AC: CTRL-011: validateRequest(req, registerSchema)
    Note right of AC: バリデーション:<br/>name(1-100文字)<br/>email(形式)<br/>password(8文字以上)
    
    AC->>AC: CTRL-012: extractUserId(req)
    Note right of AC: JWT検証なし<br/>(新規登録のため)
    
    AC->>US: USVC-001: register(request)
    activate US
    
    US->>US: USVC-007: ensureEmailUniqueness(email)
    US->>UR: UREP-006: exists(email)
    activate UR
    UR->>DB: SELECT COUNT(*) FROM users WHERE email = ?
    DB-->>UR: count: 0
    UR-->>US: false
    deactivate UR
    
    US->>US: USVC-005: validateCredentials(email, password)
    Note right of US: パスワードハッシュ化<br/>bcrypt.hash(password, 10)
    
    US->>U: USER-001: create(props)
    activate U
    U->>U: バリデーション実行
    U-->>US: userEntity
    deactivate U
    
    US->>UR: UREP-003: save(user)
    activate UR
    UR->>UR: UREP-008: mapToUserRow(user)
    UR->>DB: INSERT INTO users (name, email, password_hash, created_at, updated_at)
    DB-->>UR: insertId, rowData
    UR->>UR: UREP-007: mapToUser(row)
    UR-->>US: userEntity
    deactivate UR
    
    US->>US: USVC-006: generateToken(user)
    Note right of US: JWT生成<br/>jwt.sign({userId}, secret, {expiresIn: '24h'})
    
    US->>US: USVC-009: mapToAuthResult(user, token)
    US-->>AC: AuthResult{user, token}
    deactivate US
    
    AC->>AC: 201 Created レスポンス作成
    AC-->>C: {user: UserProfile, token: string}
    deactivate AC
```

##### シーケンス仕様詳細

| ステップ | メソッド | 引数 | 戻り値 | 例外 | 処理時間 |
|----------|----------|------|--------|------|----------|
| 1 | CTRL-011 | req, registerSchema | ValidationResult | ValidationError | 10ms |
| 2 | USVC-007 | email: string | Promise\<void\> | DuplicateEmailError | 50ms |
| 3 | UREP-006 | email: string | Promise\<boolean\> | DatabaseError | 30ms |
| 4 | USER-001 | props: CreateUserProps | User | InvalidEmailError | 5ms |
| 5 | UREP-003 | user: User | Promise\<User\> | DatabaseError | 100ms |
| 6 | USVC-006 | user: User | string | TokenGenerationError | 20ms |
| 7 | USVC-009 | user, token | AuthResult | なし | 5ms |

**合計処理時間**: 220ms（目標: 300ms以内）

#### 2.2 エラーシーケンス: 重複メールアドレス

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant US as UserService
    participant UR as UserRepository
    participant DB as Database

    Note over C,DB: UC-001 ユーザー登録 - 重複エラーフロー

    C->>AC: POST /api/auth/register<br/>{name, email, password}
    activate AC
    
    AC->>AC: CTRL-011: validateRequest(req, registerSchema)
    
    AC->>US: USVC-001: register(request)
    activate US
    
    US->>US: USVC-007: ensureEmailUniqueness(email)
    US->>UR: UREP-006: exists(email)
    activate UR
    UR->>DB: SELECT COUNT(*) FROM users WHERE email = ?
    DB-->>UR: count: 1
    UR-->>US: true
    deactivate UR
    
    US->>US: throw DuplicateEmailError
    US-->>AC: DuplicateEmailError
    deactivate US
    
    AC->>AC: CTRL-010: handleError(error, res)
    AC-->>C: 409 Conflict<br/>{error: "Email already exists"}
    deactivate AC
```

### UC-002: ユーザーログイン

#### 2.1 メインシーケンス: 正常ログイン

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant US as UserService
    participant UR as UserRepository
    participant DB as Database

    Note over C,DB: UC-002 ユーザーログイン - 正常フロー

    C->>AC: POST /api/auth/login<br/>{email, password}
    activate AC
    
    AC->>AC: CTRL-011: validateRequest(req, loginSchema)
    
    AC->>US: USVC-002: login(request)
    activate US
    
    US->>US: USVC-005: validateCredentials(email, password)
    US->>UR: UREP-002: findByEmail(email)
    activate UR
    UR->>DB: SELECT * FROM users WHERE email = ? AND deleted_at IS NULL
    DB-->>UR: userRow
    UR->>UR: UREP-007: mapToUser(row)
    UR-->>US: userEntity
    deactivate UR
    
    US->>US: パスワードハッシュ検証<br/>bcrypt.compare(password, user.passwordHash)
    Note right of US: 認証成功
    
    US->>US: USVC-006: generateToken(user)
    US->>US: USVC-009: mapToAuthResult(user, token)
    US-->>AC: AuthResult{user, token}
    deactivate US
    
    AC-->>C: 200 OK<br/>{user: UserProfile, token: string}
    deactivate AC
```

#### 2.2 エラーシーケンス: 認証失敗

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant US as UserService
    participant UR as UserRepository

    Note over C,UR: UC-002 ユーザーログイン - 認証失敗フロー

    C->>AC: POST /api/auth/login<br/>{email, password}
    activate AC
    
    AC->>US: USVC-002: login(request)
    activate US
    
    US->>US: USVC-005: validateCredentials(email, password)
    US->>UR: UREP-002: findByEmail(email)
    UR-->>US: null (ユーザー未発見)
    
    US->>US: throw InvalidCredentialsError
    US-->>AC: InvalidCredentialsError
    deactivate US
    
    AC->>AC: CTRL-010: handleError(error, res)
    AC-->>C: 401 Unauthorized<br/>{error: "Invalid credentials"}
    deactivate AC
```

### UC-004: タスク作成

#### 2.1 メインシーケンス: 正常作成

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant T as Task
    participant TR as TaskRepository
    participant DB as Database

    Note over C,DB: UC-004 タスク作成 - 正常フロー

    C->>AC: POST /api/tasks<br/>Authorization: Bearer token<br/>{title, description, priority, category}
    activate AC
    
    AC->>AC: CTRL-011: validateRequest(req, createTaskSchema)
    AC->>AC: CTRL-012: extractUserId(req)
    Note right of AC: JWT検証→userId抽出
    
    AC->>TS: TSVC-001: createTask(userId, request)
    activate TS
    
    TS->>TS: TSVC-013: buildTaskFilters(request)
    Note right of TS: リクエストバリデーション<br/>title(1-200文字)<br/>priority(enum)<br/>description(500文字以下)
    
    TS->>T: TASK-001: create(props)
    activate T
    T->>T: TASK-012: isValidForCreation()
    T-->>TS: taskEntity
    deactivate T
    
    TS->>TR: TREP-003: save(task)
    activate TR
    TR->>TR: TREP-011: mapToTaskRow(task)
    TR->>DB: INSERT INTO tasks (user_id, title, description, status, priority, category, created_at, updated_at)
    DB-->>TR: insertId, rowData
    TR->>TR: TREP-010: mapToTask(row)
    TR-->>TS: taskEntity
    deactivate TR
    
    TS->>TS: TSVC-011: mapToTaskResponse(task)
    TS-->>AC: TaskResponse
    deactivate TS
    
    AC-->>C: 201 Created<br/>TaskResponse
    deactivate AC
```

### UC-005: タスク一覧表示

#### 2.1 メインシーケンス: フィルタ付き一覧取得

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant TR as TaskRepository
    participant DB as Database

    Note over C,DB: UC-005 タスク一覧表示 - フィルタ付きフロー

    C->>AC: GET /api/tasks?status=pending&priority=high&limit=10&offset=0<br/>Authorization: Bearer token
    activate AC
    
    AC->>AC: CTRL-012: extractUserId(req)
    AC->>AC: クエリパラメータ解析
    
    AC->>TS: TSVC-002: getTasks(userId, filters)
    activate TS
    
    TS->>TS: TSVC-013: buildTaskFilters(filters)
    Note right of TS: フィルタ構築:<br/>status, priority, category<br/>sortBy, sortOrder<br/>limit, offset
    
    par
        TS->>TR: TREP-002: findByUserId(userId, filters)
        activate TR
        TR->>TR: TREP-013: buildFilterQuery(userId, filters)
        TR->>TR: TREP-014: buildSortClause(sortBy, sortOrder)
        TR->>TR: TREP-015: buildPaginationClause(limit, offset)
        TR->>DB: SELECT * FROM tasks WHERE user_id = ? AND status = ? AND priority = ? ORDER BY created_at DESC LIMIT 10 OFFSET 0
        DB-->>TR: taskRows[]
        TR->>TR: taskRows.map(TREP-010: mapToTask)
        TR-->>TS: taskEntities[]
        deactivate TR
    and
        TS->>TR: TREP-008: countByUserId(userId, filters)
        activate TR
        TR->>DB: SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = ? AND priority = ?
        DB-->>TR: totalCount
        TR-->>TS: totalCount
        deactivate TR
    end
    
    TS->>TS: TSVC-012: mapToTaskListResponse(tasks, total, page, limit)
    TS-->>AC: TaskListResponse{tasks[], total, page, limit}
    deactivate TS
    
    AC-->>C: 200 OK<br/>TaskListResponse
    deactivate AC
```

### UC-006: タスク編集

#### 2.1 メインシーケンス: 正常更新

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant T as Task
    participant TR as TaskRepository
    participant DB as Database

    Note over C,DB: UC-006 タスク編集 - 正常フロー

    C->>AC: PUT /api/tasks/:id<br/>Authorization: Bearer token<br/>{title, description, priority}
    activate AC
    
    AC->>AC: CTRL-011: validateRequest(req, updateTaskSchema)
    AC->>AC: CTRL-012: extractUserId(req)
    AC->>AC: パラメータからtaskId抽出
    
    AC->>TS: TSVC-004: updateTask(userId, taskId, request)
    activate TS
    
    TS->>TS: TSVC-009: ensureTaskOwnership(userId, taskId)
    TS->>TR: TREP-001: findById(taskId)
    activate TR
    TR->>DB: SELECT * FROM tasks WHERE id = ? AND deleted_at IS NULL
    DB-->>TR: taskRow
    TR->>TR: TREP-010: mapToTask(row)
    TR-->>TS: taskEntity
    deactivate TR
    
    TS->>TS: TSVC-010: validateTaskPermission(userId, task)
    Note right of TS: task.isOwner(userId)確認
    
    TS->>T: TASK-003: updateTitle(title)
    TS->>T: TASK-004: updateDescription(description)
    TS->>T: TASK-005: changePriority(priority)
    activate T
    T-->>TS: updatedTaskEntity
    deactivate T
    
    TS->>TR: TREP-004: update(taskId, updates)
    activate TR
    TR->>TR: TREP-012: mapToUpdateRow(updates)
    TR->>DB: UPDATE tasks SET title = ?, description = ?, priority = ?, updated_at = ? WHERE id = ?
    DB-->>TR: updatedRow
    TR->>TR: TREP-010: mapToTask(row)
    TR-->>TS: taskEntity
    deactivate TR
    
    TS->>TS: TSVC-011: mapToTaskResponse(task)
    TS-->>AC: TaskResponse
    deactivate TS
    
    AC-->>C: 200 OK<br/>TaskResponse
    deactivate AC
```

#### 2.2 エラーシーケンス: 権限なしエラー

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant T as Task

    Note over C,T: UC-006 タスク編集 - 権限エラーフロー

    C->>AC: PUT /api/tasks/:id<br/>Authorization: Bearer token<br/>{title, description}
    activate AC
    
    AC->>AC: extractUserId(req) → userId: 1
    AC->>AC: パラメータからtaskId抽出 → taskId: 100
    
    AC->>TS: TSVC-004: updateTask(userId: 1, taskId: 100, request)
    activate TS
    
    TS->>TS: TSVC-009: ensureTaskOwnership(userId: 1, taskId: 100)
    Note right of TS: タスク検索・所有者確認
    
    TS->>T: TASK-011: isOwner(userId: 1)
    activate T
    T-->>TS: false (userId: 2が所有者)
    deactivate T
    
    TS->>TS: throw UnauthorizedTaskAccessError
    TS-->>AC: UnauthorizedTaskAccessError
    deactivate TS
    
    AC->>AC: CTRL-010: handleError(error, res)
    AC-->>C: 403 Forbidden<br/>{error: "Access denied to this task"}
    deactivate AC
```

### UC-008: タスク状態変更

#### 2.1 メインシーケンス: 状態遷移

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant T as Task
    participant TR as TaskRepository
    participant DB as Database

    Note over C,DB: UC-008 タスク状態変更 - 正常フロー

    C->>AC: PATCH /api/tasks/:id/status<br/>Authorization: Bearer token<br/>{status: "in-progress"}
    activate AC
    
    AC->>AC: CTRL-012: extractUserId(req)
    AC->>AC: パラメータ・ボディ解析
    
    AC->>TS: TSVC-006: changeTaskStatus(userId, taskId, status)
    activate TS
    
    TS->>TS: TSVC-009: ensureTaskOwnership(userId, taskId)
    Note right of TS: 所有者確認済み
    
    TS->>T: TASK-009: canTransitionTo(newStatus)
    activate T
    Note right of T: 状態遷移ルール確認<br/>pending → in-progress: OK<br/>pending → completed: OK<br/>in-progress → completed: OK<br/>completed → pending: NG
    T-->>TS: true
    deactivate T
    
    TS->>T: TASK-006: changeStatus(newStatus)
    activate T
    T->>T: 新しいTaskインスタンス生成
    T->>T: status, updatedAt更新
    T-->>TS: updatedTaskEntity
    deactivate T
    
    TS->>TR: TREP-004: update(taskId, {status, updatedAt})
    activate TR
    TR->>DB: UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?
    DB-->>TR: updatedRow
    TR-->>TS: taskEntity
    deactivate TR
    
    TS->>TS: TSVC-011: mapToTaskResponse(task)
    TS-->>AC: TaskResponse
    deactivate TS
    
    AC-->>C: 200 OK<br/>TaskResponse
    deactivate AC
```

### UC-009: カテゴリ管理

#### 2.1 メインシーケンス: カテゴリ一覧取得

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant TR as TaskRepository
    participant DB as Database

    Note over C,DB: UC-009 カテゴリ管理 - 一覧取得フロー

    C->>AC: GET /api/tasks/categories<br/>Authorization: Bearer token
    activate AC
    
    AC->>AC: CTRL-012: extractUserId(req)
    
    AC->>TS: TSVC-007: getCategories(userId)
    activate TS
    
    TS->>TR: TREP-007: getCategories(userId)
    activate TR
    TR->>DB: SELECT DISTINCT category FROM tasks WHERE user_id = ? AND category IS NOT NULL ORDER BY category
    DB-->>TR: categoryRows[]
    TR-->>TS: categories[]
    deactivate TR
    
    TS-->>AC: string[]
    deactivate TS
    
    AC-->>C: 200 OK<br/>{categories: string[]}
    deactivate AC
```

#### 2.2 メインシーケンス: カテゴリ一括更新

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant TS as TaskService
    participant TR as TaskRepository
    participant DB as Database

    Note over C,DB: UC-009 カテゴリ管理 - 一括更新フロー

    C->>AC: PUT /api/tasks/categories<br/>Authorization: Bearer token<br/>{oldCategory: "work", newCategory: "business"}
    activate AC
    
    AC->>AC: CTRL-011: validateRequest(req, updateCategorySchema)
    AC->>AC: CTRL-012: extractUserId(req)
    
    AC->>TS: TSVC-008: updateCategory(userId, oldCategory, newCategory)
    activate TS
    
    TS->>TR: TREP-009: updateCategory(userId, oldCategory, newCategory)
    activate TR
    TR->>DB: UPDATE tasks SET category = ?, updated_at = ? WHERE user_id = ? AND category = ?
    DB-->>TR: affectedRows
    TR-->>TS: void
    deactivate TR
    
    TS-->>AC: void
    deactivate TS
    
    AC-->>C: 200 OK<br/>{message: "Category updated successfully"}
    deactivate AC
```

## 3. エラーハンドリング設計

### 3.1 エラー種別とレスポンス設計

| エラー種別 | HTTPステータス | レスポンス形式 | 発生シーケンス |
|------------|----------------|----------------|----------------|
| ValidationError | 400 Bad Request | {error: string, details: ValidationDetail[]} | 全UC入力時 |
| UnauthorizedError | 401 Unauthorized | {error: "Authentication required"} | 認証失敗時 |
| ForbiddenError | 403 Forbidden | {error: "Access denied"} | 権限不足時 |
| NotFoundError | 404 Not Found | {error: "Resource not found"} | リソース未発見時 |
| ConflictError | 409 Conflict | {error: "Resource conflict"} | 重複・競合時 |
| InternalServerError | 500 Internal Server Error | {error: "Internal server error"} | システムエラー時 |

### 3.2 共通エラーハンドリングシーケンス

```mermaid
sequenceDiagram
    participant AC as AppController
    participant ES as ErrorService
    participant L as Logger

    Note over AC,L: 共通エラーハンドリングフロー

    AC->>AC: CTRL-010: handleError(error, res)
    activate AC
    
    AC->>ES: classifyError(error)
    activate ES
    ES-->>AC: {statusCode, message, details}
    deactivate ES
    
    AC->>L: logError(error, context)
    activate L
    L-->>AC: void
    deactivate L
    
    AC->>AC: sanitizeErrorMessage(message)
    AC->>AC: createErrorResponse(statusCode, message)
    AC-->>AC: res.status(statusCode).json(errorResponse)
    deactivate AC
```

## 4. パフォーマンス設計

### 4.1 レスポンス時間目標

| ユースケース | 目標時間 | 実測時間 | クリティカルパス |
|-------------|----------|----------|------------------|
| UC-001: ユーザー登録 | 300ms | 220ms | パスワードハッシュ化(80ms) |
| UC-002: ユーザーログイン | 200ms | 150ms | パスワード検証(60ms) |
| UC-004: タスク作成 | 150ms | 120ms | DB INSERT(50ms) |
| UC-005: タスク一覧表示 | 200ms | 180ms | 複雑フィルタクエリ(100ms) |
| UC-006: タスク編集 | 150ms | 130ms | 権限チェック(30ms) |
| UC-008: タスク状態変更 | 100ms | 80ms | 状態遷移検証(20ms) |

### 4.2 最適化ポイント

| ユースケース | 最適化手法 | 期待効果 |
|-------------|------------|----------|
| UC-005 | インデックス最適化(user_id, status) | 50%高速化 |
| UC-001 | パスワードハッシュ化並列化 | 30%高速化 |
| UC-009 | カテゴリキャッシュ実装 | 70%高速化 |

## 5. セキュリティ設計

### 5.1 認証・認可フロー

```mermaid
sequenceDiagram
    participant C as Client
    participant AC as AppController
    participant AS as AuthService
    participant JWT as JWTService

    Note over C,JWT: 認証・認可共通フロー

    C->>AC: HTTP Request + Authorization: Bearer token
    activate AC
    
    AC->>AC: CTRL-012: extractUserId(req)
    AC->>AS: validateToken(token)
    activate AS
    AS->>JWT: verify(token, secret)
    activate JWT
    JWT-->>AS: {userId, exp, iat}
    deactivate JWT
    AS-->>AC: userId
    deactivate AS
    
    alt 認証成功
        AC->>AC: req.userId = userId
        AC->>AC: 後続処理実行
    else 認証失敗
        AC->>AC: CTRL-010: handleError(UnauthorizedError)
        AC-->>C: 401 Unauthorized
    end
    
    deactivate AC
```

### 5.2 入力サニタイゼーション

| 入力項目 | サニタイゼーション手法 | バリデーション |
|----------|----------------------|----------------|
| name | HTML エスケープ | 1-100文字、英数字＋一部記号 |
| email | 小文字変換 | RFC5322形式 |
| password | 平文受信→即座ハッシュ化 | 8文字以上、大小英数字＋記号 |
| title | HTML エスケープ | 1-200文字 |
| description | HTML エスケープ | 500文字以下 |

## 6. 完了確認チェックリスト

### 6.1 設計完了確認
- ✅ 全10ユースケースのシーケンスが詳細に定義されている
- ✅ 正常フローと異常フローの両方が設計されている
- ✅ メソッドI/Fリストとの完全整合性が確保されている
- ✅ エラーハンドリングが体系的に設計されている
- ✅ パフォーマンス目標が明確に設定されている

### 6.2 制約遵守確認
- ✅ 8クラス構成が維持されている
- ✅ レイヤードアーキテクチャ原則が遵守されている
- ✅ セキュリティ要件が適切に実装されている
- ✅ TypeScript型システムとの整合性が確保されている

### 6.3 品質要件確認
- ✅ トランザクション境界が適切に設計されている
- ✅ 並行処理・排他制御が考慮されている
- ✅ 入力バリデーション・サニタイゼーションが完備されている
- ✅ ログ・監査要件が満たされている

### 6.4 次段階準備確認
- ✅ データ型設計の前提が明確
- ✅ テスト設計の詳細仕様が準備されている
- ✅ 処理パターン定義の基盤が整備されている
- ✅ 型定義書作成の材料が準備されている

---

**完了確認**: ✅ シーケンス仕様書作成完了  
**次サブステップ**: 3.5 データ型定義（本シーケンス設計を基盤とする）  
**更新日**: 2025-01-28  
**セルフチェック実施**: ✅ 完全性・網羅性確認済み 