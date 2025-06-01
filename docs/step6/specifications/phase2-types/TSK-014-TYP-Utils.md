# TSK-014-TYP-Utils Issue仕様書

## 概要
**タスクID**: TSK-014-TYP-Utils  
**ファイル**: src/types/utils.ts  
**複雑度**: 低  
**見積時間**: 2時間  
**優先度**: 🥈高（ユーティリティ型・ヘルパー・共通型）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/utils.ts`
- **型定義**: ユーティリティ型・ヘルパー型・TypeScript高度型操作
- **レイヤー**: Types（型定義層）
- **責任範囲**: 型変換・型操作・条件型・マッピング型・ヘルパー

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core
- 参照設計書: `docs/step3/detailed-design/utils-types.md`
- 技術スタック: TypeScript Advanced Types, Utility Types

### ユーティリティ型システム設計

#### 1. Basic Utility Types
```typescript
// Strict type guards
export type StrictExtract<T, U> = T extends U ? T : never;
export type StrictExclude<T, U> = T extends U ? never : T;

// Enhanced Partial types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends (infer U)[]
    ? DeepPartial<U>[]
    : T[P] extends readonly (infer U)[]
    ? readonly DeepPartial<U>[]
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

// Enhanced Pick/Omit
export type DeepPick<T, K extends NestedKeys<T>> = {
  [P in K]: P extends keyof T
    ? T[P]
    : P extends `${infer K1}.${infer K2}`
    ? K1 extends keyof T
      ? T[K1] extends object
        ? DeepPick<T[K1], K2 extends NestedKeys<T[K1]> ? K2 : never>
        : never
      : never
    : never;
};

export type NestedKeys<T> = {
  [K in keyof T & (string | number)]: T[K] extends object
    ? `${K}` | `${K}.${NestedKeys<T[K]>}`
    : `${K}`;
}[keyof T & (string | number)];

// Nullable utilities
export type NonNullable<T> = T extends null | undefined ? never : T;
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Maybe<T> = T | null | undefined;

// Array utilities
export type NonEmptyArray<T> = [T, ...T[]];
export type ReadonlyNonEmptyArray<T> = readonly [T, ...readonly T[]];
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;
export type Tuple<T extends readonly unknown[]> = T;

// Function utilities
export type AsyncFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => Promise<ReturnType<T>>;

export type NoInfer<T> = [T][T extends any ? 0 : never];

export type MutableKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [Q in K]: T[K] },
    { -readonly [Q in K]: T[K] },
    K
  >;
}[keyof T];

export type ImmutableKeys<T> = {
  [K in keyof T]-?: IfEquals<
    { [Q in K]: T[K] },
    { -readonly [Q in K]: T[K] },
    never,
    K
  >;
}[keyof T];

type IfEquals<X, Y, A = X, B = never> = 
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? A : B;
```

#### 2. Object Manipulation Types
```typescript
// Deep readonly/mutable
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends (infer U)[]
    ? readonly DeepReadonly<U>[]
    : T[P] extends object
    ? DeepReadonly<T[P]>
    : T[P];
};

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends readonly (infer U)[]
    ? DeepMutable<U>[]
    : T[P] extends object
    ? DeepMutable<T[P]>
    : T[P];
};

// Object merging
export type Merge<T, U> = Omit<T, keyof U> & U;
export type MergeAll<T extends readonly object[]> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends object
    ? R extends readonly object[]
      ? Merge<F, MergeAll<R>>
      : F
    : never
  : {};

// Object transformation
export type Flatten<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: O[K] }
    : never
  : T;

export type StrictOmit<T, K extends keyof T> = Omit<T, K>;
export type StrictPick<T, K extends keyof T> = Pick<T, K>;

// Key manipulation
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

// Value manipulation
export type ValuesOf<T> = T[keyof T];
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

export type UnionToTuple<T> = UnionToIntersection<
  T extends any ? (t: T) => T : never
> extends (_: any) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

// Type predicates
export type IsEqual<T, U> = [T] extends [U] ? ([U] extends [T] ? true : false) : false;
export type IsNever<T> = [T] extends [never] ? true : false;
export type IsUnknown<T> = IsEqual<T, unknown>;
export type IsAny<T> = 0 extends 1 & T ? true : false;
```

#### 3. Conditional & Template Types
```typescript
// Conditional utilities
export type If<C extends boolean, T, F> = C extends true ? T : F;
export type Not<T extends boolean> = T extends true ? false : true;
export type And<A extends boolean, B extends boolean> = A extends true
  ? B extends true
    ? true
    : false
  : false;
