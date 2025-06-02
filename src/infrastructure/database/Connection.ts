import * as sqlite3 from 'sqlite3';
import { DatabaseConfig, DatabaseConnection, Transaction, DatabaseConfigError } from '../../config/database';
import { createDatabaseConfig } from '../../config/database';

/**
 * データベース結果型
 */
export interface DatabaseResult {
  lastInsertRowid?: number;
  changes: number;
}

/**
 * 接続プール設定
 */
export interface PoolConfig {
  database: DatabaseConfig;
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  idleTimeoutMillis: number;
}

/**
 * ヘルスチェック設定
 */
export interface HealthCheckConfig {
  intervalMs: number;
  timeoutMs: number;
  retryAttempts: number;
}

/**
 * 接続メトリクス
 */
export interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  failedConnections: number;
  successfulConnections: number;
  averageResponseTime: number;
  minResponseTime: number;
  maxResponseTime: number;
  totalHealthChecks: number;
  successRate: number;
  lastHealthCheck: Date;
  uptimeMs: number;
}

/**
 * Result型（エラーハンドリング用）
 */
export type Result<T, E> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ success: false, error });

/**
 * 高度なデータベース接続クラス
 */
export class EnhancedDatabaseConnection implements DatabaseConnection {
  private db: sqlite3.Database | null = null;
  private _isConnected: boolean = false;
  private transactionDepth: number = 0;
  
  // Enhanced Metrics Fields
  private queryCount: number = 0;
  private totalResponseTime: number = 0;
  private errorCount: number = 0;
  private lastQueryTime: Date | null = null;
  private minResponseTime: number = Infinity;
  private maxResponseTime: number = 0;
  private successfulQueries: number = 0;

  constructor(private config: DatabaseConfig) {
    this.validateConfig(config);
  }

  async connect(): Promise<Result<void, DatabaseConfigError>> {
    try {
      this.db = new sqlite3.Database(this.config.database, (err) => {
        if (err) {
          throw new DatabaseConfigError(`Connection failed: ${err.message}`, err);
        }
      });

      await this.enableForeignKeys();
      await this.setPragmas();
      this._isConnected = true;

      return Ok(undefined);
    } catch (error) {
      return Err(new DatabaseConfigError(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined));
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this._isConnected || !this.db) {
      throw new DatabaseConfigError('Database not connected');
    }

    try {
      const startTime = Date.now();
      const result = await this.executeQuery<T>(sql, params);
      const responseTime = Date.now() - startTime;
      this.logQuery(sql, params, responseTime);
      this.updateMetrics(responseTime, true);

      return result;
    } catch (error) {
      this.logError(sql, params, error);
      this.updateMetrics(0, false);
      throw new DatabaseConfigError(`Query failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined);
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    if (!this._isConnected || !this.db) {
      throw new DatabaseConfigError('Database not connected');
    }

    try {
      const startTime = Date.now();
      const result = await this.executeStatement(sql, params);
      const responseTime = Date.now() - startTime;
      this.logQuery(sql, params, responseTime);
      this.updateMetrics(responseTime, true);
    } catch (error) {
      this.logError(sql, params, error);
      this.updateMetrics(0, false);
      throw new DatabaseConfigError(`Execute failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined);
    }
  }

  async transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T> {
    if (!this._isConnected || !this.db) {
      throw new DatabaseConfigError('Database not connected');
    }

    const transaction: Transaction = {
      query: <R>(sql: string, params: any[] = []): Promise<R[]> => {
        return this.executeQuery<R>(sql, params);
      },

      execute: async (sql: string, params: any[] = []): Promise<void> => {
        await this.executeStatement(sql, params);
      },

      commit: async (): Promise<void> => {
        await this.executeStatement('COMMIT');
      },

      rollback: async (): Promise<void> => {
        await this.executeStatement('ROLLBACK');
      }
    };

    try {
      this.transactionDepth++;
      await this.executeStatement('BEGIN TRANSACTION');
      
      const result = await callback(transaction);
      await transaction.commit();
      
      this.transactionDepth--;
      return result;
    } catch (error) {
      await transaction.rollback();
      this.transactionDepth--;
      throw error;
    }
  }

