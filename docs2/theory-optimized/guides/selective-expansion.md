# 選択的展開ガイド (700 tokens)

## 展開レベル判定基準

### レベル1: 基本展開
**対象**: 構造把握・概要理解が目的
**展開内容**:
- ファイル名・ディレクトリ構造
- 主要クラス・インターフェース名
- パブリックメソッドのシグネチャ
- 重要な定数・設定値

**適用条件**:
- プロジェクト初期調査
- 全体構造の把握
- 影響範囲の特定

### レベル2: 標準展開
**対象**: 実装方針・設計理解が目的
**展開内容**:
- クラス・メソッドの実装概要
- 主要なビジネスロジック
- データフロー・制御フロー
- 重要なコメント・ドキュメント

**適用条件**:
- 機能追加・修正の検討
- 設計レビュー
- テスト設計

### レベル3: 詳細展開
**対象**: 完全な実装理解・修正が目的
**展開内容**:
- 完全なソースコード
- 詳細なコメント
- エラーハンドリング
- パフォーマンス最適化部分

**適用条件**:
- バグ修正・デバッグ
- パフォーマンス改善
- セキュリティ監査

## ファイルタイプ別展開方針

### Core Files (重要度: High)
**対象ファイル**:
- メインエントリーポイント (main.js, app.js)
- 基盤クラス (BaseController, BaseService)
- 設定ファイル (config.js, database.js)
- 共通ユーティリティ

**デフォルト展開レベル**: レベル2 (標準展開)
**理由**: システム全体に影響するため詳細理解が必要

### Important Files (重要度: Medium)
**対象ファイル**:
- ビジネスロジック実装
- API エンドポイント
- データモデル・エンティティ
- 認証・認可機能

**デフォルト展開レベル**: レベル1-2 (条件により判定)
**判定条件**:
- 修正対象の場合: レベル2
- 参照のみの場合: レベル1

### Supporting Files (重要度: Low)
**対象ファイル**:
- テストファイル
- ドキュメント
- 設定ファイル (非重要)
- ビルドスクリプト

**デフォルト展開レベル**: レベル1 (基本展開)
**理由**: 概要把握で十分な場合が多い

## 判定フローチャート

```
ファイル選択
    ↓
重要度判定 → Core? → レベル2展開
    ↓           ↓
Important? → 修正対象? → Yes → レベル2展開
    ↓           ↓
    ↓          No → レベル1展開
    ↓
Supporting? → レベル1展開
```

### 詳細判定ロジック

#### 1. ファイル重要度の自動判定
```javascript
function determineFileImportance(filePath) {
  // Core Files
  if (isCoreFile(filePath)) return 'HIGH';
  
  // Important Files
  if (isBusinessLogic(filePath) || 
      isApiEndpoint(filePath) || 
      isDataModel(filePath)) return 'MEDIUM';
  
  // Supporting Files
  return 'LOW';
}
```

#### 2. 展開レベルの決定
```javascript
function determineExpansionLevel(importance, context) {
  if (importance === 'HIGH') return 2;
  
  if (importance === 'MEDIUM') {
    return context.isModificationTarget ? 2 : 1;
  }
  
  return 1; // LOW importance
}
```

## 動的展開戦略

### 段階的詳細化
1. **初期展開**: 全ファイルをレベル1で展開
2. **選択的詳細化**: 必要なファイルのみレベル2-3に展開
3. **オンデマンド展開**: 要求に応じて追加詳細化

### コンテキスト考慮
**タスクタイプ別展開**:
- **新機能開発**: 関連ファイルを重点的に展開
- **バグ修正**: 問題箇所を詳細展開
- **リファクタリング**: 影響範囲を広く基本展開

**フェーズ別展開**:
- **設計フェーズ**: 構造理解重視 (レベル1-2)
- **実装フェーズ**: 詳細理解重視 (レベル2-3)
- **テストフェーズ**: テスト関連詳細化

## 展開効率の最適化

### トークン使用量管理
```
レベル1: 平均 50-100 tokens/ファイル
レベル2: 平均 200-500 tokens/ファイル
レベル3: 平均 500-2000 tokens/ファイル
```

### 優先順位付け
1. **修正対象ファイル**: 最高優先度
2. **直接依存ファイル**: 高優先度
3. **間接依存ファイル**: 中優先度
4. **無関係ファイル**: 低優先度

### 適応的調整
- **コンテキスト使用量監視**: 80%超過時に展開レベル下げ
- **重要度再評価**: タスク進行に応じて動的調整
- **ユーザーフィードバック**: 手動調整要求への対応

## 実装ガイドライン

### 展開レベル決定の自動化
```typescript
interface ExpansionConfig {
  fileImportance: 'HIGH' | 'MEDIUM' | 'LOW';
  taskType: 'DEVELOPMENT' | 'BUGFIX' | 'REFACTOR';
  phase: 'DESIGN' | 'IMPLEMENTATION' | 'TEST';
  isModificationTarget: boolean;
}

function determineExpansionLevel(config: ExpansionConfig): number {
  if (config.fileImportance === 'HIGH') return 2;
  
  if (config.fileImportance === 'MEDIUM') {
    if (config.isModificationTarget || config.taskType === 'BUGFIX') {
      return 2;
    }
    return 1;
  }
  
  return 1;
}
```

### 動的調整機能
- リアルタイムトークン使用量監視
- 自動展開レベル調整
- ユーザー設定の反映
- 学習機能による最適化
