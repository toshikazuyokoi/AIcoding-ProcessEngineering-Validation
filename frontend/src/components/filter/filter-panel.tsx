/**
 * ===================================
 * Filter Panel Component Implementation
 * ===================================
 * Purpose: Advanced task filtering functionality with multiple criteria and persistence
 * Features:
 * - Multiple filter criteria (status, priority, category, date range)
 * - Filter combination and persistence
 * - Real-time filter application
 * - Responsive design and accessibility
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * STEP 2 Design: F-003-02
 */

import React, { useState, useCallback, useEffect, useMemo } from 'react';

// ===================================
// Filter Panel Types and Interfaces
// ===================================

/**
 * Task status enum
 */
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Task priority enum
 */
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Date range filter type
 */
export type DateRangeFilter = 'today' | 'thisWeek' | 'thisMonth' | 'overdue' | 'custom';

/**
 * Filter criteria interface
 */
export interface FilterCriteria {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  categoryIds?: string[];
  dateRange?: DateRangeFilter;
  customDateStart?: Date;
  customDateEnd?: Date;
  isCompleted?: boolean;
  isOverdue?: boolean;
  hasCategories?: boolean;
}

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  color?: string;
  count?: number;
}

/**
 * Filter panel props interface
 */
export interface FilterPanelProps {
  onFiltersChange: (filters: FilterCriteria) => void;
  onFiltersApply?: (filters: FilterCriteria) => void;
  onFiltersClear?: () => void;
  initialFilters?: FilterCriteria;
  categories?: Category[];
  showAdvanced?: boolean;
  showPresets?: boolean;
  showSaveLoad?: boolean;
  isCollapsible?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Filter preset interface
 */
export interface FilterPreset {
  id: string;
  name: string;
  filters: FilterCriteria;
  isDefault?: boolean;
}

/**
 * Filter panel state interface
 */
export interface FilterPanelState {
  filters: FilterCriteria;
  isExpanded: boolean;
  showAdvanced: boolean;
  activePreset?: string;
  customPresets: FilterPreset[];
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_FILTERS: FilterCriteria = {
  status: [],
  priority: [],
  categoryIds: [],
  dateRange: undefined,
  customDateStart: undefined,
  customDateEnd: undefined,
  isCompleted: undefined,
  isOverdue: undefined,
  hasCategories: undefined
};

const DEFAULT_PRESETS: FilterPreset[] = [
  {
    id: 'all',
    name: 'All Tasks',
    filters: DEFAULT_FILTERS,
    isDefault: true
  },
  {
    id: 'active',
    name: 'Active Tasks',
    filters: {
      status: ['PENDING', 'IN_PROGRESS'],
      isCompleted: false
    },
    isDefault: true
  },
  {
    id: 'completed',
    name: 'Completed Tasks',
    filters: {
      status: ['COMPLETED'],
      isCompleted: true
    },
    isDefault: true
  },
  {
    id: 'overdue',
    name: 'Overdue Tasks',
    filters: {
      isOverdue: true,
      status: ['PENDING', 'IN_PROGRESS']
    },
    isDefault: true
  },
  {
    id: 'high-priority',
    name: 'High Priority',
    filters: {
      priority: ['URGENT', 'HIGH'],
      status: ['PENDING', 'IN_PROGRESS']
    },
    isDefault: true
  }
];

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pending', color: '#fbbf24' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: '#3b82f6' },
  { value: 'COMPLETED', label: 'Completed', color: '#10b981' },
  { value: 'CANCELLED', label: 'Cancelled', color: '#ef4444' }
] as const;

const PRIORITY_OPTIONS = [
  { value: 'URGENT', label: 'Urgent', color: '#dc2626' },
  { value: 'HIGH', label: 'High', color: '#ea580c' },
  { value: 'MEDIUM', label: 'Medium', color: '#ca8a04' },
  { value: 'LOW', label: 'Low', color: '#65a30d' }
] as const;

const DATE_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'thisWeek', label: 'This Week' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'custom', label: 'Custom Range' }
] as const;

// ===================================
// Utility Functions
// ===================================

/**
 * Load filter presets from localStorage
 */
const loadFilterPresets = (): FilterPreset[] => {
  try {
    const stored = localStorage.getItem('taskFilterPresets');
    if (!stored) return DEFAULT_PRESETS;
    
    const customPresets = JSON.parse(stored) as FilterPreset[];
    return [...DEFAULT_PRESETS, ...customPresets];
  } catch {
    return DEFAULT_PRESETS;
  }
};

