# TSK-025-APP-Main Issue仕様書

## 基本情報
**タスクID**: TSK-025-APP-Main  
**タスク名**: アプリケーション統合・起動実装  
**関連ファイル**: `src/app.ts`, `src/index.ts`  
**担当者**: [TBD]  
**作成日**: 2025-01-31  
**優先度**: 最高  
**見積時間**: 8時間  
**複雑度**: 高  

## Overview

### 概要
タスク管理システムの最終統合ポイントとなるアプリケーション起動・設定実装。全コンポーネント（ミドルウェア、サービス、コントローラー、データベース）を統合し、本番運用可能なExpressアプリケーションとして完成させます。

### ビジネス価値
- **システム完成**: 全機能を統合した完動するアプリケーション
- **本番運用対応**: セキュリティ、パフォーマンス、監視を含む本番レベル設定
- **開発効率**: 開発・デバッグ・デプロイの各環境に対応した柔軟な設定
- **品質保証**: 統合テスト・E2Eテストによる全体品質確保

### 技術的位置づけ
- **アーキテクチャ層**: Application Bootstrap / Integration Layer
- **依存タスク**: TSK-024-CTL-AppController, TSK-006-CFG-App, TSK-020-MW-Auth, TSK-021-MW-Validation
- **後続タスク**: なし（最終タスク）
- **統合ポイント**: All Components, Production Deployment, Monitoring

## Implementation Specifications

### Core Requirements

