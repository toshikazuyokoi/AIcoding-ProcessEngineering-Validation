/**
 * ===================================
 * Tasks Management Hook Tests
 * ===================================
 * Purpose: Comprehensive testing for useTasks hook
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useTasks, Task, TaskStatus, TaskPriority, CreateTaskData, UpdateTaskData } from '../use-tasks';
import * as useAuthModule from '../use-auth';
import { apiClient } from '../../utils/api-client';

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

// Mock the entire apiClient module
jest.mock('../../utils/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn()
  }
}));

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

// ===================================
// Test Suite Setup
// ===================================

describe('useTasks Hook', () => {
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

    // Setup default API responses
    (apiClient.get as jest.Mock).mockResolvedValue({
      success: true,
      data: {
        tasks: mockTasks,
        total: mockTasks.length,
        totalPages: 1
      }
    });
  });

  // ===================================
  // Phase 1: Basic Hook Initialization and State
  // ===================================

  describe('Phase 1: Basic Hook Initialization and State', () => {
    it('should initialize with default state', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      expect(result.current.tasks).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.filters).toEqual({});
      expect(result.current.sort).toEqual({
        field: 'createdAt',
        order: 'desc'
      });
      expect(result.current.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      });
      expect(result.current.selectedTasks).toEqual([]);
      expect(result.current.statistics).toBe(null);
    });

    it('should initialize with custom configuration', () => {
      const customConfig = {
        autoFetch: false,
        defaultFilters: { status: 'PENDING' as TaskStatus },
        defaultSort: { field: 'title' as const, order: 'asc' as const },
        defaultPagination: { page: 2, limit: 10 }
      };

      const { result } = renderHook(() => useTasks(customConfig));

      expect(result.current.filters).toEqual({ status: 'PENDING' });
      expect(result.current.sort).toEqual({ field: 'title', order: 'asc' });
      expect(result.current.pagination.page).toBe(2);
      expect(result.current.pagination.limit).toBe(10);
    });

    it('should have correct computed properties initially', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      expect(result.current.hasError).toBe(false);
      expect(result.current.isReady).toBe(true);
      expect(result.current.hasSelectedTasks).toBe(false);
      expect(result.current.selectedTasksCount).toBe(0);
      expect(result.current.filteredTasksCount).toBe(0);
      expect(result.current.isFiltered).toBe(false);
    });

    it('should auto-fetch tasks when autoFetch is enabled', async () => {
      renderHook(() => useTasks({ autoFetch: true }));

      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
          expect.stringContaining('/tasks?')
        );
      });
    });

    it('should not auto-fetch when user is not authenticated', () => {
      Object.assign(mockUseAuth, { isAuthenticated: false, user: null });

      renderHook(() => useTasks({ autoFetch: true }));

      expect(apiClient.get).not.toHaveBeenCalled();
    });
  });

  // ===================================
  // Phase 2: Task CRUD Operations
  // ===================================

  describe('Phase 2: Task CRUD Operations', () => {
    it('should fetch tasks successfully', async () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.pagination.total).toBe(mockTasks.length);
      expect(result.current.pagination.totalPages).toBe(1);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBe(null);
    });

    it('should handle fetch tasks error', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        success: false,
        error: { message: 'Failed to fetch tasks' }
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchTasks();
      });

      expect(result.current.tasks).toEqual([]);
      expect(result.current.error).toBe('Failed to fetch tasks');
      expect(result.current.hasError).toBe(true);
    });

    it('should create task successfully', async () => {
      const newTaskData: CreateTaskData = {
        title: 'New Task',
        description: 'New task description',
        priority: 'HIGH'
      };

      const createdTask: Task = {
        ...mockTask,
        id: 'task-new',
        title: newTaskData.title,
        description: newTaskData.description,
        priority: newTaskData.priority!
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: createdTask
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      let returnedTask: Task;
      await act(async () => {
        returnedTask = await result.current.createTask(newTaskData);
      });

      expect(returnedTask!).toEqual(createdTask);
      expect(result.current.tasks).toContain(createdTask);
      expect(apiClient.post).toHaveBeenCalledWith('/tasks', newTaskData);
    });

    it('should update task successfully', async () => {
      const updateData: UpdateTaskData = {
        title: 'Updated Task',
        status: 'IN_PROGRESS'
      };

      const updatedTask: Task = {
        ...mockTask,
        title: updateData.title!,
        status: updateData.status!
      };

      (apiClient.put as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: updatedTask
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      let returnedTask: Task;
      await act(async () => {
        returnedTask = await result.current.updateTask(mockTask.id, updateData);
      });

      expect(returnedTask!).toEqual(updatedTask);
      expect(apiClient.put).toHaveBeenCalledWith(`/tasks/${mockTask.id}`, updateData);
    });

    it('should delete task successfully', async () => {
      (apiClient.delete as jest.Mock).mockResolvedValueOnce({
        success: true
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.deleteTask(mockTask.id);
      });

      expect(result.current.tasks).not.toContain(
        expect.objectContaining({ id: mockTask.id })
      );
      expect(apiClient.delete).toHaveBeenCalledWith(`/tasks/${mockTask.id}`);
    });

    it('should get single task successfully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: mockTask
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      let returnedTask: Task;
      await act(async () => {
        returnedTask = await result.current.getTask(mockTask.id);
      });

      expect(returnedTask!).toEqual(mockTask);
      expect(apiClient.get).toHaveBeenCalledWith(`/tasks/${mockTask.id}`);
    });
  });

  // ===================================
  // Phase 3: Task Status Operations
  // ===================================

  describe('Phase 3: Task Status Operations', () => {
    it('should complete task successfully', async () => {
      const completedTask: Task = {
        ...mockTask,
        status: 'COMPLETED',
        completedAt: '2023-12-01T00:00:00.000Z'
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: completedTask
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      let returnedTask: Task;
      await act(async () => {
        returnedTask = await result.current.completeTask(mockTask.id);
      });

      expect(returnedTask!).toEqual(completedTask);
      expect(apiClient.post).toHaveBeenCalledWith(`/tasks/${mockTask.id}/complete`);
    });

    it('should start task successfully', async () => {
      const startedTask: Task = {
        ...mockTask,
        status: 'IN_PROGRESS'
      };

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: startedTask
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      let returnedTask: Task;
      await act(async () => {
        returnedTask = await result.current.startTask(mockTask.id);
      });

      expect(returnedTask!).toEqual(startedTask);
      expect(apiClient.post).toHaveBeenCalledWith(`/tasks/${mockTask.id}/start`);
    });

    it('should handle authentication errors in status operations', async () => {
      Object.assign(mockUseAuth, { isAuthenticated: false, user: null });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      await expect(result.current.completeTask(mockTask.id)).rejects.toThrow('User not authenticated');
      await expect(result.current.startTask(mockTask.id)).rejects.toThrow('User not authenticated');
    });
  });

  // ===================================
  // Phase 4: Bulk Operations and Filtering
  // ===================================

  describe('Phase 4: Bulk Operations and Filtering', () => {
    it('should perform bulk delete successfully', async () => {
      const taskIds = ['task-123', 'task-456'];

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        success: true
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.bulkDelete(taskIds);
      });

      expect(result.current.tasks).toHaveLength(1);
      expect(result.current.tasks[0].id).toBe('task-789');
      expect(apiClient.post).toHaveBeenCalledWith('/tasks/bulk-delete', { taskIds });
    });

    it('should perform bulk complete successfully', async () => {
      const taskIds = ['task-123', 'task-456'];
      const completedTasks = taskIds.map(id => ({
        ...mockTasks.find(t => t.id === id)!,
        status: 'COMPLETED' as TaskStatus
      }));

      (apiClient.post as jest.Mock).mockResolvedValueOnce({
        success: true,
        data: completedTasks
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      await act(async () => {
        await result.current.bulkComplete(taskIds);
      });

      const completedTasksInState = result.current.tasks.filter(t => taskIds.includes(t.id));
      expect(completedTasksInState.every(t => t.status === 'COMPLETED')).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/tasks/bulk-complete', { taskIds });
    });

    it('should set filters correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      act(() => {
        result.current.setFilters({ status: 'PENDING', priority: 'HIGH' });
      });

      expect(result.current.filters).toEqual({
        status: 'PENDING',
        priority: 'HIGH'
      });
      expect(result.current.pagination.page).toBe(1); // Should reset to first page
      expect(result.current.isFiltered).toBe(true);
    });

    it('should clear filters correctly', () => {
      const { result } = renderHook(() => useTasks({
        autoFetch: false,
        defaultFilters: { status: 'PENDING' }
      }));

      // First set some filters
      act(() => {
        result.current.setFilters({ priority: 'HIGH' });
      });

      // Then clear them
      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.filters).toEqual({ status: 'PENDING' }); // Should return to default
      expect(result.current.pagination.page).toBe(1);
    });

    it('should set sort options correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      act(() => {
        result.current.setSort({ field: 'title', order: 'asc' });
      });

      expect(result.current.sort).toEqual({
        field: 'title',
        order: 'asc'
      });
      expect(result.current.pagination.page).toBe(1); // Should reset to first page
    });

    it('should handle pagination correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // Set initial pagination state (will be clamped to totalPages which is 0 initially)
      act(() => {
        result.current.setPage(3);
      });

      // Since totalPages is 0 initially, page will be clamped to 1 (minimum)
      expect(result.current.pagination.page).toBe(1);

      act(() => {
        result.current.setLimit(50);
      });

      expect(result.current.pagination.limit).toBe(50);
      expect(result.current.pagination.page).toBe(1); // Should reset to first page
    });
  });

  // ===================================
  // Phase 5: Selection and Statistics
  // ===================================

  describe('Phase 5: Selection and Statistics', () => {
    it('should handle task selection correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      act(() => {
        result.current.selectTask('task-123');
        result.current.selectTask('task-456');
      });

      expect(result.current.selectedTasks).toEqual(['task-123', 'task-456']);
      expect(result.current.hasSelectedTasks).toBe(true);
      expect(result.current.selectedTasksCount).toBe(2);
    });

    it('should handle task deselection correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First select some tasks
      act(() => {
        result.current.selectTask('task-123');
        result.current.selectTask('task-456');
      });

      // Then deselect one
      act(() => {
        result.current.deselectTask('task-123');
      });

      expect(result.current.selectedTasks).toEqual(['task-456']);
      expect(result.current.selectedTasksCount).toBe(1);
    });

    it('should select all tasks correctly', async () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set some tasks
      await act(async () => {
        await result.current.fetchTasks();
      });

      act(() => {
        result.current.selectAllTasks();
      });

      expect(result.current.selectedTasks).toEqual(['task-123', 'task-456', 'task-789']);
      expect(result.current.selectedTasksCount).toBe(3);
    });

    it('should clear selection correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First select some tasks
      act(() => {
        result.current.selectTask('task-123');
        result.current.selectTask('task-456');
      });

      // Then clear selection
      act(() => {
        result.current.clearSelection();
      });

      expect(result.current.selectedTasks).toEqual([]);
      expect(result.current.hasSelectedTasks).toBe(false);
      expect(result.current.selectedTasksCount).toBe(0);
    });

    it('should fetch statistics successfully', async () => {
      (apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/statistics')) {
          return Promise.resolve({
            success: true,
            data: mockStatistics
          });
        }
        return Promise.resolve({
          success: true,
          data: {
            tasks: mockTasks,
            total: mockTasks.length,
            totalPages: 1
          }
        });
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchStatistics();
      });

      expect(result.current.statistics).toEqual(mockStatistics);
    });

    it('should handle statistics fetch error', async () => {
      (apiClient.get as jest.Mock).mockImplementation((url: string) => {
        if (url.includes('/statistics')) {
          return Promise.resolve({
            success: false,
            error: { message: 'Failed to fetch statistics' }
          });
        }
        return Promise.resolve({
          success: true,
          data: {
            tasks: mockTasks,
            total: mockTasks.length,
            totalPages: 1
          }
        });
      });

      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      await act(async () => {
        await result.current.fetchStatistics();
      });

      expect(result.current.error).toBe('Failed to fetch statistics');
      expect(result.current.statistics).toEqual({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        inProgressTasks: 0,
        overdueTasks: 0,
        completionRate: 0
      });
    });

    it('should refresh tasks correctly', async () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      await act(async () => {
        await result.current.refreshTasks();
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/tasks?')
      );
      expect(result.current.tasks).toEqual(mockTasks);
    });

    it('should clear error correctly', () => {
      const { result } = renderHook(() => useTasks({ autoFetch: false }));

      // First set an error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBe(null);
      expect(result.current.hasError).toBe(false);
    });
  });
});
