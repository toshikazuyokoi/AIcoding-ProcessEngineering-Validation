# TSK-022-SVC-UserService Issue仕様書

## 概要
**タスクID**: TSK-022-SVC-UserService  
**ファイル**: src/services/UserService.ts  
**複雑度**: ⭐⭐最高（認証・セキュリティ・9メソッド）  
**見積時間**: 8時間  
**優先度**: 🚨高リスク（JWT・認証・セキュリティ複雑性）  
**フェーズ**: Phase 6: アプリケーション層実装  

## 実装対象
- **ファイル**: `src/services/UserService.ts`
- **クラス/関数**: UserService（9メソッド）
- **レイヤー**: Application（アプリケーション層）
- **責任範囲**: ユーザー管理・認証・セッション管理・セキュリティ

## 実装仕様

### 前提条件
- 依存タスク: TSK-017 (UserRepository), TSK-020 (認証MW)
- 参照設計書: `docs/step3/detailed-design/services-design.md`

### UserService 9メソッド仕様

#### 1. register(userData: UserCreateRequest): Promise<UserResponse>
**機能**: 新規ユーザー登録・パスワードハッシュ化
```typescript
// 入力バリデーション → パスワードハッシュ化 → DB保存 → JWT生成
async register(userData: UserCreateRequest): Promise<UserResponse> {
  // 1. 入力データバリデーション
  // 2. メールアドレス重複チェック
  // 3. パスワード強度チェック
  // 4. bcryptハッシュ化（salt rounds: 12）
  // 5. UserRepository.create() 呼び出し
  // 6. JWT生成・返却
}
```

#### 2. login(credentials: LoginRequest): Promise<AuthResponse>
**機能**: ユーザー認証・JWTトークン発行
```typescript
async login(credentials: LoginRequest): Promise<AuthResponse> {
  // 1. メールアドレスでユーザー検索
  // 2. パスワード検証（bcrypt.compare）
  // 3. ログイン試行回数チェック（ブルートフォース対策）
  // 4. JWT生成（user.id, email, role含む）
  // 5. リフレッシュトークン生成・保存
  // 6. 最終ログイン時刻更新
}
```

#### 3. logout(userId: UserID): Promise<void>
**機能**: ログアウト・セッション無効化
```typescript
async logout(userId: UserID): Promise<void> {
  // 1. リフレッシュトークン無効化
  // 2. アクティブセッション削除
  // 3. ログアウト時刻記録
}
```

#### 4. refreshToken(refreshToken: string): Promise<AuthResponse>
**機能**: トークンリフレッシュ・自動再認証
```typescript
async refreshToken(refreshToken: string): Promise<AuthResponse> {
  // 1. リフレッシュトークン検証
  // 2. トークン有効期限チェック
  // 3. 新しいアクセストークン生成
  // 4. 新しいリフレッシュトークン生成（ローテーション）
}
```

#### 5. getProfile(userId: UserID): Promise<UserResponse>
**機能**: ユーザープロファイル取得
```typescript
async getProfile(userId: UserID): Promise<UserResponse> {
  // 1. UserRepository.findById() 呼び出し
  // 2. パスワード等機密情報除外
  // 3. UserResponse型変換
}
```

#### 6. updateProfile(userId: UserID, updateData: UserUpdateRequest): Promise<UserResponse>
**機能**: プロファイル更新・バリデーション
```typescript
async updateProfile(userId: UserID, updateData: UserUpdateRequest): Promise<UserResponse> {
  // 1. 更新権限チェック（本人 or 管理者）
  // 2. 入力データバリデーション
  // 3. メールアドレス変更時の重複チェック
  // 4. UserRepository.update() 呼び出し
  // 5. 更新履歴記録
}
```

#### 7. changePassword(userId: UserID, passwordData: ChangePasswordRequest): Promise<void>
**機能**: パスワード変更・セキュリティ強化
```typescript
async changePassword(userId: UserID, passwordData: ChangePasswordRequest): Promise<void> {
  // 1. 現在パスワード検証
  // 2. 新パスワード強度チェック
  // 3. パスワード履歴チェック（過去3回分）
  // 4. bcryptハッシュ化
  // 5. DB更新・セッション無効化
  // 6. パスワード変更通知
}
```

#### 8. findUsers(searchCriteria: UserSearchRequest): Promise<UserListResponse>
**機能**: ユーザー検索・フィルタリング（管理者機能）
```typescript
async findUsers(searchCriteria: UserSearchRequest): Promise<UserListResponse> {
  // 1. 管理者権限チェック
  // 2. 検索条件バリデーション
  // 3. UserRepository.findByConditions() 呼び出し
  // 4. ページネーション処理
  // 5. 機密情報除外・レスポンス整形
}
```

#### 9. deleteUser(adminId: UserID, targetUserId: UserID): Promise<void>
**機能**: ユーザー削除・関連データクリーンアップ
```typescript
async deleteUser(adminId: UserID, targetUserId: UserID): Promise<void> {
  // 1. 管理者権限チェック
  // 2. 自分自身削除防止チェック
  // 3. トランザクション開始
  // 4. 関連タスクデータの処理（移管 or 削除）
  // 5. UserRepository.delete() 呼び出し
  // 6. セッション・トークン無効化
  // 7. トランザクションコミット
}
```

### 依存関係・セキュリティ
- **参照するクラス**: UserRepository, AuthMiddleware, bcrypt, jsonwebtoken
- **提供するインターフェース**: UserService型（DI用）
- **データベース**: users, refresh_tokens, user_sessions
- **セキュリティ**: JWT管理、パスワードハッシュ化、ブルートフォース対策

