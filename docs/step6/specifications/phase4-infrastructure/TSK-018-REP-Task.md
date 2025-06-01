# TSK-018-REP-Task Issue仕様書

## 概要
**タスクID**: TSK-018-REP-Task  
**ファイル**: src/infrastructure/repositories/TaskRepository.ts  
**複雑度**: 高  
**見積時間**: 5時間  
**優先度**: 🥇最重要（タスクデータアクセス・永続化）  
**フェーズ**: Phase 4: インフラストラクチャ層構築  

## 実装対象
- **ファイル**: `src/infrastructure/repositories/TaskRepository.ts`
- **クラス**: TaskRepository・TaskMapper・TaskQueryBuilder・TaskAggregateBuilder
- **レイヤー**: Infrastructure（インフラストラクチャ層）
- **責任範囲**: タスクデータ永続化・複雑クエリ・集約処理・依存関係管理

## 実装仕様

### 前提条件
- 依存タスク: TSK-004-DAL-Connection, TSK-016-ENT-Task, TSK-012-TYP-Task
- 参照設計書: `docs/step3/detailed-design/task-repository.md`
- 技術スタック: SQLite, TypeScript, Repository Pattern, Aggregate Root

### タスクリポジトリ設計

#### 1. Task Repository Interface & Implementation
```typescript
import { Repository, IRepository } from '../base/Repository.js';
import { DatabaseConnection, Transaction } from '../database/Connection.js';
import { Task } from '../../domain/entities/Task.js';
import { TaskID, UserID, Timestamp, Result, Ok, Err, PaginatedResult } from '../../types/core.js';
import { TaskSearchCriteria, TaskFilterOptions, TaskStatus, TaskPriority } from '../../types/task.js';
import { RepositoryError, RepositoryErrorCode } from '../errors/RepositoryError.js';
import { Logger } from '../../config/logger.js';

export interface ITaskRepository extends IRepository<Task, TaskID> {
  // Basic CRUD operations
  findById(id: TaskID): Promise<Result<Task | null, RepositoryError>>;
  findByIds(ids: TaskID[]): Promise<Result<Task[], RepositoryError>>;
  save(task: Task): Promise<Result<Task, RepositoryError>>;
  update(task: Task): Promise<Result<Task, RepositoryError>>;
  delete(id: TaskID): Promise<Result<void, RepositoryError>>;
  
  // User-related queries
  findByAssignee(assigneeId: UserID, options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  findByCreator(creatorId: UserID, options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  findByUser(userId: UserID, options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  
  // Status and priority queries
  findByStatus(status: TaskStatus, options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  findByPriority(priority: TaskPriority, options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  findOverdueTasks(options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  findUpcomingTasks(days: number, options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  
  // Dependency and hierarchy queries
  findSubtasks(parentId: TaskID): Promise<Result<Task[], RepositoryError>>;
  findDependentTasks(taskId: TaskID): Promise<Result<Task[], RepositoryError>>;
  findBlockingTasks(taskId: TaskID): Promise<Result<Task[], RepositoryError>>;
  
  // Search and filtering
  search(criteria: TaskSearchCriteria): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  findAll(options?: TaskQueryOptions): Promise<Result<PaginatedResult<Task>, RepositoryError>>;
  
  // Statistics and analytics
  getStatistics(userId?: UserID): Promise<Result<TaskStatistics, RepositoryError>>;
  getTaskCountByStatus(): Promise<Result<Record<TaskStatus, number>, RepositoryError>>;
  getTaskCountByPriority(): Promise<Result<Record<TaskPriority, number>, RepositoryError>>;
  
  // Batch operations
  saveBatch(tasks: Task[]): Promise<Result<Task[], RepositoryError>>;
  updateBatch(tasks: Task[]): Promise<Result<Task[], RepositoryError>>;
  deleteBatch(ids: TaskID[]): Promise<Result<void, RepositoryError>>;
  
  // Transaction support
  withinTransaction<T>(operation: (repo: ITaskRepository) => Promise<T>): Promise<Result<T, RepositoryError>>;
}

export class TaskRepository extends Repository<Task, TaskID> implements ITaskRepository {
  private readonly logger = Logger.getInstance();
  private readonly cache = new Map<TaskID, CacheEntry<Task>>();
  private readonly mapper = new TaskMapper();
  private readonly queryBuilder = new TaskQueryBuilder();

  constructor(
    connection: DatabaseConnection,
    private readonly cacheConfig: CacheConfig = DEFAULT_CACHE_CONFIG
  ) {
    super(connection);
  }

  // Basic CRUD Operations
  public async findById(id: TaskID): Promise<Result<Task | null, RepositoryError>> {
    try {
      // Check cache first
      const cached = this.getFromCache(id);
      if (cached) {
        this.logger.debug('Task found in cache', { taskId: id });
        return Ok(cached);
      }

      const query = this.queryBuilder
        .select()
        .from('tasks')
        .leftJoinTags()
        .leftJoinAttachments()
        .leftJoinDependencies()
        .where('t.id = ?')
        .build();

      const result = await this.connection.query<TaskRow>(query.sql, [id]);
      if (!result.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to find task by ID',
          { taskId: id, error: result.error }
        ));
      }

      if (result.data.length === 0) {
        return Ok(null);
      }

      const task = await this.mapper.toDomain(result.data[0], this.connection);
      this.setCache(id, task);
      
      return Ok(task);
    } catch (error) {
      this.logger.error('Error finding task by ID', error, { taskId: id });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding task',
        { taskId: id, error: error.message }
      ));
    }
  }

  public async save(task: Task): Promise<Result<Task, RepositoryError>> {
    try {
      const taskData = this.mapper.toPersistence(task);

      return await this.withinTransaction(async (txRepo) => {
        // Insert main task record
        const insertTaskQuery = `
          INSERT INTO tasks (
            id, title, description, status, priority, assignee_id, creator_id,
            due_date, estimated_hours, actual_hours, completed_at, parent_task_id,
            progress_percentage, complexity, category, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const taskParams = [
          taskData.id, taskData.title, taskData.description, taskData.status,
          taskData.priority, taskData.assigneeId, taskData.creatorId,
          taskData.dueDate, taskData.estimatedHours, taskData.actualHours,
          taskData.completedAt, taskData.parentTaskId, taskData.progressPercentage,
          taskData.complexity, taskData.category, taskData.createdAt, taskData.updatedAt
        ];

        const taskResult = await this.connection.execute(insertTaskQuery, taskParams);
        if (!taskResult.success) {
          throw new RepositoryError(
            RepositoryErrorCode.INSERT_FAILED,
            'Failed to insert task',
            { taskId: task.id, error: taskResult.error }
          );
        }

        // Insert tags
        if (taskData.tags.length > 0) {
          await this.insertTaskTags(taskData.id, taskData.tags);
        }

        // Insert dependencies
        if (taskData.dependencies.length > 0) {
          await this.insertTaskDependencies(taskData.id, taskData.dependencies);
        }

        // Insert subtasks
        if (taskData.subtasks.length > 0) {
          await this.insertTaskSubtasks(taskData.id, taskData.subtasks);
        }

        this.setCache(task.id, task);
        return task;
      });
    } catch (error) {
      this.logger.error('Error saving task', error, { taskId: task.id });
      if (error instanceof RepositoryError) {
        return Err(error);
      }
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error saving task',
        { taskId: task.id, error: error.message }
      ));
    }
  }

  // User-related queries
  public async findByAssignee(
    assigneeId: UserID, 
    options: TaskQueryOptions = {}
  ): Promise<Result<PaginatedResult<Task>, RepositoryError>> {
    try {
      const query = this.queryBuilder
        .select()
        .from('tasks')
        .leftJoinTags()
        .leftJoinAttachments()
        .where('t.assignee_id = ?')
        .applyFilters(options.filters)
        .applySorting(options.sort)
        .applyPagination(options.pagination)
        .build();

      const countQuery = this.queryBuilder
        .count()
        .from('tasks')
        .where('t.assignee_id = ?')
        .applyFilters(options.filters)
        .build();

      const [dataResult, countResult] = await Promise.all([
        this.connection.query<TaskRow>(query.sql, [assigneeId, ...query.params]),
        this.connection.query<{ count: number }>(countQuery.sql, [assigneeId, ...countQuery.params])
      ]);

      if (!dataResult.success || !countResult.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to find tasks by assignee',
          { assigneeId, options }
        ));
      }

      const tasks = await Promise.all(
        dataResult.data.map(row => this.mapper.toDomain(row, this.connection))
      );
      const total = countResult.data[0].count;

      return Ok(this.buildPaginatedResult(tasks, total, options.pagination));
    } catch (error) {
      this.logger.error('Error finding tasks by assignee', error, { assigneeId, options });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error finding tasks by assignee',
        { assigneeId, error: error.message }
      ));
    }
  }

  // Search functionality
  public async search(criteria: TaskSearchCriteria): Promise<Result<PaginatedResult<Task>, RepositoryError>> {
    try {
      const searchQuery = this.queryBuilder
        .select()
        .from('tasks')
        .leftJoinTags()
        .leftJoinAttachments()
        .addSearchCriteria(criteria)
        .applySorting(criteria.sort)
        .applyPagination(criteria.pagination)
        .build();

      const countQuery = this.queryBuilder
        .count()
        .from('tasks')
        .addSearchCriteria(criteria)
        .build();

      const [dataResult, countResult] = await Promise.all([
        this.connection.query<TaskRow>(searchQuery.sql, searchQuery.params),
        this.connection.query<{ count: number }>(countQuery.sql, countQuery.params)
      ]);

      if (!dataResult.success || !countResult.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to search tasks',
          { criteria }
        ));
      }

      const tasks = await Promise.all(
        dataResult.data.map(row => this.mapper.toDomain(row, this.connection))
      );
      const total = countResult.data[0].count;

      return Ok(this.buildPaginatedResult(tasks, total, criteria.pagination));
    } catch (error) {
      this.logger.error('Error searching tasks', error, { criteria });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error searching tasks',
        { criteria, error: error.message }
      ));
    }
  }

  // Statistics
  public async getStatistics(userId?: UserID): Promise<Result<TaskStatistics, RepositoryError>> {
    try {
      const baseCondition = userId ? 'WHERE t.assignee_id = ? OR t.creator_id = ?' : '';
      const params = userId ? [userId, userId] : [];

      const statsQuery = `
        SELECT 
          COUNT(*) as total_tasks,
          COUNT(CASE WHEN t.status = 'pending' THEN 1 END) as pending_tasks,
          COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as in_progress_tasks,
          COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
          COUNT(CASE WHEN t.status = 'cancelled' THEN 1 END) as cancelled_tasks,
          COUNT(CASE WHEN t.due_date < datetime('now') AND t.status != 'completed' THEN 1 END) as overdue_tasks,
          AVG(CASE WHEN t.status = 'completed' AND t.estimated_hours IS NOT NULL AND t.actual_hours IS NOT NULL 
              THEN t.actual_hours - t.estimated_hours END) as avg_time_variance,
          AVG(t.progress_percentage) as avg_progress
        FROM tasks t
        ${baseCondition}
      `;

      const result = await this.connection.query<TaskStatisticsRow>(statsQuery, params);
      if (!result.success) {
        return Err(new RepositoryError(
          RepositoryErrorCode.QUERY_FAILED,
          'Failed to get task statistics',
          { userId, error: result.error }
        ));
      }

      const stats: TaskStatistics = {
        totalTasks: result.data[0].total_tasks,
        pendingTasks: result.data[0].pending_tasks,
        inProgressTasks: result.data[0].in_progress_tasks,
        completedTasks: result.data[0].completed_tasks,
        cancelledTasks: result.data[0].cancelled_tasks,
        overdueTasks: result.data[0].overdue_tasks,
        averageTimeVariance: result.data[0].avg_time_variance,
        averageProgress: result.data[0].avg_progress
      };

      return Ok(stats);
    } catch (error) {
      this.logger.error('Error getting task statistics', error, { userId });
      return Err(new RepositoryError(
        RepositoryErrorCode.UNEXPECTED_ERROR,
        'Unexpected error getting task statistics',
        { userId, error: error.message }
      ));
    }
  }

  // Helper methods
  private buildPaginatedResult<T>(
    data: T[], 
    total: number, 
    pagination?: PaginationOptions
  ): PaginatedResult<T> {
    const pag = pagination || { page: 1, limit: 10 };
    return {
      data,
      pagination: {
        page: pag.page,
        limit: pag.limit,
        total,
        totalPages: Math.ceil(total / pag.limit),
        hasNext: pag.page * pag.limit < total,
        hasPrevious: pag.page > 1
      }
    };
  }

  // Cache management
  private getFromCache(id: TaskID): Task | null {
    if (!this.cacheConfig.enabled) return null;
    const entry = this.cache.get(id);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.cacheConfig.ttl) {
      this.cache.delete(id);
      return null;
    }
    return entry.data;
  }

  private setCache(id: TaskID, task: Task): void {
    if (!this.cacheConfig.enabled) return;
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(id, { data: task, timestamp: Date.now() });
  }

  // Additional helper methods for complex operations...
}

