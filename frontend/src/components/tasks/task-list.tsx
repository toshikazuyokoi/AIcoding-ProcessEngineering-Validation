/**
 * ===================================
 * Task List Component Implementation
 * ===================================
 * Purpose: Comprehensive task list display with filtering and pagination
 * Features:
 * - Task list display with responsive design
 * - Advanced filtering and sorting
 * - Pagination and bulk operations
 * - Loading states and error handling
 * - Accessibility support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useTasks, Task, TaskFilters, TaskSortOptions } from '../../hooks/use-tasks';
import { useAuth } from '../../hooks/use-auth';

// ===================================
// Task List Types and Interfaces
// ===================================

/**
 * Task list view modes
 */
export type TaskListViewMode = 'list' | 'grid' | 'compact';

/**
 * Task list configuration interface
 */
export interface TaskListConfig {
  showFilters?: boolean;
  showPagination?: boolean;
  showBulkActions?: boolean;
  showSearch?: boolean;
  defaultViewMode?: TaskListViewMode;
  pageSize?: number;
  enableVirtualization?: boolean;
  enableDragDrop?: boolean;
}

/**
 * Task list props interface
 */
export interface TaskListProps {
  config?: TaskListConfig;
  initialFilters?: TaskFilters;
  initialSort?: TaskSortOptions;
  onTaskSelect?: (task: Task) => void;
  onTaskEdit?: (task: Task) => void;
  onTaskDelete?: (task: Task) => void;
  onTaskComplete?: (task: Task) => void;
  onBulkAction?: (action: string, taskIds: string[]) => void;
  className?: string;
  testId?: string;
}

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
}

/**
 * Filter bar props interface
 */
export interface FilterBarProps {
  filters: TaskFilters;
  onFiltersChange: (filters: Partial<TaskFilters>) => void;
  onClearFilters: () => void;
  className?: string;
}

/**
 * Sort bar props interface
 */
export interface SortBarProps {
  sort: TaskSortOptions;
  onSortChange: (sort: TaskSortOptions) => void;
  className?: string;
}

/**
 * Pagination bar props interface
 */
export interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  className?: string;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_CONFIG: Required<TaskListConfig> = {
  showFilters: true,
  showPagination: true,
  showBulkActions: true,
  showSearch: true,
  defaultViewMode: 'list',
  pageSize: 20,
  enableVirtualization: false,
  enableDragDrop: false
};

// ===================================
// Task Item Component
// ===================================

/**
 * Task Item Component
 * 
 * Displays individual task with actions and selection support.
 */
