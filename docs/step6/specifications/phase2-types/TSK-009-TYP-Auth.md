# TSK-009-TYP-Auth Issue仕様書

## 概要
**タスクID**: TSK-009-TYP-Auth  
**ファイル**: src/types/auth.ts  
**複雑度**: 高  
**見積時間**: 4時間  
**優先度**: 🥇最重要（認証・セキュリティ基盤型）  
**フェーズ**: Phase 2: 型定義基盤構築  

## 実装対象
- **ファイル**: `src/types/auth.ts`
- **型定義**: JWT・Session・Permission・Role・Auth関連型
- **レイヤー**: Types（型定義層）
- **責任範囲**: 認証情報・権限管理・セッション・トークン型定義

## 実装仕様

### 前提条件
- 依存タスク: TSK-007-TYP-Core, TSK-008-TYP-Error
- 参照設計書: `docs/step3/detailed-design/auth-types.md`
- 技術スタック: JWT, TypeScript, RBAC (Role-Based Access Control)

### 認証・認可型システム設計

#### 1. Core Authentication Types
```typescript
import { Brand, UserID, Timestamp } from './core.js';
import { ErrorCode, ErrorMessage } from './error.js';

export type JWTToken = Brand<string, 'JWTToken'>;
export type RefreshToken = Brand<string, 'RefreshToken'>;
export type SessionID = Brand<string, 'SessionID'>;
export type ApiKey = Brand<string, 'ApiKey'>;
export type Password = Brand<string, 'Password'>;
export type HashedPassword = Brand<string, 'HashedPassword'>;

// Token Types
export interface TokenPayload {
  sub: UserID; // Subject (User ID)
  iat: number; // Issued At
  exp: number; // Expiration Time
  jti?: string; // JWT ID (unique identifier)
  aud?: string; // Audience
  iss?: string; // Issuer
  sessionId?: SessionID;
  permissions?: Permission[];
  roles?: Role[];
}

export interface JWTTokenPair {
  accessToken: JWTToken;
  refreshToken: RefreshToken;
  expiresIn: number; // seconds
  tokenType: 'Bearer';
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: TokenPayload;
  error?: {
    code: ErrorCode;
    message: ErrorMessage;
    reason: TokenInvalidReason;
  };
}

export type TokenInvalidReason =
  | 'TOKEN_EXPIRED'
  | 'TOKEN_MALFORMED'
  | 'TOKEN_SIGNATURE_INVALID'
  | 'TOKEN_NOT_YET_VALID'
  | 'TOKEN_AUDIENCE_INVALID'
  | 'TOKEN_ISSUER_INVALID'
  | 'TOKEN_REVOKED';
```

#### 2. User Authentication Types
```typescript
export interface LoginCredentials {
  email: string;
  password: Password;
  rememberMe?: boolean;
  captcha?: string;
}

export interface LoginResponse {
  success: true;
  user: AuthenticatedUser;
  tokens: JWTTokenPair;
  session: SessionInfo;
}

export interface LoginFailureResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: ErrorMessage;
    attempts: number;
    lockoutTime?: Timestamp;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: Password;
  confirmPassword: Password;
  acceptTerms: boolean;
  inviteCode?: string;
}

export interface RegisterResponse {
  success: true;
  user: AuthenticatedUser;
  tokens: JWTTokenPair;
  verificationRequired: boolean;
  verificationEmail?: string;
}

export interface PasswordChangeRequest {
  currentPassword: Password;
  newPassword: Password;
  confirmNewPassword: Password;
}

export interface PasswordResetRequest {
  email: string;
  captcha?: string;
}

export interface PasswordResetConfirmRequest {
  token: string;
  newPassword: Password;
  confirmNewPassword: Password;
}
```

