# シーケンス図

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | SEQ-DIAG-001 |
| 関連文書 | SEQ-001（詳細仕様参照） |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | プロセスエンジニア |
| STEP | 3.9 シーケンス図作成【新規】 |
| インプット | 振る舞い定義（SEQ-001） |
| アウトプット | シーケンス図（Mermaid形式） |

## 1. 図表構成概要

| 図表分類 | 図数 | 用途 |
|----------|------|------|
| **API単位図** | 10 | バックエンド実装ガイド |
| **UIアクション単位図** | 6 | フロントエンド実装ガイド |
| **エラーハンドリング図** | 8 | エラー処理実装ガイド |
| **パフォーマンス分析図** | 3 | 最適化ガイド |
| **総計** | **27** | **実装・視覚的理解用** |

## 2. API単位シーケンス図

### 2.1 ユーザー登録API（POST /auth/register）

```mermaid
sequenceDiagram
    participant C as Client
    participant APP as Application
    participant CTRL as AppController
    participant US as UserService
    participant USER as User
    participant UREP as UserRepository
    participant DB as SQLite
    participant JWT as JWT Service
    participant HASH as Hash Service

    Note over C,HASH: ユーザー登録API (目標: 300ms)

    C->>+CTRL: POST /auth/register<br/>{name, email, password}
    
    rect rgb(255, 248, 220)
        CTRL->>CTRL: validateRequest(10ms)
    end
    
    CTRL->>+US: register(RegisterRequest)
    
    rect rgb(240, 248, 255)
        US->>+UREP: exists(email)
        UREP->>+DB: SELECT COUNT(*)
        DB-->>-UREP: count
        UREP-->>-US: boolean
    end
    
    rect rgb(248, 255, 248)
        US->>+HASH: hash(password)
        HASH-->>-US: passwordHash
    end
    
    rect rgb(255, 240, 245)
        US->>+USER: create(props)
        USER-->>-US: userEntity
    end
    
    rect rgb(248, 248, 255)
        US->>+UREP: save(user)
        UREP->>+DB: INSERT INTO users
        DB-->>-UREP: insertResult
        UREP-->>-US: persistedUser
    end
    
    rect rgb(255, 248, 248)
        US->>+JWT: generateToken(user)
        JWT-->>-US: jwtToken
    end
    
    US-->>-CTRL: AuthResult
    CTRL-->>-C: 201 Created
```

### 2.2 ユーザーログインAPI（POST /auth/login）

```mermaid
sequenceDiagram
    participant C as Client
    participant CTRL as AppController
    participant US as UserService
    participant UREP as UserRepository
    participant DB as SQLite
    participant HASH as Hash Service
    participant JWT as JWT Service

    C->>+CTRL: POST /auth/login<br/>{email, password}
    CTRL->>+US: login(LoginRequest)
    
    US->>+UREP: findByEmail(email)
    UREP->>+DB: SELECT * FROM users
    DB-->>-UREP: userRow
    UREP-->>-US: userEntity
    
    US->>+HASH: compare(password, hash)
    HASH-->>-US: isValid
    
    US->>+JWT: generateToken(user)
    JWT-->>-US: jwtToken
    
    US-->>-CTRL: AuthResult
    CTRL-->>-C: 200 OK
```

### 2.3 タスク作成API（POST /tasks）

```mermaid
sequenceDiagram
    participant C as Client
    participant CTRL as AppController
    participant AUTH as AuthMiddleware
    participant TS as TaskService
    participant TASK as Task
    participant TREP as TaskRepository
    participant DB as SQLite

    C->>+CTRL: POST /tasks<br/>Authorization: Bearer token
    
    CTRL->>+AUTH: authenticateToken(req)
    AUTH-->>-CTRL: userId
    
    CTRL->>+TS: createTask(userId, request)
    
    TS->>+TASK: create(props)
    TASK-->>-TS: taskEntity
    
    TS->>+TREP: save(task)
    TREP->>+DB: INSERT INTO tasks
    DB-->>-TREP: insertResult
    TREP-->>-TS: persistedTask
    
    TS-->>-CTRL: TaskResponse
    CTRL-->>-C: 201 Created
```

### 2.4 タスク一覧取得API（GET /tasks）

```mermaid
sequenceDiagram
    participant C as Client
    participant CTRL as AppController
    participant AUTH as AuthMiddleware
    participant TS as TaskService
    participant TREP as TaskRepository
    participant DB as SQLite
    participant CACHE as Cache

    C->>+CTRL: GET /tasks?filters
    CTRL->>+AUTH: authenticateToken(req)
    AUTH-->>-CTRL: userId
    
    CTRL->>+TS: getTasks(userId, filters)
    
    TS->>+CACHE: get(cacheKey)
    CACHE-->>-TS: cachedResult | null
    
    alt Cache Miss
        TS->>+TREP: findByUserId(userId, filters)
        TREP->>+DB: SELECT * FROM tasks
        DB-->>-TREP: taskRows[]
        TREP-->>-TS: taskEntities[]
        
        TS->>+CACHE: set(cacheKey, result)
        CACHE-->>-TS: success
    end
    
    TS-->>-CTRL: TaskListResponse
    CTRL-->>-C: 200 OK
```

