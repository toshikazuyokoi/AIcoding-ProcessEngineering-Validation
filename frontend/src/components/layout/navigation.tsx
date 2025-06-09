/**
 * Navigation Component
 * 
 * Reusable navigation component for application menus.
 * Supports responsive design, accessibility, and customizable navigation items.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState, useCallback, useMemo } from 'react';

// ===================================
// Navigation Types and Interfaces
// ===================================

/**
 * Navigation item interface
 */
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
  ariaLabel?: string;
}

/**
 * Navigation props interface
 */
export interface NavigationProps {
  items: NavigationItem[];
  activeItem?: string;
  orientation?: 'horizontal' | 'vertical';
  collapsed?: boolean;
  className?: string;
  testId?: string;
  onItemClick?: (item: NavigationItem) => void;
  onItemHover?: (item: NavigationItem | null) => void;
}

/**
 * Navigation state interface
 */
interface NavigationState {
  hoveredItem: string | null;
  expandedItems: Set<string>;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_PROPS: Partial<NavigationProps> = {
  orientation: 'vertical',
  collapsed: false,
  className: '',
  testId: 'navigation'
};

// ===================================
// Navigation Item Component
// ===================================

interface NavigationItemComponentProps {
  item: NavigationItem;
  isActive: boolean;
  isCollapsed: boolean;
  isHovered: boolean;
  isExpanded: boolean;
  orientation: 'horizontal' | 'vertical';
  onItemClick: (item: NavigationItem) => void;
  onItemHover: (item: NavigationItem | null) => void;
  onToggleExpanded: (itemId: string) => void;
}

const NavigationItemComponent: React.FC<NavigationItemComponentProps> = React.memo(({
  item,
  isActive,
  isCollapsed,
  isHovered,
  isExpanded,
  orientation,
  onItemClick,
  onItemHover,
  onToggleExpanded
}) => {
  const hasChildren = item.children && item.children.length > 0;
  const showText = !isCollapsed || orientation === 'horizontal';
  const showBadge = item.badge && showText;

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    if (item.disabled) {
      return;
    }

    if (hasChildren) {
      onToggleExpanded(item.id);
    } else {
      onItemClick(item);
    }
  }, [item, hasChildren, onItemClick, onToggleExpanded]);

  const handleMouseEnter = useCallback(() => {
    onItemHover(item);
  }, [item, onItemHover]);

  const handleMouseLeave = useCallback(() => {
    onItemHover(null);
  }, [onItemHover]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e as any);
    }
  }, [handleClick]);

  const itemClasses = [
    'navigation__item',
    isActive && 'navigation__item--active',
    isHovered && 'navigation__item--hovered',
    item.disabled && 'navigation__item--disabled',
    hasChildren && 'navigation__item--has-children',
    isExpanded && 'navigation__item--expanded'
  ].filter(Boolean).join(' ');

  const linkClasses = [
    'navigation__link',
    isCollapsed && 'navigation__link--collapsed'
  ].filter(Boolean).join(' ');

  return (
    <li className={itemClasses}>
      <a
        href={item.href}
        className={linkClasses}
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onKeyDown={handleKeyDown}
        aria-label={item.ariaLabel || item.label}
        aria-current={isActive ? 'page' : undefined}
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-disabled={item.disabled ? 'true' : 'false'}
        tabIndex={item.disabled ? -1 : 0}
        role="menuitem"
      >
        {item.icon && (
          <span 
            className="navigation__icon"
            aria-hidden="true"
          >
            {item.icon}
          </span>
        )}
        
        {showText && (
          <span className="navigation__text">
            {item.label}
          </span>
        )}
        
        {showBadge && (
          <span 
            className="navigation__badge"
            aria-label={`${item.badge} notifications`}
          >
            {item.badge}
          </span>
        )}
        
        {hasChildren && (
          <span 
            className="navigation__arrow"
            aria-hidden="true"
          >
            {isExpanded ? '▼' : '▶'}
          </span>
        )}
      </a>
      
      {hasChildren && isExpanded && (
        <ul 
          className="navigation__submenu"
          role="menu"
          aria-label={`${item.label} submenu`}
        >
          {item.children!.map(child => (
            <NavigationItemComponent
              key={child.id}
              item={child}
              isActive={child.id === item.id}
              isCollapsed={false}
              isHovered={false}
              isExpanded={false}
              orientation={orientation}
              onItemClick={onItemClick}
              onItemHover={onItemHover}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </ul>
      )}
    </li>
  );
});

NavigationItemComponent.displayName = 'NavigationItemComponent';

// ===================================
// Main Navigation Component
// ===================================

/**
 * Navigation Component
 * 
 * Flexible navigation component supporting various layouts and interactions.
 */
export const Navigation: React.FC<NavigationProps> = ({
  items,
  activeItem,
  orientation = DEFAULT_PROPS.orientation!,
  collapsed = DEFAULT_PROPS.collapsed!,
  className = DEFAULT_PROPS.className!,
  testId = DEFAULT_PROPS.testId!,
  onItemClick,
  onItemHover
}) => {
  // ===================================
  // State Management
  // ===================================

  const [state, setState] = useState<NavigationState>({
    hoveredItem: null,
    expandedItems: new Set()
  });

  // ===================================
  // Event Handlers
  // ===================================

  const handleItemClick = useCallback((item: NavigationItem) => {
    onItemClick?.(item);
  }, [onItemClick]);

  const handleItemHover = useCallback((item: NavigationItem | null) => {
    setState(prev => ({
      ...prev,
      hoveredItem: item?.id || null
    }));
    onItemHover?.(item);
  }, [onItemHover]);

  const handleToggleExpanded = useCallback((itemId: string) => {
    setState(prev => {
      const newExpandedItems = new Set(prev.expandedItems);
      if (newExpandedItems.has(itemId)) {
        newExpandedItems.delete(itemId);
      } else {
        newExpandedItems.add(itemId);
      }
      return {
        ...prev,
        expandedItems: newExpandedItems
      };
    });
  }, []);

  // ===================================
  // Computed Values
  // ===================================

  const navigationClasses = useMemo(() => [
    'navigation',
    `navigation--${orientation}`,
    collapsed && 'navigation--collapsed',
    className
  ].filter(Boolean).join(' '), [orientation, collapsed, className]);

  // ===================================
  // Render
  // ===================================

  return (
    <nav
      className={navigationClasses}
      role="navigation"
      aria-label="Main navigation"
      data-testid={testId}
    >
      <ul 
        className="navigation__menu"
        role="menubar"
        aria-orientation={orientation}
      >
        {items.map(item => (
          <NavigationItemComponent
            key={item.id}
            item={item}
            isActive={item.id === activeItem}
            isCollapsed={collapsed}
            isHovered={state.hoveredItem === item.id}
            isExpanded={state.expandedItems.has(item.id)}
            orientation={orientation}
            onItemClick={handleItemClick}
            onItemHover={handleItemHover}
            onToggleExpanded={handleToggleExpanded}
          />
        ))}
      </ul>
    </nav>
  );
};

// Set display name for debugging
Navigation.displayName = 'Navigation';

// ===================================
// Export Default Component
// ===================================

export default Navigation;
