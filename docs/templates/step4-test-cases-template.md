# テストケース定義書

## メタデータ
| 項目 | 内容 |
|------|------|
| ドキュメントID | [STEP4-CASE-001] |
| バージョン | [v1.0] |
| 作成日 | [YYYY-MM-DD] |
| 最終更新日 | [YYYY-MM-DD] |
| ステータス | [ドラフト/レビュー中/承認済み/非推奨] |
| 作成者 | [作成者名] |
| 承認者 | [承認者名（ステータスが承認済みの場合）] |
| タグ | #step4-test-design #test-cases #quality-assurance |
| 関連文書 | [[TARGET-001](./step4-test-targets-template.md)] [[STRATEGY-001](./step4-test-strategy-template.md)] |
| 変更履歴 | [v1.0] YYYY-MM-DD: 初版作成<br>[v1.1] YYYY-MM-DD: E2Eテストケース追加（TC-201〜TC-205） |

## 1. 単体テストケース

### TC-001: QueryController.handleQuery - 正常系

#### 基本情報
| 項目 | 内容 |
|------|------|
| テストケースID | TC-001 |
| 対象メソッド | QueryController.handleQuery |
| テスト観点 | 正常系 - 有効なクエリ |
| 優先度 | 高 |

#### テスト条件
| 項目 | 内容 |
|------|------|
| 事前条件 | システムが正常に起動している |
| 入力データ | { query: "Hello, world!" } |
| 期待結果 | 正常なレスポンスが返却される |
| 事後条件 | ログが正常に出力される |

#### テスト手順
1. テスト用のRequestオブジェクトを作成
2. handleQueryメソッドを呼び出し
3. 戻り値を検証
4. ログ出力を確認

#### 実装例
```typescript
describe('QueryController.handleQuery', () => {
  it('should return valid response for valid query', async () => {
    // Arrange
    const mockRequest = {
      body: { query: 'Hello, world!' }
    };
    const expectedResponse = {
      status: 200,
      data: 'Processed: Hello, world!'
    };

    // Act
    const result = await controller.handleQuery(mockRequest);

    // Assert
    expect(result).toEqual(expectedResponse);
    expect(mockLogger.info).toHaveBeenCalledWith(
      'Query processed: Hello, world!'
    );
  });
});
```

### TC-002: QueryController.handleQuery - 異常系

#### 基本情報
| 項目 | 内容 |
|------|------|
| テストケースID | TC-002 |
| 対象メソッド | QueryController.handleQuery |
| テスト観点 | 異常系 - 無効なクエリ |
| 優先度 | 高 |

#### テスト条件
| 項目 | 内容 |
|------|------|
| 事前条件 | システムが正常に起動している |
| 入力データ | { query: "" } |
| 期待結果 | ValidationErrorが発生する |
| 事後条件 | エラーログが出力される |

#### 実装例
```typescript
it('should throw ValidationError for empty query', async () => {
  // Arrange
  const mockRequest = {
    body: { query: '' }
  };

  // Act & Assert
  await expect(controller.handleQuery(mockRequest))
    .rejects.toThrow(ValidationError);
  
  expect(mockLogger.error).toHaveBeenCalledWith(
    expect.stringContaining('Query processing failed')
  );
});
```

## 2. 結合テストケース

### TC-101: Query API - 正常系

#### 基本情報
| 項目 | 内容 |
|------|------|
| テストケースID | TC-101 |
| 対象API | POST /api/query |
| テスト観点 | 正常系 - エンドツーエンド |
| 優先度 | 高 |

#### テスト条件
| 項目 | 内容 |
|------|------|
| 事前条件 | APIサーバーが起動している |
| リクエスト | POST /api/query<br>{ "query": "test query" } |
| 期待結果 | 200 OK<br>正常なレスポンス |
| 事後条件 | データベースに記録される |

#### 実装例
```typescript
describe('POST /api/query', () => {
  it('should process query successfully', async () => {
    // Arrange
    const queryData = { query: 'test query' };

    // Act
    const response = await request(app)
      .post('/api/query')
      .send(queryData)
      .expect(200);

    // Assert
    expect(response.body).toMatchObject({
      status: 'success',
      data: expect.any(String)
    });
  });
});
```

## 3. E2Eテストケース

### TC-201: ユーザークエリ処理フロー

#### 基本情報
| 項目 | 内容 |
|------|------|
| テストケースID | TC-201 |
| シナリオ | ユーザーがクエリを入力して結果を取得 |
| テスト観点 | エンドユーザー体験 |
| 優先度 | 高 |

#### テスト手順
1. ブラウザでアプリケーションにアクセス
2. クエリ入力フィールドにテキストを入力
3. 送信ボタンをクリック
4. 結果が表示されることを確認
5. 履歴に記録されることを確認

#### 実装例（Playwright）
```typescript
test('user can submit query and get response', async ({ page }) => {
  // Navigate to application
  await page.goto('/');

  // Input query
  await page.fill('[data-testid=query-input]', 'test query');
  
  // Submit query
  await page.click('[data-testid=submit-button]');
  
  // Verify response
  await expect(page.locator('[data-testid=response]')).toBeVisible();
  await expect(page.locator('[data-testid=response]')).toContainText('test query');
  
  // Verify history
  await expect(page.locator('[data-testid=history]')).toContainText('test query');
});
```

## 4. 完了確認
- [ ] 単体テストケースが網羅的に定義されている
- [ ] 結合テストケースが重要パスを網羅している
- [ ] E2Eテストケースがユーザーシナリオを網羅している
- [ ] 実装例が具体的に記述されている
- [ ] 期待結果が明確に定義されている
