/**
 * ===================================
 * Task Entity Class
 * ===================================
 * Purpose: Task domain entity with business logic
 * Features:
 * - Task information management
 * - Status and priority management
 * - Due date and completion tracking
 * - Business rule enforcement
 * - User association
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { BaseEntity, EntityCreationOptions, EntityValidationError } from './base.entity';

/**
 * Task priority enumeration
 */
export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

/**
 * Task status enumeration
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed'
}

/**
 * Task creation data interface
 */
export interface TaskCreationData {
  userId: string;
  title: string;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
  status?: TaskStatus | undefined;
  dueDate?: Date | undefined;
}

/**
 * Task update data interface
 */
export interface TaskUpdateData {
  title?: string | undefined;
  description?: string | undefined;
  priority?: TaskPriority | undefined;
  status?: TaskStatus | undefined;
  dueDate?: Date | undefined;
}

/**
 * Task summary data interface
 */
export interface TaskSummaryData {
  id: string;
  userId: string;
  title: string;
  description: string | undefined;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: Date | undefined;
  completedAt: Date | undefined;
  isOverdue: boolean;
}

/**
 * Task Entity Class
 * 
 * Represents a task in the system with status management and business logic.
 * Extends BaseEntity to inherit common entity functionality.
 */
export class Task extends BaseEntity {
  private _userId: string;
  private _title: string;
  private _description: string | undefined;
  private _priority: TaskPriority;
  private _status: TaskStatus;
  private _dueDate: Date | undefined;
  private _completedAt: Date | undefined;

  /**
   * Constructor for Task entity
   * 
   * @param data - Task creation data
   * @param options - Entity creation options
   * @throws {EntityValidationError} When validation fails
   */
  constructor(data: TaskCreationData, options: EntityCreationOptions = {}) {
    super(options);
    
    // Initialize task-specific properties
    this._userId = data.userId;
    this._title = data.title;
    this._description = data.description;
    this._priority = data.priority || TaskPriority.MEDIUM;
    this._status = data.status || TaskStatus.PENDING;
    this._dueDate = data.dueDate;
    this._completedAt = undefined;

    // Validate all properties after initialization
    this.validateInvariants();
  }

  /**
   * Get user ID (immutable)
   */
  public get userId(): string {
    return this._userId;
  }

  /**
   * Get task title
   */
  public get title(): string {
    return this._title;
  }

  /**
   * Get task description
   */
  public get description(): string | undefined {
    return this._description;
  }

  /**
   * Get task priority
   */
  public get priority(): TaskPriority {
    return this._priority;
  }

  /**
   * Get task status
   */
  public get status(): TaskStatus {
    return this._status;
  }

  /**
   * Get due date
   */
  public get dueDate(): Date | undefined {
    return this._dueDate ? new Date(this._dueDate.getTime()) : undefined;
  }

  /**
   * Get completion date
   */
  public get completedAt(): Date | undefined {
    return this._completedAt ? new Date(this._completedAt.getTime()) : undefined;
  }

  /**
   * Check if task is completed
   * 
   * @returns {boolean} True if task status is completed
   */
  public isCompleted(): boolean {
    return this._status === TaskStatus.COMPLETED;
  }

  /**
   * Check if task is in progress
   * 
   * @returns {boolean} True if task status is in progress
   */
  public isInProgress(): boolean {
    return this._status === TaskStatus.IN_PROGRESS;
  }

  /**
   * Check if task is pending
   * 
   * @returns {boolean} True if task status is pending
   */
  public isPending(): boolean {
    return this._status === TaskStatus.PENDING;
  }

  /**
   * Check if task is overdue
   * 
   * @returns {boolean} True if task has due date and is past due
   */
  public isOverdue(): boolean {
    if (!this._dueDate || this.isCompleted()) {
      return false;
    }
    
    return new Date() > this._dueDate;
  }

  /**
   * Check if task is high priority
   * 
   * @returns {boolean} True if task priority is high
   */
  public isHighPriority(): boolean {
    return this._priority === TaskPriority.HIGH;
  }

  /**
   * Check if task has due date
   * 
   * @returns {boolean} True if task has due date set
   */
  public hasDueDate(): boolean {
    return this._dueDate !== undefined;
  }