export type Or<A extends boolean, B extends boolean> = A extends true
  ? true
  : B extends true
  ? true
  : false;

// String manipulation
export type Uppercase<S extends string> = Intrinsic.Uppercase<S>;
export type Lowercase<S extends string> = Intrinsic.Lowercase<S>;
export type Capitalize<S extends string> = Intrinsic.Capitalize<S>;
export type Uncapitalize<S extends string> = Intrinsic.Uncapitalize<S>;

export type Split<S extends string, D extends string> = string extends S
  ? string[]
  : S extends ''
  ? []
  : S extends `${infer T}${D}${infer U}`
  ? [T, ...Split<U, D>]
  : [S];

export type Join<T extends readonly string[], D extends string> = T extends readonly [
  infer F,
  ...infer R
]
  ? F extends string
    ? R extends readonly string[]
      ? R['length'] extends 0
        ? F
        : `${F}${D}${Join<R, D>}`
      : F
    : never
  : '';

export type TrimLeft<S extends string> = S extends ` ${infer R}` ? TrimLeft<R> : S;
export type TrimRight<S extends string> = S extends `${infer L} ` ? TrimRight<L> : S;
export type Trim<S extends string> = TrimLeft<TrimRight<S>>;

export type Replace<
  S extends string,
  From extends string,
  To extends string
> = From extends ''
  ? S
  : S extends `${infer L}${From}${infer R}`
  ? `${L}${To}${Replace<R, From, To>}`
  : S;

export type PascalCase<S extends string> = Capitalize<CamelCase<S>>;
export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>;

export type KebabCase<S extends string> = S extends `${infer C}${infer T}`
  ? C extends Uppercase<C>
    ? `-${Lowercase<C>}${KebabCase<T>}`
    : `${C}${KebabCase<T>}`
  : S;

export type SnakeCase<S extends string> = S extends `${infer C}${infer T}`
  ? C extends Uppercase<C>
    ? `_${Lowercase<C>}${SnakeCase<T>}`
    : `${C}${SnakeCase<T>}`
  : S;

namespace Intrinsic {
  export type Uppercase<S extends string> = string;
  export type Lowercase<S extends string> = string;
  export type Capitalize<S extends string> = string;
  export type Uncapitalize<S extends string> = string;
}
```

#### 4. Number & Math Types
```typescript
// Number utilities
export type IsPositive<N extends number> = `${N}` extends `-${string}` ? false : true;
export type IsNegative<N extends number> = `${N}` extends `-${string}` ? true : false;
export type IsInteger<N extends number> = `${N}` extends `${bigint}` ? true : false;

export type Add<A extends number, B extends number> = 
  [...Tuple<A>, ...Tuple<B>]['length'] extends number 
    ? [...Tuple<A>, ...Tuple<B>]['length'] 
    : never;

export type Subtract<A extends number, B extends number> = 
  Tuple<A> extends [...infer Rest, ...Tuple<B>] 
    ? Rest['length'] 
    : never;

export type Multiply<A extends number, B extends number> =
  B extends 0
    ? 0
    : A extends 0
    ? 0
    : MultiplyHelper<A, B, 0>;

type MultiplyHelper<A extends number, B extends number, Acc extends number> =
  B extends 0
    ? Acc
    : MultiplyHelper<A, Subtract<B, 1>, Add<Acc, A>>;

export type Max<A extends number, B extends number> = 
  A extends B 
    ? A 
    : IsPositive<Subtract<A, B>> extends true 
    ? A 
    : B;

export type Min<A extends number, B extends number> = 
  A extends B 
    ? A 
    : IsPositive<Subtract<A, B>> extends true 
    ? B 
    : A;

// Range and sequence types
export type Range<N extends number> = RangeHelper<N, []>;
type RangeHelper<N extends number, Acc extends unknown[]> = 
  Acc['length'] extends N 
    ? Acc['length'] 
    : RangeHelper<N, [...Acc, Acc['length']]>;

export type Sequence<From extends number, To extends number> = 
  From extends To 
    ? From 
    : From | Sequence<Add<From, 1>, To>;
```

#### 5. Data Structure Types
```typescript
// Tree structures
export interface TreeNode<T> {
  value: T;
  children?: TreeNode<T>[];
  parent?: TreeNode<T>;
}

