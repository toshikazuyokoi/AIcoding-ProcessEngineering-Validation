# エンティティ定義書

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | ENT-001 |
| 関連文書 | REQ-001, ARCH-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 1. エンティティ一覧

| エンティティID | エンティティ名 | 説明 | 主要属性数 |
|----------------|----------------|------|------------|
| E-001 | User | ユーザー情報 | 8 |
| E-002 | Task | タスク情報 | 10 |
| E-003 | Category | カテゴリ情報 | 5 |
| E-004 | TaskCategory | タスク・カテゴリ関連 | 3 |

## 2. エンティティ詳細定義

### 2.1 E-001: User（ユーザー）
**概要**: システム利用ユーザーの基本情報を管理

| 属性名 | 型 | 長さ | NULL | デフォルト | 説明 |
|--------|----|----- |------|-----------|------|
| id | UUID | - | NOT NULL | uuid_generate_v4() | ユーザーID（主キー） |
| username | VARCHAR | 50 | NOT NULL | - | ユーザー名（表示名） |
| email | VARCHAR | 255 | NOT NULL | - | メールアドレス（ログインID） |
| password_hash | VARCHAR | 255 | NOT NULL | - | パスワードハッシュ値 |
| role | ENUM | - | NOT NULL | 'user' | ユーザー権限（user/admin） |
| is_active | BOOLEAN | - | NOT NULL | true | アカウント有効フラグ |
| created_at | TIMESTAMP | - | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | - | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約条件**:
- PRIMARY KEY: id
- UNIQUE: email
- CHECK: email LIKE '%@%'
- CHECK: username LENGTH >= 3
- CHECK: role IN ('user', 'admin')

**インデックス**:
- idx_user_email: email
- idx_user_username: username

### 2.2 E-002: Task（タスク）
**概要**: ユーザーが管理するタスクの詳細情報

| 属性名 | 型 | 長さ | NULL | デフォルト | 説明 |
|--------|----|----- |------|-----------|------|
| id | UUID | - | NOT NULL | uuid_generate_v4() | タスクID（主キー） |
| user_id | UUID | - | NOT NULL | - | 作成者ユーザーID（外部キー） |
| title | VARCHAR | 100 | NOT NULL | - | タスクタイトル |
| description | TEXT | 1000 | NULL | - | タスク詳細説明 |
| priority | ENUM | - | NOT NULL | 'medium' | 優先度（high/medium/low） |
| status | ENUM | - | NOT NULL | 'pending' | ステータス（pending/in_progress/completed） |
| due_date | TIMESTAMP | - | NULL | - | 期限日時 |
| completed_at | TIMESTAMP | - | NULL | - | 完了日時 |
| created_at | TIMESTAMP | - | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | - | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**制約条件**:
- PRIMARY KEY: id
- FOREIGN KEY: user_id REFERENCES users(id) ON DELETE CASCADE
- CHECK: title LENGTH >= 1
- CHECK: priority IN ('high', 'medium', 'low')
- CHECK: status IN ('pending', 'in_progress', 'completed')
- CHECK: due_date > created_at (if not null)

**インデックス**:
- idx_task_user_id: user_id
- idx_task_priority: priority
- idx_task_status: status
- idx_task_due_date: due_date
- idx_task_created_at: created_at

### 2.3 E-003: Category（カテゴリ）
**概要**: タスクの分類に使用するカテゴリ情報

| 属性名 | 型 | 長さ | NULL | デフォルト | 説明 |
|--------|----|----- |------|-----------|------|
| id | UUID | - | NOT NULL | uuid_generate_v4() | カテゴリID（主キー） |
| name | VARCHAR | 50 | NOT NULL | - | カテゴリ名 |
| color | VARCHAR | 7 | NOT NULL | '#6B7280' | 表示色（HEXコード） |
| description | TEXT | 200 | NULL | - | カテゴリ説明 |
| created_at | TIMESTAMP | - | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |

**制約条件**:
- PRIMARY KEY: id
- UNIQUE: name
- CHECK: name LENGTH >= 1
- CHECK: color ~ '^#[0-9A-Fa-f]{6}$'

**インデックス**:
- idx_category_name: name

### 2.4 E-004: TaskCategory（タスク・カテゴリ関連）
**概要**: タスクとカテゴリの多対多関係を管理

