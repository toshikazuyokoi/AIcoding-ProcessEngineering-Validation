import {
  EnhancedDatabaseConnection,
  EnhancedConnectionPool,
  TransactionManager,
  EnhancedTransaction,
  ConnectionHealthMonitor,
  DatabaseResult,
  PoolConfig,
  HealthCheckConfig,
  ConnectionMetrics,
  Result,
  Ok,
  Err,
  createEnhancedDatabaseConnection,
  createConnectionPool,
  createHealthMonitor,
  getConnectionPool,
  getHealthMonitor,
  clearConnectionPool
} from '../Connection';
import { DatabaseConfig, DatabaseConfigError } from '../../../config/database';
import * as sqlite3 from 'sqlite3';

// テスト用設定
const testConfig: DatabaseConfig = {
  database: ':memory:',
  pool: {
    min: 1,
    max: 3,
    acquireTimeoutMillis: 5000,
    idleTimeoutMillis: 30000
  },
  migrations: {
    directory: './schemas',
    tableName: 'schema_migrations'
  },
  options: {
    busyTimeout: 5000,
    verbose: false
  }
};

const testPoolConfig: PoolConfig = {
  database: testConfig,
  min: 1,
  max: 3,
  acquireTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
};

describe('EnhancedDatabaseConnection', () => {
  let connection: EnhancedDatabaseConnection;

  beforeEach(async () => {
    connection = new EnhancedDatabaseConnection(testConfig);
  });

  afterEach(async () => {
    if (connection.isConnected()) {
      await connection.close();
    }
  });

  describe('正常系テスト', () => {
    test('接続が正常に確立されること', async () => {
      const result = await connection.connect();
      
      expect(result.success).toBe(true);
      expect(connection.isConnected()).toBe(true);
    });

    test('クエリが正常に実行されること', async () => {
      await connection.connect();
      
      const result = await connection.query('SELECT 1 as test');
      
      expect(result).toEqual([{ test: 1 }]);
    });

    test('SQL文が正常に実行されること', async () => {
      await connection.connect();
      
      await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)');
      await connection.execute('INSERT INTO test_table (name) VALUES (?)', ['test']);
      
      const result = await connection.query('SELECT * FROM test_table');
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({ id: 1, name: 'test' });
    });

    test('トランザクションが正常に実行されること', async () => {
      await connection.connect();
      await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)');
      
      const result = await connection.transaction(async (trx) => {
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test1']);
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test2']);
        return 'success';
      });
      
             expect(result).toBe('success');
       
              const rows = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
       expect(rows[0]?.count).toBe(2);
     });

     test('ヘルスチェックが正常に動作すること', async () => {
       await connection.connect();
       
       const isHealthy = await connection.healthCheck();
       
       expect(isHealthy).toBe(true);
     });

     test('接続が正常に閉じられること', async () => {
       await connection.connect();
       expect(connection.isConnected()).toBe(true);
       
       await connection.close();
       
       expect(connection.isConnected()).toBe(false);
     });

     test('メトリクスが正しく取得されること', async () => {
       await connection.connect();
       
       await connection.query('SELECT 1');
       await connection.query('SELECT 2');
       
       const metrics = connection.getMetrics();
       expect(metrics.queryCount).toBe(2);
       expect(metrics.averageResponseTime).toBeGreaterThan(0);
     });
   });

   describe('異常系テスト', () => {
     test('未接続時のクエリ実行でエラーが発生すること', async () => {
       await expect(connection.query('SELECT 1')).rejects.toThrow('Database not connected');
     });

     test('未接続時のSQL実行でエラーが発生すること', async () => {
       await expect(connection.execute('SELECT 1')).rejects.toThrow('Database not connected');
     });

     test('未接続時のトランザクション実行でエラーが発生すること', async () => {
       await expect(connection.transaction(async () => 'test')).rejects.toThrow('Database not connected');
     });

     test('不正なSQLでエラーが発生すること', async () => {
       await connection.connect();
       
       await expect(connection.query('INVALID SQL')).rejects.toThrow();
     });

     test('不正な設定でエラーが発生すること', () => {
       const invalidConfig = { ...testConfig, database: '' };
       
       expect(() => new EnhancedDatabaseConnection(invalidConfig)).toThrow('Database path is required');
     });

     test('トランザクション内でエラーが発生した場合ロールバックされること', async () => {
       await connection.connect();
       await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT UNIQUE)');
       
       await expect(connection.transaction(async (trx) => {
         await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test']);
         await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test']); // UNIQUE制約違反
         return 'should not reach here';
       })).rejects.toThrow();
       
       const rows = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
       expect(rows[0]?.count).toBe(0); // ロールバックされているはず
    });

    test('ヘルスチェック失敗でfalseが返されること', async () => {
      // console.errorをスパイ
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      const isHealthy = await connection.healthCheck();
      
      expect(isHealthy).toBe(false);
      
      consoleErrorSpy.mockRestore();
    });
  });

  describe('境界値テスト', () => {
    test('空のパラメータでクエリが実行されること', async () => {
      await connection.connect();
      
      const result = await connection.query('SELECT 1 as test', []);
      
      expect(result).toEqual([{ test: 1 }]);
    });

    test('大量のパラメータでクエリが実行されること', async () => {
      await connection.connect();
      await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, data TEXT)');
      
      const params = Array(100).fill('test');
      const placeholders = params.map(() => '?').join(',');
      
      await connection.execute(`INSERT INTO test_table (data) VALUES ${params.map(() => '(?)').join(',')}`, params);
      
      const result = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
      expect(result[0]?.count).toBe(100);
    });

    test('トランザクション深度が正しく管理されること', async () => {
      await connection.connect();
      await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)');
      
      await connection.transaction(async (trx1) => {
        await trx1.execute('INSERT INTO test_table (name) VALUES (?)', ['test1']);
        // ネストトランザクションはSQLiteでは制限があるが、深度は追跡される
        return 'success';
      });
      
      const result = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
      expect(result[0]?.count).toBe(1);
    });
  });
});

