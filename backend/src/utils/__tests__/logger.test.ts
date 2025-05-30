/**
 * ===================================
 * Logger Tests
 * ===================================
 * Purpose: Comprehensive testing for Logger class
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import * as fs from 'fs';
import * as path from 'path';
import { Logger, LogLevel, LogLevelString, createLogger, getLogger } from '../logger';

// Mock fs module
jest.mock('fs');
const mockFs = fs as jest.Mocked<typeof fs>;

// Mock console methods
const originalConsole = { ...console };
const mockConsole = {
  log: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock environment variables
const originalEnv = process.env;

describe('Logger', () => {
  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      LOG_LEVEL: 'info',
      LOG_FORMAT: 'json',
      LOG_FILE: './logs/test.log',
      LOG_DIR: './logs',
      NODE_ENV: 'test',
      SERVICE_NAME: 'test-service',
      SERVICE_VERSION: '1.0.0',
    };

    // Reset mocks
    jest.clearAllMocks();
    mockFs.existsSync.mockReturnValue(true);
    mockFs.mkdirSync.mockReturnValue(undefined);
    mockFs.appendFileSync.mockReturnValue(undefined);

    // Mock console
    Object.assign(console, mockConsole);
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.assign(console, originalConsole);
  });

  describe('Constructor and Configuration', () => {
    test('should create logger with default configuration', () => {
      const logger = new Logger();
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.INFO);
      expect(config.format).toBe('json');
      expect(config.serviceName).toBe('test-service');
      expect(config.serviceVersion).toBe('1.0.0');
    });

    test('should create logger with context', () => {
      const logger = new Logger('TestContext');
      const config = logger.getConfig();

      expect(config.serviceName).toBe('test-service');
    });

    test('should create logger with custom configuration', () => {
      const customConfig = {
        level: LogLevel.DEBUG,
        format: 'text' as const,
        enableColors: false,
      };

      const logger = new Logger('TestContext', customConfig);
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.format).toBe('text');
      expect(config.enableColors).toBe(false);
    });

    test('should parse log level from environment variable', () => {
      process.env.LOG_LEVEL = 'debug';
      const logger = new Logger();
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.DEBUG);
    });

    test('should handle invalid log level gracefully', () => {
      process.env.LOG_LEVEL = 'invalid';
      const logger = new Logger();
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.INFO);
    });
  });

  describe('Directory Creation', () => {
    test('should create log directory if it does not exist', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      new Logger('TestContext', { enableFile: true });

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./logs', { recursive: true });
    });

    test('should not create directory if it already exists', () => {
      mockFs.existsSync.mockReturnValue(true);
      
      new Logger('TestContext', { enableFile: true });

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });

    test('should not create directory if file logging is disabled', () => {
      mockFs.existsSync.mockReturnValue(false);
      
      new Logger('TestContext', { enableFile: false });

      expect(mockFs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('Context Management', () => {
    test('should set and clear context', () => {
      const logger = new Logger('TestContext');
      const context = {
        traceId: 'trace-123',
        userId: 'user-456',
        requestId: 'req-789',
      };

      logger.setContext(context);
      logger.info('Test message');

      expect(mockConsole.log).toHaveBeenCalledWith(
        expect.stringContaining('trace-123')
      );

      logger.clearContext();
      logger.info('Test message 2');

      const lastCall = mockConsole.log.mock.calls[mockConsole.log.mock.calls.length - 1][0];
      expect(lastCall).not.toContain('trace-123');
    });

    test('should merge context when setting multiple times', () => {
      const logger = new Logger('TestContext');
      
      logger.setContext({ traceId: 'trace-123' });
      logger.setContext({ userId: 'user-456' });
      
      logger.info('Test message');

      const logCall = mockConsole.log.mock.calls[0][0];
      expect(logCall).toContain('trace-123');
      expect(logCall).toContain('user-456');
    });
  });

  describe('Log Level Filtering', () => {
    test('should respect log level configuration', () => {
      const logger = new Logger('TestContext', { level: LogLevel.WARN });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');

      expect(mockConsole.debug).not.toHaveBeenCalled();
      expect(mockConsole.log).not.toHaveBeenCalled();
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(1);
    });

    test('should log all levels when set to DEBUG', () => {
      const logger = new Logger('TestContext', { level: LogLevel.DEBUG });

      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warning message');
      logger.error('Error message');
      logger.fatal('Fatal message');

      expect(mockConsole.debug).toHaveBeenCalledTimes(1);
      expect(mockConsole.log).toHaveBeenCalledTimes(1);
      expect(mockConsole.warn).toHaveBeenCalledTimes(1);
      expect(mockConsole.error).toHaveBeenCalledTimes(2); // error + fatal
    });
  });

  describe('Log Output Formats', () => {
    test('should output JSON format by default', () => {
      const logger = new Logger('TestContext', { format: 'json' });
      
      logger.info('Test message');

      const logOutput = mockConsole.log.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
      
      const parsed = JSON.parse(logOutput);
      expect(parsed.level).toBe('INFO');
      expect(parsed.message).toBe('Test message');
      expect(parsed.context).toBe('TestContext');
    });

    test('should output text format when configured', () => {
      const logger = new Logger('TestContext', { 
        format: 'text',
        enableColors: false,
        enableTimestamp: false 
      });
      
      logger.info('Test message');

      const logOutput = mockConsole.log.mock.calls[0][0];
      expect(logOutput).toContain('[INFO]');
      expect(logOutput).toContain('[TestContext]');
      expect(logOutput).toContain('Test message');
    });

    test('should include metadata in JSON output', () => {
      const logger = new Logger('TestContext', { format: 'json' });
      const metadata = { userId: '123', action: 'login' };
      
      logger.info('User action', metadata);

      const logOutput = mockConsole.log.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.metadata).toEqual(metadata);
    });

    test('should include error information', () => {
      const logger = new Logger('TestContext', { format: 'json' });
      const error = new Error('Test error');
      
      logger.error('Error occurred', error);

      const logOutput = mockConsole.error.mock.calls[0][0];
      const parsed = JSON.parse(logOutput);
      expect(parsed.error.name).toBe('Error');
      expect(parsed.error.message).toBe('Test error');
      expect(parsed.error.stack).toBeDefined();
    });
  });

  describe('File Output', () => {
    test('should write to file when file logging is enabled', () => {
      const logger = new Logger('TestContext', { 
        enableFile: true,
        filePath: './logs/test.log'
      });
      
      logger.info('Test message');

      expect(mockFs.appendFileSync).toHaveBeenCalledWith(
        './logs/test.log',
        expect.stringContaining('"message":"Test message"')
      );
    });

    test('should not write to file when file logging is disabled', () => {
      const logger = new Logger('TestContext', { enableFile: false });
      
      logger.info('Test message');

      expect(mockFs.appendFileSync).not.toHaveBeenCalled();
    });

    test('should handle file write errors gracefully', () => {
      mockFs.appendFileSync.mockImplementation(() => {
        throw new Error('File write error');
      });

      const logger = new Logger('TestContext', { enableFile: true });
      
      expect(() => logger.info('Test message')).not.toThrow();
      expect(mockConsole.error).toHaveBeenCalledWith(
        'Failed to write to log file:',
        expect.any(Error)
      );
    });
  });

  describe('Configuration Updates', () => {
    test('should update configuration', () => {
      const logger = new Logger('TestContext');
      
      logger.updateConfig({ level: LogLevel.DEBUG, enableColors: false });
      const config = logger.getConfig();

      expect(config.level).toBe(LogLevel.DEBUG);
      expect(config.enableColors).toBe(false);
    });

    test('should recreate log directory after config update', () => {
      mockFs.existsSync.mockReturnValue(false);
      const logger = new Logger('TestContext');
      
      logger.updateConfig({ 
        enableFile: true,
        filePath: './new-logs/test.log'
      });

      expect(mockFs.mkdirSync).toHaveBeenCalledWith('./new-logs', { recursive: true });
    });
  });

  describe('Utility Functions', () => {
    test('createLogger should return new logger instance', () => {
      const logger1 = createLogger('Context1');
      const logger2 = createLogger('Context2');

      expect(logger1).not.toBe(logger2);
      expect(logger1.getConfig().serviceName).toBe('test-service');
    });

    test('getLogger should return singleton instance', () => {
      const logger1 = getLogger('Context1');
      const logger2 = getLogger('Context2');

      expect(logger1).toBe(logger2);
    });

    test('getLogger should create instance if not exists', () => {
      const logger = getLogger();
      expect(logger).toBeDefined();
      expect(logger.getConfig().serviceName).toBe('test-service');
    });
  });

  describe('Log Level Constants', () => {
    test('should have correct log level string mappings', () => {
      expect(LogLevelString[LogLevel.DEBUG]).toBe('DEBUG');
      expect(LogLevelString[LogLevel.INFO]).toBe('INFO');
      expect(LogLevelString[LogLevel.WARN]).toBe('WARN');
      expect(LogLevelString[LogLevel.ERROR]).toBe('ERROR');
      expect(LogLevelString[LogLevel.FATAL]).toBe('FATAL');
    });

    test('should have correct log level numeric values', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
      expect(LogLevel.FATAL).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    test('should handle undefined metadata gracefully', () => {
      const logger = new Logger('TestContext');
      
      expect(() => logger.info('Test message', undefined)).not.toThrow();
    });

    test('should handle empty context gracefully', () => {
      const logger = new Logger('');
      
      expect(() => logger.info('Test message')).not.toThrow();
    });

    test('should handle missing environment variables', () => {
      delete process.env.SERVICE_NAME;
      delete process.env.SERVICE_VERSION;
      
      const logger = new Logger();
      const config = logger.getConfig();

      expect(config.serviceName).toBe('task-management-backend');
      expect(config.serviceVersion).toBe('1.0.0');
    });
  });
});
