/**
 * ===================================
 * Task Item Component Tests
 * ===================================
 * Purpose: Comprehensive testing for TaskItem component
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TaskItem, TaskItemProps, Task, Category } from '../task-item';

// ===================================
// Test Setup and Mocks
// ===================================

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

const mockOverdueTask: Task = {
  ...mockTask,
  id: 'task-overdue',
  title: 'Overdue Task',
  dueDate: '2023-01-01T00:00:00.000Z' // Past date
};

const mockCompletedTask: Task = {
  ...mockTask,
  id: 'task-completed',
  title: 'Completed Task',
  status: 'COMPLETED'
};

const defaultProps: TaskItemProps = {
  task: mockTask,
  isSelected: false,
  viewMode: 'list',
  onSelect: jest.fn(),
  onEdit: jest.fn(),
  onDelete: jest.fn(),
  onComplete: jest.fn()
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// ===================================
// Test Suite Setup
// ===================================

describe('TaskItem Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Mock window.confirm
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: jest.fn().mockReturnValue(true)
    });
  });

  // ===================================
  // Phase 1: Basic Rendering and Props
  // ===================================

  describe('Phase 1: Basic Rendering and Props', () => {
    it('should render task item in list view', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} viewMode="list" />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-item-list')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.getByText('Test task description')).toBeInTheDocument();
    });

    it('should render task item in grid view', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} viewMode="grid" />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-item-grid')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render task item in compact view', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} viewMode="compact" />
        </TestWrapper>
      );

      expect(screen.getByTestId('task-item-compact')).toBeInTheDocument();
      expect(screen.getByText('Test Task')).toBeInTheDocument();
    });

    it('should render with custom className and testId', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} className="custom-class" testId="custom-test-id" />
        </TestWrapper>
      );

      const taskItem = screen.getByTestId('custom-test-id-list');
      expect(taskItem).toBeInTheDocument();
      expect(taskItem).toHaveClass('custom-class');
    });

    it('should display task priority and status', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('MEDIUM')).toBeInTheDocument();
      expect(screen.getByText('PENDING')).toBeInTheDocument();
    });

    it('should display task categories', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Work')).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 2: Selection and State
  // ===================================

  describe('Phase 2: Selection and State', () => {
    it('should handle task selection', async () => {
      const mockOnSelect = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} onSelect={mockOnSelect} />
        </TestWrapper>
      );

      const checkbox = screen.getByLabelText('Select task: Test Task');
      await user.click(checkbox);

      expect(mockOnSelect).toHaveBeenCalledWith('task-123', true);
    });

    it('should show selected state', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} isSelected={true} />
        </TestWrapper>
      );

      const taskItem = screen.getByTestId('task-item-list');
      expect(taskItem).toHaveClass('task-item--selected');
      
      const checkbox = screen.getByLabelText('Select task: Test Task') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    it('should show overdue state', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={mockOverdueTask} />
        </TestWrapper>
      );

      const taskItem = screen.getByTestId('task-item-list');
      expect(taskItem).toHaveClass('task-item--overdue');
    });

    it('should show completed state', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={mockCompletedTask} />
        </TestWrapper>
      );

      const taskItem = screen.getByTestId('task-item-list');
      expect(taskItem).toHaveClass('task-item--completed');
    });

    it('should hide complete button for completed tasks', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={mockCompletedTask} />
        </TestWrapper>
      );

      expect(screen.queryByLabelText(/mark.*complete/i)).not.toBeInTheDocument();
    });

    it('should show complete button for non-completed tasks', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/mark.*complete/i)).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 3: Actions and Interactions
  // ===================================

  describe('Phase 3: Actions and Interactions', () => {
    it('should handle edit action', async () => {
      const mockOnEdit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} onEdit={mockOnEdit} />
        </TestWrapper>
      );

      const editButton = screen.getByLabelText('Edit task "Test Task"');
      await user.click(editButton);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
    });

    it('should handle delete action with confirmation', async () => {
      const mockOnDelete = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} onDelete={mockOnDelete} />
        </TestWrapper>
      );

      const deleteButton = screen.getByLabelText('Delete task "Test Task"');
      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to delete the task "Test Task"?'
      );
      expect(mockOnDelete).toHaveBeenCalledWith(mockTask);
    });

    it('should not delete when confirmation is cancelled', async () => {
      const mockOnDelete = jest.fn();
      const user = userEvent.setup();
      
      (window.confirm as jest.Mock).mockReturnValue(false);
      
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} onDelete={mockOnDelete} />
        </TestWrapper>
      );

      const deleteButton = screen.getByLabelText('Delete task "Test Task"');
      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
      expect(mockOnDelete).not.toHaveBeenCalled();
    });

    it('should handle complete action', async () => {
      const mockOnComplete = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} onComplete={mockOnComplete} />
        </TestWrapper>
      );

      const completeButton = screen.getByLabelText(/mark.*complete/i);
      await user.click(completeButton);

      expect(mockOnComplete).toHaveBeenCalledWith(mockTask);
    });

    it('should handle keyboard navigation', async () => {
      const mockOnEdit = jest.fn();
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} onEdit={mockOnEdit} />
        </TestWrapper>
      );

      const taskItem = screen.getByTestId('task-item-list');
      taskItem.focus();
      
      await user.keyboard('{Enter}');
      expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
      
      await user.keyboard(' ');
      expect(mockOnEdit).toHaveBeenCalledTimes(2);
    });
  });

  // ===================================
  // Phase 4: View Modes and Display
  // ===================================

  describe('Phase 4: View Modes and Display', () => {
    it('should truncate description in grid view', () => {
      const longDescriptionTask = {
        ...mockTask,
        description: 'a'.repeat(150) // Long description
      };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={longDescriptionTask} viewMode="grid" />
        </TestWrapper>
      );

      const description = screen.getByText(/a+\.\.\./);
      expect(description).toBeInTheDocument();
    });

    it('should show full description in list view', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} viewMode="list" />
        </TestWrapper>
      );

      expect(screen.getByText('Test task description')).toBeInTheDocument();
    });

    it('should format due date correctly', () => {
      const todayTask = {
        ...mockTask,
        dueDate: new Date().toISOString()
      };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={todayTask} />
        </TestWrapper>
      );

      expect(screen.getByText('Today')).toBeInTheDocument();
    });

    it('should show action text in list view', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} viewMode="list" />
        </TestWrapper>
      );

      expect(screen.getByText('Complete')).toBeInTheDocument();
      expect(screen.getByText('Edit')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should hide action text in grid and compact views', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} viewMode="grid" />
        </TestWrapper>
      );

      expect(screen.queryByText('Complete')).not.toBeInTheDocument();
      expect(screen.queryByText('Edit')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should show priority colors correctly', () => {
      const urgentTask = { ...mockTask, priority: 'URGENT' as const };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={urgentTask} />
        </TestWrapper>
      );

      const priorityElement = screen.getByText('URGENT');
      expect(priorityElement).toHaveClass('task-item__priority--urgent');
    });
  });

  // ===================================
  // Phase 5: Edge Cases and Accessibility
  // ===================================

  describe('Phase 5: Edge Cases and Accessibility', () => {
    it('should handle task without description', () => {
      const taskWithoutDescription = {
        ...mockTask,
        description: undefined
      };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={taskWithoutDescription} />
        </TestWrapper>
      );

      expect(screen.getByText('Test Task')).toBeInTheDocument();
      expect(screen.queryByText('Test task description')).not.toBeInTheDocument();
    });

    it('should handle task without due date', () => {
      const taskWithoutDueDate = {
        ...mockTask,
        dueDate: undefined
      };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={taskWithoutDueDate} />
        </TestWrapper>
      );

      expect(screen.queryByText(/due:/i)).not.toBeInTheDocument();
    });

    it('should handle task without categories', () => {
      const taskWithoutCategories = {
        ...mockTask,
        categories: []
      };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={taskWithoutCategories} />
        </TestWrapper>
      );

      expect(screen.queryByText('Work')).not.toBeInTheDocument();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} />
        </TestWrapper>
      );

      const taskItem = screen.getByTestId('task-item-list');
      expect(taskItem).toHaveAttribute('role', 'listitem');
      expect(taskItem).toHaveAttribute('aria-selected', 'false');
      expect(taskItem).toHaveAttribute('tabIndex', '0');
    });

    it('should have proper ARIA labels for actions', () => {
      render(
        <TestWrapper>
          <TaskItem {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Select task: Test Task')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit task "Test Task"')).toBeInTheDocument();
      expect(screen.getByLabelText('Delete task "Test Task"')).toBeInTheDocument();
      expect(screen.getByLabelText(/mark.*complete/i)).toBeInTheDocument();
    });

    it('should handle different priority and status levels', () => {
      const urgentTask = { ...mockTask, priority: 'URGENT' as const };

      render(
        <TestWrapper>
          <TaskItem {...defaultProps} task={urgentTask} />
        </TestWrapper>
      );

      const priorityElement = screen.getByText('URGENT');
      expect(priorityElement).toHaveClass('task-item__priority--urgent');
    });
  });
});