| 属性名 | 型 | 長さ | NULL | デフォルト | 説明 |
|--------|----|----- |------|-----------|------|
| task_id | UUID | - | NOT NULL | - | タスクID（外部キー） |
| category_id | UUID | - | NOT NULL | - | カテゴリID（外部キー） |
| created_at | TIMESTAMP | - | NOT NULL | CURRENT_TIMESTAMP | 関連付け日時 |

**制約条件**:
- PRIMARY KEY: (task_id, category_id)
- FOREIGN KEY: task_id REFERENCES tasks(id) ON DELETE CASCADE
- FOREIGN KEY: category_id REFERENCES categories(id) ON DELETE CASCADE

**インデックス**:
- idx_task_category_task: task_id
- idx_task_category_category: category_id

## 3. エンティティ関係図（ER図）

````mermaid
erDiagram
    User {
        uuid id PK
        varchar username
        varchar email UK
        varchar password_hash
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    Task {
        uuid id PK
        uuid user_id FK
        varchar title
        text description
        enum priority
        enum status
        timestamp due_date
        timestamp completed_at
        timestamp created_at
        timestamp updated_at
    }
    
    Category {
        uuid id PK
        varchar name UK
        varchar color
        text description
        timestamp created_at
    }
    
    TaskCategory {
        uuid task_id FK
        uuid category_id FK
        timestamp created_at
    }
    
    User ||--o{ Task : creates
    Task }o--o{ Category : belongs_to
    Task ||--o{ TaskCategory : has
    Category ||--o{ TaskCategory : contains
````

## 4. データ型定義

### 4.1 ENUM型定義
```sql
-- ユーザー権限
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- タスク優先度
CREATE TYPE task_priority AS ENUM ('high', 'medium', 'low');

-- タスクステータス
CREATE TYPE task_status AS ENUM ('pending', 'in_progress', 'completed');
```

### 4.2 UUID拡張
```sql
-- UUID生成関数の有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## 5. データ整合性ルール

### 5.1 ビジネスルール
| ルール | 説明 | 実装方法 |
|--------|------|----------|
| ユーザー削除時のタスク処理 | ユーザー削除時は関連タスクも削除 | CASCADE制約 |
| タスク完了時の日時設定 | ステータスが'completed'の場合、completed_atを設定 | アプリケーションロジック |
| 期限の妥当性 | 期限は作成日時より未来である必要 | CHECK制約 |
| カテゴリの一意性 | カテゴリ名は重複不可 | UNIQUE制約 |

### 5.2 参照整合性
| 関係 | 親テーブル | 子テーブル | 削除時動作 |
|------|------------|------------|------------|
| User → Task | users | tasks | CASCADE |
| Task → TaskCategory | tasks | task_categories | CASCADE |
| Category → TaskCategory | categories | task_categories | CASCADE |

## 6. パフォーマンス考慮

### 6.1 インデックス戦略
| テーブル | インデックス | 用途 |
|----------|-------------|------|
| users | email | ログイン処理高速化 |
| tasks | user_id | ユーザー別タスク取得 |
| tasks | (user_id, status) | ステータス別タスク取得 |
| tasks | due_date | 期限ソート |

### 6.2 パーティショニング検討
- 大量データ対応時のタスクテーブル月別パーティション
- ログテーブルの日別パーティション

## 7. セキュリティ考慮

### 7.1 データ保護
| 項目 | 対策 | 実装 |
|------|------|------|
| パスワード | ハッシュ化 | bcrypt |
| 個人情報 | アクセス制御 | Row Level Security |
| 監査ログ | 変更履歴 | トリガー実装 |

### 7.2 アクセス制御
- ユーザーは自分のタスクのみアクセス可能
- 管理者は全ユーザーのデータにアクセス可能
- カテゴリは全ユーザー共通

## 8. 完了確認
- [x] 全エンティティが定義されている
- [x] 属性の型・制約が明確である
- [x] 主キー・外部キーが適切に設定されている
- [x] ER図が正しく作成されている
- [x] インデックス戦略が定義されている
- [x] データ整合性ルールが明記されている
- [x] セキュリティ考慮が含まれている
- [x] パフォーマンス考慮が含まれている
