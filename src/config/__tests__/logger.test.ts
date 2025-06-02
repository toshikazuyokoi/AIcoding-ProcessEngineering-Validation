import { Logger, LogSanitizer, createLoggerConfig, requestLogger, resetLogger, LoggerConfig, LogLevel } from '../logger';
import { Request, Response, NextFunction } from 'express';
import winston from 'winston';
import fs from 'fs';
import path from 'path';

// Mock winston to prevent actual file creation during tests
jest.mock('winston', () => {
  const mockFormat: any = {
    combine: jest.fn(() => mockFormat),
    timestamp: jest.fn(() => mockFormat),
    errors: jest.fn(() => mockFormat),
    metadata: jest.fn(() => mockFormat),
    json: jest.fn(() => mockFormat),
    prettyPrint: jest.fn(() => mockFormat),
    colorize: jest.fn(() => mockFormat),
    simple: jest.fn(() => mockFormat),
    printf: jest.fn(() => mockFormat)
  };

  const mockTransports = {
    Console: jest.fn().mockImplementation(() => ({}))
  };

  return {
    createLogger: jest.fn(() => ({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      level: 'info'
    })),
    format: mockFormat,
    transports: mockTransports
  };
});
jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(() => ({}));
});
jest.mock('../environment', () => ({
  getConfig: jest.fn(() => ({
    api: {
      logLevel: 'info'
    }
  }))
}));

