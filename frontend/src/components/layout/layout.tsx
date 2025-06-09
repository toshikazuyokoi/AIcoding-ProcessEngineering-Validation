/**
 * ===================================
 * Layout Component Implementation
 * ===================================
 * Purpose: Main application layout with responsive design
 * Features:
 * - Responsive layout (desktop, tablet, mobile)
 * - Authentication state handling
 * - Navigation integration
 * - Accessibility support
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useAuth } from '../../hooks/use-auth';

// ===================================
// Layout Types and Interfaces
// ===================================

/**
 * Layout configuration interface
 */
export interface LayoutConfig {
  showSidebar?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  sidebarCollapsed?: boolean;
  enableResponsive?: boolean;
  maxWidth?: string;
}

/**
 * Layout props interface
 */
export interface LayoutProps {
  children: React.ReactNode;
  config?: LayoutConfig;
  className?: string;
  testId?: string;
}

/**
 * Breakpoint configuration
 */
export interface Breakpoints {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Layout state interface
 */
export interface LayoutState {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_CONFIG: Required<LayoutConfig> = {
  showSidebar: true,
  showHeader: true,
  showFooter: true,
  sidebarCollapsed: false,
  enableResponsive: true,
  maxWidth: '1200px'
};

const BREAKPOINTS: Breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1200
};

// ===================================
// Utility Functions
// ===================================

/**
 * Get current viewport size
 */
const useViewport = () => {
  const [viewport, setViewport] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
};

/**
 * Get responsive state based on viewport
 */
const getResponsiveState = (width: number): Pick<LayoutState, 'isMobile' | 'isTablet' | 'isDesktop'> => {
  return {
    isMobile: width < BREAKPOINTS.mobile,
    isTablet: width >= BREAKPOINTS.mobile && width < BREAKPOINTS.tablet,
    isDesktop: width >= BREAKPOINTS.tablet
  };
};

// ===================================
// Header Component
// ===================================

interface HeaderProps {
  isAuthenticated: boolean;
  isMobile: boolean;
  onMenuToggle: () => void;
  className?: string;
}

const Header: React.FC<HeaderProps> = React.memo(({
  isAuthenticated,
  isMobile,
  onMenuToggle,
  className = ''
}) => {
  const { user, logout } = useAuth();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  return (
    <header
      className={`layout-header ${className}`}
      role="banner"
      aria-label="Site header"
    >
      <div className="layout-header__container">
        <div className="layout-header__left">
          {isAuthenticated && isMobile && (
            <button
              onClick={onMenuToggle}
              className="layout-header__menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded="false"
            >
              <span className="layout-header__menu-icon">☰</span>
            </button>
          )}
          
          <div className="layout-header__logo">
            <h1 className="layout-header__title">Task Manager</h1>
          </div>
        </div>

        <div className="layout-header__right">
          {isAuthenticated ? (
            <div className="layout-header__user">
              <span className="layout-header__user-name">
                {user?.name || user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="layout-header__logout"
                aria-label="Logout"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="layout-header__auth">
              <a href="/login" className="layout-header__login">
                Login
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

// ===================================
// Sidebar Component
// ===================================

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  isMobile: boolean;
  onClose: () => void;
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = React.memo(({
  isOpen,
  isCollapsed,
  isMobile,
  onClose,
  className = ''
}) => {
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleOverlayClick = useCallback(() => {
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="layout-sidebar__overlay"
          onClick={handleOverlayClick}
          aria-hidden="true"
        />
      )}
      
      <aside
        className={`layout-sidebar ${className} ${isOpen ? 'layout-sidebar--open' : ''} ${isCollapsed ? 'layout-sidebar--collapsed' : ''}`}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <nav
          className="layout-sidebar__nav"
          role="navigation"
          aria-label="Main navigation"
        >
          <ul className="layout-sidebar__menu">
            <li className="layout-sidebar__item">
              <a 
                href="/dashboard" 
                className="layout-sidebar__link"
                aria-label="Dashboard"
              >
                <span className="layout-sidebar__icon">📊</span>
                {!isCollapsed && <span className="layout-sidebar__text">Dashboard</span>}
              </a>
            </li>
            <li className="layout-sidebar__item">
              <a 
                href="/tasks" 
                className="layout-sidebar__link"
                aria-label="Tasks"
              >
                <span className="layout-sidebar__icon">📝</span>
                {!isCollapsed && <span className="layout-sidebar__text">Tasks</span>}
              </a>
            </li>
            <li className="layout-sidebar__item">
              <a 
                href="/profile" 
                className="layout-sidebar__link"
                aria-label="Profile"
              >
                <span className="layout-sidebar__icon">👤</span>
                {!isCollapsed && <span className="layout-sidebar__text">Profile</span>}
              </a>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
});

Sidebar.displayName = 'Sidebar';

// ===================================
// Footer Component
// ===================================

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = React.memo(({ className = '' }) => {
  return (
    <footer 
      className={`layout-footer ${className}`}
      role="contentinfo"
      aria-label="Footer"
    >
      <div className="layout-footer__container">
        <div className="layout-footer__content">
          <p className="layout-footer__copyright">
            © 2024 Task Manager. All rights reserved.
          </p>
          <div className="layout-footer__links">
            <a href="/privacy" className="layout-footer__link">
              Privacy Policy
            </a>
            <a href="/terms" className="layout-footer__link">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = 'Footer';

// ===================================
// Main Layout Component
// ===================================

/**
 * Layout Component
 * 
 * Main application layout with responsive design and navigation.
 */
export const Layout: React.FC<LayoutProps> = ({
  children,
  config = {},
  className = '',
  testId = 'layout'
}) => {
  // ===================================
  // Configuration and Dependencies
  // ===================================

  const finalConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config
  }), [config]);

  const { isAuthenticated } = useAuth();
  const viewport = useViewport();

  // ===================================
  // State Management
  // ===================================

  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const responsiveState = useMemo(() => 
    getResponsiveState(viewport.width), 
    [viewport.width]
  );

  const layoutState: LayoutState = useMemo(() => ({
    ...responsiveState,
    sidebarOpen: responsiveState.isDesktop ? true : sidebarOpen,
    sidebarCollapsed: finalConfig.sidebarCollapsed && responsiveState.isDesktop
  }), [responsiveState, sidebarOpen, finalConfig.sidebarCollapsed]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleSidebarClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (responsiveState.isMobile) {
      setSidebarOpen(false);
    }
  }, [responsiveState.isMobile]);

  // ===================================
  // Render Methods
  // ===================================

  const renderAuthenticatedLayout = () => (
    <div 
      className={`layout layout--authenticated ${className}`}
      data-testid={`${testId}-authenticated`}
    >
      {finalConfig.showHeader && (
        <Header
          isAuthenticated={true}
          isMobile={layoutState.isMobile}
          onMenuToggle={handleMenuToggle}
        />
      )}

      <div className="layout__body">
        {finalConfig.showSidebar && (
          <Sidebar
            isOpen={layoutState.sidebarOpen}
            isCollapsed={layoutState.sidebarCollapsed}
            isMobile={layoutState.isMobile}
            onClose={handleSidebarClose}
          />
        )}

        <main 
          className="layout__main"
          role="main"
          aria-label="Main content"
          style={{ maxWidth: finalConfig.maxWidth }}
        >
          <div className="layout__content">
            {children}
          </div>
        </main>
      </div>

      {finalConfig.showFooter && <Footer />}
    </div>
  );

  const renderUnauthenticatedLayout = () => (
    <div 
      className={`layout layout--unauthenticated ${className}`}
      data-testid={`${testId}-unauthenticated`}
    >
      {finalConfig.showHeader && (
        <Header
          isAuthenticated={false}
          isMobile={layoutState.isMobile}
          onMenuToggle={handleMenuToggle}
        />
      )}

      <main
        className="layout__main layout__main--centered"
        role="main"
        aria-label="Main content"
        style={{ maxWidth: finalConfig.maxWidth }}
      >
        <div className="layout__content">
          {children}
        </div>
      </main>

      {finalConfig.showFooter && <Footer />}
    </div>
  );

  // ===================================
  // Main Render
  // ===================================

  return isAuthenticated ? renderAuthenticatedLayout() : renderUnauthenticatedLayout();
};

// Set display name for debugging
Layout.displayName = 'Layout';

// ===================================
// Export Default Component
// ===================================

export default Layout;