#### 3. Session Management Types
```typescript
export interface SessionInfo {
  id: SessionID;
  userId: UserID;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  createdAt: Timestamp;
  lastAccessedAt: Timestamp;
  expiresAt: Timestamp;
  isActive: boolean;
  deviceType?: DeviceType;
  deviceFingerprint?: string;
}

export interface SessionLocation {
  country?: string;
  region?: string;
  city?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export type DeviceType = 
  | 'desktop'
  | 'mobile'
  | 'tablet'
  | 'api'
  | 'unknown';

export interface SessionCreateRequest {
  userId: UserID;
  ipAddress: string;
  userAgent: string;
  rememberMe?: boolean;
  deviceFingerprint?: string;
}

export interface SessionListResponse {
  sessions: SessionInfo[];
  currentSessionId: SessionID;
  total: number;
}

export interface SessionTerminateRequest {
  sessionId: SessionID;
  terminateAll?: boolean;
}
```

#### 4. Role-Based Access Control (RBAC) Types
```typescript
export type Role = 
  | 'admin'
  | 'moderator'
  | 'user'
  | 'guest'
  | 'api_user';

export type Permission = 
  | 'user:read'
  | 'user:write'
  | 'user:delete'
  | 'user:admin'
  | 'task:read'
  | 'task:write'
  | 'task:delete'
  | 'task:admin'
  | 'system:read'
  | 'system:write'
  | 'system:admin'
  | 'api:read'
  | 'api:write';

export interface RoleDefinition {
  role: Role;
  name: string;
  description: string;
  permissions: Permission[];
  isSystemRole: boolean;
  canBeAssigned: boolean;
}

export interface UserPermissions {
  userId: UserID;
  roles: Role[];
  permissions: Permission[];
  effectivePermissions: Permission[]; // Calculated from roles + direct permissions
  lastUpdated: Timestamp;
}

export interface PermissionCheck {
  permission: Permission;
  resource?: string;
  context?: Record<string, unknown>;
}

export interface PermissionCheckResult {
  granted: boolean;
  reason?: string;
  requiredRole?: Role;
  requiredPermission?: Permission;
}

// Role hierarchy and inheritance
export interface RoleHierarchy {
  role: Role;
  inheritsFrom: Role[];
  canDelegate: Role[];
}

export const ROLE_HIERARCHY: Record<Role, RoleHierarchy> = {
  admin: {
    role: 'admin',
    inheritsFrom: ['moderator', 'user'],
    canDelegate: ['moderator', 'user', 'guest']
  },
  moderator: {
    role: 'moderator',
    inheritsFrom: ['user'],
    canDelegate: ['user', 'guest']
  },
  user: {
    role: 'user',
    inheritsFrom: ['guest'],
    canDelegate: ['guest']
  },
  guest: {
    role: 'guest',
    inheritsFrom: [],
    canDelegate: []
  },
  api_user: {
    role: 'api_user',
    inheritsFrom: [],
    canDelegate: []
  }
};
```

#### 5. Authenticated User Types
```typescript
export interface AuthenticatedUser {
  id: UserID;
  email: string;
  name: string;
  roles: Role[];
  permissions: Permission[];
  isEmailVerified: boolean;
  isAccountLocked: boolean;
  lastLoginAt?: Timestamp;
  accountCreatedAt: Timestamp;
  profilePicture?: string;
  preferences?: UserPreferences;
  securitySettings?: SecuritySettings;
}

export interface UserPreferences {
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  taskReminders: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
}

export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showOnlineStatus: boolean;
  allowDataCollection: boolean;
  allowAnalytics: boolean;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  backupCodesCount: number;
  trustedDevices: TrustedDevice[];
  loginNotifications: boolean;
  sessionTimeout: number; // minutes
  requireReauthentication: boolean;
}

export interface TrustedDevice {
  id: string;
  name: string;
  deviceType: DeviceType;
  fingerprint: string;
  addedAt: Timestamp;
  lastUsedAt: Timestamp;
  ipAddress: string;
  location?: SessionLocation;
}
```