const TaskItem: React.FC<TaskItemProps> = React.memo(({
  task,
  isSelected,
  viewMode,
  onSelect,
  onEdit,
  onDelete,
  onComplete,
  className = ''
}) => {
  // ===================================
  // Event Handlers
  // ===================================

  const handleSelectChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onSelect(task.id, event.target.checked);
  }, [task.id, onSelect]);

  const handleEditClick = useCallback(() => {
    onEdit(task);
  }, [task, onEdit]);

  const handleDeleteClick = useCallback(() => {
    onDelete(task);
  }, [task, onDelete]);

  const handleCompleteClick = useCallback(() => {
    onComplete(task);
  }, [task, onComplete]);

  // ===================================
  // Computed Properties
  // ===================================

  const isOverdue = useMemo(() => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
  }, [task.dueDate, task.status]);

  const priorityColor = useMemo(() => {
    switch (task.priority) {
      case 'URGENT': return 'text-red-600';
      case 'HIGH': return 'text-orange-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'LOW': return 'text-green-600';
      default: return 'text-gray-600';
    }
  }, [task.priority]);

  const statusColor = useMemo(() => {
    switch (task.status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }, [task.status]);

  // ===================================
  // Render Methods
  // ===================================

  const renderListView = () => (
    <div className={`task-item task-item--list ${className} ${isSelected ? 'task-item--selected' : ''} ${isOverdue ? 'task-item--overdue' : ''}`}>
      <div className="task-item__content">
        <div className="task-item__header">
          <div className="task-item__selection">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelectChange}
              className="task-item__checkbox"
              aria-label={`Select task: ${task.title}`}
            />
          </div>
          
          <div className="task-item__main">
            <h3 className="task-item__title">
              {task.title}
            </h3>
            {task.description && (
              <p className="task-item__description">
                {task.description}
              </p>
            )}
          </div>

          <div className="task-item__meta">
            <span className={`task-item__priority ${priorityColor}`}>
              {task.priority}
            </span>
            <span className={`task-item__status ${statusColor}`}>
              {task.status}
            </span>
            {task.dueDate && (
              <span className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}>
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        <div className="task-item__actions">
          {task.status !== 'COMPLETED' && (
            <button
              onClick={handleCompleteClick}
              className="task-item__action task-item__action--complete"
              aria-label={`Mark task "${task.title}" as complete`}
            >
              Complete
            </button>
          )}
          <button
            onClick={handleEditClick}
            className="task-item__action task-item__action--edit"
            aria-label={`Edit task "${task.title}"`}
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="task-item__action task-item__action--delete"
            aria-label={`Delete task "${task.title}"`}
          >
            Delete
          </button>
        </div>
      </div>

      {task.categories && task.categories.length > 0 && (
        <div className="task-item__categories">
          {task.categories.map(category => (
            <span
              key={category.id}
              className="task-item__category"
              style={{ backgroundColor: category.color }}
            >
              {category.name}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  const renderGridView = () => (
    <div className={`task-item task-item--grid ${className} ${isSelected ? 'task-item--selected' : ''} ${isOverdue ? 'task-item--overdue' : ''}`}>
      <div className="task-item__card">
        <div className="task-item__card-header">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelectChange}
            className="task-item__checkbox"
            aria-label={`Select task: ${task.title}`}
          />
          <span className={`task-item__priority ${priorityColor}`}>
            {task.priority}
          </span>
        </div>

        <div className="task-item__card-body">
          <h3 className="task-item__title">
            {task.title}
          </h3>
          {task.description && (
            <p className="task-item__description">
              {task.description.length > 100 
                ? `${task.description.substring(0, 100)}...` 
                : task.description
              }
            </p>
          )}
        </div>

        <div className="task-item__card-footer">
          <span className={`task-item__status ${statusColor}`}>
            {task.status}
          </span>
          {task.dueDate && (
            <span className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="task-item__card-actions">
          {task.status !== 'COMPLETED' && (
            <button
              onClick={handleCompleteClick}
              className="task-item__action task-item__action--complete"
              aria-label={`Mark task "${task.title}" as complete`}
            >
              ✓
            </button>
          )}
          <button
            onClick={handleEditClick}
            className="task-item__action task-item__action--edit"
            aria-label={`Edit task "${task.title}"`}
          >
            ✎
          </button>
          <button
            onClick={handleDeleteClick}
            className="task-item__action task-item__action--delete"
            aria-label={`Delete task "${task.title}"`}
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );

  const renderCompactView = () => (
    <div className={`task-item task-item--compact ${className} ${isSelected ? 'task-item--selected' : ''} ${isOverdue ? 'task-item--overdue' : ''}`}>
      <input
        type="checkbox"
        checked={isSelected}
        onChange={handleSelectChange}
        className="task-item__checkbox"
        aria-label={`Select task: ${task.title}`}
      />
      <span className="task-item__title">{task.title}</span>
      <span className={`task-item__priority ${priorityColor}`}>{task.priority}</span>
      <span className={`task-item__status ${statusColor}`}>{task.status}</span>
      {task.dueDate && (
        <span className={`task-item__due-date ${isOverdue ? 'task-item__due-date--overdue' : ''}`}>
          {new Date(task.dueDate).toLocaleDateString()}
        </span>
      )}
      <div className="task-item__actions">
        {task.status !== 'COMPLETED' && (
          <button
            onClick={handleCompleteClick}
            className="task-item__action task-item__action--complete"
            aria-label={`Mark task "${task.title}" as complete`}
          >
            ✓
          </button>
        )}
        <button
          onClick={handleEditClick}
          className="task-item__action task-item__action--edit"
          aria-label={`Edit task "${task.title}"`}
        >
          ✎
        </button>
        <button
          onClick={handleDeleteClick}
          className="task-item__action task-item__action--delete"
          aria-label={`Delete task "${task.title}"`}
        >
          ✕
        </button>
      </div>
    </div>
  );

  // ===================================
  // Render
  // ===================================

  switch (viewMode) {
    case 'grid':
      return renderGridView();
    case 'compact':
      return renderCompactView();
    case 'list':
    default:
      return renderListView();
  }
});

TaskItem.displayName = 'TaskItem';

// ===================================
// Filter Bar Component
// ===================================

/**
 * Filter Bar Component
 *
 * Provides filtering controls for task list.
 */
const FilterBar: React.FC<FilterBarProps> = React.memo(({
  filters,
  onFiltersChange,
  onClearFilters,
  className = ''
}) => {
  // ===================================
  // Event Handlers
  // ===================================

  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onFiltersChange({
      status: value === '' ? undefined : value as TaskFilters['status']
    });
  }, [onFiltersChange]);

  const handlePriorityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onFiltersChange({
      priority: value === '' ? undefined : value as TaskFilters['priority']
    });
  }, [onFiltersChange]);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ search: event.target.value || undefined });
  }, [onFiltersChange]);

  const handleClearClick = useCallback(() => {
    onClearFilters();
  }, [onClearFilters]);

  // ===================================
  // Render
  // ===================================

  return (
    <div className={`filter-bar ${className}`}>
      <div className="filter-bar__controls">
        <div className="filter-bar__group">
          <label htmlFor="search-input" className="filter-bar__label">
            Search
          </label>
          <input
            id="search-input"
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="Search tasks..."
            className="filter-bar__input"
          />
        </div>

        <div className="filter-bar__group">
          <label htmlFor="status-filter" className="filter-bar__label">
            Status
          </label>
          <select
            id="status-filter"
            value={filters.status || ''}
            onChange={handleStatusChange}
            className="filter-bar__select"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="filter-bar__group">
          <label htmlFor="priority-filter" className="filter-bar__label">
            Priority
          </label>
          <select
            id="priority-filter"
            value={filters.priority || ''}
            onChange={handlePriorityChange}
            className="filter-bar__select"
          >
            <option value="">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>

        <button
          onClick={handleClearClick}
          className="filter-bar__clear"
          aria-label="Clear all filters"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
});