#### 1. Application Bootstrap
```typescript
// src/app.ts - メインアプリケーション設定
import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import winston from 'winston';

// Internal imports
import { AppController } from './controllers/AppController';
import { authMiddleware } from './middleware/auth';
import { validateMiddleware } from './middleware/validation';
import { DatabaseConnection } from './database/connection';
import { Environment } from './config/environment';
import { Logger } from './config/logger';

export class TaskManagementApp {
  private app: Application;
  private controller: AppController;
  private database: DatabaseConnection;
  private logger: winston.Logger;
  
  constructor() {
    this.app = express();
    this.logger = Logger.getInstance();
    this.setupDatabase();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }
  
  /**
   * データベース接続初期化
   */
  private async setupDatabase(): Promise<void> {
    try {
      this.database = DatabaseConnection.getInstance();
      await this.database.connect();
      await this.database.runMigrations();
      
      this.logger.info('Database connected and migrated successfully');
    } catch (error) {
      this.logger.error('Database setup failed:', error);
      throw new Error('Failed to initialize database');
    }
  }
  
  /**
   * ミドルウェア設定
   */
  private setupMiddleware(): void {
    // セキュリティミドルウェア
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"]
        }
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      }
    }));
    
    // CORS設定
    this.app.use(cors({
      origin: Environment.getAllowedOrigins(),
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
    }));
    
    // レート制限
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15分
      max: Environment.isProduction() ? 100 : 1000, // 本番: 100req/15min, 開発: 1000req/15min
      message: {
        error: 'Too many requests',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false
    });
    this.app.use(limiter);
    
    // 基本ミドルウェア
    this.app.use(compression());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
    
    // ログ記録ミドルウェア
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        this.logger.info('HTTP Request', {
          method: req.method,
          url: req.url,
          statusCode: res.statusCode,
          duration,
          userAgent: req.get('User-Agent'),
          ip: req.ip
        });
      });
      
      next();
    });
    
    // ヘルスチェックエンドポイント
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: Environment.getNodeEnv(),
        version: process.env.npm_package_version || '1.0.0'
      });
    });
  }
  
  /**
   * ルート設定
   */
  private setupRoutes(): void {
    // API基本情報
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        name: 'Task Management API',
        version: '1.0.0',
        description: 'RESTful API for task management system',
        documentation: '/api/docs',
        health: '/health',
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          tasks: '/api/tasks'
        }
      });
    });
    
    // コントローラー初期化
    this.controller = new AppController();
    
    // API Routes with middleware
    this.app.use('/api', this.controller.getRouter());
    
    // 存在しないエンドポイントのハンドリング
    this.app.all('*', (req: Request, res: Response) => {
      res.status(404).json({
        error: 'Endpoint not found',
        message: `Cannot ${req.method} ${req.path}`,
        availableEndpoints: [
          'GET /',
          'GET /health',
          'GET /api',
          'POST /api/auth/login',
          'POST /api/auth/register',
          'GET /api/users',
          'GET /api/tasks'
        ]
      });
    });
  }
  
  /**
   * エラーハンドリング設定
   */
  private setupErrorHandling(): void {
    // 非同期エラーキャッチ
    this.app.use(async (error: Error, req: Request, res: Response, next: NextFunction) => {
      this.logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params
      });
      
      // 本番環境ではスタックトレースを隠す
      const response = {
        error: 'Internal Server Error',
        message: Environment.isProduction() 
          ? 'An unexpected error occurred'
          : error.message,
        timestamp: new Date().toISOString(),
        requestId: req.headers['x-request-id']
      };
      
      if (!Environment.isProduction()) {
        response.stack = error.stack;
      }
      
      res.status(500).json(response);
    });
  }
  
  /**
   * アプリケーション起動
   */
  public async start(port: number = Environment.getPort()): Promise<void> {
    try {
      // 本番環境での追加設定
      if (Environment.isProduction()) {
        this.app.set('trust proxy', 1);
      }
      
      this.app.listen(port, () => {
        this.logger.info(`Task Management API server started`, {
          port,
          environment: Environment.getNodeEnv(),
          nodeVersion: process.version,
          pid: process.pid
        });
      });
      
      // グレースフルシャットダウン設定
      this.setupGracefulShutdown();
      
    } catch (error) {
      this.logger.error('Failed to start server:', error);
      throw error;
    }
  }
  
  /**
   * グレースフルシャットダウン
   */
  private setupGracefulShutdown(): void {
    const gracefulShutdown = async (signal: string) => {
      this.logger.info(`Received ${signal}. Starting graceful shutdown...`);
      
      try {
        // データベース接続クローズ
        await this.database.close();
        
        this.logger.info('Graceful shutdown completed');
        process.exit(0);
      } catch (error) {
        this.logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };
    
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
    // 未処理例外ハンドリング
    process.on('uncaughtException', (error: Error) => {
      this.logger.error('Uncaught Exception:', error);
      process.exit(1);
    });
    
    process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
      this.logger.error('Unhandled Rejection:', { reason, promise });
      process.exit(1);
    });
  }
  
  /**
   * アプリケーションインスタンス取得
   */
  public getApp(): Application {
    return this.app;
  }
}
```

#### 2. Application Entry Point
```typescript
// src/index.ts - アプリケーションエントリーポイント
import 'reflect-metadata'; // TypeScript デコレータサポート
import { TaskManagementApp } from './app';
import { Environment } from './config/environment';
import { Logger } from './config/logger';

const logger = Logger.getInstance();

/**
 * メイン実行関数
 */
async function main(): Promise<void> {
  try {
    // 環境変数検証
    Environment.validateRequired();
    
    logger.info('Starting Task Management Application', {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      environment: Environment.getNodeEnv()
    });
    
    // アプリケーション初期化・起動
    const app = new TaskManagementApp();
    await app.start();
    
  } catch (error) {
    logger.error('Application startup failed:', error);
    process.exit(1);
  }
}

// プロセス開始
main().catch((error) => {
  console.error('Fatal error during application startup:', error);
  process.exit(1);
});
```

