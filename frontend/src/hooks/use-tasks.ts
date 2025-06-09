/**
 * ===================================
 * Tasks Management Hook Implementation
 * ===================================
 * Purpose: Comprehensive task management with CRUD operations
 * Features:
 * - Task CRUD operations (Create, Read, Update, Delete)
 * - Advanced filtering and sorting
 * - Pagination and bulk operations
 * - Performance optimization with caching
 * - Real-time state management
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './use-auth';
import { apiClient } from '../utils/api-client';

// ===================================
// Task Types and Interfaces
// ===================================

/**
 * Task priority levels
 */
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

/**
 * Task status types
 */
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Task entity interface
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categories?: TaskCategory[];
}

/**
 * Task category interface
 */
export interface TaskCategory {
  id: string;
  name: string;
  color?: string;
}

/**
 * Task creation data interface
 */
export interface CreateTaskData {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string;
  categoryIds?: string[];
}

/**
 * Task update data interface
 */
export interface UpdateTaskData {
  title?: string;
  description?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  dueDate?: string;
  categoryIds?: string[];
}

/**
 * Task search filters interface
 */
export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  categoryId?: string;
  search?: string;
  dueBefore?: string;
  dueAfter?: string;
  isOverdue?: boolean;
  isCompleted?: boolean;
}

/**
 * Task sort options interface
 */
export interface TaskSortOptions {
  field: 'title' | 'priority' | 'dueDate' | 'createdAt' | 'updatedAt';
  order: 'asc' | 'desc';
}

/**
 * Pagination state interface
 */
export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Task statistics interface
 */
export interface TaskStatistics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  completionRate: number;
}

/**
 * Tasks hook configuration interface
 */
export interface UseTasksConfig {
  autoFetch?: boolean;
  cacheTimeout?: number;
  defaultFilters?: TaskFilters;
  defaultSort?: TaskSortOptions;
  defaultPagination?: Partial<PaginationState>;
}

/**
 * Tasks hook return interface
 */
export interface UseTasksReturn {
  // State
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  filters: TaskFilters;
  sort: TaskSortOptions;
  pagination: PaginationState;
  selectedTasks: string[];
  statistics: TaskStatistics | null;

  // Task operations
  createTask: (data: CreateTaskData) => Promise<Task>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  getTask: (id: string) => Promise<Task>;
  
  // Status operations
  completeTask: (id: string) => Promise<Task>;
  startTask: (id: string) => Promise<Task>;
  
  // Bulk operations
  bulkDelete: (taskIds: string[]) => Promise<void>;
  bulkComplete: (taskIds: string[]) => Promise<void>;
  bulkUpdateStatus: (taskIds: string[], status: TaskStatus) => Promise<void>;
  
  // Filter and sort operations
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  setSort: (sort: TaskSortOptions) => void;
  
  // Pagination operations
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  
  // Selection operations
  selectTask: (taskId: string) => void;
  deselectTask: (taskId: string) => void;
  selectAllTasks: () => void;
  clearSelection: () => void;
  
  // Data operations
  fetchTasks: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  fetchStatistics: () => Promise<void>;
  
  // Utility operations
  clearError: () => void;
  
  // Computed properties
  hasError: boolean;
  isReady: boolean;
  hasSelectedTasks: boolean;
  selectedTasksCount: number;
  filteredTasksCount: number;
  isFiltered: boolean;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_CONFIG: Required<UseTasksConfig> = {
  autoFetch: true,
  cacheTimeout: 5 * 60 * 1000, // 5 minutes
  defaultFilters: {},
  defaultSort: {
    field: 'createdAt',
    order: 'desc'
  },
  defaultPagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  }
};

const DEFAULT_STATISTICS: TaskStatistics = {
  totalTasks: 0,
  completedTasks: 0,
  pendingTasks: 0,
  inProgressTasks: 0,
  overdueTasks: 0,
  completionRate: 0
};

// ===================================
// Tasks Management Hook
// ===================================

/**
 * Tasks Management Hook
 * 
 * Provides comprehensive task management functionality including CRUD operations,
 * filtering, sorting, pagination, and bulk operations with performance optimization.
 * 
 * @param config - Hook configuration options
 * @returns Tasks management interface
 */