### 2.5 タスク更新API（PUT /tasks/:id）

```mermaid
sequenceDiagram
    participant C as Client
    participant CTRL as AppController
    participant AUTH as AuthMiddleware
    participant TS as TaskService
    participant TASK as Task
    participant TREP as TaskRepository
    participant DB as SQLite

    C->>+CTRL: PUT /tasks/:id<br/>Authorization: Bearer token
    CTRL->>+AUTH: authenticateToken(req)
    AUTH-->>-CTRL: userId
    
    CTRL->>+TS: updateTask(userId, taskId, request)
    
    TS->>TS: ensureTaskOwnership(userId, taskId)
    
    TS->>+TASK: update(props)
    TASK-->>-TS: updatedEntity
    
    TS->>+TREP: update(taskId, data)
    TREP->>+DB: UPDATE tasks SET ...
    DB-->>-TREP: updatedRow
    TREP-->>-TS: taskEntity
    
    TS-->>-CTRL: TaskResponse
    CTRL-->>-C: 200 OK
```

### 2.6 タスク削除API（DELETE /tasks/:id）

```mermaid
sequenceDiagram
    participant C as Client
    participant CTRL as AppController
    participant AUTH as AuthMiddleware
    participant TS as TaskService
    participant TREP as TaskRepository
    participant DB as SQLite

    C->>+CTRL: DELETE /tasks/:id<br/>Authorization: Bearer token
    CTRL->>+AUTH: authenticateToken(req)
    AUTH-->>-CTRL: userId
    
    CTRL->>+TS: deleteTask(userId, taskId)
    
    TS->>TS: ensureTaskOwnership(userId, taskId)
    
    TS->>+TREP: softDelete(taskId)
    TREP->>+DB: UPDATE tasks SET deleted_at = NOW()
    DB-->>-TREP: success
    TREP-->>-TS: void
    
    TS-->>-CTRL: void
    CTRL-->>-C: 204 No Content
```

## 3. UIアクション単位シーケンス図

### 3.1 ユーザー登録フロー

```mermaid
sequenceDiagram
    participant USER as User
    participant UI as UI Components
    participant STORE as State Store
    participant API as API Client
    participant ROUTER as Router

    USER->>+UI: アクセス: /register
    UI->>+ROUTER: navigate('/register')
    ROUTER-->>-UI: RegisterComponent表示
    
    USER->>UI: フォーム入力
    UI->>UI: リアルタイムバリデーション
    
    USER->>UI: 登録ボタンクリック
    UI->>+STORE: dispatch(registerStart())
    STORE->>+API: POST /auth/register
    API-->>-STORE: AuthResult
    STORE->>STORE: dispatch(registerSuccess())
    
    STORE-->>-UI: state.auth.user
    UI->>+ROUTER: navigate('/dashboard')
    ROUTER-->>-UI: DashboardComponent
    UI-->>-USER: 登録完了
```

### 3.2 タスク作成フロー

```mermaid
sequenceDiagram
    participant USER as User
    participant MODAL as Task Modal
    participant FORM as Form
    participant STORE as State Store
    participant API as API Client
    participant LIST as Task List

    USER->>+MODAL: 「新規タスク」クリック
    MODAL->>MODAL: showModal()
    
    USER->>FORM: フォーム入力
    FORM->>FORM: リアルタイムバリデーション
    
    USER->>FORM: 「作成」クリック
    FORM->>+STORE: dispatch(createTaskStart())
    STORE->>+API: POST /tasks
    API-->>-STORE: TaskResponse
    STORE->>STORE: dispatch(createTaskSuccess())
    
    STORE-->>-MODAL: state.tasks.newTask
    MODAL->>MODAL: hideModal()
    
    STORE-->>+LIST: state.tasks.items
    LIST->>LIST: prependTask(), animateIn()
    LIST-->>-USER: 新タスク表示
```

### 3.3 タスク一覧表示フロー

```mermaid
sequenceDiagram
    participant USER as User
    participant LIST as Task List
    participant FILTER as Filter Component
    participant STORE as State Store
    participant API as API Client

    USER->>+LIST: アクセス: /tasks
    LIST->>+STORE: dispatch(fetchTasksStart())
    STORE->>+API: GET /tasks
    API-->>-STORE: TaskListResponse
    STORE->>STORE: dispatch(fetchTasksSuccess())
    
    STORE-->>-LIST: state.tasks.items
    LIST->>LIST: renderTasks()
    LIST-->>-USER: タスク一覧表示
    
    USER->>+FILTER: フィルタ変更
    FILTER->>+STORE: dispatch(updateFilter())
    STORE->>+API: GET /tasks?filters
    API-->>-STORE: FilteredTaskListResponse
    STORE-->>-FILTER: 更新されたタスク一覧
    FILTER-->>USER: フィルタ済み一覧表示
```

## 4. エラーハンドリングシーケンス図

### 4.1 認証エラー（JWT期限切れ）