#### 3. Environment Configuration Validation
```typescript
// src/config/environment.ts の拡張
export class Environment {
  // ... 既存実装 ...
  
  /**
   * 必須環境変数の検証
   */
  public static validateRequired(): void {
    const required = [
      'NODE_ENV',
      'PORT',
      'DATABASE_URL',
      'JWT_SECRET',
      'JWT_EXPIRES_IN'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // JWT秘密鍵の強度確認
    const jwtSecret = process.env.JWT_SECRET!;
    if (this.isProduction() && jwtSecret.length < 32) {
      throw new Error('JWT_SECRET must be at least 32 characters in production');
    }
    
    // ポート番号の妥当性確認
    const port = parseInt(process.env.PORT!, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      throw new Error('PORT must be a valid port number (1-65535)');
    }
  }
  
  /**
   * CORS許可オリジンの取得
   */
  public static getAllowedOrigins(): string[] {
    const origins = process.env.ALLOWED_ORIGINS || 'http://localhost:3000';
    return origins.split(',').map(origin => origin.trim());
  }
  
  /**
   * 本番環境判定
   */
  public static isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }
  
  /**
   * 開発環境判定
   */
  public static isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }
  
  /**
   * テスト環境判定
   */
  public static isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  }
}
```

#### 4. Application Integration Testing
```typescript
// 統合テスト用テストヘルパー
export class TestApp {
  private app: TaskManagementApp;
  private server: any;
  
  public async setup(): Promise<void> {
    // テスト環境設定
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // ランダムポート
    process.env.DATABASE_URL = ':memory:'; // インメモリDB
    process.env.JWT_SECRET = 'test-secret-key-32-characters-long';
    
    this.app = new TaskManagementApp();
    this.server = this.app.getApp().listen();
  }
  
  public async teardown(): Promise<void> {
    if (this.server) {
      this.server.close();
    }
  }
  
  public getApp(): Application {
    return this.app.getApp();
  }
  
  public getBaseUrl(): string {
    const address = this.server.address();
    return `http://localhost:${address.port}`;
  }
}
```

#### 5. Docker & Production Configuration
```typescript
// package.json scripts 拡張
{
  "scripts": {
    "start": "node dist/index.js",
    "start:dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "start:prod": "NODE_ENV=production node dist/index.js",
    "build": "tsc",
    "build:prod": "tsc --build --verbose",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:e2e": "jest --config jest.e2e.config.js",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "migrate": "ts-node src/database/migrate.ts",
    "seed": "ts-node src/database/seed.ts",
    "docker:build": "docker build -t task-management-api .",
    "docker:run": "docker run -p 3000:3000 task-management-api"
  }
}
```

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build:prod

FROM node:18-alpine AS runtime

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

WORKDIR /app

COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["npm", "start"]
```

## Test Requirements

### テストカバレッジ目標: 90%以上

#### 1. 統合テスト
```typescript
describe('Task Management Application Integration', () => {
  let testApp: TestApp;
  
  beforeAll(async () => {
    testApp = new TestApp();
    await testApp.setup();
  });
  
  afterAll(async () => {
    await testApp.teardown();
  });
  
  describe('Application Startup', () => {
    it('should start successfully with all dependencies', async () => {
      const response = await request(testApp.getApp())
        .get('/health')
        .expect(200);
      
      expect(response.body.status).toBe('healthy');
      expect(response.body.environment).toBe('test');
    });
    
    it('should load all middleware correctly', async () => {
      const response = await request(testApp.getApp())
        .get('/')
        .expect(200);
      
      expect(response.body.name).toBe('Task Management API');
      expect(response.body.endpoints).toBeDefined();
    });
  });
  
  describe('Security Middleware', () => {
    it('should set security headers', async () => {
      const response = await request(testApp.getApp())
        .get('/health');
      
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
    
    it('should enforce rate limiting', async () => {
      const requests = Array(10).fill(0).map(() => 
        request(testApp.getApp()).get('/health')
      );
      
      const responses = await Promise.all(requests);
      expect(responses.every(res => res.status === 200)).toBe(true);
    });
  });
  
  describe('Error Handling', () => {
    it('should handle 404 errors gracefully', async () => {
      const response = await request(testApp.getApp())
        .get('/nonexistent')
        .expect(404);
      
      expect(response.body.error).toBe('Endpoint not found');
      expect(response.body.availableEndpoints).toBeDefined();
    });
    
    it('should handle server errors gracefully', async () => {
      // エラー発生をシミュレート
      const app = testApp.getApp();
      app.get('/test-error', () => {
        throw new Error('Test error');
      });
      
      const response = await request(app)
        .get('/test-error')
        .expect(500);
      
      expect(response.body.error).toBe('Internal Server Error');
    });
  });
});
```