  async close(): Promise<void> {
    if (this.db && this._isConnected) {
      await new Promise<void>((resolve, reject) => {
        this.db!.close((err) => {
          if (err) {
            reject(new DatabaseConfigError(`Close failed: ${err.message}`, err));
          } else {
            this._isConnected = false;
            this.db = null;
            resolve();
          }
        });
      });
    }
  }

  isConnected(): boolean {
    return this._isConnected && this.db !== null;
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as health_check');
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  // 内部メソッド
  private validateConfig(config: DatabaseConfig): void {
    if (!config.database) {
      throw new DatabaseConfigError('Database path is required');
    }
  }

  private async enableForeignKeys(): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      this.db!.run('PRAGMA foreign_keys = ON', (err) => {
        if (err) reject(new DatabaseConfigError(`Failed to enable foreign keys: ${err.message}`, err));
        else resolve();
      });
    });
  }

  private async setPragmas(): Promise<void> {
    if (!this.db) return;

    const pragmas = [
      'PRAGMA journal_mode = WAL',
      'PRAGMA synchronous = NORMAL',
      'PRAGMA temp_store = MEMORY',
      'PRAGMA mmap_size = 67108864'
    ];

    for (const pragma of pragmas) {
      await new Promise<void>((resolve, reject) => {
        this.db!.run(pragma, (err) => {
          if (err) reject(new DatabaseConfigError(`Failed to set pragma: ${pragma}`, err));
          else resolve();
        });
      });
    }
  }

  private async executeQuery<T>(sql: string, params: any[] = []): Promise<T[]> {
    if (!this.db) throw new DatabaseConfigError('Database not connected');

    return new Promise((resolve, reject) => {
      this.db!.all(sql, params, (err, rows) => {
        if (err) {
          reject(new DatabaseConfigError(`Query execution failed: ${err.message}`, err));
        } else {
          resolve(rows as T[]);
        }
      });
    });
  }

  private async executeStatement(sql: string, params: any[] = []): Promise<DatabaseResult> {
    if (!this.db) throw new DatabaseConfigError('Database not connected');

    return new Promise((resolve, reject) => {
      this.db!.run(sql, params, function(err) {
        if (err) {
          reject(new DatabaseConfigError(`Statement execution failed: ${err.message}`, err));
        } else {
          resolve({
            lastInsertRowid: this.lastID,
            changes: this.changes
          });
        }
      });
    });
  }

  private logQuery(sql: string, params: any[], responseTime: number): void {
    if (this.config.options.verbose) {
      console.log(`[DB Query] ${sql} [${params.join(', ')}] (${responseTime}ms)`);
    }
  }

  private logError(sql: string, params: any[], error: any): void {
    console.error(`[DB Error] ${sql} [${params.join(', ')}]`, error);
  }

  private updateMetrics(responseTime: number, success: boolean): void {
    this.queryCount++; // Total query count (success + error)
    this.lastQueryTime = new Date();
    
    if (success) {
      this.successfulQueries++;
      this.totalResponseTime += responseTime;
      
      // Update min/max response times
      if (responseTime < this.minResponseTime) {
        this.minResponseTime = responseTime;
      }
      if (responseTime > this.maxResponseTime) {
        this.maxResponseTime = responseTime;
      }
    } else {
      this.errorCount++;
    }
  }

  getMetrics(): { 
    queryCount: number; 
    successfulQueries: number;
    errorCount: number;
    averageResponseTime: number; 
    minResponseTime: number;
    maxResponseTime: number;
    successRate: number;
    lastQueryTime: Date | null;
  } {
    return {
      queryCount: this.queryCount,
      successfulQueries: this.successfulQueries,
      errorCount: this.errorCount,
      averageResponseTime: this.successfulQueries > 0 ? this.totalResponseTime / this.successfulQueries : 0,
      minResponseTime: this.minResponseTime === Infinity ? 0 : this.minResponseTime,
      maxResponseTime: this.maxResponseTime,
      successRate: this.queryCount > 0 ? (this.successfulQueries / this.queryCount) * 100 : 0,
      lastQueryTime: this.lastQueryTime
    };
  }
}

/**
 * 高度な接続プール管理クラス
 */
export class EnhancedConnectionPool {
  private connections: EnhancedDatabaseConnection[] = [];
  private availableConnections: EnhancedDatabaseConnection[] = [];
  private busyConnections: Set<EnhancedDatabaseConnection> = new Set();
  private waitingQueue: Array<{
    resolve: (connection: EnhancedDatabaseConnection) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];
  
