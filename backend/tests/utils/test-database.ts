/**
 * Test Database Utility
 * 
 * Comprehensive test database management utility for Jest testing environment
 * Provides database setup, cleanup, seeding, and transaction management for tests
 * 
 * @fileoverview Test database utility for comprehensive test data management
 * @version 1.0.0
 * @since 2025-02-01
 */

import { PrismaClient, TaskPriority, TaskStatus, UserRole } from '@prisma/client';
import { DatabaseConnection } from '../../src/utils/database-connection';

// ===================================
// Types and Interfaces
// ===================================

/**
 * Test database configuration options
 */
export interface TestDatabaseConfig {
  /** Database URL for testing */
  databaseUrl?: string;
  /** Enable logging for debugging */
  enableLogging?: boolean;
  /** Maximum connections for test pool */
  maxConnections?: number;
  /** Connection timeout in milliseconds */
  connectionTimeout?: number;
  /** Auto cleanup after tests */
  autoCleanup?: boolean;
}

/**
 * Test data seeding options
 */
export interface TestSeedOptions {
  /** Include user test data */
  includeUsers?: boolean;
  /** Include task test data */
  includeTasks?: boolean;
  /** Include category test data */
  includeCategories?: boolean;
  /** Number of records to create */
  recordCount?: number;
  /** Custom seed data */
  customData?: Record<string, any[]>;
}

/**
 * Database cleanup options
 */
export interface CleanupOptions {
  /** Tables to clean (empty array means all tables) */
  tables?: string[];
  /** Reset auto-increment sequences */
  resetSequences?: boolean;
  /** Preserve specific records */
  preserveRecords?: Record<string, any[]>;
}

/**
 * Transaction test context
 */
export interface TransactionTestContext {
  /** Prisma client within transaction */
  prisma: PrismaClient;
  /** Rollback function */
  rollback: () => Promise<void>;
  /** Commit function */
  commit: () => Promise<void>;
}

// ===================================
// Test Database Manager Class
// ===================================

/**
 * Test Database Manager
 * Manages database operations for testing environment
 */
export class TestDatabaseManager {
  private static instance: TestDatabaseManager | null = null;
  private prisma: PrismaClient | null = null;
  private dbConnection: DatabaseConnection | null = null;
  private config: TestDatabaseConfig;
  private isInitialized: boolean = false;
  private activeTransactions: Set<string> = new Set();

