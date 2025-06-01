# Issue仕様書セット管理

## ディレクトリ構造

```
docs/step6/specifications/
├── README.md                    # 本ファイル
├── phase1-foundation/           # フェーズ1: 基盤構築
│   ├── TSK-001-CFG-Environment.md
│   ├── TSK-002-DB-Schema.md
│   └── TSK-003-CFG-Database.md
├── phase2-types/               # フェーズ2: 型定義
│   ├── TSK-007-TYP-Core.md
│   └── TSK-012-TYP-Task.md
├── phase3-domain/              # フェーズ3: ドメイン層
│   ├── TSK-015-ENT-User.md
│   └── TSK-016-ENT-Task.md
├── phase4-infrastructure/      # フェーズ4: インフラ層
│   ├── TSK-017-REP-UserRepository.md
│   └── TSK-018-REP-TaskRepository.md
├── phase5-middleware/          # フェーズ5: ミドルウェア
│   └── TSK-020-MW-Auth.md
├── phase6-application/         # フェーズ6: アプリケーション層
│   ├── TSK-022-SVC-UserService.md
│   └── TSK-023-SVC-TaskService.md
└── phase7-presentation/        # フェーズ7: プレゼンテーション層
    └── TSK-024-CTL-AppController.md
```

## 仕様書作成方針

### 詳細仕様書作成対象（高複雑度タスク）
- **TSK-015**: Userエンティティ（25メソッド）
- **TSK-016**: Taskエンティティ（26メソッド）  
- **TSK-022**: UserService（認証・9メソッド）
- **TSK-023**: TaskService（業務処理・13メソッド）
- **TSK-024**: AppController（REST API・12メソッド）

### 標準仕様書作成対象（中複雑度タスク）
- **TSK-017**: UserRepository（11メソッド）
- **TSK-018**: TaskRepository（15メソッド）
- **TSK-020**: 認証ミドルウェア

### 簡略仕様書作成対象（低複雑度タスク）
- その他の設定・型定義タスク

## 管理ルール

1. **1タスク = 1仕様書**: 各タスクに対応する詳細仕様書
2. **GitHub Issue連携**: 仕様書をベースにしたIssue作成
3. **トレーサビリティ**: 設計書→仕様書→Issue→PRの完全追跡
4. **更新管理**: 実装中の仕様変更を仕様書に反映 