  // Pool Metrics
  private totalAcquiredConnections: number = 0;
  private totalReleasedConnections: number = 0;
  private connectionTimeouts: number = 0;
  private peakConnectionsUsed: number = 0;

  constructor(private config: PoolConfig) {
    this.validatePoolConfig(config);
  }

  async initialize(): Promise<Result<void, DatabaseConfigError>> {
    try {
      // 最小接続数分の接続を作成
      for (let i = 0; i < this.config.min; i++) {
        const connection = new EnhancedDatabaseConnection(this.config.database);
        const connectResult = await connection.connect();

        if (!connectResult.success) {
          return Err(connectResult.error);
        }

        this.connections.push(connection);
        this.availableConnections.push(connection);
      }

      return Ok(undefined);
    } catch (error) {
      return Err(new DatabaseConfigError(`Pool initialization failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined));
    }
  }

  async acquire(): Promise<EnhancedDatabaseConnection> {
    // 利用可能な接続がある場合
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.pop()!;
      this.busyConnections.add(connection);
      this.updateAcquireMetrics();
      return connection;
    }

    // 最大接続数に達していない場合、新しい接続を作成
    if (this.connections.length < this.config.max) {
      const connection = new EnhancedDatabaseConnection(this.config.database);
      const connectResult = await connection.connect();

      if (connectResult.success) {
        this.connections.push(connection);
        this.busyConnections.add(connection);
        this.updateAcquireMetrics();
        return connection;
      }
    }

    // 接続を待機
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeFromQueue(resolve);
        this.connectionTimeouts++;
        reject(new DatabaseConfigError('Connection acquire timeout'));
      }, this.config.acquireTimeoutMillis);

      this.waitingQueue.push({ 
        resolve: (connection: EnhancedDatabaseConnection) => {
          this.updateAcquireMetrics();
          resolve(connection);
        }, 
        reject, 
        timeout 
      });
    });
  }

  release(connection: EnhancedDatabaseConnection): void {
    if (!this.busyConnections.has(connection)) {
      throw new DatabaseConfigError('Connection not acquired from this pool');
    }

    this.busyConnections.delete(connection);
    this.totalReleasedConnections++;

    // 待機中のリクエストがある場合
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      clearTimeout(waiter.timeout);
      this.busyConnections.add(connection);
      // ここではメトリクス更新しない（既にacquire時に更新済み）
      waiter.resolve(connection);
      return;
    }

    // アイドル接続として戻す
    this.availableConnections.push(connection);
  }

  async closeAll(): Promise<void> {
    // 待機キューをクリア
    for (const waiter of this.waitingQueue) {
      clearTimeout(waiter.timeout);
      waiter.reject(new DatabaseConfigError('Pool is being closed'));
    }
    this.waitingQueue = [];

    // 全接続を閉じる
    const closePromises = this.connections.map(conn => conn.close());
    await Promise.all(closePromises);

    this.connections = [];
    this.availableConnections = [];
    this.busyConnections.clear();
  }

  private updateAcquireMetrics(): void {
    this.totalAcquiredConnections++;
    const currentBusy = this.busyConnections.size;
    if (currentBusy > this.peakConnectionsUsed) {
      this.peakConnectionsUsed = currentBusy;
    }
  }

  getPoolStatus(): {
    total: number;
    available: number;
    busy: number;
    waiting: number;
    totalAcquired: number;
    totalReleased: number;
    connectionTimeouts: number;
    peakUsed: number;
    utilizationRate: number;
  } {
    return {
      total: this.connections.length,
      available: this.availableConnections.length,
      busy: this.busyConnections.size,
      waiting: this.waitingQueue.length,
      totalAcquired: this.totalAcquiredConnections,
      totalReleased: this.totalReleasedConnections,
      connectionTimeouts: this.connectionTimeouts,
      peakUsed: this.peakConnectionsUsed,
      utilizationRate: this.connections.length > 0 
        ? (this.busyConnections.size / this.connections.length) * 100 
        : 0
    };
  }

  private validatePoolConfig(config: PoolConfig): void {
    if (config.min < 1) {
      throw new DatabaseConfigError('Minimum pool size must be at least 1');
    }
    if (config.max < config.min) {
      throw new DatabaseConfigError('Maximum pool size must be greater than or equal to minimum');
    }
    if (config.acquireTimeoutMillis < 100) {
      throw new DatabaseConfigError('Acquire timeout must be at least 100ms');
    }
  }

  private removeFromQueue(resolve: (connection: EnhancedDatabaseConnection) => void): void {
    const index = this.waitingQueue.findIndex(waiter => waiter.resolve === resolve);
    if (index !== -1) {
      this.waitingQueue.splice(index, 1);
    }
  }
}

/**
 * トランザクション管理クラス
 */
export class TransactionManager {
  private activeTransactions: Map<string, EnhancedTransaction> = new Map();
  private connectionLocks: Map<EnhancedDatabaseConnection, boolean> = new Map();

  async transaction<T>(
    connection: EnhancedDatabaseConnection,
    callback: (trx: EnhancedTransaction) => Promise<T>
  ): Promise<Result<T, DatabaseConfigError>> {
    // Check if connection is already in use for a transaction
    if (this.connectionLocks.get(connection)) {
      return Err(new DatabaseConfigError('Connection is already in use for another transaction'));
    }

    const transactionId = this.generateTransactionId();
    const transaction = new EnhancedTransaction(connection, transactionId);

    try {
      this.connectionLocks.set(connection, true);
      this.activeTransactions.set(transactionId, transaction);

      await transaction.begin();
      const result = await callback(transaction);
      await transaction.commit();

      this.activeTransactions.delete(transactionId);
      this.connectionLocks.delete(connection);
      return Ok(result);
    } catch (error) {
      await transaction.rollback();
      this.activeTransactions.delete(transactionId);
      this.connectionLocks.delete(connection);
      return Err(new DatabaseConfigError(`Transaction failed: ${error instanceof Error ? error.message : String(error)}`, error instanceof Error ? error : undefined));
    }
  }

  async rollbackAll(): Promise<void> {
    const rollbackPromises = Array.from(this.activeTransactions.values())
      .map(transaction => transaction.rollback());

    await Promise.all(rollbackPromises);
    this.activeTransactions.clear();
  }

  private generateTransactionId(): string {
    return `trx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * 拡張トランザクションクラス
 */
export class EnhancedTransaction implements Transaction {
  private isActive: boolean = false;
  private savepoints: string[] = [];

  constructor(
    private connection: EnhancedDatabaseConnection,
    private id: string
  ) {}

  async begin(): Promise<void> {
    if (this.isActive) {
      throw new DatabaseConfigError('Transaction already active');
    }
    await this.connection.execute('BEGIN TRANSACTION');
    this.isActive = true;
  }

  async commit(): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseConfigError('No active transaction to commit');
    }

    await this.connection.execute('COMMIT');
    this.isActive = false;
  }

  async rollback(): Promise<void> {
    if (!this.isActive) {
      return; // Already rolled back or not started
    }

    try {
      await this.connection.execute('ROLLBACK');
    } catch (error) {
      console.error('Failed to rollback transaction:', error);
    }
    this.isActive = false;
  }

  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    if (!this.isActive) {
      throw new DatabaseConfigError('Transaction not active');
    }
    return this.connection.query<T>(sql, params);
  }

  async execute(sql: string, params?: any[]): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseConfigError('Transaction not active');
    }
    return this.connection.execute(sql, params);
  }