  /**
   * Private constructor for singleton pattern
   */
  private constructor(config: TestDatabaseConfig = {}) {
    this.config = {
      databaseUrl: config.databaseUrl || process.env.TEST_DATABASE_URL || 
        'postgresql://test_user:test_password@localhost:5432/test_db',
      enableLogging: config.enableLogging ?? false,
      maxConnections: config.maxConnections || 5,
      connectionTimeout: config.connectionTimeout || 10000,
      autoCleanup: config.autoCleanup ?? true,
      ...config
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: TestDatabaseConfig): TestDatabaseManager {
    if (!TestDatabaseManager.instance) {
      TestDatabaseManager.instance = new TestDatabaseManager(config);
    }
    return TestDatabaseManager.instance;
  }

  /**
   * Reset singleton instance (for testing)
   */
  public static resetInstance(): void {
    TestDatabaseManager.instance = null;
  }

  /**
   * Initialize test database connection
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Set test environment
      process.env.NODE_ENV = 'test';
      if (this.config.databaseUrl) {
        process.env.DATABASE_URL = this.config.databaseUrl;
      }

      // Create Prisma client for testing
      this.prisma = new PrismaClient({
        datasources: {
          db: {
            url: this.config.databaseUrl!
          }
        },
        log: this.config.enableLogging ? ['query', 'info', 'warn', 'error'] : ['error'],
        errorFormat: 'pretty'
      });

      // Test connection
      await this.prisma.$queryRaw`SELECT 1`;

      this.isInitialized = true;
      console.log('✅ Test database initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize test database:', error);
      throw new Error(`Test database initialization failed: ${error}`);
    }
  }

  /**
   * Get Prisma client instance
   */
  public getPrismaClient(): PrismaClient {
    if (!this.prisma) {
      throw new Error('Test database not initialized. Call initialize() first.');
    }
    return this.prisma;
  }

  /**
   * Check if database is initialized
   */
  public isReady(): boolean {
    return this.isInitialized && this.prisma !== null;
  }

  /**
   * Clean up all test data
   */
  public async cleanup(options: CleanupOptions = {}): Promise<void> {
    if (!this.prisma) {
      throw new Error('Test database not initialized');
    }

    try {
      const tablesToClean = options.tables || [
        'task_categories',
        'tasks',
        'categories',
        'users'
      ];

      // Clean tables in reverse dependency order (PostgreSQL)
      for (const table of tablesToClean) {
        if (options.preserveRecords && options.preserveRecords[table]) {
          // Preserve specific records
          const preserveIds = options.preserveRecords[table].map(record => `'${record.id}'`);
          await this.prisma.$executeRawUnsafe(
            `DELETE FROM ${table} WHERE id NOT IN (${preserveIds.join(',')})`
          );
        } else {
          // Clean all records
          await this.prisma.$executeRawUnsafe(`DELETE FROM ${table}`);
        }

        // Reset sequences if requested (PostgreSQL)
        if (options.resetSequences && table !== 'task_categories') {
          await this.prisma.$executeRawUnsafe(`ALTER SEQUENCE ${table}_id_seq RESTART WITH 1`);
        }
      }

      console.log('✅ Test database cleaned successfully');

    } catch (error) {
      console.error('❌ Failed to clean test database:', error);
      throw new Error(`Test database cleanup failed: ${error}`);
    }
  }

  /**
   * Seed test database with sample data
   */
  public async seed(options: TestSeedOptions = {}): Promise<void> {
    if (!this.prisma) {
      throw new Error('Test database not initialized');
    }

    try {
      const recordCount = options.recordCount || 3;

      // Seed users if requested
      if (options.includeUsers !== false) {
        await this.seedUsers(recordCount);
      }

      // Seed categories if requested
      if (options.includeCategories !== false) {
        await this.seedCategories(recordCount);
      }

      // Seed tasks if requested
      if (options.includeTasks !== false) {
        await this.seedTasks(recordCount);
      }

      // Seed custom data if provided
      if (options.customData) {
        await this.seedCustomData(options.customData);
      }

      console.log('✅ Test database seeded successfully');

    } catch (error) {
      console.error('❌ Failed to seed test database:', error);
      throw new Error(`Test database seeding failed: ${error}`);
    }
  }

  /**
   * Seed test users
   */
  private async seedUsers(count: number): Promise<void> {
    const users = [];
    for (let i = 1; i <= count; i++) {
      users.push({
        email: `testuser${i}@example.com`,
        username: `testuser${i}`,
        passwordHash: '$2b$10$test.password.hash.for.testing.only',
        role: i === 1 ? UserRole.admin : UserRole.user,
        isActive: true
      });
    }

    await this.prisma!.user.createMany({
      data: users,
      skipDuplicates: true
    });
  }

  /**
   * Seed test categories
   */
  private async seedCategories(count: number): Promise<void> {
    const categories = [];
    const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'];

    for (let i = 1; i <= count; i++) {
      categories.push({
        name: `Test Category ${i}`,
        color: colors[(i - 1) % colors.length],
        description: `Test category ${i} description`
      });
    }

    await this.prisma!.category.createMany({
      data: categories,
      skipDuplicates: true
    });
  }

  /**
   * Seed test tasks
   */
  private async seedTasks(count: number): Promise<void> {
    // First, get existing users to reference
    const users = await this.prisma!.user.findMany({ take: count });
    if (users.length === 0) {
      console.warn('No users found for task seeding. Seeding users first.');
      await this.seedUsers(count);
      const newUsers = await this.prisma!.user.findMany({ take: count });
      if (newUsers.length === 0) {
        throw new Error('Failed to create users for task seeding');
      }
    }

    const tasks = [];
    const statuses: TaskStatus[] = [TaskStatus.pending, TaskStatus.in_progress, TaskStatus.completed];
    const priorities: TaskPriority[] = [TaskPriority.low, TaskPriority.medium, TaskPriority.high];
    const availableUsers = await this.prisma!.user.findMany({ take: count });

    for (let i = 1; i <= count; i++) {
      const user = availableUsers[(i - 1) % availableUsers.length];
      tasks.push({
        userId: user.id,
        title: `Test Task ${i}`,
        description: `Test task ${i} description`,
        status: statuses[(i - 1) % statuses.length],
        priority: priorities[(i - 1) % priorities.length],
        dueDate: new Date(Date.now() + (i * 24 * 60 * 60 * 1000))
      });
    }

    await this.prisma!.task.createMany({
      data: tasks,
      skipDuplicates: true
    });
  }

  /**
   * Seed custom data
   */
  private async seedCustomData(customData: Record<string, any[]>): Promise<void> {
    for (const [tableName, records] of Object.entries(customData)) {
      const model = (this.prisma as any)[tableName.toLowerCase()];
      if (model && model.createMany) {
        await model.createMany({
          data: records,
          skipDuplicates: true
        });
      }
    }
  }

  /**
   * Execute function within transaction context
   */
  public async withTransaction<T>(
    fn: (context: TransactionTestContext) => Promise<T>
  ): Promise<T> {
    if (!this.prisma) {
      throw new Error('Test database not initialized');
    }

    const transactionId = `tx-${Date.now()}-${Math.random()}`;
    this.activeTransactions.add(transactionId);

    try {
      return await this.prisma.$transaction(async (prisma) => {
        let isCommitted = false;
        let isRolledBack = false;

        const context: TransactionTestContext = {
          prisma: prisma as PrismaClient,
          commit: async () => {
            if (isRolledBack) {
              throw new Error('Transaction already rolled back');
            }
            isCommitted = true;
          },
          rollback: async () => {
            if (isCommitted) {
              throw new Error('Transaction already committed');
            }
            isRolledBack = true;
            throw new Error('Transaction rolled back');
          }
        };

        const result = await fn(context);

        if (isRolledBack) {
          throw new Error('Transaction was rolled back');
        }

        return result;
      });

    } catch (error) {
      if (error instanceof Error && error.message === 'Transaction rolled back') {
        // Expected rollback, not an error
        return undefined as T;
      }
      throw error;
    } finally {
      this.activeTransactions.delete(transactionId);
    }
  }

  /**
   * Get database health status
   */
  public async healthCheck(): Promise<boolean> {
    if (!this.prisma) {
      return false;
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      console.error('Test database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  public async getStats(): Promise<Record<string, number>> {
    if (!this.prisma) {
      throw new Error('Test database not initialized');
    }

    try {
      const [userCount, taskCount, categoryCount] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.task.count(),
        this.prisma.category.count()
      ]);

      return {
        users: userCount,
        tasks: taskCount,
        categories: categoryCount,
        activeTransactions: this.activeTransactions.size
      };
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return {};
    }
  }

  /**
   * Disconnect from test database
   */
  public async disconnect(): Promise<void> {
    if (this.prisma) {
      await this.prisma.$disconnect();
      this.prisma = null;
    }

    if (this.dbConnection) {
      await this.dbConnection.disconnect();
      this.dbConnection = null;
    }

    this.isInitialized = false;
    this.activeTransactions.clear();
    console.log('✅ Test database disconnected');
  }
}

// ===================================
// Utility Functions
// ===================================

/**
 * Get test database manager instance
 */
export function getTestDatabase(config?: TestDatabaseConfig): TestDatabaseManager {
  return TestDatabaseManager.getInstance(config);
}

/**
 * Initialize test database for Jest setup
 */
export async function setupTestDatabase(config?: TestDatabaseConfig): Promise<TestDatabaseManager> {
  const testDb = getTestDatabase(config);
  await testDb.initialize();
  return testDb;
}

/**
 * Clean up test database for Jest teardown
 */
export async function teardownTestDatabase(): Promise<void> {
  const testDb = TestDatabaseManager.getInstance();
  if (testDb.isReady()) {
    await testDb.cleanup();
    await testDb.disconnect();
  }
  TestDatabaseManager.resetInstance();
}

/**
 * Create test database with seeded data
 */
export async function createTestDatabaseWithData(
  seedOptions?: TestSeedOptions,
  config?: TestDatabaseConfig
): Promise<TestDatabaseManager> {
  const testDb = await setupTestDatabase(config);
  await testDb.cleanup();
  await testDb.seed(seedOptions);
  return testDb;
}

/**
 * Execute test within clean database context
 */
export async function withCleanDatabase<T>(
  fn: (testDb: TestDatabaseManager) => Promise<T>,
  config?: TestDatabaseConfig
): Promise<T> {
  const testDb = await setupTestDatabase(config);
  await testDb.cleanup();
  
  try {
    return await fn(testDb);
  } finally {
    await testDb.cleanup();
  }
}

/**
 * Execute test within transaction that auto-rolls back
 */
export async function withTestTransaction<T>(
  fn: (context: TransactionTestContext) => Promise<T>,
  config?: TestDatabaseConfig
): Promise<void> {
  const testDb = await setupTestDatabase(config);
  
  await testDb.withTransaction(async (context) => {
    await fn(context);
    await context.rollback(); // Always rollback test transactions
  });
}
