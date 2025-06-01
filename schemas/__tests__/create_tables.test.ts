import * as fs from 'fs';
import * as path from 'path';

describe('Database Schema - TSK-002-DB-Schema', () => {
  let schemaSQL: string;

  beforeAll(() => {
    // スキーマSQLファイルの読み込み
    const schemaPath = path.join(__dirname, '../create_tables.sql');
    schemaSQL = fs.readFileSync(schemaPath, 'utf-8');
  });

  describe('SQLファイル構文チェック', () => {
    test('スキーマSQLファイルが正しく読み込まれること', () => {
      expect(schemaSQL).toBeDefined();
      expect(schemaSQL.length).toBeGreaterThan(0);
    });

    test('必須テーブルのCREATE文が含まれていること', () => {
      expect(schemaSQL).toContain('CREATE TABLE users');
      expect(schemaSQL).toContain('CREATE TABLE tasks');
      expect(schemaSQL).toContain('CREATE TABLE user_sessions');
      expect(schemaSQL).toContain('CREATE TABLE refresh_tokens');
    });

    test('必須インデックスのCREATE文が含まれていること', () => {
      expect(schemaSQL).toContain('CREATE INDEX idx_users_email');
      expect(schemaSQL).toContain('CREATE INDEX idx_tasks_user_id');
      expect(schemaSQL).toContain('CREATE INDEX idx_tasks_status');
      expect(schemaSQL).toContain('CREATE INDEX idx_user_sessions_token');
      expect(schemaSQL).toContain('CREATE INDEX idx_refresh_tokens_token');
    });

    test('PRAGMA設定が含まれていること', () => {
      expect(schemaSQL).toContain('PRAGMA foreign_keys = ON');
      expect(schemaSQL).toContain('PRAGMA encoding = \'UTF-8\'');
    });

    test('外部キー制約が設定されていること', () => {
      expect(schemaSQL).toContain('FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    });

    test('CHECK制約が設定されていること', () => {
      expect(schemaSQL).toContain('CHECK(role IN (\'admin\', \'user\'))');
      expect(schemaSQL).toContain('CHECK(status IN (');
      expect(schemaSQL).toContain('CHECK(priority IN (');
    });

    test('UNIQUE制約が設定されていること', () => {
      expect(schemaSQL).toContain('email TEXT UNIQUE NOT NULL');
      expect(schemaSQL).toContain('session_token TEXT UNIQUE NOT NULL');
      expect(schemaSQL).toContain('token_hash TEXT UNIQUE NOT NULL');
    });

    test('DEFAULT値が設定されていること', () => {
      expect(schemaSQL).toContain('role TEXT DEFAULT \'user\'');
      expect(schemaSQL).toContain('status TEXT DEFAULT \'pending\'');
      expect(schemaSQL).toContain('priority TEXT DEFAULT \'medium\'');
      expect(schemaSQL).toContain('created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
      expect(schemaSQL).toContain('updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    });

    test('必要なコメントが含まれていること', () => {
      expect(schemaSQL).toContain('TSK-002-DB-Schema');
      expect(schemaSQL).toContain('タスク管理システム');
      expect(schemaSQL).toContain('パフォーマンス最適化');
      expect(schemaSQL).toContain('ユーザー管理');
      expect(schemaSQL).toContain('タスク管理');
    });

    test('ビューが作成されていること', () => {
      expect(schemaSQL).toContain('CREATE VIEW user_task_summary');
    });

    test('スキーマバージョン管理が含まれていること', () => {
      expect(schemaSQL).toContain('CREATE TABLE schema_version');
      expect(schemaSQL).toContain('INSERT INTO schema_version');
      expect(schemaSQL).toContain('1.0.0');
      expect(schemaSQL).toContain('Initial schema creation');
    });
  });

  describe('テーブル構造検証', () => {
    test('usersテーブルの必須フィールドが定義されていること', () => {
      const usersTableSection = schemaSQL.match(/CREATE TABLE users \(([\s\S]*?)\);/)?.[1];
      expect(usersTableSection).toBeDefined();
      expect(usersTableSection).toContain('id TEXT PRIMARY KEY');
      expect(usersTableSection).toContain('name TEXT NOT NULL');
      expect(usersTableSection).toContain('email TEXT UNIQUE NOT NULL');
      expect(usersTableSection).toContain('password_hash TEXT NOT NULL');
      expect(usersTableSection).toContain('role TEXT DEFAULT \'user\'');
      expect(usersTableSection).toContain('created_at DATETIME DEFAULT CURRENT_TIMESTAMP');
      expect(usersTableSection).toContain('updated_at DATETIME DEFAULT CURRENT_TIMESTAMP');
    });

    test('tasksテーブルの必須フィールドが定義されていること', () => {
      const tasksTableSection = schemaSQL.match(/CREATE TABLE tasks \(([\s\S]*?)\);/)?.[1];
      expect(tasksTableSection).toBeDefined();
      expect(tasksTableSection).toContain('id TEXT PRIMARY KEY');
      expect(tasksTableSection).toContain('user_id TEXT NOT NULL');
      expect(tasksTableSection).toContain('title TEXT NOT NULL');
      expect(tasksTableSection).toContain('description TEXT');
      expect(tasksTableSection).toContain('status TEXT DEFAULT \'pending\'');
      expect(tasksTableSection).toContain('priority TEXT DEFAULT \'medium\'');
      expect(tasksTableSection).toContain('due_date DATETIME');
      expect(tasksTableSection).toContain('FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    });

    test('user_sessionsテーブルの必須フィールドが定義されていること', () => {
      const sessionsTableSection = schemaSQL.match(/CREATE TABLE user_sessions \(([\s\S]*?)\);/)?.[1];
      expect(sessionsTableSection).toBeDefined();
      expect(sessionsTableSection).toContain('id TEXT PRIMARY KEY');
      expect(sessionsTableSection).toContain('user_id TEXT NOT NULL');
      expect(sessionsTableSection).toContain('session_token TEXT UNIQUE NOT NULL');
      expect(sessionsTableSection).toContain('expires_at DATETIME NOT NULL');
      expect(sessionsTableSection).toContain('FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    });

    test('refresh_tokensテーブルの必須フィールドが定義されていること', () => {
      const tokensTableSection = schemaSQL.match(/CREATE TABLE refresh_tokens \(([\s\S]*?)\);/)?.[1];
      expect(tokensTableSection).toBeDefined();
      expect(tokensTableSection).toContain('id TEXT PRIMARY KEY');
      expect(tokensTableSection).toContain('user_id TEXT NOT NULL');
      expect(tokensTableSection).toContain('token_hash TEXT UNIQUE NOT NULL');
      expect(tokensTableSection).toContain('expires_at DATETIME NOT NULL');
      expect(tokensTableSection).toContain('FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');
    });
  });

  describe('インデックス検証', () => {
    test('パフォーマンス最適化用インデックスが定義されていること', () => {
      const expectedIndexes = [
        'idx_users_email',
        'idx_tasks_user_id',
        'idx_tasks_status',
        'idx_tasks_priority',
        'idx_tasks_created_at',
        'idx_tasks_due_date',
        'idx_tasks_user_status',
        'idx_user_sessions_token',
        'idx_user_sessions_user_id',
        'idx_user_sessions_expires',
        'idx_refresh_tokens_token',
        'idx_refresh_tokens_user_id',
        'idx_refresh_tokens_expires'
      ];

      expectedIndexes.forEach(indexName => {
        expect(schemaSQL).toContain(`CREATE INDEX ${indexName}`);
      });
    });

    test('複合インデックスが適切に定義されていること', () => {
      expect(schemaSQL).toContain('CREATE INDEX idx_tasks_user_status ON tasks(user_id, status)');
    });
  });

  describe('データ整合性チェック', () => {
    test('全外部キー制約がCASCADE削除設定されていること', () => {
      const foreignKeyMatches = schemaSQL.match(/FOREIGN KEY.*ON DELETE CASCADE/g);
      expect(foreignKeyMatches).toHaveLength(3); // tasks, user_sessions, refresh_tokens
    });

    test('ユニーク制約が適切に設定されていること', () => {
      expect(schemaSQL).toMatch(/email\s+TEXT\s+UNIQUE\s+NOT\s+NULL/);
      expect(schemaSQL).toMatch(/session_token\s+TEXT\s+UNIQUE\s+NOT\s+NULL/);
      expect(schemaSQL).toMatch(/token_hash\s+TEXT\s+UNIQUE\s+NOT\s+NULL/);
    });

    test('NOT NULL制約が必須フィールドに設定されていること', () => {
      // users table
      expect(schemaSQL).toMatch(/name\s+TEXT\s+NOT\s+NULL/);
      expect(schemaSQL).toMatch(/email\s+TEXT\s+UNIQUE\s+NOT\s+NULL/);
      expect(schemaSQL).toMatch(/password_hash\s+TEXT\s+NOT\s+NULL/);
      
      // tasks table
      expect(schemaSQL).toMatch(/user_id\s+TEXT\s+NOT\s+NULL/);
      expect(schemaSQL).toMatch(/title\s+TEXT\s+NOT\s+NULL/);
      
      // user_sessions table
      expect(schemaSQL).toMatch(/session_token\s+TEXT\s+UNIQUE\s+NOT\s+NULL/);
      expect(schemaSQL).toMatch(/expires_at\s+DATETIME\s+NOT\s+NULL/);
      
      // refresh_tokens table
      expect(schemaSQL).toMatch(/token_hash\s+TEXT\s+UNIQUE\s+NOT\s+NULL/);
    });
  });

  describe('スキーマ完成度確認', () => {
    test('コメント・ドキュメンテーションが充実していること', () => {
      // ヘッダーコメント
      expect(schemaSQL).toContain('タスク管理システム - SQLiteデータベーススキーマ');
      expect(schemaSQL).toContain('TSK-002-DB-Schema');
      
      // セクションコメント
      expect(schemaSQL).toContain('usersテーブル - ユーザー管理');
      expect(schemaSQL).toContain('tasksテーブル - タスク管理');
      expect(schemaSQL).toContain('インデックス設計 - パフォーマンス最適化');
      
      // 完了サマリー
      expect(schemaSQL).toContain('スキーマ作成完了');
      expect(schemaSQL).toContain('作成テーブル数:');
      expect(schemaSQL).toContain('作成インデックス数:');
    });

    test('必要な機能がすべて実装されていること', () => {
      // 基本機能
      expect(schemaSQL).toContain('4テーブル');  // users, tasks, user_sessions, refresh_tokens
      expect(schemaSQL).toContain('12インデックス'); // パフォーマンス用インデックス
      expect(schemaSQL).toContain('3制約'); // CASCADE削除制約
      
      // 追加機能
      expect(schemaSQL).toContain('CREATE VIEW user_task_summary'); // 統計ビュー
      expect(schemaSQL).toContain('CREATE TABLE schema_version'); // バージョン管理
    });
  });
}); 