FilterBar.displayName = 'FilterBar';

// ===================================
// Sort Bar Component
// ===================================

/**
 * Sort Bar Component
 *
 * Provides sorting controls for task list.
 */
const SortBar: React.FC<SortBarProps> = React.memo(({
  sort,
  onSortChange,
  className = ''
}) => {
  // ===================================
  // Event Handlers
  // ===================================

  const handleFieldChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const field = event.target.value as TaskSortOptions['field'];
    onSortChange({ ...sort, field });
  }, [sort, onSortChange]);

  const handleOrderChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const order = event.target.value as TaskSortOptions['order'];
    onSortChange({ ...sort, order });
  }, [sort, onSortChange]);

  // ===================================
  // Render
  // ===================================

  return (
    <div className={`sort-bar ${className}`}>
      <div className="sort-bar__controls">
        <div className="sort-bar__group">
          <label htmlFor="sort-field" className="sort-bar__label">
            Sort by
          </label>
          <select
            id="sort-field"
            value={sort.field}
            onChange={handleFieldChange}
            className="sort-bar__select"
          >
            <option value="createdAt">Created Date</option>
            <option value="updatedAt">Updated Date</option>
            <option value="title">Title</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>

        <div className="sort-bar__group">
          <label htmlFor="sort-order" className="sort-bar__label">
            Order
          </label>
          <select
            id="sort-order"
            value={sort.order}
            onChange={handleOrderChange}
            className="sort-bar__select"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );
});