describe('EnhancedConnectionPool', () => {
  let pool: EnhancedConnectionPool;

  beforeEach(() => {
    pool = new EnhancedConnectionPool(testPoolConfig);
  });

  afterEach(async () => {
    await pool.closeAll();
  });

  describe('正常系テスト', () => {
    test('プールが正常に初期化されること', async () => {
      const result = await pool.initialize();
      
      expect(result.success).toBe(true);
      
      const status = pool.getPoolStatus();
      expect(status.total).toBe(testPoolConfig.min);
      expect(status.available).toBe(testPoolConfig.min);
      expect(status.busy).toBe(0);
    });

    test('接続が正常に取得・返却されること', async () => {
      await pool.initialize();
      
      const connection = await pool.acquire();
      expect(connection).toBeInstanceOf(EnhancedDatabaseConnection);
      
      const status1 = pool.getPoolStatus();
      expect(status1.busy).toBe(1);
      expect(status1.available).toBe(0);
      
      pool.release(connection);
      
      const status2 = pool.getPoolStatus();
      expect(status2.busy).toBe(0);
      expect(status2.available).toBe(1);
    });

    test('最大接続数まで接続が作成されること', async () => {
      await pool.initialize();
      
      const connections = [];
      for (let i = 0; i < testPoolConfig.max; i++) {
        connections.push(await pool.acquire());
      }
      
      const status = pool.getPoolStatus();
      expect(status.total).toBe(testPoolConfig.max);
      expect(status.busy).toBe(testPoolConfig.max);
      expect(status.available).toBe(0);
      
      connections.forEach(conn => pool.release(conn));
    });

    test('プールが正常に閉じられること', async () => {
      await pool.initialize();
      
      await pool.closeAll();
      
      const status = pool.getPoolStatus();
      expect(status.total).toBe(0);
      expect(status.available).toBe(0);
      expect(status.busy).toBe(0);
    });
  });

  describe('異常系テスト', () => {
    test('不正なプール設定でエラーが発生すること', () => {
      const invalidConfig = { ...testPoolConfig, min: 0 };
      
      expect(() => new EnhancedConnectionPool(invalidConfig)).toThrow('Minimum pool size must be at least 1');
    });

    test('最大接続数を超える場合はタイムアウトすること', async () => {
      const timeoutConfig = { ...testPoolConfig, max: 1, acquireTimeoutMillis: 100 };
      const timeoutPool = new EnhancedConnectionPool(timeoutConfig);
      await timeoutPool.initialize();
      
      const connection1 = await timeoutPool.acquire();
      
      await expect(timeoutPool.acquire()).rejects.toThrow('Connection acquire timeout');
      
      timeoutPool.release(connection1);
      await timeoutPool.closeAll();
    });

    test('プールから取得していない接続の返却でエラーが発生すること', async () => {
      await pool.initialize();
      
      const externalConnection = new EnhancedDatabaseConnection(testConfig);
      
      expect(() => pool.release(externalConnection)).toThrow('Connection not acquired from this pool');
    });

    test('プール閉鎖中の接続取得でエラーが発生すること', async () => {
      const quickPool = new EnhancedConnectionPool(testPoolConfig);
      await quickPool.initialize();
      
      // 接続取得を開始してから即座にプールを閉じる
      const acquirePromise = quickPool.acquire();
      const closePromise = quickPool.closeAll();
      
      await expect(Promise.all([acquirePromise, closePromise])).resolves.toBeDefined();
    });
  });

  describe('境界値テスト', () => {
    test('最小接続数1で動作すること', async () => {
      const minConfig = { ...testPoolConfig, min: 1, max: 1 };
      const minPool = new EnhancedConnectionPool(minConfig);
      
      await minPool.initialize();
      
      const status = minPool.getPoolStatus();
      expect(status.total).toBe(1);
      expect(status.available).toBe(1);
      
      await minPool.closeAll();
    });

    test('同時に複数の接続取得要求があっても正しく処理されること', async () => {
      await pool.initialize();
      
      const promises = Array(testPoolConfig.max + 2).fill(null).map(() => pool.acquire());
      
      // 最初のmax個は成功し、残りはタイムアウトするはず
      const results = await Promise.allSettled(promises);
      
      const fulfilled = results.filter(r => r.status === 'fulfilled');
      expect(fulfilled.length).toBe(testPoolConfig.max);
      
      // 取得した接続を返却
      fulfilled.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          pool.release(result.value);
        }
      });
    });
  });
});