#### 6. API Authentication Types
```typescript
export interface ApiKeyInfo {
  id: string;
  key: ApiKey;
  name: string;
  userId: UserID;
  permissions: Permission[];
  rateLimit: {
    requestsPerMinute: number;
    requestsPerHour: number;
    requestsPerDay: number;
  };
  ipWhitelist?: string[];
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  lastUsedAt?: Timestamp;
  isActive: boolean;
}

export interface ApiKeyCreateRequest {
  name: string;
  permissions: Permission[];
  rateLimit?: {
    requestsPerMinute?: number;
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
  ipWhitelist?: string[];
  expiresIn?: number; // days
}

export interface ApiKeyResponse {
  id: string;
  key: ApiKey;
  name: string;
  permissions: Permission[];
  createdAt: Timestamp;
  expiresAt?: Timestamp;
  warning: string; // Warning to save the key securely
}
```

#### 7. Security & Audit Types
```typescript
export interface SecurityEvent {
  id: string;
  userId: UserID;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  description: string;
  ipAddress: string;
  userAgent: string;
  location?: SessionLocation;
  metadata?: Record<string, unknown>;
  timestamp: Timestamp;
  resolved: boolean;
  resolvedAt?: Timestamp;
  resolvedBy?: UserID;
}

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'LOGIN_SUSPICIOUS'
  | 'PASSWORD_CHANGE'
  | 'EMAIL_CHANGE'
  | 'ACCOUNT_LOCKED'
  | 'ACCOUNT_UNLOCKED'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'API_KEY_CREATED'
  | 'API_KEY_REVOKED'
  | 'PERMISSION_ESCALATION'
  | 'DATA_EXPORT'
  | 'ACCOUNT_DELETION';

export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface AuditLog {
  id: string;
  userId: UserID;
  action: string;
  resource: string;
  resourceId?: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress: string;
  userAgent: string;
  timestamp: Timestamp;
  success: boolean;
  errorCode?: ErrorCode;
}

export interface LoginAttempt {
  id: string;
  email: string;
  ipAddress: string;
  userAgent: string;
  success: boolean;
  failureReason?: string;
  timestamp: Timestamp;
  userId?: UserID;
  blocked: boolean;
  location?: SessionLocation;
}

export interface BruteForceProtection {
  ipAddress: string;
  email?: string;
  attemptCount: number;
  firstAttemptAt: Timestamp;
  lastAttemptAt: Timestamp;
  blockedUntil?: Timestamp;
  escalationLevel: number;
}
```

#### 8. Authentication Middleware Types
```typescript
export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
  session: SessionInfo;
  token: TokenPayload;
  permissions: Permission[];
  correlationId: string;
}

export interface AuthenticationContext {
  user?: AuthenticatedUser;
  session?: SessionInfo;
  token?: TokenPayload;
  ipAddress: string;
  userAgent: string;
  correlationId: string;
  requestPath: string;
  requestMethod: string;
}

export interface AuthenticationOptions {
  requireAuth: boolean;
  requiredPermissions?: Permission[];
  requiredRoles?: Role[];
  allowApiKey?: boolean;
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  sessionRequired?: boolean;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}
```

## 標準サブタスク（必須・詳細展開）
- [ ] 1. 仕様確認・設計理解
  - [ ] 認証・認可戦略・セキュリティ要件確認
  - [ ] JWT・Session管理・Token戦略理解
  - [ ] RBAC・Permission・Role階層設計理解
  - [ ] セキュリティ要件・OWASP対策・監査要件
  - [ ] API認証・レート制限・ブルートフォース対策
