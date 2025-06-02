import * as sqlite3 from 'sqlite3';
import * as path from 'path';
import { getConfig } from './environment';

/**
 * データベース設定インターフェース
 */
export interface DatabaseConfig {
  readonly host?: string;
  readonly port?: number;
  readonly database: string;
  readonly username?: string;
  readonly password?: string;
  readonly pool: {
    readonly min: number;
    readonly max: number;
    readonly acquireTimeoutMillis: number;
    readonly idleTimeoutMillis: number;
  };
  readonly migrations: {
    readonly directory: string;
    readonly tableName: string;
  };
  readonly options: {
    readonly busyTimeout: number;
    readonly verbose: boolean;
  };
}

/**
 * トランザクションインターフェース
 */
export interface Transaction {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
}

/**
 * データベース接続インターフェース
 */
export interface DatabaseConnection {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
  close(): Promise<void>;
  isConnected(): boolean;
  healthCheck(): Promise<boolean>;
}

/**
 * データベース設定エラークラス
 */
export class DatabaseConfigError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseConfigError';
  }
}

/**
 * SQLite接続プール管理クラス
 */
class SQLiteConnectionPool {
  private connections: sqlite3.Database[] = [];
  private readonly config: DatabaseConfig;
  private readonly maxConnections: number;
  private readonly minConnections: number;
  private activeConnections = 0;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.maxConnections = config.pool.max;
    this.minConnections = config.pool.min;
  }

  async getConnection(): Promise<sqlite3.Database> {
    if (this.connections.length > 0) {
      return this.connections.pop()!;
    }

    if (this.activeConnections >= this.maxConnections) {
      throw new DatabaseConfigError('接続プールの最大接続数に到達しました');
    }

    return this.createConnection();
  }

  async releaseConnection(connection: sqlite3.Database): Promise<void> {
    if (this.connections.length < this.minConnections) {
      this.connections.push(connection);
    } else {
      await this.closeConnection(connection);
    }
  }

  private async createConnection(): Promise<sqlite3.Database> {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.config.database, (err) => {
        if (err) {
          reject(new DatabaseConfigError(`データベース接続失敗: ${err.message}`, err));
          return;
        }

        // SQLite設定の適用
        db.configure('busyTimeout', this.config.options.busyTimeout);
        
        if (this.config.options.verbose) {
          db.on('trace', (sql) => {
            console.log('[SQLite] クエリ実行:', sql);
          });
        }

        this.activeConnections++;
        resolve(db);
      });
    });
  }

  private async closeConnection(connection: sqlite3.Database): Promise<void> {
    return new Promise((resolve, reject) => {
      connection.close((err) => {
        if (err) {
          reject(new DatabaseConfigError(`接続クローズ失敗: ${err.message}`, err));
        } else {
          this.activeConnections--;
          resolve();
        }
      });
    });
  }

  async closeAll(): Promise<void> {
    const promises = this.connections.map(conn => this.closeConnection(conn));
    await Promise.all(promises);
    this.connections = [];
  }
}

/**
 * SQLiteデータベース接続クラス
 */
class SQLiteDatabaseConnection implements DatabaseConnection {
  private pool: SQLiteConnectionPool;
  private readonly config: DatabaseConfig;

  constructor(config: DatabaseConfig) {
    this.config = config;
    this.pool = new SQLiteConnectionPool(config);
  }

  async query<T>(sql: string, params: any[] = []): Promise<T[]> {
    const connection = await this.pool.getConnection();
    
    try {
      return new Promise((resolve, reject) => {
        connection.all(sql, params, (err, rows) => {
          if (err) {
            reject(new DatabaseConfigError(`クエリ実行失敗: ${err.message}`, err));
          } else {
            resolve(rows as T[]);
          }
        });
      });
    } finally {
      await this.pool.releaseConnection(connection);
    }
  }

  async execute(sql: string, params: any[] = []): Promise<void> {
    const connection = await this.pool.getConnection();
    
    try {
      return new Promise((resolve, reject) => {
        connection.run(sql, params, function(err) {
          if (err) {
            reject(new DatabaseConfigError(`SQL実行失敗: ${err.message}`, err));
          } else {
            resolve();
          }
        });
      });
    } finally {
      await this.pool.releaseConnection(connection);
    }
  }

