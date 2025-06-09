/**
 * Dashboard Component
 * 
 * Main dashboard component displaying task statistics, recent tasks, and quick actions.
 * Provides comprehensive overview of user's task management status.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState, useCallback, useMemo } from 'react';

// ===================================
// Dashboard Types and Interfaces
// ===================================

/**
 * Task dashboard summary interface (simplified for frontend)
 */
export interface TaskDashboardSummary {
  userId: string;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  dueTodayTasks: number;
  dueThisWeekTasks: number;
  recentTasks: TaskSummary[];
  upcomingTasks: TaskSummary[];
  priorityBreakdown: {
    high: number;
    medium: number;
    low: number;
  };
  categoryBreakdown: {
    categoryId: string;
    categoryName: string;
    taskCount: number;
  }[];
}

/**
 * Task summary interface
 */
export interface TaskSummary {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Dashboard props interface
 */
export interface DashboardProps {
  dashboardData?: TaskDashboardSummary;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  onCreateTask?: () => void;
  onTaskClick?: (taskId: string) => void;
  onViewAllTasks?: () => void;
  className?: string;
  testId?: string;
}

/**
 * Statistic card props interface
 */
interface StatisticCardProps {
  title: string;
  value: number;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'danger';
  description?: string;
  className?: string;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_PROPS: Partial<DashboardProps> = {
  loading: false,
  error: null,
  className: '',
  testId: 'dashboard'
};

const MOCK_DASHBOARD_DATA: TaskDashboardSummary = {
  userId: 'user-123',
  totalTasks: 25,
  completedTasks: 15,
  pendingTasks: 8,
  inProgressTasks: 2,
  overdueTasks: 3,
  dueTodayTasks: 1,
  dueThisWeekTasks: 5,
  recentTasks: [
    {
      id: 'task-1',
      title: 'Complete project documentation',
      status: 'in_progress',
      priority: 'high',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      createdAt: new Date(Date.now() - 86400000 * 2), // 2 days ago
      updatedAt: new Date()
    },
    {
      id: 'task-2',
      title: 'Review code changes',
      status: 'pending',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000 * 3), // 3 days from now
      createdAt: new Date(Date.now() - 86400000), // Yesterday
      updatedAt: new Date()
    },
    {
      id: 'task-3',
      title: 'Update dependencies',
      status: 'completed',
      priority: 'low',
      createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
      updatedAt: new Date(Date.now() - 86400000) // Yesterday
    }
  ],
  upcomingTasks: [],
  priorityBreakdown: {
    high: 5,
    medium: 12,
    low: 8
  },
  categoryBreakdown: [
    { categoryId: 'cat-1', categoryName: 'Work', taskCount: 15 },
    { categoryId: 'cat-2', categoryName: 'Personal', taskCount: 10 }
  ]
};

// ===================================
// Utility Functions
// ===================================

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays > 0) return `In ${diffDays} days`;
  return `${Math.abs(diffDays)} days ago`;
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed': return 'success';
    case 'in_progress': return 'warning';
    case 'pending': return 'primary';
    default: return 'primary';
  }
};

const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case 'high': return 'danger';
    case 'medium': return 'warning';
    case 'low': return 'success';
    default: return 'primary';
  }
};

// ===================================
// Statistic Card Component
// ===================================