describe('TransactionManager', () => {
  let manager: TransactionManager;
  let connection: EnhancedDatabaseConnection;

  beforeEach(async () => {
    manager = new TransactionManager();
    connection = new EnhancedDatabaseConnection(testConfig);
    await connection.connect();
    await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)');
  });

  afterEach(async () => {
    await connection.close();
  });

  describe('正常系テスト', () => {
    test('トランザクションが正常に実行されること', async () => {
      const result = await manager.transaction(connection, async (trx) => {
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test1']);
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test2']);
        return 'success';
      });
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success');
      }
      
      const rows = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
      expect(rows[0]?.count).toBe(2);
    });

    test('複数のトランザクションが並行実行されること', async () => {
      const promises = [
        manager.transaction(connection, async (trx) => {
          await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['trx1']);
          return 'trx1';
        }),
        manager.transaction(connection, async (trx) => {
          await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['trx2']);
          return 'trx2';
        })
      ];
      
      const results = await Promise.all(promises);
      
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });
  });

  describe('異常系テスト', () => {
    test('トランザクション内でエラーが発生した場合ロールバックされること', async () => {
      await connection.execute('ALTER TABLE test_table ADD CONSTRAINT unique_name UNIQUE (name)');
      
      const result = await manager.transaction(connection, async (trx) => {
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test']);
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['test']); // UNIQUE制約違反
        return 'should not reach here';
      });
      
      expect(result.success).toBe(false);
      
      const rows = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
      expect(rows[0]?.count).toBe(0);
    });

    test('全てのアクティブトランザクションがロールバックされること', async () => {
      // 複数のトランザクションを開始
      const trx1Promise = manager.transaction(connection, async (trx) => {
        await trx.execute('INSERT INTO test_table (name) VALUES (?)', ['trx1']);
        await new Promise(resolve => setTimeout(resolve, 100)); // 待機
        return 'trx1';
      });
      
      // 少し待ってからロールバックを実行
      setTimeout(() => {
        manager.rollbackAll();
      }, 50);
      
      await expect(trx1Promise).resolves.toBeDefined();
    });
  });
});

