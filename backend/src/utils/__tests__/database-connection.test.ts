/**
 * ===================================
 * Database Connection Tests
 * ===================================
 * Purpose: Comprehensive testing for DatabaseConnection class
 * Author: Process Engineering Approach
 * Version: 1.0.0
 */

import { DatabaseConnection, ConnectionStatus, getDatabase, getPrismaClient } from '../database-connection';

// Mock Prisma Client
const mockPrismaClient = {
  $queryRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $transaction: jest.fn(),
  $disconnect: jest.fn(),
};

// Mock Prisma module
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  Prisma: {
    TransactionIsolationLevel: {
      ReadCommitted: 'ReadCommitted',
      ReadUncommitted: 'ReadUncommitted',
      RepeatableRead: 'RepeatableRead',
      Serializable: 'Serializable',
    },
  },
}));

// Mock environment variables
const originalEnv = process.env;

describe('DatabaseConnection', () => {
  let dbConnection: DatabaseConnection;

  beforeEach(() => {
    // Reset environment variables
    process.env = {
      ...originalEnv,
      DATABASE_URL: 'postgresql://test:test@localhost:5432/testdb',
      DB_MAX_CONNECTIONS: '10',
      DB_MIN_CONNECTIONS: '2',
      DB_CONNECTION_TIMEOUT: '5000',
      DB_IDLE_TIMEOUT: '3000',
      DB_RETRY_ATTEMPTS: '2',
      DB_RETRY_DELAY: '500',
      NODE_ENV: 'test',
    };

    // Clear all mocks
    jest.clearAllMocks();

    // Reset singleton instance
    (DatabaseConnection as any).instance = null;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  afterAll(async () => {
    if (dbConnection) {
      await dbConnection.disconnect();
    }
  });

  describe('Singleton Pattern', () => {
    test('should return same instance for multiple calls', () => {
      const instance1 = DatabaseConnection.getInstance();
      const instance2 = DatabaseConnection.getInstance();

      expect(instance1).toBe(instance2);
    });

    test('should use provided config on first instantiation', () => {
      const config = { maxConnections: 15 };
      const instance = DatabaseConnection.getInstance(config);

      expect(instance.getConfig().maxConnections).toBe(15);
    });
  });

  describe('Configuration', () => {
    test('should build config with environment variables', () => {
      dbConnection = DatabaseConnection.getInstance();
      const config = dbConnection.getConfig();

      expect(config.url).toBe('postgresql://test:test@localhost:5432/testdb');
      expect(config.maxConnections).toBe(10);
      expect(config.minConnections).toBe(2);
      expect(config.connectionTimeout).toBe(5000);
      expect(config.idleTimeout).toBe(3000);
      expect(config.retryAttempts).toBe(2);
      expect(config.retryDelay).toBe(500);
      expect(config.enableLogging).toBe(false); // NODE_ENV=test
    });

    test('should use default values when env vars not set', () => {
      delete process.env.DATABASE_URL;
      delete process.env.DB_MAX_CONNECTIONS;

      dbConnection = DatabaseConnection.getInstance();
      const config = dbConnection.getConfig();

      expect(config.url).toBe('postgresql://postgres:password@localhost:5432/taskdb_dev');
      expect(config.maxConnections).toBe(20);
    });

    test('should override defaults with provided config', () => {
      const customConfig = {
        maxConnections: 25,
        enableLogging: true,
      };

      dbConnection = DatabaseConnection.getInstance(customConfig);
      const config = dbConnection.getConfig();

      expect(config.maxConnections).toBe(25);
      expect(config.enableLogging).toBe(true);
    });
  });

  describe('Connection Management', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
    });

    test('should initialize connection successfully', async () => {
      dbConnection = DatabaseConnection.getInstance();

      // Wait for initialization
      await new Promise(resolve => setTimeout(resolve, 100));

      expect(dbConnection.getStatus()).toBe(ConnectionStatus.CONNECTED);
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(['SELECT 1']);
    });

    test('should handle connection failure with retry', async () => {
      mockPrismaClient.$queryRaw
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockRejectedValueOnce(new Error('Connection failed'))
        .mockResolvedValue([{ result: 1 }]);

      dbConnection = DatabaseConnection.getInstance();

      // Wait for retries
      await new Promise(resolve => setTimeout(resolve, 2000));

      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledTimes(3);
      expect(dbConnection.getStatus()).toBe(ConnectionStatus.CONNECTED);
    });

    test('should fail after max retry attempts', async () => {
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Connection failed'));

      try {
        dbConnection = DatabaseConnection.getInstance();
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error: any) {
        expect(error.message).toContain('Database connection failed after 2 attempts');
      }
    });
  });

  describe('Health Check', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
      dbConnection = DatabaseConnection.getInstance();
    });

    test('should perform health check successfully', async () => {
      const isHealthy = await dbConnection.healthCheck();

      expect(isHealthy).toBe(true);
      expect(mockPrismaClient.$queryRaw).toHaveBeenCalledWith(['SELECT 1']);
    });

    test('should return false on health check failure', async () => {
      mockPrismaClient.$queryRaw.mockRejectedValue(new Error('Health check failed'));

      const isHealthy = await dbConnection.healthCheck();

      expect(isHealthy).toBe(false);
    });
  });

  describe('Client Access', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
      dbConnection = DatabaseConnection.getInstance();
    });

    test('should return Prisma client when connected', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const client = dbConnection.getClient();
      expect(client).toBe(mockPrismaClient);
    });

    test('should throw error when not connected', () => {
      const disconnectedDb = DatabaseConnection.getInstance();
      (disconnectedDb as any).status = ConnectionStatus.DISCONNECTED;

      expect(() => disconnectedDb.getClient()).toThrow('Database connection not available');
    });
  });

  describe('Transaction Management', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
      mockPrismaClient.$transaction.mockImplementation((fn) => fn(mockPrismaClient));
      dbConnection = DatabaseConnection.getInstance();
    });

    test('should execute transaction successfully', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const transactionFn = jest.fn().mockResolvedValue('result');
      const result = await dbConnection.transaction(transactionFn);

      expect(result).toBe('result');
      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(
        transactionFn,
        expect.objectContaining({
          maxWait: 5000,
          timeout: 10000,
        })
      );
    });

    test('should execute transaction with custom options', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const transactionFn = jest.fn().mockResolvedValue('result');
      const options = {
        maxWait: 3000,
        timeout: 8000,
        isolationLevel: 'ReadCommitted' as any,
      };

      await dbConnection.transaction(transactionFn, options);

      expect(mockPrismaClient.$transaction).toHaveBeenCalledWith(
        transactionFn,
        expect.objectContaining(options)
      );
    });

    test('should handle transaction failure', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const error = new Error('Transaction failed');
      mockPrismaClient.$transaction.mockRejectedValue(error);

      await expect(
        dbConnection.transaction(jest.fn())
      ).rejects.toThrow('Transaction failed');
    });
  });

  describe('Raw Query Execution', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
      mockPrismaClient.$queryRawUnsafe.mockResolvedValue([{ result: 'test' }]);
      dbConnection = DatabaseConnection.getInstance();
    });

    test('should execute raw query successfully', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await dbConnection.executeRaw('SELECT * FROM users WHERE id = ?', '123');

      expect(result).toEqual([{ result: 'test' }]);
      expect(mockPrismaClient.$queryRawUnsafe).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        '123'
      );
    });

    test('should handle raw query failure', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const error = new Error('Query failed');
      mockPrismaClient.$queryRawUnsafe.mockRejectedValue(error);

      await expect(
        dbConnection.executeRaw('SELECT * FROM invalid_table')
      ).rejects.toThrow('Query failed');
    });
  });

  describe('Statistics and Status', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
      dbConnection = DatabaseConnection.getInstance();
    });

    test('should return current status', () => {
      const status = dbConnection.getStatus();
      expect(Object.values(ConnectionStatus)).toContain(status);
    });

    test('should return statistics', () => {
      const stats = dbConnection.getStats();

      expect(stats).toHaveProperty('status');
      expect(stats).toHaveProperty('retryCount');
      expect(stats).toHaveProperty('uptime');
      expect(stats).toHaveProperty('config');
      expect(typeof stats.uptime).toBe('number');
    });
  });

  describe('Disconnection', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
      mockPrismaClient.$disconnect.mockResolvedValue(undefined);
      dbConnection = DatabaseConnection.getInstance();
    });

    test('should disconnect successfully', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      await dbConnection.disconnect();

      expect(mockPrismaClient.$disconnect).toHaveBeenCalled();
      expect(dbConnection.getStatus()).toBe(ConnectionStatus.DISCONNECTED);
    });

    test('should handle disconnect error', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const error = new Error('Disconnect failed');
      mockPrismaClient.$disconnect.mockRejectedValue(error);

      await expect(dbConnection.disconnect()).rejects.toThrow('Disconnect failed');
    });
  });

  describe('Utility Functions', () => {
    beforeEach(() => {
      mockPrismaClient.$queryRaw.mockResolvedValue([{ result: 1 }]);
    });

    test('getDatabase should return singleton instance', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBe(db2);
    });

    test('getPrismaClient should return Prisma client', async () => {
      await new Promise(resolve => setTimeout(resolve, 100));

      const client = getPrismaClient();
      expect(client).toBe(mockPrismaClient);
    });
  });
});