const StatisticCard: React.FC<StatisticCardProps> = React.memo(({
  title,
  value,
  icon,
  color,
  description,
  className = ''
}) => {
  const cardClasses = [
    'dashboard__stat-card',
    `dashboard__stat-card--${color}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="dashboard__stat-card-header">
        <div className="dashboard__stat-card-icon" aria-hidden="true">
          {icon}
        </div>
        <div className="dashboard__stat-card-content">
          <h3 className="dashboard__stat-card-title">{title}</h3>
          <div className="dashboard__stat-card-value" aria-label={`${title}: ${value}`}>
            {value}
          </div>
          {description && (
            <p className="dashboard__stat-card-description">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
});

StatisticCard.displayName = 'StatisticCard';

// ===================================
// Task List Item Component
// ===================================

interface TaskListItemProps {
  task: TaskSummary;
  onTaskClick: (taskId: string) => void;
}

const TaskListItem: React.FC<TaskListItemProps> = React.memo(({
  task,
  onTaskClick
}) => {
  const handleClick = useCallback(() => {
    onTaskClick(task.id);
  }, [task.id, onTaskClick]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  const statusColor = getStatusColor(task.status);
  const priorityColor = getPriorityColor(task.priority);

  return (
    <li className="dashboard__task-item">
      <button
        className="dashboard__task-button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={`View task: ${task.title}`}
      >
        <div className="dashboard__task-content">
          <h4 className="dashboard__task-title">{task.title}</h4>
          {task.description && (
            <p className="dashboard__task-description">{task.description}</p>
          )}
          <div className="dashboard__task-meta">
            <span
              className={`dashboard__task-status dashboard__task-status--${statusColor}`}
              aria-label={`Status: ${task.status.replace('_', ' ')}`}
            >
              {task.status.replace('_', ' ')}
            </span>
            <span
              className={`dashboard__task-priority dashboard__task-priority--${priorityColor}`}
              aria-label={`Priority: ${task.priority}`}
            >
              {task.priority}
            </span>
            {task.dueDate && (
              <span 
                className="dashboard__task-due-date"
                aria-label={`Due: ${formatDate(task.dueDate)}`}
              >
                {formatDate(task.dueDate)}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
});

TaskListItem.displayName = 'TaskListItem';

// ===================================
// Main Dashboard Component
// ===================================

/**
 * Dashboard Component
 *
 * Main dashboard displaying task statistics and recent activity.
 */
export const Dashboard: React.FC<DashboardProps> = ({
  dashboardData,
  loading = DEFAULT_PROPS.loading!,
  error = DEFAULT_PROPS.error!,
  onRefresh,
  onCreateTask,
  onTaskClick,
  onViewAllTasks,
  className = DEFAULT_PROPS.className!,
  testId = DEFAULT_PROPS.testId!
}) => {
  // ===================================
  // State Management
  // ===================================

  const [refreshing, setRefreshing] = useState(false);

  // ===================================
  // Data Processing
  // ===================================

  const data = useMemo(() =>
    dashboardData || MOCK_DASHBOARD_DATA,
    [dashboardData]
  );

  const completionRate = useMemo(() =>
    data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0,
    [data.totalTasks, data.completedTasks]
  );

  const statisticCards = useMemo(() => [
    {
      title: 'Total Tasks',
      value: data.totalTasks,
      icon: '📊',
      color: 'primary' as const,
      description: 'All tasks'
    },
    {
      title: 'Completed',
      value: data.completedTasks,
      icon: '✅',
      color: 'success' as const,
      description: `${completionRate}% completion rate`
    },
    {
      title: 'In Progress',
      value: data.inProgressTasks,
      icon: '🔄',
      color: 'warning' as const,
      description: 'Active tasks'
    },
    {
      title: 'Overdue',
      value: data.overdueTasks,
      icon: '⚠️',
      color: 'danger' as const,
      description: 'Need attention'
    }
  ], [data, completionRate]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleRefresh = useCallback(async () => {
    if (refreshing || !onRefresh) return;

    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [refreshing, onRefresh]);

  const handleCreateTask = useCallback(() => {
    onCreateTask?.();
  }, [onCreateTask]);

  const handleTaskClick = useCallback((taskId: string) => {
    onTaskClick?.(taskId);
  }, [onTaskClick]);

  const handleViewAllTasks = useCallback(() => {
    onViewAllTasks?.();
  }, [onViewAllTasks]);

  // ===================================
  // Computed Values
  // ===================================

  const dashboardClasses = useMemo(() => [
    'dashboard',
    loading && 'dashboard--loading',
    error && 'dashboard--error',
    className
  ].filter(Boolean).join(' '), [loading, error, className]);

  // ===================================
  // Render Methods
  // ===================================

  const renderLoadingState = () => (
    <div className="dashboard__loading" role="status" aria-label="Loading dashboard">
      <div className="dashboard__loading-spinner" aria-hidden="true">
        ⏳
      </div>
      <p className="dashboard__loading-text">Loading dashboard...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="dashboard__error" role="alert">
      <div className="dashboard__error-icon" aria-hidden="true">
        ❌
      </div>
      <h2 className="dashboard__error-title">Error Loading Dashboard</h2>
      <p className="dashboard__error-message">{error}</p>
      {onRefresh && (
        <button
          className="dashboard__error-retry"
          onClick={handleRefresh}
          disabled={refreshing}
          aria-label="Retry loading dashboard"
        >
          {refreshing ? 'Retrying...' : 'Try Again'}
        </button>
      )}
    </div>
  );

  const renderStatistics = () => (
    <section className="dashboard__statistics" aria-labelledby="dashboard-stats-title">
      <h2 id="dashboard-stats-title" className="dashboard__section-title">
        Task Statistics
      </h2>
      <div className="dashboard__stats-grid">
        {statisticCards.map((card, index) => (
          <StatisticCard
            key={`stat-${index}`}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
          />
        ))}
      </div>
    </section>
  );

  const renderRecentTasks = () => (
    <section className="dashboard__recent-tasks" aria-labelledby="dashboard-recent-title">
      <div className="dashboard__section-header">
        <h2 id="dashboard-recent-title" className="dashboard__section-title">
          Recent Tasks
        </h2>
        {onViewAllTasks && (
          <button
            className="dashboard__view-all-button"
            onClick={handleViewAllTasks}
            aria-label="View all tasks from recent section"
          >
            View All
          </button>
        )}
      </div>

      {data.recentTasks.length > 0 ? (
        <ul className="dashboard__task-list" role="list">
          {data.recentTasks.map(task => (
            <TaskListItem
              key={task.id}
              task={task}
              onTaskClick={handleTaskClick}
            />
          ))}
        </ul>
      ) : (
        <div className="dashboard__empty-state">
          <div className="dashboard__empty-icon" aria-hidden="true">
            📝
          </div>
          <p className="dashboard__empty-message">No recent tasks</p>
          {onCreateTask && (
            <button
              className="dashboard__empty-action"
              onClick={handleCreateTask}
              aria-label="Create your first task"
            >
              Create Task
            </button>
          )}
        </div>
      )}
    </section>
  );

  const renderQuickActions = () => (
    <section className="dashboard__quick-actions" aria-labelledby="dashboard-actions-title">
      <h2 id="dashboard-actions-title" className="dashboard__section-title">
        Quick Actions
      </h2>
      <div className="dashboard__actions-grid">
        {onCreateTask && (
          <button
            className="dashboard__action-button dashboard__action-button--primary"
            onClick={handleCreateTask}
            aria-label="Create new task"
          >
            <span className="dashboard__action-icon" aria-hidden="true">
              ➕
            </span>
            <span className="dashboard__action-text">New Task</span>
          </button>
        )}

        {onViewAllTasks && (
          <button
            className="dashboard__action-button dashboard__action-button--secondary"
            onClick={handleViewAllTasks}
            aria-label="View all tasks"
          >
            <span className="dashboard__action-icon" aria-hidden="true">
              📋
            </span>
            <span className="dashboard__action-text">All Tasks</span>
          </button>
        )}

        {onRefresh && (
          <button
            className="dashboard__action-button dashboard__action-button--tertiary"
            onClick={handleRefresh}
            disabled={refreshing}
            aria-label="Refresh dashboard"
          >
            <span className="dashboard__action-icon" aria-hidden="true">
              {refreshing ? '⏳' : '🔄'}
            </span>
            <span className="dashboard__action-text">
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </span>
          </button>
        )}
      </div>
    </section>
  );

  // ===================================
  // Main Render
  // ===================================

  if (loading) {
    return (
      <div className={dashboardClasses} data-testid={testId}>
        {renderLoadingState()}
      </div>
    );
  }

  if (error) {
    return (
      <div className={dashboardClasses} data-testid={testId}>
        {renderErrorState()}
      </div>
    );
  }

  return (
    <div className={dashboardClasses} data-testid={testId}>
      <header className="dashboard__header">
        <h1 className="dashboard__title">Dashboard</h1>
        <p className="dashboard__subtitle">
          Welcome back! Here's an overview of your tasks.
        </p>
      </header>

      <main className="dashboard__content">
        {renderStatistics()}
        {renderRecentTasks()}
        {renderQuickActions()}
      </main>
    </div>
  );
};

// Set display name for debugging
Dashboard.displayName = 'Dashboard';

// ===================================
// Export Default Component
// ===================================

export default Dashboard;
