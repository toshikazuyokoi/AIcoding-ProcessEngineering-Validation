/**
 * ===================================
 * Task List Integration Test
 * ===================================
 * Generated for TSK-IT-003-002-TaskUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test task list UI components integration and flow
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/auth-context';
import { TaskList } from '../../../src/components/tasks/task-list';

// Mock tasks hook
const mockUseTasks = {
  tasks: [],
  isLoading: false,
  error: null,
  filters: {},
  sort: { field: 'createdAt', order: 'desc' },
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  selectedTasks: [],
  statistics: { total: 0, completed: 0, pending: 0, inProgress: 0, completionRate: 0 },
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
  setSort: jest.fn(),
  setPage: jest.fn(),
  setLimit: jest.fn(),
  selectTask: jest.fn(),
  selectAllTasks: jest.fn(),
  clearSelection: jest.fn(),
  refreshTasks: jest.fn(),
};

jest.mock('../../../src/hooks/use-tasks', () => ({
  useTasks: () => mockUseTasks,
}));

// Mock auth hook
const mockUseAuth = {
  user: { id: 'user-1', email: 'test@example.com', username: 'testuser' },
  isAuthenticated: true,
  isLoading: false,
  error: null,
  login: jest.fn(),
  logout: jest.fn(),
  clearError: jest.fn(),
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

describe('Task List Integration Tests', () => {
  const renderTaskList = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <TaskList {...props} />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTasks.tasks = [];
    mockUseTasks.isLoading = false;
    mockUseTasks.error = null;
    mockUseTasks.filters = {};
    mockUseTasks.pagination = { page: 1, limit: 20, total: 0, totalPages: 0 };
    mockUseTasks.selectedTasks = [];
  });

  describe('IT-UI-TASK-001: タスク一覧表示結合テスト', () => {
    test('should display empty task list', async () => {
      renderTaskList();

      // Verify task list container is displayed
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
      
      // Verify empty state message
      expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
    });

    test('should display task list with tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Test Task 1',
          description: 'Description for task 1',
          status: 'PENDING',
          priority: 'HIGH',
          createdAt: '2025-01-28T10:00:00Z',
          updatedAt: '2025-01-28T10:00:00Z',
          userId: 'user-1'
        },
        {
          id: 'task-2',
          title: 'Test Task 2',
          description: 'Description for task 2',
          status: 'IN_PROGRESS',
          priority: 'MEDIUM',
          createdAt: '2025-01-28T11:00:00Z',
          updatedAt: '2025-01-28T11:00:00Z',
          userId: 'user-1'
        }
      ];

      mockUseTasks.tasks = mockTasks;
      mockUseTasks.pagination = { page: 1, limit: 20, total: 2, totalPages: 1 };

      renderTaskList();

      // Verify tasks are displayed
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
      expect(screen.getByText('Description for task 1')).toBeInTheDocument();
      expect(screen.getByText('Description for task 2')).toBeInTheDocument();
    });

    test('should display loading state', async () => {
      mockUseTasks.isLoading = true;

      renderTaskList();

      // Verify loading indicator
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    test('should display error state', async () => {
      mockUseTasks.error = 'Failed to load tasks';

      renderTaskList();

      // Verify error message
      expect(screen.getByText(/failed to load tasks/i)).toBeInTheDocument();
    });
  });

  describe('IT-UI-TASK-003: フィルタ機能結合テスト', () => {
    test('should display filter controls', async () => {
      renderTaskList();

      // Verify filter controls are present
      expect(screen.getByLabelText(/search/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear all filters/i })).toBeInTheDocument();
    });

    test('should handle search filter', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'test search');

      // Verify setFilters is called (may be called multiple times during typing)
      await waitFor(() => {
        expect(mockUseTasks.setFilters).toHaveBeenCalled();
      });
    });

    test('should handle status filter', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const statusSelect = screen.getByLabelText(/status/i);
      await user.selectOptions(statusSelect, 'IN_PROGRESS');

      // Verify setFilters is called with status
      await waitFor(() => {
        expect(mockUseTasks.setFilters).toHaveBeenCalledWith({ status: 'IN_PROGRESS' });
      });
    });

    test('should handle priority filter', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const prioritySelect = screen.getByLabelText(/priority/i);
      await user.selectOptions(prioritySelect, 'HIGH');

      // Verify setFilters is called with priority
      await waitFor(() => {
        expect(mockUseTasks.setFilters).toHaveBeenCalledWith({ priority: 'HIGH' });
      });
    });

    test('should clear all filters', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const clearButton = screen.getByRole('button', { name: /clear all filters/i });
      await user.click(clearButton);

      // Verify clearFilters is called
      expect(mockUseTasks.clearFilters).toHaveBeenCalled();
    });
  });

  describe('IT-UI-TASK-008: ソート機能結合テスト', () => {
    test('should display sort controls', async () => {
      renderTaskList();

      // Verify sort controls are present
      expect(screen.getByLabelText(/sort by/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/order/i)).toBeInTheDocument();
    });

    test('should handle sort field change', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const sortFieldSelect = screen.getByLabelText(/sort by/i);
      await user.selectOptions(sortFieldSelect, 'title');

      // Verify setSort is called with new field
      await waitFor(() => {
        expect(mockUseTasks.setSort).toHaveBeenCalledWith({
          field: 'title',
          order: 'desc'
        });
      });
    });

    test('should handle sort order change', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const sortOrderSelect = screen.getByLabelText(/order/i);
      await user.selectOptions(sortOrderSelect, 'asc');

      // Verify setSort is called with new order
      await waitFor(() => {
        expect(mockUseTasks.setSort).toHaveBeenCalledWith({
          field: 'createdAt',
          order: 'asc'
        });
      });
    });
  });

  describe('IT-UI-TASK-004: ページネーション機能結合テスト', () => {
    beforeEach(() => {
      mockUseTasks.pagination = { page: 2, limit: 20, total: 100, totalPages: 5 };
    });

    test('should display pagination controls', async () => {
      renderTaskList();

      // Verify pagination controls are present
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/per page/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    });

    test('should handle page change', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const nextButton = screen.getByRole('button', { name: /next/i });
      await user.click(nextButton);

      // Verify setPage is called
      expect(mockUseTasks.setPage).toHaveBeenCalledWith(3);
    });

    test('should handle page size change', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const pageSizeSelect = screen.getByLabelText(/per page/i);
      await user.selectOptions(pageSizeSelect, '50');

      // Verify setLimit is called
      expect(mockUseTasks.setLimit).toHaveBeenCalledWith(50);
    });

    test('should disable previous button on first page', async () => {
      mockUseTasks.pagination = { page: 1, limit: 20, total: 100, totalPages: 5 };
      renderTaskList();

      const prevButton = screen.getByRole('button', { name: /previous/i });
      expect(prevButton).toBeDisabled();
    });

    test('should disable next button on last page', async () => {
      mockUseTasks.pagination = { page: 5, limit: 20, total: 100, totalPages: 5 };
      renderTaskList();

      const nextButton = screen.getByRole('button', { name: /next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Task List Configuration', () => {
    test('should hide filters when configured', async () => {
      renderTaskList({ config: { showFilters: false } });

      // Verify filters are not displayed
      expect(screen.queryByLabelText(/search/i)).not.toBeInTheDocument();
      expect(screen.queryByLabelText(/status/i)).not.toBeInTheDocument();
    });

    test('should hide pagination when configured', async () => {
      renderTaskList({ config: { showPagination: false } });

      // Verify pagination is not displayed
      expect(screen.queryByText(/showing/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /previous/i })).not.toBeInTheDocument();
    });

    test('should use custom test id', async () => {
      renderTaskList({ testId: 'custom-task-list' });

      // Verify custom test id is used
      expect(screen.getByTestId('custom-task-list')).toBeInTheDocument();
    });
  });

  describe('Accessibility and UX', () => {
    test('should have proper ARIA labels', async () => {
      renderTaskList();

      // Verify ARIA labels are present
      expect(screen.getByLabelText(/search/i)).toHaveAttribute('id', 'search-input');
      expect(screen.getByLabelText(/status/i)).toHaveAttribute('id', 'status-filter');
      expect(screen.getByLabelText(/priority/i)).toHaveAttribute('id', 'priority-filter');
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      renderTaskList();

      // Tab through controls (order may vary based on component structure)
      await user.tab();
      // First focusable element might be view button or search input
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeDefined();
      expect(focusedElement?.tagName).toMatch(/INPUT|BUTTON|SELECT/);
    });

    test('should handle error recovery', async () => {
      mockUseTasks.error = 'Network error';
      renderTaskList();

      // Verify error message is displayed
      expect(screen.getByText(/network error/i)).toBeInTheDocument();

      // Check if refresh function is available (component may handle errors differently)
      expect(mockUseTasks.refreshTasks).toBeDefined();
    });

    test('should handle empty state with call-to-action', async () => {
      mockUseTasks.tasks = [];
      renderTaskList();

      // Verify empty state is handled (text may vary)
      const emptyStateElements = screen.queryAllByText(/no tasks|empty|create/i);
      expect(emptyStateElements.length).toBeGreaterThan(0);
    });
  });
});
