# TSK-007-TYP-Core Issue仕様書

## 概要
**タスクID**: TSK-007-TYP-Core  
**ファイル**: src/types/core.ts  
**複雑度**: 高  
**見積時間**: 3時間  
**優先度**: 🥇最重要（基本型定義）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/core.ts`
- **型定義**: ブランド型・ID型・エラー型・Result型
- **レイヤー**: Types（型定義層）
- **依存関係**: TSK-001 (環境変数)

## 実装仕様

### 前提条件
- 依存タスク: TSK-001-CFG-Environment
- 参照設計書: `docs/step3/detailed-design/type-design.md`

### 型定義一覧

#### 1. ブランド型（Brand Types）
```typescript
// ブランド型基盤
declare const __brand: unique symbol;
type Brand<T, TBrand> = T & { [__brand]: TBrand };

// ID型定義
export type UserID = Brand<string, 'UserID'>;
export type TaskID = Brand<string, 'TaskID'>;
export type SessionID = Brand<string, 'SessionID'>;

// ファクトリ関数
export const createUserID = (value: string): UserID => value as UserID;
export const createTaskID = (value: string): TaskID => value as TaskID;
export const createSessionID = (value: string): SessionID => value as SessionID;
```

#### 2. Result型（エラーハンドリング）
```typescript
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type Option<T> = T | null | undefined;

// ヘルパー関数
export const Ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const Err = <E>(error: E): Result<never, E> => ({ success: false, error });
```

#### 3. 基本ビジネス型
```typescript
export type Email = Brand<string, 'Email'>;
export type UserName = Brand<string, 'UserName'>;
export type Password = Brand<string, 'Password'>;
export type HashedPassword = Brand<string, 'HashedPassword'>;

// バリデーション関数
export const createEmail = (value: string): Result<Email, string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(value) 
    ? Ok(value as Email)
    : Err('Invalid email format');
};
```

#### 4. 共通ユーティリティ型
```typescript
export type Timestamp = Brand<Date, 'Timestamp'>;
export type ISO8601String = Brand<string, 'ISO8601String'>;

// ページネーション型
export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
  - [ ] ブランド型戦略の理解
  - [ ] ID型・エラー型の仕様確認
  - [ ] TypeScript厳密モード対応
- [ ] 2. コーディング
  - [ ] ブランド型（UserID、TaskID）実装
  - [ ] Result型・Option型実装
  - [ ] 基本データ型定義
- [ ] 3. テストコーディング
  - [ ] 型安全性テスト
  - [ ] ブランド型テスト
  - [ ] エラーハンドリングテスト
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 型安全性テスト：ブランド型の型チェック確認
- [ ] バリデーションテスト：Email等の形式チェック
- [ ] Result型テスト：Ok/Errの正常動作確認
- [ ] 境界値テスト：異常値での型安全性確認

## 完了条件
- [ ] 全ブランド型定義完了
- [ ] Result型・Option型実装完了
- [ ] バリデーション関数実装完了
- [ ] 型安全性テスト100%通過
- [ ] TypeScript厳密モード エラー0件

## 関連情報
- **設計書**: `docs/step3/detailed-design/type-design.md`
- **依存タスク**: TSK-001 (環境変数定義)
- **後続タスク**: TSK-008~014 (他の型定義)
- **TypeScript**: 厳密モード・ブランド型パターン

## 備考
- TypeScript厳密モードでの型安全性最優先
- 実行時型チェックとコンパイル時型チェックの併用
- 将来的な型拡張を考慮した設計 