  async transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T> {
    const connection = await this.pool.getConnection();
    
    const transaction: Transaction = {
      query: <R>(sql: string, params: any[] = []): Promise<R[]> => {
        return new Promise((resolve, reject) => {
          connection.all(sql, params, (err, rows) => {
            if (err) {
              reject(new DatabaseConfigError(`トランザクション内クエリ失敗: ${err.message}`, err));
            } else {
              resolve(rows as R[]);
            }
          });
        });
      },

      execute: (sql: string, params: any[] = []): Promise<void> => {
        return new Promise((resolve, reject) => {
          connection.run(sql, params, function(err) {
            if (err) {
              reject(new DatabaseConfigError(`トランザクション内実行失敗: ${err.message}`, err));
            } else {
              resolve();
            }
          });
        });
      },

      commit: (): Promise<void> => {
        return new Promise((resolve, reject) => {
          connection.run('COMMIT', (err) => {
            if (err) {
              reject(new DatabaseConfigError(`コミット失敗: ${err.message}`, err));
            } else {
              resolve();
            }
          });
        });
      },

      rollback: (): Promise<void> => {
        return new Promise((resolve, reject) => {
          connection.run('ROLLBACK', (err) => {
            if (err) {
              reject(new DatabaseConfigError(`ロールバック失敗: ${err.message}`, err));
            } else {
              resolve();
            }
          });
        });
      }
    };

    try {
      await new Promise<void>((resolve, reject) => {
        connection.run('BEGIN TRANSACTION', (err) => {
          if (err) {
            reject(new DatabaseConfigError(`トランザクション開始失敗: ${err.message}`, err));
          } else {
            resolve();
          }
        });
      });

      const result = await callback(transaction);
      await transaction.commit();
      return result;

    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      await this.pool.releaseConnection(connection);
    }
  }

  async close(): Promise<void> {
    await this.pool.closeAll();
  }

  isConnected(): boolean {
    return true; // SQLiteは常に接続状態として扱う
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('データベースヘルスチェック失敗:', error);
      return false;
    }
  }
}

/**
 * データベース設定を作成
 */
export function createDatabaseConfig(): DatabaseConfig {
  const env = getConfig();
  
  const dbPath = env.server.nodeEnv === 'test' 
    ? ':memory:' 
    : path.resolve(process.cwd(), process.env.DATABASE_PATH || 'data/tasks.db');

  return {
    database: dbPath,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN || '1', 10),
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      acquireTimeoutMillis: parseInt(process.env.DB_POOL_ACQUIRE_TIMEOUT || '30000', 10),
      idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT || '600000', 10)
    },
    migrations: {
      directory: path.resolve(process.cwd(), 'schemas'),
      tableName: 'schema_migrations'
    },
    options: {
      busyTimeout: parseInt(process.env.DB_BUSY_TIMEOUT || '30000', 10),
      verbose: env.server.nodeEnv === 'development' && env.api.logLevel === 'debug'
    }
  };
}

/**
 * データベース接続インスタンスを作成
 */
export function createDatabaseConnection(): DatabaseConnection {
  const config = createDatabaseConfig();
  return new SQLiteDatabaseConnection(config);
}

// シングルトンインスタンス
let dbInstance: DatabaseConnection | null = null;

/**
 * データベース接続のシングルトンインスタンスを取得
 */
export function getDatabase(): DatabaseConnection {
  if (!dbInstance) {
    dbInstance = createDatabaseConnection();
  }
  return dbInstance;
}

/**
 * データベース接続をクリア（主にテスト用）
 */
export function clearDatabase(): void {
  if (dbInstance) {
    dbInstance.close().catch(console.error);
    dbInstance = null;
  }
}

/**
 * データベース設定の検証
 */
export function validateDatabaseConfig(config: DatabaseConfig): void {
  if (!config.database) {
    throw new DatabaseConfigError('データベースパスが設定されていません');
  }

  if (config.pool.min < 1) {
    throw new DatabaseConfigError('最小接続数は1以上である必要があります');
  }

  if (config.pool.max < config.pool.min) {
    throw new DatabaseConfigError('最大接続数は最小接続数以上である必要があります');
  }

  if (config.pool.acquireTimeoutMillis < 1000) {
    throw new DatabaseConfigError('接続取得タイムアウトは1000ms以上である必要があります');
  }

  if (config.options.busyTimeout < 1000) {
    throw new DatabaseConfigError('ビジータイムアウトは1000ms以上である必要があります');
  }
} 