// Supporting Classes
export class TaskMapper {
  public async toDomain(row: TaskRow, connection: DatabaseConnection): Promise<Task> {
    // Complex mapping from database row to Task aggregate
    // This includes loading related entities like tags, dependencies, etc.
    const task = new Task(
      row.id as TaskID,
      row.title as TaskTitle,
      row.creator_id as UserID,
      {
        description: row.description as TaskDescription,
        priority: row.priority as TaskPriority,
        assigneeId: row.assignee_id as UserID,
        dueDate: row.due_date ? new Date(row.due_date) : null,
        estimatedHours: row.estimated_hours,
        parentTaskId: row.parent_task_id as TaskID,
        complexity: row.complexity as TaskComplexity,
        category: row.category
      }
    );

    // Load and set additional properties...
    return task;
  }

  public toPersistence(task: Task): TaskData {
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assigneeId: task.assigneeId,
      creatorId: task.creatorId,
      dueDate: task.dueDate?.toISOString() || null,
      estimatedHours: task.estimatedHours,
      actualHours: task.actualHours,
      completedAt: task.completedAt?.toISOString() || null,
      parentTaskId: task.parentTaskId,
      progressPercentage: task.progressPercentage,
      complexity: task.metadata.complexity,
      category: task.metadata.category,
      tags: task.tags.map(tag => this.mapTagToPersistence(tag)),
      dependencies: task.dependencies.map(dep => this.mapDependencyToPersistence(dep)),
      subtasks: task.subtasks,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString()
    };
  }

  private mapTagToPersistence(tag: TaskTag): TaskTagData {
    return {
      name: tag.name,
      color: tag.color,
      category: tag.category
    };
  }

  private mapDependencyToPersistence(dependency: TaskDependency): TaskDependencyData {
    return {
      taskId: dependency.taskId,
      type: dependency.type,
      createdAt: dependency.createdAt.toISOString()
    };
  }
}

