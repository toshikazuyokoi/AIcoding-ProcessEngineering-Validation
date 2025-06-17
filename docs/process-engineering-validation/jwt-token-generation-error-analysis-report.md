# JWTトークン生成エラー詳細調査レポート

## メタデータ

| 項目 | 内容 |
|------|------|
| ドキュメントID | PE-VAL-003 |
| 作成日 | 2025-06-13 |
| 最終更新日 | 2025-06-13 |
| 調査対象 | JWTトークン生成時のValidationError |
| 調査者 | Process Engineering Validation Team |
| 関連文書 | PE-VAL-001, PE-VAL-002 |

## 1. 調査概要

### 1.1 調査背景
手動ログインテスト（demo@example.com/password123）で認証は成功するが、JWTトークン生成時に以下のエラーが発生：
```
ValidationError: User ID is required and must be a string
```

### 1.2 調査目的
- JWTトークン生成エラーの根本原因特定
- AuthServiceとJWTManagerの整合性検証
- 修正方針の策定

## 2. エラー詳細分析

### 2.1 エラー発生箇所
```
ValidationError: User ID is required and must be a string
    at JWTManager.validateUserData (/backend/src/utils/jwt-manager.ts:132:13)
    at JWTManager.generateAccessToken (/backend/src/utils/jwt-manager.ts:169:10)
    at AuthService.generateTokens (/backend/src/domain/services/auth.service.ts:450:41)
    at AuthService.authenticate (/backend/src/domain/services/auth.service.ts:240:25)
```

### 2.2 エラーフロー
1. ✅ **認証成功**: パスワード検証 `isValid: true`
2. ✅ **ユーザー取得成功**: `userId: "67d3a7ee-5b2f-4506-b98c-3accb509d6fd"`
3. ❌ **JWTトークン生成失敗**: `User ID is required and must be a string`

## 3. 根本原因の特定

### 3.1 🚨 重大な問題発見

**AuthServiceとJWTManagerでインターフェースの不整合**が発生している：

#### **AuthService側のペイロード作成** (`auth.service.ts:444-448`):
```typescript
const payload = {
  userId: user.id,  // ← userIdプロパティ
  email: user.email,
  role: user.role
};
```

#### **JWTManager側のインターフェース** (`jwt-manager.ts:74-78`):
```typescript
export interface UserTokenData {
  id: string;       // ← idプロパティ（userIdではない）
  email: string;
  role: string;
}
```

#### **JWTManager.validateUserData()** (`jwt-manager.ts:131-132`):
```typescript
if (!userData.id || typeof userData.id !== 'string') {
  throw new ValidationError('User ID is required and must be a string');
}
```

### 3.2 問題の詳細

1. **AuthService**は`userId`プロパティでペイロードを作成
2. **JWTManager**は`id`プロパティを期待
3. **結果**: `userData.id`が`undefined`になり、バリデーションエラー

### 3.3 副次的問題

#### **getTokenExpiration()の誤用** (`auth.service.ts:452`):
```typescript
const expiresIn = this.jwtManager.getTokenExpiration(); // ← 引数が必要
```

**正しい実装**:
```typescript
// JWTManager内の正しい実装
const expiresIn = this.parseExpirationTime(this.config.accessExpiresIn);
```

## 4. 影響範囲分析

### 4.1 直接影響
- **AuthService.generateTokens()**: JWTトークン生成失敗
- **認証フロー**: ログイン処理が400エラーで失敗
- **フロントエンド**: エラーメッセージ表示

### 4.2 間接影響
- **E2Eテスト**: 認証フローテストが失敗
- **統合テスト**: 認証関連テストが失敗
- **ユーザー体験**: ログインできない状態

## 5. 設計書との整合性検証

### 5.1 設計書の確認
**メソッドインターフェース設計書** (`method-interfaces.md:714-720`):
```typescript
interface JWTPayload {
  userId: string;  // ← 設計書ではuserId
  email: string;
  role: string;
  iat: number;
  exp: number;
}
```

### 5.2 実装との乖離
- **設計書**: `userId`プロパティ
- **JWTManager実装**: `id`プロパティ
- **AuthService実装**: `userId`プロパティ（設計書に準拠）

