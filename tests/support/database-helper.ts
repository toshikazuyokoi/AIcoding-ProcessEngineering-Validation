/**
 * ===================================
 * Integration Test Database Helper
 * ===================================
 * Generated for TSK-IT-000-002-TestDatabase
 * Project: Task Management System - Integration Test
 * Purpose: Database management utilities for integration testing
 */

import { Pool, PoolClient } from 'pg';

/**
 * Integration test database configuration
 */
export interface IntegrationDatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  maxConnections?: number;
  connectionTimeout?: number;
}

/**
 * Test data seeding options
 */
export interface TestDataSeedOptions {
  includeUsers?: boolean;
  includeTasks?: boolean;
  includeCategories?: boolean;
  userCount?: number;
  taskCount?: number;
  categoryCount?: number;
  cleanBeforeSeed?: boolean;
}

/**
 * Database cleanup options
 */
export interface DatabaseCleanupOptions {
  tables?: string[];
  resetSequences?: boolean;
  preserveSchema?: boolean;
  cascadeDelete?: boolean;
}

/**
 * Integration Test Database Helper Class
 */
export class IntegrationDatabaseHelper {
  private pool: Pool | null = null;
  private config: IntegrationDatabaseConfig;

  constructor(config?: Partial<IntegrationDatabaseConfig>) {
    this.config = {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: parseInt(process.env.POSTGRES_PORT || '5434'),
      database: process.env.POSTGRES_DB || 'taskdb_integration',
      username: process.env.POSTGRES_USER || 'integration_user',
      password: process.env.POSTGRES_PASSWORD || 'integration_password_123',
      maxConnections: 10,
      connectionTimeout: 30000,
      ...config
    };
  }

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    if (this.pool) {
      return;
    }

    this.pool = new Pool({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      max: this.config.maxConnections,
      connectionTimeoutMillis: this.config.connectionTimeout,
      idleTimeoutMillis: 30000,
      ssl: false
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT 1');
      client.release();
      console.log('✅ Integration database connection established');
    } catch (error) {
      console.error('❌ Failed to connect to integration database:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('✅ Integration database connection closed');
    }
  }

  /**
   * Execute SQL query
   */
  async query(sql: string, params?: any[]): Promise<any> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    try {
      const result = await this.pool.query(sql, params);
      return result;
    } catch (error) {
      console.error('❌ Database query failed:', error);
      throw error;
    }
  }

  /**
   * Execute SQL query with transaction
   */
  async queryWithTransaction<T>(
    callback: (client: PoolClient) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }

    const client = await this.pool.connect();
    
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Clean up test database
   */
  async cleanup(options: DatabaseCleanupOptions = {}): Promise<void> {
    const {
      tables = [],
      resetSequences = true,
      preserveSchema = true,
      cascadeDelete = true
    } = options;

    try {
      await this.queryWithTransaction(async (client) => {
        // If specific tables are provided, clean only those
        if (tables.length > 0) {
          for (const table of tables) {
            const deleteOption = cascadeDelete ? 'CASCADE' : '';
            await client.query(`DELETE FROM ${table} ${deleteOption}`);
          }
        } else {
          // Clean all data tables in correct order (respecting foreign keys)
          await client.query('DELETE FROM tasks CASCADE');
          await client.query('DELETE FROM categories CASCADE');
          await client.query('DELETE FROM users CASCADE');
        }

        // Reset sequences if requested
        if (resetSequences) {
          await client.query(`
            SELECT setval(pg_get_serial_sequence('users', 'id'), 1, false);
            SELECT setval(pg_get_serial_sequence('categories', 'id'), 1, false);
            SELECT setval(pg_get_serial_sequence('tasks', 'id'), 1, false);
          `);
        }
      });

      console.log('✅ Integration database cleaned successfully');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
      throw error;
    }
  }

  /**
   * Seed test data
   */
  async seedTestData(options: TestDataSeedOptions = {}): Promise<void> {
    const {
      includeUsers = true,
      includeTasks = true,
      includeCategories = true,
      userCount = 3,
      taskCount = 10,
      categoryCount = 5,
      cleanBeforeSeed = true
    } = options;

    try {
      if (cleanBeforeSeed) {
        await this.cleanup();
      }

      await this.queryWithTransaction(async (client) => {
        // Seed users
        if (includeUsers) {
          await this.seedUsers(client, userCount);
        }

        // Seed categories
        if (includeCategories) {
          await this.seedCategories(client, categoryCount);
        }

        // Seed tasks
        if (includeTasks) {
          await this.seedTasks(client, taskCount);
        }
      });

      console.log('✅ Test data seeded successfully');
    } catch (error) {
      console.error('❌ Test data seeding failed:', error);
      throw error;
    }
  }