## 標準サブタスク（必須・全展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] 認証フロー全体の理解
  - [ ] セキュリティ要件の確認
  - [ ] JWT・bcrypt仕様の理解
  - [ ] エラーハンドリング戦略の確認
- [ ] 2. コーディング
  - [ ] UserServiceクラス基本構造実装
  - [ ] 認証関連メソッド実装（register, login, logout, refreshToken）
  - [ ] プロファイル管理実装（getProfile, updateProfile, changePassword）
  - [ ] 管理機能実装（findUsers, deleteUser）
  - [ ] セキュリティ・バリデーション・エラーハンドリング実装
- [ ] 3. テストコーディング
  - [ ] 正常系：認証フロー・プロファイル管理・ユーザー管理テスト
  - [ ] 異常系：認証失敗・不正アクセス・データ不整合テスト
  - [ ] 境界値：同時ログイン・セッション管理・パフォーマンステスト
  - [ ] セキュリティ：SQLインジェクション・XSS・CSRF対策テスト
  - [ ] 統合テスト：Repository・Middleware連携テスト
- [ ] 4. 単体テスト実行
  - [ ] 全9メソッドテスト実行（個別・統合・E2E）
  - [ ] カバレッジ90%以上の確認
  - [ ] パフォーマンステスト（認証処理・レスポンス時間）
  - [ ] セキュリティテスト（脆弱性・ペネトレーション）
- [ ] 5. リポジトリコミット
  - [ ] feat(#022): UserService認証・9メソッド実装
  - [ ] Issue #022の紐付け・詳細コミットメッセージ
  - [ ] セキュリティレビュー・コード監査済み
- [ ] 6. ToDoチェック
  - [ ] 全サブタスクの完了確認
  - [ ] セキュリティ基準の達成確認
  - [ ] 認証フロー・パフォーマンス確認
  - [ ] ドキュメント更新（認証API・セキュリティ要件）
- [ ] 7. Issueクローズ
  - [ ] セキュリティレビュー完了・承認確認
  - [ ] 関連ドキュメント・API仕様更新
  - [ ] セキュリティ監査・ペネトレーションテスト完了

## テスト要件（セキュリティ重点）
- [ ] **認証フローテスト**: 正常系ログイン・登録・ログアウト
- [ ] **セキュリティテスト**: 
  - [ ] SQLインジェクション対策確認
  - [ ] XSS（クロスサイトスクリプティング）対策確認
  - [ ] CSRF（クロスサイトリクエストフォージェリ）対策確認
  - [ ] ブルートフォース攻撃対策確認
  - [ ] JWT改ざん検知確認
- [ ] **境界値テスト**: 最大ログイン試行回数・トークン有効期限
- [ ] **統合テスト**: Repository・Middleware・Controller連携
- [ ] **E2Eテスト**: 認証API全体フロー

## セキュリティ要件（最重要）
- [ ] **パスワードセキュリティ**:
  - [ ] bcrypt（salt rounds: 12以上）
  - [ ] パスワード強度要件（8文字以上・英数記号混在）
  - [ ] パスワード履歴管理（過去3回分重複禁止）
- [ ] **JWT管理**:
  - [ ] アクセストークン（短期：15分）
  - [ ] リフレッシュトークン（長期：7日・ローテーション）
  - [ ] トークン署名検証・改ざん検知
- [ ] **ブルートフォース対策**:
  - [ ] ログイン試行回数制限（5回/10分）
  - [ ] アカウントロック・自動解除
  - [ ] 異常アクセス検知・通知
- [ ] **セッション管理**:
  - [ ] 同時ログイン制限
  - [ ] セッション有効期限管理
  - [ ] ログアウト時完全クリア

## 完了条件
- [ ] **機能完了**: 全9メソッド実装・動作確認
- [ ] **品質達成**: 
  - [ ] 単体テスト90%以上カバレッジ
  - [ ] TypeScript厳密モード エラー0件
  - [ ] ESLintエラー0件
- [ ] **セキュリティ達成**:
  - [ ] 全セキュリティテスト通過
  - [ ] 脆弱性スキャン0件
  - [ ] セキュリティ監査承認
- [ ] **統合達成**:
  - [ ] Repository統合テスト成功
  - [ ] Middleware連携テスト成功
  - [ ] E2E認証フローテスト成功

## リスク管理・対策
| リスク要因 | 影響度 | 対策 |
|------------|--------|------|
| **JWT実装複雑性** | 高 | 実証済みライブラリ使用・サンプル実装先行 |
| **認証フロー設計** | 高 | 認証フロー図作成・段階的実装 |
| **セキュリティ要件** | 最高 | セキュリティ専門家レビュー・ペネトレーションテスト |
| **パフォーマンス** | 中 | 認証処理最適化・キャッシュ戦略 |

## 関連情報
- **設計書**: `docs/step3/detailed-design/services-design.md`
- **依存タスク**: TSK-017 (UserRepository), TSK-020 (認証MW)
- **後続タスク**: TSK-024 (AppController)・認証API連携
- **セキュリティ仕様**: `docs/step3/security-requirements.md`

## 備考
- **最高リスク**: セキュリティ実装の複雑性・認証フロー設計
- **重要性**: 全システムのセキュリティ基盤
- **品質要件**: セキュリティ監査・ペネトレーションテスト必須
- **技術選択**: 実証済みライブラリ使用・セキュリティベストプラクティス準拠 