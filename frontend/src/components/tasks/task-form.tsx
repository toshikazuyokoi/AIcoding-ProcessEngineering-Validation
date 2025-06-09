/**
 * ===================================
 * Task Form Component Implementation
 * ===================================
 * Purpose: Comprehensive task creation and editing form
 * Features:
 * - Create and edit modes
 * - Real-time validation
 * - Form state management
 * - Error handling
 * - Accessibility support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';

// ===================================
// Task Form Types and Interfaces
// ===================================

/**
 * Task priority enum
 */
export type TaskPriority = 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Task status enum
 */
export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
}

/**
 * Task interface
 */
export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categories: Category[];
}

/**
 * Task form data interface
 */
export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string | null;
  categoryIds: string[];
}

/**
 * Task form validation errors interface
 */
export interface TaskFormErrors {
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  categoryIds?: string;
  general?: string;
}

/**
 * Task form props interface
 */
export interface TaskFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<Task>;
  categories?: Category[];
  onSubmit: (taskData: TaskFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
  testId?: string;
}

/**
 * Task form configuration interface
 */
export interface TaskFormConfig {
  enableRealTimeValidation?: boolean;
  enableAutoSave?: boolean;
  showCategorySelection?: boolean;
  showDueDatePicker?: boolean;
  maxTitleLength?: number;
  maxDescriptionLength?: number;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_CONFIG: Required<TaskFormConfig> = {
  enableRealTimeValidation: true,
  enableAutoSave: false,
  showCategorySelection: true,
  showDueDatePicker: true,
  maxTitleLength: 100,
  maxDescriptionLength: 1000
};

const DEFAULT_FORM_DATA: TaskFormData = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: null,
  categoryIds: []
};

// ===================================
// Validation Functions
// ===================================

/**
 * Validate task title
 */
const validateTitle = (title: string, maxLength: number = 100): string | undefined => {
  if (!title || title.trim().length === 0) {
    return 'Title is required';
  }
  
  if (title.trim().length > maxLength) {
    return `Title must not exceed ${maxLength} characters`;
  }
  
  // Check for forbidden characters
  const forbiddenPattern = /[<>{}[\]\\]/;
  if (forbiddenPattern.test(title)) {
    return 'Title contains invalid characters';
  }
  
  return undefined;
};

/**
 * Validate task description
 */
const validateDescription = (description: string, maxLength: number = 1000): string | undefined => {
  if (description && description.length > maxLength) {
    return `Description must not exceed ${maxLength} characters`;
  }
  
  return undefined;
};

/**
 * Validate due date
 */
const validateDueDate = (dueDate: string | null): string | undefined => {
  if (!dueDate) {
    return undefined; // Due date is optional
  }
  
  const date = new Date(dueDate);
  const now = new Date();
  
  if (isNaN(date.getTime())) {
    return 'Invalid date format';
  }
  
  // Check if date is in the past (allow today)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (selectedDate < today) {
    return 'Due date cannot be in the past';
  }
  
  // Check if date is too far in the future (max 2 years)
  const maxDate = new Date();
  maxDate.setFullYear(maxDate.getFullYear() + 2);
  
  if (date > maxDate) {
    return 'Due date cannot be more than 2 years in the future';
  }
  
  return undefined;
};

/**
 * Validate priority
 */
const validatePriority = (priority: TaskPriority): string | undefined => {
  const validPriorities: TaskPriority[] = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];
  
  if (!validPriorities.includes(priority)) {
    return 'Invalid priority selected';
  }
  
  return undefined;
};

/**
 * Validate category IDs
 */
const validateCategoryIds = (categoryIds: string[], availableCategories: Category[] = []): string | undefined => {
  if (categoryIds.length === 0) {
    return undefined; // Categories are optional
  }
  
  // Check if all selected categories exist
  const availableIds = availableCategories.map(cat => cat.id);
  const invalidIds = categoryIds.filter(id => !availableIds.includes(id));
  
  if (invalidIds.length > 0) {
    return 'Some selected categories are invalid';
  }
  
  // Limit number of categories
  if (categoryIds.length > 5) {
    return 'Maximum 5 categories can be selected';
  }
  
  return undefined;
};

/**
 * Validate entire form
 */