#### 2. E2Eテスト
```typescript
describe('End-to-End User Scenarios', () => {
  let testApp: TestApp;
  let authToken: string;
  
  beforeAll(async () => {
    testApp = new TestApp();
    await testApp.setup();
  });
  
  afterAll(async () => {
    await testApp.teardown();
  });
  
  describe('Complete User Journey', () => {
    it('should complete full user registration and task management flow', async () => {
      const app = testApp.getApp();
      
      // 1. ユーザー登録
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(201);
      
      authToken = registerResponse.body.token;
      
      // 2. ログイン確認
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'TestPassword123!'
        })
        .expect(200);
      
      expect(loginResponse.body.token).toBeDefined();
      
      // 3. タスク作成
      const createTaskResponse = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Task',
          description: 'Test task description'
        })
        .expect(201);
      
      const taskId = createTaskResponse.body.id;
      
      // 4. タスク取得
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
      
      // 5. タスク更新
      await request(app)
        .put(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Test Task',
          status: 'IN_PROGRESS'
        })
        .expect(200);
      
      // 6. タスク削除
      await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });
  });
});
```

#### 3. パフォーマンステスト
```typescript
describe('Performance Tests', () => {
  let testApp: TestApp;
  
  beforeAll(async () => {
    testApp = new TestApp();
    await testApp.setup();
  });
  
  afterAll(async () => {
    await testApp.teardown();
  });
  
  it('should handle concurrent requests efficiently', async () => {
    const concurrency = 50;
    const requests = Array(concurrency).fill(0).map(() =>
      request(testApp.getApp()).get('/health')
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const duration = Date.now() - startTime;
    
    expect(responses.every(res => res.status === 200)).toBe(true);
    expect(duration).toBeLessThan(5000); // 5秒以内
  });
  
  it('should have acceptable response times', async () => {
    const startTime = Date.now();
    await request(testApp.getApp()).get('/health');
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(100); // 100ms以内
  });
});
```

## Subtasks

### STEP 1: 仕様書レビュー (45分)
- [ ] 全コンポーネント統合要件の理解
- [ ] セキュリティ・パフォーマンス要件確認
- [ ] 本番運用要件の確認
- [ ] 依存関係の最終確認

### STEP 2: コーディング (4時間)
- [ ] アプリケーション基盤実装
- [ ] ミドルウェア統合
- [ ] ルーティング設定
- [ ] エラーハンドリング実装
- [ ] 環境設定・検証機能
- [ ] グレースフルシャットダウン

### STEP 3: テスト実装 (2時間)
- [ ] 統合テスト作成
- [ ] E2Eテスト作成
- [ ] パフォーマンステスト作成
- [ ] セキュリティテスト作成

### STEP 4: 統合テスト実行 (45分)
- [ ] 全機能統合テスト
- [ ] セキュリティテスト
- [ ] パフォーマンステスト
- [ ] E2Eシナリオテスト

### STEP 5: リポジトリコミット (15分)
- [ ] 最終ファイル追加・変更確認
- [ ] 総合コミットメッセージ作成
- [ ] 最終プッシュ実行

### STEP 6: 最終ToDoチェック (15分)
- [ ] 全25タスク完了確認
- [ ] システム全体動作確認
- [ ] ドキュメント完整性確認

