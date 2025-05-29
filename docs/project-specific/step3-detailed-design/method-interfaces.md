# メソッドI/Fリスト

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | METHOD-001 |
| 関連文書 | CLASS-001, FUNC-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 1. API エンドポイント仕様

### 1.1 認証API

#### POST /api/auth/register
**概要**: 新規ユーザー登録
**認証**: 不要

**リクエスト**:
```typescript
interface RegisterRequest {
  username: string;     // 3-50文字、英数字とアンダースコア
  email: string;        // 有効なメールアドレス形式
  password: string;     // 8文字以上、英数字記号を含む
}
```

**レスポンス**:
```typescript
interface RegisterResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: 'user' | 'admin';
      createdAt: string;
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
```

**エラーレスポンス**:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
```

**ステータスコード**:
- 201: 登録成功
- 400: バリデーションエラー
- 409: メールアドレス重複
- 500: サーバーエラー

#### POST /api/auth/login
**概要**: ユーザーログイン
**認証**: 不要

**リクエスト**:
```typescript
interface LoginRequest {
  email: string;        // 登録済みメールアドレス
  password: string;     // パスワード
}
```

**レスポンス**:
```typescript
interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: 'user' | 'admin';
    };
    tokens: {
      accessToken: string;
      refreshToken: string;
    };
  };
}
```

**ステータスコード**:
- 200: ログイン成功
- 401: 認証失敗
- 400: バリデーションエラー
- 500: サーバーエラー

### 1.2 タスクAPI

#### GET /api/tasks
**概要**: タスク一覧取得
**認証**: 必要（Bearer Token）

**クエリパラメータ**:
```typescript
interface TaskListQuery {
  page?: number;        // ページ番号（デフォルト: 1）
  limit?: number;       // 取得件数（デフォルト: 20、最大: 100）
  status?: 'pending' | 'in_progress' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  search?: string;      // タイトル・説明での検索
  sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
  sortOrder?: 'asc' | 'desc';
  dueDateFrom?: string; // ISO 8601形式
  dueDateTo?: string;   // ISO 8601形式
}
```

**レスポンス**:
```typescript
interface TaskListResponse {
  success: boolean;
  data: {
    tasks: Task[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    filters: {
      status?: string;
      priority?: string;
      search?: string;
    };
  };
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  categories: Category[];
}

interface Category {
  id: string;
  name: string;
  color: string;
}
```

**ステータスコード**:
- 200: 取得成功
- 401: 認証エラー
- 400: バリデーションエラー
- 500: サーバーエラー

#### POST /api/tasks
**概要**: タスク作成
**認証**: 必要（Bearer Token）

**リクエスト**:
```typescript
interface CreateTaskRequest {
  title: string;        // 1-100文字、必須
  description?: string; // 0-1000文字、任意
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;     // ISO 8601形式、任意
  categoryIds?: string[]; // カテゴリID配列、任意
}
```

**レスポンス**:
```typescript
interface CreateTaskResponse {
  success: boolean;
  data: {
    task: Task;
  };
}
```

**ステータスコード**:
- 201: 作成成功
- 401: 認証エラー
- 400: バリデーションエラー
- 500: サーバーエラー

#### GET /api/tasks/:id
**概要**: タスク詳細取得
**認証**: 必要（Bearer Token）

**パスパラメータ**:
- id: string (UUID形式)

**レスポンス**:
```typescript
interface TaskDetailResponse {
  success: boolean;
  data: {
    task: Task;
  };
}
```

**ステータスコード**:
- 200: 取得成功
- 401: 認証エラー
- 403: アクセス権限なし
- 404: タスクが見つからない
- 500: サーバーエラー

#### PUT /api/tasks/:id
**概要**: タスク更新
**認証**: 必要（Bearer Token）

**パスパラメータ**:
- id: string (UUID形式)

**リクエスト**:
```typescript
interface UpdateTaskRequest {
  title?: string;       // 1-100文字
  description?: string; // 0-1000文字
  priority?: 'high' | 'medium' | 'low';
  status?: 'pending' | 'in_progress' | 'completed';
  dueDate?: string | null; // ISO 8601形式
  categoryIds?: string[]; // カテゴリID配列
}
```

**レスポンス**:
```typescript
interface UpdateTaskResponse {
  success: boolean;
  data: {
    task: Task;
  };
}
```

**ステータスコード**:
- 200: 更新成功
- 401: 認証エラー
- 403: アクセス権限なし
- 404: タスクが見つからない
- 400: バリデーションエラー
- 500: サーバーエラー

#### DELETE /api/tasks/:id
**概要**: タスク削除
**認証**: 必要（Bearer Token）

**パスパラメータ**:
- id: string (UUID形式)

**レスポンス**:
```typescript
interface DeleteTaskResponse {
  success: boolean;
  data: {
    message: string;
  };
}
```

**ステータスコード**:
- 200: 削除成功
- 401: 認証エラー
- 403: アクセス権限なし
- 404: タスクが見つからない
- 500: サーバーエラー

## 2. フロントエンドコンポーネントI/F

### 2.1 AuthForm コンポーネント

#### Props
```typescript
interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess: (user: User, tokens: TokenPair) => void;
  onError: (error: string) => void;
  loading?: boolean;
}
```

#### State
```typescript
interface AuthFormState {
  formData: {
    email: string;
    password: string;
    username?: string; // register時のみ
  };
  errors: {
    email?: string;
    password?: string;
    username?: string;
    general?: string;
  };
  isSubmitting: boolean;
}
```

#### Methods
```typescript
interface AuthFormMethods {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleInputChange: (field: keyof AuthFormData, value: string) => void;
  validateForm: () => boolean;
  resetForm: () => void;
}
```

### 2.2 TaskList コンポーネント

#### Props
```typescript
interface TaskListProps {
  userId: string;
  initialFilters?: TaskFilters;
  onTaskSelect?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}
