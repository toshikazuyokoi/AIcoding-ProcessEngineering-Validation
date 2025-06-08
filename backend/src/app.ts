/**
 * ===================================
 * Express Application Implementation
 * ===================================
 * Purpose: Main Express application setup and configuration
 * Features:
 * - Middleware integration
 * - Route configuration
 * - Security settings
 * - Error handling
 * - CORS configuration
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { json, urlencoded } from 'express';

// Import middleware
import { LoggingMiddleware } from './middleware/logging-middleware';
import { AuthMiddleware } from './middleware/auth-middleware';
import { ErrorMiddleware } from './middleware/error-middleware';

// Import controllers
import { AuthController } from './controllers/auth-controller';
import { TaskController } from './controllers/task-controller';
import { UserController } from './controllers/user-controller';
import { CategoryController } from './controllers/category-controller';

// Import services (for dependency injection)
import { AuthService } from './domain/services/auth.service';
import { TaskService } from './domain/services/task.service';
import { UserService } from './domain/services/user.service';
import { CategoryService } from './domain/services/category.service';

// Import utilities
import { Logger } from './utils/logger';
import { ResponseBuilder } from './utils/response-builder';
import { ErrorHandler } from './utils/error-handler';

// Import configuration
import { getDefaultEnvironmentConfig } from '../config/environment';

// ===================================
// Express Application Types
// ===================================

/**
 * Express application configuration interface
 */
export interface ExpressAppConfig {
  enableCors: boolean;
  enableHelmet: boolean;
  enableCompression: boolean;
  enableRateLimit: boolean;
  enableLogging: boolean;
  enableAuth: boolean;
  corsOrigin: string;
  rateLimitMax: number;
  rateLimitWindowMs: number;
  requestSizeLimit: string;
  environment: string;
}

/**
 * Application dependencies interface
 */
export interface AppDependencies {
  authService: AuthService;
  taskService: TaskService;
  userService: UserService;
  categoryService: CategoryService;
  logger: Logger;
  responseBuilder: ResponseBuilder;
  errorHandler: ErrorHandler;
}

// ===================================
// ExpressApp Class
// ===================================

/**
 * Express Application Class
 * 
 * Handles Express application setup and configuration:
 * - Middleware integration
 * - Route configuration
 * - Security settings
 * - Error handling
 */
export class ExpressApp {
  private app: Application;
  private config: ExpressAppConfig;
  private dependencies: AppDependencies;
  private logger: Logger;

  // Middleware instances
  private loggingMiddleware!: LoggingMiddleware;
  private authMiddleware!: AuthMiddleware;
  private errorMiddleware!: ErrorMiddleware;

  // Controller instances
  private authController!: AuthController;
  private taskController!: TaskController;
  private userController!: UserController;
  private categoryController!: CategoryController;

  /**
   * Constructor
   */
  constructor(dependencies: AppDependencies, config?: Partial<ExpressAppConfig>) {
    this.dependencies = dependencies;
    this.logger = dependencies.logger;
    
    // Setup configuration
    this.config = this.createConfig(config);
    
    // Create Express application
    this.app = express();
    
    // Initialize middleware
    this.initializeMiddleware();
    
    // Initialize controllers
    this.initializeControllers();
    
    // Setup application
    this.setupApplication();
    
    this.logger.info('Express application initialized successfully');
  }

  /**
   * Create application configuration
   */
  private createConfig(config?: Partial<ExpressAppConfig>): ExpressAppConfig {
    const envConfig = getDefaultEnvironmentConfig();
    
    return {
      enableCors: true,
      enableHelmet: true,
      enableCompression: true,
      enableRateLimit: true,
      enableLogging: true,
      enableAuth: true,
      corsOrigin: envConfig.app.corsOrigin,
      rateLimitMax: 100, // requests per window
      rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
      requestSizeLimit: '10mb',
      environment: envConfig.app.environment,
      ...config
    };
  }

  /**
   * Initialize middleware instances
   */
  private initializeMiddleware(): void {
    this.loggingMiddleware = new LoggingMiddleware(
      this.logger,
      {
        serviceName: 'task-management-api',
        enableRequestLogging: true,
        enableResponseLogging: true,
        enablePerformanceLogging: true
      }
    );

    this.authMiddleware = new AuthMiddleware();

    this.errorMiddleware = new ErrorMiddleware(
      this.dependencies.errorHandler,
      this.logger,
      this.dependencies.responseBuilder,
      {
        enableStackTrace: this.config.environment !== 'production',
        enableMonitoring: this.config.environment === 'production'
      }
    );
  }

