/**
 * ===================================
 * Task CRUD Integration Test
 * ===================================
 * Generated for TSK-IT-003-002-TaskUIIntegration
 * Project: Task Management System - Frontend Integration Test
 * Purpose: Test task CRUD UI components integration and flow
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/auth-context';
import { TaskForm } from '../../../src/components/tasks/task-form';
import { TaskItem } from '../../../src/components/tasks/task-item';

// Mock tasks hook
const mockUseTasks = {
  createTask: jest.fn(),
  updateTask: jest.fn(),
  deleteTask: jest.fn(),
  isLoading: false,
  error: null,
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

// Mock router navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Task CRUD Integration Tests', () => {
  const mockTask = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test task description',
    status: 'PENDING',
    priority: 'HIGH',
    dueDate: '2025-02-01T10:00:00Z',
    createdAt: '2025-01-28T10:00:00Z',
    updatedAt: '2025-01-28T10:00:00Z',
    userId: 'user-1'
  };

  const renderTaskForm = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <TaskForm {...props} />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  const renderTaskItem = (props = {}) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <TaskItem task={mockTask} {...props} />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTasks.isLoading = false;
    mockUseTasks.error = null;
  });

  describe('IT-UI-TASK-002: タスク作成フロー結合テスト', () => {
    test('should display task creation form', async () => {
      renderTaskForm({ mode: 'create' });

      // Verify form elements are displayed
      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
    });

    test('should handle task creation', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      
      mockUseTasks.createTask.mockResolvedValue({
        success: true,
        data: mockTask
      });

      renderTaskForm({ mode: 'create', onSuccess });

      // Fill in form
      await user.type(screen.getByLabelText(/title/i), 'New Task');
      await user.type(screen.getByLabelText(/description/i), 'New task description');
      await user.selectOptions(screen.getByLabelText(/priority/i), 'HIGH');
      await user.type(screen.getByLabelText(/due date/i), '2025-02-01');

      // Submit form
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Verify createTask is called
      await waitFor(() => {
        expect(mockUseTasks.createTask).toHaveBeenCalledWith({
          title: 'New Task',
          description: 'New task description',
          priority: 'HIGH',
          dueDate: expect.any(String)
        });
      });

      // Verify success callback
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith(mockTask);
      });
    });

    test('should validate required fields', async () => {
      const user = userEvent.setup();
      renderTaskForm({ mode: 'create' });

      // Try to submit empty form
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Verify createTask is not called
      expect(mockUseTasks.createTask).not.toHaveBeenCalled();
    });

    test('should handle creation error', async () => {
      const user = userEvent.setup();
      
      mockUseTasks.createTask.mockRejectedValue({
        message: 'Failed to create task'
      });

      renderTaskForm({ mode: 'create' });

      // Fill and submit form
      await user.type(screen.getByLabelText(/title/i), 'New Task');
      await user.click(screen.getByRole('button', { name: /create task/i }));

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/failed to create task/i)).toBeInTheDocument();
      });
    });
  });

  describe('IT-UI-TASK-005: タスク編集フロー結合テスト', () => {
    test('should display task edit form with existing data', async () => {
      renderTaskForm({ mode: 'edit', task: mockTask });

      // Verify form is pre-filled
      expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test task description')).toBeInTheDocument();
      expect(screen.getByDisplayValue('HIGH')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });

    test('should handle task update', async () => {
      const user = userEvent.setup();
      const onSuccess = jest.fn();
      
      mockUseTasks.updateTask.mockResolvedValue({
        success: true,
        data: { ...mockTask, title: 'Updated Task' }
      });

      renderTaskForm({ mode: 'edit', task: mockTask, onSuccess });

      // Update title
      const titleInput = screen.getByDisplayValue('Test Task');
      await user.clear(titleInput);
      await user.type(titleInput, 'Updated Task');

      // Submit form
      await user.click(screen.getByRole('button', { name: /update task/i }));

      // Verify updateTask is called
      await waitFor(() => {
        expect(mockUseTasks.updateTask).toHaveBeenCalledWith('task-1', {
          title: 'Updated Task',
          description: 'Test task description',
          priority: 'HIGH',
          dueDate: expect.any(String)
        });
      });

      // Verify success callback
      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
      });
    });

    test('should handle update error', async () => {
      const user = userEvent.setup();
      
      mockUseTasks.updateTask.mockRejectedValue({
        message: 'Failed to update task'
      });

      renderTaskForm({ mode: 'edit', task: mockTask });

      // Submit form
      await user.click(screen.getByRole('button', { name: /update task/i }));

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/failed to update task/i)).toBeInTheDocument();
      });
    });
  });

  describe('IT-UI-TASK-006: タスク削除フロー結合テスト', () => {
    test('should display delete confirmation', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();

      renderTaskItem({ onDelete });

      // Click delete button
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      // Verify confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm delete/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
      });
    });

    test('should handle task deletion', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      
      mockUseTasks.deleteTask.mockResolvedValue({
        success: true
      });

      renderTaskItem({ onDelete });

      // Click delete button
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Confirm deletion
      await user.click(screen.getByRole('button', { name: /confirm delete/i }));

      // Verify deleteTask is called
      await waitFor(() => {
        expect(mockUseTasks.deleteTask).toHaveBeenCalledWith('task-1');
      });

      // Verify success callback
      await waitFor(() => {
        expect(onDelete).toHaveBeenCalledWith(mockTask);
      });
    });

    test('should cancel deletion', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();

      renderTaskItem({ onDelete });

      // Click delete button
      await user.click(screen.getByRole('button', { name: /delete/i }));

      // Cancel deletion
      await user.click(screen.getByRole('button', { name: /cancel/i }));

      // Verify confirmation dialog is closed
      await waitFor(() => {
        expect(screen.queryByText(/are you sure/i)).not.toBeInTheDocument();
      });

      // Verify deleteTask is not called
      expect(mockUseTasks.deleteTask).not.toHaveBeenCalled();
      expect(onDelete).not.toHaveBeenCalled();
    });

    test('should handle deletion error', async () => {
      const user = userEvent.setup();
      
      mockUseTasks.deleteTask.mockRejectedValue({
        message: 'Failed to delete task'
      });

      renderTaskItem();

      // Click delete and confirm
      await user.click(screen.getByRole('button', { name: /delete/i }));
      await user.click(screen.getByRole('button', { name: /confirm delete/i }));

      // Verify error message
      await waitFor(() => {
        expect(screen.getByText(/failed to delete task/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation and UX', () => {
    test('should show loading state during submission', async () => {
      const user = userEvent.setup();
      mockUseTasks.isLoading = true;

      renderTaskForm({ mode: 'create' });

      // Verify loading state
      expect(screen.getByRole('button', { name: /creating/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled();
    });

    test('should validate form fields in real-time', async () => {
      const user = userEvent.setup();
      renderTaskForm({ mode: 'create' });

      const titleInput = screen.getByLabelText(/title/i);

      // Type and clear title
      await user.type(titleInput, 'Test');
      await user.clear(titleInput);
      await user.tab();

      // Verify validation error
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });

    test('should clear errors when user starts typing', async () => {
      const user = userEvent.setup();
      renderTaskForm({ mode: 'create' });

      // Trigger validation error
      await user.click(screen.getByRole('button', { name: /create task/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      // Start typing
      await user.type(screen.getByLabelText(/title/i), 'New Task');

      // Verify error is cleared
      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility and Keyboard Navigation', () => {
    test('should have proper form labels and ARIA attributes', () => {
      renderTaskForm({ mode: 'create' });

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      // Check proper labels
      expect(titleInput).toHaveAttribute('type', 'text');
      expect(descriptionInput).toHaveAttribute('rows');

      // Check form has proper role
      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    test('should handle keyboard navigation in form', async () => {
      const user = userEvent.setup();
      renderTaskForm({ mode: 'create' });

      // Tab through form elements
      await user.tab();
      expect(screen.getByLabelText(/title/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/description/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/priority/i)).toHaveFocus();
    });
  });
});
