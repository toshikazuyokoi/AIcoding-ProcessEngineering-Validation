# TSK-004-DAL-Connection Issue仕様書

## 概要
**タスクID**: TSK-004-DAL-Connection  
**ファイル**: src/infrastructure/database/Connection.ts  
**複雑度**: 高  
**見積時間**: 4時間  
**優先度**: 🥇最重要（データアクセス基盤・接続管理）  
**フェーズ**: Phase 1: データベース・設定基盤構築  

## 実装対象
- **ファイル**: `src/infrastructure/database/Connection.ts`
- **クラス**: DatabaseConnection・ConnectionPool・TransactionManager
- **レイヤー**: Infrastructure（データアクセス層）
- **責任範囲**: DB接続管理・プール制御・トランザクション・接続監視

## 実装仕様

### 前提条件
- 依存タスク: TSK-002-DB-Schema, TSK-003-CFG-Database
- 参照設計書: `docs/step3/detailed-design/database-connection.md`
- 技術スタック: SQLite, Node.js, TypeScript

### コア機能実装

#### 1. DatabaseConnection クラス
```typescript
export class DatabaseConnection {
  private db: Database;
  private isConnected: boolean = false;
  private transactionDepth: number = 0;

  constructor(private config: DatabaseConfig) {
    this.validateConfig(config);
  }

  async connect(): Promise<Result<void, DatabaseError>> {
    try {
      this.db = new sqlite3.Database(this.config.database, (err) => {
        if (err) {
          throw new DatabaseError(`Connection failed: ${err.message}`);
        }
      });
      
      await this.enableForeignKeys();
      await this.setPragmas();
      this.isConnected = true;
      
      return Ok(undefined);
    } catch (error) {
      return Err(new DatabaseError(`Failed to connect: ${error.message}`));
    }
  }

  async query<T>(sql: string, params: any[] = []): Promise<Result<T[], DatabaseError>> {
    if (!this.isConnected) {
      return Err(new DatabaseError('Database not connected'));
    }

    try {
      const startTime = Date.now();
      const result = await this.executeQuery<T>(sql, params);
      this.logQuery(sql, params, Date.now() - startTime);
      
      return Ok(result);
    } catch (error) {
      this.logError(sql, params, error);
      return Err(new DatabaseError(`Query failed: ${error.message}`));
    }
  }

  async execute(sql: string, params: any[] = []): Promise<Result<DatabaseResult, DatabaseError>> {
    if (!this.isConnected) {
      return Err(new DatabaseError('Database not connected'));
    }

    try {
      const startTime = Date.now();
      const result = await this.executeStatement(sql, params);
      this.logQuery(sql, params, Date.now() - startTime);
      
      return Ok({
        lastInsertRowid: result.lastID,
        changes: result.changes
      });
    } catch (error) {
      this.logError(sql, params, error);
      return Err(new DatabaseError(`Execute failed: ${error.message}`));
    }
  }

  async disconnect(): Promise<void> {
    if (this.db && this.isConnected) {
      await new Promise<void>((resolve, reject) => {
        this.db.close((err) => {
          if (err) reject(err);
          else {
            this.isConnected = false;
            resolve();
          }
        });
      });
    }
  }
}
```

#### 2. ConnectionPool クラス
```typescript
export class ConnectionPool {
  private connections: DatabaseConnection[] = [];
  private availableConnections: DatabaseConnection[] = [];
  private busyConnections: Set<DatabaseConnection> = new Set();
  private waitingQueue: Array<{
    resolve: (connection: DatabaseConnection) => void;
    reject: (error: Error) => void;
    timeout: NodeJS.Timeout;
  }> = [];

  constructor(private config: PoolConfig) {
    this.validatePoolConfig(config);
  }

  async initialize(): Promise<Result<void, DatabaseError>> {
    try {
      // 最小接続数分の接続を作成
      for (let i = 0; i < this.config.min; i++) {
        const connection = new DatabaseConnection(this.config.database);
        const connectResult = await connection.connect();
        
        if (!connectResult.success) {
          return Err(connectResult.error);
        }
        
        this.connections.push(connection);
        this.availableConnections.push(connection);
      }
      
      return Ok(undefined);
    } catch (error) {
      return Err(new DatabaseError(`Pool initialization failed: ${error.message}`));
    }
  }

  async acquire(): Promise<DatabaseConnection> {
    // 利用可能な接続がある場合
    if (this.availableConnections.length > 0) {
      const connection = this.availableConnections.pop()!;
      this.busyConnections.add(connection);
      return connection;
    }

    // 最大接続数に達していない場合、新しい接続を作成
    if (this.connections.length < this.config.max) {
      const connection = new DatabaseConnection(this.config.database);
      const connectResult = await connection.connect();
      
      if (connectResult.success) {
        this.connections.push(connection);
        this.busyConnections.add(connection);
        return connection;
      }
    }

    // 接続を待機
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.removeFromQueue(resolve);
        reject(new DatabaseError('Connection acquire timeout'));
      }, this.config.acquireTimeoutMillis);

      this.waitingQueue.push({ resolve, reject, timeout });
    });
  }

  release(connection: DatabaseConnection): void {
    if (!this.busyConnections.has(connection)) {
      throw new DatabaseError('Connection not acquired from this pool');
    }

    this.busyConnections.delete(connection);

    // 待機中のリクエストがある場合
    if (this.waitingQueue.length > 0) {
      const waiter = this.waitingQueue.shift()!;
      clearTimeout(waiter.timeout);
      this.busyConnections.add(connection);
      waiter.resolve(connection);
      return;
    }

    // アイドル接続として戻す
    this.availableConnections.push(connection);
  }
}
```