SortBar.displayName = 'SortBar';

// ===================================
// Pagination Bar Component
// ===================================

/**
 * Pagination Bar Component
 *
 * Provides pagination controls for task list.
 */
const PaginationBar: React.FC<PaginationBarProps> = React.memo(({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = ''
}) => {
  // ===================================
  // Event Handlers
  // ===================================

  const handlePrevClick = useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  }, [currentPage, onPageChange]);

  const handleNextClick = useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  }, [currentPage, totalPages, onPageChange]);

  const handlePageClick = useCallback((page: number) => {
    onPageChange(page);
  }, [onPageChange]);

  const handlePageSizeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newPageSize = parseInt(event.target.value, 10);
    onPageSizeChange(newPageSize);
  }, [onPageSizeChange]);

  // ===================================
  // Computed Properties
  // ===================================

  const startItem = useMemo(() => {
    return (currentPage - 1) * pageSize + 1;
  }, [currentPage, pageSize]);

  const endItem = useMemo(() => {
    return Math.min(currentPage * pageSize, totalItems);
  }, [currentPage, pageSize, totalItems]);

  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }, [currentPage, totalPages]);

  // ===================================
  // Render
  // ===================================

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`pagination-bar ${className}`}>
      <div className="pagination-bar__info">
        <span className="pagination-bar__text">
          Showing {startItem}-{endItem} of {totalItems} tasks
        </span>

        <div className="pagination-bar__page-size">
          <label htmlFor="page-size-select" className="pagination-bar__label">
            Per page:
          </label>
          <select
            id="page-size-select"
            value={pageSize}
            onChange={handlePageSizeChange}
            className="pagination-bar__select"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="pagination-bar__controls">
        <button
          onClick={handlePrevClick}
          disabled={currentPage <= 1}
          className="pagination-bar__button pagination-bar__button--prev"
          aria-label="Go to previous page"
        >
          Previous
        </button>

        <div className="pagination-bar__pages">
          {pageNumbers.map(page => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className={`pagination-bar__page ${
                page === currentPage ? 'pagination-bar__page--current' : ''
              }`}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={handleNextClick}
          disabled={currentPage >= totalPages}
          className="pagination-bar__button pagination-bar__button--next"
          aria-label="Go to next page"
        >
          Next
        </button>
      </div>
    </div>
  );
});

PaginationBar.displayName = 'PaginationBar';

// ===================================
// Main Task List Component
// ===================================

/**
 * Task List Component
 *
 * Main component that orchestrates task display with filtering, sorting, and pagination.
 */