## 6. 修正方針

### 6.1 Option A: AuthServiceのペイロード修正（推奨）

**理由**: JWTManagerの実装に合わせる

**修正内容**:
```typescript
// 修正前
const payload = {
  userId: user.id,
  email: user.email,
  role: user.role
};

// 修正後
const payload = {
  id: user.id,      // ← userId → id に修正
  email: user.email,
  role: user.role
};
```

**メリット**:
- ✅ 最小限の変更
- ✅ JWTManagerの実装を維持
- ✅ 迅速な問題解決

**デメリット**:
- ⚠️ 設計書との不整合が残る

### 6.2 Option B: JWTManagerのインターフェース修正

**理由**: 設計書に合わせる

**修正内容**:
```typescript
// UserTokenDataインターフェース修正
export interface UserTokenData {
  userId: string;   // ← id → userId に修正
  email: string;
  role: string;
}

// validateUserData()修正
if (!userData.userId || typeof userData.userId !== 'string') {
  throw new ValidationError('User ID is required and must be a string');
}
```

**メリット**:
- ✅ 設計書との整合性確保
- ✅ 命名の一貫性向上

**デメリット**:
- ❌ 大規模な変更が必要
- ❌ JWTManagerの全メソッド修正
- ❌ テストファイルの修正も必要

### 6.3 Option C: getTokenExpiration()の修正

**修正内容**:
```typescript
// 修正前
const expiresIn = this.jwtManager.getTokenExpiration();

// 修正後（JWTManagerのgenerateTokens()を使用）
const tokenPair = this.jwtManager.generateTokens(payload);
return tokenPair;

// または直接parseExpirationTime()を呼び出し
```

## 7. 推奨修正戦略

### 7.1 段階的修正アプローチ

#### **Phase 1: 緊急修正（推奨）**
**Option A**を採用してAuthServiceのペイロードを修正：

```typescript
// AuthService.generateTokens()修正
const payload = {
  id: user.id,      // ← userId → id
  email: user.email,
  role: user.role
};
```

#### **Phase 2: 長期的改善（将来対応）**
設計書との整合性を確保するため、以下を段階的に実施：

1. **設計書の更新**（`id`プロパティに統一）
2. **命名規則の統一**
3. **インターフェース定義の一元管理**

### 7.2 修正手順

#### **緊急修正手順**:
1. AuthService.generateTokens()のペイロード修正
2. 単体テスト実行で動作確認
3. 手動ログインテストで認証フロー確認
4. E2Eテスト実行で全体動作確認

#### **品質保証**:
1. 既存テストの全実行
2. 認証フローの完全テスト
3. JWTトークンの検証テスト
4. セキュリティテストの実行

## 8. リスク評価

### 8.1 修正リスクマトリクス

| 修正方法 | 変更規模 | リグレッションリスク | 設計書整合性 | 推奨度 |
|----------|----------|---------------------|--------------|--------|
| Option A | 小 | 低 | 中 | ⭐⭐⭐⭐⭐ |
| Option B | 大 | 高 | 高 | ⭐⭐ |
| Option C | 中 | 中 | 中 | ⭐⭐⭐ |

### 8.2 影響を受けるコンポーネント

#### **直接影響**:
- AuthService.generateTokens()
- JWTManager.validateUserData()
- 認証フロー

#### **間接影響**:
- AuthController
- 認証ミドルウェア
- E2Eテスト

## 9. 結論

### 9.1 推奨事項
**Option A（AuthServiceペイロード修正）**を推奨します。

**理由**:
- 最小限の変更で問題解決
- リグレッションリスクが最小
- 迅速な問題解決が可能

### 9.2 今後の改善課題
1. **インターフェース定義の一元管理**
2. **設計書と実装の整合性確保**
3. **命名規則の統一**
4. **型定義の重複解消**

---

**本調査により、AuthServiceとJWTManagerのインターフェース不整合が根本原因であることが確認されました。最小限の変更で迅速に問題を解決し、段階的に設計品質を向上させる戦略を推奨します。**
