# 問題発生原因調査レポート

## メタデータ

| 項目 | 内容 |
|------|------|
| ドキュメントID | PE-VAL-004 |
| 作成日 | 2025-06-13 |
| 最終更新日 | 2025-06-13 |
| 調査対象 | JWTトークン生成エラーの根本原因分析 |
| 調査者 | Process Engineering Validation Team |
| 関連文書 | PE-VAL-001, PE-VAL-002, PE-VAL-003 |

## 1. 調査概要

### 1.1 調査目的
- 設計書の記載ミスか、コーディングの間違いかを特定
- テストコードで問題が発見されなかった理由の解明
- プロセスエンジニアリング手法の有効性検証

### 1.2 調査方法
- 設計書の詳細確認
- 実装コードとの整合性検証
- テストファイルの問題隠蔽メカニズム分析
- Git履歴による実装順序の調査

## 2. 設計書の検証結果

### 2.1 ✅ 設計書は正確

#### **メソッドインターフェース設計書** (`method-interfaces.md:714-720`):
```typescript
// JWT ペイロード型
interface JWTPayload {
  userId: string;  // ← 設計書では正しくuserId
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

#### **設計書の一貫性**:
- **714行目**: `userId: string;` と正しく定義
- **336行目**: `userId: string;` (TaskListProps)
- **484行目**: `userId: string;` (CreateTaskMethod)
- **677行目**: `userId: string;` (Task型)

### 2.2 設計書の品質評価
- ✅ **命名規則**: 一貫して`userId`を使用
- ✅ **型定義**: 明確で具体的
- ✅ **完全性**: 必要な情報が網羅されている

## 3. 実装コードの検証結果

### 3.1 ❌ 実装に不整合が存在

#### **AuthService実装** (`auth.service.ts:59-65`):
```typescript
// AuthService内のJWTPayload定義
export interface JWTPayload {
  userId: string;  // ← 設計書に準拠（正しい）
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}
```

#### **JWTManager実装** (`jwt-manager.ts:74-78`):
```typescript
// JWTManager内のUserTokenData定義
export interface UserTokenData {
  id: string;      // ← 設計書と不整合（間違い）
  email: string;
  role: string;
}
```

#### **JWTManager内のJWTPayload定義** (`jwt-manager.ts:50-59`):
```typescript
export interface JWTPayload {
  userId: string;  // ← 設計書に準拠（正しい）
  email: string;
  role: string;
  type: 'access' | 'refresh';
  iat: number;
  exp: number;
  iss?: string;
  aud?: string;
}
```

### 3.2 問題の特定

#### **🚨 重大な発見**:
**JWTManager内で2つの異なるインターフェースが混在**

1. **JWTPayload**: `userId`プロパティ（設計書準拠）
2. **UserTokenData**: `id`プロパティ（設計書と不整合）

#### **不整合の詳細**:
```typescript
// JWTManager.generateAccessToken()内
const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
  userId: userData.id,  // ← userData.idが存在しない！
  email: userData.email,
  role: userData.role,
  type: 'access'
};
```

## 4. テストコードで問題が発見されなかった理由

### 4.1 🎭 テストファイルでの問題隠蔽

#### **MockJWTManagerの実装** (`auth.service.test.ts:115-123`):
```typescript
class MockJWTManager implements IJWTManager {
  generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    // ← payloadは正しくuserIdプロパティを持つ
    const fullPayload = {
      ...payload,  // ← AuthServiceから正しいuserIdが渡される
      iat: now,
      exp: now + this.accessTokenExpiration
    };
    return `access_${JSON.stringify(fullPayload)}`;
  }
}
```

#### **問題隠蔽のメカニズム**:
1. **AuthService**: `userId`プロパティでペイロード作成（正しい）
2. **MockJWTManager**: `userId`プロパティを受け取る（正しい）
3. **実際のJWTManager**: `id`プロパティを期待（間違い）

### 4.2 テスト設計の問題

#### **❌ 実装依存のモック**:
- MockJWTManagerが実際のJWTManagerの実装を正確に模倣していない
- インターフェースの不整合が隠蔽される構造

#### **❌ 統合テストの不足**:
- 単体テストでは問題が発見されない
- 実際のJWTManagerを使用した統合テストが不足

## 5. Git履歴による実装順序分析

### 5.1 実装タイミングの特定

#### **関連コミット履歴**:
```
c6fbcde feat(#033): JWTManager JWT生成・検証・管理システム実装
6d023f5 feat: AuthServiceドメインサービス実装
```

#### **実装順序**:
1. **JWTManager実装** (c6fbcde) - `UserTokenData`で`id`プロパティ定義
2. **AuthService実装** (6d023f5) - 設計書に従い`userId`プロパティ使用

### 5.2 問題発生の推定プロセス

#### **Phase 1: JWTManager実装時**
- 設計書を参照せずに`UserTokenData`インターフェースを作成
- 一般的な命名規則に従い`id`プロパティを使用
- 内部的には`JWTPayload`で`userId`を使用（設計書準拠）

#### **Phase 2: AuthService実装時**
- 設計書に従い`userId`プロパティでペイロード作成
- JWTManagerの`UserTokenData`インターフェースを確認せず
- テストでMockJWTManagerを使用し、問題が隠蔽

## 6. 根本原因の特定

### 6.1 🎯 主要原因

#### **1. インターフェース設計の不統一**
- JWTManager内で`JWTPayload`と`UserTokenData`の命名規則が不一致
- 設計書との整合性チェック不足

#### **2. 実装時の設計書参照不足**
- JWTManager実装時に設計書を十分に参照しなかった
- 独自の判断で`id`プロパティを採用

#### **3. テスト設計の問題**
- 実装依存のモックによる問題隠蔽
- 実際のJWTManagerを使用した統合テストの不足

### 6.2 🔍 副次的原因

#### **1. コードレビューの不備**
- インターフェース整合性のチェック不足
- 設計書との照合プロセスの欠如

#### **2. 型定義の重複管理**
- 複数ファイルでの型定義重複
- 一元管理の仕組みの不足

## 7. プロセスエンジニアリング手法の評価

### 7.1 ✅ 有効だった部分

#### **設計書の品質**:
- 明確で一貫した型定義
- 適切な命名規則の採用
- 包括的な仕様記述

#### **段階的詳細化**:
- 要件から実装への適切な流れ
- 各段階での成果物の明確化

### 7.2 ❌ 改善が必要な部分

#### **設計書と実装の整合性管理**:
- 実装時の設計書参照の義務化不足
- 整合性チェックの自動化不足

#### **テスト戦略**:
- 実装依存のモック設計
- 統合テストでの設計書準拠チェック不足

## 8. 改善提案

### 8.1 プロセス改善

#### **1. 設計書参照の義務化**
- 実装前の設計書確認チェックリスト
- コードレビューでの設計書照合

#### **2. インターフェース一元管理**
- 共通型定義ファイルの作成
- 重複定義の排除

#### **3. 統合テストの強化**
- 実際の実装を使用したテスト
- 設計書準拠の自動チェック

### 8.2 品質保証改善

#### **1. 自動化ツールの導入**
- 設計書と実装の差分検出
- インターフェース整合性チェック

#### **2. テスト設計の改善**
- 実装非依存のモック設計
- 契約テストの導入

## 9. 結論

### 9.1 問題の性質

#### **設計書**: ✅ **正確**
- 一貫した命名規則
- 明確な型定義
- 包括的な仕様

#### **実装**: ❌ **不整合**
- JWTManager内でのインターフェース不統一
- 設計書参照不足による独自判断

#### **テスト**: ❌ **問題隠蔽**
- 実装依存のモック設計
- 統合テストの不足

### 9.2 プロセスエンジニアリング手法の有効性

#### **✅ 設計プロセス**: 有効
- 高品質な設計書の作成
- 適切な段階的詳細化

#### **❌ 実装プロセス**: 改善必要
- 設計書と実装の整合性管理
- 品質保証プロセスの強化

### 9.3 今後の対策

1. **設計書参照の義務化**
2. **インターフェース一元管理**
3. **統合テストの強化**
4. **自動化ツールの導入**

---

**本調査により、設計書は正確であり、実装時の設計書参照不足とテスト設計の問題が根本原因であることが確認されました。プロセスエンジニアリング手法の設計プロセスは有効ですが、実装プロセスの改善が必要です。**
