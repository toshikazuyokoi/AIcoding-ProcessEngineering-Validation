import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Logger, requestLogger } from './logger';
import { ValidationFramework } from './validation';
import { EnhancedDatabaseConnection } from '../infrastructure/database/Connection';
import { getConfig } from './environment';

export interface AppConfig {
  port: number;
  environment: 'development' | 'test' | 'production';
  corsOrigins: string[];
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  compressionLevel: number;
  jsonLimit: string;
  urlEncodedLimit: string;
}

export class ExpressAppBuilder {
  private app: Application;
  private config: AppConfig;
  private logger: Logger;

  constructor(config: AppConfig) {
    this.app = express();
    this.config = config;
    this.logger = Logger.getInstance();
    this.setupMiddleware();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));

    // CORS configuration
    this.app.use(cors({
      origin: this.config.corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: this.config.rateLimitWindowMs,
      max: this.config.rateLimitMaxRequests,
      message: 'Too many requests from this IP, please try again later.',
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);

    // Compression middleware
    this.app.use(compression({
      level: this.config.compressionLevel,
      threshold: 1024
    }));

    // Body parsing middleware
    this.app.use(express.json({ 
      limit: this.config.jsonLimit,
      verify: (req, res, buf) => {
        try {
          JSON.parse(buf.toString());
        } catch (e) {
          throw new Error('Invalid JSON');
        }
      }
    }));

    this.app.use(express.urlencoded({ 
      extended: true, 
      limit: this.config.urlEncodedLimit 
    }));

    // Logging middleware
    this.app.use(requestLogger());

    // Health check endpoint
    this.app.get('/health', this.healthCheckHandler.bind(this));
  }

  private async healthCheckHandler(req: Request, res: Response): Promise<void> {
    try {
      const healthStatus = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        environment: this.config.environment,
        database: 'connected', // Simplified for now
        uptime: process.uptime(),
        memory: process.memoryUsage()
      };

      res.status(200).json(healthStatus);
    } catch (error) {
      this.logger.error('Health check failed', error as Error);
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable'
      });
    }
  }

  public getApp(): Application {
    return this.app;
  }

  public setupErrorHandling(): void {
    // 404 handler
    this.app.use((req: Request, res: Response) => {
      this.logger.warn(`404 Not Found: ${req.method} ${req.path}`);
      res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`,
        timestamp: new Date().toISOString()
      });
    });

    // Global error handler
    this.app.use((
      error: Error, 
      req: Request, 
      res: Response, 
      next: NextFunction
    ) => {
      this.logger.error('Unhandled error', error);

      if (res.headersSent) {
        return next(error);
      }

      const statusCode = (error as any).statusCode || 500;
      const message = this.config.environment === 'production' 
        ? 'Internal Server Error' 
        : error.message;

      res.status(statusCode).json({
        error: 'Internal Server Error',
        message,
        timestamp: new Date().toISOString(),
        ...(this.config.environment !== 'production' && { stack: error.stack })
      });
    });
  }
}

export class MiddlewareManager {
  private static instance: MiddlewareManager;
  private middlewares: Map<string, any> = new Map();
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
  }

  public static getInstance(): MiddlewareManager {
    if (!MiddlewareManager.instance) {
      MiddlewareManager.instance = new MiddlewareManager();
    }
    return MiddlewareManager.instance;
  }

  public registerMiddleware(name: string, middleware: any): void {
    this.middlewares.set(name, middleware);
    this.logger.debug(`Middleware '${name}' registered`);
  }

  public getMiddleware(name: string): any {
    return this.middlewares.get(name);
  }

  public hasMiddleware(name: string): boolean {
    return this.middlewares.has(name);
  }

  public listMiddlewares(): string[] {
    return Array.from(this.middlewares.keys());
  }

  public removeMiddleware(name: string): boolean {
    const removed = this.middlewares.delete(name);
    if (removed) {
      this.logger.debug(`Middleware '${name}' removed`);
    }
    return removed;
  }

  public applySecurityMiddleware(app: Application): void {
    const validationFramework = ValidationFramework.getInstance();
    
    // Register validation middleware
    this.registerMiddleware('validation', validationFramework);
    
    // Apply request sanitization
    app.use((req: Request, res: Response, next: NextFunction) => {
      this.sanitizeRequest(req);
      next();
    });

    this.logger.info('Security middleware applied');
  }

  private sanitizeRequest(req: Request): void {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = this.sanitizeObject(req.params);
    }
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === 'string') {
      return obj.trim().replace(/[<>'"&]/g, (match) => {
        const entityMap: { [key: string]: string } = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entityMap[match] || match;
      });
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        sanitized[key] = this.sanitizeObject(value);
      }
      return sanitized;
    }

    return obj;
  }
}

export class AppConfiguration {
  private static instance: AppConfiguration;
  private config: AppConfig;
  private logger: Logger;

  private constructor() {
    this.logger = Logger.getInstance();
    this.config = this.loadConfiguration();
  }

  public static getInstance(): AppConfiguration {
    if (!AppConfiguration.instance) {
      AppConfiguration.instance = new AppConfiguration();
    }
    return AppConfiguration.instance;
  }

  public getConfig(): AppConfig {
    return { ...this.config };
  }

  public updateConfig(updates: Partial<AppConfig>): void {
    this.config = { ...this.config, ...updates };
    this.logger.info('App configuration updated', updates);
  }

  public validateConfig(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.port <= 0 || this.config.port > 65535) {
      errors.push('Port must be between 1 and 65535');
    }

    if (!['development', 'test', 'production'].includes(this.config.environment)) {
      errors.push('Environment must be development, test, or production');
    }

    if (!Array.isArray(this.config.corsOrigins)) {
      errors.push('CORS origins must be an array');
    }

    if (this.config.rateLimitWindowMs <= 0) {
      errors.push('Rate limit window must be positive');
    }

    if (this.config.rateLimitMaxRequests <= 0) {
      errors.push('Rate limit max requests must be positive');
    }

    if (this.config.compressionLevel < 0 || this.config.compressionLevel > 9) {
      errors.push('Compression level must be between 0 and 9');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private loadConfiguration(): AppConfig {
    const envConfig = getConfig();

    return {
      port: parseInt(process.env.PORT || '3000', 10),
      environment: (process.env.NODE_ENV as any) || 'development',
      corsOrigins: this.parseCorsOrigins(process.env.CORS_ORIGINS || 'http://localhost:3000'),
      rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
      rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
      compressionLevel: parseInt(process.env.COMPRESSION_LEVEL || '6', 10),
      jsonLimit: process.env.JSON_LIMIT || '10mb',
      urlEncodedLimit: process.env.URL_ENCODED_LIMIT || '10mb'
    };
  }

  private parseCorsOrigins(originsString: string): string[] {
    try {
      return originsString.split(',').map(origin => origin.trim());
    } catch (error) {
      this.logger.warn('Failed to parse CORS origins, using default');
      return ['http://localhost:3000'];
    }
  }

  public getDatabaseConfig() {
    return {
      filename: process.env.DATABASE_FILENAME || 'task_manager.db',
      enableWAL: process.env.DATABASE_ENABLE_WAL === 'true',
      busyTimeout: parseInt(process.env.DATABASE_BUSY_TIMEOUT || '30000', 10),
      maxConnections: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10', 10)
    };
  }

  public getSecurityConfig() {
    return {
      jwtSecret: process.env.JWT_SECRET || 'development-secret-key',
      jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
      bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
      sessionSecret: process.env.SESSION_SECRET || 'development-session-secret'
    };
  }

  public getLogConfig() {
    return {
      level: process.env.LOG_LEVEL || 'info',
      enableConsole: process.env.LOG_ENABLE_CONSOLE !== 'false',
      enableFile: process.env.LOG_ENABLE_FILE === 'true',
      maxFileSize: process.env.LOG_MAX_FILE_SIZE || '20m',
      maxFiles: process.env.LOG_MAX_FILES || '14d'
    };
  }
}

export function createExpressApp(): Application {
  const appConfig = AppConfiguration.getInstance();
  const config = appConfig.getConfig();
  
  // Validate configuration
  const validation = appConfig.validateConfig();
  if (!validation.valid) {
    throw new Error(`Invalid app configuration: ${validation.errors.join(', ')}`);
  }

  const appBuilder = new ExpressAppBuilder(config);
  const middlewareManager = MiddlewareManager.getInstance();
  
  const app = appBuilder.getApp();
  
  // Apply security middleware
  middlewareManager.applySecurityMiddleware(app);
  
  // Setup error handling
  appBuilder.setupErrorHandling();
  
  return app;
}

export function startServer(app: Application, port?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = AppConfiguration.getInstance().getConfig();
    const serverPort = port || config.port;
    const logger = Logger.getInstance();

    const server = app.listen(serverPort, () => {
      logger.info(`Server started on port ${serverPort} in ${config.environment} mode`);
      resolve();
    });

    server.on('error', (error: Error) => {
      logger.error('Server startup failed', error);
      reject(error);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  });
}

export default {
  ExpressAppBuilder,
  MiddlewareManager,
  AppConfiguration,
  createExpressApp,
  startServer
}; 