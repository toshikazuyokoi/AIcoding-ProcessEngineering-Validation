/**
 * ===================================
 * Filter Panel Component Test Suite
 * ===================================
 * Purpose: Comprehensive testing for FilterPanel component
 * Features:
 * - Component rendering tests
 * - Filter functionality tests
 * - Preset management tests
 * - Advanced filters tests
 * - Integration tests
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * TSK-R3-002-CMP-FilterPanel
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterPanel, FilterCriteria, Category } from '../filter-panel';

// ===================================
// Mock Dependencies
// ===================================

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// ===================================
// Test Data
// ===================================

const mockCategories: Category[] = [
  { id: 'cat1', name: 'Work', color: '#3b82f6', count: 5 },
  { id: 'cat2', name: 'Personal', color: '#10b981', count: 3 },
  { id: 'cat3', name: 'Shopping', color: '#f59e0b', count: 2 }
];

const mockFilters: FilterCriteria = {
  status: ['PENDING', 'IN_PROGRESS'],
  priority: ['HIGH'],
  categoryIds: ['cat1'],
  dateRange: 'thisWeek',
  isCompleted: false,
  isOverdue: undefined,
  hasCategories: true
};

const mockPresets = [
  {
    id: 'preset1',
    name: 'My Custom Filter',
    filters: mockFilters
  }
];

// ===================================
// Test Utilities
// ===================================

const renderFilterPanel = (props = {}) => {
  const defaultProps = {
    onFiltersChange: jest.fn(),
    testId: 'filter-panel'
  };

  return render(<FilterPanel {...defaultProps} {...props} />);
};

// ===================================
// Test Suite
// ===================================

describe('FilterPanel Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  // ===================================
  // Rendering Tests
  // ===================================

  describe('Rendering', () => {
    test('should render filter panel with header', () => {
      renderFilterPanel();
      
      expect(screen.getByTestId('filter-panel')).toBeInTheDocument();
      expect(screen.getByText('Filters')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-toggle-expand')).toBeInTheDocument();
    });

    test('should render with custom className', () => {
      renderFilterPanel({ className: 'custom-filter' });
      
      const panel = screen.getByTestId('filter-panel');
      expect(panel).toHaveClass('custom-filter');
    });

    test('should render all filter groups when expanded', () => {
      renderFilterPanel();
      
      expect(screen.getByTestId('filter-panel-status-group')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-priority-group')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-date-group')).toBeInTheDocument();
    });

    test('should render category filters when categories provided', () => {
      renderFilterPanel({ categories: mockCategories });
      
      expect(screen.getByTestId('filter-panel-category-group')).toBeInTheDocument();
      expect(screen.getByText('Work')).toBeInTheDocument();
      expect(screen.getByText('Personal')).toBeInTheDocument();
      expect(screen.getByText('Shopping')).toBeInTheDocument();
    });

    test('should not render category filters when no categories', () => {
      renderFilterPanel({ categories: [] });
      
      expect(screen.queryByTestId('filter-panel-category-group')).not.toBeInTheDocument();
    });

    test('should render presets when showPresets is true', () => {
      renderFilterPanel({ showPresets: true });
      
      expect(screen.getByTestId('filter-panel-presets')).toBeInTheDocument();
      expect(screen.getByText('Quick Filters')).toBeInTheDocument();
    });

    test('should not render presets when showPresets is false', () => {
      renderFilterPanel({ showPresets: false });
      
      expect(screen.queryByTestId('filter-panel-presets')).not.toBeInTheDocument();
    });

    test('should render advanced toggle when showAdvanced is true', () => {
      renderFilterPanel({ showAdvanced: true });
      
      expect(screen.getByTestId('filter-panel-toggle-advanced')).toBeInTheDocument();
    });

    test('should not render advanced toggle when showAdvanced is false', () => {
      renderFilterPanel({ showAdvanced: false });
      
      expect(screen.queryByTestId('filter-panel-toggle-advanced')).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Filter Functionality Tests
  // ===================================

  describe('Filter Functionality', () => {
    test('should handle status filter changes', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ onFiltersChange: mockOnFiltersChange });
      
      const pendingCheckbox = screen.getByTestId('filter-panel-status-pending');
      await userEvent.click(pendingCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['PENDING']
        })
      );
    });

    test('should handle multiple status selections', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ onFiltersChange: mockOnFiltersChange });
      
      const pendingCheckbox = screen.getByTestId('filter-panel-status-pending');
      const inProgressCheckbox = screen.getByTestId('filter-panel-status-in_progress');
      
      await userEvent.click(pendingCheckbox);
      await userEvent.click(inProgressCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: ['PENDING', 'IN_PROGRESS']
        })
      );
    });

    test('should handle priority filter changes', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ onFiltersChange: mockOnFiltersChange });
      
      const highCheckbox = screen.getByTestId('filter-panel-priority-high');
      await userEvent.click(highCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: ['HIGH']
        })
      );
    });

    test('should handle category filter changes', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ 
        onFiltersChange: mockOnFiltersChange,
        categories: mockCategories 
      });
      
      const workCheckbox = screen.getByTestId('filter-panel-category-cat1');
      await userEvent.click(workCheckbox);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryIds: ['cat1']
        })
      );
    });

    test('should handle date range filter changes', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ onFiltersChange: mockOnFiltersChange });
      
      const thisWeekRadio = screen.getByTestId('filter-panel-date-thisWeek');
      await userEvent.click(thisWeekRadio);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          dateRange: 'thisWeek'
        })
      );
    });

    test('should show custom date inputs when custom range selected', async () => {
      renderFilterPanel();
      
      const customRadio = screen.getByTestId('filter-panel-date-custom');
      await userEvent.click(customRadio);
      
      expect(screen.getByTestId('filter-panel-custom-date')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-date-start-input')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-date-end-input')).toBeInTheDocument();
    });

    test('should handle custom date changes', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ onFiltersChange: mockOnFiltersChange });
      
      const customRadio = screen.getByTestId('filter-panel-date-custom');
      await userEvent.click(customRadio);
      
      const startDateInput = screen.getByTestId('filter-panel-date-start-input');
      await userEvent.type(startDateInput, '2024-01-01');
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          customDateStart: expect.any(Date)
        })
      );
    });

    test('should clear filters when clear button clicked', async () => {
      const mockOnFiltersChange = jest.fn();
      const mockOnFiltersClear = jest.fn();
      
      renderFilterPanel({ 
        onFiltersChange: mockOnFiltersChange,
        onFiltersClear: mockOnFiltersClear,
        initialFilters: mockFilters
      });
      
      const clearButton = screen.getByTestId('filter-panel-clear');
      await userEvent.click(clearButton);
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: [],
          priority: [],
          categoryIds: []
        })
      );
      expect(mockOnFiltersClear).toHaveBeenCalled();
    });
  });

  // ===================================
  // Advanced Filters Tests
  // ===================================

  describe('Advanced Filters', () => {
    test('should show advanced filters when toggle clicked', async () => {
      renderFilterPanel({ showAdvanced: true });
      
      const advancedToggle = screen.getByTestId('filter-panel-toggle-advanced');
      await userEvent.click(advancedToggle);
      
      expect(screen.getByTestId('filter-panel-advanced')).toBeInTheDocument();
    });

    test('should handle completion status filter', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ 
        onFiltersChange: mockOnFiltersChange,
        showAdvanced: true 
      });
      
      const advancedToggle = screen.getByTestId('filter-panel-toggle-advanced');
      await userEvent.click(advancedToggle);
      
      const completionSelect = screen.getByTestId('filter-panel-is-completed');
      await userEvent.selectOptions(completionSelect, 'true');
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isCompleted: true
        })
      );
    });

    test('should handle overdue status filter', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ 
        onFiltersChange: mockOnFiltersChange,
        showAdvanced: true 
      });
      
      const advancedToggle = screen.getByTestId('filter-panel-toggle-advanced');
      await userEvent.click(advancedToggle);
      
      const overdueSelect = screen.getByTestId('filter-panel-is-overdue');
      await userEvent.selectOptions(overdueSelect, 'true');
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          isOverdue: true
        })
      );
    });

    test('should handle category status filter', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({ 
        onFiltersChange: mockOnFiltersChange,
        showAdvanced: true 
      });
      
      const advancedToggle = screen.getByTestId('filter-panel-toggle-advanced');
      await userEvent.click(advancedToggle);
      
      const categoriesSelect = screen.getByTestId('filter-panel-has-categories');
      await userEvent.selectOptions(categoriesSelect, 'false');
      
      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          hasCategories: false
        })
      );
    });
  });

  // ===================================
  // Preset Management Tests
  // ===================================

  describe('Preset Management', () => {
    test('should render default presets', () => {
      renderFilterPanel({ showPresets: true });

      expect(screen.getByTestId('filter-panel-preset-all')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-preset-active')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-preset-completed')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-preset-overdue')).toBeInTheDocument();
      expect(screen.getByTestId('filter-panel-preset-high-priority')).toBeInTheDocument();
    });

    test('should load custom presets from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockPresets));

      renderFilterPanel({ showPresets: true });

      expect(screen.getByText('My Custom Filter')).toBeInTheDocument();
    });

    test('should apply preset when clicked', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({
        onFiltersChange: mockOnFiltersChange,
        showPresets: true
      });

      const activePreset = screen.getByTestId('filter-panel-preset-active');
      await userEvent.click(activePreset);

      expect(mockOnFiltersChange).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ['PENDING', 'IN_PROGRESS'],
          isCompleted: false
        })
      );
    });

    test('should save new preset', async () => {
      renderFilterPanel({
        showSaveLoad: true,
        initialFilters: mockFilters
      });

      const saveInput = screen.getByTestId('filter-panel-save-input');
      const saveButton = screen.getByTestId('filter-panel-save');

      await userEvent.type(saveInput, 'My New Preset');
      await userEvent.click(saveButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'taskFilterPresets',
        expect.stringContaining('My New Preset')
      );
    });

    test('should save preset on Enter key', async () => {
      renderFilterPanel({
        showSaveLoad: true,
        initialFilters: mockFilters
      });

      const saveInput = screen.getByTestId('filter-panel-save-input');

      await userEvent.type(saveInput, 'Keyboard Preset');
      await userEvent.keyboard('{Enter}');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'taskFilterPresets',
        expect.stringContaining('Keyboard Preset')
      );
    });

    test('should delete custom preset', async () => {
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockPresets));

      renderFilterPanel({
        showPresets: true,
        showSaveLoad: true
      });

      const deleteButton = screen.getByTestId('filter-panel-preset-delete-preset1');
      await userEvent.click(deleteButton);

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'taskFilterPresets',
        '[]'
      );
    });

    test('should not show delete button for default presets', () => {
      renderFilterPanel({
        showPresets: true,
        showSaveLoad: true
      });

      expect(screen.queryByTestId('filter-panel-preset-delete-all')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter-panel-preset-delete-active')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter-panel-preset-delete-completed')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter-panel-preset-delete-overdue')).not.toBeInTheDocument();
      expect(screen.queryByTestId('filter-panel-preset-delete-high-priority')).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Collapse/Expand Tests
  // ===================================

  describe('Collapse/Expand', () => {
    test('should collapse when toggle clicked', async () => {
      renderFilterPanel({ isCollapsible: true });

      const toggleButton = screen.getByTestId('filter-panel-toggle-expand');
      await userEvent.click(toggleButton);

      expect(screen.queryByTestId('filter-panel-status-group')).not.toBeInTheDocument();
    });

    test('should expand when toggle clicked again', async () => {
      renderFilterPanel({ isCollapsible: true });

      const toggleButton = screen.getByTestId('filter-panel-toggle-expand');
      await userEvent.click(toggleButton); // Collapse
      await userEvent.click(toggleButton); // Expand

      expect(screen.getByTestId('filter-panel-status-group')).toBeInTheDocument();
    });

    test('should not render toggle when isCollapsible is false', () => {
      renderFilterPanel({ isCollapsible: false });

      expect(screen.queryByTestId('filter-panel-toggle-expand')).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Integration Tests
  // ===================================

  describe('Integration', () => {
    test('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      expect(() => renderFilterPanel({ showPresets: true })).not.toThrow();
    });

    test('should handle invalid JSON in localStorage gracefully', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');

      expect(() => renderFilterPanel({ showPresets: true })).not.toThrow();
    });

    test('should call onFiltersApply when apply button clicked', async () => {
      const mockOnFiltersApply = jest.fn();
      renderFilterPanel({
        onFiltersApply: mockOnFiltersApply,
        initialFilters: mockFilters
      });

      const applyButton = screen.getByTestId('filter-panel-apply');
      await userEvent.click(applyButton);

      expect(mockOnFiltersApply).toHaveBeenCalledWith(mockFilters);
    });

    test('should show active filter count', () => {
      renderFilterPanel({ initialFilters: mockFilters });

      const activeCount = screen.getByTestId('filter-panel-active-count');
      expect(activeCount).toBeInTheDocument();
      expect(activeCount).toHaveTextContent('6 active');
    });

    test('should not show active count when no filters', () => {
      renderFilterPanel();

      expect(screen.queryByTestId('filter-panel-active-count')).not.toBeInTheDocument();
    });

    test('should disable clear button when no active filters', () => {
      renderFilterPanel();

      const clearButton = screen.getByTestId('filter-panel-clear');
      expect(clearButton).toBeDisabled();
    });

    test('should enable clear button when filters are active', () => {
      renderFilterPanel({ initialFilters: mockFilters });

      const clearButton = screen.getByTestId('filter-panel-clear');
      expect(clearButton).not.toBeDisabled();
    });

    test('should update filters when initialFilters change', () => {
      const { rerender } = renderFilterPanel({ initialFilters: {} });

      rerender(
        <FilterPanel
          onFiltersChange={jest.fn()}
          initialFilters={mockFilters}
          testId="filter-panel"
        />
      );

      expect(screen.getByTestId('filter-panel-status-pending')).toBeChecked();
      expect(screen.getByTestId('filter-panel-priority-high')).toBeChecked();
    });

    test('should handle complex filter combinations', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({
        onFiltersChange: mockOnFiltersChange,
        categories: mockCategories,
        showAdvanced: true
      });

      // Select multiple filters
      await userEvent.click(screen.getByTestId('filter-panel-status-pending'));
      await userEvent.click(screen.getByTestId('filter-panel-priority-high'));
      await userEvent.click(screen.getByTestId('filter-panel-category-cat1'));
      await userEvent.click(screen.getByTestId('filter-panel-date-thisWeek'));

      // Enable advanced filters
      await userEvent.click(screen.getByTestId('filter-panel-toggle-advanced'));
      await userEvent.selectOptions(screen.getByTestId('filter-panel-is-completed'), 'false');

      expect(mockOnFiltersChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          status: ['PENDING'],
          priority: ['HIGH'],
          categoryIds: ['cat1'],
          dateRange: 'thisWeek',
          isCompleted: false
        })
      );
    });

    test('should maintain preset selection when filters match', async () => {
      const mockOnFiltersChange = jest.fn();
      renderFilterPanel({
        onFiltersChange: mockOnFiltersChange,
        showPresets: true
      });

      // Select active preset
      await userEvent.click(screen.getByTestId('filter-panel-preset-active'));

      // Verify preset container is marked as active
      const presetContainer = screen.getByTestId('filter-panel-preset-active').closest('.filter-panel__preset');
      expect(presetContainer).toHaveClass('filter-panel__preset--active');
    });
  });
});
