/**
 * ===================================
 * Search Bar Component Implementation
 * ===================================
 * Purpose: Advanced task search functionality with real-time search and history
 * Features:
 * - Real-time search with debouncing
 * - Search history management
 * - Advanced search options
 * - Keyboard shortcuts support
 * - Accessibility compliance
 * Author: Process Engineering Approach
 * Version: 1.0.0
 * STEP 2 Design: F-003-01
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';

// ===================================
// Search Bar Types and Interfaces
// ===================================

/**
 * Search options interface
 */
export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  includeDescription?: boolean;
  includeCategories?: boolean;
}

/**
 * Search history item interface
 */
export interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: Date;
  resultCount?: number;
}

/**
 * Search result interface
 */
export interface SearchResult {
  query: string;
  resultCount: number;
  executionTime: number;
}

/**
 * Search bar props interface
 */
export interface SearchBarProps {
  onSearch: (query: string, options?: SearchOptions) => void;
  onSearchResult?: (result: SearchResult) => void;
  placeholder?: string;
  initialValue?: string;
  initialOptions?: SearchOptions;
  showAdvancedOptions?: boolean;
  showHistory?: boolean;
  maxHistoryItems?: number;
  debounceMs?: number;
  minQueryLength?: number;
  className?: string;
  testId?: string;
}

/**
 * Search bar state interface
 */
