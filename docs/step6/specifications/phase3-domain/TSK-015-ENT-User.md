# TSK-015-ENT-User Issue仕様書

## 概要
**タスクID**: TSK-015-ENT-User  
**ファイル**: src/entities/User.ts  
**複雑度**: ⭐最高（25メソッド）  
**見積時間**: 5時間  
**優先度**: 🥇最重要（ユーザーエンティティ・ビジネスルール）  
**フェーズ**: Phase 3: ドメイン層実装  

## 実装対象
- **ファイル**: `src/entities/User.ts`
- **クラス**: User（25メソッド）
- **レイヤー**: Domain（ドメイン層）
- **責任範囲**: ユーザー情報管理・認証・バリデーション・ビジネスルール

## 実装仕様

### 前提条件
- 依存タスク: TSK-011 (User関連型), TSK-002 (DBスキーマ)
- 参照設計書: `docs/step3/detailed-design/entities-design.md`

### User 25メソッド仕様

#### 1. コンストラクタ・基本メソッド (5メソッド)
```typescript
class User {
  constructor(
    private readonly id: UserID,
    private name: UserName,
    private email: Email,
    private passwordHash: HashedPassword,
    private role: UserRole = 'user',
    private createdAt: Timestamp = new Date(),
    private updatedAt: Timestamp = new Date()
  ) {
    this.validateUser();
  }

  // 1. getId(): UserID
  getId(): UserID { return this.id; }

  // 2. getName(): UserName  
  getName(): UserName { return this.name; }

  // 3. getEmail(): Email
  getEmail(): Email { return this.email; }

  // 4. getRole(): UserRole
  getRole(): UserRole { return this.role; }

  // 5. getCreatedAt(): Timestamp
  getCreatedAt(): Timestamp { return this.createdAt; }
}
```

#### 2. プロファイル管理メソッド (6メソッド)
```typescript
// 6. updateName(name: UserName): Result<void, UserError>
updateName(name: UserName): Result<void, UserError> {
  if (!this.isValidName(name)) {
    return Err(new UserError('Invalid name format'));
  }
  this.name = name;
  this.updatedAt = new Date();
  return Ok(undefined);
}

// 7. updateEmail(email: Email): Result<void, UserError>
// 8. changePassword(oldPassword: string, newPassword: string): Promise<Result<void, UserError>>
// 9. updateRole(role: UserRole): Result<void, UserError>
// 10. updateProfile(profile: UserProfileUpdate): Result<void, UserError>
// 11. getProfile(): UserProfile
```

#### 3. 認証・セキュリティメソッド (7メソッド)
```typescript
// 12. verifyPassword(password: string): Promise<boolean>
async verifyPassword(password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.passwordHash);
}

// 13. hashPassword(password: string): Promise<HashedPassword>
// 14. generateSessionToken(): SessionToken
// 15. isSessionValid(token: SessionToken): boolean
// 16. lockAccount(): void
// 17. unlockAccount(): void  
// 18. isAccountLocked(): boolean
```

#### 4. バリデーション・ビジネスルール (7メソッド)
```typescript
// 19. validateUser(): Result<void, UserError>
private validateUser(): Result<void, UserError> {
  const nameValidation = this.isValidName(this.name);
  const emailValidation = this.isValidEmail(this.email);
  
  if (!nameValidation || !emailValidation) {
    return Err(new UserError('User validation failed'));
  }
  return Ok(undefined);
}

// 20. isValidName(name: UserName): boolean
// 21. isValidEmail(email: Email): boolean
// 22. isValidRole(role: UserRole): boolean
// 23. canPerformAction(action: UserAction): boolean
// 24. hasPermission(permission: Permission): boolean
// 25. equals(other: User): boolean
```

### 依存関係・ビジネスルール
- **不変条件**: ID不変性・Email一意性・パスワード強度
- **ビジネスルール**: ロール権限・アカウントロック・セッション管理
- **バリデーション**: 入力値検証・形式チェック・セキュリティ制約

## 標準サブタスク（必須・全展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] Userエンティティの責任範囲確認
  - [ ] 25メソッドの仕様理解（CRUD・認証・バリデーション）
  - [ ] ビジネスルールの確認（パスワード・権限・状態管理）
  - [ ] 不変条件・ドメインルールの理解
- [ ] 2. コーディング
  - [ ] Userクラス基本構造実装
  - [ ] 認証関連メソッド実装（login、logout、changePassword）
  - [ ] プロファイル管理メソッド実装（update、validation）
  - [ ] 権限・ロール管理メソッド実装
  - [ ] エラーハンドリング・バリデーション実装
- [ ] 3. テストコーディング
  - [ ] 正常系：ユーザー作成・更新・認証テスト
  - [ ] 異常系：不正データ・認証失敗テスト
  - [ ] 境界値：最大・最小値・null・undefinedテスト
  - [ ] ビジネスルール：パスワード強度・権限チェックテスト
  - [ ] セキュリティ：SQLインジェクション・XSS対策テスト
- [ ] 4. 単体テスト実行
  - [ ] 全25メソッドテスト実行（個別・統合）
  - [ ] カバレッジ90%以上の確認
  - [ ] パフォーマンス要件の確認（認証処理速度）
  - [ ] メモリリーク・リソース管理確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#015): Userエンティティ25メソッド実装
  - [ ] Issue #015の紐付け・詳細コミットメッセージ
  - [ ] 適切な粒度でのコミット（機能単位）
  - [ ] コンフリクトの解決・マージ準備
- [ ] 6. ToDoチェック
  - [ ] 全サブタスクの完了確認
  - [ ] 品質基準の達成確認（カバレッジ・規約・型安全性）
  - [ ] ドキュメントの更新（README・API仕様）
  - [ ] 次タスク（TaskEntity）への影響確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件の全項目達成
  - [ ] レビュー結果の反映・承認確認
  - [ ] 関連ドキュメントの更新
  - [ ] ステークホルダーへの報告・進捗共有

## テスト要件
- [ ] 正常系テスト：ユーザー作成・プロファイル更新・認証成功
- [ ] 異常系テスト：不正データ・認証失敗・権限不足
- [ ] 境界値テスト：文字列長制限・特殊文字・null値
- [ ] セキュリティテスト：パスワード強度・権限チェック・セッション管理
- [ ] 統合テスト：他エンティティとの連携・データ整合性

## 完了条件
- [ ] 全25メソッド実装・動作確認完了
- [ ] 単体テスト90%以上カバレッジ達成
- [ ] TypeScript厳密モード エラー0件
- [ ] ESLintエラー0件
- [ ] ビジネスルール・不変条件の実装確認
- [ ] セキュリティ要件達成

## 関連情報
- **設計書**: `docs/step3/detailed-design/entities-design.md`
- **依存タスク**: TSK-011 (User型), TSK-002 (DBスキーマ)
- **後続タスク**: TSK-017 (UserRepository)
- **ビジネスルール**: ユーザー管理・認証・権限管理

## 備考
- DDD（ドメイン駆動設計）原則準拠
- 不変条件の厳密な実装
- セキュリティを最優先とした設計
- 将来的な拡張（2FA・OAuth等）を考慮 