#### 3. TransactionManager クラス
```typescript
export class TransactionManager {
  private activeTransactions: Map<string, Transaction> = new Map();

  async transaction<T>(
    connection: DatabaseConnection,
    callback: (trx: Transaction) => Promise<T>
  ): Promise<Result<T, DatabaseError>> {
    const transactionId = this.generateTransactionId();
    const transaction = new Transaction(connection, transactionId);
    
    try {
      this.activeTransactions.set(transactionId, transaction);
      
      await transaction.begin();
      const result = await callback(transaction);
      await transaction.commit();
      
      this.activeTransactions.delete(transactionId);
      return Ok(result);
    } catch (error) {
      await transaction.rollback();
      this.activeTransactions.delete(transactionId);
      return Err(new DatabaseError(`Transaction failed: ${error.message}`));
    }
  }

  async rollbackAll(): Promise<void> {
    const rollbackPromises = Array.from(this.activeTransactions.values())
      .map(transaction => transaction.rollback());
    
    await Promise.all(rollbackPromises);
    this.activeTransactions.clear();
  }
}

export class Transaction {
  private isActive: boolean = false;
  private savepoints: string[] = [];

  constructor(
    private connection: DatabaseConnection,
    private id: string
  ) {}

  async begin(): Promise<void> {
    const result = await this.connection.execute('BEGIN TRANSACTION');
    if (!result.success) {
      throw new DatabaseError('Failed to begin transaction');
    }
    this.isActive = true;
  }

  async commit(): Promise<void> {
    if (!this.isActive) {
      throw new DatabaseError('No active transaction to commit');
    }
    
    const result = await this.connection.execute('COMMIT');
    if (!result.success) {
      throw new DatabaseError('Failed to commit transaction');
    }
    this.isActive = false;
  }

  async rollback(): Promise<void> {
    if (!this.isActive) {
      return; // Already rolled back or not started
    }
    
    const result = await this.connection.execute('ROLLBACK');
    if (!result.success) {
      console.error('Failed to rollback transaction:', result.error);
    }
    this.isActive = false;
  }

  async savepoint(name: string): Promise<void> {
    const result = await this.connection.execute(`SAVEPOINT ${name}`);
    if (!result.success) {
      throw new DatabaseError(`Failed to create savepoint: ${name}`);
    }
    this.savepoints.push(name);
  }

  async rollbackToSavepoint(name: string): Promise<void> {
    const result = await this.connection.execute(`ROLLBACK TO SAVEPOINT ${name}`);
    if (!result.success) {
      throw new DatabaseError(`Failed to rollback to savepoint: ${name}`);
    }
  }
}
```

### エラーハンドリング・監視

