import {
  loadEnvironment,
  getConfig,
  validateConfig,
  isDevelopment,
  isProduction,
  isTest,
  clearConfig,
  EnvironmentConfigError,
  type EnvironmentConfig,
} from '../environment';

describe('Environment Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // 環境変数をリセット
    jest.resetModules();
    process.env = { ...originalEnv };
    
    // グローバル設定をクリア
    clearConfig();
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('正常系テスト（ハッピーパス）', () => {
    beforeEach(() => {
      // 有効な環境変数を設定
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.JWT_EXPIRES_IN = '24h';
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'info';
      process.env.CORS_ORIGIN = 'http://localhost:3000';
      process.env.API_PREFIX = '/api/v1';
    });

    test('有効な環境変数での設定読み込み成功', () => {
      const config = loadEnvironment();
      
      expect(config).toEqual({
        database: {
          url: './data/test.sqlite',
          name: 'test_db',
        },
        jwt: {
          secret: 'this-is-a-very-secure-secret-key-with-32-chars-minimum',
          expiresIn: '24h',
        },
        server: {
          port: 3000,
          nodeEnv: 'development',
        },
        api: {
          logLevel: 'info',
          corsOrigin: 'http://localhost:3000',
          prefix: '/api/v1',
        },
      });
    });

    test('getConfig()でシングルトン設定取得', () => {
      const config1 = getConfig();
      const config2 = getConfig();
      
      expect(config1).toBe(config2); // 同一インスタンス
      expect(config1.database.name).toBe('test_db');
    });

    test('デフォルト値の適用確認', () => {
      // オプション環境変数を削除
      delete process.env.PORT;
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;
      delete process.env.CORS_ORIGIN;
      delete process.env.API_PREFIX;
      
      const config = loadEnvironment();
      
      expect(config.server.port).toBe(3000);
      expect(config.server.nodeEnv).toBe('development');
      expect(config.api.logLevel).toBe('info');
      expect(config.api.corsOrigin).toBe('*');
      expect(config.api.prefix).toBe('/api/v1');
    });

    test('環境判定関数の正常動作', () => {
      process.env.NODE_ENV = 'development';
      clearConfig(); // 設定をクリアして再読み込み
      expect(isDevelopment()).toBe(true);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(false);

      process.env.NODE_ENV = 'production';
      clearConfig(); // 設定をクリアして再読み込み
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(true);
      expect(isTest()).toBe(false);

      process.env.NODE_ENV = 'test';
      clearConfig(); // 設定をクリアして再読み込み
      expect(isDevelopment()).toBe(false);
      expect(isProduction()).toBe(false);
      expect(isTest()).toBe(true);
    });
  });

  describe('異常系テスト（エラーケース）', () => {
    test('必須環境変数未設定時のエラー処理', () => {
      delete process.env.DATABASE_URL;
      
      expect(() => {
        loadEnvironment();
      }).toThrow(EnvironmentConfigError);
      
      expect(() => {
        loadEnvironment();
      }).toThrow('環境変数の設定が不正です');
    });

    test('JWT_SECRET未設定時のエラー', () => {
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_EXPIRES_IN = '24h';
      delete process.env.JWT_SECRET;
      
      expect(() => {
        loadEnvironment();
      }).toThrow(EnvironmentConfigError);
    });

    test('複数の必須変数未設定時の詳細エラーメッセージ', () => {
      delete process.env.DATABASE_URL;
      delete process.env.DATABASE_NAME;
      delete process.env.JWT_SECRET;
      
      expect(() => {
        loadEnvironment();
      }).toThrow(/環境変数の設定が不正です/);
    });
  });

  describe('境界値テスト（エッジケース）', () => {
    beforeEach(() => {
      // 基本設定
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_EXPIRES_IN = '24h';
    });

    test('JWT_SECRET最小長（32文字）での成功', () => {
      process.env.JWT_SECRET = '12345678901234567890123456789012'; // 32文字
      
      expect(() => {
        loadEnvironment();
      }).not.toThrow();
    });

    test('JWT_SECRET長さ不足（31文字）でのエラー', () => {
      process.env.JWT_SECRET = '1234567890123456789012345678901'; // 31文字
      
      expect(() => {
        loadEnvironment();
      }).toThrow(/JWT_SECRET.*length must be at least 32 characters/);
    });

    test('不正なPORT番号での検証エラー', () => {
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.PORT = '70000'; // 無効なポート番号
      
      expect(() => {
        loadEnvironment();
      }).toThrow(EnvironmentConfigError);
    });

    test('不正なNODE_ENVでの検証エラー', () => {
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.NODE_ENV = 'invalid_env';
      
      expect(() => {
        loadEnvironment();
      }).toThrow(EnvironmentConfigError);
    });

    test('不正なLOG_LEVELでの検証エラー', () => {
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.LOG_LEVEL = 'invalid_level';
      
      expect(() => {
        loadEnvironment();
      }).toThrow(EnvironmentConfigError);
    });
  });

  describe('セキュリティテスト', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_EXPIRES_IN = '24h';
    });

    test('JWT秘密鍵強度の確保（32文字以上）', () => {
      process.env.JWT_SECRET = 'short'; // 弱い秘密鍵
      
      expect(() => {
        loadEnvironment();
      }).toThrow(/JWT_SECRET.*length must be at least 32 characters/);
    });

    test('強力なJWT秘密鍵での成功', () => {
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-64-characters-long-string';
      
      expect(() => {
        loadEnvironment();
      }).not.toThrow();
      
      const config = loadEnvironment();
      expect(config.jwt.secret.length).toBeGreaterThanOrEqual(32);
    });

    test('機密情報の型安全性確認', () => {
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      
      const config = loadEnvironment();
      
      // 型チェック
      expect(typeof config.jwt.secret).toBe('string');
      expect(typeof config.database.url).toBe('string');
      
      // 空でないことを確認
      expect(config.jwt.secret).toBeTruthy();
      expect(config.database.url).toBeTruthy();
    });
  });

  describe('validateConfig()関数のテスト', () => {
    test('設定値検証の正常動作', () => {
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.JWT_EXPIRES_IN = '24h';
      
      expect(() => {
        validateConfig();
      }).not.toThrow();
      
      const result = validateConfig();
      expect(result.DATABASE_URL).toBe('./data/test.sqlite');
      expect(result.DATABASE_NAME).toBe('test_db');
    });

    test('検証エラー時の詳細メッセージ', () => {
      delete process.env.DATABASE_URL;
      delete process.env.JWT_SECRET;
      
      expect(() => {
        validateConfig();
      }).toThrow(/環境変数の設定が不正です/);
    });
  });

  describe('EnvironmentConfigErrorクラス', () => {
    test('カスタムエラークラスの正常動作', () => {
      const error = new EnvironmentConfigError('テストエラーメッセージ');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(EnvironmentConfigError);
      expect(error.name).toBe('EnvironmentConfigError');
      expect(error.message).toBe('テストエラーメッセージ');
    });
  });

  describe('ログ出力機能のテスト', () => {
    beforeEach(() => {
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.JWT_EXPIRES_IN = '24h';
      process.env.PORT = '3000';
      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'info';
      process.env.CORS_ORIGIN = 'http://localhost:3000';
      process.env.API_PREFIX = '/api/v1';
    });

    test('logConfigInfo()の実行とコンソール出力', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      // 動的にlogConfigInfoをインポートして実行
      const { logConfigInfo } = require('../environment');
      logConfigInfo();
      
      expect(consoleSpy).toHaveBeenCalledWith('🔧 Environment Configuration:');
      expect(consoleSpy).toHaveBeenCalledWith('  📊 Node Environment: development');
      expect(consoleSpy).toHaveBeenCalledWith('  🌐 Server Port: 3000');
      expect(consoleSpy).toHaveBeenCalledWith('  📋 Log Level: info');
      expect(consoleSpy).toHaveBeenCalledWith('  🌍 CORS Origin: http://localhost:3000');
      expect(consoleSpy).toHaveBeenCalledWith('  🛤️  API Prefix: /api/v1');
      expect(consoleSpy).toHaveBeenCalledWith('  🗄️  Database: test_db');
      
      consoleSpy.mockRestore();
    });

    test('テスト環境での設定抑制', () => {
      process.env.NODE_ENV = 'test';
      clearConfig();
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      const { logConfigInfo } = require('../environment');
      logConfigInfo();
      
      // テスト環境ではログ出力されない
      expect(consoleSpy).not.toHaveBeenCalledWith('🔧 Environment Configuration:');
      
      consoleSpy.mockRestore();
    });
  });

  describe('異常系（例外ハンドリング）テスト', () => {
    test('loadEnvironment()での一般例外ハンドリング', () => {
      // Joiの検証を強制的に失敗させる不正な環境変数を設定
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.JWT_EXPIRES_IN = '24h';
      process.env.PORT = 'invalid_port'; // 不正なポート値
      
      expect(() => {
        loadEnvironment();
      }).toThrow(EnvironmentConfigError);
      expect(() => {
        loadEnvironment();
      }).toThrow(/環境変数の設定が不正です/);
    });

    test('JWT秘密鍵長度チェック（実装内の条件分岐）', () => {
      // 有効なJoiバリデーションを通過するが、実装内チェックで失敗
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_SECRET = '12345678901234567890123456789012'; // 32文字（Joi通過）
      process.env.JWT_EXPIRES_IN = '24h';
      
      // 32文字は成功するはず
      expect(() => {
        loadEnvironment();
      }).not.toThrow();

      // 31文字で実装内チェック失敗
      process.env.JWT_SECRET = '1234567890123456789012345678901'; // 31文字
      expect(() => {
        loadEnvironment();
      }).toThrow();
    });
  });

  describe('clearConfig()機能テスト', () => {
    test('clearConfig()によるシングルトンリセット', () => {
      process.env.DATABASE_URL = './data/test.sqlite';
      process.env.DATABASE_NAME = 'test_db';
      process.env.JWT_SECRET = 'this-is-a-very-secure-secret-key-with-32-chars-minimum';
      process.env.JWT_EXPIRES_IN = '24h';
      
      const config1 = getConfig();
      clearConfig();
      const config2 = getConfig();
      
      // 設定内容は同じだが、オブジェクトインスタンスは異なる
      expect(config1).toEqual(config2);
      expect(config1).not.toBe(config2); // 異なるインスタンス
    });
  });
}); 