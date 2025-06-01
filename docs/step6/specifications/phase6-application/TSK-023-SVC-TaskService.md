# TSK-023-SVC-TaskService Issue仕様書

## 概要
**タスクID**: TSK-023-SVC-TaskService  
**ファイル**: src/services/TaskService.ts  
**複雑度**: 高  
**見積時間**: 4時間  
**優先度**: 🥇最重要（タスク管理ビジネスロジック）  
**フェーズ**: Phase 6: アプリケーション層実装  

## 実装対象
- **ファイル**: `src/services/TaskService.ts`
- **クラス**: TaskService（タスク管理サービス）
- **レイヤー**: Application（アプリケーション層）
- **責任範囲**: タスクCRUD・検索・フィルタリング・ビジネスロジック

## 実装仕様

### 前提条件
- 依存タスク: TSK-016 (Taskエンティティ), TSK-018 (TaskRepository)
- 参照設計書: `docs/step3/detailed-design/service-design.md`

### TaskService メソッド仕様

#### 1. タスク作成・更新 (4メソッド)
```typescript
export class TaskService {
  constructor(
    private taskRepository: TaskRepository,
    private userRepository: UserRepository
  ) {}

  // 1. createTask(userId: UserID, request: TaskCreateRequest): Promise<Result<Task, TaskError>>
  async createTask(userId: UserID, request: TaskCreateRequest): Promise<Result<Task, TaskError>> {
    try {
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return Err(new TaskError('User not found'));
      }

      const task = new Task({
        id: generateTaskID(),
        userId,
        title: request.title,
        description: request.description,
        status: 'pending',
        priority: request.priority || 'medium',
        dueDate: request.dueDate,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      const savedTask = await this.taskRepository.save(task);
      return Ok(savedTask);
    } catch (error) {
      return Err(new TaskError('Failed to create task'));
    }
  }

  // 2. updateTask(taskId: TaskID, request: TaskUpdateRequest): Promise<Result<Task, TaskError>>
  // 3. deleteTask(taskId: TaskID, userId: UserID): Promise<Result<void, TaskError>>
  // 4. completeTask(taskId: TaskID, userId: UserID): Promise<Result<Task, TaskError>>
}
```

#### 2. タスク検索・取得 (5メソッド)
```typescript
// 5. getTaskById(taskId: TaskID, userId: UserID): Promise<Result<Task, TaskError>>
// 6. getUserTasks(userId: UserID): Promise<Result<Task[], TaskError>>
// 7. searchTasks(userId: UserID, filter: TaskFilter): Promise<Result<PaginatedResult<Task>, TaskError>>
// 8. getTasksByStatus(userId: UserID, status: TaskStatus): Promise<Result<Task[], TaskError>>
// 9. getTasksByPriority(userId: UserID, priority: TaskPriority): Promise<Result<Task[], TaskError>>
```

#### 3. 高度な機能 (3メソッド)
```typescript
// 10. getTaskStatistics(userId: UserID): Promise<Result<TaskStatistics, TaskError>>
async getTaskStatistics(userId: UserID): Promise<Result<TaskStatistics, TaskError>> {
  try {
    const tasks = await this.taskRepository.findByUserId(userId);
    
    const stats: TaskStatistics = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      overdue: tasks.filter(t => this.isOverdue(t)).length,
      completionRate: tasks.length > 0 ? 
        (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0
    };

    return Ok(stats);
  } catch (error) {
    return Err(new TaskError('Failed to get task statistics'));
  }
}

// 11. bulkUpdateTasks(taskIds: TaskID[], update: TaskUpdateRequest): Promise<Result<Task[], TaskError>>
// 12. archiveCompletedTasks(userId: UserID, beforeDate: Date): Promise<Result<number, TaskError>>
```

### ビジネスルール・バリデーション
- **権限チェック**: ユーザーは自分のタスクのみ操作可能
- **ステータス遷移**: pending → in_progress → completed のみ有効
- **期限管理**: 過去日付設定の制限・期限切れ通知
- **一括操作**: 最大100件までの制限・トランザクション管理

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
  - [ ] TaskServiceの責任範囲・ビジネスルール確認
  - [ ] Repository層との依存関係理解
  - [ ] エラーハンドリング・トランザクション戦略
- [ ] 2. コーディング
  - [ ] TaskService基本構造実装
  - [ ] CRUD操作（create、read、update、delete）実装
  - [ ] 検索・フィルタリング機能実装
  - [ ] 統計・集計機能実装
  - [ ] バリデーション・権限チェック実装
- [ ] 3. テストコーディング
  - [ ] 正常系：タスクCRUD・検索・統計テスト
  - [ ] 異常系：権限エラー・データ不整合テスト
  - [ ] 境界値：一括操作上限・日付境界テスト
  - [ ] 統合テスト：Repository層との連携テスト
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：タスクCRUD・検索・統計取得成功
- [ ] 異常系テスト：権限不足・データ不整合・Repository例外
- [ ] ビジネスルールテスト：ステータス遷移・期限管理
- [ ] 性能テスト：大量データでの検索・一括操作性能
- [ ] 統合テスト：UserService・Repository層との連携

## 完了条件
- [ ] 全12メソッド実装・動作確認完了
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] ビジネスルール・権限チェック実装確認
- [ ] Repository層との統合テスト成功
- [ ] エラーハンドリング・ログ出力実装完了

## 関連情報
- **設計書**: `docs/step3/detailed-design/service-design.md`
- **依存タスク**: TSK-016 (Taskエンティティ), TSK-018 (TaskRepository)
- **後続タスク**: TSK-024 (Controller実装)
- **ビジネスロジック**: タスク管理・統計・権限管理

## 備考
- DDD（ドメイン駆動設計）のApplication Service実装
- トランザクション境界の適切な管理
- 性能を考慮した検索・フィルタリング最適化
- 将来的な拡張（通知・リマインダー等）を考慮 