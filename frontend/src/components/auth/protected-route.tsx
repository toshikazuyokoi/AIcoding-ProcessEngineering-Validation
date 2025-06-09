/**
 * ===================================
 * Protected Route Component Implementation
 * ===================================
 * Purpose: Route protection with authentication check
 * Features:
 * - Authentication state verification
 * - Automatic redirect for unauthenticated users
 * - Loading state management
 * - Return URL preservation
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

// ===================================
// Protected Route Types
// ===================================

/**
 * Protected route props interface
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireRole?: 'USER' | 'ADMIN';
  fallback?: React.ReactNode;
  onUnauthorized?: () => void;
  onAuthenticationRequired?: () => void;
}

/**
 * Authentication check result interface
 */
interface AuthCheckResult {
  isAllowed: boolean;
  shouldRedirect: boolean;
  redirectPath: string;
  reason?: 'not-authenticated' | 'insufficient-role' | 'not-initialized';
}

// ===================================
// Protected Route Component
// ===================================

/**
 * Protected Route Component
 * 
 * Protects routes by checking authentication status and user roles.
 * Automatically redirects unauthenticated users to login page.
 * Preserves the intended destination for post-login redirect.
 * 
 * @param props - Protected route configuration
 * @returns Protected route component or redirect
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requireRole,
  fallback,
  onUnauthorized,
  onAuthenticationRequired
}) => {
  // ===================================
  // Hooks and State
  // ===================================

  const location = useLocation();
  const {
    isAuthenticated,
    isInitialized,
    isLoading,
    user,
    userRole,
    isReady
  } = useAuth();

  const [authCheckResult, setAuthCheckResult] = useState<AuthCheckResult | null>(null);

  // ===================================
  // Authentication Check Logic
  // ===================================

  /**
   * Perform comprehensive authentication check
   */
  const performAuthCheck = (): AuthCheckResult => {
    // Check if authentication is initialized
    if (!isInitialized) {
      return {
        isAllowed: false,
        shouldRedirect: false,
        redirectPath: '',
        reason: 'not-initialized'
      };
    }

    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      return {
        isAllowed: false,
        shouldRedirect: true,
        redirectPath: redirectTo,
        reason: 'not-authenticated'
      };
    }

    // Check role requirements if specified
    if (requireRole && userRole !== requireRole) {
      // Admin can access USER-required routes
      if (!(requireRole === 'USER' && userRole === 'ADMIN')) {
        return {
          isAllowed: false,
          shouldRedirect: true,
          redirectPath: '/unauthorized',
          reason: 'insufficient-role'
        };
      }
    }

    // All checks passed
    return {
      isAllowed: true,
      shouldRedirect: false,
      redirectPath: ''
    };
  };

  // ===================================
  // Effects
  // ===================================

  /**
   * Perform authentication check when dependencies change
   */
  useEffect(() => {
    const result = performAuthCheck();
    setAuthCheckResult(result);

    // Call appropriate callbacks
    if (result.reason === 'not-authenticated' && onAuthenticationRequired) {
      onAuthenticationRequired();
    } else if (result.reason === 'insufficient-role' && onUnauthorized) {
      onUnauthorized();
    }
  }, [
    isAuthenticated,
    isInitialized,
    user,
    userRole,
    requireRole,
    redirectTo,
    onUnauthorized,
    onAuthenticationRequired
  ]);

  // ===================================
  // Render Logic
  // ===================================

  // Show loading state while authentication is being checked
  if (!isInitialized || isLoading || !authCheckResult) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="protected-route-loading" role="status" aria-live="polite">
        <div className="protected-route-loading__container">
          <div className="protected-route-loading__spinner" aria-hidden="true"></div>
          <div className="protected-route-loading__text">
            Checking authentication...
          </div>
        </div>
        <div className="sr-only">
          Please wait while we verify your authentication status.
        </div>
      </div>
    );
  }

  // Redirect if authentication check failed
  if (authCheckResult.shouldRedirect) {
    const state = authCheckResult.reason === 'not-authenticated' 
      ? { from: location.pathname + location.search }
      : undefined;

    return (
      <Navigate 
        to={authCheckResult.redirectPath} 
        state={state}
        replace 
      />
    );
  }

  // Render protected content if all checks passed
  if (authCheckResult.isAllowed) {
    return <>{children}</>;
  }

  // Fallback for unexpected states
  return (
    <div className="protected-route-error" role="alert">
      <div className="protected-route-error__container">
        <h2 className="protected-route-error__title">
          Access Denied
        </h2>
        <p className="protected-route-error__message">
          You don't have permission to access this page.
        </p>
        <button 
          className="protected-route-error__button"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

// ===================================
// Utility Components
// ===================================

/**
 * Admin-only protected route
 */
export const AdminRoute: React.FC<Omit<ProtectedRouteProps, 'requireRole'>> = (props) => (
  <ProtectedRoute {...props} requireRole="ADMIN" />
);

/**
 * User or Admin protected route
 */
export const UserRoute: React.FC<Omit<ProtectedRouteProps, 'requireRole'>> = (props) => (
  <ProtectedRoute {...props} requireRole="USER" />
);

/**
 * Custom loading component for protected routes
 */
export const ProtectedRouteLoading: React.FC<{
  message?: string;
  className?: string;
}> = ({ 
  message = "Checking authentication...", 
  className = "" 
}) => (
  <div className={`protected-route-loading ${className}`} role="status" aria-live="polite">
    <div className="protected-route-loading__container">
      <div className="protected-route-loading__spinner" aria-hidden="true"></div>
      <div className="protected-route-loading__text">
        {message}
      </div>
    </div>
    <div className="sr-only">
      Please wait while we verify your authentication status.
    </div>
  </div>
);

/**
 * Custom error component for protected routes
 */
export const ProtectedRouteError: React.FC<{
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}> = ({ 
  title = "Access Denied",
  message = "You don't have permission to access this page.",
  onRetry,
  className = ""
}) => (
  <div className={`protected-route-error ${className}`} role="alert">
    <div className="protected-route-error__container">
      <h2 className="protected-route-error__title">
        {title}
      </h2>
      <p className="protected-route-error__message">
        {message}
      </p>
      <div className="protected-route-error__actions">
        <button 
          className="protected-route-error__button protected-route-error__button--primary"
          onClick={() => window.history.back()}
        >
          Go Back
        </button>
        {onRetry && (
          <button 
            className="protected-route-error__button protected-route-error__button--secondary"
            onClick={onRetry}
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

// ===================================
// Higher-Order Component
// ===================================

/**
 * Higher-order component for route protection
 */
export const withProtectedRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children'> = {}
) => {
  const ProtectedComponent: React.FC<P> = (props) => (
    <ProtectedRoute {...options}>
      <Component {...props} />
    </ProtectedRoute>
  );

  ProtectedComponent.displayName = `withProtectedRoute(${Component.displayName || Component.name})`;

  return ProtectedComponent;
};

/**
 * Higher-order component for admin-only routes
 */
export const withAdminRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children' | 'requireRole'> = {}
) => withProtectedRoute(Component, { ...options, requireRole: 'ADMIN' });

/**
 * Higher-order component for user routes
 */
export const withUserRoute = <P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ProtectedRouteProps, 'children' | 'requireRole'> = {}
) => withProtectedRoute(Component, { ...options, requireRole: 'USER' });

// Export default component
export default ProtectedRoute;
