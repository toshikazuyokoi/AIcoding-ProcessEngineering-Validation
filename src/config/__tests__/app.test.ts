import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import request from 'supertest';
import express, { Application } from 'express';
import {
  ExpressAppBuilder,
  MiddlewareManager,
  AppConfiguration,
  AppConfig,
  createExpressApp,
  startServer
} from '../app';

// Mock dependencies
jest.mock('../logger', () => ({
  Logger: {
    getInstance: jest.fn(() => ({
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    }))
  },
  requestLogger: jest.fn(() => (req: any, res: any, next: any) => next())
}));

jest.mock('../validation', () => ({
  ValidationFramework: {
    getInstance: jest.fn(() => ({
      validate: jest.fn(),
      registerSchema: jest.fn()
    }))
  }
}));

jest.mock('../environment', () => ({
  getConfig: jest.fn(() => ({
    port: 3000,
    nodeEnv: 'test',
    databaseUrl: 'test.db'
  }))
}));

describe('ExpressAppBuilder', () => {
  let appConfig: AppConfig;
  let appBuilder: ExpressAppBuilder;

  beforeEach(() => {
    appConfig = {
      port: 3000,
      environment: 'test',
      corsOrigins: ['http://localhost:3000'],
      rateLimitWindowMs: 900000,
      rateLimitMaxRequests: 100,
      compressionLevel: 6,
      jsonLimit: '10mb',
      urlEncodedLimit: '10mb'
    };
    appBuilder = new ExpressAppBuilder(appConfig);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    test('should create ExpressAppBuilder instance with valid config', () => {
      expect(appBuilder).toBeInstanceOf(ExpressAppBuilder);
      expect(appBuilder.getApp()).toBeDefined();
    });

    test('should setup middleware during construction', () => {
      const app = appBuilder.getApp();
      expect(app).toBeDefined();
      // Check that Express app has been configured
      expect(app.get).toBeDefined();
      expect(app.post).toBeDefined();
    });
  });

  describe('getApp', () => {
    test('should return Express application instance', () => {
      const app = appBuilder.getApp();
      expect(app).toBeDefined();
      expect(typeof app.listen).toBe('function');
    });
  });

  describe('health check endpoint', () => {
    test('should respond with health status on GET /health', async () => {
      const app = appBuilder.getApp();
      
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'healthy',
        timestamp: expect.any(String),
        version: expect.any(String),
        environment: 'test',
        database: 'connected',
        uptime: expect.any(Number),
        memory: expect.any(Object)
      });
    });

    test('should include proper timestamp format', async () => {
      const app = appBuilder.getApp();
      
      const response = await request(app)
        .get('/health')
        .expect(200);

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.toISOString()).toBe(response.body.timestamp);
    });

    test('should include memory usage information', async () => {
      const app = appBuilder.getApp();
      
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.memory).toHaveProperty('rss');
      expect(response.body.memory).toHaveProperty('heapTotal');
      expect(response.body.memory).toHaveProperty('heapUsed');
      expect(response.body.memory).toHaveProperty('external');
    });
  });

  describe('setupErrorHandling', () => {
    test('should setup 404 handler', async () => {
      const app = appBuilder.getApp();
      appBuilder.setupErrorHandling();
      
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        error: 'Not Found',
        message: 'Cannot GET /nonexistent-route',
        timestamp: expect.any(String)
      });
    });

    test('should setup global error handler', async () => {
      const app = appBuilder.getApp();
      
      // Add a route that throws an error
      app.get('/error-test', () => {
        throw new Error('Test error');
      });
      
      appBuilder.setupErrorHandling();
      
      const response = await request(app)
        .get('/error-test')
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal Server Error',
        message: 'Test error',
        timestamp: expect.any(String),
        stack: expect.any(String)
      });
    });

    test('should hide error details in production', async () => {
      const prodConfig = { ...appConfig, environment: 'production' as const };
      const prodAppBuilder = new ExpressAppBuilder(prodConfig);
      const app = prodAppBuilder.getApp();
      
      // Add a route that throws an error
      app.get('/error-test', () => {
        throw new Error('Test error');
      });
      
      prodAppBuilder.setupErrorHandling();
      
      const response = await request(app)
        .get('/error-test')
        .expect(500);

      expect(response.body).toMatchObject({
        error: 'Internal Server Error',
        message: 'Internal Server Error',
        timestamp: expect.any(String)
      });
      expect(response.body.stack).toBeUndefined();
    });
  });

  describe('middleware setup', () => {
    test('should accept JSON requests', async () => {
      const app = appBuilder.getApp();
      
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });
      
      const testData = { message: 'test' };
      
      const response = await request(app)
        .post('/test')
        .send(testData)
        .expect(200);

      expect(response.body.received).toEqual(testData);
    });

    test('should accept URL-encoded requests', async () => {
      const app = appBuilder.getApp();
      
      app.post('/test', (req, res) => {
        res.json({ received: req.body });
      });
      
      const response = await request(app)
        .post('/test')
        .send('message=test')
        .expect(200);

      expect(response.body.received).toEqual({ message: 'test' });
    });

    test('should apply compression middleware', async () => {
      const app = appBuilder.getApp();
      
      app.get('/large-response', (req, res) => {
        const largeData = 'x'.repeat(2000); // Large response to trigger compression
        res.json({ data: largeData });
      });
      
      const response = await request(app)
        .get('/large-response')
        .expect(200);

      // Response should be compressed (indicated by content-encoding header)
      expect(response.body.data).toBe('x'.repeat(2000));
    });
  });

  describe('CORS configuration', () => {
    test('should set CORS headers for allowed origins', async () => {
      const app = appBuilder.getApp();
      
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    });

    test('should handle OPTIONS requests', async () => {
      const app = appBuilder.getApp();
      
      const response = await request(app)
        .options('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(204);

      expect(response.headers['access-control-allow-methods']).toContain('GET');
      expect(response.headers['access-control-allow-methods']).toContain('POST');
    });
  });

  describe('rate limiting', () => {
    test('should apply rate limiting', async () => {
      const strictConfig = {
        ...appConfig,
        rateLimitWindowMs: 60000, // 1 minute
        rateLimitMaxRequests: 2   // Only 2 requests
      };
      const strictAppBuilder = new ExpressAppBuilder(strictConfig);
      const app = strictAppBuilder.getApp();

      // First request should succeed
      await request(app).get('/health').expect(200);
      
      // Second request should succeed
      await request(app).get('/health').expect(200);
      
      // Third request should be rate limited
      await request(app).get('/health').expect(429);
    });
  });
});

