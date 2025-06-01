# TSK-013-TYP-Database Issue仕様書

## 概要
**タスクID**: TSK-013-TYP-Database  
**ファイル**: src/types/database.ts  
**複雑度**: 中  
**見積時間**: 2.5時間  
**優先度**: 🥇最重要（データベース型定義・ORM・トランザクション）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/database.ts`
- **型定義**: データベース操作・クエリ・トランザクション・接続管理型
- **レイヤー**: Types（型定義層）
- **責任範囲**: DB接続・クエリ・トランザクション・ORM・監視型定義

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core, TSK-008-TYP-Error
- 参照設計書: `docs/step3/detailed-design/database-types.md`
- 技術スタック: SQLite, TypeScript, SQL Query Builder

### データベース型システム設計

#### 1. Core Database Types
```typescript
import { Brand, Result, Option, Timestamp } from './core.js';
import { ErrorCode, ErrorMessage } from './error.js';

export type ConnectionString = Brand<string, 'ConnectionString'>;
export type QueryString = Brand<string, 'QueryString'>;
export type TableName = Brand<string, 'TableName'>;
export type ColumnName = Brand<string, 'ColumnName'>;
export type IndexName = Brand<string, 'IndexName'>;
export type TransactionID = Brand<string, 'TransactionID'>;
export type ConnectionID = Brand<string, 'ConnectionID'>;

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  connectionString?: ConnectionString;
  ssl?: boolean | SSLConfig;
  pool?: PoolConfig;
  timeout?: TimeoutConfig;
  logging?: LoggingConfig;
  migrations?: MigrationConfig;
  backup?: BackupConfig;
}

export interface SSLConfig {
  ca?: string;
  cert?: string;
  key?: string;
  rejectUnauthorized?: boolean;
}

export interface PoolConfig {
  min: number;
  max: number;
  acquireTimeoutMillis: number;
  createTimeoutMillis: number;
  destroyTimeoutMillis: number;
  idleTimeoutMillis: number;
  reapIntervalMillis: number;
  createRetryIntervalMillis: number;
  propagateCreateError: boolean;
  testOnBorrow: boolean;
}

export interface TimeoutConfig {
  query: number;    // milliseconds
  connection: number;
  transaction: number;
  statement: number;
}

export interface LoggingConfig {
  enabled: boolean;
  level: 'debug' | 'info' | 'warn' | 'error';
  queries: boolean;
  parameters: boolean;
  errors: boolean;
  slow: {
    enabled: boolean;
    threshold: number; // milliseconds
  };
}

export interface MigrationConfig {
  directory: string;
  tableName: string;
  autoRun: boolean;
  validateChecksums: boolean;
}

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  directory: string;
  retention: number; // days
  compression: boolean;
}
```

#### 2. Connection & Transaction Types
```typescript
export interface DatabaseConnection {
  id: ConnectionID;
  config: DatabaseConfig;
  state: ConnectionState;
  metadata: ConnectionMetadata;
  statistics: ConnectionStatistics;
}

export type ConnectionState = 'connecting' | 'connected' | 'idle' | 'busy' | 'error' | 'closed';

export interface ConnectionMetadata {
  createdAt: Timestamp;
  lastUsed: Timestamp;
  totalQueries: number;
  currentTransaction?: TransactionID;
  clientInfo?: {
    application: string;
    version: string;
    pid: number;
  };
}

export interface ConnectionStatistics {
  queriesExecuted: number;
  averageQueryTime: number;
  totalQueryTime: number;
  errorsEncountered: number;
  transactionsCommitted: number;
  transactionsRolledBack: number;
}

export interface Transaction {
  id: TransactionID;
  connectionId: ConnectionID;
  state: TransactionState;
  isolation: IsolationLevel;
  metadata: TransactionMetadata;
  savepoints: Savepoint[];
}

export type TransactionState = 'active' | 'committed' | 'rolled_back' | 'failed';

export type IsolationLevel = 
  | 'READ_UNCOMMITTED'
  | 'READ_COMMITTED' 
  | 'REPEATABLE_READ'
  | 'SERIALIZABLE';

