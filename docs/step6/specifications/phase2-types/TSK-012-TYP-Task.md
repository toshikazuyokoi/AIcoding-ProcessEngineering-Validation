# TSK-012-TYP-Task Issue仕様書

## 概要
**タスクID**: TSK-012-TYP-Task  
**ファイル**: src/types/task.ts  
**複雑度**: 高  
**見積時間**: 3時間  
**優先度**: 🥇最重要（タスク関連型）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/task.ts`
- **型定義**: Task型・TaskStatus型・TaskPriority型・TaskFilter型
- **レイヤー**: Types（型定義層）
- **依存関係**: TSK-007 (コア型)

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core
- 参照設計書: `docs/step3/detailed-design/task-types.md`

### 型定義一覧

#### 1. Task基本型
```typescript
import { TaskID, UserID, Timestamp } from './core.js';

export interface Task {
  id: TaskID;
  userId: UserID;
  title: TaskTitle;
  description?: TaskDescription;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export type TaskTitle = Brand<string, 'TaskTitle'>;
export type TaskDescription = Brand<string, 'TaskDescription'>;
```

#### 2. TaskStatus型（ステータス管理）
```typescript
export type TaskStatus = 
  | 'pending'
  | 'in_progress' 
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export const TaskStatusList = [
  'pending',
  'in_progress',
  'completed', 
  'cancelled',
  'on_hold'
] as const;

export const isValidTaskStatus = (status: string): status is TaskStatus => {
  return TaskStatusList.includes(status as TaskStatus);
};
```

#### 3. TaskPriority型（優先度管理）
```typescript
export type TaskPriority = 
  | 'low'
  | 'medium'
  | 'high'
  | 'urgent';

export const TaskPriorityList = ['low', 'medium', 'high', 'urgent'] as const;

export const isValidTaskPriority = (priority: string): priority is TaskPriority => {
  return TaskPriorityList.includes(priority as TaskPriority);
};

export const TaskPriorityWeight: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4
};
```

#### 4. TaskFilter型（検索・フィルタリング）
```typescript
export interface TaskFilter {
  userId?: UserID;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  dueDateFrom?: Timestamp;
  dueDateTo?: Timestamp;
  createdFrom?: Timestamp;
  createdTo?: Timestamp;
  searchText?: string;
}

export interface TaskSortOptions {
  field: 'createdAt' | 'updatedAt' | 'dueDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

export interface TaskSearchRequest {
  filter?: TaskFilter;
  sort?: TaskSortOptions;
  pagination?: PaginationParams;
}
```

#### 5. Task CRUD型
```typescript
export interface TaskCreateRequest {
  title: TaskTitle;
  description?: TaskDescription;
  priority?: TaskPriority;
  dueDate?: Timestamp;
}

export interface TaskUpdateRequest {
  title?: TaskTitle;
  description?: TaskDescription;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Timestamp;
}

export interface TaskResponse {
  task: Task;
}

export interface TaskListResponse {
  tasks: Task[];
  pagination: PaginationInfo;
}
```

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
  - [ ] タスク型階層の確認
  - [ ] ステータス・優先度型の理解
  - [ ] フィルタリング型の設計確認
- [ ] 2. コーディング
  - [ ] Task型・TaskStatus型実装
  - [ ] TaskPriority・TaskFilter型実装
  - [ ] 関連型（TaskCreate、TaskUpdate）実装
- [ ] 3. テストコーディング
  - [ ] 型制約テスト
  - [ ] フィルタリング型テスト
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 型安全性テスト：Task型の制約確認
- [ ] ステータス遷移テスト：有効なステータス変更確認
- [ ] 優先度テスト：priority weightingの正常動作
- [ ] フィルタリングテスト：複合条件での型安全性

## 完了条件
- [ ] Task関連型全定義完了
- [ ] ステータス・優先度管理型実装完了
- [ ] フィルタリング・検索型実装完了
- [ ] 型安全性テスト100%通過
- [ ] TypeScript厳密モード エラー0件

## 関連情報
- **設計書**: `docs/step3/detailed-design/task-types.md`
- **依存タスク**: TSK-007 (コア型定義)
- **後続タスク**: TSK-015, TSK-016 (エンティティ)
- **ビジネスロジック**: ステータス遷移・優先度管理

## 備考
- ステータス遷移の制約をTypeScriptレベルで表現
- 検索・フィルタリングの複雑な条件を型安全に管理
- 将来的な拡張（タグ・ラベル等）を考慮した設計 