/**
 * Save filter presets to localStorage
 */
const saveFilterPresets = (presets: FilterPreset[]): void => {
  try {
    const customPresets = presets.filter(preset => !preset.isDefault);
    localStorage.setItem('taskFilterPresets', JSON.stringify(customPresets));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Check if filters are empty
 */
const areFiltersEmpty = (filters: FilterCriteria): boolean => {
  return (
    (!filters.status || filters.status.length === 0) &&
    (!filters.priority || filters.priority.length === 0) &&
    (!filters.categoryIds || filters.categoryIds.length === 0) &&
    !filters.dateRange &&
    !filters.customDateStart &&
    !filters.customDateEnd &&
    filters.isCompleted === undefined &&
    filters.isOverdue === undefined &&
    filters.hasCategories === undefined
  );
};

/**
 * Compare two filter objects for equality
 */
const areFiltersEqual = (filters1: FilterCriteria, filters2: FilterCriteria): boolean => {
  return JSON.stringify(filters1) === JSON.stringify(filters2);
};

/**
 * Generate unique ID for filter presets
 */
const generatePresetId = (): string => {
  return `preset_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

// ===================================
// Main Filter Panel Component
// ===================================

/**
 * Filter Panel Component
 * 
 * Provides advanced filtering functionality with multiple criteria and persistence.
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  onFiltersChange,
  onFiltersApply,
  onFiltersClear,
  initialFilters = DEFAULT_FILTERS,
  categories = [],
  showAdvanced = true,
  showPresets = true,
  showSaveLoad = true,
  isCollapsible = true,
  className = '',
  testId = 'filter-panel'
}) => {
  // ===================================
  // State Management
  // ===================================

  const [state, setState] = useState<FilterPanelState>({
    filters: { ...DEFAULT_FILTERS, ...initialFilters },
    isExpanded: true,
    showAdvanced: false,
    activePreset: undefined,
    customPresets: loadFilterPresets()
  });

  // ===================================
  // Computed Properties
  // ===================================

  const hasActiveFilters = useMemo(() => {
    return !areFiltersEmpty(state.filters);
  }, [state.filters]);

  const availablePresets = useMemo(() => {
    return state.customPresets;
  }, [state.customPresets]);

  const isCustomDateRange = useMemo(() => {
    return state.filters.dateRange === 'custom';
  }, [state.filters.dateRange]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleFiltersChange = useCallback((newFilters: Partial<FilterCriteria>) => {
    setState(prev => {
      const updatedFilters = { ...prev.filters, ...newFilters };
      
      // Clear active preset if filters changed
      const updatedState = {
        ...prev,
        filters: updatedFilters,
        activePreset: undefined
      };
      
      // Check if current filters match any preset
      const matchingPreset = availablePresets.find(preset => 
        areFiltersEqual(updatedFilters, preset.filters)
      );
      
      if (matchingPreset) {
        updatedState.activePreset = matchingPreset.id;
      }
      
      return updatedState;
    });
    
    const updatedFilters = { ...state.filters, ...newFilters };
    onFiltersChange(updatedFilters);
  }, [state.filters, onFiltersChange, availablePresets]);

  const handleStatusChange = useCallback((status: TaskStatus, checked: boolean) => {
    const currentStatus = state.filters.status || [];
    const newStatus = checked
      ? [...currentStatus, status]
      : currentStatus.filter(s => s !== status);
    
    handleFiltersChange({ status: newStatus });
  }, [state.filters.status, handleFiltersChange]);

  const handlePriorityChange = useCallback((priority: TaskPriority, checked: boolean) => {
    const currentPriority = state.filters.priority || [];
    const newPriority = checked
      ? [...currentPriority, priority]
      : currentPriority.filter(p => p !== priority);
    
    handleFiltersChange({ priority: newPriority });
  }, [state.filters.priority, handleFiltersChange]);

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const currentCategories = state.filters.categoryIds || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(c => c !== categoryId);
    
    handleFiltersChange({ categoryIds: newCategories });
  }, [state.filters.categoryIds, handleFiltersChange]);

  const handleDateRangeChange = useCallback((dateRange: DateRangeFilter) => {
    const updates: Partial<FilterCriteria> = { dateRange };
    
    // Clear custom dates if not custom range
    if (dateRange !== 'custom') {
      updates.customDateStart = undefined;
      updates.customDateEnd = undefined;
    }
    
    handleFiltersChange(updates);
  }, [handleFiltersChange]);

  const handleCustomDateChange = useCallback((field: 'customDateStart' | 'customDateEnd', date: Date | undefined) => {
    handleFiltersChange({ [field]: date });
  }, [handleFiltersChange]);

  const handleBooleanFilterChange = useCallback((field: 'isCompleted' | 'isOverdue' | 'hasCategories', value: boolean | undefined) => {
    handleFiltersChange({ [field]: value });
  }, [handleFiltersChange]);

  const handlePresetSelect = useCallback((presetId: string) => {
    const preset = availablePresets.find(p => p.id === presetId);
    if (!preset) return;

    setState(prev => ({
      ...prev,
      filters: { ...preset.filters },
      activePreset: presetId
    }));

    onFiltersChange(preset.filters);
  }, [availablePresets, onFiltersChange]);

  const handlePresetSave = useCallback((name: string) => {
    const newPreset: FilterPreset = {
      id: generatePresetId(),
      name,
      filters: { ...state.filters }
    };

    const updatedPresets = [...state.customPresets, newPreset];

    setState(prev => ({
      ...prev,
      customPresets: updatedPresets,
      activePreset: newPreset.id
    }));

    saveFilterPresets(updatedPresets);
  }, [state.filters, state.customPresets]);

  const handlePresetDelete = useCallback((presetId: string) => {
    const updatedPresets = state.customPresets.filter(p => p.id !== presetId);

    setState(prev => ({
      ...prev,
      customPresets: updatedPresets,
      activePreset: prev.activePreset === presetId ? undefined : prev.activePreset
    }));

    saveFilterPresets(updatedPresets);
  }, [state.customPresets]);

  const handleClearFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: { ...DEFAULT_FILTERS },
      activePreset: 'all'
    }));

    onFiltersChange(DEFAULT_FILTERS);
    onFiltersClear?.();
  }, [onFiltersChange, onFiltersClear]);

  const handleApplyFilters = useCallback(() => {
    onFiltersApply?.(state.filters);
  }, [state.filters, onFiltersApply]);

  const handleToggleExpanded = useCallback(() => {
    setState(prev => ({ ...prev, isExpanded: !prev.isExpanded }));
  }, []);

  const handleToggleAdvanced = useCallback(() => {
    setState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }));
  }, []);

  // ===================================
  // Effects
  // ===================================

  useEffect(() => {
    // Update filters when initialFilters change
    setState(prev => ({
      ...prev,
      filters: { ...DEFAULT_FILTERS, ...initialFilters }
    }));
  }, [initialFilters]);

  // ===================================
  // Render Methods
  // ===================================

  const renderHeader = () => (
    <div className="filter-panel__header">
      <div className="filter-panel__title-section">
        <h3 className="filter-panel__title">Filters</h3>
        {hasActiveFilters && (
          <span className="filter-panel__active-count" data-testid={`${testId}-active-count`}>
            {Object.values(state.filters).filter(v =>
              Array.isArray(v) ? v.length > 0 : v !== undefined
            ).length} active
          </span>
        )}
      </div>

      <div className="filter-panel__header-actions">
        {showAdvanced && (
          <button
            type="button"
            onClick={handleToggleAdvanced}
            className={`filter-panel__toggle-advanced ${state.showAdvanced ? 'filter-panel__toggle-advanced--active' : ''}`}
            data-testid={`${testId}-toggle-advanced`}
            aria-label="Toggle advanced filters"
          >
            Advanced
          </button>
        )}

        {isCollapsible && (
          <button
            type="button"
            onClick={handleToggleExpanded}
            className="filter-panel__toggle-expand"
            data-testid={`${testId}-toggle-expand`}
            aria-label={state.isExpanded ? 'Collapse filters' : 'Expand filters'}
            aria-expanded={state.isExpanded}
          >
            {state.isExpanded ? '▲' : '▼'}
          </button>
        )}
      </div>
    </div>
  );

  const renderPresets = () => {
    if (!showPresets || !state.isExpanded) return null;

    return (
      <div className="filter-panel__presets" data-testid={`${testId}-presets`}>
        <div className="filter-panel__presets-header">
          <span className="filter-panel__presets-title">Quick Filters</span>
        </div>

        <div className="filter-panel__presets-list">
          {availablePresets.map(preset => (
            <div
              key={preset.id}
              className={`filter-panel__preset ${
                state.activePreset === preset.id ? 'filter-panel__preset--active' : ''
              }`}
            >
              <button
                type="button"
                onClick={() => handlePresetSelect(preset.id)}
                className="filter-panel__preset-button"
                data-testid={`${testId}-preset-${preset.id}`}
              >
                <span className="filter-panel__preset-name">{preset.name}</span>
              </button>
              {!preset.isDefault && showSaveLoad && (
                <button
                  type="button"
                  onClick={() => handlePresetDelete(preset.id)}
                  className="filter-panel__preset-delete"
                  data-testid={`${testId}-preset-delete-${preset.id}`}
                  aria-label={`Delete preset ${preset.name}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStatusFilters = () => (
    <div className="filter-panel__group" data-testid={`${testId}-status-group`}>
      <label className="filter-panel__group-label">Status</label>
      <div className="filter-panel__checkbox-list">
        {STATUS_OPTIONS.map(option => (
          <label key={option.value} className="filter-panel__checkbox-item">
            <input
              type="checkbox"
              checked={state.filters.status?.includes(option.value) || false}
              onChange={(e) => handleStatusChange(option.value, e.target.checked)}
              className="filter-panel__checkbox"
              data-testid={`${testId}-status-${option.value.toLowerCase()}`}
            />
            <span
              className="filter-panel__checkbox-label"
              style={{ '--status-color': option.color } as React.CSSProperties}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderPriorityFilters = () => (
    <div className="filter-panel__group" data-testid={`${testId}-priority-group`}>
      <label className="filter-panel__group-label">Priority</label>
      <div className="filter-panel__checkbox-list">
        {PRIORITY_OPTIONS.map(option => (
          <label key={option.value} className="filter-panel__checkbox-item">
            <input
              type="checkbox"
              checked={state.filters.priority?.includes(option.value) || false}
              onChange={(e) => handlePriorityChange(option.value, e.target.checked)}
              className="filter-panel__checkbox"
              data-testid={`${testId}-priority-${option.value.toLowerCase()}`}
            />
            <span
              className="filter-panel__checkbox-label"
              style={{ '--priority-color': option.color } as React.CSSProperties}
            >
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );

  const renderCategoryFilters = () => {
    if (categories.length === 0) return null;

    return (
      <div className="filter-panel__group" data-testid={`${testId}-category-group`}>
        <label className="filter-panel__group-label">Categories</label>
        <div className="filter-panel__checkbox-list">
          {categories.map(category => (
            <label key={category.id} className="filter-panel__checkbox-item">
              <input
                type="checkbox"
                checked={state.filters.categoryIds?.includes(category.id) || false}
                onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                className="filter-panel__checkbox"
                data-testid={`${testId}-category-${category.id}`}
              />
              <span
                className="filter-panel__checkbox-label"
                style={{ '--category-color': category.color } as React.CSSProperties}
              >
                {category.name}
                {category.count !== undefined && (
                  <span className="filter-panel__checkbox-count">({category.count})</span>
                )}
              </span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderDateRangeFilters = () => (
    <div className="filter-panel__group" data-testid={`${testId}-date-group`}>
      <label className="filter-panel__group-label">Date Range</label>
      <div className="filter-panel__radio-list">
        <label className="filter-panel__radio-item">
          <input
            type="radio"
            name="dateRange"
            checked={!state.filters.dateRange}
            onChange={() => handleDateRangeChange(undefined as any)}
            className="filter-panel__radio"
            data-testid={`${testId}-date-all`}
          />
          <span className="filter-panel__radio-label">All Dates</span>
        </label>

        {DATE_RANGE_OPTIONS.map(option => (
          <label key={option.value} className="filter-panel__radio-item">
            <input
              type="radio"
              name="dateRange"
              checked={state.filters.dateRange === option.value}
              onChange={() => handleDateRangeChange(option.value)}
              className="filter-panel__radio"
              data-testid={`${testId}-date-${option.value}`}
            />
            <span className="filter-panel__radio-label">{option.label}</span>
          </label>
        ))}
      </div>

      {isCustomDateRange && (
        <div className="filter-panel__custom-date" data-testid={`${testId}-custom-date`}>
          <div className="filter-panel__date-inputs">
            <div className="filter-panel__date-input">
              <label htmlFor={`${testId}-date-start`} className="filter-panel__date-label">
                Start Date
              </label>
              <input
                id={`${testId}-date-start`}
                type="date"
                value={state.filters.customDateStart?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleCustomDateChange('customDateStart', e.target.value ? new Date(e.target.value) : undefined)}
                className="filter-panel__date-field"
                data-testid={`${testId}-date-start-input`}
              />
            </div>

            <div className="filter-panel__date-input">
              <label htmlFor={`${testId}-date-end`} className="filter-panel__date-label">
                End Date
              </label>
              <input
                id={`${testId}-date-end`}
                type="date"
                value={state.filters.customDateEnd?.toISOString().split('T')[0] || ''}
                onChange={(e) => handleCustomDateChange('customDateEnd', e.target.value ? new Date(e.target.value) : undefined)}
                className="filter-panel__date-field"
                data-testid={`${testId}-date-end-input`}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAdvancedFilters = () => {
    if (!state.showAdvanced) return null;

    return (
      <div className="filter-panel__advanced" data-testid={`${testId}-advanced`}>
        <div className="filter-panel__group">
          <label className="filter-panel__group-label">Advanced Options</label>
          <div className="filter-panel__boolean-list">
            <label className="filter-panel__boolean-item">
              <select
                value={state.filters.isCompleted === undefined ? '' : state.filters.isCompleted.toString()}
                onChange={(e) => handleBooleanFilterChange('isCompleted', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="filter-panel__select"
                data-testid={`${testId}-is-completed`}
              >
                <option value="">All Tasks</option>
                <option value="true">Completed Only</option>
                <option value="false">Incomplete Only</option>
              </select>
              <span className="filter-panel__boolean-label">Completion Status</span>
            </label>

            <label className="filter-panel__boolean-item">
              <select
                value={state.filters.isOverdue === undefined ? '' : state.filters.isOverdue.toString()}
                onChange={(e) => handleBooleanFilterChange('isOverdue', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="filter-panel__select"
                data-testid={`${testId}-is-overdue`}
              >
                <option value="">All Tasks</option>
                <option value="true">Overdue Only</option>
                <option value="false">Not Overdue</option>
              </select>
              <span className="filter-panel__boolean-label">Due Status</span>
            </label>

            <label className="filter-panel__boolean-item">
              <select
                value={state.filters.hasCategories === undefined ? '' : state.filters.hasCategories.toString()}
                onChange={(e) => handleBooleanFilterChange('hasCategories', e.target.value === '' ? undefined : e.target.value === 'true')}
                className="filter-panel__select"
                data-testid={`${testId}-has-categories`}
              >
                <option value="">All Tasks</option>
                <option value="true">With Categories</option>
                <option value="false">Without Categories</option>
              </select>
              <span className="filter-panel__boolean-label">Category Status</span>
            </label>
          </div>
        </div>
      </div>
    );
  };

  const renderActions = () => (
    <div className="filter-panel__actions" data-testid={`${testId}-actions`}>
      <div className="filter-panel__action-group">
        <button
          type="button"
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className="filter-panel__action filter-panel__action--clear"
          data-testid={`${testId}-clear`}
        >
          Clear All
        </button>

        {onFiltersApply && (
          <button
            type="button"
            onClick={handleApplyFilters}
            className="filter-panel__action filter-panel__action--apply"
            data-testid={`${testId}-apply`}
          >
            Apply Filters
          </button>
        )}
      </div>

      {showSaveLoad && hasActiveFilters && (
        <div className="filter-panel__save-section">
          <input
            type="text"
            placeholder="Preset name..."
            className="filter-panel__save-input"
            data-testid={`${testId}-save-input`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                handlePresetSave(e.currentTarget.value.trim());
                e.currentTarget.value = '';
              }
            }}
          />
          <button
            type="button"
            onClick={(e) => {
              const input = e.currentTarget.previousElementSibling as HTMLInputElement;
              if (input?.value.trim()) {
                handlePresetSave(input.value.trim());
                input.value = '';
              }
            }}
            className="filter-panel__action filter-panel__action--save"
            data-testid={`${testId}-save`}
          >
            Save Preset
          </button>
        </div>
      )}
    </div>
  );

  // ===================================
  // Main Render
  // ===================================

  return (
    <div
      className={`filter-panel ${className}`}
      data-testid={testId}
    >
      {renderHeader()}

      {state.isExpanded && (
        <div className="filter-panel__content">
          {renderPresets()}

          <div className="filter-panel__filters">
            {renderStatusFilters()}
            {renderPriorityFilters()}
            {renderCategoryFilters()}
            {renderDateRangeFilters()}
            {renderAdvancedFilters()}
          </div>

          {renderActions()}
        </div>
      )}
    </div>
  );
};

// Set display name for debugging
FilterPanel.displayName = 'FilterPanel';

// ===================================
// Export Default Component
// ===================================

export default FilterPanel;