```mermaid
sequenceDiagram
    participant CLIENT as Client
    participant AUTH as Auth Middleware
    participant JWT as JWT Service
    participant ERROR as Error Handler
    participant REDIRECT as Redirect Service

    CLIENT->>+AUTH: GET /tasks<br/>Authorization: Bearer expired_token
    
    AUTH->>+JWT: verifyToken(expired_token)
    JWT-->>-AUTH: JsonWebTokenError
    
    AUTH->>+ERROR: handleAuthError(error)
    ERROR-->>-AUTH: 401 Unauthorized
    AUTH-->>-CLIENT: 401 Unauthorized
    
    CLIENT->>+REDIRECT: handleAuthError(response)
    REDIRECT->>REDIRECT: clearAuthData()
    REDIRECT-->>-CLIENT: redirect('/login')
```

### 4.2 バリデーションエラー

```mermaid
sequenceDiagram
    participant CLIENT as Client
    participant CTRL as Controller
    participant VALID as Validator
    participant ERROR as Error Handler

    CLIENT->>+CTRL: POST /tasks<br/>{title: "", priority: "INVALID"}
    
    CTRL->>+VALID: validateRequest(req, schema)
    VALID-->>-CTRL: ValidationError
    
    CTRL->>+ERROR: handleValidationError(error)
    ERROR-->>-CTRL: 400 Bad Request
    CTRL-->>-CLIENT: 400 Bad Request<br/>{errors: [...]}
```

### 4.3 権限エラー（タスク所有者不一致）

```mermaid
sequenceDiagram
    participant CLIENT as Client
    participant TS as TaskService
    participant ERROR as Error Handler

    CLIENT->>+TS: updateTask(userId: 1, taskId: 100)
    
    TS->>TS: ensureTaskOwnership(userId: 1, taskId: 100)
    Note right of TS: タスク所有者はuserId: 2
    
    TS->>+ERROR: throw UnauthorizedTaskAccessError
    ERROR-->>-TS: 403 Forbidden
    TS-->>-CLIENT: 403 Forbidden
```

## 5. パフォーマンス分析シーケンス図

### 5.1 API応答時間分解

```mermaid
sequenceDiagram
    participant REQ as Request
    participant APP as Application
    participant DB as Database
    participant RES as Response

    Note over REQ,RES: 応答時間分解分析

    REQ->>+APP: HTTP Request
    Note right of APP: 認証: 15ms<br/>バリデーション: 10ms<br/>ビジネスロジック: 8ms
    
    APP->>+DB: Query Execution
    Note right of DB: 接続: 5ms<br/>実行: 60ms<br/>変換: 15ms
    DB-->>-APP: Query Result
    
    APP->>APP: レスポンス構築: 15ms
    APP-->>-REQ: HTTP Response
    
    Note over REQ,RES: 総時間: 140ms
```

### 5.2 データベース処理最適化

```mermaid
sequenceDiagram
    participant APP as Application
    participant POOL as Connection Pool
    participant DB as SQLite
    participant IDX as Index
    participant CACHE as Cache

    APP->>+POOL: getConnection()
    POOL-->>-APP: connection
    
    APP->>+DB: SELECT query
    
    DB->>+IDX: インデックス検索
    IDX-->>-DB: row_ids
    
    DB->>+CACHE: キャッシュ確認
    CACHE-->>-DB: cached_data | null
    
    DB->>DB: データ読み込み
    DB-->>-APP: result_set
    
    APP->>+POOL: releaseConnection()
    POOL-->>-APP: success
```

### 5.3 キャッシュ効果分析

```mermaid
sequenceDiagram
    participant API as API Request
    participant CACHE as Cache Layer
    participant DB as Database

    Note over API,DB: キャッシュ効果測定

    API->>+CACHE: get(key)
    
    alt Cache Hit (75%の場合)
        CACHE-->>-API: cached_data (5ms)
    else Cache Miss (25%の場合)
        CACHE->>+DB: query_data
        DB-->>-CACHE: fresh_data (80ms)
        CACHE->>CACHE: store(key, data)
        CACHE-->>API: fresh_data
    end
    
    Note over API,DB: 平均応答時間: 25ms<br/>(キャッシュなし: 80ms → 68%改善)
```

## 6. 活用ガイド

### 6.1 実装時の参照方法
- **API実装**: セクション2のAPI単位図を参照
- **UI実装**: セクション3のUIアクション単位図を参照
- **エラー処理**: セクション4のエラーハンドリング図を参照

### 6.2 最適化の指針
- **パフォーマンス**: セクション5の分析図でボトルネック特定
- **処理時間目標**: 各図の時間表記を実装基準として使用

### 6.3 詳細仕様との連携
- **詳細情報**: `docs/step3/sequence-specification.md`（SEQ-001）を参照
- **メソッド詳細**: `docs/step3/method-interface-list.md`（METHOD-001）を参照

---

**完了確認**: ✅ 視覚的シーケンス図集完成  
**用途**: 実装ガイド・視覚的理解  
**詳細仕様**: SEQ-001参照  
**更新日**: 2025-01-28 