export interface SearchBarState {
  query: string;
  options: SearchOptions;
  history: SearchHistoryItem[];
  showHistory: boolean;
  showOptions: boolean;
  isSearching: boolean;
  lastSearchTime: number | null;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_OPTIONS: SearchOptions = {
  caseSensitive: false,
  wholeWord: false,
  regex: false,
  includeDescription: true,
  includeCategories: true
};

const DEFAULT_PROPS = {
  placeholder: 'Search tasks...',
  showAdvancedOptions: true,
  showHistory: true,
  maxHistoryItems: 10,
  debounceMs: 300,
  minQueryLength: 1
};

// ===================================
// Utility Functions
// ===================================

/**
 * Generate unique ID for search history items
 */
const generateSearchId = (): string => {
  return `search_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

/**
 * Load search history from localStorage
 */
const loadSearchHistory = (maxItems: number): SearchHistoryItem[] => {
  try {
    const stored = localStorage.getItem('taskSearchHistory');
    if (!stored) return [];
    
    const history = JSON.parse(stored) as SearchHistoryItem[];
    return history
      .map(item => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }))
      .slice(0, maxItems);
  } catch {
    return [];
  }
};

/**
 * Save search history to localStorage
 */
const saveSearchHistory = (history: SearchHistoryItem[]): void => {
  try {
    localStorage.setItem('taskSearchHistory', JSON.stringify(history));
  } catch {
    // Ignore localStorage errors
  }
};

/**
 * Add item to search history
 */
const addToHistory = (
  history: SearchHistoryItem[],
  query: string,
  maxItems: number,
  resultCount?: number
): SearchHistoryItem[] => {
  if (!query.trim()) return history;
  
  // Remove existing entry with same query
  const filtered = history.filter(item => item.query !== query);
  
  // Add new entry at the beginning
  const newItem: SearchHistoryItem = {
    id: generateSearchId(),
    query: query.trim(),
    timestamp: new Date(),
    resultCount
  };
  
  const updated = [newItem, ...filtered].slice(0, maxItems);
  saveSearchHistory(updated);
  
  return updated;
};

// ===================================
// Main Search Bar Component
// ===================================

/**
 * Search Bar Component
 * 
 * Provides advanced search functionality with real-time search, history, and options.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSearchResult,
  placeholder = DEFAULT_PROPS.placeholder,
  initialValue = '',
  initialOptions = {},
  showAdvancedOptions = DEFAULT_PROPS.showAdvancedOptions,
  showHistory = DEFAULT_PROPS.showHistory,
  maxHistoryItems = DEFAULT_PROPS.maxHistoryItems,
  debounceMs = DEFAULT_PROPS.debounceMs,
  minQueryLength = DEFAULT_PROPS.minQueryLength,
  className = '',
  testId = 'search-bar'
}) => {
  // ===================================
  // Refs
  // ===================================

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const searchStartTimeRef = useRef<number | null>(null);

  // ===================================
  // State Management
  // ===================================

  const [state, setState] = useState<SearchBarState>({
    query: initialValue,
    options: { ...DEFAULT_OPTIONS, ...initialOptions },
    history: loadSearchHistory(maxHistoryItems),
    showHistory: false,
    showOptions: false,
    isSearching: false,
    lastSearchTime: null
  });

  // ===================================
  // Computed Properties
  // ===================================

  const canSearch = useMemo(() => {
    return state.query.length >= minQueryLength;
  }, [state.query.length, minQueryLength]);

  const filteredHistory = useMemo(() => {
    if (!state.query.trim()) return state.history;
    
    return state.history.filter(item =>
      item.query.toLowerCase().includes(state.query.toLowerCase())
    );
  }, [state.history, state.query]);

  // ===================================
  // Search Execution
  // ===================================

  const executeSearch = useCallback((query: string, options: SearchOptions) => {
    if (!canSearch) return;

    searchStartTimeRef.current = Date.now();
    setState(prev => ({ ...prev, isSearching: true }));

    // Execute search
    onSearch(query, options);

    // Simulate search completion for demo purposes
    // In real implementation, this would be handled by the parent component
    setTimeout(() => {
      const executionTime = searchStartTimeRef.current 
        ? Date.now() - searchStartTimeRef.current 
        : 0;
      
      const result: SearchResult = {
        query,
        resultCount: Math.floor(Math.random() * 50), // Mock result count
        executionTime
      };

      setState(prev => ({
        ...prev,
        isSearching: false,
        lastSearchTime: Date.now(),
        history: addToHistory(prev.history, query, maxHistoryItems, result.resultCount)
      }));

      if (onSearchResult) {
        onSearchResult(result);
      }
    }, 100);
  }, [canSearch, onSearch, onSearchResult, maxHistoryItems]);

  const debouncedSearch = useCallback((query: string, options: SearchOptions) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      executeSearch(query, options);
    }, debounceMs);
  }, [executeSearch, debounceMs]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    
    setState(prev => ({
      ...prev,
      query,
      showHistory: query.length > 0 && showHistory
    }));

    if (query.length >= minQueryLength) {
      debouncedSearch(query, state.options);
    } else if (query.length === 0) {
      // Clear search when query is empty
      onSearch('', state.options);
    }
  }, [debouncedSearch, state.options, onSearch, minQueryLength, showHistory]);

  const handleInputKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'Enter':
        event.preventDefault();
        if (canSearch) {
          executeSearch(state.query, state.options);
        }
        break;
      
      case 'Escape':
        setState(prev => ({
          ...prev,
          showHistory: false,
          showOptions: false
        }));
        break;
      
      case 'ArrowDown':
        if (state.showHistory && filteredHistory.length > 0) {
          event.preventDefault();
          // Focus first history item (would need additional implementation)
        }
        break;
    }
  }, [canSearch, executeSearch, state.query, state.options, state.showHistory, filteredHistory.length]);

  const handleInputFocus = useCallback(() => {
    if (showHistory && state.query.length > 0) {
      setState(prev => ({ ...prev, showHistory: true }));
    }
  }, [showHistory, state.query.length]);

  const handleInputBlur = useCallback(() => {
    // Delay hiding to allow clicking on history items
    setTimeout(() => {
      setState(prev => ({ ...prev, showHistory: false }));
    }, 150);
  }, []);

  const handleHistoryItemClick = useCallback((item: SearchHistoryItem) => {
    setState(prev => ({
      ...prev,
      query: item.query,
      showHistory: false
    }));
    
    executeSearch(item.query, state.options);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [executeSearch, state.options]);

  const handleClearClick = useCallback(() => {
    setState(prev => ({
      ...prev,
      query: '',
      showHistory: false
    }));
    
    onSearch('', state.options);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [onSearch, state.options]);

  const handleOptionsToggle = useCallback(() => {
    setState(prev => ({ ...prev, showOptions: !prev.showOptions }));
  }, []);

  const handleOptionChange = useCallback((option: keyof SearchOptions, value: boolean) => {
    setState(prev => {
      const newOptions = { ...prev.options, [option]: value };
      
      // Re-search with new options if there's a query
      if (prev.query.length >= minQueryLength) {
        debouncedSearch(prev.query, newOptions);
      }
      
      return {
        ...prev,
        options: newOptions
      };
    });
  }, [debouncedSearch, minQueryLength]);

  // ===================================
  // Cleanup
  // ===================================

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // ===================================
  // Render Methods
  // ===================================

  const renderSearchInput = () => (
    <div className="search-bar__input-container">
      <input
        ref={inputRef}
        type="text"
        value={state.query}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        onFocus={handleInputFocus}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className="search-bar__input"
        data-testid={`${testId}-input`}
        aria-label="Search tasks"
        aria-expanded={state.showHistory}
        aria-haspopup="listbox"
        autoComplete="off"
      />

      <div className="search-bar__input-actions">
        {state.isSearching && (
          <div className="search-bar__spinner" data-testid={`${testId}-spinner`}>
            <span className="search-bar__spinner-icon">⟳</span>
          </div>
        )}

        {state.query && !state.isSearching && (
          <button
            type="button"
            onClick={handleClearClick}
            className="search-bar__clear"
            data-testid={`${testId}-clear`}
            aria-label="Clear search"
          >
            ✕
          </button>
        )}

        {showAdvancedOptions && (
          <button
            type="button"
            onClick={handleOptionsToggle}
            className={`search-bar__options-toggle ${state.showOptions ? 'search-bar__options-toggle--active' : ''}`}
            data-testid={`${testId}-options-toggle`}
            aria-label="Toggle search options"
            aria-expanded={state.showOptions}
          >
            ⚙
          </button>
        )}
      </div>
    </div>
  );

  const renderSearchHistory = () => {
    if (!state.showHistory || filteredHistory.length === 0) {
      return null;
    }

    return (
      <div className="search-bar__history" data-testid={`${testId}-history`}>
        <div className="search-bar__history-header">
          <span className="search-bar__history-title">Recent searches</span>
        </div>

        <ul className="search-bar__history-list" role="listbox">
          {filteredHistory.map((item) => (
            <li key={item.id} className="search-bar__history-item" role="option">
              <button
                type="button"
                onClick={() => handleHistoryItemClick(item)}
                className="search-bar__history-button"
                data-testid={`${testId}-history-item`}
              >
                <span className="search-bar__history-query">{item.query}</span>
                {item.resultCount !== undefined && (
                  <span className="search-bar__history-count">
                    {item.resultCount} results
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const renderSearchOptions = () => {
    if (!state.showOptions) {
      return null;
    }

    return (
      <div className="search-bar__options" data-testid={`${testId}-options`}>
        <div className="search-bar__options-header">
          <span className="search-bar__options-title">Search Options</span>
        </div>

        <div className="search-bar__options-content">
          <label className="search-bar__option">
            <input
              type="checkbox"
              checked={state.options.caseSensitive}
              onChange={(e) => handleOptionChange('caseSensitive', e.target.checked)}
              className="search-bar__option-checkbox"
              data-testid={`${testId}-option-case-sensitive`}
            />
            <span className="search-bar__option-label">Case sensitive</span>
          </label>

          <label className="search-bar__option">
            <input
              type="checkbox"
              checked={state.options.wholeWord}
              onChange={(e) => handleOptionChange('wholeWord', e.target.checked)}
              className="search-bar__option-checkbox"
              data-testid={`${testId}-option-whole-word`}
            />
            <span className="search-bar__option-label">Whole word</span>
          </label>

          <label className="search-bar__option">
            <input
              type="checkbox"
              checked={state.options.regex}
              onChange={(e) => handleOptionChange('regex', e.target.checked)}
              className="search-bar__option-checkbox"
              data-testid={`${testId}-option-regex`}
            />
            <span className="search-bar__option-label">Regular expression</span>
          </label>

          <label className="search-bar__option">
            <input
              type="checkbox"
              checked={state.options.includeDescription}
              onChange={(e) => handleOptionChange('includeDescription', e.target.checked)}
              className="search-bar__option-checkbox"
              data-testid={`${testId}-option-include-description`}
            />
            <span className="search-bar__option-label">Include description</span>
          </label>

          <label className="search-bar__option">
            <input
              type="checkbox"
              checked={state.options.includeCategories}
              onChange={(e) => handleOptionChange('includeCategories', e.target.checked)}
              className="search-bar__option-checkbox"
              data-testid={`${testId}-option-include-categories`}
            />
            <span className="search-bar__option-label">Include categories</span>
          </label>
        </div>
      </div>
    );
  };

  // ===================================
  // Main Render
  // ===================================

  return (
    <div
      className={`search-bar ${className}`}
      data-testid={testId}
    >
      <div className="search-bar__container">
        {renderSearchInput()}
        {renderSearchHistory()}
        {renderSearchOptions()}
      </div>
    </div>
  );
};

// Set display name for debugging
SearchBar.displayName = 'SearchBar';

// ===================================
// Export Default Component
// ===================================

export default SearchBar;
