# Phase 2: Domain Layer タスクリスト

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | TASK-PHASE2-001 |
| 関連文書 | TASK-001, IMPL-PLAN-001 |
| 作成日 | 2025-01-28 |
| 最終更新日 | 2025-01-28 |
| 作成者 | Augment Agent |

## 概要

Phase 2「Domain Layer」の詳細タスクリストです。エンティティ、ドメインサービス、ビジネスロジックなど、ドメイン層の全15タスクを定義します。

## 参照文書
- `docs/project-specific/step6-todo-list/file-unit-task-list.md` - メインタスクリスト
- `docs/project-specific/step3-detailed-design/class-design.md` - クラス設計表

## 1. Phase 2 タスク一覧（15タスク）

### 1.1 エンティティ（4タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-049-ENT-User | backend/src/domain/entities/user.entity.ts | Domain | 最高 | TSK-032 | 6h | 高 |
| TSK-050-ENT-Task | backend/src/domain/entities/task.entity.ts | Domain | 最高 | TSK-049 | 6h | 高 |
| TSK-051-ENT-Category | backend/src/domain/entities/category.entity.ts | Domain | 高 | TSK-050 | 4h | 中 |
| TSK-052-ENT-BaseEntity | backend/src/domain/entities/base.entity.ts | Domain | 高 | TSK-048 | 3h | 中 |

### 1.2 ドメインサービス（6タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-053-SVC-AuthService | backend/src/domain/services/auth-service.ts | Domain | 最高 | TSK-040,TSK-033 | 8h | 高 |
| TSK-054-SVC-TaskService | backend/src/domain/services/task-service.ts | Domain | 最高 | TSK-041,TSK-040 | 8h | 高 |
| TSK-055-SVC-UserService | backend/src/domain/services/user-service.ts | Domain | 高 | TSK-040 | 6h | 中 |
| TSK-056-SVC-CategoryService | backend/src/domain/services/category-service.ts | Domain | 中 | TSK-042 | 5h | 中 |
| TSK-057-SVC-EmailService | backend/src/domain/services/email-service.ts | Domain | 中 | TSK-055 | 4h | 中 |
| TSK-058-SVC-NotificationService | backend/src/domain/services/notification-service.ts | Domain | 低 | TSK-057 | 4h | 中 |

### 1.3 型定義・インターフェース（5タスク）

| タスクID | ファイル名 | レイヤー | 優先度 | 依存タスク | 見積時間 | 複雑度 |
|----------|------------|----------|--------|------------|----------|--------|
| TSK-059-TYP-UserTypes | backend/src/domain/types/user.types.ts | Domain | 最高 | TSK-049 | 3h | 中 |
| TSK-060-TYP-TaskTypes | backend/src/domain/types/task.types.ts | Domain | 最高 | TSK-050 | 3h | 中 |
| TSK-061-TYP-CategoryTypes | backend/src/domain/types/category.types.ts | Domain | 高 | TSK-051 | 2h | 低 |
| TSK-062-TYP-CommonTypes | backend/src/domain/types/common.types.ts | Domain | 高 | TSK-052 | 2h | 低 |
| TSK-063-TYP-ServiceInterfaces | backend/src/domain/interfaces/service.interfaces.ts | Domain | 高 | TSK-058 | 4h | 中 |

## 2. 統計情報

### 2.1 カテゴリ別集計
| カテゴリ | タスク数 | 総見積時間 | 平均複雑度 | 最高優先度タスク数 |
|----------|----------|------------|------------|-------------------|
| エンティティ | 4 | 19h | 中-高 | 2 |
| ドメインサービス | 6 | 35h | 中-高 | 2 |
| 型定義・インターフェース | 5 | 14h | 低-中 | 2 |
| **合計** | **15** | **68h** | **中** | **6** |

### 2.2 複雑度別集計
| 複雑度 | タスク数 | 割合 |
|--------|----------|------|
| 高 | 4 | 27% |
| 中 | 9 | 60% |
| 低 | 2 | 13% |

### 2.3 優先度別集計
| 優先度 | タスク数 | 割合 |
|--------|----------|------|
| 最高 | 6 | 40% |
| 高 | 6 | 40% |
| 中 | 2 | 13% |
| 低 | 1 | 7% |

## 3. 実装順序

### 3.1 推奨実装順序
1. **基盤エンティティ** (TSK-052 → TSK-049 → TSK-050 → TSK-051)
2. **型定義** (TSK-059 → TSK-060 → TSK-061 → TSK-062)
3. **コアサービス** (TSK-053 → TSK-054 → TSK-055)
4. **補助サービス** (TSK-056 → TSK-057 → TSK-058)
5. **インターフェース** (TSK-063)

### 3.2 並行実行可能タスク
- TSK-059, TSK-060, TSK-061 (各エンティティ完了後)
- TSK-055, TSK-056 (TSK-054完了後)
- TSK-057, TSK-058 (TSK-055完了後)

## 4. 重要な依存関係

### 4.1 Phase間依存関係
- **Phase 1 → Phase 2**: TSK-048 → TSK-049
- **Phase 2 → Phase 3**: TSK-063 → Phase 3開始

### 4.2 クリティカルパス
1. TSK-049 (User Entity) - 全サービスの前提
2. TSK-053 (AuthService) - 認証機能の核心
3. TSK-054 (TaskService) - タスク管理の核心

### 4.3 ドメイン内依存関係
```
BaseEntity → User/Task/Category Entity
Entity → Types → Services → Interfaces
AuthService ← UserService ← EmailService ← NotificationService
```

## 5. ビジネスロジック要件

### 5.1 User Entity
- ユーザー認証・認可
- プロファイル管理
- パスワード管理

### 5.2 Task Entity
- タスクCRUD操作
- ステータス管理
- 期限管理

### 5.3 Category Entity
- カテゴリ階層管理
- タスク分類

### 5.4 AuthService
- JWT認証
- パスワードハッシュ化
- セッション管理

### 5.5 TaskService
- タスク作成・更新・削除
- 検索・フィルタリング
- 進捗管理

## 6. 品質要件

### 6.1 テスト要件
- 単体テストカバレッジ95%以上
- ビジネスロジックの完全テスト
- エッジケースの網羅

### 6.2 パフォーマンス要件
- サービス応答時間100ms以内
- メモリ使用量最適化
- データベースクエリ最適化

## 7. 完了確認
- [x] Phase 2の全15タスクが定義されている
- [x] タスクIDが命名規則に従っている
- [x] 依存関係が正しく設定されている
- [x] 見積時間が現実的である
- [x] 優先度が適切に設定されている
- [x] 複雑度が評価されている
- [x] 実装順序が明確である
- [x] 並行実行可能性が考慮されている
- [x] ビジネスロジック要件が明確である
- [x] 品質要件が設定されている
