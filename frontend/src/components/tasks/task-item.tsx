/**
 * ===================================
 * Task Item Component Implementation
 * ===================================
 * Purpose: Individual task display with actions and selection support
 * Features:
 * - Three view modes (list, grid, compact)
 * - Task actions (select, edit, delete, complete)
 * - Status and priority display
 * - Accessibility support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { useCallback, useMemo } from 'react';
import { Task, TaskPriority, TaskStatus, TaskCategory } from '../../hooks/use-tasks';

// ===================================
// Task Item Types and Interfaces
// ===================================

/**
 * Task list view mode enum
 */
export type TaskListViewMode = 'list' | 'grid' | 'compact';

/**
 * Task item props interface
 */
export interface TaskItemProps {
  task: Task;
  isSelected: boolean;
  viewMode: TaskListViewMode;
  onSelect: (taskId: string, selected: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onComplete: (task: Task) => void;
  className?: string;
  testId?: string;
}

/**
 * Task item configuration interface
 */
export interface TaskItemConfig {
  showCategories?: boolean;
  showDescription?: boolean;
  showDueDate?: boolean;
  showActions?: boolean;
  maxDescriptionLength?: number;
  enableSelection?: boolean;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_CONFIG: Required<TaskItemConfig> = {
  showCategories: true,
  showDescription: true,
  showDueDate: true,
  showActions: true,
  maxDescriptionLength: 100,
  enableSelection: true
};

// ===================================
// Utility Functions
// ===================================

/**
 * Get priority color class
 */
const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case 'URGENT':
      return 'task-item__priority--urgent';
    case 'HIGH':
      return 'task-item__priority--high';
    case 'MEDIUM':
      return 'task-item__priority--medium';
    case 'LOW':
      return 'task-item__priority--low';
    default:
      return 'task-item__priority--medium';
  }
};

/**
 * Get status color class
 */
const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'task-item__status--pending';
    case 'IN_PROGRESS':
      return 'task-item__status--in-progress';
    case 'COMPLETED':
      return 'task-item__status--completed';
    case 'CANCELLED':
      return 'task-item__status--cancelled';
    default:
      return 'task-item__status--pending';
  }
};

/**
 * Check if task is overdue
 */
const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'COMPLETED' || task.status === 'CANCELLED') {
    return false;
  }
  
  const dueDate = new Date(task.dueDate);
  const now = new Date();
  
  return dueDate < now;
};

/**
 * Format due date for display
 */