  /**
   * Initialize controller instances
   */
  private initializeControllers(): void {
    this.authController = new AuthController(
      this.dependencies.authService,
      this.dependencies.responseBuilder,
      this.dependencies.errorHandler,
      this.logger
    );

    this.taskController = new TaskController(
      this.dependencies.taskService,
      this.dependencies.responseBuilder,
      this.dependencies.errorHandler,
      this.logger
    );

    this.userController = new UserController(
      this.dependencies.userService,
      this.dependencies.responseBuilder,
      this.dependencies.errorHandler,
      this.logger
    );

    this.categoryController = new CategoryController(
      this.dependencies.categoryService,
      this.dependencies.responseBuilder,
      this.dependencies.errorHandler,
      this.logger
    );
  }

  /**
   * Setup Express application
   */
  private setupApplication(): void {
    // Security middleware
    if (this.config.enableHelmet) {
      this.app.use(helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"]
          }
        }
      }));
    }

    // CORS configuration
    if (this.config.enableCors) {
      this.app.use(cors({
        origin: this.config.corsOrigin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
      }));
    }

    // Compression middleware
    if (this.config.enableCompression) {
      this.app.use(compression());
    }

    // Rate limiting
    if (this.config.enableRateLimit) {
      const limiter = rateLimit({
        windowMs: this.config.rateLimitWindowMs,
        max: this.config.rateLimitMax,
        message: {
          error: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false
      });
      this.app.use('/api/', limiter);
    }

    // Body parsing middleware
    this.app.use(json({ limit: this.config.requestSizeLimit }));
    this.app.use(urlencoded({ extended: true, limit: this.config.requestSizeLimit }));

    // Logging middleware
    if (this.config.enableLogging) {
      this.app.use(this.loggingMiddleware.log());
    }

    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: this.config.environment,
        version: process.env.npm_package_version || '1.0.0'
      });
    });

    // API routes
    this.setupRoutes();

    // Error handling middleware (must be last)
    this.app.use(this.errorMiddleware.handle());
  }

  /**
   * Setup API routes
   */
  private setupRoutes(): void {
    // Authentication routes (no auth required)
    this.app.post('/api/auth/register', this.authController.register);
    this.app.post('/api/auth/login', this.authController.login);
    this.app.post('/api/auth/logout', this.authController.logout);
    this.app.post('/api/auth/refresh', this.authController.refreshToken);
    this.app.post('/api/auth/validate', this.authController.validateToken);
    this.app.get('/api/auth/me', this.authMiddleware.authenticate(), this.authController.getCurrentUser);

    // Task routes (auth required)
    this.app.get('/api/tasks', this.authMiddleware.authenticate(), this.taskController.getTasks);
    this.app.post('/api/tasks', this.authMiddleware.authenticate(), this.taskController.createTask);
    this.app.get('/api/tasks/:id', this.authMiddleware.authenticate(), this.taskController.getTaskById);
    this.app.put('/api/tasks/:id', this.authMiddleware.authenticate(), this.taskController.updateTask);
    this.app.delete('/api/tasks/:id', this.authMiddleware.authenticate(), this.taskController.deleteTask);

    // User routes (auth required)
    this.app.get('/api/users/profile', this.authMiddleware.authenticate(), this.userController.getProfile);
    this.app.put('/api/users/profile', this.authMiddleware.authenticate(), this.userController.updateProfile);
    this.app.delete('/api/users/account', this.authMiddleware.authenticate(), this.userController.deleteAccount);

    // Category routes (auth required)
    this.app.get('/api/categories', this.authMiddleware.authenticate(), this.categoryController.getCategories);
    this.app.post('/api/categories', this.authMiddleware.authenticate(), this.categoryController.createCategory);
    this.app.get('/api/categories/:id', this.authMiddleware.authenticate(), this.categoryController.getCategoryById);
    this.app.put('/api/categories/:id', this.authMiddleware.authenticate(), this.categoryController.updateCategory);
    this.app.delete('/api/categories/:id', this.authMiddleware.authenticate(), this.categoryController.deleteCategory);

    // 404 handler for unmatched routes
    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${req.method} ${req.originalUrl} not found`,
          type: 'NOT_FOUND',
          timestamp: new Date().toISOString()
        }
      });
    });
  }

  /**
   * Get Express application instance
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Get application configuration
   */
  public getConfig(): ExpressAppConfig {
    return this.config;
  }

  /**
   * Start the server
   */
  public listen(port: number, callback?: () => void): void {
    this.app.listen(port, callback);
    this.logger.info(`Server started on port ${port} in ${this.config.environment} mode`);
  }
}

// ===================================
// Factory Function
// ===================================

/**
 * Create ExpressApp instance
 */
export const createExpressApp = (
  dependencies: AppDependencies,
  config?: Partial<ExpressAppConfig>
): ExpressApp => {
  return new ExpressApp(dependencies, config);
};

// Export default instance factory
export default createExpressApp;