- [ ] 2. コーディング
  - [ ] Core Authentication Types実装
    - [ ] JWT・RefreshToken・Session型定義
    - [ ] Token Payload・Validation・Response型
    - [ ] セキュリティ考慮・ブランド型活用
  - [ ] User Authentication Types実装
    - [ ] Login・Register・Password管理型
    - [ ] リクエスト・レスポンス・エラー型
    - [ ] バリデーション・セキュリティ型
  - [ ] RBAC System Types実装
    - [ ] Role・Permission・RoleHierarchy定義
    - [ ] 権限チェック・継承・委譲型
    - [ ] 効果的権限計算・コンテキスト型
  - [ ] Security & Audit Types実装
    - [ ] SecurityEvent・AuditLog・LoginAttempt型
    - [ ] BruteForceProtection・RateLimit型
    - [ ] 監査証跡・セキュリティ監視型
- [ ] 3. テストコーディング
  - [ ] 正常系テスト
    - [ ] 全認証フロー・Token生成検証・RBAC動作
    - [ ] Permission継承・Role階層・権限計算
    - [ ] Session管理・API認証・レート制限
  - [ ] 異常系テスト
    - [ ] 不正Token・期限切れ・権限不足
    - [ ] ブルートフォース・アカウントロック
    - [ ] セッション無効化・Token取り消し
  - [ ] セキュリティテスト
    - [ ] Token署名検証・権限昇格防止
    - [ ] Session固定・CSRF・XSS対策
    - [ ] 情報漏洩・サイドチャネル攻撃
  - [ ] 統合テスト
    - [ ] 認証フロー・ミドルウェア統合
    - [ ] データベース・外部サービス連携
- [ ] 4. 単体テスト実行
  - [ ] 全型定義・ユーティリティ関数テスト
  - [ ] カバレッジ95%以上達成確認
  - [ ] セキュリティ・権限管理テスト
  - [ ] パフォーマンス・メモリ使用量確認
- [ ] 5. リポジトリコミット
  - [ ] feat(#009): 認証・認可型システム実装
  - [ ] セキュリティ強化・RBAC実装
  - [ ] ドキュメント・権限一覧・ガイド更新
- [ ] 6. ToDoチェック
  - [ ] 全サブタスク完了確認
  - [ ] セキュリティ基準・OWASP準拠確認
  - [ ] 他システムとの整合性確認
- [ ] 7. Issueクローズ
  - [ ] 完了条件100%達成確認
  - [ ] セキュリティ監査・ペネトレーションテスト
  - [ ] 運用チーム・セキュリティチーム連携

## テスト要件
- [ ] 正常系テスト：全認証フロー・Token管理・RBAC権限チェック確認
- [ ] 異常系テスト：不正アクセス・権限不足・Token無効・セッション期限切れ
- [ ] セキュリティテスト：認証バイパス・権限昇格・Token偽造・Session攻撃
- [ ] パフォーマンステスト：大量同時認証・Permission計算・レート制限
- [ ] 統合テスト：認証ミドルウェア・データベース・外部認証連携
- [ ] ペネトレーションテスト：実際の攻撃シナリオ・脆弱性検証

## 完了条件
- [ ] 全認証・認可型定義実装完了
- [ ] RBAC・Permission・Role管理型実装完了
- [ ] セキュリティ・監査・ログ型実装完了
- [ ] 単体テスト95%以上カバレッジ達成
- [ ] セキュリティテスト100%通過
- [ ] 脆弱性スキャン：Critical 0件・High 0件
- [ ] TypeScript厳密モード エラー0件
- [ ] OWASP Top 10対策完全実装

## 関連情報
- **設計書**: `docs/step3/detailed-design/auth-types.md`
- **依存タスク**: TSK-007 (コア型), TSK-008 (エラー型)
- **後続タスク**: TSK-015 (Userエンティティ), TSK-020 (認証ミドルウェア)
- **セキュリティ**: JWT RFC 7519, OWASP, RBAC, OAuth 2.0
- **標準**: ISO 27001, NIST Cybersecurity Framework

## 備考
- セキュリティファースト設計・Zero Trust原則
- 本番環境での高度なセキュリティ要件対応
- 継続的セキュリティ監視・インシデント対応
- コンプライアンス・監査証跡・法的要件対応
- 将来的な拡張（OAuth・SAML・Multi-factor認証）考慮 