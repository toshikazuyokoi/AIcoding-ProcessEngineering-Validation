# TSK-003-CFG-Database Issue仕様書

## 概要
**タスクID**: TSK-003-CFG-Database  
**ファイル**: src/config/database.ts  
**複雑度**: 中  
**見積時間**: 2時間  
**優先度**: 🥉高（データベース設定）  
**フェーズ**: Phase 1: データベース・設定基盤構築  

## 実装対象
- **ファイル**: `src/config/database.ts`
- **機能**: SQLite設定・接続設定・プール管理
- **レイヤー**: Configuration
- **依存関係**: TSK-001 (環境変数), TSK-002 (スキーマ)

## 実装仕様

### 前提条件
- 依存タスク: TSK-001-CFG-Environment, TSK-002-DB-Schema
- 参照設計書: `docs/step3/detailed-design/database-config.md`

### 機能要件
1. **データベース接続設定**: SQLite接続文字列・オプション設定
2. **接続プール管理**: 接続数制限・タイムアウト設定
3. **トランザクション管理**: 自動コミット・ロールバック
4. **エラーハンドリング**: 接続エラー・SQL実行エラー処理
5. **ヘルスチェック**: 接続状態監視・復旧処理

### TypeScript型定義
```typescript
interface DatabaseConfig {
  host?: string;
  port?: number;
  database: string;
  username?: string;
  password?: string;
  pool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
  };
  migrations: {
    directory: string;
    tableName: string;
  };
}

interface DatabaseConnection {
  query<T>(sql: string, params?: any[]): Promise<T[]>;
  execute(sql: string, params?: any[]): Promise<void>;
  transaction<T>(callback: (trx: Transaction) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
```

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
- [ ] 2. コーディング
- [ ] 3. テストコーディング
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：設定読み込み・接続確立成功
- [ ] 異常系テスト：不正設定・接続失敗時のエラー処理
- [ ] 境界値テスト：接続プール上限・タイムアウト処理
- [ ] 統合テスト：環境変数との連携確認

## 完了条件
- [ ] データベース設定機能実装完了
- [ ] 接続プール管理実装完了
- [ ] エラーハンドリング実装完了
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] TypeScript厳密モード エラー0件

## 関連情報
- **設計書**: `docs/step3/detailed-design/database-config.md`
- **依存タスク**: TSK-001, TSK-002
- **後続タスク**: TSK-004 (接続管理)
- **ライブラリ**: sqlite3, knex.js

## 備考
- SQLiteの特性を考慮した設定最適化
- 本番環境での性能・安定性考慮
- デバッグモードでのクエリログ出力対応 