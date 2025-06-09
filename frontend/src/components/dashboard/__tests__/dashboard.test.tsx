/**
 * Dashboard Component Tests
 * 
 * Comprehensive test suite for Dashboard component using staged quality improvement approach.
 * Tests cover basic rendering, data display, interactions, responsive behavior, and edge cases.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard, DashboardProps, TaskDashboardSummary, TaskSummary } from '../dashboard';

// ===================================
// Test Data and Fixtures
// ===================================

const mockTaskSummary: TaskSummary = {
  id: 'task-1',
  title: 'Test Task',
  description: 'Test task description',
  status: 'in_progress',
  priority: 'high',
  dueDate: new Date(Date.now() + 86400000), // Tomorrow
  createdAt: new Date(Date.now() - 86400000), // Yesterday
  updatedAt: new Date()
};

const mockDashboardData: TaskDashboardSummary = {
  userId: 'user-123',
  totalTasks: 25,
  completedTasks: 15,
  pendingTasks: 8,
  inProgressTasks: 2,
  overdueTasks: 3,
  dueTodayTasks: 1,
  dueThisWeekTasks: 5,
  recentTasks: [
    mockTaskSummary,
    {
      id: 'task-2',
      title: 'Another Task',
      status: 'completed',
      priority: 'medium',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000)
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

const defaultProps: DashboardProps = {
  dashboardData: mockDashboardData,
  testId: 'test-dashboard'
};

// ===================================
// Test Utilities
// ===================================

const renderDashboard = (props: Partial<DashboardProps> = {}) => {
  const finalProps = { ...defaultProps, ...props };
  return render(<Dashboard {...finalProps} />);
};

// ===================================
// Phase 1: Basic Rendering and Props
// ===================================

describe('Dashboard Component', () => {
  describe('Phase 1: Basic Rendering and Props', () => {
    test('should render dashboard with basic structure', () => {
      renderDashboard();
      
      expect(screen.getByTestId('test-dashboard')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByText('Welcome back! Here\'s an overview of your tasks.')).toBeInTheDocument();
    });

    test('should render with custom className and testId', () => {
      renderDashboard({
        className: 'custom-dashboard',
        testId: 'custom-dashboard'
      });
      
      const dashboard = screen.getByTestId('custom-dashboard');
      expect(dashboard).toHaveClass('dashboard', 'custom-dashboard');
    });

    test('should render all main sections', () => {
      renderDashboard();
      
      expect(screen.getByLabelText('Task Statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Recent Tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('Quick Actions')).toBeInTheDocument();
    });

    test('should render statistic cards', () => {
      renderDashboard();
      
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
    });

    test('should render task list when tasks exist', () => {
      renderDashboard();
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Another Task')).toBeInTheDocument();
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    test('should render quick action buttons', () => {
      const onCreateTask = jest.fn();
      const onViewAllTasks = jest.fn();
      const onRefresh = jest.fn();
      
      renderDashboard({
        onCreateTask,
        onViewAllTasks,
        onRefresh
      });
      
      expect(screen.getByLabelText('Create new task')).toBeInTheDocument();
      expect(screen.getByLabelText('View all tasks from recent section')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh dashboard')).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 2: Data Display and Statistics
  // ===================================

  describe('Phase 2: Data Display and Statistics', () => {
    test('should display correct task statistics', () => {
      renderDashboard();
      
      expect(screen.getByLabelText('Total Tasks: 25')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed: 15')).toBeInTheDocument();
      expect(screen.getByLabelText('In Progress: 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Overdue: 3')).toBeInTheDocument();
    });

    test('should calculate and display completion rate', () => {
      renderDashboard();
      
      // 15/25 = 60%
      expect(screen.getByText('60% completion rate')).toBeInTheDocument();
    });

    test('should display task details correctly', () => {
      renderDashboard();
      
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test task description')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: in progress')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority: high')).toBeInTheDocument();
    });

    test('should format due dates correctly', () => {
      renderDashboard();
      
      // Task with due date tomorrow should show "Tomorrow"
      expect(screen.getByLabelText(/Due: Tomorrow/)).toBeInTheDocument();
    });

    test('should handle empty task list', () => {
      const emptyData = {
        ...mockDashboardData,
        recentTasks: []
      };
      
      renderDashboard({ dashboardData: emptyData });
      
      expect(screen.getByText('No recent tasks')).toBeInTheDocument();
      expect(screen.queryByRole('list')).not.toBeInTheDocument();
    });

    test('should use mock data when no data provided', () => {
      renderDashboard({ dashboardData: undefined });
      
      // Should still render with mock data
      expect(screen.getByTestId('test-dashboard')).toBeInTheDocument();
      expect(screen.getByText('Task Statistics')).toBeInTheDocument();
    });

    test('should handle zero completion rate', () => {
      const zeroCompletionData = {
        ...mockDashboardData,
        totalTasks: 0,
        completedTasks: 0
      };
      
      renderDashboard({ dashboardData: zeroCompletionData });
      
      expect(screen.getByLabelText('Total Tasks: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed: 0')).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 3: User Interactions
  // ===================================

  describe('Phase 3: User Interactions', () => {
    test('should handle create task action', async () => {
      const user = userEvent.setup();
      const onCreateTask = jest.fn();
      
      renderDashboard({ onCreateTask });
      
      const createButton = screen.getByLabelText('Create new task');
      await user.click(createButton);
      
      expect(onCreateTask).toHaveBeenCalledTimes(1);
    });

    test('should handle view all tasks action', async () => {
      const user = userEvent.setup();
      const onViewAllTasks = jest.fn();
      
      renderDashboard({ onViewAllTasks });
      
      const viewAllButton = screen.getByLabelText('View all tasks from recent section');
      await user.click(viewAllButton);
      
      expect(onViewAllTasks).toHaveBeenCalledTimes(1);
    });

    test('should handle refresh action', async () => {
      const user = userEvent.setup();
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      
      renderDashboard({ onRefresh });
      
      const refreshButton = screen.getByLabelText('Refresh dashboard');
      await user.click(refreshButton);
      
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    test('should handle task click', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();
      
      renderDashboard({ onTaskClick });
      
      const taskButton = screen.getByLabelText('View task: Test Task');
      await user.click(taskButton);
      
      expect(onTaskClick).toHaveBeenCalledWith('task-1');
    });

    test('should handle keyboard navigation on tasks', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();
      
      renderDashboard({ onTaskClick });
      
      const taskButton = screen.getByLabelText('View task: Test Task');
      taskButton.focus();
      
      // Enter key should trigger click
      await user.keyboard('{Enter}');
      expect(onTaskClick).toHaveBeenCalledWith('task-1');
      
      onTaskClick.mockClear();
      
      // Space key should trigger click
      await user.keyboard(' ');
      expect(onTaskClick).toHaveBeenCalledWith('task-1');
    });

    test('should show create task button in empty state', async () => {
      const user = userEvent.setup();
      const onCreateTask = jest.fn();
      const emptyData = {
        ...mockDashboardData,
        recentTasks: []
      };
      
      renderDashboard({ 
        dashboardData: emptyData,
        onCreateTask 
      });
      
      const createButton = screen.getByLabelText('Create your first task');
      await user.click(createButton);
      
      expect(onCreateTask).toHaveBeenCalledTimes(1);
    });
  });

  // ===================================
  // Phase 4: Loading and Error States
  // ===================================

  describe('Phase 4: Loading and Error States', () => {
    test('should render loading state', () => {
      renderDashboard({ loading: true });

      expect(screen.getByRole('status', { name: 'Loading dashboard' })).toBeInTheDocument();
      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
      expect(screen.queryByText('Task Statistics')).not.toBeInTheDocument();
    });

    test('should render error state', () => {
      const errorMessage = 'Failed to load dashboard data';
      renderDashboard({ error: errorMessage });

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Error Loading Dashboard')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.queryByText('Task Statistics')).not.toBeInTheDocument();
    });

    test('should show retry button in error state', async () => {
      const user = userEvent.setup();
      const onRefresh = jest.fn().mockResolvedValue(undefined);
      const errorMessage = 'Network error';

      renderDashboard({
        error: errorMessage,
        onRefresh
      });

      const retryButton = screen.getByLabelText('Retry loading dashboard');
      expect(retryButton).toBeInTheDocument();

      await user.click(retryButton);
      expect(onRefresh).toHaveBeenCalledTimes(1);
    });

    test('should handle refresh loading state', async () => {
      const user = userEvent.setup();
      let resolveRefresh: () => void;
      const onRefresh = jest.fn(() => new Promise<void>(resolve => {
        resolveRefresh = resolve;
      }));

      renderDashboard({ onRefresh });

      const refreshButton = screen.getByLabelText('Refresh dashboard');
      await user.click(refreshButton);

      // Should show refreshing state
      expect(screen.getByText('Refreshing...')).toBeInTheDocument();
      expect(refreshButton).toBeDisabled();

      // Resolve the refresh
      resolveRefresh!();
      await waitFor(() => {
        expect(screen.getByText('Refresh')).toBeInTheDocument();
        expect(refreshButton).not.toBeDisabled();
      });
    });

    test('should apply correct CSS classes for states', () => {
      const { rerender } = renderDashboard();

      // Normal state
      expect(screen.getByTestId('test-dashboard')).toHaveClass('dashboard');
      expect(screen.getByTestId('test-dashboard')).not.toHaveClass('dashboard--loading');
      expect(screen.getByTestId('test-dashboard')).not.toHaveClass('dashboard--error');

      // Loading state
      rerender(<Dashboard {...defaultProps} loading={true} />);
      expect(screen.getByTestId('test-dashboard')).toHaveClass('dashboard--loading');

      // Error state
      rerender(<Dashboard {...defaultProps} error="Test error" />);
      expect(screen.getByTestId('test-dashboard')).toHaveClass('dashboard--error');
    });
  });

  // ===================================
  // Phase 5: Edge Cases and Accessibility
  // ===================================

  describe('Phase 5: Edge Cases and Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      renderDashboard();

      expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
      expect(screen.getByLabelText('Task Statistics')).toBeInTheDocument();
      expect(screen.getByLabelText('Recent Tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('Quick Actions')).toBeInTheDocument();
    });

    test('should have proper ARIA labels for statistics', () => {
      renderDashboard();

      expect(screen.getByLabelText('Total Tasks: 25')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed: 15')).toBeInTheDocument();
      expect(screen.getByLabelText('In Progress: 2')).toBeInTheDocument();
      expect(screen.getByLabelText('Overdue: 3')).toBeInTheDocument();
    });

    test('should have proper ARIA labels for task items', () => {
      renderDashboard();

      expect(screen.getByLabelText('View task: Test Task')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: in progress')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority: high')).toBeInTheDocument();
    });

    test('should handle missing callback functions gracefully', async () => {
      const user = userEvent.setup();

      renderDashboard({
        onCreateTask: undefined,
        onViewAllTasks: undefined,
        onRefresh: undefined,
        onTaskClick: undefined
      });

      // Should not render action buttons when callbacks are missing
      expect(screen.queryByLabelText('Create new task')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('View all tasks')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Refresh dashboard')).not.toBeInTheDocument();

      // Task clicks should not throw errors
      const taskButton = screen.getByLabelText('View task: Test Task');
      await expect(user.click(taskButton)).resolves.not.toThrow();
    });

    test('should handle tasks without due dates', () => {
      const taskWithoutDueDate: TaskSummary = {
        id: 'task-no-due',
        title: 'Task without due date',
        status: 'pending',
        priority: 'low',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dataWithNoDueDate = {
        ...mockDashboardData,
        recentTasks: [taskWithoutDueDate]
      };

      renderDashboard({ dashboardData: dataWithNoDueDate });

      expect(screen.getByText('Task without due date')).toBeInTheDocument();
      expect(screen.queryByLabelText(/Due:/)).not.toBeInTheDocument();
    });

    test('should handle tasks without descriptions', () => {
      const taskWithoutDescription: TaskSummary = {
        id: 'task-no-desc',
        title: 'Task without description',
        status: 'completed',
        priority: 'medium',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const dataWithNoDescription = {
        ...mockDashboardData,
        recentTasks: [taskWithoutDescription]
      };

      renderDashboard({ dashboardData: dataWithNoDescription });

      expect(screen.getByText('Task without description')).toBeInTheDocument();
      expect(screen.queryByText('Test task description')).not.toBeInTheDocument();
    });

    test('should handle different task statuses and priorities', () => {
      const diverseTasks: TaskSummary[] = [
        {
          id: 'task-pending-low',
          title: 'Pending Low Priority',
          status: 'pending',
          priority: 'low',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'task-completed-medium',
          title: 'Completed Medium Priority',
          status: 'completed',
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const diverseData = {
        ...mockDashboardData,
        recentTasks: diverseTasks
      };

      renderDashboard({ dashboardData: diverseData });

      expect(screen.getByLabelText('Status: pending')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority: low')).toBeInTheDocument();
      expect(screen.getByLabelText('Status: completed')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority: medium')).toBeInTheDocument();
    });

    test('should handle extreme statistics values', () => {
      const extremeData = {
        ...mockDashboardData,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0
      };

      renderDashboard({ dashboardData: extremeData });

      expect(screen.getByLabelText('Total Tasks: 0')).toBeInTheDocument();
      expect(screen.getByLabelText('Completed: 0')).toBeInTheDocument();
      expect(screen.getByText('0% completion rate')).toBeInTheDocument();
    });

    test('should prevent double refresh', async () => {
      const user = userEvent.setup();
      let resolveRefresh: () => void;
      const onRefresh = jest.fn(() => new Promise<void>(resolve => {
        resolveRefresh = resolve;
      }));

      renderDashboard({ onRefresh });

      const refreshButton = screen.getByLabelText('Refresh dashboard');

      // First click
      await user.click(refreshButton);
      expect(onRefresh).toHaveBeenCalledTimes(1);

      // Second click while first is still pending
      await user.click(refreshButton);
      expect(onRefresh).toHaveBeenCalledTimes(1); // Should not be called again

      // Resolve the first refresh
      resolveRefresh!();
      await waitFor(() => {
        expect(refreshButton).not.toBeDisabled();
      });
    });

    test('should handle aria-hidden decorative elements', () => {
      renderDashboard();

      // Icons should be aria-hidden
      const icons = document.querySelectorAll('.dashboard__stat-card-icon');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });

      const actionIcons = document.querySelectorAll('.dashboard__action-icon');
      actionIcons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });
});