export interface TransactionMetadata {
  startedAt: Timestamp;
  endedAt?: Timestamp;
  duration?: number; // milliseconds
  statements: StatementMetadata[];
  readOnly: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export interface Savepoint {
  name: string;
  createdAt: Timestamp;
  active: boolean;
}

export interface StatementMetadata {
  query: QueryString;
  parameters?: unknown[];
  startedAt: Timestamp;
  endedAt?: Timestamp;
  duration?: number;
  rowsAffected?: number;
  error?: DatabaseError;
}
```

#### 3. Query Builder Types
```typescript
export interface QueryBuilder<T = unknown> {
  select(columns?: ColumnSelector<T>): SelectQueryBuilder<T>;
  insert(data: Partial<T> | Partial<T>[]): InsertQueryBuilder<T>;
  update(data: Partial<T>): UpdateQueryBuilder<T>;
  delete(): DeleteQueryBuilder<T>;
  raw(query: QueryString, parameters?: unknown[]): RawQueryBuilder;
}

export type ColumnSelector<T> = (keyof T)[] | '*' | Record<string, string>;

export interface SelectQueryBuilder<T> {
  from(table: TableName): SelectQueryBuilder<T>;
  join(table: TableName, condition: JoinCondition): SelectQueryBuilder<T>;
  leftJoin(table: TableName, condition: JoinCondition): SelectQueryBuilder<T>;
  rightJoin(table: TableName, condition: JoinCondition): SelectQueryBuilder<T>;
  innerJoin(table: TableName, condition: JoinCondition): SelectQueryBuilder<T>;
  where(condition: WhereCondition<T>): SelectQueryBuilder<T>;
  whereIn(column: keyof T, values: unknown[]): SelectQueryBuilder<T>;
  whereBetween(column: keyof T, range: [unknown, unknown]): SelectQueryBuilder<T>;
  orderBy(column: keyof T, direction?: 'asc' | 'desc'): SelectQueryBuilder<T>;
  groupBy(columns: (keyof T)[]): SelectQueryBuilder<T>;
  having(condition: HavingCondition<T>): SelectQueryBuilder<T>;
  limit(count: number): SelectQueryBuilder<T>;
  offset(count: number): SelectQueryBuilder<T>;
  distinct(): SelectQueryBuilder<T>;
  count(column?: keyof T): SelectQueryBuilder<{ count: number }>;
  sum(column: keyof T): SelectQueryBuilder<{ sum: number }>;
  avg(column: keyof T): SelectQueryBuilder<{ avg: number }>;
  min(column: keyof T): SelectQueryBuilder<{ min: unknown }>;
  max(column: keyof T): SelectQueryBuilder<{ max: unknown }>;
  build(): CompiledQuery;
  execute(): Promise<Result<T[], DatabaseError>>;
  executeFirst(): Promise<Result<Option<T>, DatabaseError>>;
}

export interface InsertQueryBuilder<T> {
  into(table: TableName): InsertQueryBuilder<T>;
  onConflict(strategy: ConflictStrategy): InsertQueryBuilder<T>;
  returning(columns?: (keyof T)[]): InsertQueryBuilder<T>;
  build(): CompiledQuery;
  execute(): Promise<Result<InsertResult<T>, DatabaseError>>;
}

export interface UpdateQueryBuilder<T> {
  table(table: TableName): UpdateQueryBuilder<T>;
  where(condition: WhereCondition<T>): UpdateQueryBuilder<T>;
  returning(columns?: (keyof T)[]): UpdateQueryBuilder<T>;
  build(): CompiledQuery;
  execute(): Promise<Result<UpdateResult<T>, DatabaseError>>;
}

export interface DeleteQueryBuilder<T> {
  from(table: TableName): DeleteQueryBuilder<T>;
  where(condition: WhereCondition<T>): DeleteQueryBuilder<T>;
  returning(columns?: (keyof T)[]): DeleteQueryBuilder<T>;
  build(): CompiledQuery;
  execute(): Promise<Result<DeleteResult, DatabaseError>>;
}

export interface RawQueryBuilder {
  build(): CompiledQuery;
  execute<T = unknown>(): Promise<Result<T[], DatabaseError>>;
}

export type JoinCondition = string | [string, string] | [string, string, string];
export type WhereCondition<T> = Partial<T> | WhereClause<T> | WhereFunction<T>;
export type HavingCondition<T> = WhereCondition<T>;

export interface WhereClause<T> {
  column: keyof T;
  operator: WhereOperator;
  value: unknown;
  boolean?: 'and' | 'or';
}

export type WhereOperator = '=' | '!=' | '<>' | '<' | '<=' | '>' | '>=' | 'LIKE' | 'ILIKE' | 'IN' | 'NOT IN' | 'IS NULL' | 'IS NOT NULL';

export type WhereFunction<T> = (builder: WhereBuilder<T>) => void;

export interface WhereBuilder<T> {
  where(condition: WhereCondition<T>): WhereBuilder<T>;
  orWhere(condition: WhereCondition<T>): WhereBuilder<T>;
  whereNot(condition: WhereCondition<T>): WhereBuilder<T>;
  orWhereNot(condition: WhereCondition<T>): WhereBuilder<T>;
  whereNull(column: keyof T): WhereBuilder<T>;
  whereNotNull(column: keyof T): WhereBuilder<T>;
  whereIn(column: keyof T, values: unknown[]): WhereBuilder<T>;
  whereNotIn(column: keyof T, values: unknown[]): WhereBuilder<T>;
  whereBetween(column: keyof T, range: [unknown, unknown]): WhereBuilder<T>;
  whereNotBetween(column: keyof T, range: [unknown, unknown]): WhereBuilder<T>;
}

export type ConflictStrategy = 'IGNORE' | 'REPLACE' | 'UPDATE' | 'ABORT' | 'FAIL' | 'ROLLBACK';

export interface CompiledQuery {
  sql: QueryString;
  parameters: unknown[];
  metadata: {
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'RAW';
    tables: TableName[];
    estimated_rows?: number;
    execution_plan?: string;
  };
}
```

#### 4. Query Result Types
```typescript
export interface QueryResult<T = unknown> {
  data: T[];
  metadata: QueryMetadata;
  pagination?: PaginationInfo;
}

export interface QueryMetadata {
  rowCount: number;
  duration: number; // milliseconds
  query: CompiledQuery;
  executedAt: Timestamp;
  cached: boolean;
  warnings?: string[];
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface InsertResult<T = unknown> {
  insertedCount: number;
  insertedIds: unknown[];
  returning?: T[];
  metadata: QueryMetadata;
}

export interface UpdateResult<T = unknown> {
  updatedCount: number;
  changedRows: number;
  returning?: T[];
  metadata: QueryMetadata;
}

export interface DeleteResult {
  deletedCount: number;
  metadata: QueryMetadata;
}

export interface BulkResult<T = unknown> {
  totalCount: number;
  successCount: number;
  errorCount: number;
  results: Array<Result<T, DatabaseError>>;
  errors: DatabaseError[];
  metadata: QueryMetadata;
}
```

#### 5. Schema & Migration Types
```typescript
export interface TableSchema {
  name: TableName;
  columns: ColumnDefinition[];
  indexes: IndexDefinition[];
  constraints: ConstraintDefinition[];
  triggers?: TriggerDefinition[];
  metadata: TableMetadata;
}

export interface ColumnDefinition {
  name: ColumnName;
  type: SQLDataType;
  nullable: boolean;
  defaultValue?: unknown;
  primaryKey: boolean;
  autoIncrement: boolean;
  unique: boolean;
  references?: ForeignKeyReference;
  check?: string;
  comment?: string;
}

export type SQLDataType = 
  | 'INTEGER' | 'BIGINT' | 'SMALLINT' | 'TINYINT'
  | 'REAL' | 'DOUBLE' | 'FLOAT' | 'DECIMAL' | 'NUMERIC'
  | 'TEXT' | 'VARCHAR' | 'CHAR' | 'CLOB'
  | 'BLOB' | 'BINARY'
  | 'DATE' | 'TIME' | 'DATETIME' | 'TIMESTAMP'
  | 'BOOLEAN'
  | 'JSON';

export interface IndexDefinition {
  name: IndexName;
  columns: ColumnName[];
  unique: boolean;
  type: IndexType;
  condition?: string;
  metadata?: {
    size?: number;
    cardinality?: number;
    selectivity?: number;
  };
}

export type IndexType = 'BTREE' | 'HASH' | 'RTREE' | 'FULLTEXT';

export interface ConstraintDefinition {
  name: string;
  type: ConstraintType;
  columns: ColumnName[];
  references?: ForeignKeyReference;
  check?: string;
  deferrable?: boolean;
  initially?: 'DEFERRED' | 'IMMEDIATE';
}

export type ConstraintType = 'PRIMARY_KEY' | 'FOREIGN_KEY' | 'UNIQUE' | 'CHECK' | 'NOT_NULL';

export interface ForeignKeyReference {
  table: TableName;
  columns: ColumnName[];
  onUpdate?: ReferentialAction;
  onDelete?: ReferentialAction;
}

export type ReferentialAction = 'CASCADE' | 'SET_NULL' | 'SET_DEFAULT' | 'RESTRICT' | 'NO_ACTION';

export interface TriggerDefinition {
  name: string;
  timing: 'BEFORE' | 'AFTER' | 'INSTEAD_OF';
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  table: TableName;
  condition?: string;
  body: string;
}

export interface TableMetadata {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rowCount: number;
  dataSize: number; // bytes
  indexSize: number; // bytes
  autoVacuum: boolean;
  checksum?: string;
}

export interface Migration {
  version: string;
  name: string;
  up: MigrationOperation[];
  down: MigrationOperation[];
  metadata: MigrationMetadata;
}

export interface MigrationMetadata {
  description?: string;
  author?: string;
  createdAt: Timestamp;
  appliedAt?: Timestamp;
  duration?: number;
  checksum: string;
  dependencies?: string[];
}

export interface MigrationOperation {
  type: MigrationOperationType;
  params: unknown;
  rollback?: MigrationOperation;
}

export type MigrationOperationType =
  | 'CREATE_TABLE' | 'DROP_TABLE' | 'ALTER_TABLE'
  | 'ADD_COLUMN' | 'DROP_COLUMN' | 'MODIFY_COLUMN'
  | 'CREATE_INDEX' | 'DROP_INDEX'
  | 'ADD_CONSTRAINT' | 'DROP_CONSTRAINT'
  | 'EXECUTE_SQL' | 'SEED_DATA';
```

#### 6. Database Error Types
```typescript
export interface DatabaseError {
  code: DatabaseErrorCode;
  message: ErrorMessage;
  sqlState?: string;
  query?: QueryString;
  parameters?: unknown[];
  constraint?: string;
  table?: TableName;
  column?: ColumnName;
  detail?: string;
  hint?: string;
  position?: number;
  internalPosition?: number;
  internalQuery?: string;
  where?: string;
  schema?: string;
  datatype?: string;
  severity?: DatabaseErrorSeverity;
  timestamp: Timestamp;
}

export type DatabaseErrorCode =
  | 'CONNECTION_FAILED'
  | 'CONNECTION_TIMEOUT'
  | 'QUERY_TIMEOUT'
  | 'SYNTAX_ERROR'
  | 'CONSTRAINT_VIOLATION'
  | 'FOREIGN_KEY_VIOLATION'
  | 'UNIQUE_VIOLATION'
  | 'NOT_NULL_VIOLATION'
  | 'CHECK_VIOLATION'
  | 'INVALID_TRANSACTION_STATE'
  | 'SERIALIZATION_FAILURE'
  | 'DEADLOCK_DETECTED'
  | 'LOCK_TIMEOUT'
  | 'DISK_FULL'
  | 'PERMISSION_DENIED'
  | 'INVALID_CATALOG_NAME'
  | 'INVALID_SCHEMA_NAME'
  | 'INVALID_TABLE_NAME'
  | 'INVALID_COLUMN_NAME'
  | 'DATATYPE_MISMATCH'
  | 'NUMERIC_VALUE_OUT_OF_RANGE'
  | 'DIVISION_BY_ZERO'
  | 'INVALID_DATETIME_FORMAT'
  | 'INVALID_REGEX_PATTERN'
  | 'INSUFFICIENT_PRIVILEGE'
  | 'INTERNAL_ERROR';

export type DatabaseErrorSeverity = 'ERROR' | 'FATAL' | 'PANIC' | 'WARNING' | 'NOTICE' | 'DEBUG' | 'INFO' | 'LOG';

export interface DatabaseHealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: HealthCheckItem[];
  metrics: DatabaseMetrics;
  timestamp: Timestamp;
}

export interface HealthCheckItem {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  value?: unknown;
  threshold?: unknown;
  message?: string;
  duration?: number;
}

export interface DatabaseMetrics {
  connections: {
    active: number;
    idle: number;
    total: number;
    maxUsed: number;
  };
  queries: {
    total: number;
    perSecond: number;
    averageDuration: number;
    slowQueries: number;
  };
  transactions: {
    active: number;
    committed: number;
    rolledBack: number;
    deadlocks: number;
  };
  storage: {
    size: number;
    dataSize: number;
    indexSize: number;
    freeSpace: number;
  };
  cache: {
    hitRatio: number;
    size: number;
    maxSize: number;
  };
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] データベース設計・SQLite制約・最適化要件
  - [ ] トランザクション・ACID特性・同時実行制御
  - [ ] クエリビルダー・ORM・型安全性要件
  - [ ] 監視・メトリクス・ヘルスチェック要件
  - [ ] マイグレーション・スキーマ管理・バックアップ
- [ ] 2. コーディング
  - [ ] Core Database Types実装
    - [ ] DatabaseConfig・ConnectionString・Query型
    - [ ] SSL・Pool・Timeout・Logging設定型
    - [ ] ブランド型活用・型安全性確保
  - [ ] Connection & Transaction実装
    - [ ] DatabaseConnection・Transaction・Savepoint型
    - [ ] 接続状態・メタデータ・統計情報型
    - [ ] 分離レベル・トランザクション管理型
  - [ ] Query Builder実装
    - [ ] QueryBuilder・SelectQuery・InsertQuery型
    - [ ] Where・Join・Order・Group条件型
    - [ ] 型安全・チェーン可能・拡張可能設計
  - [ ] Schema & Migration実装
    - [ ] TableSchema・ColumnDefinition・Index型
    - [ ] Migration・MigrationOperation型
    - [ ] スキーマ進化・バージョン管理対応
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全データベース型生成・クエリビルダー動作
    - [ ] トランザクション・接続管理・スキーマ操作
    - [ ] マイグレーション・バックアップ・復元
  - [ ] 異常系テスト
    - [ ] 接続失敗・タイムアウト・制約違反
    - [ ] トランザクション競合・デッドロック
    - [ ] 大量データ・メモリ不足・ディスク満杯
  - [ ] パフォーマンステスト
    - [ ] 同時接続・大量クエリ・レスポンス時間
    - [ ] インデックス効率・クエリプラン・最適化
    - [ ] メモリ使用量・リソース消費
  - [ ] 統合テスト
    - [ ] 実際のSQLite・ファイルシステム
    - [ ] アプリケーション層・ORM統合
- [ ] 4. 単体テスト実行
  - [ ] 全データベース型・クエリビルダーテスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] 型安全性・制約チェック
  - [ ] パフォーマンス・メモリ効率確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#013): データベース型システム実装
  - [ ] クエリビルダー・ORM・マイグレーション
  - [ ] ドキュメント・スキーマ定義・使用例
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] データベース設計品質確認
  - [ ] パフォーマンス・安定性確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] データベースレビュー・最適化完了
  - [ ] 運用監視・バックアップ戦略確認