  async savepoint(name: string): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseConfigError('Transaction not active');
    }

    await this.connection.execute(`SAVEPOINT ${name}`);
    this.savepoints.push(name);
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseConfigError('Transaction not active');
    }

    await this.connection.execute(`ROLLBACK TO SAVEPOINT ${name}`);
  }

  isTransactionActive(): boolean {
    return this.isActive;
  }

  getSavepoints(): string[] {
    return [...this.savepoints];
  }
}

/**
 * 接続ヘルスモニタークラス
 */
export class ConnectionHealthMonitor {
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private startTime: Date = new Date();
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    successfulConnections: 0,
    averageResponseTime: 0,
    minResponseTime: Infinity,
    maxResponseTime: 0,
    totalHealthChecks: 0,
    successRate: 0,
    lastHealthCheck: new Date(),
    uptimeMs: 0
  };

  constructor(
    private pool: EnhancedConnectionPool,
    private config: HealthCheckConfig
  ) {}

  startMonitoring(): void {
    // 即座に最初のヘルスチェックを実行
    this.performHealthCheck();
    
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.intervalMs
    );
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  private async performHealthCheck(): Promise<void> {
    let connection: EnhancedDatabaseConnection | null = null;
    try {
      connection = await this.pool.acquire();
      const startTime = Date.now();

      const result = await connection.query('SELECT 1 as health_check');
      const responseTime = Date.now() - startTime;

      this.pool.release(connection);
      connection = null;

      this.updateMetrics(responseTime, true);
    } catch (error) {
      if (connection) {
        try {
          this.pool.release(connection);
        } catch (releaseError) {
          // Pool might be closed, ignore release error
        }
      }
      this.updateMetrics(0, false);
      console.error('Health check failed:', error);
    }
  }

  private updateMetrics(responseTime: number, success: boolean): void {
    this.metrics.lastHealthCheck = new Date();
    this.metrics.totalHealthChecks++;
    this.metrics.uptimeMs = Date.now() - this.startTime.getTime();
    
    // Update pool status first
    const poolStatus = this.pool.getPoolStatus();
    this.metrics.totalConnections = poolStatus.total;
    this.metrics.activeConnections = poolStatus.busy;
    
    if (success) {
      this.metrics.successfulConnections++;
      
      // Update response time statistics
      if (responseTime < this.metrics.minResponseTime) {
        this.metrics.minResponseTime = responseTime;
      }
      if (responseTime > this.metrics.maxResponseTime) {
        this.metrics.maxResponseTime = responseTime;
      }
      
      // Proper moving average calculation
      if (this.metrics.successfulConnections > 0) {
        this.metrics.averageResponseTime = 
          ((this.metrics.averageResponseTime * (this.metrics.successfulConnections - 1)) + responseTime) / this.metrics.successfulConnections;
      } else {
        this.metrics.averageResponseTime = responseTime;
      }
    } else {
      this.metrics.failedConnections++;
    }
    
    // Calculate success rate
    this.metrics.successRate = this.metrics.totalHealthChecks > 0 
      ? (this.metrics.successfulConnections / this.metrics.totalHealthChecks) * 100 
      : 0;
  }

  getMetrics(): ConnectionMetrics {
    return { 
      ...this.metrics,
      minResponseTime: this.metrics.minResponseTime === Infinity ? 0 : this.metrics.minResponseTime
    };
  }
}

