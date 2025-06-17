# IPasswordHasherインターフェース影響範囲調査レポート

## メタデータ

| 項目 | 内容 |
|------|------|
| ドキュメントID | PE-VAL-002 |
| 作成日 | 2025-06-13 |
| 最終更新日 | 2025-06-13 |
| 調査対象 | IPasswordHasher インターフェース影響範囲 |
| 調査者 | Process Engineering Validation Team |
| 関連文書 | PE-VAL-001 (設計書とコーディング整合性調査レポート) |

## 1. 調査概要

### 1.1 調査背景
AuthServiceで`passwordHasher.verify()`メソッドを呼び出しているが、PasswordHasherクラスには`verify`メソッドが存在せず、`compare`メソッドのみ実装されている問題について、インターフェース修正の影響範囲を調査。

### 1.2 調査目的
- IPasswordHasherインターフェースの全使用箇所特定
- 修正方法の検討と影響範囲の評価
- 最適な修正戦略の提案

## 2. 影響範囲調査結果

### 2.1 IPasswordHasherインターフェース定義箇所

#### 📍 **重複定義発見**
IPasswordHasherインターフェースが**2箇所で重複定義**されています：

1. **AuthService内** (`backend/src/domain/services/auth.service.ts`):
   ```typescript
   export interface IPasswordHasher {
     hash(password: string): Promise<string>;
     verify(password: string, hash: string): Promise<boolean>;
   }
   ```

2. **UserService内** (`backend/src/domain/services/user.service.ts`):
   ```typescript
   export interface IPasswordHasher {
     hash(password: string): Promise<string>;
     verify(password: string, hash: string): Promise<boolean>;
   }
   ```

### 2.2 IPasswordHasherインターフェース使用箇所

#### 🔍 **サービス実装**

1. **AuthService** (`backend/src/domain/services/auth.service.ts`):
   - 230行目: `this.passwordHasher.verify(request.password, user.passwordHash)`
   - 342行目: `this.passwordHasher.verify(request.currentPassword, user.passwordHash)`
   - 425行目: `this.passwordHasher.verify(password, user.passwordHash)`

2. **UserService** (`backend/src/domain/services/user.service.ts`):
   - 433行目: `this.passwordHasher.verify(currentPassword, user.passwordHash)`
   - 467行目: `this.passwordHasher.verify(password, user.passwordHash)`

#### 🧪 **テストファイル**

1. **AuthServiceテスト** (`backend/__tests__/domain/services/auth.service.test.ts`):
   ```typescript
   class MockPasswordHasher implements IPasswordHasher {
     async verify(password: string, hash: string): Promise<boolean> {
       return hash === `hashed_${password}`;
     }
   }
   ```

2. **UserServiceテスト** (`backend/__tests__/domain/services/user.service.test.ts`):
   ```typescript
   class MockPasswordHasher implements IPasswordHasher {
     async verify(password: string, hash: string): Promise<boolean> {
       return hash === `hashed_${password}`;
     }
   }
   ```

#### 🏗️ **依存関係注入**

**メインアプリケーション** (`backend/src/index.ts`):
```typescript
const authService = new AuthService(
  repositories.userRepository as any,
  infrastructure.passwordHasher as any,  // ← PasswordHasherクラスのインスタンス
  infrastructure.jwtManager as any
);

const userService = new UserService(
  repositories.userRepository as any,
  infrastructure.passwordHasher as any   // ← PasswordHasherクラスのインスタンス
);
```

### 2.3 PasswordHasher実装クラス

**PasswordHasher実装** (`backend/src/utils/password-hasher.ts`):
- ✅ `hash(password: string)` メソッド: 実装済み
- ✅ `compare(password: string, hash: string)` メソッド: 実装済み
- ❌ `verify(password: string, hash: string)` メソッド: **未実装**

## 3. 問題の詳細分析

### 3.1 インターフェース不整合マトリクス

| 項目 | インターフェース定義 | 実装クラス | 状態 |
|------|---------------------|------------|------|
| hash メソッド | ✅ 定義済み | ✅ 実装済み | ✅ 整合 |
| verify メソッド | ✅ 定義済み | ❌ 未実装 | ❌ 不整合 |
| compare メソッド | ❌ 未定義 | ✅ 実装済み | ❌ 不整合 |

### 3.2 設計書との整合性

**プロセスフロー設計書** (`docs/project-specific/step3-detailed-design/process-flow.md`):
- 846行目: `PasswordHasher.compare(password, this.passwordHash)` と記載
- **設計書では`compare`メソッドが正しい**

