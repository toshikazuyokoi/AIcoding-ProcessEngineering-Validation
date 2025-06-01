-- ===================================================
-- タスク管理システム - SQLiteデータベーススキーマ
-- ファイル: schemas/create_tables.sql
-- 作成日: 2025-01-31
-- タスクID: TSK-002-DB-Schema
-- ===================================================

-- デフォルト設定
PRAGMA foreign_keys = ON;
PRAGMA encoding = 'UTF-8';

-- ===================================================
-- 1. usersテーブル - ユーザー管理
-- ===================================================
CREATE TABLE users (
    id TEXT PRIMARY KEY,                                    -- UUID形式のユーザーID
    name TEXT NOT NULL,                                     -- ユーザー名
    email TEXT UNIQUE NOT NULL,                            -- メールアドレス（ユニーク）
    password_hash TEXT NOT NULL,                           -- パスワードハッシュ（bcrypt想定）
    role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user')), -- ロール（admin, user）
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 作成日時
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP          -- 更新日時
);

-- ===================================================
-- 2. tasksテーブル - タスク管理
-- ===================================================
CREATE TABLE tasks (
    id TEXT PRIMARY KEY,                                    -- UUID形式のタスクID
    user_id TEXT NOT NULL,                                 -- ユーザーID（外部キー）
    title TEXT NOT NULL,                                   -- タスクタイトル
    description TEXT,                                      -- タスク詳細説明
    status TEXT DEFAULT 'pending' CHECK(status IN (
        'pending', 'in_progress', 'completed', 'archived'
    )),                                                    -- ステータス
    priority TEXT DEFAULT 'medium' CHECK(priority IN (
        'low', 'medium', 'high', 'urgent'
    )),                                                    -- 優先度
    due_date DATETIME,                                     -- 期限日時
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 作成日時
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 更新日時
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- 3. user_sessionsテーブル - セッション管理
-- ===================================================
CREATE TABLE user_sessions (
    id TEXT PRIMARY KEY,                                    -- UUID形式のセッションID
    user_id TEXT NOT NULL,                                 -- ユーザーID（外部キー）
    session_token TEXT UNIQUE NOT NULL,                    -- セッショントークン（ユニーク）
    expires_at DATETIME NOT NULL,                          -- 有効期限
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 作成日時
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- 4. refresh_tokensテーブル - リフレッシュトークン管理
-- ===================================================
CREATE TABLE refresh_tokens (
    id TEXT PRIMARY KEY,                                    -- UUID形式のトークンID
    user_id TEXT NOT NULL,                                 -- ユーザーID（外部キー）
    token_hash TEXT UNIQUE NOT NULL,                       -- トークンハッシュ（ユニーク）
    expires_at DATETIME NOT NULL,                          -- 有効期限
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,         -- 作成日時
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===================================================
-- インデックス設計 - パフォーマンス最適化
-- ===================================================

-- usersテーブル用インデックス
CREATE INDEX idx_users_email ON users(email);              -- メールアドレス検索用

-- tasksテーブル用インデックス
CREATE INDEX idx_tasks_user_id ON tasks(user_id);          -- ユーザー別タスク検索用
CREATE INDEX idx_tasks_status ON tasks(status);            -- ステータス検索用
CREATE INDEX idx_tasks_priority ON tasks(priority);        -- 優先度検索用
CREATE INDEX idx_tasks_created_at ON tasks(created_at);    -- 作成日時ソート用
CREATE INDEX idx_tasks_due_date ON tasks(due_date);        -- 期限日検索用
CREATE INDEX idx_tasks_user_status ON tasks(user_id, status); -- 複合検索用

-- user_sessionsテーブル用インデックス
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token); -- トークン検索用
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);     -- ユーザー別セッション検索用
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);  -- 期限管理用

-- refresh_tokensテーブル用インデックス
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token_hash);   -- トークンハッシュ検索用
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);    -- ユーザー別トークン検索用
CREATE INDEX idx_refresh_tokens_expires ON refresh_tokens(expires_at); -- 期限管理用

-- ===================================================
-- 初期データ設定用ビュー（開発用）
-- ===================================================
CREATE VIEW user_task_summary AS
SELECT 
    u.id as user_id,
    u.name as user_name,
    u.email,
    COUNT(t.id) as total_tasks,
    SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) as completed_tasks,
    SUM(CASE WHEN t.status = 'pending' THEN 1 ELSE 0 END) as pending_tasks,
    SUM(CASE WHEN t.status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_tasks
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.id, u.name, u.email;

-- ===================================================
-- スキーマバージョン管理
-- ===================================================
CREATE TABLE schema_version (
    version TEXT PRIMARY KEY,
    applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    description TEXT
);

-- 初期バージョン記録
INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial schema creation - TSK-002-DB-Schema');

-- ===================================================
-- スキーマ作成完了
-- ===================================================
-- 作成テーブル数: 4テーブル + 1ビュー + 1管理テーブル
-- 作成インデックス数: 12インデックス
-- 外部キー制約: 3制約（CASCADE削除）
-- CHECK制約: 2制約（role, status, priority）
-- UNIQUE制約: 3制約（email, session_token, token_hash）
-- =================================================== 