export type FlattenTree<T> = T extends TreeNode<infer U> 
  ? U | (T['children'] extends TreeNode<U>[] 
    ? FlattenTree<T['children'][number]> 
    : never)
  : never;

// Graph structures
export interface GraphNode<T> {
  value: T;
  edges: Set<GraphNode<T>>;
}

export interface DirectedGraph<T> {
  nodes: Map<string, GraphNode<T>>;
  edges: Map<string, Set<string>>;
}

// Set operations
export type Union<A, B> = A | B;
export type Intersection<A, B> = A extends B ? A : never;
export type Difference<A, B> = A extends B ? never : A;
export type SymmetricDifference<A, B> = Difference<A, B> | Difference<B, A>;

// Collection types
export type Head<T extends readonly unknown[]> = T extends readonly [infer H, ...unknown[]] ? H : never;
export type Tail<T extends readonly unknown[]> = T extends readonly [unknown, ...infer Tail] ? Tail : [];
export type Last<T extends readonly unknown[]> = T extends readonly [...unknown[], infer L] ? L : never;
export type Init<T extends readonly unknown[]> = T extends readonly [...infer Init, unknown] ? Init : [];

export type Reverse<T extends readonly unknown[]> = T extends readonly [...infer Rest, infer Last]
  ? [Last, ...Reverse<Rest>]
  : [];

export type Concat<A extends readonly unknown[], B extends readonly unknown[]> = [...A, ...B];

export type Length<T extends readonly unknown[]> = T['length'];

export type IsEmpty<T extends readonly unknown[]> = T extends readonly [] ? true : false;

// Map-like operations
export type MapValues<T, U> = {
  [K in keyof T]: U;
};

export type FilterKeys<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type PickByValue<T, U> = Pick<T, FilterKeys<T, U>>;
export type OmitByValue<T, U> = Omit<T, FilterKeys<T, U>>;
```

#### 6. Validation & Parser Types
```typescript
// Type validation
export type Assert<T extends true> = T;
export type AssertEqual<T, U> = Assert<IsEqual<T, U>>;
export type AssertExtends<T, U> = Assert<T extends U ? true : false>;

// Type parsing and serialization
export type Serializable = 
  | string 
  | number 
  | boolean 
  | null 
  | undefined
  | Serializable[] 
  | { [key: string]: Serializable };

export type SerializableObject = Record<string, Serializable>;

export type JSONValue = 
  | string 
  | number 
  | boolean 
  | null 
  | JSONValue[] 
  | { [key: string]: JSONValue };

export type JSONObject = { [key: string]: JSONValue };
export type JSONArray = JSONValue[];

// Deep serialization
export type DeepSerializable<T> = T extends Function
  ? never
  : T extends Date
  ? string
  : T extends RegExp
  ? string
  : T extends Map<any, any>
  ? never
  : T extends Set<any>
  ? never
  : T extends (infer U)[]
  ? DeepSerializable<U>[]
  : T extends object
  ? {
      [K in keyof T]: DeepSerializable<T[K]>;
    }
  : T;

// URL and Path types
export type PathSegment = string | number;
export type Path = PathSegment[];
export type URLPath = `/${string}`;
export type QueryString = `?${string}`;
export type Fragment = `#${string}`;
export type FullURL = `${string}://${string}`;

// Environment and config types
export type Environment = 'development' | 'testing' | 'staging' | 'production';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS';

// Generic constraint helpers
export type NonUndefined<T> = T extends undefined ? never : T;
export type Defined<T> = Exclude<T, undefined>;
export type NotNull<T> = Exclude<T, null>;
export type NotNullish<T> = Exclude<T, null | undefined>;

// Type guards for runtime
export interface TypeGuard<T> {
  (value: unknown): value is T;
}

export interface AsyncTypeGuard<T> {
  (value: unknown): Promise<value is T>;
}

// Error handling types
export type Try<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E };

export type Catch<T, E = Error> = T | E;

// Promise utilities
export type PromiseValue<T> = T extends Promise<infer U> ? U : T;
export type AwaitedRecursive<T> = T extends Promise<infer U> ? AwaitedRecursive<U> : T;

// Function composition types
export type Compose<F extends Function[], R = never> = F extends [
  (...args: any[]) => infer R1,
  ...infer Rest
]
  ? Rest extends Function[]
    ? R1 extends any[]
      ? Compose<Rest, R1[0]>
      : Compose<Rest, R1>
    : R1
  : R;