## テスト要件
- [ ] 正常系テスト：全データベース型生成・クエリ実行・トランザクション確認
- [ ] 異常系テスト：接続失敗・制約違反・競合状態・リソース不足
- [ ] パフォーマンステスト：同時接続・大量データ・クエリ最適化・レスポンス時間
- [ ] 安定性テスト：長時間運用・メモリリーク・リソース枯渇・復旧能力
- [ ] 統合テスト：アプリケーション連携・ファイルシステム・外部依存

## 完了条件
- [ ] 全データベース型・クエリビルダー実装完了
- [ ] トランザクション・接続管理・スキーマ型実装完了
- [ ] マイグレーション・バックアップ・監視型実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] パフォーマンステスト・安定性テスト合格
- [ ] TypeScript厳密モード エラー0件
- [ ] データベース設計レビュー・最適化完了

## 関連情報
- **設計書**: `docs/step3/detailed-design/database-types.md`
- **依存タスク**: TSK-007 (コア型), TSK-008 (エラー型)
- **後続タスク**: TSK-002 (スキーマ), TSK-003 (DB設定), TSK-004 (接続)
- **データベース**: SQLite Documentation, SQL Standards
- **ORM参考**: Knex.js, TypeORM, Prisma

## 備考
- 型安全・パフォーマンス・可読性最優先
- SQLite最適化・制約・ベストプラクティス準拠
- 将来的なマルチDB対応・拡張性考慮
- 運用監視・デバッグ・保守性重視
- 継続的なパフォーマンス監視・最適化 