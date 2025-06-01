# TSK-020-MW-Auth Issue仕様書

## 概要
**タスクID**: TSK-020-MW-Auth  
**ファイル**: src/middleware/auth.ts  
**複雑度**: ⭐最高（セキュリティ・JWT・認証）  
**見積時間**: 6時間  
**優先度**: 🥇最重要（認証セキュリティ・リスク要素）  
**フェーズ**: Phase 5: ミドルウェア実装  

## 実装対象
- **ファイル**: `src/middleware/auth.ts`
- **ミドルウェア**: JWT認証・権限チェック・セッション管理
- **レイヤー**: Middleware（認証・セキュリティ）
- **責任範囲**: トークン検証・権限確認・セキュリティ制御

## 実装仕様

### 前提条件
- 依存タスク: TSK-015 (Userエンティティ), TSK-007 (コア型)
- 参照設計書: `docs/step3/detailed-design/auth-middleware.md`

### 認証ミドルウェア機能

#### 1. JWT認証ミドルウェア
```typescript
export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req);
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = await verifyJWT(token);
    const user = await getUserById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token verification failed' });
  }
};
```

#### 2. 権限チェックミドルウェア
```typescript
export const authorize = (requiredPermissions: Permission[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const hasPermission = requiredPermissions.every(permission => 
      req.user.hasPermission(permission)
    );

    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
};
```

#### 3. レート制限・ブルートフォース対策
```typescript
const loginAttempts = new Map<string, { count: number; lastAttempt: Date }>();

export const rateLimitAuth = (maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const clientIP = req.ip;
    const now = new Date();
    const userAttempts = loginAttempts.get(clientIP);

    if (userAttempts && userAttempts.count >= maxAttempts) {
      const timeSinceLastAttempt = now.getTime() - userAttempts.lastAttempt.getTime();
      if (timeSinceLastAttempt < windowMs) {
        return res.status(429).json({ 
          error: 'Too many login attempts. Please try again later.' 
        });
      }
    }

    next();
  };
};
```

#### 4. セッション管理
```typescript
export const validateSession = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.user) {
    return res.status(401).json({ error: 'No user session' });
  }

  const sessionValid = await isSessionValid(req.user.getId(), req.sessionId);
  if (!sessionValid) {
    return res.status(401).json({ error: 'Session expired' });
  }

  next();
};
```

#### 5. CORS・セキュリティヘッダー
```typescript
export const securityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
};
```

### セキュリティ要件
- **JWT署名**: RS256アルゴリズム・秘密鍵管理
- **トークン期限**: アクセストークン15分・リフレッシュトークン7日
- **ブルートフォース対策**: IP制限・遅延・アカウントロック
- **HTTPS強制**: 本番環境での暗号化通信
- **ヘッダーセキュリティ**: XSS・CSRF・クリックジャッキング対策

## 標準サブタスク（必須・セキュリティ重視）
- [ ] 1. 仕様確認・設計理解
  - [ ] JWT認証フロー・セキュリティ要件確認
  - [ ] 権限管理・RBAC（Role-Based Access Control）理解
  - [ ] ブルートフォース対策・レート制限設計
  - [ ] セッション管理・トークンライフサイクル
- [ ] 2. コーディング
  - [ ] JWT認証ミドルウェア実装
  - [ ] 権限チェック・RBAC実装
  - [ ] レート制限・IP制限実装
  - [ ] セキュリティヘッダー・CORS実装
  - [ ] エラーハンドリング・ログ出力実装
- [ ] 3. テストコーディング
  - [ ] 正常系：有効トークン・適切権限での認証テスト
  - [ ] 異常系：無効トークン・権限不足・期限切れテスト
  - [ ] セキュリティ：ブルートフォース・不正アクセステスト
  - [ ] 境界値：レート制限上限・トークン期限境界テスト
- [ ] 4. 単体テスト実行
  - [ ] 認証テスト：全認証パターンの網羅的テスト
  - [ ] セキュリティテスト：脆弱性検査・ペネトレーションテスト
  - [ ] パフォーマンステスト：認証処理の性能測定
- [ ] 5. リポジトリコミット
- [ ] 6. ToDoチェック
- [ ] 7. Issueクローズ

## テスト要件
- [ ] 正常系テスト：JWT認証成功・権限チェック通過
- [ ] 異常系テスト：不正トークン・権限不足・期限切れ
- [ ] セキュリティテスト：ブルートフォース・XSS・CSRF対策
- [ ] 負荷テスト：大量リクエスト・認証処理性能
- [ ] 境界値テスト：レート制限・トークン期限

## 完了条件
- [ ] JWT認証ミドルウェア実装完了
- [ ] 権限管理・RBAC実装完了
- [ ] レート制限・ブルートフォース対策実装完了
- [ ] セキュリティテスト100%通過
- [ ] 脆弱性スキャン：Critical 0件・High 0件

## 関連情報
- **設計書**: `docs/step3/detailed-design/auth-middleware.md`
- **依存タスク**: TSK-015 (Userエンティティ)
- **後続タスク**: TSK-024 (Controllerでの認証適用)
- **セキュリティ**: JWT・RBAC・OWASP対策

## 備考
- OWASP Top 10対策の実装
- 本番環境でのセキュリティ監査準備
- 定期的な脆弱性スキャン・更新対応
- セキュリティインシデント対応手順の整備 