/**
 * ファクトリー関数
 */
export function createEnhancedDatabaseConnection(): EnhancedDatabaseConnection {
  const config = createDatabaseConfig();
  return new EnhancedDatabaseConnection(config);
}

export function createConnectionPool(): EnhancedConnectionPool {
  const dbConfig = createDatabaseConfig();
  const poolConfig: PoolConfig = {
    database: dbConfig,
    min: dbConfig.pool.min,
    max: dbConfig.pool.max,
    acquireTimeoutMillis: dbConfig.pool.acquireTimeoutMillis,
    idleTimeoutMillis: dbConfig.pool.idleTimeoutMillis
  };
  
  return new EnhancedConnectionPool(poolConfig);
}

export function createHealthMonitor(pool: EnhancedConnectionPool): ConnectionHealthMonitor {
  const config: HealthCheckConfig = {
    intervalMs: 30000, // 30秒
    timeoutMs: 5000,   // 5秒
    retryAttempts: 3
  };
  
  return new ConnectionHealthMonitor(pool, config);
}

// シングルトンインスタンス
let singletonPool: EnhancedConnectionPool | null = null;
let singletonMonitor: ConnectionHealthMonitor | null = null;

export async function getConnectionPool(): Promise<EnhancedConnectionPool> {
  if (!singletonPool) {
    singletonPool = createConnectionPool();
    await singletonPool.initialize();
  }
  return singletonPool;
}

export async function getHealthMonitor(): Promise<ConnectionHealthMonitor> {
  if (!singletonMonitor) {
    const pool = await getConnectionPool();
    singletonMonitor = createHealthMonitor(pool);
  }
  return singletonMonitor;
}

export function clearConnectionPool(): void {
  if (singletonPool) {
    singletonPool.closeAll();
    singletonPool = null;
  }
  if (singletonMonitor) {
    singletonMonitor.stopMonitoring();
    singletonMonitor = null;
  }
} 