export const TaskList: React.FC<TaskListProps> = ({
  config = {},
  initialFilters = {},
  initialSort = { field: 'createdAt', order: 'desc' },
  onTaskSelect,
  onTaskEdit,
  onTaskDelete,
  onTaskComplete,
  onBulkAction,
  className = '',
  testId = 'task-list'
}) => {
  // ===================================
  // Configuration and Dependencies
  // ===================================

  const finalConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }), [config]);

  const { user, isAuthenticated } = useAuth();

  // ===================================
  // State Management
  // ===================================

  const [viewMode, setViewMode] = useState<TaskListViewMode>(finalConfig.defaultViewMode);
  const [showBulkActions, setShowBulkActions] = useState(false);

  // ===================================
  // Tasks Hook Integration
  // ===================================

  const {
    tasks,
    isLoading,
    error,
    filters,
    sort,
    pagination,
    selectedTasks,
    statistics,
    setFilters,
    clearFilters,
    setSort,
    setPage,
    setLimit,
    selectTask,
    deselectTask,
    selectAllTasks,
    clearSelection,
    fetchTasks,
    refreshTasks,
    deleteTask,
    completeTask,
    bulkDelete,
    bulkComplete,
    hasSelectedTasks,
    selectedTasksCount,
    filteredTasksCount,
    isFiltered,
    clearError
  } = useTasks({
    autoFetch: true,
    defaultFilters: initialFilters,
    defaultSort: initialSort,
    defaultPagination: { limit: finalConfig.pageSize }
  });

  // ===================================
  // Event Handlers
  // ===================================

  const handleTaskSelect = useCallback((taskId: string, selected: boolean) => {
    if (selected) {
      selectTask(taskId);
    } else {
      deselectTask(taskId);
    }
  }, [selectTask, deselectTask]);

  const handleTaskEdit = useCallback((task: Task) => {
    onTaskEdit?.(task);
  }, [onTaskEdit]);

  const handleTaskDelete = useCallback(async (task: Task) => {
    try {
      await deleteTask(task.id);
      onTaskDelete?.(task);
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  }, [deleteTask, onTaskDelete]);

  const handleTaskComplete = useCallback(async (task: Task) => {
    try {
      await completeTask(task.id);
      onTaskComplete?.(task);
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  }, [completeTask, onTaskComplete]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedTasks.length === 0) return;

    try {
      await bulkDelete(selectedTasks);
      onBulkAction?.('delete', selectedTasks);
      clearSelection();
    } catch (err) {
      console.error('Failed to delete tasks:', err);
    }
  }, [selectedTasks, bulkDelete, onBulkAction, clearSelection]);

  const handleBulkComplete = useCallback(async () => {
    if (selectedTasks.length === 0) return;

    try {
      await bulkComplete(selectedTasks);
      onBulkAction?.('complete', selectedTasks);
      clearSelection();
    } catch (err) {
      console.error('Failed to complete tasks:', err);
    }
  }, [selectedTasks, bulkComplete, onBulkAction, clearSelection]);

  const handleSelectAll = useCallback(() => {
    selectAllTasks();
  }, [selectAllTasks]);

  const handleClearSelection = useCallback(() => {
    clearSelection();
  }, [clearSelection]);

  const handleViewModeChange = useCallback((mode: TaskListViewMode) => {
    setViewMode(mode);
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshTasks();
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  }, [refreshTasks]);

  // ===================================
  // Effects
  // ===================================

  useEffect(() => {
    if (hasSelectedTasks && !showBulkActions) {
      setShowBulkActions(true);
    } else if (!hasSelectedTasks && showBulkActions) {
      setShowBulkActions(false);
    }
  }, [hasSelectedTasks, showBulkActions]);

  // ===================================
  // Computed Properties
  // ===================================

  const isEmpty = useMemo(() => {
    return !isLoading && tasks.length === 0;
  }, [isLoading, tasks.length]);

  const isAllSelected = useMemo(() => {
    return tasks.length > 0 && selectedTasks.length === tasks.length;
  }, [tasks.length, selectedTasks.length]);

  // ===================================
  // Render Methods
  // ===================================

  const renderHeader = () => (
    <div className="task-list__header">
      <div className="task-list__title-section">
        <h2 className="task-list__title">
          Tasks
          {filteredTasksCount > 0 && (
            <span className="task-list__count">
              ({filteredTasksCount})
            </span>
          )}
        </h2>

        {statistics && (
          <div className="task-list__stats">
            <span className="task-list__stat">
              {statistics.completedTasks}/{statistics.totalTasks} completed
            </span>
            <span className="task-list__stat">
              {statistics.completionRate.toFixed(1)}% completion rate
            </span>
          </div>
        )}
      </div>

      <div className="task-list__controls">
        <div className="task-list__view-controls">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`task-list__view-button ${viewMode === 'list' ? 'task-list__view-button--active' : ''}`}
            aria-label="List view"
          >
            List
          </button>
          <button
            onClick={() => handleViewModeChange('grid')}
            className={`task-list__view-button ${viewMode === 'grid' ? 'task-list__view-button--active' : ''}`}
            aria-label="Grid view"
          >
            Grid
          </button>
          <button
            onClick={() => handleViewModeChange('compact')}
            className={`task-list__view-button ${viewMode === 'compact' ? 'task-list__view-button--active' : ''}`}
            aria-label="Compact view"
          >
            Compact
          </button>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="task-list__refresh"
          aria-label="Refresh tasks"
        >
          Refresh
        </button>
      </div>
    </div>
  );

  const renderBulkActions = () => {
    if (!showBulkActions || !finalConfig.showBulkActions) return null;

    return (
      <div className="task-list__bulk-actions">
        <div className="task-list__bulk-info">
          <span className="task-list__bulk-count">
            {selectedTasksCount} task{selectedTasksCount !== 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleClearSelection}
            className="task-list__bulk-clear"
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>

        <div className="task-list__bulk-controls">
          <button
            onClick={handleSelectAll}
            className="task-list__bulk-action"
            aria-label="Select all tasks"
          >
            Select All
          </button>
          <button
            onClick={handleBulkComplete}
            className="task-list__bulk-action task-list__bulk-action--complete"
            aria-label="Complete selected tasks"
          >
            Complete Selected
          </button>
          <button
            onClick={handleBulkDelete}
            className="task-list__bulk-action task-list__bulk-action--delete"
            aria-label="Delete selected tasks"
          >
            Delete Selected
          </button>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="task-list__loading" role="status" aria-live="polite">
          <div className="task-list__loading-spinner" aria-hidden="true"></div>
          <span className="task-list__loading-text">Loading tasks...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="task-list__error" role="alert">
          <div className="task-list__error-content">
            <h3 className="task-list__error-title">Error Loading Tasks</h3>
            <p className="task-list__error-message">{error}</p>
            <div className="task-list__error-actions">
              <button
                onClick={handleRefresh}
                className="task-list__error-retry"
              >
                Try Again
              </button>
              <button
                onClick={clearError}
                className="task-list__error-dismiss"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (isEmpty) {
      return (
        <div className="task-list__empty">
          <div className="task-list__empty-content">
            <h3 className="task-list__empty-title">
              {isFiltered ? 'No tasks match your filters' : 'No tasks yet'}
            </h3>
            <p className="task-list__empty-message">
              {isFiltered
                ? 'Try adjusting your filters to see more tasks.'
                : 'Create your first task to get started.'
              }
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="task-list__empty-action"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`task-list__content task-list__content--${viewMode}`}>
        {tasks.map(task => (
          <TaskItem
            key={task.id}
            task={task}
            isSelected={selectedTasks.includes(task.id)}
            viewMode={viewMode}
            onSelect={handleTaskSelect}
            onEdit={handleTaskEdit}
            onDelete={handleTaskDelete}
            onComplete={handleTaskComplete}
          />
        ))}
      </div>
    );
  };

  // ===================================
  // Main Render
  // ===================================

  if (!isAuthenticated || !user) {
    return (
      <div className="task-list__auth-required" role="alert">
        <p>Please log in to view your tasks.</p>
      </div>
    );
  }

  return (
    <div
      className={`task-list ${className}`}
      data-testid={testId}
    >
      {renderHeader()}

      {finalConfig.showFilters && (
        <FilterBar
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={clearFilters}
          className="task-list__filters"
        />
      )}

      {finalConfig.showFilters && (
        <SortBar
          sort={sort}
          onSortChange={setSort}
          className="task-list__sort"
        />
      )}

      {renderBulkActions()}

      {renderContent()}

      {finalConfig.showPagination && (
        <PaginationBar
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          pageSize={pagination.limit}
          totalItems={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setLimit}
          className="task-list__pagination"
        />
      )}
    </div>
  );
};

// ===================================
// Export Default Component
// ===================================

export default TaskList;