### 3.3 テストファイルでの問題隠蔽

テストファイルでMockPasswordHasherが`verify`メソッドを実装しているため：
- ✅ **単体テスト**: 成功（モックが`verify`を実装）
- ❌ **統合テスト**: 失敗（実際のPasswordHasherには`verify`がない）

## 4. 修正方法の検討

### 4.1 Option A: PasswordHasherにverifyメソッドを追加（推奨）

**メリット**:
- ✅ 既存のインターフェースを維持
- ✅ 既存のサービスコードを変更不要
- ✅ テストコードを変更不要
- ✅ 最小限の変更で問題解決

**デメリット**:
- ⚠️ `verify`と`compare`の機能重複
- ⚠️ 設計書との不整合が残る

**実装方法**:
```typescript
// PasswordHasherクラスに追加
public async verify(password: string, hash: string): Promise<boolean> {
  return this.compare(password, hash);
}
```

### 4.2 Option B: インターフェースをcompareに統一

**メリット**:
- ✅ 設計書との整合性確保
- ✅ 機能重複の回避
- ✅ 命名の一貫性向上

**デメリット**:
- ❌ 大規模な変更が必要
- ❌ 複数ファイルの同時修正
- ❌ テストファイルの修正も必要
- ❌ リグレッションリスクが高い

**必要な変更**:
1. AuthService: `verify` → `compare` (3箇所)
2. UserService: `verify` → `compare` (2箇所)
3. IPasswordHasherインターフェース: `verify` → `compare` (2箇所)
4. AuthServiceテスト: MockPasswordHasher修正
5. UserServiceテスト: MockPasswordHasher修正

### 4.3 Option C: 共通インターフェースファイルの作成

**メリット**:
- ✅ インターフェース重複の解消
- ✅ 一元管理による整合性向上
- ✅ 将来的な拡張性

**デメリット**:
- ❌ 大規模なリファクタリングが必要
- ❌ インポート文の変更が必要
- ❌ 既存の依存関係の見直しが必要

## 5. リスク評価

### 5.1 修正リスクマトリクス

| 修正方法 | 変更規模 | リグレッションリスク | 設計書整合性 | 推奨度 |
|----------|----------|---------------------|--------------|--------|
| Option A | 小 | 低 | 中 | ⭐⭐⭐⭐⭐ |
| Option B | 大 | 高 | 高 | ⭐⭐ |
| Option C | 大 | 高 | 高 | ⭐⭐ |

### 5.2 影響を受けるコンポーネント

#### **直接影響**:
- AuthService (認証処理)
- UserService (ユーザー管理)
- PasswordHasher (パスワードハッシュ化)

#### **間接影響**:
- AuthController (認証API)
- 認証ミドルウェア
- E2Eテスト

#### **テスト影響**:
- AuthServiceテスト
- UserServiceテスト
- 統合テスト
- E2Eテスト

## 6. 推奨修正戦略

### 6.1 段階的修正アプローチ

#### **Phase 1: 緊急対応（推奨）**
**Option A**を採用してPasswordHasherに`verify`メソッドを追加：

```typescript
/**
 * Verify password against hash (alias for compare)
 */
public async verify(password: string, hash: string): Promise<boolean> {
  return this.compare(password, hash);
}
```

#### **Phase 2: 長期的改善（将来対応）**
設計書との整合性を確保するため、以下を段階的に実施：

1. **共通インターフェースファイルの作成**
2. **インターフェース定義の統一**
3. **設計書に合わせた`compare`メソッドへの移行**

### 6.2 修正手順

#### **緊急修正手順**:
1. PasswordHasherクラスに`verify`メソッドを追加
2. 単体テスト実行で動作確認
3. 統合テスト実行で認証フロー確認
4. E2Eテスト実行で全体動作確認

#### **品質保証**:
1. 既存テストの全実行
2. 新規テストケースの追加
3. セキュリティテストの実行
4. パフォーマンステストの実行

## 7. 結論

### 7.1 推奨事項
**Option A（PasswordHasherにverifyメソッド追加）**を推奨します。

**理由**:
- 最小限の変更で問題解決
- リグレッションリスクが最小
- 既存コードへの影響が最小
- 迅速な問題解決が可能

### 7.2 今後の改善課題
1. **インターフェース重複の解消**
2. **設計書との整合性確保**
3. **共通インターフェースファイルの作成**
4. **命名規則の統一**

---

**本調査により、最小限の変更で問題を解決し、段階的に設計品質を向上させる戦略を推奨します。**