### STEP 7: Issue クローズ・プロジェクト完了 (30分)
- [ ] 最終完了報告作成
- [ ] Issue更新・クローズ
- [ ] プロジェクト完了報告
- [ ] 成果物総括レポート

## Completion Criteria

### 機能完了基準
- [ ] Express.jsアプリケーションが正常起動
- [ ] 全APIエンドポイントが動作
- [ ] データベース接続・マイグレーションが成功
- [ ] 認証・認可が正常動作
- [ ] 全ミドルウェアが統合済み

### 品質基準
- [ ] 統合テストカバレッジ > 90%
- [ ] E2Eテスト成功
- [ ] パフォーマンステスト基準達成
- [ ] セキュリティテスト成功
- [ ] TypeScript型チェック成功

### セキュリティ基準
- [ ] OWASP Top 10対応完了
- [ ] セキュリティヘッダー設定
- [ ] レート制限実装
- [ ] 入力バリデーション統合
- [ ] エラー情報適切制限

### 本番運用基準
- [ ] 環境変数検証機能
- [ ] ログ記録機能完整
- [ ] ヘルスチェック機能
- [ ] グレースフルシャットダウン
- [ ] Docker対応完了

### プロジェクト完了基準
- [ ] 全25タスク完了
- [ ] 設計書との整合性確認
- [ ] 論文実証実験データ収集完了
- [ ] 再現性確保ドキュメント完成

## Related Information

### 統合コンポーネント
- **Controllers**: TSK-024-CTL-AppController
- **Services**: TSK-022-SVC-UserService, TSK-023-SVC-TaskService
- **Repositories**: TSK-017-REP-User, TSK-018-REP-Task
- **Middleware**: TSK-020-MW-Auth, TSK-021-MW-Validation
- **Configuration**: TSK-001-CFG-Environment, TSK-006-CFG-App

### 外部依存
- **Express.js**: Webアプリケーションフレームワーク
- **Helmet**: セキュリティヘッダー
- **CORS**: クロスオリジン設定
- **Winston**: ログ記録
- **SQLite**: データベース

### デプロイメント
- **Docker**: コンテナ化対応
- **PM2**: プロセス管理 (本番)
- **Nginx**: リバースプロキシ (本番)
- **SSL/TLS**: HTTPS対応

## Technical Notes

### アーキテクチャ決定
- **統合パターン**: Dependency Injection vs Service Locator
- **設定管理**: 環境変数 vs 設定ファイル
- **ログ戦略**: 構造化ログ vs プレーンテキスト
- **エラー処理**: 中央化 vs 分散処理

### パフォーマンス最適化
- **起動時間**: アプリケーション初期化の最適化
- **メモリ使用量**: 不要なライブラリの除外
- **レスポンス時間**: ミドルウェアチェーンの最適化
- **スケーラビリティ**: クラスター対応準備

### セキュリティ強化
- **攻撃対策**: DDoS、SQLインジェクション、XSS
- **認証強化**: JWT + リフレッシュトークン
- **監査ログ**: セキュリティイベント記録
- **脆弱性管理**: 依存関係の定期更新

### 運用考慮
- **監視**: ヘルスチェック、メトリクス収集
- **ログ管理**: ログレベル、ローテーション
- **バックアップ**: データベースバックアップ戦略
- **災害復旧**: 障害時復旧手順

### 拡張性設計
- **マイクロサービス**: 将来的な分割対応
- **API バージョニング**: 後方互換性確保
- **プラグイン機能**: 機能拡張アーキテクチャ
- **国際化**: 多言語対応準備

---

**作成者**: Process Engineer  
**レビュワー**: [TBD]  
**承認者**: [TBD]  
**更新履歴**: v1.0 初版作成 (2025-01-31)

**特記事項**: 本タスクはプロジェクト最終タスクであり、全25タスクの完了により論文実証実験が完成します。 