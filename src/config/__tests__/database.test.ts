import {
  createDatabaseConfig,
  createDatabaseConnection,
  getDatabase,
  clearDatabase,
  validateDatabaseConfig,
  DatabaseConfigError,
  DatabaseConfig,
  DatabaseConnection
} from '../database';
import { clearConfig } from '../environment';

// テスト用の環境変数をモック
const originalEnv = process.env;

describe('Database Configuration - TSK-003-CFG-Database', () => {
  beforeEach(() => {
    // 環境変数をモック
    process.env = {
      ...originalEnv,
      NODE_ENV: 'test',
      DATABASE_URL: 'sqlite://memory',
      DATABASE_NAME: 'test_tasks',
      JWT_SECRET: 'test-secret-key-32-characters-long-abcdef',
      JWT_EXPIRES_IN: '1h',
      PORT: '3000',
      LOG_LEVEL: 'debug',
      CORS_ORIGIN: '*',
      API_PREFIX: '/api/v1',
      DATABASE_PATH: ':memory:',
      DB_POOL_MIN: '2',
      DB_POOL_MAX: '5',
      DB_POOL_ACQUIRE_TIMEOUT: '10000',
      DB_POOL_IDLE_TIMEOUT: '30000',
      DB_BUSY_TIMEOUT: '5000'
    };

    // 設定をクリア
    clearConfig();
    clearDatabase();
  });

  afterEach(() => {
    // 環境変数を復元
    process.env = originalEnv;
    clearConfig();
    clearDatabase();
  });

  describe('createDatabaseConfig', () => {
    test('正常な設定が作成されること', () => {
      const config = createDatabaseConfig();

      expect(config).toEqual({
        database: ':memory:',
        pool: {
          min: 2,
          max: 5,
          acquireTimeoutMillis: 10000,
          idleTimeoutMillis: 30000
        },
        migrations: {
          directory: expect.stringContaining('schemas'),
          tableName: 'schema_migrations'
        },
        options: {
          busyTimeout: 5000,
          verbose: false
        }
      });
    });

    test('テスト環境でメモリDBが設定されること', () => {
      process.env.NODE_ENV = 'test';
      clearConfig();

      const config = createDatabaseConfig();

      expect(config.database).toBe(':memory:');
    });

    test('本番環境でファイルDBが設定されること', () => {
      process.env.NODE_ENV = 'production';
      process.env.DATABASE_PATH = 'data/production.db';
      clearConfig();

      const config = createDatabaseConfig();

      expect(config.database).toContain('data/production.db');
    });

    test('デフォルト値が適用されること', () => {
      delete process.env.DB_POOL_MIN;
      delete process.env.DB_POOL_MAX;
      delete process.env.DB_POOL_ACQUIRE_TIMEOUT;
      delete process.env.DB_POOL_IDLE_TIMEOUT;
      delete process.env.DB_BUSY_TIMEOUT;
      clearConfig();

      const config = createDatabaseConfig();

      expect(config.pool.min).toBe(1);
      expect(config.pool.max).toBe(10);
      expect(config.pool.acquireTimeoutMillis).toBe(30000);
      expect(config.pool.idleTimeoutMillis).toBe(600000);
      expect(config.options.busyTimeout).toBe(30000);
    });

    test('開発環境でverboseが有効になること', () => {
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'debug';
      clearConfig();

      const config = createDatabaseConfig();

      expect(config.options.verbose).toBe(true);
    });

    test('本番環境でverboseが無効になること', () => {
      process.env.NODE_ENV = 'production';
      process.env.LOG_LEVEL = 'info';
      clearConfig();

      const config = createDatabaseConfig();

      expect(config.options.verbose).toBe(false);
    });
  });

  describe('validateDatabaseConfig', () => {
    let validConfig: DatabaseConfig;

    beforeEach(() => {
      validConfig = {
        database: ':memory:',
        pool: {
          min: 1,
          max: 10,
          acquireTimeoutMillis: 30000,
          idleTimeoutMillis: 600000
        },
        migrations: {
          directory: '/tmp/schemas',
          tableName: 'migrations'
        },
        options: {
          busyTimeout: 30000,
          verbose: false
        }
      };
    });

    test('正常な設定が検証をパスすること', () => {
      expect(() => validateDatabaseConfig(validConfig)).not.toThrow();
    });

    test('データベースパスが空の場合エラーになること', () => {
      const invalidConfig = { ...validConfig, database: '' };

      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow(DatabaseConfigError);
      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow('データベースパスが設定されていません');
    });

    test('最小接続数が0以下の場合エラーになること', () => {
      const invalidConfig = {
        ...validConfig,
        pool: { ...validConfig.pool, min: 0 }
      };

      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow(DatabaseConfigError);
      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow('最小接続数は1以上である必要があります');
    });

    test('最大接続数が最小接続数より小さい場合エラーになること', () => {
      const invalidConfig = {
        ...validConfig,
        pool: { ...validConfig.pool, min: 5, max: 3 }
      };

      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow(DatabaseConfigError);
      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow('最大接続数は最小接続数以上である必要があります');
    });

    test('接続取得タイムアウトが短すぎる場合エラーになること', () => {
      const invalidConfig = {
        ...validConfig,
        pool: { ...validConfig.pool, acquireTimeoutMillis: 500 }
      };

      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow(DatabaseConfigError);
      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow('接続取得タイムアウトは1000ms以上である必要があります');
    });

    test('ビジータイムアウトが短すぎる場合エラーになること', () => {
      const invalidConfig = {
        ...validConfig,
        options: { ...validConfig.options, busyTimeout: 500 }
      };

      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow(DatabaseConfigError);
      expect(() => validateDatabaseConfig(invalidConfig))
        .toThrow('ビジータイムアウトは1000ms以上である必要があります');
    });
  });

  describe('createDatabaseConnection', () => {
    test('データベース接続が作成されること', () => {
      const connection = createDatabaseConnection();

      expect(connection).toBeDefined();
      expect(typeof connection.query).toBe('function');
      expect(typeof connection.execute).toBe('function');
      expect(typeof connection.transaction).toBe('function');
      expect(typeof connection.close).toBe('function');
      expect(typeof connection.isConnected).toBe('function');
      expect(typeof connection.healthCheck).toBe('function');
    });
  });

  describe('DatabaseConnection', () => {
    let connection: DatabaseConnection;

    beforeEach(() => {
      connection = createDatabaseConnection();
    });

    afterEach(async () => {
      await connection.close();
    });

    test('isConnectedが正常に動作すること', () => {
      expect(connection.isConnected()).toBe(true);
    });

    test('healthCheckが正常に動作すること', async () => {
      const isHealthy = await connection.healthCheck();
      expect(isHealthy).toBe(true);
    });

    test('queryが正常に実行されること', async () => {
      const result = await connection.query('SELECT 1 as test');
      expect(result).toEqual([{ test: 1 }]);
    });

    test('executeが正常に実行されること', async () => {
      // テスト用のテーブル作成
      await connection.execute(`
        CREATE TABLE test_table (
          id INTEGER PRIMARY KEY,
          name TEXT NOT NULL
        )
      `);

      await connection.execute(
        'INSERT INTO test_table (name) VALUES (?)',
        ['テストデータ']
      );

      const result = await connection.query('SELECT * FROM test_table');
      expect(result).toEqual([
        { id: 1, name: 'テストデータ' }
      ]);
    });

    test('パラメータ付きクエリが正常に動作すること', async () => {
      await connection.execute(`
        CREATE TABLE test_params (
          id INTEGER PRIMARY KEY,
          value TEXT
        )
      `);

      await connection.execute(
        'INSERT INTO test_params (value) VALUES (?)',
        ['パラメータテスト']
      );

      const result = await connection.query(
        'SELECT * FROM test_params WHERE value = ?',
        ['パラメータテスト']
      );

      expect(result).toEqual([
        { id: 1, value: 'パラメータテスト' }
      ]);
    });

    test('トランザクションが正常に動作すること', async () => {
      await connection.execute(`
        CREATE TABLE test_transaction (
          id INTEGER PRIMARY KEY,
          value TEXT
        )
      `);

      const result = await connection.transaction(async (trx) => {
        await trx.execute(
          'INSERT INTO test_transaction (value) VALUES (?)',
          ['トランザクション1']
        );
        await trx.execute(
          'INSERT INTO test_transaction (value) VALUES (?)',
          ['トランザクション2']
        );

        const data = await trx.query('SELECT COUNT(*) as count FROM test_transaction');
        return data[0] as { count: number };
      });

      expect(result.count).toBe(2);

      // トランザクション外からも確認
      const allData = await connection.query('SELECT * FROM test_transaction');
      expect(allData).toHaveLength(2);
    });

    test('トランザクションでエラーが発生した場合ロールバックされること', async () => {
      await connection.execute(`
        CREATE TABLE test_rollback (
          id INTEGER PRIMARY KEY,
          value TEXT UNIQUE
        )
      `);

      // 正常なデータを挿入
      await connection.execute(
        'INSERT INTO test_rollback (value) VALUES (?)',
        ['既存データ']
      );

      // トランザクション内でエラーを発生させる
      try {
        await connection.transaction(async (trx) => {
          await trx.execute(
            'INSERT INTO test_rollback (value) VALUES (?)',
            ['新しいデータ']
          );
          // UNIQUE制約違反でエラーを発生
          await trx.execute(
            'INSERT INTO test_rollback (value) VALUES (?)',
            ['既存データ']
          );
        });
      } catch (error) {
        // エラーが期待される
        expect(error).toBeInstanceOf(DatabaseConfigError);
      }

      // ロールバックされているか確認
      const result = await connection.query('SELECT COUNT(*) as count FROM test_rollback');
      expect((result[0] as { count: number }).count).toBe(1);
    });

    test('不正なSQLでエラーが発生すること', async () => {
      await expect(connection.query('INVALID SQL'))
        .rejects.toThrow(DatabaseConfigError);
    });

    test('存在しないテーブルへのクエリでエラーが発生すること', async () => {
      await expect(connection.query('SELECT * FROM non_existent_table'))
        .rejects.toThrow(DatabaseConfigError);
    });
  });

  describe('getDatabase (シングルトン)', () => {
    test('同じインスタンスが返されること', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBe(db2);
    });

    test('clearDatabase後に新しいインスタンスが作成されること', () => {
      const db1 = getDatabase();
      clearDatabase();
      const db2 = getDatabase();

      expect(db1).not.toBe(db2);
    });
  });

  describe('DatabaseConfigError', () => {
    test('エラーメッセージが正しく設定されること', () => {
      const error = new DatabaseConfigError('テストエラー');

      expect(error.message).toBe('テストエラー');
      expect(error.name).toBe('DatabaseConfigError');
      expect(error).toBeInstanceOf(Error);
    });

    test('原因エラーが正しく設定されること', () => {
      const causeError = new Error('原因エラー');
      const error = new DatabaseConfigError('テストエラー', causeError);

      expect(error.cause).toBe(causeError);
    });
  });

  describe('エラーケースとエッジケース', () => {
    test('ヘルスチェック失敗時にfalseが返されること', async () => {
      // console.errorをスパイ
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      
      // 無効なSQLを使ってヘルスチェックを失敗させる
      const connection = createDatabaseConnection();
      
      // データベース接続を意図的に壊す
      jest.spyOn(connection, 'query').mockRejectedValueOnce(new Error('接続失敗'));
      
      const result = await connection.healthCheck();
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith('データベースヘルスチェック失敗:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
      await connection.close();
    });

    test('接続プールの制限テスト', async () => {
      // 小さな接続プールで制限をテスト
      process.env.DB_POOL_MAX = '1';
      clearConfig();
      
      const connection = createDatabaseConnection();
      
      try {
        // 複数の同時接続を試行（接続プールの制限をテスト）
        const promises = [];
        for (let i = 0; i < 3; i++) {
          promises.push(
            connection.query('SELECT 1 as test').catch(() => null)
          );
        }
        
        const results = await Promise.all(promises);
        
        // 少なくとも1つは成功するはず
        expect(results.some(result => result !== null)).toBe(true);
      } finally {
        await connection.close();
      }
    });

    test('verbose設定でのクエリログ出力', async () => {
      // console.logをスパイ
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
      
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'debug';
      clearConfig();
      clearDatabase(); // データベースインスタンスもクリア
      
      const connection = createDatabaseConnection();
      
      try {
        await connection.query('SELECT 1 as test');
        
        // verboseモードでのクエリログ出力を確認
        expect(consoleLogSpy).toHaveBeenCalledWith(
          '[SQLite] クエリ実行:',
          'SELECT 1 as test'
        );
      } finally {
        consoleLogSpy.mockRestore();
        await connection.close();
      }
    });

    test('同じインスタンスが返されることの確認', () => {
      const db1 = getDatabase();
      const db2 = getDatabase();

      expect(db1).toBe(db2);
    });
  });
}); 