export const useTasks = (config: UseTasksConfig = {}): UseTasksReturn => {
  // ===================================
  // Configuration and Dependencies
  // ===================================

  const finalConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
    defaultPagination: {
      ...DEFAULT_CONFIG.defaultPagination,
      ...config.defaultPagination
    }
  }), [config]);

  const { user, isAuthenticated } = useAuth();
  const cacheRef = useRef<Map<string, { data: any; timestamp: number }>>(new Map());

  // ===================================
  // State Management
  // ===================================

  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<TaskFilters>(finalConfig.defaultFilters);
  const [sort, setSortState] = useState<TaskSortOptions>(finalConfig.defaultSort);
  const [pagination, setPaginationState] = useState<PaginationState>(
    finalConfig.defaultPagination as PaginationState
  );
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [statistics, setStatistics] = useState<TaskStatistics | null>(null);

  // ===================================
  // Cache Management
  // ===================================

  /**
   * Get cached data if valid
   */
  const getCachedData = useCallback((key: string): any | null => {
    const cached = cacheRef.current.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > finalConfig.cacheTimeout;
    if (isExpired) {
      cacheRef.current.delete(key);
      return null;
    }

    return cached.data;
  }, [finalConfig.cacheTimeout]);

  /**
   * Set cached data
   */
  const setCachedData = useCallback((key: string, data: any): void => {
    cacheRef.current.set(key, {
      data,
      timestamp: Date.now()
    });
  }, []);

  /**
   * Clear cache
   */
  const clearCache = useCallback((): void => {
    cacheRef.current.clear();
  }, []);

  // ===================================
  // API Operations
  // ===================================

  /**
   * Fetch tasks with filters and pagination
   */
  const fetchTasks = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const cacheKey = `tasks-${JSON.stringify({ filters, sort, pagination: { page: pagination.page, limit: pagination.limit } })}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setTasks(cachedData.tasks);
        setPaginationState(prev => ({
          ...prev,
          total: cachedData.total,
          totalPages: cachedData.totalPages
        }));
        return;
      }

      const queryParams = new URLSearchParams();
      
      // Add filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      // Add sort
      queryParams.append('sortBy', sort.field);
      queryParams.append('sortOrder', sort.order);

      // Add pagination
      queryParams.append('page', String(pagination.page));
      queryParams.append('limit', String(pagination.limit));

      const response = await apiClient.get<{
        tasks: Task[];
        total: number;
        totalPages: number;
      }>(`/tasks?${queryParams.toString()}`);

      if (response.success && response.data) {
        const { tasks: fetchedTasks, total, totalPages } = response.data;
        
        setTasks(fetchedTasks);
        setPaginationState(prev => ({
          ...prev,
          total,
          totalPages
        }));

        // Cache the result
        setCachedData(cacheKey, {
          tasks: fetchedTasks,
          total,
          totalPages
        });
      } else {
        throw new Error(response.error?.message || 'Failed to fetch tasks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch tasks';
      setError(errorMessage);
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, filters, sort, pagination.page, pagination.limit, getCachedData, setCachedData]);

  /**
   * Create a new task
   */
  const createTask = useCallback(async (data: CreateTaskData): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<Task>('/tasks', data);

      if (response.success && response.data) {
        const newTask = response.data;
        
        // Update local state
        setTasks(prev => [newTask, ...prev]);
        
        // Clear cache to force refresh
        clearCache();
        
        return newTask;
      } else {
        throw new Error(response.error?.message || 'Failed to create task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (id: string, data: UpdateTaskData): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.put<Task>(`/tasks/${id}`, data);

      if (response.success && response.data) {
        const updatedTask = response.data;

        // Update local state
        setTasks(prev => prev.map(task =>
          task.id === id ? updatedTask : task
        ));

        // Clear cache to force refresh
        clearCache();

        return updatedTask;
      } else {
        throw new Error(response.error?.message || 'Failed to update task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (id: string): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.delete(`/tasks/${id}`);

      if (response.success) {
        // Update local state
        setTasks(prev => prev.filter(task => task.id !== id));
        setSelectedTasks(prev => prev.filter(taskId => taskId !== id));

        // Clear cache to force refresh
        clearCache();
      } else {
        throw new Error(response.error?.message || 'Failed to delete task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  /**
   * Get a single task by ID
   */
  const getTask = useCallback(async (id: string): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    setError(null);

    try {
      const cacheKey = `task-${id}`;
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        return cachedData;
      }

      const response = await apiClient.get<Task>(`/tasks/${id}`);

      if (response.success && response.data) {
        const task = response.data;

        // Cache the result
        setCachedData(cacheKey, task);

        return task;
      } else {
        throw new Error(response.error?.message || 'Failed to get task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get task';
      setError(errorMessage);
      throw err;
    }
  }, [isAuthenticated, user, getCachedData, setCachedData]);

  /**
   * Complete a task
   */
  const completeTask = useCallback(async (id: string): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<Task>(`/tasks/${id}/complete`);

      if (response.success && response.data) {
        const completedTask = response.data;

        // Update local state
        setTasks(prev => prev.map(task =>
          task.id === id ? completedTask : task
        ));

        // Clear cache to force refresh
        clearCache();

        return completedTask;
      } else {
        throw new Error(response.error?.message || 'Failed to complete task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  /**
   * Start a task (set to in progress)
   */
  const startTask = useCallback(async (id: string): Promise<Task> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<Task>(`/tasks/${id}/start`);

      if (response.success && response.data) {
        const startedTask = response.data;

        // Update local state
        setTasks(prev => prev.map(task =>
          task.id === id ? startedTask : task
        ));

        // Clear cache to force refresh
        clearCache();

        return startedTask;
      } else {
        throw new Error(response.error?.message || 'Failed to start task');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start task';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  // ===================================
  // Bulk Operations
  // ===================================

  /**
   * Bulk delete tasks
   */
  const bulkDelete = useCallback(async (taskIds: string[]): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    if (taskIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/tasks/bulk-delete', { taskIds });

      if (response.success) {
        // Update local state
        setTasks(prev => prev.filter(task => !taskIds.includes(task.id)));
        setSelectedTasks(prev => prev.filter(taskId => !taskIds.includes(taskId)));

        // Clear cache to force refresh
        clearCache();
      } else {
        throw new Error(response.error?.message || 'Failed to delete tasks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete tasks';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  /**
   * Bulk complete tasks
   */
  const bulkComplete = useCallback(async (taskIds: string[]): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    if (taskIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<Task[]>('/tasks/bulk-complete', { taskIds });

      if (response.success && response.data) {
        const completedTasks = response.data;

        // Update local state
        setTasks(prev => prev.map(task => {
          const completedTask = completedTasks.find(ct => ct.id === task.id);
          return completedTask || task;
        }));

        // Clear cache to force refresh
        clearCache();
      } else {
        throw new Error(response.error?.message || 'Failed to complete tasks');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete tasks';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  /**
   * Bulk update task status
   */
  const bulkUpdateStatus = useCallback(async (taskIds: string[], status: TaskStatus): Promise<void> => {
    if (!isAuthenticated || !user) {
      throw new Error('User not authenticated');
    }

    if (taskIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<Task[]>('/tasks/bulk-update-status', {
        taskIds,
        status
      });

      if (response.success && response.data) {
        const updatedTasks = response.data;

        // Update local state
        setTasks(prev => prev.map(task => {
          const updatedTask = updatedTasks.find(ut => ut.id === task.id);
          return updatedTask || task;
        }));

        // Clear cache to force refresh
        clearCache();
      } else {
        throw new Error(response.error?.message || 'Failed to update task status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update task status';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, clearCache]);

  // ===================================
  // Filter and Sort Operations
  // ===================================

  /**
   * Set filters
   */
  const setFilters = useCallback((newFilters: Partial<TaskFilters>): void => {
    setFiltersState(prev => ({
      ...prev,
      ...newFilters
    }));

    // Reset to first page when filters change
    setPaginationState(prev => ({
      ...prev,
      page: 1
    }));

    // Clear selection when filters change
    setSelectedTasks([]);
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback((): void => {
    setFiltersState(finalConfig.defaultFilters);
    setPaginationState(prev => ({
      ...prev,
      page: 1
    }));
    setSelectedTasks([]);
  }, [finalConfig.defaultFilters]);

  /**
   * Set sort options
   */
  const setSort = useCallback((newSort: TaskSortOptions): void => {
    setSortState(newSort);

    // Reset to first page when sort changes
    setPaginationState(prev => ({
      ...prev,
      page: 1
    }));
  }, []);

  // ===================================
  // Pagination Operations
  // ===================================

  /**
   * Set current page
   */
  const setPage = useCallback((page: number): void => {
    setPaginationState(prev => ({
      ...prev,
      page: Math.max(1, Math.min(page, prev.totalPages))
    }));
  }, []);

  /**
   * Set page limit
   */
  const setLimit = useCallback((limit: number): void => {
    setPaginationState(prev => ({
      ...prev,
      limit: Math.max(1, limit),
      page: 1 // Reset to first page when limit changes
    }));
  }, []);

  // ===================================
  // Selection Operations
  // ===================================

  /**
   * Select a task
   */
  const selectTask = useCallback((taskId: string): void => {
    setSelectedTasks(prev => {
      if (prev.includes(taskId)) return prev;
      return [...prev, taskId];
    });
  }, []);

  /**
   * Deselect a task
   */
  const deselectTask = useCallback((taskId: string): void => {
    setSelectedTasks(prev => prev.filter(id => id !== taskId));
  }, []);

  /**
   * Select all visible tasks
   */
  const selectAllTasks = useCallback((): void => {
    const visibleTaskIds = tasks.map(task => task.id);
    setSelectedTasks(visibleTaskIds);
  }, [tasks]);

  /**
   * Clear all selections
   */
  const clearSelection = useCallback((): void => {
    setSelectedTasks([]);
  }, []);

  // ===================================
  // Data Operations
  // ===================================

  /**
   * Refresh tasks (force fetch without cache)
   */
  const refreshTasks = useCallback(async (): Promise<void> => {
    clearCache();
    await fetchTasks();
  }, [clearCache, fetchTasks]);

  /**
   * Fetch task statistics
   */
  const fetchStatistics = useCallback(async (): Promise<void> => {
    if (!isAuthenticated || !user) {
      setError('User not authenticated');
      return;
    }

    try {
      const cacheKey = 'task-statistics';
      const cachedData = getCachedData(cacheKey);

      if (cachedData) {
        setStatistics(cachedData);
        return;
      }

      const response = await apiClient.get<TaskStatistics>('/tasks/statistics');

      if (response.success && response.data) {
        setStatistics(response.data);
        setCachedData(cacheKey, response.data);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch statistics');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(errorMessage);
      setStatistics(DEFAULT_STATISTICS);
    }
  }, [isAuthenticated, user, getCachedData, setCachedData]);

  // ===================================
  // Utility Operations
  // ===================================

  /**
   * Clear error state
   */
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // ===================================
  // Computed Properties
  // ===================================

  const hasError = useMemo(() => error !== null, [error]);
  const isReady = useMemo(() => !isLoading && error === null, [isLoading, error]);
  const hasSelectedTasks = useMemo(() => selectedTasks.length > 0, [selectedTasks]);
  const selectedTasksCount = useMemo(() => selectedTasks.length, [selectedTasks]);
  const filteredTasksCount = useMemo(() => tasks.length, [tasks]);

  const isFiltered = useMemo(() => {
    return Object.values(filters).some(value =>
      value !== undefined && value !== null && value !== ''
    );
  }, [filters]);

  // ===================================
  // Effects
  // ===================================

  /**
   * Auto-fetch tasks when dependencies change
   */
  useEffect(() => {
    if (finalConfig.autoFetch && isAuthenticated && user) {
      fetchTasks();
    }
  }, [finalConfig.autoFetch, isAuthenticated, user, fetchTasks]);

  /**
   * Fetch statistics when tasks change
   */
  useEffect(() => {
    if (isAuthenticated && user && tasks.length > 0) {
      fetchStatistics();
    }
  }, [isAuthenticated, user, tasks.length, fetchStatistics]);

  /**
   * Clear cache when user changes
   */
  useEffect(() => {
    if (user) {
      clearCache();
    }
  }, [user?.id, clearCache]);

  // ===================================
  // Return Hook Interface
  // ===================================

  return {
    // State
    tasks,
    isLoading,
    error,
    filters,
    sort,
    pagination,
    selectedTasks,
    statistics,

    // Task operations
    createTask,
    updateTask,
    deleteTask,
    getTask,

    // Status operations
    completeTask,
    startTask,

    // Bulk operations
    bulkDelete,
    bulkComplete,
    bulkUpdateStatus,

    // Filter and sort operations
    setFilters,
    clearFilters,
    setSort,

    // Pagination operations
    setPage,
    setLimit,

    // Selection operations
    selectTask,
    deselectTask,
    selectAllTasks,
    clearSelection,

    // Data operations
    fetchTasks,
    refreshTasks,
    fetchStatistics,

    // Utility operations
    clearError,

    // Computed properties
    hasError,
    isReady,
    hasSelectedTasks,
    selectedTasksCount,
    filteredTasksCount,
    isFiltered
  };
};

// ===================================
// Export Default Hook
// ===================================

export default useTasks;
