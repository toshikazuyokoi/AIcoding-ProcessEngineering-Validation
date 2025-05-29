# Phase 0: 環境セットアップ タスクリスト

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | TASK-PHASE0-001 |
| 関連文書 | TASK-001, IMPL-PLAN-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 概要

Phase 0「環境セットアップ」の詳細タスクリストです。Docker環境、CI/CD、クロスプラットフォームスクリプトなど、開発環境の構築に必要な全28タスクを定義します。

## 参照文書
- `docs/project-specific/step6-todo-list/file-unit-task-list.md` - メインタスクリスト
- `docs/project-specific/step5-implementation/implementation-plan.md` - 実装計画書

## 1. Phase 0 タスク一覧（28タスク）

### 1.1 基本環境設定（3タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-001-ENV-gitignore | .gitignore | Environment | 最高 | なし | 1h | 低 |
| TSK-002-ENV-readme | README.md | Environment | 高 | TSK-001 | 2h | 低 |
| TSK-003-ENV-makefile | Makefile | Environment | 中 | TSK-002 | 2h | 低 |

### 1.2 Docker環境（7タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-004-ENV-docker-compose-dev | docker-compose.dev.yml | Environment | 最高 | TSK-003 | 2h | 中 |
| TSK-005-ENV-docker-compose-test | docker-compose.test.yml | Environment | 最高 | TSK-004 | 2h | 中 |
| TSK-006-ENV-docker-compose | docker-compose.yml | Environment | 最高 | TSK-005 | 2h | 中 |
| TSK-007-ENV-backend-dockerfile | backend/Dockerfile | Environment | 最高 | TSK-006 | 2h | 中 |
| TSK-008-ENV-backend-dockerignore | backend/.dockerignore | Environment | 高 | TSK-007 | 1h | 低 |
| TSK-009-ENV-frontend-dockerfile | frontend/Dockerfile | Environment | 最高 | TSK-008 | 2h | 中 |
| TSK-010-ENV-frontend-dockerignore | frontend/.dockerignore | Environment | 高 | TSK-009 | 1h | 低 |

### 1.3 データベース・インフラ設定（6タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-011-ENV-prisma-schema | backend/prisma/schema.prisma | Environment | 最高 | TSK-010 | 3h | 高 |
| TSK-012-INF-postgres-dockerfile | infrastructure/docker/postgres/Dockerfile | Infrastructure | 中 | TSK-011 | 2h | 中 |
| TSK-013-INF-postgres-init | infrastructure/docker/postgres/init.sql | Infrastructure | 中 | TSK-012 | 2h | 中 |
| TSK-014-INF-redis-config | infrastructure/docker/redis/redis.conf | Infrastructure | 中 | TSK-013 | 1h | 低 |
| TSK-015-INF-nginx-dockerfile | infrastructure/docker/nginx/Dockerfile | Infrastructure | 中 | TSK-014 | 2h | 中 |
| TSK-016-INF-nginx-config | infrastructure/docker/nginx/nginx.conf | Infrastructure | 中 | TSK-015 | 2h | 中 |

### 1.4 CI/CD・ワークフロー（3タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-017-ENV-ci-workflow | .github/workflows/ci.yml | Environment | 高 | TSK-016 | 3h | 中 |
| TSK-018-ENV-cd-workflow | .github/workflows/cd.yml | Environment | 中 | TSK-017 | 3h | 中 |
| TSK-019-ENV-test-workflow | .github/workflows/test.yml | Environment | 高 | TSK-018 | 2h | 中 |

### 1.5 クロスプラットフォームスクリプト（9タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-020-SCR-setup-cross | scripts/cross-platform/setup-dev.js | Script | 最高 | TSK-019 | 3h | 中 |
| TSK-021-SCR-test-cross | scripts/cross-platform/run-tests.js | Script | 高 | TSK-020 | 2h | 中 |
| TSK-022-SCR-deploy-cross | scripts/cross-platform/deploy.js | Script | 中 | TSK-021 | 3h | 中 |
| TSK-023-SCR-backup-cross | scripts/cross-platform/backup.js | Script | 低 | TSK-022 | 2h | 中 |
| TSK-024-SCR-setup-linux | scripts/linux/setup-dev.sh | Script | 高 | TSK-020 | 2h | 低 |
| TSK-025-SCR-test-linux | scripts/linux/run-tests.sh | Script | 高 | TSK-024 | 2h | 低 |
| TSK-026-SCR-deploy-linux | scripts/linux/deploy.sh | Script | 中 | TSK-025 | 2h | 低 |
| TSK-027-SCR-backup-linux | scripts/linux/backup.sh | Script | 低 | TSK-026 | 2h | 低 |
| TSK-028-SCR-setup-windows | scripts/windows/setup-dev.bat | Script | 高 | TSK-020 | 2h | 低 |

## 2. 統計情報

### 2.1 カテゴリ別集計
| カテゴリ | タスク数 | 総見積時間 | 平均複雑度 | 最高優先度タスク数 |
|----------|----------|------------|------------|-------------------|
| 基本環境設定 | 3 | 5h | 低 | 1 |
| Docker環境 | 7 | 12h | 低-中 | 4 |
| データベース・インフラ設定 | 6 | 12h | 中-高 | 1 |
| CI/CD・ワークフロー | 3 | 8h | 中 | 0 |
| クロスプラットフォームスクリプト | 9 | 20h | 低-中 | 1 |
| **合計** | **28** | **57h** | **低-中** | **7** |

### 2.2 複雑度別集計
| 複雑度 | タスク数 | 割合 |
|--------|----------|------|
| 高 | 1 | 4% |
| 中 | 15 | 54% |
| 低 | 12 | 42% |

### 2.3 優先度別集計
| 優先度 | タスク数 | 割合 |
|--------|----------|------|
| 最高 | 7 | 25% |
| 高 | 9 | 32% |
| 中 | 9 | 32% |
| 低 | 3 | 11% |

## 3. 実装順序

### 3.1 推奨実装順序
1. **基本環境設定** (TSK-001 → TSK-002 → TSK-003)
2. **Docker環境** (TSK-004 → TSK-005 → TSK-006 → TSK-007 → TSK-008 → TSK-009 → TSK-010)
3. **データベース・インフラ設定** (TSK-011 → TSK-012 → TSK-013 → TSK-014 → TSK-015 → TSK-016)
4. **CI/CD・ワークフロー** (TSK-017 → TSK-018 → TSK-019)
5. **クロスプラットフォームスクリプト** (TSK-020 → 並行実行可能)

### 3.2 並行実行可能タスク
- TSK-021, TSK-024, TSK-028 (TSK-020完了後)
- TSK-022, TSK-025, TSK-026 (各前提タスク完了後)
- TSK-023, TSK-027 (各前提タスク完了後)

## 4. 完了確認
- [x] Phase 0の全28タスクが定義されている
- [x] タスクIDが命名規則に従っている
- [x] 依存関係が正しく設定されている
- [x] 見積時間が現実的である
- [x] 優先度が適切に設定されている
- [x] 複雑度が評価されている
- [x] 実装順序が明確である
- [x] 並行実行可能性が考慮されている