#### 4. ヘルスチェック・監視機能
```typescript
export class ConnectionHealthMonitor {
  private healthCheckInterval: NodeJS.Timeout;
  private metrics: ConnectionMetrics = {
    totalConnections: 0,
    activeConnections: 0,
    failedConnections: 0,
    averageResponseTime: 0,
    lastHealthCheck: new Date()
  };

  constructor(
    private pool: ConnectionPool,
    private config: HealthCheckConfig
  ) {}

  startMonitoring(): void {
    this.healthCheckInterval = setInterval(
      () => this.performHealthCheck(),
      this.config.intervalMs
    );
  }

  stopMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }

  private async performHealthCheck(): Promise<void> {
    try {
      const connection = await this.pool.acquire();
      const startTime = Date.now();
      
      const result = await connection.query('SELECT 1 as health_check');
      const responseTime = Date.now() - startTime;
      
      this.pool.release(connection);
      
      this.updateMetrics(responseTime, true);
    } catch (error) {
      this.updateMetrics(0, false);
      console.error('Health check failed:', error);
    }
  }

  getMetrics(): ConnectionMetrics {
    return { ...this.metrics };
  }
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] データベース接続アーキテクチャ・設計パターン理解
  - [ ] SQLiteの特性・制約・最適化ポイント確認
  - [ ] 接続プール戦略・コネクション管理方針理解
  - [ ] トランザクション分離レベル・デッドロック対策確認
  - [ ] パフォーマンス要件・スケーラビリティ考慮事項
- [ ] 2. コーディング
  - [ ] DatabaseConnection基本クラス実装
    - [ ] 接続確立・切断処理
    - [ ] クエリ実行・パラメータバインディング
    - [ ] エラーハンドリング・ログ出力
  - [ ] ConnectionPool実装
    - [ ] プール初期化・サイズ管理
    - [ ] 接続取得・返却・タイムアウト処理
    - [ ] 待機キュー・優先度制御
  - [ ] TransactionManager実装
    - [ ] トランザクション開始・コミット・ロールバック
    - [ ] セーブポイント・ネストトランザクション対応
    - [ ] デッドロック検出・自動リトライ
  - [ ] HealthMonitor実装
    - [ ] 接続監視・メトリクス収集
    - [ ] 障害検出・自動復旧処理
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 接続確立・クエリ実行・トランザクション成功
    - [ ] プール管理・接続取得返却の正常動作
    - [ ] 複数同時接続・並行処理の安定性
  - [ ] 異常系テスト
    - [ ] 接続失敗・タイムアウト・ネットワーク障害
    - [ ] SQLエラー・制約違反・デッドロック
    - [ ] プール枯渇・メモリ不足・リソース競合
  - [ ] 境界値テスト
    - [ ] 最大接続数・タイムアウト境界値
    - [ ] 大量データ・長時間トランザクション
    - [ ] メモリ制限・CPU負荷限界
  - [ ] 統合テスト
    - [ ] 設定ファイル・環境変数との連携
    - [ ] 他コンポーネントとの接続テスト
- [ ] 4. 単体テスト実行
  - [ ] 全メソッド・クラスの個別テスト実行
  - [ ] カバレッジ95%以上達成確認
  - [ ] パフォーマンステスト・負荷テスト実行
  - [ ] メモリリーク・リソース管理確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#004): データベース接続管理層実装
  - [ ] 適切なコミット粒度・メッセージ品質
  - [ ] Issue #004の完全な紐付け
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] 品質基準達成確認（型安全性・規約準拠）
  - [ ] ドキュメント更新（API・設定・運用）
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] レビュー・承認プロセス完了
  - [ ] 次タスクへの影響・依存関係確認

## テスト要件
- [ ] 正常系テスト：接続確立・クエリ実行・トランザクション処理成功
- [ ] 異常系テスト：接続失敗・SQL実行エラー・ネットワーク障害対応
- [ ] 境界値テスト：接続数上限・タイムアウト境界・メモリ制限
- [ ] 並行性テスト：同時接続・並行トランザクション・競合状態
- [ ] 性能テスト：スループット・レスポンス時間・リソース使用量
- [ ] 耐久性テスト：長時間稼働・接続リーク・メモリリーク検証
- [ ] 統合テスト：設定管理・他コンポーネントとの連携

## 完了条件
- [ ] DatabaseConnection・ConnectionPool・TransactionManager実装完了
- [ ] 接続プール管理・トランザクション制御実装完了
- [ ] ヘルスチェック・監視機能実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] 性能要件達成（100req/sec以上処理可能）
- [ ] メモリリーク・リソースリーク0件確認
- [ ] TypeScript厳密モード エラー0件
- [ ] ESLint・Prettier規約準拠

## 関連情報
- **設計書**: `docs/step3/detailed-design/database-connection.md`
- **依存タスク**: TSK-002 (DBスキーマ), TSK-003 (DB設定)
- **後続タスク**: TSK-017, TSK-018 (Repository実装)
- **技術**: SQLite, sqlite3 node module, TypeScript
- **パターン**: Connection Pool, Transaction Script, Unit of Work

## 備考
- SQLiteの制約（単一Writer）を考慮した接続管理
- 本番環境での高可用性・パフォーマンス最適化
- 監視・ログ・メトリクス収集の充実
- 将来的なデータベース移行（PostgreSQL等）への対応考慮
- ヘルスチェック・自動復旧メカニズムの実装 