const formatDueDate = (dueDate: string): string => {
  const date = new Date(dueDate);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Tomorrow';
  } else if (diffDays === -1) {
    return 'Yesterday';
  } else if (diffDays > 1 && diffDays <= 7) {
    return `In ${diffDays} days`;
  } else if (diffDays < -1 && diffDays >= -7) {
    return `${Math.abs(diffDays)} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

/**
 * Truncate text to specified length
 */
const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) {
    return text;
  }
  
  return `${text.substring(0, maxLength)}...`;
};

// ===================================
// Main Task Item Component
// ===================================

/**
 * Task Item Component
 * 
 * Displays individual task with actions and selection support.
 */
export const TaskItem: React.FC<TaskItemProps> = React.memo(({
  task,
  isSelected,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onComplete,
  className = '',
  testId = 'task-item'
}) => {
  // ===================================
  // Configuration and Dependencies
  // ===================================

  const config = useMemo(() => DEFAULT_CONFIG, []);

  // ===================================
  // Computed Properties
  // ===================================

  const priorityColor = useMemo(() => getPriorityColor(task.priority), [task.priority]);
  const statusColor = useMemo(() => getStatusColor(task.status), [task.status]);
  const isOverdue = useMemo(() => isTaskOverdue(task), [task]);
  const formattedDueDate = useMemo(() => 
    task.dueDate ? formatDueDate(task.dueDate) : null, 
    [task.dueDate]
  );

  const truncatedDescription = useMemo(() => 
    task.description ? truncateText(task.description, config.maxDescriptionLength) : null,
    [task.description, config.maxDescriptionLength]
  );

  const isCompleted = useMemo(() => task.status === 'COMPLETED', [task.status]);
  const canComplete = useMemo(() => 
    task.status !== 'COMPLETED' && task.status !== 'CANCELLED', 
    [task.status]
  );

  // ===================================
  // Event Handlers
  // ===================================

  const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (config.enableSelection) {
      onSelect(task.id, event.target.checked);
    }
  }, [task.id, onSelect, config.enableSelection]);

  const handleEditClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onEdit(task);
  }, [task, onEdit]);

  const handleDeleteClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the task "${task.title}"?`
    );
    
    if (confirmDelete) {
      onDelete(task);
    }
  }, [task, onDelete]);

  const handleCompleteClick = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (canComplete) {
      onComplete(task);
    }
  }, [task, onComplete, canComplete]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        onEdit(task);
        break;
      case 'Delete':
        event.preventDefault();
        handleDeleteClick(event as any);
        break;
      default:
        break;
    }
  }, [task, onEdit, handleDeleteClick]);

  // ===================================
  // Render Methods
  // ===================================

  const renderCategories = () => {
    if (!config.showCategories || !task.categories || task.categories.length === 0) {
      return null;
    }

    return (
      <div className="task-item__categories">
        {task.categories.map(category => (
          <span
            key={category.id}
            className="task-item__category"
            style={{ backgroundColor: category.color || '#3B82F6' }}
            title={category.name}
          >
            {category.name}
          </span>
        ))}
      </div>
    );
  };

  const renderActions = () => {
    if (!config.showActions) {
      return null;
    }

    return (
      <div className="task-item__actions">
        {canComplete && (
          <button
            onClick={handleCompleteClick}
            className="task-item__action task-item__action--complete"
            aria-label={`Mark task "${task.title}" as complete`}
            title="Mark as complete"
          >
            <span className="task-item__action-icon">✓</span>
            {viewMode === 'list' && <span className="task-item__action-text">Complete</span>}
          </button>
        )}
        <button
          onClick={handleEditClick}
          className="task-item__action task-item__action--edit"
          aria-label={`Edit task "${task.title}"`}
          title="Edit task"
        >
          <span className="task-item__action-icon">✎</span>
          {viewMode === 'list' && <span className="task-item__action-text">Edit</span>}
        </button>
        <button
          onClick={handleDeleteClick}
          className="task-item__action task-item__action--delete"
          aria-label={`Delete task "${task.title}"`}
          title="Delete task"
        >
          <span className="task-item__action-icon">✕</span>
          {viewMode === 'list' && <span className="task-item__action-text">Delete</span>}
        </button>
      </div>
    );
  };

  const renderListView = () => (
    <div
      className={`task-item task-item--list ${className} ${isSelected ? 'task-item--selected' : ''} ${isOverdue ? 'task-item--overdue' : ''} ${isCompleted ? 'task-item--completed' : ''}`}
      data-testid={`${testId}-list`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="listitem"
      aria-selected={isSelected}
    >
      <div className="task-item__content">
        <div className="task-item__header">
          {config.enableSelection && (
            <div className="task-item__selection">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelectChange}
                className="task-item__checkbox"
                aria-label={`Select task: ${task.title}`}
                tabIndex={-1}
              />
            </div>
          )}

          <div className="task-item__main">
            <div className="task-item__title-row">
              <h3 className="task-item__title">
                {task.title}
              </h3>
              <div className="task-item__meta">
                <span className={`task-item__priority ${priorityColor}`}>
                  {task.priority}
                </span>
                <span className={`task-item__status ${statusColor}`}>
                  {task.status}
                </span>
              </div>
            </div>

            {config.showDescription && task.description && (
              <p className="task-item__description">
                {task.description}
              </p>
            )}

            <div className="task-item__details">
              {config.showDueDate && task.dueDate && (
                <span className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}>
                  <span className="task-item__due-date-label">Due:</span>
                  <span className="task-item__due-date-value">{formattedDueDate}</span>
                </span>
              )}

              {renderCategories()}
            </div>
          </div>
        </div>

        {renderActions()}
      </div>
    </div>
  );

  const renderGridView = () => (
    <div
      className={`task-item task-item--grid ${className} ${isSelected ? 'task-item--selected' : ''} ${isOverdue ? 'task-item--overdue' : ''} ${isCompleted ? 'task-item--completed' : ''}`}
      data-testid={`${testId}-grid`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="gridcell"
      aria-selected={isSelected}
    >
      <div className="task-item__card">
        <div className="task-item__card-header">
          {config.enableSelection && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectChange}
              className="task-item__checkbox"
              aria-label={`Select task: ${task.title}`}
              tabIndex={-1}
            />
          )}
          <span className={`task-item__priority ${priorityColor}`}>
            {task.priority}
          </span>
          <span className={`task-item__status ${statusColor}`}>
            {task.status}
          </span>
        </div>

        <div className="task-item__card-body">
          <h3 className="task-item__title">
            {task.title}
          </h3>

          {config.showDescription && task.description && (
            <p className="task-item__description">
              {truncatedDescription}
            </p>
          )}

          {config.showDueDate && task.dueDate && (
            <div className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}>
              <span className="task-item__due-date-label">Due:</span>
              <span className="task-item__due-date-value">{formattedDueDate}</span>
            </div>
          )}

          {renderCategories()}
        </div>

        <div className="task-item__card-footer">
          {renderActions()}
        </div>
      </div>
    </div>
  );

  const renderCompactView = () => (
    <div
      className={`task-item task-item--compact ${className} ${isSelected ? 'task-item--selected' : ''} ${isOverdue ? 'task-item--overdue' : ''} ${isCompleted ? 'task-item--completed' : ''}`}
      data-testid={`${testId}-compact`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      role="row"
      aria-selected={isSelected}
    >
      {config.enableSelection && (
        <input
          type="checkbox"
          checked={isSelected}
          onChange={handleSelectChange}
          className="task-item__checkbox"
          aria-label={`Select task: ${task.title}`}
          tabIndex={-1}
        />
      )}

      <span className="task-item__title" title={task.title}>
        {task.title}
      </span>

      <span className={`task-item__priority ${priorityColor}`} title={`Priority: ${task.priority}`}>
        {task.priority}
      </span>

      <span className={`task-item__status ${statusColor}`} title={`Status: ${task.status}`}>
        {task.status}
      </span>

      {config.showDueDate && task.dueDate && (
        <span
          className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}
          title={`Due: ${formattedDueDate}`}
        >
          {formattedDueDate}
        </span>
      )}

      {renderActions()}
    </div>
  );

  // ===================================
  // Main Render
  // ===================================

  switch (viewMode) {
    case 'list':
      return renderListView();
    case 'grid':
      return renderGridView();
    case 'compact':
      return renderCompactView();
    default:
      return renderListView();
  }
});

// Set display name for debugging
TaskItem.displayName = 'TaskItem';

// ===================================
// Export Default Component
// ===================================

export default TaskItem;
