/**
 * ===================================
 * Task Detail Component Implementation
 * ===================================
 * Purpose: Display task details with edit/delete operations
 * Features:
 * - Task information display
 * - Edit/Delete button functionality
 * - Complete/Incomplete toggle
 * - Back navigation
 * - Responsive design
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * STEP 2.5 Design: SC-006
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTasks, Task, TaskStatus, TaskPriority } from '../../hooks/use-tasks';
import { useAuth } from '../../hooks/use-auth';

// ===================================
// Task Detail Types and Interfaces
// ===================================

/**
 * Task detail props interface
 */
export interface TaskDetailProps {
  taskId?: string;
  onEdit?: (taskId: string) => void;
  onDelete?: (taskId: string) => void;
  onBack?: () => void;
  className?: string;
  testId?: string;
}

/**
 * Task detail state interface
 */
export interface TaskDetailState {
  task: Task | null;
  isLoading: boolean;
  error: string | null;
  isDeleting: boolean;
  isUpdatingStatus: boolean;
}

// ===================================
// Utility Functions
// ===================================

/**
 * Format date for display
 */
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return dateString;
  }
};

/**
 * Get priority display text and class
 */
const getPriorityInfo = (priority: TaskPriority): { text: string; className: string } => {
  const priorityMap = {
    URGENT: { text: '緊急', className: 'task-detail__priority--urgent' },
    HIGH: { text: '高', className: 'task-detail__priority--high' },
    MEDIUM: { text: '中', className: 'task-detail__priority--medium' },
    LOW: { text: '低', className: 'task-detail__priority--low' }
  };
  
  return priorityMap[priority] || { text: priority, className: '' };
};

/**
 * Get status display text and class
 */
const getStatusInfo = (status: TaskStatus): { text: string; className: string } => {
  const statusMap = {
    PENDING: { text: '未着手', className: 'task-detail__status--pending' },
    IN_PROGRESS: { text: '進行中', className: 'task-detail__status--in-progress' },
    COMPLETED: { text: '完了', className: 'task-detail__status--completed' },
    CANCELLED: { text: 'キャンセル', className: 'task-detail__status--cancelled' }
  };
  
  return statusMap[status] || { text: status, className: '' };
};

// ===================================
// Main Task Detail Component
// ===================================

/**
 * Task Detail Component
 * 
 * Displays task details with edit/delete operations and status management.
 */