// Event system types
export type EventMap = Record<string, any[]>;
export type EventKey<T extends EventMap> = string & keyof T;
export type EventHandler<T extends any[]> = (...args: T) => void;
export type AsyncEventHandler<T extends any[]> = (...args: T) => Promise<void>;

// Resource and cleanup types
export interface Disposable {
  dispose(): void | Promise<void>;
}

export interface AsyncDisposable {
  dispose(): Promise<void>;
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] TypeScript高度型機能・型操作要件理解
  - [ ] ユーティリティ型・ヘルパー型・共通型設計
  - [ ] 型安全性・パフォーマンス・保守性要件
  - [ ] 他の型定義との整合性・依存関係
  - [ ] 型推論・型チェック・コンパイラ最適化
- [ ] 2. コーディング
  - [ ] Basic Utility Types実装
    - [ ] DeepPartial・PartialBy・RequiredBy型
    - [ ] DeepPick・NestedKeys・Nullable型
    - [ ] Array・Function・Object操作型
  - [ ] Object Manipulation Types実装
    - [ ] DeepReadonly・DeepMutable・Merge型
    - [ ] KeysOfType・ValuesOf・UnionToIntersection型
    - [ ] 型変換・型操作・型判定ユーティリティ
  - [ ] Conditional & Template Types実装
    - [ ] If・And・Or・Not条件型
    - [ ] String操作・PascalCase・CamelCase型
    - [ ] 文字列変換・パターンマッチング型
  - [ ] Advanced Utility Types実装
    - [ ] Number・Math・Range・Sequence型
    - [ ] Tree・Graph・Collection操作型
    - [ ] Validation・Parser・Serialization型
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全ユーティリティ型の動作・型推論確認
    - [ ] 型変換・型操作・条件型の正確性
    - [ ] パフォーマンス・コンパイル時間測定
  - [ ] 異常系テスト
    - [ ] 不正型・型制約違反・エッジケース
    - [ ] 循環参照・深いネスト・型爆発
    - [ ] コンパイラ限界・メモリ使用量
  - [ ] 型安全性テスト
    - [ ] 型推論・型ガード・型アサーション
    - [ ] 実行時型チェック・バリデーション
    - [ ] 型互換性・代入可能性確認
  - [ ] 統合テスト
    - [ ] 他型定義との統合・依存関係
    - [ ] 実際のアプリケーション利用
- [ ] 4. 単体テスト実行
  - [ ] 全ユーティリティ型テスト
  - [ ] カバレッジ90%以上達成確認
  - [ ] 型安全性・推論精度確認
  - [ ] コンパイル時間・パフォーマンス確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#014): ユーティリティ型システム実装
  - [ ] 型操作・ヘルパー・共通型ライブラリ
  - [ ] ドキュメント・使用例・ベストプラクティス
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] 型品質・一貫性・保守性確認
  - [ ] パフォーマンス・コンパイル効率確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] 型システムレビュー・品質確認
  - [ ] チーム共有・ガイドライン整備

## テスト要件
- [ ] 正常系テスト：全ユーティリティ型動作・型推論・変換確認
- [ ] 異常系テスト：不正型・制約違反・エッジケース・型爆発
- [ ] パフォーマンステスト：コンパイル時間・メモリ使用量・型チェック速度
- [ ] 型安全性テスト：型推論精度・型ガード・実行時検証
- [ ] 統合テスト：他型定義統合・アプリケーション利用・開発体験

## 完了条件
- [ ] 全ユーティリティ型・ヘルパー型実装完了
- [ ] 型操作・条件型・テンプレート型実装完了
- [ ] 高度型機能・型変換・型判定実装完了
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] 型安全性テスト・推論精度テスト合格
- [ ] TypeScript厳密モード エラー0件
- [ ] コンパイル性能・開発体験最適化

## 関連情報
- **設計書**: `docs/step3/detailed-design/utils-types.md`
- **依存タスク**: TSK-007 (コア型定義)
- **後続タスク**: 全型定義（ユーティリティ利用）
- **TypeScript**: Advanced Types, Template Literal Types
- **参考**: TypeScript Handbook, Type Challenges

## 備考
- 型安全性・推論精度・開発体験最優先
- TypeScript最新機能・ベストプラクティス活用
- コンパイル性能・保守性・可読性考慮
- チーム開発効率・学習コスト最適化
- 継続的な型システム改善・進化対応 