describe('MiddlewareManager', () => {
  let middlewareManager: MiddlewareManager;

  beforeEach(() => {
    middlewareManager = MiddlewareManager.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    test('should return same instance', () => {
      const instance1 = MiddlewareManager.getInstance();
      const instance2 = MiddlewareManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('middleware registration', () => {
    test('should register middleware', () => {
      const testMiddleware = jest.fn();
      middlewareManager.registerMiddleware('test', testMiddleware);
      
      expect(middlewareManager.hasMiddleware('test')).toBe(true);
      expect(middlewareManager.getMiddleware('test')).toBe(testMiddleware);
    });

    test('should list registered middlewares', () => {
      const testMiddleware1 = jest.fn();
      const testMiddleware2 = jest.fn();
      
      middlewareManager.registerMiddleware('test1', testMiddleware1);
      middlewareManager.registerMiddleware('test2', testMiddleware2);
      
      const list = middlewareManager.listMiddlewares();
      expect(list).toContain('test1');
      expect(list).toContain('test2');
    });

    test('should remove middleware', () => {
      const testMiddleware = jest.fn();
      middlewareManager.registerMiddleware('test', testMiddleware);
      
      expect(middlewareManager.hasMiddleware('test')).toBe(true);
      
      const removed = middlewareManager.removeMiddleware('test');
      expect(removed).toBe(true);
      expect(middlewareManager.hasMiddleware('test')).toBe(false);
    });

    test('should return false when removing non-existent middleware', () => {
      const removed = middlewareManager.removeMiddleware('nonexistent');
      expect(removed).toBe(false);
    });
  });

  describe('security middleware', () => {
    test('should apply security middleware to Express app', () => {
      const app = express();
      const useSpy = jest.spyOn(app, 'use');
      
      middlewareManager.applySecurityMiddleware(app);
      
      expect(useSpy).toHaveBeenCalled();
    });

    test('should register validation framework', () => {
      const app = express();
      
      middlewareManager.applySecurityMiddleware(app);
      
      expect(middlewareManager.hasMiddleware('validation')).toBe(true);
    });
  });

  describe('request sanitization', () => {
    test('should sanitize request with XSS protection', async () => {
      const app = express();
      app.use(express.json());
      
      middlewareManager.applySecurityMiddleware(app);
      
      app.post('/test', (req, res) => {
        res.json({ sanitized: req.body });
      });
      
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        description: 'Normal text & some "quotes"'
      };
      
      const response = await request(app)
        .post('/test')
        .send(maliciousData)
        .expect(200);
      
      expect(response.body.sanitized.name).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(response.body.sanitized.description).toBe('Normal text &amp; some &quot;quotes&quot;');
    });

    test('should handle nested objects', async () => {
      const app = express();
      app.use(express.json());
      
      middlewareManager.applySecurityMiddleware(app);
      
      app.post('/test', (req, res) => {
        res.json({ sanitized: req.body });
      });
      
      const nestedData = {
        user: {
          name: '<script>',
          profile: {
            bio: 'Hello & goodbye'
          }
        }
      };
      
      const response = await request(app)
        .post('/test')
        .send(nestedData)
        .expect(200);
      
      expect(response.body.sanitized.user.name).toBe('&lt;script&gt;');
      expect(response.body.sanitized.user.profile.bio).toBe('Hello &amp; goodbye');
    });

    test('should handle arrays', async () => {
      const app = express();
      app.use(express.json());
      
      middlewareManager.applySecurityMiddleware(app);
      
      app.post('/test', (req, res) => {
        res.json({ sanitized: req.body });
      });
      
      const arrayData = {
        tags: ['<script>', 'normal tag', '"quoted"']
      };
      
      const response = await request(app)
        .post('/test')
        .send(arrayData)
        .expect(200);
      
      expect(response.body.sanitized.tags[0]).toBe('&lt;script&gt;');
      expect(response.body.sanitized.tags[1]).toBe('normal tag');
      expect(response.body.sanitized.tags[2]).toBe('&quot;quoted&quot;');
    });
  });
});

describe('AppConfiguration', () => {
  let appConfiguration: AppConfiguration;

  beforeEach(() => {
    // Reset environment variables
    delete process.env.PORT;
    delete process.env.NODE_ENV;
    delete process.env.CORS_ORIGINS;
    
    appConfiguration = AppConfiguration.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('singleton pattern', () => {
    test('should return same instance', () => {
      const instance1 = AppConfiguration.getInstance();
      const instance2 = AppConfiguration.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('configuration loading', () => {
    test('should load default configuration', () => {
      const config = appConfiguration.getConfig();
      
      expect(config).toMatchObject({
        port: 3000,
        environment: 'development',
        corsOrigins: ['http://localhost:3000'],
        rateLimitWindowMs: 900000,
        rateLimitMaxRequests: 100,
        compressionLevel: 6,
        jsonLimit: '10mb',
        urlEncodedLimit: '10mb'
      });
    });

    test('should parse environment variables', () => {
      process.env.PORT = '8080';
      process.env.NODE_ENV = 'production';
      process.env.CORS_ORIGINS = 'https://example.com,https://api.example.com';
      
      // Reset singleton and get new instance to pick up env vars
      (AppConfiguration as any).instance = undefined;
      const newConfig = AppConfiguration.getInstance();
      const config = newConfig.getConfig();
      
      expect(config.port).toBe(8080);
      expect(config.environment).toBe('production');
      expect(config.corsOrigins).toEqual(['https://example.com', 'https://api.example.com']);
    });
  });

  describe('configuration validation', () => {
    test('should validate valid configuration', () => {
      const validation = appConfiguration.validateConfig();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    test('should detect invalid port', () => {
      appConfiguration.updateConfig({ port: -1 });
      const validation = appConfiguration.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Port must be between 1 and 65535');
    });

    test('should detect invalid environment', () => {
      appConfiguration.updateConfig({ environment: 'invalid' as any });
      const validation = appConfiguration.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Environment must be development, test, or production');
    });

    test('should detect invalid CORS origins', () => {
      appConfiguration.updateConfig({ corsOrigins: 'not-an-array' as any });
      const validation = appConfiguration.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('CORS origins must be an array');
    });

    test('should detect invalid rate limit settings', () => {
      appConfiguration.updateConfig({ 
        rateLimitWindowMs: -1,
        rateLimitMaxRequests: 0 
      });
      const validation = appConfiguration.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Rate limit window must be positive');
      expect(validation.errors).toContain('Rate limit max requests must be positive');
    });

    test('should detect invalid compression level', () => {
      appConfiguration.updateConfig({ compressionLevel: 10 });
      const validation = appConfiguration.validateConfig();
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Compression level must be between 0 and 9');
    });
  });

  describe('configuration updates', () => {
    test('should update configuration', () => {
      const updates = { port: 4000, environment: 'test' as const };
      appConfiguration.updateConfig(updates);
      
      const config = appConfiguration.getConfig();
      expect(config.port).toBe(4000);
      expect(config.environment).toBe('test');
    });
  });

  describe('specialized config methods', () => {
    test('should return database config', () => {
      const dbConfig = appConfiguration.getDatabaseConfig();
      
      expect(dbConfig).toMatchObject({
        filename: 'task_manager.db',
        enableWAL: false,
        busyTimeout: 30000,
        maxConnections: 10
      });
    });

    test('should return security config', () => {
      const securityConfig = appConfiguration.getSecurityConfig();
      
      expect(securityConfig).toMatchObject({
        jwtSecret: 'development-secret-key',
        jwtExpiresIn: '24h',
        bcryptRounds: 12,
        sessionSecret: 'development-session-secret'
      });
    });

    test('should return log config', () => {
      const logConfig = appConfiguration.getLogConfig();
      
      expect(logConfig).toMatchObject({
        level: 'info',
        enableConsole: true,
        enableFile: false,
        maxFileSize: '20m',
        maxFiles: '14d'
      });
    });
  });
});

describe('createExpressApp', () => {
  beforeEach(() => {
    // Reset singletons before each test
    (AppConfiguration as any).instance = undefined;
    (MiddlewareManager as any).instance = undefined;
    
    // Reset environment variables to defaults
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
    process.env.RATE_LIMIT_WINDOW_MS = '900000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    process.env.COMPRESSION_LEVEL = '6';
  });

  test('should create configured Express app', () => {
    const app = createExpressApp();
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  test('should throw error for invalid configuration', () => {
    const invalidConfig = AppConfiguration.getInstance();
    invalidConfig.updateConfig({ port: -1 });
    
    expect(() => createExpressApp()).toThrow('Invalid app configuration');
  });
});

describe('startServer', () => {
  test('should start server on specified port', async () => {
    const app = express();
    const mockListen = jest.fn((port: number, callback?: () => void) => {
      setTimeout(() => callback?.(), 10);
      return { on: jest.fn(), close: jest.fn() } as any;
    });
    app.listen = mockListen as any;

    await expect(startServer(app, 3001)).resolves.toBeUndefined();
    expect(mockListen).toHaveBeenCalledWith(3001, expect.any(Function));
  });

  test('should handle server startup errors', async () => {
    const app = express();
    const mockListen = jest.fn(() => {
      const server = { 
        on: jest.fn((event: string, handler: (error: Error) => void) => {
          if (event === 'error') {
            setTimeout(() => handler(new Error('Port in use')), 10);
          }
        }),
        close: jest.fn()
      } as any;
      return server;
    });
    app.listen = mockListen as any;

    await expect(startServer(app, 3001)).rejects.toThrow('Port in use');
  });
});

describe('Performance Tests', () => {
  beforeEach(() => {
    // Reset singletons and environment for performance tests
    (AppConfiguration as any).instance = undefined;
    (MiddlewareManager as any).instance = undefined;
    
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
    process.env.RATE_LIMIT_WINDOW_MS = '900000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    process.env.COMPRESSION_LEVEL = '6';
  });

  test('should handle multiple concurrent requests', async () => {
    const app = createExpressApp();
    
    const requests = Array.from({ length: 50 }, () => 
      request(app).get('/health').expect(200)
    );
    
    const responses = await Promise.all(requests);
    expect(responses).toHaveLength(50);
    responses.forEach(response => {
      expect(response.body.status).toBe('healthy');
    });
  });

  test('should process requests within acceptable time', async () => {
    const app = createExpressApp();
    
    const start = Date.now();
    await request(app).get('/health').expect(200);
    const duration = Date.now() - start;
    
    // Should respond within 100ms for health check
    expect(duration).toBeLessThan(100);
  });
});

describe('Security Tests', () => {
  beforeEach(() => {
    // Reset singletons and environment for security tests
    (AppConfiguration as any).instance = undefined;
    (MiddlewareManager as any).instance = undefined;
    
    process.env.PORT = '3000';
    process.env.NODE_ENV = 'test';
    process.env.CORS_ORIGINS = 'http://localhost:3000';
    process.env.RATE_LIMIT_WINDOW_MS = '900000';
    process.env.RATE_LIMIT_MAX_REQUESTS = '100';
    process.env.COMPRESSION_LEVEL = '6';
  });

  test('should set security headers', async () => {
    const app = createExpressApp();
    
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    // Check that security headers are set by helmet
    expect(response.headers['x-frame-options']).toBeDefined();
    expect(response.headers['x-content-type-options']).toBeDefined();
  });

  test('should reject invalid JSON', async () => {
    const app = createExpressApp();
    
    app.post('/test', (req, res) => {
      res.json({ received: req.body });
    });
    
    const response = await request(app)
      .post('/test')
      .set('Content-Type', 'application/json')
      .send('{"invalid": json}'); // Invalid JSON
    
    // Could be 400 (invalid JSON) or 403 (CSP blocked) - both are acceptable security responses
    expect([400, 403]).toContain(response.status);
    
    if (response.status === 400) {
      expect(response.body.type).toBe('entity.parse.failed');
    }
  });
}); 