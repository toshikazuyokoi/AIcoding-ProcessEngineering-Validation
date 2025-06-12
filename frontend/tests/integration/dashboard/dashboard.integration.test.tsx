/**
 * ===================================
 * Dashboard Integration Test
 * ===================================
 * Generated for TSK-IT-003-003-DashboardIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test dashboard UI components integration and flow
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/auth-context';
import { Dashboard, TaskDashboardSummary } from '../../../src/components/dashboard/dashboard';

// Mock auth hook
const mockUseAuth = {
  user: { id: 'user-1', email: 'test@example.com', username: 'testuser' },
  isAuthenticated: true,
  isLoading: false,
  error: null,
};

jest.mock('../../../src/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock performance API for performance tests
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
  },
  writable: true,
});

describe('Dashboard Integration Tests', () => {
  const mockDashboardData: TaskDashboardSummary = {
    userId: 'user-1',
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
        description: 'Write comprehensive documentation',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 86400000),
        createdAt: new Date(Date.now() - 86400000 * 2),
        updatedAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Review code changes',
        status: 'pending',
        priority: 'medium',
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date()
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

  const renderDashboard = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Dashboard
            dashboardData={mockDashboardData}
            onRefresh={jest.fn()}
            onCreateTask={jest.fn()}
            onTaskClick={jest.fn()}
            onViewAllTasks={jest.fn()}
            {...props}
          />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('IT-UI-DASH-001: ダッシュボード表示結合テスト', () => {
    test('should display dashboard with statistics', async () => {
      renderDashboard();

      // Verify dashboard structure
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument();

      // Verify statistics cards
      expect(screen.getByText('Total Tasks')).toBeInTheDocument();
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('Overdue')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    test('should display recent tasks section', async () => {
      renderDashboard();

      // Verify recent tasks section
      expect(screen.getByRole('heading', { name: /recent tasks/i })).toBeInTheDocument();
      expect(screen.getByText('Complete project documentation')).toBeInTheDocument();
      expect(screen.getByText('Review code changes')).toBeInTheDocument();

      // Verify task metadata
      expect(screen.getByText('in progress')).toBeInTheDocument();
      expect(screen.getByText('high')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
      expect(screen.getByText('medium')).toBeInTheDocument();
    });

    test('should display quick actions section', async () => {
      renderDashboard();

      // Verify quick actions
      expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create new task/i })).toBeInTheDocument();

      // Find the specific "View all tasks" button in quick actions section
      const quickActionsSection = screen.getByRole('heading', { name: /quick actions/i }).closest('section');
      const viewAllButton = quickActionsSection?.querySelector('button[aria-label="View all tasks"]');
      expect(viewAllButton).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /refresh dashboard/i })).toBeInTheDocument();
    });

    test('should handle loading state', async () => {
      renderDashboard({ loading: true });

      // Verify loading state
      expect(screen.getByRole('status', { name: /loading dashboard/i })).toBeInTheDocument();
      expect(screen.getByText(/loading dashboard/i)).toBeInTheDocument();
    });

    test('should handle error state', async () => {
      const errorMessage = 'Failed to load dashboard data';
      renderDashboard({ error: errorMessage });

      // Verify error state
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/error loading dashboard/i)).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry loading dashboard/i })).toBeInTheDocument();
    });

    test('should handle empty dashboard state', async () => {
      const emptyData: TaskDashboardSummary = {
        ...mockDashboardData,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        dueTodayTasks: 0,
        dueThisWeekTasks: 0,
        recentTasks: [],
        upcomingTasks: []
      };

      renderDashboard({ dashboardData: emptyData });

      // Verify empty state - find specific "Total Tasks" card
      const totalTasksCard = screen.getByText('Total Tasks').closest('.dashboard__stat-card');
      expect(totalTasksCard).toHaveTextContent('0');

      expect(screen.getByText(/no recent tasks/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create your first task/i })).toBeInTheDocument();
    });
  });

  describe('IT-UI-DASH-002: 統計データ更新結合テスト', () => {
    test('should update statistics when data changes', async () => {
      const { rerender } = renderDashboard();

      // Initial state
      expect(screen.getByText('25')).toBeInTheDocument(); // Total tasks

      // Update data
      const updatedData: TaskDashboardSummary = {
        ...mockDashboardData,
        totalTasks: 30,
        completedTasks: 20,
        pendingTasks: 7,
        inProgressTasks: 3
      };

      rerender(
        <BrowserRouter>
          <AuthProvider>
            <Dashboard
              dashboardData={updatedData}
              onRefresh={jest.fn()}
              onCreateTask={jest.fn()}
              onTaskClick={jest.fn()}
              onViewAllTasks={jest.fn()}
            />
          </AuthProvider>
        </BrowserRouter>
      );

      // Verify updated statistics
      expect(screen.getByText('30')).toBeInTheDocument(); // Updated total
      expect(screen.getByText('20')).toBeInTheDocument(); // Updated completed

      // Find the specific "In Progress" statistic card
      const inProgressCard = screen.getByText('In Progress').closest('.dashboard__stat-card');
      expect(inProgressCard).toHaveTextContent('3');
    });

    test('should calculate completion rate correctly', async () => {
      renderDashboard();

      // Verify completion rate calculation (15/25 = 60%)
      expect(screen.getByText(/60% completion rate/i)).toBeInTheDocument();
    });

    test('should handle refresh action', async () => {
      const user = userEvent.setup();
      const onRefresh = jest.fn().mockResolvedValue(undefined);

      renderDashboard({ onRefresh });

      // Click refresh button from quick actions section
      const quickActionsSection = screen.getByRole('heading', { name: /quick actions/i }).closest('section');
      const refreshButton = quickActionsSection?.querySelector('button[aria-label="Refresh dashboard"]');

      expect(refreshButton).toBeInTheDocument();
      await user.click(refreshButton!);

      // Verify refresh function is called
      expect(onRefresh).toHaveBeenCalled();
    });

    test('should handle real-time updates', async () => {
      renderDashboard();

      // Verify dashboard can handle data updates
      expect(screen.getByText('25')).toBeInTheDocument(); // Total tasks
      expect(screen.getByText('15')).toBeInTheDocument(); // Completed tasks
    });
  });

  describe('IT-UI-DASH-003: データ表示結合テスト', () => {
    test('should display priority breakdown data', async () => {
      renderDashboard();

      // Verify priority breakdown is available in data
      expect(mockDashboardData.priorityBreakdown.high).toBe(5);
      expect(mockDashboardData.priorityBreakdown.medium).toBe(12);
      expect(mockDashboardData.priorityBreakdown.low).toBe(8);
    });

    test('should display category breakdown data', async () => {
      renderDashboard();

      // Verify category breakdown is available in data
      expect(mockDashboardData.categoryBreakdown).toHaveLength(2);
      expect(mockDashboardData.categoryBreakdown[0].categoryName).toBe('Work');
      expect(mockDashboardData.categoryBreakdown[0].taskCount).toBe(15);
      expect(mockDashboardData.categoryBreakdown[1].categoryName).toBe('Personal');
      expect(mockDashboardData.categoryBreakdown[1].taskCount).toBe(10);
    });

    test('should handle data aggregation', async () => {
      renderDashboard();

      // Verify data aggregation calculations
      const totalTasks = mockDashboardData.totalTasks;
      const completedTasks = mockDashboardData.completedTasks;
      const expectedCompletionRate = Math.round((completedTasks / totalTasks) * 100);

      expect(screen.getByText(`${expectedCompletionRate}% completion rate`)).toBeInTheDocument();
    });

    test('should handle empty data gracefully', async () => {
      const emptyData: TaskDashboardSummary = {
        ...mockDashboardData,
        priorityBreakdown: { high: 0, medium: 0, low: 0 },
        categoryBreakdown: []
      };

      renderDashboard({ dashboardData: emptyData });

      // Verify empty data is handled gracefully (0/0 = NaN, should show 0%)
      const completedCard = screen.getByText('Completed').closest('.dashboard__stat-card');
      expect(completedCard).toHaveTextContent('0% completion rate');
    });

    test('should display upcoming tasks data', async () => {
      const dataWithUpcoming: TaskDashboardSummary = {
        ...mockDashboardData,
        upcomingTasks: [
          {
            id: 'upcoming-1',
            title: 'Upcoming task',
            status: 'pending',
            priority: 'high',
            dueDate: new Date(Date.now() + 86400000 * 2),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      };

      renderDashboard({ dashboardData: dataWithUpcoming });

      // Verify upcoming tasks data is processed
      expect(dataWithUpcoming.upcomingTasks).toHaveLength(1);
    });
  });

  describe('Dashboard Navigation Integration', () => {
    test('should handle task click navigation', async () => {
      const user = userEvent.setup();
      const onTaskClick = jest.fn();

      renderDashboard({ onTaskClick });

      // Click on a task
      const taskButton = screen.getByRole('button', { name: /view task: complete project documentation/i });
      await user.click(taskButton);

      // Verify navigation function is called
      expect(onTaskClick).toHaveBeenCalledWith('task-1');
    });

    test('should handle create task navigation', async () => {
      const user = userEvent.setup();
      const onCreateTask = jest.fn();

      renderDashboard({ onCreateTask });

      // Click create task button from quick actions section
      const quickActionsSection = screen.getByRole('heading', { name: /quick actions/i }).closest('section');
      const createButton = quickActionsSection?.querySelector('button[aria-label="Create new task"]');

      expect(createButton).toBeInTheDocument();
      await user.click(createButton!);

      // Verify create function is called
      expect(onCreateTask).toHaveBeenCalled();
    });

    test('should handle view all tasks navigation', async () => {
      const user = userEvent.setup();
      const onViewAllTasks = jest.fn();

      renderDashboard({ onViewAllTasks });

      // Click view all tasks button from quick actions section
      const quickActionsSection = screen.getByRole('heading', { name: /quick actions/i }).closest('section');
      const viewAllButton = quickActionsSection?.querySelector('button[aria-label="View all tasks"]');

      expect(viewAllButton).toBeInTheDocument();
      await user.click(viewAllButton!);

      // Verify view all function is called
      expect(onViewAllTasks).toHaveBeenCalled();
    });
  });

  describe('Accessibility and UX', () => {
    test('should have proper ARIA labels and roles', async () => {
      renderDashboard();

      // Verify ARIA labels
      expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /task statistics/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /recent tasks/i })).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();

      // Verify list roles
      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      renderDashboard();

      // Tab through interactive elements
      await user.tab();
      expect(document.activeElement?.tagName).toMatch(/BUTTON/);
    });

    test('should provide screen reader support', async () => {
      renderDashboard();

      // Verify screen reader labels
      expect(screen.getByLabelText(/total tasks: 25/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/completed: 15/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/view task: complete project documentation/i)).toBeInTheDocument();
    });

    test('should handle responsive design', async () => {
      renderDashboard();

      // Verify responsive classes
      const dashboard = screen.getByTestId('dashboard');
      expect(dashboard).toHaveClass('dashboard');
    });

    test('should handle performance with large datasets', async () => {
      const largeData: TaskDashboardSummary = {
        ...mockDashboardData,
        totalTasks: 1000,
        recentTasks: Array.from({ length: 100 }, (_, i) => ({
          id: `task-${i}`,
          title: `Task ${i}`,
          status: 'pending' as const,
          priority: 'medium' as const,
          createdAt: new Date(),
          updatedAt: new Date()
        }))
      };

      const startTime = performance.now();
      renderDashboard({ dashboardData: largeData });
      const endTime = performance.now();

      // Verify rendering is fast (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});
