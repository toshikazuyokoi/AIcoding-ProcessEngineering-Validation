# TSK-002-DB-Schema Issue仕様書

## 概要
**タスクID**: TSK-002-DB-Schema  
**ファイル**: schemas/create_tables.sql  
**複雑度**: 中  
**見積時間**: 3時間  
**優先度**: 🥈高（データベース基盤）  
**フェーズ**: Phase 1: データベース・設定基盤構築  

## 実装対象
- **ファイル**: `schemas/create_tables.sql`
- **テーブル**: users, tasks, user_sessions, refresh_tokens
- **レイヤー**: Database Schema
- **依存関係**: TSK-001 (環境変数)

## 実装仕様

### 前提条件
- 依存タスク: TSK-001-CFG-Environment
- 参照設計書: `docs/step3/detailed-design/database-design.md`

### テーブル設計一覧

#### 1. usersテーブル
```sql
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### 2. tasksテーブル
```sql
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    due_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 3. user_sessionsテーブル
```sql
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### 4. refresh_tokensテーブル
```sql
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### インデックス設計
```sql
-- パフォーマンス最適化のためのインデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created_at ON tasks(created_at);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token_hash);
```

### 制約・検証
- 外部キー制約: CASCADE削除対応
- UNIQUE制約: email, session_token, token_hash
- NOT NULL制約: 必須フィールド
- DEFAULT値: timestamps, status, priority

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
- [ ] 2. コーディング
- [ ] 3. テストコーディング
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：スキーマ作成成功
- [ ] 制約テスト：外部キー制約、UNIQUE制約の確認
- [ ] インデックステスト：パフォーマンス確認
- [ ] データ挿入テスト：基本的なCRUD操作確認

## 完了条件
- [ ] 全4テーブルのDDL作成完了
- [ ] インデックス定義完了
- [ ] 制約設定完了
- [ ] スキーマ作成テスト成功
- [ ] SQLファイルの構文チェック完了

## 関連情報
- **設計書**: `docs/step3/detailed-design/database-design.md`
- **依存タスク**: TSK-001 (環境変数定義)
- **後続タスク**: TSK-003, TSK-004, TSK-005
- **データベース**: SQLite

## 備考
- SQLiteの制約に合わせたスキーマ設計
- 本番環境での性能を考慮したインデックス設計
- セキュリティを考慮したパスワードハッシュ化前提 