export const TaskDetail: React.FC<TaskDetailProps> = ({
  taskId: propTaskId,
  onEdit,
  onDelete,
  onBack,
  className = '',
  testId = 'task-detail'
}) => {
  // ===================================
  // Dependencies and Configuration
  // ===================================

  const { id: paramTaskId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getTask, updateTask, deleteTask, completeTask, startTask } = useTasks();

  const taskId = propTaskId || paramTaskId;

  // ===================================
  // State Management
  // ===================================

  const [state, setState] = useState<TaskDetailState>({
    task: null,
    isLoading: true,
    error: null,
    isDeleting: false,
    isUpdatingStatus: false
  });

  // ===================================
  // Computed Properties
  // ===================================

  const canEdit = useMemo(() => {
    return isAuthenticated && state.task && state.task.userId === user?.id;
  }, [isAuthenticated, state.task, user?.id]);

  const canDelete = useMemo(() => {
    return isAuthenticated && state.task && state.task.userId === user?.id;
  }, [isAuthenticated, state.task, user?.id]);

  const isCompleted = useMemo(() => {
    return state.task?.status === 'COMPLETED';
  }, [state.task?.status]);

  const priorityInfo = useMemo(() => {
    return state.task ? getPriorityInfo(state.task.priority) : null;
  }, [state.task]);

  const statusInfo = useMemo(() => {
    return state.task ? getStatusInfo(state.task.status) : null;
  }, [state.task]);

  // ===================================
  // Data Loading
  // ===================================

  const loadTask = useCallback(async () => {
    if (!taskId) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'タスクIDが指定されていません'
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const task = await getTask(taskId);
      setState(prev => ({
        ...prev,
        task,
        isLoading: false,
        error: null
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        task: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'タスクの取得に失敗しました'
      }));
    }
  }, [taskId, getTask]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleEdit = useCallback(() => {
    if (!state.task) return;

    if (onEdit) {
      onEdit(state.task.id);
    } else {
      navigate(`/tasks/${state.task.id}/edit`);
    }
  }, [state.task, onEdit, navigate]);

  const handleDelete = useCallback(async () => {
    if (!state.task || state.isDeleting) return;

    const confirmDelete = window.confirm(
      `タスク「${state.task.title}」を削除してもよろしいですか？\nこの操作は取り消せません。`
    );

    if (!confirmDelete) return;

    setState(prev => ({ ...prev, isDeleting: true }));

    try {
      await deleteTask(state.task.id);
      
      if (onDelete) {
        onDelete(state.task.id);
      } else {
        navigate('/tasks');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isDeleting: false,
        error: error instanceof Error ? error.message : 'タスクの削除に失敗しました'
      }));
    }
  }, [state.task, state.isDeleting, deleteTask, onDelete, navigate]);

  const handleStatusToggle = useCallback(async () => {
    if (!state.task || state.isUpdatingStatus) return;

    setState(prev => ({ ...prev, isUpdatingStatus: true }));

    try {
      let updatedTask: Task;
      
      if (isCompleted) {
        // Mark as in progress
        updatedTask = await startTask(state.task.id);
      } else {
        // Mark as completed
        updatedTask = await completeTask(state.task.id);
      }

      setState(prev => ({
        ...prev,
        task: updatedTask,
        isUpdatingStatus: false
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isUpdatingStatus: false,
        error: error instanceof Error ? error.message : 'ステータスの更新に失敗しました'
      }));
    }
  }, [state.task, state.isUpdatingStatus, isCompleted, startTask, completeTask]);

  const handleBack = useCallback(() => {
    if (onBack) {
      onBack();
    } else {
      navigate('/tasks');
    }
  }, [onBack, navigate]);

  const handleRetry = useCallback(() => {
    loadTask();
  }, [loadTask]);

  // ===================================
  // Render Methods
  // ===================================

  const renderLoading = () => (
    <div className="task-detail__loading" data-testid={`${testId}-loading`}>
      <div className="task-detail__spinner">読み込み中...</div>
    </div>
  );

  const renderError = () => (
    <div className="task-detail__error" data-testid={`${testId}-error`}>
      <div className="task-detail__error-message">
        {state.error}
      </div>
      <button
        onClick={handleRetry}
        className="task-detail__retry-button"
        type="button"
      >
        再試行
      </button>
    </div>
  );

  const renderTaskInfo = () => {
    if (!state.task) return null;

    return (
      <div className="task-detail__info">
        {/* Task Header */}
        <div className="task-detail__header">
          <h1 className="task-detail__title" data-testid={`${testId}-title`}>
            {state.task.title}
          </h1>

          <div className="task-detail__meta">
            {priorityInfo && (
              <span
                className={`task-detail__priority ${priorityInfo.className}`}
                data-testid={`${testId}-priority`}
              >
                優先度: {priorityInfo.text}
              </span>
            )}

            {statusInfo && (
              <span
                className={`task-detail__status ${statusInfo.className}`}
                data-testid={`${testId}-status`}
              >
                ステータス: {statusInfo.text}
              </span>
            )}
          </div>
        </div>

        {/* Task Description */}
        {state.task.description && (
          <div className="task-detail__description">
            <h2 className="task-detail__section-title">説明</h2>
            <p className="task-detail__description-text" data-testid={`${testId}-description`}>
              {state.task.description}
            </p>
          </div>
        )}

        {/* Task Dates */}
        <div className="task-detail__dates">
          <div className="task-detail__date-item">
            <span className="task-detail__date-label">作成日:</span>
            <span className="task-detail__date-value" data-testid={`${testId}-created-at`}>
              {formatDate(state.task.createdAt)}
            </span>
          </div>

          <div className="task-detail__date-item">
            <span className="task-detail__date-label">更新日:</span>
            <span className="task-detail__date-value" data-testid={`${testId}-updated-at`}>
              {formatDate(state.task.updatedAt)}
            </span>
          </div>

          {state.task.dueDate && (
            <div className="task-detail__date-item">
              <span className="task-detail__date-label">期限:</span>
              <span className="task-detail__date-value" data-testid={`${testId}-due-date`}>
                {formatDate(state.task.dueDate)}
              </span>
            </div>
          )}

          {state.task.completedAt && (
            <div className="task-detail__date-item">
              <span className="task-detail__date-label">完了日:</span>
              <span className="task-detail__date-value" data-testid={`${testId}-completed-at`}>
                {formatDate(state.task.completedAt)}
              </span>
            </div>
          )}
        </div>

        {/* Task Categories */}
        {state.task.categories && state.task.categories.length > 0 && (
          <div className="task-detail__categories">
            <h2 className="task-detail__section-title">カテゴリ</h2>
            <div className="task-detail__category-list" data-testid={`${testId}-categories`}>
              {state.task.categories.map((category) => (
                <span
                  key={category.id}
                  className="task-detail__category"
                  style={{ backgroundColor: category.color }}
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderActions = () => (
    <div className="task-detail__actions">
      {/* Status Toggle Button */}
      <button
        onClick={handleStatusToggle}
        disabled={state.isUpdatingStatus || !canEdit}
        className={`task-detail__status-button ${isCompleted ? 'task-detail__status-button--completed' : 'task-detail__status-button--incomplete'}`}
        data-testid={`${testId}-status-toggle`}
        type="button"
      >
        {state.isUpdatingStatus ? (
          '更新中...'
        ) : isCompleted ? (
          '未完了にする'
        ) : (
          '完了にする'
        )}
      </button>

      {/* Edit Button */}
      {canEdit && (
        <button
          onClick={handleEdit}
          className="task-detail__edit-button"
          data-testid={`${testId}-edit-button`}
          type="button"
        >
          編集
        </button>
      )}

      {/* Delete Button */}
      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={state.isDeleting}
          className="task-detail__delete-button"
          data-testid={`${testId}-delete-button`}
          type="button"
        >
          {state.isDeleting ? '削除中...' : '削除'}
        </button>
      )}

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="task-detail__back-button"
        data-testid={`${testId}-back-button`}
        type="button"
      >
        戻る
      </button>
    </div>
  );

  // ===================================
  // Main Render
  // ===================================

  if (state.isLoading) {
    return renderLoading();
  }

  if (state.error && !state.task) {
    return renderError();
  }

  if (!state.task) {
    return (
      <div className="task-detail__not-found" data-testid={`${testId}-not-found`}>
        <div className="task-detail__not-found-message">
          タスクが見つかりません
        </div>
        <button
          onClick={handleBack}
          className="task-detail__back-button"
          type="button"
        >
          戻る
        </button>
      </div>
    );
  }

  return (
    <div
      className={`task-detail ${className}`}
      data-testid={testId}
    >
      {state.error && (
        <div className="task-detail__error-banner" data-testid={`${testId}-error-banner`}>
          {state.error}
        </div>
      )}

      {renderTaskInfo()}
      {renderActions()}
    </div>
  );
};

// Set display name for debugging
TaskDetail.displayName = 'TaskDetail';

// ===================================
// Export Default Component
// ===================================

export default TaskDetail;