  /**
   * Get days until due date
   * 
   * @returns {number | null} Days until due (negative if overdue), null if no due date
   */
  public getDaysUntilDue(): number | null {
    if (!this._dueDate) {
      return null;
    }

    const now = new Date();
    const diffTime = this._dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  /**
   * Update task information
   * 
   * @param data - Task update data
   * @throws {EntityValidationError} When validation fails
   */
  public updateTask(data: TaskUpdateData): void {
    const previousData = {
      title: this._title,
      description: this._description,
      priority: this._priority,
      status: this._status,
      dueDate: this._dueDate
    };

    try {
      // Update properties if provided
      if (data.title !== undefined) {
        this._title = data.title;
      }
      
      if (data.description !== undefined) {
        this._description = data.description;
      }
      
      if (data.priority !== undefined) {
        this._priority = data.priority;
      }
      
      if (data.status !== undefined) {
        this.changeStatus(data.status);
      }
      
      if (data.dueDate !== undefined) {
        this._dueDate = data.dueDate;
      }

      // Validate updated data
      this.validateInvariants();
      
      // Mark entity as updated
      this.markAsUpdated();

    } catch (error) {
      // Rollback changes on validation failure
      this._title = previousData.title;
      this._description = previousData.description;
      this._priority = previousData.priority;
      this._status = previousData.status;
      this._dueDate = previousData.dueDate;
      
      throw error;
    }
  }

  /**
   * Change task status with business rules
   * 
   * @param newStatus - New status to set
   * @throws {EntityValidationError} When status transition is invalid
   */
  public changeStatus(newStatus: TaskStatus): void {
    // Validate status transition
    this.validateStatusTransition(this._status, newStatus);

    const oldStatus = this._status;
    this._status = newStatus;

    // Handle completion
    if (newStatus === TaskStatus.COMPLETED && oldStatus !== TaskStatus.COMPLETED) {
      this._completedAt = new Date();
    }

    // Handle uncompleting
    if (oldStatus === TaskStatus.COMPLETED && newStatus !== TaskStatus.COMPLETED) {
      this._completedAt = undefined;
    }

    this.markAsUpdated();
  }

  /**
   * Mark task as completed
   * 
   * @throws {EntityValidationError} When task is already completed
   */
  public complete(): void {
    if (this.isCompleted()) {
      throw new EntityValidationError('Task is already completed', 'Task', this.id);
    }

    this.changeStatus(TaskStatus.COMPLETED);
  }

  /**
   * Start task (change to in progress)
   * 
   * @throws {EntityValidationError} When task is already completed
   */
  public start(): void {
    if (this.isCompleted()) {
      throw new EntityValidationError('Cannot start a completed task', 'Task', this.id);
    }

    this.changeStatus(TaskStatus.IN_PROGRESS);
  }

  /**
   * Reset task to pending
   * 
   * @throws {EntityValidationError} When task cannot be reset
   */
  public reset(): void {
    this.changeStatus(TaskStatus.PENDING);
  }

  /**
   * Set task priority
   * 
   * @param priority - New priority to set
   */
  public setPriority(priority: TaskPriority): void {
    this._priority = priority;
    this.markAsUpdated();
  }

  /**
   * Set due date
   * 
   * @param dueDate - New due date to set (null to remove)
   * @throws {EntityValidationError} When due date is invalid
   */
  public setDueDate(dueDate: Date | null): void {
    if (dueDate && dueDate <= new Date()) {
      throw new EntityValidationError('Due date must be in the future', 'Task', this.id);
    }

    this._dueDate = dueDate || undefined;
    this.markAsUpdated();
  }

  /**
   * Get task summary
   * 
   * @returns {TaskSummaryData} Task summary information
   */
  public getSummary(): TaskSummaryData {
    return {
      id: this.id,
      userId: this._userId,
      title: this._title,
      description: this._description,
      priority: this._priority,
      status: this._status,
      dueDate: this._dueDate ? new Date(this._dueDate.getTime()) : undefined,
      completedAt: this._completedAt ? new Date(this._completedAt.getTime()) : undefined,
      isOverdue: this.isOverdue()
    };
  }

  /**
   * Clone task entity with optional updates
   *
   * @param updates - Optional property updates
   * @returns {Task} New task instance
   */
  public clone(updates?: Partial<TaskCreationData>): Task {
    // If cloning a completed task or updating to completed status, handle specially
    const finalStatus = updates?.status ?? this._status;

    if (finalStatus === TaskStatus.COMPLETED) {
      // Create task with non-completed status first
      const taskData: TaskCreationData = {
        userId: updates?.userId ?? this._userId,
        title: updates?.title ?? this._title,
        description: updates?.description ?? this._description,
        priority: updates?.priority ?? this._priority,
        status: TaskStatus.PENDING, // Start as pending
        dueDate: updates?.dueDate ?? this._dueDate
      };

      const clonedTask = new Task(taskData, {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      });

      // Then complete it to set completedAt properly
      clonedTask.complete();

      return clonedTask;
    } else {
      // Normal cloning for non-completed tasks
      const taskData: TaskCreationData = {
        userId: updates?.userId ?? this._userId,
        title: updates?.title ?? this._title,
        description: updates?.description ?? this._description,
        priority: updates?.priority ?? this._priority,
        status: finalStatus,
        dueDate: updates?.dueDate ?? this._dueDate
      };

      return new Task(taskData, {
        id: this.id,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      });
    }
  }

  /**
   * Get additional properties for serialization
   *
   * @returns {object} Task-specific properties
   */
  protected override getAdditionalProperties(): Record<string, any> {
    return {
      userId: this._userId,
      title: this._title,
      description: this._description,
      priority: this._priority,
      status: this._status,
      dueDate: this._dueDate?.toISOString(),
      completedAt: this._completedAt?.toISOString()
    };
  }

  /**
   * Validate task-specific invariant conditions
   *
   * @throws {EntityValidationError} When validation fails
   */
  protected override validateInvariants(): void {
    super.validateInvariants();

    // Validate userId
    if (!this._userId || typeof this._userId !== 'string') {
      throw new EntityValidationError('User ID is required', 'Task', this.id);
    }

    if (this._userId.trim().length === 0) {
      throw new EntityValidationError('User ID cannot be empty', 'Task', this.id);
    }

    // Validate title
    if (!this._title || typeof this._title !== 'string') {
      throw new EntityValidationError('Task title is required', 'Task', this.id);
    }

    if (this._title.trim().length === 0) {
      throw new EntityValidationError('Task title cannot be empty', 'Task', this.id);
    }

    if (this._title.trim().length > 100) {
      throw new EntityValidationError('Task title must be 100 characters or less', 'Task', this.id);
    }

    // Validate description
    if (this._description !== undefined) {
      if (typeof this._description !== 'string') {
        throw new EntityValidationError('Task description must be a string', 'Task', this.id);
      }

      if (this._description.length > 1000) {
        throw new EntityValidationError('Task description must be 1000 characters or less', 'Task', this.id);
      }
    }

    // Validate priority
    if (!Object.values(TaskPriority).includes(this._priority)) {
      throw new EntityValidationError('Invalid task priority', 'Task', this.id);
    }

    // Validate status
    if (!Object.values(TaskStatus).includes(this._status)) {
      throw new EntityValidationError('Invalid task status', 'Task', this.id);
    }

    // Validate due date
    if (this._dueDate !== undefined) {
      if (!(this._dueDate instanceof Date) || isNaN(this._dueDate.getTime())) {
        throw new EntityValidationError('Due date must be a valid Date', 'Task', this.id);
      }

      // Due date should be after creation date
      if (this._dueDate <= this.createdAt) {
        throw new EntityValidationError('Due date must be after creation date', 'Task', this.id);
      }
    }

    // Validate completed date
    if (this._completedAt !== undefined) {
      if (!(this._completedAt instanceof Date) || isNaN(this._completedAt.getTime())) {
        throw new EntityValidationError('Completed date must be a valid Date', 'Task', this.id);
      }

      // Completed date should be after creation date
      if (this._completedAt < this.createdAt) {
        throw new EntityValidationError('Completed date cannot be before creation date', 'Task', this.id);
      }

      // If task is not completed, completedAt should not be set
      if (this._status !== TaskStatus.COMPLETED) {
        throw new EntityValidationError('Completed date can only be set for completed tasks', 'Task', this.id);
      }
    }

    // If task is completed, completedAt should be set
    if (this._status === TaskStatus.COMPLETED && !this._completedAt) {
      throw new EntityValidationError('Completed tasks must have a completion date', 'Task', this.id);
    }
  }

  /**
   * Validate status transition
   *
   * @param fromStatus - Current status
   * @param toStatus - Target status
   * @throws {EntityValidationError} When transition is invalid
   */
  private validateStatusTransition(fromStatus: TaskStatus, toStatus: TaskStatus): void {
    // Allow same status (no-op)
    if (fromStatus === toStatus) {
      return;
    }

    // Define valid transitions
    const validTransitions: Record<TaskStatus, TaskStatus[]> = {
      [TaskStatus.PENDING]: [TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED],
      [TaskStatus.IN_PROGRESS]: [TaskStatus.PENDING, TaskStatus.COMPLETED],
      [TaskStatus.COMPLETED]: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]
    };

    if (!validTransitions[fromStatus].includes(toStatus)) {
      throw new EntityValidationError(
        `Invalid status transition from ${fromStatus} to ${toStatus}`,
        'Task',
        this.id
      );
    }
  }
}
