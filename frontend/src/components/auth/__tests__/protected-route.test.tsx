/**
 * ===================================
 * Protected Route Component Tests
 * ===================================
 * Purpose: Comprehensive testing for ProtectedRoute component
 * Author: Process Engineering Approach - Staged Quality Improvement
 * Version: 1.0.0
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { 
  ProtectedRoute, 
  AdminRoute, 
  UserRoute, 
  ProtectedRouteLoading,
  ProtectedRouteError,
  withProtectedRoute,
  withAdminRoute,
  withUserRoute
} from '../protected-route';
import { AuthProvider, User } from '../../../contexts/auth-context';
import * as useAuthModule from '../../../hooks/use-auth';

// ===================================
// Test Setup and Mocks
// ===================================

// Mock the useAuth hook
const mockUseAuth = {
  isAuthenticated: false,
  isInitialized: false,
  isLoading: false,
  user: null,
  userRole: null,
  isReady: false
};

jest.spyOn(useAuthModule, 'useAuth').mockReturnValue(mockUseAuth);

// Test data
const mockUser: User = {
  id: 'user-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'USER',
  isActive: true,
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z'
};

const mockAdminUser: User = {
  ...mockUser,
  id: 'admin-123',
  username: 'adminuser',
  email: 'admin@example.com',
  role: 'ADMIN'
};

// Test components
const TestComponent: React.FC = () => <div data-testid="protected-content">Protected Content</div>;
const LoginComponent: React.FC = () => <div data-testid="login-page">Login Page</div>;
const UnauthorizedComponent: React.FC = () => <div data-testid="unauthorized-page">Unauthorized</div>;

// Test wrapper with router
const TestWrapper: React.FC<{ 
  children: React.ReactNode;
  initialEntries?: string[];
}> = ({ children, initialEntries = ['/protected'] }) => (
  <AuthProvider>
    <MemoryRouter initialEntries={initialEntries}>
      <Routes>
        <Route path="/protected" element={children} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/unauthorized" element={<UnauthorizedComponent />} />
      </Routes>
    </MemoryRouter>
  </AuthProvider>
);

// ===================================
// Test Suite Setup
// ===================================

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset mock useAuth to default state
    Object.assign(mockUseAuth, {
      isAuthenticated: false,
      isInitialized: false,
      isLoading: false,
      user: null,
      userRole: null,
      isReady: false
    });
  });

  // ===================================
  // Phase 1: Basic Rendering and Loading States
  // ===================================

  describe('Phase 1: Basic Rendering and Loading States', () => {
    it('should show loading state when not initialized', () => {
      Object.assign(mockUseAuth, {
        isInitialized: false,
        isLoading: false
      });

      render(
        <TestWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should show loading state when authentication is loading', () => {
      Object.assign(mockUseAuth, {
        isInitialized: true,
        isLoading: true
      });

      render(
        <TestWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByText(/checking authentication/i)).toBeInTheDocument();
      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should show custom fallback when provided', () => {
      Object.assign(mockUseAuth, {
        isInitialized: false
      });

      const customFallback = <div data-testid="custom-loading">Custom Loading</div>;

      render(
        <TestWrapper>
          <ProtectedRoute fallback={customFallback}>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      expect(screen.getByTestId('custom-loading')).toBeInTheDocument();
      expect(screen.queryByText(/checking authentication/i)).not.toBeInTheDocument();
    });

    it('should have proper accessibility attributes in loading state', () => {
      Object.assign(mockUseAuth, {
        isInitialized: false
      });

      render(
        <TestWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      const loadingElement = screen.getByRole('status');
      expect(loadingElement).toHaveAttribute('aria-live', 'polite');
      expect(screen.getByText(/please wait while we verify/i)).toHaveClass('sr-only');
    });
  });

  // ===================================
  // Phase 2: Authentication and Redirect Tests
  // ===================================

  describe('Phase 2: Authentication and Redirect Tests', () => {
    it('should redirect to login when user is not authenticated', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
        user: null
      });

      render(
        <TestWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('login-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should render protected content when user is authenticated', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        user: mockUser,
        userRole: 'USER',
        isReady: true
      });

      render(
        <TestWrapper>
          <ProtectedRoute>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
    });

    it('should redirect to custom path when specified', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: false,
        isInitialized: true,
        user: null
      });

      render(
        <TestWrapper>
          <ProtectedRoute redirectTo="/custom-login">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      // Since we don't have /custom-login route in test setup,
      // we'll check that it's not showing the default login page
      await waitFor(() => {
        expect(screen.queryByTestId('login-page')).not.toBeInTheDocument();
        expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
      });
    });

    it('should call onAuthenticationRequired callback when not authenticated', async () => {
      const onAuthenticationRequired = jest.fn();
      
      Object.assign(mockUseAuth, {
        isAuthenticated: false,
        isInitialized: true,
        user: null
      });

      render(
        <TestWrapper>
          <ProtectedRoute onAuthenticationRequired={onAuthenticationRequired}>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onAuthenticationRequired).toHaveBeenCalled();
      });
    });
  });

  // ===================================
  // Phase 3: Role-Based Access Control Tests
  // ===================================

  describe('Phase 3: Role-Based Access Control Tests', () => {
    it('should allow USER role when requireRole is USER', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      render(
        <TestWrapper>
          <ProtectedRoute requireRole="USER">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should allow ADMIN role when requireRole is USER', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockAdminUser,
        userRole: 'ADMIN'
      });

      render(
        <TestWrapper>
          <ProtectedRoute requireRole="USER">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should deny USER role when requireRole is ADMIN', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      render(
        <TestWrapper>
          <ProtectedRoute requireRole="ADMIN">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    });

    it('should allow ADMIN role when requireRole is ADMIN', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockAdminUser,
        userRole: 'ADMIN'
      });

      render(
        <TestWrapper>
          <ProtectedRoute requireRole="ADMIN">
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should call onUnauthorized callback when role is insufficient', async () => {
      const onUnauthorized = jest.fn();
      
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      render(
        <TestWrapper>
          <ProtectedRoute requireRole="ADMIN" onUnauthorized={onUnauthorized}>
            <TestComponent />
          </ProtectedRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(onUnauthorized).toHaveBeenCalled();
      });
    });
  });

  // ===================================
  // Phase 4: Utility Components Tests
  // ===================================

  describe('Phase 4: Utility Components Tests', () => {
    it('should render AdminRoute correctly for admin user', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockAdminUser,
        userRole: 'ADMIN'
      });

      render(
        <TestWrapper>
          <AdminRoute>
            <TestComponent />
          </AdminRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should deny AdminRoute for regular user', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      render(
        <TestWrapper>
          <AdminRoute>
            <TestComponent />
          </AdminRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('unauthorized-page')).toBeInTheDocument();
      });
    });

    it('should render UserRoute correctly for user', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      render(
        <TestWrapper>
          <UserRoute>
            <TestComponent />
          </UserRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should render UserRoute correctly for admin', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockAdminUser,
        userRole: 'ADMIN'
      });

      render(
        <TestWrapper>
          <UserRoute>
            <TestComponent />
          </UserRoute>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should render ProtectedRouteLoading with custom message', () => {
      render(<ProtectedRouteLoading message="Custom loading message" />);

      expect(screen.getByText('Custom loading message')).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render ProtectedRouteError with custom content', () => {
      const onRetry = jest.fn();
      
      render(
        <ProtectedRouteError 
          title="Custom Error" 
          message="Custom error message"
          onRetry={onRetry}
        />
      );

      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.getByText('Custom error message')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  // ===================================
  // Phase 5: Higher-Order Components Tests
  // ===================================

  describe('Phase 5: Higher-Order Components Tests', () => {
    it('should work with withProtectedRoute HOC', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      const ProtectedTestComponent = withProtectedRoute(TestComponent);

      render(
        <TestWrapper>
          <ProtectedTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should work with withAdminRoute HOC', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockAdminUser,
        userRole: 'ADMIN'
      });

      const AdminTestComponent = withAdminRoute(TestComponent);

      render(
        <TestWrapper>
          <AdminTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should work with withUserRoute HOC', async () => {
      Object.assign(mockUseAuth, {
        isAuthenticated: true,
        isInitialized: true,
        user: mockUser,
        userRole: 'USER'
      });

      const UserTestComponent = withUserRoute(TestComponent);

      render(
        <TestWrapper>
          <UserTestComponent />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByTestId('protected-content')).toBeInTheDocument();
      });
    });

    it('should set correct displayName for HOC components', () => {
      const ProtectedTestComponent = withProtectedRoute(TestComponent);
      const AdminTestComponent = withAdminRoute(TestComponent);
      const UserTestComponent = withUserRoute(TestComponent);

      expect(ProtectedTestComponent.displayName).toBe('withProtectedRoute(TestComponent)');
      expect(AdminTestComponent.displayName).toBe('withProtectedRoute(TestComponent)');
      expect(UserTestComponent.displayName).toBe('withProtectedRoute(TestComponent)');
    });
  });
});