const validateForm = (
  formData: TaskFormData, 
  config: Required<TaskFormConfig>,
  availableCategories: Category[] = []
): TaskFormErrors => {
  const errors: TaskFormErrors = {};
  
  const titleError = validateTitle(formData.title, config.maxTitleLength);
  if (titleError) errors.title = titleError;
  
  const descriptionError = validateDescription(formData.description, config.maxDescriptionLength);
  if (descriptionError) errors.description = descriptionError;
  
  const dueDateError = validateDueDate(formData.dueDate);
  if (dueDateError) errors.dueDate = dueDateError;
  
  const priorityError = validatePriority(formData.priority);
  if (priorityError) errors.priority = priorityError;
  
  const categoryError = validateCategoryIds(formData.categoryIds, availableCategories);
  if (categoryError) errors.categoryIds = categoryError;
  
  return errors;
};

// ===================================
// Main Task Form Component
// ===================================

/**
 * Task Form Component
 * 
 * Comprehensive form for creating and editing tasks with validation and error handling.
 */
export const TaskForm: React.FC<TaskFormProps> = ({
  mode,
  initialData,
  categories = [],
  onSubmit,
  onCancel,
  loading = false,
  className = '',
  testId = 'task-form'
}) => {
  // ===================================
  // Configuration and Dependencies
  // ===================================

  const config = useMemo(() => DEFAULT_CONFIG, []);
  const { user, isAuthenticated } = useAuth();

  // ===================================
  // State Management
  // ===================================

  const [formData, setFormData] = useState<TaskFormData>(() => {
    if (mode === 'edit' && initialData) {
      return {
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        dueDate: initialData.dueDate || null,
        categoryIds: initialData.categories?.map(cat => cat.id) || []
      };
    }
    return { ...DEFAULT_FORM_DATA };
  });

  const [errors, setErrors] = useState<TaskFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [touched, setTouched] = useState<Record<keyof TaskFormData, boolean>>({
    title: false,
    description: false,
    priority: false,
    dueDate: false,
    categoryIds: false
  });
  const [forceValidation, setForceValidation] = useState(false);

  // ===================================
  // Computed Properties
  // ===================================

  const isValid = useMemo(() => {
    const currentErrors = validateForm(formData, config, categories);
    return Object.keys(currentErrors).length === 0;
  }, [formData, config, categories]);

  const hasErrors = useMemo(() => {
    return Object.keys(errors).length > 0;
  }, [errors]);

  const canSubmit = useMemo(() => {
    return isValid && isDirty && !isSubmitting && !loading;
  }, [isValid, isDirty, isSubmitting, loading]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleFieldChange = useCallback((field: keyof TaskFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    setIsDirty(true);
    
    // Mark field as touched
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
    
    // Real-time validation
    if (config.enableRealTimeValidation && touched[field]) {
      const newErrors = validateForm({ ...formData, [field]: value }, config, categories);
      setErrors(prev => ({
        ...prev,
        [field]: newErrors[field]
      }));
    }
  }, [formData, config, categories, touched]);

  const handleTitleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    handleFieldChange('title', event.target.value);
  }, [handleFieldChange]);

  const handleDescriptionChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleFieldChange('description', event.target.value);
  }, [handleFieldChange]);

  const handlePriorityChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    handleFieldChange('priority', event.target.value as TaskPriority);
  }, [handleFieldChange]);

  const handleDueDateChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value || null;
    handleFieldChange('dueDate', value);
  }, [handleFieldChange]);

  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    const newCategoryIds = checked
      ? [...formData.categoryIds, categoryId]
      : formData.categoryIds.filter(id => id !== categoryId);
    
    handleFieldChange('categoryIds', newCategoryIds);
  }, [formData.categoryIds, handleFieldChange]);

  const handleBlur = useCallback((field: keyof TaskFormData) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate on blur
    const newErrors = validateForm(formData, config, categories);
    setErrors(prev => ({
      ...prev,
      [field]: newErrors[field]
    }));
  }, [formData, config, categories]);

  const handleSubmit = useCallback(async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || loading) {
      return;
    }

    // Validate entire form
    const formErrors = validateForm(formData, config, categories);

    // Mark all fields as touched and set errors synchronously
    const newTouched = {
      title: true,
      description: true,
      priority: true,
      dueDate: true,
      categoryIds: true
    };

    setTouched(newTouched);
    setErrors(formErrors);
    setForceValidation(true);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form on successful submission (for create mode)
      if (mode === 'create') {
        setFormData({ ...DEFAULT_FORM_DATA });
        setIsDirty(false);
        setTouched({
          title: false,
          description: false,
          priority: false,
          dueDate: false,
          categoryIds: false
        });
        setErrors({});
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        general: error instanceof Error ? error.message : 'An error occurred while saving the task'
      }));
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, config, categories, onSubmit, mode, isSubmitting, loading]);

  const handleCancel = useCallback(() => {
    if (isDirty) {
      const confirmCancel = window.confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) {
        return;
      }
    }

    onCancel();
  }, [isDirty, onCancel]);

  const handleReset = useCallback(() => {
    const confirmReset = window.confirm('Are you sure you want to reset the form?');
    if (!confirmReset) {
      return;
    }

    if (mode === 'edit' && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        priority: initialData.priority || 'MEDIUM',
        dueDate: initialData.dueDate || null,
        categoryIds: initialData.categories?.map(cat => cat.id) || []
      });
    } else {
      setFormData({ ...DEFAULT_FORM_DATA });
    }

    setErrors({});
    setIsDirty(false);
    setTouched({
      title: false,
      description: false,
      priority: false,
      dueDate: false,
      categoryIds: false
    });
  }, [mode, initialData]);

  // ===================================
  // Effects
  // ===================================

  useEffect(() => {
    // Clear general error when form data changes
    if (errors.general) {
      setErrors(prev => {
        const { general, ...rest } = prev;
        return rest;
      });
    }
  }, [formData, errors.general]);

  // ===================================
  // Render Methods
  // ===================================

  const renderFormField = (
    field: keyof TaskFormData,
    label: string,
    input: React.ReactNode,
    required: boolean = false,
    helpText?: string
  ) => {
    const fieldError = errors[field];
    const isFieldTouched = touched[field];
    const hasFieldError = fieldError && (isFieldTouched || forceValidation);

    return (
      <div className={`task-form__field ${hasFieldError ? 'task-form__field--error' : ''}`}>
        <label htmlFor={`task-form-${field}`} className="task-form__label">
          {label}
          {required && <span className="task-form__required" aria-label="required">*</span>}
        </label>
        {input}
        {helpText && (
          <div className="task-form__help-text" id={`task-form-${field}-help`}>
            {helpText}
          </div>
        )}
        {hasFieldError && (
          <div
            className="task-form__error-message"
            id={`task-form-${field}-error`}
            role="alert"
            aria-live="polite"
          >
            {fieldError}
          </div>
        )}
      </div>
    );
  };

  const renderTitleField = () => {
    return renderFormField(
      'title',
      'Title',
      <input
        id="task-form-title"
        type="text"
        value={formData.title}
        onChange={handleTitleChange}
        onBlur={() => handleBlur('title')}
        className="task-form__input"
        placeholder="Enter task title..."
        maxLength={config.maxTitleLength}
        required
        aria-describedby={`task-form-title-help ${errors.title && touched.title ? 'task-form-title-error' : ''}`}
        aria-invalid={!!(errors.title && touched.title)}
      />,
      true,
      `Maximum ${config.maxTitleLength} characters`
    );
  };

  const renderDescriptionField = () => {
    return renderFormField(
      'description',
      'Description',
      <textarea
        id="task-form-description"
        value={formData.description}
        onChange={handleDescriptionChange}
        onBlur={() => handleBlur('description')}
        className="task-form__textarea"
        placeholder="Enter task description..."
        maxLength={config.maxDescriptionLength}
        rows={4}
        aria-describedby={`task-form-description-help ${errors.description && touched.description ? 'task-form-description-error' : ''}`}
        aria-invalid={!!(errors.description && touched.description)}
      />,
      false,
      `Maximum ${config.maxDescriptionLength} characters. ${config.maxDescriptionLength - formData.description.length} remaining.`
    );
  };

  const renderPriorityField = () => {
    return renderFormField(
      'priority',
      'Priority',
      <select
        id="task-form-priority"
        value={formData.priority}
        onChange={handlePriorityChange}
        onBlur={() => handleBlur('priority')}
        className="task-form__select"
        required
        aria-describedby={`task-form-priority-help ${errors.priority && touched.priority ? 'task-form-priority-error' : ''}`}
        aria-invalid={!!(errors.priority && touched.priority)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </select>,
      true,
      'Select the priority level for this task'
    );
  };

  const renderDueDateField = () => {
    if (!config.showDueDatePicker) {
      return null;
    }

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (dateString: string | null): string => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    return renderFormField(
      'dueDate',
      'Due Date',
      <input
        id="task-form-dueDate"
        type="date"
        value={formatDateForInput(formData.dueDate)}
        onChange={handleDueDateChange}
        onBlur={() => handleBlur('dueDate')}
        className="task-form__input"
        min={new Date().toISOString().split('T')[0]} // Today or later
        aria-describedby={`task-form-dueDate-help ${errors.dueDate && touched.dueDate ? 'task-form-dueDate-error' : ''}`}
        aria-invalid={!!(errors.dueDate && touched.dueDate)}
      />,
      false,
      'Optional: Set a due date for this task'
    );
  };

  const renderCategoryField = () => {
    if (!config.showCategorySelection || categories.length === 0) {
      return null;
    }

    return renderFormField(
      'categoryIds',
      'Categories',
      <fieldset className="task-form__checkbox-group" id="task-form-categoryIds">
        <legend className="task-form__legend sr-only">Select categories</legend>
        {categories.map(category => (
          <label
            key={category.id}
            className="task-form__checkbox-label"
            htmlFor={`task-form-category-${category.id}`}
          >
            <input
              id={`task-form-category-${category.id}`}
              type="checkbox"
              checked={formData.categoryIds.includes(category.id)}
              onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
              className="task-form__checkbox"
              aria-describedby="task-form-categoryIds-help"
            />
            <span
              className="task-form__category-indicator"
              style={{ backgroundColor: category.color }}
              aria-hidden="true"
            ></span>
            <span className="task-form__checkbox-text">{category.name}</span>
          </label>
        ))}
      </fieldset>,
      false,
      'Optional: Select categories for this task (maximum 5)'
    );
  };

  const renderFormActions = () => {
    return (
      <div className="task-form__actions">
        <button
          type="button"
          onClick={handleCancel}
          className="task-form__button task-form__button--secondary"
          disabled={isSubmitting || loading}
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleReset}
          className="task-form__button task-form__button--tertiary"
          disabled={!isDirty || isSubmitting || loading}
        >
          Reset
        </button>

        <button
          type="submit"
          className="task-form__button task-form__button--primary"
          disabled={!canSubmit}
          aria-describedby={hasErrors ? 'task-form-general-error' : undefined}
        >
          {isSubmitting || loading ? (
            <>
              <span className="task-form__spinner" aria-hidden="true"></span>
              {mode === 'create' ? 'Creating...' : 'Updating...'}
            </>
          ) : (
            mode === 'create' ? 'Create Task' : 'Update Task'
          )}
        </button>
      </div>
    );
  };

  // ===================================
  // Main Render
  // ===================================

  if (!isAuthenticated || !user) {
    return (
      <div className="task-form__auth-required" role="alert">
        <p>Please log in to create or edit tasks.</p>
      </div>
    );
  }

  return (
    <div
      className={`task-form ${className}`}
      data-testid={testId}
    >
      <div className="task-form__header">
        <h2 className="task-form__title">
          {mode === 'create' ? 'Create New Task' : 'Edit Task'}
        </h2>
        {mode === 'edit' && initialData && (
          <div className="task-form__subtitle">
            Editing: {initialData.title}
          </div>
        )}
      </div>

      {errors.general && (
        <div
          className="task-form__general-error"
          id="task-form-general-error"
          role="alert"
          aria-live="polite"
        >
          {errors.general}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="task-form__form"
        noValidate
      >
        <div className="task-form__fields">
          {renderTitleField()}
          {renderDescriptionField()}
          {renderPriorityField()}
          {renderDueDateField()}
          {renderCategoryField()}
        </div>

        {renderFormActions()}
      </form>

      {isDirty && (
        <div className="task-form__unsaved-notice" role="status" aria-live="polite">
          You have unsaved changes
        </div>
      )}
    </div>
  );
};

// ===================================
// Export Default Component
// ===================================

export default TaskForm;
