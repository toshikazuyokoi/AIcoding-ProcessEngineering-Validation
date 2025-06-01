# TSK-016-ENT-Task Issue仕様書

## 概要
**タスクID**: TSK-016-ENT-Task  
**ファイル**: src/domain/entities/Task.ts  
**複雑度**: 高  
**見積時間**: 4時間  
**優先度**: 🥇最重要（タスクエンティティ・ドメインロジック）  
**フェーズ**: Phase 3: ドメイン層構築  

## 実装対象
- **ファイル**: `src/domain/entities/Task.ts`
- **クラス**: Task・TaskValue Objects・TaskBuilder・TaskSpecification
- **レイヤー**: Domain（ドメイン層）
- **責任範囲**: タスクビジネスロジック・ドメインルール・不変条件・状態遷移

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core, TSK-011-TYP-User, TSK-012-TYP-Task
- 参照設計書: `docs/step3/detailed-design/task-entity.md`
- 技術スタック: TypeScript, Domain-Driven Design (DDD)

### タスクエンティティ設計

#### 1. Task Entity Core
```typescript
import { Entity, ValueObject, DomainEvent } from '../base/Entity.js';
import { UserID, Timestamp, Result, Ok, Err } from '../../types/core.js';
import { TaskID, TaskTitle, TaskDescription, TaskPriority, TaskStatus } from '../../types/task.js';
import { DomainError, DomainErrorCode } from '../errors/DomainError.js';

export class Task extends Entity<TaskID> {
  private _title: TaskTitle;
  private _description: TaskDescription | null;
  private _status: TaskStatus;
  private _priority: TaskPriority;
  private _assigneeId: UserID | null;
  private _creatorId: UserID;
  private _dueDate: Timestamp | null;
  private _estimatedHours: number | null;
  private _actualHours: number | null;
  private _completedAt: Timestamp | null;
  private _tags: TaskTag[];
  private _attachments: TaskAttachment[];
  private _dependencies: TaskDependency[];
  private _subtasks: TaskID[];
  private _parentTaskId: TaskID | null;
  private _progressPercentage: ProgressPercentage;
  private _metadata: TaskMetadata;

  constructor(
    id: TaskID,
    title: TaskTitle,
    creatorId: UserID,
    options: TaskCreationOptions = {}
  ) {
    super(id);
    this._title = title;
    this._description = options.description || null;
    this._status = TaskStatus.PENDING;
    this._priority = options.priority || TaskPriority.MEDIUM;
    this._assigneeId = options.assigneeId || null;
    this._creatorId = creatorId;
    this._dueDate = options.dueDate || null;
    this._estimatedHours = options.estimatedHours || null;
    this._actualHours = null;
    this._completedAt = null;
    this._tags = options.tags || [];
    this._attachments = [];
    this._dependencies = [];
    this._subtasks = [];
    this._parentTaskId = options.parentTaskId || null;
    this._progressPercentage = new ProgressPercentage(0);
    this._metadata = {
      complexity: options.complexity || TaskComplexity.SIMPLE,
      category: options.category || null,
      customFields: options.customFields || {},
      version: 1
    };

    this.addDomainEvent(new TaskCreatedEvent(
      this.id,
      this._title,
      this._creatorId,
      this._assigneeId,
      this.createdAt
    ));
  }

  // Getters
  public get title(): TaskTitle { return this._title; }
  public get description(): TaskDescription | null { return this._description; }
  public get status(): TaskStatus { return this._status; }
  public get priority(): TaskPriority { return this._priority; }
  public get assigneeId(): UserID | null { return this._assigneeId; }
  public get creatorId(): UserID { return this._creatorId; }
  public get dueDate(): Timestamp | null { return this._dueDate; }
  public get estimatedHours(): number | null { return this._estimatedHours; }
  public get actualHours(): number | null { return this._actualHours; }
  public get completedAt(): Timestamp | null { return this._completedAt; }
  public get tags(): readonly TaskTag[] { return [...this._tags]; }
  public get attachments(): readonly TaskAttachment[] { return [...this._attachments]; }
  public get dependencies(): readonly TaskDependency[] { return [...this._dependencies]; }
  public get subtasks(): readonly TaskID[] { return [...this._subtasks]; }
  public get parentTaskId(): TaskID | null { return this._parentTaskId; }
  public get progressPercentage(): number { return this._progressPercentage.value; }
  public get metadata(): TaskMetadata { return { ...this._metadata }; }

  // Business Logic Methods
  public updateTitle(newTitle: TaskTitle): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED) {
      return Err(new DomainError(
        DomainErrorCode.TASK_COMPLETED_IMMUTABLE,
        'Cannot update title of completed task'
      ));
    }

    const oldTitle = this._title;
    this._title = newTitle;
    this.updateVersion();

    this.addDomainEvent(new TaskTitleUpdatedEvent(
      this.id,
      oldTitle,
      newTitle,
      new Date()
    ));

    return Ok(undefined);
  }

  public updateDescription(newDescription: TaskDescription | null): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED) {
      return Err(new DomainError(
        DomainErrorCode.TASK_COMPLETED_IMMUTABLE,
        'Cannot update description of completed task'
      ));
    }

    const oldDescription = this._description;
    this._description = newDescription;
    this.updateVersion();

    this.addDomainEvent(new TaskDescriptionUpdatedEvent(
      this.id,
      oldDescription,
      newDescription,
      new Date()
    ));

    return Ok(undefined);
  }

  public changeStatus(newStatus: TaskStatus, userId: UserID): Result<void, DomainError> {
    const transition = new TaskStatusTransition(this._status, newStatus);
    if (!transition.isValid()) {
      return Err(new DomainError(
        DomainErrorCode.INVALID_STATUS_TRANSITION,
        `Cannot transition from ${this._status} to ${newStatus}`
      ));
    }

    // Check permissions
    if (!this.canUserChangeStatus(userId, newStatus)) {
      return Err(new DomainError(
        DomainErrorCode.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to change task status'
      ));
    }

    const oldStatus = this._status;
    this._status = newStatus;
    this.updateVersion();

    // Handle status-specific business logic
    if (newStatus === TaskStatus.COMPLETED) {
      this._completedAt = new Date();
      this._progressPercentage = new ProgressPercentage(100);
    } else if (newStatus === TaskStatus.IN_PROGRESS) {
      if (this._completedAt) {
        this._completedAt = null;
      }
    }

    this.addDomainEvent(new TaskStatusChangedEvent(
      this.id,
      oldStatus,
      newStatus,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public assign(assigneeId: UserID, assignerId: UserID): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED) {
      return Err(new DomainError(
        DomainErrorCode.TASK_COMPLETED_IMMUTABLE,
        'Cannot assign completed task'
      ));
    }

    if (!this.canUserAssign(assignerId)) {
      return Err(new DomainError(
        DomainErrorCode.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to assign this task'
      ));
    }

    const oldAssigneeId = this._assigneeId;
    this._assigneeId = assigneeId;
    this.updateVersion();

    this.addDomainEvent(new TaskAssignedEvent(
      this.id,
      assigneeId,
      assignerId,
      oldAssigneeId,
      new Date()
    ));

    return Ok(undefined);
  }

  public unassign(userId: UserID): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED) {
      return Err(new DomainError(
        DomainErrorCode.TASK_COMPLETED_IMMUTABLE,
        'Cannot unassign completed task'
      ));
    }

    if (!this.canUserAssign(userId)) {
      return Err(new DomainError(
        DomainErrorCode.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to unassign this task'
      ));
    }

    const oldAssigneeId = this._assigneeId;
    this._assigneeId = null;
    this.updateVersion();

    this.addDomainEvent(new TaskUnassignedEvent(
      this.id,
      oldAssigneeId,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public updatePriority(newPriority: TaskPriority, userId: UserID): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED) {
      return Err(new DomainError(
        DomainErrorCode.TASK_COMPLETED_IMMUTABLE,
        'Cannot update priority of completed task'
      ));
    }

    if (!this.canUserUpdatePriority(userId)) {
      return Err(new DomainError(
        DomainErrorCode.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to update task priority'
      ));
    }

    const oldPriority = this._priority;
    this._priority = newPriority;
    this.updateVersion();

    this.addDomainEvent(new TaskPriorityUpdatedEvent(
      this.id,
      oldPriority,
      newPriority,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public setDueDate(dueDate: Timestamp | null, userId: UserID): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED) {
      return Err(new DomainError(
        DomainErrorCode.TASK_COMPLETED_IMMUTABLE,
        'Cannot set due date of completed task'
      ));
    }

    if (dueDate && dueDate < new Date()) {
      return Err(new DomainError(
        DomainErrorCode.INVALID_DUE_DATE,
        'Due date cannot be in the past'
      ));
    }

    const oldDueDate = this._dueDate;
    this._dueDate = dueDate;
    this.updateVersion();

    this.addDomainEvent(new TaskDueDateUpdatedEvent(
      this.id,
      oldDueDate,
      dueDate,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public updateProgress(percentage: number, userId: UserID): Result<void, DomainError> {
    if (this._status === TaskStatus.COMPLETED && percentage !== 100) {
      return Err(new DomainError(
        DomainErrorCode.INVALID_PROGRESS_UPDATE,
        'Completed task must have 100% progress'
      ));
    }

    if (!this.canUserUpdateProgress(userId)) {
      return Err(new DomainError(
        DomainErrorCode.INSUFFICIENT_PERMISSIONS,
        'User does not have permission to update task progress'
      ));
    }

    const progressResult = ProgressPercentage.create(percentage);
    if (!progressResult.success) {
      return Err(new DomainError(
        DomainErrorCode.INVALID_PROGRESS_VALUE,
        progressResult.error
      ));
    }

    const oldProgress = this._progressPercentage.value;
    this._progressPercentage = progressResult.data;
    this.updateVersion();

    // Auto-update status based on progress
    if (percentage === 100 && this._status !== TaskStatus.COMPLETED) {
      this.changeStatus(TaskStatus.COMPLETED, userId);
    } else if (percentage > 0 && this._status === TaskStatus.PENDING) {
      this.changeStatus(TaskStatus.IN_PROGRESS, userId);
    }

    this.addDomainEvent(new TaskProgressUpdatedEvent(
      this.id,
      oldProgress,
      percentage,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public addTag(tag: TaskTag, userId: UserID): Result<void, DomainError> {
    if (this._tags.some(t => t.name === tag.name)) {
      return Err(new DomainError(
        DomainErrorCode.TAG_ALREADY_EXISTS,
        `Tag ${tag.name} already exists on this task`
      ));
    }

    if (this._tags.length >= MAX_TAGS_PER_TASK) {
      return Err(new DomainError(
        DomainErrorCode.MAX_TAGS_EXCEEDED,
        `Task cannot have more than ${MAX_TAGS_PER_TASK} tags`
      ));
    }

    this._tags.push(tag);
    this.updateVersion();

    this.addDomainEvent(new TaskTagAddedEvent(
      this.id,
      tag,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public removeTag(tagName: string, userId: UserID): Result<void, DomainError> {
    const tagIndex = this._tags.findIndex(t => t.name === tagName);
    if (tagIndex === -1) {
      return Err(new DomainError(
        DomainErrorCode.TAG_NOT_FOUND,
        `Tag ${tagName} not found on this task`
      ));
    }

    const removedTag = this._tags.splice(tagIndex, 1)[0];
    this.updateVersion();

    this.addDomainEvent(new TaskTagRemovedEvent(
      this.id,
      removedTag,
      userId,
      new Date()
    ));

    return Ok(undefined);
  }

  public addDependency(dependentTaskId: TaskID, type: DependencyType): Result<void, DomainError> {
    // Check for circular dependencies
    if (this.wouldCreateCircularDependency(dependentTaskId)) {
      return Err(new DomainError(
        DomainErrorCode.CIRCULAR_DEPENDENCY,
        'Adding this dependency would create a circular dependency'
      ));
    }

    const dependency = new TaskDependency(dependentTaskId, type);
    this._dependencies.push(dependency);
    this.updateVersion();

    this.addDomainEvent(new TaskDependencyAddedEvent(
      this.id,
      dependentTaskId,
      type,
      new Date()
    ));

    return Ok(undefined);
  }

  public removeDependency(dependentTaskId: TaskID): Result<void, DomainError> {
    const depIndex = this._dependencies.findIndex(d => d.taskId === dependentTaskId);
    if (depIndex === -1) {
      return Err(new DomainError(
        DomainErrorCode.DEPENDENCY_NOT_FOUND,
        'Dependency not found'
      ));
    }

    const removedDependency = this._dependencies.splice(depIndex, 1)[0];
    this.updateVersion();

    this.addDomainEvent(new TaskDependencyRemovedEvent(
      this.id,
      dependentTaskId,
      removedDependency.type,
      new Date()
    ));

    return Ok(undefined);
  }

  public addSubtask(subtaskId: TaskID): Result<void, DomainError> {
    if (this._subtasks.includes(subtaskId)) {
      return Err(new DomainError(
        DomainErrorCode.SUBTASK_ALREADY_EXISTS,
        'Subtask already exists'
      ));
    }

    if (this._subtasks.length >= MAX_SUBTASKS_PER_TASK) {
      return Err(new DomainError(
        DomainErrorCode.MAX_SUBTASKS_EXCEEDED,
        `Task cannot have more than ${MAX_SUBTASKS_PER_TASK} subtasks`
      ));
    }

    this._subtasks.push(subtaskId);
    this.updateVersion();

    this.addDomainEvent(new SubtaskAddedEvent(
      this.id,
      subtaskId,
      new Date()
    ));

    return Ok(undefined);
  }

  public removeSubtask(subtaskId: TaskID): Result<void, DomainError> {
    const index = this._subtasks.indexOf(subtaskId);
    if (index === -1) {
      return Err(new DomainError(
        DomainErrorCode.SUBTASK_NOT_FOUND,
        'Subtask not found'
      ));
    }

    this._subtasks.splice(index, 1);
    this.updateVersion();

    this.addDomainEvent(new SubtaskRemovedEvent(
      this.id,
      subtaskId,
      new Date()
    ));

    return Ok(undefined);
  }

  // Business Rules & Invariants
  public canUserChangeStatus(userId: UserID, newStatus: TaskStatus): boolean {
    // Creator and assignee can change status
    if (userId === this._creatorId || userId === this._assigneeId) {
      return true;
    }
    
    // Additional role-based permissions would be checked here
    return false;
  }

  public canUserAssign(userId: UserID): boolean {
    return userId === this._creatorId;
  }

  public canUserUpdatePriority(userId: UserID): boolean {
    return userId === this._creatorId || userId === this._assigneeId;
  }

  public canUserUpdateProgress(userId: UserID): boolean {
    return userId === this._assigneeId || userId === this._creatorId;
  }

  public isOverdue(): boolean {
    if (!this._dueDate || this._status === TaskStatus.COMPLETED) {
      return false;
    }
    return new Date() > this._dueDate;
  }

  public isBlocked(): boolean {
    return this._dependencies.some(dep => dep.type === DependencyType.BLOCKS);
  }

  public getDaysUntilDue(): number | null {
    if (!this._dueDate) return null;
    const diffTime = this._dueDate.getTime() - new Date().getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public getEffort(): TaskEffort {
    return new TaskEffort(this._estimatedHours, this._actualHours);
  }

  private wouldCreateCircularDependency(taskId: TaskID): boolean {
    // Implementation would check for circular dependencies
    // This is a simplified version
    return taskId === this.id;
  }

  private updateVersion(): void {
    this._metadata.version += 1;
    this.markAsModified();
  }
}

// Value Objects
export class ProgressPercentage extends ValueObject {
  private readonly _value: number;

  constructor(value: number) {
    super();
    if (value < 0 || value > 100) {
      throw new Error('Progress percentage must be between 0 and 100');
    }
    this._value = value;
  }

  public get value(): number {
    return this._value;
  }

  public static create(value: number): Result<ProgressPercentage, string> {
    try {
      return Ok(new ProgressPercentage(value));
    } catch (error) {
      return Err(error.message);
    }
  }

  protected getEqualityComponents(): Array<any> {
    return [this._value];
  }
}

export class TaskTag extends ValueObject {
  public readonly name: string;
  public readonly color: string;
  public readonly category: string | null;

  constructor(name: string, color: string = '#6B7280', category: string | null = null) {
    super();
    if (!name || name.trim().length === 0) {
      throw new Error('Tag name cannot be empty');
    }
    if (name.length > MAX_TAG_NAME_LENGTH) {
      throw new Error(`Tag name cannot exceed ${MAX_TAG_NAME_LENGTH} characters`);
    }
    this.name = name.trim();
    this.color = color;
    this.category = category;
  }

  protected getEqualityComponents(): Array<any> {
    return [this.name, this.color, this.category];
  }
}

export class TaskAttachment extends ValueObject {
  public readonly id: string;
  public readonly filename: string;
  public readonly size: number;
  public readonly contentType: string;
  public readonly url: string;
  public readonly uploadedAt: Timestamp;
  public readonly uploadedBy: UserID;

  constructor(
    id: string,
    filename: string,
    size: number,
    contentType: string,
    url: string,
    uploadedBy: UserID
  ) {
    super();
    this.id = id;
    this.filename = filename;
    this.size = size;
    this.contentType = contentType;
    this.url = url;
    this.uploadedAt = new Date();
    this.uploadedBy = uploadedBy;
  }

  protected getEqualityComponents(): Array<any> {
    return [this.id];
  }
}

export class TaskDependency extends ValueObject {
  public readonly taskId: TaskID;
  public readonly type: DependencyType;
  public readonly createdAt: Timestamp;

  constructor(taskId: TaskID, type: DependencyType) {
    super();
    this.taskId = taskId;
    this.type = type;
    this.createdAt = new Date();
  }

  protected getEqualityComponents(): Array<any> {
    return [this.taskId, this.type];
  }
}

export class TaskEffort extends ValueObject {
  public readonly estimated: number | null;
  public readonly actual: number | null;

  constructor(estimated: number | null, actual: number | null) {
    super();
    if (estimated !== null && estimated < 0) {
      throw new Error('Estimated hours cannot be negative');
    }
    if (actual !== null && actual < 0) {
      throw new Error('Actual hours cannot be negative');
    }
    this.estimated = estimated;
    this.actual = actual;
  }

  public get variance(): number | null {
    if (this.estimated === null || this.actual === null) {
      return null;
    }
    return this.actual - this.estimated;
  }

  public get efficiency(): number | null {
    if (this.estimated === null || this.actual === null || this.actual === 0) {
      return null;
    }
    return this.estimated / this.actual;
  }

  protected getEqualityComponents(): Array<any> {
    return [this.estimated, this.actual];
  }
}

// Supporting Types
export interface TaskCreationOptions {
  description?: TaskDescription;
  priority?: TaskPriority;
  assigneeId?: UserID;
  dueDate?: Timestamp;
  estimatedHours?: number;
  tags?: TaskTag[];
  parentTaskId?: TaskID;
  complexity?: TaskComplexity;
  category?: string;
  customFields?: Record<string, unknown>;
}

export interface TaskMetadata {
  complexity: TaskComplexity;
  category: string | null;
  customFields: Record<string, unknown>;
  version: number;
}

export enum TaskComplexity {
  SIMPLE = 'simple',
  MEDIUM = 'medium',
  COMPLEX = 'complex'
}

export enum DependencyType {
  BLOCKS = 'blocks',
  DEPENDS_ON = 'depends_on',
  RELATED = 'related'
}

export class TaskStatusTransition {
  private static readonly VALID_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.COMPLETED, TaskStatus.ON_HOLD, TaskStatus.CANCELLED],
    [TaskStatus.ON_HOLD]: [TaskStatus.IN_PROGRESS, TaskStatus.CANCELLED],
    [TaskStatus.COMPLETED]: [], // Completed tasks cannot transition
    [TaskStatus.CANCELLED]: [TaskStatus.PENDING] // Can reopen cancelled tasks
  };

  constructor(
    private readonly from: TaskStatus,
    private readonly to: TaskStatus
  ) {}

  public isValid(): boolean {
    const allowedTransitions = TaskStatusTransition.VALID_TRANSITIONS[this.from];
    return allowedTransitions.includes(this.to);
  }

  public static getAllowedTransitions(currentStatus: TaskStatus): TaskStatus[] {
    return TaskStatusTransition.VALID_TRANSITIONS[currentStatus] || [];
  }
}

// Constants
export const MAX_TAGS_PER_TASK = 10;
export const MAX_TAG_NAME_LENGTH = 50;
export const MAX_SUBTASKS_PER_TASK = 20;
export const MAX_ATTACHMENTS_PER_TASK = 10;

// Domain Events
export abstract class TaskDomainEvent extends DomainEvent {
  constructor(
    public readonly taskId: TaskID,
    public readonly occurredAt: Date
  ) {
    super();
  }
}

export class TaskCreatedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly title: TaskTitle,
    public readonly creatorId: UserID,
    public readonly assigneeId: UserID | null,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskStatusChangedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly oldStatus: TaskStatus,
    public readonly newStatus: TaskStatus,
    public readonly changedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskAssignedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly assigneeId: UserID,
    public readonly assignerId: UserID,
    public readonly previousAssigneeId: UserID | null,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskTitleUpdatedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly oldTitle: TaskTitle,
    public readonly newTitle: TaskTitle,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskDescriptionUpdatedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly oldDescription: TaskDescription | null,
    public readonly newDescription: TaskDescription | null,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskPriorityUpdatedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly oldPriority: TaskPriority,
    public readonly newPriority: TaskPriority,
    public readonly updatedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskDueDateUpdatedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly oldDueDate: Timestamp | null,
    public readonly newDueDate: Timestamp | null,
    public readonly updatedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskProgressUpdatedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly oldProgress: number,
    public readonly newProgress: number,
    public readonly updatedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskTagAddedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly tag: TaskTag,
    public readonly addedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskTagRemovedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly tag: TaskTag,
    public readonly removedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskUnassignedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly previousAssigneeId: UserID | null,
    public readonly unassignedBy: UserID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskDependencyAddedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly dependentTaskId: TaskID,
    public readonly dependencyType: DependencyType,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class TaskDependencyRemovedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly dependentTaskId: TaskID,
    public readonly dependencyType: DependencyType,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class SubtaskAddedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly subtaskId: TaskID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}

export class SubtaskRemovedEvent extends TaskDomainEvent {
  constructor(
    taskId: TaskID,
    public readonly subtaskId: TaskID,
    occurredAt: Date
  ) {
    super(taskId, occurredAt);
  }
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] Domain-Driven Design (DDD) 原則・パターン理解
  - [ ] タスクドメインロジック・ビジネスルール詳細
  - [ ] エンティティ・バリューオブジェクト設計原則
  - [ ] ドメインイベント・不変条件・制約理解
  - [ ] 状態遷移・権限管理・ビジネスフロー
- [ ] 2. コーディング
  - [ ] Task Entity Core実装
    - [ ] エンティティ基底クラス・識別子管理
    - [ ] プロパティ・ゲッター・カプセル化
    - [ ] 不変条件・制約・バリデーション
  - [ ] Business Logic Methods実装
    - [ ] 状態変更・権限チェック・ビジネスルール
    - [ ] 割り当て・進捗・優先度・期限管理
    - [ ] タグ・依存関係・サブタスク管理
  - [ ] Value Objects実装
    - [ ] ProgressPercentage・TaskTag・TaskAttachment
    - [ ] TaskDependency・TaskEffort・不変性保証
    - [ ] 等価性・ハッシュ・シリアライゼーション
  - [ ] Domain Events実装
    - [ ] イベント定義・ペイロード・時刻管理
    - [ ] イベント発行・購読・ハンドラー連携
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] エンティティ生成・状態変更・ビジネスロジック
    - [ ] バリューオブジェクト・等価性・不変性
    - [ ] ドメインイベント・発行・処理
  - [ ] 異常系テスト
    - [ ] 不正状態遷移・権限違反・制約違反
    - [ ] 境界値・null値・不正データ
    - [ ] 循環依存・重複・制限超過
  - [ ] ビジネスルールテスト
    - [ ] 複雑なビジネスロジック・計算・判定
    - [ ] 権限管理・アクセス制御・セキュリティ
    - [ ] 状態一貫性・データ整合性・不変条件
  - [ ] 統合テスト
    - [ ] 他エンティティ連携・集約ルート
    - [ ] ドメインサービス・リポジトリ統合
- [ ] 4. 単体テスト実行
  - [ ] 全メソッド・ビジネスロジックテスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] ドメインルール・制約・不変条件確認
  - [ ] パフォーマンス・メモリ使用量確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#016): タスクエンティティ実装
  - [ ] ドメインロジック・ビジネスルール実装
  - [ ] ドメインイベント・状態管理機能
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] DDD品質・設計原則準拠確認
  - [ ] ビジネスロジック・ルール網羅確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] ドメインエキスパートレビュー完了
  - [ ] アーキテクチャ・品質レビュー完了

## テスト要件
- [ ] 正常系テスト：エンティティ操作・状態変更・ビジネスロジック確認
- [ ] 異常系テスト：不正操作・権限違反・制約違反・エラーハンドリング
- [ ] ビジネスルールテスト：複雑ロジック・計算・判定・権限管理
- [ ] 不変条件テスト：データ整合性・状態一貫性・制約維持
- [ ] ドメインイベントテスト：イベント発行・処理・副作用・通知
- [ ] パフォーマンステスト：大量データ・複雑操作・メモリ効率

## 完了条件
- [ ] Task Entity・Value Objects・Domain Events実装完了
- [ ] 全ビジネスロジック・ドメインルール実装完了
- [ ] 状態遷移・権限管理・制約チェック実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] ビジネスルール・不変条件テスト100%通過
- [ ] ドメインイベント・副作用テスト完了
- [ ] TypeScript厳密モード エラー0件
- [ ] DDD設計原則・品質基準100%準拠

## 関連情報
- **設計書**: `docs/step3/detailed-design/task-entity.md`
- **依存タスク**: TSK-007 (コア型), TSK-011 (ユーザー型), TSK-012 (タスク型)
- **後続タスク**: TSK-018 (TaskRepository), TSK-021 (TaskService)
- **DDD**: Entity, Value Object, Domain Event, Aggregate Root
- **パターン**: State Machine, Strategy, Observer, Factory

## 備考
- Domain-Driven Design (DDD) 原則厳格準拠
- ビジネスロジック・ドメインルール最優先
- 不変条件・データ整合性・状態一貫性重視
- ドメインエキスパート・ビジネス要件密接連携
- 将来的な拡張・進化・複雑化対応設計 