```

#### State
```typescript
interface TaskListState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  filters: TaskFilters;
  pagination: PaginationState;
  selectedTasks: string[];
}
```

#### Methods
```typescript
interface TaskListMethods {
  fetchTasks: (filters?: TaskFilters) => Promise<void>;
  handleFilterChange: (filters: Partial<TaskFilters>) => void;
  handleSort: (field: string, order: 'asc' | 'desc') => void;
  handlePageChange: (page: number) => void;
  handleTaskSelection: (taskId: string, selected: boolean) => void;
  handleBulkAction: (action: 'delete' | 'complete', taskIds: string[]) => Promise<void>;
}
```

### 2.3 TaskForm コンポーネント

#### Props
```typescript
interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Task>;
  categories: Category[];
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
```

#### State
```typescript
interface TaskFormState {
  formData: {
    title: string;
    description: string;
    priority: TaskPriority;
    dueDate: string | null;
    categoryIds: string[];
  };
  errors: {
    title?: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    general?: string;
  };
  isSubmitting: boolean;
  isDirty: boolean;
}
```

#### Methods
```typescript
interface TaskFormMethods {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  handleFieldChange: (field: keyof TaskFormData, value: any) => void;
  handleCategoryChange: (categoryIds: string[]) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  setFormData: (data: Partial<TaskFormData>) => void;
}
```

## 3. バックエンドサービスI/F

### 3.1 AuthService

#### register メソッド
```typescript
interface RegisterMethod {
  signature: (userData: RegisterData) => Promise<AuthResult>;
  input: {
    userData: {
      username: string;
      email: string;
      password: string;
    };
  };
  output: {
    user: User;
    tokens: TokenPair;
  };
  exceptions: [
    'ValidationError',
    'DuplicateEmailError',
    'DatabaseError'
  ];
}
```

#### authenticate メソッド
```typescript
interface AuthenticateMethod {
  signature: (email: string, password: string) => Promise<AuthResult>;
  input: {
    email: string;
    password: string;
  };
  output: {
    user: User;
    tokens: TokenPair;
  };
  exceptions: [
    'InvalidCredentialsError',
    'UserNotFoundError',
    'AccountDeactivatedError'
  ];
}
```

#### validateToken メソッド
```typescript
interface ValidateTokenMethod {
  signature: (token: string) => Promise<User>;
  input: {
    token: string; // JWT access token
  };
  output: User;
  exceptions: [
    'InvalidTokenError',
    'ExpiredTokenError',
    'UserNotFoundError'
  ];
}
```

### 3.2 TaskService

#### createTask メソッド
```typescript
interface CreateTaskMethod {
  signature: (userId: string, taskData: CreateTaskData) => Promise<Task>;
  input: {
    userId: string;
    taskData: {
      title: string;
      description?: string;
      priority: TaskPriority;
      dueDate?: Date;
      categoryIds?: string[];
    };
  };
  output: Task;
  exceptions: [
    'ValidationError',
    'UserNotFoundError',
    'CategoryNotFoundError',
    'DatabaseError'
  ];
}
```

#### updateTask メソッド
```typescript
interface UpdateTaskMethod {
  signature: (taskId: string, userId: string, data: UpdateTaskData) => Promise<Task>;
  input: {
    taskId: string;
    userId: string;
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      status?: TaskStatus;
      dueDate?: Date | null;
      categoryIds?: string[];
    };
  };
  output: Task;
  exceptions: [
    'TaskNotFoundError',
    'UnauthorizedError',
    'ValidationError',
    'DatabaseError'
  ];
}
```

#### getTasksByUser メソッド
```typescript
interface GetTasksByUserMethod {
  signature: (userId: string, filters?: TaskFilters) => Promise<TaskListResult>;
  input: {
    userId: string;
    filters?: {
      status?: TaskStatus;
      priority?: TaskPriority;
      search?: string;
      dueDateFrom?: Date;
      dueDateTo?: Date;
      categoryIds?: string[];
      sortBy?: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority';
      sortOrder?: 'asc' | 'desc';
      page?: number;
      limit?: number;
    };
  };
  output: {
    tasks: Task[];
    pagination: PaginationInfo;
  };
  exceptions: [
    'UserNotFoundError',
    'ValidationError',
    'DatabaseError'
  ];
}
```

## 4. データアクセス層I/F

### 4.1 UserRepository

#### create メソッド
```typescript
interface UserCreateMethod {
  signature: (userData: CreateUserData) => Promise<User>;
  input: {
    userData: {
      username: string;
      email: string;
      passwordHash: string;
      role?: UserRole;
    };
  };
  output: User;
  exceptions: [
    'DuplicateEmailError',
    'ValidationError',
    'DatabaseError'
  ];
}
```

#### findByEmail メソッド
```typescript
interface UserFindByEmailMethod {
  signature: (email: string) => Promise<User | null>;
  input: {
    email: string;
  };
  output: User | null;
  exceptions: [
    'DatabaseError'
  ];
}
```

### 4.2 TaskRepository

#### findByUserId メソッド
```typescript
interface TaskFindByUserIdMethod {
  signature: (userId: string, filters?: TaskFilters) => Promise<Task[]>;
  input: {
    userId: string;
    filters?: TaskFilters;
  };
  output: Task[];
  exceptions: [
    'DatabaseError'
  ];
}
```

#### search メソッド
```typescript
interface TaskSearchMethod {
  signature: (userId: string, query: string) => Promise<Task[]>;
  input: {
    userId: string;
    query: string; // 検索クエリ
  };
  output: Task[];
  exceptions: [
    'DatabaseError'
  ];
}
```

## 5. 型定義

### 5.1 共通型
```typescript
// エラー型
interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// ページネーション型
interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// ソート型
interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}
```

### 5.2 エンティティ型
```typescript
// ユーザー型
interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// タスク型
interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  categories: Category[];
}

// カテゴリ型
interface Category {
  id: string;
  name: string;
  color: string;
  description: string | null;
  createdAt: Date;
}
```

### 5.3 認証型
```typescript
// 認証結果型
interface AuthResult {
  user: User;
  tokens: TokenPair;
}

// トークンペア型
interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// JWT ペイロード型
interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

## 6. 完了確認
- [x] 全APIエンドポイントの仕様が定義されている
- [x] リクエスト・レスポンス形式が明確である
- [x] エラーハンドリングが定義されている
- [x] フロントエンドコンポーネントI/Fが定義されている
- [x] バックエンドサービスI/Fが定義されている
- [x] データアクセス層I/Fが定義されている
- [x] 型定義が包括的に定義されている
- [x] 例外処理が明確に定義されている
```