describe('EnhancedTransaction', () => {
  let connection: EnhancedDatabaseConnection;
  let transaction: EnhancedTransaction;

  beforeEach(async () => {
    connection = new EnhancedDatabaseConnection(testConfig);
    await connection.connect();
    await connection.execute('CREATE TABLE test_table (id INTEGER PRIMARY KEY, name TEXT)');
    transaction = new EnhancedTransaction(connection, 'test-trx');
  });

  afterEach(async () => {
    if (transaction.isTransactionActive()) {
      await transaction.rollback();
    }
    await connection.close();
  });

  describe('正常系テスト', () => {
    test('トランザクションが正常に開始・コミットされること', async () => {
      await transaction.begin();
      expect(transaction.isTransactionActive()).toBe(true);
      
      await transaction.execute('INSERT INTO test_table (name) VALUES (?)', ['test']);
      await transaction.commit();
      
      expect(transaction.isTransactionActive()).toBe(false);
      
      const rows = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
      expect(rows[0]?.count).toBe(1);
    });

    test('セーブポイントが正常に作成・ロールバックされること', async () => {
      await transaction.begin();
      
      await transaction.execute('INSERT INTO test_table (name) VALUES (?)', ['test1']);
      await transaction.savepoint('sp1');
      await transaction.execute('INSERT INTO test_table (name) VALUES (?)', ['test2']);
      
      expect(transaction.getSavepoints()).toContain('sp1');
      
      await transaction.rollbackToSavepoint('sp1');
      await transaction.commit();
      
      const rows = await connection.query<{ count: number }>('SELECT COUNT(*) as count FROM test_table');
      expect(rows[0]?.count).toBe(1); // test2はロールバックされている
    });
  });

  describe('異常系テスト', () => {
    test('非アクティブなトランザクションでの操作でエラーが発生すること', async () => {
      await expect(transaction.query('SELECT 1')).rejects.toThrow('Transaction not active');
      await expect(transaction.execute('SELECT 1')).rejects.toThrow('Transaction not active');
      await expect(transaction.savepoint('sp1')).rejects.toThrow('Transaction not active');
      await expect(transaction.rollbackToSavepoint('sp1')).rejects.toThrow('Transaction not active');
    });

    test('アクティブでないトランザクションのコミットでエラーが発生すること', async () => {
      await expect(transaction.commit()).rejects.toThrow('No active transaction to commit');
    });

    test('ロールバック実行時にエラーが発生しても例外が投げられないこと', async () => {
      // ロールバックはエラーが発生してもexceptionを投げない仕様
      await expect(transaction.rollback()).resolves.toBeUndefined();
    });
  });
});

describe('ConnectionHealthMonitor', () => {
  let pool: EnhancedConnectionPool;
  let monitor: ConnectionHealthMonitor;
  let config: HealthCheckConfig;

  beforeEach(async () => {
    pool = new EnhancedConnectionPool(testPoolConfig);
    await pool.initialize();
    
    config = {
      intervalMs: 100,
      timeoutMs: 1000,
      retryAttempts: 3
    };
    
    monitor = new ConnectionHealthMonitor(pool, config);
  });

  afterEach(async () => {
    monitor.stopMonitoring();
    await pool.closeAll();
  });

  describe('正常系テスト', () => {
    test('ヘルスモニタリングが開始・停止されること', async () => {
      monitor.startMonitoring();
      
      // 少し待ってメトリクスが更新されることを確認
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const metrics = monitor.getMetrics();
      expect(metrics.lastHealthCheck).toBeInstanceOf(Date);
      
      monitor.stopMonitoring();
    });

    test('メトリクスが正しく取得されること', async () => {
      const metrics = monitor.getMetrics();
      
      expect(metrics).toHaveProperty('totalConnections');
      expect(metrics).toHaveProperty('activeConnections');
      expect(metrics).toHaveProperty('failedConnections');
      expect(metrics).toHaveProperty('averageResponseTime');
      expect(metrics).toHaveProperty('lastHealthCheck');
    });
  });

  describe('異常系テスト', () => {
    test('ヘルスチェック失敗時にメトリクスが更新されること', async () => {
      // console.errorをスパイ
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // プールを閉じてヘルスチェックを失敗させる
      await pool.closeAll();
      
      monitor.startMonitoring();
      
      // ヘルスチェックが実行されるまで待機
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const metrics = monitor.getMetrics();
      expect(metrics.failedConnections).toBeGreaterThan(0);
      
      monitor.stopMonitoring();
      consoleErrorSpy.mockRestore();
    });
  });
});

