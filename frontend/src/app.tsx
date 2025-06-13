/**
 * App Component
 * 
 * Main application component providing routing, authentication, and global state management.
 * Integrates all major components and provides the foundation for the task management system.
 * 
 * @author Augment Agent
 * @version 1.0.0
 * @since 2025-01-28
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

// Import components
import Layout from './components/layout/layout';
import Dashboard from './components/dashboard/dashboard';
import AuthForm from './components/auth/auth-form';
import TaskList from './components/tasks/task-list';
import TaskForm from './components/tasks/task-form';

// ===================================
// App Types and Interfaces
// ===================================

/**
 * Authentication context interface
 */
export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

/**
 * User interface
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Login credentials interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * App theme interface
 */
export interface AppTheme {
  mode: 'light' | 'dark';
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
}

/**
 * App props interface
 */
export interface AppProps {
  initialRoute?: string;
  enableRouter?: boolean;
  enableAuth?: boolean;
  theme?: AppTheme;
  testId?: string;
}

/**
 * App state interface
 */
interface AppState {
  isInitialized: boolean;
  hasError: boolean;
  errorMessage: string | null;
}

// ===================================
// Default Configuration
// ===================================

const DEFAULT_PROPS: Required<AppProps> = {
  initialRoute: '/',
  enableRouter: true,
  enableAuth: true,
  theme: {
    mode: 'light',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    fontFamily: 'system-ui, -apple-system, sans-serif'
  },
  testId: 'app'
};

const DEFAULT_USER: User = {
  id: 'user-123',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'user',
  createdAt: new Date(),
  updatedAt: new Date()
};

// ===================================
// Context Creation
// ===================================

export const AuthContext = React.createContext<AuthContextType | null>(null);

// ===================================
// Custom Hooks
// ===================================

/**
 * Custom hook for authentication
 */
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ===================================
// Auth Provider Component
// ===================================

interface AuthProviderProps {
  children: React.ReactNode;
  enableAuth: boolean;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, enableAuth }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!enableAuth) {
          // Skip authentication when disabled
          setIsAuthenticated(true);
          setUser(DEFAULT_USER);
          return;
        }

        // Check for existing session
        const token = localStorage.getItem('authToken');
        if (token) {
          // Simulate token validation
          await new Promise(resolve => setTimeout(resolve, 500));
          setIsAuthenticated(true);
          setUser(DEFAULT_USER);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [enableAuth]);

  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);

      // Simulate login API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation
      if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
        const token = 'mock-jwt-token';
        localStorage.setItem('authToken', token);
        
        setIsAuthenticated(true);
        setUser(DEFAULT_USER);
      } else {
        throw new Error('Invalid credentials');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate logout API call
      await new Promise(resolve => setTimeout(resolve, 500));

      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Logout failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue = useMemo(() => ({
    isAuthenticated,
    user,
    login,
    logout,
    loading,
    error
  }), [isAuthenticated, user, login, logout, loading, error]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// ===================================
// Route Guard Components
// ===================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="app__loading" role="status" aria-label="Loading application">
        <div className="app__loading-spinner">⏳</div>
        <p className="app__loading-text">Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="app__loading" role="status" aria-label="Loading application">
        <div className="app__loading-spinner">⏳</div>
        <p className="app__loading-text">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// ===================================
// Page Components (Placeholder)
// ===================================

const LoginPage: React.FC = () => (
  <div className="page page--login" data-testid="login-page">
    <AuthForm mode="login" />
  </div>
);

const TasksPage: React.FC = () => (
  <div className="page page--tasks" data-testid="tasks-page">
    <TaskList />
  </div>
);

const TaskDetailPage: React.FC = () => (
  <div className="page page--task-detail" data-testid="task-detail-page">
    <h1>Task Detail Page</h1>
    <p>Task detail functionality will be implemented here.</p>
  </div>
);

const ProfilePage: React.FC = () => (
  <div className="page page--profile" data-testid="profile-page">
    <h1>Profile Page</h1>
    <p>Profile functionality will be implemented here.</p>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="page page--not-found" data-testid="not-found-page">
    <h1>404 - Page Not Found</h1>
    <p>The page you are looking for does not exist.</p>
  </div>
);

// ===================================
// App Routes Component
// ===================================

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute>
            <div className="page page--register" data-testid="register-page">
              <AuthForm mode="register" />
            </div>
          </PublicRoute>
        } />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tasks" element={
          <ProtectedRoute>
            <Layout>
              <TasksPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tasks/:id" element={
          <ProtectedRoute>
            <Layout>
              <TaskDetailPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <ProfilePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tasks/new" element={
          <ProtectedRoute>
            <Layout>
              <div className="page page--task-create" data-testid="task-create-page">
                <TaskForm mode="create" onSubmit={async () => {}} onCancel={() => {}} />
              </div>
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/tasks/:id/edit" element={
          <ProtectedRoute>
            <Layout>
              <div className="page page--task-edit" data-testid="task-edit-page">
                <TaskForm mode="edit" onSubmit={async () => {}} onCancel={() => {}} />
              </div>
            </Layout>
          </ProtectedRoute>
        } />

        {/* Default Routes */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  );
};

