/**
 * Navigation Component Tests
 * 
 * Comprehensive test suite for Navigation component using staged quality improvement approach.
 * Tests cover basic rendering, functionality, responsive behavior, user interactions, and edge cases.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation, NavigationProps, NavigationItem } from '../navigation';

// ===================================
// Test Data and Fixtures
// ===================================

const mockNavigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    href: '/dashboard',
    icon: '📊',
    ariaLabel: 'Dashboard page'
  },
  {
    id: 'tasks',
    label: 'Tasks',
    href: '/tasks',
    icon: '📝',
    badge: 5,
    ariaLabel: 'Tasks page'
  },
  {
    id: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: '👤',
    ariaLabel: 'Profile page'
  },
  {
    id: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: '⚙️',
    disabled: true,
    ariaLabel: 'Settings page'
  },
  {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: '🔧',
    children: [
      {
        id: 'users',
        label: 'Users',
        href: '/admin/users',
        icon: '👥',
        ariaLabel: 'User management'
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/admin/reports',
        icon: '📊',
        ariaLabel: 'Reports management'
      }
    ],
    ariaLabel: 'Admin section'
  }
];

const defaultProps: NavigationProps = {
  items: mockNavigationItems,
  testId: 'test-navigation'
};

// ===================================
// Test Utilities
// ===================================

const renderNavigation = (props: Partial<NavigationProps> = {}) => {
  const finalProps = { ...defaultProps, ...props };
  return render(<Navigation {...finalProps} />);
};

// ===================================
// Phase 1: Basic Rendering and Props
// ===================================

describe('Navigation Component', () => {
  describe('Phase 1: Basic Rendering and Props', () => {
    test('should render navigation with items', () => {
      renderNavigation();
      
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
      expect(screen.getByTestId('test-navigation')).toBeInTheDocument();
    });

    test('should render all navigation items', () => {
      renderNavigation();
      
      expect(screen.getByRole('menuitem', { name: 'Dashboard page' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Tasks page' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Profile page' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Settings page' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Admin section' })).toBeInTheDocument();
    });

    test('should render with custom className and testId', () => {
      renderNavigation({
        className: 'custom-nav',
        testId: 'custom-navigation'
      });
      
      const navigation = screen.getByTestId('custom-navigation');
      expect(navigation).toHaveClass('navigation', 'custom-nav');
    });

    test('should render icons and text by default', () => {
      renderNavigation();
      
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
    });

    test('should render badges when provided', () => {
      renderNavigation();
      
      expect(screen.getByLabelText('5 notifications')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    test('should render with vertical orientation by default', () => {
      renderNavigation();
      
      const navigation = screen.getByTestId('test-navigation');
      expect(navigation).toHaveClass('navigation--vertical');
    });
  });

  // ===================================
  // Phase 2: Configuration and State
  // ===================================

  describe('Phase 2: Configuration and State', () => {
    test('should render with horizontal orientation', () => {
      renderNavigation({ orientation: 'horizontal' });
      
      const navigation = screen.getByTestId('test-navigation');
      expect(navigation).toHaveClass('navigation--horizontal');
      
      const menubar = screen.getByRole('menubar');
      expect(menubar).toHaveAttribute('aria-orientation', 'horizontal');
    });

    test('should render in collapsed state', () => {
      renderNavigation({ collapsed: true });
      
      const navigation = screen.getByTestId('test-navigation');
      expect(navigation).toHaveClass('navigation--collapsed');
      
      // Text should not be visible in collapsed state
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Tasks')).not.toBeInTheDocument();
      
      // Icons should still be visible
      expect(screen.getByText('📊')).toBeInTheDocument();
      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    test('should show active item when specified', () => {
      renderNavigation({ activeItem: 'dashboard' });
      
      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      expect(dashboardItem).toHaveAttribute('aria-current', 'page');
      expect(dashboardItem.closest('.navigation__item')).toHaveClass('navigation__item--active');
    });

    test('should handle disabled items', () => {
      renderNavigation();
      
      const settingsItem = screen.getByRole('menuitem', { name: 'Settings page' });
      expect(settingsItem).toHaveAttribute('aria-disabled', 'true');
      expect(settingsItem).toHaveAttribute('tabIndex', '-1');
      expect(settingsItem.closest('.navigation__item')).toHaveClass('navigation__item--disabled');
    });

    test('should handle items with children', () => {
      renderNavigation();
      
      const adminItem = screen.getByRole('menuitem', { name: 'Admin section' });
      expect(adminItem).toHaveAttribute('aria-expanded', 'false');
      expect(adminItem.closest('.navigation__item')).toHaveClass('navigation__item--has-children');
      expect(screen.getByText('▶')).toBeInTheDocument();
    });

    test('should not show badges in collapsed state', () => {
      renderNavigation({ collapsed: true });
      
      expect(screen.queryByLabelText('5 notifications')).not.toBeInTheDocument();
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 3: User Interactions
  // ===================================

  describe('Phase 3: User Interactions', () => {
    test('should handle item click', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      renderNavigation({ onItemClick });
      
      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      await user.click(dashboardItem);
      
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'dashboard',
          label: 'Dashboard',
          href: '/dashboard'
        })
      );
    });

    test('should not handle click on disabled items', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      renderNavigation({ onItemClick });
      
      const settingsItem = screen.getByRole('menuitem', { name: 'Settings page' });
      await user.click(settingsItem);
      
      expect(onItemClick).not.toHaveBeenCalled();
    });

    test('should expand/collapse items with children', async () => {
      const user = userEvent.setup();
      
      renderNavigation();
      
      const adminItem = screen.getByRole('menuitem', { name: 'Admin section' });
      
      // Initially collapsed
      expect(adminItem).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByText('Users')).not.toBeInTheDocument();
      
      // Click to expand
      await user.click(adminItem);
      
      expect(adminItem).toHaveAttribute('aria-expanded', 'true');
      expect(adminItem.closest('.navigation__item')).toHaveClass('navigation__item--expanded');
      expect(screen.getByText('▼')).toBeInTheDocument();
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('Reports')).toBeInTheDocument();
      
      // Click to collapse
      await user.click(adminItem);
      
      expect(adminItem).toHaveAttribute('aria-expanded', 'false');
      expect(adminItem.closest('.navigation__item')).not.toHaveClass('navigation__item--expanded');
    });

    test('should handle keyboard navigation', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();
      
      renderNavigation({ onItemClick });
      
      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      dashboardItem.focus();
      
      // Enter key should trigger click
      await user.keyboard('{Enter}');
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'dashboard' })
      );
      
      onItemClick.mockClear();
      
      // Space key should trigger click
      await user.keyboard(' ');
      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'dashboard' })
      );
    });

    test('should handle hover events', async () => {
      const user = userEvent.setup();
      const onItemHover = jest.fn();
      
      renderNavigation({ onItemHover });
      
      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      
      // Hover over item
      await user.hover(dashboardItem);
      expect(onItemHover).toHaveBeenCalledWith(
        expect.objectContaining({ id: 'dashboard' })
      );
      
      // Hover away
      await user.unhover(dashboardItem);
      expect(onItemHover).toHaveBeenCalledWith(null);
    });
  });

  // ===================================
  // Phase 4: Accessibility and ARIA
  // ===================================

  describe('Phase 4: Accessibility and ARIA', () => {
    test('should have proper ARIA attributes', () => {
      renderNavigation();

      const navigation = screen.getByRole('navigation');
      expect(navigation).toHaveAttribute('aria-label', 'Main navigation');

      const menubar = screen.getByRole('menubar');
      expect(menubar).toHaveAttribute('aria-orientation', 'vertical');

      const menuItems = screen.getAllByRole('menuitem');
      expect(menuItems).toHaveLength(5);
    });

    test('should have proper aria-current for active items', () => {
      renderNavigation({ activeItem: 'tasks' });

      const tasksItem = screen.getByRole('menuitem', { name: 'Tasks page' });
      expect(tasksItem).toHaveAttribute('aria-current', 'page');

      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      expect(dashboardItem).not.toHaveAttribute('aria-current');
    });

    test('should have proper aria-expanded for expandable items', () => {
      renderNavigation();

      const adminItem = screen.getByRole('menuitem', { name: 'Admin section' });
      expect(adminItem).toHaveAttribute('aria-expanded', 'false');

      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      expect(dashboardItem).not.toHaveAttribute('aria-expanded');
    });

    test('should have proper aria-disabled for disabled items', () => {
      renderNavigation();

      const settingsItem = screen.getByRole('menuitem', { name: 'Settings page' });
      expect(settingsItem).toHaveAttribute('aria-disabled', 'true');

      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      expect(dashboardItem).toHaveAttribute('aria-disabled', 'false');
    });

    test('should have proper tabIndex for disabled items', () => {
      renderNavigation();

      const settingsItem = screen.getByRole('menuitem', { name: 'Settings page' });
      expect(settingsItem).toHaveAttribute('tabIndex', '-1');

      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });
      expect(dashboardItem).toHaveAttribute('tabIndex', '0');
    });

    test('should have proper aria-label for badges', () => {
      renderNavigation();

      expect(screen.getByLabelText('5 notifications')).toBeInTheDocument();
    });

    test('should have aria-hidden for decorative elements', () => {
      renderNavigation();

      const icons = document.querySelectorAll('.navigation__icon');
      icons.forEach(icon => {
        expect(icon).toHaveAttribute('aria-hidden', 'true');
      });

      const arrows = document.querySelectorAll('.navigation__arrow');
      arrows.forEach(arrow => {
        expect(arrow).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  // ===================================
  // Phase 5: Edge Cases and Error Handling
  // ===================================

  describe('Phase 5: Edge Cases and Error Handling', () => {
    test('should handle empty items array', () => {
      renderNavigation({ items: [] });

      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByRole('menubar')).toBeInTheDocument();
      expect(screen.queryByRole('menuitem')).not.toBeInTheDocument();
    });

    test('should handle items without icons', () => {
      const itemsWithoutIcons: NavigationItem[] = [
        {
          id: 'no-icon',
          label: 'No Icon',
          href: '/no-icon'
        }
      ];

      renderNavigation({ items: itemsWithoutIcons });

      expect(screen.getByText('No Icon')).toBeInTheDocument();
      expect(document.querySelector('.navigation__icon')).not.toBeInTheDocument();
    });

    test('should handle items without badges', () => {
      const itemsWithoutBadges: NavigationItem[] = [
        {
          id: 'no-badge',
          label: 'No Badge',
          href: '/no-badge',
          icon: '📄'
        }
      ];

      renderNavigation({ items: itemsWithoutBadges });

      expect(screen.getByText('No Badge')).toBeInTheDocument();
      expect(document.querySelector('.navigation__badge')).not.toBeInTheDocument();
    });

    test('should handle deeply nested children', () => {
      const nestedItems: NavigationItem[] = [
        {
          id: 'parent',
          label: 'Parent',
          href: '/parent',
          children: [
            {
              id: 'child',
              label: 'Child',
              href: '/parent/child',
              children: [
                {
                  id: 'grandchild',
                  label: 'Grandchild',
                  href: '/parent/child/grandchild'
                }
              ]
            }
          ]
        }
      ];

      renderNavigation({ items: nestedItems });

      expect(screen.getByText('Parent')).toBeInTheDocument();
      expect(screen.queryByText('Child')).not.toBeInTheDocument();
    });

    test('should handle missing onItemClick callback', async () => {
      const user = userEvent.setup();

      renderNavigation({ onItemClick: undefined });

      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });

      // Should not throw error when clicking without callback
      await expect(user.click(dashboardItem)).resolves.not.toThrow();
    });

    test('should handle missing onItemHover callback', async () => {
      const user = userEvent.setup();

      renderNavigation({ onItemHover: undefined });

      const dashboardItem = screen.getByRole('menuitem', { name: 'Dashboard page' });

      // Should not throw error when hovering without callback
      await expect(user.hover(dashboardItem)).resolves.not.toThrow();
      await expect(user.unhover(dashboardItem)).resolves.not.toThrow();
    });

    test('should handle invalid activeItem', () => {
      renderNavigation({ activeItem: 'non-existent' });

      const menuItems = screen.getAllByRole('menuitem');
      menuItems.forEach(item => {
        expect(item).not.toHaveAttribute('aria-current', 'page');
      });
    });

    test('should handle submenu interactions', async () => {
      const user = userEvent.setup();
      const onItemClick = jest.fn();

      renderNavigation({ onItemClick });

      // Expand admin menu
      const adminItem = screen.getByRole('menuitem', { name: 'Admin section' });
      await user.click(adminItem);

      // Click on submenu item
      const usersItem = screen.getByRole('menuitem', { name: 'User management' });
      await user.click(usersItem);

      expect(onItemClick).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'users',
          label: 'Users',
          href: '/admin/users'
        })
      );
    });

    test('should maintain state consistency during rapid interactions', async () => {
      const user = userEvent.setup();

      renderNavigation();

      const adminItem = screen.getByRole('menuitem', { name: 'Admin section' });

      // Rapid expand/collapse
      await user.click(adminItem);
      await user.click(adminItem);
      await user.click(adminItem);

      expect(adminItem).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByText('Users')).toBeInTheDocument();
    });
  });
});
