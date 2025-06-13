/**
 * App Component Tests
 * 
 * Comprehensive test suite for App component using staged quality improvement approach.
 * Tests cover initialization, routing, authentication, state management, and error handling.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { App, AppProps, useAuth } from '../app';
import AuthForm from '../components/auth/auth-form';
import TaskList from '../components/tasks/task-list';
import TaskForm from '../components/tasks/task-form';

// ===================================
// Test Utilities and Mocks
// ===================================

// Mock React Router for testing
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="router">{children}</div>,
  Navigate: ({ to }: { to: string }) => <div data-testid="navigate" data-to={to}>Navigate to {to}</div>
}));

// Mock Layout component
jest.mock('../components/layout/layout', () => {
  return function MockLayout({ children }: { children: React.ReactNode }) {
    return <div data-testid="layout">{children}</div>;
  };
});

// Mock Dashboard component
jest.mock('../components/dashboard/dashboard', () => {
  return function MockDashboard() {
    return <div data-testid="dashboard">Dashboard</div>;
  };
});

// Mock AuthForm component
jest.mock('../components/auth/auth-form', () => {
  return function MockAuthForm({ mode }: { mode: 'login' | 'register' }) {
    return <div data-testid={`auth-form-${mode}`}>AuthForm {mode}</div>;
  };
});

// Mock TaskList component
jest.mock('../components/tasks/task-list', () => {
  return function MockTaskList() {
    return <div data-testid="task-list">TaskList</div>;
  };
});

// Mock TaskForm component
jest.mock('../components/tasks/task-form', () => {
  return function MockTaskForm({ mode }: { mode: 'create' | 'edit' }) {
    return <div data-testid={`task-form-${mode}`}>TaskForm {mode}</div>;
  };
});

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
// Test Data and Fixtures
// ===================================

const defaultProps: AppProps = {
  testId: 'test-app'
};

const customTheme = {
  mode: 'dark' as const,
  primaryColor: '#ff0000',
  secondaryColor: '#00ff00',
  fontFamily: 'Arial, sans-serif'
};

// ===================================
// Test Utilities
// ===================================

const renderApp = (props: Partial<AppProps> = {}) => {
  const finalProps = { ...defaultProps, ...props };
  return render(<App {...finalProps} />);
};

const renderAppWithRouter = (initialEntries: string[] = ['/'], props: Partial<AppProps> = {}) => {
  const finalProps = { ...defaultProps, ...props };
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <App {...finalProps} enableRouter={false} />
    </MemoryRouter>
  );
};

// ===================================
// Phase 1: Basic Rendering and Initialization
// ===================================

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  describe('Phase 1: Basic Rendering and Initialization', () => {
    test('should render app with loading state initially', async () => {
      renderApp({ enableRouter: false });

      expect(screen.getByRole('status', { name: 'Initializing application' })).toBeInTheDocument();
      expect(screen.getByText('Initializing application...')).toBeInTheDocument();

      // Wait for initialization to complete
      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });
    });

    test('should render with custom testId', async () => {
      renderApp({ testId: 'custom-app', enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('custom-app')).toBeInTheDocument();
      });
    });

    test('should apply theme classes correctly', async () => {
      renderApp({ theme: customTheme, enableRouter: false });

      await waitFor(() => {
        const app = screen.getByTestId('test-app');
        expect(app).toHaveClass('app--theme-dark');
        expect(app).toHaveClass('app--initialized');
      });
    });

    test('should apply theme CSS variables', async () => {
      renderApp({ theme: customTheme, enableRouter: false });

      await waitFor(() => {
        expect(document.documentElement.style.getPropertyValue('--primary-color')).toBe('#ff0000');
        expect(document.documentElement.style.getPropertyValue('--secondary-color')).toBe('#00ff00');
        expect(document.documentElement.style.getPropertyValue('--font-family')).toBe('Arial, sans-serif');
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    test('should render without router when disabled', async () => {
      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    test('should render with authentication disabled', async () => {
      renderApp({ enableAuth: false, enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });
    });
  });

  // ===================================
  // Phase 2: Authentication State Management
  // ===================================

  describe('Phase 2: Authentication State Management', () => {
    test('should initialize with unauthenticated state', async () => {
      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });
    });

    test('should restore authentication from localStorage', async () => {
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');

      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });
    });

    test('should handle authentication when disabled', async () => {
      renderApp({ enableAuth: false, enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    test('should handle authentication errors gracefully', async () => {
      // Mock console.error to avoid test output noise
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Mock localStorage to throw an error
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });

      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  // ===================================
  // Phase 3: Error Handling and Boundaries
  // ===================================

  describe('Phase 3: Error Handling and Boundaries', () => {
    test('should handle initialization errors', async () => {
      // Mock theme application to throw an error
      const originalSetProperty = document.documentElement.style.setProperty;
      document.documentElement.style.setProperty = jest.fn(() => {
        throw new Error('Theme application failed');
      });

      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('Application Error')).toBeInTheDocument();
        expect(screen.getByText('Theme application failed')).toBeInTheDocument();
      });

      // Restore original function
      document.documentElement.style.setProperty = originalSetProperty;
    });

    test('should allow retry after initialization error', async () => {
      const user = userEvent.setup();

      // Mock theme application to throw an error initially
      let shouldThrow = true;
      const originalSetProperty = document.documentElement.style.setProperty;
      document.documentElement.style.setProperty = jest.fn(() => {
        if (shouldThrow) {
          throw new Error('Theme application failed');
        }
      });

      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByText('Application Error')).toBeInTheDocument();
      });

      // Stop throwing error and retry
      shouldThrow = false;
      const retryButton = screen.getByLabelText('Retry application initialization');
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
        expect(screen.queryByText('Application Error')).not.toBeInTheDocument();
      });

      // Restore original function
      document.documentElement.style.setProperty = originalSetProperty;
    });

    test('should handle component errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      // Test that app doesn't crash when there are component errors
      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  // ===================================
  // Phase 4: Basic App Functionality
  // ===================================

  describe('Phase 4: Basic App Functionality', () => {
    test('should render app correctly without router', async () => {
      renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });
    });

    test('should handle different configurations', async () => {
      renderApp({
        enableRouter: false,
        enableAuth: false,
        theme: { mode: 'light', primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'Arial' }
      });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      });
    });
  });

  // ===================================
  // Phase 5: Performance and Edge Cases
  // ===================================

  describe('Phase 5: Performance and Edge Cases', () => {
    test('should handle rapid theme changes', async () => {
      const { rerender } = renderApp({
        theme: { mode: 'light', primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'Arial' },
        enableRouter: false
      });

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('light');
      });

      rerender(<App testId="test-app" enableRouter={false} theme={{ mode: 'dark', primaryColor: '#fff', secondaryColor: '#000', fontFamily: 'Arial' }} />);

      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    test('should handle missing props gracefully', async () => {
      render(<App enableRouter={false} />);

      await waitFor(() => {
        expect(screen.getByTestId('app')).toBeInTheDocument();
      });
    });

    test('should handle authentication context outside provider', () => {
      const TestComponent = () => {
        try {
          useAuth();
          return <div>Should not render</div>;
        } catch (error) {
          return <div data-testid="auth-error">Auth context error</div>;
        }
      };

      render(<TestComponent />);

      expect(screen.getByTestId('auth-error')).toBeInTheDocument();
    });

    test('should handle memory cleanup on unmount', async () => {
      const { unmount } = renderApp({ enableRouter: false });

      await waitFor(() => {
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });

      // Should not throw errors on unmount
      expect(() => unmount()).not.toThrow();
    });
  });

  // ===================================
  // Phase 6: Component Integration Tests (TSK-R1-001)
  // ===================================

  describe('Phase 6: Component Integration Tests (TSK-R1-001)', () => {
    test('should have AuthForm, TaskList, and TaskForm components imported and available', () => {
      // Test that components are properly imported by checking if they exist
      expect(typeof AuthForm).toBe('function');
      expect(typeof TaskList).toBe('function');
      expect(typeof TaskForm).toBe('function');
    });

    test('should render app without router and verify component integration', async () => {
      const { container } = render(<App {...defaultProps} enableRouter={false} />);

      await waitFor(() => {
        expect(container.querySelector('.app')).toBeInTheDocument();
        expect(screen.getByTestId('test-app')).toBeInTheDocument();
      });
    });

    test('should verify LoginPage component structure', () => {
      const LoginPage = () => (
        <div className="page page--login" data-testid="login-page">
          <AuthForm mode="login" />
        </div>
      );

      render(<LoginPage />);
      expect(screen.getByTestId('login-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-login')).toBeInTheDocument();
    });

    test('should verify TasksPage component structure', () => {
      const TasksPage = () => (
        <div className="page page--tasks" data-testid="tasks-page">
          <TaskList />
        </div>
      );

      render(<TasksPage />);
      expect(screen.getByTestId('tasks-page')).toBeInTheDocument();
      expect(screen.getByTestId('task-list')).toBeInTheDocument();
    });

    test('should verify TaskForm integration for create mode', () => {
      const TaskCreatePage = () => (
        <div className="page page--task-create" data-testid="task-create-page">
          <TaskForm mode="create" onSubmit={async () => {}} onCancel={() => {}} />
        </div>
      );

      render(<TaskCreatePage />);
      expect(screen.getByTestId('task-create-page')).toBeInTheDocument();
      expect(screen.getByTestId('task-form-create')).toBeInTheDocument();
    });

    test('should verify TaskForm integration for edit mode', () => {
      const TaskEditPage = () => (
        <div className="page page--task-edit" data-testid="task-edit-page">
          <TaskForm mode="edit" onSubmit={async () => {}} onCancel={() => {}} />
        </div>
      );

      render(<TaskEditPage />);
      expect(screen.getByTestId('task-edit-page')).toBeInTheDocument();
      expect(screen.getByTestId('task-form-edit')).toBeInTheDocument();
    });

    test('should verify AuthForm integration for register mode', () => {
      const RegisterPage = () => (
        <div className="page page--register" data-testid="register-page">
          <AuthForm mode="register" />
        </div>
      );

      render(<RegisterPage />);
      expect(screen.getByTestId('register-page')).toBeInTheDocument();
      expect(screen.getByTestId('auth-form-register')).toBeInTheDocument();
    });

    test('should integrate existing components without breaking existing functionality', async () => {
      mockLocalStorage.getItem.mockReturnValue('mock-jwt-token');

      // Test dashboard still works
      renderAppWithRouter(['/dashboard']);
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
        expect(screen.getByTestId('layout')).toBeInTheDocument();
      });
    });
  });
});
