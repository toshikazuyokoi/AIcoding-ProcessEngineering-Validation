import dotenv from 'dotenv';
import Joi from 'joi';

// 環境変数を読み込み
dotenv.config();

/**
 * 環境設定の型定義
 */
export interface EnvironmentConfig {
  database: {
    url: string;
    name: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
  server: {
    port: number;
    nodeEnv: 'development' | 'production' | 'test';
  };
  api: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    corsOrigin: string;
    prefix: string;
  };
}

/**
 * 環境変数バリデーションスキーマ
 */
const configSchema = Joi.object({
  DATABASE_URL: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().required(),
  PORT: Joi.number().port().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  LOG_LEVEL: Joi.string().valid('debug', 'info', 'warn', 'error').default('info'),
  CORS_ORIGIN: Joi.string().default('*'),
  API_PREFIX: Joi.string().default('/api/v1')
});

/**
 * 環境設定エラークラス
 */
export class EnvironmentConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EnvironmentConfigError';
  }
}

/**
 * 環境変数の設定値検証
 */
export function validateConfig(): Record<string, unknown> {
  const { error, value } = configSchema.validate(process.env, {
    allowUnknown: true,
    stripUnknown: false
  });

  if (error) {
    const errorMessages = error.details.map((detail: Joi.ValidationErrorItem) => detail.message);
    throw new EnvironmentConfigError(
      `環境変数の設定が不正です: ${errorMessages.join(', ')}`
    );
  }

  return value;
}

/**
 * 環境変数読み込み・バリデーション
 */
export function loadEnvironment(): EnvironmentConfig {
  try {
    const validatedEnv = validateConfig();

    const config: EnvironmentConfig = {
      database: {
        url: validatedEnv.DATABASE_URL as string,
        name: validatedEnv.DATABASE_NAME as string,
      },
      jwt: {
        secret: validatedEnv.JWT_SECRET as string,
        expiresIn: validatedEnv.JWT_EXPIRES_IN as string,
      },
      server: {
        port: validatedEnv.PORT as number,
        nodeEnv: validatedEnv.NODE_ENV as 'development' | 'production' | 'test',
      },
      api: {
        logLevel: validatedEnv.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error',
        corsOrigin: validatedEnv.CORS_ORIGIN as string,
        prefix: validatedEnv.API_PREFIX as string,
      },
    };

    // セキュリティチェック: JWT秘密鍵の強度確認
    if (config.jwt.secret.length < 32) {
      throw new EnvironmentConfigError(
        'JWT_SECRETは32文字以上である必要があります'
      );
    }

    return config;
  } catch (error) {
    if (error instanceof EnvironmentConfigError) {
      throw error;
    }
    throw new EnvironmentConfigError(
      `環境変数の読み込みに失敗しました: ${(error as Error).message}`
    );
  }
}

// グローバル設定インスタンス
let globalConfig: EnvironmentConfig | null = null;

/**
 * 設定値取得（型安全・シングルトン）
 */
export function getConfig(): EnvironmentConfig {
  if (!globalConfig) {
    globalConfig = loadEnvironment();
  }
  return globalConfig;
}

/**
 * グローバル設定をクリア（テスト用）
 */
export function clearConfig(): void {
  globalConfig = null;
}

/**
 * 開発環境判定
 */
export function isDevelopment(): boolean {
  return getConfig().server.nodeEnv === 'development';
}

/**
 * 本番環境判定
 */
export function isProduction(): boolean {
  return getConfig().server.nodeEnv === 'production';
}

/**
 * テスト環境判定
 */
export function isTest(): boolean {
  return getConfig().server.nodeEnv === 'test';
}

/**
 * 環境設定情報をログ出力（機密情報除く）
 */
export function logConfigInfo(): void {
  const config = getConfig();
  
  // テスト環境では出力を抑制
  if (config.server.nodeEnv === 'test') {
    return;
  }
  
  // eslint-disable-next-line no-console
  console.log('🔧 Environment Configuration:');
  // eslint-disable-next-line no-console
  console.log(`  📊 Node Environment: ${config.server.nodeEnv}`);
  // eslint-disable-next-line no-console
  console.log(`  🌐 Server Port: ${config.server.port}`);
  // eslint-disable-next-line no-console
  console.log(`  📋 Log Level: ${config.api.logLevel}`);
  // eslint-disable-next-line no-console
  console.log(`  🌍 CORS Origin: ${config.api.corsOrigin}`);
  // eslint-disable-next-line no-console
  console.log(`  🛤️  API Prefix: ${config.api.prefix}`);
  // eslint-disable-next-line no-console
  console.log(`  🗄️  Database: ${config.database.name}`);
  
  // 機密情報（JWT秘密鍵、データベースURL）は出力しない
} 