# TSK-024-CTL-AppController Issue仕様書

## 概要
**タスクID**: TSK-024-CTL-AppController  
**ファイル**: src/controllers/AppController.ts  
**複雑度**: ⭐最高（20エンドポイント）  
**見積時間**: 6時間  
**優先度**: 🥇最重要（REST API・エンドポイント）  
**フェーズ**: Phase 7: プレゼンテーション層実装  

## 実装対象
- **ファイル**: `src/controllers/AppController.ts`
- **クラス**: AppController（20 REST APIエンドポイント）
- **レイヤー**: Presentation（プレゼンテーション層）
- **責任範囲**: HTTP要求/応答・認証・バリデーション・エラーハンドリング

## 実装仕様

### 前提条件
- 依存タスク: TSK-022 (UserService), TSK-023 (TaskService), TSK-020 (認証ミドルウェア)
- 参照設計書: `docs/step3/detailed-design/api-design.md`

### REST API エンドポイント (20個)

#### 1. 認証エンドポイント (4個)
```typescript
@Controller('/api/auth')
export class AppController {
  // POST /api/auth/register - ユーザー登録
  @Post('/register')
  async register(@Body() request: UserRegisterRequest): Promise<AuthResponse> {
    const result = await this.userService.registerUser(request);
    if (!result.success) {
      throw new BadRequestException(result.error.message);
    }
    return { user: result.data.user, token: result.data.token };
  }

  // POST /api/auth/login - ログイン
  // POST /api/auth/refresh - トークンリフレッシュ  
  // POST /api/auth/logout - ログアウト
}
```

#### 2. ユーザー管理エンドポイント (4個)
```typescript
// GET /api/users/profile - プロファイル取得
// PUT /api/users/profile - プロファイル更新
// PUT /api/users/password - パスワード変更
// DELETE /api/users/account - アカウント削除
```

#### 3. タスク管理エンドポイント (12個)
```typescript
@Controller('/api/tasks')
export class TaskController {
  // GET /api/tasks - タスク一覧取得
  @Get('/')
  @UseMiddleware(authenticateJWT)
  async getTasks(@Query() query: TaskSearchQuery, @Req() req: AuthenticatedRequest): Promise<TaskListResponse> {
    const filter = this.buildTaskFilter(query);
    const result = await this.taskService.searchTasks(req.user.getId(), filter);
    if (!result.success) {
      throw new InternalServerErrorException(result.error.message);
    }
    return { tasks: result.data.data, pagination: result.data.pagination };
  }

  // POST /api/tasks - タスク作成
  // GET /api/tasks/:id - タスク詳細取得
  // PUT /api/tasks/:id - タスク更新
  // DELETE /api/tasks/:id - タスク削除
  // PUT /api/tasks/:id/complete - タスク完了
  // PUT /api/tasks/:id/status - ステータス変更
  // GET /api/tasks/statistics - 統計情報
  // POST /api/tasks/bulk - 一括操作
  // GET /api/tasks/search - 高度な検索
  // PUT /api/tasks/bulk-update - 一括更新
  // POST /api/tasks/archive - アーカイブ
}
```

### エラーハンドリング・バリデーション
- **入力検証**: Joi/class-validator使用・型安全な検証
- **エラー形式**: 統一されたエラーレスポンス形式
- **HTTPステータス**: 適切なステータスコード返却
- **ログ出力**: アクセスログ・エラーログ・監査ログ

## 標準サブタスク（必須）
- [ ] 1. 仕様確認・設計理解
  - [ ] 20 REST APIエンドポイント仕様確認
  - [ ] 認証・認可の適用パターン理解
  - [ ] リクエスト/レスポンス形式・バリデーション要件
- [ ] 2. コーディング
  - [ ] AppController基本構造実装
  - [ ] 認証エンドポイント（register、login、refresh、logout）実装
  - [ ] ユーザー管理エンドポイント実装
  - [ ] タスク管理エンドポイント実装
  - [ ] エラーハンドリング・レスポンス形式統一
- [ ] 3. テストコーディング
  - [ ] 正常系：全エンドポイントのリクエスト/レスポンステスト
  - [ ] 異常系：認証エラー・バリデーションエラーテスト
  - [ ] セキュリティ：認可チェック・不正アクセステスト
- [ ] 4. 単体テスト実行
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：全20エンドポイントの正常動作確認
- [ ] 異常系テスト：認証失敗・バリデーションエラー・サーバーエラー
- [ ] セキュリティテスト：認可チェック・CSRF・XSS対策
- [ ] 統合テスト：Service層との連携・データベースとの整合性
- [ ] 負荷テスト：大量リクエスト処理・レスポンス時間

## 完了条件
- [ ] 全20エンドポイント実装・動作確認完了
- [ ] 認証・認可ミドルウェア適用完了
- [ ] 入力バリデーション・エラーハンドリング実装完了
- [ ] 統合テスト成功・API仕様書更新完了
- [ ] セキュリティテスト100%通過

## 関連情報
- **設計書**: `docs/step3/detailed-design/api-design.md`
- **依存タスク**: TSK-022, TSK-023 (Services), TSK-020 (認証)
- **後続タスク**: TSK-025 (Mainアプリケーション)
- **API仕様**: OpenAPI 3.0・Swagger documentation

## 備考
- RESTful API設計原則準拠
- 適切なHTTPステータスコード・ヘッダー管理
- API versioning対応・後方互換性考慮
- 本番環境でのパフォーマンス・セキュリティ対策 