  /**
   * Seed users
   */
  private async seedUsers(client: PoolClient, count: number): Promise<void> {
    const users = [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        email: 'test@example.com',
        password_hash: '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO',
        first_name: 'Test',
        last_name: 'User',
        role: 'user'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'admin@example.com',
        password_hash: '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin'
      }
    ];

    // Add additional users if requested
    for (let i = 2; i < count; i++) {
      users.push({
        id: `550e8400-e29b-41d4-a716-44665544000${i}`,
        email: `user${i}@example.com`,
        password_hash: '$2b$10$rQZ9QmjQQm9QmjQQm9QmjO',
        first_name: `User${i}`,
        last_name: 'Test',
        role: 'user'
      });
    }

    for (const user of users) {
      await client.query(`
        INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, email_verified)
        VALUES ($1, $2, $3, $4, $5, $6, true, true)
        ON CONFLICT (email) DO NOTHING
      `, [user.id, user.email, user.password_hash, user.first_name, user.last_name, user.role]);
    }
  }

  /**
   * Seed categories
   */
  private async seedCategories(client: PoolClient, count: number): Promise<void> {
    const categories = [
      { name: 'Work', description: 'Work related tasks', color: '#007bff' },
      { name: 'Personal', description: 'Personal tasks', color: '#28a745' },
      { name: 'Shopping', description: 'Shopping list', color: '#ffc107' },
      { name: 'Health', description: 'Health and fitness', color: '#dc3545' },
      { name: 'Learning', description: 'Learning and education', color: '#6f42c1' }
    ];

    const userId = '550e8400-e29b-41d4-a716-446655440000';

    for (let i = 0; i < Math.min(count, categories.length); i++) {
      const category = categories[i];
      await client.query(`
        INSERT INTO categories (id, name, description, color, user_id)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (name, user_id) DO NOTHING
      `, [
        `660e8400-e29b-41d4-a716-44665544000${i}`,
        category.name,
        category.description,
        category.color,
        userId
      ]);
    }
  }

  /**
   * Seed tasks
   */
  private async seedTasks(client: PoolClient, count: number): Promise<void> {
    const userId = '550e8400-e29b-41d4-a716-446655440000';
    const categoryId = '660e8400-e29b-41d4-a716-446655440000';
    
    const statuses = ['pending', 'in_progress', 'completed'];
    const priorities = ['low', 'medium', 'high'];

    for (let i = 0; i < count; i++) {
      await client.query(`
        INSERT INTO tasks (id, title, description, status, priority, user_id, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [
        `770e8400-e29b-41d4-a716-44665544000${i.toString().padStart(1, '0')}`,
        `Integration Test Task ${i + 1}`,
        `This is integration test task ${i + 1} for testing purposes`,
        statuses[i % statuses.length],
        priorities[i % priorities.length],
        userId,
        categoryId
      ]);
    }
  }

  /**
   * Check database health
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch (error) {
      console.error('❌ Database health check failed:', error);
      return false;
    }
  }

  /**
   * Get database statistics
   */
  async getStatistics(): Promise<any> {
    try {
      const userCount = await this.query('SELECT COUNT(*) as count FROM users');
      const taskCount = await this.query('SELECT COUNT(*) as count FROM tasks');
      const categoryCount = await this.query('SELECT COUNT(*) as count FROM categories');

      return {
        users: parseInt(userCount.rows[0].count),
        tasks: parseInt(taskCount.rows[0].count),
        categories: parseInt(categoryCount.rows[0].count),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to get database statistics:', error);
      throw error;
    }
  }

  /**
   * Reset test data to initial state
   */
  async resetToInitialState(): Promise<void> {
    try {
      await this.cleanup();
      await this.query('SELECT reset_test_data()');
      console.log('✅ Database reset to initial state');
    } catch (error) {
      console.error('❌ Failed to reset database:', error);
      throw error;
    }
  }
}

/**
 * Global instance for integration tests
 */
let globalDatabaseHelper: IntegrationDatabaseHelper | null = null;

/**
 * Get global database helper instance
 */
export function getIntegrationDatabaseHelper(config?: Partial<IntegrationDatabaseConfig>): IntegrationDatabaseHelper {
  if (!globalDatabaseHelper) {
    globalDatabaseHelper = new IntegrationDatabaseHelper(config);
  }
  return globalDatabaseHelper;
}

/**
 * Initialize integration test database
 */
export async function setupIntegrationDatabase(config?: Partial<IntegrationDatabaseConfig>): Promise<IntegrationDatabaseHelper> {
  const helper = getIntegrationDatabaseHelper(config);
  await helper.initialize();
  return helper;
}

/**
 * Cleanup integration test database
 */
export async function teardownIntegrationDatabase(): Promise<void> {
  if (globalDatabaseHelper) {
    await globalDatabaseHelper.close();
    globalDatabaseHelper = null;
  }
}