export class TaskQueryBuilder {
  // Query building implementation similar to UserQueryBuilder
  // but with task-specific joins and conditions
}

// Supporting Types
interface TaskRow {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  assignee_id?: string;
  creator_id: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  completed_at?: string;
  parent_task_id?: string;
  progress_percentage: number;
  complexity: string;
  category?: string;
  created_at: string;
  updated_at: string;
}

interface TaskData {
  id: TaskID;
  title: TaskTitle;
  description: TaskDescription | null;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: UserID | null;
  creatorId: UserID;
  dueDate: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  completedAt: string | null;
  parentTaskId: TaskID | null;
  progressPercentage: number;
  complexity: TaskComplexity;
  category: string | null;
  tags: TaskTagData[];
  dependencies: TaskDependencyData[];
  subtasks: TaskID[];
  createdAt: string;
  updatedAt: string;
}

interface TaskStatisticsRow {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
  cancelled_tasks: number;
  overdue_tasks: number;
  avg_time_variance: number;
  avg_progress: number;
}

interface TaskStatistics {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  cancelledTasks: number;
  overdueTasks: number;
  averageTimeVariance: number;
  averageProgress: number;
}

// Additional supporting types...
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] Repository Pattern・Aggregate Root Pattern理解
  - [ ] 複雑クエリ・依存関係・階層構造データ処理
  - [ ] パフォーマンス最適化・キャッシュ戦略
  - [ ] トランザクション・データ整合性・制約管理
