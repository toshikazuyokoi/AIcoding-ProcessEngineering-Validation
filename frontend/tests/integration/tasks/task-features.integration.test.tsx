/**
 * ===================================
 * Task Features Integration Test
 * ===================================
 * Generated for TSK-IT-003-002-TaskUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test task advanced features UI components integration and flow
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
  statistics: { total: 0, completed: 0, pending: 0, inProgress: 0 },
  setFilters: jest.fn(),
  clearFilters: jest.fn(),
  setSort: jest.fn(),
  setPage: jest.fn(),
  setLimit: jest.fn(),
  selectTask: jest.fn(),
  selectAllTasks: jest.fn(),
  clearSelection: jest.fn(),
  refreshTasks: jest.fn(),
  searchTasks: jest.fn(),
  bulkUpdateTasks: jest.fn(),
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
};

jest.mock('../../../src/hooks/use-auth', () => ({
  useAuth: () => mockUseAuth,
}));

// Mock WebSocket for real-time updates
const mockWebSocket = {
  send: jest.fn(),
  close: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

global.WebSocket = jest.fn(() => mockWebSocket) as any;

describe('Task Features Integration Tests', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Search Test Task',
      description: 'Task for search testing',
      status: 'PENDING',
      priority: 'HIGH',
      createdAt: '2025-01-28T10:00:00Z',
      updatedAt: '2025-01-28T10:00:00Z',
      userId: 'user-1'
    },
    {
      id: 'task-2',
      title: 'Another Task',
      description: 'Another task for testing',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      createdAt: '2025-01-28T11:00:00Z',
      updatedAt: '2025-01-28T11:00:00Z',
      userId: 'user-1'
    }
  ];

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
    mockUseTasks.tasks = mockTasks;
    mockUseTasks.isLoading = false;
    mockUseTasks.error = null;
    mockUseTasks.pagination = { page: 1, limit: 20, total: 2, totalPages: 1 };
  });

  describe('IT-UI-TASK-007: 検索機能結合テスト', () => {
    test('should perform search and display results', async () => {
      const user = userEvent.setup();
      
      mockUseTasks.searchTasks.mockResolvedValue({
        success: true,
        data: [mockTasks[0]] // Return only first task
      });

      renderTaskList();

      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'Search Test');

      // Verify search function is called
      await waitFor(() => {
        expect(mockUseTasks.searchTasks).toHaveBeenCalledWith('Search Test');
      });
    });

    test('should handle empty search results', async () => {
      const user = userEvent.setup();
      
      mockUseTasks.searchTasks.mockResolvedValue({
        success: true,
        data: []
      });

      mockUseTasks.tasks = [];

      renderTaskList();

      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'nonexistent');

      // Verify empty state message
      await waitFor(() => {
        expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
      });
    });

    test('should handle search error', async () => {
      const user = userEvent.setup();
      
      mockUseTasks.searchTasks.mockRejectedValue({
        message: 'Search failed'
      });

      renderTaskList();

      const searchInput = screen.getByLabelText(/search/i);
      await user.type(searchInput, 'error test');

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/search failed/i)).toBeInTheDocument();
      });
    });

    test('should debounce search input', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const searchInput = screen.getByLabelText(/search/i);
      
      // Type rapidly
      await user.type(searchInput, 'test');
      
      // Verify search is not called immediately
      expect(mockUseTasks.searchTasks).not.toHaveBeenCalled();

      // Wait for debounce
      await waitFor(() => {
        expect(mockUseTasks.searchTasks).toHaveBeenCalledWith('test');
      }, { timeout: 1000 });
    });
  });

  describe('IT-UI-TASK-009: リアルタイム更新結合テスト', () => {
    test('should establish WebSocket connection', async () => {
      renderTaskList();

      // Verify WebSocket connection is established
      expect(global.WebSocket).toHaveBeenCalledWith(
        expect.stringContaining('ws://') || expect.stringContaining('wss://')
      );
    });

    test('should handle real-time task updates', async () => {
      renderTaskList();

      // Simulate WebSocket message
      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      if (messageHandler) {
        const mockEvent = {
          data: JSON.stringify({
            type: 'TASK_UPDATED',
            payload: {
              ...mockTasks[0],
              title: 'Updated Task Title'
            }
          })
        };

        messageHandler(mockEvent);

        // Verify tasks are refreshed
        await waitFor(() => {
          expect(mockUseTasks.refreshTasks).toHaveBeenCalled();
        });
      }
    });

    test('should handle real-time task creation', async () => {
      renderTaskList();

      const messageHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'message')?.[1];

      if (messageHandler) {
        const newTask = {
          id: 'task-3',
          title: 'New Real-time Task',
          description: 'Created by another user',
          status: 'PENDING',
          priority: 'LOW',
          createdAt: '2025-01-28T12:00:00Z',
          updatedAt: '2025-01-28T12:00:00Z',
          userId: 'user-2'
        };

        const mockEvent = {
          data: JSON.stringify({
            type: 'TASK_CREATED',
            payload: newTask
          })
        };

        messageHandler(mockEvent);

        // Verify tasks are refreshed
        await waitFor(() => {
          expect(mockUseTasks.refreshTasks).toHaveBeenCalled();
        });
      }
    });

    test('should handle WebSocket connection errors', async () => {
      renderTaskList();

      const errorHandler = mockWebSocket.addEventListener.mock.calls
        .find(call => call[0] === 'error')?.[1];

      if (errorHandler) {
        const mockError = new Error('WebSocket connection failed');
        errorHandler(mockError);

        // Verify error is handled gracefully
        await waitFor(() => {
          expect(screen.getByText(/connection error/i)).toBeInTheDocument();
        });
      }
    });
  });

  describe('IT-UI-TASK-010: オフライン対応結合テスト', () => {
    test('should detect offline status', async () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      renderTaskList();

      // Verify offline indicator
      expect(screen.getByText(/offline/i)).toBeInTheDocument();
    });

    test('should handle offline task creation', async () => {
      const user = userEvent.setup();
      
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      renderTaskList();

      // Try to create task while offline
      const createButton = screen.getByRole('button', { name: /create task/i });
      await user.click(createButton);

      // Verify offline message
      await waitFor(() => {
        expect(screen.getByText(/offline.*try again when online/i)).toBeInTheDocument();
      });
    });

    test('should sync when coming back online', async () => {
      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      renderTaskList();

      // Go online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Trigger online event
      const onlineEvent = new Event('online');
      window.dispatchEvent(onlineEvent);

      // Verify sync is triggered
      await waitFor(() => {
        expect(mockUseTasks.refreshTasks).toHaveBeenCalled();
      });
    });

    test('should show sync status', async () => {
      mockUseTasks.isLoading = true;

      renderTaskList();

      // Verify sync indicator
      expect(screen.getByText(/syncing/i)).toBeInTheDocument();
    });
  });

  describe('Bulk Operations', () => {
    test('should select multiple tasks', async () => {
      const user = userEvent.setup();
      renderTaskList({ config: { showBulkActions: true } });

      // Select first task
      const firstCheckbox = screen.getAllByRole('checkbox')[0];
      await user.click(firstCheckbox);

      // Verify selectTask is called
      expect(mockUseTasks.selectTask).toHaveBeenCalledWith('task-1');
    });

    test('should select all tasks', async () => {
      const user = userEvent.setup();
      renderTaskList({ config: { showBulkActions: true } });

      // Click select all checkbox
      const selectAllCheckbox = screen.getByLabelText(/select all/i);
      await user.click(selectAllCheckbox);

      // Verify selectAllTasks is called
      expect(mockUseTasks.selectAllTasks).toHaveBeenCalled();
    });

    test('should perform bulk status update', async () => {
      const user = userEvent.setup();
      mockUseTasks.selectedTasks = ['task-1', 'task-2'];

      renderTaskList({ config: { showBulkActions: true } });

      // Open bulk actions menu
      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await user.click(bulkActionsButton);

      // Select bulk status update
      const statusUpdateOption = screen.getByText(/mark as completed/i);
      await user.click(statusUpdateOption);

      // Verify bulk update is called
      expect(mockUseTasks.bulkUpdateTasks).toHaveBeenCalledWith(
        ['task-1', 'task-2'],
        { status: 'COMPLETED' }
      );
    });

    test('should clear selection after bulk operation', async () => {
      const user = userEvent.setup();
      mockUseTasks.selectedTasks = ['task-1', 'task-2'];

      renderTaskList({ config: { showBulkActions: true } });

      // Perform bulk operation
      const bulkActionsButton = screen.getByRole('button', { name: /bulk actions/i });
      await user.click(bulkActionsButton);
      
      const statusUpdateOption = screen.getByText(/mark as completed/i);
      await user.click(statusUpdateOption);

      // Verify selection is cleared
      await waitFor(() => {
        expect(mockUseTasks.clearSelection).toHaveBeenCalled();
      });
    });
  });

  describe('Performance and UX', () => {
    test('should handle large task lists efficiently', async () => {
      const largeTasks = Array.from({ length: 1000 }, (_, i) => ({
        id: `task-${i}`,
        title: `Task ${i}`,
        description: `Description ${i}`,
        status: 'PENDING',
        priority: 'MEDIUM',
        createdAt: '2025-01-28T10:00:00Z',
        updatedAt: '2025-01-28T10:00:00Z',
        userId: 'user-1'
      }));

      mockUseTasks.tasks = largeTasks;
      mockUseTasks.pagination = { page: 1, limit: 20, total: 1000, totalPages: 50 };

      const startTime = performance.now();
      renderTaskList();
      const endTime = performance.now();

      // Verify rendering is fast (under 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // Verify only current page tasks are rendered
      expect(screen.getAllByText(/Task \d+/)).toHaveLength(20);
    });

    test('should show loading skeleton during data fetch', async () => {
      mockUseTasks.isLoading = true;
      mockUseTasks.tasks = [];

      renderTaskList();

      // Verify loading skeleton
      expect(screen.getByTestId('task-list-skeleton')).toBeInTheDocument();
    });

    test('should handle rapid filter changes', async () => {
      const user = userEvent.setup();
      renderTaskList();

      const statusSelect = screen.getByLabelText(/status/i);

      // Rapidly change filters
      await user.selectOptions(statusSelect, 'PENDING');
      await user.selectOptions(statusSelect, 'IN_PROGRESS');
      await user.selectOptions(statusSelect, 'COMPLETED');

      // Verify only the last filter change is processed
      await waitFor(() => {
        expect(mockUseTasks.setFilters).toHaveBeenLastCalledWith({ status: 'COMPLETED' });
      });
    });
  });
});
