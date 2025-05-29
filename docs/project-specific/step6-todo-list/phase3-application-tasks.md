# Phase 3: Application Layer タスクリスト

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | TASK-PHASE3-001 |
| 関連文書 | TASK-001, IMPL-PLAN-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 概要

Phase 3「Application Layer」の詳細タスクリストです。コントローラー、ミドルウェア、バリデーション、APIエンドポイントなど、アプリケーション層の全12タスクを定義します。

## 参照文書
- `docs/project-specific/step6-todo-list/file-unit-task-list.md` - メインタスクリスト
- `docs/project-specific/step3-detailed-design/class-design.md` - クラス設計表

## 1. Phase 3 タスク一覧（12タスク）

### 1.1 バリデーション・ユーティリティ（3タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-064-UTL-ZodValidator | backend/src/utils/zod-validator.ts | Application | 高 | TSK-063 | 4h | 中 |
| TSK-065-UTL-ResponseBuilder | backend/src/utils/response-builder.ts | Application | 高 | TSK-064 | 3h | 低 |
| TSK-066-UTL-RequestValidator | backend/src/utils/request-validator.ts | Application | 中 | TSK-064 | 3h | 中 |

### 1.2 ミドルウェア（3タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-067-MID-AuthMiddleware | backend/src/middleware/auth-middleware.ts | Application | 最高 | TSK-053 | 6h | 高 |
| TSK-068-MID-ErrorMiddleware | backend/src/middleware/error-middleware.ts | Application | 高 | TSK-031 | 4h | 中 |
| TSK-069-MID-LoggingMiddleware | backend/src/middleware/logging-middleware.ts | Application | 中 | TSK-030 | 3h | 低 |

### 1.3 コントローラー（6タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-070-CTL-AuthController | backend/src/controllers/auth-controller.ts | Application | 最高 | TSK-053,TSK-064 | 8h | 高 |
| TSK-071-CTL-TaskController | backend/src/controllers/task-controller.ts | Application | 最高 | TSK-054,TSK-064 | 8h | 高 |
| TSK-072-CTL-UserController | backend/src/controllers/user-controller.ts | Application | 中 | TSK-055,TSK-064 | 6h | 中 |
| TSK-073-CTL-CategoryController | backend/src/controllers/category-controller.ts | Application | 中 | TSK-056,TSK-064 | 5h | 中 |
| TSK-074-CTL-BaseController | backend/src/controllers/base-controller.ts | Application | 高 | TSK-065 | 4h | 中 |
| TSK-075-APP-ExpressApp | backend/src/app.ts | Application | 最高 | TSK-069,TSK-073 | 6h | 高 |

## 2. 統計情報

### 2.1 カテゴリ別集計
| カテゴリ | タスク数 | 総見積時間 | 平均複雑度 | 最高優先度タスク数 |
|----------|----------|------------|------------|-------------------|
| バリデーション・ユーティリティ | 3 | 10h | 低-中 | 0 |
| ミドルウェア | 3 | 13h | 低-高 | 1 |
| コントローラー | 6 | 37h | 中-高 | 3 |
| **合計** | **12** | **60h** | **中** | **4** |

### 2.2 複雑度別集計
| 複雑度 | タスク数 | 割合 |
|--------|----------|------|
| 高 | 4 | 33% |
| 中 | 6 | 50% |
| 低 | 2 | 17% |

### 2.3 優先度別集計
| 優先度 | タスク数 | 割合 |
|--------|----------|------|
| 最高 | 4 | 33% |
| 高 | 4 | 33% |
| 中 | 4 | 34% |

## 3. 実装順序

### 3.1 推奨実装順序
1. **バリデーション基盤** (TSK-064 → TSK-065 → TSK-066)
2. **ミドルウェア** (TSK-067 → TSK-068 → TSK-069)
3. **基盤コントローラー** (TSK-074)
4. **個別コントローラー** (TSK-070 → TSK-071 → TSK-072 → TSK-073)
5. **アプリケーション統合** (TSK-075)

### 3.2 並行実行可能タスク
- TSK-065, TSK-066 (TSK-064完了後)
- TSK-068, TSK-069 (TSK-067完了後)
- TSK-070, TSK-071, TSK-072, TSK-073 (TSK-074完了後)

## 4. 重要な依存関係

### 4.1 Phase間依存関係
- **Phase 2 → Phase 3**: TSK-063 → TSK-064
- **Phase 3 → Phase 4**: TSK-075 → Phase 4開始

### 4.2 クリティカルパス
1. TSK-064 (ZodValidator) - 全コントローラーの前提
2. TSK-067 (AuthMiddleware) - 認証が必要な全エンドポイントの前提
3. TSK-074 (BaseController) - 個別コントローラーの前提
4. TSK-075 (ExpressApp) - アプリケーション統合

### 4.3 アプリケーション内依存関係
```
ZodValidator → ResponseBuilder/RequestValidator
AuthMiddleware → 全コントローラー
BaseController → 個別コントローラー
全コントローラー → ExpressApp
```

## 5. API設計要件

### 5.1 AuthController
- POST /auth/login - ログイン
- POST /auth/register - ユーザー登録
- POST /auth/logout - ログアウト
- POST /auth/refresh - トークン更新

### 5.2 TaskController
- GET /tasks - タスク一覧取得
- POST /tasks - タスク作成
- GET /tasks/:id - タスク詳細取得
- PUT /tasks/:id - タスク更新
- DELETE /tasks/:id - タスク削除

### 5.3 UserController
- GET /users/profile - プロファイル取得
- PUT /users/profile - プロファイル更新
- DELETE /users/account - アカウント削除

### 5.4 CategoryController
- GET /categories - カテゴリ一覧取得
- POST /categories - カテゴリ作成
- PUT /categories/:id - カテゴリ更新
- DELETE /categories/:id - カテゴリ削除

## 6. セキュリティ要件

### 6.1 認証・認可
- JWT認証の実装
- ロールベースアクセス制御
- セッション管理

### 6.2 入力検証
- Zodスキーマによる厳密な検証
- SQLインジェクション対策
- XSS対策

### 6.3 エラーハンドリング
- 統一されたエラーレスポンス
- セキュリティ情報の漏洩防止
- 適切なHTTPステータスコード

## 7. パフォーマンス要件

### 7.1 応答時間
- API応答時間200ms以内
- データベースクエリ最適化
- キャッシュ戦略の実装

### 7.2 スケーラビリティ
- ステートレス設計
- 水平スケーリング対応
- 負荷分散対応

## 8. 完了確認
- [x] Phase 3の全12タスクが定義されている
- [x] タスクIDが命名規則に従っている
- [x] 依存関係が正しく設定されている
- [x] 見積時間が現実的である
- [x] 優先度が適切に設定されている
- [x] 複雑度が評価されている
- [x] 実装順序が明確である
- [x] 並行実行可能性が考慮されている
- [x] API設計要件が明確である
- [x] セキュリティ要件が設定されている
- [x] パフォーマンス要件が設定されている