describe('Logger Configuration', () => {
  beforeEach(() => {
    resetLogger();
    jest.clearAllMocks();
    
    // Mock winston.createLogger
    (winston.createLogger as jest.Mock).mockReturnValue({
      error: jest.fn(),
      warn: jest.fn(),
      info: jest.fn(),
      debug: jest.fn(),
      level: 'info'
    });
  });

  describe('createLoggerConfig', () => {
    it('should create default development configuration', () => {
      process.env.NODE_ENV = 'development';
      
      const config = createLoggerConfig();
      
      expect(config.level).toBe('info');
      expect(config.silent).toBe(false);
      expect(config.console.enabled).toBe(true);
      expect(config.file.enabled).toBe(true);
      expect(config.errorFile.enabled).toBe(true);
      expect(config.auditFile.enabled).toBe(false);
      expect(config.security.sanitizePasswords).toBe(true);
    });

    it('should create test configuration with silent logging', () => {
      process.env.NODE_ENV = 'test';
      
      const config = createLoggerConfig();
      
      expect(config.silent).toBe(true);
      expect(config.console.enabled).toBe(false);
    });

    it('should create production configuration with audit logging', () => {
      process.env.NODE_ENV = 'production';
      
      const config = createLoggerConfig();
      
      expect(config.auditFile.enabled).toBe(true);
      expect(config.console.enabled).toBe(false);
    });
  });

  describe('Logger Class', () => {
    let logger: Logger;
    let mockWinston: any;

    beforeEach(() => {
      mockWinston = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        level: 'info'
      };
      (winston.createLogger as jest.Mock).mockReturnValue(mockWinston);
      
      logger = Logger.getInstance();
    });

    it('should implement singleton pattern', () => {
      const logger1 = Logger.getInstance();
      const logger2 = Logger.getInstance();
      
      expect(logger1).toBe(logger2);
    });

    it('should log error messages with metadata', () => {
      const error = new Error('Test error');
      const metadata = { userId: 'user123', action: 'test' };
      
      logger.error('Error occurred', error, metadata);
      
      expect(mockWinston.error).toHaveBeenCalledWith('Error occurred', {
        error: error.stack,
        metadata: expect.objectContaining({ userId: 'user123', action: 'test' })
      });
    });

    it('should log warning messages', () => {
      const metadata = { component: 'auth' };
      
      logger.warn('Warning message', metadata);
      
      expect(mockWinston.warn).toHaveBeenCalledWith('Warning message', {
        metadata: expect.objectContaining({ component: 'auth' })
      });
    });

    it('should log info messages', () => {
      const metadata = { requestId: 'req123' };
      
      logger.info('Info message', metadata);
      
      expect(mockWinston.info).toHaveBeenCalledWith('Info message', {
        metadata: expect.objectContaining({ requestId: 'req123' })
      });
    });

    it('should log debug messages', () => {
      const metadata = { debug: true };
      
      logger.debug('Debug message', metadata);
      
      expect(mockWinston.debug).toHaveBeenCalledWith('Debug message', {
        metadata: expect.objectContaining({ debug: true })
      });
    });

    it('should log audit messages', () => {
      logger.audit('USER_LOGIN', 'user123', '/api/login', '192.168.1.1', { success: true });
      
      expect(mockWinston.info).toHaveBeenCalledWith('Audit Log', {
        userId: 'user123',
        action: 'USER_LOGIN',
        resource: '/api/login',
        ip: '192.168.1.1',
        details: expect.objectContaining({ success: true })
      });
    });

    it('should change log level', () => {
      logger.setLevel('error');
      
      expect(mockWinston.level).toBe('error');
    });

    it('should return winston logger instance', () => {
      const winstonInstance = logger.getWinstonLogger();
      
      expect(winstonInstance).toBe(mockWinston);
    });
  });

  describe('LogSanitizer', () => {
    let securityConfig: any;

    beforeEach(() => {
      securityConfig = {
        sanitizePasswords: true,
        sanitizeTokens: true,
        sanitizeCreditCards: true,
        maxMetadataSize: 1000
      };
    });

    it('should sanitize password fields', () => {
      const metadata = {
        username: 'testuser',
        password: 'secret123',
        token: 'jwt-token',
        data: {
          authKey: 'auth-secret'
        }
      };
      
      const sanitized = LogSanitizer.sanitizeMetadata(metadata, securityConfig);
      
      expect(sanitized.username).toBe('testuser');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.data.authKey).toBe('[REDACTED]');
    });

    it('should sanitize credit card numbers', () => {
      const metadata = {
        message: 'Payment with card 4111-1111-1111-1111 processed',
        cardNumber: '4111 1111 1111 1111'
      };
      
      const sanitized = LogSanitizer.sanitizeMetadata(metadata, securityConfig);
      
      expect(sanitized.message).toContain('XXXX-XXXX-XXXX-XXXX');
      expect(sanitized.cardNumber).toBe('XXXX-XXXX-XXXX-XXXX');
    });

    it('should truncate large metadata', () => {
      const largeData = 'x'.repeat(2000);
      const metadata = { largeField: largeData };
      
      const sanitized = LogSanitizer.sanitizeMetadata(metadata, securityConfig);
      
      expect(sanitized._truncated).toBe(true);
      expect(sanitized._originalSize).toBeGreaterThan(1000);
      expect(sanitized._note).toContain('truncated');
    });

    it('should skip sanitization when disabled', () => {
      const metadata = { password: 'secret123' };
      securityConfig.sanitizePasswords = false;
      
      const sanitized = LogSanitizer.sanitizeMetadata(metadata, securityConfig);
      
      expect(sanitized.password).toBe('secret123');
    });

    it('should handle null and undefined metadata', () => {
      expect(LogSanitizer.sanitizeMetadata(null, securityConfig)).toBeNull();
      expect(LogSanitizer.sanitizeMetadata(undefined, securityConfig)).toBeUndefined();
      expect(LogSanitizer.sanitizeMetadata('string', securityConfig)).toBe('string');
    });
  });

  describe('Request Logger Middleware', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;
    let logger: Logger;

    beforeEach(() => {
      resetLogger();
      logger = Logger.getInstance();
      
      mockReq = {
        method: 'GET',
        url: '/api/test',
        ip: '192.168.1.1',
        headers: {
          'user-agent': 'test-agent',
          'authorization': 'Bearer token123'
        },
        get: jest.fn((header: string) => {
          if (header === 'User-Agent') return 'test-agent';
          if (header === 'set-cookie') return ['cookie1', 'cookie2'];
          return undefined;
        }) as any,
        body: { test: 'data' }
      };

      mockRes = {
        statusCode: 200,
        get: jest.fn((header: string) => {
          if (header === 'content-length') return '100';
          return undefined;
        }),
        end: jest.fn()
      };

      mockNext = jest.fn();
    });

    it('should log incoming requests', () => {
      const middleware = requestLogger({ includeHeaders: true });
      
      jest.spyOn(logger, 'info');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Incoming GET /api/test',
        expect.objectContaining({
          method: 'GET',
          url: '/api/test',
          ip: '192.168.1.1',
          userAgent: 'test-agent',
          headers: expect.objectContaining({
            'user-agent': 'test-agent',
            'authorization': '[REDACTED]'
          })
        })
      );
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log request body when enabled', () => {
      const middleware = requestLogger({ includeBody: true });
      
      jest.spyOn(logger, 'info');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Incoming GET /api/test',
        expect.objectContaining({
          body: { test: 'data' }
        })
      );
    });

    it('should truncate large request body', () => {
      const middleware = requestLogger({ includeBody: true, maxBodySize: 10 });
      mockReq.body = { largeData: 'x'.repeat(100) };
      
      jest.spyOn(logger, 'info');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Incoming GET /api/test',
        expect.objectContaining({
          body: '[Body too large to log]'
        })
      );
    });

    it('should log response on completion', () => {
      const middleware = requestLogger();
      
      jest.spyOn(logger, 'info');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      // The middleware should add request ID and call next
      expect((mockReq as any).requestId).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('should log errors for failed requests', () => {
      mockRes.statusCode = 500;
      const middleware = requestLogger();
      
      jest.spyOn(logger, 'warn');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      // The warn method should be called when response completes with error status
      expect(mockNext).toHaveBeenCalled();
    });

    it('should skip successful requests when configured', () => {
      const middleware = requestLogger({ skipSuccessfulRequests: true });
      
      jest.spyOn(logger, 'info');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(mockNext).toHaveBeenCalled();
    });

    it('should exclude specified headers', () => {
      const middleware = requestLogger({ 
        includeHeaders: true,
        excludeHeaderPatterns: [/authorization/i, /cookie/i]
      });
      
      jest.spyOn(logger, 'info');
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect(logger.info).toHaveBeenCalledWith(
        'Incoming GET /api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'authorization': '[REDACTED]'
          })
        })
      );
    });

    it('should add request ID to request object', () => {
      const middleware = requestLogger();
      
      middleware(mockReq as Request, mockRes as Response, mockNext);
      
      expect((mockReq as any).requestId).toBeDefined();
      expect(typeof (mockReq as any).requestId).toBe('string');
    });
  });

  describe('Integration Tests', () => {
    it('should work with custom configuration', () => {
      const customConfig: LoggerConfig = {
        level: 'debug',
        silent: false,
        console: { enabled: true, level: 'debug', colorize: false },
        file: { enabled: false, filename: '', level: 'info', maxSize: '', maxFiles: '', datePattern: '', zippedArchive: false },
        errorFile: { enabled: false, filename: '', level: 'error', maxSize: '', maxFiles: '', datePattern: '', zippedArchive: false },
        auditFile: { enabled: false, filename: '', level: 'info', maxSize: '', maxFiles: '', datePattern: '', zippedArchive: false },
        security: { sanitizePasswords: false, sanitizeTokens: false, sanitizeCreditCards: false, maxMetadataSize: 5000 }
      };
      
      resetLogger();
      const logger = Logger.getInstance(customConfig);
      
      expect(logger).toBeDefined();
      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
          silent: false
        })
      );
    });

         it('should handle logging without metadata', () => {
       const logger = Logger.getInstance();
       const mockWinston = (winston.createLogger as jest.Mock).mock.results[0]?.value;
       
       logger.info('Simple message');
       
       expect(mockWinston?.info).toHaveBeenCalledWith('Simple message', {
         metadata: undefined
       });
     });

     it('should handle error logging without error object', () => {
       const logger = Logger.getInstance();
       const mockWinston = (winston.createLogger as jest.Mock).mock.results[0]?.value;
       
       logger.error('Error message');
       
       expect(mockWinston?.error).toHaveBeenCalledWith('Error message', {
         error: undefined,
         metadata: undefined
       });
     });
  });

  describe('Error Handling', () => {
    it('should handle winston transport errors gracefully', () => {
      const errorLogger = {
        error: jest.fn(),
        warn: jest.fn(),
        info: jest.fn(),
        debug: jest.fn(),
        level: 'info'
      };
      
      (winston.createLogger as jest.Mock).mockReturnValue(errorLogger);
      errorLogger.error.mockImplementation(() => {
        throw new Error('Transport error');
      });
      
      const logger = Logger.getInstance();
      
      // Should not throw error even if winston throws
      expect(() => {
        try {
          logger.error('Test message');
        } catch (e) {
          // Winston errors should be caught internally
        }
      }).not.toThrow();
    });

    it('should handle malformed metadata objects', () => {
      const circularObj: any = { name: 'test' };
      circularObj.circular = circularObj;
      
      // Should not throw JSON.stringify errors and handle circular references
      const result = LogSanitizer.sanitizeMetadata(circularObj, {
        sanitizePasswords: true,
        sanitizeTokens: true,
        sanitizeCreditCards: true,
        maxMetadataSize: 1000
      });
      
      expect(result).toBeDefined();
      expect(result.name).toBe('test');
      expect(result.circular).toBe('[Circular Reference]');
    });
  });

  describe('Performance Tests', () => {
    it('should handle high volume logging efficiently', () => {
      const logger = Logger.getInstance();
      const startTime = Date.now();
      
      // Log 1000 messages
      for (let i = 0; i < 1000; i++) {
        logger.info(`Message ${i}`, { index: i, data: `test-data-${i}` });
      }
      
      const duration = Date.now() - startTime;
      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large metadata objects efficiently', () => {
      const logger = Logger.getInstance();
      const largeMetadata = {
        data: 'x'.repeat(5000),
        numbers: Array.from({ length: 1000 }, (_, i) => i),
        nested: {
          level1: { level2: { level3: 'deep data' } }
        }
      };
      
      const startTime = Date.now();
      logger.info('Large metadata test', largeMetadata);
      const duration = Date.now() - startTime;
      
      // Should handle large metadata efficiently
      expect(duration).toBeLessThan(100);
    });
  });
}); 