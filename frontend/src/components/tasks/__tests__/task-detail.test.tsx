/**
 * ===================================
 * Task Detail Component Test Suite
 * ===================================
 * Purpose: Comprehensive testing for TaskDetail component
 * Features:
 * - Component rendering tests
 * - User interaction tests
 * - Error handling tests
 * - Integration tests
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * TSK-R2-001-CMP-TaskDetail
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { TaskDetail } from '../task-detail';
import { Task, TaskPriority, TaskStatus } from '../../../hooks/use-tasks';

// ===================================
// Mock Dependencies
// ===================================

// Mock useAuth hook
const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  name: 'Test User'
};

const mockUseAuth = {
  user: mockUser,
  isAuthenticated: true,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn()
};

jest.mock('../../../hooks/use-auth', () => ({
  useAuth: () => mockUseAuth
}));

// Mock useTasks hook
const mockUseTasks = {
  getTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  completeTask: jest.fn(),
  startTask: jest.fn(),
  tasks: [],
  isLoading: false,
  error: null
};

jest.mock('../../../hooks/use-tasks', () => ({
  useTasks: () => mockUseTasks,
  TaskPriority: {
    URGENT: 'URGENT',
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW'
  },
  TaskStatus: {
    PENDING: 'PENDING',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED'
  }
}));

// Mock react-router-dom
const mockNavigate = jest.fn();
const mockUseParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => mockUseParams()
}));

// ===================================
// Test Data
// ===================================

const mockTask: Task = {
  id: 'task-123',
  title: 'Test Task',
  description: 'This is a test task description',
  status: 'PENDING' as TaskStatus,
  priority: 'HIGH' as TaskPriority,
  dueDate: '2024-12-31T23:59:59.000Z',
  completedAt: undefined,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-02T00:00:00.000Z',
  userId: 'user-123',
  categories: [
    {
      id: 'cat-1',
      name: 'Work',
      color: '#ff0000'
    },
    {
      id: 'cat-2',
      name: 'Important',
      color: '#00ff00'
    }
  ]
};

const mockCompletedTask: Task = {
  ...mockTask,
  id: 'task-456',
  status: 'COMPLETED' as TaskStatus,
  completedAt: '2024-01-03T12:00:00.000Z'
};

// ===================================
// Test Utilities
// ===================================

const renderTaskDetail = (props = {}) => {
  const defaultProps = {
    taskId: 'task-123',
    testId: 'task-detail'
  };

  return render(
    <MemoryRouter>
      <TaskDetail {...defaultProps} {...props} />
    </MemoryRouter>
  );
};

// ===================================
// Test Suite
// ===================================

describe('TaskDetail Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ id: 'task-123' });
    mockUseTasks.getTask.mockResolvedValue(mockTask);
  });

  // ===================================
  // Rendering Tests
  // ===================================

  describe('Rendering', () => {
    test('should render loading state initially', async () => {
      mockUseTasks.getTask.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderTaskDetail();
      
      expect(screen.getByTestId('task-detail-loading')).toBeInTheDocument();
      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });

    test('should render task details after loading', async () => {
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail')).toBeInTheDocument();
      });

      expect(screen.getByTestId('task-detail-title')).toHaveTextContent('Test Task');
      expect(screen.getByTestId('task-detail-description')).toHaveTextContent('This is a test task description');
      expect(screen.getByTestId('task-detail-priority')).toHaveTextContent('優先度: 高');
      expect(screen.getByTestId('task-detail-status')).toHaveTextContent('ステータス: 未着手');
    });

    test('should render task dates correctly', async () => {
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-created-at')).toBeInTheDocument();
      });

      expect(screen.getByTestId('task-detail-created-at')).toBeInTheDocument();
      expect(screen.getByTestId('task-detail-updated-at')).toBeInTheDocument();
      expect(screen.getByTestId('task-detail-due-date')).toBeInTheDocument();
    });

    test('should render task categories', async () => {
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-categories')).toBeInTheDocument();
      });

      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Important')).toBeInTheDocument();
    });

    test('should render completed task with completion date', async () => {
      mockUseTasks.getTask.mockResolvedValue(mockCompletedTask);
      
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-completed-at')).toBeInTheDocument();
      });

      expect(screen.getByTestId('task-detail-status')).toHaveTextContent('ステータス: 完了');
    });

    test('should render error state when task loading fails', async () => {
      const errorMessage = 'Failed to load task';
      mockUseTasks.getTask.mockRejectedValue(new Error(errorMessage));
      
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-error')).toBeInTheDocument();
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByText('再試行')).toBeInTheDocument();
    });

    test('should render not found state when task is null', async () => {
      mockUseTasks.getTask.mockResolvedValue(null);
      
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-not-found')).toBeInTheDocument();
      });

      expect(screen.getByText('タスクが見つかりません')).toBeInTheDocument();
    });
  });

  // ===================================
  // Action Button Tests
  // ===================================

  describe('Action Buttons', () => {
    test('should render all action buttons for task owner', async () => {
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toBeInTheDocument();
      });

      expect(screen.getByTestId('task-detail-edit-button')).toBeInTheDocument();
      expect(screen.getByTestId('task-detail-delete-button')).toBeInTheDocument();
      expect(screen.getByTestId('task-detail-back-button')).toBeInTheDocument();
    });

    test('should not render edit/delete buttons for non-owner', async () => {
      const otherUserTask = { ...mockTask, userId: 'other-user' };
      mockUseTasks.getTask.mockResolvedValue(otherUserTask);
      
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('task-detail-edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('task-detail-delete-button')).not.toBeInTheDocument();
      expect(screen.getByTestId('task-detail-back-button')).toBeInTheDocument();
    });

    test('should show correct status toggle text for pending task', async () => {
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toHaveTextContent('完了にする');
      });
    });

    test('should show correct status toggle text for completed task', async () => {
      mockUseTasks.getTask.mockResolvedValue(mockCompletedTask);
      
      renderTaskDetail();
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toHaveTextContent('未完了にする');
      });
    });
  });

  // ===================================
  // User Interaction Tests
  // ===================================

  describe('User Interactions', () => {
    test('should call onEdit when edit button is clicked', async () => {
      const mockOnEdit = jest.fn();
      renderTaskDetail({ onEdit: mockOnEdit });
      
      await waitFor(() => {
        expect(screen.getByTestId('task-detail-edit-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-edit-button'));
      
      expect(mockOnEdit).toHaveBeenCalledWith('task-123');
    });

    test('should navigate to edit page when edit button is clicked without onEdit prop', async () => {
      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-edit-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-edit-button'));

      expect(mockNavigate).toHaveBeenCalledWith('/tasks/task-123/edit');
    });

    test('should show confirmation dialog and delete task when delete button is clicked', async () => {
      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      mockUseTasks.deleteTask.mockResolvedValue(undefined);

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-delete-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-delete-button'));

      expect(window.confirm).toHaveBeenCalledWith(
        'タスク「Test Task」を削除してもよろしいですか？\nこの操作は取り消せません。'
      );

      await waitFor(() => {
        expect(mockUseTasks.deleteTask).toHaveBeenCalledWith('task-123');
      });

      expect(mockNavigate).toHaveBeenCalledWith('/tasks');

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    test('should not delete task when confirmation is cancelled', async () => {
      // Mock window.confirm to return false
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => false);

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-delete-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-delete-button'));

      expect(window.confirm).toHaveBeenCalled();
      expect(mockUseTasks.deleteTask).not.toHaveBeenCalled();
      expect(mockNavigate).not.toHaveBeenCalled();

      // Restore window.confirm
      window.confirm = originalConfirm;
    });

    test('should toggle task status from pending to completed', async () => {
      const updatedTask = { ...mockTask, status: 'COMPLETED' as TaskStatus };
      mockUseTasks.completeTask.mockResolvedValue(updatedTask);

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-status-toggle'));

      await waitFor(() => {
        expect(mockUseTasks.completeTask).toHaveBeenCalledWith('task-123');
      });
    });

    test('should toggle task status from completed to in progress', async () => {
      mockUseTasks.getTask.mockResolvedValue(mockCompletedTask);
      const updatedTask = { ...mockCompletedTask, status: 'IN_PROGRESS' as TaskStatus };
      mockUseTasks.startTask.mockResolvedValue(updatedTask);

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-status-toggle'));

      await waitFor(() => {
        expect(mockUseTasks.startTask).toHaveBeenCalledWith('task-456');
      });
    });

    test('should call onBack when back button is clicked', async () => {
      const mockOnBack = jest.fn();
      renderTaskDetail({ onBack: mockOnBack });

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-back-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-back-button'));

      expect(mockOnBack).toHaveBeenCalled();
    });

    test('should navigate to tasks page when back button is clicked without onBack prop', async () => {
      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-back-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-back-button'));

      expect(mockNavigate).toHaveBeenCalledWith('/tasks');
    });

    test('should retry loading task when retry button is clicked', async () => {
      mockUseTasks.getTask.mockRejectedValueOnce(new Error('Network error'));

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-error')).toBeInTheDocument();
      });

      // Reset mock to succeed on retry
      mockUseTasks.getTask.mockResolvedValue(mockTask);

      fireEvent.click(screen.getByText('再試行'));

      await waitFor(() => {
        expect(screen.getByTestId('task-detail')).toBeInTheDocument();
      });
    });
  });

  // ===================================
  // Error Handling Tests
  // ===================================

  describe('Error Handling', () => {
    test('should handle delete task error', async () => {
      const originalConfirm = window.confirm;
      window.confirm = jest.fn(() => true);

      const errorMessage = 'Delete failed';
      mockUseTasks.deleteTask.mockRejectedValue(new Error(errorMessage));

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-delete-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-delete-button'));

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-error-banner')).toBeInTheDocument();
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();

      window.confirm = originalConfirm;
    });

    test('should handle status update error', async () => {
      const errorMessage = 'Status update failed';
      mockUseTasks.completeTask.mockRejectedValue(new Error(errorMessage));

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-status-toggle')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('task-detail-status-toggle'));

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-error-banner')).toBeInTheDocument();
      });

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('should handle missing task ID', async () => {
      mockUseParams.mockReturnValue({});

      renderTaskDetail({ taskId: undefined });

      await waitFor(() => {
        expect(screen.getByTestId('task-detail-error')).toBeInTheDocument();
      });

      expect(screen.getByText('タスクIDが指定されていません')).toBeInTheDocument();
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration', () => {
    test('should work with URL parameters', async () => {
      mockUseParams.mockReturnValue({ id: 'url-task-123' });

      renderTaskDetail({ taskId: undefined });

      await waitFor(() => {
        expect(mockUseTasks.getTask).toHaveBeenCalledWith('url-task-123');
      });
    });

    test('should prioritize prop taskId over URL parameter', async () => {
      mockUseParams.mockReturnValue({ id: 'url-task-123' });

      renderTaskDetail({ taskId: 'prop-task-456' });

      await waitFor(() => {
        expect(mockUseTasks.getTask).toHaveBeenCalledWith('prop-task-456');
      });
    });

    test('should handle unauthenticated user', async () => {
      mockUseAuth.isAuthenticated = false;
      mockUseAuth.user = null;

      renderTaskDetail();

      await waitFor(() => {
        expect(screen.getByTestId('task-detail')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('task-detail-edit-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('task-detail-delete-button')).not.toBeInTheDocument();

      // Reset for other tests
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = mockUser;
    });
  });
});
