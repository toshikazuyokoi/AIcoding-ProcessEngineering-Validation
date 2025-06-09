/**
 * ===================================
 * Task List Component Tests
 * ===================================
 * Purpose: Comprehensive testing for TaskList component
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskList, TaskListProps } from '../task-list';
import * as useAuthModule from '../../../hooks/use-auth';
import * as useTasksModule from '../../../hooks/use-tasks';
import { Task, TaskFilters, TaskSortOptions } from '../../../hooks/use-tasks';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock the useAuth hook
const mockUseAuth = {
  user: {
    id: 'user-123',
    username: 'testuser',
    email: 'test@example.com',
    role: 'USER' as const,
    isActive: true,
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z'
  },
  isAuthenticated: true,
  isInitialized: true,
  isLoading: false,
  userRole: 'USER' as const,
  isReady: true
};

jest.spyOn(useAuthModule, 'useAuth').mockReturnValue(mockUseAuth);

// Mock the useTasks hook
const mockUseTasks = {
  tasks: [],
  isLoading: false,
  error: null,
  filters: {},
  sort: { field: 'createdAt' as const, order: 'desc' as const },
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  selectedTasks: [],
  statistics: null,
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
  setSort: jest.fn(),
  setPage: jest.fn(),
  setLimit: jest.fn(),
  selectTask: jest.fn(),
  deselectTask: jest.fn(),
  selectAllTasks: jest.fn(),
  clearSelection: jest.fn(),
  fetchTasks: jest.fn(),
  refreshTasks: jest.fn(),
  deleteTask: jest.fn(),
  completeTask: jest.fn(),
  bulkDelete: jest.fn(),
  bulkComplete: jest.fn(),
  hasSelectedTasks: false,
  selectedTasksCount: 0,
  filteredTasksCount: 0,
  isFiltered: false,
  clearError: jest.fn()
};

jest.spyOn(useTasksModule, 'useTasks').mockReturnValue(mockUseTasks);

// Test data
const mockTask: Task = {
  id: 'task-123',
  title: 'Test Task',
  description: 'Test task description',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: '2023-12-31T23:59:59.000Z',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  userId: 'user-123',
  categories: []
};

const mockTasks: Task[] = [
  mockTask,
  {
    ...mockTask,
    id: 'task-456',
    title: 'Second Task',
    status: 'IN_PROGRESS',
    priority: 'HIGH'
  },
  {
    ...mockTask,
    id: 'task-789',
    title: 'Third Task',
    status: 'COMPLETED',
    priority: 'LOW'
  }
];

const mockStatistics = {
  totalTasks: 3,
  completedTasks: 1,
  pendingTasks: 1,
  inProgressTasks: 1,
  overdueTasks: 0,
  completionRate: 33.33
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// ===================================
// Test Suite Setup
// ===================================

describe('TaskList Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock useAuth to default state
    Object.assign(mockUseAuth, {
      user: {
        id: 'user-123',
        username: 'testuser',
        email: 'test@example.com',
        role: 'USER' as const,
        isActive: true,
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-01T00:00:00.000Z'
      },
      isAuthenticated: true,
      isInitialized: true,
      isLoading: false,
      userRole: 'USER' as const,
      isReady: true
    });

    // Reset mock useTasks to default state
    Object.assign(mockUseTasks, {
      tasks: [],
      isLoading: false,
      error: null,
      filters: {},
      sort: { field: 'createdAt' as const, order: 'desc' as const },
      pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
      selectedTasks: [],
      statistics: null,
      setFilters: jest.fn(),
      clearFilters: jest.fn(),
      setSort: jest.fn(),
      setPage: jest.fn(),
      setLimit: jest.fn(),
      selectTask: jest.fn(),
      deselectTask: jest.fn(),
      selectAllTasks: jest.fn(),
      clearSelection: jest.fn(),
      fetchTasks: jest.fn(),
      refreshTasks: jest.fn(),
      deleteTask: jest.fn(),
      completeTask: jest.fn(),
      bulkDelete: jest.fn(),
      bulkComplete: jest.fn(),
      hasSelectedTasks: false,
      selectedTasksCount: 0,
      filteredTasksCount: 0,
      isFiltered: false,
      clearError: jest.fn()
    });
  });

  // ===================================
  // Phase 1: Basic Rendering and Authentication
  // ===================================

  describe('Phase 1: Basic Rendering and Authentication', () => {
    it('should render task list when authenticated', () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-list')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    it('should show authentication required message when not authenticated', () => {
      Object.assign(mockUseAuth, { isAuthenticated: false, user: null });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('Please log in to view your tasks.')).toBeInTheDocument();
      expect(screen.queryByTestId('task-list')).not.toBeInTheDocument();
    });

    it('should render with custom className and testId', () => {
      render(
        <TestWrapper>
          <TaskList className="custom-class" testId="custom-test-id" />
        </TestWrapper>
      );

      const taskList = screen.getByTestId('custom-test-id');
      expect(taskList).toBeInTheDocument();
      expect(taskList).toHaveClass('custom-class');
    });

    it('should render header with title and controls', () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('List view')).toBeInTheDocument();
      expect(screen.getByLabelText('Grid view')).toBeInTheDocument();
      expect(screen.getByLabelText('Compact view')).toBeInTheDocument();
      expect(screen.getByLabelText('Refresh tasks')).toBeInTheDocument();
    });

    it('should show statistics when available', () => {
      Object.assign(mockUseTasks, { 
        statistics: mockStatistics,
        filteredTasksCount: 3
      });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('(3)')).toBeInTheDocument();
      expect(screen.getByText('1/3 completed')).toBeInTheDocument();
      expect(screen.getByText('33.3% completion rate')).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 2: Loading and Error States
  // ===================================

  describe('Phase 2: Loading and Error States', () => {
    it('should show loading state', () => {
      Object.assign(mockUseTasks, { isLoading: true });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('Loading tasks...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show error state', () => {
      Object.assign(mockUseTasks, { 
        isLoading: false,
        error: 'Failed to load tasks'
      });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('Error Loading Tasks')).toBeInTheDocument();
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
      expect(screen.getByText('Dismiss')).toBeInTheDocument();
    });

    it('should handle error retry', async () => {
      Object.assign(mockUseTasks, { 
        isLoading: false,
        error: 'Failed to load tasks'
      });

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Try Again'));
      expect(mockUseTasks.refreshTasks).toHaveBeenCalled();
    });

    it('should handle error dismiss', async () => {
      Object.assign(mockUseTasks, { 
        isLoading: false,
        error: 'Failed to load tasks'
      });

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Dismiss'));
      expect(mockUseTasks.clearError).toHaveBeenCalled();
    });

    it('should show empty state when no tasks', () => {
      Object.assign(mockUseTasks, { 
        isLoading: false,
        tasks: []
      });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('No tasks yet')).toBeInTheDocument();
      expect(screen.getByText('Create your first task to get started.')).toBeInTheDocument();
    });

    it('should show filtered empty state', () => {
      Object.assign(mockUseTasks, { 
        isLoading: false,
        tasks: [],
        isFiltered: true
      });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('No tasks match your filters')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your filters to see more tasks.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /clear filters/i })).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 3: Task Display and Interaction
  // ===================================

  describe('Phase 3: Task Display and Interaction', () => {
    beforeEach(() => {
      Object.assign(mockUseTasks, {
        tasks: mockTasks,
        filteredTasksCount: mockTasks.length
      });
    });

    it('should render tasks in list view', () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Second Task')).toBeInTheDocument();
      expect(screen.getByText('Third Task')).toBeInTheDocument();
    });

    it('should handle view mode changes', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      // Switch to grid view
      await user.click(screen.getByLabelText('Grid view'));
      expect(screen.getByLabelText('Grid view')).toHaveClass('task-list__view-button--active');

      // Switch to compact view
      await user.click(screen.getByLabelText('Compact view'));
      expect(screen.getByLabelText('Compact view')).toHaveClass('task-list__view-button--active');
    });

    it('should handle task selection', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const checkbox = screen.getAllByRole('checkbox')[0];
      await user.click(checkbox);

      expect(mockUseTasks.selectTask).toHaveBeenCalledWith('task-123');
    });

    it('should handle task actions', async () => {
      const onTaskEdit = jest.fn();
      const onTaskDelete = jest.fn();
      const onTaskComplete = jest.fn();

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList
            onTaskEdit={onTaskEdit}
            onTaskDelete={onTaskDelete}
            onTaskComplete={onTaskComplete}
          />
        </TestWrapper>
      );

      // Test edit action
      const editButtons = screen.getAllByLabelText(/Edit task/);
      await user.click(editButtons[0]);
      expect(onTaskEdit).toHaveBeenCalledWith(mockTask);

      // Test complete action
      const completeButtons = screen.getAllByLabelText(/Mark task.*as complete/);
      await user.click(completeButtons[0]);
      expect(mockUseTasks.completeTask).toHaveBeenCalledWith('task-123');

      // Test delete action
      const deleteButtons = screen.getAllByLabelText(/Delete task/);
      await user.click(deleteButtons[0]);
      expect(mockUseTasks.deleteTask).toHaveBeenCalledWith('task-123');
    });

    it('should handle refresh action', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByLabelText('Refresh tasks'));
      expect(mockUseTasks.refreshTasks).toHaveBeenCalled();
    });

    it('should disable refresh button when loading', () => {
      Object.assign(mockUseTasks, { isLoading: true });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Refresh tasks')).toBeDisabled();
    });
  });

  // ===================================
  // Phase 4: Filtering and Sorting
  // ===================================

  describe('Phase 4: Filtering and Sorting', () => {
    beforeEach(() => {
      Object.assign(mockUseTasks, {
        tasks: mockTasks,
        filteredTasksCount: mockTasks.length
      });
    });

    it('should render filter controls', () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Search')).toBeInTheDocument();
      expect(screen.getByLabelText('Status')).toBeInTheDocument();
      expect(screen.getByLabelText('Priority')).toBeInTheDocument();
      expect(screen.getByText('Clear Filters')).toBeInTheDocument();
    });

    it('should handle search filter', async () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const searchInput = screen.getByLabelText('Search');

      // Use fireEvent.change for reliable Controlled Component testing
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      // Verify that setFilters was called with the correct search value
      expect(mockUseTasks.setFilters).toHaveBeenCalledWith({ search: 'test search' });
    });

    it('should handle status filter', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const statusSelect = screen.getByLabelText('Status');
      await user.selectOptions(statusSelect, 'PENDING');

      expect(mockUseTasks.setFilters).toHaveBeenCalledWith({ status: 'PENDING' });
    });

    it('should handle priority filter', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const prioritySelect = screen.getByLabelText('Priority');
      await user.selectOptions(prioritySelect, 'HIGH');

      expect(mockUseTasks.setFilters).toHaveBeenCalledWith({ priority: 'HIGH' });
    });

    it('should handle clear filters', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Clear Filters'));
      expect(mockUseTasks.clearFilters).toHaveBeenCalled();
    });

    it('should render sort controls', () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
      expect(screen.getByLabelText('Order')).toBeInTheDocument();
    });

    it('should handle sort field change', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const sortFieldSelect = screen.getByLabelText('Sort by');
      await user.selectOptions(sortFieldSelect, 'title');

      expect(mockUseTasks.setSort).toHaveBeenCalledWith({
        field: 'title',
        order: 'desc'
      });
    });

    it('should handle sort order change', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const sortOrderSelect = screen.getByLabelText('Order');
      await user.selectOptions(sortOrderSelect, 'asc');

      expect(mockUseTasks.setSort).toHaveBeenCalledWith({
        field: 'createdAt',
        order: 'asc'
      });
    });

    it('should hide filters when showFilters is false', () => {
      render(
        <TestWrapper>
          <TaskList config={{ showFilters: false }} />
        </TestWrapper>
      );

      expect(screen.queryByLabelText('Search')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Status')).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 5: Bulk Actions and Pagination
  // ===================================

  describe('Phase 5: Bulk Actions and Pagination', () => {
    beforeEach(() => {
      Object.assign(mockUseTasks, {
        tasks: mockTasks,
        filteredTasksCount: mockTasks.length,
        pagination: { page: 1, limit: 20, total: 50, totalPages: 3 }
      });
    });

    it('should show bulk actions when tasks are selected', () => {
      Object.assign(mockUseTasks, {
        hasSelectedTasks: true,
        selectedTasksCount: 2,
        selectedTasks: ['task-123', 'task-456']
      });

      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('2 tasks selected')).toBeInTheDocument();
      expect(screen.getByText('Select All')).toBeInTheDocument();
      expect(screen.getByText('Complete Selected')).toBeInTheDocument();
      expect(screen.getByText('Delete Selected')).toBeInTheDocument();
    });

    it('should handle bulk complete', async () => {
      Object.assign(mockUseTasks, {
        hasSelectedTasks: true,
        selectedTasksCount: 2,
        selectedTasks: ['task-123', 'task-456']
      });

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Complete Selected'));
      expect(mockUseTasks.bulkComplete).toHaveBeenCalledWith(['task-123', 'task-456']);
    });

    it('should handle bulk delete', async () => {
      Object.assign(mockUseTasks, {
        hasSelectedTasks: true,
        selectedTasksCount: 2,
        selectedTasks: ['task-123', 'task-456']
      });

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Delete Selected'));
      expect(mockUseTasks.bulkDelete).toHaveBeenCalledWith(['task-123', 'task-456']);
    });

    it('should handle select all', async () => {
      Object.assign(mockUseTasks, {
        hasSelectedTasks: true,
        selectedTasksCount: 1
      });

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Select All'));
      expect(mockUseTasks.selectAllTasks).toHaveBeenCalled();
    });

    it('should handle clear selection', async () => {
      Object.assign(mockUseTasks, {
        hasSelectedTasks: true,
        selectedTasksCount: 2
      });

      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByText('Clear'));
      expect(mockUseTasks.clearSelection).toHaveBeenCalled();
    });

    it('should render pagination controls', () => {
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      expect(screen.getByText('Showing 1-20 of 50 tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to previous page')).toBeInTheDocument();
      expect(screen.getByLabelText('Go to next page')).toBeInTheDocument();
    });

    it('should handle page change', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      await user.click(screen.getByLabelText('Go to next page'));
      expect(mockUseTasks.setPage).toHaveBeenCalledWith(2);
    });

    it('should handle page size change', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskList />
        </TestWrapper>
      );

      const pageSizeSelect = screen.getByLabelText('Per page:');
      await user.selectOptions(pageSizeSelect, '50');

      expect(mockUseTasks.setLimit).toHaveBeenCalledWith(50);
    });

    it('should hide pagination when showPagination is false', () => {
      render(
        <TestWrapper>
          <TaskList config={{ showPagination: false }} />
        </TestWrapper>
      );

      expect(screen.queryByText(/Showing.*of.*tasks/)).not.toBeInTheDocument();
    });

    it('should hide bulk actions when showBulkActions is false', () => {
      Object.assign(mockUseTasks, {
        hasSelectedTasks: true,
        selectedTasksCount: 2
      });

      render(
        <TestWrapper>
          <TaskList config={{ showBulkActions: false }} />
        </TestWrapper>
      );

      expect(screen.queryByText('Complete Selected')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete Selected')).not.toBeInTheDocument();
    });
  });
});
