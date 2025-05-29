# Task Management System

[![CI/CD Pipeline](https://github.com/toshikazuyokoi/AIcoding-ProcessEngineering-Validation/actions/workflows/ci.yml/badge.svg)](https://github.com/toshikazuyokoi/AIcoding-ProcessEngineering-Validation/actions)
[![Test Coverage](https://img.shields.io/badge/coverage-90%25-brightgreen)](./coverage)
[![Code Quality](https://img.shields.io/badge/code%20quality-A-brightgreen)](./docs/quality-reports)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

## 📋 プロジェクト概要

**Task Management System** は、プロセスエンジニアリング手法を用いて開発された高品質なタスク管理アプリケーションです。本プロジェクトは、AI開発手法の実証実験として、7段階プロセス（STEP 0-7）による段階的詳細化アプローチを完全実装しています。

### 🎯 主要機能

- **ユーザー認証**: JWT認証による安全なログイン・登録システム
- **タスク管理**: CRUD操作による包括的なタスク管理
- **検索・フィルタ**: 高度な検索とフィルタリング機能
- **リアルタイム更新**: WebSocketによるリアルタイム同期
- **レスポンシブUI**: モバイル・デスクトップ対応のモダンUI

### 🏗️ アーキテクチャ

4層アーキテクチャによる堅牢な設計：

```
┌─────────────────────────────────────┐
│     Presentation Layer (React)     │  ← UI/UX、ユーザー操作
├─────────────────────────────────────┤
│    Application Layer (Express)     │  ← API、制御ロジック
├─────────────────────────────────────┤
│      Domain Layer (TypeScript)     │  ← ビジネスロジック
├─────────────────────────────────────┤
│  Infrastructure Layer (DB/Cache)   │  ← データ永続化
└─────────────────────────────────────┘
```

### 🛠️ 技術スタック

| カテゴリ | 技術 | バージョン | 用途 |
|----------|------|------------|------|
| **Frontend** | React | 18.2.0 | UIフレームワーク |
| | TypeScript | 5.3.3 | 型安全性 |
| | MUI | 5.15.1 | UIコンポーネント |
| | Zustand | 4.4.7 | 状態管理 |
| **Backend** | Node.js | 20.11.0 LTS | ランタイム |
| | Express | 4.18.2 | Webフレームワーク |
| | TypeScript | 5.3.3 | 型安全性 |
| | Zod | 3.22.4 | バリデーション |
| **Database** | PostgreSQL | 16.1 | メインDB |
| | Prisma | 5.8.1 | ORM |
| | Redis | 7.2.4 | キャッシュ |
| **Testing** | Jest | 29.7.0 | テストフレームワーク |
| | Playwright | 1.41.1 | E2Eテスト |
| **DevOps** | Docker | latest | コンテナ化 |
| | GitHub Actions | - | CI/CD |

## 🚀 クイックスタート

### 前提条件

- Node.js 20.11.0 LTS以上
- Docker & Docker Compose
- Git

### インストール

1. **リポジトリのクローン**
```bash
git clone https://github.com/toshikazuyokoi/AIcoding-ProcessEngineering-Validation.git
cd AIcoding-ProcessEngineering-Validation
```

2. **依存関係のインストール**
```bash
# バックエンド
cd backend
npm install

# フロントエンド
cd ../frontend
npm install
```

3. **環境変数の設定**
```bash
# バックエンド環境変数
cp backend/.env.example backend/.env

# フロントエンド環境変数
cp frontend/.env.example frontend/.env
```

4. **データベースのセットアップ**
```bash
# Dockerでデータベース起動
docker-compose up -d postgres redis

# Prismaマイグレーション実行
cd backend
npx prisma migrate dev
npx prisma db seed
```

5. **アプリケーションの起動**
```bash
# 開発サーバー起動（並列実行）
npm run dev

# または個別起動
# バックエンド
cd backend && npm run dev

# フロントエンド（別ターミナル）
cd frontend && npm run dev
```

### アクセス

- **フロントエンド**: http://localhost:3000
- **バックエンドAPI**: http://localhost:8000
- **API文書**: http://localhost:8000/api-docs

## 📖 使用方法

### 基本操作

1. **ユーザー登録**
   - `/register` でアカウント作成
   - メール認証（開発環境では自動承認）

2. **ログイン**
   - `/login` でログイン
   - JWT トークンによる認証

3. **タスク管理**
   - ダッシュボードでタスク一覧表示
   - 新規タスク作成、編集、削除
   - ステータス変更（TODO → 進行中 → 完了）

4. **検索・フィルタ**
   - キーワード検索
   - ステータス、優先度、期限でフィルタ

### API使用例

```javascript
// タスク一覧取得
const response = await fetch('/api/tasks', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// タスク作成
const newTask = await fetch('/api/tasks', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'New Task',
    description: 'Task description',
    priority: 'high',
    dueDate: '2025-12-31'
  })
});
```

## 🧪 テスト

### テスト実行

```bash
# 全テスト実行
npm test

# カバレッジ付きテスト
npm run test:coverage

# E2Eテスト
npm run test:e2e

# 特定のテストファイル
npm test -- TaskService.test.ts
```

### テスト構成

- **単体テスト**: Jest + Testing Library
- **統合テスト**: Supertest
- **E2Eテスト**: Playwright
- **カバレッジ目標**: 90%以上

## 🔧 開発

### 開発環境セットアップ

```bash
# 開発用Dockerコンテナ起動
docker-compose -f docker-compose.dev.yml up -d

# ホットリロード付き開発サーバー
npm run dev:watch

# 型チェック
npm run type-check

# リンター実行
npm run lint

# フォーマッター実行
npm run format
```

### コーディング規約

- **TypeScript**: 厳格な型チェック
- **ESLint**: Airbnb設定ベース
- **Prettier**: 自動フォーマット
- **Husky**: プリコミットフック

### ブランチ戦略

```
main
├── develop
│   ├── feature/TSK-XXX-feature-name
│   ├── bugfix/TSK-XXX-bug-name
│   └── hotfix/TSK-XXX-hotfix-name
```

## 📁 プロジェクト構造

```
task-management-system/
├── backend/                    # バックエンドアプリケーション
│   ├── src/
│   │   ├── controllers/        # APIコントローラー
│   │   ├── services/           # ビジネスロジック
│   │   ├── repositories/       # データアクセス層
│   │   ├── entities/           # ドメインエンティティ
│   │   ├── middleware/         # Express ミドルウェア
│   │   ├── utils/              # ユーティリティ
│   │   └── types/              # 型定義
│   ├── tests/                  # テストファイル
│   ├── prisma/                 # データベーススキーマ
│   └── package.json
├── frontend/                   # フロントエンドアプリケーション
│   ├── src/
│   │   ├── components/         # Reactコンポーネント
│   │   ├── hooks/              # カスタムフック
│   │   ├── contexts/           # React Context
│   │   ├── utils/              # ユーティリティ
│   │   └── types/              # 型定義
│   ├── public/                 # 静的ファイル
│   └── package.json
├── infrastructure/             # インフラ設定
│   ├── docker/                 # Dockerファイル
│   ├── k8s/                    # Kubernetes設定
│   └── terraform/              # Terraform設定
├── scripts/                    # 開発・デプロイスクリプト
├── docs/                       # プロジェクト文書
└── docker-compose.yml          # Docker Compose設定
```

## 🚀 デプロイ

### 本番環境デプロイ

```bash
# 本番用ビルド
npm run build

# Dockerイメージ作成
docker build -t task-management-system .

# 本番環境起動
docker-compose -f docker-compose.prod.yml up -d
```

### 環境別設定

| 環境 | URL | データベース | 特徴 |
|------|-----|-------------|------|
| **開発** | http://localhost:3000 | PostgreSQL (Docker) | ホットリロード、デバッグ有効 |
| **テスト** | http://test.example.com | PostgreSQL (Test DB) | 自動テスト実行 |
| **本番** | https://app.example.com | PostgreSQL (RDS) | 最適化、監視有効 |

## 📊 監視・ログ

### ログ管理

- **アプリケーションログ**: Winston
- **アクセスログ**: Morgan
- **エラートラッキング**: Sentry
- **パフォーマンス監視**: New Relic

### ヘルスチェック

```bash
# アプリケーション状態確認
curl http://localhost:8000/health

# データベース接続確認
curl http://localhost:8000/health/db

# Redis接続確認
curl http://localhost:8000/health/redis
```

## 🔒 セキュリティ

### セキュリティ対策

- **認証**: JWT + リフレッシュトークン
- **認可**: ロールベースアクセス制御
- **暗号化**: bcrypt (パスワード), AES (機密データ)
- **HTTPS**: SSL/TLS証明書
- **CORS**: 適切なオリジン設定
- **レート制限**: Express Rate Limit

### セキュリティテスト

```bash
# 脆弱性スキャン
npm audit

# セキュリティテスト実行
npm run security:test

# 依存関係チェック
npm run security:deps
```

## 🤝 コントリビューション

### 開発参加方法

1. **フォーク**: リポジトリをフォーク
2. **ブランチ作成**: `git checkout -b feature/TSK-XXX-feature-name`
3. **実装**: 7つの標準サブタスクに従って実装
4. **テスト**: `npm test` でテスト実行
5. **プルリクエスト**: メインブランチにPR作成

### コーディング規約

- **コミットメッセージ**: `feat(#issue): 概要`
- **ブランチ命名**: `feature/TSK-XXX-feature-name`
- **コードレビュー**: 必須（2名以上の承認）
- **テストカバレッジ**: 90%以上必須

## 📚 ドキュメント

### 技術文書

- **API仕様書**: [docs/api/](./docs/api/)
- **アーキテクチャ設計**: [docs/architecture/](./docs/architecture/)
- **データベース設計**: [docs/database/](./docs/database/)
- **デプロイ手順**: [docs/deployment/](./docs/deployment/)

### プロセス文書

- **開発プロセス**: [docs/process/](./docs/process/)
- **品質管理**: [docs/quality/](./docs/quality/)
- **テスト戦略**: [docs/testing/](./docs/testing/)

## 🐛 トラブルシューティング

### よくある問題

#### データベース接続エラー
```bash
# PostgreSQL起動確認
docker ps | grep postgres

# 接続テスト
psql -h localhost -p 5432 -U postgres -d taskdb
```

#### ポート競合エラー
```bash
# ポート使用状況確認
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# プロセス終了
kill -9 <PID>
```

#### Node.js バージョンエラー
```bash
# Node.js バージョン確認
node --version

# nvmでバージョン切り替え
nvm use 20.11.0
```

## 📄 ライセンス

このプロジェクトは [MIT License](./LICENSE) の下で公開されています。

## 🙏 謝辞

本プロジェクトは、プロセスエンジニアリング手法の実証実験として開発されました。AI開発手法の標準化と学術コミュニティへの貢献を目指しています。

---

**開発チーム**: Process Engineering Research Group
**連絡先**: [project-contact@example.com](mailto:project-contact@example.com)
**プロジェクトURL**: https://github.com/toshikazuyokoi/AIcoding-ProcessEngineering-Validation
