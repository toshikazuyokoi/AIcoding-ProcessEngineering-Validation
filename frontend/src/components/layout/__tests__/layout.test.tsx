/**
 * ===================================
 * Layout Component Tests
 * ===================================
 * Purpose: Comprehensive testing for Layout component
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Layout, LayoutProps } from '../layout';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock useAuth hook
const mockUseAuth = {
  isAuthenticated: false,
  user: null,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  loading: false,
  error: null
};

jest.mock('../../../hooks/use-auth', () => ({
  useAuth: () => mockUseAuth
}));

// Mock window.innerWidth and window.innerHeight
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  value: 1024
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  value: 768
});

// Mock window.addEventListener and removeEventListener
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  value: mockAddEventListener
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  value: mockRemoveEventListener
});

// Test data
const defaultProps: LayoutProps = {
  children: <div data-testid="test-content">Test Content</div>
};

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div>{children}</div>
);

// ===================================
// Test Suite Setup
// ===================================

describe('Layout Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock implementations
    Object.assign(mockUseAuth, {
      isAuthenticated: false,
      user: null,
      login: jest.fn(),
      logout: jest.fn(),
      register: jest.fn(),
      loading: false,
      error: null
    });

    // Reset window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });

    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768
    });
  });

  // ===================================
  // Phase 1: Basic Rendering and Props
  // ===================================

  describe('Phase 1: Basic Rendering and Props', () => {
    it('should render layout with children', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render unauthenticated layout by default', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-unauthenticated')).toBeInTheDocument();
      expect(screen.queryByTestId('layout-authenticated')).not.toBeInTheDocument();
    });

    it('should render authenticated layout when user is authenticated', () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { id: '1', email: 'test@example.com', name: 'Test User' };

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByTestId('layout-authenticated')).toBeInTheDocument();
      expect(screen.queryByTestId('layout-unauthenticated')).not.toBeInTheDocument();
    });

    it('should render with custom className and testId', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} className="custom-class" testId="custom-test-id" />
        </TestWrapper>
      );

      const layout = screen.getByTestId('custom-test-id-unauthenticated');
      expect(layout).toBeInTheDocument();
      expect(layout).toHaveClass('custom-class');
    });

    it('should render header by default', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('Task Manager')).toBeInTheDocument();
    });

    it('should render footer by default', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByText(/© 2024 Task Manager/)).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 2: Configuration and State
  // ===================================

  describe('Phase 2: Configuration and State', () => {
    it('should hide header when showHeader is false', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} config={{ showHeader: false }} />
        </TestWrapper>
      );

      expect(screen.queryByRole('banner')).not.toBeInTheDocument();
      expect(screen.queryByText('Task Manager')).not.toBeInTheDocument();
    });

    it('should hide footer when showFooter is false', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} config={{ showFooter: false }} />
        </TestWrapper>
      );

      expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();
      expect(screen.queryByText(/© 2024 Task Manager/)).not.toBeInTheDocument();
    });

    it('should hide sidebar when showSidebar is false', () => {
      mockUseAuth.isAuthenticated = true;

      render(
        <TestWrapper>
          <Layout {...defaultProps} config={{ showSidebar: false }} />
        </TestWrapper>
      );

      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('should show sidebar in authenticated layout', () => {
      mockUseAuth.isAuthenticated = true;

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Tasks')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should show user information when authenticated', () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { id: '1', email: 'test@example.com', name: 'Test User' };

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Test User')).toBeInTheDocument();
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('should show login link when not authenticated', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('Login')).toBeInTheDocument();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 3: Responsive Behavior
  // ===================================

  describe('Phase 3: Responsive Behavior', () => {
    it('should show menu toggle button on mobile when authenticated', () => {
      mockUseAuth.isAuthenticated = true;
      
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Toggle navigation menu')).toBeInTheDocument();
    });

    it('should not show menu toggle button on desktop', () => {
      mockUseAuth.isAuthenticated = true;
      
      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.queryByLabelText('Toggle navigation menu')).not.toBeInTheDocument();
    });

    it('should handle window resize events', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(mockAddEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });

    it('should cleanup resize event listener on unmount', () => {
      const { unmount } = render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      unmount();

      expect(mockRemoveEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
    });
  });

  // ===================================
  // Phase 4: User Interactions
  // ===================================

  describe('Phase 4: User Interactions', () => {
    it('should handle logout action', async () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { id: '1', email: 'test@example.com', name: 'Test User' };
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(mockUseAuth.logout).toHaveBeenCalled();
    });

    it('should handle menu toggle on mobile', async () => {
      mockUseAuth.isAuthenticated = true;
      
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      const menuToggle = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuToggle);

      // Sidebar should be visible after toggle
      const sidebarContainer = document.querySelector('.layout-sidebar');
      expect(sidebarContainer).toHaveClass('layout-sidebar--open');
    });

    it('should close sidebar with Escape key', async () => {
      mockUseAuth.isAuthenticated = true;
      
      // Set mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      // Open sidebar first
      const menuToggle = screen.getByLabelText('Toggle navigation menu');
      await user.click(menuToggle);

      // Press Escape key
      const sidebarContainer = document.querySelector('.layout-sidebar');
      if (sidebarContainer) {
        sidebarContainer.focus();
        await user.keyboard('{Escape}');
      }

      // Sidebar should be closed
      expect(sidebarContainer).not.toHaveClass('layout-sidebar--open');
    });
  });

  // ===================================
  // Phase 5: Accessibility and Edge Cases
  // ===================================

  describe('Phase 5: Accessibility and Edge Cases', () => {
    it('should have proper ARIA attributes', () => {
      mockUseAuth.isAuthenticated = true;

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Site header');
      expect(screen.getByLabelText('Main navigation')).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Main content');
      expect(screen.getByRole('contentinfo')).toHaveAttribute('aria-label', 'Footer');
    });

    it('should have proper navigation links with aria-labels', () => {
      mockUseAuth.isAuthenticated = true;

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByLabelText('Dashboard')).toBeInTheDocument();
      expect(screen.getByLabelText('Tasks')).toBeInTheDocument();
      expect(screen.getByLabelText('Profile')).toBeInTheDocument();
    });

    it('should handle logout error gracefully', async () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { id: '1', email: 'test@example.com', name: 'Test User' };
      mockUseAuth.logout.mockRejectedValue(new Error('Logout failed'));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      const logoutButton = screen.getByText('Logout');
      await user.click(logoutButton);

      expect(consoleSpy).toHaveBeenCalledWith('Logout failed:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should display user email when name is not available', () => {
      mockUseAuth.isAuthenticated = true;
      mockUseAuth.user = { id: '1', email: 'test@example.com' };

      render(
        <TestWrapper>
          <Layout {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should handle collapsed sidebar configuration', () => {
      mockUseAuth.isAuthenticated = true;

      // Set desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200
      });

      render(
        <TestWrapper>
          <Layout {...defaultProps} config={{ sidebarCollapsed: true }} />
        </TestWrapper>
      );

      const sidebarContainer = document.querySelector('.layout-sidebar');
      expect(sidebarContainer).toHaveClass('layout-sidebar--collapsed');
    });

    it('should handle custom maxWidth configuration', () => {
      render(
        <TestWrapper>
          <Layout {...defaultProps} config={{ maxWidth: '800px' }} />
        </TestWrapper>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveStyle({ maxWidth: '800px' });
    });

    it('should handle different viewport sizes correctly', () => {
      const viewportSizes = [600, 800, 1200];

      viewportSizes.forEach((width) => {
        Object.defineProperty(window, 'innerWidth', {
          writable: true,
          configurable: true,
          value: width
        });

        const { unmount } = render(
          <TestWrapper>
            <Layout {...defaultProps} />
          </TestWrapper>
        );

        // Layout should render without errors
        expect(screen.getByTestId('layout-unauthenticated')).toBeInTheDocument();

        unmount();
      });
    });
  });
});