- [ ] 2. コーディング
  - [ ] ITaskRepository Interface実装
  - [ ] TaskRepository Implementation実装
  - [ ] TaskMapper・TaskQueryBuilder実装
  - [ ] 複雑クエリ・統計・集約処理実装
- [ ] 3. テストコーディング
  - [ ] 正常系・異常系・パフォーマンステスト
  - [ ] 依存関係・階層・集約テスト
  - [ ] キャッシュ・トランザクション・統合テスト
- [ ] 4. 単体テスト実行（カバレッジ95%以上）
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：全CRUD・複雑クエリ・統計・依存関係処理確認
- [ ] 異常系テスト：データ制約・トランザクション・エラーハンドリング
- [ ] パフォーマンステスト：大量データ・複雑クエリ・同時アクセス
- [ ] 統合テスト：他リポジトリ連携・データ整合性・トランザクション

## 完了条件
- [ ] TaskRepository・TaskMapper・TaskQueryBuilder実装完了
- [ ] 全CRUD・複雑クエリ・統計・依存関係機能実装完了
- [ ] キャッシュ・パフォーマンス最適化実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] パフォーマンス・統合テスト合格
- [ ] TypeScript厳密モード エラー0件

## 関連情報
- **設計書**: `docs/step3/detailed-design/task-repository.md`
- **依存タスク**: TSK-004 (DB接続), TSK-016 (Taskエンティティ), TSK-012 (タスク型)
- **後続タスク**: TSK-021 (TaskService), TSK-024 (TaskController)
- **パターン**: Repository Pattern, Aggregate Root, Data Mapper

## 備考
- 複雑なタスク階層・依存関係処理重視
- パフォーマンス・スケーラビリティ最優先
- データ整合性・トランザクション安全性確保
- 将来的な拡張・複雑化対応設計 