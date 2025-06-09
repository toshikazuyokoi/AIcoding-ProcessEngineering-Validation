/**
 * ===================================
 * Task Form Component Tests
 * ===================================
 * Purpose: Comprehensive testing for TaskForm component
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskForm, TaskFormProps, TaskFormData, Category, Task } from '../task-form';
import * as useAuthModule from '../../../hooks/use-auth';

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

// Test data
const mockCategories: Category[] = [
  {
    id: 'cat-1',
    name: 'Work',
    color: '#3B82F6',
    description: 'Work related tasks'
  },
  {
    id: 'cat-2',
    name: 'Personal',
    color: '#10B981',
    description: 'Personal tasks'
  },
  {
    id: 'cat-3',
    name: 'Urgent',
    color: '#EF4444',
    description: 'Urgent tasks'
  }
];

const mockTask: Task = {
  id: 'task-123',
  title: 'Test Task',
  description: 'Test task description',
  priority: 'MEDIUM',
  status: 'PENDING',
  dueDate: '2023-12-31T23:59:59.000Z',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  userId: 'user-123',
  categories: [mockCategories[0]]
};

const defaultProps: TaskFormProps = {
  mode: 'create',
  categories: mockCategories,
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
  loading: false
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// ===================================
// Test Suite Setup
// ===================================

describe('TaskForm Component', () => {
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
  });

  // ===================================
  // Phase 1: Basic Rendering and Authentication
  // ===================================

  describe('Phase 1: Basic Rendering and Authentication', () => {
    it('should render task form when authenticated', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-form')).toBeInTheDocument();
      expect(screen.getByText('Create New Task')).toBeInTheDocument();
    });

    it('should show authentication required message when not authenticated', () => {
      Object.assign(mockUseAuth, { isAuthenticated: false, user: null });

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Please log in to create or edit tasks.')).toBeInTheDocument();
      expect(screen.queryByTestId('task-form')).not.toBeInTheDocument();
    });

    it('should render with custom className and testId', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} className="custom-class" testId="custom-test-id" />
        </TestWrapper>
      );

      const taskForm = screen.getByTestId('custom-test-id');
      expect(taskForm).toBeInTheDocument();
      expect(taskForm).toHaveClass('custom-class');
    });

    it('should render create mode correctly', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} mode="create" />
        </TestWrapper>
      );

      expect(screen.getByText('Create New Task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
      expect(screen.queryByText(/editing:/i)).not.toBeInTheDocument();
    });

    it('should render edit mode correctly', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} mode="edit" initialData={mockTask} />
        </TestWrapper>
      );

      expect(screen.getByText('Edit Task')).toBeInTheDocument();
      expect(screen.getByText('Editing: Test Task')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /update task/i })).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 2: Form Fields and Validation
  // ===================================

  describe('Phase 2: Form Fields and Validation', () => {
    it('should render all form fields', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('should show required indicators', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const requiredFields = screen.getAllByText('*');
      expect(requiredFields).toHaveLength(2); // Title and Priority are required
    });

    it('should validate title field', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      
      // Test empty title
      await user.click(titleInput);
      await user.tab(); // Blur the field
      
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      });

      // Test valid title
      await user.clear(titleInput);
      await user.type(titleInput, 'Valid Task Title');
      await user.tab();
      
      await waitFor(() => {
        expect(screen.queryByText('Title is required')).not.toBeInTheDocument();
      });
    });

    it('should validate title length', async () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      const longTitle = 'a'.repeat(101); // Exceeds 100 character limit

      // Use fireEvent for reliable validation testing
      fireEvent.change(titleInput, { target: { value: longTitle } });
      fireEvent.blur(titleInput);

      await waitFor(() => {
        expect(screen.getByText('Title must not exceed 100 characters')).toBeInTheDocument();
      });
    });

    it('should validate description length', async () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const descriptionInput = screen.getByLabelText(/description/i);
      const longDescription = 'a'.repeat(1001); // Exceeds 1000 character limit

      // Use fireEvent for reliable validation testing
      fireEvent.change(descriptionInput, { target: { value: longDescription } });
      fireEvent.blur(descriptionInput);

      await waitFor(() => {
        expect(screen.getByText('Description must not exceed 1000 characters')).toBeInTheDocument();
      });
    });

    it('should validate due date', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const dueDateInput = screen.getByLabelText(/due date/i);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const pastDate = yesterday.toISOString().split('T')[0];
      
      await user.type(dueDateInput, pastDate);
      await user.tab();
      
      await waitFor(() => {
        expect(screen.getByText('Due date cannot be in the past')).toBeInTheDocument();
      });
    });

    it('should show character count for description', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/1000 remaining/i)).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 3: Form Interaction and State
  // ===================================

  describe('Phase 3: Form Interaction and State', () => {
    it('should populate form fields in edit mode', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} mode="edit" initialData={mockTask} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i) as HTMLInputElement;
      const descriptionInput = screen.getByLabelText(/description/i) as HTMLTextAreaElement;
      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement;

      expect(titleInput.value).toBe('Test Task');
      expect(descriptionInput.value).toBe('Test task description');
      expect(prioritySelect.value).toBe('MEDIUM');
    });

    it('should handle priority selection', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const prioritySelect = screen.getByLabelText(/priority/i) as HTMLSelectElement;
      await user.selectOptions(prioritySelect, 'HIGH');

      expect(prioritySelect.value).toBe('HIGH');
    });

    it('should handle category selection', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const workCategory = screen.getByLabelText('Work');
      await user.click(workCategory);
      
      expect(workCategory).toBeChecked();
    });

    it('should handle multiple category selection', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const workCategory = screen.getByLabelText('Work');
      const personalCategory = screen.getByLabelText('Personal');
      
      await user.click(workCategory);
      await user.click(personalCategory);
      
      expect(workCategory).toBeChecked();
      expect(personalCategory).toBeChecked();
    });

    it('should show unsaved changes notice', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Some title');
      
      await waitFor(() => {
        expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
      });
    });

    it('should enable submit button when form is valid and dirty', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /create task/i });
      expect(submitButton).toBeDisabled();

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Valid Task Title');
      
      await waitFor(() => {
        expect(submitButton).toBeEnabled();
      });
    });
  });

  // ===================================
  // Phase 4: Form Submission and Actions
  // ===================================

  describe('Phase 4: Form Submission and Actions', () => {
    it('should call onSubmit with correct data', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const prioritySelect = screen.getByLabelText(/priority/i);

      await user.type(titleInput, 'Test Task');
      await user.type(descriptionInput, 'Test description');
      await user.selectOptions(prioritySelect, 'HIGH');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          title: 'Test Task',
          description: 'Test description',
          priority: 'HIGH',
          dueDate: null,
          categoryIds: []
        });
      });
    });

    it('should prevent submission with invalid data', async () => {
      const mockOnSubmit = jest.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const submitButton = screen.getByRole('button', { name: /create task/i });

      await act(async () => {
        await user.click(submitButton);
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Check if error message appears
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle submission errors', async () => {
      const mockOnSubmit = jest.fn().mockRejectedValue(new Error('Submission failed'));
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });

      await act(async () => {
        await user.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Submission failed')).toBeInTheDocument();
      }, { timeout: 5000 });
    });

    it('should show loading state during submission', async () => {
      const mockOnSubmit = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      expect(screen.getByText('Creating...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    it('should handle cancel action', async () => {
      const mockOnCancel = jest.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} onCancel={mockOnCancel} />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should handle reset action', async () => {
      const user = userEvent.setup();

      // Mock window.confirm
      const originalConfirm = window.confirm;
      window.confirm = jest.fn().mockReturnValue(true);

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Some changes');

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to reset the form?');
      expect(titleInput).toHaveValue('');

      // Restore original confirm
      window.confirm = originalConfirm;
    });
  });

  // ===================================
  // Phase 5: Edge Cases and Accessibility
  // ===================================

  describe('Phase 5: Edge Cases and Accessibility', () => {
    it('should handle form without categories', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} categories={[]} />
        </TestWrapper>
      );

      expect(screen.queryByText(/categories/i)).not.toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      expect(titleInput).toHaveAttribute('aria-describedby');
      expect(titleInput).toHaveAttribute('aria-invalid', 'false');
      expect(titleInput).toHaveAttribute('required');
    });

    it('should show ARIA error states', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.click(titleInput);
      await user.tab();

      await waitFor(() => {
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });

    it('should validate forbidden characters in title', async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper>
          <TaskForm {...defaultProps} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Title with <script>');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Title contains invalid characters')).toBeInTheDocument();
      });
    });

    it('should reset form after successful creation', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <TaskForm {...defaultProps} mode="create" onSubmit={mockOnSubmit} />
        </TestWrapper>
      );

      const titleInput = screen.getByLabelText(/title/i);
      await user.type(titleInput, 'Test Task');

      const submitButton = screen.getByRole('button', { name: /create task/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(titleInput).toHaveValue('');
        expect(screen.queryByText('You have unsaved changes')).not.toBeInTheDocument();
      });
    });
  });
});