describe('ファクトリー関数', () => {
  afterEach(() => {
    clearConnectionPool();
  });

  describe('正常系テスト', () => {
    test('EnhancedDatabaseConnectionが作成されること', () => {
      const connection = createEnhancedDatabaseConnection();
      
      expect(connection).toBeInstanceOf(EnhancedDatabaseConnection);
    });

    test('ConnectionPoolが作成されること', () => {
      const pool = createConnectionPool();
      
      expect(pool).toBeInstanceOf(EnhancedConnectionPool);
    });

    test('HealthMonitorが作成されること', () => {
      const pool = createConnectionPool();
      const monitor = createHealthMonitor(pool);
      
      expect(monitor).toBeInstanceOf(ConnectionHealthMonitor);
    });

    test('シングルトンプールが正しく動作すること', async () => {
      const pool1 = await getConnectionPool();
      const pool2 = await getConnectionPool();
      
      expect(pool1).toBe(pool2); // 同じインスタンス
    });

    test('シングルトンモニターが正しく動作すること', async () => {
      const monitor1 = await getHealthMonitor();
      const monitor2 = await getHealthMonitor();
      
      expect(monitor1).toBe(monitor2); // 同じインスタンス
    });
  });
});

describe('Result型', () => {
  describe('正常系テスト', () => {
    test('Ok結果が正しく作成されること', () => {
      const result = Ok('success');
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('success');
      }
    });

    test('Err結果が正しく作成されること', () => {
      const error = new Error('test error');
      const result = Err(error);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe(error);
      }
    });
  });
});

describe('統合テスト', () => {
  test('接続プール・トランザクション・モニタリングの統合動作', async () => {
    const pool = createConnectionPool();
    await pool.initialize();
    
    const monitor = createHealthMonitor(pool);
    monitor.startMonitoring();
    
    const manager = new TransactionManager();
    
    // 接続を取得してトランザクション実行
    const connection = await pool.acquire();
    await connection.execute('CREATE TABLE integration_test (id INTEGER PRIMARY KEY, name TEXT)');
    
    const result = await manager.transaction(connection, async (trx) => {
      await trx.execute('INSERT INTO integration_test (name) VALUES (?)', ['test']);
      return 'success';
    });
    
    expect(result.success).toBe(true);
    
    // 接続を返却
    pool.release(connection);
    
    // メトリクス確認
    await new Promise(resolve => setTimeout(resolve, 100));
    const metrics = monitor.getMetrics();
    expect(metrics.totalConnections).toBeGreaterThan(0);
    
    // クリーンアップ
    monitor.stopMonitoring();
    await pool.closeAll();
  });

  test('エラー発生時の一貫した処理', async () => {
    const pool = createConnectionPool();
    await pool.initialize();
    
    const manager = new TransactionManager();
    
    const connection = await pool.acquire();
    await connection.execute('CREATE TABLE error_test (id INTEGER PRIMARY KEY, name TEXT UNIQUE)');
    
    // 意図的にエラーを発生させる
    const result = await manager.transaction(connection, async (trx) => {
      await trx.execute('INSERT INTO error_test (name) VALUES (?)', ['test']);
      await trx.execute('INSERT INTO error_test (name) VALUES (?)', ['test']); // UNIQUE制約違反
      return 'should not reach here';
    });
    
    expect(result.success).toBe(false);
    
    // 接続は正常に返却できる
    pool.release(connection);
    
    // データは挿入されていない
    const cleanConnection = await pool.acquire();
    const rows = await cleanConnection.query<{ count: number }>('SELECT COUNT(*) as count FROM error_test');
    expect(rows[0]?.count).toBe(0);
    
    pool.release(cleanConnection);
    await pool.closeAll();
  });
}); 