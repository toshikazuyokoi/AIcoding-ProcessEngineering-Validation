# 修正影響範囲詳細調査レポート

## メタデータ

| 項目 | 内容 |
|------|------|
| ドキュメントID | PE-VAL-005 |
| 作成日 | 2025-06-13 |
| 最終更新日 | 2025-06-13 |
| 調査対象 | AuthServiceペイロード修正とgetTokenExpiration()修正の影響範囲 |
| 調査者 | Process Engineering Validation Team |
| 関連文書 | PE-VAL-003, PE-VAL-004 |

## 1. 調査概要

### 1.1 修正内容
#### **最優先修正**: AuthServiceペイロードのプロパティ名修正
```typescript
// 修正前
const payload = {
  userId: user.id,  // ← 現在の実装
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

#### **次優先修正**: getTokenExpiration()呼び出し修正
```typescript
// 修正前
const expiresIn = this.jwtManager.getTokenExpiration(); // ← 引数なし（間違い）

// 修正後
const expiresIn = this.parseExpirationTime(this.config.accessExpiresIn); // ← 直接計算
```

## 2. AuthServiceペイロード修正の影響分析

### 2.1 ✅ 影響を受けないファイル

#### **2.1.1 JWTManager内部処理**
**ファイル**: `backend/src/utils/jwt-manager.ts`

**理由**: JWTManager内部では以下の変換が行われるため影響なし
```typescript
// generateAccessToken()内
const payload: Omit<JWTPayload, 'iat' | 'exp' | 'iss' | 'aud'> = {
  userId: userData.id,  // ← userData.idを使用してuserIdプロパティ作成
  email: userData.email,
  role: userData.role,
  type: 'access'
};
```

#### **2.1.2 JWTトークン検証処理**
**ファイル**: `backend/src/utils/jwt-manager.ts`

**理由**: 検証時は生成されたJWTPayloadを使用するため影響なし
```typescript
// verifyToken()で返されるJWTPayload
{
  userId: "user-id",  // ← 常にuserIdプロパティ
  email: "user@example.com",
  role: "user",
  type: "access",
  iat: 1234567890,
  exp: 1234571490
}
```

#### **2.1.3 認証ミドルウェア**
**ファイル**: `backend/src/middleware/auth-middleware.ts`

**理由**: JWTManager.verifyToken()の結果を使用するため影響なし
```typescript
// verifyTokenAndGetUser()内
const payload = this.jwtManager.verifyToken(token);
// ← payloadは常にuserIdプロパティを持つ
```

#### **2.1.4 AuthService内の他のメソッド**
**ファイル**: `backend/src/domain/services/auth.service.ts`

**影響なしメソッド**:
- `verifyToken()`: JWTManager.verifyAccessToken()の結果を使用
- `refreshToken()`: JWTManager.verifyRefreshToken()の結果を使用
- `extractUserIdFromToken()`: JWTManager.verifyAccessToken()の結果を使用

### 2.2 ⚠️ 影響を受ける可能性があるファイル

#### **2.2.1 テストヘルパーファイル**
**ファイル**: `backend/tests/support/utils/AuthHelper.js`

**影響箇所**:
```typescript
// 133行目: generateJWTToken()
const payload = {
  userId: userData.id,  // ← userIdプロパティを使用
  email: userData.email,
  role: userData.role
};
```

**影響度**: ❌ **要修正**
**理由**: 独自にJWTトークンを生成しており、AuthServiceと同じペイロード構造を期待

#### **2.2.2 TypeScriptテストヘルパー**
**ファイル**: `tests/support/utils/AuthHelper.ts`

**影響箇所**:
```typescript
// 187行目: generateJWTToken()
const payload = {
  userId: userData.id,  // ← userIdプロパティを使用
  email: userData.email,
  role: userData.role
};
```

**影響度**: ❌ **要修正**
**理由**: 同様に独自JWTトークン生成でuserIdプロパティを使用

#### **2.2.3 統合テストヘルパー**
**ファイル**: `backend/tests/integration/utils/auth-helper-simple.test.js`

**影響箇所**:
```typescript
// 21行目: generateJWTToken()
const payload = {
  userId: userData.id,  // ← userIdプロパティを使用
  email: userData.email,
  role: userData.role
};
```

**影響度**: ❌ **要修正**
**理由**: 統合テスト用の独自JWT生成でuserIdプロパティを使用

### 2.3 🔍 詳細影響分析

#### **2.3.1 テストファイルの問題**
**問題**: テストヘルパーが実際のAuthServiceと異なるペイロード構造を使用

**現在の状況**:
1. **AuthService**: `userId`プロパティでペイロード作成
2. **テストヘルパー**: `userId`プロパティでペイロード作成
3. **JWTManager**: `id`プロパティを期待

**修正後の状況**:
1. **AuthService**: `id`プロパティでペイロード作成（修正）
2. **テストヘルパー**: `userId`プロパティでペイロード作成（不整合）
3. **JWTManager**: `id`プロパティを期待

#### **2.3.2 修正が必要な理由**
テストヘルパーが実際のAuthServiceと異なるペイロード構造を使用すると：
- 統合テストで実際の動作と異なる結果
- E2Eテストでの認証フロー不整合
- テスト環境と本番環境の動作差異

## 3. getTokenExpiration()修正の影響分析

### 3.1 ✅ 影響を受けないファイル

#### **3.1.1 JWTManager内部実装**
**ファイル**: `backend/src/utils/jwt-manager.ts`

**理由**: JWTManager.generateTokens()では正しい実装を使用
```typescript
// 254行目: 正しい実装
const expiresIn = this.parseExpirationTime(this.config.accessExpiresIn);
```

#### **3.1.2 IJWTManagerインターフェース**
**ファイル**: `backend/src/domain/services/auth.service.ts`

**現在の定義**:
```typescript
interface IJWTManager {
  getTokenExpiration(): number;  // ← 引数なしで定義
}
```

**影響度**: ⚠️ **インターフェース修正必要**

### 3.2 ❌ 影響を受けるファイル

#### **3.2.1 AuthServiceテストファイル**
**ファイル**: `backend/__tests__/domain/services/auth.service.test.ts`

**影響箇所**:
```typescript
// 167行目: MockJWTManager.getTokenExpiration()
getTokenExpiration(): number {
  return this.accessTokenExpiration;  // ← 引数なしで実装
}
```

**影響度**: ❌ **要修正**
**理由**: MockJWTManagerが引数なしのgetTokenExpiration()を実装

## 4. 修正戦略と優先順位

### 4.1 修正優先順位

#### **Phase 1: 最優先修正**
1. **AuthService.generateTokens()**: `userId` → `id`
2. **IJWTManagerインターフェース**: `getTokenExpiration()`削除または修正

#### **Phase 2: テストファイル修正**
1. **AuthHelper.js**: `userId` → `id`
2. **AuthHelper.ts**: `userId` → `id`
3. **auth-helper-simple.test.js**: `userId` → `id`
4. **MockJWTManager**: `getTokenExpiration()`修正

### 4.2 修正手順

#### **4.2.1 AuthService修正**
```typescript
// AuthService.generateTokens()修正
public generateTokens(user: User): TokenPair {
  const payload = {
    id: user.id,      // ← userId → id に修正
    email: user.email,
    role: user.role
  };

  const accessToken = this.jwtManager.generateAccessToken(payload);
  const refreshToken = this.jwtManager.generateRefreshToken(payload);
  
  // JWTManagerのgenerateTokens()を使用するか、直接計算
  const tokenPair = this.jwtManager.generateTokens(payload);
  return tokenPair;
}
```

#### **4.2.2 テストヘルパー修正**
```typescript
// 全テストヘルパーで統一
const payload = {
  id: userData.id,      // ← userId → id に修正
  email: userData.email,
  role: userData.role
};
```

## 5. リスク評価

### 5.1 修正リスクマトリクス

| 修正対象 | 変更規模 | リグレッションリスク | 影響範囲 | 修正難易度 |
|----------|----------|---------------------|----------|------------|
| AuthService.generateTokens() | 小 | 低 | 限定的 | 低 |
| テストヘルパー修正 | 小 | 低 | テストのみ | 低 |
| IJWTManagerインターフェース | 小 | 低 | 限定的 | 低 |

### 5.2 修正後の検証項目

#### **5.2.1 機能テスト**
- [ ] ユーザー登録フロー
- [ ] ユーザーログインフロー
- [ ] トークンリフレッシュフロー
- [ ] トークン検証フロー

#### **5.2.2 統合テスト**
- [ ] 認証API統合テスト
- [ ] 認証ミドルウェアテスト
- [ ] E2E認証フローテスト

#### **5.2.3 単体テスト**
- [ ] AuthServiceテスト
- [ ] JWTManagerテスト
- [ ] テストヘルパーテスト

## 6. 結論

### 6.1 修正の安全性

#### **✅ 安全な修正**
- **AuthService.generateTokens()**: 内部実装のみの変更
- **テストヘルパー**: テスト環境のみの影響
- **IJWTManagerインターフェース**: 使用箇所が限定的

#### **✅ 影響範囲が限定的**
- 認証フロー以外への影響なし
- データベースやフロントエンドへの影響なし
- 既存のJWTトークンへの影響なし

### 6.2 推奨事項

#### **修正実施推奨**
1. **リスクが低い**: 変更規模が小さく、影響範囲が限定的
2. **効果が高い**: 認証エラーの根本解決
3. **検証が容易**: 既存テストで動作確認可能

#### **修正後の確認事項**
1. 全テストの実行と成功確認
2. 手動ログインテストの実行
3. E2Eテストの実行と成功確認

---

**本調査により、提案された修正は安全で効果的であり、影響範囲も限定的であることが確認されました。修正実施を推奨します。**