// ===================================
// Error Boundary Component
// ===================================

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode; testId?: string },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; testId?: string }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to monitoring service
    console.error('App Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="app__error-boundary"
          role="alert"
          data-testid={`${this.props.testId}-error-boundary`}
        >
          <div className="app__error-content">
            <h1 className="app__error-title">Something went wrong</h1>
            <p className="app__error-message">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="app__error-retry"
              onClick={this.handleRetry}
              aria-label="Retry application"
            >
              Try Again
            </button>
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="app__error-details">
                <summary>Error Details (Development)</summary>
                <pre className="app__error-stack">
                  {this.state.error?.stack}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ===================================
// Main App Component
// ===================================

/**
 * App Component
 *
 * Main application component providing routing, authentication, and global state.
 */
export const App: React.FC<AppProps> = ({
  initialRoute = DEFAULT_PROPS.initialRoute,
  enableRouter = DEFAULT_PROPS.enableRouter,
  enableAuth = DEFAULT_PROPS.enableAuth,
  theme = DEFAULT_PROPS.theme,
  testId = DEFAULT_PROPS.testId
}) => {
  // ===================================
  // State Management
  // ===================================

  const [appState, setAppState] = useState<AppState>({
    isInitialized: false,
    hasError: false,
    errorMessage: null
  });

  // ===================================
  // Initialization
  // ===================================

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setAppState(prev => ({ ...prev, hasError: false, errorMessage: null }));

        // Simulate app initialization
        await new Promise(resolve => setTimeout(resolve, 100));

        // Apply theme
        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
        document.documentElement.style.setProperty('--secondary-color', theme.secondaryColor);
        document.documentElement.style.setProperty('--font-family', theme.fontFamily);
        document.documentElement.setAttribute('data-theme', theme.mode);

        setAppState(prev => ({ ...prev, isInitialized: true }));
      } catch (error) {
        setAppState(prev => ({
          ...prev,
          hasError: true,
          errorMessage: error instanceof Error ? error.message : 'App initialization failed'
        }));
      }
    };

    initializeApp();
  }, [theme]);

  // ===================================
  // Event Handlers
  // ===================================

  const handleRetry = useCallback(() => {
    setAppState({
      isInitialized: false,
      hasError: false,
      errorMessage: null
    });
  }, []);

  // ===================================
  // Computed Values
  // ===================================

  const appClasses = useMemo(() => [
    'app',
    `app--theme-${theme.mode}`,
    appState.isInitialized && 'app--initialized',
    appState.hasError && 'app--error'
  ].filter(Boolean).join(' '), [theme.mode, appState.isInitialized, appState.hasError]);

  // ===================================
  // Render Methods
  // ===================================

  const renderLoadingState = () => (
    <div className="app__loading" role="status" aria-label="Initializing application">
      <div className="app__loading-spinner">⏳</div>
      <p className="app__loading-text">Initializing application...</p>
    </div>
  );

  const renderErrorState = () => (
    <div className="app__error" role="alert">
      <div className="app__error-content">
        <h1 className="app__error-title">Application Error</h1>
        <p className="app__error-message">{appState.errorMessage}</p>
        <button
          className="app__error-retry"
          onClick={handleRetry}
          aria-label="Retry application initialization"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  const renderApp = () => {
    if (!enableRouter) {
      // Render without router for testing
      return (
        <AuthProvider enableAuth={enableAuth}>
          <Layout>
            <Dashboard />
          </Layout>
        </AuthProvider>
      );
    }

    return (
      <Router>
        <AuthProvider enableAuth={enableAuth}>
          <AppRoutes />
        </AuthProvider>
      </Router>
    );
  };

  // ===================================
  // Main Render
  // ===================================

  if (!appState.isInitialized && !appState.hasError) {
    return (
      <div className={appClasses} data-testid={testId}>
        {renderLoadingState()}
      </div>
    );
  }

  if (appState.hasError) {
    return (
      <div className={appClasses} data-testid={testId}>
        {renderErrorState()}
      </div>
    );
  }

  return (
    <ErrorBoundary testId={testId}>
      <div className={appClasses} data-testid={testId}>
        {renderApp()}
      </div>
    </ErrorBoundary>
  );
};

// Set display name for debugging
App.displayName = 'App';

// ===================================
// Export Default Component
// ===================================

export default App;
